# Original soundtrack + SFX, fully synthesised (no samples). python score.py events.json music.wav sfx.wav
import json, sys, wave, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000; DUR = 60.0; N = int(SR * DUR)
EV = json.load(open(sys.argv[1])); SH = EV['shots']; VO = EV['VO']; E = EV['events']
rng = np.random.default_rng(11)
t_ = lambda n: np.arange(n) / SR
def filt(x, kind, f): return sosfilt(butter(2, np.array(f) / (SR / 2), kind, output='sos'), x)
def env(n, a=.005, d=.3, curve=1.):
    e = np.exp(-t_(n) / max(d, 1e-4) * curve); A = max(1, int(a * SR)); e[:A] *= np.linspace(0, 1, A); return e
def noise(d): return rng.uniform(-1, 1, int(d * SR))
def osc(f, n, kind='sin'):
    f = np.broadcast_to(np.asarray(f, float), (n,)); ph = np.cumsum(f) / SR
    if kind == 'sin': return np.sin(2 * np.pi * ph)
    if kind == 'saw': return 2 * (ph % 1) - 1
    if kind == 'sq': return np.sign(np.sin(2 * np.pi * ph))
    if kind == 'tri': return 2 * np.abs(2 * (ph % 1) - 1) - 1
def pan2(x, p): l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4); return np.stack([x * l, x * r], 1)
def put(buf, sig, t, g=1., p=0.):
    if sig.ndim == 1: sig = pan2(sig, p)
    i = int(round(t * SR)); j0 = max(0, -i); i = max(0, i); j = min(len(buf), i + len(sig) - j0)
    if j > i: buf[i:j] += sig[j0:j0 + j - i] * g
def wr(path, x):
    x = x / (np.abs(x).max() + 1e-9) * .89
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def reverb(x, rt=1.4, wet=.18, seed=1):
    r = np.random.default_rng(seed); n = int(rt * SR); ir = r.standard_normal((n, 2)) * np.exp(-t_(n) * 6.9 / rt)[:, None]; ir = filt(ir.T, 'low', 6000).T
    return x + np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1) * wet / np.abs(ir).sum(0).mean() * 40

# ---------------- instruments ----------------
def kick(d=.55, f1=48): n = int(d * SR); tt = t_(n); return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f1 + 140 * np.exp(-tt * 28)) / SR) * np.exp(-tt * 5.5)) + filt(noise(d), 'high', 3000) * np.exp(-tt * 90) * .3
def s808(f, d=.9): n = int(d * SR); tt = t_(n); return np.tanh(1.6 * osc(f * (1 + .35 * np.exp(-tt * 30)), n)) * env(n, .003, d * .55)
def clapf():
    b = filt(noise(.45), 'band', [900, 3000]); n = len(b); e = np.zeros(n)
    for o in (0, .011, .022): i = int(o * SR); e[i:] += np.exp(-t_(n - i) * 60)
    e += np.exp(-t_(n) * 9) * .35; return b * e
def snare(): n = int(.3 * SR); return filt(noise(.3), 'high', 1500) * np.exp(-t_(n) * 18) + osc(185, n) * np.exp(-t_(n) * 30) * .6
def hat(open_=False): d = .35 if open_ else .05; n = int(d * SR); return filt(noise(d), 'high', 7500) * np.exp(-t_(n) * (8 if open_ else 70))
def crash(d=2.4): n = int(d * SR); return filt(noise(d), 'high', 4000) * np.exp(-t_(n) * 1.6) * (1 - np.exp(-t_(n) * 400))
def pad(freqs, d, cut=1400, a=.6):
    n = int(d * SR); x = sum(osc(f * (1 + dt), n, 'saw') for f in freqs for dt in (-.004, 0, .005)); x = filt(x, 'low', cut)
    e = np.minimum(1, t_(n) / a) * np.minimum(1, (d - t_(n)) / .4); return x * e / len(freqs) / 3
