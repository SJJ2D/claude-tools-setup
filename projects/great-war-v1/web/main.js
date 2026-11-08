import * as THREE from 'three';
import { buildWorld } from './lib/world.js';
import { makeChar, pose, anim } from './lib/chars.js';
import * as P from './lib/props.js';
import * as T from './lib/tex.js';
import { makePost } from './lib/post.js';
import * as UI from './lib/ui.js';
import { cl, lerp, seg, eio, eo, ei, back, elastic, noise1, hash, deg } from './lib/util.js';

const W = 1920, H = 1080, DUR = 60;
// ---- narration timing (replaced from timing.json after voice is generated) ----
let VO = /*VO*/[[0.8, 4.0], [5.3, 7.08], [7.343, 10.743], [13.2, 14.48], [15.2, 19.3], [20.2, 23.28], [24.6, 29.44], [30.003, 32.443], [32.781, 36.581], [37.0, 38.44], [39.6, 42.54], [43.2, 46.02], [47.6, 50.02], [52.67, 54.81], [55.208, 57.748]]/*END*/;
let WORDS = /*WORDS*/[{"w": "في", "s": 0.8, "e": 1.16, "line": 0}, {"w": "عالم", "s": 1.16, "e": 1.72, "line": 0}, {"w": "ما", "s": 1.72, "e": 2.24, "line": 1}, {"w": "فيه", "s": 2.24, "e": 2.64, "line": 1}, {"w": "قانون", "s": 2.64, "e": 3.28, "line": 1}, {"w": "ولا", "s": 3.28, "e": 3.54, "line": 2}, {"w": "رحمة", "s": 3.54, "e": 4.0, "line": 2}, {"w": "ولا", "s": 5.3, "e": 5.74, "line": 4}, {"w": "حتى", "s": 5.74, "e": 6.28, "line": 4}, {"w": "واي", "s": 6.28, "e": 6.6, "line": 4}, {"w": "فاي", "s": 6.6, "e": 7.08, "line": 4}, {"w": "في", "s": 7.343, "e": 7.603, "line": 5}, {"w": "ولاية", "s": 7.603, "e": 8.303, "line": 5}, {"w": "ليونيدا", "s": 8.303, "e": 9.303, "line": 5}, {"w": "بتبدا", "s": 9.303, "e": 9.803, "line": 6}, {"w": "الحرب", "s": 9.803, "e": 10.103, "line": 6}, {"w": "العظمى", "s": 10.103, "e": 10.743, "line": 6}, {"w": "فريق", "s": 13.2, "e": 13.76, "line": 7}, {"w": "الصيّاد", "s": 13.76, "e": 14.48, "line": 7}, {"w": "بقيادة", "s": 15.2, "e": 16.02, "line": 8}, {"w": "الشبّاس", "s": 16.02, "e": 16.54, "line": 8}, {"w": "الصيّاد", "s": 16.54, "e": 17.32, "line": 8}, {"w": "يصيد", "s": 17.32, "e": 17.78, "line": 9}, {"w": "أي", "s": 17.78, "e": 18.04, "line": 9}, {"w": "شي", "s": 18.04, "e": 18.4, "line": 9}, {"w": "حتى", "s": 18.4, "e": 18.82, "line": 10}, {"w": "السمك", "s": 18.82, "e": 19.3, "line": 10}, {"w": "حسن", "s": 20.2, "e": 20.72, "line": 11}, {"w": "محمد", "s": 20.72, "e": 21.22, "line": 11}, {"w": "البيب", "s": 21.22, "e": 21.86, "line": 11}, {"w": "دوم", "s": 21.86, "e": 22.26, "line": 12}, {"w": "يوصل", "s": 22.26, "e": 22.66, "line": 12}, {"w": "قبل", "s": 22.66, "e": 22.92, "line": 12}, {"w": "الكل", "s": 22.92, "e": 23.28, "line": 12}, {"w": "الجيف", "s": 24.6, "e": 25.5, "line": 13}, {"w": "جيف", "s": 25.5, "e": 26.16, "line": 13}, {"w": "جيفي", "s": 26.16, "e": 27.06, "line": 13}, {"w": "أبو", "s": 27.06, "e": 27.38, "line": 14}, {"w": "شامة", "s": 27.38, "e": 27.92, "line": 14}, {"w": "الشامة", "s": 27.92, "e": 28.48, "line": 15}, {"w": "بروحها", "s": 28.48, "e": 28.96, "line": 15}, {"w": "سلاح", "s": 28.96, "e": 29.44, "line": 15}, {"w": "سليلي", "s": 30.003, "e": 30.623, "line": 16}, {"w": "الكيوت", "s": 30.623, "e": 31.243, "line": 16}, {"w": "لا", "s": 31.243, "e": 31.563, "line": 17}, {"w": "يغرّك", "s": 31.563, "e": 32.023, "line": 17}, {"w": "شكله", "s": 32.023, "e": 32.443, "line": 17}, {"w": "والعليش", "s": 32.781, "e": 33.481, "line": 18}, {"w": "أبو", "s": 33.481, "e": 33.761, "line": 18}, {"w": "زلف", "s": 33.761, "e": 34.281, "line": 18}, {"w": "زلفه", "s": 34.281, "e": 34.801, "line": 19}, {"w": "يوصل", "s": 34.801, "e": 35.261, "line": 19}, {"w": "قبله", "s": 35.261, "e": 35.801, "line": 19}, {"w": "بثانيتين", "s": 35.801, "e": 36.581, "line": 19}, {"w": "وفي", "s": 37.0, "e": 37.38, "line": 20}, {"w": "الصوب", "s": 37.38, "e": 37.74, "line": 20}, {"w": "الثاني", "s": 37.74, "e": 38.44, "line": 20}, {"w": "علي", "s": 39.6, "e": 40.14, "line": 22}, {"w": "الشبّاس", "s": 40.14, "e": 41.04, "line": 22}, {"w": "النسخة", "s": 41.04, "e": 41.76, "line": 23}, {"w": "التجريبية", "s": 41.76, "e": 42.54, "line": 23}, {"w": "وعبودي", "s": 43.2, "e": 43.8, "line": 24}, {"w": "المتين", "s": 43.8, "e": 44.46, "line": 24}, {"w": "دبابة", "s": 44.46, "e": 45.28, "line": 25}, {"w": "على", "s": 45.28, "e": 45.54, "line": 25}, {"w": "رجلين", "s": 45.54, "e": 46.02, "line": 25}, {"w": "خمسة", "s": 47.6, "e": 48.36, "line": 26}, {"w": "ضد", "s": 48.36, "e": 48.72, "line": 26}, {"w": "ثنين؟", "s": 48.72, "e": 49.3, "line": 26}, {"w": "سهالات", "s": 49.3, "e": 50.02, "line": 27}, {"w": "لا", "s": 52.67, "e": 52.991, "line": 29}, {"w": "والله", "s": 52.991, "e": 53.633, "line": 29}, {"w": "مو", "s": 53.633, "e": 53.954, "line": 30}, {"w": "سهالات!", "s": 53.954, "e": 54.81, "line": 30}, {"w": "انتو", "s": 55.208, "e": 55.808, "line": 31}, {"w": "مستعدين", "s": 55.808, "e": 56.688, "line": 31}, {"w": "للحرب", "s": 56.688, "e": 57.228, "line": 32}, {"w": "العظمى؟", "s": 57.228, "e": 57.748, "line": 32}]/*END*/;
let MARK = /*MARK*/{"fish": 18.4, "mole": 27.38, "trick": 31.243, "zalf": 34.281, "beta": 41.04}/*END*/;   // named word times (e.g. fish punchline)

