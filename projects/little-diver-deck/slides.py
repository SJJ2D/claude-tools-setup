# -*- coding: utf-8 -*-
from base import frame, E

def ic(name, size=54):
    return f'<img src="{E}{name}.svg" style="width:{size}px;height:{size}px">'

EXTRA_CSS = r"""
.tile{background:var(--pearl);border-radius:28px;box-shadow:0 10px 26px rgba(14,58,91,.10);border:3px solid #fff;padding:22px 26px;display:flex;gap:18px;align-items:center}
.tile .ico{flex:none;width:84px;height:84px;border-radius:24px;display:flex;align-items:center;justify-content:center}
.tile .ico img{width:58px;height:58px}
.tile .lb{font-size:24px;font-weight:800;color:var(--muted);margin:0}
.tile .vl{font-size:28px;font-weight:700;color:var(--ink);margin:2px 0 0 0;line-height:1.4}
.c-teal{background:#DDF5F6}.c-coral{background:#FFE6DC}.c-sun{background:#FFF1CC}.c-pink{background:#FDE3EE}.c-violet{background:#E7E4FD}.c-green{background:#DDF3EA}.c-sky{background:#DDEFFC}
.strip{height:12px;border-radius:999px;position:absolute;top:0;right:36px;left:36px}
.num{font-family:'Baloo Bhaijaan 2';font-weight:800}
.ship{display:inline-flex;align-items:center;gap:10px;padding:8px 20px;border-radius:999px;font-weight:800;font-size:26px;background:#fff;border:3px solid var(--aqua);color:var(--navy)}
.ship img{width:34px;height:34px}
.out{display:flex;gap:20px;align-items:center;border-radius:26px;padding:16px 24px;background:var(--pearl);box-shadow:0 8px 22px rgba(14,58,91,.09);border:3px solid #fff}
.out .dom{flex:none;width:170px;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:28px;color:var(--navy)}
.out .dom img{width:52px;height:52px}
.out p{font-size:26px;line-height:1.5;color:var(--body);margin:0}
.tool{background:var(--pearl);border-radius:28px;box-shadow:0 10px 26px rgba(14,58,91,.10);border:3px solid #fff;padding:20px 22px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px}
.tool .tw{width:96px;height:96px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.tool .tw img{width:64px;height:64px}
.tool h4{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:29px;margin:4px 0 0 0;color:var(--navy);line-height:1.15}
.tool p{font-size:24px;line-height:1.4;color:var(--body);margin:0}
.col h3{font-size:36px}
.col li{font-size:25px;line-height:1.55}
.rule{display:flex;align-items:center;gap:18px;background:#fff;border-radius:24px;padding:14px 22px;box-shadow:0 6px 16px rgba(14,58,91,.08)}
.rule .n{flex:none;width:58px;height:58px;border-radius:50%;background:var(--sun);display:flex;align-items:center;justify-content:center;font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:30px;color:var(--navy)}
.rule p{font-size:27px;line-height:1.4;margin:0;color:var(--ink);font-weight:700}
.rule img{width:52px;height:52px;flex:none}
.ph{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;flex:1}
.ph .dot{width:150px;height:150px;border-radius:50%;background:#fff;box-shadow:0 10px 24px rgba(14,58,91,.14);display:flex;align-items:center;justify-content:center;position:relative;border:6px solid var(--aqua)}
.ph .dot img{width:84px;height:84px}
.ph .min{position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);background:var(--coral);color:#fff;font-weight:800;font-size:24px;padding:2px 16px;border-radius:999px;white-space:nowrap}
.ph h4{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:31px;color:var(--navy);margin:20px 0 0 0;line-height:1.15}
.ph p{font-size:24px;line-height:1.45;color:var(--body);margin:0}
.st{background:var(--pearl);border-radius:30px;box-shadow:0 12px 28px rgba(14,58,91,.12);border:3px solid #fff;overflow:hidden;display:flex;flex-direction:column}
.st .top{padding:20px 24px 14px;display:flex;align-items:center;gap:14px}
.st .top img{width:80px;height:80px}
.st .top h4{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:34px;line-height:1.1;color:#fff;margin:0}
.st .top .sn{font-size:24px;font-weight:800;color:rgba(255,255,255,.9);margin:0}
.st .bd{padding:18px 24px 22px;display:flex;flex-direction:column;gap:10px}
.st .bd p{font-size:25px;line-height:1.5;color:var(--body);margin:0}
.st .bd .sk{display:inline-block;align-self:flex-start;font-size:23px;font-weight:800;padding:4px 16px;border-radius:999px;background:#EAF7F7;color:var(--teal)}
table.lv{width:100%;border-collapse:separate;border-spacing:0;background:var(--pearl);border-radius:26px;overflow:hidden;box-shadow:0 12px 28px rgba(14,58,91,.12)}
table.lv th{font-size:26px;font-weight:800;padding:14px 18px;text-align:right;color:#fff}
table.lv td{font-size:24px;line-height:1.45;color:var(--body);padding:12px 18px;border-top:2px solid #EAF2F3;vertical-align:top}
table.lv td:first-child{font-weight:800;color:var(--navy);white-space:nowrap}
.pcard{background:#FFFDF7;border-radius:34px;border:5px dashed #9ADDE2;padding:18px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;position:relative}
.pcard .pic{width:100%;height:170px;border-radius:24px;display:flex;align-items:center;justify-content:center}
.pcard .pic img{height:136px}
.pcard h4{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:36px;margin:2px 0 0 0;line-height:1.1}
.pcard .how{font-size:24px;line-height:1.45;color:var(--ink);margin:0;font-weight:700}
.pcard .cnt{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:28px;color:#fff;padding:2px 22px;border-radius:999px}
.pcard .safe{font-size:23px;line-height:1.4;color:#8A3B1E;background:#FFE9DF;border-radius:16px;padding:8px 14px;margin:0;font-weight:700}
.pearl{border-radius:50%;background:radial-gradient(circle at 34% 30%,#FFFFFF 0 22%,#F6F0E2 55%,#DCCFB4 100%);box-shadow:0 4px 10px rgba(14,58,91,.18);display:flex;align-items:center;justify-content:center;font-family:'Baloo Bhaijaan 2';font-weight:800;color:var(--navy)}
"""

# ---------------------------------------------------------------- 2 overview
def s_overview():
    tiles = [
        ('student', 'c-teal', 'الفئة المستهدفة', 'الصف الثاني الابتدائي <span style="white-space:nowrap">(7–8 سنوات)</span>، ويُكيَّف للأول والثالث'),
        ('stopwatch', 'c-coral', 'مدة التنفيذ', '40 دقيقة، مع تجهيز الصف ولصق المسارات قبل الحصة'),
        ('sailboat', 'c-sky', 'عدد الطلبة', '24 طالباً في 4 «سفن» (6 لكل سفينة)، و7–8 إذا بلغ الصف 28–30'),
        ('school', 'c-sun', 'مكان التنفيذ', 'الصف، والساحة الخارجية، ونسخة رقمية'),
        ('puzzle_piece', 'c-violet', 'مواجهة العقبات', 'مساحة معاد ترتيبها، وحصة واحدة، وأدوات بسيطة (يوسف، 2026)'),
        ('teacher', 'c-green', 'شخصيات النشاط', 'المعلم «النوخذة» وقدوة الحركة، والطلبة «الغوّاصون»'),
    ]
    grid = ''.join(f'<div class="tile"><div class="ico {c}">{ic(i,58)}</div><div><p class="lb">{l}</p><p class="vl">{v}</p></div></div>' for i, c, l, v in tiles)
    ships = ''.join(f'<span class="ship">{ic("sailboat",34)}{n}</span>' for n in ['البوم', 'الجالبوت', 'السنبوك', 'البتّيل'])
    inner = f"""<div class="row" style="height:100%">
<div class="card" style="width:690px;flex:none;display:flex;flex-direction:column;gap:16px;background:linear-gradient(160deg,#FFFDF7 0%,#E8F8F8 100%)">
  <h3>{ic('oyster',58)} فكرة النشاط</h3>
  <p>يتقمّص الأطفال دور <b class="k">«الغوّاصين الصغار»</b> على متن أربع سفن خليجية تقليدية، ويقودهم المعلم بصفته <b class="k">«النوخذة»</b> في رحلة حركية عبر أربع محطات: <b class="k">التجديف، والغطس، ومشية السلطعون، وتوازن الفلامنجو</b>، ثم يتعاونون في تحدي <b class="k">«قفزة الدلفين»</b> لجمع 40 لؤلؤة تصنع <b class="k">«عقد اللؤلؤ الصفّي»</b>.</p>
  <div style="display:flex;flex-wrap:wrap;gap:12px">{ships}</div>
  <img src="img/diver.svg" style="width:220px;align-self:center;margin-top:auto;transform:rotate(-6deg)">
</div>
<div class="grid" style="flex:1;grid-template-columns:1fr 1fr;grid-auto-rows:1fr">{grid}</div>
</div>"""
    return frame(2, 'نظرة عامة', 'بطاقة تعريف <span>النشاط</span>', 'clipboard', inner)