def braam(root, d=3.2):
    n = int(d * SR); tt = t_(n); fr = [root, root * 1.5, root * 2, root * 2.4]
    x = sum(osc(f * (1 + .003 * k), n, 'saw') for k, f in enumerate(fr)); x = np.tanh(x * .8)
    cut = 300 + 2600 * np.exp(-tt * 2.2); y = np.zeros(n)
    for i0 in range(0, n, 2400): y[i0:i0 + 2400] = filt(x[i0:i0 + 2400], 'low', cut[i0])
    return (y + osc(root / 2, n) * .8) * env(n, .02, 1.6)
def pluck(f, d=1.2, damp=.996):
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = damp * .5 * (buf[i % p] + buf[(i + 1) % p])
    return filt(out, 'low', 3500) * env(n, .001, d * .6)
def lead(notes, step, glide=.05):  # G-funk style whiny portamento lead
    n = int(len(notes) * step * SR); f = np.zeros(n)
    for k, nt in enumerate(notes): f[int(k * step * SR):int((k + 1) * step * SR)] = nt
    f = np.where(f == 0, np.nan, f); idx = np.where(~np.isnan(f), np.arange(n), 0); np.maximum.accumulate(idx, out=idx); f = np.nan_to_num(f[idx], nan=220.)
    k = int(glide * SR); f = np.convolve(f, np.ones(k) / k, 'same'); vib = 1 + .006 * np.sin(2 * np.pi * 5.5 * t_(n))
    x = osc(f * vib, n, 'sin') * .7 + osc(f * vib * 2, n, 'tri') * .15; return x * np.minimum(1, t_(n) / .03)
def whistle(notes, step):
    x = lead(notes, step, .08); n = len(x); return (x + filt(noise(n / SR), 'band', [1200, 3200]) * .04) * (1 - np.exp(-t_(n) * 6))
def bell(f, d=1.6): n = int(d * SR); tt = t_(n); return sum(osc(f * r, n) * np.exp(-tt * (2.2 + 2 * k)) * a for k, (r, a) in enumerate([(1, 1), (2.76, .45), (5.4, .25), (8.9, .12)]))
def boom(d=1.6, f0=42): n = int(d * SR); tt = t_(n); return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f0 + 90 * np.exp(-tt * 9)) / SR) * np.exp(-tt * 2.4)) + filt(noise(d), 'low', 600) * np.exp(-tt * 7) * .6
def whoosh(d=.5, up=True, lo=300, hi=5000):
    n = int(d * SR); x = noise(d); fc = np.geomspace(lo, hi, n) if up else np.geomspace(hi, lo, n); y = np.zeros(n)
    for i0 in range(0, n, 1200): y[i0:i0 + 1200] = filt(x[i0:i0 + 1200], 'band', [fc[i0] * .7, min(fc[i0] * 1.4, 20000)])
    return y * np.sin(np.linspace(0, np.pi, n)) ** 1.5
def riser(d=1.2): n = int(d * SR); k = (t_(n) / d) ** 2; return whoosh(d, True, 200, 9000) * (.3 + k) + osc(200 + 1800 * k, n, 'saw') * k * .15
def blip(f, d=.07): n = int(d * SR); return osc(f, n, 'sq') * env(n, .001, d * .4) * .5
def chirp(): n = int(.18 * SR); return osc(4600, n) * (np.sin(2 * np.pi * 38 * t_(n)) > 0) * env(n, .005, .08) * .25

music = np.zeros((N, 2)); sfx = np.zeros((N, 2))
tt0 = lambda typ: [e for e in E if e['type'] == typ]
s = lambda i: SH[i][0]
def shot_end(t): return next(t1 for t0, t1 in SH if t0 <= t < t1)
mute = np.ones(N)
for e in tt0('freeze'):   # music drops out during each comic freeze (the "record stop" button)
    a, b = int(e['t'] * SR), int(shot_end(e['t']) * SR); mute[a:b] = .12
a, b = int(s(1) * SR), int(s(2) * SR); mute[a:b] = 0             # awkward silence after the record scratch

# ---------- 1. intro: dark pad + heartbeat + riser ----------
put(music, pad([73.4, 110, 146.8, 174.6], s(1) + .3, 900, 1.2), 0, .9)
for k in range(int(s(1) / .95)):
    t = .35 + k * .95; put(music, kick(.4, 42), t, .55); put(music, kick(.35, 40), t + .26, .38)
