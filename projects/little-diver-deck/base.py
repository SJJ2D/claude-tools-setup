# -*- coding: utf-8 -*-
"""Shared look for the «الغوّاص الصغير» deck: CSS, decorations, slide frame."""

E = 'img/e/'  # Fluent emoji (MIT) color svgs

CSS = r"""
:root{
  --navy:#0E3A5B; --ink:#16324C; --body:#30495F; --muted:#5A7386;
  --teal:#0F9FB2; --teal2:#1BB8C4; --aqua:#8FE0E4; --foam:#EAF9F9;
  --sand:#FFF0D2; --sand2:#F6DDA8; --coral:#F2683F; --coral2:#FF8A65;
  --sun:#FFC83A; --pearl:#FFFDF7; --pink:#F06A9B; --violet:#6C5CE7; --green:#22A37A;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#d9e7ea}
@page{size:1920px 1080px;margin:0}
.slide{width:1920px;height:1080px;position:relative;overflow:hidden;font-family:'Tajawal',sans-serif;color:var(--ink);
  background:radial-gradient(ellipse at 85% 0%,#FFFFFF 0%,rgba(255,255,255,0) 55%),linear-gradient(180deg,#EFFCFC 0%,#DDF6F6 50%,#C4EEF0 100%);
  page-break-after:always;break-after:page;direction:rtl}
.slide:last-child{page-break-after:auto;break-after:auto}
.abs{position:absolute}
.baloo{font-family:'Baloo Bhaijaan 2',sans-serif}
/* ---------- decorations ---------- */
.waves{position:absolute;left:0;bottom:0;width:1920px;height:150px}
.weed{position:absolute;bottom:40px;width:150px}
.bub{position:absolute;border-radius:50%;background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.95) 0 18%,rgba(255,255,255,.35) 19% 55%,rgba(143,224,228,.25) 56%);border:2px solid rgba(255,255,255,.8)}
.foot{position:absolute;bottom:26px;right:120px;font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:.2px;text-shadow:0 1px 3px rgba(4,40,60,.55)}
.foot b{color:#FFFFFF}
.pg{position:absolute;bottom:18px;left:96px;width:68px;height:68px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#FFFFFF 0 25%,#F7F1E3 60%,#E7DCC5 100%);box-shadow:0 6px 14px rgba(14,58,91,.25);
  display:flex;align-items:center;justify-content:center;font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:30px;color:var(--navy)}
/* ---------- title block ---------- */
.head{position:absolute;top:58px;right:110px;left:110px;display:flex;align-items:center;gap:26px}
.badge{flex:none;width:112px;height:112px;border-radius:34px;background:#FFFFFF;box-shadow:0 10px 24px rgba(14,58,91,.14);display:flex;align-items:center;justify-content:center;transform:rotate(-4deg)}
.badge img{width:78px;height:78px}
.kick{font-size:28px;font-weight:800;color:var(--coral);margin:0 0 2px 0}
.ttl{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:66px;line-height:1.08;color:var(--navy);margin:0}
.ttl span{color:var(--teal)}
/* ---------- content ---------- */
.body{position:absolute;top:212px;right:110px;left:110px;bottom:170px}
.card{background:var(--pearl);border-radius:34px;box-shadow:0 14px 34px rgba(14,58,91,.12);border:3px solid #FFFFFF;padding:30px 36px;position:relative}
.card h3{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:38px;line-height:1.15;margin:0 0 12px 0;color:var(--navy);display:flex;align-items:center;gap:14px}
.card h3 img{width:54px;height:54px}
.card p,.card li{font-size:28px;line-height:1.62;color:var(--body);margin:0}
.card ul{margin:0;padding:0 30px 0 0}
.card li{margin:0 0 8px 0}
.card li::marker{color:var(--teal)}
.pill{display:inline-block;padding:6px 22px;border-radius:999px;font-weight:800;font-size:26px;color:#fff;background:var(--teal)}
.tag{display:inline-block;padding:4px 16px;border-radius:999px;font-weight:800;font-size:24px}
b.k{color:var(--navy);font-weight:800}
.muted{color:var(--muted)}
.grid{display:grid;gap:28px}
.row{display:flex;gap:28px}
table.t{width:100%;border-collapse:separate;border-spacing:0;background:var(--pearl);border-radius:28px;overflow:hidden;box-shadow:0 14px 34px rgba(14,58,91,.12)}
table.t th{background:var(--navy);color:#fff;font-size:28px;font-weight:800;padding:18px 24px;text-align:right}
table.t td{font-size:26px;line-height:1.5;color:var(--body);padding:16px 24px;border-top:2px solid #EAF2F3;vertical-align:top}
table.t tr:nth-child(even) td{background:#F5FBFB}
"""

WAVES = """<svg class="waves" viewBox="0 0 1920 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 46 C160 6 320 6 480 40 C640 74 800 74 960 40 C1120 6 1280 6 1440 40 C1600 74 1760 74 1920 40 L1920 150 L0 150 Z" fill="#8FE0E4"/>
<path d="M0 72 C200 36 360 40 560 70 C760 100 920 100 1120 70 C1320 40 1500 40 1700 70 C1800 85 1860 86 1920 78 L1920 150 L0 150 Z" fill="#33BFCB"/>
<path d="M0 100 C240 78 440 80 680 98 C920 116 1120 116 1360 98 C1600 80 1760 82 1920 96 L1920 150 L0 150 Z" fill="#0F9FB2"/>
</svg>"""

def weed(side='left', x=40, h=210, color='#22A37A', color2='#3CC48D'):
    pos = f'{side}:{x}px'
    return f"""<svg class="weed" style="{pos};height:{h}px" viewBox="0 0 150 210" xmlns="http://www.w3.org/2000/svg">
<path d="M40 210 C20 160 70 130 44 92 C22 60 60 30 48 0 C78 34 54 64 74 96 C96 132 52 160 66 210 Z" fill="{color}"/>
<path d="M96 210 C84 176 120 150 104 118 C92 92 116 72 110 48 C132 76 118 100 128 124 C140 154 112 176 118 210 Z" fill="{color2}"/>
</svg>"""

def bubbles(spec):
    """spec: list of (side, x, top, size)"""
    return ''.join(f'<div class="bub" style="{s}:{x}px;top:{t}px;width:{d}px;height:{d}px"></div>' for s, x, t, d in spec)

DEFAULT_BUBBLES = [('left', 46, 250, 34), ('left', 86, 330, 18), ('left', 30, 400, 24), ('left', 70, 470, 12),
                   ('right', 40, 520, 22), ('right', 22, 600, 14), ('right', 56, 660, 28)]

def frame(n, kicker, title, icon, inner, extra='', footer=True, bub=None):
    """A standard content slide."""
    deco = WAVES + weed('left', 20, 150) + weed('right', 18, 130, '#0F9FB2', '#33BFCB') + bubbles(bub if bub is not None else DEFAULT_BUBBLES)
    foot = (f'<div class="foot">الغوّاص الصغير: رحلة البحث عن اللؤلؤ &nbsp;•&nbsp; <b>خطة نشاط بدني متمركزة حول الطفل</b> &nbsp;•&nbsp; TCHL418</div>'
            f'<div class="pg">{n}</div>') if footer else ''
    head = f"""<div class="head"><div class="badge"><img src="{E}{icon}.svg"></div>
<div><p class="kick">{kicker}</p><h2 class="ttl">{title}</h2></div></div>"""
    return f'<section class="slide" id="s{n}">{deco}{extra}{head}<div class="body">{inner}</div>{foot}</section>'

def page(slides_html):
    return f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{slides_html}</body></html>"""
