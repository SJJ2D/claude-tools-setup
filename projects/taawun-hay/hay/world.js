// جولة في حيّ التعاون – عالم ثلاثي الأبعاد يميّز فيه التلميذ السلوك التعاوني
import * as THREE from 'three';
try { await Promise.race([Promise.all([document.fonts.load('900 60px Tajawal'), document.fonts.load('40px Lalezar')]), new Promise((r) => setTimeout(r, 2500))]); } catch (e) {}

const $ = (s) => document.querySelector(s);
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

// ---------------------------------------------------------------- renderer & scene
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfeaff, 70, 170);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 400);

// sky dome with vertical gradient
{
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#3f8fe0'); gr.addColorStop(0.45, '#8fd0ff'); gr.addColorStop(0.62, '#dff3ff'); gr.addColorStop(1, '#fff3d6');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false }));
  scene.add(sky);
}
scene.add(new THREE.HemisphereLight(0xdff3ff, 0x7aa35a, 0.95));
const sunLight = new THREE.DirectionalLight(0xfff1d0, 2.1);
sunLight.position.set(40, 60, 25);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
Object.assign(sunLight.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 160 });
sunLight.shadow.bias = -0.0006;
scene.add(sunLight); scene.add(sunLight.target);

// ---------------------------------------------------------------- helpers
const M = {};
function mat(color, opt = {}) {
  const k = color + JSON.stringify(opt);
  if (!M[k]) M[k] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, flatShading: true }, opt));
  return M[k];
}
function mesh(geo, color, x = 0, y = 0, z = 0, opt) {
  const m = new THREE.Mesh(geo, typeof color === 'object' ? color : mat(color, opt));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}
const rnd = (a, b) => a + Math.random() * (b - a);
const colliders = []; // {x,z,r}
function block(x, z, r) { colliders.push({ x, z, r }); }
const anim = []; // per-frame callbacks (t, dt)

// text sprite (Arabic)
function textSprite(text, opts = {}) {
  const fs = opts.size || 64, pad = 28;
  const c = document.createElement('canvas'); const g = c.getContext('2d');
  g.font = `900 ${fs}px Tajawal, Tahoma`;
  const w = Math.ceil(g.measureText(text).width) + pad * 2, h = fs + pad * 1.6;
  c.width = w; c.height = h;
  g.font = `900 ${fs}px Tajawal, Tahoma`; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = opts.bg || 'rgba(255,253,243,.95)';
  const r = h / 2; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, r); g.fill();
  g.lineWidth = 6; g.strokeStyle = opts.border || '#f2b705'; g.stroke();
  g.fillStyle = opts.color || '#0b5e40'; g.fillText(text, w / 2, h / 2 + 4);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true, transparent: true }));
  const sc = (opts.scale || 1) * 0.012; sp.scale.set(w * sc, h * sc, 1);
  sp.userData.canvasW = w; return sp;
}

// ---------------------------------------------------------------- ground, beach, sea, paths
{
  const geo = new THREE.PlaneGeometry(220, 220, 80, 80); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, cols = [];
  const cA = new THREE.Color(0x7cc255), cB = new THREE.Color(0x96d46a), cS = new THREE.Color(0xf1d9a0);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const d = Math.hypot(x, z);
    let y = d > 75 ? (d - 75) * 0.25 + Math.sin(x * 0.2) * Math.cos(z * 0.2) * 1.5 : Math.sin(x * 0.15) * Math.cos(z * 0.13) * 0.18;
    if (z < -38) y = Math.min(y, -0.05 - (-38 - z) * 0.06);
    pos.setY(i, y);
    const c = z < -33 ? cS.clone() : cA.clone().lerp(cB, (Math.sin(x * 0.3) * Math.cos(z * 0.27) + 1) / 2);
    if (z < -33 && z > -36) c.lerp(cA, (z + 36) / 3);
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  ground.receiveShadow = true; ground.name = 'ground'; scene.add(ground);

  // sea
  const sg = new THREE.PlaneGeometry(260, 90, 90, 30); sg.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0x1fa3d6, roughness: 0.35, metalness: 0.1, flatShading: true, transparent: true, opacity: 0.93 }));
  sea.position.set(0, -0.35, -86); sea.receiveShadow = true; scene.add(sea);
  const base = sg.attributes.position.array.slice();
  anim.push((t) => {
    const p = sg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], z = base[i * 3 + 2];
      p.setY(i, Math.sin(x * 0.25 + t * 1.4) * 0.18 + Math.cos(z * 0.3 + t * 1.1) * 0.15);
    }
    p.needsUpdate = true;
  });

  // plaza
  const plaza = mesh(new THREE.CylinderGeometry(9, 9, 0.12, 40), 0xe9d8b4, 0, 0.06, 0); scene.add(plaza);
  const ring = mesh(new THREE.TorusGeometry(9, 0.25, 6, 48), 0xc9a227, 0, 0.12, 0); ring.rotation.x = Math.PI / 2; scene.add(ring);
}
function path(x1, z1, x2, z2) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const p = mesh(new THREE.BoxGeometry(2.6, 0.08, len), 0xe6cf9c, (x1 + x2) / 2, 0.04, (z1 + z2) / 2);
  p.rotation.y = Math.atan2(x2 - x1, z2 - z1); p.castShadow = false; scene.add(p);
}

// ---------------------------------------------------------------- fountain
{
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(3, 3.3, 0.8, 16), 0xf3e3c8, 0, 0.4, 0));
  g.add(mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.2, 16), 0x5ec4f0, 0, 0.75, 0, { roughness: 0.2 }));
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.45, 2.2, 8), 0xf3e3c8, 0, 1.6, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.2, 0.6, 0.35, 12), 0xf3e3c8, 0, 2.7, 0));
  scene.add(g); block(0, 0, 3.6);
  const N = 160, geo = new THREE.BufferGeometry(), arr = new Float32Array(N * 3), vel = [];
  for (let i = 0; i < N; i++) { vel.push({ a: Math.random() * 6.28, s: rnd(0.6, 1.3), t: Math.random() }); }
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfeaff, size: 0.18, transparent: true, opacity: 0.9 }));
  scene.add(pts);
  anim.push((t, dt) => {
    for (let i = 0; i < N; i++) {
      const v = vel[i]; v.t += dt * 0.9; if (v.t > 1) v.t -= 1;
      const r = v.t * 2.2 * v.s; arr[i * 3] = Math.cos(v.a) * r; arr[i * 3 + 2] = Math.sin(v.a) * r;
      arr[i * 3 + 1] = 2.9 + v.t * 3 * v.s - 6 * v.t * v.t * v.s;
    }
    geo.attributes.position.needsUpdate = true;
  });
}

// ---------------------------------------------------------------- props
function palm(x, z, h = 6, dates = true) {
  const g = new THREE.Group(); const lean = rnd(-0.12, 0.12);
  for (let i = 0; i < 6; i++) {
    const seg = mesh(new THREE.CylinderGeometry(0.28 - i * 0.02, 0.34 - i * 0.02, h / 6, 7), i % 2 ? 0x9a6b3f : 0x87592f, Math.sin(lean) * i * h / 6, h / 12 + i * h / 6, 0);
    g.add(seg);
  }
  const top = new THREE.Vector3(Math.sin(lean) * h, h, 0);
  for (let i = 0; i < 8; i++) {
    const leaf = mesh(new THREE.ConeGeometry(0.45, 3.6, 4), i % 2 ? 0x2f9e44 : 0x3fae55);
    leaf.scale.set(1, 1, 0.25); leaf.position.copy(top);
    leaf.rotation.set(Math.PI / 2 + 0.55, 0, 0); const pivot = new THREE.Group(); pivot.position.copy(top);
    leaf.position.set(0, -0.3, 1.6); pivot.add(leaf); pivot.rotation.y = i * Math.PI / 4; g.add(pivot);
  }
  if (dates) for (let i = 0; i < 4; i++) {
    const cl = new THREE.Group(); const a = i * Math.PI / 2 + 0.4;
    for (let j = 0; j < 9; j++) cl.add(mesh(new THREE.SphereGeometry(0.13, 6, 5), j % 3 ? 0xb5651d : 0xe08a2b, rnd(-0.25, 0.25), -j * 0.09, rnd(-0.25, 0.25)));
    cl.position.set(top.x + Math.cos(a) * 0.55, h - 0.35, Math.sin(a) * 0.55); g.add(cl);
  }
  g.position.set(x, 0, z); g.rotation.y = rnd(0, 6.28); scene.add(g); block(x, z, 0.8);
  anim.push((t) => { g.rotation.z = Math.sin(t * 0.8 + x) * 0.02; });
  return g;
}
function fruitTree(x, z, fruit = 0xe63946) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.42, 2.6, 7), 0x8a5a35, 0, 1.3, 0));
  const c1 = mesh(new THREE.IcosahedronGeometry(2.1, 1), 0x3e9e45, 0, 3.6, 0); g.add(c1);
  g.add(mesh(new THREE.IcosahedronGeometry(1.5, 1), 0x4fb350, 1.2, 3.2, 0.4));
  g.add(mesh(new THREE.IcosahedronGeometry(1.4, 1), 0x4fb350, -1.1, 3.3, -0.3));
  for (let i = 0; i < 12; i++) {
    const a = rnd(0, 6.28), e = rnd(-0.3, 0.9);
    g.add(mesh(new THREE.SphereGeometry(0.22, 8, 6), fruit, Math.cos(a) * 2.05 * Math.cos(e), 3.6 + Math.sin(e) * 1.8, Math.sin(a) * 2.05 * Math.cos(e), { flatShading: false, roughness: 0.4 }));
  }
  g.position.set(x, 0, z); scene.add(g); block(x, z, 0.9);
}
function bush(x, z, s = 1, col = 0x4caf50) { const b = mesh(new THREE.IcosahedronGeometry(0.9 * s, 0), col, x, 0.6 * s, z); scene.add(b); }
function rock(x, z, s = 1) { const r = mesh(new THREE.DodecahedronGeometry(0.6 * s, 0), 0xa9a39a, x, 0.3 * s, z); r.rotation.set(rnd(0, 3), rnd(0, 3), 0); scene.add(r); }

