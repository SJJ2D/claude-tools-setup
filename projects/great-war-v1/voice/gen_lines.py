import sys, json, random, re, numpy as np, torch, librosa, soundfile as sf
sys.path.insert(0, '/home/user/film3/voice'); import metrics
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
torch.set_num_threads(4)
LINES = json.load(open('script.json'))
CFGS = [('r70', .5, .5, .8), ('r100', .4, .5, .7)]
if len(sys.argv) > 3: CFGS = [c for c in CFGS if c[0] in sys.argv[3].split(',')]
SEEDS = [int(x) for x in (sys.argv[1] if len(sys.argv) > 1 else '1').split(',')]
ONLY = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else None
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
spk = np.load('spk_global.npy')
import os
out = json.load(open('takes.json')) if os.path.exists('takes.json') else []
have = {r['f'] for r in out}
for li, text in enumerate(LINES):
    if ONLY is not None and li not in ONLY: continue
    for ref, ex, cfg, tmp in CFGS:
        m.prepare_conditionals(f'{ref}.wav', exaggeration=ex)
        for sd in SEEDS:
            fn = f'takes/L{li:02d}_{ref}_s{sd}.wav'
            if fn in have: continue
            torch.manual_seed(sd); random.seed(sd); np.random.seed(sd)
            wav = m.generate(text, language_id="ar", exaggeration=ex, cfg_weight=cfg, temperature=tmp).squeeze().numpy()
            wt, _ = librosa.effects.trim(wav, top_db=38); pad = np.zeros(int(.06 * m.sr), np.float32); wt = np.concatenate([pad, wt, pad]).astype(np.float32)
            sf.write(fn, wt, m.sr)
            w16 = librosa.resample(wt, orig_sr=m.sr, target_sr=16000)
            e = m.ve.embeds_from_wavs([w16], sample_rate=16000)[0]
            h, f0, fsd = metrics.hnr_f0(w16, 16000)
            r = dict(line=li, f=fn, ref=ref, seed=sd, dur=round(len(wt) / m.sr, 2), utmos=round(metrics.utmos(w16), 3), sim=round(float(e @ spk / np.linalg.norm(e)), 4), hnr=round(h, 2), f0=round(f0))
            print(r, flush=True); out.append(r)
    json.dump(out, open('takes.json', 'w'), ensure_ascii=False, indent=1)
print('GEN DONE', flush=True)
