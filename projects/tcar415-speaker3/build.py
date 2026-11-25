# -*- coding: utf-8 -*-
"""Speaker-3 deck (TCAR415, presentation 6, axis D). Style echoes speaker 4's page plan:
Noto Kufi Arabic headings, Noto Naskh Arabic body, rust #c05621 for this axis, navy table heads."""
import json
from content import SLIDES, NOTES

CSS = r"""
@font-face{font-family:'Kufi';src:url('file:///root/.local/share/fonts/arabic/NotoKufiArabicwght.ttf');font-weight:100 900}
@font-face{font-family:'Naskh';src:url('file:///root/.local/share/fonts/arabic/NotoNaskhArabicwght.ttf');font-weight:400 700}
:root{--rust:#c05621;--peach:#fcefe4;--peachb:#e9c3b1;--ink:#1a202c;--ink2:#2d3748;--mut:#4a5568;--line:#e2e8f0;--gray:#f0f2f5;
--blue:#2b6cb0;--bluet:#ebf4fb;--purple:#6b46c1;--purplet:#f1edfb;--green:#2f855a;--greent:#e6f4ec}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Naskh',serif;color:var(--ink);direction:rtl}
@page{size:1920px 1080px;margin:0}
section.slide{width:1920px;height:1080px;position:relative;overflow:hidden;background:#fff;page-break-after:always;padding:70px 110px 90px}
.kick{font-family:'Kufi';font-size:24px;color:var(--mut);font-weight:500;display:flex;gap:14px;align-items:center}
.qp{border:2px solid var(--rust);color:var(--rust);border-radius:999px;padding:0 16px 4px;font-family:'Kufi';font-weight:700;font-size:22px;margin-right:auto}
.pill{background:var(--rust);color:#fff;border-radius:999px;padding:2px 18px 6px;font-family:'Kufi';font-weight:700;font-size:22px}
h1{font-family:'Kufi';font-weight:800;font-size:58px;line-height:1.35;margin-top:10px;color:var(--ink)}
h1 em{font-style:normal;color:var(--rust)}
.rule{height:2px;background:var(--line);margin:22px 0 34px}
.body{position:absolute;top:250px;right:110px;left:110px;bottom:100px}
.foot{position:absolute;bottom:34px;right:110px;left:110px;display:flex;justify-content:space-between;align-items:center;font-size:22px;color:var(--mut)}
.foot .pg{font-family:'Naskh';font-size:24px}
p,li,td,th,div{font-size:32px;line-height:1.6}
.k{font-family:'Kufi';font-weight:700}
.rust{color:var(--rust)}
.mut{color:var(--mut)}
.en{direction:ltr;unicode-bidi:isolate;font-family:'Naskh';font-size:.82em;color:var(--ink2)}
/* tag boxes */
.box{border-radius:16px;padding:18px 26px;position:relative}
.tag{font-family:'Kufi';font-weight:700;font-size:26px;border-radius:999px;padding:2px 16px 5px;display:inline-block;margin-left:12px;vertical-align:middle}
.read{background:var(--peach);border:1.5px solid var(--peachb)}
.read .tag{background:var(--rust);color:#fff}
.crit{background:#fff;border:2px solid var(--ink2)}
.crit .tag{background:var(--ink2);color:#fff}
.ex{background:var(--gray);border:1.5px solid var(--line)}
.ex .tag{background:#fff;color:var(--ink2);border:1.5px solid #cbd5e0}
.term{background:#fff;border:2px dashed var(--rust)}
.term .tag{background:#fff;color:var(--rust);border:1.5px solid var(--rust)}
/* tables */
table{border-collapse:separate;border-spacing:0;width:100%;border:1.5px solid var(--line);border-radius:14px;overflow:hidden}
th{background:var(--ink2);color:#fff;font-family:'Kufi';font-weight:700;font-size:28px;padding:14px 24px;text-align:right}
td{padding:14px 24px;border-top:1.5px solid var(--line);text-align:right;vertical-align:middle}
td.rh{font-family:'Kufi';font-weight:700;font-size:27px;color:var(--ink2);background:#f7f8fa;width:250px}
td.hl{background:#fff8f2}
/* flow */
.flow{display:flex;align-items:stretch;gap:0}
.step{flex:1;border-radius:16px;padding:22px 26px;border:1.5px solid var(--line);background:#fff}
.arrow{width:70px;display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:44px;font-family:'Kufi'}
.step .k{font-size:31px;display:block;margin-bottom:6px}
.step .who{font-family:'Kufi';font-size:24px;font-weight:600;border-radius:999px;padding:1px 14px 4px;display:inline-block;margin-top:10px}
.card{border:1.5px solid var(--peachb);border-radius:16px;overflow:hidden;background:#fff}
.card .hd{background:var(--peach);padding:14px 26px;font-family:'Kufi';font-weight:700;font-size:31px;color:var(--rust);display:flex;justify-content:space-between;align-items:center}
.card .hd .en{color:#9c6b52}
.card .bd{padding:16px 26px}
.card.navy{border-color:#cbd5e0}.card.navy .hd{background:#edf0f5;color:var(--ink2)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:32px}
.stack>*+*{margin-top:22px}
.q{display:flex;gap:22px;align-items:center;border:1.5px solid var(--line);border-radius:16px;padding:20px 28px}
.q .n{font-family:'Kufi';font-weight:800;font-size:46px;color:var(--rust);width:60px;text-align:center}
.q div{font-size:36px;font-family:'Kufi';font-weight:600}
.chain{display:flex;align-items:center;gap:14px}
.chain .c{flex:1;border-radius:14px;padding:16px 22px;background:#fff;border:1.5px solid var(--line);font-size:29px;text-align:center}
.chain .c.res{background:var(--rust);color:#fff;border-color:var(--rust);font-family:'Kufi';font-weight:700}
.chain .op{font-family:'Kufi';font-size:36px;color:var(--mut)}
ul.dots{list-style:none}
ul.dots li{padding-right:30px;position:relative;margin:4px 0}
ul.dots li:before{content:'';position:absolute;right:4px;top:22px;width:12px;height:12px;border-radius:50%;background:var(--rust)}
/* title slide */
.cover{display:flex;flex-direction:column;justify-content:center;height:100%;padding-left:640px}
.cover h1{font-size:84px;line-height:1.3}
.cover .sub{font-size:34px;color:var(--ink2);margin-top:18px}
.cover .src{font-size:27px;color:var(--mut);margin-top:30px}
.rings{position:absolute;left:-180px;top:50%;transform:translateY(-50%)}
/* ===== speaker-4 document look (flat, white, hairlines, thick right edge cards) ===== */
body{font-family:'Kufi'}
p,li,td,th,div{font-size:30px;line-height:1.75}
section.slide{padding:64px 110px 80px}
.kick{font-size:22px;color:#718096;font-weight:400}
.pill{font-size:19px;padding:0 14px 4px}
.qp{border:none;background:#2d3748;color:#fff;font-size:19px;padding:0 14px 4px}
h1{font-weight:700;font-size:54px;color:#1a202c;margin-top:6px}
h1 em{display:block;font-style:normal;color:#4a5568;font-weight:400;font-size:30px;margin-top:4px}
.rule{height:2px;background:#d9dee6;margin:20px 0 30px}
.body{top:280px}
.foot{justify-content:center;gap:0;font-size:20px;color:#a0aec0}
.foot span:first-child{position:absolute;right:0}
.foot .pg{font-family:'Naskh';font-size:24px;color:#a0aec0}
/* boxes -> plan footer rows: bold label + text, thick right edge */
.box{border-radius:10px;border:1.5px solid #e2e8f0;border-right:7px solid var(--rust);background:#fff;padding:14px 24px;font-size:28px}
.box .tag{background:none!important;border:none!important;color:#1a202c!important;padding:0;font-size:28px;margin-left:8px}
.box .tag:after{content:':'}
.read{border-right-color:var(--rust);background:#fdf6f0}
.crit{border-right-color:#2d3748;background:#f7f8fa}
.ex{border-right-color:#a0aec0;background:#fff}
.term{border-right-color:#6b46c1;background:#faf8fe;border-style:solid}
/* tables like the overview table */
table{border:none;border-radius:0;border-bottom:1.5px solid #e2e8f0}
th{background:#2d3748;font-size:26px;padding:12px 22px}
td{border-top:1.5px solid #e2e8f0;padding:14px 22px}
td.rh{background:#fff;font-size:27px;color:#1a202c}
td.rh:before{content:'';display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--rust);margin-left:12px;vertical-align:middle}
td.hl{background:#fff}
/* cards like the speaker cards */
.card{border:1.5px solid var(--peachb);border-right:7px solid var(--rust);border-radius:12px}
.card .hd{background:var(--peach);font-size:30px;padding:12px 24px}
.card .hd .en{color:#718096;font-size:20px}
.card .bd{padding:14px 24px}
.card.navy{border-color:#cbd5e0;border-right-color:#2d3748}.card.navy .hd{background:#edf0f5;color:#2d3748}
/* chain -> flat row of cells */
.chain{gap:0;border:1.5px solid #e2e8f0;border-radius:10px;overflow:hidden}
.chain .c{border:none;border-radius:0;font-size:26px;padding:14px 18px;background:#fff}
.chain .c.res{background:#2d3748;border:none}
.chain .op{font-size:28px;padding:0 6px;color:#a0aec0;background:#fff;align-self:stretch;display:flex;align-items:center}
ul.dots li:before{top:24px;width:11px;height:11px}
.q{border-radius:10px;border-right:7px solid var(--rust);padding:8px 24px}
.stack>*+*{margin-top:16px}
.q .n{font-family:'Naskh';font-size:40px}
.q div{font-size:32px;font-weight:600}
.cover{padding-left:0;justify-content:flex-start;padding-top:120px}
.cover h1{font-size:80px}
.cover h1 em{font-size:80px;display:inline;color:#1a202c;font-weight:700}
.cover .sub{font-size:32px;color:#4a5568;margin-top:14px}
.cover .src{font-size:24px;color:#718096;margin-top:10px;padding-bottom:30px;border-bottom:2px solid #d9dee6}
.rings{display:none}
"""

def foot(pg, src=''):
    return f'<div class="foot"><span>{src}</span><span class="pg">{pg}</span></div>'

def head(title, q=None, kick='المحور (د) · العوامل الاجتماعية الباعثة على التغير'):
    qp = f'<span class="qp">السؤال {q}</span>' if q else ''
    return f'<div class="kick"><span class="pill">د</span>{kick}{qp}</div><h1>{title}</h1><div class="rule"></div>'

def page(slides_html):
    return ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>' + CSS +
            '</style></head><body>' + slides_html + '</body></html>')

if __name__ == '__main__':
    html = ''
    for i, s in enumerate(SLIDES, 1):
        inner = s['html'] if s.get('raw') else head(s['title'], s.get('q')) + '<div class="body">' + s['html'] + '</div>'
        html += f'<section class="slide" id="s{i:02d}">{inner}{foot("" if s.get("raw") else i, s.get("src", ""))}</section>'
    open('/home/user/work/tcar415/deck/slides.html', 'w', encoding='utf-8').write(page(html))
    json.dump(NOTES, open('/home/user/work/tcar415/deck/notes.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ok', len(SLIDES))
