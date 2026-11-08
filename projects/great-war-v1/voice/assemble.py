# Pick best take per line (ASR accuracy first, then naturalness & similarity), process naturally,
# place on the trailer timeline, align caption words, write narration.wav + timing.json.
import sys, json, re, subprocess, numpy as np, librosa, soundfile as sf
sys.path.insert(0, '/home/user/film3/voice'); import metrics
from faster_whisper import WhisperModel

LINES = json.load(open('script.json'))
TAKES = json.load(open('takes.json'))
TARGET = [.8, 5.3, 7.0, 13.2, 15.2, 20.2, 24.6, 28.7, 31.8, 36.6, 39.6, 43.2, 47.6, 52.6, 54.8]   # desired starts (s)
MARKS = {'fish': (4, 6), 'mole': (6, 4), 'trick': (7, 2), 'zalf': (8, 3), 'beta': (10, 2)}
SR = 48000

def norm(s):
    s = re.sub(r'[ً-ْـ]', '', s)            # tashkeel, tatweel
    s = re.sub('[إأآ]', 'ا', s).replace('ة', 'ه').replace('ى', 'ي')
    s = re.sub(r'[^ء-ي ]', ' ', s); return ' '.join(s.split())
def cer(a, b):
    a, b = norm(a).replace(' ', ''), norm(b).replace(' ', '')
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[len(b)] / max(1, len(a))

import os
asr = WhisperModel('medium', device='cpu', compute_type='int8')
old = {x['f']: x for x in json.load(open('takes_scored.json'))} if os.path.exists('takes_scored.json') else {}
for t in TAKES:
    if t['f'] in old and 'words' in old[t['f']]:
        t.update({k: old[t['f']][k] for k in ('asr', 'words', 'cer')}); continue
    segs, _ = asr.transcribe(t['f'], language='ar', word_timestamps=True, beam_size=5, vad_filter=False)
    ws = [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]
    t['asr'] = ' '.join(w[2] for w in ws); t['words'] = ws; t['cer'] = round(cer(LINES[t['line']], t['asr']), 3)
json.dump(TAKES, open('takes_scored.json', 'w'), ensure_ascii=False, indent=1)

# choose ONE voice config for consistency (best mean score), then best take per line within it
def score(t): return -3.0 * t['cer'] + .6 * t['utmos'] + 8 * (t['sim'] - .9) + .12 * min(t['hnr'] - 13, 2)   # low HNR = hoarse/'sick'
cfgs = sorted({t['ref'] for t in TAKES})
common = [li for li in range(len(LINES)) if all(any(t['ref'] == c and t['line'] == li for t in TAKES) for c in cfgs)]
cfg_score = {c: np.mean([max(score(t) for t in TAKES if t['ref'] == c and t['line'] == li) for li in common]) for c in cfgs}
best_cfg = max(cfg_score, key=cfg_score.get)
pick = [max((t for t in TAKES if t['ref'] == best_cfg and t['line'] == li), key=score) for li in range(len(LINES))]
print('config scores', cfg_score, '-> using', best_cfg)
for p in pick: print(p['line'], p['f'], 'cer', p['cer'], 'utmos', p['utmos'], 'sim', p['sim'], '|', p['asr'])

# natural processing: partial match-EQ toward the original voice, gentle comp, de-ess, tiny real room
ref, _ = librosa.load('/home/user/btc/video/audio/voice_final.wav', sr=24000)
R = metrics.ltas(ref, 24000); bands = [100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000]
allv = np.concatenate([librosa.load(p['f'], sr=24000)[0] for p in pick])
D = np.clip(-(metrics.ltas(allv, 24000) - R) * .9, -5, 3)
centers = [np.sqrt(a * b) for a, b in zip(bands[:-1], bands[1:])]
geq = ';'.join(f'entry({c:.0f},{g:.2f})' for c, g in zip(centers, D))
print('match-EQ dB', dict(zip([int(c) for c in centers], np.round(D, 1))))
rng = np.random.default_rng(3); n = int(.42 * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 13); ir[0] = 0
from scipy.signal import lfilter; ir = lfilter([.18], [1, -.82], ir)   # warm (darker) room
sf.write('room_ir.wav', np.stack([ir, np.roll(ir, 37)], 1) / np.abs(ir).max() * .5, SR)

