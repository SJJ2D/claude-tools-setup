# -*- coding: utf-8 -*-
"""Fill the ORIGINAL TCSC418 template (same table, same RTL direction) for the Weather lesson."""
import copy, glob, os, sys
from docx import Document
from docx.shared import Pt, Cm, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

U = '/root/.claude/uploads/53ac41fa-51a8-5de8-addb-ee0a2ddc45d3'
OUT = '/home/user/work/steam/out'
IMG = {k: f'{OUT}/act{k}.png' for k in (0, 1, 2)}
D = Document(glob.glob(f'{U}/286fed24-*.docx')[0])
W = qn

# ---------- page: A4 (instruction 12), keep each section's orientation
for s in D.sections:
    land = s.page_width > s.page_height
    s.page_width, s.page_height = (Cm(29.7), Cm(21.0)) if land else (Cm(21.0), Cm(29.7))
    for m in ('left_margin', 'right_margin', 'top_margin', 'bottom_margin'):
        setattr(s, m, Cm(2.54))

def rtl_run(p, text, bold=False, size=13, italic=False):
    r = p.add_run(text)
    rPr = r._r.get_or_add_rPr()
    f = OxmlElement('w:rFonts')
    for a in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'): f.set(W(a), 'Arial')
    rPr.insert(0, f)
    x = OxmlElement('w:rtl'); x.set(W('w:val'), '1'); rPr.append(x)
    r.bold = bold; r.font.cs_bold = bold; r.italic = italic; r.font.cs_italic = italic
    r.font.size = Pt(size); sz = OxmlElement('w:szCs'); sz.set(W('w:val'), str(int(size * 2))); rPr.append(sz)
    return r

def bidi(p):
    pPr = p._p.get_or_add_pPr()
    if pPr.find(W('w:bidi')) is None:
        b = OxmlElement('w:bidi'); b.set(W('w:val'), '1'); pPr.append(b)

def write(p, text, size=13, align=None):
    """text with **bold** segments; keeps the paragraph's own direction/alignment."""
    for i, seg in enumerate(text.split('**')):
        if seg: rtl_run(p, seg, bold=(i % 2 == 1), size=size)
    if align: p.alignment = align

def fill(cell, lines, size=12, align=WD_ALIGN_PARAGRAPH.RIGHT):
    lines = lines if isinstance(lines, list) else [lines]
    ps = cell.paragraphs
    for p in ps[1:]: p._p.getparent().remove(p._p)
    p = ps[0]
    for r in list(p.runs): r._r.getparent().remove(r._r)
    for i, line in enumerate(lines):
        q = p if i == 0 else cell.add_paragraph()
        pPr = q._p.get_or_add_pPr()
        for n in pPr.findall(W('w:numPr')): pPr.remove(n)
        q.paragraph_format.first_line_indent = Cm(0); q.paragraph_format.left_indent = Cm(0); q.paragraph_format.right_indent = Cm(0)
        bidi(q); q.paragraph_format.space_after = Pt(0); q.alignment = align
        write(q, line, size)
    return cell

def header_text(cell, text):
    """replace a header label but keep its formatting (first run)."""
    p = cell.paragraphs[0]; runs = p.runs
    runs[0].text = text
    for r in runs[1:]: r.text = ''

def add_pictures(cell, paths, width_cm, caption):
    p = cell.add_paragraph(); bidi(p); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for i, path in enumerate(paths):
        if i: p.add_run(' ')
        p.add_run().add_picture(path, width=Cm(width_cm))
    c = cell.add_paragraph(); bidi(c); c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rtl_run(c, caption, size=9, italic=True)

def add_picture(cell, path, width_cm, caption):
    p = cell.add_paragraph(); bidi(p); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(2)
    p.add_run().add_picture(path, width=Cm(width_cm))
    c = cell.add_paragraph(); bidi(c); c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rtl_run(c, caption, size=9, italic=True)

