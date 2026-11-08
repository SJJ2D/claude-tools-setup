# recorded CC0 SFX (alvana-audio) + CC0 chiptune music, placed from the comp's events; music drops out on «بس هالمرة؟» and cuts at the tag
import json, subprocess, numpy as np, soundfile as sf
SR = 48000; LIB = '/root/tools/sfx/'
def load(rel):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', LIB + rel, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
E = json.load(open('events2.json')); dur = E['dur']; N = int(SR * (dur + 0.6)); fx = np.zeros((N, 2), np.float32)
def put(rel, t, gain=1.0, pan=0.0, rate=1.0):
    x = load(rel)
    if rate != 1.0: idx = np.arange(0, len(x) - 1, rate); x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1).astype(np.float32)
    x = x * gain; x[:, 0] *= min(1, 1 - pan); x[:, 1] *= min(1, 1 + pan); i = int(t * SR); j = min(N, i + len(x))
    if i < N: fx[i:j] += x[:j - i]
ev = {}; [ev.setdefault(k, []).append(t) for t, k in E['events']]
keys = ['sfx/keyboard/key-001', 'sfx/keyboard/key-007', 'sfx/keyboard/key-030', 'sfx/ui/key-mech']
for i, t in enumerate(ev.get('key', [])): put(keys[i % 4] + '.wav', t, 0.55, -0.2 + 0.07 * i)
put('sfx/glitch/long.wav', ev['glitch'][0], 0.5)
put('sfx/whoosh/double.wav', ev['pull'][0], 0.6)
put('sfx/pop/classic-hop.wav', ev['tear'][0], 0.5, rate=0.8)
put('sfx/notification/classic-error.wav', ev['q'][0], 0.45)
for t in ev['dissolve']: put('sfx/glitch/classic-glitch.wav', t - 0.18, 0.5); put('sfx/whoosh/fast-bright.wav', t - 0.25, 0.45)
for t in ev['stamp']: put('sfx/impact/classic-stamp.wav', t, 0.9)
put('sfx/paper/book-flip-3.wav', ev['flip'][0], 0.8)
for i, t in enumerate(ev.get('tick', [])): put('sfx/ui/click-004.wav', t, 0.35 + 0.25 * i / max(1, len(ev['tick'])), rate=1 + 0.5 * i / max(1, len(ev['tick'])))
put('sfx/glitch/long.wav', ev['inf'][0], 0.6); put('sfx/notification/classic-error.wav', ev['inf'][0] + 0.05, 0.4, rate=0.85)
put('sfx/pop/classic-hop.wav', ev['jump'][0], 0.7)
put('sfx/whoosh/fast-bright.wav', ev['whip'][0], 0.6, -0.4)
put('sfx/pop/pop-2.wav', ev['mascot'][0], 0.6)
for i, t in enumerate(ev['card']): put('sfx/pop/pop-1.wav', t, 0.55, rate=1 + 0.12 * i); put('sfx/notification/classic-match.wav', t + 0.05, 0.25, rate=1 + 0.1 * i)
put('sfx/riser/classic-riser.wav', ev['fly'][0], 0.6)
put('sfx/whoosh/soft-short.wav', ev['title'][0], 0.5); put('sfx/impact/bell-heavy-002.wav', ev['hit'][0], 0.5)
put('sfx/whoosh/fast-bright.wav', ev['tag'][0] - 0.05, 0.45)
put('sfx/jingle/8bit-05.wav', ev['sting'][0], 0.55)
pk = np.abs(fx).max(); fx *= 0.5 / pk if pk > 0.5 else 1
sf.write('sfx2.wav', fx, SR)
# music: pixel-party (HoliznaCC0, CC0) from the pull-back; silent beat on «بس هالمرة؟»; hard stop at the tag
m = load('music/chiptune/pixel-party.mp3'); t0 = ev['pull'][0]; mus = np.zeros((N, 2), np.float32); seg_ = m[:N - int(t0 * SR)]; mus[int(t0 * SR):int(t0 * SR) + len(seg_)] = seg_
tt = np.arange(N) / SR; env = np.clip((tt - t0) / 0.25, 0, 1)
d0, d1 = ev['drop'][0], ev['jump'][0]; env *= np.where((tt >= d0) & (tt < d1), 0.0, 1.0); env *= np.where(tt >= d1, 1.15, 1.0)
env *= np.where(tt >= ev['tag'][0] - 0.02, 0.0, 1.0)
mus *= env[:, None] * 0.55; sf.write('music2.wav', mus, SR); print('ok', round(dur, 2))