// person builder (used for Salman and villagers)
function person({ robe = 0xffffff, skin = 0xf1c79c, hair = 0x3b2414, headwear = null, scale = 1, girl = false } = {}) {
  const g = new THREE.Group(); const parts = {};
  const body = mesh(new THREE.CylinderGeometry(0.3, 0.46, 1.15, 12), robe, 0, 0.78, 0, { flatShading: false, roughness: 0.7 }); g.add(body);
  const chest = mesh(new THREE.SphereGeometry(0.31, 12, 8), robe, 0, 1.33, 0, { flatShading: false, roughness: 0.7 }); chest.scale.set(1, 0.8, 0.9); g.add(chest);
  const head = new THREE.Group(); head.position.set(0, 1.72, 0); g.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.34, 16, 12), skin, 0, 0, 0, { flatShading: false, roughness: 0.6 }));
  const eyeM = mat(0x2a1a12, { flatShading: false, roughness: 0.3 }), whiteM = mat(0xffffff, { flatShading: false, roughness: 0.4 }), browM = mat(headwear === 'hijab' ? 0x3b2414 : hair, { flatShading: false });
  const eyes = [];
  [-0.125, 0.125].forEach((ex) => {
    const eg = new THREE.Group(); eg.position.set(ex, 0.05, 0.288);
    const w = mesh(new THREE.SphereGeometry(0.085, 12, 10), whiteM); w.scale.set(0.9, 1.05, 0.5); w.castShadow = false; eg.add(w);
    const pu = mesh(new THREE.SphereGeometry(0.05, 10, 8), eyeM, ex > 0 ? -0.008 : 0.008, -0.005, 0.03); pu.scale.z = 0.5; pu.castShadow = false; eg.add(pu);
    const hl = mesh(new THREE.SphereGeometry(0.016, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.018, 0.022, 0.055); hl.castShadow = false; eg.add(hl);
    head.add(eg); eyes.push(eg);
    const br = mesh(new THREE.BoxGeometry(0.12, 0.024, 0.03), browM, ex, 0.175, 0.3); br.rotation.z = ex > 0 ? -0.18 : 0.18; br.castShadow = false; head.add(br);
  });
  const nose = mesh(new THREE.SphereGeometry(0.035, 8, 6), skin, 0, -0.025, 0.335, { flatShading: false, roughness: 0.6 }); nose.castShadow = false; head.add(nose);
  const blinkPh = Math.random() * 5;
  anim.push((t) => { const b = ((t + blinkPh) % 4.2) < 0.13 ? 0.12 : 1; eyes[0].scale.y = b; eyes[1].scale.y = b; });
  const smile = mesh(new THREE.TorusGeometry(0.095, 0.024, 6, 14, Math.PI), 0x9c2f2f, 0, -0.105, 0.305); smile.rotation.z = Math.PI; smile.castShadow = false; head.add(smile);
  [-0.2, 0.2].forEach((ex) => { const c = mesh(new THREE.SphereGeometry(0.06, 8, 6), 0xff9aa2, ex, -0.06, 0.27, { flatShading: false }); c.castShadow = false; head.add(c); });
  if (headwear === 'ghutra') {
    const gh = mesh(new THREE.SphereGeometry(0.385, 18, 10, Math.PI / 2 + 0.8, Math.PI * 2 - 1.6, 0, Math.PI * 0.62), 0xffffff, 0, 0.03, -0.02, { flatShading: false, side: THREE.DoubleSide }); head.add(mesh(new THREE.SphereGeometry(0.385, 18, 6, 0, Math.PI * 2, 0, Math.PI * 0.3), 0xffffff, 0, 0.03, -0.02, { flatShading: false })); head.add(gh);
    const back = mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.6, 14, 1, true, Math.PI * 0.6, Math.PI * 0.8), 0xffffff, 0, -0.15, -0.02, { side: THREE.DoubleSide, flatShading: false }); back.rotation.y = Math.PI; head.add(back);
    const ag = mesh(new THREE.TorusGeometry(0.33, 0.045, 6, 24), 0x111111, 0, 0.17, 0); ag.rotation.x = Math.PI / 2; head.add(ag);
  } else if (headwear === 'hijab') {
    const hj = mesh(new THREE.SphereGeometry(0.4, 18, 12, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5, 0, Math.PI * 0.72), hair, 0, 0.02, -0.03, { flatShading: false, side: THREE.DoubleSide }); head.add(hj);
    const nk = mesh(new THREE.CylinderGeometry(0.33, 0.42, 0.45, 14, 1, true, Math.PI * 0.62, Math.PI * 0.76), hair, 0, -0.22, 0, { side: THREE.DoubleSide, flatShading: false }); nk.rotation.y = Math.PI; head.add(nk);
  } else {
    for (let i = 0; i < 22; i++) {
      const a = rnd(0, 6.28), e = rnd(0.25, 1.35);
      if (Math.sin(a) > 0.55 && e < 0.9) continue; // keep face clear
      const c = mesh(new THREE.SphereGeometry(rnd(0.1, 0.14), 7, 5), hair, Math.cos(a) * Math.cos(e) * 0.33, Math.sin(e) * 0.33 + 0.04, Math.sin(a) * Math.cos(e) * 0.33 - 0.02, { flatShading: false });
      c.castShadow = false; head.add(c);
    }
  }
  const armGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.62, 8); armGeo.translate(0, -0.31, 0);
  parts.arms = [-1, 1].map((s) => {
    const a = new THREE.Group(); a.position.set(s * 0.36, 1.43, 0);
    a.add(mesh(armGeo, robe, 0, 0, 0, { flatShading: false, roughness: 0.7 }));
    a.add(mesh(new THREE.SphereGeometry(0.09, 8, 6), skin, 0, -0.64, 0, { flatShading: false }));
    a.rotation.z = s * 0.12; g.add(a); return a;
  });
  parts.feet = [-1, 1].map((s) => { const f = mesh(new THREE.BoxGeometry(0.16, 0.12, 0.3), 0x2b2b2b, s * 0.15, 0.06, 0.04); g.add(f); return f; });
  parts.head = head; parts.body = body;
  g.scale.setScalar(scale); g.userData.parts = parts;
  return g;
}

