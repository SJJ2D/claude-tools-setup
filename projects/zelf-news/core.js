/* ZLF News — core: stage, deterministic timeline, scene registry, shared helpers.
 * Classic script (file:// safe). Globals: THREE (r159), OM (onetake motion.js), ZN (this file),
 * ZN_ASSETS / ZN_META (assets.js), ZN_TL (timeline.js).
 * Everything on screen is a pure function of t: window.__seek(t) twice gives the same frame. */
'use strict';
(function () {
  const q = new URLSearchParams(location.search);
  const VERT = q.has('v');
  const W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080;
  const only = q.get('only') ? q.get('only').split(',') : null;

  const ZN = window.ZN = {
    W, H, VERT, q,
    scenes: [], evs: [],
    // one palette, two fonts, for the whole film
    C: { navy: '#0A1A3A', navy2: '#12306B', navy3: '#1D4FA8', red: '#E0202B', red2: '#A80F18', white: '#FFFFFF',
         gold: '#FFC83A', cyan: '#43D3FF', ink: '#0B0F1A', paper: '#F4F1EA' },
    F: { ui: "'Almarai', sans-serif", stamp: "'Lalezar', 'Almarai', sans-serif" },
    // safe areas the persistent news UI owns (scenes keep key content out of them)
    SAFE: VERT ? { ticker: 150, bugW: 300, bugH: 150, lowerTop: 1600 } : { ticker: 128, bugW: 300, bugH: 150, lowerTop: 830 },
    img: {},
  };
  const { clamp, lerp, seg, sstep, ease } = OM;
  Object.assign(ZN, { clamp, lerp, seg, sstep, ease });

  // ── stage ──
  document.body.style.cssText = `margin:0;overflow:hidden;background:#000;width:${W}px;height:${H}px`;
  const stage = document.getElementById('stage');
  stage.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;background:${ZN.C.ink};direction:rtl;font-family:${ZN.F.ui}`;
  const glc = document.getElementById('gl');
  glc.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;z-index:0`;

  // ── 3D: one shared renderer, each 3D scene owns its THREE.Scene + camera ──
  let renderer = null, drew3d = false;
  ZN.renderer = () => {
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true, alpha: false });
      renderer.setPixelRatio(1); renderer.setSize(W, H, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    return renderer;
  };
  ZN.render3d = (scene, camera, exposure = 1.0) => { const r = ZN.renderer(); r.toneMappingExposure = exposure; r.render(scene, camera); drew3d = true; };
  ZN.camera = (fov = 35) => { const c = new THREE.PerspectiveCamera(fov, W / H, 0.1, 200); return c; };
  ZN.tex = key => { const t = new THREE.Texture(ZN.img[key]); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; };
  // canvas → texture (for 3D signs / screens with Arabic text; draw with ctx.direction='rtl')
  ZN.canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.direction = 'rtl'; draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

  // ── DOM helper ──
  ZN.el = (parent, tag, css, html) => { const e = document.createElement(tag || 'div'); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; (parent || stage).appendChild(e); return e; };
  ZN.photo = (parent, key, css) => { const e = new Image(); e.src = ZN_ASSETS[key]; e.draggable = false; if (css) e.style.cssText = css; (parent || stage).appendChild(e); return e; };

  // ── deterministic random ──
  ZN.rng = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  // ── timeline access (timeline.js defines ZN_TL = {dur, cuts:{id:[t0,t1]}, lines:{id:[s,e]}, words:{id:[[t,'w'],...]}, env:[...]|null, envRate}) ──
  ZN.cut = id => (ZN_TL.cuts[id] || [1e9, 1e9]);
  ZN.L = id => (ZN_TL.lines[id] ? ZN_TL.lines[id][0] : 1e9);          // line start
  ZN.LE = id => (ZN_TL.lines[id] ? ZN_TL.lines[id][1] : 1e9);         // line end
  ZN.wordT = (id, i, fb) => { const w = ZN_TL.words[id]; return w && w[i] ? w[i][0] : (fb != null ? fb : ZN.L(id)); };
  // time of the first word of a line that contains `frag` (so cues follow the spoken word after re-recording)
  ZN.wordAt = (id, frag, fb) => { const w = ZN_TL.words[id] || []; const hit = w.find(x => x[1].indexOf(frag) >= 0); return hit ? hit[0] : (fb != null ? fb : ZN.L(id)); };
  // speaking envelope 0..1 at time t (mouth flap). Real envelope if the VO exists, else word bumps.
  ZN.mouth = t => {
    if (ZN_TL.env) { const x = t * ZN_TL.envRate, i = Math.floor(x), f = x - i, e = ZN_TL.env; return clamp(lerp(e[i] || 0, e[i + 1] || 0, f)); }
    let m = 0;
    for (const id in ZN_TL.words) { const ws = ZN_TL.words[id], le = ZN_TL.lines[id][1];
      for (let k = 0; k < ws.length; k++) { const a = ws[k][0], b = Math.min(k + 1 < ws.length ? ws[k + 1][0] : le, a + 0.42);
        if (t >= a && t < b) { const u = (t - a) / (b - a); m = Math.max(m, Math.sin(u * Math.PI) * (0.55 + 0.45 * Math.sin(u * 19 + k))); } } }
    return clamp(m);
  };
  // resolve a script anchor to seconds: ['start',dt] ['end',dt] ['line_start','l4',dt] ['line_end','l4',dt] ['word','l4','frag',dt] ['cut_start','S2',dt] ['cut_end','S2',dt]
  ZN.at = a => { const k = a[0];
    if (k === 'start') return (a[1] || 0); if (k === 'end') return ZN_TL.dur + (a[1] || 0);
    if (k === 'line_start') return ZN.L(a[1]) + (a[2] || 0); if (k === 'line_end') return ZN.LE(a[1]) + (a[2] || 0);
    if (k === 'word') return ZN.wordAt(a[1], a[2]) + (a[3] || 0);
    if (k === 'cut_start') return ZN.cut(a[1])[0] + (a[2] || 0); if (k === 'cut_end') return ZN.cut(a[1])[1] + (a[2] || 0);
    return 0; };
  ZN.speaking = t => { for (const id in ZN_TL.lines) { const [a, b] = ZN_TL.lines[id]; if (t >= a - 0.02 && t <= b + 0.05) return id; } return null; };

  // ── sound events (names map to recorded SFX in the mix): register in init(), times derived from the timeline ──
  ZN.ev = (name, t, gain = 1) => ZN.evs.push({ name, t: +t.toFixed(3), gain });
  // script.js (window.ZN_SCRIPT) is the single source of every visible text; ZN.S(path, fallback)
  ZN.S = (path, fb) => { let o = window.ZN_SCRIPT; for (const k of path.split('.')) { if (o == null) break; o = o[k]; } return o == null ? fb : o; };

  // ── scenes ──
  // ZN.scene({ id, z, layer, init(ctx), update(t, ctx) })
  //   id     must equal a key of ZN_TL.cuts (its window). layer:'overlay' scenes run for the whole film.
  //   ctx    { id, t0, t1, ui }   ui = full-stage div owned by this scene (hidden outside its window)
  ZN.scene = def => ZN.scenes.push(def);

  function seek(t) {
    drew3d = false;
    for (const s of ZN.scenes) {
      if (!s.ctx) continue;
      const on = s.layer === 'overlay' ? true : (t >= s.ctx.t0 && t < s.ctx.t1);
      s.ctx.ui.style.display = on ? 'block' : 'none';
      if (on) { try { s.update(t, s.ctx); } catch (e) { if (!s._err) { s._err = 1; console.error('scene ' + s.id + ' update: ' + (e.stack || e)); ZN.errors.push(s.id + ': ' + e.message); } } }
    }
    glc.style.display = drew3d ? 'block' : 'none';
    ZN.t = t;
  }
  ZN.errors = [];

  function loadImages() {
    return Promise.all(Object.keys(window.ZN_ASSETS || {}).map(k => new Promise(res => { const im = new Image(); im.onload = () => { ZN.img[k] = im; res(); }; im.onerror = res; im.src = ZN_ASSETS[k]; })));
  }
  function initScenes() {
    ZN.dur = ZN_TL.dur;
    window.__meta = { dur: ZN.dur };
    for (const s of ZN.scenes) {
      if (only && only.indexOf(s.id) < 0) continue;
      if (!only && s.layer !== 'overlay' && !ZN_TL.cuts[s.id]) continue;            // test scenes run only when asked for
      // a scene with no cut in the timeline (test scenes, ?only=) gets the whole film as its window
      const [t0, t1] = (s.layer === 'overlay' || !ZN_TL.cuts[s.id]) ? [0, s.layer === 'overlay' || only ? ZN.dur : 0] : ZN.cut(s.id);
      const ui = ZN.el(stage, 'div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;display:none;z-index:${s.z || (s.layer === 'overlay' ? 100 : 10)}`);
      ui.id = 'ui-' + s.id;
      const ctx = { id: s.id, t0, t1, ui };
      try { s.init(ctx); s.ctx = ctx; } catch (e) { console.error('scene ' + s.id + ' init: ' + (e.stack || e)); ZN.errors.push(s.id + ' init: ' + e.message); }
    }
    // one grade for the whole film: gentle vignette on top of everything
    ZN.el(stage, 'div', `position:absolute;inset:0;z-index:900;pointer-events:none;background:radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(4,8,20,.34) 100%)`);
  }

  window.__seek = async t => seek(t);
  window.__events = () => ZN.evs.slice().sort((a, b) => a.t - b.t);
  window.__errors = () => ZN.errors;
  window.__ready = (async () => {
    await Promise.all([document.fonts.load("400 40px Almarai", 'عاجل'), document.fonts.load("700 40px Almarai", 'عاجل'), document.fonts.load("800 40px Almarai", 'عاجل'), document.fonts.load("400 40px Lalezar", 'عاجل')]);
    await document.fonts.ready; await loadImages();
    initScenes(); seek(q.has('t') ? parseFloat(q.get('t')) : 0);
    return true;
  })();
})();
