import json, os, torch, random, numpy as np, soundfile as sf
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
REF='/home/user/claude-tools-setup/skills/arabic-voiceover/emotion_bank/bahraini/calm.wav'
S=json.load(open('/home/user/work/zelf/script.json',encoding='utf-8'))['lines']
torch.set_num_threads(3); m=ChatterboxMultilingualTTS.from_pretrained(device='cpu')
for seed in (1,2):
    for l in S:
        fn=f"raw/{l['id']}_s{seed}.wav"
        if os.path.exists(fn): continue
        t=l['text'].lstrip('…').strip()
        torch.manual_seed(seed);random.seed(seed);np.random.seed(seed)
        w=m.generate(t,language_id='ar',audio_prompt_path=REF,exaggeration=0.5,cfg_weight=0.5,temperature=0.75).squeeze().numpy().astype(np.float32)
        sf.write(fn,w,m.sr);print('ok',fn,round(len(w)/m.sr,2),flush=True)
print('GEN DONE',flush=True)