# ---------------------------------------------------------------- 3 goal & importance
def s_goal():
    inner = f"""<div style="display:flex;flex-direction:column;gap:22px;height:100%">
<div class="card" style="display:flex;gap:26px;align-items:center;background:linear-gradient(90deg,#FFF6DA,#FFFDF7);padding:20px 34px">
  <img src="{E}bullseye.svg" style="width:96px;height:96px;flex:none">
  <div><h3 style="margin:0 0 6px 0">الهدف العام</h3>
  <p style="font-size:27px">تنمية المهارات الحركية الأساسية (التوازن، والتآزر، والقفز، والمشي الجانبي) لدى طلبة المرحلة الابتدائية، وتعزيز التعاون والانتماء الوطني، من خلال نشاط بدني ممتع وآمن يربط الحركة اليومية بتراث الغوص على اللؤلؤ في البحرين.</p></div>
</div>
<div class="row" style="flex:1">
  <div class="card" style="flex:1"><div class="strip" style="background:var(--coral)"></div>
    <h3>{ic('red_heart')} الأهمية الصحية</h3>
    <ul>
      <li>يوفّر نحو 24 دقيقة من الأنشطة الحركية المنظّمة، ويسهم في تحقيق توصية منظمة الصحة العالمية (2020) للأطفال (5–17 سنة): <b class="k">60 دقيقة يومياً على الأقل</b> في المتوسط من نشاط متوسط إلى مرتفع الشدة، وتقوية العضلات والعظام 3 أيام أسبوعياً، والحدّ من وقت الشاشة الترفيهي.</li>
      <li>ينشّط العضلات الكبيرة، ويدرّب التوازن والمرونة، ويرفع ضربات القلب في «قفزة الدلفين».</li>
      <li>يغرس عادات مصاحبة للحركة: الإحماء، والتهدئة، والتنفس العميق، وشرب الماء.</li>
    </ul></div>
  <div class="card" style="flex:1"><div class="strip" style="background:var(--teal)"></div>
    <h3>{ic('books')} الأهمية التربوية</h3>
    <ul>
      <li>الحركة تعزّز التركيز والانتباه، وتقلّل السلوكيات السلبية داخل الصف (يوسف، 2026).</li>
      <li>يدمج العدّ والجمع ومفردات التراث في اللعب وفق مبدأ <span style="white-space:nowrap">«التعلّم بالحركة»</span>.</li>
      <li>ينمّي التعاون، وانتظار الدور، والتشجيع، والعمل لتحقيق هدف مشترك.</li>
      <li>يعزّز الهوية الوطنية بربط الطفل بتراث بلده البحري بأسلوب محسوس وممتع.</li>
    </ul></div>
</div></div>"""
    return frame(3, 'عنوان النشاط وهدفه', 'الهدف <span>والأهمية</span> التربوية والصحية', 'bullseye', inner)

# ---------------------------------------------------------------- 4 age & outcomes
def s_outcomes():
    outs = [
        ('running_shoe', 'حركياً', '#DDF5F6', 'يتوازن على قدم واحدة 5 ثوانٍ لكل قدم، ويمشي جانبياً على خط 3 أمتار، ويقفز بالقدمين ويهبط بأمان («هبوط القطة» مع ثني الركبتين).'),
        ('handshake', 'اجتماعياً', '#FFF1CC', 'يتعاون مع فريقه لتحقيق هدف مشترك، وينتظر دوره، ويشجّع زملاءه بعبارات إيجابية.'),
        ('relieved_face', 'نفسياً', '#FDE3EE', 'يعبّر عن مشاعره، ويوظّف التنفس العميق للتهدئة الذاتية، ويُبدي ثقة بقدراته وشعوراً بالإنجاز.'),
        ('brain', 'معرفياً', '#E7E4FD', 'يعدّ اللآلئ المرقّمة ويجمع أعدادها، ويتعرّف على ثلاث مفردات تراثية: النوخذة، والغيص، والهيرات.'),
        ('potable_water', 'صحياً', '#DDF3EA', 'يذكر فائدة للحركة اليومية، ويشرب الماء قبل النشاط وأثناءه وبعده من قارورته الشخصية.'),
    ]
    rows = ''.join(f'<div class="out" style="background:linear-gradient(270deg,{c} 0 196px,#FFFDF7 196px)"><div class="dom">{ic(i,52)}{d}</div><p>{t}</p></div>' for i, d, c, t in outs)
    inner = f"""<div class="row" style="height:100%">
<div style="flex:1;display:flex;flex-direction:column;gap:12px">
  <p style="font-size:27px;font-weight:800;color:var(--navy);margin:0">بنهاية النشاط يُتوقّع أن يكون الطالب قادراً على أن:</p>
  {rows}
</div>
<div class="card" style="width:520px;flex:none;display:flex;flex-direction:column;gap:12px;background:linear-gradient(180deg,#E8F8F8,#FFFDF7)">
  <div style="display:flex;justify-content:center;gap:10px">{ic('girl',96)}{ic('boy',96)}</div>
  <h3 style="justify-content:center;text-align:center">الصف الثاني الابتدائي<br>7–8 سنوات</h3>
  <ul>
    <li>طاقة حركية عالية وحب للخيال ولعب الأدوار.</li>
    <li>تطوّر واضح في التوازن والتآزر الحركي.</li>
    <li>عمل في مجموعات صغيرة واتّباع قواعد بسيطة.</li>
    <li>تفاوت في مهارة القراءة يستدعي بطاقات مصوّرة.</li>
  </ul>
</div></div>"""
    return frame(4, 'الفئة العمرية المستهدفة', 'مخرجات التعلّم <span>المتوقعة</span>', 'glowing_star', inner)

