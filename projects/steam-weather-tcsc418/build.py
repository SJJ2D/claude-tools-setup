# -*- coding: utf-8 -*-
"""Builds the TCSC418 Assessment 3 report (STEAM integration map: Weather lesson) as DOCX."""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

FONT, SIZE = 'Arial', 13
D = Document()
sec = D.sections[0]
sec.orientation = WD_ORIENT.LANDSCAPE
sec.page_width, sec.page_height = Cm(29.7), Cm(21.0)
for m in ('left_margin', 'right_margin', 'top_margin', 'bottom_margin'):
    setattr(sec, m, Cm(2.54))
sec.header_distance = Cm(1.0); sec.footer_distance = Cm(1.0)
st = D.styles['Normal']
st.font.name = FONT; st.font.size = Pt(SIZE)
rpr = st.element.get_or_add_rPr()
rf = rpr.find(qn('w:rFonts'))
if rf is None:
    rf = OxmlElement('w:rFonts'); rpr.append(rf)
for a in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'):
    rf.set(qn(a), FONT)
szcs = OxmlElement('w:szCs'); szcs.set(qn('w:val'), str(SIZE * 2)); rpr.append(szcs)
st.paragraph_format.space_after = Pt(0); st.paragraph_format.line_spacing = 1.0

NAVY, RED = '1F3864', 'C00000'

def bidi(p):
    pPr = p._p.get_or_add_pPr(); b = OxmlElement('w:bidi'); b.set(qn('w:val'), '1'); pPr.append(b)

def run(p, text, bold=False, color=None, size=SIZE):
    r = p.add_run(text)
    rPr = r._r.get_or_add_rPr(); x = OxmlElement('w:rtl'); x.set(qn('w:val'), '1'); rPr.append(x)
    r.bold = bold; r.font.cs_bold = bold
    r.font.size = Pt(size); s = OxmlElement('w:szCs'); s.set(qn('w:val'), str(int(size * 2))); rPr.append(s)
    if color: r.font.color.rgb = RGBColor.from_string(color)
    return r

def rich(p, text, size=SIZE, color=None):
    """**bold** and __italic__ segments inside text."""
    for i, seg in enumerate(text.split('**')):
        for j, s2 in enumerate(seg.split('__')):
            if s2:
                r = run(p, s2, bold=(i % 2 == 1), size=size, color=color)
                if j % 2 == 1: r.italic = True; r.font.cs_italic = True

def para(text, bold=False, align='right', color=None, size=SIZE, after=4, before=0):
    p = D.add_paragraph(); bidi(p)
    p.alignment = {'right': WD_ALIGN_PARAGRAPH.RIGHT, 'center': WD_ALIGN_PARAGRAPH.CENTER, 'just': WD_ALIGN_PARAGRAPH.JUSTIFY}[align]
    p.paragraph_format.space_after = Pt(after); p.paragraph_format.space_before = Pt(before)
    if bold: run(p, text, True, color, size)
    else: rich(p, text, size, color)
    return p

def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr(); s = OxmlElement('w:shd')
    s.set(qn('w:val'), 'clear'); s.set(qn('w:color'), 'auto'); s.set(qn('w:fill'), fill); tcPr.append(s)

def cell_text(cell, text, bold=False, fill=None, center=False, color=None):
    cell.text = ''
    lines = text if isinstance(text, list) else [text]
    for i, line in enumerate(lines):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        bidi(p); p.alignment = WD_ALIGN_PARAGRAPH.CENTER if center else WD_ALIGN_PARAGRAPH.RIGHT
        p.paragraph_format.space_after = Pt(0)
        if bold: run(p, line, True, color)
        else: rich(p, line, color=color)
    if fill: shade(cell, fill)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

def table(cols, widths):
    t = D.add_table(rows=0, cols=cols); t.style = 'Table Grid'; t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = t._tbl.tblPr; bv = OxmlElement('w:bidiVisual'); tblPr.append(bv)
    t._widths = widths
    tw = OxmlElement('w:tblW'); tw.set(qn('w:w'), str(int(sum(widths) * 567))); tw.set(qn('w:type'), 'dxa')
    for e in tblPr.findall(qn('w:tblW')): tblPr.remove(e)
    tblPr.append(tw)
    lay = OxmlElement('w:tblLayout'); lay.set(qn('w:type'), 'fixed'); tblPr.append(lay)
    grid = t._tbl.tblGrid
    for gc, w in zip(grid.findall(qn('w:gridCol')), widths): gc.set(qn('w:w'), str(int(w * 567)))
    return t

