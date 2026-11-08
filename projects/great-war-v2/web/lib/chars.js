import * as THREE from 'three';
import { lerp } from './util.js';

const std = o => new THREE.MeshStandardMaterial(o);
function mk(geo, mat, parent, x = 0, y = 0, z = 0){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 14);
const sph = (r, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h);

// o: {skin, shirt(tex), pants, shorts, shoes, hair, hairStyle, hat, glasses, beard, mustache, sideburns, mole, blush, bulk, chain, sleeve}
export function makeChar(o){
  const b = o.bulk || 1, M = {
    skin: std({ color: o.skin, roughness: .62, envMapIntensity: .35 }), shirt: std({ map: o.shirt, roughness: .9, envMapIntensity: .3 }), pants: std({ color: o.pants, roughness: .9, envMapIntensity: .3 }),
    shoes: std({ color: o.shoes || 0xF5F5F5, roughness: .5 }), hair: std({ color: o.hair || 0x1B1410, roughness: .9 }), white: std({ color: 0xFFFFFF, roughness: .25 }),
    black: std({ color: 0x0B0B0D, roughness: .2 }), lips: std({ color: 0x5A2626, roughness: .5 }), dark: std({ color: 0x15100D, roughness: .6 }),
  };
  const root = new THREE.Group(), J = {};
  const hips = new THREE.Group(); hips.position.y = .93; root.add(hips); J.hips = hips;
  mk(cap(.17 * b, .14).rotateZ(Math.PI / 2), M.pants, hips, 0, -.02, 0).scale.set(1, 1.05, .9);
  // torso
  const torso = new THREE.Group(); hips.add(torso); J.torso = torso;
  mk(cap(.2, .3), M.shirt, torso, 0, .36, 0).scale.set(1.12 * b, 1, .78 * b);
  mk(new THREE.CylinderGeometry(.065 * Math.sqrt(b), .075 * Math.sqrt(b), .14, 12), M.skin, torso, 0, .74, 0);
  if (o.chain) { const ch = mk(new THREE.TorusGeometry(.13, .013, 8, 28), std({ color: 0xFFD24A, metalness: 1, roughness: .2 }), torso, 0, .66, .06); ch.rotation.x = 1.25; }
  // head
  const head = new THREE.Group(); head.position.y = .84; torso.add(head); J.head = head;
  const skull = mk(sph(.2, 28, 20), M.skin, head, 0, .11, 0); skull.scale.set(1, 1.08, 1.02);
  const F = new THREE.Group(); F.position.y = .11; head.add(F); J.face = F;
  for (const s of [-1, 1]){
    const eye = mk(sph(.054), M.white, F, s * .078, .035, .164); eye.scale.z = .62;
    const pup = mk(sph(.029, 14, 12), M.black, F, s * .078, .035, .193); J['pup' + s] = pup; J['eye' + s] = eye;
    const hl = new THREE.Mesh(sph(.009, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(.01, .012, .026); pup.add(hl);
    const brow = mk(new THREE.BoxGeometry(.085, .02, .02), M.hair, F, s * .078, .118, .182); J['brow' + s] = brow;
    mk(sph(.045, 12, 10), M.skin, F, s * .2, .0, .0).scale.set(.5, 1, .8);
  }
  mk(sph(.032, 12, 10), M.skin, F, 0, -.015, .2);
  const mouth = mk(new THREE.TorusGeometry(.05, .012, 6, 18, Math.PI), M.lips, F, 0, -.07, .178); mouth.rotation.z = Math.PI; J.mouth = mouth;
  const mouthO = mk(sph(.04, 14, 10), M.dark, F, 0, -.085, .17); mouthO.scale.set(1, 1.2, .5); mouthO.visible = false; J.mouthO = mouthO;
  const mouthF = mk(new THREE.BoxGeometry(.075, .013, .012), M.lips, F, 0, -.078, .188); mouthF.visible = false; J.mouthF = mouthF;
  // hair
  if (o.hairStyle !== 'bald'){ const h = mk(new THREE.SphereGeometry(.215, 28, 16, 0, Math.PI * 2, 0, Math.PI * .42), M.hair, F, 0, .015, -.012); h.scale.set(1.02, 1.12, 1.06); h.rotation.x = -.25; }
  if (o.beard){ mk(new THREE.SphereGeometry(.208, 28, 14, Math.PI / 2 - 1.05, 2.1, Math.PI * .655, Math.PI * .27), M.hair, F, 0, 0, 0); }
  if (o.mustache){ const mu = mk(cap(.016, .07).rotateZ(Math.PI / 2), M.hair, F, 0, -.042, .196); mu.scale.set(1, 1, .8); }
  J.sideburns = [];
  if (o.sideburns){ const big = o.sideburns === 'huge';
    for (const s of [-1, 1]){ const piv = new THREE.Group(); piv.position.set(s * .19, .06, .03); F.add(piv);
      const sb = mk(cap(big ? .055 : .025, big ? .38 : .1), M.hair, piv, 0, big ? -.24 : -.07, 0); sb.rotation.z = s * (big ? .18 : .05);
      if (big){ const tip = mk(sph(.06, 12, 10), M.hair, piv, s * .08, -.47, .02); tip.scale.set(1.2, .8, 1); }
      J.sideburns.push(piv); } }
  if (o.mole){ J.mole = mk(sph(.019, 10, 8), M.dark, F, .118, -.085, .152); }
  if (o.blush){ for (const s of [-1, 1]){ const bl = new THREE.Mesh(new THREE.CircleGeometry(.035, 16), new THREE.MeshBasicMaterial({ color: 0xFF7FA8, transparent: true, opacity: .6 })); bl.position.set(s * .115, -.025, .185); bl.rotation.y = s * .45; F.add(bl); } }
  if (o.glasses){
    const g = new THREE.Group(); g.position.set(0, .035, .195); F.add(g); J.glasses = g;
    const lens = std({ color: 0x0A0A12, metalness: .9, roughness: .08 }), frame = std({ color: o.glasses === 'gold' ? 0xFFC83F : 0x111111, metalness: .9, roughness: .25 });
    for (const s of [-1, 1]){ if (o.glasses === 'cheap' && s === 1) { mk(new THREE.TorusGeometry(.038, .006, 6, 20), frame, g, s * .075, 0, 0); continue; }
      const L = mk(new THREE.BoxGeometry(.09, .06, .012), lens, g, s * .075, 0, 0); L.rotation.y = s * -.1; }
    mk(new THREE.BoxGeometry(.06, .01, .01), frame, g, 0, .015, .002); mk(new THREE.BoxGeometry(.2, .012, .012), frame, g, 0, .03, -.005);
  }
  if (o.hat === 'bucket'){ const hm = std({ color: o.hatColor || 0xE7D2A0, roughness: .8 }); mk(new THREE.CylinderGeometry(.17, .21, .14, 24), hm, F, 0, .2, -.01); mk(new THREE.CylinderGeometry(.31, .31, .015, 30), hm, F, 0, .135, -.01); }
  if (o.hat === 'cap'){ const hm = std({ color: o.hatColor || 0xFF4F9A, roughness: .7 }); const c = mk(new THREE.SphereGeometry(.218, 26, 14, 0, Math.PI * 2, 0, Math.PI * .45), hm, F, 0, .02, -.01); c.scale.y = 1.05;
    const bill = mk(new THREE.BoxGeometry(.2, .015, .17), hm, F, 0, .085, -.27); bill.rotation.x = -.15; }
  // arms
  for (const s of [-1, 1]){
    const sh = new THREE.Group(); sh.position.set(s * (.25 * b + .03), .6, 0); torso.add(sh);
    mk(cap(.078 * b, .08), M.shirt, sh, 0, -.06, 0);
    mk(cap(.068 * b, .2), o.sleeve === 'long' ? M.shirt : M.skin, sh, 0, -.17, 0);
    const el = new THREE.Group(); el.position.y = -.31; sh.add(el);
    mk(cap(.062 * b, .19), o.sleeve === 'long' ? M.shirt : M.skin, el, 0, -.13, 0);
    const hand = new THREE.Group(); hand.position.y = -.29; el.add(hand); mk(sph(.078 * Math.sqrt(b), 14, 12), M.skin, hand, 0, 0, 0).scale.set(.9, 1.05, .82);
    J[s < 0 ? 'shL' : 'shR'] = sh; J[s < 0 ? 'elL' : 'elR'] = el; J[s < 0 ? 'handL' : 'handR'] = hand;
  }
  // legs
  for (const s of [-1, 1]){
    const hp = new THREE.Group(); hp.position.set(s * .1 * b, 0, 0); hips.add(hp);
    mk(cap(.088 * b, .26), M.pants, hp, 0, -.22, 0);
    const kn = new THREE.Group(); kn.position.y = -.44; hp.add(kn);
    mk(cap(.076 * b, .25), o.shorts ? M.skin : M.pants, kn, 0, -.2, 0);
    const shoe = mk(new THREE.BoxGeometry(.13 * b, .09, .27), M.shoes, kn, 0, -.43, .05); shoe.geometry.translate(0, 0, 0);
    J[s < 0 ? 'hpL' : 'hpR'] = hp; J[s < 0 ? 'knL' : 'knR'] = kn;
  }
  root.userData.J = J; root.userData.M = M;
  root.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return root;
}

// Pose: {x,y,z,ry, bob, lean, twist, hy, hp, hr, aL:[pitch,roll,elbow,yaw], aR, lL:[pitch,knee], lR, brow, mouth:'smile'|'o'|'flat', blink, look:[x,y]}
export function pose(ch, p){
  const J = ch.userData.J;
  ch.position.set(p.x || 0, (p.y || 0) + (p.bob || 0), p.z || 0); ch.rotation.set(0, p.ry || 0, p.rz || 0);
  J.torso.rotation.set(p.lean || 0, p.twist || 0, p.tilt || 0);
  J.head.rotation.set(p.hp || 0, p.hy || 0, p.hr || 0);
  const aL = p.aL || [0, -.12, 0, 0], aR = p.aR || [0, .12, 0, 0];
  J.shL.rotation.set(aL[0], aL[3] || 0, aL[1]); J.elL.rotation.set(aL[2], 0, 0);
  J.shR.rotation.set(aR[0], aR[3] || 0, aR[1]); J.elR.rotation.set(aR[2], 0, 0);
  const lL = p.lL || [0, 0], lR = p.lR || [0, 0];
  J.hpL.rotation.set(lL[0], 0, lL[2] || 0); J.knL.rotation.set(lL[1], 0, 0); J.hpR.rotation.set(lR[0], 0, lR[2] || 0); J.knR.rotation.set(lR[1], 0, 0);
  const br = p.brow || 0; J['brow-1'].rotation.z = -br; J['brow1'].rotation.z = br; J['brow-1'].position.y = J['brow1'].position.y = .112 + (p.browUp || 0);
  const bl = p.blink ? .1 : 1; J['eye-1'].scale.y = J['eye1'].scale.y = bl; J['pup-1'].visible = J['pup1'].visible = !p.blink;
  const lk = p.look || [0, 0]; J['pup-1'].position.x = -.078 + lk[0] * .018; J['pup1'].position.x = .078 + lk[0] * .018; J['pup-1'].position.y = J['pup1'].position.y = .035 + lk[1] * .015;
  const eyeS = p.eyes || 1; J['eye-1'].scale.x = J['eye1'].scale.x = eyeS; J['pup-1'].scale.setScalar(eyeS); J['pup1'].scale.setScalar(eyeS);
  J.mouth.visible = p.mouth !== 'o' && p.mouth !== 'flat'; J.mouthO.visible = p.mouth === 'o'; J.mouthF.visible = p.mouth === 'flat';
  if (p.mouth === 'o') J.mouthO.scale.set(1, 1.2 * (p.mouthOpen || 1), .5);
  if (J.sideburns.length){ const f = p.flap || 0; J.sideburns.forEach((s, i) => { s.rotation.x = -f * .9; s.rotation.z = (i ? 1 : -1) * f * .5; }); }
}
// reusable motion snippets (all pure functions of time)
export const anim = {
  idle: (t, ph = 0) => ({ bob: Math.sin(t * 2.1 + ph) * .008, aL: [Math.sin(t * 1.3 + ph) * .04, -.13, -.12], aR: [-Math.sin(t * 1.3 + ph) * .04, .13, -.12], hy: Math.sin(t * .7 + ph) * .08, blink: ((t + ph) % 3.1) < .12 }),
  walk: (t, sp = 1, ph = 0) => { const w = t * 5.5 * sp + ph, s = Math.sin(w); return { bob: Math.abs(Math.cos(w)) * .035, lL: [s * .5, Math.max(0, -s) * .6 + .05], lR: [-s * .5, Math.max(0, s) * .6 + .05], aL: [-s * .45, -.12, -.25], aR: [s * .45, .12, -.25], twist: s * .06 }; },
  flex: (t) => ({ aL: [0, -1.45, -1.9 - Math.sin(t * 6) * .12, -.3], aR: [0, 1.45, -1.9 - Math.sin(t * 6 + 1) * .12, .3], mouth: 'smile', brow: .25 }),
  cross: () => ({ aL: [-.55, -.15, -1.95, .75], aR: [-.62, .15, -1.95, -.75] }),
  wave: (t) => ({ aR: [0, 2.55, -.35 + Math.sin(t * 9) * .35, 0] }),
  point: () => ({ aR: [-1.45, .2, -.05, 0] }),
};