const glc = document.getElementById('gl'), uic = document.getElementById('ui'), g = uic.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, W / H, .3, 30000);
let world, post, C, PR;
const FILL = new THREE.DirectionalLight(0xFFE8D6, 1.1); scene.add(FILL, FILL.target);   // v2: soft key light from the camera side so faces never go to silhouette

function build(){
  world = buildWorld(scene, renderer);
  post = makePost(renderer, scene, camera, W, H);
  C = {
    leader: makeChar({ skin: 0xC08458, shirt: T.shirt(1, '#FF5FA2', 'palm', '#2E8B57'), pants: 0xF2E6D0, shorts: true, shoes: 0xFFFFFF, hair: 0x15100C, beard: true, glasses: 'gold', hat: 'bucket', hatColor: 0xEAD7A8, chain: true }),
    hasan: makeChar({ skin: 0xB97C52, shirt: T.shirt(2, '#2FC4B8', 'flamingo', '#FF7FB6'), pants: 0x2B2F3A, shoes: 0xFF4F9A, hair: 0x120D0A, mustache: true, beard: true, hat: 'cap', hatColor: 0xFF4F9A }),
    jeff: makeChar({ skin: 0xC9905F, shirt: T.shirt(3, '#FFD24A', 'flower', '#FF5A4F'), pants: 0x3A6EA5, hair: 0x1A120C, mole: true, mustache: true }),
    sulaili: makeChar({ skin: 0xD39C6E, shirt: T.shirt(4, '#C9B3FF', 'heart', '#FF5FA2'), pants: 0xF4F0FF, shorts: true, hair: 0x1B130E, blush: true, glasses: 'dark' }),
    alaish: makeChar({ skin: 0xBE8559, shirt: T.shirt(5, '#FF8A3D', 'leaf', '#2F7A3A'), pants: 0xEEE6D6, shorts: true, hair: 0x100B08, sideburns: 'huge' }),
    ali: makeChar({ skin: 0xC08458, shirt: T.shirt(6, '#1E2F6B', 'track', '#3FE6FF'), pants: 0x1E2F6B, sleeve: 'long', hair: 0x15100C, beard: true, glasses: 'cheap', hat: 'bucket', hatColor: 0x2B3F8F, chain: true }),
    aboudi: makeChar({ skin: 0xB27A50, shirt: T.shirt(7, '#14161C', 'track', '#3FE6FF'), pants: 0x23395E, hair: 0x0E0A08, beard: true, bulk: 1.55 }),
  };
  C.aboudi.scale.setScalar(1.1);
  for (const k in C) scene.add(C[k]);
  PR = {
    car: P.makeCar(0xFF3F9A, '#FF3FD0'), rod: P.makeRod(), fish: P.makeFish(), gun: P.makeWaterGun(),
    phone: new THREE.Mesh(new THREE.BoxGeometry(.08, .16, .015), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .2, metalness: .5 })),
    traffic: [P.makeCar(0x2FC4B8, '#3FF2FF'), P.makeCar(0xF5F2EA, '#FFD23F'), P.makeCar(0xFFC23F, '#FF6F3F')],
    rivalCar: P.makeCar(0x1E2F6B, '#3FE6FF'), parked: P.makeCar(0x7A5BD6, '#B07CFF'),
    hearts: new THREE.Group(), sparks: new THREE.Group(), weed: new THREE.Group(), wheel: new THREE.Mesh(new THREE.TorusGeometry(.18, .025, 8, 24), new THREE.MeshStandardMaterial({ color: 0x111111 })),
  };
  const hg = P.heartGeo(), hm = new THREE.MeshStandardMaterial({ color: 0xFF4FA8, emissive: 0xFF2F88, emissiveIntensity: 1.5, roughness: .3 });
  for (let i = 0; i < 9; i++){ const h = new THREE.Mesh(hg, hm); h.scale.setScalar(.22 + (i % 3) * .06); PR.hearts.add(h); }
  const st = P.sparkleTex(); for (let i = 0; i < 6; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: st, color: new THREE.Color(3, 2.8, 2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); PR.sparks.add(s); }
  const ft = T.frond(); for (let i = 0; i < 4; i++){ const pl = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), new THREE.MeshStandardMaterial({ map: ft, alphaTest: .4, side: THREE.DoubleSide, color: 0xB89A5A })); pl.rotation.set(i * .8, i * 1.3, i * .4); PR.weed.add(pl); }
  for (const k in PR){ const v = PR[k]; (Array.isArray(v) ? v : [v]).forEach(o => { scene.add(o); o.traverse(m => { if (m.isMesh) { m.castShadow = true; } }); }); }
  PR.car.add(PR.wheel); PR.wheel.position.set(.05, 1.12, .42); PR.wheel.rotation.y = Math.PI / 2; PR.wheel.rotation.x = .5;
  C.leader.userData.J.handR.add(PR.rod); PR.rod.position.set(0, -.02, .02);
  C.sulaili.userData.J.handR.add(PR.phone); PR.phone.position.set(0, -.05, .06);
  C.sulaili.userData.J.handL.add(PR.gun); PR.gun.position.set(0, -.06, .05); PR.gun.rotation.set(0, 0, -Math.PI / 2); PR.gun.scale.setScalar(.62);
}