def row(t, values, header=False, fill=None):
    cells = t.add_row().cells
    for c, v, w in zip(cells, values, t._widths):
        cell_text(c, v, bold=header, fill=('D9E2F3' if header else fill), center=header)
        c.width = Cm(w)
    trPr = t.rows[-1]._tr.get_or_add_trPr(); cs = OxmlElement('w:cantSplit'); cs.set(qn('w:val'), 'true'); trPr.append(cs)
    if header:
        h = OxmlElement('w:tblHeader'); h.set(qn('w:val'), 'true'); trPr.append(h)
    return cells

def merge_row(t, text, fill='FFF2CC', bold=True):
    cells = t.add_row().cells
    m = cells[0].merge(cells[-1]); cell_text(m, text, bold=bold, fill=fill, center=True)
    return m

def heading(text):
    return para(text, bold=True, color=NAVY, size=14, after=2, before=4)

def page_break():
    p = D.add_paragraph(); p.add_run().add_break(WD_BREAK.PAGE)

# ---------------------------------------------------------------- cover
for _ in range(2): para('')
para('جامعة البحرين – كلية البحرين للمعلمين', True, 'center', NAVY, 16, 6)
para('مقرر TCSC418', True, 'center', NAVY, 15, 18)
para('التقييم 3: مخطط تكاملي لـ STEAM', True, 'center', RED, 22, 6)
para('درس «الطقس» – العلوم، الصف الثالث الابتدائي', True, 'center', NAVY, 16, 30)
cov = table(2, [6, 10])
for k, v in [('اسم الطالب', 'سجاد مهدي عبدالله الصياد'), ('الرقم الجامعي', '202102571'), ('الشعبة', '1'),
             ('مدرس المقرر', 'د. شيماء'), ('السنة الدراسية', '2026–2027')]:
    c = row(cov, [k, v]); shade(c[0], 'D9E2F3'); c[0].paragraphs[0].runs[0].bold = True
page_break()

# ---------------------------------------------------------------- intro + lesson data
heading('المقدمة')
para('يتناول هذا التقرير درس «الطقس» من كتاب العلوم للصف الثالث في الفصل الدراسي الثاني، فأحلل محتواه ومهاراته واتجاهاته، '
     'ثم أقترح استقصاءين وثلاث مشكلات تصميمية، وأوضح فرص ربطه بالرياضيات واللغة العربية والفن ومهارات القرن الحادي والعشرين؛ '
     'ليصبح الدرس مدخلًا لتعلم متكامل وفق نهج STEAM.', align='just', after=6)

t = table(5, [5.2, 3.6, 3.6, 7.4, 4.8])
row(t, ['عنوان الدرس المختار', 'الصف الدراسي', 'الفصل الدراسي', 'عنوان الوحدة', 'صفحات الكتاب'], header=True)
row(t, ['الدرس الأول: الطقس', 'الثالث الابتدائي', 'الثاني', 'الوحدة الرابعة: الطقس والفضاء (الفصل السابع: الطقس وحركة الأرض والقمر)',
        'ص 12–19 (وافتتاحية الفصل ص 10–11)'])

heading('أولًا: تحليل محتوى مادة العلوم')
t = table(4, [8.2, 5.6, 5.0, 5.8])
row(t, ['المحتوى', 'المهارات', 'الاتجاهات', 'فرص الربط الرأسي (داخل مادة العلوم)'], header=True)
row(t, [
    ['• الهواء يحيط بنا، وهو جزء من الغلاف الجوي الذي تحدث فيه ظواهر الطقس (ص 13–14).',
     '• **الطقس**: حالة الجو في مكان معيّن خلال يوم أو عدة أيام (ص 14).',
     '• عناصر الطقس: درجة الحرارة وتغيرها بين الليل والنهار، والهطل، والرياح، والضغط الجوي (ص 14–15).',
     '• أدواته: الترمومتر، ومقياس المطر، والسهم الدوّار، والأنيمومتر، والبارومتر (ص 14–15).',
     '• الغيوم وأنواعها (الركامية، الريشية، الطبقية) والضباب (ص 16–17).',
     '• تكوّن الغيوم بالتبخر والتكثف، ودورة الماء (ص 17–18).'],
    ['• التوقع والتجريب والملاحظة والاستنتاج (أستكشف ص 13).',
     '• القياس بأدوات الطقس وتسجيل البيانات (ص 14، 19).',
     '• المقارنة (الغيمة والضباب ص 17، التبخر والتكثف ص 19).',
     '• عمل النماذج (ص 17) وقراءة الشكل (ص 18).',
     '• التفكير الناقد والتواصل الكتابي (ص 15، 17، 19).'],
    ['• حب الاستطلاع وتفسير الظواهر الجوية.',
     '• تقدير عظمة الخالق (الآية ص 10).',
     '• الاهتمام بالنشرة الجوية (ص 19).',
     '• الدقة والأمانة في القياس والتسجيل.',
     '• المحافظة على الماء بعد فهم دورته.'],
    ['• «الشمس والأرض» (ص 20): تعاقب الليل والنهار يفسّر تغير الحرارة (ص 14).',
     '• «المواد الصلبة والسائلة والغازية» (ص 60–66): بخار الماء غاز.',
     '• «التغيرات الفيزيائية» (ص 72–79): التبخر والتكثف تغيّر في حالة الماء.',
     '• «أعمل كالعلماء» (ص 29) لتعزيز الملاحظة والتسجيل.']])
