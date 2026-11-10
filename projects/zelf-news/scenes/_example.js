/* EXAMPLE scene (id 'EX'): shows the whole contract. 3D + DOM overlay, everything a pure function of t. */
'use strict';
(function () {
  const { C, F, W, H, seg, lerp, ease } = ZN;
  let scene, cam, box, card, word;
  ZN.scene({
    id: 'EX',
    init(ctx) {
      // 3D
      scene = new THREE.Scene(); scene.background = new THREE.Color(C.navy);
      cam = ZN.camera(35); cam.position.set(0, 1.2, 6); cam.lookAt(0, 0.8, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x223355, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 4); scene.add(key);
      box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.MeshStandardMaterial({ map: ZN.tex('p2_face'), roughness: .6 }));
      box.position.y = 0.9; scene.add(box);
      // DOM (design space = the stage: W×H px)
      card = ZN.el(ctx.ui, 'div', `position:absolute;right:120px;top:140px;background:${C.red};color:#fff;font:800 64px ${F.ui};padding:14px 34px;border-radius:10px`, 'عاجل');
      word = ZN.el(ctx.ui, 'div', `position:absolute;right:120px;top:270px;color:#fff;font:400 90px ${F.stamp}`, 'خبر عاجل يا جماعة');
      // sound events: names from the SFX vocabulary, times from the timeline
      ZN.ev('impact', ctx.t0 + 0.5, 0.9);
    },
    update(t, ctx) {
      const lt = t - ctx.t0;
      box.rotation.y = lt * 0.6;                                   // pure function of time
      const a = ease.outBack ? ease.outBack(seg(lt, 0.5, 0.9)) : seg(lt, 0.5, 0.9);
      card.style.transform = `scale(${a})`; card.style.transformOrigin = '100% 50%';
      const w = seg(t, ZN.wordT('l1', 1), ZN.wordT('l1', 1) + 0.3);   // lands on the spoken word «عاجل»
      word.style.opacity = w; word.style.transform = `translateY(${lerp(30, 0, ease.outCubic ? ease.outCubic(w) : w)}px)`;
      ZN.render3d(scene, cam);
    },
  });
})();
