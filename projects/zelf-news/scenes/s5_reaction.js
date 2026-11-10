/* S5 — THE MOMENT THE NEWS REACHED HIM. P4 (warped grin) inside a phone-video frame (REC dot, running timecode, slow push);
 * on the last word of l12 the FREEZE (white flash, three punch-in cuts = crops/scales only, B&W hold in a red frame, one light shake),
 * typed caption, emotion meter whose needle cannot decide, three identical analysts, needle slams, springs off, readout,
 * then a quick zoom-out so the whole picture becomes a studio monitor. DOM/SVG only; every value is a pure function of t. */
'use strict';
(function () {
  const { C, F, W, H, seg, lerp, ease } = ZN;
  const V = ZN.VERT;
  const S = k => ZN.S('txt.S5.' + k, '');
  const clamp = ZN.clamp;
  const cubicIn = x => x * x * x;
  const NS = 'http://www.w3.org/2000/svg';

  // ── layout (stage px) ──
  const L = V ? {
    phone: { x: 310, y: 150, w: 460, h: 700 },
    chip: { y: 872, fs: 54, big: { dy: 260, s: 1.9 } },
    cap: { y: 952, x: 40, w: 1000, h: 82, fs: 42 },
    gauge: { x: 40, y: 1048, w: 1000, h: 384, R: 232 },
    ana: { x: 40, y: 1446, w: 1000, h: 150, cw: 320, gap: 20, silH: 118 },
    read: { cx: 540, cy: 1230, fs: 92 },
    bars: { y: 1330, x: 40, w: 1000 },
    chipAlign: 'center',
  } : {
    phone: { x: 110, y: 56, w: 580, h: 774 },
    chip: { y: 176, fs: 56, big: { dy: 230, s: 2.0 } },
    cap: { y: 262, x: 790, w: 1070, h: 82, fs: 42 },
    gauge: { x: 1215, y: 362, w: 645, h: 400, R: 232 },
    ana: { x: 790, y: 462, w: 405, h: 300, cw: 125, gap: 15, silH: 170 },
    read: { cx: 1325, cy: 575, fs: 112 },
    bars: { y: 560, x: 790, w: 1070 },
    chipAlign: 'flex-start',
  };
  const COLR = 1860;                                    // right edge of the right column (H)

  // ── p4 geometry: image width = screen width, bottom aligned; focus points are image fractions ──
  const P = L.phone, BZ = 14;
  const SW = P.w - 2 * BZ, SH = P.h - 2 * BZ, IH = SW * 2476 / 1290;
  const camXY = (s, fx, fy, ay) => {                    // → [tx, ty] so that (fx,fy) of the image sits at (0.5, ay) of the screen
    let tx = 0.5 * SW - fx * SW * s, ty = ay * SH - fy * IH * s;
    tx = clamp(tx, SW - SW * s, 0); ty = clamp(ty, SH - IH * s, 0);
    return [tx, ty];
  };
  const PUSH = { s0: 1.0, s1: 1.26 };
  const CUTS = [                                        // three rapid punch-ins on the grin, then the hold
    { d: 0.00, s: 1.7, fx: 0.50, fy: 0.845, ay: 0.55 },
    { d: 0.13, s: 2.5, fx: 0.50, fy: 0.74, ay: 0.50 },
    { d: 0.26, s: 3.3, fx: 0.50, fy: 0.865, ay: 0.50 },
    { d: 0.40, s: 1.32, fx: 0.50, fy: 0.80, ay: 0.60 },
  ];

  // ── gauge geometry (panel-local) ──
  const G = L.gauge, PX = G.w / 2, PY = G.R + 50, SWD = 44;
  const pol = (deg, r) => [PX + r * Math.sin(deg * Math.PI / 180), PY - r * Math.cos(deg * Math.PI / 180)];
  const arc = (a0, a1, r) => { const p0 = pol(a0, r), p1 = pol(a1, r); return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${r} ${r} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`; };
  const MAXDEG = 76;

  let el = {}, T = {};

  ZN.scene({
    id: 'S5',
    init(ctx) {
      const ui = ctx.ui, [t0, t1] = [ctx.t0, ctx.t1];
      ui.style.background = '#050a18';
      T.tF = ZN.wordAt('l12', 'الخبر', t0 + 2.3);
      T.tM = T.tF + 0.95;                               // meter appears
      T.tA = ZN.wordAt('l13', 'محللينا', T.tM + 2);     // analysts
      T.tH = ZN.wordAt('l13', 'فرحان', T.tA + 2.4);
      T.tS = ZN.wordAt('l13', 'منصدم', T.tH + 0.85);
      T.tZ = t1 - 0.42;                                 // zoom-out to monitor
      T.tOff = Math.min(T.tS + 0.4, T.tZ - 0.36);
      T.tR = T.tOff + 0.16;                             // readout
      T.tC = T.tF + 0.35;                               // caption in

      // screen (everything that becomes the studio monitor)
      el.scr = ZN.el(ui, 'div', `position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 62% 38%, #3a7be0 0%, ${C.navy3} 55%, ${C.navy2} 100%)`);
      el.grid = ZN.el(el.scr, 'div', `position:absolute;left:-120px;top:-120px;width:${W + 240}px;height:${H + 240}px;opacity:.35;background-image:linear-gradient(#5b93ea 2px,transparent 2px),linear-gradient(90deg,#5b93ea 2px,transparent 2px);background-size:96px 96px`);
      el.world = ZN.el(el.scr, 'div', `position:absolute;inset:0`);
      const w = el.world;

      // ── phone ──
      el.phone = ZN.el(w, 'div', `position:absolute;left:${P.x}px;top:${P.y}px;width:${P.w}px;height:${P.h}px;border-radius:${V ? 52 : 60}px;background:#0B0F1A;box-shadow:0 24px 60px rgba(0,0,0,.55), 0 0 0 4px #1b2748`);
      el.screen = ZN.el(el.phone, 'div', `position:absolute;left:${BZ}px;top:${BZ}px;width:${SW}px;height:${SH}px;border-radius:${V ? 40 : 46}px;overflow:hidden;background:#cfe8da`);
      el.img = ZN.photo(el.screen, 'p4', `position:absolute;left:0;top:0;width:${SW}px;height:${IH}px;transform-origin:0 0;max-width:none`);
            el.imgWrap = el.img;
      // HUD
      const hud = `position:absolute;top:34px;height:50px;border-radius:25px;background:rgba(11,15,26,.88);color:#fff;font:700 30px ${F.ui};display:flex;align-items:center;direction:ltr;letter-spacing:1px`;
      el.rec = ZN.el(el.screen, 'div', hud + `;left:22px;padding:0 20px 0 16px;gap:10px`, `<span class="d" style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${C.red}"></span><span class="r">REC</span>`);
      el.tc = ZN.el(el.screen, 'div', hud + `;right:22px;padding:0 20px;font-variant-numeric:tabular-nums`, '00:00:12:00');
      el.dot = el.rec.querySelector('.d'); el.rtxt = el.rec.querySelector('.r');
      // freeze frame: red border + label (txt.freeze)
      el.red = ZN.el(el.screen, 'div', `position:absolute;inset:0;border:14px solid ${C.red};border-radius:${V ? 40 : 46}px;box-sizing:border-box;opacity:0`);
      el.fz = ZN.el(el.screen, 'div', `position:absolute;left:50%;bottom:30px;margin-left:-110px;width:220px;text-align:center;background:${C.red};color:#fff;font:400 58px/1.15 ${F.stamp};padding:6px 0 10px;border-radius:12px;opacity:0;direction:rtl`, S('freeze'));
      el.flash = ZN.el(ui, 'div', `position:absolute;inset:0;background:#fff;opacity:0;z-index:50;pointer-events:none`);
      ZN.el(el.phone, 'div', `position:absolute;left:50%;top:${BZ + 12}px;width:70px;height:16px;margin-left:-35px;border-radius:8px;background:#0B0F1A;opacity:.0`);

      // ── title chip (big → chip) ──
      const rowCss = (y, extra) => `position:absolute;top:${y}px;display:flex;justify-content:${L.chipAlign};${V ? 'left:0;width:' + W + 'px' : 'left:790px;width:1070px'}${extra || ''}`;
      el.ttlRow = ZN.el(w, 'div', rowCss(L.chip.y));
      el.ttl = ZN.el(el.ttlRow, 'div', `background:${C.red};color:#fff;font:400 ${L.chip.fs}px/1.1 ${F.stamp};padding:8px 34px 12px;border-radius:12px;white-space:nowrap;direction:rtl;transform-origin:${V ? '50% 0' : '100% 0'};box-shadow:0 8px 0 ${C.red2}`, S('title'));
      // pre-freeze audio bars
      el.bars = ZN.el(w, 'div', `position:absolute;left:${L.bars.x}px;top:${L.bars.y}px;width:${L.bars.w}px;height:150px;display:flex;align-items:flex-end;justify-content:center;gap:14px;direction:ltr`);
      el.barEls = []; for (let i = 0; i < 26; i++) el.barEls.push(ZN.el(el.bars, 'div', `width:24px;height:30px;border-radius:6px;background:${i % 5 === 2 ? C.gold : C.cyan}`));

      // ── caption (typed) ──
      el.capRow = ZN.el(w, 'div', `position:absolute;left:${L.cap.x}px;top:${L.cap.y}px;width:${L.cap.w}px;height:${L.cap.h}px;opacity:0`);
      el.cap = ZN.el(el.capRow, 'div', `position:absolute;inset:0;background:${C.navy3};border-right:14px solid ${C.gold};border-radius:12px;display:flex;align-items:center;padding:0 28px;box-shadow:0 8px 24px rgba(0,0,0,.4)`);
      el.capTxt = ZN.el(el.cap, 'span', `color:#fff;font:800 ${L.cap.fs}px ${F.ui};white-space:nowrap;direction:rtl;display:inline-block`, S('news'));
      T.capN = S('news').length;

      // ── gauge ──
      el.gp = ZN.el(w, 'div', `position:absolute;left:${G.x}px;top:${G.y}px;width:${G.w}px;height:${G.h}px;background:#EAF0FB;border:4px solid ${C.navy};border-radius:26px;box-shadow:0 14px 40px rgba(0,0,0,.4);opacity:0`);
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', G.w); svg.setAttribute('height', G.h); svg.setAttribute('viewBox', `0 0 ${G.w} ${G.h}`); svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
      el.gp.appendChild(svg);
      const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };
      mk('path', { d: arc(-90, 90, G.R), fill: 'none', stroke: C.navy, 'stroke-width': SWD + 12, 'stroke-linecap': 'butt' });
      mk('path', { d: arc(-90, -32, G.R), fill: 'none', stroke: C.red, 'stroke-width': SWD });          // shocked (left)
      mk('path', { d: arc(-30, 30, G.R), fill: 'none', stroke: C.navy3, 'stroke-width': SWD });         // undecided (middle)
      mk('path', { d: arc(32, 90, G.R), fill: 'none', stroke: C.gold, 'stroke-width': SWD });           // happy (right)
      for (let d = -80; d <= 80; d += 20) { const a = pol(d, G.R - 32), b = pol(d, G.R - 52); mk('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.navy, 'stroke-width': 4 }); }
      el.needleG = mk('g', {});
      const NL = G.R - 34;
      mk('path', { d: `M${PX - 11} ${PY} L${PX} ${PY - NL} L${PX + 11} ${PY} Z`, fill: C.ink, stroke: C.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' }, el.needleG);
      mk('circle', { cx: PX, cy: PY, r: 24, fill: C.ink, stroke: '#EAF0FB', 'stroke-width': 6 });
      const lab = (txt, cx, col) => ZN.el(el.gp, 'div', `position:absolute;left:${cx - 120}px;width:240px;top:${PY + 36}px;text-align:center;color:${col};font:800 40px/1.2 ${F.ui};direction:rtl`, txt);
      lab(S('happy'), PX + G.R, '#9a6a00');
      lab(S('shocked'), PX - G.R, C.red2);

      // ── analysts: three identical silhouettes + question marks ──
      const A = L.ana;
      el.ana = [];
      for (let i = 0; i < 3; i++) {
        const x = V ? A.x + (A.w - 3 * A.cw - 2 * A.gap) / 2 + (2 - i) * (A.cw + A.gap) : A.x + A.w - A.cw - i * (A.cw + A.gap);
        const card = ZN.el(w, 'div', `position:absolute;left:${x}px;top:${A.y}px;width:${A.cw}px;height:${A.h}px;background:${C.paper};border-radius:18px;box-shadow:0 10px 28px rgba(0,0,0,.45);opacity:0;overflow:hidden`);
        ZN.el(card, 'div', `position:absolute;left:0;right:0;bottom:0;height:${A.silH + 26}px;background:#d9d4c7`);
        const sv = ZN.el(card, 'div', `position:absolute;left:0;right:0;bottom:0;height:${A.silH}px`,
          `<svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMax meet" width="100%" height="100%"><path d="M8 140 C8 100 26 84 50 84 C74 84 92 100 92 140 Z" fill="${C.ink}"/><circle cx="50" cy="52" r="25" fill="${C.ink}"/><path d="M50 88 L43 100 L50 128 L57 100 Z" fill="${C.red}"/></svg>`);
        const q = ZN.el(card, 'div', `position:absolute;left:0;right:0;top:${V ? 2 : 12}px;text-align:center;color:${C.red};font:400 ${V ? 84 : 92}px/1 ${F.stamp};transform-origin:50% 60%`, '؟');
        el.ana.push({ card, q, i });
      }

      // ── readout ──
      el.read = ZN.el(w, 'div', `position:absolute;left:${L.read.cx - 520}px;top:${L.read.cy - 90}px;width:1040px;height:180px;display:flex;align-items:center;justify-content:center;background:${C.red};border-radius:20px;box-shadow:0 12px 0 ${C.red2}, 0 24px 50px rgba(0,0,0,.5);opacity:0;border:6px solid #fff`);
      ZN.el(el.read, 'div', `color:#fff;font:400 ${L.read.fs}px/1.15 ${F.stamp};white-space:nowrap;direction:rtl;padding-bottom:10px`, S('result'));

      // monitor furniture (shows during the exit zoom)
      el.stand = ZN.el(ui, 'div', `position:absolute;left:${W / 2 - 150}px;top:${H * 0.5}px;width:300px;height:${H * 0.5}px;background:linear-gradient(#1a2440,#0b1226);opacity:0;border-radius:0 0 20px 20px`);
      el.base = ZN.el(ui, 'div', `position:absolute;left:${W / 2 - 330}px;top:${H * 0.86}px;width:660px;height:34px;border-radius:17px;background:#141d38;opacity:0;box-shadow:0 10px 30px rgba(0,0,0,.6)`);
      el.glow = ZN.el(ui, 'div', `position:absolute;inset:0;background:radial-gradient(ellipse at 50% 48%, rgba(67,211,255,.22), rgba(0,0,0,0) 55%);opacity:0`);
      ui.insertBefore(el.glow, el.scr); ui.insertBefore(el.stand, el.scr); ui.insertBefore(el.base, el.scr);

      // sound
      ZN.ev('shutter', T.tF, 1); ZN.ev('scream', T.tF + 0.04, 0.8); ZN.ev('impact', T.tF + 0.13, 0.6);
      ZN.ev('typing', T.tC + 0.15, 0.7); ZN.ev('pop', T.tM, 0.8); ZN.ev('pop', T.tA, 0.8);
      ZN.ev('impact', T.tH, 0.6); ZN.ev('impact', T.tS, 0.6); ZN.ev('boing', T.tOff, 1); ZN.ev('stamp', T.tR, 0.9); ZN.ev('whoosh', T.tZ, 0.8);
    },

    update(t, ctx) {
      const lt = t - ctx.t0, tF = T.tF, fr = t >= tF;

      // grid drift (tiny, constant)
      el.grid.style.transform = `translate(${(lt * 5) % 96}px,${(lt * 3) % 96}px)`;

      // phone enter
      const pe = ease.cubicOut(seg(lt, 0.0, 0.55));
      el.phone.style.opacity = clamp(pe * 1.6);
      el.phone.style.transform = `translateX(${lerp(-70, 0, pe)}px) scale(${lerp(0.94, 1, pe)})`;

      // image camera
      let s, tx, ty;
      if (!fr) {
        const k = ease.cubicInOut(seg(t, ctx.t0, tF));
        s = lerp(PUSH.s0, PUSH.s1, k); [tx, ty] = camXY(s, 0.5, 0.8, 0.62 + 0.02 * k);
      } else {
        let c = CUTS[0]; for (const q of CUTS) if (t - tF >= q.d) c = q;
        const drift = c === CUTS[3] ? 1 + 0.008 * Math.sin((t - tF) * 1.4) : 1;
        s = c.s * drift; [tx, ty] = camXY(s, c.fx, c.fy, c.ay);
      }
      el.img.style.transform = `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
      el.img.style.filter = fr ? 'grayscale(1) contrast(1.18) brightness(.95)' : 'none';

      // HUD
      const blink = Math.floor(lt * 2) % 2 === 0;
      const x = 12 + (fr ? tF - ctx.t0 : lt), sec = Math.floor(x), ff = Math.floor((x - sec) * 30);
      el.tc.textContent = `00:00:${String(sec).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
      el.dot.style.opacity = fr ? 0 : (blink ? 1 : 0.15);
      el.rtxt.textContent = fr ? 'HOLD' : 'REC';
      if (fr) { el.dot.style.display = 'none'; } else el.dot.style.display = 'inline-block';

      // freeze: red frame + label, flash, light shake
      const rp = ease.backOut(seg(t, tF + 0.04, tF + 0.3));
      el.red.style.opacity = fr ? 1 : 0;
      el.fz.style.opacity = fr ? clamp(rp) : 0; el.fz.style.transform = `scale(${lerp(1.6, 1, clamp(rp, 0, 1.2))})`;
      el.flash.style.opacity = fr ? (1 - ease.quartOut(seg(t, tF, tF + 0.3))) : 0;
      const sh = t >= tF && t < tF + 0.22 ? (1 - (t - tF) / 0.22) : 0;
      el.world.style.transform = `translate(${(Math.sin((t - tF) * 95) * 5 * sh).toFixed(2)}px,${(Math.cos((t - tF) * 80) * 3 * sh).toFixed(2)}px)`;
      // cut flashes (tiny, on the two later cuts)
      if (fr) { const d = t - tF; for (const q of [CUTS[1], CUTS[2]]) if (d >= q.d && d < q.d + 0.05) el.flash.style.opacity = 0.35; }

      // title: big card → chip on the freeze
      const tp = ease.quartOut(seg(t, tF + 0.02, tF + 0.5));
      const te = ease.cubicOut(seg(lt, 0.22, 0.75));
      const B = L.chip.big;
      el.ttl.style.transform = `translate(${V ? 0 : lerp(120, 0, te) * (1 - tp)}px,${lerp(B.dy, 0, tp)}px) scale(${lerp(B.s, 1, tp)})`;
      el.ttl.style.opacity = clamp(te * 1.5);

      // pre-freeze equalizer bars
      el.bars.style.opacity = (1 - clamp(seg(t, tF - 0.05, tF + 0.1))) * te;
      for (let i = 0; i < el.barEls.length; i++) {
        const h = 24 + 120 * Math.pow(Math.abs(Math.sin(lt * (3.1 + (i % 7) * 0.45) + i * 1.7)), 1.4) * (0.55 + 0.45 * Math.sin(lt * 1.3 + i * 0.4) ** 2);
        el.barEls[i].style.height = h.toFixed(1) + 'px';
      }

      // caption typing (whole-text clip steps: joining stays intact)
      const ce = ease.cubicOut(seg(t, T.tC, T.tC + 0.35));
      const capOut = ease.expoIn(seg(t, T.tOff, T.tOff + 0.22));
      el.capRow.style.opacity = clamp(ce * 1.5) * (1 - capOut);
      el.capRow.style.transform = `translateX(${lerp(90, 0, ce)}px)`;
      const typ = Math.floor(seg(t, T.tC + 0.3, T.tC + 1.25) * T.capN) / T.capN;
      el.capTxt.style.clipPath = `inset(-10px -10px -10px ${((1 - typ) * 100).toFixed(2)}%)`;

      // gauge
      const gp = ease.backOut(seg(t, T.tM, T.tM + 0.45));
      const gOut = ease.expoIn(seg(t, T.tOff + 0.12, T.tOff + 0.34));
      el.gp.style.opacity = clamp(gp * 2) * (1 - gOut);
      el.gp.style.transform = `translateY(${lerp(40, 0, clamp(gp, 0, 1))}px) scale(${lerp(0.82, 1, clamp(gp, 0, 1)) * lerp(1, 0.8, gOut)})`;
      // needle: hesitates, slams to happy, slams to shocked, springs off
      const u = Math.max(0, t - T.tM - 0.15);
      const swing = a => a;                                                                   // (kept for readability)
      const aSw = tt => 0.8 * Math.sin((tt - T.tM) * 3.3 + 0.9 * Math.sin((tt - T.tM) * 1.7)) * ease.cubicOut(seg(tt, T.tM + 0.15, T.tM + 0.8));
      let a;
      if (t < T.tH) a = aSw(t);
      else if (t < T.tS) { const k = seg(t, T.tH, T.tH + 0.2); a = lerp(aSw(T.tH), 1, ease.backOut(k)) + Math.sin((t - T.tH) * 60) * 0.015 * (1 - k); }
      else { const k = seg(t, T.tS, T.tS + 0.2); a = lerp(1, -1, ease.backOut(k)) + Math.sin((t - T.tS) * 60) * 0.015 * (1 - k); }
      a = clamp(swing(a), -1.12, 1.12);
      let ntf = `rotate(${(a * MAXDEG).toFixed(2)} ${PX} ${PY})`, nop = 1;
      if (t >= T.tOff) {                                                                       // spring off the hub
        const d = t - T.tOff, rot = a * MAXDEG + 540 * d;
        const dx = 330 * d, dy = -620 * d + 1700 * d * d;
        ntf = `translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${rot.toFixed(1)} ${PX} ${PY})`; nop = 1 - clamp(seg(d, 0.2, 0.34));
      }
      el.needleG.setAttribute('transform', ntf); el.needleG.setAttribute('opacity', nop);

      // analysts
      const aOut = ease.expoIn(seg(t, T.tOff + 0.12, T.tOff + 0.34));
      for (const an of el.ana) {
        const p = seg(t, T.tA + an.i * 0.11, T.tA + an.i * 0.11 + 0.38), e = ease.backOut(p);
        an.card.style.opacity = clamp(p * 3) * (1 - aOut);
        an.card.style.transform = `translateY(${lerp(70, 0, clamp(e, 0, 1.1))}px) scale(${lerp(0.7, 1, clamp(e, 0, 1.1)) * lerp(1, 0.8, aOut)})`;
        an.q.style.transform = `rotate(${(Math.sin(lt * 4.4 + an.i * 1.3) * 7).toFixed(2)}deg) scale(${(1 + 0.04 * Math.sin(lt * 6 + an.i)).toFixed(3)})`;
      }

      // readout
      const rr = ease.backOut(seg(t, T.tR, T.tR + 0.4));
      el.read.style.opacity = clamp(rr * 3);
      el.read.style.transform = `scale(${lerp(0.5, 1, rr).toFixed(3)}) rotate(${lerp(-4, 0, clamp(rr, 0, 1))}deg)`;

      // exit: zoom out to a studio monitor
      const z = ease.expoInOut(seg(t, T.tZ, ctx.t1));
      const zs = lerp(1, 0.4, z), zy = lerp(0, -H * 0.04, z);
      el.scr.style.transform = `translateY(${zy}px) scale(${zs})`;
      el.scr.style.borderRadius = `${lerp(0, 40, z) / zs}px`;
      el.scr.style.boxShadow = `0 0 0 ${lerp(0, 46, z) / zs}px #0B0F1A, 0 0 0 ${lerp(0, 56, z) / zs}px #1d2a52`;
      el.stand.style.opacity = z; el.base.style.opacity = z; el.glow.style.opacity = z;
    },
  });
})();
