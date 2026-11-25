# -*- coding: utf-8 -*-
SRC = 'الأحمري، لغويات اجتماعية (2022)'

def rings(size=900, labels=None, op=1.0):
    cx = size / 2
    cols = ['#c05621', '#d6916e', '#e9c3b1', '#f5dfd2']
    out = f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" style="opacity:{op}">'
    for i, r in enumerate([0.44, 0.33, 0.22, 0.11][::-1]):
        pass
    radii = [0.47, 0.35, 0.23, 0.11]
    fills = ['#fdf6f0', '#fbeadc', '#f5d3bd', '#c05621']
    for r, f in zip(radii, fills):
        out += f'<circle cx="{cx}" cy="{cx}" r="{r*size}" fill="{f}" stroke="#e9c3b1" stroke-width="2"/>'
    if labels:
        fc, fr = round(size * 0.062), round(size * 0.048)
        out += (f'<text x="{cx}" y="{cx}" dominant-baseline="central" text-anchor="middle" font-family="Kufi" font-weight="700" font-size="{fc}" fill="#fff">{labels[0]}</text>')
        ys = [cx - 0.29 * size, cx - 0.41 * size]
        for t, y in zip(labels[1:], ys):
            out += f'<text x="{cx}" y="{y}" dominant-baseline="central" text-anchor="middle" font-family="Kufi" font-weight="600" font-size="{fr}" fill="#7b341e">{t}</text>'
    return out + '</svg>'

def box(kind, tag, text, extra=''):
    return f'<div class="box {kind}" {extra}><span class="tag">{tag}</span>{text}</div>'

A = 'الأحمري (2022)'
def x(ok, bad):
    return f'<span style="color:#b42318">✗ {bad}</span>&nbsp;&nbsp;&nbsp;<span style="color:#2f855a">✓ {ok}</span>'
DEF = lambda en, t: f'<p style="font-size:32px;margin-bottom:22px"><b class="rust">تعريف</b> <span class="en">({en})</span><b class="rust">:</b> {t}</p>'
CORNER = '<th style="width:{w}px;background:#f7f8fa;border-bottom:1.5px solid var(--line)"></th>'

