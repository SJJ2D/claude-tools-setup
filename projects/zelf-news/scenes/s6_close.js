/* S6 — SIGN-OFF. Tie adjust ('slide') → l14 with the slip on «زلف» (freeze, eyes slide sideways, eyebrow twitch, carry on)
 * → the Zelf (tiny red tie) pops up on the desk ('pop') and says l15 first, waving; stopwatch card ticks 0.00→2.00 from
 * l15 start to l16 end, then the +2.00 stamp ('stamp'); the anchor's eyes slide to the Zelf; l16 flat to the lens;
 * tail: slow head tilt + 'riser', eyebrow floats up, the Zelf tilts its body in sync. All cues from the timeline. */
'use strict';
(function () {
  const { C, F, W, H, seg, lerp, clamp, ease } = ZN;
  const io = ease.cubicInOut, so = ease.smooth || (x => x * x * (3 - 2 * x)), bo = ease.backOut, co = ease.cubicOut;
  const V = ZN.VERT;
  let scene, cam, studio, anchor, zelf, zelfReal = false, card, digits, stamp, bubble;
  const ZS = 1.15;                                         // the Zelf a touch bigger than life so it reads on the desk
  const ZX = V ? 0.36 : 0.56, ZZ = 0.33;                   // its spot on the desk (picture right of the anchor)
  // framings: A = anchor chest-up for the tie + l14; B = the two-shot with the desk lifted clear of the lower-third band
  const A = V ? { p: [0, 1.80, 4.6], t: [0, 1.70, 0], fov: 26 } : { p: [0, 1.50, 3.25], t: [0, 1.46, 0], fov: 26 };
  const B = V ? { p: [0.06, 1.43, 3.45], t: [0.06, 1.29, 0], fov: 33 } : { p: [0.2, 1.38, 3.3], t: [0.2, 1.27, 0], fov: 31 };
  const P = new THREE.Vector3();

  function placeholderZelf() {                             // dark fuzzy sphere cluster (only if zelf.js is missing)
    const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: '#2a1d16', roughness: 0.9 }), r = ZN.rng(5);
    for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.05 + 0.03 * r(), 12, 10), m); s.position.set((r() - 0.5) * 0.14, 0.07 + r() * 0.24, (r() - 0.5) * 0.08); g.add(s); }
    return { group: g, pose(p) { g.rotation.z = p.tiltZ || 0; g.scale.y = 1 - 0.2 * (p.squash || 0); } };
  }

  ZN.scene({
    id: 'S6',
    init(ctx) {
      scene = new THREE.Scene(); scene.background = new THREE.Color(C.navy);
      studio = ZN.makeStudio(); scene.add(studio.group);
      anchor = ZN.makeAnchor(); scene.add(anchor.group);
      zelfReal = typeof ZN.makeZelf === 'function';
      zelf = zelfReal ? ZN.makeZelf({ tie: true, seed: 7 }) : placeholderZelf();
      zelf.group.scale.setScalar(ZS); scene.add(zelf.group);
      cam = ZN.camera(30);

      // stopwatch card (DOM, opaque): label + ticking digits; +2.00 stamp lands on it after l16
      const cw = V ? 440 : 470;
      card = ZN.el(ctx.ui, 'div', `position:absolute;left:${V ? 60 : 70}px;top:${V ? 70 : 70}px;width:${cw}px;box-sizing:border-box;background:${C.navy};border:4px solid ${C.red};border-radius:18px;padding:16px 24px 12px;box-shadow:0 14px 30px rgba(0,0,0,.45);direction:rtl;transform-origin:20% 0%`);
      const head = ZN.el(card, 'div', `display:flex;align-items:center;gap:14px;color:#fff;font:800 38px/1.2 ${F.ui}`);
      const ic = ZN.el(head, 'div', `position:relative;width:44px;height:44px;border-radius:50%;border:5px solid ${C.gold};box-sizing:border-box;flex:none`);
      ZN.el(ic, 'div', `position:absolute;left:50%;top:-12px;width:10px;height:8px;margin-left:-5px;background:${C.gold};border-radius:2px`);
      card._hand = ZN.el(ic, 'div', `position:absolute;left:50%;top:50%;width:4px;height:15px;margin-left:-2px;margin-top:-15px;background:${C.gold};transform-origin:50% 100%`);
      ZN.el(head, 'div', '', null).textContent = ZN.S('txt.S6.late');
      digits = ZN.el(card, 'div', `direction:ltr;text-align:center;color:${C.gold};font:800 ${V ? 92 : 100}px/1.05 ${F.ui};font-variant-numeric:tabular-nums;margin-top:4px`, '0.00');
      stamp = ZN.el(ctx.ui, 'div', `position:absolute;left:${(V ? 60 : 70) + cw / 2 - 170}px;top:${V ? 150 : 150}px;width:340px;text-align:center;box-sizing:border-box;background:${C.red};color:#fff;border:5px solid #fff;border-radius:14px;font:400 ${V ? 74 : 80}px/1.25 ${F.stamp};padding:2px 10px 0;box-shadow:0 10px 24px rgba(0,0,0,.45);direction:rtl;white-space:nowrap`);
      stamp.textContent = ZN.S('txt.S6.plus2');
      // the Zelf's speech bubble (opaque), follows its head on screen
      bubble = ZN.el(ctx.ui, 'div', `position:absolute;left:0;top:0;background:${C.white};color:${C.ink};font:800 ${V ? 50 : 46}px/1.2 ${F.ui};padding:12px 26px;border-radius:30px;border:4px solid ${C.ink};white-space:nowrap;direction:rtl;transform-origin:50% 100%`);
      bubble.textContent = ZN.S('txt.S6.zelfSays');
      bubble._tail = ZN.el(bubble, 'div', `position:absolute;left:50%;bottom:-22px;width:0;height:0;margin-left:-16px;border-left:16px solid transparent;border-right:16px solid transparent;border-top:22px solid ${C.ink}`);

      // sound
      const t0 = ctx.t0;
      ZN.ev('slide', t0 + 0.5, 0.8);                          // tie squeak, hand at the knot
      ZN.ev('pop', ZN.L('l15') - 0.3, 0.9);                  // the Zelf pops up
      ZN.ev('stamp', ZN.LE('l16') + 0.08, 0.9);
      ZN.ev('riser', ZN.LE('l16') + 0.2, 0.7);
    },
    update(t, ctx) {
      const t0 = ctx.t0, t1 = ctx.t1;
      const a14 = ZN.L('l14'), e14 = ZN.LE('l14'), a15 = ZN.L('l15'), e15 = ZN.LE('l15'), a16 = ZN.L('l16'), e16 = ZN.LE('l16');
      const tz = ZN.wordAt('l14', 'زلف'), tq = ZN.wordAt('l14', 'قصدي');
      const fs = tz + 0.25, fe = Math.max(fs + 0.22, tq - 0.04);  // the freeze after «زلف»
      const tPop = a15 - 0.3, tTail = e16 + 0.2, tEnd = t1 - 0.9; // newsui owns the last 0.9 s (slate)

      // ── camera ──
      const kAB = io(seg(t, e14 - 0.05, e14 + 0.3));
      if (t < e14 - 0.05) ZN.anchorCam(cam, A, A, 0, [0, 0, -0.10 * seg(t, t0, e14)]);
      else if (t < tTail) ZN.anchorCam(cam, A, B, kAB, [0, 0, -0.10 * (1 - kAB) - 0.06 * seg(t, e14 + 0.3, tTail)]);
      else { const k = so(seg(t, tTail, tEnd)); ZN.anchorCam(cam, B, B, 0, [-0.03 * k, -0.03 * k, -0.06 - (V ? 0.12 : 0.22) * k]); }

      // ── anchor ──
      const sp = ZN.speaking(t);
      const talk = (sp === 'l14' || sp === 'l16') ? ZN.mouth(t) * (sp === 'l16' ? 0.7 : 1) : 0;
      const tie = io(seg(t, t0 + 0.12, t0 + 0.5)) * (1 - io(seg(t, a14 - 0.45, a14 - 0.12)));
      // freeze: the idle clock stops during the slip
      const tp = t - clamp(t - fs, 0, fe - fs);
      const slip = co(seg(t, fs, fs + 0.12)) * (1 - seg(t, fe, fe + 0.08));
      const tw = (fe - fs), twu = seg(t, fs + 0.35 * tw, fs + 0.85 * tw);
      const twitch = Math.sin(twu * Math.PI * 2) > 0 ? Math.sin(twu * Math.PI * 2) : 0;
      const look = io(seg(t, a15 + 0.08, a15 + 0.35)) * (1 - io(seg(t, a16 - 0.3, a16 - 0.05)));
      const flat = io(seg(t, a16 - 0.2, a16 + 0.1));
      const tilt = 0.5 * so(seg(t, tTail, tEnd));
      const brow = io(seg(t, tTail + 0.3, tEnd));
      anchor.pose({
        t: tp, talk, tie,
        blink: (slip > 0.05 || t > tTail) ? 0 : ZN.anchorBlink(t),
        pupilX: -0.75 * slip + 0.78 * look,
        pupilY: -0.1 * slip - 0.45 * look,
        browL: 0.75 * twitch - 0.25 * look,
        browR: 0.15 * look + 1.3 * brow,
        squint: 0.35 * flat * (1 - 0.4 * brow) + 0.15 * look,
        tilt,
      });

      // ── the Zelf ──
      const up = seg(t, tPop, tPop + 0.32);
      zelf.group.visible = t >= tPop;
      const y = studio.deskY !== undefined ? studio.deskY : 0.80;
      const yy = up < 1 ? lerp(y - 0.42, y, bo(up)) : y;
      zelf.group.position.set(ZX, yy, ZZ);
      const lu = t - (tPop + 0.32), land = lu > 0 && lu < 0.6 ? Math.exp(-7 * lu) * Math.cos(lu * 22) : 0;
      const ztalk = sp === 'l15' ? ZN.mouth(t) : 0;
      const wave = io(seg(t, a15 - 0.15, a15 + 0.1)) * (1 - io(seg(t, e15 + 0.5, e15 + 0.8)));
      const zlook = io(seg(t, a16 - 0.2, a16 + 0.1)) * (1 - io(seg(t, tTail, tTail + 0.3)));
      zelf.pose({
        t, talk: ztalk, wave, tie: 1,
        squash: up < 1 ? -0.35 * Math.sin(Math.PI * up) : 0.45 * land,
        yaw: -0.35 * zlook,
        look: [-0.9 * zlook, 0.5 * zlook],
        tiltZ: 0.42 * so(seg(t, tTail + 0.05, tEnd)),
      });

      // ── stopwatch card + stamp ──
      const cin = seg(t, a15 - 0.05, a15 + 0.3);
      card.style.display = cin > 0 ? 'block' : 'none';
      const cout = seg(t, tTail + 0.7, tTail + 0.95);       // card + stamp clear out before the tilt peaks
      card.style.opacity = clamp(cin * 3) * (1 - cout);
      card.style.transform = `scale(${lerp(0.6, 1, bo(cin))})`;
      const v = 2 * clamp((t - a15) / Math.max(0.1, e16 - a15));
      digits.textContent = v.toFixed(2);
      card._hand.style.transform = `rotate(${v * 180}deg)`;
      const st = seg(t, e16 + 0.08, e16 + 0.3);
      stamp.style.display = st > 0 ? 'block' : 'none';
      stamp.style.opacity = clamp(st * 4) * (1 - cout);
      stamp.style.transform = `rotate(-9deg) scale(${lerp(2.0, 1, bo(st))})`;

      // ── speech bubble over the Zelf ──
      const bin = seg(t, a15 - 0.05, a15 + 0.2), bout = seg(t, e15 + 0.45, e15 + 0.65);
      if (bin > 0 && bout < 1) {
        bubble.style.display = 'block';
        P.set(ZX, y + 0.43 * ZS, ZZ).project(cam);
        const bx = (P.x * 0.5 + 0.5) * W, by = (-P.y * 0.5 + 0.5) * H;
        const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
        const lx = clamp(bx - bw / 2, 40, W - ZN.SAFE.bugW - bw - 20), ly = Math.max(ZN.SAFE.bugH + 20, by - bh - 30);
        bubble.style.left = lx + 'px'; bubble.style.top = ly + 'px';
        bubble._tail.style.left = clamp(bx - lx, 30, bw - 30) + 'px';
        bubble.style.opacity = clamp(bin * 3) * (1 - bout);
        bubble.style.transform = `scale(${lerp(0.5, 1, bo(bin)) * lerp(1, 0.85, bout)})`;
      } else bubble.style.display = 'none';

      ZN.render3d(scene, cam, ZN.anchorExposure);
    },
  });
})();