para('**نشاط الاستقصاء المقترح:** الاستقصاء (1) «هل تُسخّن الشمس الهواء وتُبخّر الماء؟» بنشاطين (1أ، 1ب) ويرتبط بالرياضيات والعربية، '
     'والاستقصاء (2) «هل يؤثر لون السطح في ارتفاع حرارته؟» ويرتبط بالفن والرياضيات.',
     align='just', before=4, after=2)

# ---------------------------------------------------------------- inquiries
heading('ثانيًا: الأنشطة الاستقصائية')
para('ثلاثة أنشطة في استقصاءين بمستويين وفق هيرون (Herron, 1971): الاستقصاء (1) هيكلي يقدّم فيه المعلم السؤال والخطوات، والاستقصاء (2) موجّه يخطط فيه التلاميذ طريقة الاختبار بتوجيه المعلم.', align='just', after=4)
t = table(4, [3.6, 7.2, 7.2, 6.6])
row(t, ['البند', 'الاستقصاء (1) – النشاط 1أ', 'الاستقصاء (1) – النشاط 1ب', 'الاستقصاء (2)'], header=True)
row(t, ['سؤال الاستقصاء',
        'هل تختلف قراءة الترمومتر في مكان مشمس عنها في مكان مظلل في ساحة المدرسة؟',
        'هل تؤثر أشعة الشمس في سرعة تبخر الماء؟',
        'هل يؤثر لون السطح في مقدار ارتفاع حرارته عندما يتعرض لأشعة الشمس؟'], fill='F2F2F2')
row(t, ['المتغير المستقل', 'مكان القياس (مشمس / مظلل).', 'تعرّض كوب الماء للشمس (في الشمس / في الظل).',
        'لون الورق المقوّى (أبيض، أصفر، أحمر، أزرق، أسود).'])
row(t, ['المتغير التابع', 'قراءة الترمومتر بالدرجات السيليزية.', 'كمية الماء المتبقية بالمليلتر بعد ثلاثة أيام.',
        'قراءة الترمومتر تحت كل ورقة بعد 15 دقيقة.'])
row(t, ['متغيرات ثابتة', 'نوع الترمومتر، والارتفاع، ومدة الانتظار، ووقت القراءة.',
        'كوبان متماثلان، وكمية الماء (200 مل)، والمدة.',
        'نوع الورق وحجمه، والترمومتر، والمكان، والمدة.'])
row(t, ['الخطوات المختصرة',
        ['1. يكتب التلميذ توقعه.', '2. تضع المجموعة ترمومترًا في الشمس وآخر في الظل على الارتفاع نفسه.', '3. تقرأهما بعد 5 دقائق في الساعة 8 و10 و12 وتسجل القراءات.', '4. تمثّلها بالأعمدة وتقارن.'],
        ['1. يكتب التلميذ توقعه.', '2. يقيس 200 مل لكل كوب بالمخبار المدرج، ويضع كوبًا في الشمس وآخر في الظل.', '3. يقيس الماء المتبقي يوميًا ويحسب المتبخر بالطرح.', '4. يمثّل النتائج بالأعمدة.'],
        ['1. يصنّف التلاميذ الألوان إلى حارة وباردة ويتوقعون أيّها يسخن أكثر.', '2. تخطط المجموعة اختبارًا عادلًا: ترمومتر داخل جيب من كل لون.', '3. تضع الجيوب في الشمس 15 دقيقة وتقرأ الترمومترات.', '4. ترتّب الألوان في شريط متدرج حسب الحرارة.']])
