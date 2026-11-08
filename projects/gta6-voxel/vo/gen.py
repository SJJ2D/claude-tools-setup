import sys, json, os, random, numpy as np, torch, soundfile as sf
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
BANK = '/home/user/claude-tools-setup/skills/arabic-voiceover/emotion_bank/bahraini/'
L = json.load(open('lines.json')); os.makedirs('raw', exist_ok=True)
torch.set_num_threads(4); m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
for seed in [1, 2]:
    for e in L:
        fn = f"raw/{e['id']}_s{seed}.wav"
        if os.path.exists(fn): continue
        torch.manual_seed(seed); random.seed(seed); np.random.seed(seed)
        w = m.generate(e['text'], language_id='ar', audio_prompt_path=BANK + e['emo'] + '.wav', exaggeration=e['ex'], cfg_weight=.5, temperature=.7).squeeze().numpy().astype(np.float32)
        sf.write(fn, w, m.sr); print('ok', fn, round(len(w) / m.sr, 2), flush=True)
print('GEN DONE', flush=True)
