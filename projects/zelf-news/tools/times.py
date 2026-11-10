"""times.py — print the CURRENT cut and line times (timeline.js is regenerated when the real voice replaces the estimates).
python3 tools/times.py [S3]   → all cuts + lines, or only the lines/words inside one scene"""
import json, sys, os, re
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TL = json.loads(re.search(r'window\.ZN_TL = (.*);\s*$', open(os.path.join(R, 'timeline.js'), encoding='utf-8').read(), re.S).group(1))
only = sys.argv[1] if len(sys.argv) > 1 else None
print(f"dur {TL['dur']}  real_voice={TL.get('real_voice')}")
for cid, (a, b) in TL['cuts'].items():
    if only and cid != only: continue
    print(f'{cid:4s} {a:6.2f} → {b:6.2f}')
    for lid, (s, e) in TL['lines'].items():
        if a - 0.01 <= s < b:
            print(f'   {lid:4s} {s:6.2f}–{e:6.2f}  ' + '  '.join(f'{w[1]}@{w[0]:.2f}' for w in TL['words'][lid]))