// ---------- helpers ----------
const V = (x, y, z) => new THREE.Vector3(x, y, z);
let ENV, FXv, Q;
function resetFrame(){
  for (const k in C) C[k].visible = false;
  for (const k in PR){ const v = PR[k]; (Array.isArray(v) ? v : [v]).forEach(o => o.visible = false); }
  const SJ = C.sulaili.userData.J; SJ.glasses.visible = false; SJ.glasses.position.y = .035;
  ENV = { tod: 0, bloom: .45, expo: 1 }; Q = [];
  FXv = { vignette: .55, grain: .035, chroma: .0012, whip: 0, whipAng: 0, comic: 0, glitch: 0, gseed: 0, sat: 1.16, temp: .12, contrast: 1.1, flash: 0, letterbox: 1, zoomBlur: 0, bw: 0 };
  post.fx.flashCol.value.setRGB(1, 1, 1);
}
function cam(pos, look, fov = 38, roll = 0, shake = 0, t = 0){
  shake = shake > .2 ? (shake - .02) * .3 : 0;   // v2: no handheld wobble; only a small kick on big impacts
  const n = shake ? V(noise1(t * 7, 1), noise1(t * 7, 2), noise1(t * 7, 3)).multiplyScalar(shake) : V(0, 0, 0);
  camera.position.copy(pos).add(n); camera.fov = fov; camera.updateProjectionMatrix(); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(look.clone().add(n.multiplyScalar(.5)));
  FILL.position.copy(camera.position).add(V(0, 1.5, 0)); FILL.target.position.copy(look);
}
const show = (...xs) => xs.forEach(o => o.visible = true);
const lp3 = (a, b, k) => a.clone().lerp(b, k);
function onScreen(obj){ const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(camera); return [(v.x * .5 + .5) * W, (-v.y * .5 + .5) * H]; }
function standIdle(ch, x, y, z, ry, t, extra = {}, ph = 0){ pose(ch, { x, y, z, ry, ...anim.idle(t, ph), ...extra }); show(ch); }
const vo = i => ({ s: VO[i][0], e: VO[i][1] });

