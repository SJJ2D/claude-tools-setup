from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
D = Document()
sec = D.sections[0]; sec.left_margin = sec.right_margin = Cm(2); sec.top_margin = sec.bottom_margin = Cm(1.8)
st = D.styles['Normal']; st.font.name = 'Arial'; st.font.size = Pt(12)
st.element.rPr.rFonts.set(qn('w:cs'), 'Arial'); st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')
def rtl(p):
    pPr = p._p.get_or_add_pPr(); b = OxmlElement('w:bidi'); b.set(qn('w:val'), '1'); pPr.append(b)
def run_rtl(r, size=None, bold=False, color=None):
    rPr = r._r.get_or_add_rPr(); x = OxmlElement('w:rtl'); x.set(qn('w:val'), '1'); rPr.append(x)
    r.font.cs_bold = bold; r.bold = bold
    if size: r.font.size = Pt(size); szcs = OxmlElement('w:szCs'); szcs.set(qn('w:val'), str(int(size * 2))); rPr.append(szcs)
    if color: r.font.color.rgb = RGBColor.from_string(color)
def para(text, size=12, bold=False, align='right', color=None, space=6):
    p = D.add_paragraph(); rtl(p); p.alignment = {'right': WD_ALIGN_PARAGRAPH.RIGHT, 'center': WD_ALIGN_PARAGRAPH.CENTER}[align]
    p.paragraph_format.space_after = Pt(space); r = p.add_run(text); run_rtl(r, size, bold, color); return p
def shade(cell, hexc):
    tcPr = cell._tc.get_or_add_tcPr(); s = OxmlElement('w:shd'); s.set(qn('w:val'), 'clear'); s.set(qn('w:color'), 'auto'); s.set(qn('w:fill'), hexc); tcPr.append(s)
def table(rows, widths=(4.2, 12.8)):
    t = D.add_table(rows=0, cols=2); t.style = 'Table Grid'; t.autofit = False
    tblPr = t._tbl.tblPr; bv = OxmlElement('w:bidiVisual'); tblPr.append(bv)
    for k, v in rows:
        c = t.add_row().cells
        for cell, txt, bold, fill in ((c[0], k, True, 'E8EEF9'), (c[1], v, False, None)):
            cell.text = ''; p = cell.paragraphs[0]
            if txt.startswith('http'): p.alignment = WD_ALIGN_PARAGRAPH.LEFT; r = p.add_run(txt); r.font.size = Pt(11)
            else: rtl(p); r = p.add_run(txt); run_rtl(r, 12, bold)
            if fill: shade(cell, fill)
        c[0].width = Cm(widths[0]); c[1].width = Cm(widths[1])
    for col, w in zip(t.columns, widths):
        for cell in col.cells: cell.width = Cm(w)
    return t
para('جامعة البحرين · كلية محمد جابر الأنصاري للمعلمين', 12, True, 'center', '24205A', 2)
para('تكنولوجيا التعليم الإبداعية (TCIT419)', 13, True, 'center', '24205A', 2)
para('التقييم 2: تطوير تجربة تعليمية · العمل الفردي', 16, True, 'center', 'C8102E', 12)
para('بيانات الطالب', 14, True, color='24205A')
table([('الاسم', 'سجاد مهدي عبدالله الصياد'), ('الرقم الجامعي', '202102571'), ('الشعبة', '1'), ('التخصص', ''), ('السنة', '2026–2027'),
       ('عنوان المشروع', 'الطقس: مشروعي الفردي في الواقع المعزز (العلوم، الصف الثالث الابتدائي)')])
para('', space=4)
para('رابط المشروع الفردي', 14, True, color='24205A')
table([('الرابط', 'https://spiffy-gumption-19d291.netlify.app/weather/'), ('رابط بديل', 'https://claude.ai/artifact/AM1jCeH1bKPded7TnTdQGZ')])
para('يعمل الرابط على الهاتف والجهاز اللوحي والحاسوب. زر «الواقع المعزز» يثبّت الجزيرة على سطح حقيقي (طاولة أو سرير) عبر الكاميرا، ويمكن الضغط على أي مجسم لفتحه.', 11, color='5A5694')
D.add_page_break()
para('توثيق العمل الفردي (لقطات الشاشة)', 15, True, color='24205A', space=8)
shots = [('00_welcome', 'شاشة البداية'), ('01_interface', 'الواجهة الرئيسية للمشروع: الجزيرة ثلاثية الأبعاد وعليها الكائنات التسعة، وشريط الكائنات في الأسفل')]
names = ['بيانات عضو المجموعة (الطالب)', 'الهدف التعليمي', 'بيانات الدرس وصورة عنه', 'قالب خطة الدرس', 'التقنية الغامرة (رابط)',
         'النشاط التعليمي الغامر (الإجراءات ودور المعلم والتلميذ)', 'التقييم (خطواته وأدواته)', 'تجربة 360 الغامرة', 'قائمة المراجع']
for i, n in enumerate(names): shots.append((f'1{i+1}_obj', f'الكائن {i+1}: {n}'))
shots += [('21_pano', 'داخل تجربة 360: شاطئ البحرين والنقاط السبع'), ('22_pano_q', 'سؤال إحدى نقاط تجربة 360 مع التغذية الراجعة'), ('23_activity', 'داخل النشاط الغامر: المرحلة الأولى ودور التلميذ والمعلم')]
for f, cap in shots:
    p = D.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(f'shots/{f}.png', width=Cm(16.5))
    para(cap, 11.5, True, 'center', '24205A', 14)
D.save('out_doc.docx'); print('ok')
