import sys, json, numpy as np, soundfile as sf
sys.path.insert(0, '/root/.claude/skills/onetake/scripts'); from sfx_palette import *
E = json.load(open('events.json')); dur = E['dur']; s = Score(dur=dur + 0.5, T60=1.0)
def crunch(d=0.45):
    n = int(SR * d); t = np.arange(n) / SR; x = np.sign(np.sin(2 * np.pi * (900 - 700 * t / d) * t)) * np.exp(-t * 5)
    return lp(x * (np.random.default_rng(3).random(n) > 0.35), 4000) * 0.6
for t, k in E['events']:
    if k == 'q': s.place(glass(988, 0.6, 1.0), t, gain=0.18, send=0.3); s.place(bubble(620, 0.2), t, gain=0.2)
    elif k == 'dissolve': s.place(crunch(), t - 0.22, gain=0.35, send=0.15); s.place(air(0.5, 300, 3500, 1.4, 0.5), t - 0.25, gain=0.25)
    elif k == 'stamp': s.place(sub(70, 0.5), t, gain=0.5, send=0.2); s.place(wood(140, 0.16), t, gain=0.6)
    elif k == 'jump': s.place(wobble(180, 0.6), t, gain=0.35, send=0.2)
    elif k == 'whip': s.place(air(0.5, 250, 3000, 1.3, 0.45), t - 0.1, gain=0.4, pan=-0.4, pan_to=0.5, send=0.3)
    elif k == 'tick': s.place(glass(1320, 0.7, 0.8), t, gain=0.16, send=0.4); s.place(wood(300, 0.08), t, gain=0.2)
    elif k == 'fly': s.place(air(1.8, 200, 2600, 1.2, 0.7), t, gain=0.4, send=0.5)
    elif k == 'title': s.place(sub(55, 1.2), t, gain=0.5, send=0.3)
    elif k == 'hit': s.place(sub(48, 1.4), t, gain=0.55, send=0.4); s.place(glass(523, 2.0, 0.5), t, gain=0.15, send=0.7)
    elif k == 'word': s.place(wood(420, 0.05), t, gain=0.07, send=0.1)
s.write('sfx.wav')
# synthwave bed: 100 BPM, Dm–Bb–F–C, saw-ish pad + pulsing bass + soft kick; swells for the city
bpm = 100; beat = 60 / bpm; n = int(SR * (dur + 0.5)); tt = np.arange(n) / SR; mus = np.zeros(n)
chords = [[146.8, 174.6, 220.0], [116.5, 146.8, 174.6], [174.6, 220.0, 261.6], [130.8, 164.8, 196.0]]
fly = [e[0] for e in E['events'] if e[1] == 'fly'][0]
def saw(f, t): return 2 * ((f * t) % 1) - 1
for b in range(int((dur + 0.5) / beat) + 1):
    t0 = b * beat; i0 = int(t0 * SR); i1 = min(n, int((t0 + beat) * SR)); seg_t = tt[i0:i1] - t0; ch = chords[(b // 8) % 4]
    pad = sum(saw(f, tt[i0:i1]) + saw(f * 1.005, tt[i0:i1]) for f in ch) / 6
    bass = np.sin(2 * np.pi * ch[0] / 2 * seg_t) * np.exp(-seg_t * 6) * (1 if b % 2 == 0 else 0.6)
    kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-seg_t * 30)) * seg_t) * np.exp(-seg_t * 12) if b % 2 == 0 else 0
    mus[i0:i1] += 0.25 * pad + 0.5 * bass + 0.5 * kick
mus = lp(mus, 2600); env = np.clip(tt / 1.5, 0, 1) * (0.55 + 0.45 * np.clip((tt - fly) / 1.2, 0, 1)) * np.clip((dur + 0.2 - tt) / 1.5, 0, 1)
mus = mus * env; mus /= np.abs(mus).max() + 1e-9
sf.write('music.wav', np.stack([mus, mus * 0.97], 1).astype(np.float32) * 0.35, SR); print('ok')