// ---------- shots ----------
let SHOTS = [];
function buildShots(){
  const S = [];
  const add = (t0, t1, o) => S.push({ t0, t1, ...o });
  const v = vo;
  const b1 = v(1).s - .35, b2 = v(2).s - .55, b3 = v(3).s - .45, b4 = v(4).s - .25, b5 = v(5).s - .45, b6 = v(6).s - .4, b7 = v(7).s - .3,
    b8 = v(8).s - .3, b9 = v(9).s - .3, b10 = v(10).s - .25, b11 = v(11).s - .3, b12 = v(12).s - .5, b13 = v(14).s - .7;

  // S1 — aerial: sunset over the ocean, drone turns to reveal Leonida
  add(0, b1, { whipOutAng: 0, run(c){
    const k = eio(seg(c.st, 0, c.d)), ky = eio(seg(c.st, c.d * .42, c.d));
    const pos = lp3(V(30, 230, -320), V(-25, 62, -175), k);
    const yaw = deg(lerp(192, 352, ky)), pitch = deg(lerp(-1.5, -11, ky));
    const look = pos.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(100));
    cam(pos, look, 44, deg(lerp(-4, 1.5, k)), .25, c.t); ENV.expo = lerp(.75, 1, k); ENV.bloom = lerp(.3, .45, k); world.setFocus(V(0, 0, 30)); ENV.tod = .2;
    FXv.flash = 1 - seg(c.t, 0, .5); FXv.flashCol = [0, 0, 0];
    trafficRun(c.st + 3, 1);
  }});
  // S1b — wifi gag
  add(b1, b2, { whipIn: false, run(c){
    const ch = C.sulaili, p = V(-36, 0, 26);
    standIdle(ch, p.x, 0, p.z, Math.PI, c.st, { aR: [0, 2.9, -.25, 0], hp: -.35, brow: -.35, browUp: .012, mouth: 'o', mouthOpen: .6, look: [0, 1] }, 2);
    cam(V(-36.9, 1.45, 22.6).add(V(0, 0, .25 * eo(seg(c.lt, 0, c.d)))), V(-36.1, 1.85, 26), 40, deg(-3), .015, c.t);
    show(PR.phone); world.setFocus(p); ENV.tod = .3;
    const [sx, sy] = onScreen(ch.userData.J.handR); Q.push(g2 => UI.wifi(g2, cl(sx + 230, 300, 1620), cl(sy + 60, 290, 780), seg(c.lt, .1, .55)));
    FXv.flash = .9 * (1 - seg(c.lt, 0, .12));
  }});
  // S2 — Ocean Drive crane + title slam
  add(b2, b3, { run(c){
    const k = seg(c.st, 0, c.d), x = lerp(-120, -20, eio(k));
    cam(V(x, lerp(1.1, 32, eio(seg(c.st, .6, c.d))), lerp(45, 30, eio(k))), V(x + 60, lerp(4, 12, eio(k)), 64), lerp(36, 46, k), deg(lerp(2, -2, k)), .2, c.t);
    world.setFocus(V(x + 20, 0, 50)); ENV.tod = .35; trafficRun(c.st + 8, 1.2);
    const ts = c.t - (v(2).e + .02);
    Q.push(g2 => { UI.bigTitle(g2, 'الحرب العظمى', 960, 450, seg(ts, 0, .35), { size: 230 }); UI.txt(g2, 'ليونيدا  •  19.11.2026', 960, 610, { font: '64px Lalezar', fill: '#FFFFFF', stroke: '#000', sw: 10, glow: '#FF3FA4', gb: 22, alpha: seg(ts, .35, .7) }); });
    if (ts > 0) { FXv.flash = .8 * (1 - seg(ts, 0, .18)); FXv.chroma = .004 * (1 - seg(ts, 0, .5)); }
  }});
  // S3 — heroes walk toward camera, backlit by the sunset
  add(b3, b4, { run(c){
    const team = [[C.leader, 0, 0], [C.hasan, -1.5, .6], [C.jeff, 1.5, .5], [C.sulaili, -2.9, 1.2], [C.alaish, 2.9, 1.1]];
    team.forEach(([ch, dx, dz], i) => { const z = 6 + dz + c.st * .75; pose(ch, { x: dx, z, ry: 0, ...anim.walk(c.st, .55, i * 1.3), flap: ch === C.alaish ? Math.sin(c.st * 6) * .25 : 0 }); show(ch); });
    show(PR.rod); cam(V(.2, .9, 15.8 + c.st * .45), V(0, 1.9, 2), 32, deg(1.5), .02, c.t); world.setFocus(V(0, 0, 9)); ENV.tod = .9; ENV.expo = .62; ENV.bloom = .22;
    Q.push(g2 => UI.teamBadge(g2, 'فريق الصياد', 960, 300, seg(c.t, v(3).s - .1, v(3).s + .35), 'sayyad'));
    FXv.temp = .25;
  }});
  // S4 — the leader on the pier: catches a fish wearing sunglasses
  add(b4, b5, { freezeAt: v(4).e - .25, card: { name: 'الشبّاس الصيّاد', sub: 'القائد', team: 'sayyad', teamLabel: 'فريق الصياد', stats: [['القيادة', 1, '100%'], ['الصيد', 1, '100%'], ['الخوف', 0.02, '0%']] }, run(c){
    const E = world.pierEnd, punch = (MARK.fish ?? (v(4).e - 1.1)) - c.t0, ls = c.st;
    const turn = eo(seg(ls, punch + .15, punch + .7));
    const ch = C.leader; const base = { x: E.x - .3, y: E.y, z: E.z - 4.3, ry: lerp(Math.PI, Math.PI * .25, turn) };
    const reel = seg(ls, punch - .45, punch);
    pose(ch, { ...base, ...anim.idle(ls), aR: [lerp(-1.1, -1.9, reel) + Math.sin(ls * 18) * .05 * (1 - turn), .15, lerp(-.5, -.2, turn), 0], aL: [-.9, -.1, -1.2, .4], lean: -.08 * reel, hy: turn * .25, mouth: turn > .5 ? 'smile' : 'flat', brow: turn * .3 });
    show(ch, PR.rod); PR.rod.rotation.set(lerp(-.9, -.25, reel), 0, 0);
    // fish flies out of the water toward camera
    const fk = seg(ls, punch - .25, punch + .35); show(PR.fish);
    const fp = lp3(V(E.x - 2.2, -.2, E.z - 11), V(E.x - 1.1, E.y + 1.95, E.z - 3.45), eo(fk)); fp.y += Math.sin(fk * Math.PI) * 1.1;
    PR.fish.position.copy(fp); PR.fish.rotation.set(0, -Math.PI / 2 + Math.sin(ls * 14) * .3 * (1 - fk * .5), Math.sin(ls * 9) * .4); PR.fish.scale.setScalar(1.1);
    if (fk <= 0) PR.fish.visible = false;
    cam(V(E.x + 3.6, E.y + 1.65, E.z - 1.2).lerp(V(E.x + 2.9, E.y + 1.55, E.z - 2.0), eio(seg(ls, 0, c.d))), V(E.x - .7, E.y + 1.45, E.z - 5.4), 38, deg(-2), .03, c.t);
    world.setFocus(V(E.x, E.y, E.z - 4)); ENV.tod = .8; ENV.expo = .72; ENV.bloom = .3;
    if (fk > 0) Q.push(g2 => { const [sx, sy] = onScreen(PR.fish); UI.pop(g2, 'حتى السمك!', cl(sx + 60, 330, 1000), cl(sy + 270, 330, 820), seg(c.t, c.t0 + punch + .1, c.t0 + punch + 1.6), { color: '#FF6F3F', size: 70, rot: .1 }); });
  }});
  // S5 — Hasan "the horn" arrives first
  add(b5, b6, { freezeAt: v(5).e + .42, card: { name: 'حسن محمد البيب', sub: 'يوصل قبل الكل', team: 'sayyad', teamLabel: 'فريق الصياد', stats: [['السرعة', .99, '99%'], ['استخدام الهرن', 1.25, '1000%'], ['الفرامل', .03, '3%']] }, run(c){
    const ls = c.st, arrive = eo(seg(ls, 0, 1.3)), carX = lerp(-26, 18, arrive), carZ = 47.6;
    const honk = (v(5).e - c.t0) + .05, hb = [0, .32].map(o => Math.max(0, 1 - Math.abs(ls - honk - o) * 7));
    const bounce = Math.max(...hb) * .09 + (1 - arrive) * Math.sin(ls * 30) * .01;
    PR.car.position.set(carX, bounce, carZ); PR.car.rotation.set(0, 0, -bounce * .4 + (1 - seg(ls, 1.1, 1.5)) * .02 * arrive); show(PR.car, PR.wheel);
    PR.car.userData.wheels.forEach(w => w.rotation.z = -carX * 2.6);
    const ch = C.hasan; pose(ch, { x: carX - .62, y: .16 + bounce, z: carZ + .38, ry: Math.PI / 2, lL: [-1.45, 1.35], lR: [-1.45, 1.35], aL: [-1.25, -.05, -.6, .2], aR: hb[0] > .05 || hb[1] > .05 ? [-1.1, .35, -1.3, 0] : [-1.25, .05, -.6, -.2], hy: lerp(0, -1.0, seg(ls, 1.3, 1.8)), mouth: 'smile', brow: .25, ...{ blink: (ls % 2.7) < .1 } }); show(ch);
    cam(V(lerp(12, 23.5, eio(seg(ls, 0, 1.6))), 1.55, 42.2), V(lerp(6, 17.6, eio(seg(ls, 0, 1.6))), 1.2, 48.5), 40, deg(-1.5), .02, c.t);
    world.setFocus(V(carX, 0, carZ)); ENV.tod = .45; ENV.expo = .84; FXv.contrast = 1.2; FXv.sat = 1.28; trafficRun(ls + 20, .6, true);
    Q.push(g2 => { const [sx, sy] = onScreen(PR.car); UI.pop(g2, 'بيب!', sx - 240, sy - 300, seg(c.t, c.t0 + honk - .05, c.t0 + honk + .9), { color: '#FF3FA4', rot: -.15 }); UI.pop(g2, 'بيب!', sx + 120, sy - 380, seg(c.t, c.t0 + honk + .27, c.t0 + honk + 1.2), { color: '#3FE6FF', rot: .12, size: 70 }); });
  }});
  // S6 — Jeff: dolly-zoom on the legendary mole
  add(b6, b7, { freezeAt: v(6).e - .1, card: { name: 'الجيف جيف جيفي', stutter: ['الجيف ', 'جيف ', 'جيفي'], sub: 'أبو شامة', team: 'sayyad', teamLabel: 'فريق الصياد', nameSize: 74, stats: [['الدقة', .7, '70%'], ['الشامة', 1.25, '∞'], ['التكرار', .9, 'x3']] }, run(c){
    const ls = c.st, p = V(-52, .16, 58.4), ch = C.jeff;
    standIdle(ch, p.x, p.y, p.z, Math.PI, ls, { hy: -.18, hr: .05, brow: .15, mouth: 'smile', look: [-.4, 0] }, 1);
    const dz = eio(seg(ls, 0, c.d)), dist = lerp(4.2, 1.15, dz), fov = 2 * Math.atan(0.85 / dist) * 180 / Math.PI;
    cam(V(p.x - .25, 1.62 + p.y, p.z - dist), V(p.x - .1, 1.7 + p.y, p.z), fov, deg(1.5), .006, c.t);
    world.setFocus(p); ENV.tod = .55;
    const ding = (MARK.mole ?? (v(6).s + 1.2));
    const dk = seg(c.t, ding, ding + .25); const J = ch.userData.J;
    if (c.t >= ding){ show(PR.sparks); const mp = new THREE.Vector3(); J.mole.getWorldPosition(mp); PR.sparks.children.forEach((s, i) => { s.visible = i === 0; s.position.copy(mp).add(V(0, 0, -.03)); s.scale.setScalar(.045 * (1 + Math.sin(c.t * 20) * .2) * elastic(cl(dk))); }); }
    Q.push(g2 => { const [sx, sy] = onScreen(J.mole); UI.circleMark(g2, sx, sy, 46, seg(c.t, ding + .15, ding + .8), 'الشامة'); });
  }});
  // S7 — Sulaili: cute... then not
  add(b7, b8, { freezeAt: v(7).e - .05, card: { name: 'سليلي الكيوت', sub: 'السلاح السري', team: 'sayyad', teamLabel: 'فريق الصياد', stats: [['اللطافة', 1, '100%'], ['الخطورة', 1.25, '???'], ['البراءة', .4, '40%']] }, run(c){
    const ls = c.st, ch = C.sulaili, p = V(-42.5, 0, 24.5);
    const twist = (MARK.trick ?? (v(7).s + .95)) - c.t0, tw = seg(ls, twist, twist + .25);
    standIdle(ch, p.x, 0, p.z, Math.PI + .25, ls, tw > 0 ? { aL: [-1.45, .05, -.1, .15], aR: [0, .2, -.1, 0], brow: -.45, mouth: 'flat', eyes: .9, hy: -.1 } : { ...anim.wave(ls), hr: Math.sin(ls * 4) * .12, mouth: 'smile', brow: .3, eyes: 1.15 }, 4);
    const J = ch.userData.J; J.glasses.visible = tw > 0; J.glasses.position.y = .035 + (1 - eo(tw)) * .5;
    show(PR.hearts); PR.hearts.visible = tw < 1; PR.hearts.children.forEach((h, i) => { const a = i * .7 + ls * 1.2; h.position.set(p.x + Math.cos(a) * (.9 + i * .05), 1 + ((ls * .5 + i * .23) % 1.6), p.z - .6 + Math.sin(a) * .5); h.rotation.y = ls * 2 + i; });
    if (tw > 0) show(PR.gun);
    cam(V(p.x + 1.3, 1.45, p.z - 4.4).lerp(V(p.x + .8, 1.5, p.z - 3.3), eio(seg(ls, 0, c.d))), V(p.x - .1, 1.3, p.z), 36, deg(-2), .01, c.t);
    world.setFocus(p); ENV.tod = .5;
    if (tw > 0){ FXv.temp = -.2; FXv.flash = .5 * (1 - seg(ls, twist, twist + .15)); post.fx.flashCol.value.setRGB(1, .2, .3); FXv.chroma = .004; }
    Q.push(g2 => { if (tw <= 0) UI.pop(g2, '+100 لطافة', 640, 360, seg(c.t, c.t0 + .4, c.t0 + 1.9), { color: '#FF8FE8', size: 64, rot: -.08 }); });
  }});
  // S8 — Alaish: shampoo-commercial slow motion; the sideburns arrive first
  add(b8, b9, { freezeAt: v(8).e - .15, card: { name: 'العليش أبو زلف', sub: 'زلفه يوصل قبله', team: 'sayyad', teamLabel: 'فريق الصياد', stats: [['طول الزلف', 1.25, '∞'], ['مقاومة الريح', .02, '0%'], ['القرارات الحكيمة', .07, '7%']] }, run(c){
    const ls = c.st, ch = C.alaish, p = V(-8, 0, 5);
    const arrive = (MARK.zalf ?? (v(8).s + 1.4)) - c.t0, enter = eo(seg(ls, arrive - .2, arrive + 1.4));
    standIdle(ch, p.x - (1 - enter) * 2.2, 0, p.z, Math.PI * .5 + .35, ls * .5, { flap: .22 + Math.sin(ls * 7) * .18, hp: -.12, hr: .08, mouth: 'smile', brow: .3, aR: [-.2, .2, -2.2, .3] }, 3);
    const orbit = lerp(.75, 1.25, eio(seg(ls, 0, c.d)));
    cam(V(p.x + Math.sin(orbit) * 2.9, 1.6, p.z + Math.cos(orbit) * 2.9), V(p.x, 1.62, p.z), 34, deg(-3), .01, c.t); ENV.expo = .85; ENV.bloom = .3;
    world.setFocus(p); ENV.tod = 1.0; FXv.temp = .3; FXv.vignette = .7;
    Q.push(g2 => { if (ls < arrive + .2) UI.txt(g2, 'الزلف وصل ✔', 960, 300, { font: '70px Lalezar', fill: '#fff', stroke: '#000', sw: 10, alpha: seg(c.t, c.t0 + .3, c.t0 + .6) });
      const lk = seg(c.t, c.t0 + .3, c.t0 + arrive); if (lk < 1) { UI.txt(g2, 'العليش: جاري التحميل...', 960, 390, { font: '800 44px Tajawal', fill: '#FFC83A', stroke: '#000', sw: 8, alpha: seg(c.t, c.t0 + .5, c.t0 + .8) }); g2.fillStyle = 'rgba(255,255,255,.25)'; g2.fillRect(760, 430, 400, 16); g2.fillStyle = '#FFC83A'; g2.fillRect(760, 430, 400 * lk, 16); } });
  }});
  // S9 — "on the other side": glitch into dusk, two silhouettes in the headlights
  add(b9, b10, { glitchIn: true, run(c){
    const ls = c.st; ENV.tod = 2; ENV.bloom = .75;
    PR.rivalCar.position.set(232, 0, 50.5); PR.rivalCar.rotation.y = Math.PI; show(PR.rivalCar);
    standIdle(C.ali, 226, .03, 49.2, -Math.PI / 2, ls, anim.cross(), 1); standIdle(C.aboudi, 226, .03, 51.4, -Math.PI / 2, ls, anim.cross(), 2);
    cam(V(lerp(196, 214, eio(seg(ls, 0, c.d))), .7, 50.2), V(240, 1.6, 50.3), 30, 0, .02, c.t); world.setFocus(V(226, 0, 50));
    FXv.glitch = .9 * (1 - seg(ls, 0, .5)); FXv.gseed = Math.floor(c.t * 24); FXv.temp = -.35; FXv.sat = .95;
  }});
  // S10 — Ali: the beta version
  add(b10, b11, { freezeAt: v(10).e - .2, card: { name: 'علي الشبّاس', sub: 'النسخة التجريبية', team: 'rival', teamLabel: 'الفريق الثاني', stats: [['الأصالة', .12, '12%'], ['الثقة', 1.25, '200%'], ['التقليد', 1, '100%']] }, run(c){
    const ls = c.st, ch = C.ali, p = V(224, .03, 49.4); ENV.tod = 2; ENV.bloom = .75;
    standIdle(ch, p.x, p.y, p.z, -Math.PI / 2 - .55, ls, { aR: [-1.4, .15, -.2, 0], aL: [-.9, -.1, -1.2, .4], mouth: 'smile', brow: .3, hy: .2 }, 1);
    PR.rivalCar.position.set(232, 0, 50.5); PR.rivalCar.rotation.y = Math.PI; show(PR.rivalCar);
    cam(V(p.x - 3.3, 1.5, p.z - 1.0), V(p.x, 1.45, p.z), 34, deg(2), .015, c.t); world.setFocus(p);
    const st = (MARK.beta ?? (v(10).s + 1.1));
    const gl = (Math.sin(c.t * 37) > .85 ? .5 : 0) + .6 * (1 - seg(c.t, st, st + .3)) * (c.t > st ? 1 : 0);
    FXv.glitch = gl; FXv.gseed = Math.floor(c.t * 30); FXv.temp = -.35;
    Q.push(g2 => UI.stamp(g2, 'BETA', 620, 420, seg(c.t, st, st + 1.5), { color: '#3FE6FF' }));
  }});
  // S11 — Aboudi: the human tank
  add(b11, b12, { freezeAt: v(11).e - .1, card: { name: 'عبودي المتين', sub: 'دبابة على رجلين', team: 'rival', teamLabel: 'الفريق الثاني', stats: [['الصلابة', 1, '100%'], ['السرعة', .05, '5%'], ['قابلية التحريك', .0, '0%']] }, run(c){
    const ls = c.st, ch = C.aboudi; ENV.tod = 2; ENV.bloom = .75;
    const z = 50.3, x = lerp(232, 226.5, seg(ls, 0, c.d * .9)), w = anim.walk(ls, .42);
    pose(ch, { x, z, ry: -Math.PI / 2, ...w, aL: [-.2, -.35, -.3], aR: [.2, .35, -.3], brow: -.35, mouth: 'flat' }); show(ch);
    const step = Math.pow(Math.max(0, Math.cos(ls * 5.5 * .42 * 2)), 18);
    PR.parked.position.set(229, step * .12, 46.6); PR.parked.rotation.set(0, 0, step * .03); show(PR.parked);
    cam(V(x - 5.6, 1.15, z - 1.4), V(x, 1.65, z), 32, deg(-2), .015 + step * .05, c.t); world.setFocus(V(x, 0, z));
    FXv.temp = -.35; FXv.flash = step * .12; post.fx.flashCol.value.setRGB(1, .3, .2);
    if (Math.sin(c.t * 14) > 0 && ls > .8) Q.push(g2 => { g2.fillStyle = 'rgba(255,170,40,.10)'; g2.fillRect(0, 119, W, 842); });
    Q.push(g2 => UI.pop(g2, 'بووم', 520, 300, seg(ls % 1.36, .02, .9), { color: '#3FE6FF', size: 60, rot: -.2 }));
  }});
  // S12 — the standoff on Ocean Drive (5 vs 2), then Aboudi steps forward
  add(b12, b13, { run(c){
    const ls = c.st; ENV.tod = 1.6; ENV.bloom = .65;
    const stomp = (v(13).s - c.t0) - .55, back = eo(seg(ls, stomp + .05, stomp + .4)), jump = Math.sin(seg(ls, stomp + .05, stomp + .4) * Math.PI) * .35;
    const L = [[C.leader, -2.7, 50], [C.hasan, -3.7, 48.9], [C.jeff, -3.8, 51.1], [C.sulaili, -4.8, 49.7], [C.alaish, -4.9, 51.8]];
    const laugh = seg(c.t, v(12).s + .9, v(12).e + .3) * (1 - back);
    L.forEach(([ch, x, z], i) => standIdle(ch, x - back * 1.2, jump, z, Math.PI / 2, ls, laugh > 0 ? { ...anim.flex(ls + i), lean: -.1 } : { flap: ch === C.alaish ? .15 + Math.sin(ls * 6) * .15 : 0 }, i));
    if (back > 0){ const S = C.sulaili; S.position.x = -6.1; S.position.z = 52.4; }
    C.sulaili.userData.J.glasses.visible = true;
    const ax = lerp(2.9, 2.0, eo(seg(ls, stomp - .3, stomp)));
    standIdle(C.ali, 3.0, 0, 49.4, -Math.PI / 2, ls, anim.cross(), 5); standIdle(C.aboudi, ax, 0, 51.1, -Math.PI / 2, ls, { ...anim.cross(), lR: [ls > stomp - .3 && ls < stomp ? -.6 : 0, .2] }, 6);
    const shake = Math.max(0, 1 - Math.abs(ls - stomp) * 4) * .35;
    const pull = eio(seg(ls, 0, c.d));
    cam(V(-.5, lerp(1.9, 1.55, pull), lerp(60.4, 59.0, pull)), V(-.6, 1.5, 40), 44, 0, .02 + shake, c.t); world.setFocus(V(0, 0, 50)); ENV.expo = .8;
    if (ls < 1.9) Q.push(g2 => UI.vsSplit(g2, seg(ls, 0, .5) * (1 - seg(ls, 1.4, 1.9)) * 1.6, 'فريق الصياد  (5)', 'الفريق الثاني  (2)'));
    show(PR.weed); PR.weed.position.set(lerp(-12, 12, seg(ls, 1.6, 5)), .45 + Math.abs(Math.sin(ls * 6)) * .3, 46.8); PR.weed.rotation.z = -ls * 6;
    FXv.flash = Math.max(0, 1 - Math.abs(ls - stomp) * 6) * .3;
  }});
  // S13 — finale: crane to the sky, the question, title card
  add(b13, DUR, { run(c){
    const ls = c.st, k = eio(seg(ls, 0, c.d * .7)); ENV.tod = 1.7; ENV.bloom = .75;
    const L = [[C.leader, -3.9, 50], [C.hasan, -4.9, 48.9], [C.jeff, -5.0, 51.1], [C.sulaili, -6.1, 52.4], [C.alaish, -6.1, 51.8]];
    L.forEach(([ch, x, z], i) => standIdle(ch, x, 0, z, Math.PI / 2, ls, {}, i)); C.sulaili.userData.J.glasses.visible = true;
    standIdle(C.ali, 3.0, 0, 49.4, -Math.PI / 2, ls, anim.cross(), 5); standIdle(C.aboudi, 2.0, 0, 51.1, -Math.PI / 2, ls, anim.cross(), 6);
    cam(V(0, lerp(1.6, 42, k), lerp(58.4, 18, k)), V(0, lerp(1.6, 40, k), lerp(40, -600, k)), lerp(38, 50, k), 0, .02, c.t); world.setFocus(V(0, 0, 50)); ENV.expo = .8;
    const qs = v(14).s;
    Q.push(g2 => { const a = seg(c.t, qs - .1, qs + .5) * (1 - seg(c.t, DUR - 3.0, DUR - 2.6));
      UI.txt(g2, 'انتو مستعدين', 960, 420, { font: '120px Lalezar', fill: '#FFFFFF', stroke: '#000', sw: 12, glow: '#FF3FA4', gb: 30, alpha: a });
      UI.txt(g2, 'للحرب العظمى؟', 960, 580, { font: '150px Lalezar', fill: '#FFC83A', stroke: '#000', sw: 14, glow: '#FF8A2E', gb: 36, alpha: seg(c.t, qs + .9, qs + 1.3) * (1 - seg(c.t, DUR - 3.0, DUR - 2.6)) });
      const fk = seg(c.t, DUR - 2.6, DUR - 2.25);
      if (fk > 0){ g2.fillStyle = `rgba(0,0,0,${.55 * fk})`; g2.fillRect(0, 0, W, H); UI.bigTitle(g2, 'الحرب العظمى', 960, 470, fk, { size: 240 });
        UI.txt(g2, 'الشبّاس الصيّاد  ×  علي الشبّاس', 960, 650, { font: '64px Lalezar', fill: '#fff', stroke: '#000', sw: 10, alpha: seg(c.t, DUR - 2.2, DUR - 1.9) });
        UI.txt(g2, '19.11.2026  •  ليونيدا', 960, 740, { font: '900 52px Anton', dir: 'rtl', fill: '#FFC83A', alpha: seg(c.t, DUR - 2.0, DUR - 1.7) });
        UI.finePrint(g2, '* فريق الصياد لا يتحمل مسؤولية قرارات العليش', seg(c.t, DUR - 1.6, DUR - 1.3)); } });
    FXv.flash = Math.max(0, 1 - seg(c.t, DUR - 2.6, DUR - 2.35)) * (c.t > DUR - 2.6 ? .8 : 0);
    if (c.t > DUR - .45){ FXv.flash = seg(c.t, DUR - .45, DUR); post.fx.flashCol.value.setRGB(0, 0, 0); }
  }});
  for (const s of S) if (s.freezeAt != null) s.freezeAt = cl(s.freezeAt, s.t1 - .9, s.t1 - .28);
  SHOTS = S;
}
function sm2(k){ return k * k * (3 - 2 * k); }
function trafficRun(t, sp = 1, far = false){
  PR.traffic.forEach((car, i) => { const lane = i % 2 ? 46.6 : 53.4, dir = i % 2 ? 1 : -1, x = ((t * (10 + i * 4) * sp + i * 70) % 260) - 130;
    car.position.set(dir * x + (far ? 60 : 0), 0, lane); car.rotation.y = dir > 0 ? 0 : Math.PI; car.userData.wheels.forEach(w => w.rotation.z = -x * 2.6 * dir); show(car); });
}

