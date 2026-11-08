import sys, json, numpy as np
sys.path.insert(0, '/root/.claude/skills/onetake/scripts'); from sfx_palette import *
E = json.load(open('events.json')); dur = E['dur']; s = Score(dur=dur + 0.5, T60=1.3)
keys = [e for e in E['events'] if e[1] == 'key']
for j, (t, k, _) in enumerate(E['events']):
    if k == 'key': s.place(wood(260 + 40 * ((j * 7) % 5), 0.09), t, gain=0.16, pan=-0.15 + 0.02 * (j % 5), send=0.15)
    elif k == 'enter': s.place(wood(150, 0.16), t, gain=0.5, send=0.3); s.place(sub(58, 0.6), t, gain=0.35, send=0.2)
    elif k == 'tick': s.place(glass(1320 + 110 * (j % 4), 0.5, 0.6), t, gain=0.09, pan=-0.3, send=0.4)
    elif k == 'lift': s.place(air(0.6, 260, 2400, 1.3, 0.55), t, gain=0.32, pan=-0.3, send=0.4, pan_to=0.3)
    elif k == 'land': s.place(glass(659, 0.9, 0.7), t, gain=0.18, send=0.45); s.place(wood(170, 0.12), t, gain=0.3, send=0.2)
    elif k == 'soft': s.place(bubble(480, 0.22), t, gain=0.25, send=0.3)
    elif k == 'burst':
        for i in range(16): s.place(bubble(520 + 37 * (i % 6), 0.16), t + 0.06 * i + 0.01 * (i % 3), gain=0.09 + 0.004 * i, pan=-0.4 + 0.05 * i, send=0.3)
        s.place(air(1.3, 200, 3000, 1.2, 0.4), t, gain=0.25, pan=-0.4, pan_to=0.4, send=0.5)
    elif k == 'open': s.place(air(0.45, 400, 2000, 1.6, 0.3), t, gain=0.22, send=0.4); s.place(glass(880, 1.2, 0.4), t + 0.25, gain=0.1, send=0.6)
    elif k == 'close': s.place(air(0.35, 1800, 400, 1.6, 0.6), t, gain=0.18, send=0.4)
    elif k == 'dim': s.place(sub(46, 0.9), t, gain=0.3, send=0.35)
    elif k == 'relight':
        for i, f in enumerate([587, 740, 880, 1175]): s.place(glass(f, 1.4, 0.5), t + 0.07 * i, gain=0.08, pan=-0.3 + 0.2 * i, send=0.6)
    elif k == 'gather': s.place(air(0.8, 2600, 300, 1.2, 0.8), t, gain=0.3, send=0.45)
    elif k == 'hop': s.place(air(0.4, 300, 1800, 1.4, 0.5), t, gain=0.2, pan=-0.1, pan_to=0.3, send=0.3)
    elif k == 'final': s.place(sub(52, 1.2), t, gain=0.55, send=0.4); s.place(glass(440, 2.2, 0.5), t, gain=0.16, send=0.7); s.place(wood(130, 0.18), t, gain=0.35, send=0.3)
s.write('sfx.wav')
# a quiet pad underneath: Dmaj9-ish, swells into the landing
n = int(SR * (dur + 0.5)); tt = np.arange(n) / SR; pad = np.zeros(n)
land = [e[0] for e in E['events'] if e[1] == 'final'][0]
for f, a in [(73.4, .5), (110, .45), (146.8, .35), (185, .25), (220, .22), (329.6, .12)]:
    pad += a * np.sin(2 * np.pi * f * tt + 0.3 * np.sin(2 * np.pi * 0.11 * tt + f)) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * tt + f / 50))
pad = lp(pad, 1400)
env = np.clip((tt - 0.4) / 2.5, 0, 1) * (0.7 + 0.5 * np.clip((tt - (land - 1.0)) / 1.0, 0, 1)) * np.clip((dur + 0.3 - tt) / 1.8, 0, 1)
pad = pad * env; pad /= np.abs(pad).max() + 1e-9
import soundfile as sf; sf.write('pad.wav', np.stack([pad, pad * 0.97], 1).astype(np.float32) * 0.3, SR); print('ok')