# ---------- cover: fill the template's own lines
body_ps = D.paragraphs
def para_starting(txt):
    return next(p for p in body_ps if p.text.strip().startswith(txt))
for label, val in [('اسم المقرر', ': TCSC418'), ('اسم الطالب', ': سجاد مهدي عبدالله الصياد'),
                   ('الرقم الجامعي', ': 202102571'), ('الشعبة', ': 1'), ('مدرس المقرر', ': د. شيماء')]:
    p = para_starting(label)
    for r in p.runs: r.text = r.text.rstrip()
    rtl_run(p, val, size=13)

# empty spacer paragraphs between cover and table -> one page break, then the introduction
tbl = D.tables[0]._tbl
prev = tbl.getprevious(); spacers = []
while prev is not None and prev.tag == W('w:p') and not ''.join(t.text or '' for t in prev.iter(W('w:t'))).strip():
    spacers.append(prev); prev = prev.getprevious()
for sp in spacers[1:]: sp.getparent().remove(sp)
anchor = spacers[0]
from docx.text.paragraph import Paragraph
pb = Paragraph(anchor, D._body); pb.add_run().add_break(WD_BREAK.PAGE)

def insert_before(el, text, bold=False, size=13, color=None):
    new = OxmlElement('w:p'); el.addprevious(new)
    p = Paragraph(new, D._body); bidi(p); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(3)
    if bold: rtl_run(p, text, bold=True, size=size)
    else: write(p, text, size)
    return p

insert_before(tbl, 'المقدمة', bold=True, size=14)
insert_before(tbl, 'اخترت درس «الطقس» لأن التلميذ يعيشه كل يوم؛ يحس بحر الظهيرة ويرى الغيوم ويسمع النشرة الجوية. '
                   'وفي هذا التقرير حللت الدرس، واقترحت له استقصاءين وثلاث مشكلات تصميمية، ثم ربطته بالرياضيات والعربية والفن والتربية الإسلامية ضمن نهج STEAM.')

# ---------- table column widths (structure, merges and direction untouched)
cm = [1.5, 3.6, .01, 2.0, 1.6, .01, 1.3, 2.0, .8, .8, .5, 3.0, .3, .5, 5.6]
grid = tbl.find(W('w:tblGrid'))
for gc, w in zip(grid.findall(W('w:gridCol')), cm): gc.set(W('w:w'), str(int(w * 567)))
for tc in tbl.iter(W('w:tc')):
    tcW = tc.find(W('w:tcPr')).find(W('w:tcW'))
    if tcW is not None: tcW.getparent().remove(tcW)
tblPr = tbl.find(W('w:tblPr'))
tw = tblPr.find(W('w:tblW')); tw.set(W('w:w'), str(int(sum(cm) * 567))); tw.set(W('w:type'), 'dxa')
lay = OxmlElement('w:tblLayout'); lay.set(W('w:type'), 'fixed'); tblPr.append(lay)

T = D.tables[0]
def row_cells(i):
    seen, out = set(), []
    for c in T.rows[i].cells:
        if id(c._tc) not in seen: seen.add(id(c._tc)); out.append(c)
    return out

hdr = row_cells(3)[0]
for q in hdr.paragraphs[1:]:
    if not q.text.strip(): q._p.getparent().remove(q._p)
# row 1: lesson data
r1 = row_cells(1)
for c, v in zip(r1, ['الدرس الأول: الطقس', 'الثالث الابتدائي', 'الثاني',
                     'الوحدة الرابعة: الطقس والفضاء (الفصل السابع)', 'ص 12–19']):
    fill(c, v, 12, WD_ALIGN_PARAGRAPH.CENTER)

# row 4 (merged with row 5): content / skills / attitudes / vertical ; + inquiry 1
r4 = row_cells(4)
fill(r4[0], ['• **الطقس:** حالة الجو في مكان معيّن خلال يوم أو أيام.',
             '• عناصره: الحرارة، والهطل، والرياح، والضغط الجوي.',
             '• أدواته: الترمومتر، ومقياس المطر، والسهم الدوّار، والأنيمومتر، والبارومتر.',
             '• الغيوم وأنواعها والضباب.',
             '• تكوّن الغيوم ودورة الماء: تبخر، تكثف، هطل.'])