# ---------------------------------------------------------------- 5 tools
def s_tools():
    tools = [
        ('straight_ruler', 'c-sun', 'شريط لاصق ملوّن', 'للمحطات وخطّي الشعاب و12 «دائرة موجة» ثابتة'),
        ('triangular_flag', 'c-coral', '8 أقماع صغيرة', 'لتحديد المسارات والحدود'),
        ('white_circle', 'c-sky', '40 «لؤلؤة» مثقوبة', 'من الورق المقوّى، مرقّمة 1–10، في صوانٍ'),
        ('round_pushpin', 'c-violet', '6 علامات «قاع البحر»', 'لاصقة على الأرض لمحطة الغطس'),
        ('spiral_shell', 'c-pink', '6 «أصداف»', 'أكياس حبوب لمحطة السلطعون'),
        ('basket', 'c-sun', '4 «صناديق كنز»', 'سلال بألوان السفن لجمع اللآلئ'),
        ('drum', 'c-coral', 'طبل صغير', 'مخصّص لإشارة التوقف وحدها'),
        ('speaker_high_volume', 'c-teal', 'مكبّر صوت', 'أهازيج «النهّام» وصوت الموج للانتقال'),
        ('memo', 'c-green', 'بطاقات مصوّرة', 'المحطات، والمشاعر، والاستراحة، والتحدي'),
        ('ribbon', 'c-pink', 'حبل «عقد اللؤلؤ»', 'يُعلَّق مسبقاً لتُعلَّق عليه اللآلئ'),
        ('television', 'c-sky', 'شاشة ذكية وساعة توقيت', 'لعرض الفيديو وتنظيم الوقت'),
        ('potable_water', 'c-coral', 'ماء وإسعافات', 'قوارير مسمّاة في سلة كل سفينة، وحقيبة إسعافات'),
    ]
    cells = ''.join(f'<div class="tool"><div class="tw {c}">{ic(i,64)}</div><h4>{n}</h4><p>{d}</p></div>' for i, c, n, d in tools)
    inner = f'<div class="grid" style="grid-template-columns:repeat(4,1fr);height:100%;gap:22px">{cells}</div>'
    return frame(5, 'الأدوات والوسائل', 'الأدوات <span>المطلوبة</span>', 'package', inner)

# ---------------------------------------------------------------- 6 safety in class
def s_safety1():
    left = ['إزاحة الطاولات إلى الجوانب، ومسافة <b class="k">طول ذراعين</b> بين كل طالبين، وممر الباب خالٍ دائماً للإخلاء.',
            'أرضية جافة خالية من الحقائب، وأحذية رياضية مربوطة جيداً.',
            'كل محطة على بُعد <b class="k">متر على الأقل</b> من الجدران وحواف الطاولات، ودوائر الموجة ملصقة لا تنزلق.',
            'السجل الصحي بالتنسيق مع ممرض المدرسة (الربو، السكري، القلب، الإصابات)، وبخّاخ الربو ووجبة خفيفة في المتناول، وتكييف الشدة.']
    right = ['إشارة توقف تُسمع وتُرى: <b class="k">ضربتان على الطبل + يد مرفوعة</b> = «تجمّد كالتمثال»، والطبل لا يُستخدم للإيقاع.',
             '«نمشي ولا نركض» في كل تنقّل، و«هبوط القطة» في القفز، والظهر مستقيم عند ثني الركبتين.',
             'يحق لأي طفل يتعب أو يتألم أو يشعر بدوار أن يجلس في «الميناء» ويُبلغ المعلم، أو يرفع «بطاقة الاستراحة» لا يده كي لا تختلط بإشارة التوقف.',
             'تدرّج الشدة بالإحماء قبل النشاط والتهدئة بعده، مع تهوية جيدة للصف.']
    lis = lambda xs: ''.join(f'<li>{x}</li>' for x in xs)
    chips = ''.join(f'<div style="flex:1;display:flex;align-items:center;gap:14px;background:{c};border-radius:22px;padding:14px 20px">{ic(i,56)}<p class="baloo" style="margin:0;font-size:30px;font-weight:800;color:var(--navy);line-height:1.2">{t}</p></div>' for i, c, t in [('drum', '#FFE6DC', 'ضربتان + يد مرفوعة = تجمّد'), ('person_walking', '#DDF3EA', 'نمشي ولا نركض'), ('cat_face', '#FFF1CC', '«هبوط القطة» بركبتين مثنيّتين')])
    inner = f"""<div class="card col" style="height:100%;display:flex;flex-direction:column"><div class="strip" style="background:var(--teal)"></div>
  <h3>{ic('school')} داخل الصف <span style="font-family:Tajawal;font-size:25px;font-weight:700;color:var(--muted);margin-right:10px">تستند إلى مبادئ البيئة الآمنة والإشراف ومنع الإصابات (Marotz, 2015؛ يوسف، 2026)</span></h3>
  <div class="row" style="gap:40px;flex:1"><ul style="flex:1">{lis(left)}</ul><ul style="flex:1">{lis(right)}</ul></div>
  <div class="row" style="gap:18px">{chips}</div>
</div>"""
    return frame(6, 'إجراءات السلامة (1)', 'السلامة <span>داخل الصف</span>', 'shield', inner)

# ---------------------------------------------------------------- 7 safety outdoor + digital
def s_safety2():
    inner = f"""<div class="row" style="height:100%">
<div class="card col" style="flex:1"><div class="strip" style="background:var(--sun)"></div>
  <h3>{ic('sun_with_face')} خارج الصف (الساحة)</h3>
  <ul>
    <li>في الأشهر المعتدلة (نوفمبر–مارس) صباحاً وفي الظل، مع القبعات والملابس الفاتحة وواقي الشمس بموافقة الأسرة، وفق تعليمات المدرسة ووزارة التربية والتعليم.</li>
    <li>النسخة الصفية أو الرقمية بديلاً عند الحرارة أو الرطوبة أو الغبار.</li>
    <li>فحص الأرضية وإزالة الحصى، والتأكد بظهر اليد أنها غير ساخنة، وتحديد حدود اللعب بالأقماع.</li>
    <li>استراحة ماء في الظل كل 10–15 دقيقة، ومراقبة الإجهاد الحراري (دوار، صداع، احمرار، غثيان) ونقل الطفل فوراً إلى مكان بارد وإبلاغ ممرض المدرسة.</li>
    <li>إشراف مستمر يتيح رؤية جميع الطلبة، مع حقيبة الإسعافات الأولية.</li>
  </ul></div>
<div class="card col" style="flex:1"><div class="strip" style="background:var(--violet)"></div>
  <h3>{ic('laptop')} عبر الوسائط الرقمية</h3>
  <ul>
    <li>محتوى على حساب المدرسة، خالٍ من الإعلانات والتعليقات، ويمسح المعلم رموز QR بجهازه لا الطلبة.</li>
    <li>لا تصوير ولا نشر دون موافقة خطية من الأسرة، وفق قانون حماية البيانات الشخصية البحريني رقم (30) لسنة 2018.</li>
    <li>شاشة 10 دقائق متواصلة كحدّ أقصى، ومسافة مناسبة منها، وصوت معتدل، وأسلاك مثبّتة بعيداً عن مسار الحركة.</li>
    <li>في البيت: مساحة خالية، وإشراف أحد الكبار، وحذاء رياضي أو حافي القدمين لا بالجوارب على البلاط، دون طلب صور أو مقاطع من الأسر.</li>
  </ul></div>
</div>"""
    return frame(7, 'إجراءات السلامة (2)', 'السلامة خارج الصف <span>ورقمياً</span>', 'locked', inner)

