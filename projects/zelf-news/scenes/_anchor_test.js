/* TEST scene (id 'AT', no cut in the timeline: run with ?only=AT). Pose reel for the anchor + studio, pure function of t.
 * 0-1 neutral medium · 1-2 talking · 2-3 stare close-up · 3-4 right eyebrow up · 4-6 slow head tilt 0→0.5 rad · 6-7 tie adjust · 7-8 wide
 * 8-9 shrug (medium) · 9-10 papers tap · 10-11.5 lean in · 12-13 turns to the screen · 13-14 looks down, eyes closed
 * 14-15 centred medium with a test card on the hero screen (setScreen) · 15-16 tight close-up */
'use strict';
(function () {
  const { C, seg, ease } = ZN;
  let scene, cam, studio, anchor, card;
  const io = ease.cubicInOut;
  ZN.scene({
    id: 'AT',
    init(ctx) {
      scene = new THREE.Scene(); scene.background = new THREE.Color(C.navy);
      studio = ZN.makeStudio(); scene.add(studio.group);
      anchor = ZN.makeAnchor(); scene.add(anchor.group);
      cam = ZN.camera(30);
      card = ZN.canvasTex(1024, 576, (g, w, h) => { g.fillStyle = C.paper; g.fillRect(0, 0, w, h); g.fillStyle = C.red; g.fillRect(0, 0, w, 90); g.fillStyle = C.ink; g.textAlign = 'center'; g.font = '800 120px Almarai'; g.fillText('اختبار الشاشة', w / 2, 330); g.font = '700 60px Almarai'; g.fillText('16:9  ←  setScreen(tex)', w / 2, 450); });
      ZN._at = { scene, studio, anchor, cam };        // handles for inspection from the console
    },
    update(t, ctx) {
      const S = ZN.anchorShots;
      // camera: medium → close (1.85–2.3) → medium (6.0–6.45) → wide (7.0–7.5) → medium (8.0–8.4); a slow push-in keeps every hold alive
      const push = [0, 0, -0.06 * seg(t, 0, 12)];
      if (t < 1.85) ZN.anchorCam(cam, S.medium, S.medium, 0, push);
      else if (t < 6.0) ZN.anchorCam(cam, S.medium, S.close, io(seg(t, 1.85, 2.3)), [0, 0, -0.05 * seg(t, 2.3, 6.0)]);
      else if (t < 7.0) ZN.anchorCam(cam, S.close, S.medium, io(seg(t, 6.0, 6.45)), push);
      else if (t < 8.0) ZN.anchorCam(cam, S.medium, S.wide, io(seg(t, 7.0, 7.5)), push);
      else if (t < 14.0) ZN.anchorCam(cam, S.wide, S.medium, io(seg(t, 8.0, 8.45)), push);
      else if (t < 15.0) ZN.anchorCam(cam, S.medium, S.mediumC, io(seg(t, 14.0, 14.4)));
      else ZN.anchorCam(cam, S.mediumC, S.tight, io(seg(t, 15.0, 15.4)));
      studio.setScreen(t >= 13.9 && t < 15 ? card : null);

      const stare = io(seg(t, 2.0, 2.35)) * (1 - io(seg(t, 6.0, 6.3)));
      const brow = io(seg(t, 3.0, 3.25)) * (1 - io(seg(t, 3.85, 4.0)));
      const talking = seg(t, 1.0, 1.08) * (1 - seg(t, 1.92, 2.0));
      anchor.pose({
        t,
        talk: talking * (0.25 + 0.75 * Math.abs(Math.sin(t * 9.5))),
        blink: Math.max(stare > 0.2 || t > 14 ? 0 : ZN.anchorBlink(t), io(seg(t, 13.3, 13.5)) * (1 - seg(t, 13.9, 14.0))),
        squint: Math.max(stare * (0.85 - 0.25 * brow), io(seg(t, 15.0, 15.4))),
        browR: brow - 0.55 * stare * (1 - brow),
        browL: -0.55 * stare,
        tilt: 0.5 * io(seg(t, 4.0, 5.85)) * (1 - io(seg(t, 6.0, 6.35))),
        tie: io(seg(t, 6.05, 6.45)) * (1 - io(seg(t, 6.9, 7.2))),
        shrug: io(seg(t, 8.4, 8.7)) * (1 - io(seg(t, 9.0, 9.2))),
        paper: io(seg(t, 9.2, 9.6)) * (1 - io(seg(t, 10.0, 10.3))),
        lean: io(seg(t, 10.3, 10.8)) * (1 - io(seg(t, 11.3, 11.7))),
        yaw: -0.5 * io(seg(t, 12.0, 12.4)) * (1 - io(seg(t, 12.9, 13.2))),
        pupilX: -0.6 * io(seg(t, 11.9, 12.2)) * (1 - io(seg(t, 12.9, 13.1))),
        pitch: 0.3 * io(seg(t, 13.2, 13.5)) * (1 - seg(t, 13.9, 14.0)),
      });
      ZN.render3d(scene, cam, ZN.anchorExposure);        // 1.0 in 16:9, a little hotter in 9:16 where hair + suit fill the frame
    },
  });
})();