row(t, ['الاستنتاج',
        'القراءة في الشمس أعلى وتزداد قرب الظهيرة؛ فالشمس تسخّن الأشياء والهواء. ولذلك تُقاس حرارة الهواء في الظل، وهذا أساس صندوق الترمومتر في المشكلة (2).',
        'يتبخر الماء في الشمس أسرع؛ لأن طاقتها تحوّل الماء إلى بخار، وهي بداية دورة الماء وتكوّن الغيوم (ص 17–18)، وتقود إلى المشكلة (3).',
        'الألوان الغامقة تسخن أكثر من الفاتحة لأنها تمتص أشعة أكثر، و«الحار والبارد» في الفن تصنيف بصري لا حرارة فعلية. وتُوظَّف النتيجة في لون المظلة بالمشكلة (1).'], fill='E2EFDA')
row(t, ['المواد المرتبطة',
        '**الرياضيات:** قراءة الساعة (ص 106)، والتمثيل بالأعمدة (ص 149–154). **العربية:** ربط السبب بالنتيجة (ص 63).',
        '**الرياضيات:** السعة بالمليلتر (ص 91)، والطرح، والأعمدة. **العربية:** وصف النتائج كتابةً.',
        '**الفن:** الألوان الحارة والباردة والتدرج (ص 33). **الرياضيات:** مقارنة الأعداد وترتيبها.'])

# ---------------------------------------------------------------- design problems + horizontal links
heading('ثالثًا: مشكلات التصميم والربط الأفقي عبر التخصصات')
para('تُحل كل مشكلة بمراحل التفكير التصميمي: التعاطف، والتحديد «كيف يمكننا أن…؟»، وتوليد الأفكار، والنمذجة، والاختبار والتأمل (Razzouk & Shute, 2012). '
     'الصفحات من كتب الصف الثالث: «براعم العربية ج2»، و«الرياضيات ف2»، و«التربية الفنية».', align='just', after=4)
t = table(6, [2.0, 8.9, 3.6, 4.2, 3.4, 2.5])
row(t, ['رقم النشاط', 'نص مشكلة التصميم والتصميم المتوقع', 'الفن', 'اللغة العربية', 'الرياضيات', 'مهارات القرن 21'], header=True)
row(t, ['(2)',
        ['**المشكلة (1):** في الفسحة يتزاحم التلاميذ في زاوية ظل صغيرة هربًا من الشمس، والمدرسة تريد مظلة قليلة التكلفة. **كيف يمكننا أن** نصمم مظلة تحمي أكبر عدد منهم وتبقي المكان أبرد؟',
         '**التصميم:** نموذج مظلة من مواد معاد تدويرها، يُختار لونها من نتائج الاستقصاء (2)، وتُحسب مساحة ظلها، ثم تُختبر بترمومتر وتُحسّن.'],
        'اختيار اللون بالدليل، وزخرفة الأطراف (ص 13، 33).',
        'مقابلة الزملاء، ورسالة للمدير بأسلوب «يجب عليكم…» (ص 64).',
        'المساحة (ص 84)، والمحيط (ص 79).',
        'التعاون، والإبداع.'])
row(t, ['(1أ)',
        ['**المشكلة (2):** تقدّم الإذاعة المدرسية فقرة يومية عن الطقس دون قياس حقيقي، ولا توجد أدوات طقس في المدرسة. **كيف يمكننا أن** نبني محطة طقس بسيطة لنشرة دقيقة؟',
         '**التصميم:** محطة من مواد معاد تدويرها: صندوق مظلل للترمومتر (من النشاط 1أ)، ومقياس مطر من قارورة مدرّجة، وسهم دوّار متماثل.'],
        'طباعة رموز الطقس بالاستنسل للوحة النشرة (ص 89).',
        'نشرة في حدود 40 كلمة للطابور الصباحي كنشاط «أتوسع» (ص 65)، والتدوير في «معًا نحفظ بيئتنا 2» (ص 66–75).',
        'السنتيمتر (ص 73)، والتماثل (ص 126)، والساعة (ص 106).',
        'التواصل، والثقافة التكنولوجية.'])
row(t, ['(1ب)',
        ['**المشكلة (3):** يجف ماء الري بسرعة في حوض زرعه التلاميذ في الحديقة، والمدرسة تريد توفير الماء. **كيف يمكننا أن** نقلل تبخر الماء من التربة؟',
         '**التصميم:** غطاء للتربة أو مظلة للحوض أو قارورة ري بالتنقيط، يُختبر بكوبَي تربة متماثلين وقياس الماء المتبقي ثم يُحسّن.'],
        'ملصق بالكولاج لحملة توفير الماء (ص 111).',
        'اقتراح حل لا يضر البيئة، وكتابة نصيحة (س15، 16 ص 64).',
        'السعة (ص 91)، والطرح، والتمثيل بالرموز (ص 139).',
        'التفكير الناقد وحل المشكلات.'])