# ---------------------------------------------------------------- 8 kids rules poster + signals
def s_rules():
    rules = [
        ('footprints', 'أمدّ ذراعيّ فلا ألمس صديقي.'),
        ('running_shoe', 'أربط حذائي جيداً.'),
        ('person_walking', 'أمشي ولا أركض.'),
        ('anchor', 'إذا تعبت أجلس في الميناء وأخبر النوخذة.'),
        ('potable_water', 'أشرب رشفة ماء عند كل انتقال.'),
    ]
    rr = ''.join(f'<div class="rule"><div class="n">{k+1}</div><p style="flex:1">{t}</p>{ic(i,52)}</div>' for k, (i, t) in enumerate(rules))
    sig = [('drum', '#F2683F', 'ضربتان على الطبل + يد مرفوعة', 'تجمّد كالتمثال!'),
           ('water_wave', '#0F9FB2', 'صوت الموج', 'رشفة ماء ثم انتقال مشياً'),
           ('anchor', '#6C5CE7', 'بطاقة استراحة الغوّاص (لا اليد)', 'أرتاح في الميناء دون حرج')]
    ss = ''.join(f'<div style="display:flex;align-items:center;gap:18px;background:#fff;border-radius:24px;padding:16px 20px;border-right:12px solid {c};box-shadow:0 6px 16px rgba(14,58,91,.08)">{ic(i,64)}<div><p style="margin:0;font-size:25px;font-weight:800;color:var(--muted)">{a}</p><p class="baloo" style="margin:0;font-size:34px;font-weight:800;color:{c};line-height:1.2">{b}</p></div></div>' for i, c, a, b in sig)
    inner = f"""<div class="row" style="height:100%">
<div class="card" style="flex:1.1;background:linear-gradient(180deg,#FFF6DA,#FFFDF7);display:flex;flex-direction:column;gap:12px"><div class="strip" style="background:var(--coral)"></div>
  <h3>{ic('megaphone')} ملصق «قواعد الغوّاص الذكي»</h3>
  <p style="font-size:25px;margin:-4px 0 4px 0" class="muted">يُعلّق في الصف ويردّده الأطفال قبل الإبحار:</p>
  {rr}
</div>
<div class="card" style="flex:1;display:flex;flex-direction:column;gap:16px"><div class="strip" style="background:var(--teal)"></div>
  <h3>{ic('bell')} إشارات متفق عليها</h3>
  {ss}
  <p style="font-size:24px;margin:4px 0 0 0" class="muted">إشارة التوقف تُسمع وتُرى معاً (الطبل + اليد المرفوعة) لتناسب ضعاف السمع.</p>
</div></div>"""
    return frame(8, 'إجراءات السلامة (3)', 'قواعد <span>الغوّاص الذكي</span> والإشارات', 'megaphone', inner)

# ---------------------------------------------------------------- 9 environment maps
def room(title, inner_html, w=800, h=520):
    return f"""<div style="flex:1;display:flex;flex-direction:column;gap:10px">
<p class="baloo" style="margin:0;font-size:32px;font-weight:800;color:var(--navy)">{title}</p>
<div style="position:relative;width:{w}px;height:{h}px;background:#FBF4E4;border-radius:32px;border:7px solid #CFE9EC;box-shadow:inset 0 0 0 4px #fff,0 12px 28px rgba(14,58,91,.12)">
<div style="position:absolute;left:{w//2-200}px;top:-7px;width:400px;height:42px;background:#0E3A5B;border-radius:0 0 16px 16px;color:#fff;font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center;gap:10px"><img src="{E}television.svg" style="width:28px">الشاشة الذكية</div>
<div style="position:absolute;right:-7px;top:{h-130}px;width:20px;height:96px;background:#C98446;border-radius:6px"></div>
<p style="position:absolute;right:20px;top:{h-108}px;margin:0;font-size:24px;font-weight:800;color:#8E5326">الباب</p>
{inner_html}</div></div>"""

def s_map():
    def st(x, y, icon, num, name, color):
        return f'''<div style="position:absolute;left:{x}px;top:{y}px;width:210px;height:130px;border-radius:24px;background:{color};border:4px dashed rgba(255,255,255,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
<img src="{E}{icon}.svg" style="width:54px;height:54px"><p style="margin:0;font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:26px;color:#fff;line-height:1.1">{num} {name}</p></div>'''
    a = f"""{st(60, 70, 'man_rowing_boat', '1', 'التجديف', '#0F9FB2')}{st(470, 70, 'diving_mask', '2', 'الغطس', '#6C5CE7')}
{st(470, 330, 'crab', '3', 'السلطعون', '#F2683F')}{st(60, 330, 'flamingo', '4', 'الفلامنجو', '#F06A9B')}
<div style="position:absolute;left:275px;top:170px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,#FFF1CC 0 60%,#FFE3A0 100%);border:5px solid #fff;display:flex;flex-direction:column;align-items:center;justify-content:center">
<img src="{E}teacher.svg" style="width:62px"><p style="margin:0;font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:28px;color:#0E3A5B">الميناء</p><p style="margin:0;font-size:22px;font-weight:700;color:#5A7386">موقع المعلم</p></div>
<svg style="position:absolute;left:0;top:0" width="800" height="520" viewBox="0 0 800 520"><defs><marker id="ah" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M0 0 L12 6 L0 12 Z" fill="#0E3A5B"/></marker></defs>
<path d="M280 120 Q375 80 460 120" stroke="#0E3A5B" stroke-width="5" fill="none" stroke-dasharray="12 10" marker-end="url(#ah)"/>
<path d="M575 210 L575 320" stroke="#0E3A5B" stroke-width="5" fill="none" stroke-dasharray="12 10" marker-end="url(#ah)"/>
<path d="M460 420 Q375 470 280 420" stroke="#0E3A5B" stroke-width="5" fill="none" stroke-dasharray="12 10" marker-end="url(#ah)"/>
<path d="M165 320 L165 210" stroke="#0E3A5B" stroke-width="5" fill="none" stroke-dasharray="12 10" marker-end="url(#ah)"/></svg>"""
    lane_cols = ['#0F9FB2', '#6C5CE7', '#F2683F', '#F06A9B']
    lanes = ''
    for k, c in enumerate(lane_cols):
        x = 110 + k * 160
        circles = ''.join(f'<div style="position:absolute;left:{x+20}px;top:{140+j*86}px;width:70px;height:70px;border-radius:50%;border:6px solid {c};background:rgba(255,255,255,.6)"></div>' for j in range(3))
        lanes += f'''<div style="position:absolute;left:{x}px;top:56px;width:110px;height:430px;border-radius:20px;background:{c}22;border:3px dashed {c}"></div>{circles}
<img src="{E}white_circle.svg" style="position:absolute;left:{x+30}px;top:78px;width:50px"><img src="{E}basket.svg" style="position:absolute;left:{x+22}px;top:408px;width:66px">'''
    b = lanes + '<p style="position:absolute;left:24px;top:70px;margin:0;font-size:22px;font-weight:800;color:#5A7386;width:80px;text-align:center">الصينية</p><p style="position:absolute;left:24px;top:420px;margin:0;font-size:22px;font-weight:800;color:#5A7386;width:80px;text-align:center">الصندوق</p>'
    inner = f"""<div style="display:flex;flex-direction:column;gap:16px;height:100%">
<div class="row" style="gap:40px">{room('المرحلة 3: المحطات الأربع', a)}{room('المرحلة 4: «بحر اللؤلؤ» (4 مسارات)', b)}</div>
<div style="display:flex;gap:14px;flex-wrap:wrap;padding-left:60px">
<span class="tag" style="background:#DDF5F6;color:#0B6F80">↻ الانتقال مشياً مع عقارب الساعة عند صوت الموج</span>
<span class="tag" style="background:#FFF1CC;color:#8A5A00">المحطات على بُعد متر من الجدران والأثاث</span>
<span class="tag" style="background:#FDE3EE;color:#A3245A">ممر الباب خالٍ دائماً</span>
<span class="tag" style="background:#E7E4FD;color:#4B3FB8">مسار لكل سفينة، وبين المسارات متر</span>
</div></div>"""
    return frame(9, 'تصميم البيئة', 'مخطط تنظيم <span>الصف</span>', 'world_map', inner, bub=[])

