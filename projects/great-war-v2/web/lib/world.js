import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './tex.js';
import { rng, lerp, cl } from './util.js';

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function std(o){ return new THREE.MeshStandardMaterial(o); }
function neonMat(color, k = 3){ return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), toneMapped: false, fog: false }); }
function place(geo, x, y, z, ry = 0){ const g = geo.clone(); g.rotateY(ry); g.translate(x, y, z); return g; }

// Time-of-day keys (0 golden, 1 sunset, 2 dusk)
const TOD = [
  { elev: 4.5, expo: .52, sun: '#FFB473', si: 3.2, hs: '#93A6FF', hg: '#D79B6B', hi: .75, fog: '#C98A72', fd: .00012, neon: 1.0, win: .45, lamp: .4 },
  { elev: 1.4, expo: .60, sun: '#FF8C55', si: 2.6, hs: '#8084D8', hg: '#B57452', hi: .65, fog: '#A86A70', fd: .00015, neon: 1.5, win: .9, lamp: 1.0 },
  { elev: -1.8, expo: .85, sun: '#FF6E66', si: 1.1, hs: '#5A60B5', hg: '#4C3A55', hi: .6, fog: '#3A3A66', fd: .0002, neon: 2.3, win: 1.6, lamp: 2.0 },
];

