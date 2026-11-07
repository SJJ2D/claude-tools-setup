"""مكتبة المؤثرات والموسيقى المسجّلة (alvana-audio، CC0 غالباً) — بحث وتنزيل ملف بملف بدل المستودع كاملاً (712MB).
  python3 sfx_fetch.py search whoosh            → يعرض أفضل النتائج (id، المدة، الرخصة)
  python3 sfx_fetch.py search --music upbeat    → موسيقى حسب المزاج/الوسم (lofi, upbeat, funk, chiptune, calm, horror...)
  python3 sfx_fetch.py get sfx/whoosh/whoosh-03 music/upbeat/xyz   → ينزّل إلى ~/tools/sfx/ ويطبع المسار
  python3 sfx_fetch.py credits <ids...>         → سطور الحقوق (إلزامية لـ CC-BY، ومستحبة لـ CC0)
الفهرس مثبّت على commit محدد. كل عنصر يحمل رخصته؛ أي شيء غير CC0 يُطبع بوضوح."""
import sys, os, json, urllib.request, ssl
REPO, SHA = 'seyedpouramir/alvana-audio', '2f72421901cab835406ea29e87a9d11702030551'
RAW = f'https://raw.githubusercontent.com/{REPO}/{SHA}/'
HOME = os.path.expanduser('~/tools/sfx'); os.makedirs(HOME, exist_ok=True)
CA = os.path.expanduser('~/tools/ca-all.pem'); CTX = ssl.create_default_context(cafile=CA) if os.path.exists(CA) else None

def fetch(path, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0: return dest
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    req = urllib.request.Request(RAW + path, headers={'User-Agent': 'claude-tools-setup'})
    with urllib.request.urlopen(req, context=CTX, timeout=60) as r, open(dest + '.part', 'wb') as f: f.write(r.read())
    os.replace(dest + '.part', dest); return dest

def index():
    p = os.path.join(HOME, f'index-{SHA[:7]}.json'); fetch('index.json', p); return json.load(open(p))

def score(item, words):
    hay = ' '.join([item.get('id', ''), item.get('cat', ''), item.get('mood', ''), item.get('title', '')] + item.get('tags', [])).lower()
    return sum(3 if w in item.get('tags', []) else 1 for w in words if w in hay)

def main(a):
    if not a: print(__doc__); return
    I = index(); allx = {x['id']: x for x in I['sfx'] + I['music']}
    if a[0] == 'search':
        music = '--music' in a; words = [w.lower() for w in a[1:] if w != '--music']
        pool = I['music'] if music else I['sfx']
        hits = sorted((x for x in pool if score(x, words) > 0), key=lambda x: (-score(x, words), x.get('dur', 0)))[:25]
        for x in hits:
            extra = f"bpm {x.get('bpm')} {x.get('intensity', '')}" if music else x.get('tone', '')
            flag = '' if x.get('lic') == 'CC0-1.0' else f"   ⚠ {x.get('lic')} (حقوق إلزامية)"
            print(f"{x['id']:<42} {x.get('dur', 0):6.2f}s  {extra}{flag}")
        if not hits: print('لا نتائج. جرّب: impact ui foley footsteps whoosh riser ambience water door paper explosion / --music lofi upbeat calm')
    elif a[0] == 'get':
        for i in a[1:]:
            x = allx[i]; d = fetch(x['file'], os.path.join(HOME, x['file'])); print(d, '' if x.get('lic') == 'CC0-1.0' else f"⚠ {x.get('lic')}")
    elif a[0] == 'credits':
        S = I['sources']
        for i in a[1:]:
            x = allx[i]; s = S.get(x.get('pack'), {}); print(f"{x.get('title', x['id'])} — {x.get('artist', s.get('author', '?'))} · {x.get('lic')} · {s.get('url', '')}")

if __name__ == '__main__': main(sys.argv[1:])
