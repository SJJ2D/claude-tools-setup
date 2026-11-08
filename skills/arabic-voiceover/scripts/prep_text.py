"""تجهيز نص عربي قبل أي محرك صوت (ElevenLabs أو Chatterbox أو غيره).
python prep_text.py "<نص أو ملف>" [--dialect msa|gulf] [--tashkeel none|light|inner|waqf|full] [--json]

ما يفعله بالترتيب:
1. تطبيع: حذف التطويل، توحيد الترقيم (, ; ? → ، ؛ ؟)، ... → …، مسافات.
2. الأرقام → كلمات (num2words بالفصحى؛ في الخليجي تُقلب العشرات: عشرون → عشرين). % → بالمئة.
3. تحذير بالكلمات اللاتينية (اكتبها بحروف عربية كما تُنطق).
4. التشكيل (CATT، يحتاج ~/tools/arabic-venv):
   none  بلا تشكيل (الأصل للهجة).
   light الشدة وتنوين الفتح فقط (التضعيف أهم ما يفوت المحرك، وتنوين الضم/الكسر من CATT يخطئ كثيراً فيُسمع خطؤه).
   inner تشكيل بنية الكلمة دون الإعراب: تُحذف حركة آخر كل كلمة (تبقى الشدة وتنوين الفتح). يفكّ اللبس (عَلِم/عِلْم) ويتجنب أخطاء الإعراب.
   waqf  تشكيل كامل مع حذف حركة آخر كلمة قبل كل علامة وقف (كما يقرأ المذيع: يُعرب في الوصل ويسكّن عند الوقف).
   full  تشكيل كامل.
   CATT يخطئ في الكلمات الملتبسة (مثل «علم» فعلاً أو اسماً): التشكيل اليدوي في النص يُحترم ولا يُستبدل.
5. تقسيم إلى جمل مع زمن الوقفة بعد كل جملة حسب الترقيم (للتجميع: assemble يضع الصمت بالضبط).
--json يطبع [{text, pause}] بدل النص.
"""
import sys, os, re, json

DIAC = 'ًٌٍَُِّْٰ'  # ً ٌ ٍ َ ُ ِ ّ ْ ٰ
DRE = f'[{DIAC}]'
# زمن الوقفة (ث) بعد كل علامة. الفاصلة داخل الجملة يتركها النموذج يتنفس، والتجميع يقصّها إلى ≤ 0.24ث.
PAUSE = {'،': 0.20, '؛': 0.30, ':': 0.30, '.': 0.50, '؟': 0.50, '!': 0.45, '…': 0.65, '—': 0.12, '\n': 0.80}
SENT_END = '.؟!…\n'
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


def diacritize(t, mode):
    if mode == 'none':
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


def sentences(t):
    out, buf = [], ''
    for ch in t:
        buf += ch
        if ch in SENT_END:
            s = buf.strip()
            if s:
                out.append({'text': s.rstrip('\n'), 'pause': PAUSE[ch]})
            buf = ''
    if buf.strip():
        out.append({'text': buf.strip(), 'pause': 0.5})
    return out


def prep(text, dialect='msa', tashkeel=None):
    tashkeel = tashkeel or ('waqf' if dialect == 'msa' else 'none')
    latin = sorted(set(re.findall(r'[A-Za-z][A-Za-z0-9\-]+', text)))
    t = diacritize(normalize(text, dialect), tashkeel)
    return t, sentences(t), latin


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    opt = lambda k, d: a[a.index(k) + 1] if k in a else d
    src = a[0]
    text = open(src, encoding='utf-8').read() if os.path.isfile(src) else src
    t, sents, latin = prep(text, opt('--dialect', 'msa'), opt('--tashkeel', None))
    if latin:
        print('⚠ كلمات لاتينية (اكتبها بالعربي كما تُنطق):', ' '.join(latin), file=sys.stderr)
    print(json.dumps(sents, ensure_ascii=False, indent=1) if '--json' in a else t)
