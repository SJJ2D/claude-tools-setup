# -*- coding: utf-8 -*-
"""Simplified 5-slide version: same content, shorter phrases, larger type."""
from base import frame, E

def ic(name, size=44):
    return f'<img src="{E}{name}.svg" style="width:{size}px;height:{size}px;flex:none">'

CSS6 = r"""
.c6{background:var(--pearl);border-radius:28px;box-shadow:0 10px 26px rgba(14,58,91,.11);border:3px solid #fff;padding:18px 26px;display:flex;flex-direction:column;gap:8px}
.c6 h3{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:34px;line-height:1.15;margin:0;color:var(--navy);display:flex;align-items:center;gap:12px}
.c6 p,.c6 li{font-size:26px;line-height:1.5;color:var(--body);margin:0}
.c6 ul{margin:0;padding:0 28px 0 0}
.c6 li{margin:0 0 4px 0}
.c6 li::marker{color:var(--teal)}
.sub{font-weight:800;color:var(--coral);font-size:25px!important;margin-top:2px!important}
.pl{display:inline-block;padding:5px 20px;border-radius:999px;font-weight:800;font-size:25px;color:#fff;background:var(--teal);white-space:nowrap}
.ot{display:flex;align-items:center;gap:14px;border-radius:20px;padding:11px 18px;flex:1}
.ot b{font-family:'Baloo Bhaijaan 2';font-size:28px;color:var(--navy);flex:none;width:118px}
.ot p{font-size:26px;line-height:1.35;margin:0;color:var(--body)}
.tl{display:flex;align-items:center;gap:14px;background:#fff;border-radius:18px;padding:8px 16px;box-shadow:0 4px 10px rgba(14,58,91,.07);flex:1}
.tl p{font-size:25px;line-height:1.3;margin:0;color:var(--ink);font-weight:700}
table.t6{width:100%;flex:1;border-collapse:separate;border-spacing:0;background:var(--pearl);border-radius:24px;overflow:hidden;box-shadow:0 10px 26px rgba(14,58,91,.11)}
table.t6 th{background:var(--navy);color:#fff;font-size:28px;font-weight:800;padding:12px 22px;text-align:right}
table.t6 th img{vertical-align:middle}
table.t6 td{font-size:30px;line-height:1.35;color:var(--body);padding:10px 22px;border-top:2px solid #EAF2F3;vertical-align:middle}
table.t6 tr:nth-child(odd) td{background:#F5FBFB}
table.t6 td:first-child{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:29px;color:var(--navy);white-space:nowrap}
table.t6 td:first-child span{font-family:'Tajawal';font-size:23px;font-weight:800;color:#fff;background:var(--coral);border-radius:999px;padding:2px 14px;margin-inline-start:10px}
.stc{flex:1;display:flex;align-items:center;gap:14px;border-radius:22px;padding:12px 18px;color:#fff}
.stc p{margin:0;font-size:24px;line-height:1.3;font-weight:700}
.stc b{font-family:'Baloo Bhaijaan 2';font-size:31px;display:block;line-height:1.15}
.lab{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:30px;color:var(--navy);margin:0;display:flex;align-items:center;gap:12px}
.mini{flex:1;background:#FFFDF7;border:3px dashed #9ADDE2;border-radius:20px;padding:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center}
.mini img{width:60px;height:60px}
.mini p{margin:0;font-size:24px;font-weight:800;color:var(--navy);line-height:1.25}
.refs{font-size:17px;line-height:1.35;color:var(--muted);border-top:2px dashed #CFE9EC;padding-top:6px;margin:0}
"""