# ---------------------------------------------------------------- 21st century skills
heading('رابعًا: فرص الربط بمهارات القرن الحادي والعشرين')
para('اعتمدت مهارات إطار P21 (Partnership for 21st Century Learning, 2019)، مع التركيز على التكنولوجيا:', after=3)
t = table(2, [5.0, 19.6])
row(t, ['المهارة', 'النشاط الذي يعكسها في الدرس'], header=True)
for k, v in [
    ('التفكير الناقد وحل المشكلات', 'تفسير ارتفاع القراءة في الشمس، واختيار أفضل تصميم بالبيانات لا بالرأي مع ذكر مزاياه وعيوبه.'),
    ('التعاون', 'مجموعات بأدوار (قارئ الترمومتر، والمسجّل، والموقّت، والمقدّم) في الاستقصاءين والمحطة.'),
    ('التواصل', 'تقديم نشرة الطقس في الإذاعة، وعرض التصميم وتبرير قراراته.'),
    ('الإبداع والابتكار', 'توليد أفكار متعددة للمظلة والمحطة وغطاء التربة بمواد معاد تدويرها، وتحسينها بعد الاختبار.'),
    ('الثقافة التكنولوجية والرقمية', 'تصوير السماء يوميًا بالجهاز اللوحي وتصنيف الغيوم (ص 16)، وإدخال القراءات في Excel لإنشاء الأعمدة، ومقارنة قراءات المحطة بنشرة الأرصاد الجوية (bahrainweather.gov.bh)، وتسجيل النشرة بالفيديو.')]:
    c = row(t, [k, v]); shade(c[0], 'F2F2F2')

heading('الخاتمة')
para('أظهر التحليل أن درس الطقس غني بفرص التكامل؛ فالقياس وتمثيل البيانات يربطانه بالرياضيات، ونشرة الطقس تربطه بالعربية، واختيار الألوان والتصميم يربطانه بالفن. '
     'وأرى أن تقديمه من خلال مشكلات حقيقية في المدرسة يجعل التلميذ يستخدم العلم لحل ما يعيشه، لا لحفظ المعلومات فقط.', align='just')

# ---------------------------------------------------------------- references
page_break()
heading('المراجع')
refs = [
    'وزارة التربية والتعليم. (2013). __العلوم: الصف الثالث – الجزء الثاني__ (ط. 2). مملكة البحرين.',
    'وزارة التربية والتعليم. (2023أ). __براعم العربية: الصف الثالث – الجزء الثاني__. مملكة البحرين.',
    'وزارة التربية والتعليم. (2023ب). __التربية الفنية: الصف الثالث__ (كتاب الطالب). مملكة البحرين.',
    'وزارة التربية والتعليم. (2026). __الرياضيات: الصف الثالث – الفصل الدراسي الثاني__ (ط. 4). مملكة البحرين.',
]
for r_ in refs:
    p = para(r_, after=6); p.paragraph_format.left_indent = Cm(0); p.paragraph_format.first_line_indent = Cm(-1.27); p.paragraph_format.right_indent = Cm(1.27)
eng = [
    ('Herron, M. D. (1971). The nature of scientific enquiry. ', 'The School Review, 79', '(2), 171–212. https://doi.org/10.1086/442968'),
    ('Partnership for 21st Century Learning. (2019). ', 'Framework for 21st century learning definitions', '. Battelle for Kids. https://static.battelleforkids.org/documents/p21/P21_Framework_DefinitionsBFK.pdf'),
    ('Razzouk, R., & Shute, V. (2012). What is design thinking and why is it important? ', 'Review of Educational Research, 82', '(3), 330–348. https://doi.org/10.3102/0034654312457429'),
]
for a, it, b in eng:
    p = D.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.left_indent = Cm(1.27); p.paragraph_format.first_line_indent = Cm(-1.27); p.paragraph_format.space_after = Pt(6)
    r1 = p.add_run(a); r2 = p.add_run(it); r2.italic = True; p.add_run(b)

# ---------------------------------------------------------------- rubric image
page_break()
heading('معايير التقييم')
p = D.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.add_run().add_picture('/home/user/work/steam/out/rubric.png', height=Cm(14.5))

D.save('/home/user/work/steam/out/STEAM_Weather_202102571.docx')
print('saved')