function building(x, z, w, d, h, color, rotY = 0) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(w, h, d), color, 0, h / 2, 0, { flatShading: true, roughness: 0.95 }));
  g.add(mesh(new THREE.BoxGeometry(w + 0.3, 0.5, d + 0.3), 0xffffff, 0, h + 0.25, 0));
  for (let i = -w / 2 + 0.6; i <= w / 2 - 0.6; i += 1.2) g.add(mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), 0xffffff, i, h + 0.7, d / 2));
  g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g); return g;
}
// ---------------------------------------------------------------- situations (cooperation) — ستة مواقف للصف الثالث
const ZONES = [
  { id: 'tidy', short: 'ترتيب الصف بعد الحصة', x: 16, z: 36, coop: true,
    story: 'بعد انتهاء حصة الرسم، جمع زياد الألوان، وطوى علي الأوراق، ومسح سلمان الطاولة، فانتهوا قبل دخول المعلم.',
    why: 'عملوا معًا، وأدّى كل واحد منهم دوره، وكان العمل في خير.',
    reasons: ['لأنهم عملوا معًا، وأدّى كل واحد منهم دوره، والعمل في خير', 'لأن زيادًا أنهى العمل وحده وانشغل الباقون باللعب', 'لأنهم تسابقوا ليفوز أسرعهم فقط'] },
  { id: 'juice', short: 'تجاهل زميل يحتاج إلى مساعدة', x: -38, z: -12, coop: false,
    story: 'سقط كوب العصير من يد زميل خالد في ساحة المدرسة وتناثر على الأرض، فنظر إليه خالد وضحك ثم ذهب إلى اللعب.',
    why: 'لم يساعد زميله وهو محتاج إلى المساعدة، بل سخر منه.',
    reasons: ['لأنه لم يساعد زميله وهو محتاج إلى المساعدة، بل سخر منه', 'لأن زميله هو الذي أسقط الكوب فعليه أن ينظّف وحده', 'لأن خالدًا كان يلعب واللعب ممنوع في الساحة'] },
  { id: 'newkid', short: 'مساعدة زميل جديد', x: 36, z: 22, coop: true,
    story: 'جاء إلى الصف تلميذ جديد لا يعرف مكان المقصف، فمشى معه عمر وأرشده إلى المقصف، وعرّفه على زملائه.',
    why: 'ساعد من يحتاج إلى المساعدة، وأدخل السرور على قلب زميله، وهذا عمل يحبه الله.',
    reasons: ['لأنه ساعد من يحتاج إلى المساعدة وأدخل السرور على قلب زميله', 'لأن عمر كان يريد أن يشتري من المقصف قبل غيره', 'لأن التلميذ الجديد وصل إلى المقصف وحده'] },
  { id: 'puzzle', short: 'تجميع الصورة في المجموعة', x: 38, z: -12, coop: false,
    story: 'كلّف المعلم مجموعة بتركيب لوحة أحجية، فأمسك ماجد القطع كلها وقال: «سأفعلها وحدي»، ولم يسمح لزملائه بالمشاركة، فبقوا ينظرون إليه.',
    why: 'لم يشارك زملاءه في المهمة، ولم يترك لكل واحد دورًا.',
    reasons: ['لأنه لم يشارك زملاءه في المهمة، ولم يترك لكل واحد دورًا', 'لأن الأحجية صعبة جدًا ولا تُركَّب بالتعاون', 'لأن ماجدًا يحب الأحجيات أكثر من زملائه'] },
  { id: 'breakfast', short: 'تجهيز مائدة الإفطار في البيت', x: -24, z: 30, coop: true,
    story: 'في صباح يوم الجمعة، ساعدت ريم أمها بوضع الأطباق على المائدة، وأحضر أخوها الصغير الملاعق، وحمل أبوها إبريق الشاي، ثم جلسوا جميعًا يأكلون.',
    why: 'شارك أفراد الأسرة كلهم في العمل، ولكل منهم دور.',
    reasons: ['لأن أفراد الأسرة كلهم شاركوا في العمل، ولكل منهم دور', 'لأنهم جلسوا يأكلون في الوقت نفسه فقط', 'لأن الأب هو الذي أمرهم بالعمل وهم لا يريدون'] },
  { id: 'toys', short: 'ترك الأعمال البيتية للآخرين', x: -44, z: 14, coop: false,
    story: 'طلبت الأم من أبنائها ترتيب غرفة الألعاب، فرتّبت الأخت والأخ الصغير ألعابهما، أما سلطان فجلس يشاهد التلفاز ولم يشاركهم.',
    why: 'لم يشارك إخوته في العمل، ولم يؤدّ دوره.',
    reasons: ['لأنه لم يشارك إخوته في العمل، ولم يؤدّ دوره', 'لأن الأم لم تطلب منه شيئًا', 'لأن إخوته رتّبوا الألعاب بسرعة كبيرة'] },
];
$('#tot').textContent = ZONES.length;
ZONES.forEach((zn, i) => {
  path(0, 0, zn.x * 0.8, zn.z * 0.8);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.8, 4.4, 40), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.55 }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(zn.x, 0.15, zn.z); scene.add(ring);
  const sign = textSprite('🔍 الموقف ' + (i + 1), { size: 60, color: '#5e2e8f', border: '#9b5de5', scale: 0.75 }); sign.position.set(zn.x, 6.3, zn.z); scene.add(sign);
  zn.ring = ring; zn.sign = sign; zn.done = false; zn.n = i + 1;
  anim.push((t) => { ring.material.opacity = zn.done ? 0.45 : 0.35 + Math.sin(t * 3 + zn.x) * 0.25; sign.position.y = 6.3 + Math.sin(t * 1.5 + zn.z) * 0.15; });
});
const villagers = [];
function addP(opts, x, z, ry = 0, face = false) { const p = person(opts); p.position.set(x, 0, z); p.rotation.y = ry; scene.add(p); block(x, z, 0.5); if (face) villagers.push(p); return p; }
const MUM = { robe: 0x1d1d1d, headwear: 'hijab', hair: 0x1d1d1d, scale: 1.2 };
const DAD = { robe: 0xffffff, headwear: 'ghutra', scale: 1.3 };
const SK = (c, s = 0.85) => ({ robe: c, scale: s });
const GIRL = (s = 0.85, c = 0x7a3e9d) => ({ robe: c, headwear: 'hijab', hair: 0xf3f3f3, scale: s });
function table(x, z, w = 2.4, d = 1.3, col = 0xb07a45) {
  const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(w, 0.12, d), col, 0, 1.0, 0));
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(mesh(new THREE.BoxGeometry(0.1, 1, 0.1), col, a * (w / 2 - 0.12), 0.5, b * (d / 2 - 0.12))));
  g.position.set(x, 0, z); scene.add(g); return g;
}
function holdArms(p, x = -1.1) { p.userData.parts.arms.forEach((a) => { a.rotation.x = x; }); }
function faceTo(p, x, z) { p.rotation.y = Math.atan2(x - p.position.x, z - p.position.z); }
function tag(p, text, border = '#2b8cee', color = '#1a4f8a') { const s = textSprite(text, { size: 46, scale: 0.5, color, border }); s.position.set(0, 2.5, 0); p.add(s); return s; }
function bubble(text, x, y, z, border = '#e63946', color = '#c0392b', bg = '#fff0f0') { const s = textSprite(text, { size: 50, scale: 0.55, color, border, bg }); s.position.set(x, y, z); scene.add(s); anim.push((t) => { s.position.y = y + Math.sin(t * 2.2 + x) * 0.12; }); return s; }
// ينتقل الشخص بين نقطتين ذهابًا وإيابًا مع توقّف في الطرفين؛ cb(dir, moving, u, t, w) لضبط الذراعين
function shuttle(p, A, B, period, ph0, cb) {
  const P = p.userData.parts;
  anim.push((t) => {
    const c = (((t / period + ph0) % 1) + 1) % 1; let u, dir, mv = true;
    if (c < 0.4) { u = c / 0.4; dir = 1; } else if (c < 0.5) { u = 1; dir = 1; mv = false; } else if (c < 0.9) { u = 1 - (c - 0.5) / 0.4; dir = -1; } else { u = 0; dir = -1; mv = false; }
    const e = u * u * (3 - 2 * u);
    p.position.x = A[0] + (B[0] - A[0]) * e; p.position.z = A[1] + (B[1] - A[1]) * e;
    if (mv) p.rotation.y = Math.atan2((B[0] - A[0]) * dir, (B[1] - A[1]) * dir);
    const w = mv ? Math.sin(t * 9) : 0; p.position.y = mv ? Math.abs(w) * 0.05 : 0;
    P.feet[0].position.z = 0.04 + w * 0.22; P.feet[1].position.z = 0.04 - w * 0.22;
    if (mv) { P.arms[0].rotation.x = w * 0.5; P.arms[1].rotation.x = -w * 0.5; }
    cb && cb(dir, mv, u, t, w);
  });
}
// جسم صغير يظهر ثم ينتقل من S إلى E بقوس ثم يختفي ويعود (تكرار هادئ بلا قفزات)
function hopper(m, S, E, period, ph, arc = 0.35) {
  m.position.set(S[0], S[1], S[2]);
  anim.push((t) => {
    const c = (((t / period + ph) % 1) + 1) % 1; let s = 1, u = 0;
    if (c < 0.1) { s = c / 0.1; } else if (c < 0.4) { u = 0; } else if (c < 0.7) { u = (c - 0.4) / 0.3; } else if (c < 0.92) { u = 1; } else { u = 1; s = (1 - c) / 0.08; }
    const e = u * u * (3 - 2 * u);
    m.position.set(S[0] + (E[0] - S[0]) * e, S[1] + (E[1] - S[1]) * e + Math.sin(u * Math.PI) * arc, S[2] + (E[2] - S[2]) * e);
    m.scale.setScalar(Math.max(0.001, s));
  });
}

