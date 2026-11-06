# Voice QA: rank takes by ASR accuracy, naturalness, similarity to the user's voice, hoarseness and tonal balance.
# usage: python voice_qa.py --ref user_voice.wav --text "النص" take1.wav take2.wav ...
# needs: faster-whisper, librosa, praat-parselmouth, torch (+ SpeechMOS UTMOS checkpoint, see metrics.py) — optional parts skip if missing.
import argparse, re, sys, os, numpy as np, librosa
sys.path.insert(0, os.path.dirname(__file__))
ap = argparse.ArgumentParser(); ap.add_argument('--ref', required=True); ap.add_argument('--text', required=True); ap.add_argument('--model', default='medium'); ap.add_argument('takes', nargs='+'); a = ap.parse_args()

def norm(s):
    s = re.sub(r'[ً-ْـ]', '', s); s = re.sub('[إأآ]', 'ا', s).replace('ة', 'ه').replace('ى', 'ي')
    return re.sub(r'[^ء-ي]', '', s)
def cer(x, y):
    x, y = norm(x), norm(y); d = list(range(len(y) + 1))
    for i, cx in enumerate(x, 1):
        p, d[0] = d[0], i
        for j, cy in enumerate(y, 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (cx != cy))
    return d[len(y)] / max(1, len(x))

from faster_whisper import WhisperModel
asr = WhisperModel(a.model, device='cpu', compute_type='int8')
try: import metrics; HAVE_M = True
except Exception: HAVE_M = False
ref, _ = librosa.load(a.ref, sr=24000); R = metrics.ltas(ref, 24000) if HAVE_M else None
ref_hnr = metrics.hnr_f0(librosa.resample(ref[:240000], orig_sr=24000, target_sr=16000), 16000)[0] if HAVE_M else None
rows = []
for f in a.takes:
    segs, _ = asr.transcribe(f, language='ar', word_timestamps=True, beam_size=5)
    ws = [w for s in segs for w in s.words]; txt = ' '.join(w.word.strip() for w in ws)
    w, _ = librosa.load(f, sr=24000); dur = len(w) / 24000; tail = dur - (ws[-1].end if ws else 0)
    r = {'file': f, 'cer': round(cer(a.text, txt), 3), 'tail_s': round(tail, 2), 'asr': txt}
    if HAVE_M:
        w16 = librosa.resample(w, orig_sr=24000, target_sr=16000)
        try: r['utmos'] = round(metrics.utmos(w16), 2)
        except Exception: pass
        h, f0, _ = metrics.hnr_f0(w16, 16000); r['hnr'] = round(h, 1); r['hnr_vs_ref'] = round(h - ref_hnr, 1); r['f0'] = round(f0)
        r['ltas_dev_db'] = round(float(np.sqrt(((metrics.ltas(w, 24000) - R) ** 2).mean())), 2)
    rows.append(r)
rows.sort(key=lambda r: (r['cer'] > .08, r.get('hnr_vs_ref', 0) < -3, -r.get('utmos', 0)))
for r in rows: print(r)
print('\nreject if: cer>0.08 (check dialect words by hand), hnr_vs_ref<-3 (hoarse), tail_s>0.3 (trim mumbling)')