fill(r4[1], ['• التوقع والتجريب والاستنتاج.', '• القياس بأدوات الطقس.',
             '• المقارنة (الغيمة والضباب، التبخر والتكثف).', '• عمل نموذج للغيوم.',
             '• قراءة الشكل والتفكير الناقد.'])
fill(r4[2], ['• حب الاستطلاع.', '• تقدير عظمة الخالق.', '• متابعة النشرة الجوية.',
             '• الدقة في القياس.', '• المحافظة على الماء.'])
fill(r4[3], ['**داخل الصف الثالث:**', '• «الشمس والأرض» ص 20: الليل والنهار وتغير الحرارة.',
             '• «حالات المادة» ص 60: بخار الماء غاز.',
             '**لاحقًا – الصف الرابع (ج1):**', '• «تغيرات المادة» ص 66–71: التبخر والتكثف بالحرارة.',
             '**لاحقًا – الصف الخامس (ج1):**', '• «تغيرات حالة المادة» ص 58–64: الغليان والتبخر.',
             '• «التجوية والتعرية» ص 116–119: أثر المطر والرياح في الصخور.'])
fill(r4[4], ['**الاستقصاء (1): هل تسخّن الشمس الهواء وتبخّر الماء؟** (يرتبط بالرياضيات والعربية)',
             '**النشاط 1أ: الحرارة في الشمس والظل**',
             '• المستقل: مكان الترمومتر. التابع: قراءته بالدرجات.',
             '• الخطوات: يتوقع، ثم يضع ترمومترين في الشمس والظل، ويقرأهما الساعة 8 و10 و12، ويمثّل القراءات بالأعمدة.',
             '**النشاط 1ب: التبخر في الشمس والظل**',
             '• المستقل: تعرّض الكوب للشمس. التابع: الماء المتبقي (مل).',
             '• الخطوات: يقيس 200 مل في كوبين، ويضع أحدهما في الشمس والآخر في الظل، ثم يقيس المتبقي بعد ثلاثة أيام ويطرح.',
             '**الاستنتاج:** الشمس ترفع حرارة الهواء وتسرّع التبخر، ومن هنا تبدأ دورة الماء.'], 11)

trPr5 = T.rows[5]._tr.get_or_add_trPr(); cs5 = OxmlElement('w:cantSplit'); cs5.set(W('w:val'), 'true'); trPr5.append(cs5)
r5 = row_cells(5)
fill(r5[-1], ['**الاستقصاء (2): هل يؤثر لون السطح في حرارته؟** (يرتبط بالفن والرياضيات)',
              '• المستقل: لون الورق (أبيض، أصفر، أحمر، أزرق، أسود). التابع: قراءة الترمومتر.',
              '• الخطوات: يصنّف التلاميذ الألوان إلى حارة وباردة ويتوقعون أيها يسخن أكثر، ثم يضعون ترمومترًا في جيب من كل لون تحت الشمس 15 دقيقة، ويرتّبون الألوان حسب القراءة.',
              '**الاستنتاج:** الألوان الغامقة تسخن أكثر لأنها تمتص أشعة أكثر، و«الحار والبارد» في الفن وصف بصري لا حرارة فعلية.'], 11)

# row 7: template's "إلخ" -> Islamic studies ; "...." stays as in the template
r7 = row_cells(7)
header_text(r7[5], 'التربية الإسلامية')

