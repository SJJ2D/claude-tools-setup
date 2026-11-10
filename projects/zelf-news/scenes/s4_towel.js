/* S4 — the failed cover-up (P3, towels on his head). Pure function of t. */
'use strict';
(function () {
  const { C, F, W, H, seg, lerp } = ZN;
  const E = OM.ease, V = ZN.VERT;
  const eIn = u => u * u * u;
  const S = k => ZN.S('txt.S4.' + k, '');
  const px = n => n + 'px';
  const set = (el, x, y, r, s) => { el.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`; };
  const hex = (a, b, u) => { const p = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)); const A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',') + ')'; };

  // layout (design px)
  const PW = V ? 540 : 530, SC = PW / 640, PHt = Math.round(851 * SC);
  const FR = V ? { l: 270, t: 300 } : { l: 120, t: 40 };
  const STRIP = V ? 62 : 56;
  const FW = PW + 32, FH = 16 + PHt + STRIP;
  const pt = (cx, cy) => [16 + cx * SC, 16 + cy * SC];
  const CARD = V ? { l: 40, t: 1140, w: 1000, h: 330, hh: 66, ring: 230, numf: 230 } : { l: 930, t: 178, w: 850, h: 410, hh: 78, ring: 300, numf: 250 };
  const MON = V ? { l: 40, t: 1488, w: 1000, h: 104 } : { l: 930, t: 612, w: 850, h: 150 };
  const HEAD = V ? { t: 178, r: 40, f: 54 } : { t: 52, r: 330, f: 58 };
  const NEXT = V ? { l: 40, t: 1000 } : { l: 930, t: 778 };

  let el = {}, Z = null;
  ZN.scene({
    id: 'S4',
    init(ctx) {
      const ui = ctx.ui, t0 = ctx.t0;
      const tSlam = ZN.wordAt('l11', 'صفر');
      ZN.ev('whoosh', t0 + 0.05, 0.9);
      ZN.ev('sting', ZN.wordAt('l10', 'خطير'), 0.8);
      ZN.ev('tick', ZN.wordAt('l10', 'فوطة'), 0.8);
      ZN.ev('tick', ZN.wordAt('l10', 'فوطتين'), 0.8);
      ZN.ev('pop', ZN.wordAt('l10', 'وغسيل'), 0.8);
      ZN.ev('riser', tSlam - 0.95, 0.6);
      ZN.ev('fail', tSlam, 1);
      ZN.ev('stamp', tSlam + 0.1, 0.9);
      const tF = ZN.wordAt('l11', 'والفوطة');
      ZN.ev('beep', tF + 0.25, 0.7); ZN.ev('beep', tF + 0.25 + 0.62, 0.7);
      ZN.ev('slide', ctx.t1 - 0.85, 0.6);
      ZN.ev('whoosh', ctx.t1 - 0.6, 0.8);

      const board = el.board = ZN.el(ui, 'div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px`);
      // evidence board background
      el.bg = ZN.el(board, 'div', `position:absolute;left:-40px;top:-40px;width:${W + 80}px;height:${H + 80}px;background:
        radial-gradient(ellipse at 58% 42%, #2A6BD1 0%, ${C.navy3} 38%, ${C.navy2} 100%);`);
      el.grid = ZN.el(el.bg, 'div', `position:absolute;left:-60px;top:-60px;right:-60px;bottom:-60px;background:
        repeating-linear-gradient(0deg, rgba(255,255,255,.10) 0 2px, transparent 2px 64px),
        repeating-linear-gradient(90deg, rgba(255,255,255,.10) 0 2px, transparent 2px 64px)`);

      // ── evidence frame ──
      const fr = el.fr = ZN.el(board, 'div', `position:absolute;left:${FR.l}px;top:${FR.t}px;width:${FW}px;height:${FH}px;transform-origin:${FW / 2}px ${FH * 0.42}px`);
      ZN.el(fr, 'div', `position:absolute;inset:0;background:${C.paper};border-radius:6px;box-shadow:0 26px 60px rgba(0,0,0,.55), 0 4px 10px rgba(0,0,0,.4)`);
      const ph = ZN.photo(fr, 'p3_face', `position:absolute;left:16px;top:16px;width:${PW}px;height:${PHt}px;display:block`);
      ZN.el(fr, 'div', `position:absolute;left:16px;top:${16 + PHt}px;width:${PW}px;height:${STRIP}px;display:flex;align-items:center;justify-content:center;color:${C.red2};font:800 30px ${F.ui};letter-spacing:4px;direction:ltr;white-space:nowrap`, 'EXHIBIT A · P3');
      // tape
      for (const [x, r] of [[-26, -38], [FW - 70, 36]]) ZN.el(fr, 'div', `position:absolute;left:${x}px;top:-14px;width:96px;height:34px;background:rgba(255,200,58,.82);transform:rotate(${r}deg)`);

      // dashed outline + arrow + label ("still visible")
      const [ox, oy] = pt(220, 512), orx = 60 * SC, ory = 108 * SC;
      el.out = ZN.el(fr, 'div', `position:absolute;left:${ox - orx - 10}px;top:${oy - ory - 10}px;width:${2 * orx + 20}px;height:${2 * ory + 20}px;transform-origin:50% 50%`);
      el.out.innerHTML = `<svg width="${2 * orx + 20}" height="${2 * ory + 20}" style="position:absolute;left:0;top:0;overflow:visible">
        <ellipse cx="${orx + 10}" cy="${ory + 10}" rx="${orx}" ry="${ory}" fill="none" stroke="#fff" stroke-width="12"/>
        <ellipse id="s4d" cx="${orx + 10}" cy="${ory + 10}" rx="${orx}" ry="${ory}" fill="none" stroke="${C.red}" stroke-width="7" stroke-dasharray="20 13"/></svg>`;
      el.dash = el.out.querySelector('#s4d');
      const [lx, ly] = pt(14, 700);
      el.still = ZN.el(fr, 'div', `position:absolute;left:${lx}px;top:${ly}px;background:${C.red};color:#fff;font:800 ${V ? 36 : 40}px ${F.ui};padding:6px 22px 10px;border-radius:8px;white-space:nowrap;transform-origin:50% 100%;box-shadow:0 8px 18px rgba(0,0,0,.4);border:3px solid #fff`, S('still'));
      const [a1x, a1y] = pt(120, 690), [a2x, a2y] = pt(196, 626);
      el.arr = ZN.el(fr, 'div', `position:absolute;left:0;top:0;width:${FW}px;height:${FH}px`);
      el.arr.innerHTML = `<svg width="${FW}" height="${FH}" style="position:absolute;left:0;top:0;overflow:visible">
        <path id="s4a" d="M${a1x} ${a1y} Q ${a1x + 4} ${(a1y + a2y) / 2 + 6} ${a2x} ${a2y}" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
        <path id="s4b" d="M${a1x} ${a1y} Q ${a1x + 4} ${(a1y + a2y) / 2 + 6} ${a2x} ${a2y}" fill="none" stroke="${C.red}" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
        <path id="s4h" d="M${a2x - 16} ${a2y + 26} L${a2x} ${a2y - 4} L${a2x + 22} ${a2y + 20}" fill="none" stroke="${C.red}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      el.arrA = el.arr.querySelector('#s4a'); el.arrB = el.arr.querySelector('#s4b'); el.arrH = el.arr.querySelector('#s4h');

      // evidence tags on the towel pile
      const mkTag = (cx, cy, text, rot) => {
        const [x, y] = pt(cx, cy);
        const r = ZN.el(fr, 'div', `position:absolute;left:${x}px;top:${y}px;width:0;height:0;transform-origin:0 0`);
        ZN.el(r, 'div', `position:absolute;left:-15px;top:-15px;width:30px;height:30px;border-radius:50%;background:${C.red};border:5px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.5)`);
        ZN.el(r, 'div', `position:absolute;left:14px;top:-31px;height:62px;display:flex;align-items:center;padding:0 24px 0 22px;background:${C.gold};color:${C.ink};font:800 ${V ? 34 : 38}px ${F.ui};border-radius:6px 31px 31px 6px;white-space:nowrap;box-shadow:0 8px 18px rgba(0,0,0,.45);direction:rtl`, text);
        r._rot = rot; return r;
      };
      el.t1 = mkTag(588, 600, S('t1'), 4);
      el.t2 = mkTag(500, 318, S('t2'), -5);
      // bracket around the whole pile
      const bx0 = pt(8, 34), bx1 = pt(632, 560);
      const bw = bx1[0] - bx0[0], bh = bx1[1] - bx0[1], k = 70;
      el.brk = ZN.el(fr, 'div', `position:absolute;left:${bx0[0]}px;top:${bx0[1]}px;width:${bw}px;height:${bh}px`);
      const L = (d) => `<path d="${d}" fill="none" stroke="${C.gold}" stroke-width="10" stroke-linecap="square" pathLength="1" stroke-dasharray="1 1" class="s4c"/>`;
      el.brk.innerHTML = `<svg width="${bw}" height="${bh}" style="position:absolute;left:0;top:0;overflow:visible;filter:drop-shadow(0 3px 5px rgba(0,0,0,.6))">
        ${L(`M0 ${k} V0 H${k}`)}${L(`M${bw - k} 0 H${bw} V${k}`)}${L(`M${bw} ${bh - k} V${bh} H${bw - k}`)}${L(`M${k} ${bh} H0 V${bh - k}`)}</svg>`;
      el.brkP = [...el.brk.querySelectorAll('.s4c')];
      const lp = pt(320, 34);
      el.lau = ZN.el(fr, 'div', `position:absolute;left:${lp[0]}px;top:${lp[1]}px;width:0;height:0;transform-origin:0 50%`);
      ZN.el(el.lau, 'div', `position:absolute;left:0;top:-34px;transform:translateX(-50%);background:${C.gold};color:${C.ink};font:800 ${V ? 36 : 40}px ${F.ui};padding:4px 26px 8px;border-radius:8px;white-space:nowrap;box-shadow:0 8px 18px rgba(0,0,0,.45);direction:rtl`, S('laundry'));
      // plaster sticker
      const pp = pt(300, 250);
      el.plaster = ZN.el(fr, 'div', `position:absolute;left:${pp[0]}px;top:${pp[1]}px;width:150px;height:46px;margin:-23px 0 0 -75px;background:#E9C9A0;border-radius:23px;border:3px solid #C9A173;transform-origin:50% 50%;box-shadow:0 5px 10px rgba(0,0,0,.35)`);
      ZN.el(el.plaster, 'div', `position:absolute;left:50%;top:6px;width:44px;height:28px;margin-left:-22px;background:#F6E3C6;border-radius:4px;border:2px dotted #C9A173`);

      // ── headline ──
      el.head = ZN.el(board, 'div', `position:absolute;top:${HEAD.t}px;${V ? `left:${HEAD.r}px;right:${HEAD.r}px;` : `right:${HEAD.r}px;`}background:${C.red};color:#fff;font:800 ${HEAD.f}px ${F.ui};padding:8px 36px 14px;border-radius:10px;white-space:nowrap;text-align:center;direction:rtl;border-bottom:8px solid ${C.red2};box-shadow:0 14px 30px rgba(0,0,0,.45);transform-origin:100% 50%`, S('headline'));

      // case file card (right column, before the gauge)
      el.case = ZN.el(board, 'div', `position:absolute;left:${CARD.l}px;top:${CARD.t}px;width:${CARD.w}px;height:${CARD.h}px;background:${C.paper};border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,.5);overflow:hidden;transform-origin:50% 50%;border-top:${V ? 56 : 64}px solid ${C.gold}`);
      ZN.el(el.case, 'div', `position:absolute;left:30px;bottom:-60px;font:400 ${V ? 300 : 360}px/1 ${F.stamp};color:rgba(224,32,43,.13);direction:ltr`, '47');
      ZN.el(el.case, 'div', `position:absolute;left:0;right:0;top:${V ? 50 : 100}px;text-align:center;color:${C.red2};font:800 ${V ? 54 : 74}px ${F.ui};direction:rtl;white-space:nowrap`, S('case'));
      ZN.el(el.case, 'div', `position:absolute;left:0;top:-${V ? 56 : 64}px;width:100%;height:${V ? 56 : 64}px;display:flex;align-items:center;justify-content:center;color:${C.ink};font:800 30px ${F.ui};letter-spacing:6px;direction:ltr`, 'CASE FILE');

      // ── gauge ──
      const g = el.card = ZN.el(board, 'div', `position:absolute;left:${CARD.l}px;top:${CARD.t}px;width:${CARD.w}px;height:${CARD.h}px;background:${C.navy2};border-radius:16px;overflow:hidden;border:5px solid #fff;box-shadow:0 24px 50px rgba(0,0,0,.55);transform-origin:50% 50%`);
      el.gh = ZN.el(g, 'div', `position:absolute;left:0;top:0;right:0;height:${CARD.hh}px;background:${C.navy3};color:#fff;font:800 ${V ? 40 : 46}px ${F.ui};display:flex;align-items:center;justify-content:center;direction:rtl`, S('rate'));
      const R = CARD.ring, rr = R * 0.38, cx = R / 2;
      const ringTop = CARD.hh + (CARD.h - CARD.hh - R) / 2;
      el.ringBox = ZN.el(g, 'div', `position:absolute;left:30px;top:${ringTop - 5}px;width:${R}px;height:${R}px`);
      el.ringBox.innerHTML = `<svg width="${R}" height="${R}" viewBox="0 0 ${R} ${R}" style="overflow:visible">
        <circle cx="${cx}" cy="${cx}" r="${rr * 1.15}" fill="none" stroke="${C.navy}" stroke-width="${R * 0.12}" id="s4t"/>
        <circle id="s4r" cx="${cx}" cy="${cx}" r="${rr * 1.15}" fill="none" stroke="${C.cyan}" stroke-width="${R * 0.12}" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 ${cx} ${cx})"/></svg>`;
      el.ring = el.ringBox.querySelector('#s4r'); el.track = el.ringBox.querySelector('#s4t');
      const numL = 30 + R + 10, numW = CARD.w - numL - 30;
      const numTop = CARD.hh + (CARD.h - CARD.hh - CARD.numf * 1.0) / 2 - 6;
      const numCss = `position:absolute;left:${numL}px;top:${numTop}px;width:${numW}px;height:${CARD.numf}px;line-height:${CARD.numf}px;font:400 ${CARD.numf}px/${CARD.numf}px ${F.stamp};text-align:center;direction:ltr;white-space:nowrap`;
      el.num = ZN.el(g, 'div', numCss + `;color:#fff;transform-origin:50% 55%`, '0%');
      // stamp
      el.fail = ZN.el(g, 'div', `position:absolute;left:${30 + R / 2 - 120}px;top:${ringTop + R / 2 - 74}px;width:240px;height:148px;display:flex;align-items:center;justify-content:center;background:#fff;color:${C.red};font:400 ${V ? 112 : 124}px/1 ${F.stamp};border:10px solid ${C.red};border-radius:12px;transform-origin:50% 50%;opacity:0`, S('fail'));
      // zero probe (final layout of the "0", measured lazily, never animated)
      el.probe = ZN.el(ui, 'div', `position:absolute;left:${CARD.l + 5 + numL}px;top:${CARD.t + 5 + numTop}px;width:${numW}px;height:${CARD.numf}px;font:400 ${CARD.numf}px/${CARD.numf}px ${F.stamp};text-align:center;direction:ltr;white-space:nowrap;visibility:hidden`);
      el.probe.innerHTML = '<span>0</span>%';
      el.probeS = el.probe.firstChild;

      // ── monitor ──
      const m = el.mon = ZN.el(board, 'div', `position:absolute;left:${MON.l}px;top:${MON.t}px;width:${MON.w}px;height:${MON.h}px;background:${C.ink};border-radius:14px;border:4px solid #2E7D4F;box-shadow:0 18px 40px rgba(0,0,0,.55);overflow:hidden;transform-origin:50% 50%`);
      const ew = V ? 300 : 330, eh = MON.h - 24;
      el.ecgW = ew; el.ecgH = eh;
      m.innerHTML = `<svg width="${ew}" height="${eh}" style="position:absolute;left:18px;top:12px;direction:ltr"><polyline id="s4e" fill="none" stroke="#3DFF8A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><circle id="s4ed" r="8" fill="#B8FFD5"/></svg>`;
      el.ecg = m.querySelector('#s4e'); el.ecgDot = m.querySelector('#s4ed');
      ZN.el(m, 'div', `position:absolute;left:${18 + ew + 16}px;right:18px;top:0;bottom:0;display:flex;align-items:center;justify-content:center;color:#fff;font:800 ${V ? 34 : 42}px ${F.ui};direction:rtl;white-space:nowrap`, S('stable'));

      // ── next tag ──
      el.next = ZN.el(board, 'div', `position:absolute;left:${NEXT.l}px;top:${NEXT.t}px;background:${C.paper};color:${C.red2};font:800 ${V ? 34 : 36}px ${F.ui};padding:4px 28px 8px;border-radius:8px;border-right:10px solid ${C.red};white-space:nowrap;direction:rtl;box-shadow:0 8px 20px rgba(0,0,0,.45);transform-origin:0 50%`, S('next'));

      // ── overlays: red flash, towel, iris ──
      el.flash = ZN.el(ui, 'div', `position:absolute;inset:0;background:${C.red};opacity:0;z-index:30;pointer-events:none`);
      el.iris = ZN.el(ui, 'div', `position:absolute;inset:0;z-index:40;pointer-events:none;opacity:0`);
      el.towel = ZN.el(ui, 'div', `position:absolute;left:-80px;top:-60px;width:${W + 160}px;height:${H * 1.5}px;z-index:50;
        background:repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 2px, transparent 2px 6px),
          repeating-linear-gradient(${V ? 80 : 98}deg, #1B2A47 0 ${V ? 110 : 150}px, #B3BDB8 ${V ? 110 : 150}px ${V ? 270 : 380}px, #1B2A47 ${V ? 270 : 380}px ${V ? 330 : 450}px);
        clip-path:polygon(0 0,100% 0,100% 93%,88% 96%,74% 92%,60% 97%,46% 93%,31% 98%,17% 93%,0 96%);
        box-shadow:0 60px 90px rgba(0,0,0,.6);transform-origin:50% 100%`);
    },

    update(t, ctx) {
      const lt = t - ctx.t0;
      const tHead = ZN.wordAt('l10', 'خطير'), tStill = ZN.wordAt('l10', 'يخش'), tT1 = ZN.wordAt('l10', 'فوطة'), tT2 = ZN.wordAt('l10', 'فوطتين');
      const tLau = ZN.wordAt('l10', 'وغسيل'), tLauE = ZN.wordAt('l10', 'كله');
      const tS = ZN.wordAt('l11', 'صفر'), tF = ZN.wordAt('l11', 'والفوطة'), tH = ZN.wordAt('l11', 'حالتها');
      const tEnd = ctx.t1;

      // lazy measurement of the 0 (static layout)
      if (!Z) {
        const rc = el.probeS.getBoundingClientRect(), st = ctx.ui.getBoundingClientRect();
        const sc = W / (st.width || W);
        Z = [(rc.left + rc.width / 2 - st.left) * sc, (rc.top + rc.height / 2 - st.top) * sc + CARD.numf * 0.02, rc.width * sc];
      }

      // drift on the background (tiny)
      el.grid.style.transform = `translate(${(lt * 3).toFixed(2)}px,${(lt * 2).toFixed(2)}px)`;

      // shake on the slam
      const su = (t - tS) / 0.22; let sx = 0, sy = 0;
      if (su >= 0 && su < 1) { const a = (1 - su) * 6; sx = Math.sin(su * 38) * a; sy = Math.cos(su * 31) * a * 0.6; }
      set(el.board, sx, sy, 0, 1);

      // towel pulled off the lens
      const tu = seg(lt, 0.04, 0.72), te = E.cubicInOut(tu);
      el.towel.style.display = tu >= 1 ? 'none' : 'block';
      set(el.towel, te * W * 0.25, -te * H * 1.55, -te * 9, 1);

      // evidence frame lands + slow push, then eases up to the pile
      const fe = E.expoOut(seg(lt, 0.2, 0.95));
      const push = 1 + 0.09 * E.smooth(seg(t, ctx.t0 + 0.9, tF));
      const up = E.cubicInOut(seg(t, tF - 0.05, tF + 0.85));
      const fsc = lerp(1.22, 1, fe) * push * (1 + (V ? 0.05 : 0.12) * up);
      set(el.fr, 0, lerp(-30, 0, fe) + up * (V ? 14 : 62), lerp(-8, -3, fe) + up * 0.8, fsc);

      // headline
      const he = E.expoOut(seg(lt, 0.6, 1.05));
      const hp = Math.sin(Math.PI * seg(t, tHead, tHead + 0.4));
      set(el.head, (1 - he) * 700, 0, 0, 1 + 0.07 * hp);
      el.head.style.opacity = he > 0 ? 1 : 0;
      el.flash.style.opacity = (0.34 * Math.pow(Math.max(0, 1 - seg(t, tHead, tHead + 0.32)), 1.6) * (t >= tHead ? 1 : 0)).toFixed(3);

      // outline + arrow (still visible)
      const oe = E.backOut(seg(t, tStill, tStill + 0.35));
      const ofade = 1 - seg(t, tLauE + 0.4, tLauE + 0.8);
      const pulse = 1 + 0.05 * Math.sin((t - tStill) * 9);
      set(el.out, 0, 0, 0, oe * pulse);
      el.out.style.opacity = (oe > 0 ? 1 : 0) * ofade;
      el.dash.setAttribute('stroke-dashoffset', (-(t - tStill) * 40).toFixed(1));
      const ae = E.cubicOut(seg(t, tStill + 0.12, tStill + 0.5));
      for (const p of [el.arrA, el.arrB]) p.setAttribute('stroke-dasharray', `${ae.toFixed(3)} 1.2`);
      el.arrH.style.opacity = seg(ae, 0.85, 1);
      el.arr.style.opacity = ofade;
      const se = E.backOut(seg(t, tStill + 0.28, tStill + 0.62));
      set(el.still, 0, 0, -3, se); el.still.style.opacity = se > 0 ? ofade : 0;

      // tags on the pile
      for (const [r, tt] of [[el.t1, tT1], [el.t2, tT2]]) { const s = E.backOut(seg(t, tt, tt + 0.3)); set(r, 0, 0, r._rot, s); r.style.opacity = s > 0 ? 1 : 0; }
      const bp = E.cubicOut(seg(t, tLau, tLauE + 0.1));
      el.brkP.forEach((p, i) => p.setAttribute('stroke-dasharray', `${(E.cubicOut(seg(t, tLau + i * 0.12, tLau + 0.45 + i * 0.2))).toFixed(3)} 1.2`));
      const le = E.backOut(seg(t, tLau + 0.05, tLau + 0.4));
      set(el.lau, 0, 0, -2, le); el.lau.style.opacity = le > 0 ? 1 : 0;

      // plaster
      const pe = E.backOut(seg(t, tH, tH + 0.3));
      set(el.plaster, 0, 0, -18 + (1 - pe) * 30, pe); el.plaster.style.opacity = pe > 0 ? 1 : 0;

      // case-file card
      const cae = E.expoOut(seg(lt, 0.9, 1.4)), cax = E.cubicIn ? 0 : 0;
      const cxo = seg(t, tS - 1.55, tS - 1.25), cxe = cxo * cxo * cxo;
      set(el.case, (1 - cae) * 900 + cxe * 1100, 0, -cxe * 4, 1);
      el.case.style.opacity = (cae > 0 && cxo < 1) ? 1 : 0;
      // gauge card
      const tG = tS - 1.25;
      const ce = E.expoOut(seg(t, tG, tG + 0.5));
      set(el.card, (1 - ce) * 220, 0, 0, 1);
      el.card.style.opacity = ce > 0 ? 1 : 0;
      // value: hopeful climb, one hopeful hold, slam
      const cs = tS - 0.95;
      let v;
      if (t < cs) v = 0;
      else if (t < tS) {
        const u = t - cs;
        if (u < 0.28) v = lerp(0, 37, E.cubicOut(u / 0.28));
        else if (u < 0.36) v = 37 + Math.sin((u - 0.28) * 40) * 1.5;
        else if (u < 0.62) v = lerp(37, 82, E.cubicOut((u - 0.36) / 0.26));
        else if (u < 0.82) v = lerp(82, 99, E.cubicOut((u - 0.62) / 0.2));
        else v = 99;
      } else {
        const d = seg(t, tS, tS + 0.12);
        v = lerp(99, 0, eIn(d) * 0.6 + d * 0.4);
        if (d >= 1) { const b = Math.sin((t - tS - 0.12) * 30) * Math.exp(-(t - tS - 0.12) * 9) * 3; v = Math.max(0, b); }
      }
      const sl = t >= tS, since = t - tS;
      const shown = sl ? 0 : Math.round(v);
      el.num.textContent = shown + '%';
      const hop = (!sl && t >= cs + 0.82) ? 1 + 0.045 * Math.sin((t - cs - 0.82) * 22) : 1;
      const pop = sl ? 1 + 0.32 * Math.exp(-since * 9) * Math.cos(since * 22) : hop;
      el.num.style.transform = `scale(${pop.toFixed(4)})`;
      const mix = seg(v, 0, 99);
      const fcol = sl ? C.red : hex('#FFFFFF', '#FFC83A', E.smooth(seg(v, 60, 99)));
      el.num.style.color = sl ? (since < 0.1 ? '#fff' : C.red) : fcol;
      el.num.style.textShadow = sl ? 'none' : (v > 80 ? `0 0 ${24 * seg(v, 80, 99)}px rgba(255,200,58,.7)` : 'none');
      const rv = sl ? Math.max(v, 0.0001) : v;
      el.ring.setAttribute('stroke-dasharray', `${(rv * 0.998).toFixed(2)} 100`);
      el.ring.setAttribute('stroke', sl ? C.red : hex(C.cyan, C.gold, E.smooth(seg(v, 20, 95))));
      // card border flash
      el.card.style.borderColor = sl ? C.red : '#fff';
      el.card.style.background = sl ? (since < 0.08 ? '#fff' : C.paper) : C.navy2;
      el.track.setAttribute('stroke', sl ? '#D9D4C7' : C.navy);
      el.gh.style.background = sl ? C.red : C.navy3;
      // stamp
      const st = seg(t, tS + 0.08, tS + 0.22), stE = E.expoOut(st);
      el.fail.style.opacity = st > 0 ? 1 : 0;
      set(el.fail, 0, 0, -12, lerp(2.6, 1, stE));

      // monitor
      const me = E.backOut(seg(t, tF, tF + 0.4));
      set(el.mon, 0, (1 - E.expoOut(seg(t, tF, tF + 0.4))) * 160, 0, 1);
      el.mon.style.opacity = t >= tF ? 1 : 0;
      {
        const w = el.ecgW, h = el.ecgH, vx = 190, N = 80, b0 = tF + 0.25, per = 0.62;
        const pts = [[-0.22, 0], [-0.15, 0.16], [-0.09, 0], [-0.05, 0], [-0.03, -0.22], [0, 1], [0.03, -0.45], [0.06, 0], [0.14, 0], [0.22, 0.26], [0.3, 0]];
        const sig = tau => { if (tau < b0 - 0.25) return null; const k = Math.round((tau - b0) / per), u = tau - b0 - k * per; if (k < 0) return 0;
          for (let i = 0; i < pts.length - 1; i++) if (u >= pts[i][0] && u <= pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], (u - pts[i][0]) / (pts[i + 1][0] - pts[i][0]));
          return 0; };
        let s = '', last = h / 2;
        for (let i = 0; i <= N; i++) { const x = w * i / N, tau = t - (w - x) / vx, y = sig(tau); if (y == null) continue; last = h / 2 - y * h * 0.4; s += x.toFixed(1) + ',' + last.toFixed(1) + ' '; }
        el.ecg.setAttribute('points', s || '0,0');
        el.ecgDot.setAttribute('cx', w - 6); el.ecgDot.setAttribute('cy', last);
      }

      // next tag
      const nt = tEnd - 0.85, ne = E.cubicOut(seg(t, nt, nt + 0.35));
      set(el.next, (1 - ne) * -420, 0, 0, 1);
      el.next.style.opacity = ne > 0 ? 1 : 0;

      // iris out through the 0
      const i0 = tEnd - 0.62, iu = seg(t, i0, tEnd - 0.04);
      if (iu <= 0) el.iris.style.opacity = 0;
      else {
        const R = lerp(70, 2700, Math.pow(iu, 2.3));
        const ri = iu < 0.8 ? 40 + (R - 70) * 0.10 : lerp(40 + (lerp(70, 2700, Math.pow(0.8, 2.3)) - 70) * 0.10, 0, seg(iu, 0.8, 1));
        el.iris.style.opacity = 1;
        el.iris.style.background = `radial-gradient(circle at ${Z[0].toFixed(1)}px ${Z[1].toFixed(1)}px, transparent 0, transparent ${ri.toFixed(1)}px, ${C.red} ${(ri + 1).toFixed(1)}px, ${C.red} ${R.toFixed(1)}px, transparent ${(R + 1).toFixed(1)}px)`;
        if (iu >= 1) el.iris.style.background = C.red;
      }
    },
  });
})();
