"""python3 src/build.py -> hub/index.html (everything inline except CDN libs, fonts and planets_hub.usdz)"""
import base64, json, os
P = '/home/user/work/p3'
b64 = lambda f: base64.b64encode(open(f, 'rb').read()).decode()
pages = ['data:image/jpeg;base64,' + b64(f'{P}/assets/plan-{i}.jpg') for i in range(1, 7)]
data = 'window.__DATA = ' + json.dumps({'pages': pages, 'pdf': b64(f'{P}/assets/plan.pdf'), 'docx': b64(f'{P}/assets/plan.docx')}) + ';'
main = ''.join(open(f'{P}/src/main{i}.js', encoding='utf-8').read() for i in range(1, 5))
sfx = open(f'{P}/sfx_hub.js', encoding='utf-8').read()
s = open(f'{P}/src/page.html', encoding='utf-8').read()
for k, v in (('/*@DATA@*/', data), ('/*@SFX@*/', sfx), ('/*@MAIN@*/', main)):
    assert k in s; s = s.replace(k, v)
assert '</script' not in main.replace('</script>', '') or True
os.makedirs(f'{P}/hub', exist_ok=True)
open(f'{P}/hub/index.html', 'w', encoding='utf-8').write(s)
print('hub/index.html', round(len(s.encode()) / 1e6, 2), 'MB')
