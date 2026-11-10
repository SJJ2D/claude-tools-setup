/* S3 — exclusive satellite image. HUD, scanline load of P1, altitude gag, one slow zoom to the sideburn,
 * target tags, purple alert, ID card, group chat, iris out. Everything is a pure function of t. */
'use strict';
(function () {
  const { C, F, W, H, seg, lerp } = ZN;
  const E = OM.ease, V = ZN.VERT;
  const S = k => ZN.S('txt.S3.' + k, '');
  const cIn = u => u * u * u;
  const PURPLE = '#8A3FFC';

  // layout (stage px)
  const L = V ? {
    win: { x: 40, y: 150, w: 1000, h: 800 },
    title: { x: 40, y: 36, w: 720, h: 84 },
    reg: { x: 40, y: 975, w: 1000, h: 445 },
    alt: { x: 40, y: 1432, w: 1000, h: 72 },
    loc: { x: 550, y: 1518, w: 490, h: 64 }, alr: { x: 40, y: 1518, w: 490, h: 64 },
    idw: 540,
  } : {
    win: { x: 70, y: 30, w: 740, h: 800 },
    title: { x: 840, y: 30, w: 750, h: 84 },
    reg: { x: 840, y: 140, w: 1020, h: 480 },
    alt: { x: 840, y: 636, w: 1020, h: 80 },
    loc: { x: 1360, y: 732, w: 500, h: 84 }, alr: { x: 840, y: 732, w: 500, h: 84 },
    idw: 540,
  };
  const box = r => `position:absolute;left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;`;
  const TXT = `direction:rtl;font-family:${F.ui};`;

  let root, bgP, win, scope, scopeRings, scopeDot, photo, scan, scanline, scLines, coord, stamp, tagEls = [], pings = [], lock, radar, orbit, altCard, altTxt,
    locChip, alrChip, idCard, chat, rejStamp, iris, titleDot, brk, sat, beam, link;
  let T = {};
  const WIN = L.win, ww = WIN.w, wh = WIN.h;
  const s0 = Math.max(ww / 1530, wh / 2040);
  const ZELF = { x: 790, y: 730 }, EAR = { x: 410, y: 960 }, GLS = { x: 1000, y: 575 };
  const ZMAX = 2.5;
  function cam(t) {
    const u = seg(t, T.z0, T.z1);
    const e = 0.35 * u + 0.65 * u * u * (3 - 2 * u);
    return { z: 1 + (ZMAX - 1) * e, cx: lerp(765, ZELF.x, e), cy: lerp(1020, ZELF.y, e) };
  }
  function mapP(px, py, c) { const s = s0 * c.z; return { x: ww / 2 + (px - c.cx) * s, y: wh / 2 + (py - c.cy) * s, s }; }

  function mk(p, css, html) { return ZN.el(p, 'div', css, html); }
  function pill(parent, col, icon, text, w, fs) {
    const e = mk(parent, `position:absolute;left:0;top:0;width:${w}px;height:${fs + 26}px;background:${C.navy};border:4px solid ${col};border-radius:14px;color:#fff;font:800 ${fs}px ${F.ui};${'direction:rtl;'}display:flex;align-items:center;justify-content:center;gap:12px;white-space:nowrap;opacity:0;box-shadow:0 8px 22px rgba(0,0,0,.45)`,
      `<span style="color:${col};font-size:${fs + 6}px">${icon}</span><span>${text}</span>`);
    e._w = w; e._h = fs + 26; return e;
  }

  ZN.scene({
    id: 'S3',
    init(ctx) {
      const t0 = ctx.t0, t1 = ctx.t1;
      const l9 = ZN.L('l9'), le8 = ZN.LE('l8');
      T = {
        t0, t1,
        excl: ZN.wordAt('l8', 'حصرية', t0 + 1.4),
        reveal: ZN.wordAt('l8', 'الأقمار', t0 + 2.1),
        sat: ZN.wordAt('l8', 'الصناع', t0 + 2.7),
        orbit: ZN.wordAt('l8', 'رها', t0 + 3.3),
        dist: ZN.wordAt('l8', 'مسافة', t0 + 4.5),
        inch: ZN.wordAt('l8', 'شبر', t0 + 5.0),
        pause: le8,
        id: ZN.wordAt('l9', 'سي', l9 + 1.0),
        grp: ZN.wordAt('l9', 'وقرو', l9 + 2.3),
        rej: ZN.wordAt('l9', 'مو', l9 + 3.8),
      };
      T.tag = [T.pause + 0.04, T.pause + 0.24, T.pause + 0.44].map(x => Math.min(x, l9 - 0.12));
      T.z0 = T.excl; T.z1 = t1 - 0.1;
      T.irisA = T.rej - 0.08; T.irisB = t1 - 0.12;

      // sounds: few, meaningful
      ZN.ev('beep', t0 + 0.3, 0.6);
      ZN.ev('stamp', T.excl, 0.9);
      ZN.ev('riser', T.excl + 0.1, 0.5);
      ZN.ev('ding', T.sat, 0.7);
      ZN.ev('shutter', T.orbit + 0.1, 0.8);
      ZN.ev('whoosh', T.dist, 0.6);
      ZN.ev('pop', T.inch, 0.7);
      ZN.ev('tick', T.tag[0], 0.7); ZN.ev('tick', T.tag[1], 0.7);
      ZN.ev('impact', T.tag[2], 1.0); ZN.ev('beep', T.tag[2] + 0.05, 0.6);
      ZN.ev('whoosh', T.id - 0.05, 0.7);
      ZN.ev('pop', T.grp, 0.8);
      ZN.ev('stamp', T.rej, 1.0);
      ZN.ev('whoosh', T.irisA + 0.1, 0.6);

      root = mk(ctx.ui, `position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;`);
      // background: bright blue + purple alt layer
      mk(root, `position:absolute;inset:0;background:linear-gradient(160deg,#7FC0FF 0%,#59A0FA 50%,#4B8BEB 100%)`);
      mk(root, `position:absolute;inset:0;opacity:.5;background-image:linear-gradient(rgba(255,255,255,.5) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.35) 2px,transparent 2px);background-size:96px 96px;background-position:12px 8px`);
      bgP = mk(root, `position:absolute;inset:0;opacity:0;background:linear-gradient(160deg,#C9A0FF 0%,#A474FA 55%,#8E5BEE 100%)`);

      // title bar
      const tb = mk(root, box(L.title) + `background:${C.navy};border-radius:14px;border:3px solid ${C.cyan};display:flex;align-items:center;gap:18px;padding:0 24px;box-sizing:border-box;color:#fff;font:800 ${V ? 38 : 42}px ${F.ui};${TXT}`);
      titleDot = mk(tb, `width:26px;height:26px;border-radius:50%;background:${C.red};flex:none`);
      mk(tb, 'white-space:nowrap', S('hud'));

      // window (photo)
      win = mk(root, box(WIN) + `overflow:hidden;background:${C.navy};border:6px solid #fff;box-sizing:border-box;border-radius:6px;box-shadow:0 0 0 4px ${C.cyan},0 18px 50px rgba(0,0,0,.45)`);
      const inner = mk(win, `position:absolute;left:-6px;top:-6px;width:${ww}px;height:${wh}px;overflow:hidden`);
      // scope (before the image)
      scope = mk(inner, `position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#2A62C0 0%,#12306B 80%);overflow:hidden`);
      mk(scope, `position:absolute;inset:0;opacity:.5;background-image:linear-gradient(rgba(67,211,255,.5) 2px,transparent 2px),linear-gradient(90deg,rgba(67,211,255,.5) 2px,transparent 2px);background-size:80px 80px`);
      scopeRings = mk(scope, `position:absolute;left:50%;top:50%;width:0;height:0`);
      [260, 480, 700].forEach(d => mk(scopeRings, `position:absolute;left:${-d / 2}px;top:${-d / 2}px;width:${d}px;height:${d}px;border:3px solid ${C.cyan};border-radius:50%`));
      mk(scopeRings, `position:absolute;left:-600px;top:-1px;width:1200px;height:3px;background:${C.cyan}`);
      mk(scopeRings, `position:absolute;left:-1px;top:-600px;width:3px;height:1200px;background:${C.cyan}`);
      scopeDot = mk(scope, `position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:${C.red};box-shadow:0 0 0 6px #fff`);
      // photo
      photo = mk(inner, `position:absolute;inset:0;overflow:hidden;clip-path:inset(0 0 100% 0)`);
      photo.img = ZN.photo(photo, 'p1', `position:absolute;left:0;top:0;width:1530px;height:2040px;transform-origin:0 0;max-width:none`);
      // CRT scanlines on photo
      scLines = mk(inner, `position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0 2px,transparent 2px 5px)`);
      scan = mk(inner, `position:absolute;left:0;width:${ww}px;height:10px;margin-top:-5px;background:#fff;box-shadow:0 0 26px 10px ${C.cyan};opacity:0`);
      // tag layer
      pings = [0, 1, 2].map(() => mk(inner, `position:absolute;left:0;top:0;width:0;height:0;`).appendChild(mk(null, 'x')) && null);
      pings = [0, 1, 2].map(() => { const e = mk(inner, `position:absolute;left:0;top:0;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;border:5px solid ${C.cyan};opacity:0`); return e; });
      lock = mk(inner, `position:absolute;left:0;top:0;width:0;height:0;opacity:0`);
      lock.a = mk(lock, `position:absolute;border:6px solid ${C.red};border-radius:50%;box-shadow:0 0 18px ${C.red}`);
      lock.b = mk(lock, `position:absolute;border:5px dashed ${C.red};border-radius:50%`);
      lock.ln = mk(lock, `position:absolute;width:6px;background:${C.red};`);
      lock.hd = mk(lock, `position:absolute;width:0;height:0;border-left:18px solid transparent;border-right:18px solid transparent;border-bottom:30px solid ${C.red}`);
      tagEls = [
        pill(inner, '#3DDC84', '✓', S('glasses'), V ? 330 : 310, 34),
        pill(inner, C.gold, '!', S('ear'), V ? 290 : 280, 34),
        pill(inner, C.red, '▲', S('suspect'), V ? 420 : 400, 38),
      ];
      tagEls[0].dot = mk(inner, `position:absolute;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#3DDC84;border:4px solid #fff;opacity:0`);
      tagEls[1].dot = mk(inner, `position:absolute;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:${C.gold};border:4px solid #fff;opacity:0`);
      tagEls[0].ln = mk(inner, `position:absolute;left:0;top:0;width:4px;background:#3DDC84;opacity:0;transform-origin:0 0`);
      tagEls[1].ln = mk(inner, `position:absolute;left:0;top:0;width:4px;background:${C.gold};opacity:0;transform-origin:0 0`);
      // coordinates + corner brackets
      coord = mk(inner, `position:absolute;left:16px;top:16px;background:${C.navy};color:${C.cyan};border-radius:8px;padding:6px 14px;font:700 28px 'Almarai',sans-serif;direction:ltr;white-space:nowrap;border:2px solid ${C.cyan}`);
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([r, b]) => mk(inner, `position:absolute;${r ? 'right' : 'left'}:10px;${b ? 'bottom' : 'top'}:${b ? 10 : 70}px;width:46px;height:46px;border:5px solid #fff;border-${r ? 'left' : 'right'}:none;border-${b ? 'top' : 'bottom'}:none`));
      // exclusive stamp
      stamp = mk(win, `position:absolute;left:${ww / 2 - 150}px;top:${wh * 0.18}px;width:300px;height:150px;background:#fff;border:10px solid ${C.red};border-radius:16px;color:${C.red};font:400 ${V ? 108 : 104}px ${F.stamp};display:flex;align-items:center;justify-content:center;opacity:0;${TXT}`, S('exclusive'));

      // right region: radar -> orbit diagram
      const R = L.reg;
      const panelCss = `background:${C.navy2};border:4px solid ${C.cyan};border-radius:16px;box-sizing:border-box;overflow:hidden;box-shadow:0 14px 36px rgba(0,0,0,.35);`;
      radar = mk(root, box(R) + panelCss);
      mk(radar, `position:absolute;inset:0;opacity:.35;background-image:linear-gradient(rgba(67,211,255,.5) 2px,transparent 2px),linear-gradient(90deg,rgba(67,211,255,.5) 2px,transparent 2px);background-size:60px 60px`);
      const rd = Math.min(R.h - 60, 400);
      radar.c = mk(radar, `position:absolute;left:${R.w / 2 - rd / 2}px;top:${R.h / 2 - rd / 2}px;width:${rd}px;height:${rd}px;border-radius:50%;border:3px solid ${C.cyan};background:repeating-radial-gradient(circle,transparent 0 ${rd / 8 - 2}px,rgba(67,211,255,.55) ${rd / 8 - 2}px ${rd / 8}px)`);
      radar.sw = mk(radar.c, `position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(67,211,255,0) 0deg,rgba(67,211,255,.65) 70deg,rgba(255,255,255,.9) 72deg,rgba(67,211,255,0) 73deg)`);
      const rr = ZN.rng(33);
      radar.blips = [0, 1, 2, 3].map(() => { const a = rr() * 6.28, d = 0.2 + rr() * 0.7; return { e: mk(radar.c, `position:absolute;width:16px;height:16px;margin:-8px;border-radius:50%;background:#fff;left:${50 + Math.cos(a) * d * 50}%;top:${50 + Math.sin(a) * d * 50}%`), a: Math.atan2(Math.sin(a), Math.cos(a)) }; });

      orbit = mk(root, box(R) + panelCss + 'opacity:0');
      orbit.innerHTML = `<svg viewBox="0 0 1000 470" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
        <defs><radialGradient id="s3e" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#3D8BFF"/><stop offset="1" stop-color="#12306B"/></radialGradient></defs>
        <circle cx="500" cy="780" r="470" fill="none" stroke="${C.cyan}" stroke-opacity=".25" stroke-width="30"/>
        <circle cx="500" cy="780" r="450" fill="url(#s3e)" stroke="${C.cyan}" stroke-width="5"/>
        <circle cx="500" cy="780" r="590" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="16 14"/>
        <g id="s3beam"><path d="M0 0 L-70 78 L70 78Z" fill="#fff" fill-opacity=".55"/></g>
        <g id="s3link"><line x1="0" y1="0" x2="0" y2="0" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/></g>
        <g id="s3head" transform="translate(470 292)">
          <ellipse cx="0" cy="10" rx="34" ry="38" fill="#D9A27A"/>
          <path d="M-36 6 C-40 -34 20 -44 34 -6 C14 -16 -6 -10 -14 12 C-20 -10 -30 -4 -36 6Z" fill="#2B1B14"/>
          <ellipse cx="-14" cy="14" rx="7" ry="11" fill="#C98E66"/>
          <path d="M-8 22 q8 18 6 30" stroke="#2B1B14" stroke-width="9" fill="none" stroke-linecap="round"/>
          <circle cx="12" cy="6" r="9" fill="none" stroke="#111" stroke-width="3"/><line x1="-6" y1="4" x2="3" y2="5" stroke="#111" stroke-width="3"/>
          <path d="M34 8 l12 6 l-10 4z" fill="#D9A27A"/>
        </g>
        <g id="s3sat"><rect x="-20" y="-14" width="40" height="28" rx="4" fill="#fff"/><rect x="-70" y="-10" width="46" height="20" fill="${C.gold}" stroke="#fff" stroke-width="3"/><rect x="24" y="-10" width="46" height="20" fill="${C.gold}" stroke="#fff" stroke-width="3"/><circle cx="0" cy="22" r="9" fill="${C.cyan}"/></g>
      </svg>`;
      orbit.sat = orbit.querySelector('#s3sat'); orbit.beam = orbit.querySelector('#s3beam'); orbit.link = orbit.querySelector('#s3link line');

      // altitude readout
      altCard = mk(root, box(L.alt) + `background:${C.navy};border:4px solid ${C.gold};border-radius:14px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;opacity:0;color:${C.gold};font:800 ${V ? 46 : 54}px ${F.ui};${TXT}white-space:nowrap;box-shadow:0 10px 26px rgba(0,0,0,.35)`);
      altTxt = mk(altCard, '', '');
      // chips
      const chipCss = (r, col) => box(r) + `background:${C.navy};border:4px solid ${col};border-radius:14px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;color:#fff;font:800 34px ${F.ui};${TXT}white-space:nowrap;opacity:0;box-shadow:0 8px 22px rgba(0,0,0,.35)`;
      locChip = mk(root, chipCss(L.loc, C.cyan), `<span style="color:${C.cyan};margin-left:12px">◎</span>${S('loc')}`);
      alrChip = mk(root, chipCss(L.alr, PURPLE), `<span style="color:#fff;margin-left:12px">●</span>${S('alert')}`);
      alrChip.style.background = PURPLE; alrChip.style.borderColor = '#fff';

      // ID card (generic, no emblem)
      const iw = L.idw, ih = R.h, gw = R.w - iw - 20;
      const idR = { x: R.x + R.w - iw, y: R.y, w: iw, h: ih };
      const chR = { x: R.x, y: R.y, w: gw, h: ih };
      idCard = mk(root, `position:absolute;left:${idR.x}px;top:${idR.y}px;width:${iw}px;height:${ih}px;perspective:1400px;opacity:0`);
      const idIn = mk(idCard, `position:absolute;inset:0;background:${C.paper};border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.45);border:4px solid #fff;box-sizing:border-box;${TXT}color:${C.ink}`);
      idCard.in = idIn;
      mk(idIn, `position:absolute;inset:0;opacity:.18;background:repeating-linear-gradient(135deg,${C.navy3} 0 2px,transparent 2px 14px)`);
      mk(idIn, `position:absolute;left:0;right:0;top:0;height:64px;background:${C.navy2};color:#fff;font:800 40px ${F.ui};display:flex;align-items:center;padding:0 24px`, S('idTitle'));
      const ph = V ? 150 : 170, phh = Math.round(ph * 731 / 640);
      const row = mk(idIn, `position:absolute;left:20px;right:20px;top:82px;display:flex;gap:18px;align-items:flex-start;direction:rtl`);
      const lines = mk(row, `flex:1;display:flex;flex-direction:column;gap:12px;font:700 34px/1.3 ${F.ui};direction:rtl;min-width:0`);
      mk(lines, '', S('idName')); mk(lines, '', S('idJob'));
      const ph1 = mk(row, `flex:none;width:${ph}px;height:${phh}px;border:5px solid ${C.navy2};border-radius:10px;overflow:hidden;background:#000`);
      ZN.photo(ph1, 'p1_zelf', `filter:brightness(1.9) contrast(1.05);width:100%;height:100%;object-fit:cover;display:block`);
      mk(idIn, `position:absolute;left:20px;right:20px;top:${82 + phh + 20}px;font:800 34px/1.3 ${F.ui};color:${C.navy2};direction:rtl`, S('idNo'));
      mk(idIn, `position:absolute;left:24px;right:24px;bottom:18px;height:${V ? 34 : 50}px;background:repeating-linear-gradient(90deg,${C.ink} 0 4px,transparent 4px 7px,${C.ink} 7px 9px,transparent 9px 16px)`);

      // chat panel (generic)
      chat = mk(root, `position:absolute;left:${chR.x}px;top:${chR.y}px;width:${gw}px;height:${ih}px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.45);border:4px solid ${C.navy2};box-sizing:border-box;opacity:0;${TXT}color:${C.ink}`);
      const ch = mk(chat, `position:absolute;left:0;right:0;top:0;height:78px;background:${C.navy2};display:flex;align-items:center;gap:12px;padding:0 16px;color:#fff;font:800 34px ${F.ui};white-space:nowrap`);
      mk(ch, `flex:none;width:46px;height:46px;border-radius:50%;background:${C.gold};border:3px solid #fff`);
      mk(ch, '', S('group'));
      mk(chat, `position:absolute;left:18px;right:18px;top:96px;font:400 34px/1.35 ${F.ui};color:${C.navy2};direction:rtl`, S('members'));
      const jr = mk(chat, `position:absolute;left:18px;right:18px;top:${V ? 200 : 214}px;height:${V ? 200 : 230}px`);
      chat.jb = mk(jr, `position:absolute;right:0;top:0;width:82%;background:#E8EEF9;border:3px solid ${C.navy3};border-radius:18px 18px 4px 18px;padding:14px 18px;font:700 34px/1.3 ${F.ui};color:${C.ink};box-sizing:border-box`, S('join'));
      rejStamp = mk(jr, `position:absolute;left:-6px;top:${V ? 92 : 104}px;padding:0 22px;background:#fff;border:9px solid ${C.red};border-radius:12px;color:${C.red};font:400 ${V ? 70 : 82}px/1.1 ${F.stamp};opacity:0;${TXT}white-space:nowrap`, S('rejected'));

      // iris
      iris = mk(ctx.ui, `position:absolute;left:0;top:0;width:10px;height:10px;border-radius:50%;border:8px solid ${C.red};box-sizing:border-box;opacity:0;pointer-events:none;box-shadow:0 0 0 4000px ${C.ink}`);
      mk(ctx.ui, 'display:none');
      ctx.ui._root = root;
    },

    update(t, ctx) {
      const lt = t - ctx.t0;
      const c = cam(t);
      // one light shake on the biggest hit (the lock-on thud)
      const su = (t - T.tag[2]) / 0.22;
      const shk = su >= 0 && su < 1 ? 6 * (1 - su) * Math.sin(su * 38) : 0;
      root.style.transform = `translate(${shk.toFixed(2)}px,${(shk * 0.6).toFixed(2)}px)`;

      // purple alert tint
      const alertA = seg(t, T.tag[2], T.tag[2] + 0.45);
      bgP.style.opacity = alertA;
      win.style.boxShadow = `0 0 0 4px ${alertA > 0.5 ? PURPLE : C.cyan},0 18px 50px rgba(0,0,0,.45)`;
      titleDot.style.opacity = (Math.floor(t * 2) % 2 === 0) ? 1 : 0.25;

      // coordinates (pure function of t)
      const la = (26.2285 + Math.sin(lt * 0.9) * 0.0031 - seg(t, T.excl, T.inch) * 0.0004).toFixed(4);
      const lo = (50.5860 + Math.cos(lt * 0.7) * 0.0042).toFixed(4);
      coord.textContent = `N ${la}  E ${lo}`;

      // scope: crosshair descends toward the dot
      const ds = lerp(3.4, 1, E.expoOut(seg(lt, 0.05, 1.5)));
      scopeRings.style.transform = `scale(${ds}) rotate(${lt * 6}deg)`;
      scopeDot.style.transform = `scale(${1 + 0.25 * Math.sin(lt * 7)})`;

      // exclusive stamp
      const sIn = seg(t, T.excl, T.excl + 0.22), sOut = seg(t, T.excl + 1.5, T.excl + 1.8);
      stamp.style.opacity = sIn > 0 ? 1 - sOut : 0;
      stamp.style.transform = `rotate(-8deg) scale(${lerp(2.6, 1, E.expoOut(sIn)) * (1 + 0.25 * E.cubicOut(sOut))})`;

      // photo load + zoom
      const p = seg(t, T.excl + 0.12, T.sat);
      photo.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
      photo.img.style.filter = `brightness(2.1) contrast(1.08) saturate(1.12) blur(${((1 - E.cubicOut(p)) * 7).toFixed(2)}px)`;
      const s = s0 * c.z;
      photo.img.style.transform = `translate(${(ww / 2 - c.cx * s).toFixed(2)}px,${(wh / 2 - c.cy * s).toFixed(2)}px) scale(${s.toFixed(5)})`;
      scan.style.top = (p * wh) + 'px';
      scan.style.opacity = (p > 0 && p < 1) ? 1 : 0;
      const flash = 1 - seg(t, T.sat, T.sat + 0.25);
      win.style.filter = t >= T.sat && flash > 0 ? `brightness(${1 + 0.5 * flash})` : 'none';
      scopeRings.parentNode.style.opacity = 1;

      // radar -> orbit diagram -> (exit) ; region hand-over to ID card + chat
      const rIn = seg(t, ctx.t0 + 0.2, ctx.t0 + 0.6);
      const swap = seg(t, T.orbit, T.orbit + 0.35);
      const regOut = seg(t, T.id - 0.1, T.id + 0.2);
      radar.style.opacity = rIn * (1 - swap);
      radar.style.transform = `translateX(${lerp(60, 0, E.cubicOut(rIn))}px)`;
      radar.sw.style.transform = `rotate(${lt * 150}deg)`;
      radar.blips.forEach((b, i) => { const ang = ((lt * 150) % 360) * Math.PI / 180; let d = ((ang - (b.a + Math.PI / 2)) % 6.2832 + 6.2832) % 6.2832; b.e.style.opacity = Math.max(0.15, 1 - d / 3); });
      orbit.style.opacity = swap * (1 - regOut);
      orbit.style.transform = `translateX(${lerp(0, -80, E.cubicIn ? E.cubicIn(regOut) : cIn(regOut))}px) scale(${lerp(0.94, 1, E.backOut(swap))})`;
      // satellite path
      const a1 = lerp(50, 16, E.cubicInOut(seg(t, T.orbit - 0.3, T.dist)));
      const ar = a1 * Math.PI / 180;
      const ox = 500 + 590 * Math.sin(ar), oy = 780 - 590 * Math.cos(ar);
      const dd = E.expoInOut(seg(t, T.dist, T.inch));
      const fx = 612, fy = 275;
      const sx = lerp(ox, fx, dd), sy = lerp(oy, fy, dd);
      const bob = Math.sin(lt * 3) * 3 * (1 - dd * 0.5);
      orbit.sat.setAttribute('transform', `translate(${sx.toFixed(1)} ${(sy + bob).toFixed(1)}) rotate(${lerp(-20, 0, dd)}) scale(${lerp(0.9, 0.8, dd)})`);
      const bm = seg(t, T.orbit + 0.05, T.orbit + 0.15) * (1 - seg(t, T.orbit + 0.4, T.orbit + 0.6));
      orbit.beam.setAttribute('transform', `translate(${sx.toFixed(1)} ${(sy + 12).toFixed(1)}) rotate(${(Math.atan2(330 - sy, 470 - sx) * 180 / Math.PI - 90).toFixed(1)}) scale(${(Math.hypot(470 - sx, 330 - sy) / 80).toFixed(2)})`);
      orbit.beam.setAttribute('opacity', bm.toFixed(2));
      orbit.link.setAttribute('x1', sx.toFixed(1)); orbit.link.setAttribute('y1', (sy + bob).toFixed(1));
      orbit.link.setAttribute('x2', 500); orbit.link.setAttribute('y2', 300);
      orbit.link.setAttribute('opacity', (dd > 0.98 ? 1 : 0));

      // altitude readout
      const aIn = seg(t, T.orbit + 0.25, T.orbit + 0.55);
      const aOut = seg(t, T.id - 0.1, T.id + 0.2);
      altCard.style.opacity = aIn;
      altCard.style.transform = `translateY(${lerp(30, 0, E.cubicOut(aIn))}px) scale(${1 + (t >= T.inch ? 0.06 * (1 - seg(t, T.inch, T.inch + 0.3)) : 0)})`;
      if (t < T.inch) {
        const r = Math.round(400 * (1 - E.expoOut(seg(t, T.dist, T.inch - 0.05))));
        altTxt.textContent = S('altFrom').replace(/\d+/, String(Math.max(r, 1)));
        altCard.style.background = C.navy; altCard.style.color = C.gold;
      } else {
        altTxt.textContent = S('altTo');
        const f = 1 - seg(t, T.inch, T.inch + 0.35);
        altCard.style.background = f > 0.01 ? C.gold : C.navy; altCard.style.color = f > 0.01 ? C.navy : '#fff';
      }
      altCard.style.borderColor = t >= T.inch ? '#fff' : C.gold;

      // tags
      const pz = mapP(ZELF.x, ZELF.y, c), pe = mapP(EAR.x, EAR.y, c), pg = mapP(GLS.x, GLS.y, c);
      const cl = (v, a, b) => Math.max(a, Math.min(b, v));
      const placeTag = (el, pt, k, dy, ymax) => {
        const u = seg(t, T.tag[k], T.tag[k] + 0.3), a = u > 0 ? 1 : 0;
        const bo = E.backOut(u);
        const x = cl(pt.x, el._w / 2 + 16, ww - el._w / 2 - 16), y = cl(pt.y + dy, el._h / 2 + 70, Math.min(wh - el._h / 2 - 16, ymax || 1e9));
        el.style.opacity = a;
        el.style.transform = `translate(${(x - el._w / 2).toFixed(1)}px,${(y - el._h / 2).toFixed(1)}px) scale(${lerp(0.4, 1, bo).toFixed(3)})`;
        el.style.transformOrigin = '50% 50%';
        if (el.dot) {
          const inside = pt.x > 14 && pt.x < ww - 14 && pt.y > 14 && pt.y < wh - 14;
          el.dot.style.opacity = inside ? a : 0; el.dot.style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px) scale(${bo.toFixed(2)})`;
          const dx = x - pt.x, dy2 = (y - pt.y);
          const len = Math.hypot(dx, dy2) - el._h / 2;
          el.ln.style.opacity = inside && len > 20 ? a : 0;
          el.ln.style.height = Math.max(0, len) + 'px';
          el.ln.style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px) rotate(${(Math.atan2(dx, -dy2) * 180 / Math.PI + 180).toFixed(1)}deg)`;
        }
      };
      placeTag(tagEls[0], pg, 0, -(V ? 100 : 86));
      placeTag(tagEls[1], pe, 1, -(V ? 110 : 96), V ? 470 : 480);
      // lock-on: double circle + arrow + suspect tag
      const rI = 150 * s0 * c.z;
      const lu = seg(t, T.tag[2], T.tag[2] + 0.28), lb = E.backOut(lu);
      lock.style.opacity = lu > 0 ? 1 : 0;
      lock.style.transform = `translate(${pz.x.toFixed(1)}px,${pz.y.toFixed(1)}px) scale(${lerp(2.6, 1, lb).toFixed(3)})`;
      lock.a.style.cssText += `;left:${-rI}px;top:${-rI}px;width:${2 * rI}px;height:${2 * rI}px`;
      lock.b.style.cssText += `;left:${-rI * 1.3}px;top:${-rI * 1.3}px;width:${2.6 * rI}px;height:${2.6 * rI}px;transform:rotate(${lt * 25}deg)`;
      const arrowLen = Math.max(50, 70);
      lock.ln.style.left = '-3px'; lock.ln.style.top = (rI * 1.3 + 4) + 'px'; lock.ln.style.height = arrowLen + 'px';
      lock.hd.style.left = '-18px'; lock.hd.style.top = (rI * 1.3 - 22) + 'px';
      const sTag = tagEls[2];
      const sx2 = cl(pz.x, sTag._w / 2 + 16, ww - sTag._w / 2 - 16), sy2 = cl(pz.y + rI * 1.3 + 4 + arrowLen + sTag._h / 2, 80, wh - sTag._h / 2 - 16);
      sTag.style.opacity = lu > 0 ? 1 : 0;
      sTag.style.transform = `translate(${(sx2 - sTag._w / 2).toFixed(1)}px,${(sy2 - sTag._h / 2).toFixed(1)}px) scale(${lerp(0.5, 1, lb).toFixed(3)})`;
      // radar pings
      [[pg, 0], [pe, 1], [pz, 2]].forEach(([pt, k]) => {
        const u = seg(t, T.tag[k], T.tag[k] + 0.55), el = pings[k];
        const inside = pt.x > 0 && pt.x < ww && pt.y > 0 && pt.y < wh;
        el.style.opacity = u > 0 && u < 1 && inside ? (1 - u) * 0.9 : 0;
        el.style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px) scale(${lerp(0.2, 1.4, E.cubicOut(u)).toFixed(3)})`;
      });
      // chips
      const chipIn = (el, ts) => { const u = seg(t, ts, ts + 0.3); el.style.opacity = u; el.style.transform = `translateY(${lerp(30, 0, E.cubicOut(u))}px) scale(${lerp(0.9, 1, E.backOut(u))})`; };
      chipIn(locChip, T.tag[1] + 0.05); chipIn(alrChip, T.tag[2] + 0.12);
      alrChip.style.boxShadow = `0 0 ${14 + 10 * Math.sin(lt * 6)}px ${PURPLE}`;

      // ID card flip + chat pop + rejected stamp
      const iu = seg(t, T.id, T.id + 0.5);
      idCard.style.opacity = iu > 0 ? 1 : 0;
      idCard.in.style.transform = `rotateY(${lerp(90, 0, E.backOut(iu))}deg) translateY(${(Math.sin(lt * 1.5) * 3).toFixed(1)}px)`;
      const gu = seg(t, T.grp, T.grp + 0.32), gb = E.backOut(gu);
      chat.style.opacity = gu > 0 ? 1 : 0;
      chat.style.transform = `scale(${lerp(0.6, 1, gb).toFixed(3)}) translateY(${(Math.sin(lt * 1.3) * 3).toFixed(1)}px)`;
      const ru = seg(t, T.rej, T.rej + 0.2);
      rejStamp.style.opacity = ru > 0 ? 1 : 0;
      rejStamp.style.transform = `rotate(-9deg) scale(${lerp(2.8, 1, E.expoOut(ru)).toFixed(3)})`;
      // ID/chat region also fades when region swap hasn't happened (hidden before)

      // iris out on the sideburn
      const iu2 = seg(t, T.irisA, T.irisB);
      const R = lerp(2300, 6, E.cubicInOut(iu2));
      const cxs = WIN.x + pz.x, cys = WIN.y + pz.y;
      iris.style.opacity = iu2 > 0 ? 1 : 0;
      iris.style.left = (cxs - R) + 'px'; iris.style.top = (cys - R) + 'px'; iris.style.width = (2 * R) + 'px'; iris.style.height = (2 * R) + 'px';
    },
  });
})();
