/* ZLF News — ANCHOR + STUDIO library (NOT a scene: it registers nothing, it only adds builders to ZN).
 *
 * UNITS: metres, y up. The anchor faces +Z (toward the camera). Put studio.group and anchor.group at the SAME
 * position (default 0,0,0): that point is the floor under his chair. Desk top y = 0.80, his eyes y ≈ 1.60,
 * top of the hair y ≈ 2.05, shoulders x ≈ ±0.43. Call both builders from a scene's init() (fonts are loaded there).
 *
 *   const studio = ZN.makeStudio();            scene.add(studio.group);        // brings its own lights
 *   const anchor = ZN.makeAnchor();            scene.add(anchor.group);
 *   const cam = ZN.camera(30);
 *   update(t): anchor.pose({ t, talk: ZN.mouth(t), blink: ZN.anchorBlink(t) });
 *              ZN.anchorCam(cam, ZN.anchorShots.medium);      // or (cam, shotA, shotB, k[, [dx,dy,dz]]) to blend two framings / dolly
 *              ZN.render3d(scene, cam);
 *
 * ZN.makeStudio(opts) → { group, setScreen(tex|null), lights:{hemi,key,fill,rim}, focus (Vector3: his face),
 *                         screen (Mesh), screenGroup (Group: screen + frame + stand), screenCenter (Vector3, world),
 *                         screenSize:[w,h] m, shots (= ZN.anchorShots), deskY, deskZ }
 *   opts.layout  'side' (default in 16:9): the swappable 16:9 screen (1.84 × 1.035 m) stands camera-left of the anchor, over his shoulder
 *                'top'  (default in 9:16): the screen (1.92 × 1.08 m) hangs centred above/behind his head
 *   setScreen(tex)  swaps the hero screen picture (any 16:9 THREE.Texture: ZN.tex('p1'), ZN.canvasTex(1024,576,…)); it is unlit
 *                   and not tone-mapped, so the picture keeps its own colours. setScreen(null) restores the channel ident.
 *   In the 16:9 close-ups a slice of the screen shows at the left edge; across a hard cut you may cheat it away with
 *   studio.screenGroup.visible = false.
 *
 * ZN.makeAnchor(opts) → { group, pose(p), head (Group) }       opts: { deskY:0.80, deskZ:0.50, chair:true, papers:true }
 *   pose(p): stateless, every field optional (neutral = 0):
 *     t       seconds: idle breathing + very slow sway (and the rhythm of the tie wiggle / paper tap)
 *     talk    0..1   jaw drops, mouth opens under the moustache, moustache tips bounce
 *     browR   -1..1  HIS right eyebrow (on the LEFT of the picture): -1 scowl, +1 raised
 *     browL   -1..1  his left eyebrow (on the right of the picture)
 *     tilt    rad    head roll; + = top of the head goes to the LEFT of the picture (away from the channel bug). Gag range 0..0.5
 *     yaw     rad    + = he turns toward the right of the picture (the 16:9 screen is at yaw ≈ -0.5)      pitch  rad  + = looks down
 *     blink   0..1   eyes closed                  pupilX/pupilY  -1..1 (+x = right of the picture, +y = up; 0,0 = locked on the camera)
 *     squint  0..1   both lids close in to a slit + brows come down a little: the over-serious stare
 *     lean    0..1   leans over the desk toward the camera (the tie swings free)
 *     tie     0..1   his right hand leaves the desk; 1 = at the tie knot, wiggling it (chin lifts, tie waggles)
 *     shrug   0..1   shoulders to the ears, both hands up, palms open
 *     paper   0..1   picks the papers up with both hands; 1 = stack upright, tapping it on the desk
 *   ZN.anchorBlink(t) → 0..1 deterministic blink track for `blink`.
 *   ZN.anchorExposure → exposure to pass to ZN.render3d(scene, cam, ZN.anchorExposure): 1.0 in 16:9, 1.2 in 9:16.
 *
 * RECOMMENDED FRAMINGS  ZN.anchorShots.{medium, mediumC, close, tight, wide}  (the 16:9 or the 9:16 set, from ZN.VERT)
 *   each {p: camera position, t: look-at, fov: vertical degrees}:
 *   16:9  medium   p(-0.62,1.46,3.55) t(-0.62,1.40,0) fov 28   anchor right of centre, hero screen whole on the left (the news two-shot)
 *         mediumC  p(0,1.50,3.25)     t(0,1.46,0)      fov 26   anchor centred, chest-up (a slice of the screen shows on the left)
 *         close    p(0,1.63,2.55)     t(0,1.61,0)      fov 20   whole head with the hair: the stare and the slow tilt (use tilt > 0)
 *         tight    p(0,1.60,1.95)     t(0,1.56,0)      fov 20   eyes + moustache
 *         wide     p(0,1.95,8.6)      t(0,1.40,-0.5)   fov 32   whole studio
 *   9:16  medium   p(0,1.78,5.7)      t(0,1.82,0)      fov 30   screen on top, anchor below, desk in the lower-third band (mediumC = same)
 *         close    p(0,1.88,3.5)      t(0,1.52,0)      fov 22   head + tie
 *         tight    p(0,1.82,2.9)      t(0,1.58,0)      fov 22
 *         wide     p(0,2.0,9.8)       t(0,1.9,0)       fov 34
 */
