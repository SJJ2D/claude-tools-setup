"""تكبير صورة بـ Real-ESRGAN (ONNX، CPU) مع تقسيم إلى مربعات متداخلة.
python upscale.py in.png out.png [x2|x4]"""
import sys, os, numpy as np, onnxruntime as ort
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]; m = sys.argv[3] if len(sys.argv) > 3 else 'x4'
sess = ort.InferenceSession(os.path.expanduser(f'~/tools/models/real_esrgan_{m}.onnx'), providers=['CPUExecutionProvider'])
inp = sess.get_inputs()[0]; S = int(m[1])
im = Image.open(src).convert('RGB'); a = np.asarray(im, np.float32) / 255.; H, W, _ = a.shape
fixed = [d if isinstance(d, int) else None for d in inp.shape]
tile = fixed[2] or 192; pad = 0 if fixed[2] else 12; step = tile - 2 * pad
out = np.zeros((H * S, W * S, 3), np.float32)
for y in range(0, H, step):
    for x in range(0, W, step):
        y0, x0 = max(0, y - pad), max(0, x - pad); y1, x1 = min(H, y + step + pad), min(W, x + step + pad)
        t = a[y0:y1, x0:x1]; th, tw = t.shape[:2]
        if fixed[2]: t = np.pad(t, ((0, tile - th), (0, tile - tw), (0, 0)), mode='edge')
        r = sess.run(None, {inp.name: t.transpose(2, 0, 1)[None].astype(np.float32)})[0][0].transpose(1, 2, 0)[:th * S, :tw * S]
        cy, cx = (y - y0) * S, (x - x0) * S; hh, ww = (min(y + step, H) - y) * S, (min(x + step, W) - x) * S
        out[y * S:y * S + hh, x * S:x * S + ww] = r[cy:cy + hh, cx:cx + ww]
Image.fromarray((np.clip(out, 0, 1) * 255).round().astype(np.uint8)).save(dst); print(dst, out.shape[1], 'x', out.shape[0])
