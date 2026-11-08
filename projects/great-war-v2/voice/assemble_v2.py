# v2 assembly: pick takes, trim tails, shorten long pauses, character voices (Praat), QA, timeline, words, marks, lip envelopes.
import sys, json, re, os, glob, subprocess, numpy as np, librosa, soundfile as sf, parselmouth
from parselmouth.praat import call
sys.path.insert(0, '/home/user/film3/voice'); import metrics
from faster_whisper import WhisperModel
SR = 24000; OUT_SR = 48000
L = json.load(open('lines_v2.json'))
PRE = {'n0': .7, 'n1': .45, 'n2': .55, 'n3': 1.35, 'n4': 1.05, 'c_leader': .75, 'n5': 1.9, 'c_hasan': .55, 'n6': 1.05, 'c_jeff': .35, 'c_sul_cute': 1.0, 'n7': .35, 'c_sul_dark': .7,
       'n8': 1.2, 'c_alaish': .45, 'n9': 1.4, 'n10': .45, 'c_ali': .35, 'n11': .5, 'n12': 1.75, 'c_aboudi': .7, 'n13': .35, 'n14': .8, 'n15': .4, 'c_alaish_end': .4}
TEMPO = lambda who: 1.15 if who == 'narr' else 1.06
VOICE = {  # formant ratio, pitch median Hz, pitch range factor, duration factor
  'hasan': (1.08, 185, 1.4, .9), 'jeff': (.93, 112, .85, 1.0), 'sulaili': (1.1, 255, 1.4, 1.0), 'sulaili_dark': (.85, 92, .7, 1.08),
  'alaish': (1.06, 165, 1.4, .95), 'ali': (1.0, 125, .15, 1.0), 'aboudi': (.86, 98, .8, 1.08)}
MARKS = {'fish': ('n4', 'حتى'), 'followers': ('n6', 'متابعين'), 'zalf': ('n8', 'زلفه'), 'beta': ('n10', 'النسخة'), 'quake': ('n11', 'جهاز')}

def norm(s):
    s = re.sub(r'[ً-ْـ]', '', s); s = re.sub('[إأآ]', 'ا', s).replace('ة', 'ه').replace('ى', 'ي'); return re.sub(r'[^ء-ي]', '', s)
def cer(a, b):
    a, b = norm(a), norm(b); d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[len(b)] / max(1, len(a))
def compress_pauses(w, maxgap=.24):
    iv = librosa.effects.split(w, top_db=36, frame_length=1024, hop_length=256)
    if len(iv) == 0: return w, lambda t: t
    out, src, dst = [], [], []; cur = 0
    for k, (a, b) in enumerate(iv):
        if k: gap = (a - iv[k - 1][1]) / SR; keep = min(gap, maxgap); out.append(np.zeros(int(keep * SR), np.float32)); cur += int(keep * SR)
        src.append(a / SR); dst.append(cur / SR); out.append(w[a:b]); cur += b - a; src.append(b / SR); dst.append(cur / SR)
    pad = np.zeros(int(.05 * SR), np.float32)
    return np.concatenate([pad] + out + [pad]), (lambda t: float(np.interp(t, src, dst)) + .05)
def change(w, formant, pitch, rng, dur):
    s = parselmouth.Sound(w.astype(np.float64), sampling_frequency=SR); return call(s, "Change gender", 75, 600, formant, pitch, rng, dur).values[0].astype(np.float32)

asr = WhisperModel('medium', device='cpu', compute_type='int8')
def transcribe(w):
    sf.write('/tmp/_asr.wav', w, SR); segs, _ = asr.transcribe('/tmp/_asr.wav', language='ar', word_timestamps=True, beam_size=5)
    return [(x.start, x.end, x.word.strip()) for s in segs for x in s.words]

