# -*- coding: utf-8 -*-
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

D = Document()
s = D.sections[0]
s.page_width, s.page_height = Cm(21), Cm(29.7)
for m in ('left_margin', 'right_margin', 'top_margin', 'bottom_margin'): setattr(s, m, Cm(2))
W = qn

def p_rtl(p, align='start'):
    pPr = p._p.get_or_add_pPr()
    b = OxmlElement('w:bidi'); b.set(W('w:val'), '1')
    # schema order: bidi before spacing/jc
    pPr.insert(0, b)
    if align == 'center':
        jc = OxmlElement('w:jc'); jc.set(W('w:val'), 'center'); pPr.append(jc)
    p.paragraph_format.space_after = Pt(2)

def run(p, text, bold=False, color=None, size=13):
    r = p.add_run(text)
    rPr = r._r.get_or_add_rPr()
    f = OxmlElement('w:rFonts')
    for a in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'): f.set(W(a), 'Arial')
    rPr.insert(0, f)
    if bold: r.bold = True; r.font.cs_bold = True
    if color: r.font.color.rgb = RGBColor.from_string(color)
    r.font.size = Pt(size)
    sz = OxmlElement('w:szCs'); sz.set(W('w:val'), str(size * 2)); rPr.append(sz)
    x = OxmlElement('w:rtl'); x.set(W('w:val'), '1'); rPr.append(x)
    return r

def cell(c, lines, bold=False, color=None):
    c.text = ''
    for i, line in enumerate(lines if isinstance(lines, list) else [lines]):
        p = c.paragraphs[0] if i == 0 else c.add_paragraph()
        p_rtl(p)
        for j, seg in enumerate(line.split('**')):
            if seg: run(p, seg, bold or j % 2 == 1, color)
    c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

h = D.add_paragraph(); p_rtl(h); run(h, 'الوسيلة الثالثة:', True, 'C00000', 14)

t = D.add_table(rows=0, cols=2); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
tblPr = t._tbl.tblPr
RED = 'C00000'
rows = [
 ('اسم الكتاب المدرسي', 'الدراسات الاجتماعية'),
 ('الصف', 'الثالث الابتدائي'),
 ('عنوان الدرس', 'الدرس الأول: عاداتي وتقاليدي'),
 ('صورة للوسيلة بعد تصميمها', None),
 ('المحتوى المتعلق بالوسيلة (يكتب من محتوى الدرس)',
  ['• من المناسبات الشعبية في البحرين: القرقاعون في منتصف رمضان، والمسحّر الذي يوقظ الناس للسحور، والحية بيه قُبيل عيد الأضحى، ومدفع الإفطار عند أذان المغرب في رمضان.',
   '• من الكرم والضيافة: الترحيب بالضيف أولًا، ثم تقديم القهوة، ثم إطعامه.',
   '• تُصنّف العادات إلى عادات الرجال، وعادات النساء، وعادات الضيافة.',
   '• نحافظ على عادات بلادنا وتقاليدها ونعتز بهويتنا.']),
 ('الهدف السلوكي المتعلق بالوسيلة (بالاستعانة بجداول الأهداف)',
  'أن يحلّ التلميذ خلال خمس عشرة دقيقة خمسة مواقف وألغاز في (كتاب الفريج السري) مستخدمًا ما تعلّمه عن العادات والتقاليد البحرينية، فيحدد المناسبة أو وقتها أو خطوة الضيافة المناسبة لكل موقف، ويجمع حروف كلمة السر (تراثي) كاملة.'),
 ('مستوى الهدف السلوكي المتعلق بالوسيلة', 'التطبيق'),
]
for k, v in rows:
    cc = t.add_row().cells
    c = [cc[1], cc[0]]          # c[0] = label (right), c[1] = answer (left)
    cell(c[0], k, True, RED)
    if v is None:
        c[1].text = ''
        p = c[1].paragraphs[0]; p_rtl(p, 'center')
        p.add_run().add_picture('/home/user/work/habits/wasila/photo.jpg', height=Cm(11))
        cap = c[1].add_paragraph(); p_rtl(cap, 'center'); run(cap, 'غلاف (كتاب الفريج السري) بعد الطباعة والتغليف', size=10)
    else:
        cell(c[1], v)
for r in t.rows:
    r.cells[0].width = Cm(12.4); r.cells[1].width = Cm(4.6)
for gc, w in zip(t._tbl.tblGrid.findall(W('w:gridCol')), (12.4, 4.6)): gc.set(W('w:w'), str(int(w * 567)))
tw = tblPr.find(W('w:tblW')); tw.set(W('w:w'), str(int(17 * 567))); tw.set(W('w:type'), 'dxa')
lay = OxmlElement('w:tblLayout'); lay.set(W('w:type'), 'fixed'); tw.addnext(lay)
D.save('/home/user/work/habits/wasila/الوسيلة_الثالثة_كتاب_الفريج_السري.docx')
print('ok')
