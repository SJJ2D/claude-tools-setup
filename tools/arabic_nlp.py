"""تشكيل نص عربي (CATT) أو تقدير مستوى صعوبته (BAREC، 19 مستوى؛ تقريباً 1–6 روضة/أول، ~6 ثاني، ≤11 حتى الرابع).
python arabic_nlp.py tashkeel|readability "<نص أو مسار ملف>"
القراءة تُقدَّر لكل جملة ثم يُعرض المتوسط والأعلى. النتائج تقديرية: يراجعها المعلم."""
import sys, os, re
mode, arg = sys.argv[1], sys.argv[2]
text = open(arg, encoding='utf-8').read() if os.path.isfile(arg) else arg
sents = [s.strip() for s in re.split(r'[.!؟?\n]+', text) if s.strip()]
if mode == 'tashkeel':
    from catt_tashkeel import CATTEncoderDecoder
    for s in CATTEncoderDecoder().do_tashkeel_batch(sents, verbose=False): print(s)
elif mode == 'readability':
    from transformers import pipeline
    clf = pipeline('text-classification', model='CAMeL-Lab/readability-camelbert-word-CE')
    lv = [int(clf(s)[0]['label'][6:]) + 1 for s in sents]
    for s, l in zip(sents, lv): print(f'{l:>2}  {s}')
    print(f'\nالمتوسط {sum(lv)/len(lv):.1f} | الأعلى {max(lv)} | عدد الجمل {len(lv)}  (مقياس BAREC من 1 إلى 19)')
else: sys.exit('mode: tashkeel | readability')
