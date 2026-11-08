import * as THREE from 'three';
import { rng } from './util.js';

export function cnv(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
export function toTex(c, { srgb = true, rep = null, aniso = 8 } = {}){
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
  if (rep){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}

// Art-deco hotel front: returns {map, emis}. 512x512 covers the whole facade.
export function facade(seed, base, trim, { floors = 4, cols = 6, lit = .35, awning = '#E8577E' } = {}){
  const r = rng(seed), [c, g] = cnv(512, 512), [e, ge] = cnv(512, 512);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512); ge.fillStyle = '#000'; ge.fillRect(0, 0, 512, 512);
  // subtle stucco noise
  for (let i = 0; i < 2500; i++){ g.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},${r() * .05})`; g.fillRect(r() * 512, r() * 512, 2, 2); }
  const top = 40, bottom = 430, fh = (bottom - top) / floors, cw = 512 / cols;
  for (let f = 0; f < floors; f++){
    const y = top + f * fh;
    // eyebrow ledge shadow + trim band (deco)
    g.fillStyle = trim; g.fillRect(0, y - 6, 512, 6);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y, 512, 7);
    for (let k = 0; k < cols; k++){
      const x = k * cw + cw * .18, w = cw * .64, h = fh * .58, wy = y + fh * .2;
      const gr = g.createLinearGradient(0, wy, 0, wy + h); gr.addColorStop(0, '#9CC9E0'); gr.addColorStop(.5, '#3E6E8E'); gr.addColorStop(1, '#1F3A52');
      g.fillStyle = gr; g.fillRect(x, wy, w, h);
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.strokeRect(x, wy, w, h); g.beginPath(); g.moveTo(x + w / 2, wy); g.lineTo(x + w / 2, wy + h); g.stroke();
      if (r() < lit){ const warm = r() < .7; ge.fillStyle = warm ? '#FFC67A' : '#FF8FD8'; ge.fillRect(x + 3, wy + 3, w - 6, h - 6); g.fillStyle = warm ? 'rgba(255,214,150,.55)' : 'rgba(255,170,230,.5)'; g.fillRect(x + 3, wy + 3, w - 6, h - 6); }
    }
  }
  // vertical pilasters
  g.fillStyle = trim; for (let k = 0; k <= cols; k += Math.max(1, Math.floor(cols / 3))) g.fillRect(k * cw - 5, top - 10, 10, bottom - top + 10);
  // ground floor: storefront + striped awning
  g.fillStyle = '#2B3440'; g.fillRect(20, bottom + 12, 472, 70);
  for (let k = 0; k < 12; k++){ g.fillStyle = k % 2 ? '#FFFFFF' : awning; g.beginPath(); g.moveTo(20 + k * 39.3, bottom); g.lineTo(20 + (k + 1) * 39.3, bottom); g.lineTo(20 + (k + 1) * 39.3 + 4, bottom + 26); g.lineTo(20 + k * 39.3 + 4, bottom + 26); g.fill(); }
  ge.fillStyle = '#FFB86B'; ge.fillRect(30, bottom + 30, 452, 46);
  g.fillStyle = 'rgba(255,200,120,.6)'; g.fillRect(30, bottom + 30, 452, 46);
  // roof cap
  g.fillStyle = trim; g.fillRect(0, 0, 512, 16);
  return { map: toTex(c), emis: toTex(e) };
}

export function skylineTex(seed){
  const r = rng(seed), [c, g] = cnv(256, 512), [e, ge] = cnv(256, 512);
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#3A4660'); gr.addColorStop(1, '#1E2536'); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, 256, 512);
  for (let y = 8; y < 512; y += 16) for (let x = 6; x < 256; x += 14){
    g.fillStyle = 'rgba(140,180,220,.35)'; g.fillRect(x, y, 8, 9);
    if (r() < .32){ const col = r() < .75 ? '#FFD9A0' : '#BFE6FF'; ge.fillStyle = col; ge.fillRect(x, y, 8, 9); }
  }
  return { map: toTex(c, { rep: [1, 1] }), emis: toTex(e, { rep: [1, 1] }) };
}

export function asphalt(){
  const r = rng(3), [c, g] = cnv(1024, 256);
  g.fillStyle = '#2C2D33'; g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 9000; i++){ const v = 30 + r() * 40; g.fillStyle = `rgba(${v},${v},${v + 5},.5)`; g.fillRect(r() * 1024, r() * 256, 2, 2); }
  g.fillStyle = '#E8C547'; g.fillRect(0, 122, 1024, 4); g.fillRect(0, 131, 1024, 4);
  g.fillStyle = '#E8E8E8'; for (let x = 0; x < 1024; x += 128){ g.fillRect(x, 62, 70, 4); g.fillRect(x, 190, 70, 4); }
  g.fillRect(0, 6, 1024, 5); g.fillRect(0, 245, 1024, 5);
  return toTex(c, { rep: [1, 1] });
}
export function sand(){
  const r = rng(9), [c, g] = cnv(512, 512);
  g.fillStyle = '#E9C99A'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++){ const k = r(); g.fillStyle = k < .5 ? `rgba(255,240,210,${r() * .35})` : `rgba(150,110,70,${r() * .25})`; g.fillRect(r() * 512, r() * 512, 1.5, 1.5); }
  g.strokeStyle = 'rgba(160,120,80,.10)'; g.lineWidth = 3;
  for (let y = 0; y < 512; y += 22){ g.beginPath(); for (let x = 0; x <= 512; x += 8) g.lineTo(x, y + Math.sin(x * .05 + y) * 4); g.stroke(); }
  return toTex(c, { rep: [1, 1] });
}
export function planks(){
  const r = rng(4), [c, g] = cnv(512, 512);
  for (let y = 0; y < 512; y += 32){ const v = 120 + r() * 40; g.fillStyle = `rgb(${v},${v * .72},${v * .5})`; g.fillRect(0, y, 512, 30); g.fillStyle = 'rgba(40,25,15,.6)'; g.fillRect(0, y + 30, 512, 2);
    for (let i = 0; i < 40; i++){ g.fillStyle = `rgba(60,35,20,${r() * .2})`; g.fillRect(r() * 512, y + r() * 30, 30 + r() * 80, 1); } }
  return toTex(c, { rep: [1, 1] });
}
export function tiles(){
  const [c, g] = cnv(256, 256); g.fillStyle = '#E6D5C8'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(150,120,110,.5)'; g.lineWidth = 2; for (let i = 0; i <= 256; i += 32){ g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
  g.fillStyle = 'rgba(232,87,126,.25)'; for (let y = 0; y < 256; y += 64) for (let x = (y / 64 % 2) * 32; x < 256; x += 64) g.fillRect(x, y, 32, 32);
  return toTex(c, { rep: [1, 1] });
}

// Hawaiian / tracksuit shirts
export function shirt(seed, base, motif, accent){
  const r = rng(seed), [c, g] = cnv(512, 512);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  if (motif === 'track'){
    g.fillStyle = accent; g.fillRect(40, 0, 26, 512); g.fillRect(446, 0, 26, 512); g.fillStyle = '#FFFFFF'; g.fillRect(70, 0, 8, 512); g.fillRect(434, 0, 8, 512);
    return toTex(c);
  }
  for (let i = 0; i < 26; i++){
    const x = r() * 512, y = r() * 512, s = 18 + r() * 26, a = r() * 6.28;
    g.save(); g.translate(x, y); g.rotate(a);
    if (motif === 'palm'){ g.fillStyle = '#2E8B57'; for (let k = 0; k < 5; k++){ g.rotate(1.25); g.beginPath(); g.ellipse(s * .6, 0, s * .7, s * .18, 0, 0, 7); g.fill(); } }
    else if (motif === 'flamingo'){ g.fillStyle = '#FF7FB6'; g.beginPath(); g.ellipse(0, 0, s * .6, s * .35, 0, 0, 7); g.fill(); g.fillRect(-2, -s, 4, s); g.beginPath(); g.arc(0, -s, s * .18, 0, 7); g.fill(); g.strokeStyle = '#E86A9A'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, s * .3); g.lineTo(0, s * 1.2); g.stroke(); }
    else if (motif === 'flower'){ for (let k = 0; k < 5; k++){ g.rotate(1.2566); g.fillStyle = k % 2 ? accent : '#FFFFFF'; g.beginPath(); g.ellipse(s * .45, 0, s * .45, s * .25, 0, 0, 7); g.fill(); } g.fillStyle = '#FFD84A'; g.beginPath(); g.arc(0, 0, s * .2, 0, 7); g.fill(); }
    else if (motif === 'heart'){ g.fillStyle = accent; g.beginPath(); g.moveTo(0, s * .35); g.bezierCurveTo(-s, -s * .3, -s * .3, -s * .9, 0, -s * .3); g.bezierCurveTo(s * .3, -s * .9, s, -s * .3, 0, s * .35); g.fill(); }
    else if (motif === 'leaf'){ g.fillStyle = accent; g.beginPath(); g.ellipse(0, 0, s, s * .3, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.stroke(); }
    g.restore();
  }
  return toTex(c);
}

// glowing neon text (additive on black). Returns {tex, aspect}
export function neonText(text, { font = '900 120px Lalezar', color = '#FF3FD0', core = '#FFF3FC', pad = 40, dir = 'rtl' } = {}){
  const [m, mg] = cnv(4, 4); mg.font = font; const w = Math.ceil(mg.measureText(text).width) + pad * 2; const h = parseInt(font.match(/(\d+)px/)[1]) * 1.6 + pad;
  const [c, g] = cnv(w, h); g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = dir;
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  for (const [b, a] of [[40, .7], [18, .9], [6, 1]]){ g.shadowColor = color; g.shadowBlur = b; g.fillStyle = color; g.globalAlpha = a; g.fillText(text, w / 2, h / 2); }
  g.shadowBlur = 0; g.globalAlpha = 1; g.fillStyle = core; g.fillText(text, w / 2, h / 2);
  return { tex: toTex(c), aspect: w / h };
}
export function cloud(seed){
  const r = rng(seed), [c, g] = cnv(512, 256);
  for (let i = 0; i < 70; i++){
    const x = 60 + r() * 392, y = 90 + r() * 90 - Math.abs(x - 256) * .15, rad = 25 + r() * 60;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return toTex(c);
}
// tileable analytic wave normal map
export function waterNormal(size = 256){
  const r = rng(21), data = new Uint8Array(size * size * 4), waves = [];
  for (let i = 0; i < 18; i++){ const kx = Math.round((r() - .5) * 18), ky = Math.round((r() - .5) * 18) || 1; const a = .9 / Math.sqrt(kx * kx + ky * ky + 1); waves.push([kx, ky, a, r() * 6.283]); }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++){
    let dx = 0, dy = 0;
    for (const [kx, ky, a, p] of waves){ const ph = 2 * Math.PI * (kx * x / size + ky * y / size) + p, cc = Math.cos(ph) * a; dx += cc * kx; dy += cc * ky; }
    let nx = -dx * .045, ny = -dy * .045, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const i = (y * size + x) * 4; data[i] = (nx * .5 + .5) * 255; data[i + 1] = (ny * .5 + .5) * 255; data[i + 2] = (nz * .5 + .5) * 255; data[i + 3] = 255;
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
}
export function frond(){
  const [c, g] = cnv(128, 512); g.clearRect(0, 0, 128, 512);
  g.strokeStyle = '#3B6B2A'; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 512); g.stroke();
  for (let y = 10; y < 500; y += 9){ const L = 58 * Math.sin(Math.PI * y / 512) + 6; g.strokeStyle = y % 18 ? '#4F8F34' : '#3E7A2A'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(64, y); g.lineTo(64 - L, y + 18); g.moveTo(64, y); g.lineTo(64 + L, y + 18); g.stroke(); }
  return toTex(c);
}
export function stripes(a, b, n = 8){ const [c, g] = cnv(256, 256); for (let i = 0; i < n; i++){ g.fillStyle = i % 2 ? a : b; g.fillRect(i * 256 / n, 0, 256 / n + 1, 256); } return toTex(c); }