// 1) ترتيب الصف بعد حصة الرسم (تعاوني)
{
  const zx = 16, zz = 36;
  const sc = building(24, 50, 16, 7, 5.2, 0xf6e7c1);
  for (let r = 0; r < 2; r++) for (let i = -6; i <= 6; i += 2.4) sc.add(mesh(new THREE.BoxGeometry(1.4, 1, 0.1), 0x6fc3f0, i, 1.5 + r * 2, 3.56, { roughness: 0.2 }));
  sc.add(mesh(new THREE.BoxGeometry(2.2, 2.6, 0.12), 0x2f6b9a, 0, 1.3, 3.56));
  for (let i = -7.5; i <= 7.5; i += 1.5) block(24 + i, 50 - 3.6, 1);
  const board = textSprite('مدرستي 📚', { size: 56, color: '#1a4f8a', border: '#2b8cee' }); board.position.set(24, 6.4, 46.4); scene.add(board);
  scene.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 8, 6), 0xdddddd, 34, 4, 45)); block(34, 45, 0.4);
  const fc = document.createElement('canvas'); fc.width = 300; fc.height = 180; const g = fc.getContext('2d');
  g.fillStyle = '#ce1126'; g.fillRect(0, 0, 300, 180); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, 0); g.lineTo(80, 0);
  for (let i = 0; i < 5; i++) { g.lineTo(110, 18 + i * 36); g.lineTo(80, 36 + i * 36); } g.lineTo(0, 180); g.fill();
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace;
  const fgeo = new THREE.PlaneGeometry(3, 1.8, 12, 1); const flag = new THREE.Mesh(fgeo, new THREE.MeshStandardMaterial({ map: ft, side: THREE.DoubleSide })); flag.position.set(35.5, 7, 45); scene.add(flag);
  const fb = fgeo.attributes.position.array.slice();
  anim.push((t) => { const p = fgeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = fb[i * 3]; p.setZ(i, Math.sin(x * 2 + t * 5) * 0.15 * (x + 1.5) / 3); } p.needsUpdate = true; });

  table(zx, zz, 3.4, 1.5, 0xc99a63); block(zx, zz, 1.9);
  // حامل لوحة
  const ez = zz - 3.2, ex = zx - 3.4;
  [-0.4, 0.4].forEach((d) => scene.add(mesh(new THREE.BoxGeometry(0.07, 1.9, 0.07), 0x8a5a35, ex + d, 0.95, ez)));
  scene.add(mesh(new THREE.BoxGeometry(1.2, 1.0, 0.06), 0xffffff, ex, 1.5, ez));
  scene.add(mesh(new THREE.BoxGeometry(1.0, 0.45, 0.07), 0x6fc3f0, ex, 1.28, ez)); scene.add(mesh(new THREE.SphereGeometry(0.17, 8, 6), 0xffb703, ex + 0.25, 1.75, ez + 0.02));
  block(ex, ez, 0.8);
  const art = textSprite('حصة الرسم 🎨', { size: 44, scale: 0.5, color: '#9b5de5', border: '#9b5de5' }); art.position.set(ex, 3.1, ez); scene.add(art);

  const zi = addP(SK(0x2b8cee), zx - 2.5, zz, Math.PI / 2, true); tag(zi, 'زياد');
  const al = addP(SK(0xf2b705), zx, zz - 1.4, 0, true); tag(al, 'علي');
  const sa = addP(SK(0x2fbf71), zx, zz + 1.4, Math.PI, true); tag(sa, 'سلمان');
  // ألوان تُجمع في علبة
  scene.add(mesh(new THREE.BoxGeometry(0.6, 0.14, 0.34), 0x2b8cee, zx - 1.2, 1.13, zz - 0.2));
  [0xe63946, 0xffd23f, 0x2fbf71, 0x9b5de5, 0xff8a3d].forEach((c, i) => {
    const cr = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), c); cr.rotation.z = Math.PI / 2; scene.add(cr);
    hopper(cr, [zx - 0.2 + i * 0.22, 1.12, zz + 0.35 - (i % 2) * 0.4], [zx - 1.2, 1.22, zz - 0.2], 7, i * 0.17, 0.4);
  });
  // أوراق تُطوى
  for (let i = 0; i < 4; i++) scene.add(mesh(new THREE.BoxGeometry(0.9, 0.025, 0.65), 0xffffff, zx + 0.6, 1.1 + i * 0.03, zz - 0.5));
  [0, 1].forEach((i) => { const sh = mesh(new THREE.BoxGeometry(0.9, 0.025, 0.65), 0xfff3b0); scene.add(sh); hopper(sh, [zx + 0.6, 1.25, zz - 0.5], [zx + 1.3, 1.15, zz - 0.2], 6, i * 0.5, 0.45); });
  // قطعة قماش تمسح الطاولة
  const cloth = mesh(new THREE.BoxGeometry(0.7, 0.04, 0.5), 0x6fc3f0, zx, 1.1, zz + 0.4); scene.add(cloth);
  anim.push((t) => { cloth.position.x = zx + 0.2 + Math.sin(t * 3) * 0.9; cloth.rotation.y = Math.sin(t * 3) * 0.3; sa.userData.parts.arms[0].rotation.x = -1.25 + Math.sin(t * 3) * 0.1; sa.userData.parts.arms[1].rotation.x = -1.25; });
  anim.push((t) => { zi.userData.parts.arms[1].rotation.x = -1.2 + Math.sin(t * 2.4) * 0.22; zi.userData.parts.arms[0].rotation.x = -0.4; al.userData.parts.arms.forEach((a, j) => { a.rotation.x = -1.2 + Math.sin(t * 2 + j) * 0.12; }); });
}

// 2) كوب العصير (غير تعاوني)
{
  const zx = -38, zz = -12;
  const bench = new THREE.Group(); bench.add(mesh(new THREE.BoxGeometry(2.4, 0.12, 0.6), 0x9a6b3f, 0, 0.55, 0)); [-1, 1].forEach((s) => bench.add(mesh(new THREE.BoxGeometry(0.12, 0.55, 0.5), 0x6e4426, s * 1.0, 0.27, 0)));
  bench.position.set(zx - 1.5, 0, zz - 3.4); scene.add(bench); block(zx - 1.5, zz - 3.4, 1.3);
  const fr = addP(SK(0x8e7dff), zx - 1.2, zz - 0.6, 0, false); tag(fr, 'زميل خالد', '#8e7dff', '#4a3aa8'); faceTo(fr, zx - 1.2, zz + 0.9);
  fr.userData.parts.arms.forEach((a) => { a.rotation.set(-0.5, 0, 0); });
  anim.push((t) => { fr.userData.parts.head.rotation.x = 0.35 + Math.sin(t * 1.2) * 0.05; });
  const pud = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.02, 20), 0xffa94d, zx - 1.2, 0.05, zz + 0.9, { flatShading: false, roughness: 0.2 }); pud.scale.set(1.3, 1, 0.9); pud.castShadow = false; scene.add(pud);
  const cup = mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.36, 10), 0xffffff, zx - 0.4, 0.17, zz + 0.9, { flatShading: false }); cup.rotation.z = Math.PI / 2 - 0.1; scene.add(cup);
  const kh = person(SK(0xe76f51)); kh.position.set(zx + 1.5, 0, zz + 1.5); scene.add(kh); tag(kh, 'خالد', '#e76f51', '#a8321a');
  const ball = mesh(new THREE.SphereGeometry(0.28, 12, 10), 0xffffff, 0, 0.28, 0, { flatShading: false }); scene.add(ball);
  const A = [zx + 0.9, zz + 1.2], B = [zx + 4.0, zz + 3.0];
  shuttle(kh, A, B, 9, 0, (dir, mv, u, t, w) => {
    const Pk = kh.userData.parts;
    if (!mv && u === 0) { faceTo(kh, zx - 1.2, zz + 0.9); Pk.arms[1].rotation.x = -1.4; Pk.arms[0].rotation.x = -0.3; Pk.head.rotation.x = -0.25 + Math.sin(t * 14) * 0.12; kh.position.y = Math.abs(Math.sin(t * 14)) * 0.05; }
    const fx = Math.sin(kh.rotation.y), fz = Math.cos(kh.rotation.y);
    ball.position.set(kh.position.x + fx * 0.7, 0.28 + (mv ? Math.abs(Math.sin(t * 9)) * 0.12 : 0), kh.position.z + fz * 0.7);
    if (mv || u === 1) Pk.head.rotation.x = 0;
  });
  bubble('ههههه 😂', zx + 0.9, 3.3, zz + 1.2);
}

// 3) مساعدة زميل جديد (تعاوني)
{
  const zx = 36, zz = 22;
  const kx = zx + 4.2, kz = zz + 4.2, k = new THREE.Group();
  k.add(mesh(new THREE.BoxGeometry(4, 2.4, 2.2), 0xf6e7c1, 0, 1.2, 0)); k.add(mesh(new THREE.BoxGeometry(4.2, 0.18, 1.0), 0x9a6b3f, 0, 1.15, 1.35));
  for (let i = 0; i < 8; i++) { const st = mesh(new THREE.BoxGeometry(0.55, 0.1, 1.2), i % 2 ? 0xffffff : 0xe63946, -1.9 + i * 0.54, 2.55, 1.15); st.rotation.x = 0.28; k.add(st); }
  [0xffa94d, 0x2fbf71, 0xe63946, 0x2b8cee].forEach((c, i) => k.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), c, -1.3 + i * 0.8, 1.38, 1.35)));
  k.position.set(kx, 0, kz); k.rotation.y = Math.atan2(zx - kx, zz - kz); scene.add(k); block(kx, kz, 2.1);
  const ks = textSprite('المقصف 🥤', { size: 56, color: '#c0392b', border: '#e63946', scale: 0.6 }); ks.position.set(kx, 3.9, kz); scene.add(ks);
  const om = person(SK(0x2b8cee)); scene.add(om); tag(om, 'عمر');
  const nw = person(SK(0x2fbf71)); scene.add(nw); tag(nw, 'التلميذ الجديد', '#2fbf71', '#1d8a4f');
  const A = [zx - 3.2, zz - 3.0], B = [zx + 1.6, zz + 1.8], dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), nx = -dz / L * 0.9, nz = dx / L * 0.9;
  shuttle(om, [A[0] + nx, A[1] + nz], [B[0] + nx, B[1] + nz], 10, 0, (dir, mv) => { const a = om.userData.parts.arms; if (mv && dir === 1) { a[1].rotation.x = -1.5; a[1].rotation.z = -0.25; } else if (mv) { a[1].rotation.z = 0.12; } });
  shuttle(nw, [A[0] - nx, A[1] - nz], [B[0] - nx, B[1] - nz], 10, 0, (dir, mv, u, t) => { nw.userData.parts.head.rotation.y = mv ? Math.sin(t * 1.5) * 0.25 : 0; });
  [[zx + 3.6, zz + 0.2, 0x7a3e9d, true], [zx + 1.0, zz + 3.9, 0xf2b705, false]].forEach(([x, z, c, g], i) => {
    const p = addP(g ? GIRL(0.85, c) : SK(c), x, z, 0, true); faceTo(p, zx + 1.6, zz + 1.8);
    const arm = p.userData.parts.arms[1]; anim.push((t) => { arm.rotation.x = -2.4 + Math.sin(t * 5 + i) * 0.3; });
    tag(p, g ? 'زميلة' : 'زميل', '#f2b705', '#7a5a00');
  });
}

