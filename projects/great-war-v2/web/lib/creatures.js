import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, lerp, cl, seg, eo } from './util.js';

const std = o => new THREE.MeshStandardMaterial(o);
function mesh(g, m, parent, x = 0, y = 0, z = 0){ const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------- crowd (5 instanced meshes for every pedestrian) ----------------
export function makeCrowd(scene, defs){
  const N = defs.length, r = rng(808);
  const torsoG = mergeGeometries([cap(.19, .3).scale(1.1, 1, .75).translate(0, .36, 0), cap(.055, .46).translate(-.27, .3, 0), cap(.055, .46).translate(.27, .3, 0)]);
  const headG = new THREE.SphereGeometry(.16, 14, 10).scale(1, 1.08, 1), hairG = new THREE.SphereGeometry(.168, 14, 8, 0, Math.PI * 2, 0, Math.PI * .45);
  const legG = cap(.075, .62).translate(0, -.38, 0);
  const mk = (geo, rough) => { const m = new THREE.InstancedMesh(geo, std({ roughness: rough }), N); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m; };
  const torso = mk(torsoG, .85), head = mk(headG, .6), hair = mk(hairG, .9), legL = mk(legG, .9), legR = mk(legG, .9);
  const SH = ['#E85A7A', '#3FB8C8', '#F2C230', '#FFFFFF', '#7A5BD6', '#2E8B57', '#FF8A3D', '#1E2F6B', '#F4F0FF', '#C0392B'], SK = ['#C08458', '#D9A273', '#8D5A3B', '#E8C29A', '#A86E48'], PT = ['#2B2F3A', '#EEE6D6', '#3A6EA5', '#5A4632', '#F2F2F2'], HR = ['#14100C', '#2A1A10', '#5A3A20', '#0A0A0A', '#C8A060'];
  const c = new THREE.Color();
  defs.forEach((d, i) => { torso.setColorAt(i, c.set(SH[Math.floor(r() * SH.length)])); head.setColorAt(i, c.set(SK[Math.floor(r() * SK.length)])); hair.setColorAt(i, c.set(HR[Math.floor(r() * HR.length)]));
    const p = PT[Math.floor(r() * PT.length)]; legL.setColorAt(i, c.set(p)); legR.setColorAt(i, c.set(p)); d.ph = r() * 6.28; d.sp = d.sp ?? (.9 + r() * .6); });
  const B = new THREE.Matrix4(), M = new THREE.Matrix4(), R = new THREE.Matrix4(), q = new THREE.Quaternion(), ONE = V(1, 1, 1), ZERO = V(0, 0, 0);
  function place(i, x, y, z, ry, swing, bob, scale = 1, lie = false){
    B.compose(V(x, y, z), q.setFromEuler(new THREE.Euler(lie ? -Math.PI / 2 : 0, ry, 0, 'YXZ')), V(scale, scale, scale));
    torso.setMatrixAt(i, M.copy(B).multiply(R.makeTranslation(0, .93 + bob, 0)));
    head.setMatrixAt(i, M.copy(B).multiply(R.makeTranslation(0, 1.71 + bob, 0))); hair.setMatrixAt(i, M.copy(B).multiply(R.makeTranslation(0, 1.73 + bob, -.01)));
    legL.setMatrixAt(i, M.copy(B).multiply(R.makeTranslation(-.1, .93, 0)).multiply(new THREE.Matrix4().makeRotationX(swing)));
    legR.setMatrixAt(i, M.copy(B).multiply(R.makeTranslation(.1, .93, 0)).multiply(new THREE.Matrix4().makeRotationX(-swing)));
  }
  const hideM = new THREE.Matrix4().compose(V(0, -500, 0), q.identity(), V(.001, .001, .001));
  return {
    defs,
    update(t, ctx = {}){
      defs.forEach((d, i) => {
        if (d.hidden){ [torso, head, hair, legL, legR].forEach(m => m.setMatrixAt(i, hideM)); return; }
        let x = d.x, z = d.z, ry = d.ry || 0, swing = 0, bob = 0;
        if (d.type === 'walk'){ const L = Math.hypot(d.x2 - d.x, d.z2 - d.z), u = ((t * d.sp + d.ph * 3) % (2 * L)) / L, fw = u < 1; const k = fw ? u : 2 - u;
          x = lerp(d.x, d.x2, k); z = lerp(d.z, d.z2, k); ry = Math.atan2((d.x2 - d.x) * (fw ? 1 : -1), (d.z2 - d.z) * (fw ? 1 : -1)); const w = t * 6.5 * d.sp + d.ph; swing = Math.sin(w) * .45; bob = Math.abs(Math.cos(w)) * .03; }
        else if (d.type === 'stand'){ bob = Math.sin(t * 2 + d.ph) * .01; ry = d.ry + Math.sin(t * .4 + d.ph) * .2; }
        // reactions: jump (honk), flee (Aboudi), lie on towel
        if (d.jumpAt != null && t > d.jumpAt && t < d.jumpAt + .5){ bob += Math.sin((t - d.jumpAt) / .5 * Math.PI) * .45; }
        if (d.fleeAt != null && t > d.fleeAt){ const k = t - d.fleeAt; x += d.fleeDir[0] * k * 6; z += d.fleeDir[1] * k * 6; ry = Math.atan2(d.fleeDir[0], d.fleeDir[1]); swing = Math.sin(t * 16 + d.ph) * .8; }
        place(i, x, d.y || 0, z, ry, swing, bob, d.s || 1, d.type === 'lie');
      });
      [torso, head, hair, legL, legR].forEach(m => { m.instanceMatrix.needsUpdate = true; });
    },
  };
}

// ---------------- animals ----------------
export function makeFlamingo(){
  const g = new THREE.Group(), pink = std({ color: 0xFF7FB0, roughness: .6 }), dark = std({ color: 0x2A1A1A, roughness: .5 }), legM = std({ color: 0xE86A9A, roughness: .6 });
  mesh(new THREE.SphereGeometry(.35, 14, 10).scale(1.3, .8, .75), pink, g, 0, 1.05, 0);
  const neck = new THREE.CatmullRomCurve3([V(.35, 1.1, 0), V(.5, 1.45, 0), V(.32, 1.75, 0), V(.45, 2.0, 0)]);
  mesh(new THREE.TubeGeometry(neck, 12, .06, 6), pink, g); mesh(new THREE.SphereGeometry(.11, 10, 8), pink, g, .5, 2.02, 0);
  mesh(new THREE.ConeGeometry(.05, .22, 6).rotateZ(-Math.PI / 2 - .6), dark, g, .62, 1.96, 0);
  mesh(new THREE.CylinderGeometry(.02, .02, .95, 5), legM, g, -.02, .48, .07); const l2 = mesh(new THREE.CylinderGeometry(.02, .02, .95, 5), legM, g, .05, .55, -.07); l2.rotation.z = .5;
  return g;
}
export function makeCamel(){
  const g = new THREE.Group(), fur = std({ color: 0xC89B62, roughness: .9 }), dark = std({ color: 0x3A2A1A, roughness: .8 });
  mesh(new THREE.SphereGeometry(.8, 20, 14).scale(1.45, .78, .72), fur, g, 0, 1.95, 0);
  mesh(new THREE.SphereGeometry(.62, 16, 12).scale(1.05, .95, .85), fur, g, -.15, 2.5, 0);
  mesh(new THREE.SphereGeometry(.45, 14, 10).scale(1.2, .7, .9), fur, g, -1.05, 1.95, 0);
  const neckPivot = new THREE.Group(); neckPivot.position.set(1.0, 2.05, 0); g.add(neckPivot);
  mesh(cap(.24, .95).rotateZ(-.75), fur, neckPivot, .42, .42, 0);
  const head = new THREE.Group(); head.position.set(.95, 1.0, 0); neckPivot.add(head);
  mesh(new THREE.SphereGeometry(.26, 14, 10).scale(1.55, .85, .85), fur, head, .2, 0, 0);
  mesh(new THREE.SphereGeometry(.15, 12, 10).scale(1.2, .9, 1.15), fur, head, .55, -.05, 0);   // the big nose (يبو خشم)
  for (const s of [-1, 1]){ mesh(new THREE.SphereGeometry(.04, 8, 6), dark, head, .3, .12, s * .17); mesh(new THREE.ConeGeometry(.06, .15, 6), fur, head, .02, .25, s * .12); mesh(new THREE.SphereGeometry(.025, 6, 5), dark, head, .68, -.02, s * .07); }
  const legs = [];
  for (const [lx, lz] of [[.75, .32], [.75, -.32], [-.8, .32], [-.8, -.32]]){ const p = new THREE.Group(); p.position.set(lx, 1.65, lz); g.add(p);
    mesh(cap(.13, .7).translate(0, -.45, 0), fur, p); mesh(new THREE.SphereGeometry(.12, 8, 6), fur, p, 0, -.85, 0); mesh(cap(.09, .55).translate(0, -1.2, 0), fur, p); mesh(new THREE.CylinderGeometry(.13, .15, .08, 10), dark, p, 0, -1.6, 0); legs.push(p); }
  const tail = mesh(cap(.04, .45).rotateZ(.3), fur, g, -1.45, 1.75, 0);
  g.userData = { neckPivot, head, legs };
  return g;
}
export function camelPose(c, t, walk = 0, look = 0, spit = 0){
  const U = c.userData; U.legs.forEach((l, i) => { l.rotation.z = Math.sin(t * 4 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * .35 * walk; });
  U.neckPivot.rotation.z = Math.sin(t * 1.3) * .05 - spit * .25; U.neckPivot.rotation.y = look; U.head.rotation.z = spit * .3;
}
export function makeQuad(kind = 'dog', color = 0x8A5A3A){
  const g = new THREE.Group(), m = std({ color, roughness: .85 }), s = kind === 'cat' ? .55 : 1;
  mesh(cap(.16, .45).rotateZ(Math.PI / 2).scale(1, 1, .9), m, g, 0, .5 * s + .1, 0).scale.setScalar(s);
  const head = mesh(new THREE.SphereGeometry(.16, 12, 10), m, g, .42 * s, .68 * s + .1, 0); head.scale.setScalar(s);
  for (const z of [-.08, .08]) mesh(new THREE.ConeGeometry(.06, .14, 6), m, g, .4 * s, (.84 * s) + .1, z * s);
  const tail = mesh(cap(.03, .3).rotateZ(-.8), m, g, -.42 * s, .62 * s + .1, 0);
  const legs = []; for (const [lx, lz] of [[.25, .1], [.25, -.1], [-.25, .1], [-.25, -.1]]){ const p = new THREE.Group(); p.position.set(lx * s, .42 * s + .1, lz * s); g.add(p); mesh(cap(.04, .3).translate(0, -.2, 0), m, p).scale.setScalar(s); legs.push(p); }
  g.userData = { legs, tail };
  return g;
}
export function quadPose(q, t, walk = 1){ q.userData.legs.forEach((l, i) => { l.rotation.z = Math.sin(t * 9 + (i % 2) * Math.PI + (i > 1) * Math.PI / 2) * .45 * walk; }); q.userData.tail.rotation.x = Math.sin(t * 10) * .4; }
export function makePigeons(scene, n){
  const body = mergeGeometries([new THREE.SphereGeometry(.12, 8, 6).scale(1.4, .9, .9), new THREE.SphereGeometry(.07, 8, 6).translate(.15, .08, 0)]);
  const wing = new THREE.BoxGeometry(.05, .02, .3).translate(0, 0, .15);
  const mB = new THREE.InstancedMesh(body, std({ color: 0x8A8FA0, roughness: .8 }), n), mL = new THREE.InstancedMesh(wing, std({ color: 0x6A7080 }), n), mR = new THREE.InstancedMesh(wing, std({ color: 0x6A7080 }), n);
  [mB, mL, mR].forEach(m => { m.frustumCulled = false; scene.add(m); });
  const r = rng(91), birds = Array.from({ length: n }, () => ({ x: 0, z: 0, ph: r() * 6.28, vx: (r() - .5) * 6, vz: (r() - .5) * 6, vy: 5 + r() * 4 }));
  const M = new THREE.Matrix4(), q = new THREE.Quaternion();
  return {
    birds,
    update(t, base, flyAt){
      birds.forEach((b, i) => {
        let x = base.x + b.x, z = base.z + b.z, y = .12, flap = 0, ry = b.ph;
        if (flyAt != null && t > flyAt){ const k = t - flyAt; x += b.vx * k; z += b.vz * k; y += b.vy * k - .3 * k * k; y = Math.max(y, .12); flap = Math.sin(t * 30 + b.ph) * .9; ry = Math.atan2(b.vx, b.vz) - Math.PI / 2; }
        else y += Math.abs(Math.sin(t * 3 + b.ph)) * .02;
        q.setFromEuler(new THREE.Euler(0, ry, 0)); M.compose(V(x, y, z), q, V(1, 1, 1)); mB.setMatrixAt(i, M);
        const ML = M.clone().multiply(new THREE.Matrix4().makeRotationX(-flap - .2)), MR = M.clone().multiply(new THREE.Matrix4().makeRotationY(Math.PI)).multiply(new THREE.Matrix4().makeRotationX(-flap - .2));
        mL.setMatrixAt(i, ML); mR.setMatrixAt(i, MR);
      });
      [mB, mL, mR].forEach(m => m.instanceMatrix.needsUpdate = true);
    },
    setVisible(v){ [mB, mL, mR].forEach(m => m.visible = v); },
  };
}
export function makeDolphin(){
  const g = new THREE.Group(), m = std({ color: 0x6E8DA8, roughness: .3 });
  mesh(new THREE.SphereGeometry(.45, 16, 10).scale(2.2, .7, .7), m, g); mesh(new THREE.ConeGeometry(.2, .5, 6), m, g, 0, .45, 0).rotation.z = -.4;
  mesh(new THREE.ConeGeometry(.25, .5, 4).rotateZ(Math.PI / 2).scale(1, 1, .3), m, g, -1.1, 0, 0); mesh(new THREE.ConeGeometry(.08, .35, 6).rotateZ(-Math.PI / 2), m, g, 1.1, -.05, 0);
  return g;
}
export function makeCrab(){
  const g = new THREE.Group(), m = std({ color: 0xE0442A, roughness: .5 });
  mesh(new THREE.SphereGeometry(.16, 12, 8).scale(1.3, .55, 1), m, g, 0, .1, 0);
  for (const s of [-1, 1]){ for (let k = 0; k < 3; k++) mesh(new THREE.CylinderGeometry(.015, .015, .22, 4), m, g, (k - 1) * .09, .06, s * .17).rotation.x = s * .9;
    mesh(new THREE.SphereGeometry(.06, 8, 6), m, g, .2, .14, s * .12); }
  return g;
}
