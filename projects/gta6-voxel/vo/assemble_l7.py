# pick best take per line (CER after trimming the tail), compress pauses, tempo, loudness; write final/<id>.wav + timing.json
import json, re, glob, os, subprocess, numpy as np, librosa, soundfile as sf
from faster_whisper import WhisperModel
SR = 24000; L = json.load(open('lines_l7.json')); os.makedirs('final', exist_ok=True)
asr = WhisperModel('medium', device='cpu', compute_type='int8')
def norm(s):
    s = re.sub(r'[ً-ْـ]', '', s); s = re.sub('[إأآ]', 'ا', s).replace('ة', 'ه').replace('ى', 'ي'); return re.sub(r'[^ء-ي]', '', s)
def cer(a, b):
    a, b = norm(a), norm(b); d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[len(b)] / max(1, len(a))
def words(w):
    sf.write('/tmp/_a.wav', w, SR); segs, _ = asr.transcribe('/tmp/_a.wav', language='ar', word_timestamps=True, beam_size=5, vad_filter=False)
    return [(x.start, x.end, x.word.strip()) for s in segs for x in s.words]
def squeeze(w, maxgap=.22):
    iv = librosa.effects.split(w, top_db=36, frame_length=1024, hop_length=256)
    if len(iv) == 0: return w
    out = []
    for k, (a, b) in enumerate(iv):
        if k: out.append(np.zeros(int(min((a - iv[k - 1][1]) / SR, maxgap) * SR), np.float32))
        out.append(w[a:b])
    return np.concatenate(out)
rep = {}
for e in L:
    best = None
    for f in sorted(glob.glob(f"raw/{e['id']}_s*.wav")):
        w, _ = librosa.load(f, sr=SR); w, _ = librosa.effects.trim(w, top_db=38); ws = words(w)
        if not ws: continue
        w = w[:int(min(len(w) / SR, ws[-1][1] + .12) * SR)]; w = squeeze(w)
        c = cer(e['text'], ' '.join(x[2] for x in words(w))); sc = -c - 0.03 * len(w) / SR
        if best is None or sc > best[0]: best = (sc, f, w, c)
    _, f, w, c = best; sf.write(f"final/{e['id']}_core.wav", w, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f"final/{e['id']}_core.wav", '-af', 'atempo=1.06,aresample=48000,highpass=f=70,deesser=i=0.3,acompressor=threshold=-20dB:ratio=2.2:attack=10:release=140,loudnorm=I=-17:TP=-3', '-ar', '48000', '-ac', '1', f"final/{e['id']}.wav"], check=True)
    d = sf.info(f"final/{e['id']}.wav").duration; rep[e['id']] = {'take': os.path.basename(f), 'cer': round(c, 3), 'dur': round(d, 2)}; print(e['id'], rep[e['id']], flush=True)
json.dump(rep, open('report_l7.json', 'w'), ensure_ascii=False, indent=1); print('DONE')
