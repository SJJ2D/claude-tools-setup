/* ZLF News — THE ZELF (library, registers no scene). A small fuzzy curly sideburn with dot eyes, thin legs, tiny sandals.
 *
 * UNITS: metres, Y up. Origin = the floor between its feet; it faces +Z. Total height ≈ 0.35 (top curl ≈ 0.355).
 *   const z = ZN.makeZelf({ tie:false, rim:'#b98a5e', seed:7 });  scene.add(z.group);
 *   update(t): z.group.position.set(x, y, zpos);  z.pose({ t, walk:1, talk:ZN.mouth(t), ... });
 *
 * pose(p) — stateless, every field optional (neutral = 0 / defaults):
 *   t        seconds   idle breathing, curl bob, automatic blinks, walk/wave rhythm
 *   walk     0..1      trot amount (legs swing, body bobs and waddles). Leg phase = t*13 rad unless p.phase is given
 *   phase    rad       optional explicit leg phase (to lock steps to ground travel)
 *   hop      0..1      progress of one hop: body lifts sin(pi*hop)*hopH (hopH default 0.10), stretches, legs tuck
 *   hopH     m         hop height (default 0.10)
 *   wave     0..1      its right arm (picture left) goes up and waves
 *   raise    0..1      its left arm (picture right) goes up, palm out, still ("calm down")
 *   talk     0..1      mouth opens
 *   yaw      rad       turn about Y (+ = turns toward picture right when facing camera)
 *   squash   -1..1     + squashes (landing), - stretches
 *   tie      0/1       tiny red tie (default opts.tie)
 *   sandals  0/1       tiny sandals on its feet (default 1). 0 = barefoot (use ZN.makeZelfSandals() for parked ones)
 *   sip      0..1      leans forward, both arms forward, eyes squeezed happy (scene supplies the glass)
 *   tiltZ    rad       body lean sideways (+ = leans to picture left)
 *   sit      0..1      legs fold forward (sitting on a cushion); origin stays at the seat surface
 *   look     [x,y]     pupil offset -1..1 (+x picture right, +y up)
 *   blink    0..1      override the automatic blink
 * Returns { group, pose, body, eyeY: 0.29, mouthY: 0.215, height: 0.355 }.
 * ZN.makeZelfSandals() → THREE.Group: a parked pair of its tiny sandals (origin on the floor, toes toward +Z).
 */