SLIDES = [
 # 1 cover
 {'raw': True, 'html': f'''<div class="rings">{rings(1000, op=.9)}</div>
 <div class="cover">
  <div class="kick"><span class="pill">المحور (د)</span>المتحدث الثالث</div>
  <h1>العوامل الاجتماعية<br><em>الباعثة على التغير</em></h1>
  <div class="sub">العرض السادس: التغيرات اللغوية، الدوافع الداخلية والعوامل الخارجية</div>
  <div class="src">الأحمري (2022)، لغويات اجتماعية، ص 69–71، 77، 79–80، 174–175</div>
 </div>'''},
 # 2 map
 {'title': 'من أين يأتي التغير؟ <em>موقع المحور</em>', 'src': A + '، ص 69–71', 'html': '''
 <div class="flow">
  <div class="step" style="background:var(--bluet);border-color:#bcd6ee"><span class="k" style="color:var(--blue)">الدوافع الداخلية</span>من داخل النظام اللغوي، ومظاهر التغير<br><span class="who" style="background:#fff;color:var(--blue)">المتحدثان الأول والثاني</span></div>
  <div class="arrow">←</div>
  <div class="step" style="background:var(--peach);border:2.5px solid var(--rust)"><span class="k rust">العوامل اللغوية-الاجتماعية</span>من خارج اللغة: المجتمع وأحواله<br><span class="who" style="background:var(--rust);color:#fff">هذا المحور</span></div>
  <div class="arrow">←</div>
  <div class="step" style="background:var(--greent);border-color:#b6d4c5"><span class="k" style="color:var(--green)">الأبعاد</span>المكان والجماعة والفرد<br><span class="who" style="background:#fff;color:var(--green)">المتحدث الرابع</span></div>
 </div>
 <div class="k mut" style="font-size:26px;margin:38px 0 14px">سؤالان يوجّهان التحليل</div>
 <div class="stack">
  <div class="q"><span class="n">1</span><div>متى نعدّ التنوع تغيرًا؟</div></div>
  <div class="q"><span class="n">2</span><div>كيف ينتقل التغير، وما اتجاهه، ولماذا يُقبَل؟</div></div>
 </div>''' + box('read', 'قراءة', 'التنوع هو المدخل الذي يُحدَّد من خلاله العامل الاجتماعي (ص 70)؛ لذلك يبدأ المحور بالسؤال الأول.', 'style="margin-top:24px"')},
 # 3 internal vs external
 {'q': 1, 'title': 'العامل الاجتماعي: <em>خارجي المنبع، قصير الأمد</em>', 'src': A + '، ص 69–71', 'html': '''
 <table>
  <tr>''' + CORNER.format(w=250) + '''<th>العوامل الداخلية</th><th style="background:var(--rust)">العوامل الخارجية (الاجتماعية)</th></tr>
  <tr><td class="rh" style="padding:22px 24px">طبيعة العمل</td><td>تنبع من داخل اللغة</td><td class="hl">تأتي من أحوال المجتمع</td></tr>
  <tr><td class="rh" style="padding:22px 24px">أمد التأثير</td><td>طويل عادةً</td><td class="hl">قصير، وقد لا يتجاوز جيلًا واحدًا</td></tr>
 </table>
 <div class="k mut" style="font-size:26px;margin:50px 0 14px">استدلال المؤلف (ص 70–71)</div>
 <div class="chain"><div class="c">العوامل الاجتماعية مؤقتة في معظم أشكال التنوع</div><div class="op">+</div><div class="c">ما لم يوثَّق في حينه لا سبيل إلى معرفته</div><div class="op">←</div><div class="c res">فتفيد الدراسة الوصفية التزامنية</div></div>
 ''' + box('crit', 'حدود المنهج', 'الصورة التزامنية للحظة واحدة؛ فالتمييز بها بين التنوع المستقر والتغير الجاري يحتاج إلى مقارنة الأجيال، ومن هنا السؤال الأول.', 'style="margin-top:44px"')},
 # 4 variation vs change
 {'q': 1, 'title': 'ليس كل تنوع <em>تغيرًا</em>', 'src': A + '، ص 70–71، عن Labov (2001)', 'html': '''
 <div class="chain" style="margin-bottom:28px"><div class="c">تنوع ملحوظ</div><div class="op">←</div><div class="c">هل تتوافر أدلة كافية على أنه تغير؟</div><div class="op">←</div><div class="c res" style="flex:1.3">نعم: تغير جارٍ &nbsp;|&nbsp; لا: لا يُحكم بالتغير</div></div>
 <div class="grid2">
  <div class="card"><div class="hd">التنوع المستقر طويل الأمد <span class="en">long-term stable variation</span></div>
   <div class="bd"><ul class="dots"><li>لأنه قديم واسع الاستعمال، لا يُفضي إلى تغير</li><li>يبقى تنوعًا في الاستخدام أو الأسلوب أو المفردات</li><li>غير المعياري قد يرتبط بطبقة، غالبًا الوسطى أو الدنيا</li></ul>''' +
   box('ex', 'مثال توضيحي', '(رأس/راس، بئر/بير): تحقيق الهمز وتخفيفه وجهان قديمان متعايشان.', 'style="margin-top:14px;font-size:29px"') + '''</div></div>
  <div class="stack">''' + box('crit', 'مفارقة', 'العوامل الاجتماعية مؤقتة في (معظم) أشكال التنوع (ص 71)، وهذا التنوع المرتبط بالطبقة طويل الأمد (ص 70).') +
  box('read', 'قراءة', 'كلمة (معظم) تترك موضعًا لهذا الاستثناء: الطبقة تَسِم الصيغة ولا تدفعها إلى التغير.') + '''</div>
 </div>'''},
 # 5 wave
 {'q': 2, 'title': 'نظرية التموج: <em>التغير موجة تبدأ من مركز</em>', 'src': A + '، ص 77، عن Wardhaugh', 'html':
 DEF('Wave Theory', 'كل تغيير جديد هو (أشبه بموجة) تنتقل تذبذباتها من مركزها إلى الخارج (ص 77).') + '''
 <div style="display:flex;gap:46px;align-items:flex-start">
  <div style="flex:none;width:480px">''' + rings(480, ['المركز']) + '''</div>
  <div class="stack" style="flex:1">
   <div class="chain"><div class="c">القرب من المركز</div><div class="op">←</div><div class="c">روابط أقوى</div><div class="op">←</div><div class="c res">انتقال أسهل</div></div>
   ''' + box('read', 'قراءة', 'المدى غير ثابت؛ إذ (يزيد وينقص باختلاف العوامل الاجتماعية الأخرى) (ص 77). فالمسافة وحدها لا تفسّر الانتشار، ولعلّ من تلك العوامل البريستيج.') +
   box('term', 'مقارنة', 'الانتشار المفرداتي ينقل التغير من كلمة إلى كلمة، والتموج من متكلم إلى متكلم.') +
   box('ex', 'مثال توضيحي', 'تعبير يولد بين أصدقاء، فيعمّ الصف ثم المدرسة، ويبلغ البيوت متأخرًا.') + '''
  </div></div>'''},
 # 6 awareness
 {'q': 2, 'title': 'الوعي يحدّد <em>اتجاه التغير</em>', 'src': A + '، ص 79–80، عن Aitchison', 'html': '''
 <div class="grid2">
  <div class="card"><div class="hd">التغير الواعي <span class="en">conscious change</span></div><div class="bd"><p>يدركه المتكلم: أعلى من مستوى الوعي</p><p class="k rust" style="font-size:35px;margin-top:6px">↑ تغير من الأعلى <span class="en">change from above</span></p><p class="mut" style="font-size:27px">ويصف الكتاب اتجاهه بأنه ضغط من الأعلى</p></div></div>
  <div class="card navy"><div class="hd">التغير اللاواعي <span class="en">unconscious change</span></div><div class="bd"><p>لا يدركه المتكلم: أدنى من مستوى الوعي</p><p class="k" style="font-size:35px;margin-top:6px;color:var(--ink2)">↓ تغير من الأسفل <span class="en">change from below</span></p><p class="mut" style="font-size:27px">ويصف الكتاب اتجاهه بأنه ضغط من الأسفل</p></div></div>
 </div>
 <div class="stack" style="margin-top:30px">''' +
 box('term', 'ملمح صرفي', 'يتنقّل الكتاب بين (التغيير الواعي/اللاواعي) (ص 79) و(التغير الواعي/اللاواعي) (ص 80)؛ و(التغيّر) مصدر المطاوع يصدق على النوعين، فهو الأدق.') +
 box('read', 'قراءة', 'يقرن الكتاب المبالغة بالتغير الواعي (ص 79)، ونوعَ البريستيج بنوع التغير (ص 80)؛ فالوعي إذن هو المتغير الذي تتفرع عنه الظاهرتان التاليتان.') + '</div>'},
 # 7 hypercorrection
 {'q': 2, 'title': 'المبالغة في التصحيح: <em>حرص يتجاوز حدّه</em>', 'src': A + '، ص 79–80، 83، عن Aitchison', 'html':
 DEF('hypercorrection', 'استعمال تغير لغوي بشكل مبالغ فيه، وفي سياقات قد لا يوجد فيها أصلًا (ص 79).') + '''
 <div class="chain"><div class="c">تغير واعٍ أو ضغط من الأعلى</div><div class="op">←</div><div class="c">حرص على الصيغة ذات المكانة</div><div class="op">←</div><div class="c res">إفراط أو مدّ إلى غير موضعها</div></div>
 <div class="grid2" style="margin-top:34px">
  <div class="stack">''' + box('', 'شاهد لاباف', 'نطق /r/ في نيويورك: ترتبط المبالغة بالطبقة، وهي عند الإناث أكثر منها عند الذكور (ص 80).', 'style="background:#fff;border:1.5px solid #cbd5e0"').replace('class="tag"', 'class="tag" style="background:var(--gray);color:var(--ink2)"') +
  box('crit', 'تدقيق', 'يجعل الكتاب أشدّها في (الطبقة الدنيا) (ص 80)، ثم يحدّدها بـ(الطبقة المتوسطة-الدنيا) (ص 83)؛ والثاني أدق، والدراسة يعرضها المتحدث الرابع.') + '''</div>
  <div class="stack">''' + box('read', 'قراءة', 'المبالغة دليل وعي بقيمة الصيغة وحرص زائد عليها؛ فهي تصدر عمّن يعرف القاعدة ويخشى مخالفتها.') +
  box('ex', 'مثال توضيحي', 'قطع همزة الوصل في درج الكلام تحرّيًا للفصاحة:<br>' + x('وَاسْتِخْدَام', 'وَإِسْتِخْدَام')) + '''</div>
 </div>'''},
 # 8 prestige
 {'q': 2, 'title': 'البريستيج: <em>قيمة تُضاف إلى التغير</em>', 'src': A + '، ص 80، 174–175', 'html':
 DEF('prestige', '(عنصر إضافي) يضفي على التغيرات الحاصلة قيمة اجتماعية-اقتصادية إيجابية، ويجعلها (موضع إعجاب أعضاء المجتمع) (ص 80).') + '''
 <div class="grid2">
  <div class="card"><div class="hd">الظاهر <span class="en">overt</span></div><div class="bd"><p>رغبة في صيغ الطبقة العليا، ويصاحب عادةً التغير الواعي</p><p style="font-size:28px;margin-top:6px;color:var(--ink2)"><b>مثال توضيحي:</b> ضيف تلفزيوني يعدل عن (وايد، زين) إلى (كثيرًا، جيد).</p></div></div>
  <div class="card navy"><div class="hd">الخفي <span class="en">covert</span></div><div class="bd"><p>رغبة في صيغ الطبقة الدنيا أو العاملة، ويصاحب عادةً التغير اللاواعي</p><p style="font-size:28px;margin-top:6px;color:var(--ink2)"><b>مثال توضيحي:</b> شاب ميسور تتسرب إلى كلامه ألفاظ الشارع دون قصد.</p></div></div>
 </div>
 <div class="stack" style="margin-top:24px">''' + box('term', 'ربط', 'الفصحى (النوع الأعلى) في ازدواجية (مستقرة نسبيًّا) (ص 174–175): هيبتها ظاهرة، ولا تحوّل الكلام اليومي إليها؛ فالبريستيج الظاهر وحده لا يصنع تغيرًا.') +
 box('read', 'قراءة', 'البريستيج يفسّر <b>لماذا</b> يُقبَل التغير الحاصل، والتموج يفسّر <b>كيف</b> ينتشر: الأول قيمة مضافة، والثاني مسار.') + '</div>'},
 # 9 network + bridge
 {'title': 'شبكة المحور: <em>كيف تترابط المفاهيم؟</em>', 'src': A + '، ص 71، 77، 79–80', 'html': '''
 <table>
  <tr>''' + CORNER.format(w=400) + '''<th style="background:var(--rust)">التغير الواعي</th><th>التغير اللاواعي</th></tr>
  <tr><td class="rh">الاتجاه</td><td class="hl">من الأعلى: أعلى من مستوى الوعي</td><td>من الأسفل: أدنى من مستوى الوعي</td></tr>
  <tr><td class="rh">البريستيج المصاحب (عادةً)</td><td class="hl">ظاهر</td><td>خفي</td></tr>
  <tr><td class="rh">ظاهرة مرافقة</td><td class="hl">المبالغة في التصحيح</td><td class="mut">لا يذكر الكتاب مقابلًا لها</td></tr>
 </table>''' + box('read', 'قراءة', 'لأن الكتاب يجعل (كل تغيير جديد) موجة تنتقل من مركزها (ص 77)، فالتموج يرسم مسار الانتشار في الحالتين.', 'style="margin-top:24px"') + '''
 <div class="step" style="margin-top:24px;background:var(--greent);border-color:#b6d4c5;display:flex;align-items:center;justify-content:space-between;gap:22px">
  <span>والعوامل الخارجية عامةً (مصادر أو مكامن محتملة) للتغير، تحتويها ثلاثة تنوعات (ص 71):<br><b class="k" style="font-size:34px;color:var(--green)">جغرافي · اجتماعي · فردي</b></span>
  <span class="who" style="background:var(--green);color:#fff;margin:0;white-space:nowrap;font-size:26px;padding:6px 22px 10px">يفصّلها المتحدث الرابع</span></div>'''},
 # 10 refs
 {'title': 'مرجع المحور', 'html': '''
 <p style="font-size:34px;padding-right:60px;text-indent:-60px">الأحمري، موسى. (2022). <b>لغويات اجتماعية: لهجات المجتمع ومعالم الهوية</b>. الدار العربية للعلوم ناشرون.</p>
 <p class="mut" style="margin-top:34px;font-size:29px">ويُحال إلى <span class="en">Labov (2001)</span> و<span class="en">Ferguson (1959)</span> و<span class="en">Wardhaugh</span> و<span class="en">Aitchison</span> كما وردت في الأحمري (2022).</p>
 <p class="mut" style="margin-top:14px;font-size:29px">والأمثلة الموسومة (مثال توضيحي) من إعداد العارض.</p>'''},
]