rows = [
 ['(2)',
  ['**المشكلة (1):** في الفسحة يتكدس التلاميذ في زاوية ظل صغيرة هربًا من الشمس. **كيف يمكننا أن** نصمم مظلة رخيصة تظلل عددًا أكبر وتبقى أبرد؟',
   '**التصميم:** نموذج مظلة من مواد معاد تدويرها، لونها من نتيجة الاستقصاء (2).'],
  'اختيار اللون بالدليل، وزخرفة الأطراف (ص 13، 33).',
  'رسالة إلى المدير بأسلوب «يجب عليكم…» (ص 64).',
  'المساحة (ص 84)، والمحيط (ص 79).',
  'التعاون: يبني التلاميذ المظلة معًا لخدمة زملائهم (ص 69).',
  '',
  ['**التعاون:** تقسّم المجموعة الأدوار (قياس، ورسم، وبناء) لتصميم مظلة واحدة.', '**الإبداع:** يقترح التلاميذ أكثر من شكل للمظلة بمواد معاد تدويرها، ويختارون أفضلها بعد الاختبار.']],
 ['(1أ)',
  ['**المشكلة (2):** فقرة الطقس في الإذاعة تُنقل من الإنترنت دون أن يقيس التلاميذ شيئًا. **كيف يمكننا أن** نبني محطة طقس صغيرة نأخذ منها أرقامنا؟',
   '**التصميم:** محطة فيها صندوق مظلل للترمومتر، ومقياس مطر من قارورة، وسهم دوّار.'],
  'رموز الطقس بالاستنسل (ص 89).',
  'نشرة في 40 كلمة (ص 65).',
  'السنتيمتر (ص 73)، والتماثل (ص 126)، والساعة (ص 106).',
  'قدرة الله: يرسل الرياح فتثير السحاب وينزل المطر (ص 21–22).',
  '',
  ['**التواصل:** يقدّم التلاميذ نشرة الطقس من قراءات محطتهم في الإذاعة الصباحية.', '**الثقافة الرقمية:** يسجّلون القراءات في Excel ويرسمون أعمدتها، ويقارنونها بموقع الأرصاد الجوية.']],
 ['(1ب)',
  ['**المشكلة (3):** تجف تربة حوض الحديقة بعد ساعات من سقيه. **كيف يمكننا أن** نحافظ على الماء فيها مدة أطول؟',
   '**التصميم:** غطاء للتربة أو مظلة للحوض أو ري بالتنقيط، يُختبر ويُحسّن.'],
  'ملصق بالكولاج لحملة توفير الماء (ص 111).',
  'نصيحة للحفاظ على البيئة (ص 64).',
  'السعة (ص 91)، والتمثيل بالرموز (ص 139).',
  'سورة عبس: ﴿أَنَّا صَبَبْنَا الْمَاءَ صَبًّا﴾، نعمة الماء وعدم الإسراف فيه (ص 13).',
  '',
  ['**التفكير الناقد:** يقارن التلاميذ الماء المتبقي في كل تصميم، ويحكمون بالأرقام لا بالرأي.', '**حل المشكلات:** يجربون الغطاء والمظلة والري بالتنقيط، ثم يحسّنون الحل الأضعف.']],
]
for i, vals in enumerate(rows):
    trPr = T.rows[8 + i]._tr.get_or_add_trPr(); cs = OxmlElement('w:cantSplit'); cs.set(W('w:val'), 'true'); trPr.append(cs)
    cells = row_cells(8 + i)
    for c, v in zip(cells, vals):
        fill(c, v, 11, WD_ALIGN_PARAGRAPH.CENTER if c is cells[0] else WD_ALIGN_PARAGRAPH.RIGHT)

# ---------- 21st-century note + conclusion after the table, before "المراجع"
ref_p = para_starting('المراجع')
def insert_p_before(p_el, text, bold=False, size=13):
    return insert_before(p_el, text, bold, size)
insert_p_before(ref_p._p, '**مهارات القرن الحادي والعشرين** (P21, 2019): يمارس التلاميذ التفكير الناقد حين يختارون التصميم الأفضل بناءً على قراءاتهم، '
                          'والتعاون والتواصل في عمل المجموعات والإذاعة، والإبداع في النماذج. أما التقنية فيصوّرون الغيوم بالجهاز اللوحي، ويرسمون أعمدة قراءاتهم في Excel، ويقارنونها بنشرة bahrainweather.gov.bh.', size=12)