'use strict';
(function () {
  const { clamp, lerp } = OM;

  // merge many primitive geometries (with per-part colour) into one non-indexed BufferGeometry
  function merge(parts) {
    const pos = [], nor = [], col = [];
    const c = new THREE.Color();
    for (const p of parts) {
      const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone();
      g.applyMatrix4(p.m);
      const a = g.attributes.position.array, n = g.attributes.normal.array;
      c.set(p.color);
      for (let i = 0; i < a.length; i += 3) { pos.push(a[i], a[i + 1], a[i + 2]); nor.push(n[i], n[i + 1], n[i + 2]); col.push(c.r, c.g, c.b); }
      g.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return out;
  }
  const M = (x, y, z, sx, sy, sz, rx, ry, rz) => {
    const m = new THREE.Matrix4();
    m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx, sy == null ? sx : sy, sz == null ? sx : sz));
    return m;
  };

  function sandalGeo() {
    const sole = new THREE.BoxGeometry(0.034, 0.007, 0.056), strap = new THREE.BoxGeometry(0.036, 0.012, 0.012), toe = new THREE.TorusGeometry(0.006, 0.0025, 4, 8);
    return merge([
      { geo: sole, m: M(0, 0.0035, 0.006, 1), color: '#d9a663' },
      { geo: strap, m: M(0, 0.011, 0.012, 1), color: '#7a3b1c' },
      { geo: toe, m: M(0, 0.01, 0.026, 1, 1, 1, Math.PI / 2), color: '#7a3b1c' },
    ]);
  }
  let SANDAL = null;
  const sandalMat = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 });
  ZN.makeZelfSandals = () => {
    SANDAL = SANDAL || sandalGeo();
    const g = new THREE.Group(), mat = sandalMat();
    const a = new THREE.Mesh(SANDAL, mat), b = new THREE.Mesh(SANDAL, mat);
    a.position.set(-0.024, 0, 0); a.rotation.y = 0.12; b.position.set(0.026, 0, 0.004); b.rotation.y = -0.1;
    g.add(a, b); return g;
  };

  ZN.makeZelf = function (opts) {
    opts = opts || {};
    const rnd = ZN.rng(opts.seed || 7);
    const browns = ['#2a1a10', '#3b2415', '#4a2d1a', '#33200f', '#5a3820', '#22150c'];
    const rimCol = opts.rim || '#b98a5e';
    const group = new THREE.Group();          // scene positions this
    const yawN = new THREE.Group(); group.add(yawN);
    const body = new THREE.Group(); yawN.add(body);   // pivot at the hips (y = HIP)
    const HIP = 0.085;
    body.position.y = HIP;

    // ── the tuft: a curly sideburn column, taller than wide, with a comma curl at the bottom ──
    // centre line (relative to hips): from y=0 up to y=0.25, leaning a little and hooking at the foot
    const cx = s => 0.012 * Math.sin(s * 2.4 + 0.4) - 0.01;     // slight S
    const wid = s => (0.03 + 0.042 * OM.sstep(0, 0.75, s)) * (s > 0.88 ? lerp(1, 0.78, (s - 0.88) / 0.12) : 1);   // narrow foot, wide top (a sideburn, not a cone)
    const blobs = [], outl = [];
    const sph = new THREE.SphereGeometry(1, 10, 8), tor = new THREE.TorusGeometry(1, 0.34, 5, 12);
    // core filler
    for (let i = 0; i < 9; i++) {
      const s = i / 8, y = 0.02 + s * 0.22, r = wid(s) * 0.95;
      blobs.push({ geo: sph, m: M(cx(s), y, 0, r, r * 0.9, r * 0.78), color: browns[i % 3] });
      outl.push({ geo: sph, m: M(cx(s), y, -0.004, r + 0.008, r * 0.9 + 0.008, r * 0.78 + 0.006) });
    }
    // surface lumps
    for (let i = 0; i < 64; i++) {
      const s = rnd(), a = rnd() * Math.PI * 2, y = 0.02 + s * 0.23, w = wid(s);
      const r = (0.017 + rnd() * 0.017) * (0.75 + 0.5 * w / 0.072);
      const x = cx(s) + Math.cos(a) * w * 0.72, z = Math.sin(a) * w * 0.55;
      blobs.push({ geo: sph, m: M(x, y, z, r), color: browns[Math.floor(rnd() * browns.length)] });
      if (Math.abs(Math.sin(a)) < 0.75 || y > 0.2) outl.push({ geo: sph, m: M(x, y, z - 0.003, r + 0.007) });
    }
    // top tuft curls (a little crown)
    for (let i = 0; i < 7; i++) {   // flat-ish curly top edge (where a sideburn meets the hair)
      const a = (i / 7) * Math.PI * 2 + 0.3, r = 0.02 + 0.005 * (i % 2);
      const x = cx(1) + Math.cos(a) * 0.05, z = Math.sin(a) * 0.03;
      blobs.push({ geo: sph, m: M(x, 0.25 + 0.005 * (i % 3), z, r), color: browns[(i + 2) % browns.length] });
      outl.push({ geo: sph, m: M(x, 0.25 + 0.005 * (i % 3), z - 0.003, r + 0.007) });
    }
    // comma hook at the foot (curls out to picture right, then up)
    const hook = [[0.03, -0.012, 0.02], [0.058, -0.008, 0.017], [0.075, 0.01, 0.015], [0.072, 0.03, 0.012]];
    for (const [x, y, r] of hook) { blobs.push({ geo: sph, m: M(x, y, 0.005, r), color: browns[1] }); outl.push({ geo: sph, m: M(x, y, 0.002, r + 0.007) }); }
    // ring curls on the surface (the curly texture), oriented along the surface normal
    for (let i = 0; i < 44; i++) {
      const s = 0.05 + rnd() * 0.9, a = rnd() * Math.PI * 2, y = 0.02 + s * 0.23, w = wid(s);
      const x = cx(s) + Math.cos(a) * w * 0.98, z = Math.sin(a) * w * 0.8;
      if (z > 0.02 && y > 0.12 && y < 0.24 && Math.abs(x - cx(s)) < 0.05) continue;   // keep the face clear
      const r = 0.011 + rnd() * 0.008;
      blobs.push({ geo: tor, m: M(x, y, z, r, r, r, rnd() * 1.2 - 0.6, a + Math.PI / 2, rnd() * 3), color: ['#8a5a34', '#6e4426', '#9a6a3e'][i % 3] });
    }
    const tuftMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
    const tuft = new THREE.Mesh(merge(blobs), tuftMat);
    const outlineGeo = merge(outl.map(o => ({ geo: o.geo, m: o.m, color: rimCol })));
    const outline = new THREE.Mesh(outlineGeo, new THREE.MeshBasicMaterial({ color: rimCol, side: THREE.BackSide }));
    body.add(tuft, outline);

    // ── face ──
    const FACEZ = 0.066, EYEY = 0.205;   // relative to hips
    const face = new THREE.Group(); face.position.set(cx(0.8), 0, FACEZ); body.add(face);
    const white = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.35, emissive: '#ffffff', emissiveIntensity: 0.25 });
    const black = new THREE.MeshStandardMaterial({ color: '#0b0b10', roughness: 0.25 });
    const eyes = [], pupils = [];
    for (const sx of [-1, 1]) {
      const e = new THREE.Group(); e.position.set(sx * 0.031, EYEY, 0);
      const w = new THREE.Mesh(new THREE.SphereGeometry(0.029, 16, 12), white); w.scale.set(1, 1.12, 0.55);
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.0135, 12, 10), black); p.position.set(0, -0.002, 0.014); p.scale.set(1, 1.1, 0.6);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 6), white); glint.position.set(0.005, 0.006, 0.006); p.add(glint);
      e.add(w, p); face.add(e); eyes.push(e); pupils.push(p);
    }
    // mouth: dark oval with a red tongue
    const mouth = new THREE.Group(); mouth.position.set(0, 0.135, 0.004); face.add(mouth);
    const mo = new THREE.Mesh(new THREE.SphereGeometry(0.018, 14, 10), new THREE.MeshStandardMaterial({ color: '#1a0606', roughness: 0.6 }));
    mo.scale.set(1.2, 1, 0.35);
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.01, 10, 8), new THREE.MeshStandardMaterial({ color: '#d2424a', roughness: 0.6 }));
    tongue.position.set(0, -0.007, 0.004); tongue.scale.set(1.3, 0.6, 0.5);
    mouth.add(mo, tongue);
    // smile line (closed mouth) — a thin warm arc
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0028, 5, 14, Math.PI), new THREE.MeshStandardMaterial({ color: '#e7b48a', roughness: 0.6 }));
    smile.rotation.z = Math.PI; smile.position.set(0, 0.142, 0.006); face.add(smile);

    // ── tie ──
    const tie = new THREE.Group(); tie.position.set(0, 0.1, 0.012); face.add(tie);
    const red = new THREE.MeshStandardMaterial({ color: ZN.C.red, roughness: 0.5 });
    const knot = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.012, 0.008), red);
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.05, 4), red); blade.rotation.set(Math.PI, Math.PI / 4, 0); blade.scale.set(1, 1, 0.45); blade.position.y = -0.03;
    tie.add(knot, blade);

    // ── arms ──
    const limbMat = new THREE.MeshStandardMaterial({ color: '#8a5a3a', roughness: 0.7 });
    const handMat = new THREE.MeshStandardMaterial({ color: '#c99a6b', roughness: 0.6 });
    const arms = [];
    for (const sx of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(cx(0.6) + sx * 0.07, 0.155, 0.01);
      const a = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.07, 6), limbMat); a.position.y = -0.035;
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), handMat); h.position.y = -0.072;
      sh.add(a, h); body.add(sh); arms.push(sh);
    }
    // ── legs + sandals ──
    const legs = [], feetSandals = [];
    SANDAL = SANDAL || sandalGeo();
    const sm = sandalMat();
    for (const sx of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(sx * 0.026, HIP + 0.004, 0.0); yawN.add(hip);
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0062, HIP, 6), limbMat); l.position.y = -HIP / 2;
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.0105, 8, 6), handMat); f.position.set(0, -HIP + 0.006, 0.008); f.scale.set(1, 0.6, 1.5);
      const s = new THREE.Mesh(SANDAL, sm); s.position.set(0, -HIP - 0.004, 0.002);
      hip.add(l, f, s); legs.push(hip); feetSandals.push(s);
    }

    function pose(p) {
      p = p || {};
      const t = p.t || 0, walk = p.walk || 0, hop = p.hop || 0, wave = p.wave || 0, raise = p.raise || 0,
        talk = p.talk || 0, sip = p.sip || 0, sit = p.sit || 0;
      const ph = p.phase != null ? p.phase : t * 13;
      const hopH = p.hopH != null ? p.hopH : 0.1;
      yawN.rotation.y = p.yaw || 0;
      // body
      const breathe = Math.sin(t * 2.6) * 0.012;
      const lift = Math.sin(Math.PI * clamp(hop)) * hopH;
      const bob = Math.abs(Math.sin(ph)) * 0.014 * walk;
      let sq = (p.squash || 0) - Math.sin(Math.PI * clamp(hop)) * 0.12;
      body.position.y = HIP + lift + bob - sit * 0.06;
      body.scale.set(1 + sq * 0.5 - breathe * 0.4, 1 - sq + breathe, 1 + sq * 0.5 - breathe * 0.4);
      body.rotation.z = (p.tiltZ || 0) + Math.sin(ph) * 0.07 * walk + Math.sin(t * 1.3) * 0.015;
      body.rotation.x = sip * 0.28 + walk * 0.06 - hop * 0.0;
      // legs
      for (let i = 0; i < 2; i++) {
        const sgn = i ? 1 : -1;
        const swing = Math.sin(ph + (i ? Math.PI : 0)) * 0.65 * walk;
        const tuck = Math.sin(Math.PI * clamp(hop)) * 0.7;
        legs[i].position.y = HIP + 0.004 + lift + bob - sit * 0.06;
        legs[i].rotation.x = -swing - tuck * 0.6 - sit * 1.45;
        legs[i].rotation.z = sgn * (0.06 + tuck * 0.25);
        feetSandals[i].visible = p.sandals !== 0 && p.sandals !== false;
      }
      // arms: rest = slightly out, swinging with walk
      for (let i = 0; i < 2; i++) {
        const sgn = i ? 1 : -1;     // i=0: its right arm (picture left)
        let rz = sgn * 0.35 + Math.sin(t * 2.6 + i) * 0.04, rx = Math.sin(ph + (i ? 0 : Math.PI)) * 0.5 * walk;
        rz += sgn * Math.sin(Math.PI * clamp(hop)) * 0.9;     // flap up on hops
        if (i === 0 && wave > 0) { rz = lerp(rz, -2.5 + Math.sin(t * 15) * 0.42, wave); rx = lerp(rx, 0, wave); }
        if (i === 1 && raise > 0) { rz = lerp(rz, 2.35, raise); rx = lerp(rx, -0.25, raise); }
        if (sip > 0) { rx = lerp(rx, -1.35, sip); rz = lerp(rz, sgn * 0.12, sip); }
        arms[i].rotation.set(rx, 0, rz);
      }
      // face
      const autoBlink = (() => { const u = (t + 0.7) % 3.3; return u < 0.13 ? Math.sin(u / 0.13 * Math.PI) : 0; })();
      const bl = Math.max(p.blink != null ? p.blink : autoBlink, sip * 0.85);
      const lk = p.look || [0, 0];
      for (let i = 0; i < 2; i++) {
        eyes[i].scale.y = Math.max(0.08, 1 - bl);
        pupils[i].position.x = clamp(lk[0], -1, 1) * 0.009;
        pupils[i].position.y = -0.002 + clamp(lk[1], -1, 1) * 0.009;
      }
      const m = clamp(talk);
      mouth.visible = m > 0.04; smile.visible = !mouth.visible;
      mouth.scale.set(1 - m * 0.15, 0.25 + m * 1.05, 1);
      tie.visible = p.tie != null ? !!p.tie : !!opts.tie;
      tie.rotation.z = Math.sin(t * 9) * 0.12 * walk;
    }
    pose({ t: 0 });
    return { group, pose, body, eyeY: HIP + EYEY, mouthY: HIP + 0.135, height: 0.355 };
  };
})();
