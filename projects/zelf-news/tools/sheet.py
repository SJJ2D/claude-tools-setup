"""sheet.py <name> a.png b.png ...  → out/stills/<name>_sheet.jpg (grid, each cell labelled with its time and mean luma 0..1)."""
import sys, os, re
from PIL import Image, ImageDraw, ImageStat
name, files = sys.argv[1], sys.argv[2:]
if not files: sys.exit('no stills')
ims = [Image.open(f).convert('RGB') for f in files]
vert = ims[0].height > ims[0].width
cw = 360 if vert else 640; ch = int(cw * ims[0].height / ims[0].width)
cols = min(len(ims), 4 if vert else 3); rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cw, rows * (ch + 26)), (18, 18, 22)); d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    luma = ImageStat.Stat(im.convert('L')).mean[0] / 255
    x, y = (i % cols) * cw, (i // cols) * (ch + 26)
    sheet.paste(im.resize((cw, ch), Image.LANCZOS), (x, y + 26))
    m = re.search(r'_(\d+\.\d+)\.png$', f)
    d.text((x + 6, y + 6), f"t={m.group(1) if m else '?'}s   luma={luma:.2f}", fill=(255, 220, 90))
out = os.path.join(os.path.dirname(files[0]), f'{name}_sheet.jpg'); sheet.save(out, quality=88)
print('sheet:', os.path.abspath(out))