// 4) أحجية المجموعة (غير تعاوني)
{
  const zx = 38, zz = -12;
  table(zx, zz, 3.4, 1.8, 0xd9b38c); block(zx, zz, 1.9);
  const bc = document.createElement('canvas'); bc.width = 256; bc.height = 192; const g = bc.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 192);
  const cols = ['#e63946', '#2b8cee', '#ffd23f', '#2fbf71', '#9b5de5', '#ff8a3d'];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const i = r * 4 + c; if (i % 3 !== 1) { g.fillStyle = cols[i % 6]; g.fillRect(c * 64 + 3, r * 64 + 3, 58, 58); } else { g.strokeStyle = '#bbb'; g.setLineDash([6, 6]); g.lineWidth = 3; g.strokeRect(c * 64 + 5, r * 64 + 5, 54, 54); } }
  const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace;
  const pb = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ map: bt })); pb.rotation.x = -Math.PI / 2; pb.position.set(zx - 0.4, 1.075, zz - 0.2); scene.add(pb);
  for (let i = 0; i < 10; i++) scene.add(mesh(new THREE.BoxGeometry(0.28, 0.05, 0.28), cols[i % 6], zx + 0.85 + (i % 4) * 0.2, 1.08 + (i > 5 ? 0.05 : 0), zz + 0.35 + Math.floor(i / 4) * 0.2));
  const mj = addP(SK(0xe76f51, 0.9), zx, zz + 1.45, Math.PI); tag(mj, 'ماجد', '#e63946', '#a8321a');
  const Pm = mj.userData.parts; Pm.arms[0].rotation.z = 0.5; Pm.arms[1].rotation.z = -0.5;
  anim.push((t) => { Pm.arms[0].rotation.x = -1.2 + Math.sin(t * 3) * 0.12; Pm.arms[1].rotation.x = -1.2 - Math.sin(t * 3) * 0.12; });
  bubble('سأفعلها وحدي!', zx, 3.4, zz + 1.45);
  [[-3.1, 'زميله', false], [3.1, 'زميلته', true]].forEach(([dx, nm, gl], i) => {
    const p = addP(gl ? GIRL(0.85, 0x2a9d8f) : SK(0x6d6875), zx + dx, zz - 0.8, 0); faceTo(p, zx, zz); tag(p, nm, '#8d99ae', '#3d405b');
    anim.push((t) => { p.userData.parts.head.rotation.x = 0.28 + Math.sin(t * 1.1 + i) * 0.05; p.userData.parts.arms.forEach((a) => { a.rotation.x = -0.1; }); });
  });
}

// 5) مائدة الإفطار في البيت (تعاوني)
{
  const zx = -24, zz = 30;
  const house = building(zx, zz + 13, 11, 7, 4.2, 0xf3e3c8);
  house.add(mesh(new THREE.BoxGeometry(1.6, 2.6, 0.12), 0x8a5a35, 0, 1.3, 3.55));
  for (let i = -5; i <= 5; i += 1.5) block(zx + i, zz + 13 - 3.6, 1);
  table(zx, zz, 3.0, 1.5); block(zx, zz, 1.8);
  scene.add(mesh(new THREE.CylinderGeometry(0.4, 0.34, 0.1, 14), 0xe9c46a, zx, 1.1, zz - 0.1, { flatShading: false }));
  [[-1.0, -0.4], [-0.4, 0.4], [0.5, -0.45], [1.1, 0.35]].forEach(([dx, dz]) => { scene.add(mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.05, 14), 0xffffff, zx + dx, 1.09, zz + dz, { flatShading: false })); });
  scene.add(mesh(new THREE.SphereGeometry(0.2, 8, 6), 0xb5651d, zx + 0.2, 1.17, zz + 0.45, { flatShading: false }));
  for (let i = 0; i < 3; i++) scene.add(mesh(new THREE.BoxGeometry(0.05, 0.02, 0.28), 0xcfcfcf, zx - 0.15 + i * 0.12, 1.07, zz + 0.62));
  const reem = addP(GIRL(0.95), zx - 2.2, zz + 0.2, Math.PI / 2, true); tag(reem, 'ريم', '#e84393', '#a3205f');
  const mum = addP(MUM, zx, zz - 1.8, 0, true); tag(mum, 'الأم', '#e84393', '#a3205f'); holdArms(mum, -0.9);
  const dad = addP(DAD, zx + 2.5, zz - 0.4, -Math.PI / 2, true); tag(dad, 'الأب', '#2b8cee', '#1a4f8a').position.y = 2.2; dad.userData.parts.arms[1].rotation.x = -1.2;
  const pot = new THREE.Group(); pot.add(mesh(new THREE.SphereGeometry(0.28, 12, 10), 0xc9a227, 0, 0, 0, { flatShading: false, metalness: 0.5, roughness: 0.3 })); const sp = mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.4, 6), 0xc9a227, -0.3, 0.1, 0); sp.rotation.z = 1.0; pot.add(sp); pot.add(mesh(new THREE.SphereGeometry(0.08, 6, 5), 0x6e4426, 0, 0.3, 0)); pot.position.set(zx + 1.5, 1.5, zz - 0.0); scene.add(pot);
  anim.push((t) => { pot.rotation.z = -0.25 + Math.sin(t * 1.3) * 0.15; });
  const plate = mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.05, 14), 0xffffff, 0, 0, 0, { flatShading: false }); scene.add(plate); hopper(plate, [zx - 1.6, 1.3, zz + 0.2], [zx - 1.0, 1.09, zz - 0.4], 5, 0, 0.3);
  anim.push((t) => { const a = reem.userData.parts.arms; a[1].rotation.x = -1.2 + Math.sin(t * 2.4) * 0.15; a[0].rotation.x = -1.0; });
  const br = person(SK(0xf2b705, 0.65)); scene.add(br); tag(br, 'الأخ الصغير', '#f2b705', '#7a5a00');
  const sps = new THREE.Group(); for (let i = 0; i < 3; i++) sps.add(mesh(new THREE.BoxGeometry(0.04, 0.02, 0.3), 0xe0e0e0, (i - 1) * 0.06, 0, 0)); scene.add(sps);
  shuttle(br, [zx + 3.4, zz + 2.8], [zx + 1.6, zz + 1.2], 8, 0, (dir, mv) => { sps.visible = dir === 1; const f = br.rotation.y; sps.position.set(br.position.x + Math.sin(f) * 0.38, 0.95, br.position.z + Math.cos(f) * 0.38); sps.rotation.y = f; if (dir === 1) holdArms(br, -1.1); });
}