'use strict';
(function () {
  const { C, clamp, lerp, sstep } = ZN;
  const PI = Math.PI;
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const mix = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  const rgba = (h, a) => { const s = new THREE.Color(h).getHexString(); return `rgba(${parseInt(s.slice(0, 2), 16)},${parseInt(s.slice(2, 4), 16)},${parseInt(s.slice(4, 6), 16)},${a})`; };
  const blue = k => mix(C.navy3, C.cyan, k);                 // the film's blue family
  const keyed = (u, ks) => { if (u <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (u <= ks[i][0]) { const a = ks[i - 1], b = ks[i]; return lerp(a[1], b[1], (u - a[0]) / (b[0] - a[0])); } return ks[ks.length - 1][1]; };
  const smooth = u => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };

  const std = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0 }, o));
  const phys = (color, o) => new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: 0.35, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.25 }, o));
  const lit = o => new THREE.MeshBasicMaterial(Object.assign({ toneMapped: false }, o));
  function mesh(geo, mat, parent, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx) {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m;
  }
  const flat = m => { m.castShadow = false; m.receiveShadow = false; return m; };
  // canvas textures without anisotropic filtering: it is very slow in the software renderer and nothing here is seen at a grazing angle
  const ctex = (w, h, draw) => { const t = ZN.canvasTex(w, h, draw); t.anisotropy = 1; return t; };
  const SPH = new THREE.SphereGeometry(1, 32, 20), SPH2 = new THREE.SphereGeometry(1, 64, 44), UP = V3(0, 1, 0);

  // ───────────────────────── geometry helpers ─────────────────────────
  // tube swept along a Catmull-Rom curve with a radius that varies along it (hair rolls, moustache, eyebrows)
  function taperTube(pts, rad, tub = 28, rs = 12) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => V3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
    const fr = curve.computeFrenetFrames(tub, false), len = curve.getLength(), pos = [], nor = [], uv = [], idx = [], P = V3(), n = V3();
    for (let i = 0; i <= tub; i++) {
      const u = i / tub, r = Math.max(0.0006, rad(u)), N = fr.normals[i], B = fr.binormals[i], T = fr.tangents[i];
      const slope = (Math.max(0.0006, rad(Math.min(1, u + 0.01))) - Math.max(0.0006, rad(Math.max(0, u - 0.01)))) / (0.02 * len);
      curve.getPointAt(u, P);
      for (let j = 0; j <= rs; j++) {
        const a = j / rs * PI * 2, c = Math.cos(a), s = Math.sin(a);
        pos.push(P.x + (N.x * c + B.x * s) * r, P.y + (N.y * c + B.y * s) * r, P.z + (N.z * c + B.z * s) * r);
        n.set(N.x * c + B.x * s - T.x * slope, N.y * c + B.y * s - T.y * slope, N.z * c + B.z * s - T.z * slope).normalize();
        nor.push(n.x, n.y, n.z); uv.push(u, j / rs);
      }
    }
    for (let i = 0; i < tub; i++) for (let j = 0; j < rs; j++) { const a = i * (rs + 1) + j, b = a + rs + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
  }
  const caps = (u, e0, e1) => Math.sqrt(Math.max(0, 1 - Math.pow(1 - Math.min(1, u / e0), 2))) * (e1 > 0 ? Math.sqrt(Math.max(0, 1 - Math.pow(1 - Math.min(1, (1 - u) / e1), 2))) : 1);   // rounded ends (e1 = 0: open end)
  // bilinear quad patch c = [A,B,C,D] (A→B top edge, D→C bottom edge) in x,y; z from zf(x,y): decals that hug the torso
  function patch(c, nx, ny, zf) {
    const pos = [], uv = [], idx = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const u = i / nx, v = j / ny;
      const x = lerp(lerp(c[0][0], c[1][0], u), lerp(c[3][0], c[2][0], u), v), y = lerp(lerp(c[0][1], c[1][1], u), lerp(c[3][1], c[2][1], u), v);
      pos.push(x, y, zf(x, y)); uv.push(u, 1 - v);
    }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, d = a + nx + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  // unit cylinder between two points
  const _d = V3();
  function place(m, A, B) { _d.subVectors(B, A); const L = _d.length() || 1e-4; m.position.addVectors(A, B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UP, _d.multiplyScalar(1 / L)); m.scale.set(1, L, 1); }

  // ───────────────────────── textures ─────────────────────────
  let _env = null;
  // tiny painted studio "environment" so glossy things (hair, desk, eyes, tie) get real reflections
  function envTex() {
    if (_env) return _env;
    _env = ctex(512, 256, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#060d20'); bg.addColorStop(0.36, C.navy2); bg.addColorStop(0.5, blue(0.55)); bg.addColorStop(0.62, C.navy2); bg.addColorStop(1, '#0a1630');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      const box = (x, y, bw, bh, a) => { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(x, y, bw, bh); g.fillRect(x - w, y, bw, bh); g.fillRect(x + w, y, bw, bh); };
      box(40, 34, 90, 46, 1); box(190, 22, 60, 36, .9); box(300, 40, 110, 40, 1); box(450, 28, 50, 34, .85);     // softboxes
      box(110, 96, 14, 80, .8); box(380, 96, 14, 80, .8); box(250, 8, 120, 10, .7);                              // light columns + a strip
    });
    _env.mapping = THREE.EquirectangularReflectionMapping; _env.needsUpdate = true; return _env;
  }
  const hairTex = vertical => { const t = ctex(256, 256, (g, w, h) => {
    g.fillStyle = '#1b1b20'; g.fillRect(0, 0, w, h); const r = ZN.rng(vertical ? 71 : 29);
    for (let i = 0; i < 90; i++) { const y = r() * h, th = 1 + r() * 4, a = 0.06 + r() * 0.3; g.fillStyle = r() < 0.55 ? `rgba(190,195,210,${a})` : `rgba(0,0,0,${a * 1.6})`; if (vertical) g.fillRect(y, 0, th, h); else g.fillRect(0, y, w, th); }
  }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const tieTex = () => ctex(256, 512, (g, w, h) => {
    g.fillStyle = C.red; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(-0.62);
    for (let i = -12; i <= 12; i++) { g.fillStyle = C.red2; g.fillRect(-w * 2, i * 62, w * 4, 26); g.fillStyle = rgba(C.gold, .95); g.fillRect(-w * 2, i * 62 + 36, w * 4, 5); }
    g.restore();
  });
  const glowTex = () => ctex(128, 128, (g, w, h) => { const rg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); rg.addColorStop(0, 'rgba(255,255,255,.75)'); rg.addColorStop(.35, 'rgba(190,225,255,.28)'); rg.addColorStop(1, 'rgba(160,210,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); });

  // the made-up channel lockup: red rounded tile with a white «ز», Arabic name, Latin name with a gold number
  function drawLogo(g, cx, cy, s, o = {}) {
    const ar = ZN.S('channel_ar', 'قناة الزلف الإخبارية'), en = String(ZN.S('channel_en', 'ZLF NEWS 24'));
    const side = 150 * s, gap = 30 * s, fAr = `800 ${90 * s}px Almarai`, fEn = `800 ${37 * s}px Almarai`;
    g.save(); g.textBaseline = 'alphabetic';
    g.direction = 'rtl'; g.font = fAr; const wAr = g.measureText(ar).width;
    g.direction = 'ltr'; g.font = fEn; try { g.letterSpacing = `${8 * s}px`; } catch (e) {}
    const m = en.match(/^(.*\s)(\d+)$/), pre = m ? m[1] : en, num = m ? m[2] : '';
    const wPre = g.measureText(pre).width, wNum = num ? g.measureText(num).width : 0, wEn = wPre + wNum;
    try { g.letterSpacing = '0px'; } catch (e) {}
    const wText = Math.max(wAr, wEn), total = side + gap + wText, x0 = cx - total / 2, xr = x0 + wText, xm = xr + gap, ym = cy - side / 2;
    // mark
    const rr = side * 0.22, gr = g.createLinearGradient(xm, ym, xm + side, ym + side); gr.addColorStop(0, C.red); gr.addColorStop(1, C.red2);
    g.fillStyle = gr; g.beginPath(); g.moveTo(xm + rr, ym); g.arcTo(xm + side, ym, xm + side, ym + side, rr); g.arcTo(xm + side, ym + side, xm, ym + side, rr); g.arcTo(xm, ym + side, xm, ym, rr); g.arcTo(xm, ym, xm + side, ym, rr); g.closePath(); g.fill();
    g.fillStyle = rgba(C.gold, 1); g.fillRect(xm + side * 0.16, ym + side * 0.84, side * 0.68, side * 0.05);
    g.direction = 'rtl'; g.font = `800 ${side * 0.8}px Almarai`; g.textAlign = 'left'; g.fillStyle = '#fff';
    const z = g.measureText('ز'), zx = xm + side / 2 - (z.actualBoundingBoxRight - z.actualBoundingBoxLeft) / 2, zy = ym + side * 0.45 + (z.actualBoundingBoxAscent - z.actualBoundingBoxDescent) / 2;
    g.fillText('ز', zx, zy);
    // names
    g.font = fAr; g.textAlign = 'right'; g.fillStyle = o.ink || '#fff'; g.fillText(ar, xr, cy + 4 * s);
    g.direction = 'ltr'; g.font = fEn; try { g.letterSpacing = `${8 * s}px`; } catch (e) {}
    g.fillStyle = rgba(C.gold, 1); g.fillText(num, xr, cy + 62 * s);
    g.fillStyle = o.ink || '#fff'; g.fillText(pre, xr - wNum, cy + 62 * s);
    try { g.letterSpacing = '0px'; } catch (e) {}
    g.restore(); return { x0, x1: xm + side };
  }
  ZN.drawChannelLogo = drawLogo;

  // rough continents (lon,lat) for the dot-matrix map
  const LAND = [
    [[-168, 66], [-140, 70], [-95, 72], [-62, 60], [-55, 48], [-78, 26], [-97, 17], [-106, 22], [-125, 40], [-150, 58]],
    [[-106, 22], [-97, 17], [-83, 8], [-77, 8], [-88, 19]],
    [[-80, 10], [-60, 11], [-35, -6], [-40, -22], [-58, -38], [-70, -54], [-75, -45], [-70, -18], [-81, -5]],
    [[-55, 60], [-20, 70], [-25, 82], [-60, 80]],
    [[-10, 36], [-9, 44], [-2, 48], [5, 52], [8, 58], [20, 70], [40, 68], [45, 50], [40, 42], [28, 36], [15, 38], [5, 43]],
    [[-17, 15], [-10, 30], [10, 37], [32, 31], [43, 11], [51, 11], [40, -15], [35, -25], [20, -35], [12, -17], [8, 4], [-10, 5]],
    [[40, 42], [45, 50], [40, 68], [70, 75], [110, 76], [170, 68], [180, 64], [160, 58], [142, 48], [128, 36], [122, 24], [108, 12], [100, 5], [98, 15], [90, 22], [80, 8], [72, 20], [60, 25], [52, 16], [43, 13], [36, 30], [36, 36]],
    [[114, -22], [130, -12], [145, -15], [153, -28], [145, -38], [130, -33], [116, -34]],
  ];
  const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
  const isLand = (lon, lat) => LAND.some(p => inPoly(lon, lat, p));

  // ═════════════════════════════ STUDIO ═════════════════════════════
  const H_SHOTS = {
    medium: { p: [-0.62, 1.46, 3.55], t: [-0.62, 1.40, 0], fov: 28 },
    mediumC: { p: [0, 1.50, 3.25], t: [0, 1.46, 0], fov: 26 },
    close: { p: [0, 1.63, 2.55], t: [0, 1.61, 0], fov: 20 },
    tight: { p: [0, 1.60, 1.95], t: [0, 1.56, 0], fov: 20 },
    wide: { p: [0, 1.95, 8.6], t: [0, 1.40, -0.5], fov: 32 },
  };
  const V_SHOTS = {
    medium: { p: [0, 1.78, 5.7], t: [0, 1.82, 0], fov: 30 },
    mediumC: { p: [0, 1.78, 5.7], t: [0, 1.82, 0], fov: 30 },
    close: { p: [0, 1.88, 3.5], t: [0, 1.52, 0], fov: 22 },
    tight: { p: [0, 1.82, 2.9], t: [0, 1.58, 0], fov: 22 },
    wide: { p: [0, 2.0, 9.8], t: [0, 1.9, 0], fov: 34 },
  };
  ZN.anchorShots = ZN.VERT ? V_SHOTS : H_SHOTS;
  ZN.anchorExposure = ZN.VERT ? 1.2 : 1.0;                  // recommended 3rd argument of ZN.render3d for these framings (keeps mean luma in range)
  // set a camera to shot a, or blend a→b by k (ease k yourself); optional dolly offset d = [dx,dy,dz] added to the position
  const _t = V3();
  ZN.anchorCam = (cam, a, b, k = 0, d) => {
    b = b || a;
    cam.position.set(lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k), lerp(a.p[2], b.p[2], k)); if (d) cam.position.x += d[0], cam.position.y += d[1], cam.position.z += d[2];
    _t.set(lerp(a.t[0], b.t[0], k), lerp(a.t[1], b.t[1], k), lerp(a.t[2], b.t[2], k));
    cam.fov = lerp(a.fov, b.fov, k); cam.updateProjectionMatrix(); cam.lookAt(_t); return cam;
  };
  // deterministic blink track 0..1 (a blink every ~3.4 s, a double blink now and then)
  ZN.anchorBlink = t => { const P = 3.4, k = Math.floor(t / P), u = t - k * P, b = x => (x > 0 && x < 0.16 ? Math.sin(x / 0.16 * PI) : 0); return Math.max(b(u - 1.3), k % 3 === 1 ? b(u - 1.62) : 0); };

  ZN.makeStudio = function (opts = {}) {
    const layout = opts.layout || (ZN.VERT ? 'top' : 'side');
    const deskY = 0.80, deskZ = 0.50, env = envTex();
    const group = new THREE.Group();

    // ── lights: key from the camera-left front, soft fill from the right, cool rim from behind ──
    const hemi = new THREE.HemisphereLight(0xe8f0ff, 0x24386a, 1.25); group.add(hemi);
    const key = new THREE.DirectionalLight(0xfff3e4, 2.75); key.position.set(-2.3, 3.5, 4.2); key.target.position.set(0, 1.1, 0.1); group.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.022;       // one 1024 map, tight on anchor + desk (software renderer)
    const sc = key.shadow.camera; sc.left = -1.8; sc.right = 1.8; sc.top = 1.6; sc.bottom = -1.6; sc.near = 2.5; sc.far = 9; sc.updateProjectionMatrix();
    const fill = new THREE.DirectionalLight(0xcfe3ff, 0.95); fill.position.set(3.2, 1.9, 3.6); fill.target.position.set(0, 1.3, 0); group.add(fill, fill.target);
    const rim = new THREE.DirectionalLight(0xa9d4ff, 1.3); rim.position.set(1.6, 3.2, -3.0); rim.target.position.set(0, 1.5, 0); group.add(rim, rim.target);

    // ── floor: glossy, with painted reflections of the wall and the light columns ──
    const floorTex = ctex(1024, 1024, (g, w, h) => {
      g.fillStyle = C.navy; g.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, m = w / 16;                       // 16 m square, m px per metre; image top = far (the wall)
      let rg = g.createRadialGradient(cx, cy - 0.4 * m, 0, cx, cy - 0.4 * m, 6.5 * m); rg.addColorStop(0, blue(0.6)); rg.addColorStop(0.45, blue(0.12)); rg.addColorStop(1, C.navy2);
      g.fillStyle = rg; g.fillRect(0, 0, w, h);
      g.save(); g.translate(cx, cy - 1.6 * m); g.scale(1, 2.3);         // long soft reflection of the video wall toward the camera
      rg = g.createRadialGradient(0, 0, 0, 0, 0, 2.6 * m); rg.addColorStop(0, 'rgba(210,235,255,.55)'); rg.addColorStop(1, 'rgba(210,235,255,0)'); g.fillStyle = rg; g.fillRect(-4 * m, -4 * m, 8 * m, 8 * m); g.restore();
      for (const x of [-3.3, -1.62, 1.62, 3.3]) { const lg = g.createLinearGradient(0, cy - 2.2 * m, 0, cy + 3.5 * m); lg.addColorStop(0, 'rgba(255,255,255,.5)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(cx + x * m - 5, cy - 2.2 * m, 10, 5.7 * m); }
      g.lineWidth = 2; for (let r = 1; r <= 7; r++) { g.strokeStyle = `rgba(255,255,255,${r === 2 ? 0 : 0.07})`; g.beginPath(); g.arc(cx, cy + 0.2 * m, r * 1.05 * m, 0, PI * 2); g.stroke(); }
    });
    const floor = mesh(new THREE.PlaneGeometry(16, 16), std('#ffffff', { map: floorTex, roughness: 0.32 }), group, 0, 0, 0);
    floor.rotation.x = -PI / 2; floor.castShadow = false; floor.renderOrder = 8;          // big surfaces last: the depth test then skips what the set hides
    const ring = flat(mesh(new THREE.RingGeometry(2.18, 2.25, 64), lit({ color: '#dff2ff', side: THREE.DoubleSide }), group, 0, 0.004, -0.2)); ring.rotation.x = -PI / 2;
    // dark cyclorama so nothing ever shows a void
    const cycTex = ctex(32, 256, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#0a1838'); l.addColorStop(0.35, C.navy2); l.addColorStop(0.6, mix(C.navy2, C.navy3, 0.75)); l.addColorStop(0.8, C.navy3); l.addColorStop(1, C.navy2); g.fillStyle = l; g.fillRect(0, 0, w, h); });
    flat(mesh(new THREE.CylinderGeometry(9.5, 9.5, 9, 32, 1, true), lit({ map: cycTex, side: THREE.BackSide }), group, 0, 4.4, 0)).renderOrder = 9;

    // ── video wall ──
    const WW = 6.6, WH = 2.5, WY = 1.5, WZ = -2.4;
    const wallTex = ctex(2048, 776, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, blue(0.42)); bg.addColorStop(0.5, blue(0.62)); bg.addColorStop(1, blue(0.34)); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      const rg = g.createRadialGradient(w / 2, h * 0.52, 0, w / 2, h * 0.52, w * 0.4); rg.addColorStop(0, 'rgba(255,255,255,.42)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
      g.save(); g.globalAlpha = 0.10; g.fillStyle = '#fff'; g.transform(1, 0, -0.5, 1, 0, 0); for (let i = 0; i < 9; i++) g.fillRect(180 + i * 290, 0, 70 + (i % 3) * 40, h); g.restore();
      const cols = 132, rows = 46, x0 = w * 0.04, x1 = w * 0.96, y0 = h * 0.07, y1 = h * 0.93;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const lon = lerp(-172, 188, i / (cols - 1)), lat = lerp(80, -58, j / (rows - 1)), x = lerp(x0, x1, i / (cols - 1)), y = lerp(y0, y1, j / (rows - 1)), land = isLand(lon > 180 ? lon - 360 : lon, lat);
        g.fillStyle = land ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.13)'; g.beginPath(); g.arc(x, y, land ? 3.3 : 1.6, 0, PI * 2); g.fill();
      }
      const bx = lerp(x0, x1, (50.5 + 172) / 360), by = lerp(y0, y1, (80 - 26) / 138);       // the story is local: a red ping on Bahrain
      g.strokeStyle = rgba(C.red, .55); g.lineWidth = 3; g.beginPath(); g.arc(bx, by, 15, 0, PI * 2); g.stroke();
      g.fillStyle = C.red; g.beginPath(); g.arc(bx, by, 6, 0, PI * 2); g.fill();
      g.strokeStyle = 'rgba(8,22,60,.34)'; g.lineWidth = 3; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(w * i / 6, 0); g.lineTo(w * i / 6, h); g.stroke(); } g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    });
    flat(mesh(new THREE.PlaneGeometry(WW, WH), lit({ map: wallTex }), group, 0, WY, WZ));
    const wingTex = ctex(1024, 984, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, blue(0.2)); bg.addColorStop(1, blue(0.42)); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      const r = ZN.rng(404), n = 22, bw = w / n;
      for (let i = 0; i < n; i++) { const bh = h * (0.18 + 0.62 * r()); g.fillStyle = `rgba(255,255,255,${0.10 + 0.14 * r()})`; g.fillRect(i * bw + 6, h - bh, bw - 12, bh); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(i * bw + 6, h - bh, bw - 12, 8); }
      g.strokeStyle = 'rgba(8,22,60,.34)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    });
    const mFrame = std(mix(C.navy, C.navy2, 0.35), { roughness: 0.45 });
    for (const s of [-1, 1]) {
      const wing = new THREE.Group(); wing.position.set(s * WW / 2, WY, WZ); wing.rotation.y = -s * 0.62; group.add(wing);
      flat(mesh(new THREE.PlaneGeometry(2.6, WH), lit({ map: wingTex }), wing, s * 1.3, 0, 0));
      mesh(new THREE.BoxGeometry(2.7, 0.34, 0.12), mFrame, wing, s * 1.3, WH / 2 + 0.19, -0.02);
      mesh(new THREE.BoxGeometry(2.7, 0.26, 0.2), mFrame, wing, s * 1.3, -WH / 2 - 0.12, 0.0);
    }
    mesh(new THREE.BoxGeometry(WW + 0.1, 0.26, 0.2), mFrame, group, 0, WY - WH / 2 - 0.12, WZ);
    const fasTex = ctex(2048, 106, (g, w, h) => {
      g.fillStyle = C.navy; g.fillRect(0, 0, w, h); g.fillStyle = C.red; g.fillRect(0, h - 10, w, 10);
      drawLogo(g, w / 2, h * 0.42, 0.5);
      g.fillStyle = rgba(C.cyan, .5); for (let i = 0; i < 14; i++) { g.fillRect(40 + i * 44, 36, 24, 24); g.fillRect(w - 64 - i * 44, 36, 24, 24); }
    });
    flat(mesh(new THREE.PlaneGeometry(WW, 0.34), lit({ map: fasTex }), group, 0, WY + WH / 2 + 0.19, WZ + 0.05));
    mesh(new THREE.BoxGeometry(WW + 0.1, 0.36, 0.12), mFrame, group, 0, WY + WH / 2 + 0.19, WZ - 0.02);

    // ── light columns (glowing core + soft halo) ──
    const gTex = glowTex(), mCore = lit({ color: '#f2f9ff' }), mHalo = new THREE.MeshBasicMaterial({ map: gTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.8 });
    for (const [x, z] of [[-3.32, WZ + 0.12], [-1.62, WZ + 0.14], [1.62, WZ + 0.14], [3.32, WZ + 0.12]]) {
      mesh(new THREE.BoxGeometry(0.22, WH + 0.5, 0.1), mFrame, group, x, WY, z - 0.04);
      flat(mesh(new THREE.BoxGeometry(0.085, WH + 0.3, 0.05), mCore, group, x, WY, z + 0.03));
      flat(mesh(new THREE.PlaneGeometry(1.0, WH + 1.0), mHalo, group, x, WY, z + 0.07));
    }
    // ── ceiling truss with lamps (only the wide shot sees it) ──
    const mDark = std('#0c1222', { roughness: 0.5 });
    mesh(new THREE.BoxGeometry(8.4, 0.07, 0.07), mDark, group, 0, 3.95, -0.7); mesh(new THREE.BoxGeometry(8.4, 0.07, 0.07), mDark, group, 0, 3.95, -1.05);
    for (let i = 0; i < 7; i++) {
      const x = -3.3 + i * 1.1, can = new THREE.Group(); can.position.set(x, 3.72, -0.86); can.rotation.x = 0.55; group.add(can);
      mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.26, 16), mDark, can, 0, 0, 0);
      const lens = flat(mesh(new THREE.CircleGeometry(0.125, 20), lit({ color: i % 3 === 1 ? '#fff0c8' : '#eaf5ff' }), can, 0, -0.132, 0)); lens.rotation.x = PI / 2;
      mesh(new THREE.BoxGeometry(0.03, 0.2, 0.03), mDark, group, x, 3.86, -0.86);
    }

    // ── hero screen (16:9, swappable) ──
    const SW = layout === 'top' ? 1.92 : 1.84, SH = SW * 9 / 16;
    const identTex = ctex(1024, 576, (g, w, h) => {
      const rg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.62); rg.addColorStop(0, C.navy3); rg.addColorStop(1, C.navy); g.fillStyle = rg; g.fillRect(0, 0, w, h);
      g.strokeStyle = rgba(C.cyan, .22); g.lineWidth = 3; for (let r = 1; r < 9; r++) { g.beginPath(); g.arc(w * 0.5, h * 0.5, r * 78, 0, PI * 2); g.stroke(); }
      g.fillStyle = C.red; g.fillRect(0, h - 64, w, 64); g.fillStyle = rgba(C.gold, 1); g.fillRect(0, h - 70, w, 6);
      drawLogo(g, w / 2, h * 0.44, 1.02);
    });
    const scr = new THREE.Group();
    if (layout === 'top') { scr.position.set(0, 2.81, -1.75); scr.rotation.x = 0.1; } else { scr.position.set(-1.62, 1.62, -1.3); scr.rotation.y = 0.36; }
    group.add(scr);
    mesh(new THREE.BoxGeometry(SW + 0.12, SH + 0.12, 0.08), mDark, scr, 0, 0, -0.045);
    flat(mesh(new THREE.BoxGeometry(SW + 0.12, 0.022, 0.085), lit({ color: C.red }), scr, 0, -SH / 2 - 0.071, -0.044));
    const screenMat = lit({ map: identTex }), screen = flat(mesh(new THREE.PlaneGeometry(SW, SH), screenMat, scr, 0, 0, 0));
    if (layout === 'top') { for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.03, 1.2, 0.03), mDark, scr, s * 0.7, SH / 2 + 0.62, -0.05); }
    else { mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12), mDark, scr, 0, -SH / 2 - 0.56, -0.07); mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.05, 24), mDark, scr, 0, -1.6, -0.07); }
    if (layout !== 'top') {                                               // a tall brand totem balances the screen on the other side
      const totTex = ctex(432, 960, (g, w, h) => {
        const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, C.navy2); bg.addColorStop(1, C.navy); g.fillStyle = bg; g.fillRect(0, 0, w, h);
        g.fillStyle = C.red; g.fillRect(0, 0, w, 300); g.fillStyle = rgba(C.gold, 1); g.fillRect(0, 300, w, 8);
        g.direction = 'rtl'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '800 250px Almarai'; g.fillText('ز', w / 2, 232);
        g.direction = 'ltr'; g.font = '800 250px Almarai'; g.fillStyle = rgba(C.gold, 1); g.fillText('24', w / 2, 590);
        g.fillStyle = '#fff'; g.font = '800 62px Almarai'; try { g.letterSpacing = '10px'; } catch (e) {} g.fillText(String(ZN.S('channel_en', 'ZLF NEWS 24')).replace(/\s*\d+$/, ''), w / 2 + 5, 700); try { g.letterSpacing = '0px'; } catch (e) {}
        g.fillStyle = rgba(C.cyan, .5); for (let i = 0; i < 7; i++) g.fillRect(48 + i * 50, 800, 30, 30 + (i * 37 % 90));
      });
      const tot = new THREE.Group(); tot.position.set(2.42, 1.3, -1.25); tot.rotation.y = -0.42; group.add(tot);
      mesh(new THREE.BoxGeometry(1.02, 2.3, 0.1), mDark, tot, 0, 0, -0.055); flat(mesh(new THREE.PlaneGeometry(0.94, 2.09), lit({ map: totTex }), tot, 0, 0.04, 0));
      mesh(new THREE.BoxGeometry(1.2, 0.1, 0.5), mDark, tot, 0, -1.25, -0.05);
    }

    // ── desk: curved around the anchor, glossy top, lit front panel with the lockup ──
    const DC = -0.75, Ri = 1.10, Ro = 1.74, SP = 0.80;                       // arc centre z, inner/outer radius, half-span (rad)
    const sh = new THREE.Shape(); sh.absarc(0, 0, Ro, -PI / 2 - SP, -PI / 2 + SP, false); sh.absarc(0, 0, Ri, -PI / 2 + SP, -PI / 2 - SP, true); sh.closePath();
    const topG = new THREE.ExtrudeGeometry(sh, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 40 }); topG.rotateX(-PI / 2);
    const deskTop = mesh(topG, std(mix(C.navy, C.navy2, 0.4), { roughness: 0.1, envMap: env, envMapIntensity: 1.5 }), group, 0, deskY - 0.053, DC);
    const panelTex = ctex(2048, 600, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, mix(C.navy2, C.navy3, 0.55)); bg.addColorStop(1, C.navy); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.save(); g.globalAlpha = 0.16; g.fillStyle = C.cyan; for (let i = 0; i < 7; i++) { const k = 40 + i * 44; g.beginPath(); g.moveTo(k, 90); g.lineTo(k + 22, 90); g.lineTo(k + 110, h / 2); g.lineTo(k + 22, h - 60); g.lineTo(k, h - 60); g.lineTo(k + 88, h / 2); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(w - k, 90); g.lineTo(w - k - 22, 90); g.lineTo(w - k - 110, h / 2); g.lineTo(w - k - 22, h - 60); g.lineTo(w - k, h - 60); g.lineTo(w - k - 88, h / 2); g.closePath(); g.fill(); } g.restore();
      g.fillStyle = '#eef8ff'; g.fillRect(0, 0, w, 30); g.fillStyle = C.red; g.fillRect(0, 30, w, 14); g.fillStyle = '#eef8ff'; g.fillRect(0, h - 26, w, 26);
      drawLogo(g, w / 2, h * 0.5, 1.7);
    });
    const pr = 1.66, ph = 0.72;
    flat(mesh(new THREE.CylinderGeometry(pr, pr - 0.1, ph, 48, 1, true, -SP + 0.02, 2 * SP - 0.04), lit({ map: panelTex, side: THREE.DoubleSide }), group, 0, ph / 2 + 0.025, DC));
    mesh(new THREE.CylinderGeometry(pr - 0.02, pr - 0.12, ph, 40, 1, true, -SP, 2 * SP), std(C.navy, { side: THREE.DoubleSide }), group, 0, ph / 2 + 0.025, DC);
    mesh(new THREE.CylinderGeometry(Ri + 0.04, Ri + 0.04, ph, 40, 1, true, -SP, 2 * SP), std(mix(C.navy, C.navy2, 0.3), { side: THREE.DoubleSide }), group, 0, ph / 2 + 0.025, DC);
    flat(mesh(new THREE.CylinderGeometry(Ro + 0.012, Ro + 0.012, 0.016, 48, 1, true, -SP, 2 * SP), lit({ color: '#eaf6ff' }), group, 0, deskY - 0.03, DC));   // LED edge

    group.traverse(o => { if (o.isMesh && (o.material === mFrame || o.material === mDark)) o.receiveShadow = false; });       // keep the shadow lookup for what shows it
    const focus = V3(0, 1.57, 0.1);
    return {
      group, screenGroup: scr, lights: { hemi, key, fill, rim }, focus, screen, screenSize: [SW, SH], deskY, deskZ, shots: ZN.anchorShots, deskTop,
      get screenCenter() { return screen.getWorldPosition(V3()); },
      setScreen(tex) { screenMat.map = tex || identTex; screenMat.needsUpdate = true; },
    };
  };

  // ═════════════════════════════ ANCHOR ═════════════════════════════
  ZN.makeAnchor = function (opts = {}) {
    const deskY = opts.deskY != null ? opts.deskY : 0.80, deskZ = opts.deskZ != null ? opts.deskZ : 0.50, env = envTex();
    const HIP = 0.52, NECK_Y = 0.665, NECK_L = 0.085, L1 = 0.31, L2 = 0.33;
    const root = new THREE.Group();

    const mSkin = std('#E8A97F', { roughness: 0.5 }), mSkin2 = std('#DD9670', { roughness: 0.46 }), mLid = std('#E2A07A', { roughness: 0.5 });
    const mHair = std('#ffffff', { map: hairTex(false), roughness: 0.24, envMap: env, envMapIntensity: 0.6 });
    const mHairCap = std('#ffffff', { map: hairTex(true), roughness: 0.36 });
    const mBrow = std('#15161d', { roughness: 0.45 });
    const mSuit = std(mix(C.navy, C.navy2, 0.3), { roughness: 0.72 }), mLapel = std(mix(C.navy, C.navy3, 0.42), { roughness: 0.5, side: THREE.DoubleSide });
    const mShirt = std('#F5F7FB', { roughness: 0.6, side: THREE.DoubleSide });
    const mTie = phys('#ffffff', { map: tieTex(), roughness: 0.3, clearcoat: 0.7, side: THREE.DoubleSide });
    const mGold = std(C.gold, { roughness: 0.4, metalness: 0.25, side: THREE.DoubleSide });
    const mEye = std('#ffffff', { roughness: 0.1, envMap: env, envMapIntensity: 0.5 });
    const mIris = std('#3a2414', { roughness: 0.3 }), mPupil = new THREE.MeshBasicMaterial({ color: '#07080c' }), mSpark = lit({ color: '#ffffff' });
    const mMouth = new THREE.MeshBasicMaterial({ color: '#3a0a10' }), mTooth = std('#fbfbf6', { roughness: 0.3 }), mTongue = std('#c8505a', { roughness: 0.5 });
    const mChair = std('#0f1524', { roughness: 0.45 }), mShoe = std('#0b0d14', { roughness: 0.3 }), mPaper = std('#fbfbf7', { roughness: 0.75 });

    // ── chair + legs (hidden by the desk from the front, there for side/wide angles) ──
    if (opts.chair !== false) {
      mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.04, 20), mChair, root, 0, 0.03, 0); mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10), mChair, root, 0, 0.25, 0);
      mesh(new THREE.CylinderGeometry(0.27, 0.25, 0.08, 24), mChair, root, 0, 0.47, 0.02); mesh(SPH, mChair, root, 0, 0.84, -0.23, 0.27, 0.34, 0.06);
    }
    for (const s of [-1, 1]) {
      const th = mesh(new THREE.CylinderGeometry(0.085, 0.095, 1, 12), mSuit, root), shn = mesh(new THREE.CylinderGeometry(0.07, 0.085, 1, 12), mSuit, root);
      place(th, V3(s * 0.12, 0.56, 0.02), V3(s * 0.14, 0.56, 0.44)); place(shn, V3(s * 0.14, 0.56, 0.44), V3(s * 0.14, 0.09, 0.40));
      mesh(SPH, mSuit, root, s * 0.14, 0.56, 0.44, 0.088); mesh(SPH, mShoe, root, s * 0.14, 0.05, 0.47, 0.075, 0.05, 0.14);
    }

    // ── torso ──
    const torso = new THREE.Group(); torso.position.set(0, HIP, 0); root.add(torso);
    const chest = new THREE.Group(); torso.add(chest);
    const prof = [[0.001, -0.03], [0.25, -0.029], [0.268, 0.10], [0.288, 0.30], [0.316, 0.47], [0.322, 0.565], [0.262, 0.638], [0.14, 0.685], [0.001, 0.695]];
    const TZ = 0.62;
    mesh(new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 36), mSuit, chest).scale.z = TZ;
    const rAt = y => { if (y <= prof[0][1]) return prof[0][0]; for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) { const a = prof[i - 1], b = prof[i]; return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1])); } return 0.001; };
    const tz = (x, y) => TZ * Math.sqrt(Math.max(0.0001, Math.pow(rAt(y), 2) - x * x));
    const decal = (c, nx, ny, mat, lift, zf) => { const m = mesh(patch(c, nx, ny, zf || ((x, y) => tz(x, y) + lift)), mat, chest); m.castShadow = false; return m; };
    decal([[-0.10, 0.676], [0.10, 0.676], [0, 0.22], [0, 0.22]], 8, 12, mShirt, 0.004);                                             // shirt V
    for (const s of [-1, 1]) {
      decal([[0.10 * s, 0.69], [0.212 * s, 0.552], [0.014 * s, 0.19], [0.066 * s, 0.60]], 8, 12, mLapel, 0.010);                    // lapel
      decal([[0.012 * s, 0.722], [0.108 * s, 0.728], [0.118 * s, 0.598], [0.034 * s, 0.648]], 6, 6, mShirt, 0, (x, y) => Math.max(tz(x, y) + 0.016, Math.sqrt(Math.max(0, 0.0142 - x * x))));   // collar wing
    }
    decal([[0.165, 0.468], [0.25, 0.462], [0.246, 0.428], [0.168, 0.432]], 4, 2, mGold, 0.013);                                      // pocket square
    decal([[0.185, 0.50], [0.2, 0.465], [0.2, 0.465], [0.17, 0.466]], 2, 2, mGold, 0.013); decal([[0.225, 0.495], [0.245, 0.463], [0.245, 0.463], [0.205, 0.465]], 2, 2, mGold, 0.013);
    mesh(SPH, mGold, chest, -0.165, 0.52, tz(-0.165, 0.52) + 0.012, 0.014);                                                        // lapel pin
    mesh(new THREE.CylinderGeometry(0.098, 0.114, 0.075, 24, 1, true), mShirt, chest, 0, 0.70, 0).castShadow = false;               // collar band
    const pads = [-1, 1].map(s => mesh(SPH, mSuit, chest, s * 0.305, 0.582, 0, 0.115, 0.082, 0.118));

    // ── tie (pivot at the knot) ──
    const tieG = new THREE.Group(); tieG.position.set(0, 0.655, 0.116); chest.add(tieG);
    const knot = mesh(SPH, mTie, tieG, 0, 0, 0.022, 0.07, 0.058, 0.05);
    const tieW = [[0.625, 0.036], [0.56, 0.058], [0.47, 0.094], [0.38, 0.124], [0.30, 0.138], [0.23, 0.128], [0.17, 0.092], [0.12, 0.0]];   // torso-y → half width
    (function () {
      const nx = 10, ny = 26, pos = [], uv = [], idx = [];
      for (let k = 0; k <= ny; k++) {
        const ty = lerp(0.628, 0.12, k / ny), w = keyed(-ty, tieW.map(a => [-a[0], a[1]])), zc = Math.max(0.03, tz(0, ty) + 0.02 - 0.116);
        for (let i = 0; i <= nx; i++) { const s = i / nx * 2 - 1; pos.push(s * w, ty - 0.655, zc + 0.03 * (1 - s * s) * Math.min(1, w / 0.07)); uv.push(0.5 + s * w / 0.28, k / ny); }
      }
      for (let k = 0; k < ny; k++) for (let i = 0; i < nx; i++) { const a = k * (nx + 1) + i, b = a + 1, d = a + nx + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      mesh(g, mTie, tieG);
    })();

    // ── neck + head ──
    const neck = new THREE.Group(); neck.position.set(0, NECK_Y, 0); neck.rotation.order = 'YXZ'; torso.add(neck);
    mesh(new THREE.CylinderGeometry(0.084, 0.098, 0.16, 20), mSkin2, neck, 0, 0.045, 0);
    const head = new THREE.Group(); head.position.set(0, NECK_L, 0); head.rotation.order = 'YXZ'; neck.add(head);
    mesh(SPH2, mSkin, head, 0, 0.30, 0, 0.25, 0.262, 0.243);                                    // cranium
    const jaw = mesh(SPH, mSkin, head, 0, 0.16, 0.028, 0.238, 0.16, 0.19);                     // heavy jowls
    for (const s of [-1, 1]) { mesh(SPH, mSkin2, head, s * 0.252, 0.285, -0.01, 0.026, 0.058, 0.042); }   // ears
    mesh(SPH, mSkin2, head, 0, 0.262, 0.246, 0.05, 0.045, 0.05);                               // nose
    // mouth (opens under the moustache)
    const mouth = new THREE.Group(); mouth.position.set(0, 0.15, 0.2); head.add(mouth);
    const cavity = flat(mesh(SPH, mMouth, mouth, 0, 0, 0, 0.078, 0.01, 0.024));
    const teeth = flat(mesh(new THREE.BoxGeometry(0.1, 0.02, 0.012), mTooth, mouth, 0, 0, 0.012));
    const tongue = flat(mesh(SPH, mTongue, mouth, 0, 0, 0.004, 0.045, 0.014, 0.02));
    // eyes
    const ER = 0.066, eyes = [];
    const lidU = new THREE.SphereGeometry(ER * 1.085, 24, 10, 0, PI * 2, 0, PI / 2), lidL = new THREE.SphereGeometry(ER * 1.06, 24, 10, 0, PI * 2, PI / 2, PI / 2);
    const irisG = new THREE.SphereGeometry(ER * 1.012, 24, 6, 0, PI * 2, 0, 0.43); irisG.rotateX(PI / 2);
    const pupG = new THREE.SphereGeometry(ER * 1.022, 20, 5, 0, PI * 2, 0, 0.235); pupG.rotateX(PI / 2);
    for (const s of [-1, 1]) {
      const e = new THREE.Group(); e.position.set(s * 0.094, 0.325, 0.18); head.add(e);
      mesh(SPH, mEye, e, 0, 0, 0, ER).castShadow = false;
      const gaze = new THREE.Group(); e.add(gaze);
      flat(mesh(irisG, mIris, gaze)); flat(mesh(pupG, mPupil, gaze)); flat(mesh(SPH, mSpark, gaze, -0.013, 0.014, ER * 0.975, 0.0062));
      const up = mesh(lidU, mLid, e), lo = mesh(lidL, mLid, e); up.castShadow = lo.castShadow = false;
      eyes.push({ s, gaze, up, lo });
    }
    // eyebrows: thick tapered bars, each on its own pivot
    const brows = [-1, 1].map(s => {
      const b = new THREE.Group(); b.position.set(s * 0.098, 0.418, 0.222); head.add(b);
      const g = taperTube([[-0.07 * s, -0.008, 0.0], [-0.022 * s, 0.01, 0.012], [0.03 * s, 0.012, 0.006], [0.082 * s, -0.012, -0.03]], u => keyed(u, [[0, 0.021], [0.35, 0.025], [0.7, 0.019], [1, 0.009]]) * caps(u, 0.16, 0.1), 16, 10);
      mesh(g, mBrow, b).scale.z = 0.8; return { s, b };
    });
    // moustache: two handlebar halves that reach past the cheeks
    const mo = new THREE.Group(); mo.position.set(0, 0.2, 0.23); head.add(mo);
    const moH = [-1, 1].map(s => {
      const h = new THREE.Group(); mo.add(h);
      const g = taperTube([[-0.022 * s, 0.008, 0.012], [0.06 * s, -0.004, 0.008], [0.145 * s, -0.03, -0.034], [0.225 * s, -0.04, -0.1], [0.288 * s, -0.014, -0.15], [0.322 * s, 0.038, -0.166], [0.308 * s, 0.088, -0.162], [0.27 * s, 0.084, -0.152]],
        u => keyed(u, [[0, 0.03], [0.16, 0.045], [0.38, 0.041], [0.58, 0.03], [0.76, 0.02], [0.9, 0.0145], [1, 0.013]]) * caps(u, 0.07, 0), 40, 12);
      mesh(g, mBrow, h); mesh(SPH, mBrow, h, 0.27 * s, 0.084, -0.152, 0.0131); return { s, h };
    });
    // hair: cap + sideburns (the «زلف») + a tall side-parted pompadour of combed locks on its own pivot at the crown
    mesh(SPH2, mHairCap, head, 0, 0.332, -0.05, 0.264, 0.272, 0.272);
    for (const s of [-1, 1]) mesh(taperTube([[s * 0.24, 0.4, 0.05], [s * 0.239, 0.325, 0.082], [s * 0.229, 0.258, 0.106]], u => keyed(u, [[0, 0.04], [0.6, 0.032], [1, 0.013]]) * caps(u, 0.2, 0.14), 12, 10), mBrow, head);
    const quiff = new THREE.Group(); quiff.position.set(0, 0.5, 0); head.add(quiff);
    mesh(SPH, mHairCap, quiff, -0.015, 0.06, -0.04, 0.24, 0.17, 0.235);
    const LK = [[0.165, 0.8], [0.09, 1.0], [0.01, 1.06], [-0.07, 0.98], [-0.145, 0.82], [-0.21, 0.56]];     // root x, height factor (parting on his left)
    LK.forEach(([x, hh], i) => {
      const g = taperTube([[x + 0.024, -0.05, 0.178], [x + 0.006, 0.0 + 0.075 * hh, 0.245], [x - 0.03, 0.06 + 0.15 * hh, 0.2], [x - 0.062, 0.075 + 0.14 * hh, 0.05], [x - 0.08, 0.03 + 0.09 * hh, -0.12], [x - 0.09, -0.07, -0.21]],
        u => keyed(u, [[0, 0.04], [0.14, 0.072], [0.34, 0.088], [0.58, 0.08], [0.82, 0.06], [1, 0.03]]) * (0.82 + 0.18 * hh) * caps(u, 0.08, 0.1), 30, 14);
      mesh(g, mHair, quiff);
    });
    mesh(taperTube([[0.205, -0.03, 0.1], [0.248, -0.1, 0.07], [0.258, -0.19, 0.04]], u => keyed(u, [[0, 0.045], [0.5, 0.048], [1, 0.02]]) * caps(u, 0.2, 0.2), 10, 10), mHair, quiff);   // short side of the parting

    // ── arms (solved every pose: shoulder → elbow → wrist) ──
    const arms = [-1, 1].map((s, i) => {
      const up = mesh(new THREE.CylinderGeometry(0.066, 0.076, 1, 14, 1, true), mSuit, root), fo = mesh(new THREE.CylinderGeometry(0.054, 0.066, 1, 14, 1, true), mSuit, root);
      const el = mesh(SPH, mSuit, root, 0, 0, 0, 0.068), cuff = mesh(new THREE.CylinderGeometry(0.059, 0.059, 1, 14), mShirt, root);
      const hand = new THREE.Group(); root.add(hand);
      mesh(SPH, mSkin, hand, 0, 0, 0.02, 0.058, 0.042, 0.078); mesh(SPH, mSkin, hand, -s * 0.05, 0.012, 0.0, 0.024, 0.022, 0.04);
      return { s, up, fo, el, cuff, hand, pad: pads[i] };
    });
    // papers
    let papers = null;
    if (opts.papers !== false) {
      papers = new THREE.Group(); root.add(papers);
      const pg = new THREE.BoxGeometry(0.21, 0.297, 0.004); pg.translate(0, 0.1485, 0);
      for (let i = 0; i < 3; i++) { const pm = mesh(pg, mPaper, papers, 0, 0, (i - 1) * 0.0045); pm.rotation.z = (i - 1) * 0.035; }
      const lines = ctex(128, 180, (g, w, h) => { g.fillStyle = '#fbfbf7'; g.fillRect(0, 0, w, h); g.fillStyle = C.red; g.fillRect(14, 14, w - 28, 12); g.fillStyle = 'rgba(20,30,60,.45)'; for (let i = 0; i < 12; i++) g.fillRect(14, 40 + i * 11, (w - 28) * (i % 4 === 3 ? 0.6 : 1), 4); });
      const face = flat(mesh(new THREE.PlaneGeometry(0.2, 0.287), std('#ffffff', { map: lines, roughness: 0.75 }), papers, 0, 0.1485, -0.0075)); face.rotation.y = PI; face.rotation.z = 0.035; face.receiveShadow = true;
    }

    // only skin, shirt, suit front, tie and papers look up the shadow map (cheaper frames in the software renderer)
    root.children.forEach(o => { if (o.isMesh) o.receiveShadow = false; });
    root.traverse(o => { if (o.isMesh && (o.material === mHair || o.material === mHairCap || o.material === mBrow || o.material === mEye)) o.receiveShadow = false; });

    // ── pose: everything from the argument, no state ──
    const S = V3(), H = V3(), T = V3(), E = V3(), W = V3(), n = V3(), pp = V3(), f = V3(), xa = V3(), ya = V3(), K = V3(), M4 = new THREE.Matrix4();
    function pose(p) {
      p = p || {};
      const t = p.t || 0, talk = clamp(p.talk || 0, 0, 1), bw = [clamp(p.browR || 0, -1, 1), clamp(p.browL || 0, -1, 1)];
      const tilt = p.tilt || 0, yaw = p.yaw || 0, pitch = p.pitch || 0, blink = clamp(p.blink || 0, 0, 1), squint = clamp(p.squint || 0, 0, 1);
      const pX = clamp(p.pupilX || 0, -1, 1), pY = clamp(p.pupilY || 0, -1, 1);
      const lean = clamp(p.lean || 0, 0, 1), tie = clamp(p.tie || 0, 0, 1), shrug = clamp(p.shrug || 0, 0, 1), paper = clamp(p.paper || 0, 0, 1);
      const br = Math.sin(t * 1.6), sw = Math.sin(t * 0.5), tieK = sstep(0.6, 1, tie), wig = Math.sin(t * 13) * tieK, papK = sstep(0.7, 1, paper), tap = Math.abs(Math.sin(t * 7.5)) * 0.04 * papK;

      torso.rotation.set(lean * 0.34, 0.012 * Math.sin(t * 0.37 + 1), 0.007 * sw); torso.position.set(0.004 * sw, HIP, lean * 0.03);
      chest.scale.set(1 + 0.004 * br, 1 + 0.004 * br, 1 + 0.014 * br);
      neck.position.y = NECK_Y + 0.003 * br - 0.03 * shrug;
      neck.rotation.set(pitch * 0.25, yaw * 0.3, tilt * 0.36);
      head.rotation.set(pitch * 0.75 - lean * 0.22 - tieK * 0.1 + 0.004 * Math.sin(t * 0.8 + 0.5), yaw * 0.7 + 0.008 * Math.sin(t * 0.61 + 2), tilt * 0.64);
      quiff.rotation.z = tilt * 0.07;                                               // the pompadour sags a touch toward the tilt

      // face
      jaw.position.y = 0.16 - 0.05 * talk; jaw.scale.y = 0.16 + 0.014 * talk;
      mouth.position.y = 0.15 - 0.027 * talk; cavity.scale.y = 0.0035 + 0.05 * talk; cavity.scale.x = 0.07 - 0.008 * talk;
      teeth.visible = tongue.visible = talk > 0.04; teeth.position.y = 0.004 + 0.032 * talk; teeth.scale.y = 0.2 + 0.8 * talk; tongue.position.y = -0.002 - 0.03 * talk; tongue.scale.y = 0.004 + 0.014 * talk;
      mo.position.y = 0.2 + 0.012 * talk; mo.rotation.x = -0.05 * talk;
      for (const m of moH) m.h.rotation.z = m.s * (0.1 * talk + 0.012 * br);
      for (let i = 0; i < 2; i++) {
        const v = bw[i], b = brows[i], a = (v < 0 ? -0.42 * v : -0.14 * v) + 0.2 * squint;       // angle by which the inner end drops
        b.b.position.y = 0.418 + (v > 0 ? 0.046 : 0.03) * v - 0.016 * squint; b.b.rotation.z = b.s * a; b.b.position.z = 0.222 + (v < 0 ? -0.012 * v : 0) + 0.008 * squint;
      }
      const thU = lerp(lerp(-0.60, -0.20, squint), 0.27, blink), thL = lerp(lerp(0.80, 0.42, squint), 0.25, blink);
      for (const e of eyes) { e.up.rotation.x = thU; e.lo.rotation.x = thL; e.gaze.rotation.set(-pY * 0.42, pX * 0.5 - e.s * 0.05, 0); }

      // tie
      tieG.rotation.set(-lean * 0.2, 0, wig * 0.05); knot.rotation.z = wig * 0.22;

      // arms
      torso.updateMatrix();
      const sE = smooth(shrug), pE = smooth(paper), tE = smooth(tie);
      for (const A of arms) {
        const s = A.s, lift = 0.08 * shrug;
        A.pad.position.y = 0.582 + lift; S.set(s * 0.335, 0.56 + lift, 0).applyMatrix4(torso.matrix);
        H.set(s * 0.2, deskY + 0.05, deskZ - 0.05);
        if (shrug) H.lerp(T.set(s * 0.57, deskY + 0.37, deskZ - 0.2), sE);
        if (paper) H.lerp(T.set(s * 0.152, deskY + 0.125 + tap, deskZ - 0.03), pE);
        if (s < 0 && tie) { K.set(-0.055, 0.622, 0.215).applyMatrix4(torso.matrix); K.x += wig * 0.012; H.lerp(K, tE); H.z += 0.07 * Math.sin(PI * tE); H.y += 0.03 * Math.sin(PI * tE); }
        // two-bone IK, elbow pushed out/down/back
        n.subVectors(H, S); let L = n.length(); const mx = (L1 + L2) * 0.995; if (L > mx) { H.copy(S).addScaledVector(n, mx / L); L = mx; } n.multiplyScalar(1 / L);
        const a = (L1 * L1 - L2 * L2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
        pp.set(s * lerp(0.5, 0.08, sE), lerp(-0.6, -1, sE), lerp(-0.5, -0.12, sE)); pp.addScaledVector(n, -pp.dot(n)).normalize();
        E.copy(S).addScaledVector(n, a).addScaledVector(pp, h);
        f.subVectors(H, E).normalize(); W.copy(H).addScaledVector(f, -0.02);
        place(A.up, S, E); place(A.fo, E, W); A.el.position.copy(E);
        place(A.cuff, T.copy(H).addScaledVector(f, -0.035), W.copy(H).addScaledVector(f, 0.012));
        // hand: lies flat while it rests on the desk, follows the forearm in the air
        const air = Math.max(sE, pE, s < 0 ? tE : 0);
        f.y *= lerp(0.15, 1, air); f.x = lerp(f.x * 0.5 - s * 0.12, f.x, air); f.normalize();
        xa.crossVectors(UP, f).normalize(); ya.crossVectors(f, xa);
        A.hand.quaternion.setFromRotationMatrix(M4.makeBasis(xa, ya, f)); A.hand.position.copy(H).addScaledVector(f, 0.035);
        if (shrug) A.hand.rotateZ(s * 0.35 * sE);
        if (paper) A.hand.rotateZ(s * 1.1 * pE);
      }
      if (papers) {
        papers.position.set(0, lerp(deskY + 0.008, deskY + 0.002 + tap, pE), lerp(deskZ - 0.03, deskZ + 0.01, pE));
        papers.rotation.x = lerp(PI / 2, -0.14, pE);
      }
    }
    pose({});
    return { group: root, pose, head };
  };
})();
