"""Turn a logo-on-black clip into an RGBA PNG sequence.

Bright parts (letters) get a dilated opaque core so the black outline of the
GTA lettering survives; soft parts (glow) get alpha from brightness with the
colour un-premultiplied, so glows stay colourful instead of turning grey.
Fade in 0.3 s and fade out 0.4 s are applied to alpha.
usage: python3 make_alpha.py in.mp4 outdir radius
"""
import subprocess, sys, os
import numpy as np
from PIL import Image

src, out, rad = sys.argv[1], sys.argv[2], int(sys.argv[3])
hold = len(sys.argv) > 4 and sys.argv[4] == 'hold'   # no fade-out: logo stays to the end
os.makedirs(out, exist_ok=True)
w, h = map(int, subprocess.run(
    ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
     '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip().split(','))
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                     stdout=subprocess.PIPE)
frames = []
while True:
    b = p.stdout.read(w * h * 3)
    if len(b) < w * h * 3:
        break
    frames.append(np.frombuffer(b, np.uint8).reshape(h, w, 3))
n = len(frames)
fps = 24.0


def dilate(m, r):
    out = m.copy()
    ys, xs = np.mgrid[-r:r + 1, -r:r + 1]
    for dy, dx in zip(ys.ravel(), xs.ravel()):
        if dy * dy + dx * dx > r * r:
            continue
        out |= np.roll(np.roll(m, dy, 0), dx, 1)
    return out


def box_blur(a, r=1):
    acc = np.zeros_like(a)
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            acc += np.roll(np.roll(a, dy, 0), dx, 1)
    return acc / (2 * r + 1) ** 2


for i, fr in enumerate(frames):
    rgb = fr.astype(np.float32) / 255.0
    m = rgb.max(2)
    core = dilate(m > 0.30, rad).astype(np.float32)
    core = box_blur(core, 1)
    soft = np.clip(m / 0.30, 0, 1)
    a = np.maximum(core, soft)
    # un-premultiply where alpha comes from brightness only (glow); keep real black in the core outline
    col = np.where(core[..., None] > 0.5, rgb, rgb / np.maximum(a[..., None], 1e-3))
    t = i / fps
    dur = n / fps
    fade = min(1.0, t / 0.3) if hold else min(1.0, t / 0.3, max(0.0, (dur - t) / 0.4))
    a = a * fade
    # clean the frame border (crop edges)
    a[:2, :] = a[-2:, :] = 0
    a[:, :2] = a[:, -2:] = 0
    img = np.dstack([np.clip(col, 0, 1), a])
    Image.fromarray((img * 255 + 0.5).astype(np.uint8), 'RGBA').save(f'{out}/f{i:04d}.png')
print(src, n, 'frames', w, 'x', h)