clips = []
os.makedirs('trim', exist_ok=True)
for p in pick:
    w, sr0 = sf.read(p['f']); last = p['words'][-1][1]
    iv = librosa.effects.split(w, top_db=32, frame_length=1024, hop_length=256)
    ch = [c for c in iv if c[0] / sr0 <= last + .12]
    cut = min(ch[-1][1] / sr0 if ch else last, last + .35) + .08
    p['cut'] = round(cut, 3); p['tail_removed'] = round(len(w) / sr0 - cut, 3)
    n = min(int(cut * sr0), len(w)); p['cut'] = round(n / sr0, 3); p['tail_removed'] = round((len(w) - n) / sr0, 3)
    tf = p['f'].replace('takes/', 'trim/'); sf.write(tf, w[:n] * np.minimum(1, (n - np.arange(n)) / (.03 * sr0)), sr0)
    out = p['f'].replace('takes/', 'proc/')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tf, '-af',
        f"aresample={SR},highpass=f=55,firequalizer=gain_entry='{geq}',deesser=i=0.35,acompressor=threshold=-20dB:ratio=2:attack=12:release=140:makeup=1.5", '-ac', '1', out], check=True)
    w, _ = sf.read(out); clips.append(w)
# place on timeline
starts, cur = [], 0.0
for li, w in enumerate(clips):
    s = max(TARGET[li], cur + .3); starts.append(s); cur = s + len(w) / SR
over = cur - 59.1
if over > 0:  # pull everything after line 2 earlier, proportionally to the slack
    starts = [s - over * (i / (len(starts) - 1)) for i, s in enumerate(starts)]
dry = np.zeros(int(60 * SR))
for s, w in zip(starts, clips): i = int(s * SR); dry[i:i + len(w)] += w
sf.write('narration_dry.wav', dry, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'narration_dry.wav', '-i', 'room_ir.wav', '-filter_complex',
    '[0:a]pan=stereo|c0=c0|c1=c0,asplit[a][b];[b][1:a]afir=dry=10:wet=10,volume=0.09[r];[a][r]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[o]',
    '-map', '[o]', '-ar', str(SR), 'narration.wav'], check=True)

# caption words: script words, timed from ASR when counts match, else spread by speech chunks / char length
def disp(w): return w.replace('...', '').replace('،', '').replace('.', '').strip()
words, line_id, VO, marks = [], 0, [], {}
for li, (p, s) in enumerate(zip(pick, starts)):
    w, _ = librosa.load(p['f'].replace('takes/', 'trim/'), sr=16000); dur = len(w) / 16000
    sw = [x for x in LINES[li].split() if disp(x)]
    aw = p['words']
    if len(aw) == len(sw): tm = [(a, b) for a, b, _ in aw]
    else:
        iv = librosa.effects.split(w, top_db=32, frame_length=1024, hop_length=160); v0, v1 = iv[0][0] / 16000, iv[-1][1] / 16000
        L = np.array([len(disp(x)) + 1 for x in sw], float); cum = np.concatenate([[0], np.cumsum(L)]) / L.sum()
        tm = [(v0 + (v1 - v0) * cum[k], v0 + (v1 - v0) * cum[k + 1]) for k in range(len(sw))]
    VO.append([round(s + tm[0][0], 3), round(s + tm[-1][1], 3)])
    for k, (x, (a, b)) in enumerate(zip(sw, tm)):
        words.append({'w': disp(x), 's': round(s + a, 3), 'e': round(s + b, 3), 'line': line_id})
        for nm, (ml, mk) in MARKS.items():
            if ml == li and mk == k: marks[nm] = round(s + a, 3)
        if x.endswith('...') or x.endswith('؟') or x.endswith('،'): line_id += 1
    line_id += 1
json.dump({'VO': VO, 'WORDS': words, 'MARK': marks, 'starts': starts, 'cfg': best_cfg, 'pick': [p['f'] for p in pick]}, open('timing.json', 'w'), ensure_ascii=False, indent=1)
print('tails removed (s):', [p['tail_removed'] for p in pick]); print('VO', VO); print('MARK', marks); print('DONE')