export function buildWorld(scene, renderer){
  const W = { animated: [] };
  const AZ = 192;
  // ---------- sky + env ----------
  const sky = new Sky(); sky.scale.setScalar(10000); scene.add(sky);
  const setSkyU = (s, elev) => { const U = s.material.uniforms; U.turbidity.value = 6.5; U.rayleigh.value = 2.2; U.mieCoefficient.value = .0055; U.mieDirectionalG.value = .86;
    const v = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elev), THREE.MathUtils.degToRad(AZ)); U.sunPosition.value.copy(v); return v; };
  const pmrem = new THREE.PMREMGenerator(renderer); const envScene = new THREE.Scene(); const sky2 = new Sky(); sky2.scale.setScalar(10000); envScene.add(sky2);
  const ENVS = TOD.map(k => { setSkyU(sky2, k.elev); return pmrem.fromScene(envScene, 0.02).texture; });
  // ---------- lights ----------
  const sun = new THREE.DirectionalLight(0xffffff, 3); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 10, far: 4000 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, .7); scene.add(hemi);
  scene.fog = new THREE.FogExp2(0xffffff, .0003);
  const focus = new THREE.Vector3();
  const lightDir = new THREE.Vector3();
  W.setFocus = p => focus.copy(p);

  // ---------- ocean ----------
  const wn = T.waterNormal(256); wn.repeat.set(1600, 800);
  const waterU = { value: 0 };
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(30000, 15000), std({ color: 0x0A2E44, roughness: .16, metalness: 0, normalMap: wn, normalScale: new THREE.Vector2(.45, .45), envMapIntensity: .55 }));
  ocean.material.onBeforeCompile = sh => { sh.uniforms.uT = waterU; sh.fragmentShader = 'uniform float uT;\n' + sh.fragmentShader.replace('vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;',
    'vec3 mapN = normalize((texture2D(normalMap, vNormalMapUv + vec2(uT*.006, uT*.003)).xyz*2.0-1.0) + (texture2D(normalMap, vNormalMapUv*1.73 + vec2(-uT*.004, uT*.007)).xyz*2.0-1.0));'); };
  ocean.rotation.x = -Math.PI / 2; ocean.position.set(0, 0, -7500 + 2); ocean.receiveShadow = true; scene.add(ocean);
  // shoreline foam
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(3000, 7, 1, 1), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: waterU },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec2 vUv; uniform float uT;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){ float x = vUv.x*3000.; float w = .45 + .3*sin(uT*.9 + n(vec2(x*.04,0.))*5.);
        float band = smoothstep(w-.22, w, vUv.y) * (1.-smoothstep(w, w+.06, vUv.y));
        float f = band * (.45 + .55*n(vec2(x*.9, vUv.y*25. + uT*.6)));
        gl_FragColor = vec4(vec3(1.), f*.9); }` }));
  foam.rotation.x = -Math.PI / 2; foam.position.set(0, .03, -1.5); scene.add(foam);

  // ---------- base land (everything inland, incl. desert) ----------
  const baseT = T.sand(); baseT.repeat.set(900, 900);
  const base = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), std({ color: 0xE0BE8C, map: baseT, roughness: 1 })); base.rotation.x = -Math.PI / 2; base.position.set(0, -.06, 10000 - 2); base.receiveShadow = true; scene.add(base);
  // ---------- ground: beach, promenade, road ----------
  const sandT = T.sand(); sandT.repeat.set(300, 4);
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(3000, 8), std({ color: 0xB08A60, map: sandT, roughness: .32 })); wet.rotation.x = -Math.PI / 2; wet.position.set(0, .01, 2); wet.receiveShadow = true; scene.add(wet);
  const sandT2 = sandT.clone(); sandT2.repeat.set(300, 16);
  const dry = new THREE.Mesh(new THREE.PlaneGeometry(3000, 36), std({ color: 0xFFFFFF, map: sandT2, roughness: .95 })); dry.rotation.x = -Math.PI / 2; dry.position.set(0, .02, 23); dry.receiveShadow = true; scene.add(dry);
  const wall = new THREE.Mesh(box(3000, .8, .6), std({ color: 0xF4EDE4, roughness: .7 })); wall.position.set(0, .4, 40.3); wall.receiveShadow = true; scene.add(wall);
  const tl = T.tiles(); tl.repeat.set(750, 1);
  const walkA = new THREE.Mesh(box(3000, .16, 3.4), [std({ color: 0xD9CBBE }), std({ color: 0xD9CBBE }), std({ map: tl, roughness: .8 }), std({ color: 0xD9CBBE }), std({ color: 0xD9CBBE }), std({ color: 0xD9CBBE })]);
  walkA.position.set(0, .08, 42.3); walkA.receiveShadow = true; scene.add(walkA);
  const asp = T.asphalt(); asp.repeat.set(3000 / 48, 1);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(3000, 12), std({ map: asp, roughness: .55, metalness: .05 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .03, 50); road.receiveShadow = true; scene.add(road);
  const walkB = walkA.clone(); walkB.position.set(0, .08, 57.7); scene.add(walkB);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(3000, 900), std({ color: 0xCDB9A8, roughness: .9 })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, .01, 509); plaza.receiveShadow = true; scene.add(plaza);

  // ---------- art-deco hotels with neon ----------
  const PAST = [['#F6A6C6', '#FFFFFF', '#E8577E'], ['#7FD8C8', '#FFFFFF', '#1D9C8E'], ['#F5E1BD', '#E9A86A', '#E86A3C'], ['#C2AEF0', '#FFFFFF', '#7A5BD6'], ['#FFC09A', '#FFFFFF', '#F06F3A'], ['#A9D8F5', '#FFFFFF', '#2E7FC2'], ['#FBE38E', '#FFFFFF', '#E0A800']];
  const SIGNS = [['HOTEL SAYYAD', '#FF3FD0', 'en'], ['فندق الصياد', '#FFC23F', 'ar'], ['BEEP BEEP MOTEL', '#3FF2FF', 'en'], ['حلاق أبو زلف', '#FF4F7A', 'ar'], ['CUTE CAFE', '#FF8FE8', 'en'], ['نادي المتين', '#4FD8FF', 'ar'],
    ['SHAMA SPA', '#B07CFF', 'en'], ['LEONIDA', '#FF3FD0', 'en'], ['مطعم الشباس', '#FFB13F', 'ar'], ['FLAMINGO', '#FF6FB5', 'en'], ['OCEAN DR', '#3FF2FF', 'en'], ['PARADISE', '#FFD23F', 'en'], ['كوفي الكيوت', '#FF8FE8', 'ar'], ['NEON NIGHTS', '#7CFF9A', 'en']];
  W.neonMats = []; W.winMats = [];
  const r = rng(42); let x = -430, bi = 0; W.buildings = [];
  while (x < 430){
    const w = 26 + Math.floor(r() * 18), h = 15 + Math.floor(r() * 16), d = 24, [base, trim, aw] = PAST[bi % PAST.length];
    const floors = Math.max(3, Math.round((h - 5) / 4)), cols = Math.max(4, Math.round(w / 6));
    const fac = T.facade(1000 + bi, base, trim, { floors, cols, awning: aw, lit: .3 + r() * .2 });
    const side = std({ color: base, roughness: .85 }); const front = std({ map: fac.map, emissiveMap: fac.emis, emissive: 0xffffff, emissiveIntensity: .5, roughness: .7 }); W.winMats.push(front);
    const b = new THREE.Mesh(box(w, h, d), [side, side, side, side, side, front]); const cx = x + w / 2; b.position.set(cx, h / 2, 62 + d / 2); b.castShadow = false; b.receiveShadow = true; scene.add(b);
    // stepped roof + central fin
    const step = new THREE.Mesh(box(w * .55, 3, d * .6), side); step.position.set(cx, h + 1.5, 62 + d * .45); scene.add(step);
    const finH = h + 9; const fin = new THREE.Mesh(box(1.6, finH, 3), std({ color: trim, roughness: .6 })); fin.position.set(cx + (r() - .5) * w * .3, finH / 2, 61.2); scene.add(fin);
    // neon: horizontal eyebrows + fin edges
    const sg = SIGNS[bi % SIGNS.length], nm = neonMat(sg[1], 3.2); W.neonMats.push(nm);
    const nGeo = [];
    for (let f = 1; f <= floors; f++) nGeo.push(place(box(w - .6, .12, .12), cx, h * (f / (floors + 1.2)) + 1.6, 61.94));
    nGeo.push(place(box(.12, finH, .12), fin.position.x - .86, finH / 2, 59.65), place(box(.12, finH, .12), fin.position.x + .86, finH / 2, 59.65));
    nGeo.push(place(box(w, .14, .14), cx, h + .05, 61.9));
    const neon = new THREE.Mesh(mergeGeometries(nGeo), nm); scene.add(neon);
    // sign on parapet
    const nt = T.neonText(sg[0], { font: sg[2] === 'ar' ? '120px Lalezar' : '900 110px Anton', color: sg[1], dir: sg[2] === 'ar' ? 'rtl' : 'ltr' });
    const sw = Math.min(w * .9, 22), sh = sw / nt.aspect;
    const sMat = new THREE.MeshBasicMaterial({ map: nt.tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false, color: new THREE.Color(2.4, 2.4, 2.4) }); W.neonMats.push(sMat);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), sMat); sign.position.set(cx, h + 3.5 + sh / 2, 60.8); sign.rotation.y = Math.PI; scene.add(sign);
    // rounded deco corner tower on some
    if (r() < .5){ const cyl = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, h + 2, 28), std({ color: base, roughness: .8 })); cyl.position.set(x + 3.5, (h + 2) / 2, 64); scene.add(cyl);
      const rg = []; for (let f = 1; f <= floors; f++) rg.push(place(new THREE.TorusGeometry(4.05, .07, 6, 40).rotateX(Math.PI / 2), x + 3.5, h * (f / (floors + 1.2)) + 1.6, 64));
      scene.add(new THREE.Mesh(mergeGeometries(rg), nm)); }
    W.buildings.push({ cx, w, h, name: sg[0] });
    x += w + 6 + Math.floor(r() * 10); bi++;
  }
  // mid-rise + skyline
  W.skyMats = [];
  const midRow = (z0, z1, n, hmin, hmax, seed, tint) => { const rr = rng(seed);
    for (let i = 0; i < n; i++){ const w = 25 + rr() * 45, dd = 25 + rr() * 35, h = hmin + rr() * (hmax - hmin), sx = -1900 + rr() * 3800, sz = z0 + rr() * (z1 - z0);
      if (sx > -340 && sx < 340 && sz > 250 && sz < 430) continue;   // keep the downtown street clear
      const st = T.skylineTex(seed * 100 + i); st.map.repeat.set(Math.max(1, w / 35), Math.max(1, h / 70)); st.emis.repeat.copy(st.map.repeat);
      const m = std({ map: st.map, emissiveMap: st.emis, emissive: 0xffffff, emissiveIntensity: .5, roughness: .4, metalness: .3, color: tint }); W.skyMats.push(m);
      const t = new THREE.Mesh(box(w, h, dd), m); t.position.set(sx, h / 2, sz); scene.add(t);
      if (h > 170 && rr() < .7){ const a = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 30, 6), std({ color: 0x333344 })); a.position.set(sx, h + 15, sz); scene.add(a);
        const red = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), neonMat('#FF2020', 4)); red.position.set(sx, h + 31, sz); scene.add(red); W.animated.push(tt => { red.visible = Math.sin(tt * 3 + sx) > -.2; }); } } };
  midRow(140, 260, 46, 25, 70, 7, 0xC8C0D8); midRow(320, 1300, 90, 70, 290, 8, 0x9AA6C8);

  // ---------- palms (instanced) ----------
  const trunkPath = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.25, 3, 0), new THREE.Vector3(.9, 6.5, 0), new THREE.Vector3(1.9, 9.6, 0)]);
  const tg = new THREE.TubeGeometry(trunkPath, 24, .22, 8, false); const tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++){ const seg = Math.floor(i / 9) / 24, P = trunkPath.getPointAt(seg); const v = new THREE.Vector3().fromBufferAttribute(tp, i).sub(P).multiplyScalar(lerp(1.35, .75, seg)).add(P); tp.setXYZ(i, v.x, v.y, v.z); }
  tg.computeVertexNormals();
  const fronds = []; const top = trunkPath.getPointAt(1);
  for (let i = 0; i < 11; i++){
    const fgeo = new THREE.PlaneGeometry(1.25, 4.6, 2, 10); const p = fgeo.attributes.position;
    for (let k = 0; k < p.count; k++){ const fx = p.getX(k), fy = p.getY(k) + 2.3, s = fy / 4.6; p.setXYZ(k, fx, fy, -Math.pow(s, 2) * 2.4 + Math.abs(fx) * .45); }
    fgeo.rotateX(-1.05 + (i % 2) * .25); fgeo.rotateY(i * (Math.PI * 2 / 11) + (i % 3) * .1); fgeo.translate(top.x, top.y, top.z); fronds.push(fgeo);
  }
  const fg = mergeGeometries(fronds); fg.computeVertexNormals();
  const ftex = T.frond();
  const trunkMat = std({ color: 0x8A6A4E, roughness: .95 }), frondMat = std({ map: ftex, alphaTest: .45, side: THREE.DoubleSide, roughness: .8, color: 0xC8E6A8 });
  const PALMS = []; const pr = rng(77);
  for (let xx = -520; xx < 520; xx += 12 + pr() * 5) PALMS.push([xx, 37.4 + pr() * 1.5]);
  for (let xx = -515; xx < 515; xx += 17 + pr() * 6) PALMS.push([xx, 58.6 + pr() * .4]);
  for (let i = 0; i < 26; i++) PALMS.push([-300 + pr() * 600, 22 + pr() * 12]);
  const nP = PALMS.length, im1 = new THREE.InstancedMesh(tg, trunkMat, nP), im2 = new THREE.InstancedMesh(fg, frondMat, nP);
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  PALMS.forEach(([px, pz], i) => { q.setFromEuler(new THREE.Euler(0, pr() * 6.28, 0)); const s = .85 + pr() * .45; sc.set(s, s * (.9 + pr() * .3), s); mtx.compose(new THREE.Vector3(px, 0, pz), q, sc); im1.setMatrixAt(i, mtx); im2.setMatrixAt(i, mtx); });
  im1.castShadow = im2.castShadow = true; im1.receiveShadow = im2.receiveShadow = true; scene.add(im1, im2);
  W.palms = PALMS;

  // ---------- street lights (instanced) ----------
  const poleG = mergeGeometries([new THREE.CylinderGeometry(.09, .13, 7, 8).translate(0, 3.5, 0), box(1.6, .1, .1).translate(-.8, 7, 0)]);
  const lampG = new THREE.SphereGeometry(.28, 12, 10).translate(-1.55, 6.85, 0);
  const LP = []; for (let xx = -500; xx < 500; xx += 28) LP.push([xx, 43.2, 0], [xx + 14, 56.8, Math.PI]);
  const pole = new THREE.InstancedMesh(poleG, std({ color: 0x2A2A33, roughness: .5, metalness: .6 }), LP.length);
  const lampMat = neonMat('#FFD79A', 1); W.lampMat = lampMat; const lamp = new THREE.InstancedMesh(lampG, lampMat, LP.length);
  LP.forEach(([lx, lz, ry], i) => { mtx.compose(new THREE.Vector3(lx, 0, lz), q.setFromEuler(new THREE.Euler(0, ry, 0)), sc.set(1, 1, 1)); pole.setMatrixAt(i, mtx); lamp.setMatrixAt(i, mtx); });
  pole.castShadow = true; scene.add(pole, lamp);

  // ---------- pier ----------
  const plk = T.planks(); plk.repeat.set(1, 20);
  const PX = 66; const pier = new THREE.Group(); scene.add(pier);
  const deck = new THREE.Mesh(box(5, .3, 100), std({ map: plk, roughness: .85 })); deck.position.set(PX, 2.1, -48); deck.receiveShadow = true; deck.castShadow = true; pier.add(deck);
  const plat = new THREE.Mesh(box(12, .3, 12), std({ map: plk, roughness: .85 })); plat.position.set(PX, 2.1, -104); plat.receiveShadow = true; pier.add(plat);
  const posts = []; for (let zz = 0; zz > -110; zz -= 6) for (const dx of [-2.6, 2.6]) posts.push(place(new THREE.CylinderGeometry(.18, .2, 5, 8), PX + dx, -.3, zz));
  for (const [dx, dz] of [[-6, -98], [6, -98], [-6, -110], [6, -110]]) posts.push(place(new THREE.CylinderGeometry(.18, .2, 5, 8), PX + dx, -.3, dz));
  pier.add(new THREE.Mesh(mergeGeometries(posts), std({ color: 0x5E4632, roughness: .9 })));
  const rails = [place(box(.08, .08, 92), PX - 2.45, 3.1, -48), place(box(.08, .08, 92), PX + 2.45, 3.1, -48)];
  for (let zz = -2; zz > -96; zz -= 3) rails.push(place(box(.07, 1, .07), PX - 2.45, 2.7, zz), place(box(.07, 1, .07), PX + 2.45, 2.7, zz));
  pier.add(new THREE.Mesh(mergeGeometries(rails), std({ color: 0xF2EDE6, roughness: .6 })));
  W.pierEnd = new THREE.Vector3(PX, 2.25, -104);

  // ---------- lifeguard tower (Miami pastel) ----------
  const lg = new THREE.Group(); lg.position.set(-40, 0, 20); lg.rotation.y = Math.PI; scene.add(lg);
  const legs = []; for (const [a, b] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) legs.push(place(new THREE.CylinderGeometry(.12, .14, 2.6, 8), a, 1.3, b));
  lg.add(new THREE.Mesh(mergeGeometries(legs), std({ color: 0xFFFFFF, roughness: .6 })));
  const hut = new THREE.Mesh(box(3.4, 2.4, 3.2), std({ map: T.stripes('#FF7FB0', '#FFF4E8', 10), roughness: .7 })); hut.position.y = 3.8; hut.castShadow = true; lg.add(hut);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(.4, 2.6, 1.2, 4, 1), std({ color: 0x3FC7C0, roughness: .6 })); roof.rotation.y = Math.PI / 4; roof.position.y = 5.6; roof.castShadow = true; lg.add(roof);
  const win = new THREE.Mesh(box(2.4, .9, .05), std({ color: 0x223040, roughness: .1, metalness: .5 })); win.position.set(0, 4.1, 1.62); lg.add(win);
  const ramp = new THREE.Mesh(box(1.2, .12, 4.4), std({ color: 0xFFFFFF })); ramp.position.set(0, 1.4, 3.6); ramp.rotation.x = .62; lg.add(ramp);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1, .6, 8, 1), std({ color: 0xFF3B3B, side: THREE.DoubleSide })); flag.position.set(1.2, 7.2, 0); lg.add(flag);
  const fp = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 2.4), std({ color: 0xffffff })); fp.position.set(.7, 6.4, 0); lg.add(fp);
  W.animated.push(tt => { const p = flag.geometry.attributes.position; for (let i = 0; i < p.count; i++){ const u = p.getX(i) + .5; p.setZ(i, Math.sin(u * 5 - tt * 7) * .12 * u); } p.needsUpdate = true; });
  W.lifeguard = new THREE.Vector3(-40, 0, 20);

  // ---------- umbrellas + towels ----------
  const ur = rng(12), cols = [['#FF6FA8', '#FFFFFF'], ['#3FC7C0', '#FFFFFF'], ['#FFC23F', '#FF6F3F'], ['#8F7CFF', '#FFFFFF']];
  for (let i = 0; i < 18; i++){ const ux = -220 + ur() * 440, uz = 12 + ur() * 18; if (Math.abs(ux - 66) < 8 || Math.abs(ux + 40) < 6 || Math.abs(ux) < 10) continue;
    const c = cols[i % 4]; const u = new THREE.Group(); u.position.set(ux, 0, uz);
    const top = new THREE.Mesh(new THREE.ConeGeometry(1.5, .55, 16, 1, true), std({ map: T.stripes(c[0], c[1], 16), side: THREE.DoubleSide, roughness: .7 })); top.position.y = 2.3; top.castShadow = true; u.add(top);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.4), std({ color: 0xffffff })); st.position.y = 1.2; u.add(st);
    const tw = new THREE.Mesh(box(.9, .02, 1.8), std({ color: c[0], roughness: .9 })); tw.position.set(.6, .03, .4); tw.rotation.y = ur(); tw.receiveShadow = true; u.add(tw); scene.add(u); }

  // ---------- clouds ----------
  const cr = rng(31); W.clouds = [];
  for (let i = 0; i < 16; i++){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T.cloud(300 + i), transparent: true, depthWrite: false, fog: false, opacity: .75 }));
    const s = 700 + cr() * 900; m.scale.set(s, s * .38, 1);
    const ang = THREE.MathUtils.degToRad(AZ - 180 + (cr() - .5) * 150), dist = 7000 + cr() * 4000;
    m.position.set(Math.sin(ang) * dist, 380 + cr() * 900, -Math.cos(ang) * dist); m.lookAt(0, m.position.y * .6, 0);
    W.clouds.push({ m, x0: m.position.x, sp: 4 + cr() * 6 }); scene.add(m);
  }

  // ---------- seagulls ----------
  const gullM = std({ color: 0x2A2430, roughness: .9 }); W.gulls = [];
  for (let i = 0; i < 9; i++){ const gq = new THREE.Group(); const wl = new THREE.Mesh(box(1.1, .05, .3), gullM), wr = wl.clone(); wl.position.x = -.55; wr.position.x = .55;
    const pl = new THREE.Group(), prr = new THREE.Group(); pl.add(wl); prr.add(wr); gq.add(pl, prr, new THREE.Mesh(box(.25, .18, .5), gullM)); scene.add(gq); W.gulls.push({ gq, pl, prr, ph: i * 1.7, h: 30 + (i % 4) * 12, z: -60 - i * 35, x0: -200 + i * 45 }); }
  W.animated.push(tt => { for (const b of W.gulls){ const x = ((b.x0 + tt * 9) % 500) - 250; b.gq.position.set(x, b.h + Math.sin(tt * .7 + b.ph) * 3, b.z); b.gq.rotation.y = Math.PI / 2; const f = Math.sin(tt * 7 + b.ph) * .5; b.pl.rotation.z = f; b.prr.rotation.z = -f; b.gq.scale.setScalar(2.2); } });
  // ---------- environment update ----------
  const cA = new THREE.Color(), cB = new THREE.Color();
  const mixC = (a, b, k) => cA.set(a).lerp(cB.set(b), k).clone();
  W.tod = 0;
  W.apply = (t, tod, cam) => {
    const i = Math.min(1, Math.floor(tod)), k = cl(tod - i), A = TOD[i], B = TOD[i + 1];
    const L = (p) => lerp(A[p], B[p], k);
    const sunV = setSkyU(sky, L('elev'));
    renderer.toneMappingExposure = L('expo');
    scene.environment = ENVS[Math.round(tod)];
    sun.color.copy(mixC(A.sun, B.sun, k)); sun.intensity = L('si');
    hemi.color.copy(mixC(A.hs, B.hs, k)); hemi.groundColor.copy(mixC(A.hg, B.hg, k)); hemi.intensity = L('hi');
    scene.fog.color.copy(mixC(A.fog, B.fog, k)); scene.fog.density = L('fd');
    // light direction: same azimuth as the visible sun, a bit higher so shadows stay readable
    lightDir.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - Math.max(9, L('elev') + 9)), THREE.MathUtils.degToRad(AZ));
    sun.target.position.copy(focus); sun.position.copy(focus).addScaledVector(lightDir, 1500);
    const ne = L('neon'); W.neonMats.forEach(m => m.color.setScalar ? null : 0);
    for (const m of W.neonMats){ if (!m.userData.base) m.userData.base = m.color.clone(); m.color.copy(m.userData.base).multiplyScalar(ne); }
    for (const m of W.winMats) m.emissiveIntensity = L('win');
    for (const m of W.skyMats) m.emissiveIntensity = L('win') * 1.2;
    lampMat.color.set('#FFD79A').multiplyScalar(L('lamp') * 2.5);
    waterU.value = t;
    for (const c of W.clouds){ c.m.position.x = c.x0 + t * c.sp; c.m.material.color.copy(mixC('#E8A08C', '#8A6A9C', cl((tod - .4) / 1.4))).multiplyScalar(.75); }
    for (const f of W.animated) f(t);
  };
  return W;
}