// 6) غرفة الألعاب (غير تعاوني)
{
  const zx = -44, zz = 14;
  scene.add(mesh(new THREE.BoxGeometry(7.4, 0.06, 5.6), 0xc7a6ff, zx, 0.04, zz)); scene.add(mesh(new THREE.BoxGeometry(6.2, 0.07, 4.4), 0xffd6e0, zx, 0.06, zz));
  const tc = [0xe63946, 0x2b8cee, 0xffd23f, 0x2fbf71, 0xff8a3d, 0x9b5de5, 0xe63946, 0x2b8cee];
  tc.forEach((c, i) => { const b = mesh(i % 3 === 0 ? new THREE.SphereGeometry(0.22, 8, 6) : new THREE.BoxGeometry(0.4, 0.4, 0.4), c, zx - 2.4 + (i % 4) * 1.15, 0.28, zz - 0.8 + Math.floor(i / 4) * 1.4); b.rotation.y = i; b.castShadow = true; scene.add(b); });
  const cx0 = zx + 2.8, cz0 = zz - 1.9, chest = new THREE.Group();
  chest.add(mesh(new THREE.BoxGeometry(1.5, 0.8, 0.9), 0x8a5a35, 0, 0.4, 0)); const lid = mesh(new THREE.BoxGeometry(1.5, 0.08, 0.9), 0xa8703f, 0, 0.9, -0.55); lid.rotation.x = -1.1; chest.add(lid);
  chest.position.set(cx0, 0, cz0); scene.add(chest); block(cx0, cz0, 1.0);
  const sis = person(GIRL(0.85, 0xe84393)); scene.add(sis); tag(sis, 'الأخت', '#e84393', '#a3205f');
  const kid = person(SK(0x2a9d8f, 0.6)); scene.add(kid); tag(kid, 'الأخ الصغير', '#2a9d8f', '#1d6b61');
  [[sis, [zx - 1.2, zz - 0.6], [zx + 1.8, zz - 1.7], 0xe63946, 0], [kid, [zx - 2.2, zz + 0.4], [zx + 1.6, zz - 1.1], 0xffd23f, 0.3]].forEach(([p, A, B, c, ph]) => {
    const it = mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), c); scene.add(it);
    shuttle(p, A, B, 9, ph, (dir, mv) => { it.visible = dir === 1; const f = p.rotation.y; it.position.set(p.position.x + Math.sin(f) * 0.42, 0.95 * p.scale.y + 0.1, p.position.z + Math.cos(f) * 0.42); if (dir === 1) holdArms(p, -1.2); });
  });
  const sx = zx + 1.5, sz = zz + 2.9, sofa = new THREE.Group();
  sofa.add(mesh(new THREE.BoxGeometry(2.2, 0.5, 1.0), 0x3b6ea5, 0, 0.25, 0)); sofa.add(mesh(new THREE.BoxGeometry(2.2, 0.8, 0.25), 0x2f5885, 0, 0.7, -0.5)); [-1, 1].forEach((s) => sofa.add(mesh(new THREE.BoxGeometry(0.2, 0.6, 1.0), 0x2f5885, s * 1.1, 0.45, 0)));
  sofa.position.set(sx, 0, sz); sofa.rotation.y = -Math.PI / 2; scene.add(sofa); block(sx, sz, 1.2);
  const sul = person(SK(0xf4a261)); sul.position.set(sx + 0.05, 0.28, sz); sul.rotation.y = -Math.PI / 2; scene.add(sul); tag(sul, 'سلطان', '#e63946', '#a8321a'); holdArms(sul, -0.2);
  anim.push((t) => { sul.userData.parts.head.rotation.y = Math.sin(t * 0.6) * 0.08; });
  const tx = zx - 2.4, tv = new THREE.Group();
  tv.add(mesh(new THREE.BoxGeometry(0.8, 0.8, 1.9), 0x6e4426, 0, 0.4, 0)); tv.add(mesh(new THREE.BoxGeometry(0.14, 1.1, 1.8), 0x1d1d1d, 0, 1.35, 0));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.92), new THREE.MeshBasicMaterial({ color: 0x59c3ff })); scr.rotation.y = Math.PI / 2; scr.position.set(0.075, 1.35, 0); tv.add(scr);
  tv.position.set(tx, 0, sz); scene.add(tv); block(tx, sz, 1.1);
  anim.push((t) => { scr.material.color.setHSL((t * 0.15) % 1, 0.7, 0.55); });
}
// sea, boat, birds, clouds, decor
{
  const boat = new THREE.Group();
  boat.add(mesh(new THREE.BoxGeometry(5, 1, 1.8), 0xb5651d, 0, 0.3, 0));
  boat.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.5, 6), 0x7a4b25, 0, 2.6, 0));
  const sailGeo = new THREE.BufferGeometry(); sailGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.9, 0, 0, 4.7, 0, 2.6, 0.9, 0], 3)); sailGeo.computeVertexNormals();
  boat.add(new THREE.Mesh(sailGeo, new THREE.MeshStandardMaterial({ color: 0xfff8e7, side: THREE.DoubleSide })));
  boat.position.set(-12, -0.2, -52); scene.add(boat);
  anim.push((t) => { boat.position.y = -0.2 + Math.sin(t * 1.3) * 0.15; boat.rotation.z = Math.sin(t * 1.1) * 0.05; boat.position.x = -12 + Math.sin(t * 0.08) * 18; });
  palm(13, -33, 5.5, false); palm(-14, -33.5, 6, false);
}
{
  const birds = [];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Group(); const wingGeo = new THREE.BoxGeometry(0.9, 0.04, 0.3); wingGeo.translate(0.45, 0, 0);
    const w1 = mesh(wingGeo, 0xffffff); const w2 = mesh(wingGeo, 0xffffff); w2.rotation.y = Math.PI;
    b.add(mesh(new THREE.SphereGeometry(0.18, 8, 6), 0xffffff), w1, w2);
    b.userData = { r: rnd(14, 34), h: rnd(11, 17), sp: rnd(0.15, 0.3) * (i % 2 ? 1 : -1), ph: rnd(0, 6.28), w1, w2, cx: i < 4 ? 0 : -30, cz: i < 4 ? -40 : 10 };
    scene.add(b); birds.push(b);
  }
  anim.push((t) => birds.forEach((b) => { const u = b.userData, a = t * u.sp + u.ph; b.position.set(u.cx + Math.cos(a) * u.r, u.h + Math.sin(t * 2 + u.ph) * 0.5, u.cz + Math.sin(a) * u.r); b.rotation.y = -a + (u.sp > 0 ? 0 : Math.PI); const f = Math.sin(t * 9 + u.ph) * 0.6; u.w1.rotation.z = f; u.w2.rotation.z = -f; }));
}
{
  const clouds = [];
  const cloud = (x, y, z, s = 1) => { const g = new THREE.Group(); const m = mat(0xffffff, { flatShading: false, roughness: 1 }); for (let i = 0; i < 6; i++) g.add(mesh(new THREE.SphereGeometry(rnd(1.4, 2.3) * s, 10, 8), m, rnd(-2.6, 2.6) * s, rnd(-0.4, 0.6) * s, rnd(-1.2, 1.2) * s)); g.position.set(x, y, z); scene.add(g); return g; };
  for (let i = 0; i < 9; i++) { const c = cloud(rnd(-90, 90), rnd(26, 38), rnd(-90, 60), rnd(1, 1.8)); c.userData.sp = rnd(0.4, 1); clouds.push(c); }
  anim.push((t, dt) => clouds.forEach((c) => { c.position.x += c.userData.sp * dt; if (c.position.x > 110) c.position.x = -110; }));
}
{
  building(-8, 58, 9, 6, 4, 0xeadbc0); building(52, 4, 7, 9, 4.5, 0xf1e0c5, Math.PI / 2); building(-58, -2, 7, 9, 4, 0xf3e3c8, Math.PI / 2);
  const tuft = new THREE.ConeGeometry(0.12, 0.5, 3);
  const inst = new THREE.InstancedMesh(tuft, mat(0x5aa83e), 800); const d = new THREE.Object3D(); let n = 0;
  for (let i = 0; i < 2000 && n < 800; i++) { const x = rnd(-70, 70), z = rnd(-30, 70); if (Math.hypot(x, z) < 10 || ZONES.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 5)) continue; d.position.set(x, 0.2, z); d.rotation.set(rnd(-0.2, 0.2), rnd(0, 6), rnd(-0.2, 0.2)); d.scale.setScalar(rnd(0.6, 1.3)); d.updateMatrix(); inst.setMatrixAt(n++, d.matrix); }
  inst.count = n; scene.add(inst);
  const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 6, 4), new THREE.MeshStandardMaterial({ color: 0xffffff }), 260); n = 0;
  const fcols = [0xff6f91, 0xffd23f, 0xb388ff, 0xffffff, 0xff8a3d];
  for (let i = 0; i < 600 && n < 260; i++) { const x = rnd(-70, 70), z = rnd(-30, 70); if (Math.hypot(x, z) < 10) continue; d.position.set(x, 0.32, z); d.rotation.set(0, 0, 0); d.scale.setScalar(1); d.updateMatrix(); fl.setMatrixAt(n, d.matrix); fl.setColorAt(n, new THREE.Color(fcols[n % 5])); n++; }
  fl.count = n; scene.add(fl);
  for (let i = 0; i < 16; i++) { const a = rnd(0, 6.28), r = rnd(60, 72); palm(Math.cos(a) * r, Math.max(-28, Math.sin(a) * r), rnd(6, 8), false); }
  [[-12, 10], [12, 10], [-14, -10], [14, -12], [22, 8], [-28, 2]].forEach(([x, z]) => palm(x, z, rnd(5.5, 7)));
  for (let i = 0; i < 10; i++) bush(rnd(-55, 55), rnd(-25, 60), rnd(0.7, 1.2), [0x4caf50, 0xe56b9a, 0x58b85c][i % 3]);
}

// ---------------------------------------------------------------- player
const player = person({ robe: 0xffffff, scale: 1 });
player.position.set(0, 0, 9); scene.add(player);
const P = player.userData.parts;
const shadowBlob = new THREE.Mesh(new THREE.CircleGeometry(0.6, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
shadowBlob.rotation.x = -Math.PI / 2; shadowBlob.position.y = 0.03; scene.add(shadowBlob);
const marker = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.65, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);

// ---------------------------------------------------------------- input
const keys = {};
addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); target = null; });
addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
let camYaw = Math.PI, camPitch = 0.42, camDist = 11, target = null;
let dragging = false, lastX = 0, lastY = 0, downX = 0, downY = 0, downT = 0;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const cv = renderer.domElement;
cv.addEventListener('pointerdown', (e) => { dragging = true; lastX = downX = e.clientX; lastY = downY = e.clientY; downT = performance.now(); cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', (e) => { if (!dragging) return; camYaw -= (e.clientX - lastX) * 0.006; camPitch = Math.min(1.1, Math.max(0.18, camPitch + (e.clientY - lastY) * 0.004)); lastX = e.clientX; lastY = e.clientY; });
cv.addEventListener('pointerup', (e) => {
  dragging = false;
  if (Math.hypot(e.clientX - downX, e.clientY - downY) < 8 && performance.now() - downT < 450) {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(scene.getObjectByName('ground'))[0];
    if (hit) { target = hit.point.clone(); target.y = 0; marker.position.set(target.x, 0.06, target.z); marker.visible = true; }
  }
});
cv.addEventListener('wheel', (e) => { camDist = Math.min(20, Math.max(6, camDist + e.deltaY * 0.01)); }, { passive: true });
// joystick
const joy = $('#joy'), knob = joy.querySelector('i'); let jv = { x: 0, y: 0 };
if (isTouch) joy.style.display = 'block';
joy.addEventListener('pointerdown', (e) => { joy.setPointerCapture(e.pointerId); joyMove(e); target = null; });
joy.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') joyMove(e); });
joy.addEventListener('pointerup', () => { jv = { x: 0, y: 0 }; knob.style.transform = ''; });
function joyMove(e) { const r = joy.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } jv = { x, y }; knob.style.transform = `translate(${x * 45}px,${y * 45}px)`; }

// ---------------------------------------------------------------- audio
let ac = null, muted = false, master = null, waveGain = null;
function audio() {
  if (ac) return; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
  const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = ac.createBufferSource(); src.buffer = b; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
  waveGain = ac.createGain(); waveGain.gain.value = 0; src.connect(f); f.connect(waveGain); waveGain.connect(master); src.start();
}
function tone(fr, d, type = 'sine', v = 0.2, when = 0) { if (!ac || muted) return; const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05); }
function chime() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.5, 'triangle', 0.18, i * 0.11)); }
function chirp() { const f = 2200 + Math.random() * 900; tone(f, 0.08, 'sine', 0.05); tone(f * 1.2, 0.08, 'sine', 0.05, 0.1); }
function step() { tone(140 + Math.random() * 40, 0.06, 'triangle', 0.05); }
function fixAr(s){ s=s.replace(/[ً-ْٰ]/g,'');
  var R=[[/(^|[^؀-ۿ])النعم(?=$|[^؀-ۿ])/g,'$1النِّعَم'],[/(^|[^؀-ۿ])نعمتين/g,'$1نِعْمَتَيْن'],[/(^|[^؀-ۿ])(ب|و|ف|ل|ك)?نعمة/g,'$1$2نِعْمَة'],[/(^|[^؀-ۿ])نعم الله/g,'$1نِعَمَ الله'],[/(^|[^؀-ۿ])نعمه(?=$|[^؀-ۿ])/g,'$1نِعَمِه']];
  R.forEach(function(r){ s=s.replace(r[0],r[1]); }); return s; }
