/* S2 — PHOTO FINISH AT THE MAJLIS (3D). The Zelf arrives two seconds before Al-Aleish.
 * Room: door wall at z=0 (door x∈[-0.55,0.55]), carpet from the glowing threshold line z=0.9 toward the camera (+z).
 * Every cue comes from the timeline (ZN.wordAt / ZN.L / ZN.cut); everything is a pure function of t. */
'use strict';
(function () {
  const { C, F, W, H, seg, lerp, clamp, ease, sstep } = ZN;
  const V = ZN.VERT;
  const eIn = u => u * u * u;
  const io = ease.cubicInOut;
  let scene, cam, zelf, parked, guests = [], aleish, glass, threshold, thrMat, vacantRing, shakeT;
  let ui = {}, T = {};
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // ── builders ──
  const std = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85 }, o || {}));
  function box(w, h, d, mat, x, y, z, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); (parent || scene).add(m); return m; }

  function carpetTex() {
    return ZN.canvasTex(1024, 1024, (g, w, h) => {
      g.fillStyle = '#8e1f22'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#d9a441'; g.lineWidth = 18; g.strokeRect(40, 40, w - 80, h - 80);
      g.strokeStyle = '#1d2b55'; g.lineWidth = 26; g.strokeRect(78, 78, w - 156, h - 156);
      g.strokeStyle = '#d9a441'; g.lineWidth = 6; g.strokeRect(110, 110, w - 220, h - 220);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const x = 250 + i * 262, y = 250 + j * 262;
        g.save(); g.translate(x, y); g.rotate(Math.PI / 4);
        g.fillStyle = (i + j) % 2 ? '#b2342f' : '#6f171b'; g.fillRect(-70, -70, 140, 140);
        g.strokeStyle = '#e2b25a'; g.lineWidth = 6; g.strokeRect(-70, -70, 140, 140);
        g.fillStyle = '#e2b25a'; g.fillRect(-16, -16, 32, 32); g.restore();
      }
    });
  }
  function skyTex() {
    return ZN.canvasTex(512, 512, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fd0ef'); gr.addColorStop(0.55, '#f4e2bd'); gr.addColorStop(0.56, '#e2c08a'); gr.addColorStop(1, '#d6ad73');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#cfa877'; g.fillRect(0, 230, w, 60);            // neighbour's wall
      g.fillStyle = '#b48a5c'; g.fillRect(0, 286, w, 6);
      g.fillStyle = '#5c7a3a'; g.beginPath(); g.ellipse(390, 170, 70, 26, -0.3, 0, Math.PI * 2); g.ellipse(430, 190, 60, 20, 0.5, 0, Math.PI * 2); g.fill();   // palm crown
      g.fillStyle = '#7a5a36'; g.fillRect(402, 180, 12, 110);
    });
  }
  function stickerTex() {
    return ZN.canvasTex(512, 512, (g, w) => {
      const r = w / 2;
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(r + 6, r + 10, r - 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(r, r, r - 12, 0, Math.PI * 2); g.fill();
      g.save(); g.beginPath(); g.arc(r, r, r - 34, 0, Math.PI * 2); g.clip();
      const im = ZN.img.p2_face; if (im) g.drawImage(im, 34, 34, w - 68, w - 68); g.restore();
    });
  }
  function ringTex() {   // dotted empty outline (where his sideburn should be)
    return ZN.canvasTex(256, 384, (g, w, h) => {
      g.setLineDash([22, 14]); g.lineWidth = 16; g.strokeStyle = '#ffffff'; g.lineCap = 'round';
      g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 14, h / 2 - 14, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#E0202B'; g.lineWidth = 9; g.setLineDash([22, 14]); g.lineDashOffset = 18;
      g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 14, h / 2 - 14, 0, 0, Math.PI * 2); g.stroke();
    });
  }

  function makeGuest(seed) {
    const g = new THREE.Group(), rise = new THREE.Group(); g.add(rise);
    const thobe = std('#f3f1ea', { roughness: 0.9 }), skin = std('#c58f63', { roughness: 0.7 }), ghutra = std('#fbfbf7', { roughness: 0.9, side: THREE.DoubleSide });
    const lap = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), thobe); lap.scale.set(0.33, 0.11, 0.3); lap.position.set(0, 0.24, 0.1); rise.add(lap);
    const torso = new THREE.Mesh(new THREE.LatheGeometry([v3(0.0, 0, 0), v3(0.22, 0, 0), v3(0.21, 0.25, 0), v3(0.2, 0.45, 0), v3(0.15, 0.56, 0), v3(0.05, 0.6, 0)], 18), thobe);
    torso.position.y = 0.24; rise.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), skin); head.position.set(0, 0.95, 0.01); rise.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), ghutra); cap.position.set(0, 0.965, -0.005); rise.add(cap);
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.122, 0.2, 0.36, 18, 1, true, Math.PI * 0.62, Math.PI * 1.76), ghutra); drape.position.set(0, 0.84, -0.01); rise.add(drape);
    const agal = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.014, 6, 20), std('#111114', { roughness: 0.5 })); agal.rotation.x = Math.PI / 2 - 0.12; agal.position.set(0, 1.03, -0.01); rise.add(agal);
    for (const sx of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.3, 4, 8), thobe); arm.position.set(sx * 0.22, 0.6, 0.06); arm.rotation.set(-0.5, 0, sx * 0.25); rise.add(arm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), skin); hand.position.set(sx * 0.25, 0.41, 0.2); rise.add(hand);
    }
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.2; g.add(sh);
    return { g, rise };
  }

  function makeAleish() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const thobe = std('#f5f3ec', { roughness: 0.88 }), skin = std('#c58f63', { roughness: 0.7 });
    const lathe = new THREE.Mesh(new THREE.LatheGeometry([v3(0, 0.12, 0), v3(0.27, 0.12, 0), v3(0.25, 0.6, 0), v3(0.24, 1.0, 0), v3(0.27, 1.3, 0), v3(0.23, 1.44, 0), v3(0.07, 1.5, 0), v3(0, 1.5, 0)], 20), thobe);
    body.add(lathe);
    const placket = box(0.02, 0.28, 0.01, std('#d9d6cc'), 0, 1.33, 0.255, body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 10), skin); neck.position.y = 1.53; body.add(neck);
    // standing leg + foot with sandal
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 8), skin); leg.position.set(-0.08, 0.07, 0); body.add(leg);
    const sandal = std('#8a5a2e', { roughness: 0.7 });
    box(0.12, 0.025, 0.26, sandal, -0.08, 0.012, 0.05, body);
    // raised foot (held up in front) with a half-off sandal
    const foot = new THREE.Group(); foot.position.set(0.16, 0.16, 0.08); foot.rotation.z = -1.05; body.add(foot);   // leg kicked out sideways from under the hem
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.34, 8), skin); shin.position.y = 0.17; foot.add(shin);
    const ft = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skin); ft.scale.set(1, 0.7, 1.7); ft.position.set(0, 0.36, 0.04); foot.add(ft);
    const sole = new THREE.Group(); sole.position.set(0, 0.4, 0.02); foot.add(sole);     // the sandal half off the toes
    box(0.11, 0.022, 0.25, sandal, 0, 0, 0.1, sole);
    box(0.115, 0.03, 0.05, std('#5a3418'), 0, 0.02, 0.04, sole);
    // arms: left hangs, right reaches down for the sandal
    const armL = new THREE.Group(); armL.position.set(-0.27, 1.38, 0); body.add(armL);
    const aL = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.5, 4, 8), thobe); aL.position.y = -0.28; armL.add(aL);
    const hL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skin); hL.position.y = -0.58; armL.add(hL);
    const armR = new THREE.Group(); armR.position.set(0.27, 1.38, 0.02); body.add(armR);
    const aR = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.55, 4, 8), thobe); aR.position.y = -0.3; armR.add(aR);
    const hR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skin); hR.position.y = -0.62; armR.add(hR);
    // sticker head: his real face, flat, white die-cut border
    const head = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ map: stickerTex(), transparent: true, toneMapped: false }));
    head.position.set(0, 1.84, 0.03); body.add(head);
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.165), new THREE.MeshBasicMaterial({ map: ringTex(), transparent: true, toneMapped: false, depthWrite: false }));
    ring.position.set(-0.17, -0.1, 0.006); ring.renderOrder = 3; head.renderOrder = 2; head.add(ring);     // on his right cheek, by the ear (picture left)
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.34, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.003; g.add(sh);
    return { g, body, armL, armR, foot, sole, head, ring };
  }

  function makeTeaGlass() {   // a tall istikana, bigger than the Zelf
    const g = new THREE.Group();
    const prof = [v3(0.0, 0, 0), v3(0.075, 0, 0), v3(0.08, 0.02, 0), v3(0.058, 0.17, 0), v3(0.06, 0.24, 0), v3(0.09, 0.42, 0), v3(0.094, 0.43, 0)];
    const glassM = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.08, metalness: 0, transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
    const tea = new THREE.Mesh(new THREE.LatheGeometry([v3(0, 0.02, 0), v3(0.074, 0.02, 0), v3(0.056, 0.17, 0), v3(0.058, 0.24, 0), v3(0.082, 0.37, 0), v3(0, 0.37, 0)], 24),
      new THREE.MeshStandardMaterial({ color: '#b34a12', roughness: 0.3, emissive: '#5a1a04', emissiveIntensity: 0.4 }));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.006, 6, 24), std('#d9a441', { metalness: 0.6, roughness: 0.3 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.43;
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.015, 24), std('#f1ece2', { roughness: 0.4 }));
    g.add(tea, glassM, rim, saucer);
    return g;
  }

  // ── cue table (all from the timeline) ──
  function cues(ctx) {
    const w = (id, f) => ZN.wordAt(id, f);
    T.t0 = ctx.t0; T.t1 = ctx.t1;
    T.src = w('l5', 'مصادر'); T.zelf = w('l5', 'زلف'); T.yusil = w('l5', 'يوصل'); T.majlis = w('l5', 'المجلس');
    T.qablah = w('l5', 'قبله'); T.thanya = w('l5', 'بثانيتين');
    T.l6 = ZN.L('l6'); T.l6e = ZN.LE('l6'); T.huwa = w('l6', 'هو');
    T.l7 = ZN.L('l7'); T.sallam = w('l7', 'سلّم'); T.qaad = w('l7', 'وقعد'); T.shirib = w('l7', 'وشرب');
    T.aleish = w('l7', 'والعليش'); T.tawah = Math.max(w('l7', 'توه'), T.aleish + 0.6); T.yifsakh = w('l7', 'يفصخ'); T.niaal = w('l7', 'نعاله');
    T.sw0 = T.l7; T.sw1 = T.l7 + 2.0;
    T.board = T.t1 - 0.8; T.rise = T.t1 - 0.4;
    // Zelf route (x, z) and the parked-sandal moment
    T.enter0 = T.zelf - 0.25; T.park = T.yusil; T.step = (T.yusil + T.majlis) / 2;
    T.stop = T.qablah + 0.5;
  }

  // ── Zelf position over time ──
  const P_DOOR = [0.02, -1.15], P_PARK = [-0.45, 0.3], P_OUT = [-0.42, 0.46], P_LINE = [-0.18, 0.9], P_STAND = [0.2, 1.3];
  const P_SEAT = [1.06, 0.44], SEAT_Y = 0.215;
  function zelfState(t) {
    const s = { x: P_DOOR[0], y: 0, z: P_DOOR[1], walk: 0, hop: 0, yaw: 0, sandals: 1, sit: 0, wave: 0, raise: 0, sip: 0, squash: 0, look: [0, 0], vis: t > T.enter0 - 0.05 };
    const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    let p;
    if (t < T.park) { const k = seg(t, T.enter0, T.park); p = L2(P_DOOR, P_PARK, ease.quadOut(k)); s.walk = k > 0 && k < 1 ? 1 : 0.0; s.yaw = -0.25 * (1 - k); }
    else if (t < T.majlis) {   // steps out of its sandals: a tiny hop forward
      const k = seg(t, T.step - 0.12, T.majlis - 0.04); p = L2(P_PARK, P_OUT, ease.cubicOut(k)); s.hop = k > 0 && k < 1 ? k : 0; s.hopH = 0.06;
      s.sandals = t < T.step - 0.06 ? 1 : 0; s.look = [-0.6, -0.8]; s.yaw = -0.3 * sstep(T.park, T.step, t);
    } else if (t < T.qablah) { const k = seg(t, T.majlis, T.qablah); p = L2(P_OUT, P_LINE, k); s.walk = 1; s.sandals = 0; }
    else { const k = seg(t, T.qablah, T.stop); p = L2(P_LINE, P_STAND, ease.cubicOut(k)); s.walk = 1 - sstep(0.6, 1, k); s.sandals = 0; }
    s.x = p[0]; s.z = p[1];
    if (t >= T.majlis) s.sandals = 0;
    // l6: raises a tiny limb to calm the guests, looks at them
    if (t >= T.stop) {
      s.raise = sstep(T.l6 + 0.05, T.l6 + 0.35, t) * (1 - sstep(T.l6e, T.l6e + 0.3, t));
      s.look = [lerp(0, -0.8, sstep(T.l6 - 0.3, T.l6, t) * (1 - sstep(T.l6e, T.l7, t))), 0.1];
      s.yaw = -0.35 * sstep(T.l6 - 0.3, T.l6, t) * (1 - sstep(T.l6e, T.l7, t));
    }
    // l7: waves (سلّم), hops to the head cushion (قعد), sips (شرب)
    if (t >= T.sallam - 0.1) { s.wave = sstep(T.sallam - 0.1, T.sallam + 0.1, t) * (1 - sstep(T.qaad - 0.15, T.qaad, t)); s.yaw = -0.45 * s.wave; s.look = [-0.7, 0.2]; }
    if (t >= T.qaad - 0.12) {
      const a = T.qaad - 0.12, b = T.qaad + 0.32;
      if (t < T.qaad) { s.squash = 0.22 * sstep(a, T.qaad, t); }
      else {
        const k = seg(t, T.qaad, b);
        s.x = lerp(P_STAND[0], P_SEAT[0], ease.smooth(k)); s.z = lerp(P_STAND[1], P_SEAT[1], ease.smooth(k));
        s.y = lerp(0, SEAT_Y, k) + Math.sin(Math.PI * k) * 0.42; s.hop = k < 1 ? k : 0; s.hopH = 0.0;
        s.squash = t > b ? 0.25 * Math.exp(-(t - b) * 9) * Math.cos((t - b) * 30) : 0;
        s.sit = sstep(b, b + 0.15, t);
        s.yaw = lerp(-0.3, 0, k); s.look = [0, 0];
      }
    }
    if (t >= T.shirib - 0.1) { s.sip = sstep(T.shirib - 0.1, T.shirib + 0.15, t); s.yaw = -0.5 * s.sip; s.tiltZ = 0.1 * s.sip; }
    return s;
  }

  // ── camera keyframes: [time, pos, look] ──
  function camAt(t) {
    const K = [
      [T.t0, [0.25, 0.46, 3.35], [-0.1, 0.62, 0], 0.6],
      [T.zelf - 0.1, [0.12, 0.42, 3.05], [-0.15, 0.52, 0], 0.6],
      [T.park + 0.05, [-0.28, 0.3, 1.75], [-0.4, 0.2, 0.3], 0.58],
      [T.qablah - 0.05, [-0.2, 0.32, 2.3], [-0.22, 0.27, 0.85], 0.64],
      [T.l6 - 0.1, [0.05, 1.0, 5.05], [0.0, 0.45, 1.45], 0.68],
      [T.l6e + 0.1, [0.02, 0.98, 4.9], [0.0, 0.45, 1.45], 0.68],
      [T.qaad + 0.35, [0.75, 0.58, 2.95], [0.8, 0.3, 0.7], 0.78],
      [T.aleish - 0.02, [0.78, 0.56, 2.85], [0.82, 0.3, 0.65], 0.78],
      [T.aleish + 0.75, [0.1, 0.7, 3.9], [0.05, 1.12, -0.2], 0.5],
      [T.t1, [0.12, 0.7, 3.8], [0.05, 1.12, -0.2], 0.5],
    ];
    let i = 0; while (i < K.length - 2 && t >= K[i + 1][0]) i++;
    const a = K[i], b = K[i + 1], k = io(seg(t, a[0], b[0]));
    const P = a[1].map((v, j) => lerp(v, b[1][j], k)), L = a[2].map((v, j) => lerp(v, b[2][j], k));
    camAt.exp = lerp(a[3], b[3], k);
    // tiny drift so no frame is fully static
    P[0] += Math.sin(t * 0.37) * 0.012; P[1] += Math.sin(t * 0.29) * 0.006;
    if (V) { const s = 1.4; for (let j = 0; j < 3; j++) P[j] = L[j] + (P[j] - L[j]) * s; P[1] += 0.04; L[1] -= 0.1; camAt.exp *= 1.1; }
    // the one light shake: the +2 stamp slam
    const sk = seg(t, T.thanya, T.thanya + 0.22);
    if (sk > 0 && sk < 1) { const d = (1 - sk) * 0.01; P[0] += Math.sin(sk * 40) * d; P[1] += Math.cos(sk * 33) * d * 0.7; }
    // sky-switch exit: rise straight up in the last 0.4 s
    const r = eIn(seg(t, T.rise, T.t1)) * 3.2; P[1] += r; L[1] += r * 1.08;
    return { P, L };
  }

  // ── DOM helpers ──
  const proj = (x, y, z) => { const v = v3(x, y, z).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };
  const show = (e, o, tf) => { e.style.opacity = o; e.style.visibility = o > 0.001 ? 'visible' : 'hidden'; if (tf != null) e.style.transform = tf; };

  ZN.scene({
    id: 'S2',
    init(ctx) {
      cues(ctx);
      scene = new THREE.Scene(); scene.background = new THREE.Color('#3a2a22');
      // lights: warm room, key from camera-left front (nobody is backlit)
      scene.add(new THREE.HemisphereLight(0xfff1dc, 0x6a3a2a, 1.25));
      const key = new THREE.DirectionalLight(0xffe6c4, 2.3); key.position.set(-2.2, 3.2, 5.5); key.target.position.set(0, 0.4, 0.8); scene.add(key, key.target);
      const fill = new THREE.DirectionalLight(0xd8e4ff, 0.7); fill.position.set(3, 1.6, 4); scene.add(fill);
      const lamp = new THREE.PointLight(0xffb866, 1.6, 4.5, 1.6); lamp.position.set(-1.6, 1.9, 0.6); scene.add(lamp);
      const lamp2 = new THREE.PointLight(0xffb866, 1.4, 4.5, 1.6); lamp2.position.set(1.7, 1.9, 0.6); scene.add(lamp2);
      // floor: entry tiles (z 0..0.9) + carpet
      const tiles = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.9), std('#e9dcc4', { roughness: 0.45 })); tiles.rotation.x = -Math.PI / 2; tiles.position.set(0, 0, 0.45); scene.add(tiles);
      const carpet = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 4.2), std('#ffffff', { map: carpetTex(), roughness: 0.95 })); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.002, 3.0); scene.add(carpet);
      // threshold: the glowing finish line
      thrMat = new THREE.MeshStandardMaterial({ color: '#ffd36a', emissive: '#ffc83a', emissiveIntensity: 1.2, roughness: 0.4 });
      threshold = box(4.8, 0.012, 0.04, thrMat, 0, 0.006, 0.9);
      // walls
      const wall = std('#dcc5a2', { roughness: 0.92 }), wains = std('#a8794c', { roughness: 0.8 }), wood = std('#6e4224', { roughness: 0.6 });
      box(1.5, 2.9, 0.15, wall, -1.3, 1.45, -0.075); box(1.5, 2.9, 0.15, wall, 1.3, 1.45, -0.075); box(1.1, 0.7, 0.15, wall, 0, 2.55, -0.075);
      box(1.5, 0.32, 0.02, wains, -1.3, 0.16, 0.01); box(1.5, 0.32, 0.02, wains, 1.3, 0.16, 0.01);
      for (const sx of [-1, 1]) { box(0.15, 2.9, 5.5, wall, sx * 2.12, 1.45, 2.6); box(0.02, 0.32, 5.5, wains, sx * 2.04, 0.16, 2.6); }
      box(4.4, 0.1, 5.6, std('#d8c3a0'), 0, 2.9, 2.6);
      // door frame + open leaf
      box(0.08, 2.2, 0.2, wood, -0.59, 1.1, -0.06); box(0.08, 2.2, 0.2, wood, 0.59, 1.1, -0.06); box(1.26, 0.1, 0.2, wood, 0, 2.24, -0.06);
      const leaf = new THREE.Group(); leaf.position.set(-0.55, 0, -0.15); leaf.rotation.y = 1.35; scene.add(leaf);
      box(1.08, 2.16, 0.05, wood, 0.54, 1.08, 0, leaf); box(0.9, 0.7, 0.02, std('#8a5630'), 0.54, 1.55, 0.03, leaf); box(0.9, 0.8, 0.02, std('#8a5630'), 0.54, 0.6, 0.03, leaf);
      // outside: sunlit yard (unlit backdrop, not behind the characters' key)
      const out = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.2), new THREE.MeshBasicMaterial({ map: skyTex(), toneMapped: true }));
      out.position.set(0, 1.6, -3.2); scene.add(out);
      const yard = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.2), std('#d8b27a', { roughness: 1 })); yard.rotation.x = -Math.PI / 2; yard.position.set(0, -0.002, -1.7); scene.add(yard);
      const sun = new THREE.DirectionalLight(0xfff0d0, 1.2); sun.position.set(1, 4, 2); sun.target = yard; scene.add(sun);
      // wall sconces (practicals)
      for (const sx of [-1, 1]) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshStandardMaterial({ color: '#ffe0a0', emissive: '#ffbe5c', emissiveIntensity: 2 })); s.position.set(sx * 1.6, 1.95, 0.08); s.scale.z = 0.5; scene.add(s); box(0.04, 0.2, 0.06, std('#c9a052', { metalness: 0.6 }), sx * 1.6, 1.8, 0.03); }
      // floor cushions along the side walls (red with a gold stripe) + the head cushion right of the door
      const cush = std('#9d2a2a', { roughness: 0.9 }), cushB = std('#7b1d22', { roughness: 0.9 }), gold = std('#d9a441', { roughness: 0.5, metalness: 0.3 });
      for (const sx of [-1, 1]) {
        box(0.6, 0.16, 3.7, cush, sx * 1.74, 0.08, 2.8); box(0.6, 0.02, 3.7, gold, sx * 1.74, 0.165, 2.8);
        box(0.18, 0.5, 3.7, cushB, sx * 1.95, 0.36, 2.8);
        for (let k = 0; k < 4; k++) box(0.06, 0.08, 0.3, gold, sx * 1.85, 0.56, 1.2 + k * 0.9);
      }
      box(1.1, 0.2, 0.62, std('#b8862e', { roughness: 0.8 }), 1.33, 0.1, 0.38); box(1.1, 0.025, 0.62, std('#7b1d22'), 1.33, 0.205, 0.38);
      box(1.1, 0.55, 0.16, std('#b8862e', { roughness: 0.8 }), 1.33, 0.47, 0.1);
      box(1.1, 0.04, 0.17, std('#7b1d22'), 1.33, 0.76, 0.1);
      // the row of big sandals left of the door
      const sandalCols = ['#7a4a26', '#3c2a1e', '#8d5a2c', '#5a3a22'];
      for (let i = 0; i < 4; i++) {
        const x0 = -1.72 + i * 0.29, m = std(sandalCols[i], { roughness: 0.7 }), sm = std('#2a1a10', { roughness: 0.6 });
        for (const dx of [-0.065, 0.065]) { const sg = new THREE.Group(); sg.position.set(x0 + dx, 0, 0.26); sg.rotation.y = (i % 2 ? 0.08 : -0.06) + dx; scene.add(sg);
          box(0.11, 0.028, 0.27, m, 0, 0.014, 0, sg); box(0.115, 0.03, 0.05, sm, 0, 0.04, -0.03, sg); }
      }
      parked = ZN.makeZelfSandals(); parked.position.set(P_PARK[0], 0.001, P_PARK[1]); scene.add(parked);
      // tea tray + the big glass
      const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.28, 0.025, 28), std('#d9a441', { metalness: 0.55, roughness: 0.35 })); tray.position.set(0.72, 0.013, 0.84); scene.add(tray);
      glass = makeTeaGlass(); glass.position.set(0.82, 0.03, 0.68); scene.add(glass);
      for (const [x, z] of [[0.55, 0.9], [0.66, 1.0]]) { const s = makeTeaGlass(); s.scale.setScalar(0.32); s.position.set(x, 0.025, z); scene.add(s); }
      // guests (faceless), seated on the side cushions facing the middle
      const GP = [[-1.62, 1.3, Math.PI / 2], [-1.62, 2.1, Math.PI / 2], [1.62, 2.4, -Math.PI / 2]];
      GP.forEach(([x, z, ry], i) => { const gg = makeGuest(i); gg.g.position.set(x, 0, z); gg.g.rotation.y = ry; scene.add(gg.g); guests.push(gg); });
      // Al-Aleish
      aleish = makeAleish(); aleish.g.position.set(0, 0, -0.45); scene.add(aleish.g);
      // the Zelf
      zelf = ZN.makeZelf({ seed: 7 }); scene.add(zelf.group);
      const zsh = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.3, depthWrite: false }));
      zsh.rotation.x = -Math.PI / 2; zsh.position.y = 0.004; zelf.group.add(zsh); zelf.shadow = zsh;
      cam = ZN.camera(V ? 50 : 38);

      // ── DOM overlays (text from script.json) ──
      const u = ctx.ui, S = k => String(ZN.S('txt.S2.' + k, '')).replace(/([+\-]?\d[\d.:]*\.?)/g, '\u2066$1\u2069');
      const L0 = V ? 60 : 80, TOP = V ? 210 : 70;
      ui.flash = ZN.el(u, 'div', `position:absolute;inset:0;background:#fff;opacity:0`);
      ui.finder = ZN.el(u, 'div', `position:absolute;inset:${V ? '180px 50px 380px 50px' : '60px 330px 270px 330px'};opacity:0`);
      for (const [a, b] of [['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']]) ZN.el(ui.finder, 'div', `position:absolute;${a}:0;${b}:0;width:90px;height:90px;border-${a}:8px solid #fff;border-${b}:8px solid #fff`);
      ui.finderDot = ZN.el(ui.finder, 'div', `position:absolute;top:22px;left:50%;transform:translateX(-50%);display:flex;gap:12px;align-items:center;direction:ltr`);
      ZN.el(ui.finderDot, 'div', `width:26px;height:26px;border-radius:50%;background:${C.red}`); ZN.el(ui.finderDot, 'div', `color:#fff;font:800 36px ${F.ui};letter-spacing:2px`, 'REC');
      ui.src = ZN.el(u, 'div', `position:absolute;left:${L0}px;top:${TOP}px;display:flex;align-items:center;gap:18px;background:${C.red};color:#fff;font:800 ${V ? 58 : 54}px ${F.ui};padding:14px 34px 18px;border-radius:12px;box-shadow:0 10px 0 ${C.red2};transform-origin:0 50%`);
      ZN.el(ui.src, 'div', `width:22px;height:22px;border-radius:50%;background:#fff`); ZN.el(ui.src, 'div', '', S('sources'));
      ui.plus = ZN.el(u, 'div', `position:absolute;left:${V ? 540 : 1150}px;top:${V ? 640 : 250}px;transform-origin:50% 50%;background:${C.red};color:#fff;font:400 ${V ? 140 : 150}px/1.1 ${F.stamp};padding:6px 46px 0;border:8px solid #fff;border-radius:18px;box-shadow:0 14px 0 ${C.red2};white-space:nowrap;direction:rtl`, S('plus2'));
      ui.bubble = ZN.el(u, 'div', `position:absolute;left:0;top:0;background:#fff;color:${C.navy};font:800 ${V ? 50 : 48}px/1.3 ${F.ui};padding:20px 38px 24px;border-radius:30px;border:5px solid ${C.navy};white-space:nowrap;box-shadow:0 10px 0 rgba(10,26,58,.35)`, S('zelfSays'));
      ui.tail = ZN.el(ui.bubble, 'div', `position:absolute;left:50%;bottom:-30px;width:0;height:0;border-left:22px solid transparent;border-right:22px solid transparent;border-top:30px solid ${C.navy};transform:translateX(-50%)`);
      ZN.el(ui.tail, 'div', `position:absolute;left:-14px;top:-36px;width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:20px solid #fff`);
      // stopwatch + checklist
      ui.sw = ZN.el(u, 'div', `position:absolute;left:${L0}px;top:${TOP}px;transform-origin:0 0;background:${C.navy};border:4px solid ${C.navy3};border-radius:16px;padding:14px 26px 16px;box-shadow:0 12px 0 rgba(0,0,0,.35)`);
      ui.swRow = ZN.el(ui.sw, 'div', `display:flex;align-items:center;gap:18px;direction:ltr`);
      ui.swIcon = ZN.el(ui.swRow, 'div', `position:relative;width:52px;height:52px;border-radius:50%;border:6px solid #fff`);
      ZN.el(ui.swIcon, 'div', `position:absolute;left:50%;top:-16px;width:12px;height:10px;margin-left:-6px;background:#fff;border-radius:3px`);
      ui.swHand = ZN.el(ui.swIcon, 'div', `position:absolute;left:50%;top:50%;width:4px;height:18px;margin-left:-2px;margin-top:-18px;background:${C.gold};transform-origin:50% 100%`);
      ui.swDigits = ZN.el(ui.swRow, 'div', `display:flex;color:#fff;font:800 ${V ? 70 : 66}px ${F.ui};direction:ltr`);
      ui.dig = []; for (let i = 0; i < 8; i++) ui.dig.push(ZN.el(ui.swDigits, 'span', `display:inline-block;width:${'0123456789'.includes('0') && (i === 2 || i === 5) ? 0.32 : 0.62}em;text-align:center`));
      ui.checks = [];
      ['v1', 'v2', 'v3'].forEach((k, i) => {
        const r = ZN.el(u, 'div', `position:absolute;left:${L0}px;top:${TOP + (V ? 150 : 140) + i * (V ? 104 : 98)}px;height:${V ? 86 : 82}px;box-sizing:border-box;display:flex;align-items:center;gap:16px;background:${C.paper};color:${C.navy};font:400 ${V ? 52 : 50}px/1 ${F.stamp};padding:6px 26px 0 18px;border-radius:12px;border:4px solid ${C.navy};transform-origin:0 50%;direction:rtl`);
        ZN.el(r, 'div', `width:44px;height:44px;border-radius:50%;background:${C.red};color:#fff;font:800 30px/44px ${F.ui};text-align:center`, '✓');
        ZN.el(r, 'div', '', S(k));
        ui.checks.push(r);
      });
      ui.tea = ZN.el(u, 'div', `position:absolute;left:0;top:0;background:${C.gold};color:${C.navy};font:800 ${V ? 44 : 40}px ${F.ui};padding:10px 24px 14px;border-radius:12px;border:4px solid ${C.navy};white-space:nowrap`, S('tea'));
      ui.teaLine = ZN.el(u, 'div', `position:absolute;left:0;top:0;width:5px;background:${C.navy};transform-origin:50% 0`);
      ui.vac = ZN.el(u, 'div', `position:absolute;left:0;top:0;background:${C.red};color:#fff;font:400 ${V ? 60 : 58}px/1.15 ${F.stamp};padding:8px 30px 2px;border-radius:12px;border:5px solid #fff;white-space:nowrap;box-shadow:0 8px 0 ${C.red2}`, S('vacant'));
      ui.vacLine = ZN.el(u, 'div', `position:absolute;left:0;top:0;height:5px;background:#fff;transform-origin:0 50%`);
      ui.board = ZN.el(u, 'div', `position:absolute;left:${V ? 110 : 80}px;top:${V ? 1250 : 500}px;width:${V ? 860 : 760}px;background:${C.navy};border:5px solid ${C.gold};border-radius:20px;padding:22px 28px;box-shadow:0 18px 0 rgba(0,0,0,.4);transform-origin:50% 0;direction:rtl`);
      // rank rows: «N. name  +time» split into a number badge, the name and a red time pill (text untouched, only laid out)
      const rankRow = (key, bg, fs, mb) => {
        const raw = String(ZN.S('txt.S2.' + key, '')), m = raw.match(/^\s*(\d+)\.\s*(.*)$/) || [0, '', raw];
        const m2 = m[2].match(/^(.*?)\s+([+\-]?\d[\d.:]*\s*\S*)\s*$/);
        const row = ZN.el(ui.board, 'div', `display:flex;align-items:center;gap:22px;background:${bg};color:${C.navy};font:800 ${fs}px/1.2 ${F.ui};padding:12px 22px;border-radius:12px;margin-bottom:${mb}px;white-space:nowrap`);
        ZN.el(row, 'div', `flex:none;width:${fs * 1.25}px;height:${fs * 1.25}px;border-radius:50%;background:${C.navy};color:${C.gold};text-align:center;line-height:${fs * 1.25}px`, m[1]);
        ZN.el(row, 'div', `flex:1`, m2 ? m2[1] : m[2]);
        if (m2) ZN.el(row, 'div', `flex:none;background:${C.red};color:#fff;padding:2px 20px 6px;border-radius:10px`, '\u2066' + m2[2].replace(/\s+\S+$/, '') + '\u2069 ' + (m2[2].match(/\S+$/) || [''])[0]);
        return row;
      };
      ui.r1 = rankRow('rank1', C.gold, V ? 64 : 64, 14);
      ui.r2 = rankRow('rank2', '#fff', V ? 54 : 54, 0);

      // ── sound ──
      ZN.ev('stamp', T.src, 0.55);
      ZN.ev('pop', T.zelf, 0.45);
      ZN.ev('boing', T.step - 0.1, 0.4);
      ZN.ev('shutter', T.qablah, 0.9);
      ZN.ev('impact', T.thanya, 1.0);
      ZN.ev('tick', T.sw0, 0.5);
      ZN.ev('boing', T.qaad, 0.55);
      ZN.ev('ding', T.sw1, 0.9);
      ZN.ev('whoosh', T.aleish, 0.45);
      ZN.ev('slide', T.board, 0.6);
    },

    update(t, ctx) {
      // ── 3D ──
      const z = zelfState(t);
      zelf.group.visible = z.vis;
      zelf.group.position.set(z.x, z.y, z.z);
            zelf.shadow.visible = t < T.qaad || t > T.qaad + 0.32;
      zelf.pose({ t, walk: z.walk, hop: z.hop, hopH: z.hopH, yaw: z.yaw, sandals: z.sandals, sit: z.sit, wave: z.wave, raise: z.raise, sip: z.sip, squash: z.squash, tiltZ: z.tiltZ || 0, look: z.look,
        talk: (t > T.l6 - 0.05 && t < T.l6e + 0.1) ? ZN.mouth(t) : 0 });
      parked.visible = t >= T.step - 0.06;
      // threshold glow: steady pulse, flare on the photo finish
      const fl = Math.exp(-Math.max(0, t - T.qablah) * 4) * (t >= T.qablah ? 1 : 0);
      thrMat.emissiveIntensity = 1.1 + 0.25 * Math.sin(t * 4) + fl * 4;
      // guests start to get up, then settle back when calmed
      const up = sstep(T.l6 - 0.35, T.l6 + 0.25, t) * (1 - sstep(T.huwa - 0.1, T.l6e + 0.35, t));
      guests.forEach((g, i) => { const u = up * (0.9 + 0.1 * i); g.rise.position.y = 0.16 * u; g.rise.rotation.x = 0.22 * u; g.rise.position.z = 0.06 * u; });
      // glass leans toward the Zelf while it sips
      const sp = sstep(T.shirib - 0.1, T.shirib + 0.2, t) * (1 - sstep(T.aleish + 0.4, T.aleish + 0.8, t));
      glass.rotation.z = -0.12 * sp; glass.rotation.x = -0.05 * sp;
      // Al-Aleish: hops in from behind the wall on one leg, fighting a sandal
      const ae = seg(t, T.aleish - 0.5, T.aleish + 0.35);
      aleish.g.visible = t > T.aleish - 0.5;
      aleish.g.position.x = lerp(1.4, 0.02, ease.cubicOut(ae));
      const hopPh = (t - T.aleish) * 7.5;
      aleish.body.position.y = Math.abs(Math.sin(hopPh)) * 0.1;
      aleish.body.rotation.z = -0.12 + Math.sin(hopPh * 0.5) * 0.08;
      aleish.body.rotation.y = -0.15 + Math.sin(hopPh * 0.25) * 0.08;
      aleish.armR.rotation.set(-0.2 + Math.sin(hopPh * 1.3) * 0.1, 0, 0.62 + Math.sin(hopPh * 1.3) * 0.06);
      aleish.armL.rotation.set(0.1, 0, -1.9 + Math.sin(hopPh * 0.5) * 0.35);
      aleish.sole.rotation.set(0.9 + Math.sin(hopPh * 1.3) * 0.4, 0, 0.3);
      aleish.head.rotation.z = Math.sin(hopPh * 0.5 + 0.4) * 0.07;
      const ringIn = seg(t, T.tawah, T.tawah + 0.3);
      aleish.ring.material.opacity = ringIn; aleish.ring.scale.setScalar(lerp(1.6, 1, ease.backOut(ringIn)));
      // camera
      const { P, L } = camAt(t);
      cam.position.set(P[0], P[1], P[2]); cam.lookAt(L[0], L[1], L[2]);
      cam.updateMatrixWorld();
      ZN.render3d(scene, cam, camAt.exp);

      // ── DOM ──
      // sources card (on «مصادر»)
      const sIn = seg(t, T.src - 0.05, T.src + 0.25), sOut = seg(t, T.zelf + 0.1, T.zelf + 0.3);
      show(ui.src, sIn * (1 - sOut), `translateX(${-40 * (1 - ease.quartOut(sIn)) - 60 * eIn(sOut)}px) scale(${lerp(1.25, 1, ease.backOut(sIn))})`);
      // photo-finish flash + viewfinder (on «قبله»)
      const fk = t - T.qablah;
      ui.flash.style.opacity = fk >= 0 ? 0.85 * Math.exp(-fk * 9) : 0;
      const fin = seg(t, T.qablah - 0.05, T.qablah + 0.12), fout = seg(t, T.thanya - 0.05, T.thanya + 0.1);
      show(ui.finder, fin * (1 - fout), `scale(${lerp(1.08, 1, ease.cubicOut(fin))})`);
      // +2 stamp slam (on «بثانيتين»)
      const pIn = seg(t, T.thanya, T.thanya + 0.2), pOut = seg(t, T.l6 - 0.25, T.l6 - 0.05);
      show(ui.plus, Math.min(1, pIn * 4) * (1 - pOut), `translate(-50%,0) rotate(-7deg) scale(${lerp(2.2, 1, ease.quartOut(pIn)) * (1 - 0.3 * eIn(pOut))})`);
      // speech bubble above the Zelf (l6)
      const bIn = seg(t, T.l6 - 0.05, T.l6 + 0.2), bOut = seg(t, T.l6e + 0.15, T.l6e + 0.3);
      if (bIn > 0 && bOut < 1) {
        const [hx, hy] = proj(z.x, z.y + 0.42, z.z);
        const bw = ui.bubble.offsetWidth || 500, bh = ui.bubble.offsetHeight || 100;
        const bx = clamp(hx - bw / 2, 40, W - bw - 40), by = Math.max(V ? 200 : 60, hy - bh - 40);
        ui.bubble.style.left = bx + 'px'; ui.bubble.style.top = by + 'px';
        ui.tail.style.left = clamp(hx - bx, 40, bw - 40) + 'px';
        show(ui.bubble, bIn * (1 - bOut), `translateY(${20 * (1 - ease.cubicOut(bIn))}px) scale(${lerp(0.7, 1, ease.backOut(bIn))})`);
        ui.bubble.style.transformOrigin = `${clamp(hx - bx, 40, bw - 40)}px 100%`;
      } else show(ui.bubble, 0);
      // stopwatch: runs in real time from l7, stops red at 2.00 (ding)
      const swIn = seg(t, T.sw0 - 0.3, T.sw0), swOut = seg(t, T.aleish + 0.25, T.aleish + 0.5);
      show(ui.sw, swIn * (1 - swOut), `translateY(${-30 * (1 - ease.cubicOut(swIn))}px)`);
      const el = clamp(t - T.sw0, 0, 2.0);
      const cs = Math.floor(el * 100 + 1e-6), str = `00:${String(Math.floor(cs / 100)).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
      for (let i = 0; i < 8; i++) ui.dig[i].textContent = str[i];
      const done = t >= T.sw1;
      ui.sw.style.background = done ? C.red : C.navy; ui.sw.style.borderColor = done ? '#fff' : C.navy3;
      ui.swHand.style.transform = `rotate(${el / 2 * 360 * 2}deg)`;
      if (done) { const d = seg(t, T.sw1, T.sw1 + 0.25); ui.sw.style.transform = `scale(${1 + 0.12 * Math.sin(Math.PI * d)})`; }
      // checklist stamps on the three verbs
      [T.sallam, T.qaad, T.shirib].forEach((tv, i) => {
        const k = seg(t, tv - 0.03, tv + 0.15);
        show(ui.checks[i], Math.min(1, k * 3) * (1 - swOut), `scale(${lerp(1.7, 1, ease.backOut(k))}) rotate(${lerp(-6, 0, k)}deg)`);
      });
      // tea tag on the big glass
      const tIn = seg(t, T.shirib, T.shirib + 0.25), tOut = seg(t, T.aleish, T.aleish + 0.2);
      if (tIn > 0 && tOut < 1) {
        const [gx, gy] = proj(0.82, 0.47, 0.68);
        const tw = ui.tea.offsetWidth || 260, th = ui.tea.offsetHeight || 60;
        const ty = gy - (V ? 260 : 200) - th;
        ui.tea.style.left = (gx - tw / 2) + 'px'; ui.tea.style.top = ty + 'px';
        ui.teaLine.style.left = (gx - 2) + 'px'; ui.teaLine.style.top = (ty + th) + 'px'; ui.teaLine.style.height = Math.max(0, gy - ty - th - 8) + 'px';
        const o = tIn * (1 - tOut);
        show(ui.tea, o, `scale(${lerp(0.6, 1, ease.backOut(tIn))})`); ui.tea.style.transformOrigin = '50% 100%';
        show(ui.teaLine, o, `scaleY(${ease.cubicOut(tIn)})`);
      } else { show(ui.tea, 0); show(ui.teaLine, 0); }
      // «شاغر» on the empty cheek
      const vIn = seg(t, T.tawah + 0.15, T.tawah + 0.45), vOut = seg(t, T.rise - 0.05, T.rise + 0.15);
      if (vIn > 0 && vOut < 1) {
        aleish.ring.updateMatrixWorld();
        const wp = new THREE.Vector3(); aleish.ring.getWorldPosition(wp);
        const [rx, ry] = proj(wp.x, wp.y, wp.z);
        const vw = ui.vac.offsetWidth || 180, vh = ui.vac.offsetHeight || 70;
        const lx = rx - (V ? 250 : 300), ly = ry - (V ? 60 : 40);
        ui.vac.style.left = (lx - vw / 2) + 'px'; ui.vac.style.top = (ly - vh / 2) + 'px';
        const dx = rx - 12 - lx, dy = ry - ly, len = Math.hypot(dx, dy);
        ui.vacLine.style.left = lx + 'px'; ui.vacLine.style.top = ly + 'px'; ui.vacLine.style.width = len + 'px';
        const o = vIn * (1 - vOut);
        show(ui.vacLine, o, `rotate(${Math.atan2(dy, dx)}rad) scaleX(${ease.cubicOut(vIn)})`);
        show(ui.vac, o, `scale(${lerp(1.6, 1, ease.backOut(vIn))}) rotate(-4deg)`);
      } else { show(ui.vac, 0); show(ui.vacLine, 0); }
      // results board drops in for the last 0.8 s
      const rb = seg(t, T.board, T.board + 0.35);
      show(ui.board, rb > 0 ? 1 : 0, `translateY(${lerp(-(V ? 700 : 560), 0, ease.backOut(rb))}px) rotate(${lerp(-3, 0, rb)}deg)`);
      const r2 = seg(t, T.board + 0.15, T.board + 0.4);
      ui.r2.style.opacity = r2; ui.r2.style.transform = `translateX(${lerp(60, 0, ease.cubicOut(r2))}px)`;
    },
  });
})();