# 2: title, goal, importance, age, outcomes
def s2():
    outs = [('running_shoe', 'حركياً', '#DDF5F6', 'يتوازن على قدم واحدة 5 ثوانٍ، ويمشي جانبياً، ويقفز ويهبط بأمان.'),
            ('handshake', 'اجتماعياً', '#FFF1CC', 'يتعاون مع فريقه، وينتظر دوره، ويشجّع زملاءه.'),
            ('relieved_face', 'نفسياً', '#FDE3EE', 'يعبّر عن مشاعره، ويهدّئ نفسه بالتنفس العميق.'),
            ('brain', 'معرفياً', '#E7E4FD', 'يعدّ اللآلئ ويجمعها، ويعرف: النوخذة، والغيص، والهيرات.'),
            ('potable_water', 'صحياً', '#DDF3EA', 'يذكر فائدة للحركة اليومية، ويشرب الماء.')]
    rows = ''.join(f'<div class="ot" style="background:{c}">{ic(i,46)}<b>{d}</b><p>{t}</p></div>' for i, d, c, t in outs)
    inner = f"""<div class="row" style="height:100%;gap:24px">
<div style="flex:1;display:flex;flex-direction:column;gap:14px">
  <div class="c6" style="background:linear-gradient(90deg,#FFF6DA,#FFFDF7);"><h3>{ic('bullseye')} العنوان والهدف</h3>
    <p><b class="k">«الغوّاص الصغير: رحلة البحث عن اللؤلؤ»:</b> نشاط تعاوني بالمحطات ولعب الأدوار؛ المعلم «النوخذة» والطلبة «غوّاصون».</p>
    <p><b class="k">الهدف:</b> تحقيق الصحة الجسدية للطلبة من خلال الحركة: تقوية العضلات والعظام، وتحسين التوازن والتآزر واللياقة، وبناء عادة النشاط اليومي.</p></div>
  <div class="c6"><h3>{ic('red_heart')} الأهمية الصحية</h3>
    <ul><li>24 دقيقة حركة من 60 دقيقة يومياً (منظمة الصحة العالمية، 2020).</li>
    <li>عادات صحية: الإحماء، والتهدئة، والتنفس العميق، وشرب الماء.</li></ul></div>
  <div class="c6" style="flex:1"><h3>{ic('books')} الأهمية التربوية</h3>
    <ul><li>الحركة تعزّز التركيز (يوسف، 2026).</li>
    <li>التعلّم بالحركة: العدّ والجمع ومفردات التراث.</li>
    <li>التعاون وانتظار الدور، وتعزيز الهوية الوطنية.</li></ul></div>
</div>
<div class="c6" style="flex:1;gap:12px"><h3>{ic('student')} الفئة العمرية</h3>
  <div style="display:flex;gap:10px;flex-wrap:wrap"><span class="pl">الصف الثاني (7–8 سنوات)</span><span class="pl" style="background:var(--coral)">24 طالباً في 4 سفن</span><span class="pl" style="background:var(--violet)">40 دقيقة</span></div>
  <p class="lab" style="margin-top:6px">{ic('check_mark_button',38)} مخرجات التعلّم: يكون الطالب قادراً على أن</p>
  {rows}
</div></div>"""
    return frame(2, 'العنوان والهدف والأهمية • الفئة العمرية والمخرجات', 'فكرة النشاط <span>وأهدافه</span>', 'oyster', inner)

