/* TEST scene 'ZT' — Zelf turntable pose reel (only runs with ?only=ZT). Two Zelfs, same pose: navy studio vs warm majlis.
 * Segments of 2.5 s: idle · walk · hop · wave+raise · talk+tie · sip+tilt. */
'use strict';
(function () {
  const { C, F, seg, lerp } = ZN;
  const V = ZN.VERT;
  let scene, cam, zs = [], label;
  const SEGS = ['idle', 'walk', 'hop', 'wave + raise', 'talk + tie', 'sip + tiltZ', 'sandals off + sit'];
  ZN.scene({
    id: 'ZT',
    init(ctx) {
      scene = new THREE.Scene(); scene.background = new THREE.Color('#202838');
      scene.add(new THREE.HemisphereLight(0xfff4e6, 0x3a3040, 1.2));
      const key = new THREE.DirectionalLight(0xfff0dc, 2.4); key.position.set(-1.5, 2.5, 3); scene.add(key);
      const fill = new THREE.DirectionalLight(0xcfe0ff, 0.7); fill.position.set(2, 1, 2); scene.add(fill);
      const BW = V ? 0.46 : 0.9;
      const mk = (col, x, y) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(BW, 1.2), new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 })); b.position.set(x, y, -0.3); scene.add(b);
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(BW, 0.7), new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.position.set(x, y - 0.2, 0.05); scene.add(fl); };
      const P = V ? [[-0.235, 0.2], [0.235, 0.2]] : [[-0.46, 0.2], [0.46, 0.2]];
      mk(C.navy2, P[0][0], P[0][1] + 0.3); mk('#c9a77c', P[1][0], P[1][1] + 0.3);
      for (const [x, y] of P) { const z = ZN.makeZelf({ seed: 7 }); z.group.position.set(x, y - 0.2, 0); scene.add(z.group); zs.push(z); }
      cam = ZN.camera(V ? 34 : 30); cam.position.set(0, 0.3, V ? 3.0 : 1.9); cam.lookAt(0, 0.17, 0);
      label = ZN.el(ctx.ui, 'div', `position:absolute;left:60px;top:50px;direction:ltr;background:${C.navy};color:#fff;font:700 40px ${F.ui};padding:10px 26px;border-radius:10px`);
    },
    update(t) {
      const L = 2.5, k = Math.floor(t / L) % SEGS.length, u = (t % L) / L, lt = t % L;
      label.textContent = 'ZT · ' + SEGS[k];
      const p = { t, yaw: Math.sin(t * 0.9) * 0.9 };
      if (k === 1) p.walk = 1;
      if (k === 2) { p.hop = (lt * 1.6) % 1; p.squash = 0; }
      if (k === 3) { p.wave = Math.min(1, lt * 3); p.raise = Math.min(1, Math.max(0, lt - 0.8) * 3); }
      if (k === 4) { p.talk = ZN.clamp(0.5 + 0.5 * Math.sin(t * 17)); p.tie = 1; }
      if (k === 5) { p.sip = Math.min(1, lt * 2.5); p.tiltZ = Math.sin(t * 2) * 0.25; }
      if (k === 6) { p.sandals = 0; p.sit = Math.min(1, lt * 2); }
      for (const z of zs) z.pose(p);
      ZN.render3d(scene, cam);
    },
  });
})();
