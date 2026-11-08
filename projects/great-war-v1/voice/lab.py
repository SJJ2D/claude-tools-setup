# Grid: reference window x settings -> generate -> score (UTMOS, speaker sim to whole-voice, HNR, F0, ASR match)
import sys, json, random, numpy as np, torch, librosa, soundfile as sf
sys.path.insert(0, '/home/user/film3/voice'); import metrics
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
torch.set_num_threads(4)
SRC = '/home/user/btc/video/audio/voice_final.wav'
full, _ = librosa.load(SRC, sr=24000)
REFS = {'r70': 70, 'r100': 100, 'r130': 130}
for k, a in REFS.items(): sf.write(f'{k}.wav', full[a*24000:(a+10)*24000], 24000)
SETS = {'A': (0.5, 0.5, 0.8), 'B': (0.4, 0.5, 0.7), 'C': (0.6, 0.35, 0.8), 'D': (0.35, 0.3, 0.7)}
TEXT = "في ولاية ليونيدا... تبدأ الحربُ العظمى. حسن محمد البيب، يوصل قبل الكل."
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
w16full = librosa.resample(full, orig_sr=24000, target_sr=16000)
chunks = [w16full[i:i + 160000] for i in range(0, len(w16full) - 160000, 160000)]
spk = m.ve.embeds_from_wavs(chunks, sample_rate=16000).mean(0); spk /= np.linalg.norm(spk)
np.save('spk_global.npy', spk)
res = []
for rk in REFS:
    for sk, (ex, cfg, tmp) in SETS.items():
        torch.manual_seed(7); random.seed(7); np.random.seed(7)
        wav = m.generate(TEXT, language_id="ar", audio_prompt_path=f'{rk}.wav', exaggeration=ex, cfg_weight=cfg, temperature=tmp)
        w = wav.squeeze().numpy(); fn = f'lab_{rk}_{sk}.wav'; sf.write(fn, w, m.sr)
        w16 = librosa.resample(w, orig_sr=m.sr, target_sr=16000)
        e = m.ve.embeds_from_wavs([w16], sample_rate=16000)[0]; sim = float(e @ spk / np.linalg.norm(e))
        h, f0, fsd = metrics.hnr_f0(w16, 16000)
        r = dict(f=fn, ref=rk, set=sk, ex=ex, cfg=cfg, temp=tmp, dur=round(len(w) / m.sr, 2), utmos=round(metrics.utmos(w16), 3), sim=round(sim, 4), hnr=round(h, 2), f0=round(f0), f0sd=round(fsd, 2))
        print(r, flush=True); res.append(r)
json.dump(res, open('lab.json', 'w'), indent=1)
print('DONE', flush=True)
