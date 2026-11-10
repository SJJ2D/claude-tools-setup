/* S1 — STUDIO OPEN. Wide establishing → push to medium under the sting; l1 «خبر عاجل يا جماعة…» (tie bounce on «عاجل»,
 * lean on «يا جماعة»); then dead silence: over-serious stare, slow blink, right eyebrow far too high, painfully slow head tilt
 * while the camera creeps into the close-up; hard cut at max tilt. All cues from the timeline. */
'use strict';
(function () {
  const { seg, lerp, ease } = ZN;
  const io = ease.cubicInOut, so = ease.smooth || (x => x * x * (3 - 2 * x));
  let scene, cam, studio, anchor, tieG = null;
  // end framing of the creep: the close-up, a touch looser and lower so the tilted head keeps its hair and clears the lower third
  const END = ZN.VERT ? { p: [-0.17, 1.84, 4.1], t: [-0.21, 1.64, 0], fov: 22 } : { p: [-0.05, 1.62, 2.8], t: [-0.06, 1.585, 0], fov: 21 };

  ZN.scene({
    id: 'S1',
    init(ctx) {
      scene = new THREE.Scene(); scene.background = new THREE.Color(ZN.C.navy);
      studio = ZN.makeStudio(); scene.add(studio.group);
      anchor = ZN.makeAnchor(); scene.add(anchor.group);
      cam = ZN.camera(30);
      // the tie pivot (Group at the knot, chest-local 0,0.655,0.116) is not exported: find it for the «عاجل» bounce
      anchor.group.traverse(o => { if (!tieG && o.isGroup && Math.abs(o.position.y - 0.655) < 1e-3 && Math.abs(o.position.z - 0.116) < 1e-3) tieG = o; });
      const tE = ZN.LE('l1');
      ZN.ev('riser', tE + 1.5, 0.7);
    },
    update(t, ctx) {
      const S = ZN.anchorShots, V = ZN.VERT;
      const tL = ZN.L('l1'), tE = ZN.LE('l1'), tA = ZN.wordAt('l1', 'عاجل'), tJ = ZN.wordAt('l1', 'جماعة', ZN.wordAt('l1', 'يا'));
      const cutT = ctx.t1, tStare = tE + 0.05, tBlink = tE + 0.5, tBrow = tE + 1.0, tTilt = tE + 1.5, tPeak = cutT - 0.06;

      // ── camera: wide → medium during the sting; slow drift; silence: medium → mediumC → close (creeping) ──
      if (t < tE + 0.2) ZN.anchorCam(cam, S.wide, S.medium, io(seg(t, ctx.t0 + 0.9, tJ + 0.15)), [0, 0, -0.05 * seg(t, tJ, tE + 0.2)]);
      else if (t < tTilt) ZN.anchorCam(cam, S.medium, S.mediumC, io(seg(t, tE + 0.2, tTilt)), [0, 0, -0.05 * (1 - seg(t, tE + 0.2, tTilt))]);
      else ZN.anchorCam(cam, S.mediumC, END, so(seg(t, tTilt, cutT)));

      // ── performance ──
      const talk = (t > tL - 0.05 && t < tE + 0.1) ? ZN.mouth(t) : 0;
      const lean = 0.32 * io(seg(t, tJ - 0.15, tJ + 0.3)) * (1 - io(seg(t, tE + 0.05, tE + 0.6)));
      const stare = io(seg(t, tStare, tStare + 0.35));
      const slowBlink = Math.sin(Math.PI * seg(t, tBlink, tBlink + 0.55));
      const brow = ease.backOut ? ease.backOut(seg(t, tBrow, tBrow + 0.6)) : io(seg(t, tBrow, tBrow + 0.6));
      const tilt = 0.5 * so(seg(t, tTilt, tPeak));
      anchor.pose({
        t,
        talk,
        lean,
        blink: t < tStare ? ZN.anchorBlink(t) : slowBlink,
        squint: stare * (0.85 - 0.3 * seg(t, tBrow, tBrow + 0.6)),
        browR: lerp(-0.5 * stare, 1.6, brow),
        browL: -0.55 * stare,
        tilt,
        pupilX: 0, pupilY: 0,
      });
      // one small tie bounce on «عاجل» (damped spring on the knot pivot), added after pose() set its base rotation
      if (tieG) { const u = t - tA; if (u > 0 && u < 1.2) { const b = Math.exp(-4.5 * u) * Math.sin(u * 17); tieG.rotation.x += -0.16 * b; tieG.position.y = 0.655 + 0.012 * b; } else tieG.position.y = 0.655; }

      ZN.render3d(scene, cam, ZN.anchorExposure);
    },
  });
})();
