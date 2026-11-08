import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './tex.js';
import { rng, lerp, cl } from './util.js';
import { makeCar } from './props.js';

const std = o => new THREE.MeshStandardMaterial(o);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function mesh(g, m, parent, x = 0, y = 0, z = 0){ const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
const neon = (c, k = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false, fog: false });
function sign(text, color, width, ar = true){
  const nt = T.neonText(text, { font: ar ? '120px Lalezar' : '900 110px Anton', color, dir: ar ? 'rtl' : 'ltr' });
  const m = new THREE.MeshBasicMaterial({ map: nt.tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false, color: new THREE.Color(2.6, 2.6, 2.6) });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, width / nt.aspect), m);
}
function taperTube(points, r0, r1, seg = 16){
  const c = new THREE.CatmullRomCurve3(points), g = new THREE.TubeGeometry(c, seg, 1, 8, false), p = g.attributes.position;
  for (let i = 0; i < p.count; i++){ const s = Math.floor(i / 9) / seg, P = c.getPointAt(s); const v = new THREE.Vector3().fromBufferAttribute(p, i).sub(P).multiplyScalar(lerp(r0, r1, s)).add(P); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}

export const DT = new THREE.Vector3(0, 0, 330);     // downtown street centre
export const PLAZA = new THREE.Vector3(76, 0, 362);  // fountain plaza (north side)
export const DS = new THREE.Vector3(2300, 0, 600);  // desert action spot

export function buildZones(scene, W){
  const Z = { anim: [], cars: [] };
  const r = rng(501);
  // ================= DOWNTOWN =================
  const g = new THREE.Group(); scene.add(g);
  const asp = T.asphalt(); asp.repeat.set(600 / 48, 1);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(600, 12), std({ map: asp, roughness: .5 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .05, 330); road.receiveShadow = true; g.add(road);
  const tl = T.tiles(); tl.repeat.set(150, 1.2); const side = std({ color: 0xCFC3B8, roughness: .8 }), top = std({ map: tl, roughness: .8 });
  for (const z of [321.5, 338.5]){ const s = new THREE.Mesh(box(600, .18, 5), [side, side, top, side, side, side]); s.position.set(0, .09, z); s.receiveShadow = true; g.add(s); }
  // plaza paving + fountain
  const pz = new THREE.Mesh(box(74, .18, 60), [side, side, top, side, side, side]); pz.position.set(PLAZA.x, .09, 371); pz.receiveShadow = true; g.add(pz);
  const stone = std({ color: 0xEDE6DA, roughness: .6 }), water = std({ color: 0x3FB8E0, roughness: .05, metalness: .1, emissive: 0x0A3F66, emissiveIntensity: .6 });
  mesh(new THREE.CylinderGeometry(6, 6.3, .8, 40), stone, g, PLAZA.x, .5, PLAZA.z);
  const wd = mesh(new THREE.CylinderGeometry(5.6, 5.6, .1, 40), water, g, PLAZA.x, .85, PLAZA.z); wd.castShadow = false;
  mesh(new THREE.CylinderGeometry(.6, .9, 2.6, 16), stone, g, PLAZA.x, 1.6, PLAZA.z); mesh(new THREE.CylinderGeometry(2.2, 1.6, .35, 30), stone, g, PLAZA.x, 2.9, PLAZA.z);
  const jets = []; const jm = new THREE.MeshBasicMaterial({ color: 0xD8F4FF, transparent: true, opacity: .55, depthWrite: false });
  for (let i = 0; i < 8; i++){ const j = new THREE.Mesh(new THREE.SphereGeometry(.12, 6, 5), jm); g.add(j); jets.push(j); }
  Z.anim.push(t => jets.forEach((j, i) => { const a = i / 8 * Math.PI * 2, ph = (t * .9 + i * .125) % 1; j.position.set(PLAZA.x + Math.cos(a) * (1.2 + ph * 3.4), 3.2 + Math.sin(ph * Math.PI) * 2.2, PLAZA.z + Math.sin(a) * (1.2 + ph * 3.4)); }));
  for (const [bx, bz, ry] of [[PLAZA.x - 12, PLAZA.z - 6, 0], [PLAZA.x + 12, PLAZA.z - 6, 0], [PLAZA.x - 12, PLAZA.z + 8, Math.PI], [PLAZA.x + 12, PLAZA.z + 8, Math.PI]]){
    const b = new THREE.Group(); b.position.set(bx, 0, bz); b.rotation.y = ry; g.add(b); mesh(box(3, .12, .7), std({ color: 0x8A5A3A }), b, 0, .55, 0); mesh(box(3, .7, .1), std({ color: 0x8A5A3A }), b, 0, .95, .32); }
  // towers on both sides of the street
  const glassTint = [0x9AA6C8, 0xB7A6D8, 0x8FB8C8, 0xC8B49A];
  const SIGNS = [['هرن البيب', '#3FF2FF'], ['SHAMA FAN CLUB', '#B07CFF', 0], ['مطعم الشباس', '#FFB13F'], ['CUTE CAFE', '#FF8FE8', 0], ['حلاق أبو زلف', '#FF4F7A'], ['LEONIDA BANK', '#7CFF9A', 0], ['نادي المتين', '#4FD8FF'], ['VICE MALL', '#FF3FD0', 0]];
  let si = 0; Z.screens = [];
  for (const north of [false, true]){
    let x = -290;
    while (x < 290){
      const w = 20 + r() * 18;
      if (north && x + w > PLAZA.x - 38 && x < PLAZA.x + 38){ x = PLAZA.x + 38; continue; }
      const h = 35 + r() * 120, d = 30, zc = north ? 341 + d / 2 : 319 - d / 2;
      const st = T.skylineTex(900 + si * 7 + (north ? 3 : 0)); st.map.repeat.set(Math.max(1, w / 30), Math.max(1, h / 60)); st.emis.repeat.copy(st.map.repeat);
      const m = std({ map: st.map, emissiveMap: st.emis, emissive: 0xffffff, emissiveIntensity: .6, roughness: .35, metalness: .35, color: glassTint[si % 4] }); W.skyMats.push(m);
      const tw = new THREE.Mesh(box(w, h, d), m); tw.position.set(x + w / 2, h / 2 + 5, zc); g.add(tw);
      const fac = T.facade(2000 + si, ['#F6A6C6', '#7FD8C8', '#F5E1BD', '#C2AEF0', '#FFC09A'][si % 5], '#FFFFFF', { floors: 1, cols: Math.max(3, Math.round(w / 5)), lit: .7 });
      const shopFront = std({ map: fac.map, emissiveMap: fac.emis, emissive: 0xffffff, emissiveIntensity: .8, roughness: .6 }); W.winMats.push(shopFront);
      const plain = std({ color: 0xE8E0D6, roughness: .7 });
      const mats = [plain, plain, plain, plain, north ? plain : shopFront, north ? shopFront : plain];
      const shop = new THREE.Mesh(box(w, 5, d + .4), mats); shop.position.set(x + w / 2, 2.5, zc); shop.receiveShadow = true; g.add(shop);
      if (r() < .7){ const [txt, col, ar] = SIGNS[si % SIGNS.length]; const s = sign(txt, col, Math.min(w * .85, 16), ar !== 0); s.position.set(x + w / 2, 8.5 + r() * 5, north ? 340.7 : 319.3); if (north) s.rotation.y = 0; else s.rotation.y = Math.PI; s.rotation.y = north ? Math.PI : 0; g.add(s); W.neonMats.push(s.material); }
      si++; x += w + 4 + r() * 6;
    }
  }
  // big LED screen above the plaza
  const [sc, sg] = T.cnv(1024, 512); const scrT = new THREE.CanvasTexture(sc); scrT.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false })); scr.position.set(PLAZA.x, 26, 400.5); scr.rotation.y = Math.PI; g.add(scr);
  mesh(box(32, 16, 1), std({ color: 0x111118 }), g, PLAZA.x, 26, 401.2);
  const backTower = new THREE.Mesh(box(80, 70, 30), std({ color: 0x8090B0, roughness: .4, metalness: .4 })); backTower.position.set(PLAZA.x, 35, 417); g.add(backTower);
  let lastScr = -1;
  Z.anim.push(t => { const f = Math.floor(t * 2) % 3; if (f === lastScr) return; lastScr = f;
    const gr = sg.createLinearGradient(0, 0, 1024, 512); gr.addColorStop(0, ['#2A0F2E', '#081A33', '#331400'][f]); gr.addColorStop(1, '#000'); sg.fillStyle = gr; sg.fillRect(0, 0, 1024, 512);
    sg.font = '200px Lalezar'; sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.direction = 'rtl'; sg.fillStyle = ['#FFC83A', '#3FE6FF', '#FF3FA4'][f];
    sg.fillText(['الحرب العظمى', '19.11', 'ليونيدا'][f], 512, 256); scrT.needsUpdate = true; });
  // crosswalks + traffic lights
  const cw = []; for (const cx of [-80, 80]) for (let k = 0; k < 7; k++) cw.push(box(.9, .02, 9).translate(cx - 3 + k * 1.0, .07, 330));
  const cwm = new THREE.Mesh(mergeGeometries(cw), std({ color: 0xF4F4F4, roughness: .7 })); cwm.receiveShadow = true; g.add(cwm);
  const lights = [];
  for (const [lx, lz] of [[-86, 323.5], [86, 336.5]]){
    mesh(new THREE.CylinderGeometry(.12, .14, 5, 8), std({ color: 0x222228, metalness: .6 }), g, lx, 2.5, lz);
    const hb = mesh(box(.5, 1.4, .5), std({ color: 0x18181C }), g, lx, 5.4, lz);
    const ls = ['#FF2A2A', '#FFC23F', '#2AFF6A'].map((c, i) => { const m = neon(c, 0); const s = mesh(new THREE.SphereGeometry(.15, 10, 8), m, g, lx, 5.85 - i * .45, lz + (lz < 330 ? .27 : -.27)); return m; });
    lights.push(ls);
  }
  Z.anim.push(t => { const ph = Math.floor((t % 9) / 3); lights.forEach(ls => ls.forEach((m, i) => m.color.set(['#FF2A2A', '#FFC23F', '#2AFF6A'][i]).multiplyScalar(i === ph ? 4 : .08))); });
  // downtown streetlights + palms in planters
  for (let lx = -270; lx < 270; lx += 30){ for (const lz of [320.2, 339.8]){
    mesh(new THREE.CylinderGeometry(.09, .12, 7, 8), std({ color: 0x2A2A33, metalness: .6 }), g, lx + (lz > 330 ? 15 : 0), 3.5, lz);
    mesh(new THREE.SphereGeometry(.28, 10, 8), W.lampMat, g, lx + (lz > 330 ? 15 : 0), 7, lz + (lz > 330 ? -.8 : .8)); } }
  // downtown traffic
  for (let i = 0; i < 5; i++){ const car = makeCar([0xF5F2EA, 0x2FC4B8, 0xFFC23F, 0x7A5BD6, 0xE8E8E8][i], ['#FFD23F', '#3FF2FF', '#FF6F3F', '#B07CFF', '#FFFFFF'][i]); car.traverse(m => { if (m.isMesh) m.castShadow = true; }); scene.add(car); Z.cars.push({ car, lane: i % 2 ? 327 : 333, dir: i % 2 ? 1 : -1, sp: 8 + i * 2.2, off: i * 117 }); }
  Z.anim.push(t => Z.cars.forEach(c => { const x = ((t * c.sp + c.off) % 560) - 280; c.car.position.set(c.dir * x, 0, c.lane); c.car.rotation.y = c.dir > 0 ? 0 : Math.PI; c.car.userData.wheels.forEach(w => w.rotation.z = -x * 2.6 * c.dir); }));

  // ================= DESERT =================
  const dg = new THREE.PlaneGeometry(1600, 1600, 160, 160); dg.rotateX(-Math.PI / 2); const dp = dg.attributes.position;
  Z.dune = (x, z) => { const dx = x - DS.x, dz = z - DS.z, dd = Math.hypot(dx, dz), flat = cl((dd - 30) / 110);
    const h = 6 * Math.sin(.011 * x + .006 * z) * Math.sin(.007 * z + .3) + 3.5 * Math.sin(.023 * x - .017 * z + 1) + 1.6 * Math.sin(.05 * z + .004 * x);
    return Math.max(0, h + 4) * flat * flat * (1 - cl((dd - 700) / 100)); };
  for (let i = 0; i < dp.count; i++){ const x = dp.getX(i) + DS.x, z = dp.getZ(i) + DS.z; dp.setY(i, Z.dune(x, z)); }
  dg.computeVertexNormals(); const dsand = T.sand(); dsand.repeat.set(140, 140);
  const dune = new THREE.Mesh(dg, std({ color: 0xF0BE84, map: dsand, roughness: 1 })); dune.position.set(DS.x, -.02, DS.z); dune.receiveShadow = true; scene.add(dune);
  // Tree of Life (ghaf)
  const tree = new THREE.Group(); tree.position.set(DS.x - 34, 0, DS.z + 64); scene.add(tree);
  const bark = std({ color: 0x5A3D2A, roughness: .95 }), leaf = std({ color: 0x6E8B3D, roughness: .85 });
  mesh(taperTube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.6, 2.5, 0), new THREE.Vector3(.2, 4.6, .3), new THREE.Vector3(-.3, 6, 0)], .9, .5), bark, tree);
  const tr = rng(77), leaves = [];
  for (let i = 0; i < 7; i++){ const a = i / 7 * Math.PI * 2, L = 4 + tr() * 3; const end = new THREE.Vector3(Math.cos(a) * L, 7 + tr() * 2, Math.sin(a) * L);
    mesh(taperTube([new THREE.Vector3(-.3, 5.6, 0), new THREE.Vector3(Math.cos(a) * L * .4, 6.8, Math.sin(a) * L * .4), end], .35, .12, 8), bark, tree);
    for (let k = 0; k < 3; k++) leaves.push(new THREE.IcosahedronGeometry(2.4 + tr() * 1.4, 1).scale(1, .45, 1).translate(end.x + (tr() - .5) * 3, end.y + .6 + tr(), end.z + (tr() - .5) * 3)); }
  leaves.push(new THREE.IcosahedronGeometry(3.6, 1).scale(1.3, .5, 1.3).translate(0, 9, 0));
  mesh(mergeGeometries(leaves), leaf, tree);
  // oil pumpjacks (Bahrain's first oil well vibe)
  Z.pumps = [];
  for (const [px, pz, ph] of [[95, 170, 0], [-150, 230, 1.7], [210, 60, 3.1]]){
    const p = new THREE.Group(); p.position.set(DS.x + px, Z.dune(DS.x + px, DS.z + pz), DS.z + pz); p.rotation.y = ph; scene.add(p);
    const y = std({ color: 0xF2C230, roughness: .5, metalness: .3 }), k = std({ color: 0x222222, roughness: .5 });
    mesh(box(9, .4, 2.4), k, p, 0, .2, 0); mesh(box(.5, 5, .5), y, p, -.6, 2.8, -.8).rotation.x = .18; mesh(box(.5, 5, .5), y, p, -.6, 2.8, .8).rotation.x = -.18;
    const beam = new THREE.Group(); beam.position.set(-.6, 5.3, 0); p.add(beam); mesh(box(8, .5, .5), y, beam, .6, 0, 0); mesh(box(.6, 2.2, .7), y, beam, 4.6, -.6, 0).rotation.z = .2;
    const crank = mesh(new THREE.CylinderGeometry(1.1, 1.1, .4, 16).rotateX(Math.PI / 2), k, p, -3.4, 2, 0);
    Z.pumps.push({ beam, crank, ph });
  }
  Z.anim.push(t => Z.pumps.forEach(p => { p.beam.rotation.z = Math.sin(t * 1.6 + p.ph) * .28; p.crank.rotation.z = t * 1.6 + p.ph; }));
  // shrubs + rocks
  const shrubG = new THREE.IcosahedronGeometry(.6, 0), shrubs = new THREE.InstancedMesh(shrubG, std({ color: 0x6B6A3A, roughness: 1, flatShading: true }), 260);
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3();
  for (let i = 0; i < 260; i++){ let x, z; do { x = DS.x + (r() - .5) * 900; z = DS.z + (r() - .5) * 900; } while (Math.hypot(x - DS.x, z - DS.z) < 14);
    const s = .5 + r() * 1.3; mtx.compose(new THREE.Vector3(x, Z.dune(x, z) + .2 * s, z), q.setFromEuler(new THREE.Euler(0, r() * 6, 0)), s3.set(s, s * .7, s)); shrubs.setMatrixAt(i, mtx); }
  shrubs.castShadow = true; shrubs.receiveShadow = true; scene.add(shrubs);

  // ================= SKY & SEA traffic =================
  const heli = new THREE.Group(); scene.add(heli);
  const hm = std({ color: 0x1F3A68, roughness: .35, metalness: .5 }), dk = std({ color: 0x111111 });
  mesh(new THREE.SphereGeometry(1.4, 16, 12).scale(1.7, .9, .9), hm, heli); mesh(new THREE.CylinderGeometry(.18, .3, 5, 8).rotateZ(Math.PI / 2), hm, heli, -3.6, .2, 0);
  mesh(box(.1, 1.2, .8), hm, heli, -6, .7, 0); const rotor = new THREE.Group(); rotor.position.y = 1.4; heli.add(rotor);
  mesh(box(11, .06, .35), dk, rotor); mesh(box(.35, .06, 11), dk, rotor); const tro = mesh(box(.06, 1.4, .2), dk, heli, -6, .5, .45);
  mesh(box(3, .1, .1), dk, heli, .2, -1.3, .7); mesh(box(3, .1, .1), dk, heli, .2, -1.3, -.7);
  heli.scale.setScalar(1.3);
  Z.anim.push(t => { const a = t * .12; heli.position.set(Math.cos(a) * 260, 95 + Math.sin(t * .5) * 3, 170 + Math.sin(a) * 190); heli.rotation.set(0, -a - Math.PI / 2 + Math.PI, .06); rotor.rotation.y = t * 40; tro.rotation.x = t * 50; });
  Z.heli = heli;
  const boats = [];
  for (const [bz, sp, col] of [[-240, 14, 0xFFFFFF], [-420, -10, 0xFF4F7A], [-150, 18, 0xFFD23F]]){
    const b = new THREE.Group(); scene.add(b); const hull = std({ color: col, roughness: .3 });
    const hs = new THREE.Shape(); hs.moveTo(-3, 0); hs.lineTo(2.6, 0); hs.lineTo(3.6, .9); hs.lineTo(-3.2, .9); hs.lineTo(-3, 0);
    mesh(new THREE.ExtrudeGeometry(hs, { depth: 2, bevelEnabled: false }).translate(0, -.3, -1), hull, b);
    mesh(box(1.6, .7, 1.4), std({ color: 0x223344, roughness: .1, metalness: .4 }), b, -.6, .9, 0);
    const wake = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false })); wake.rotation.x = -Math.PI / 2; wake.position.set(-9, .05, 0); b.add(wake);
    boats.push({ b, bz, sp, off: r() * 600 });
  }
  Z.anim.push(t => boats.forEach(o => { const x = ((t * Math.abs(o.sp) + o.off) % 1200) - 600; o.b.position.set(o.sp > 0 ? x : -x, Math.sin(t * 3 + o.off) * .08, o.bz); o.b.rotation.set(Math.sin(t * 2.3 + o.off) * .03, o.sp > 0 ? 0 : Math.PI, 0); }));
  Z.update = t => Z.anim.forEach(f => f(t));
  return Z;
}