put(music, riser(2.2), s(1) - 2.2, .35)
# ---------- 2. build + BRAAM title ----------
title = tt0('title')[0]['t']; b2 = s(2)
for k, t in enumerate(np.arange(b2 + .2, title - .1, .3)):
    put(music, kick(.4, 60) * .6, t, .5 + .5 * k / 20)
    if k % 2: put(music, snare(), t + .15, .25 + .3 * k / 20, -.2)
put(music, riser(1.6), title - 1.6, .6)
put(music, braam(36.7, 3.6), title, 1.3); put(music, crash(3), title, .5); put(music, boom(2.2, 38), title, .9)
# ---------- 3. groove (team al-Sayyad): trap beat, 808, G-funk lead ----------
BPM = 96; bt = 60 / BPM; g0, g1 = s(3), s(9)
roots = [73.42, 58.27, 65.41, 55.0]          # Dm  Bb  C  A
chords = [[146.8, 174.6, 220], [116.5, 146.8, 174.6], [130.8, 164.8, 196], [110, 138.6, 164.8]]
nb = int((g1 - g0) / bt)
for k in range(nb):
    t = g0 + k * bt; bar = (k // 4) % 4
    if k % 4 == 0: put(music, pad(chords[bar], bt * 4, 1800, .25), t, .55, 0)
    if k % 4 in (0, 2) or (k % 8 == 7): put(music, kick(), t, .8)
    if k % 4 in (1, 3): put(music, clapf(), t, .55, .1)
    for h in range(4 if k % 8 == 6 else 2): put(music, hat(), t + h * bt / (4 if k % 8 == 6 else 2), .22, .3)
    if k % 2 == 0: put(music, s808(roots[bar], bt * 1.8), t, .55)
hook = [293.7, 0, 349.2, 392, 440, 0, 392, 349.2, 293.7, 0, 261.6, 293.7, 349.2, 311.1, 293.7, 0]
for rep in range(int((g1 - g0) / (bt * 8)) + 1):
    t = g0 + bt * 8 * rep + bt * 4
    if t + bt * 4 < g1: put(music, lead(hook, bt / 2), t, .16, -.25)
# ---------- 4. rivals: dark half-time, distorted 808, stutters ----------
d0, d1 = s(9), s(12); bt2 = bt * 2
put(music, pad([55, 82.4, 110, 130.8], d1 - d0, 700, 1.0), d0, .8)
for k in range(int((d1 - d0) / bt)):
    t = d0 + .25 + k * bt
    if k % 4 == 0: put(music, kick(.7, 40), t, .9); put(music, s808(41.2, bt * 3.5) * 1.3, t, .6)
    if k % 4 == 2: put(music, snare(), t, .45); put(music, clapf(), t, .35)
    put(music, hat(k % 4 == 3), t, .14, .35)
for e in tt0('beta'):
    for o in range(6): put(music, blip(220 * (1 + o % 3), .05), e['t'] + o * .06, .5)
# ---------- 5. standoff: western whistle, plucks, the stomp ----------
w0, w1 = s(12), s(13); stomp = tt0('stomp')[0]['t']
put(music, boom(1.8, 40), w0, .8); put(music, crash(2), w0, .35)
wh = [587.3, 0, 784, 0, 659.3, 587.3, 0, 0, 523.3, 0, 587.3, 0, 0, 0]
put(music, reverb(pan2(whistle(wh, .22), -.1), 2.2, .5)[:, 0], w0 + 1.2, .22, -.1)
for k, f in enumerate([146.8, 220, 146.8, 196, 146.8, 174.6, 220, 146.8]):
    if w0 + 1.4 + k * .45 < stomp - .5: put(music, pluck(f, 1.0), w0 + 1.4 + k * .45, .5, .25)
for k in range(3): put(music, bell(880, 2.0), w0 + 1.2 + k * 1.6, .12, .4)
mute[int((stomp - .45) * SR):int(stomp * SR)] = 0                   # silence before the stomp
put(music, boom(2.4, 36), stomp, 1.4); put(music, crash(2.2), stomp, .45)
for k in range(6): put(music, kick(), stomp + .9 + k * bt, .6); put(music, hat(), stomp + .9 + k * bt + bt / 2, .2, .3)
# ---------- 6. finale: epic drums, BRAAM, end sting ----------
f0 = s(13); fin = tt0('final')[0]['t']
put(music, pad([73.4, 110, 146.8, 220, 293.7], DUR - f0, 2200, 1.5), f0, .9)
for k, t in enumerate(np.arange(f0 + .3, fin - .1, bt / 2)):
    put(music, kick(.5, 50), t, .45 + .45 * k / 30)
    if k % 2: put(music, snare(), t, .2 + .25 * k / 30, -.15)
put(music, riser(2.4), fin - 2.4, .6)
put(music, braam(36.7, 2.6), fin, 1.4); put(music, crash(2.6), fin, .55); put(music, boom(2.6, 34), fin, 1.0)
music *= mute[:, None]
music = reverb(music, 1.6, .12, 3)

# ---------------- SFX ----------------
for e in E:
    T, ty = e['t'], e['type']
    if ty == 'whip': put(sfx, whoosh(.42, True, 400, 6000), T - .24, .55, -.3); put(sfx, whoosh(.3, False, 300, 3000), T, .3, .3)
    elif ty == 'glitch':
        for o in range(10): put(sfx, blip(rng.choice([110, 220, 440, 880, 1760]), .03) + filt(noise(.03), 'high', 2000) * .3, T - .3 + o * .035, .5, rng.uniform(-.6, .6))
    elif ty == 'card': put(sfx, whoosh(.25, True, 800, 9000), T, .3, .5); put(sfx, blip(1400, .04), T + .22, .25, .5)
    elif ty == 'freeze': put(sfx, filt(noise(.05), 'high', 2500) * np.exp(-t_(int(.05 * SR)) * 80), T, .8); put(sfx, filt(noise(.05), 'high', 2500) * np.exp(-t_(int(.05 * SR)) * 80), T + .07, .6); put(sfx, kick(.4, 70), T, .5); put(sfx, bell(1760, .8), T + .02, .2)
    elif ty == 'scratch':
        n = int(.55 * SR); fc = 700 + 1600 * np.abs(np.sin(np.linspace(0, 3.2 * np.pi, n))); x = noise(.55); y = np.zeros(n)
        for i0 in range(0, n, 600): y[i0:i0 + 600] = filt(x[i0:i0 + 600], 'band', [fc[i0] * .8, fc[i0] * 1.25])
        put(sfx, y * 1.6, T - .15, 1.0)
        for k in range(int((s(2) - T - .6) / .7)): put(sfx, chirp(), T + .6 + k * .7, .5, .5); put(sfx, chirp(), T + .78 + k * .7, .4, .5)
    elif ty == 'badge': put(sfx, whoosh(.35, True, 500, 8000), T, .45); put(sfx, bell(2349, 1.2), T + .3, .25)
    elif ty == 'splash': x = filt(noise(.6), 'low', 3000) * env(int(.6 * SR), .005, .12); put(sfx, x, T, .8, -.3); [put(sfx, osc(900 + 700 * rng.random(), int(.05 * SR)) * env(int(.05 * SR), .001, .02), T + .1 + o * .07, .25, -.3) for o in range(6)]
    elif ty == 'pop': n = int(.7 * SR); put(sfx, osc(420 * (1 + .25 * np.sin(2 * np.pi * 14 * t_(n)) * np.exp(-t_(n) * 4)), n) * env(n, .002, .3), T, .45)
    elif ty == 'reel': [put(sfx, filt(noise(.008), 'high', 3000), T + o * .03, .35, -.2) for o in range(15)]
    elif ty == 'car':
        n = int(1.4 * SR); f = 62 + 30 * (t_(n) / 1.4); x = np.tanh(2 * (osc(f, n, 'saw') + .5 * osc(f * 2.01, n, 'saw'))) + filt(noise(1.4), 'low', 900) * .4
        put(sfx, x * np.sin(np.linspace(0, np.pi, n)) ** .7, T, .35, -.6)
    elif ty == 'screech': n = int(.55 * SR); x = filt(noise(.55), 'band', [2200, 3000]) * (1 + .5 * np.sin(2 * np.pi * 23 * t_(n))); put(sfx, x * env(n, .01, .3), T, .5, .1)
    elif ty == 'honk': n = int(.32 * SR); x = filt(np.tanh(1.5 * (osc(415, n, 'sq') + osc(523, n, 'sq'))), 'low', 2800) * np.minimum(1, (.32 - t_(n)) / .04); put(sfx, x * np.minimum(1, t_(n) / .01), T, .75, .1)
    elif ty == 'ding': put(sfx, bell(2637, 1.6) + bell(3951, 1.6) * .5, T, .45, .35)
    elif ty == 'scribble': n = int(.5 * SR); put(sfx, filt(noise(.5), 'band', [2500, 4500]) * (np.sin(2 * np.pi * 11 * t_(n)) > 0) * .6, T, .25, .3)
    elif ty == 'blip': put(sfx, blip(1200, .06), T, .4, .4)
    elif ty == 'cute': [put(sfx, bell(f, 1.0), T + k * .1, .3, .2) for k, f in enumerate([1046.5, 1318.5, 1568, 2093])]
    elif ty == 'danger':
        for k, f in enumerate([65.4, 61.7, 55]): put(sfx, braam(f, .9 if k < 2 else 1.8) * .7, T + k * .28, .7)
        n = int(.5 * SR); put(sfx, osc(np.geomspace(800, 60, n), n, 'saw') * env(n, .002, .3) * .3, T - .05, .5)
    elif ty == 'wind': n = int(e['d'] * SR); w = filt(noise(e['d']), 'band', [200, 1600]) * (.6 + .4 * np.sin(2 * np.pi * .7 * t_(n))) * np.minimum(1, t_(n) / .4) * np.minimum(1, (e['d'] - t_(n)) / .3); put(sfx, w, T, .45, -.2)
    elif ty == 'check': put(sfx, bell(1568, .7), T, .3); put(sfx, bell(2093, .9), T + .12, .3)
    elif ty == 'loading': [put(sfx, blip(880, .05), T + k * .3, .2, .3) for k in range(max(0, int(e['d'] / .3)))]
    elif ty == 'arrive': put(sfx, whoosh(.5, True, 200, 4000), T - .25, .5, -.4)
    elif ty == 'beta': put(sfx, kick(.5, 55), T, .8); put(sfx, filt(noise(.12), 'band', [400, 2400]) * env(int(.12 * SR), .001, .04), T, .6)
    elif ty == 'step': put(sfx, boom(1.0, 38), T, .95); put(sfx, filt(noise(.35), 'band', [300, 1500]) * env(int(.35 * SR), .002, .08), T, .45)
    elif ty == 'alarm': n = int(e['d'] * SR); f = np.where(np.sin(2 * np.pi * 5 * t_(n)) > 0, 720, 1020); put(sfx, filt(osc(f, n, 'sq'), 'low', 4000) * .35 * np.minimum(1, (e['d'] - t_(n)) / .2), T, .55, -.7)
    elif ty == 'vs': put(sfx, whoosh(.6, True, 200, 7000)[::-1], T - .6, .5); put(sfx, boom(1.4, 46), T, .7)
    elif ty == 'tumble': n = int(3 * SR); put(sfx, filt(noise(3), 'band', [600, 2500]) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 3 * t_(n)))) * np.sin(np.linspace(0, np.pi, n)), T, .2, 0)
    elif ty == 'stomp': n = int(.9 * SR); put(sfx, osc(300 * (1 + .4 * np.sin(2 * np.pi * 9 * t_(n)) * np.exp(-t_(n) * 3)), n, 'tri') * env(n, .002, .4), T + .08, .35, -.4)
    elif ty == 'flex': put(sfx, bell(3136, .6), T, .2, -.4); put(sfx, whoosh(.3, True, 1000, 9000), T, .2, -.4)
    elif ty == 'riser': put(sfx, riser(1.2), T, .4)
    elif ty == 'final': put(sfx, boom(2.0, 40), T, .6)
    elif ty == 'end': put(sfx, whoosh(.4, False, 200, 5000), T, .4)
sfx = reverb(sfx, .9, .08, 5)
wr(sys.argv[2], music); wr(sys.argv[3], sfx); print('ok', len(E), 'events')