function say(text) { return; if (muted || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(fixAr(text).replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '')); u.lang = 'ar-SA'; u.rate = 0.92; const v = speechSynthesis.getVoices().find((x) => /^ar/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {} }
$('#snd').onclick = () => { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.8; $('#snd').textContent = muted ? '🔇' : '🔊'; if (muted && window.speechSynthesis) speechSynthesis.cancel(); };
$('#fs').onclick = () => { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) {} };

// ---------------------------------------------------------------- confetti (2D overlay)
const cc = $('#conf'), cx = cc.getContext('2d'); let parts = [];
function confetti(n = 160) { cc.width = innerWidth; cc.height = innerHeight; const cols = ['#ffb703', '#2fbf71', '#f0545c', '#2b8cee', '#9b5de5']; for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + rnd(-150, 150), y: innerHeight * 0.3, vx: rnd(-9, 9), vy: rnd(-14, -4), r: rnd(5, 11), c: cols[i % 5], a: rnd(0, 6), l: 0 }); }
function drawConf() { if (!parts.length) return; cx.clearRect(0, 0, cc.width, cc.height); parts.forEach((p) => { p.vy += 0.4; p.x += p.vx; p.y += p.vy; p.a += 0.2; p.l++; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); cx.restore(); }); parts = parts.filter((p) => p.y < cc.height + 30 && p.l < 300); if (!parts.length) cx.clearRect(0, 0, cc.width, cc.height); }


// ---------------------------------------------------------------- questions (خطوتان: الحكم ثم السبب)
let doneN = 0, score = 0, quizZ = null, tries = 0, rtries = 0, stage = 0;
const MAXSCORE = ZONES.length * 2;
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const shakeQuiz = () => { const q = $('#quiz'); q.classList.remove('shake'); void q.offsetWidth; q.classList.add('shake'); };
function openQuiz(zn) {
  quizZ = zn; tries = 0; rtries = 0; stage = 1; target = null; marker.visible = false;
  $('#qN').textContent = '🔍 الموقف ' + zn.n + ' من ' + ZONES.length; $('#qT').textContent = zn.story;
  $('#qQ').textContent = 'هل هذا السلوك تعاوني؟';
  $('#qWhy').textContent = ''; $('#qWhy').className = ''; $('#qBtns').style.display = 'flex'; $('#qReasons').style.display = 'none'; $('#qNext').style.display = 'none';
  $('#quiz').classList.add('on'); tone(660, 0.2, 'triangle', 0.15); tone(880, 0.25, 'triangle', 0.15, 0.12);
  say(zn.story + '. تعاوني أم غير تعاوني؟');
}
function answer(c) {
  const zn = quizZ; if (!zn || stage !== 1) return;
  if (c === zn.coop) {
    if (!tries) score++; stage = 2;
    tone(784, 0.15, 'triangle', 0.18); tone(1047, 0.25, 'triangle', 0.18, 0.12);
    $('#qBtns').style.display = 'none'; $('#qWhy').textContent = ''; $('#qWhy').className = '';
    $('#qQ').textContent = (zn.coop ? '✔ أحسنتم! هذا سلوك تعاوني.' : '✔ أحسنتم! هذا سلوك غير تعاوني.') + ' فلماذا؟ اختاروا السبب الصحيح:';
    const box = $('#qReasons'); box.innerHTML = ''; box.style.display = 'flex';
    shuffle(zn.reasons.map((r, i) => ({ r, ok: i === 0 }))).forEach((o) => {
      const b = document.createElement('button'); b.textContent = o.r; b.onclick = () => pickReason(o.ok, b); box.appendChild(b);
    });
  } else {
    tries++; tone(300, 0.25, 'sawtooth', 0.12); tone(200, 0.35, 'sawtooth', 0.1, 0.2); shakeQuiz();
    $('#qWhy').textContent = '🤔 افحصوا السلوك بالعلامات الثلاث: هل يعملون معًا؟ هل يؤدي كل واحد دوره؟ هل هو عمل خير؟'; $('#qWhy').className = 'hint';
  }
}
function pickReason(ok, btn) {
  const zn = quizZ; if (!zn || stage !== 2) return;
  if (!ok) { rtries++; btn.disabled = true; btn.classList.add('bad'); tone(300, 0.25, 'sawtooth', 0.12); shakeQuiz(); $('#qWhy').textContent = '🤔 فكّروا من جديد: ماذا فعل كل واحد منهم في الموقف؟'; $('#qWhy').className = 'hint'; return; }
  if (!rtries) score++; stage = 3; zn.done = true; doneN++; $('#cnt').textContent = doneN; zn.result = { tries, rtries };
  zn.ring.material.color.set(zn.coop ? 0x2fbf71 : 0xf0545c);
  const st = textSprite(zn.coop ? '✔ تعاوني' : '✖ غير تعاوني', { size: 60, bg: zn.coop ? '#2fbf71' : '#f0545c', border: '#ffffff', color: '#ffffff', scale: 0.8 });
  st.position.set(zn.x, 7.4, zn.z); scene.add(st);
  $('#qReasons').style.display = 'none'; $('#qQ').textContent = '';
  $('#qWhy').textContent = (zn.coop ? '✔ سلوك تعاوني: ' : '✖ سلوك غير تعاوني: ') + zn.why; $('#qWhy').className = zn.coop ? 'ok' : 'no';
  $('#qNext').style.display = 'inline-block';
  chime(); if (zn.coop) confetti(80); say((zn.coop ? 'أحسنتم! سلوك تعاوني. ' : 'أحسنتم! سلوك غير تعاوني. ') + zn.why);
}
function closeQuiz() {
  $('#quiz').classList.remove('on'); quizZ = null; stage = 0;
  if (doneN === ZONES.length) setTimeout(showFinal, 400);
}
function showFinal() {
  const stars = score >= MAXSCORE - 1 ? 3 : score >= MAXSCORE * 0.65 ? 2 : 1;
  $('#fStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('#fScore').textContent = 'حصلتم على ' + score + ' من ' + MAXSCORE + ' نقاط من المحاولة الأولى 🕵️';
  $('#fList').innerHTML = ZONES.map((z) => '<li class="' + (z.coop ? 'c' : 'n') + '">' + (z.coop ? '✔ تعاوني' : '✖ غير تعاوني') + ' — ' + z.short + '</li>').join('');
  $('#final').style.display = 'flex'; confetti(260); [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.6, 'triangle', 0.2, i * 0.15));
  say('أحسنتم يا أبطال! وتعاونوا على البر والتقوى، ولا تعاونوا على الإثم والعدوان');
}
$('#yes').onclick = () => answer(true); $('#no').onclick = () => answer(false); $('#qNext').onclick = closeQuiz;
$('#again').onclick = () => location.reload();