# ---------------------------------------------------------------- 10 timeline
def s_timeline():
    phases = [
        ('movie_camera', '6 دقائق', 'التهيئة والقصة', 'الفيديو، ونمذجة الحركات، ومراجعة الإشارات'),
        ('water_wave', '4 دقائق', 'إحماء «موج البحر»', 'حركات متدرجة مع المعلم القدوة'),
        ('sailboat', '16 دقيقة', 'المحطات الأربع', '3.5 د أداء + 30 ث انتقال لكل محطة'),
        ('dolphin', '6 دقائق', '«قفزة الدلفين»', 'تتابع تعاوني لا سباق لجمع 40 لؤلؤة'),
        ('relieved_face', '4 دقائق', 'تهدئة «هدوء البحر»', 'استطالة، وتنفس عميق، وشرب الماء'),
        ('confetti_ball', '4 دقائق', 'التأمل والختام', 'المشاعر، والعقد، والتحدي العائلي'),
    ]
    items = ''.join(f'<div class="ph"><div class="dot">{ic(i,84)}<span class="min">{m}</span></div><h4>{t}</h4><p>{d}</p></div>' for i, m, t, d in phases)
    bar_parts = [(6, '#0F9FB2'), (4, '#33BFCB'), (16, '#6C5CE7'), (6, '#F06A9B'), (4, '#22A37A'), (4, '#FFC83A')]
    names = ['التهيئة', 'الإحماء', 'المحطات الأربع', 'الدلفين', 'التهدئة', 'الختام']
    bar = ''.join(f'<div style="flex:{w};background:{c};height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px;white-space:nowrap;overflow:hidden">{n} {w} د</div>' for (w, c), n in zip(bar_parts, names))
    inner = f"""<div style="display:flex;flex-direction:column;height:100%;gap:70px;justify-content:center;padding-left:40px">
<div style="position:relative;display:flex;gap:18px;align-items:flex-start;padding-top:10px">
<div style="position:absolute;top:84px;right:8%;left:8%;height:8px;border-radius:8px;background:repeating-linear-gradient(90deg,#8FE0E4 0 22px,transparent 22px 36px)"></div>
{items}</div>
<div>
<div style="display:flex;justify-content:space-between;font-size:25px;font-weight:800;color:var(--navy);margin-bottom:10px"><span>توزيع زمن الحصة</span><span>المجموع: 40 دقيقة</span></div>
<div style="display:flex;height:48px;border-radius:999px;overflow:hidden;box-shadow:0 6px 14px rgba(14,58,91,.12)">{bar}</div>
</div></div>"""
    return frame(10, 'خطوات التنفيذ', 'مسار الرحلة في <span>40 دقيقة</span>', 'stopwatch', inner)

# ---------------------------------------------------------------- 11/12 role tables
ROWS = [
    ('1. التهيئة والقصة', '6 د', 'يعرض الفيديو التوضيحي مدخلاً قصصياً، ثم يؤدي حركة كل محطة أمامهم قدوةً، ويراجع إشارتي التوقف والانتقال؛ والسفن موزّعة مسبقاً بملصقات ملوّنة.', 'يشاهدون ويطرحون الأسئلة، ويقلّدون حركات النوخذة، ويردّدون قواعد الغوّاص الذكي، ثم يتوجّه كل فريق إلى محطته الأولى.'),
    ('2. إحماء «موج البحر»', '4 د', 'يؤدي الحركات معهم قدوةً (يوسف، 2026) على أهازيج النهّام: تدوير الكتفين، ورفع الركبتين، ومدّ الذراعين، ثم 30 ثانية «موج عالٍ» هرولةً في المكان.', 'يقلّدون الحركات في مكان محطتهم الأولى، مع الحفاظ على مسافة ذراعين.'),
    ('3. المحطات الأربع', '16 د', 'يشغّل صوت الموج للانتقال كل 4 دقائق، ويتنقّل في الميناء لتبقى الفرق الأربع في مجال رؤيته، ويقترب للتوجيه والتعزيز وتكييف الحركة، ويعيّن لكل سفينة «قائداً» بالتناوب.', 'ينفّذون حركة المحطة كما في البطاقة، ويعدّون بصوت مرتفع، ويشجّع بعضهم بعضاً، ويشربون رشفة ماء ثم يمشون إلى المحطة التالية.'),
    ('4. تحدي «قفزة الدلفين»', '6 د', 'يدير تتابعاً تعاونياً لا سباقاً (هدف الصف: 40 لؤلؤة)، لكل سفينة مسارها، ويذكّر بـ«نمشي ولا نركض» و«هبوط القطة»، ويدوّن مجموع الصف على اللوح.', 'يقفز كل طالب بالقدمين في دوائر الموجة الثلاث، ويأخذ لؤلؤة من الصينية، ويعود مشياً ليضعها في صندوق سفينته، ثم يلمس كفّ زميله التالي.'),
    ('5. تهدئة «هدوء البحر»', '4 د', 'يقود الاستطالة اللطيفة والتنفس العميق بصوت هادئ، ويذكّر بشرب الماء.', 'يتنفّسون ببطء (شهيق 4 عدّات وزفير 4 عدّات)، ويؤدّون الاستطالة، ويشربون الماء.'),
    ('6. التأمل والختام', '4 د', 'يطرح سؤالي التأمل على الصف كله، ويعلّق اللآلئ في «عقد اللؤلؤ الصفّي» مع قادة السفن، ويوزّع بطاقة «تحدّي الغوّاص الأسبوعي».', 'يرفعون بطاقات المشاعر معاً، ويجمع كل فريق أعداد لآلئه بمساعدة قائده، ويتبادل كل زميلين فائدة للحركة ومفردة تراثية، ويحتفلون بالعقد المشترك.'),
]

def role_table(rows):
    tr = ''.join(f'<tr><td style="width:19%"><b class="k" style="font-family:\'Baloo Bhaijaan 2\';font-size:29px">{a}</b><br><span class="tag" style="background:#FFE6DC;color:#C2471F;margin-top:6px">{t}</span></td><td style="width:40.5%">{b}</td><td style="width:40.5%">{c}</td></tr>' for a, t, b, c in rows)
    return f"""<table class="t"><tr><th>المرحلة والزمن</th><th><img src="{E}teacher.svg" style="width:40px;vertical-align:middle"> دور المعلم «النوخذة»</th><th><img src="{E}child.svg" style="width:40px;vertical-align:middle"> دور الطلبة «الغوّاصون الصغار»</th></tr>{tr}</table>"""

def s_roles1():
    return frame(11, 'خطوات التنفيذ ودور المعلم والطلبة (1)', 'من التهيئة إلى <span>المحطات</span>', 'teacher', role_table(ROWS[:3]))

def s_roles2():
    return frame(12, 'خطوات التنفيذ ودور المعلم والطلبة (2)', 'من التحدي إلى <span>الختام</span>', 'child', role_table(ROWS[3:]))

# ---------------------------------------------------------------- 13 stations
STATIONS = [
    ('man_rowing_boat', '1', 'التجديف', '#0F9FB2', 'صف واحد، كلٌّ خلف زميله بمسافة ذراعين كأنهم في قارب، يجدّفون معاً على أهازيج النهّام مع ترديد «يا مال»: 10 للأمام و10 للخلف ثم راحة 15 ثانية، بسرعتي «بحر هادئ» و«عاصفة».', 'التآزر • الإيقاع • العمل الجماعي'),
    ('diving_mask', '2', 'الغطس', '#6C5CE7', 'شهيق على أطراف الأصابع والذراعان للأعلى، ثم زفير مع ثني الركبتين والظهر مستقيم حتى لمس علامة «قاع البحر»، ثم صعود ببطء؛ 3 جولات × 8 تكرارات وراحة 20 ثانية.', 'قوة الساقين • التنفس'),
    ('crab', '3', 'مشية السلطعون', '#F2683F', 'مشي جانبي ذهاباً على خط الشعاب الأول وعودة على الثاني باتجاه واحد (3 أمتار)، مع حمل «صدفة» دون إسقاطها؛ ينطلق التالي حين يبلغ زميله منتصف الخط.', 'التآزر • التحكم بالجسم'),
    ('flamingo', '4', 'توازن الفلامنجو', '#F06A9B', 'الوقوف على قدم واحدة مع فتح الذراعين والعدّ حتى 5 ثم التبديل؛ وللمتقدمين العدّ حتى 10، أو إغماض العينين بجوار «السيب» المساند أو مع الاستناد إلى كرسي.', 'التوازن الثابت'),
]

