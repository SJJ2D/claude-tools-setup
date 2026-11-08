"""تجهيز نص عربي قبل أي محرك صوت (ElevenLabs أو Chatterbox أو غيره).
python prep_text.py "<نص أو ملف>" [--dialect msa|gulf] [--tashkeel keep|none|light|inner|waqf|full] [--engine chatterbox|eleven] [--check] [--json]

الطريقة الموصى بها (الفصحى): Claude يشكّل النص بنفسه (أدق من CATT: ~4.7% خطأ كلمات مقابل ~20% لـCATT في الأخبار،
Sadeed arXiv 2504.21635) ثم: --tashkeel keep --check  → CATT يراجع ويطبع الكلمات المختلفة في البنية لتراجعها.

ما يفعله بالترتيب:
1. تطبيع: حذف التطويل، توحيد الترقيم (, ; ? → ، ؛ ؟)، ... → …، مسافات.
2. الأرقام → كلمات (num2words بالفصحى؛ في الخليجي تُقلب العشرات: عشرون → عشرين). % → بالمئة.
3. تحذير بالكلمات اللاتينية (اكتبها بحروف عربية كما تُنطق).
4. التشكيل (CATT، يحتاج ~/tools/arabic-venv):
   keep  أبقِ تشكيل النص كما هو (بعد التطبيع). مع --check يقارن بـCATT.
   none  بلا تشكيل (الأصل للهجة).
   light الشدة وتنوين الفتح فقط (التضعيف أهم ما يفوت المحرك، وتنوين الضم/الكسر من CATT يخطئ كثيراً فيُسمع خطؤه).
   inner تشكيل بنية الكلمة دون الإعراب: تُحذف حركة آخر كل كلمة (تبقى الشدة وتنوين الفتح). يفكّ اللبس (عَلِم/عِلْم) ويتجنب أخطاء الإعراب.
   waqf  تشكيل كامل مع حذف حركة آخر كلمة قبل كل علامة وقف (كما يقرأ المذيع: يُعرب في الوصل ويسكّن عند الوقف).
   full  تشكيل كامل.
   CATT يخطئ في الكلمات الملتبسة (مثل «علم» فعلاً أو اسماً): التشكيل اليدوي في النص يُحترم ولا يُستبدل.
5. تقسيم إلى مقاطع مع زمن الوقفة بعد كل مقطع حسب الترقيم (assemble_vo.py يضع الصمت بالضبط).
   chatterbox: يقسم عند . ؟ ! … ؛ : وسطر جديد (المحرك يحوّل … و: و؛ إلى فاصلة فتضيع الوقفة إن لم نقسم).
   eleven: لا تقسيم داخل الفقرة؛ v3/v4 تتجاهل <break>، فالوقفة بـ«…» و[short pause] و[long pause].
--json يطبع [{text, pause}] بدل النص.
"""
import sys, os, re, json

DIAC = 'ًٌٍَُِّْٰ'  # ً ٌ ٍ َ ُ ِ ّ ْ ٰ
DRE = f'[{DIAC}]'
# زمن الوقفة (ث) بعد كل علامة. الفاصلة داخل الجملة يتركها النموذج يتنفس، والتجميع يقصّها إلى ≤ 0.24ث.
# مقترح مبني على سلّم Azure للوقفات (250/500/750/1000 مللي ث)؛ اضبطه على تسجيل حقيقي.
PAUSE = {'،': 0.22, '؛': 0.32, ':': 0.32, '.': 0.50, '؟': 0.55, '!': 0.55, '…': 0.75, '—': 0.14, '\n': 1.10}
CUT = {'chatterbox': '.؟!…؛:\n', 'eleven': '\n'}
# الصيغة المنطوقة الشائعة (عام ألفين وستة وعشرين، بنسبة اثني عشر): تُستعمل في الفصحى والخليجي.
# العدد في موضع الفاعل («شارك عشرون طالباً») اكتبه بنفسك كلمات.
TENS = {'عشرون': 'عشرين', 'ثلاثون': 'ثلاثين', 'أربعون': 'أربعين', 'خمسون': 'خمسين', 'ستون': 'ستين',
        'سبعون': 'سبعين', 'ثمانون': 'ثمانين', 'تسعون': 'تسعين', 'اثنان': 'اثنين', 'اثنا': 'اثني', 'ألفان': 'ألفين', 'مائة': 'مئة'}
GULF = {'مئة': 'مية', 'مائتان': 'ميتين'}