NOTES = {
 1: 'السلام عليكم. عرض زميلاي الدوافع الداخلية للتغير ومظاهره، وأنتقل الآن إلى الوجه الآخر: المجتمع. ومحوري العوامل الاجتماعية الباعثة على التغير.',
 2: 'هذا المحور حلقة وصل: قبله دوافع من داخل النظام اللغوي، وبعده أبعاد يفصّلها زميلي المتحدث الرابع. ولن أعرض المادة بترتيب صفحاتها، بل أجمعها حول سؤالين. وأبدأ بالأول لأن الكتاب يجعل التنوع اللغوي أهم جانب في دراسة هذه العوامل، إذ من خلاله نحدد العامل الاجتماعي؛ فلا بد أولًا أن نعرف متى يكون التنوع تغيرًا.',
 3: 'والفرق الأهم في رأيي ليس المنبع بل الأمد: الداخلية طويلة الأمد، والاجتماعية مؤقتة في معظم أشكال التنوع، وقد لا يتجاوز أثرها جيلًا واحدًا. ومن هنا استدلال المؤلف: ما دام العامل مؤقتًا، وكان ما لم يوثَّق في حينه لا سبيل إلى معرفته، فتفيد هنا الدراسة الوصفية التزامنية التي ترصد الكلام اليومي العفوي لحظة حدوثه. لكن للمنهج حدًا: الصورة التزامنية وحدها لا تكشف الاتجاه، فنحتاج إلى مقارنة الأجيال.',
 4: 'ثم ينبّه المؤلف إلى أن التنوع ليس دليلًا على التغير ما لم تتوافر أدلة كافية. ويذكر، نقلًا عن لاباف، نوعًا مهمًا لا يُفضي إلى تغير: التنوع المستقر طويل الأمد، وهو قديم واسع الاستعمال، وقد يرتبط بالطبقة. وهنا مفارقة: الكتاب يصف العوامل الاجتماعية بأنها مؤقتة في معظم أشكال التنوع، وهذا التنوع الطبقي طويل الأمد. وقراءتي أن كلمة معظم تترك موضعًا لهذا الاستثناء: فالطبقة تسم الصيغة ولا تدفعها إلى التغير. ومثاله عندنا تحقيق الهمز وتخفيفه: رأس وراس، وجهان قديمان متعايشان، والمهموز أرفع مقامًا.',
 5: 'فإذا ثبت التغير، فكيف ينتشر؟ تجيب نظرية التموج، نقلًا عن واردو: كل تغيير جديد أشبه بموجة تنطلق من مركز جماعة متماسكة، ثم تخفت كلما ابتعدت لضعف الروابط. لكن الكتاب يضيف قيدًا مهمًا: مدى الموجة يزيد وينقص باختلاف العوامل الاجتماعية الأخرى؛ فالمسافة وحدها لا تكفي، ولعل البريستيج من تلك العوامل كما سنرى. وهي تكمّل الانتشار المفرداتي الذي عرضه زميلي: ذاك بين الكلمات، وهذه بين المتكلمين.',
 6: 'ثم يقسّم الكتاب التغير بحسب وعي المتكلم: واعٍ أعلى من مستوى الوعي، ويوصف اتجاهه بأنه ضغط من الأعلى، أي تغير من الأعلى؛ ولاواعٍ أدنى من مستوى الوعي، ويوصف بأنه ضغط من الأسفل. وأضيف ملمحًا صرفيًا: الكتاب يتنقّل بين التغيير والتغيّر، والتغيير يقتضي قاصدًا فلا يناسب اللاواعي، أما التغيّر فمصدر المطاوع يصدق على النوعين، ولذلك التزمت به. والوعي هو المتغير الذي تتفرع عنه الظاهرتان التاليتان.',
 7: 'أولاهما المبالغة في التصحيح: استعمال تغير لغوي بشكل مبالغ فيه حتى في غير موضعه، وتنشأ عادة مع التغير الواعي. وأفهم من ذلك أن الصيغة المبالغ فيها صيغة ذات مكانة. وشاهدها عند لاباف نطق الراء في نيويورك. وعندنا مثال قريب: من يقطع همزة الوصل في وسط الكلام تحرّيًا للفصاحة، فيقول: وَإِستخدام. والهمز هنا ضغط من الأعلى تمارسه الفصحى. فالمبالغة تصدر عمّن يعرف القاعدة ويخشى مخالفتها. وأنبّه إلى أن الكتاب يجعل أشدّها في الطبقة الدنيا، ثم يحدّدها في الصفحة 83 بالطبقة المتوسطة الدنيا، والثاني أدق.',
 8: 'والمفهوم الثاني البريستيج، ويصفه الكتاب بأنه عنصر إضافي، أي أنه لا ينشئ التغير، بل يمنحه قيمة تجعله مرغوبًا. الظاهر منه رغبة في صيغ الطبقة العليا، ويصاحب عادة التغير الواعي، والخفي رغبة في صيغ الطبقة الدنيا أو العاملة، ويصاحب عادة اللاواعي. وفي الازدواجية عند فيرغسون تبدو الفصحى النوع الأعلى، هيبتها ظاهرة، ومع ذلك لا تحوّل كلامنا اليومي إليها، لأن الازدواجية حالة مستقرة نسبيًا. فالبريستيج يفسر لماذا يُقبل التغير، والتموج يفسر كيف ينتشر.',
 9: 'وإذا جمعنا هذه المفاهيم المتفرقة في جدول واحد ظهر منطق المحور: الوعي يحدد الاتجاه، ويقترن به عادة نوع البريستيج، والمبالغة في التصحيح ترافق الجانب الواعي. ولأن الكتاب يجعل كل تغيير جديد موجة، فالتموج يرسم المسار في الحالتين. والعوامل الخارجية عامةً يعدّها الكتاب مصادر أو مكامن محتملة للتغير لا حتمية، وتحتويها ثلاثة تنوعات: جغرافي واجتماعي وفردي. وأترك الكلمة لزميلي المتحدث الرابع.',
}
