# Compare: (A) generate with user's voice then transform (Praat Change gender)  vs  (B) transform the reference, then let Chatterbox clone it
import sys, random, numpy as np, torch, librosa, soundfile as sf, parselmouth
from parselmouth.praat import call
sys.path.insert(0, '/home/user/film3/voice'); import metrics
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
BANK = '/home/user/claude-tools-setup/skills-own/arabic-voiceover/emotion_bank/bahraini/'
def change(w, sr, formant, pitch, rng=1.0, dur=1.0):
    s = parselmouth.Sound(w.astype(np.float64), sampling_frequency=sr)
    o = call(s, "Change gender", 75, 600, formant, pitch, rng, dur); return o.values[0].astype(np.float32)
torch.set_num_threads(4); m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
TESTS = {'sulaili': ("اني كيوته!", 'happy', .6, 1.22, 330, 1.5), 'aboudi': ("منو قال سهالات؟", 'angry', .6, .80, 82, .7)}
for name, (txt, emo, ex, fr, p, rg) in TESTS.items():
    torch.manual_seed(3); random.seed(3); np.random.seed(3)
    base = m.generate(txt, language_id='ar', audio_prompt_path=BANK + emo + '.wav', exaggeration=ex, cfg_weight=.5, temperature=.75).squeeze().numpy()
    a = change(base, m.sr, fr, p, rg); sf.write(f'{name}_A.wav', a, m.sr)
    ref, _ = librosa.load(BANK + emo + '.wav', sr=24000); rt = change(ref, 24000, fr, p, rg); sf.write(f'ref_{name}.wav', rt, 24000)
    torch.manual_seed(3); random.seed(3); np.random.seed(3)
    b = m.generate(txt, language_id='ar', audio_prompt_path=f'ref_{name}.wav', exaggeration=ex, cfg_weight=.5, temperature=.75).squeeze().numpy(); sf.write(f'{name}_B.wav', b, m.sr)
    for tag, x in (('A', a), ('B', b)):
        x16 = librosa.resample(x, orig_sr=m.sr, target_sr=16000); h, f0, fs = metrics.hnr_f0(x16, 16000)
        print(name, tag, f'f0={f0:.0f} hnr={h:.1f} dur={len(x)/m.sr:.2f}', flush=True)
print('DONE')
