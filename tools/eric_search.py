"""بحث ERIC (قاعدة البحوث التربوية الأمريكية، مجانية بلا مفتاح) مع مرجع APA 7 جاهز لكل نتيجة.
python3 eric_search.py "early literacy phonics" [--n 10] [--since 2016] [--peer] [--full] [--json]
  --since سنة النشر الأدنى، --peer المحكّمة فقط، --full يطبع الملخص كاملاً.
مهم: المرجع مبني من بيانات ERIC؛ تأكد من الصفحات والعدد من المصدر قبل التسليم (مهارة citation-verification)، ولا تذكر بحثاً لم تقرأ ملخصه.
"""
import sys, json, re, html, urllib.request, urllib.parse, ssl, os

a = sys.argv[1:]
if not a or a[0].startswith('--'):
    sys.exit(__doc__)
opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
q, n, since = a[0], opt('--n', 10), opt('--since', 0)
query = q + (f' publicationdateyear:[{since} TO 3000]' if since else '') + (' peerreviewed:T' if '--peer' in a else '')
url = 'https://api.ies.ed.gov/eric/?' + urllib.parse.urlencode({
    'search': query, 'format': 'json', 'rows': n,
    'fields': 'id,title,author,publicationdateyear,source,url,peerreviewed,description,publicationtype,doi'})
ca = os.path.expanduser('~/tools/ca-all.pem')
ctx = ssl.create_default_context(cafile=ca) if os.path.exists(ca) else None
docs = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'claude-tools-setup'}), context=ctx, timeout=30))['response']['docs']


def apa_author(name):  # "Foster, Wayne A." → "Foster, W. A." ؛ "Deepti Bora" → "Bora, D."
    name = name.strip()
    last, first = (name.split(',', 1) if ',' in name else (name.split()[-1], ' '.join(name.split()[:-1])))
    ini = ' '.join(p[0] + '.' for p in re.split(r'[\s.]+', first.strip()) if p)
    return f'{last.strip()}, {ini}'.strip(', ')


def apa(d):
    au = [apa_author(x) for x in d.get('author', [])]
    au = (', '.join(au[:-1]) + ', & ' + au[-1]) if len(au) > 1 else (au[0] if au else '')
    doi = d.get('doi') or (re.search(r'10\.\d{4,}/\S+', d.get('url', '')) or [None])[0]
    tail = f'https://doi.org/{doi}' if doi else f"https://eric.ed.gov/?id={d['id']}"
    src = f" *{d['source']}*." if d.get('source') else ''
    return f"{au} ({d.get('publicationdateyear', 'n.d.')}). {html.unescape(d['title']).rstrip('.')}.{src} {tail}"


if '--json' in a:
    print(json.dumps([{**d, 'apa': apa(d)} for d in docs], ensure_ascii=False, indent=1)); sys.exit()
for i, d in enumerate(docs, 1):
    desc = html.unescape(d.get('description', ''))
    print(f"{i}. [{d['id']}] {'محكّم' if d.get('peerreviewed') == 'T' else 'غير محكّم'} · {', '.join(d.get('publicationtype', []))}")
    print('   ' + apa(d))
    print('   ' + (desc if '--full' in a else desc[:300] + ('…' if len(desc) > 300 else '')) + '\n')