def s_stations():
    cards = ''.join(f'''<div class="st"><div class="top" style="background:{c}"><img src="{E}{i}.svg"><div><p class="sn">المحطة {n}</p><h4>{t}</h4></div></div>
<div class="bd"><p>{d}</p><span class="sk" style="color:{c}">{sk}</span></div></div>''' for i, n, t, c, d, sk in STATIONS)
    inner = f'<div class="grid" style="grid-template-columns:repeat(4,1fr);height:100%;gap:24px">{cards}</div>'
    return frame(13, 'تفاصيل المحطات', 'المحطات <span>الأربع</span>', 'sailboat', inner)

# ---------------------------------------------------------------- 14 development
def s_dev():
    sus = [('round_pushpin', '«ركن الغوّاص»', 'ركن حركة ثابت فيه بطاقات المحطات وخط الشعاب ودوائر الموجة للفواصل القصيرة.'),
           ('dolphin', '«دقيقة قفزة الدلفين السعيدة»', 'دقيقة قفز خفيف بين الحصص لتجديد النشاط والتركيز (يوسف، 2026).'),
           ('house', '«تحدّي الغوّاص الأسبوعي»', '10 دقائق حركة يومياً مع الأسرة، تُلوَّن لؤلؤة عن كل يوم وتُعاد البطاقة نهاية الأسبوع.')]
    tt = ''.join(f'<div class="tile" style="flex:1;padding:16px 20px;align-items:flex-start"><div class="ico c-pink" style="width:70px;height:70px">{ic(i,48)}</div><div><p class="vl" style="margin:0;font-weight:800;color:var(--navy)">{a}</p><p style="font-size:24px;line-height:1.4;margin:0;color:var(--body)">{b}</p></div></div>' for i, a, b in sus)
    inner = f"""<div style="display:flex;flex-direction:column;gap:22px;height:100%">
<div class="row" style="flex:1">
<div class="card col" style="flex:1"><div class="strip" style="background:var(--sun)"></div>
  <h3>{ic('desert_island')} في الساحة: «بحر الساحة الكبير»</h3>
  <ul>
    <li>خريطة بحرية بالطباشير على الأرضية الصلبة: جزر وموانئ و«هيرات» تتوزع فيها اللآلئ.</li>
    <li>مسافات أطول وشدة أعلى: مشية السلطعون الكاملة على أرضية مظللة غير ساخنة، وقفز الدلفين فوق حبل ممدود على الأرض.</li>
    <li>«عودة السفن» التعاونية: تكمل الفرق كلها عقداً واحداً كبيراً.</li>
  </ul></div>
<div class="card col" style="flex:1"><div class="strip" style="background:var(--violet)"></div>
  <h3>{ic('mobile_phone')} رقمياً: «الغوّاص الرقمي»</h3>
  <ul>
    <li>فيديو تفاعلي يقود الطلبة خطوة بخطوة على الشاشة الذكية في الأيام الحارة أو الماطرة.</li>
    <li>رمز QR على كل بطاقة يمسحه المعلم ليعرض مقطع الحركة الصحيحة.</li>
    <li>«لوحة اللآلئ»: لؤلؤة تُضاف إلى «عقد الصف» الرقمي المشترك عن كل يوم تحدٍّ، دون أسماء أو صور أو مقارنة.</li>
  </ul></div>
</div>
<div class="row" style="gap:20px">{tt}</div>
</div>"""
    return frame(14, 'الإضافة التطويرية', 'خارج الصف <span>ورقمياً</span> وكل يوم', 'rocket', inner)

# ---------------------------------------------------------------- 15 inclusion & differentiation
def s_inclusion():
    lv = [
        ('التجديف', 'جلوساً', 'وقوفاً 10 عدّات', 'مع رفع الركبة بالتناوب'),
        ('الغطس', 'النزول حتى الركبتين', 'لمس قاع البحر', 'الثبات في القاع 3&nbsp;عدّات'),
        ('السلطعون', 'مشي أمامي على الخط', 'جانبي مع الصدفة', 'الصدفة على ظهر الكف'),
        ('الفلامنجو', 'لمس الأرض بأطراف القدم الأخرى', '5 عدّات لكل قدم', '10 عدّات أو عينان مغمضتان بجوار «السيب»'),
    ]
    tr = ''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td><td>{d}</td></tr>' for a, b, c, d in lv)
    table = f'''<table class="lv"><tr><th style="background:#0E3A5B;width:18%">المحطة</th><th style="background:#22A37A;width:26%">سهل</th><th style="background:#0F9FB2;width:24%">متوسط</th><th style="background:#6C5CE7;width:32%">متقدم</th></tr>{tr}</table>'''
    inner = f"""<div class="row" style="height:100%">
<div style="flex:1.3;display:flex;flex-direction:column;gap:14px">
  <p style="font-size:28px;font-weight:800;color:var(--navy);margin:0">مستويات تحدٍّ مطبوعة على بطاقة كل محطة:</p>
  {table}
  <p style="font-size:25px;color:var(--muted);margin:4px 0 0 0;font-weight:700">التركيز على الجهد لا على الفوز؛ فاللآلئ كلها تصنع عقداً واحداً للصف.</p>
</div>
<div class="card col" style="flex:1"><div class="strip" style="background:var(--green)"></div>
  <h3>{ic('manual_wheelchair')} الدمج والفروق الفردية</h3>
  <ul>
    <li>نسخة جلوس أو استناد لكل محطة، والخطو داخل الدوائر بدل القفز.</li>
    <li>إشارة توقف مرئية لضعاف السمع، ومواجهة المعلم.</li>
    <li>للحساسية الحسية: أهازيج أخفض صوتاً، و«ركن هدوء»، وجدول مصوّر.</li>
    <li>نظام <b class="k">«الغيص والسيب»</b>: زميل مساند كما كان السيب يحمي الغيص.</li>
    <li>«بطاقة استراحة الغوّاص» يرفعها الطفل دون حرج.</li>
  </ul></div>
</div>"""
    return frame(15, 'مراعاة الفروق الفردية', 'لكلّ غوّاص <span>تحدٍّ يناسبه</span>', 'handshake', inner)

