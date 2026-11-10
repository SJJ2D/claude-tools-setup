/* ZLF News — persistent broadcast package (overlay, whole film): sting, bug, breaking banner, lower thirds, ticker, cut wipes, end slate.
 * Pure DOM/CSS/SVG, every value a function of t. */
'use strict';
(function () {
  const { C, F, W, H, seg, lerp, ease } = ZN;
  const V = ZN.VERT;
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const inC = x => x * x * x;                       // ease-in (exits)
  const inOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const outC = ease.cubicOut, outQ = ease.quartOut, outB = ease.backOut;

  // layout
  const TK = ZN.SAFE.ticker;                         // ticker + banner block height
  const TICK_H = V ? 62 : 54, BAN_H = TK - TICK_H;
  const LOW_BOTTOM = H - TK - 12;
  const MARGIN = V ? 28 : 56;
  const CLOCK_W = V ? 190 : 250;

  const MARK = (id) => `<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block;overflow:visible">
    <defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.red}"/><stop offset="1" stop-color="${C.red2}"/></linearGradient></defs>
    <circle cx="50" cy="50" r="47" fill="url(#g${id})" stroke="${C.gold}" stroke-width="4"/>
    <path d="M63 17 C35 15 22 47 38 62 C51 74 72 60 62 46 C55 37 43 45 49 53" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="29" y="66" width="9" height="19" rx="4.5" fill="#fff" transform="rotate(-14 33 75)"/></svg>`;

  // diagonal polygon covering s in [trail, lead]; s measured along x + k*(H-y)
  const K = 0.34;
  function slash(trail, lead) {
    const kh = K * H;
    return `polygon(${trail - kh}px 0px,${lead - kh}px 0px,${lead}px ${H}px,${trail}px ${H}px)`;
  }
  const S0 = -2, S1 = W + K * H + 2;

  ZN.scene({
    id: 'newsui', layer: 'overlay', z: 200,
    init(ctx) {
      const ui = ctx.ui, R = {};
      ui.style.display = 'block';                       // measurable during init (core hides it again on seek)
      const T = n => ZN.S(n, '');
      const chAr = T('channel_ar'), chIndep = T('channel_ar_indep'), chEn = T('channel_en'), slogan = T('slogan');
      const flipT = ZN.at(['line_end', 'l16', 1.0]);
      const endT = ZN.at(['end', -0.9]);
      R.flipT = flipT; R.endT = endT;
      const FONT = ZN.F.ui;

      // ───────────── ticker ─────────────
      const tk = ZN.el(ui, 'div', `position:absolute;left:0;bottom:0;width:${W}px;height:${TICK_H}px;background:${C.navy};border-top:3px solid ${C.red};box-sizing:border-box;overflow:hidden`);
      const area = ZN.el(tk, 'div', `position:absolute;left:0;top:0;width:${W - CLOCK_W}px;height:100%;overflow:hidden;background:linear-gradient(180deg,${C.navy2},${C.navy})`);
      const mkStrip = () => {
        const s = ZN.el(area, 'div', `position:absolute;top:0;height:100%;display:flex;align-items:center;white-space:nowrap;direction:rtl;font:700 ${V ? 34 : 32}px/${TICK_H}px ${FONT};color:#fff;will-change:transform`);
        (ZN.S('ticker', []) || []).forEach(txt => {
          ZN.el(s, 'span', 'padding:0 22px', '');
          s.lastChild.textContent = txt;
          ZN.el(s, 'span', `display:inline-block;width:13px;height:13px;background:${C.red};transform:rotate(45deg);margin:0 14px`);
        });
        return s;
      };
      const stA = mkStrip(), stB = mkStrip();
      R.L = Math.max(stA.getBoundingClientRect().width, 1);
      R.stA = stA; R.stB = stB; R.area = area;
      ZN.el(area, 'div', `position:absolute;left:0;top:0;width:60px;height:100%;background:linear-gradient(90deg,${C.navy},rgba(10,26,58,0))`);
      // clock / brand block (fixed, right end)
      const ck = ZN.el(tk, 'div', `position:absolute;right:0;top:0;width:${CLOCK_W}px;height:100%;background:${C.red};display:flex;align-items:center;justify-content:center;gap:10px;direction:ltr;box-shadow:-6px 0 14px rgba(0,0,0,.35)`);
      ZN.el(ck, 'div', `width:${TICK_H - 18}px;height:${TICK_H - 18}px`, MARK('t'));
      R.clock = ZN.el(ck, 'div', `font:800 ${V ? 32 : 32}px ${FONT};color:#fff;letter-spacing:1px`, '21:00');

      // ───────────── banner ─────────────
      const cues = (ZN.S('banner', []) || []).map(c => ({ t: ZN.at(c.from), text: c.text })).sort((a, b) => a.t - b.t);
      R.cues = cues;
      const banner = ZN.el(ui, 'div', `position:absolute;left:0;bottom:${TICK_H}px;width:${W}px;height:${BAN_H}px;overflow:hidden`);
      R.banner = banner;
      const tagW = V ? 190 : 176;
      const strip = ZN.el(banner, 'div', `position:absolute;left:0;top:0;right:${tagW - 18}px;height:100%;background:${C.white};overflow:hidden`);
      const tag = ZN.el(banner, 'div', `position:absolute;right:0;top:0;width:${tagW}px;height:100%;background:${C.red};color:#fff;font:400 ${V ? 54 : 50}px/${BAN_H}px ${ZN.F.stamp};text-align:center;clip-path:polygon(0 0,100% 0,100% 100%,18px 100%);z-index:2;box-shadow:0 0 18px rgba(0,0,0,.4)`, 'عاجل');
      const availW = W - tagW - 36 - 28;
      const meas = ZN.el(ui, 'span', `position:absolute;visibility:hidden;white-space:nowrap;font:800 ${V ? 46 : 44}px ${FONT}`);
      const baseFs = V ? 46 : 44;
      cues.forEach(c => { meas.textContent = c.text; const w = meas.getBoundingClientRect().width; c.fs = Math.floor(baseFs * Math.min(1, availW / Math.max(w, 1))); });
      meas.remove();
      const mkTxt = () => ZN.el(strip, 'div', `position:absolute;left:0;right:34px;top:0;height:${BAN_H}px;line-height:${BAN_H}px;white-space:nowrap;color:${C.navy};font-weight:800;direction:rtl;text-align:right;will-change:transform`);
      R.bCur = mkTxt(); R.bPrev = mkTxt();
      R.bTag = tag;
      R.bLine = ZN.el(banner, 'div', `position:absolute;left:0;right:0;top:0;height:4px;background:${C.gold};z-index:3`);

      // ───────────── lower thirds ─────────────
      const lows = (ZN.S('lower', []) || []).map(c => ({ a: ZN.at(c.from), b: ZN.at(c.to), title: c.title, sub: c.sub, small: !!c.small }));
      lows.sort((x, y) => x.a - y.a);
      const GAP = 10, HM = V ? 140 : 111, HS = V ? 84 : 62;
      lows.forEach((c, i) => {
        c.h = c.small ? HS : HM;
        c.off = 0;
        for (let j = 0; j < i; j++) { const o = lows[j]; if (o.a < c.b && c.a < o.b) c.off += o.h + GAP; }
        const rt = MARGIN;
        const e = ZN.el(ui, 'div', `position:absolute;right:${rt}px;bottom:${H - LOW_BOTTOM + c.off}px;${V ? `left:${MARGIN}px;` : 'min-width:560px;max-width:1000px;'}height:${c.h}px;display:none;direction:rtl;box-shadow:0 10px 26px rgba(0,0,0,.45);will-change:transform,clip-path;overflow:hidden`);
        ZN.el(e, 'div', `position:absolute;right:0;top:0;width:${c.small ? 10 : 16}px;height:100%;background:${C.red};z-index:2`);
        if (!c.small) {
          const tr = ZN.el(e, 'div', `position:absolute;right:16px;left:0;top:0;height:${V ? 82 : 62}px;background:${C.white};color:${C.navy};font:800 ${V ? 62 : 50}px/${V ? 82 : 62}px ${FONT};padding:0 28px;white-space:nowrap;box-sizing:border-box`);
          tr.textContent = c.title;
          const sr = ZN.el(e, 'div', `position:absolute;right:16px;left:0;bottom:0;height:${V ? 58 : 49}px;background:${C.navy2};color:#fff;font:700 ${V ? 40 : 34}px/${V ? 58 : 49}px ${FONT};padding:0 28px;white-space:nowrap;box-sizing:border-box`);
          sr.textContent = c.sub;
          c.glint = ZN.el(e, 'div', `position:absolute;top:0;left:0;width:90px;height:${V ? 82 : 62}px;background:linear-gradient(100deg,rgba(255,200,58,0),rgba(255,200,58,.55),rgba(255,200,58,0));z-index:3`);
        } else {
          const r = ZN.el(e, 'div', `position:absolute;right:10px;left:0;top:0;height:100%;background:${C.navy};padding:0 26px;box-sizing:border-box;display:flex;align-items:center;gap:16px;white-space:nowrap;font-family:${FONT}`);
          const a = ZN.el(r, 'span', `color:${C.gold};font:800 ${V ? 44 : 36}px ${FONT}`); a.textContent = c.title;
          const b = ZN.el(r, 'span', `color:#fff;font:700 ${V ? 38 : 32}px ${FONT}`); b.textContent = c.sub;
        }
        c.el = e;
      });
      R.lows = lows;

      // ───────────── bug ─────────────
      const bugS = V ? 0.88 : 1;
      const bug = ZN.el(ui, 'div', `position:absolute;right:14px;top:14px;width:${ZN.SAFE.bugW - 28}px;height:${ZN.SAFE.bugH - 28}px;transform-origin:100% 0;transform:scale(${bugS});opacity:0;direction:rtl`);
      R.bug = bug; R.bugS = bugS;
      const bw = ZN.SAFE.bugW - 28, bh = ZN.SAFE.bugH - 28;
      ZN.el(bug, 'div', `position:absolute;inset:0;background:${C.navy};border-bottom:5px solid ${C.gold};border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.5)`);
      R.bugMark = ZN.el(bug, 'div', `position:absolute;right:8px;top:${(bh - 80) / 2 - 2}px;width:80px;height:80px;opacity:0`, MARK('b'));
      const nm = ZN.el(bug, 'div', `position:absolute;left:8px;right:96px;top:6px;height:${bh - 42}px;display:flex;align-items:center;justify-content:flex-start;overflow:visible`);
      R.name = ZN.el(nm, 'div', `font:800 27px/1.12 ${FONT};color:#fff;text-align:right;direction:rtl;width:100%;transform-origin:100% 50%`);
      R.ring = ZN.el(bug, 'div', `position:absolute;inset:-4px;border:4px solid ${C.gold};border-radius:14px;opacity:0`);
      const live = ZN.el(bug, 'div', `position:absolute;left:8px;bottom:6px;display:flex;align-items:center;gap:8px;direction:ltr;font:800 22px/1 ${FONT};color:#fff;letter-spacing:1px`);
      R.dot = ZN.el(live, 'span', `display:inline-block;width:14px;height:14px;border-radius:7px;background:${C.red}`);
      ZN.el(live, 'span', `background:${C.red};padding:3px 9px;border-radius:5px`, 'LIVE');
      ZN.el(live, 'span', `font:700 18px/1 ${FONT};opacity:.85`, 'ZLF 24');
      R.nameTxt = '';

      // ───────────── cut transitions ─────────────
      const cutIds = ['S2', 'S4', 'S5', 'S6'], skyId = 'S3';
      R.tr = cutIds.map(id => {
        const c = ZN.cut(id)[0];
        const mk = (bg, z) => ZN.el(ui, 'div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:${bg};display:none;z-index:${z};will-change:clip-path`);
        const o = { c, red: mk(`linear-gradient(115deg,${C.red2},${C.red} 40%,${C.red})`, 53), white: mk(C.white, 52), navy: mk(C.navy3, 51) };
        o.mark = ZN.el(ui, 'div', `position:absolute;left:${W / 2 - 80}px;top:${H / 2 - 80}px;width:160px;height:160px;display:none;z-index:54`, MARK('x' + id));
        ZN.ev('whip', c - 0.08);
        return o;
      });
      // sky switch: upward streaks
      {
        const c = ZN.cut(skyId)[0];
        const rnd = ZN.rng(77);
        const cols = []; let x = 0, i = 0;
        const N = V ? 9 : 16;
        const base = Math.ceil(W / N);
        while (x < W) {
          const w = Math.min(W - x, Math.round(base * (0.7 + rnd() * 0.6)));
          const col = i % 3 === 0 ? ['#fff', '#CFEFFF'] : (i % 3 === 1 ? ['#6EC9FF', '#2FA8F0'] : ['#43D3FF', '#BFEBFF']);
          const e = ZN.el(ui, 'div', `position:absolute;left:${x}px;top:0;width:${w + 1}px;height:${H}px;display:none;z-index:55;background:linear-gradient(180deg,${col[0]} 0,${col[1]} 14%,#7FD0FF 60%,#BFEBFF 100%);will-change:clip-path`);
          cols.push({ e, d: rnd() * 0.16, d2: rnd() * 0.16 });
          x += w; i++;
        }
        R.sky = { c, cols };
        ZN.ev('tick', c - 0.18); ZN.ev('tick', c - 0.02); ZN.ev('tick', c + 0.14);
      }

      // ───────────── opening sting ─────────────
      const st = ZN.el(ui, 'div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;z-index:60;pointer-events:none;overflow:hidden`);
      R.stNavy = ZN.el(st, 'div', `position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,${C.navy2},${C.navy} 70%)`);
      R.stWhite = ZN.el(st, 'div', `position:absolute;inset:0;background:${C.white};display:none`);
      R.stRed = ZN.el(st, 'div', `position:absolute;inset:0;background:linear-gradient(115deg,${C.red2},${C.red} 45%,${C.red});display:none`);
      // logo lockup above the panels
      const lk = ZN.el(ui, 'div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;z-index:61;pointer-events:none`);
      const MS = V ? 300 : 300;
      const lcy = H / 2 - (V ? 120 : 80);
      R.stMark = ZN.el(lk, 'div', `position:absolute;left:${W / 2 - MS / 2}px;top:${lcy - MS / 2}px;width:${MS}px;height:${MS}px;filter:drop-shadow(0 12px 22px rgba(0,0,0,.5))`, MARK('s'));
      R.stTxt = ZN.el(lk, 'div', `position:absolute;left:0;width:${W}px;top:${lcy + MS / 2 + 18}px;text-align:center;direction:rtl`);
      ZN.el(R.stTxt, 'div', `font:400 ${V ? 104 : 128}px/1.05 ${ZN.F.stamp};color:#fff;text-shadow:0 6px 20px rgba(0,0,0,.45)`).textContent = chAr;
      ZN.el(R.stTxt, 'div', `margin-top:10px;font:800 ${V ? 54 : 60}px/1 ${FONT};color:${C.gold};letter-spacing:10px;direction:ltr`).textContent = chEn;
      R.stCx = W / 2; R.stCy = lcy; R.stMS = MS;
      // landing target = bug mark centre (measured with bug at identity opacity 0 is fine)
      const br = R.bugMark.getBoundingClientRect();
      R.tgt = { x: br.left + br.width / 2, y: br.top + br.height / 2, s: br.width / MS };
      ZN.ev('sting', 0.05);

      // ───────────── end slate ─────────────
      const sl = ZN.el(ui, 'div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:#000;z-index:80;display:none;overflow:hidden`);
      R.slate = sl;
      const parts = String(T('txt.S6.slate')).split('—').map(s => s.trim());
      const cy = H / 2 - (V ? 140 : 100);
      R.slMark = ZN.el(sl, 'div', `position:absolute;left:${W / 2 - 110}px;top:${cy - 110}px;width:220px;height:220px`, MARK('e'));
      R.slName = ZN.el(sl, 'div', `position:absolute;left:0;width:${W}px;top:${cy + 130}px;text-align:center;font:400 ${V ? 96 : 110}px/1.05 ${ZN.F.stamp};color:#fff;direction:rtl`);
      R.slName.textContent = chIndep;
      R.slEn = ZN.el(sl, 'div', `position:absolute;left:0;width:${W}px;top:${cy + 130 + (V ? 120 : 138)}px;text-align:center;font:800 ${V ? 50 : 56}px/1 ${FONT};color:${C.gold};letter-spacing:10px;direction:ltr`);
      R.slEn.textContent = parts[0] || chEn;
      R.slLine = ZN.el(sl, 'div', `position:absolute;left:50%;width:${V ? 320 : 420}px;margin-left:${V ? -160 : -210}px;top:${cy + 130 + (V ? 196 : 218)}px;height:5px;background:${C.red}`);
      R.slSlog = ZN.el(sl, 'div', `position:absolute;left:0;width:${W}px;top:${cy + 130 + (V ? 226 : 252)}px;text-align:center;font:700 ${V ? 54 : 60}px/1.2 ${FONT};color:#fff;direction:rtl`);
      R.slSlog.textContent = parts[1] || slogan;
      ZN.ev('bark', endT + 0.05);

      ZN.ev('stamp', flipT, 0.8);
      R.chAr = chAr; R.chIndep = chIndep;
      ctx.R = R;
    },

    update(t, ctx) {
      const R = ctx.R;
      const { flipT, endT } = R;

      // ticker position
      const off = (170 * t) % R.L, aw = R.area.clientWidth || (W - CLOCK_W);
      R.stA.style.left = (aw - R.L + off) + 'px';
      R.stB.style.left = (aw - 2 * R.L + off) + 'px';
      R.clock.innerHTML = '21<span style="opacity:' + (Math.floor(t * 2) % 2 ? 0.25 : 1) + '">:</span>00';

      // bug
      const bIn = seg(t, 0.95, 1.3);
      R.bug.style.opacity = bIn > 0 ? 1 : 0;
      const bs = R.bugS * (0.9 + 0.1 * outB(bIn));
      R.bug.style.transform = `scale(${bs})`;
      R.bugMark.style.opacity = t >= 1.24 ? 1 : 0;
      R.dot.style.opacity = 0.45 + 0.55 * (Math.sin(t * 5) > 0 ? 1 : 0.2);
      const fl = t >= flipT;
      const nameTxt = fl ? R.chIndep : R.chAr;
      if (R.nameTxt !== nameTxt) { R.name.textContent = nameTxt; R.nameTxt = nameTxt; }
      const fp = seg(t, flipT, flipT + 0.4);
      if (fl && fp < 1) {
        R.name.style.transform = `scale(${lerp(1.7, 1, outB(fp))}) rotate(${lerp(-7, 0, outC(fp))}deg)`;
        R.name.style.color = fp < 0.5 ? C.gold : '#fff';
        R.ring.style.opacity = (1 - fp) * 0.9; R.ring.style.transform = `scale(${1 + fp * 0.12})`;
      } else { R.name.style.transform = 'none'; R.name.style.color = '#fff'; R.ring.style.opacity = 0; }

      // banner
      const cues = R.cues; let ci = -1;
      for (let i = 0; i < cues.length; i++) if (t >= cues[i].t) ci = i;
      const bOn = ci >= 0 && t < endT;
      R.banner.style.display = bOn ? 'block' : 'none';
      if (bOn) {
        const c = cues[ci], p = t - c.t;
        const first = ci === 0;
        const ep = first ? outQ(seg(p, 0, 0.45)) : 1;
        R.banner.style.transform = `translateY(${(1 - ep) * 110}%)`;
        const q = outC(seg(p, 0.07, 0.3));
        R.bCur.textContent = c.text; R.bCur.style.fontSize = c.fs + 'px';
        R.bCur.style.transform = first ? 'none' : `translateY(${(1 - q) * 100}%)`;
        if (!first && q < 1) {
          const pv = cues[ci - 1]; R.bPrev.style.display = 'block';
          R.bPrev.textContent = pv.text; R.bPrev.style.fontSize = pv.fs + 'px';
          R.bPrev.style.transform = `translateY(${-inC(seg(p, 0, 0.16)) * 100}%)`;
        } else R.bPrev.style.display = 'none';
        // tag pulse on each change
        R.bTag.style.transform = `scale(${1 + 0.07 * Math.max(0, 1 - p / 0.3) * (first ? 0 : 1)})`;
        R.bTag.style.transformOrigin = '100% 50%';
      }

      // lower thirds
      for (const c of R.lows) {
        const e = c.el, exitD = 0.33, endAt = Math.min(c.b, endT);
        if (t < c.a || t > endAt + exitD) { e.style.display = 'none'; continue; }
        e.style.display = 'block';
        const p = outC(seg(t, c.a, c.a + 0.5)), q = inC(seg(t, endAt, endAt + exitD));
        const cl = Math.max((1 - p), q);
        e.style.clipPath = `inset(0 0 0 ${(cl * 100).toFixed(2)}%)`;
        e.style.transform = `translateX(${(1 - p) * 120 + q * 70}px)`;
        if (c.glint) { const g = seg(t, c.a + 0.3, c.a + 0.85); c.glint.style.display = g > 0 && g < 1 ? 'block' : 'none'; c.glint.style.left = (-100 + g * (e.offsetWidth + 100)) + 'px'; }
      }

      // cut wipes
      for (const o of R.tr) {
        const D = 0.32, u = (t - (o.c - D / 2)) / D;
        const on = u > 0 && u < 1;
        for (const k of ['red', 'white', 'navy', 'mark']) o[k].style.display = on ? 'block' : 'none';
        if (on) {
          const f = (s, a, b) => lerp(S0, S1, inOut(seg(u, a, b)));
          // lead edges reach full by u<=.48, trail edges start after .52
          o.navy.style.clipPath = slash(f(0, .56, 1.0), f(0, 0.0, 0.40) + 0);
          o.white.style.clipPath = slash(f(0, .53, .97), f(0, 0.03, 0.44));
          o.red.style.clipPath = slash(f(0, .50, .93), f(0, 0.06, 0.48));
          const m = seg(u, 0.3, 0.5) * (1 - seg(u, 0.5, 0.72));
          o.mark.style.opacity = m; o.mark.style.transform = `scale(${0.7 + 0.5 * m})`;
        }
      }
      // sky switch
      {
        const s = R.sky, D = 0.5, u = (t - (s.c - D / 2)) / D, on = u > 0 && u < 1;
        for (const k of s.cols) {
          k.e.style.display = on ? 'block' : 'none';
          if (on) {
            const top = lerp(H + 40, -20, outQ(seg(u, k.d * 0.6, 0.38 + k.d * 0.6)));
            const bot = lerp(H + 40, -20, inOut(seg(u, 0.55 + k.d2 * 0.6, 0.55 + 0.4 + k.d2 * 0.6 - 0.02)));
            k.e.style.clipPath = `polygon(0 ${top}px,100% ${top}px,100% ${Math.max(top, bot)}px,0 ${Math.max(top, bot)}px)`;
          }
        }
      }

      // opening sting
      {
        const on = t < 1.3;
        R.stNavy.parentNode.style.display = on ? 'block' : 'none';
        R.stMark.parentNode.style.display = on ? 'block' : 'none';
        if (on) {
          R.stNavy.style.display = 'block'; R.stWhite.style.display = 'block'; R.stRed.style.display = 'block';
          // red/white/navy clear along the slash
          const g = (a, b) => lerp(S0, S1, inOut(seg(t, a, b)));
          R.stRed.style.clipPath = slash(g(.70, 1.10), S1);
          R.stWhite.style.clipPath = slash(g(.74, 1.15), S1);
          R.stNavy.style.clipPath = slash(g(.78, 1.20), S1);
          R.stNavy.style.background = `radial-gradient(ellipse at 50% 50%,${C.navy2},${C.navy} 70%)`;
          // logo: pop with weight, hold, dock
          const pop = outB(seg(t, 0.02, 0.42));
          const dock = inOut(seg(t, 0.72, 1.24));
          const s = lerp(0.35, 1, pop) * lerp(1, R.tgt.s, dock);
          const dx = (R.tgt.x - R.stCx) * dock, dy = (R.tgt.y - R.stCy) * dock;
          R.stMark.style.opacity = t >= 1.26 ? 0 : clamp01(seg(t, 0.0, 0.1) + 0.0);
          R.stMark.style.transform = `translate(${dx}px,${dy}px) scale(${s}) rotate(${lerp(-25, 0, outC(seg(t, 0.02, 0.5)))}deg)`;
          const tp = outQ(seg(t, 0.2, 0.55));
          R.stTxt.style.opacity = tp * (1 - seg(t, 0.68, 0.88));
          R.stTxt.style.transform = `translateY(${(1 - tp) * 50}px) scale(${lerp(1, 0.9, seg(t, 0.68, 0.88))})`;
        }
      }

      // end slate
      if (t >= endT) {
        const lt = t - endT;
        R.slate.style.display = 'block';
        const a = outB(seg(lt, 0.08, 0.5)), b = outQ(seg(lt, 0.22, 0.6)), c = outQ(seg(lt, 0.4, 0.8));
        R.slMark.style.transform = `scale(${a})`; R.slMark.style.opacity = a > 0 ? 1 : 0;
        R.slName.style.opacity = b; R.slName.style.transform = `translateY(${(1 - b) * 30}px)`;
        R.slEn.style.opacity = b; R.slEn.style.transform = `translateY(${(1 - b) * 30}px)`;
        R.slLine.style.transform = `scaleX(${c})`; R.slLine.style.opacity = c > 0 ? 1 : 0;
        R.slSlog.style.opacity = c; R.slSlog.style.transform = `translateY(${(1 - c) * 24}px)`;
      } else R.slate.style.display = 'none';
    },
  });
})();