// ---------------------------------------------------------------- loop
const clock = new THREE.Clock(); let walkPh = 0, stepT = 0, chirpT = 2, speedNow = 0;
let vShift = 0; const camPos = new THREE.Vector3(), lookAt = new THREE.Vector3();
function update(dt, t) {
  // input vector (camera-relative)
  let ix = 0, iz = 0;
  if (quizZ) { target = null; }
  if (keys['arrowup'] || keys['w'] || keys['ص']) iz -= 1;
  if (keys['arrowdown'] || keys['s'] || keys['س']) iz += 1;
  if (keys['arrowleft'] || keys['a'] || keys['ش']) ix -= 1;
  if (keys['arrowright'] || keys['d'] || keys['ي']) ix += 1;
  ix += jv.x; iz += jv.y; if (quizZ) { ix = 0; iz = 0; }
  let mx = 0, mz = 0;
  if (ix || iz) {
    const l = Math.min(1, Math.hypot(ix, iz)); const a = Math.atan2(ix, iz);
    const dirA = a + camYaw; mx = Math.sin(dirA) * l; mz = Math.cos(dirA) * l; marker.visible = false; target = null;
  } else if (target) {
    const dx = target.x - player.position.x, dz = target.z - player.position.z, d = Math.hypot(dx, dz);
    if (d < 0.4) { target = null; marker.visible = false; } else { mx = dx / d; mz = dz / d; }
  }
  const run = keys['shift'] ? 1.6 : 1; const want = (mx || mz) ? 6.2 * run : 0;
  speedNow += (want - speedNow) * Math.min(1, dt * 8);
  if (mx || mz) {
    const ang = Math.atan2(mx, mz); let da = ang - player.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); player.rotation.y += da * Math.min(1, dt * 10);
    const ml = Math.hypot(mx, mz); player.position.x += (mx / ml) * speedNow * dt; player.position.z += (mz / ml) * speedNow * dt;
    if (ix || iz) { let dy = (player.rotation.y + Math.PI) - camYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); if (iz < 0) camYaw += dy * Math.min(1, dt * 1.2); }
  }
  // collisions & bounds
  colliders.forEach((c) => { const dx = player.position.x - c.x, dz = player.position.z - c.z, d = Math.hypot(dx, dz), r = c.r + 0.5; if (d < r && d > 0.0001) { player.position.x = c.x + dx / d * r; player.position.z = c.z + dz / d * r; } });
  const pd = Math.hypot(player.position.x, player.position.z); if (pd > 68) { player.position.x *= 68 / pd; player.position.z *= 68 / pd; }
  if (player.position.z < -36.5) player.position.z = -36.5;
  // walk animation
  const moving = speedNow > 0.3; walkPh += dt * speedNow * 1.6;
  const sw = moving ? Math.sin(walkPh) : 0;
  P.arms[0].rotation.x = sw * 0.7; P.arms[1].rotation.x = -sw * 0.7;
  P.feet[0].position.z = 0.04 + sw * 0.28; P.feet[1].position.z = 0.04 - sw * 0.28;
  P.feet[0].position.y = 0.06 + Math.max(0, sw) * 0.1; P.feet[1].position.y = 0.06 + Math.max(0, -sw) * 0.1;
  player.position.y = moving ? Math.abs(Math.sin(walkPh)) * 0.09 : Math.sin(t * 2) * 0.015;
  P.head.rotation.z = moving ? Math.sin(walkPh) * 0.05 : Math.sin(t * 0.8) * 0.04;
  P.body.rotation.z = moving ? Math.sin(walkPh) * 0.04 : 0;
  shadowBlob.position.x = player.position.x; shadowBlob.position.z = player.position.z;
  if (moving) { stepT -= dt * speedNow / 6.2; if (stepT <= 0) { stepT = 0.33; step(); } }
  if (marker.visible) marker.scale.setScalar(1 + Math.sin(t * 6) * 0.15);
  updateGuide(t); drawMap(t);
  // camera
  let tx = player.position.x, tz = player.position.z;
  if (quizZ) { const want = Math.atan2(tx - quizZ.x, tz - quizZ.z); let dy = want - camYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); camYaw += dy * Math.min(1, dt * 3); camPitch += (0.5 - camPitch) * Math.min(1, dt * 2); tx = (tx + quizZ.x) / 2; tz = (tz + quizZ.z) / 2; }
  camPos.set(tx + Math.sin(camYaw) * Math.cos(camPitch) * camDist, 1.6 + Math.sin(camPitch) * camDist, tz + Math.cos(camYaw) * Math.cos(camPitch) * camDist);
  vShift += ((quizZ ? (innerWidth < innerHeight ? 0.3 : 0.2) : 0) - vShift) * Math.min(1, dt * 4); if (Math.abs(vShift) > 0.002 || camera.view) { if (Math.abs(vShift) > 0.002) camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight * vShift, innerWidth, innerHeight); else camera.clearViewOffset(); }
  camera.position.lerp(camPos, Math.min(1, dt * 6)); lookAt.lerp(new THREE.Vector3(tx, 1.7, tz), Math.min(1, dt * 8)); camera.lookAt(lookAt);
  sunLight.position.set(tx + 40, 60, tz + 25); sunLight.target.position.set(tx, 0, tz);
  // villagers face player when near
  villagers.forEach((v) => { const d = v.position.distanceTo(player.position); if (d < 8) { const a = Math.atan2(player.position.x - v.position.x, player.position.z - v.position.z); let da = a - v.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); v.rotation.y += da * Math.min(1, dt * 3); } });
  // zones
  if (!quizZ) ZONES.forEach((zn) => { if (!zn.done && Math.hypot(player.position.x - zn.x, player.position.z - zn.z) < 5.3) openQuiz(zn); });
  // ambient
  if (waveGain) waveGain.gain.value = muted ? 0 : Math.max(0, 0.5 - (player.position.z + 36) * 0.02);
  chirpT -= dt; if (chirpT < 0) { chirpT = rnd(2.5, 6); chirp(); }
}
// ---------------------------------------------------------------- guide arrow, minimap, adaptive quality
const guide = new THREE.Group();
{ const c = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.0, 4), new THREE.MeshBasicMaterial({ color: 0xffb703 })); c.rotation.x = Math.PI / 2; c.scale.z = 0.35; guide.add(c);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.7), new THREE.MeshBasicMaterial({ color: 0xffb703 })); tail.position.z = -0.75; guide.add(tail); }
guide.visible = false; scene.add(guide);
const zDone = (z) => z.found || z.done;
let nearest = null;
function updateGuide(t) {
  let best = null, bd = 1e9; const px = player.position.x, pz = player.position.z;
  ZONES.forEach((z) => { if (zDone(z)) return; const d = Math.hypot(z.x - px, z.z - pz); if (d < bd) { bd = d; best = z; } });
  nearest = best; const busy = typeof quizZ !== 'undefined' && quizZ;
  if (!best || bd < 7 || busy) { guide.visible = false; return; }
  const a = Math.atan2(best.x - px, best.z - pz), r = 2.7 + Math.sin(t * 5) * 0.3;
  guide.visible = true; guide.position.set(px + Math.sin(a) * r, 0.5, pz + Math.cos(a) * r); guide.rotation.y = a; guide.scale.setScalar(1.6);
}
const mapC = $('#map'), mg = mapC ? mapC.getContext('2d') : null; let mapTick = 0;
function drawMap(t) {
  if (!mg || (mapTick++ % 3)) return;
  const S = mapC.width, c = S / 2, k = (c - 8) / 74; const X = (x) => c - x * k, Y = (z) => c - z * k;
  mg.clearRect(0, 0, S, S); mg.save(); mg.beginPath(); mg.arc(c, c, c - 4, 0, 6.283); mg.clip();
  mg.fillStyle = '#8fd06a'; mg.fillRect(0, 0, S, S);
  mg.fillStyle = '#f1d9a0'; mg.fillRect(0, Y(-33), S, S); mg.fillStyle = '#2fa8dc'; mg.fillRect(0, Y(-38), S, S);
  mg.strokeStyle = 'rgba(230,207,156,.95)'; mg.lineWidth = 4; ZONES.forEach((z) => { mg.beginPath(); mg.moveTo(c, c); mg.lineTo(X(z.x * 0.8), Y(z.z * 0.8)); mg.stroke(); });
  mg.fillStyle = '#e9d8b4'; mg.beginPath(); mg.arc(c, c, 9 * k, 0, 6.283); mg.fill(); mg.fillStyle = '#5ec4f0'; mg.beginPath(); mg.arc(c, c, 3 * k, 0, 6.283); mg.fill();
  ZONES.forEach((z) => {
    const done = zDone(z); const col = done ? (z.coop === false ? '#f0545c' : '#2fbf71') : '#ffd23f';
    if (z === nearest) { mg.strokeStyle = '#ffffff'; mg.lineWidth = 3; mg.beginPath(); mg.arc(X(z.x), Y(z.z), 11 + Math.sin(t * 5) * 3, 0, 6.283); mg.stroke(); }
    mg.fillStyle = col; mg.strokeStyle = '#3b2f1a'; mg.lineWidth = 2; mg.beginPath(); mg.arc(X(z.x), Y(z.z), 7, 0, 6.283); mg.fill(); mg.stroke();
    if (done) { mg.fillStyle = '#fff'; mg.font = 'bold 11px sans-serif'; mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillText(z.coop === false ? '✖' : '✔', X(z.x), Y(z.z) + 1); }
  });
  mg.translate(X(player.position.x), Y(player.position.z)); mg.rotate(-player.rotation.y);
  mg.fillStyle = '#ffffff'; mg.strokeStyle = '#d6336c'; mg.lineWidth = 3; mg.beginPath(); mg.moveTo(0, -11); mg.lineTo(8, 8); mg.lineTo(0, 4); mg.lineTo(-8, 8); mg.closePath(); mg.fill(); mg.stroke();
  mg.restore(); mg.strokeStyle = '#ffffff'; mg.lineWidth = 5; mg.beginPath(); mg.arc(c, c, c - 4, 0, 6.283); mg.stroke();
}
let qLevel = 0, qFrames = 0, qT0 = performance.now();
function adaptQuality() {
  qFrames++; const now = performance.now(); if (now - qT0 < 2500) return;
  const fps = qFrames * 1000 / (now - qT0); qFrames = 0; qT0 = now;
  if (fps < 26 && qLevel < 3) {
    qLevel++;
    if (qLevel === 1) renderer.setPixelRatio(1);
    else if (qLevel === 2) { sunLight.castShadow = false; shadowBlob.material.opacity = 0.28; }
    else { renderer.setPixelRatio(0.7); scene.fog.far = 120; }
  }
}
let started = false;
function frame() {
  const dt = Math.min(0.1, clock.getDelta()), t = clock.elapsedTime;
  anim.forEach((f) => f(t, dt));
  if (started) update(dt, t); else { camYaw += dt * 0.12; camera.position.set(Math.sin(camYaw) * 30, 16, Math.cos(camYaw) * 30 + 5); camera.lookAt(0, 2, 5); }
  renderer.render(scene, camera); drawConf(); if (started) adaptQuality();
  requestAnimationFrame(frame);
}
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
frame();
$('#loading').textContent = '';
$('#start').onclick = () => { audio(); started = true; camYaw = Math.PI; $('#start').style.display = 'none';  };
window.__game = { get q() { return qLevel; }, player, ZONES, keys, answer, closeQuiz, get done() { return doneN; }, get score() { return score; }, teleport(x, z) { player.position.set(x, 0, z); } };