# 3: tools + safety
def s3():
    tools = [('straight_ruler', 'شريط ملوّن و12 دائرة موجة'), ('triangular_flag', '8 أقماع للمسارات'),
             ('white_circle', '40 لؤلؤة مرقّمة و4 صناديق كنز'), ('spiral_shell', '6 أصداف و6 علامات «قاع البحر»'),
             ('drum', 'طبل لإشارة التوقف'), ('speaker_high_volume', 'مكبّر صوت: الأهازيج وصوت الموج'),
             ('memo', 'بطاقات مصوّرة وحبل «عقد اللؤلؤ»'), ('television', 'شاشة ذكية وساعة توقيت'),
             ('potable_water', 'ماء وحقيبة إسعافات')]
    tt = ''.join(f'<div class="tl">{ic(i,42)}<p>{t}</p></div>' for i, t in tools)
    inner = f"""<div class="row" style="height:100%;gap:22px">
<div class="c6" style="width:540px;flex:none;gap:9px"><h3>{ic('package')} الأدوات</h3>{tt}</div>
<div style="flex:1;display:flex;flex-direction:column;gap:14px">
  <div class="c6"><h3>{ic('school')} السلامة داخل الصف</h3>
    <ul><li>مسافة ذراعين بين الطلبة، وطاولات مُزاحة، ودوائر ملصقة لا تنزلق.</li>
    <li>أحذية رياضية، و«نمشي ولا نركض»، و«هبوط القطة» بركبتين مثنيّتين.</li>
    <li>إشارة التوقف: <b class="k">ضربتان على الطبل + يد مرفوعة = تجمّد</b>.</li>
    <li>المتعب يستريح في «الميناء»، ومراجعة السجل الصحي (Marotz, 2015).</li></ul></div>
  <div class="row" style="gap:14px;flex:1">
  <div class="c6" style="flex:1"><h3>{ic('sun_with_face')} خارج الصف</h3>
    <ul><li>صباحاً وفي الظل (نوفمبر–مارس).</li>
    <li>ماء كل 10–15 دقيقة، وفحص الأرضية.</li>
    <li>إشراف مستمر وحقيبة إسعافات.</li>
    <li>عند الحرارة أو الغبار: البديل الصفي.</li></ul></div>
  <div class="c6" style="flex:1"><h3>{ic('laptop')} الوسائط الرقمية</h3>
    <p class="sub">في الصف (شاشة المعلم)</p>
    <ul><li>محتوى المدرسة بلا إعلانات.</li>
    <li>لا تصوير دون موافقة خطية (قانون 30 لسنة 2018).</li>
    <li>10 دقائق شاشة كحدّ أقصى، وأسلاك مثبّتة.</li></ul>
    <p class="sub">في البيت (التحدي الأسبوعي)</p>
    <ul><li>بطاقة ورقية بإشراف وليّ الأمر.</li></ul></div>
  </div>
</div></div>"""
    return frame(3, 'الأدوات وإجراءات السلامة', 'الأدوات <span>والسلامة</span>', 'shield', inner)

# 4: steps with teacher / student roles
def s4():
    rows = [('1. التهيئة', '6 د', 'يعرض الفيديو ويؤدي الحركات أمامهم', 'يشاهدون ويقلّدون، ثم يتجهون إلى محطاتهم'),
            ('2. الإحماء', '4 د', 'يقود إحماء «موج البحر» مع الأهازيج', 'يقلّدون الحركات بمسافة ذراعين'),
            ('3. المحطات', '16 د', 'يشغّل صوت الموج للانتقال، ويتابع الفرق', 'يؤدّون حركة المحطة ويعدّون، ثم ينتقلون مشياً'),
            ('4. قفزة الدلفين', '6 د', 'يدير تتابعاً تعاونياً: هدف الصف 40 لؤلؤة', 'يقفزون في الدوائر ويجمعون اللآلئ لسفينتهم'),
            ('5. التهدئة', '4 د', 'يقود الاستطالة والتنفس العميق', 'يتنفّسون ببطء ويشربون الماء'),
            ('6. الختام', '4 د', 'يطرح سؤالي التأمل ويعلّق «عقد الصف»', 'يرفعون بطاقات المشاعر ويذكرون فائدة للحركة')]
    tr = ''.join(f'<tr><td style="width:22%">{a}<span>{m}</span></td><td style="width:39%">{b}</td><td style="width:39%">{c}</td></tr>' for a, m, b, c in rows)
    st = [('man_rowing_boat', '#0F9FB2', 'التجديف', '10 للأمام و10 للخلف'),
          ('diving_mask', '#6C5CE7', 'الغطس', 'ثني الركبتين ولمس القاع ×8'),
          ('crab', '#F2683F', 'مشية السلطعون', 'مشي جانبي 3 أمتار'),
          ('flamingo', '#F06A9B', 'توازن الفلامنجو', 'قدم واحدة حتى العدّ 5')]
    sc = ''.join(f'<div class="stc" style="background:{c}">{ic(i,64)}<p><b>{n}</b>{d}</p></div>' for i, c, n, d in st)
    inner = f"""<div style="display:flex;flex-direction:column;gap:12px;height:100%">
<p class="lab">{ic('sailboat',38)} المحطات الأربع <span class="pl" style="background:var(--coral)">4 دقائق لكل محطة</span></p>
<div class="row" style="gap:12px">{sc}</div>
<table class="t6"><tr><th>المرحلة والزمن</th><th>{ic('teacher',34)} دور المعلم «النوخذة»</th><th>{ic('child',34)} دور الطلبة «الغوّاصون»</th></tr>{tr}</table>
</div>"""
    return frame(4, 'خطوات التنفيذ ودور المعلم والطلبة (40 دقيقة)', 'المحطات <span>وخطوات التنفيذ</span>', 'stopwatch', inner)

