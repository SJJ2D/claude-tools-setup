/* S1b — THE OFFICIAL PHOTO. Hard cut from the staring anchor to the dog-filter photo (P2) hanging in a gold
 * "official portrait" frame; the "wrong photo" carousel gag (photo out → wait card → the SAME photo back, a bit
 * bigger); confirm stamp; then the photo goes grey and a red ring spotlights the sideburn.
 * DOM/SVG only, everything a pure function of t. All geometry lives in "frame-local" px (origin = frame centre). */
'use strict';
(function () {
  const { C, F, W, H, seg, lerp, ease } = ZN;
  const V = ZN.VERT;
  const S = k => ZN.S('txt.S1b.' + k, '');
  const GREEN = '#17A05A';                       // the brief asks for a green confirm stamp (only hue outside ZN.C)
  const GREY = '#DADDE3', GREY_INK = '#434A5A';  // neutral "not the topic" tags

  // ── photo geometry (p2 = 1260×2436). Points are in p2 pixels, measured on assets/p2.jpg ──
  const P2W = 1260;
  const FW = 642, FH = 740, IN = 44, WW = FW - 2 * IN, WH = FH - 2 * IN;   // frame outer, moulding+mat, window
  const K0 = WW / P2W;
  const VIEW_A = { k: K0, x0: 0, top: 953 };            // first showing: ears to beard
  const VIEW_B = { k: K0 * 1.07, x0: 0, top: 960 };     // "the same photo, slightly bigger"
  const loc = (px, py, v = VIEW_B) => [(px - v.x0) * v.k - WW / 2, (py - v.top) * v.k - WH / 2];
  const RING = loc(285, 1600), RR = 80;                 // his visible sideburn (side of the face, below the filter ear)
  const EAR_L = loc(250, 1100), EAR_R = loc(927, 1078); // top edges of the two filter ears

  // ── layout (frame-local px; the frame group is scaled by fs) ──
  const LY = V ? {
    cx: 540, cy: 770, fs: 1.25,
    glitch: { l: 150, cy: -394 },
    notTopic: { l: 70, cy: -64, fs: 30 },
    ears: { cx: 0, cy: -446 },
    earPaths: [[[66, -416], EAR_R], [[-66, -416], EAR_L]],
    stamp: { cx: 200, cy: 262 },
    topic: { l: -335, cy: 470 },
    leader: [[RING[0] - RR - 4, RING[1]], [-378, RING[1]], [-378, 470], [-337, 470]],
    real: { cx: 0, cy: 580 },
    panels: [[40, 168, 1000, 1418]], dado: 1612,
    pool: [1100, 1400],
  } : {
    cx: 1010, cy: 412, fs: 1,
    glitch: { l: 298, cy: -300 },
    notTopic: { l: 298, cy: -70, fs: 34 },
    ears: { l: 352, cy: -310 },
    earPaths: [[[354, -310], [EAR_R[0], -310], EAR_R], [[354, -310], [EAR_L[0], -310], EAR_L]],
    stamp: { cx: 236, cy: 268 },
    topic: { r: -358, cy: RING[1] },
    leader: [[RING[0] - RR - 4, RING[1]], [-360, RING[1]]],
    real: { r: -358, cy: RING[1] + 122 },
    panels: [[64, 56, 505, 742], [1451, 56, 405, 742]], dado: 842,
    pool: [1500, 1000],
  };

  // ── cue times: all from the timeline (re-flow when the VO is re-recorded) ──
  const D_OUT = 0.42, D_RET = 0.50, TR = WW + 28;      // carousel: durations and travel (peak ≈ 70–78 px/frame)
  const T = {};
  function cues(ctx) {
    T.t0 = ctx.t0; T.t1 = ctx.t1;
    T.glitch = ZN.wordAt('l2', 'نعتذر');
    T.out = ZN.wordAt('l2', 'غلط') - 0.04;                              // smoothstep starts slow: lead it a hair
    T.ret = Math.max(T.out + D_OUT + 0.2, ZN.L('l3') - 0.72);           // lands ~0.2 s before «لا»
    T.no = ZN.L('l3');
    T.stamp = ZN.wordAt('l3', 'هذي');
    T.dim = ZN.wordAt('l4', 'مو');
    T.zelf = ZN.wordAt('l4', 'زلف');
    // the second «الخبر» (after «عنه»): the ears fact-check lands there so the ring owns «زلفه» alone
    const ws = (ZN_TL.words.l4 || []), i0 = ws.findIndex(w => w[1].indexOf('عنه') >= 0);
    const nx = i0 >= 0 ? ws.slice(i0 + 1).find(w => w[1].indexOf('الخبر') >= 0) : null;
    T.ears = nx ? nx[0] : lerp(T.dim, T.zelf, 0.45);
    T.ears = Math.max(T.dim + 0.35, Math.min(T.ears, T.zelf - 0.5));
  }

  // script strings may carry ← and ✓ : draw them as SVG so they match the type weight on any machine
  const ARROW = '<svg viewBox="0 0 48 32" style="display:inline-block;width:1.05em;height:.7em;vertical-align:-.03em;margin:0 .2em"><path d="M45 16H7M19 4L6 16l13 12" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHECK = '<svg viewBox="0 0 32 32" style="display:inline-block;width:.78em;height:.78em;vertical-align:-.06em;margin:0 .12em"><path d="M4 17l8 8L28 6" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const rich = s => String(s).replace(/\s*←\s*/g, ARROW).replace(/\s*✓/g, CHECK);

  const mk = (p, css, html) => ZN.el(p, 'div', css, html);
  let world, frm, photoWrap, photo, cardWrap, arc, spinG, pct, spinBox, stamp, veil, spot, ring, echo;
  let gTag, gDot, nTag, eTag, tTag, rTag, lines = {};

  // a tag placed in frame-local coords: outer = static placement, inner = animated
  function tagAt(pos, css, html) {
    let o = 'position:absolute;white-space:nowrap;', tx = '0';
    if (pos.l != null) o += `left:${pos.l}px;`;
    if (pos.r != null) o += `right:${-pos.r}px;`;
    if (pos.cx != null) { o += `left:${pos.cx}px;`; tx = '-50%'; }
    o += `top:${pos.cy}px;transform:translate(${tx},-50%)`;
    return mk(mk(frm, o), css, html);
  }
  const plen = pts => { let d = 0; for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return d; };
  const pstr = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

  function build(ctx) {
    const PAD = 60, fx = LY.cx + PAD, fy = LY.cy + PAD;
    const ringSX = fx + RING[0] * LY.fs, ringSY = fy + RING[1] * LY.fs;
    ctx.ui.style.background = C.navy;
    // camera: scales about the sideburn so the final push lands on the ring
    world = mk(ctx.ui, `position:absolute;left:${-PAD}px;top:${-PAD}px;width:${W + 2 * PAD}px;height:${H + 2 * PAD}px;transform-origin:${ringSX}px ${ringSY}px;background:${C.navy}`);

    // ── the wall: lit navy, gold panel mouldings, dado rail ──
    // painted once into ONE canvas (stacked translucent CSS gradients left tile seams under swiftshader)
    const WWd = W + 2 * PAD, WHd = H + 2 * PAD;
    const cv = document.createElement('canvas'); cv.width = WWd; cv.height = WHd;
    cv.style.cssText = `position:absolute;left:0;top:0;width:${WWd}px;height:${WHd}px`;
    world.appendChild(cv);
    const g = cv.getContext('2d');
    const ellipse = (cx, cy, rx, ry, stops) => {
      g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); for (const [o, c] of stops) gr.addColorStop(o, c);
      g.fillStyle = gr; g.fillRect(-WWd * 2, -WHd * 4, WWd * 4, WHd * 8); g.restore();
    };
    ellipse(fx, fy - 30, LY.pool[0], LY.pool[1], [[0, '#86AEF2'], [0.3, '#618FE4'], [0.58, '#4274D2'], [0.8, '#2F62C2'], [1, C.navy3]]);
    for (const [x, y, w, h] of LY.panels) {
      const X = x + PAD, Y = y + PAD, lg = g.createLinearGradient(0, Y, 0, Y + h);
      lg.addColorStop(0, 'rgba(255,255,255,.05)'); lg.addColorStop(1, 'rgba(4,10,30,.07)');
      g.fillStyle = lg; g.fillRect(X, Y, w, h);
      g.lineWidth = 2; g.strokeStyle = 'rgba(255,200,58,.36)'; g.strokeRect(X + 1, Y + 1, w - 2, h - 2);
      g.strokeStyle = 'rgba(255,200,58,.16)'; g.strokeRect(X + 10, Y + 10, w - 20, h - 20);
    }
    const dy = LY.dado + PAD, dg = g.createLinearGradient(0, dy, 0, WHd);
    dg.addColorStop(0, '#2D60C0'); dg.addColorStop(0.55, C.navy3); dg.addColorStop(1, C.navy2);
    g.fillStyle = dg; g.fillRect(0, dy, WWd, WHd - dy);
    const rg = g.createLinearGradient(0, dy, 0, dy + 7); rg.addColorStop(0, '#FFE7A0'); rg.addColorStop(0.5, C.gold); rg.addColorStop(1, '#B8861B');
    g.fillStyle = rg; g.fillRect(0, dy, WWd, 7);
    // warm picture-light pool behind the frame
    ellipse(fx, fy - 120 * LY.fs, 520 * LY.fs / 0.72, 470 * LY.fs / 0.72, [[0, 'rgba(255,238,196,.26)'], [1, 'rgba(255,238,196,0)']]);

    // ── the frame group ──
    frm = mk(world, `position:absolute;left:${fx}px;top:${fy}px;width:0;height:0`);
    const box = (x, y, w, h, css, html) => mk(frm, `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css}`, html);
    box(-FW / 2, -FH / 2, FW, FH, `border-radius:7px;box-shadow:0 38px 70px rgba(2,6,22,.55),0 8px 16px rgba(2,6,22,.45);background:linear-gradient(135deg,#FFEDB0 0%,${C.gold} 20%,#C58E1C 46%,${C.gold} 68%,#FFE7A0 88%,#D9A22A 100%)`);
    box(-FW / 2 + 7, -FH / 2 + 7, FW - 14, FH - 14, `border:2px solid rgba(120,78,6,.45);border-radius:4px`);
    box(-FW / 2 + 14, -FH / 2 + 14, FW - 28, FH - 28, `border:2px solid rgba(255,248,214,.7);border-radius:3px`);
    box(-FW / 2 + 24, -FH / 2 + 24, FW - 48, FH - 48, `background:#8C6210`);
    box(-FW / 2 + 28, -FH / 2 + 28, FW - 56, FH - 56, `background:${C.paper}`);
    const win = box(-WW / 2, -WH / 2, WW, WH, `overflow:hidden;background:${C.paper};box-shadow:0 0 0 2px rgba(150,104,18,.8)`);

    // carousel slot 1: the photo
    photoWrap = mk(win, `position:absolute;left:0;top:0;width:${WW}px;height:${WH}px;overflow:hidden;background:${C.paper}`);
    photo = ZN.photo(photoWrap, 'p2', 'position:absolute;display:block;max-width:none');
    // carousel slot 2: the wait card
    cardWrap = mk(win, `position:absolute;left:0;top:0;width:${WW}px;height:${WH}px;overflow:hidden;background:linear-gradient(180deg,${C.navy2},${C.navy})`);
    mk(cardWrap, `position:absolute;left:0;right:0;top:0;height:10px;background:${C.gold}`);
    mk(cardWrap, `position:absolute;left:0;right:0;bottom:0;height:10px;background:${C.gold}`);
    const R = 66, CIRC = 2 * Math.PI * R;
    spinBox = mk(cardWrap, `position:absolute;left:${WW / 2 - 85}px;top:176px;width:170px;height:170px`,
      `<svg width="170" height="170" viewBox="0 0 170 170" style="position:absolute;left:0;top:0"><circle cx="85" cy="85" r="${R}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="15"/><g id="s1b-sg"><circle id="s1b-arc" cx="85" cy="85" r="${R}" fill="none" stroke="${C.gold}" stroke-width="15" stroke-linecap="round" stroke-dasharray="${CIRC.toFixed(1)}" stroke-dashoffset="${CIRC.toFixed(1)}"/></g></svg>`);
    arc = spinBox.querySelector('#s1b-arc'); spinG = spinBox.querySelector('#s1b-sg'); arc._c = CIRC;
    pct = mk(spinBox, `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;direction:ltr;color:#fff;font:800 36px ${F.ui}`, '0%');
    mk(cardWrap, `position:absolute;left:0;right:0;top:392px;text-align:center;color:#fff;font:800 46px ${F.ui};white-space:nowrap`, S('wait'));
    // window depth
    mk(win, `position:absolute;inset:0;box-shadow:inset 0 5px 12px rgba(0,0,0,.34),inset 0 0 0 1px rgba(0,0,0,.22)`);

    // brass plaque on the bottom moulding
    const plq = box(-150, FH / 2 - 26, 300, 56, `border-radius:6px;background:linear-gradient(180deg,#FFF1C2 0%,${C.gold} 44%,#C58E1C 100%);box-shadow:0 5px 12px rgba(2,6,22,.5),inset 0 0 0 2px rgba(120,78,6,.5);color:${C.navy};font:800 30px ${F.ui};display:flex;align-items:center;justify-content:center;white-space:nowrap`, S('frame'));
    for (const sx of [13, 277]) mk(plq, `position:absolute;left:${sx}px;top:23px;width:10px;height:10px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#FFF6D6,#9A6C12)`);

    // confirm stamp (lives under the veil: it greys with the photo)
    const stO = mk(frm, `position:absolute;white-space:nowrap;left:${LY.stamp.cx}px;top:${LY.stamp.cy}px;transform:translate(-50%,-50%)`);
    stamp = mk(stO, `background:${C.paper};color:${GREEN};font:400 58px ${F.stamp};line-height:1.25;padding:4px 30px 0;border:7px solid ${GREEN};border-radius:12px`, rich(S('confirm')));
    stampInk(0);

    // spotlight veil: darkens wall + frame, everything created after it stays lit
    veil = box(-LY.cx - 300, -LY.cy - 300, W + 600, H + 600, `background:#050B20;opacity:0`);

    // ── lines (SVG, frame-local coords) ──
    const HEAD = 15, paths = [];
    let svg = '';
    LY.earPaths.forEach((pts, i) => {
      const a = pts[pts.length - 2], b = pts[pts.length - 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
      const base = [b[0] - ux * HEAD, b[1] - uy * HEAD], body = pts.slice(0, -1).concat([base]);
      const head = [[base[0] - uy * 10, base[1] + ux * 10], [base[0] + uy * 10, base[1] - ux * 10], b];
      svg += `<polyline id="s1b-eo${i}" points="${pstr(body)}" fill="none" stroke="rgba(11,15,26,.6)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
        + `<polygon id="s1b-eh${i}" points="${pstr(head)}" fill="${GREY}" stroke="rgba(11,15,26,.6)" stroke-width="3" stroke-linejoin="round"/>`
        + `<polyline id="s1b-el${i}" points="${pstr(body)}" fill="none" stroke="${GREY}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      paths.push({ k: 'e' + i, len: plen(body) });
    });
    svg += `<polyline id="s1b-lo" points="${pstr(LY.leader)}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<polyline id="s1b-ll" points="${pstr(LY.leader)}" fill="none" stroke="${C.red}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    const sw = mk(frm, 'position:absolute;left:0;top:0;width:0;height:0', `<svg width="1" height="1" style="position:absolute;left:0;top:0;overflow:visible">${svg}</svg>`);
    const q = id => sw.querySelector('#' + id);
    lines.ears = paths.map((p, i) => ({ len: p.len, o: q('s1b-eo' + i), l: q('s1b-el' + i), h: q('s1b-eh' + i) }));
    lines.lead = { len: plen(LY.leader), o: q('s1b-lo'), l: q('s1b-ll') };
    for (const e of lines.ears) { e.o.setAttribute('stroke-dasharray', e.len.toFixed(1)); e.l.setAttribute('stroke-dasharray', e.len.toFixed(1)); }
    lines.lead.o.setAttribute('stroke-dasharray', lines.lead.len.toFixed(1)); lines.lead.l.setAttribute('stroke-dasharray', lines.lead.len.toFixed(1));

    // ── the spotlight: the only spot left in colour + the red ring ──
    const sx = RING[0] - RR, sy = RING[1] - RR;
    spot = box(sx, sy, 2 * RR, 2 * RR, `border-radius:50%;overflow:hidden;opacity:0`);
    ZN.photo(spot, 'p2', `position:absolute;display:block;max-width:none;width:${(P2W * VIEW_B.k).toFixed(2)}px;left:${(-VIEW_B.x0 * VIEW_B.k - WW / 2 - sx).toFixed(2)}px;top:${(-VIEW_B.top * VIEW_B.k - WH / 2 - sy).toFixed(2)}px;filter:saturate(1.18) contrast(1.04)`);
    const rcss = `position:absolute;left:${RING[0] - RR - 7}px;top:${RING[1] - RR - 7}px;width:${2 * RR + 14}px;height:${2 * RR + 14}px;border-radius:50%;opacity:0;`;
    echo = mk(frm, rcss + `border:5px solid ${C.red}`);
    ring = mk(frm, rcss + `border:12px solid ${C.red};box-shadow:0 0 0 3px #fff,0 0 36px 8px rgba(224,32,43,.7),inset 0 0 0 3px rgba(255,255,255,.9),inset 0 0 20px rgba(224,32,43,.45)`);

    // ── tags (opaque, attached to the frame) ──
    const tab = `display:flex;align-items:center;gap:12px;border-radius:8px;box-shadow:0 7px 16px rgba(2,6,22,.45);opacity:0;`;
    const dot = (c, r = 14) => `<span style="display:block;width:${r}px;height:${r}px;border-radius:50%;background:${c};flex:none"></span>`;
    gTag = tagAt(LY.glitch, tab + `transform-origin:0 50%;background:${C.red};color:#fff;font:800 30px ${F.ui};padding:9px 20px 11px;border:2px solid rgba(255,255,255,.85)`, dot('#fff') + `<span>${S('glitch')}</span>`);
    gDot = gTag.firstChild;
    nTag = tagAt(LY.notTopic, tab + `transform-origin:0 50%;background:${GREY};color:${GREY_INK};font:800 ${LY.notTopic.fs}px ${F.ui};padding:9px 20px 11px;border:2px solid #fff`, dot(GREY_INK, 12) + `<span>${S('notTopic')}</span>`);
    eTag = tagAt(LY.ears, tab + `transform-origin:${V ? '50% 100%' : '0 50%'};background:${GREY};color:${GREY_INK};font:700 32px ${F.ui};padding:8px 20px 10px;border:2px solid #fff`, `<span>${S('ears')}</span>`);
    const tp = String(S('topic')).split('←');
    const tHtml = tp.length === 2 ? `<span>${tp[0].trim()}</span>${ARROW.replace('currentColor', C.red)}<span style="color:${C.red}">${tp[1].trim()}</span>` : rich(S('topic'));
    tTag = tagAt(LY.topic, `transform-origin:${LY.topic.r != null ? '100% 50%' : '0 50%'};background:#fff;color:${C.ink};font:800 46px ${F.ui};padding:10px 26px 13px;border:5px solid ${C.red};border-radius:12px;box-shadow:0 10px 24px rgba(2,6,22,.5);opacity:0`, tHtml);
    rTag = tagAt(LY.real, `transform-origin:50% 50%;background:${C.red};color:#fff;font:400 66px ${F.stamp};line-height:1.25;padding:6px 32px 0;border-radius:12px;border:4px solid #fff;box-shadow:0 12px 26px rgba(2,6,22,.55);opacity:0`, S('real'));
  }

  // the stamp greys out with the photo by mixing its ink (a CSS filter here left a compositing seam in headless Chromium)
  const mix = (a, b, u) => { const h = x => [1, 3, 5].map(i => parseInt(x.substr(i, 2), 16)); const A = h(a), B = h(b); return 'rgb(' + A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',') + ')'; };
  function stampInk(g) {
    const ink = mix(GREEN, '#8A8F99', g), bg = mix(C.paper, '#C9CCD2', g);
    stamp.style.color = ink; stamp.style.borderColor = ink; stamp.style.background = bg;
    stamp.style.boxShadow = `inset 0 0 0 4px ${bg},inset 0 0 0 7px ${ink},0 10px 22px rgba(2,6,22,.5)`;
  }
  function setView(v) {
    photo.style.width = (P2W * v.k).toFixed(2) + 'px';
    photo.style.left = (-v.x0 * v.k).toFixed(2) + 'px';
    photo.style.top = (-v.top * v.k).toFixed(2) + 'px';
  }
  const dash = (o, u) => { const off = (o.len * (1 - u)).toFixed(1); o.o.setAttribute('stroke-dashoffset', off); o.l.setAttribute('stroke-dashoffset', off); o.o.style.opacity = o.l.style.opacity = u > 0.001 ? 1 : 0; };

  ZN.scene({
    id: 'S1b',
    init(ctx) {
      cues(ctx); build(ctx);
      ZN.ev('impact', T.t0, 1.0);
      ZN.ev('bark', T.t0 + 0.04, 1.0);
      ZN.ev('beep', T.glitch, 0.4);
      ZN.ev('slide', T.out + 0.04, 0.7);
      ZN.ev('slide', T.ret, 0.6);
      ZN.ev('bark', T.ret + D_RET * 0.72, 0.55);
      ZN.ev('stamp', T.stamp, 0.9);
      ZN.ev('impact', T.zelf, 0.85);
    },
    update(t) {
      const lt = t - T.t0;
      // ── camera: hard cut, one short light shake, then an almost still creep; final push onto the ring ──
      const pop = 0.02 * (1 - ease.expoOut(seg(lt, 0, 0.3)));
      const creep = 0.010 * seg(t, T.t0, T.out) + 0.008 * seg(t, T.ret + D_RET, T.zelf) + 0.026 * ease.cubicOut(seg(t, T.zelf, T.t1 + 0.3));
      const sh = lt < 0.2 ? 6 * Math.pow(1 - lt / 0.2, 2) : 0;
      world.style.transform = `translate(${(sh * Math.sin(lt * 96)).toFixed(2)}px,${(sh * 0.7 * Math.cos(lt * 83)).toFixed(2)}px) scale(${(1 + pop + creep).toFixed(5)})`;

      // ── carousel: photo out (left) → wait card → the SAME photo in (from the right), slightly bigger ──
      const back = t >= T.ret;
      const uo = ease.smooth(seg(t, T.out, T.out + D_OUT)), ur = ease.quadOut(seg(t, T.ret, T.ret + D_RET));
      photoWrap.style.transform = `translateX(${(back ? (1 - ur) * TR : -uo * TR).toFixed(2)}px)`;
      cardWrap.style.transform = `translateX(${(back ? -ur * TR : (1 - uo) * TR).toFixed(2)}px)`;
      setView(back ? VIEW_B : VIEW_A);
      const grow = ease.back(1.3)(seg(t, T.ret + D_RET * 0.45, T.ret + D_RET + 0.16));
      frm.style.transform = `scale(${(LY.fs * lerp(0.95, 1, grow)).toFixed(5)})`;

      // spinner completes during the pause
      const p = ease.sineInOut(seg(t, T.out + 0.16, T.ret - 0.03));
      arc.setAttribute('stroke-dashoffset', (arc._c * (1 - p)).toFixed(1));
      spinG.setAttribute('transform', `rotate(${(-90 + 300 * Math.max(0, t - T.out) * (1 - p)).toFixed(1)} 85 85)`);
      pct.textContent = Math.round(p * 100) + '%';
      spinBox.style.transform = `scale(${(1 + 0.07 * Math.sin(Math.PI * seg(t, T.ret - 0.05, T.ret + 0.13))).toFixed(4)})`;

      // ── «نعتذر»: the glitch tag blinks; it drops on «لا» ──
      const gp = t - T.glitch, ga = ease.backOut(seg(gp, 0, 0.22)), gx = seg(t, T.no, T.no + 0.2);
      const blink = gp < 0 ? 0 : (gp < 0.9 ? (Math.floor(gp / 0.15) % 2 === 0 ? 1 : 0.15) : 1);
      gTag.style.opacity = (blink * (1 - gx)).toFixed(3);
      gTag.style.transform = `translateY(${(26 * gx * gx).toFixed(2)}px) scale(${(0.7 + 0.3 * ga).toFixed(4)})`;
      gDot.style.opacity = gp > 0.9 && Math.floor((gp - 0.9) / 0.42) % 2 === 1 ? 0.25 : 1;

      // ── «هذي هي»: the stamp thuds onto the corner ──
      const su = seg(t, T.stamp - 0.11, T.stamp), sa = Math.max(0, t - T.stamp);
      const sScale = lerp(2.3, 1, su * su * su) * (1 + 0.06 * Math.exp(-sa * 16) * Math.sin(sa * 40));
      stamp.style.opacity = seg(t, T.stamp - 0.11, T.stamp - 0.05).toFixed(3);
      stamp.style.transform = `rotate(${lerp(-17, -8, su).toFixed(2)}deg) scale(${sScale.toFixed(4)})`;

      // ── «مو عنه»: the whole photo goes grey ──
      const g = ease.cubicOut(seg(t, T.dim, T.dim + 0.35)), z = seg(t, T.zelf - 0.02, T.zelf + 0.14);
      photoWrap.style.filter = g > 0 ? `grayscale(${g.toFixed(3)}) brightness(${(1 - 0.36 * g - 0.10 * z).toFixed(3)})` : 'none';
      stampInk(g);
      const nu = seg(t, T.dim + 0.08, T.dim + 0.36);
      nTag.style.opacity = seg(t, T.dim + 0.08, T.dim + 0.15).toFixed(3);
      nTag.style.transform = `translateX(${(-26 * (1 - ease.backOut(nu))).toFixed(2)}px) scale(${(0.82 + 0.18 * ease.backOut(nu)).toFixed(4)})`;

      // ── second «الخبر»: ears fact-check (small, grey) with arrows on the filter ears ──
      const eu = seg(t, T.ears, T.ears + 0.26);
      eTag.style.opacity = seg(t, T.ears, T.ears + 0.07).toFixed(3);
      eTag.style.transform = `scale(${(0.78 + 0.22 * ease.backOut(eu)).toFixed(4)})`;
      const lu = ease.cubicOut(seg(t, T.ears + 0.1, T.ears + 0.42));
      for (const e of lines.ears) { dash(e, lu); e.h.style.opacity = seg(t, T.ears + 0.32, T.ears + 0.4).toFixed(3); }

      // ── «زلفه»: the red ring snaps onto the sideburn, the only spot left in colour ──
      const Tz = T.zelf;
      veil.style.opacity = (0.30 * z).toFixed(3);
      spot.style.opacity = seg(t, Tz - 0.01, Tz + 0.05).toFixed(3);
      const ru = ease.expoOut(seg(t, Tz - 0.03, Tz + 0.2)), ra = Math.max(0, t - Tz - 0.2);
      ring.style.opacity = seg(t, Tz - 0.03, Tz + 0.02).toFixed(3);
      ring.style.transform = `scale(${(lerp(2.9, 1, ru) * (1 + 0.018 * Math.sin(ra * 7))).toFixed(4)})`;
      const cu = seg(t, Tz + 0.06, Tz + 0.5);
      echo.style.opacity = cu > 0 && cu < 1 ? (0.85 * (1 - cu)).toFixed(3) : 0;
      echo.style.transform = `scale(${(1 + 0.85 * ease.cubicOut(cu)).toFixed(4)})`;
      dash(lines.lead, ease.cubicOut(seg(t, Tz + 0.04, Tz + 0.18)));
      const tu = seg(t, Tz + 0.08, Tz + 0.3);
      tTag.style.opacity = seg(t, Tz + 0.08, Tz + 0.13).toFixed(3);
      tTag.style.transform = `scale(${(0.72 + 0.28 * ease.backOut(tu)).toFixed(4)})`;
      const qu = seg(t, Tz + 0.2, Tz + 0.38);
      rTag.style.opacity = seg(t, Tz + 0.2, Tz + 0.25).toFixed(3);
      rTag.style.transform = `rotate(-3deg) scale(${lerp(1.55, 1, ease.expoOut(qu)).toFixed(4)})`;
    },
  });
})();