os.makedirs('final', exist_ok=True); picked = {}; report = []
for e in L:
    best = None
    for f in sorted(glob.glob(f"raw/{e['id']}_s*.wav")):
        w, _ = librosa.load(f, sr=SR); w, _ = librosa.effects.trim(w, top_db=38)
        ws = transcribe(w)
        if not ws: continue
        w = w[:int(min(len(w) / SR, ws[-1][1] + .15) * SR)]                       # drop the model's mumbling tail
        w, mp = compress_pauses(w); ws = [(mp(a), mp(b), t) for a, b, t in ws]
        c = cer(e['text'], ' '.join(x[2] for x in ws)); w16 = librosa.resample(w, orig_sr=SR, target_sr=16000)
        h, f0, _ = metrics.hnr_f0(w16, 16000); sc = -3 * c + .12 * min(h - 13, 2) - .05 * len(w) / SR
        if best is None or sc > best['sc']: best = dict(f=f, w=w, ws=ws, cer=round(c, 3), hnr=round(h, 1), sc=sc, asr=' '.join(x[2] for x in ws))
    who = e['who']; w = best['w']; dfac = 1.0
    if who in VOICE:
        fr, pt, rg, du = VOICE[who]; dfac = du; w = change(w, fr, pt, rg, du)
        if who == 'aboudi': sub = change(best['w'], .86, 49, .8, du); n = min(len(w), len(sub)); w = w[:n] + .2 * sub[:n]
        best['ws'] = [(a * du, b * du, t) for a, b, t in best['ws']]
    sf.write(f"final/{e['id']}_core.wav", w / (np.abs(w).max() + 1e-9) * .9, SR)
    fx = {'ali': "flanger=delay=1.5:depth=2:regen=60:speed=6,acrusher=bits=9:mix=0.3:mode=log,",
          'jeff': "aecho=0.85:0.5:180:0.18,", 'sulaili': "equalizer=f=3500:t=q:w=1:g=2,", 'sulaili_dark': "volume=4dB,", 'aboudi': "volume=4dB,"}.get(who, '')
    tp = TEMPO(who); best['ws'] = [(a / tp, b / tp, t) for a, b, t in best['ws']]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f"final/{e['id']}_core.wav", '-af',
        f"{fx}atempo={tp},aresample={OUT_SR},highpass=f=55,deesser=i=0.3,acompressor=threshold=-20dB:ratio=2:attack=12:release=140,loudnorm=I=-17:TP=-2,volume=" + ('3.5dB' if who in ('sulaili_dark', 'aboudi') else '0dB'), '-ar', str(OUT_SR), '-ac', '1', f"final/{e['id']}.wav"], check=True)
    if who != 'narr':  # intelligibility check after the character transform
        wf, _ = librosa.load(f"final/{e['id']}.wav", sr=SR); best['asr_after'] = ' '.join(x[2] for x in transcribe(wf)); best['cer_after'] = round(cer(e['text'], best['asr_after']), 3)
        h, f0, _ = metrics.hnr_f0(librosa.resample(wf, orig_sr=SR, target_sr=16000), 16000); best['f0_after'] = round(f0)
    picked[e['id']] = best
    report.append({k: v for k, v in best.items() if k not in ('w', 'ws', 'sc')} | {'id': e['id'], 'who': who})
    print(report[-1], flush=True)

# ---- timeline ----
lines, words, marks, lips, cur, lid = {}, [], {}, {}, 0.0, 0
track = np.zeros(int(200 * OUT_SR))
def disp(x): return x.replace('...', '').replace('،', '').replace('.', '').strip()
for e in L:
    w, _ = sf.read(f"final/{e['id']}.wav"); s = (PRE[e['id']] if e['id'] == 'n0' else cur + PRE[e['id']]); i = int(s * OUT_SR); track[i:i + len(w)] += w
    p = picked[e['id']]; ws = p['ws']; sw = [x for x in e['text'].split() if disp(x)]
    if len(ws) == len(sw): tm = [(a, b) for a, b, _ in ws]
    else:
        v0, v1 = ws[0][0], ws[-1][1]; Ls = np.array([len(disp(x)) + 1 for x in sw], float); cum = np.concatenate([[0], np.cumsum(Ls)]) / Ls.sum()
        tm = [(v0 + (v1 - v0) * cum[k], v0 + (v1 - v0) * cum[k + 1]) for k in range(len(sw))]
    lines[e['id']] = {'s': round(s + tm[0][0], 3), 'e': round(s + tm[-1][1], 3), 'who': e['who']}
    for k, (x, (a, b)) in enumerate(zip(sw, tm)):
        words.append({'w': disp(x), 's': round(s + a, 3), 'e': round(s + b, 3), 'line': lid, 'who': e['who']})
        for nm, (mid, mw) in MARKS.items():
            if mid == e['id'] and norm(mw) in norm(x) and nm not in marks: marks[nm] = round(s + a, 3)
        if x.endswith(('...', '؟', '،', '!')): lid += 1
    lid += 1
    if e['who'] != 'narr':
        x = w.reshape(-1)[: len(w) // (OUT_SR // 30) * (OUT_SR // 30)].reshape(-1, OUT_SR // 30); r = np.sqrt((x ** 2).mean(1)); r = np.clip(r / (np.percentile(r, 95) + 1e-9), 0, 1.2)
        lips[e['id']] = {'s': round(s, 3), 'env': [round(float(v), 2) for v in r]}
    cur = s + len(w) / OUT_SR
dur = round(cur + 3.0, 2)
track = track[:int(dur * OUT_SR)]
sf.write('voice_v2_dry.wav', track, OUT_SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'voice_v2_dry.wav', '-af', 'pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', str(OUT_SR), 'voice_v2.wav'], check=True)
json.dump({'lines': lines, 'words': words, 'marks': marks, 'lips': lips, 'dur': dur}, open('timing_v2.json', 'w'), ensure_ascii=False)
json.dump(report, open('report_v2.json', 'w'), ensure_ascii=False, indent=1)
print('DUR', dur, 'marks', marks); print('DONE')