# 5: development + attachments + references
def s5():
    cards = ''.join(f'<div class="mini" style="border-color:{c}88"><img src="{E}{i}.svg"><p style="color:{c}">{n}</p></div>'
                    for i, c, n in [('man_rowing_boat', '#0F9FB2', 'بطاقة التجديف'), ('diving_mask', '#6C5CE7', 'بطاقة الغطس'),
                                    ('crab', '#F2683F', 'بطاقة السلطعون'), ('flamingo', '#F06A9B', 'بطاقة الفلامنجو')])
    more = ''.join(f'<div class="tl" style="padding:4px 16px">{ic(i,40)}<p>{t}</p></div>' for i, t in [('house', 'بطاقة التحدّي الأسبوعي'),
        ('relieved_face', 'بطاقات المشاعر'), ('megaphone', 'ملصق القواعد ومخطط الصف'), ('check_mark_button', 'قائمة الرصد')])
    inner = f"""<div style="display:flex;flex-direction:column;gap:14px;height:100%">
<div class="row" style="gap:14px">
  <div class="c6" style="flex:1"><h3>{ic('desert_island')} التطوير: الساحة</h3>
    <ul><li>«بحر الساحة الكبير»: خريطة بالطباشير بجزر و«هيرات».</li>
    <li>مسافات أطول، وقفز فوق حبل على الأرض.</li></ul></div>
  <div class="c6" style="flex:1"><h3>{ic('mobile_phone')} التطوير: رقمياً</h3>
    <ul><li>في الصف: المعلم يشغّل الفيديو على الشاشة الذكية.</li>
    <li>في البيت: بطاقة ورقية مع الأسرة.</li></ul></div>
  <div class="c6" style="flex:1"><h3>{ic('manual_wheelchair')} الدمج والتقويم</h3>
    <ul><li>نسخة جلوس ومستويات ورفيق مساند.</li>
    <li>قائمة رصد، وبطاقات المشاعر، وسؤال خروج.</li></ul></div>
</div>
<div class="c6" style="flex:1;gap:10px"><h3>{ic('clipboard')} المرفقات والمواد الداعمة</h3>
  <div class="row" style="gap:16px;flex:1">
    <div style="flex:1.3;display:flex;gap:10px">{cards}</div>
    <div style="width:240px;flex:none;display:flex;flex-direction:column;justify-content:center;gap:6px"><img src="img/sb/01.jpg" style="width:100%;border-radius:14px;border:3px solid #fff;box-shadow:0 6px 14px rgba(14,58,91,.15)"><p style="text-align:center;font-weight:800;color:var(--navy);font-size:22px">فيديو توضيحي (3:10)</p></div>
    <div style="flex:1;display:flex;flex-direction:column;gap:6px">{more}</div>
  </div>
  <p class="refs"><b>المراجع:</b> يوسف، منى إبراهيم. (2026). <i>الأسبوع الثامن: دمج النشاط البدني واللعب في العملية التعليمية اليومية</i> [شرائح]. TCHL418، كلية البحرين للمعلمين. <br><span dir="ltr">Marotz, L. R. (2015). <i>Health, safety, and nutrition for the young child</i> (9th ed.). Cengage.</span> <br><span dir="ltr">World Health Organization. (2020). <i>WHO guidelines on physical activity and sedentary behaviour</i>.</span></p>
</div>
</div>"""
    return frame(5, 'الإضافة التطويرية والمرفقات', 'التطوير <span>والمرفقات</span>', 'rocket', inner)

ALL = [s2, s3, s4, s5]