def num_words(m, dialect):
    from num2words import num2words
    s = m.group(0).replace('٫', '.').translate(str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789'))
    if '.' in s:
        a, b = s.split('.', 1)
        w = f"{num2words(int(a), lang='ar')} فاصلة {' '.join(num2words(int(d), lang='ar') for d in b)}"
    else:
        w = num2words(int(s), lang='ar')
    w = re.sub(r'\s+و\s+', ' و', w).replace(' ,', '').strip()
    M = {**TENS, **GULF} if dialect == 'gulf' else TENS
    return ' '.join(('و' + M[x[1:]]) if x.startswith('و') and x[1:] in M else M.get(x, x) for x in w.split())


def normalize(t, dialect='msa'):
    t = t.replace('ـ', '')
    t = re.sub(r'\.{2,}', '…', t)
    t = re.sub(r'(?<=[؀-ۿ\s]),', '،', t)
    t = re.sub(r'(?<=[؀-ۿ\s]);', '؛', t)
    t = re.sub(r'(?<=[؀-ۿ\s])\?', '؟', t)
    t = re.sub(r'([\d٠-٩]+(?:[.٫][\d٠-٩]+)?)\s*[%٪]', lambda m: m.group(1) + ' بالمئة', t)
    t = re.sub(r'(?<![A-Za-z\d])[\d٠-٩]+(?:[.٫][\d٠-٩]+)?(?![A-Za-z])', lambda m: num_words(m, dialect), t)
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r'\s+([،؛:.؟!…])', r'\1', t)
    return t.strip()


_catt = None
def catt(segs):
    global _catt
    if _catt is None:
        import contextlib
        from catt_tashkeel import CATTEncoderDecoder
        with contextlib.redirect_stdout(sys.stderr):  # CATT يطبع رسالة تحميل تفسد --json
            _catt = CATTEncoderDecoder()
    return _catt.do_tashkeel_batch(segs, verbose=False)


def merge_manual(orig, auto):
    """يحترم تشكيل المستخدم: الكلمة التي فيها تشكيل يدوي تبقى كما هي."""
    ow, aw = orig.split(), auto.split()
    if len(ow) != len(aw):
        return auto
    return ' '.join(o if re.search(DRE, o) else a for o, a in zip(ow, aw))


def strip_last(word):
    """وقف: تُحذف الحركة/التنوين الأخير وتبقى الشدة (جيّدًا → جيّدا، نورٌ → نور، المعلّمُ → المعلّم)."""
    m = re.match(f'^(.*?)({DRE}*)(ا?)({DRE}*)$', word)
    base, d1, alif, d2 = m.groups()
    keep = 'ّ' if 'ّ' in d1 + d2 else ''
    return base + keep + alif


def end_bare(word):
    """احذف حركة الإعراب الأخيرة وأبقِ الشدة وتنوين الفتح."""
    m = re.match(f'^(.*?)({DRE}*)(ا?)({DRE}*)$', word)
    base, d1, alif, d2 = m.groups()
    keep = 'ّ' if 'ّ' in d1 else ''
    if alif and 'ً' in d1 + d2:  # تنوين الفتح مع الألف مكتوب في الإملاء فهو مؤكد؛ وبلا ألف (ـةً) تخمين نحوي يُحذف
        return base + keep + 'ًا'
    return base + keep + alif


def check(t):
    """قارن تشكيل النص ببنية CATT (دون الحرف الأخير) واطبع المختلف للمراجعة."""
    plain = re.sub(DRE, '', t)
    auto = diacritize(plain, 'inner').split(); mine = t.split()
    if len(auto) != len(mine):
        print('⚠ تعذّرت المقارنة (اختلاف عدد الكلمات)', file=sys.stderr); return
    def letters(w):  # [(\u062d\u0631\u0641\u060c \u0645\u062c\u0645\u0648\u0639\u0629 \u062d\u0631\u0643\u0627\u062a\u0647)] \u0628\u0644\u0627 \u062a\u0631\u0642\u064a\u0645
        out = []
        for c in re.sub(r'[^\u0621-\u064a\u064b-\u0652\u0670]', '', w):
            if re.match(DRE, c) and out: out[-1][1].add(c)
            elif not re.match(DRE, c): out.append((c, set()))
        return out
    def differs(m, a):  # \u064a\u064f\u0642\u0627\u0631\u0646 \u0641\u0642\u0637 \u0627\u0644\u062d\u0631\u0648\u0641 \u0627\u0644\u062a\u064a \u0634\u0643\u0651\u0644\u0647\u0627 \u0627\u0644\u0627\u062b\u0646\u0627\u0646\u060c \u062f\u0648\u0646 \u0627\u0644\u062d\u0631\u0641 \u0627\u0644\u0623\u062e\u064a\u0631 (\u0627\u0644\u0625\u0639\u0631\u0627\u0628)
        lm, la = letters(m), letters(a)
        if len(lm) != len(la): return True
        return any(x[1] and y[1] and x[1] != y[1] for x, y in zip(lm[:-1], la[:-1]))
    diff = [(m, a) for m, a in zip(mine, auto) if re.search(DRE, m) and differs(m, a)]
    print(f'CATT يختلف في {len(diff)} كلمة (راجعها؛ الغالب أن تشكيلك أصح):', file=sys.stderr)
    for m, a in diff:
        print(f'  {m}  ↔  {a}', file=sys.stderr)


