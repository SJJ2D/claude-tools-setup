# -*- coding: utf-8 -*-
# Each slide = full-bleed HD image (fonts preserved) + speaker notes.
import glob, json, sys
from pptx import Presentation
from pptx.util import Emu
D = '/home/user/work/tcar415/deck/'
out = sys.argv[1]
notes = json.load(open(D + 'notes.json', encoding='utf-8'))
P = Presentation(); P.slide_width, P.slide_height = Emu(12192000), Emu(6858000)
for i, f in enumerate(sorted(glob.glob(D + 'hd/*.png')), 1):
    s = P.slides.add_slide(P.slide_layouts[6])
    s.shapes.add_picture(f, 0, 0, P.slide_width, P.slide_height)
    t = notes.get(str(i))
    if t: s.notes_slide.notes_text_frame.text = t
P.save(out); print('pptx ok', i)