# ---------------------------------------------------------------- 16 assessment
def s_assess():
    crit = [('يتوازن على قدم واحدة 5 ثوانٍ', 'محطة الفلامنجو'), ('يقفز ويهبط بأمان «هبوط القطة»', 'قفزة الدلفين'),
            ('يتعاون وينتظر دوره', 'طوال النشاط'), ('يعدّ لآلئ فريقه ويجمع أعدادها', 'صندوق الكنز'), ('يمشي جانبياً على الخط', 'ركن الغوّاص لاحقاً'), ('يذكر فائدة للحركة ومفردة تراثية', 'سؤال الخروج')]
    tr = ''.join(f'<tr><td>{c}</td><td style="color:var(--muted)">{w}</td><td style="text-align:center">○</td><td style="text-align:center">○</td></tr>' for c, w in crit)
    table = f'''<table class="lv"><tr><th style="background:#0E3A5B;width:44%">معيار الملاحظة</th><th style="background:#0F9FB2;width:26%">موضع الرصد</th><th style="background:#22A37A;width:15%;text-align:center">يحقق</th><th style="background:#F2683F;width:15%;text-align:center">يحتاج دعماً</th></tr>{tr}</table>'''
    tools = [
        ('eyes', 'ملاحظة مباشرة', 'بقائمة رصد مبسّطة مرتبطة بموضع وقوف المعلم.'),
        ('relieved_face', 'تقويم ذاتي', 'ببطاقات المشاعر: بحر هادئ، موج مرح، موج متعب.'),
        ('speech_balloon', 'سؤال الخروج', '«اذكر فائدة واحدة للحركة اليومية، ومفردة واحدة تعلّمتها من تراث الغوص».'),
        ('spiral_calendar', 'متابعة منزلية', 'مراجعة بطاقة «تحدّي الغوّاص الأسبوعي».'),
    ]
    tt = ''.join(f'<div class="tile" style="padding:16px 20px"><div class="ico c-teal" style="width:74px;height:74px">{ic(i,50)}</div><div><p class="vl" style="margin:0;font-weight:800;color:var(--navy)">{a}</p><p style="font-size:24px;line-height:1.4;margin:0;color:var(--body)">{b}</p></div></div>' for i, a, b in tools)
    inner = f"""<div class="row" style="height:100%">
<div style="flex:1.3;display:flex;flex-direction:column;gap:14px">
  <p style="font-size:28px;font-weight:800;color:var(--navy);margin:0">نموذج قائمة الرصد (لكل طالب):</p>
  {table}
</div>
<div style="flex:1;display:flex;flex-direction:column;gap:16px">{tt}</div>
</div>"""
    return frame(16, 'التقويم', 'كيف نعرف أن <span>الهدف تحقق؟</span>', 'check_mark_button', inner)

# ---------------------------------------------------------------- 17 attachment: station cards
def s_cards():
    data = [
        ('man_rowing_boat', 'المحطة 1', 'التجديف', '#0F9FB2', '#DDF5F6', 'قفوا في صف، كلٌّ خلف صديقه، وجدّفوا معاً: «يا مال!»', '10 للأمام و10 للخلف', 'مسافة ذراعين بينكم.', 'جلوساً • وقوفاً • مع رفع الركبة', 'التجديف جلوساً على كرسي'),
        ('diving_mask', 'المحطة 2', 'الغطس', '#6C5CE7', '#E7E4FD', 'شهيق للأعلى… زفير واثنوا الركبتين والمسوا قاع البحر!', '8 مرات × 3 جولات', 'الظهر مستقيم، وانزلوا ببطء.', 'حتى الركبتين • القاع • ثبات 3', 'لمس مقعد الكرسي'),
        ('crab', 'المحطة 3', 'مشية السلطعون', '#F2683F', '#FFE6DC', 'امشوا جانبياً على الخط الأول وعودوا على الثاني بالصدفة.', '3 أمتار ذهاباً وعودة', 'انظروا أمامكم وامشوا ببطء.', 'أمامي • جانبي • الصدفة على ظهر الكف', 'بالكرسي المتحرك أو بيد زميل'),
        ('flamingo', 'المحطة 4', 'توازن الفلامنجو', '#F06A9B', '#FDE3EE', 'قفوا على قدم واحدة وافتحوا أذرعكم كالجناحين.', 'عُدّوا حتى 5 لكل قدم', 'استندوا إلى الكرسي عند الحاجة.', 'لمس الأرض • 5 • 10', 'الاستناد إلى ظهر كرسي'),
    ]
    cards = ''.join(f'''<div class="pcard" style="border-color:{c}55"><div class="pic" style="background:{bg}"><img src="{E}{i}.svg"></div>
<p style="margin:0;font-weight:800;font-size:24px;color:{c}">{n}</p><h4 style="color:{c}">{t}</h4>
<p class="how">{h}</p><span class="cnt" style="background:{c}">{cnt}</span><p class="safe">⚠ {s}</p>
<p style="margin:0;font-size:22px;font-weight:800;color:var(--muted)">المستويات: {lv}</p>
<p style="margin:0;font-size:22px;font-weight:800;color:{c};background:#fff;border:2px dashed {c}66;border-radius:14px;padding:6px 12px">نسخة الجلوس: {sv}</p></div>''' for i, n, t, c, bg, h, cnt, s, lv, sv in data)
    inner = f'<div class="grid" style="grid-template-columns:repeat(4,1fr);height:100%;gap:24px">{cards}</div>'
    return frame(17, 'المرفقات (1): بطاقات النشاط', 'بطاقات المحطات <span>للطباعة</span>', 'memo', inner)

# ---------------------------------------------------------------- 18 attachment: family + feelings + pearls
def s_cards2():
    days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    dd = ''.join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div class="pearl" style="width:70px;height:70px;font-size:24px;opacity:.55"></div><span style="font-size:23px;font-weight:800;color:var(--navy)">{d}</span></div>' for d in days)
    feelings = [('relieved_face', 'بحر هادئ', '#DDF5F6'), ('grinning_face_with_big_eyes', 'موج مرح', '#FFF1CC'), ('face_exhaling', 'موج متعب', '#FDE3EE')]
    ff = ''.join(f'<div style="flex:1;background:{c};border-radius:24px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:4px"><img src="{E}{i}.svg" style="width:76px"><span style="font-family:\'Baloo Bhaijaan 2\';font-weight:800;font-size:27px;color:var(--navy)">{t}</span></div>' for i, t, c in feelings)
    pearls = ''.join(f'<div class="pearl" style="width:72px;height:72px;font-size:34px">{k}</div>' for k in range(1, 11))
    inner = f"""<div class="row" style="height:100%">
<div class="card" style="flex:1.3;display:flex;flex-direction:column;gap:12px;background:linear-gradient(180deg,#FFF6DA,#FFFDF7)"><div class="strip" style="background:var(--sun)"></div>
  <h3>{ic('house')} بطاقة «تحدّي الغوّاص الأسبوعي»</h3>
  <p>عزيزي وليّ الأمر: شارك طفلك <b class="k">10 دقائق</b> من حركات المحطات يومياً، ولوّنا معاً لؤلؤة اليوم.</p>
  <div style="display:flex;justify-content:space-between;background:#fff;border-radius:24px;padding:14px 18px">{dd}</div>
  <p style="font-size:24px;margin:0;color:#8A3B1E;background:#FFE9DF;border-radius:16px;padding:10px 16px;font-weight:700">⚠ في مكان واسع بعيداً عن الأثاث، وبحذاء رياضي لا بالجوارب، ومعكم أحد الكبار.</p>
  <p style="font-size:24px;margin:0;color:var(--navy);font-weight:800">{ic('spiral_calendar',36)} أعيدوا البطاقة إلى المعلم في نهاية الأسبوع.</p>
  <p style="font-size:24px;margin:0" class="muted">اسم الغوّاص: .......................... &nbsp; توقيع وليّ الأمر: ....................</p>
</div>
<div style="flex:1;display:flex;flex-direction:column;gap:20px">
  <div class="card" style="display:flex;flex-direction:column;gap:10px;padding:22px 28px"><h3 style="margin:0">{ic('speech_balloon')} بطاقات المشاعر</h3><div style="display:flex;gap:12px">{ff}</div></div>
  <div class="card" style="display:flex;flex-direction:column;gap:10px;flex:1;padding:22px 28px"><h3 style="margin:0">{ic('white_circle')} اللآلئ المرقّمة (1–10)</h3><div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">{pearls}</div></div>
  <div class="tile" style="padding:14px 20px;background:#E7E4FD"><div class="ico" style="background:#fff;width:66px;height:66px">{ic('raising_hands',46)}</div><div><p class="vl" style="margin:0;font-weight:800;color:var(--navy)">«بطاقة استراحة الغوّاص»</p><p style="font-size:23px;margin:0;color:var(--body)">يرفعها الطفل ليرتاح في الميناء دون حرج.</p></div></div>
</div></div>"""
    return frame(18, 'المرفقات (2): النماذج والوسائل', 'التحدي العائلي <span>والمشاعر واللآلئ</span>', 'clipboard', inner)