insert_p_before(ref_p._p, 'الخاتمة', bold=True, size=14)
insert_p_before(ref_p._p, 'خرجت من هذا العمل بقناعة أن الطقس من أسهل الدروس ربطًا بغيره؛ فالترمومتر يقود إلى الرياضيات، والنشرة إلى العربية، والألوان إلى الفن، ونعمة المطر إلى التربية الإسلامية. '
                          'وأرى أن قيمته الحقيقية تظهر حين يحل التلميذ مشكلة يراها في مدرسته، لا حين يحفظ تعريفًا.')
# page break before references
br = OxmlElement('w:p'); ref_p._p.addprevious(br); Paragraph(br, D._body).add_run().add_break(WD_BREAK.PAGE)

# ---------- references (APA 7) under "المراجع:"
refs_ar = ['وزارة التربية والتعليم. (2013). **العلوم: الصف الثالث – الجزء الثاني** (ط. 2). مملكة البحرين.',
           'وزارة التربية والتعليم. (2023أ). **براعم العربية: الصف الثالث – الجزء الثاني**. مملكة البحرين.',
           'وزارة التربية والتعليم. (2023ب). **التربية الفنية: الصف الثالث**. مملكة البحرين.',
           'وزارة التربية والتعليم. (2026أ). **الرياضيات: الصف الثالث – الفصل الدراسي الثاني** (ط. 4). مملكة البحرين.',
           'وزارة التربية والتعليم. (2026ب). **العلوم: الصف الرابع – الجزء الأول**. مملكة البحرين.',
           'وزارة التربية والتعليم. (2026ج). **العلوم: الصف الخامس – الجزء الأول**. مملكة البحرين.',
           'وزارة التربية والتعليم. (2020). **التربية الإسلامية: الصف الثالث – الجزء الثاني** (ط. 2). مملكة البحرين.']
after = ref_p._p
def add_after(el, builder):
    new = OxmlElement('w:p'); el.addnext(new); p = Paragraph(new, D._body); builder(p); return new
for t in refs_ar:
    def b(p, t=t):
        bidi(p); p.alignment = WD_ALIGN_PARAGRAPH.RIGHT; p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.first_line_indent = Cm(-1.27); p.paragraph_format.left_indent = Cm(1.27)
        # titles are italic in APA; ** marks them here
        for i, seg in enumerate(t.split('**')):
            if seg: rtl_run(p, seg, italic=(i % 2 == 1), size=12)
    after = add_after(after, b)
eng = [('Herron, M. D. (1971). The nature of scientific enquiry. ', 'The School Review, 79', '(2), 171–212. https://doi.org/10.1086/442968'),
       ('Partnership for 21st Century Learning. (2019). ', 'Framework for 21st century learning definitions', '. Battelle for Kids. https://static.battelleforkids.org/documents/p21/P21_Framework_DefinitionsBFK.pdf'),
       ('Razzouk, R., & Shute, V. (2012). What is design thinking and why is it important? ', 'Review of Educational Research, 82', '(3), 330–348. https://doi.org/10.3102/0034654312457429')]
for a, it, c in eng:
    def b(p, a=a, it=it, c=c):
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT; p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.left_indent = Cm(1.27); p.paragraph_format.first_line_indent = Cm(-1.27)
        for txt, itl in ((a, False), (it, True), (c, False)):
            r = p.add_run(txt); r.italic = itl; r.font.size = Pt(11); r.font.name = 'Arial'
    after = add_after(after, b)

# remove empty paragraphs between references and the section break (keep the sectPr paragraph)
el = after.getnext()
while el is not None and el.tag == W('w:p') and el.find('.//' + W('w:sectPr')) is None and not ''.join(t.text or '' for t in el.iter(W('w:t'))).strip():
    nxt = el.getnext(); el.getparent().remove(el); el = nxt

D.save(f'{OUT}/STEAM_Weather_202102571.docx')
print('saved')