def diacritize(t, mode):
    if mode in ('none', 'keep'):
        return t
    # قسّم مع الاحتفاظ بالترقيم (CATT يحذفه)
    parts = re.split(r'([،؛:.؟!…—\n"«»()]|[A-Za-z][A-Za-z0-9\-]*)', t)  # الترقيم واللاتيني خارج CATT
    idx = [i for i, p in enumerate(parts) if re.search(r'[ء-ي]', p)]
    plain = [re.sub(DRE, '', parts[i]).strip() for i in idx]
    out = catt(plain)
    for i, o in zip(idx, out):
        lead = parts[i][:len(parts[i]) - len(parts[i].lstrip())]
        trail = parts[i][len(parts[i].rstrip()):]
        o = merge_manual(parts[i].strip(), o)
        if mode == 'light':
            o = re.sub('[ٌٍَُِْٰ]', '', o)  # تبقى الشدة وتنوين الفتح
            o = re.sub('ً(?!ا)(?<!اً)', '', o)  # تنوين فتح بلا ألف = تخمين نحوي
        elif mode == 'inner':
            ow = parts[i].strip().split()
            o = ' '.join(w if k < len(ow) and re.search(DRE, ow[k]) else end_bare(w) for k, w in enumerate(o.split()))
        elif mode == 'waqf':
            nxt = parts[i + 1] if i + 1 < len(parts) else '.'
            if nxt and nxt[0] in '،؛:.؟!…—\n' or i == idx[-1]:
                ws = o.split(); ws[-1] = strip_last(ws[-1]); o = ' '.join(ws)
        parts[i] = lead + o + trail
    return ''.join(parts)


def sentences(t, engine='chatterbox'):
    out, buf = [], ''
    for ch in t:
        buf += ch
        if ch in CUT[engine]:
            s = buf.strip()
            if s:
                out.append({'text': s.rstrip('\n'), 'pause': PAUSE[ch]})
            buf = ''
    if buf.strip():
        out.append({'text': buf.strip(), 'pause': 0.5})
    # مقطع أقصر من 4 كلمات يولّده المحرك وحده كلاماً مشوشاً (جُرّب: «الغيمة الصغيرة…» → «ألو ذيما تستطيع»).
    # يُدمج مع التالي، و"holds" تحفظ موضع الوقفة: assemble_vo يقصّ عند حدود الكلمة ويضع الصمت.
    merged, carry = [], None
    for s in out:
        if carry:
            n = len(carry['text'].split())
            s = {'text': carry['text'] + ' ' + s['text'], 'pause': s['pause'],
                 'holds': carry.get('holds', []) + [[n + h[0], h[1]] for h in s.get('holds', [])] + [[n, carry['pause']]]}
            s['holds'].sort()
            carry = None
        if engine == 'chatterbox' and len(s['text'].split()) < 4 and s['pause'] < 1.0:
            carry = s
        else:
            merged.append(s)
    if carry:
        merged.append(carry)
    return merged


def prep(text, dialect='msa', tashkeel=None, engine='chatterbox'):
    import unicodedata
    text = unicodedata.normalize('NFC', text)  # ترتيب ثابت للحركات مع الشدة
    has = bool(re.search(DRE, text))
    tashkeel = tashkeel or ('keep' if has else 'waqf' if dialect == 'msa' else 'none')
    latin = sorted(set(re.findall(r'[A-Za-z][A-Za-z0-9\-]+', text)))
    t = diacritize(normalize(text, dialect), tashkeel)
    return t, sentences(t, engine), latin


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    opt = lambda k, d: a[a.index(k) + 1] if k in a else d
    src = a[0]
    text = open(src, encoding='utf-8').read() if os.path.isfile(src) else src
    t, sents, latin = prep(text, opt('--dialect', 'msa'), opt('--tashkeel', None), opt('--engine', 'chatterbox'))
    if '--check' in a:
        check(t)
    if latin:
        print('⚠ كلمات لاتينية (اكتبها بالعربي كما تُنطق):', ' '.join(latin), file=sys.stderr)
    print(json.dumps(sents, ensure_ascii=False, indent=1) if '--json' in a else t)
