import * as THREE from 'three';
const std = o => new THREE.MeshStandardMaterial(o);
function mk(geo, mat, parent, x = 0, y = 0, z = 0){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }

// Low convertible sports car built from an extruded side profile. Faces +x.
export function makeCar(color = 0xFF3F9A, glow = '#FF3FD0'){
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-2.25, .35); s.lineTo(2.1, .35); s.quadraticCurveTo(2.35, .38, 2.32, .62); s.quadraticCurveTo(2.2, .78, 1.2, .86); s.lineTo(.45, .9);
  s.lineTo(-.55, .92); s.lineTo(-1.7, .95); s.quadraticCurveTo(-2.3, .95, -2.3, .7); s.lineTo(-2.25, .35);
  const body = new THREE.ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: true, bevelThickness: .12, bevelSize: .1, bevelSegments: 4, curveSegments: 16 });
  body.translate(0, 0, -.85);
  const paint = new THREE.MeshPhysicalMaterial({ color, metalness: .55, roughness: .25, clearcoat: 1, clearcoatRoughness: .05 });
  mk(body, paint, g);
  // cabin cutout (dark interior) + seats + windshield
  mk(new THREE.BoxGeometry(1.7, .25, 1.5), std({ color: 0x1A1214, roughness: .8 }), g, -.35, .86, 0);
  for (const z of [-.38, .38]) { const st = mk(new THREE.BoxGeometry(.5, .55, .5), std({ color: 0xF4EEE4, roughness: .6 }), g, -.75, 1.05, z); st.rotation.z = .2; }
  const ws = mk(new THREE.BoxGeometry(.05, .42, 1.55), new THREE.MeshPhysicalMaterial({ color: 0x223344, metalness: .2, roughness: .05, transparent: true, opacity: .45 }), g, .5, 1.13, 0); ws.rotation.z = .55;
  const wheels = [];
  for (const [x, z] of [[1.45, .92], [1.45, -.92], [-1.45, .92], [-1.45, -.92]]){
    const w = new THREE.Group(); w.position.set(x, .38, z); g.add(w);
    mk(new THREE.CylinderGeometry(.38, .38, .28, 24).rotateX(Math.PI / 2), std({ color: 0x111111, roughness: .7 }), w);
    mk(new THREE.CylinderGeometry(.24, .24, .3, 12).rotateX(Math.PI / 2), std({ color: 0xDADADA, metalness: 1, roughness: .2 }), w);
    wheels.push(w);
  }
  const hl = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 2.6), toneMapped: false });
  for (const z of [-.6, .6]) mk(new THREE.BoxGeometry(.06, .1, .32), hl, g, 2.32, .58, z);
  const tl = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, .2, .25), toneMapped: false });
  for (const z of [-.62, .62]) mk(new THREE.BoxGeometry(.06, .1, .36), tl, g, -2.36, .72, z);
  const ug = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(glow).multiplyScalar(1.6), transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  ug.rotation.x = -Math.PI / 2; ug.position.y = .05; g.add(ug);
  g.userData = { wheels, paint };
  return g;
}
export function makeRod(){
  const g = new THREE.Group();
  const rod = mk(new THREE.CylinderGeometry(.008, .02, 2.2, 6), std({ color: 0x222222, roughness: .4 }), g, 0, 1.1, 0);
  mk(new THREE.CylinderGeometry(.045, .045, .06, 12).rotateZ(Math.PI / 2), std({ color: 0xC0C0C0, metalness: 1, roughness: .3 }), g, .03, .25, 0);
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 2.2, 0), new THREE.Vector3(0, 0, 0)]);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff })); g.add(line);
  g.userData = { rod, line };
  return g;
}
export function makeFish(){
  const g = new THREE.Group();
  const bodyM = std({ color: 0xFF8A2A, roughness: .35, metalness: .1 });
  mk(new THREE.SphereGeometry(.22, 20, 14), bodyM, g).scale.set(1.5, .9, .55);
  const tail = mk(new THREE.ConeGeometry(.16, .28, 4), bodyM, g, -.4, 0, 0); tail.rotation.z = Math.PI / 2; tail.scale.z = .3;
  const gl = std({ color: 0x050505, metalness: .9, roughness: .05 });
  for (const z of [-.11, .11]) { mk(new THREE.BoxGeometry(.11, .07, .02), gl, g, .2, .06, z); }
  mk(new THREE.BoxGeometry(.02, .015, .24), std({ color: 0xFFD24A, metalness: 1 }), g, .2, .08, 0);
  return g;
}
export function heartGeo(){
  const s = new THREE.Shape(); s.moveTo(0, -.3); s.bezierCurveTo(-.9, .3, -.35, .95, 0, .45); s.bezierCurveTo(.35, .95, .9, .3, 0, -.3);
  return new THREE.ExtrudeGeometry(s, { depth: .12, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 3 }).center();
}
export function makeWaterGun(){
  const g = new THREE.Group();
  const a = std({ color: 0x3FD8FF, roughness: .3 }), b = std({ color: 0xFF4FA8, roughness: .3 }), c = std({ color: 0xFFD23F, roughness: .3 });
  mk(new THREE.BoxGeometry(.7, .16, .14), a, g, .1, 0, 0); mk(new THREE.CylinderGeometry(.04, .04, .4, 10).rotateZ(Math.PI / 2), c, g, .6, .02, 0);
  mk(new THREE.CylinderGeometry(.13, .13, .3, 16), b, g, -.05, .2, 0); mk(new THREE.BoxGeometry(.12, .26, .12), c, g, -.15, -.17, 0).rotation.z = -.3;
  return g;
}
export function sparkleTex(){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,240,200,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.fillStyle = '#fff';
  g.beginPath(); g.moveTo(64, 0); g.lineTo(70, 58); g.lineTo(128, 64); g.lineTo(70, 70); g.lineTo(64, 128); g.lineTo(58, 70); g.lineTo(0, 64); g.lineTo(58, 58); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