// ---------- render ----------
function seek(t, out = null){
  t = cl(t, 0, DUR - 1e-4);
  const i = SHOTS.findIndex(s => t >= s.t0 && t < s.t1), sh = SHOTS[i < 0 ? SHOTS.length - 1 : i];
  resetFrame();
  const lt = t - sh.t0, d = sh.t1 - sh.t0, frozen = sh.freezeAt != null && t > sh.freezeAt;
  const st = frozen ? sh.freezeAt - sh.t0 : lt;
  sh.run({ t, lt, st, d, t0: sh.t0 });
  // whip transitions between shots (camera yaw kick + directional blur)
  const wOut = 0, wIn = 0;   // v2: clean cuts instead of whip pans
  if (wOut || wIn){ const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), wOut * .45 - wIn * .45); camera.quaternion.premultiply(q); FXv.whip = Math.max(wOut, wIn) * 1.2; }
  if (sh.glitchIn){ FXv.glitch = Math.max(FXv.glitch, 1 - seg(lt, 0, .35)); FXv.gseed = Math.floor(t * 30); }
  if (i < SHOTS.length - 1 && SHOTS[i + 1].glitchIn){ const k = seg(lt, d - .3, d); FXv.glitch = Math.max(FXv.glitch, k); FXv.gseed = Math.floor(t * 30); }
  // comic freeze-frame
  if (frozen){ const fk = seg(t, sh.freezeAt, sh.freezeAt + .12); FXv.comic = fk; FXv.flash = Math.max(FXv.flash, .6 * (1 - seg(t, sh.freezeAt, sh.freezeAt + .15))); FXv.sat = 1.25; }
  world.apply(sh.t0 + st, ENV.tod, camera); renderer.toneMappingExposure *= ENV.expo;
  post.bloom.strength = ENV.bloom;
  const f = post.fx; for (const k in FXv){ if (k === 'flashCol') continue; if (f[k]) f[k].value = FXv[k]; }
  if (FXv.flashCol) f.flashCol.value.setRGB(...FXv.flashCol);
  f.time.value = t;
  post.composer.render();
  // overlay: drawn straight onto the export canvas when capturing (no canvas-to-canvas readback)
  const G = out || g; if (out) out.drawImage(glc, 0, 0); else g.clearRect(0, 0, W, H);
  for (const q of Q) q(G);
  if (sh.card){ const c0 = sh.t0 + .35; let k = seg(t, c0, c0 + .5); if (t > sh.t1 - .25) k = 1 + seg(t, sh.t1 - .25, sh.t1); UI.nameCard(G, k, sh.card); }
  const rival = t >= SHOTS[9].t0 && t < SHOTS[12].t0;
  if (t < VO[14][0] - .2) UI.captions(G, t, WORDS, rival ? '#3FE6FF' : '#FFC83A');
}
window.seek = seek;
window.__events = () => {
  const E = [], add = (type, t, x = {}) => E.push({ type, t: +t.toFixed(3), ...x });
  SHOTS.forEach((s, i) => { if (i > 0) add(s.glitchIn ? 'glitch' : 'whip', s.t0); if (s.card){ add('card', s.t0 + .35); if (s.freezeAt != null) add('freeze', s.freezeAt); } });
  const S = i => SHOTS[i], v = i => ({ s: VO[i][0], e: VO[i][1] });
  add('scratch', S(1).t0); add('title', v(2).e + .02); add('badge', v(3).s - .1);
  add('splash', MARK.fish - .25); add('pop', MARK.fish + .1); add('reel', MARK.fish - .45);
  add('car', S(5).t0); add('screech', S(5).t0 + 1.05); add('honk', v(5).e + .05); add('honk', v(5).e + .37);
  add('ding', MARK.mole); add('scribble', MARK.mole + .15); [0, .12, .24].forEach(o => add('blip', S(6).t0 + .4 + o));
  add('cute', S(7).t0 + .4); add('danger', MARK.trick);
  add('wind', S(8).t0, { d: S(8).t1 - S(8).t0 }); add('check', S(8).t0 + .3); add('loading', S(8).t0 + .5, { d: MARK.zalf - S(8).t0 - .5 }); add('arrive', MARK.zalf);
  add('beta', MARK.beta);
  for (let n = 0; n * 1.36 < S(11).t1 - S(11).t0; n++) add('step', S(11).t0 + n * 1.36); add('alarm', S(11).t0 + 1.36, { d: 2.2 });
  add('vs', S(12).t0); add('whistle', S(12).t0 + 1.2); add('tumble', S(12).t0 + 1.6); add('stomp', v(13).s - .55); add('flex', v(12).s + .9);
  add('riser', S(13).t0 - 1.2); add('final', DUR - 2.6); add('end', DUR - .45);
  return { shots: SHOTS.map(s => [s.t0, s.t1]), VO, MARK, events: E.sort((a, b) => a.t - b.t) };
};
window.__dbg = t => ({ shots: SHOTS.map((s, i) => [i, +s.t0.toFixed(2), +s.t1.toFixed(2), s.card ? s.card.name : '']), idx: SHOTS.findIndex(s => t >= s.t0 && t < s.t1) });
const outC = document.createElement('canvas'); outC.width = W; outC.height = H; const og = outC.getContext('2d');
window.frame = (t, q = .92) => { seek(t, og); return outC.toDataURL('image/jpeg', q); };
window.DUR = DUR;
window.ready = (async () => {
  await Promise.all(['120px Lalezar', '900 60px Tajawal', '800 40px Tajawal', '700 30px Tajawal', '900 60px Anton'].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  build(); buildShots(); seek(0); return true;
})();
if (!location.search.includes('render')) window.ready.then(() => { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); }; loop(); });
