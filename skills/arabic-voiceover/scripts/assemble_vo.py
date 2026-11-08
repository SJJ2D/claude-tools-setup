"""تجميع تعليق صوتي من لقطات الجمل: يختار أفضل لقطة لكل جملة بالتفريغ (CER)، يقصّ ذيل النموذج،
يضغط الفراغات الداخلية، ثم يضع بين الجمل الوقفة المحددة من الترقيم (prep_text.py --json) بالضبط.
~/tts/.venv/bin/python assemble_vo.py sents.json raw_dir out.wav [--tempo 1.06] [--lufs -17] [--ref "<النص المرجعي>"]
  sents.json : [{text, pause}] من prep_text.py
  raw_dir    : <i>_s<seed>.wav (لقطة أو أكثر لكل جملة i، بدءاً من 0)
يكتب out.wav (48kHz) + out.timing.json (بداية ونهاية كل جملة وكلماتها، للمزامنة مع الحركة) + تقرير CER.
"""
import json, re, glob, os, sys, subprocess, tempfile, numpy as np, librosa, soundfile as sf
from faster_whisper import WhisperModel

SR = 24000
a = sys.argv[1:]
if len(a) < 3:
    sys.exit(__doc__)
opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
S = json.load(open(a[0], encoding='utf-8')); RAW, OUT = a[1], a[2]
TEMPO, LUFS = opt('--tempo', 1.06), opt('--lufs', -17.0)
asr = WhisperModel('medium', device='cpu', compute_type='int8')
TMP = tempfile.mkdtemp()


def digits(s):  # Whisper يكتب الأرقام أرقاماً: حوّلها كلمات قبل المقارنة (وإلا تضخّم CER)
    try:
        from num2words import num2words
        return re.sub(r'\d+', lambda m: num2words(int(m.group(0)), lang='ar'), s)
    except ImportError:
        return s


def norm(s):
    s = re.sub(r'[ً-ْٰـ]', '', digits(s))
    s = re.sub(r'(ون|ان)(?=\s|$)', 'ين', s)  # عشرون/عشرين، ألفان/ألفين: صيغ نطق لا أخطاء
    s = re.sub('[إأآ]', 'ا', s).replace('ة', 'ه').replace('ى', 'ي')
    return re.sub(r'[^ء-ي]', '', s)


def cer(ref, hyp):
    a, b = norm(ref), norm(hyp); d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[len(b)] / max(1, len(a))


def words(w):
    f = os.path.join(TMP, 'a.wav'); sf.write(f, w, SR)
    segs, _ = asr.transcribe(f, language='ar', word_timestamps=True, beam_size=5, vad_filter=False)  # VAD يُسقط الجمل القصيرة
    return [(x.start, x.end, x.word.strip()) for s in segs for x in s.words]


def squeeze(w, maxgap=.24):
    iv = librosa.effects.split(w, top_db=36, frame_length=1024, hop_length=256)
    if len(iv) == 0:
        return w
    out = []
    for k, (s, e) in enumerate(iv):
        if k:
            out.append(np.zeros(int(min((s - iv[k - 1][1]) / SR, maxgap) * SR), np.float32))
        out.append(w[s:e])
    return np.concatenate(out)


parts, timing, rep, t = [], [], [], 0.0
for i, s in enumerate(S):
    best = None
    for f in sorted(glob.glob(f'{RAW}/{i}_s*.wav')):
        w, _ = librosa.load(f, sr=SR); w, _ = librosa.effects.trim(w, top_db=38)
        ws = words(w)
        if not ws:
            continue
        w = w[:int(min(len(w) / SR, ws[-1][1] + .12) * SR)]  # ذيل النموذج بعد آخر كلمة
        w = squeeze(w); ws = words(w)
        c = cer(s['text'], ' '.join(x[2] for x in ws))
        sc = -c - 0.02 * len(w) / SR
        if best is None or sc > best[0]:
            best = (sc, f, w, c, ws)
    if best is None:
        sys.exit(f'لا لقطة صالحة للجملة {i}: {s["text"]}')
    _, f, w, c, ws = best
    for k, hold in sorted(s.get('holds', []), reverse=True):  # وقفة داخل المقطع المدموج عند حدود الكلمة k
        if 0 < k < len(ws):
            cut = int((ws[k - 1][1] + ws[k][0]) / 2 * SR)
            w = np.concatenate([w[:cut], np.zeros(int(hold * SR), np.float32), w[cut:]])
            ws = ws[:k] + [(a + hold, b + hold, x) for a, b, x in ws[k:]]
    parts += [w, np.zeros(int(s['pause'] / TEMPO * SR), np.float32)]
    timing.append({'i': i, 'text': s['text'], 'start': round(t / TEMPO, 3), 'end': round((t + len(w) / SR) / TEMPO, 3),
                   'words': [[round((t + x[0]) / TEMPO, 3), round((t + x[1]) / TEMPO, 3), x[2]] for x in ws]})
    rep.append({'i': i, 'take': os.path.basename(f), 'cer': round(c, 3), 'flag': c > 0.08, 'heard': ' '.join(x[2] for x in ws)})
    print(f"{i} {os.path.basename(f)} CER {c:.3f}{'  ⚠ راجعها' if c > .08 else ''} | سُمع: {rep[-1]['heard']}", flush=True)
    t += len(w) / SR + s['pause']

raw = os.path.join(TMP, 'core.wav'); sf.write(raw, np.concatenate(parts[:-1]), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
                f'atempo={TEMPO},aresample=48000,highpass=f=55,deesser=i=0.3,'
                f'acompressor=threshold=-20dB:ratio=2:attack=10:release=140,loudnorm=I={LUFS}:TP=-3',
                '-ar', '48000', '-ac', '1', OUT], check=True)
base = os.path.splitext(OUT)[0]
json.dump(timing, open(base + '.timing.json', 'w'), ensure_ascii=False, indent=1)
json.dump(rep, open(base + '.report.json', 'w'), ensure_ascii=False, indent=1)
print('→', OUT, f'{sf.info(OUT).duration:.2f}s', '| متوسط CER', round(sum(r['cer'] for r in rep) / len(rep), 3))