# ---------------------------------------------------------------- 19 attachment: video
def s_video():
    frames_ = [('01', 'الترحيب والمغامرة'), ('02', 'الغيص والهيرات'), ('03', 'قواعد الغوّاص الذكي'), ('04', 'الانتقال بين المحطات'), ('05', 'محطة الغطس'), ('06', 'محطة السلطعون'), ('07', 'قفزة الدلفين'), ('08', 'عقد اللؤلؤ الصفّي')]
    th = ''.join(f'<div style="display:flex;flex-direction:column;gap:6px"><img src="img/sb/{k}.jpg" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:18px;border:4px solid #fff;box-shadow:0 8px 18px rgba(14,58,91,.14);background:#CDEFF1"><p style="margin:0;font-size:24px;font-weight:800;color:var(--navy);text-align:center">{t}</p></div>' for k, t in frames_)
    facts = [('clapper_board', 'رسوم متحركة (موشن جرافيك) بصوت المعلم، نحو ثلاث دقائق'), ('books', 'القصة والمفردات التراثية والسلامة وكل محطة خطوة بخطوة'),
             ('speech_balloon', 'نص عربي مرافق متزامن، ومؤثرات صوتية، وموسيقى هادئة'), ('television', 'يُعرض في التهيئة، ونسخةً رقمية في الأيام الحارة')]
    ff = ''.join(f'<div style="flex:1;display:flex;align-items:center;gap:12px;background:var(--pearl);border-radius:20px;padding:12px 16px;box-shadow:0 6px 16px rgba(14,58,91,.08)">{ic(i,46)}<p style="margin:0;font-size:23px;font-weight:700;line-height:1.35;color:var(--body)">{t}</p></div>' for i, t in facts)
    inner = f"""<div style="display:flex;flex-direction:column;gap:18px;height:100%">
<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:18px 22px">{th}</div>
<div class="row" style="gap:16px;margin-top:auto">{ff}</div>
</div>"""
    return frame(19, 'المرفقات (3): فيديو توضيح التنفيذ', 'لقطات من <span>الفيديو التوضيحي</span>', 'movie_camera', inner)

# ---------------------------------------------------------------- 20 references
def s_refs():
    inner = f"""<div class="card" style="height:100%;display:flex;flex-direction:column;gap:20px;padding:36px 44px">
<h3>{ic('books')} المراجع</h3>
<p style="font-size:27px">يوسف، منى إبراهيم. (2026). <i>الأسبوع الثامن: دمج النشاط البدني واللعب في العملية التعليمية اليومية</i> [شرائح عرض تقديمي]. مقرر TCHL418 الصحة والسلامة والتغذية للأطفال، كلية البحرين للمعلمين، جامعة البحرين.</p>
<p style="direction:ltr;text-align:left;font-size:27px">Marotz, L. R. (2015). <i>Health, safety, and nutrition for the young child</i> (9th ed.). Cengage Learning.</p>
<p style="direction:ltr;text-align:left;font-size:27px">World Health Organization. (2020). <i>WHO guidelines on physical activity and sedentary behaviour</i>. https://www.who.int/publications/i/item/9789240015128</p>
<hr style="border:none;border-top:3px dashed #CFE9EC;width:100%;margin:6px 0">
<h3 style="font-size:32px">{ic('artist_palette',44)} مصادر التصميم</h3>
<p style="font-size:25px" class="muted">الرسوم التوضيحية: Fluent Emoji من Microsoft (رخصة MIT) ورسوم خاصة بالنشاط. الخطوط: Baloo Bhaijaan 2 و Tajawal (رخصة SIL Open Font). التعليق الصوتي بصوت الطالب المستنسخ، والموسيقى والمؤثرات مولّدة عبر ElevenLabs.</p>
</div>"""
    return frame(20, 'التوثيق', 'المراجع <span>والمصادر</span>', 'books', inner)

# ---------------------------------------------------------------- 21 closing
def s_end():
    return f"""<section class="slide" id="s21" style="background:linear-gradient(180deg,#BDEBFA 0%,#E4F8FB 45%,#7FD6DE 46%,#2FB3C2 66%,#0E7E98 100%)">
<img src="img/dhow.svg" style="position:absolute;left:1180px;top:150px;width:560px">
<svg style="position:absolute;left:0;top:478px;width:1920px;height:60px" viewBox="0 0 1920 60" preserveAspectRatio="none"><path d="M0 22 C120 0 240 0 360 22 C480 44 600 44 720 22 C840 0 960 0 1080 22 C1200 44 1320 44 1440 22 C1560 0 1680 0 1800 22 C1860 33 1890 36 1920 34 L1920 60 L0 60 Z" fill="#7FD6DE"/></svg>
<div style="position:absolute;right:760px;top:150px;width:1040px;text-align:center">
<p style="margin:0;font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:150px;line-height:1;color:#0E3A5B;text-shadow:0 6px 0 #fff">هيا نُبحر!</p>
<p style="margin:26px 0 0 0;font-size:40px;font-weight:800;color:#0F9FB2">الحركة تجعل أجسامنا قوية، وعقولنا صافية</p>
</div>
<img src="img/diver.svg" style="position:absolute;left:300px;top:600px;width:420px;transform:rotate(-8deg)">
<img src="{E}tropical_fish.svg" style="position:absolute;left:1400px;top:640px;width:120px">
<img src="{E}oyster.svg" style="position:absolute;left:900px;top:760px;width:150px">
<img src="{E}dolphin.svg" style="position:absolute;left:1580px;top:560px;width:150px;transform:rotate(12deg)">
<div style="position:absolute;bottom:70px;left:50%;transform:translateX(-50%);background:#FFFDF7;border-radius:999px;padding:18px 44px;box-shadow:0 16px 36px rgba(4,40,60,.35);font-size:32px;font-weight:700;color:#30495F;white-space:nowrap">
شكراً لكم &nbsp;•&nbsp; <b style="color:#0E3A5B">سجاد مهدي عبدالله الصياد</b> &nbsp;•&nbsp; 202102571</div>
</section>"""

OVERRIDE_CSS = r"""
#s14 .card li{font-size:29px;line-height:1.7}
#s6 .card li{font-size:27px;line-height:1.7}
#s3 .card li{font-size:25px;line-height:1.52;margin-bottom:5px}
#s4 .out{padding:14px 20px;gap:22px;flex:1}
#s4 .out p{font-size:24px;line-height:1.42}
#s4 .out .dom{width:180px;font-size:27px;flex-direction:row;justify-content:flex-start;gap:10px}
#s4 .out .dom img{width:42px;height:42px}
#s5 .tool{padding:14px 18px;gap:4px}
#s5 .tool .tw{width:74px;height:74px}
#s5 .tool .tw img{width:50px;height:50px}
#s5 .tool h4{font-size:27px}
#s5 .tool p{font-size:23px;line-height:1.35}
table.t td{font-size:27px;line-height:1.55;padding:18px 24px}
.st .bd p{font-size:27px;line-height:1.55}
"""

ALL = [s_overview, s_goal, s_outcomes, s_tools, s_safety1, s_safety2, s_rules, s_map, s_timeline, s_roles1, s_roles2,
       s_stations, s_dev, s_inclusion, s_assess, s_cards, s_cards2, s_video, s_refs, s_end]
