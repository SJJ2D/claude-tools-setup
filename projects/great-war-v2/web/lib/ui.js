import { cl, lerp, seg, eo, back, elastic, hash } from './util.js';
export const TEAM = { sayyad: { a: '#FFC83A', b: '#FF3FA4', dark: '#2A0F2E' }, rival: { a: '#3FE6FF', b: '#3F6BFF', dark: '#081A33' } };

function rr(g, x, y, w, h, r){ g.beginPath(); g.roundRect(x, y, w, h, r); }
function para(g, x, y, w, h, sk){ g.beginPath(); g.moveTo(x + sk, y); g.lineTo(x + w + sk, y); g.lineTo(x + w - sk, y + h); g.lineTo(x - sk, y + h); g.closePath(); }
export function txt(g, s, x, y, { font = '900 60px Tajawal', fill = '#fff', stroke = null, sw = 8, align = 'center', dir = 'rtl', glow = null, gb = 20, alpha = 1 } = {}){
  g.save(); g.globalAlpha *= alpha; g.font = font; g.textAlign = align; g.direction = dir; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if (glow){ g.shadowColor = glow; g.shadowBlur = gb; }
  if (stroke){ g.lineWidth = sw; g.strokeStyle = stroke; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y); g.restore();
}
// extruded poster title
export function bigTitle(g, s, x, y, k, { size = 150, c1 = '#FFF4C2', c2 = '#FF9A2E', depth = 14, ex = '#5A1630', glow = 'rgba(255,140,40,.7)', font = 'Lalezar' } = {}){
  if (k <= 0) return; const sc = k < 1 ? lerp(2.2, 1, eo(k)) : 1, a = cl(k * 3);
  g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha = a; g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.lineJoin = 'round';
  for (let i = depth; i > 0; i--){ g.fillStyle = ex; g.fillText(s, i * .6, i); }
  g.lineWidth = 14; g.strokeStyle = '#1A0612'; g.strokeText(s, 0, 0);
  const gr = g.createLinearGradient(0, -size * .5, 0, size * .5); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.shadowColor = glow; g.shadowBlur = 40; g.fillStyle = gr; g.fillText(s, 0, 0); g.restore();
}
export function nameCard(g, k, c){
  // k: 0..1 in, 1 hold, >1 out (k-1 is out progress)
  if (k <= 0 || k >= 2) return;
  const T = TEAM[c.team], inK = eo(cl(k)), outK = k > 1 ? eo(k - 1) : 0;
  const x0 = 1110 + (1 - inK) * 900 + outK * 900, y0 = 520, w = 700, h = 330;
  g.save();
  // backing panel
  para(g, x0, y0, w, h, 26); const gr = g.createLinearGradient(x0, y0, x0 + w, y0 + h); gr.addColorStop(0, T.dark); gr.addColorStop(1, 'rgba(10,6,18,.92)'); g.fillStyle = gr; g.fill();
  g.lineWidth = 7; g.strokeStyle = '#FFFFFF'; g.stroke();
  // halftone corner
  g.save(); para(g, x0, y0, w, h, 26); g.clip(); g.fillStyle = T.b + '55'; for (let yy = 0; yy < h; yy += 14) for (let xx = 0; xx < 260; xx += 14){ const r = 5 * (1 - xx / 260); g.beginPath(); g.arc(x0 + xx + (yy / 14 % 2) * 7, y0 + yy, r, 0, 7); g.fill(); } g.restore();
  // team ribbon
  para(g, x0 + w - 290, y0 - 32, 280, 56, 14); g.fillStyle = T.a; g.fill(); g.lineWidth = 5; g.strokeStyle = '#111'; g.stroke();
  txt(g, c.teamLabel, x0 + w - 150, y0 - 4, { font: '30px Lalezar', fill: '#1A0B10' });
  // name (stutter effect optional)
  let nm = c.name; if (c.stutter && k < 1){ const parts = c.stutter; nm = parts.slice(0, 1 + Math.floor(cl(k * 1.05) * parts.length * .999)).join(''); }
  txt(g, nm, x0 + w - 40, y0 + 78, { font: `${c.nameSize || 84}px Lalezar`, align: 'right', fill: '#FFFFFF', stroke: '#000', sw: 10, glow: T.b, gb: 18 });
  txt(g, c.sub, x0 + w - 44, y0 + 150, { font: '800 40px Tajawal', align: 'right', fill: T.a });
  // stats
  c.stats.forEach(([lab, val, disp], i) => {
    const yy = y0 + 205 + i * 40, kk = eo(cl((k - .25 - i * .12) * 2.2)); if (kk <= 0) return;
    txt(g, lab, x0 + w - 44, yy, { font: '800 30px Tajawal', align: 'right', fill: '#FFFFFF', alpha: kk });
    const bx = x0 + 110, bw = 330; rr(g, bx, yy - 11, bw, 22, 11); g.fillStyle = 'rgba(255,255,255,.15)'; g.fill();
    const v = typeof val === 'number' ? Math.min(val, 1.25) : 1, fw = bw * v * kk;
    rr(g, bx + bw - Math.min(fw, bw), yy - 11, Math.min(fw, bw), 22, 11); const bg = g.createLinearGradient(bx, 0, bx + bw, 0); bg.addColorStop(0, T.b); bg.addColorStop(1, T.a); g.fillStyle = bg; g.fill();
    txt(g, disp, bx - 12, yy, { font: '900 30px Anton', align: 'right', dir: 'ltr', fill: val > 1 ? '#FF4F4F' : '#FFFFFF', alpha: kk });
  });
  g.restore();
}
export function teamBadge(g, s, x, y, k, team){
  if (k <= 0) return; const T = TEAM[team], sc = back(cl(k * 1.4));
  g.save(); g.translate(x, y); g.scale(sc, sc); para(g, -330, -62, 660, 124, 28); g.fillStyle = T.dark; g.fill(); g.lineWidth = 8; g.strokeStyle = T.a; g.stroke();
  txt(g, s, 0, 6, { font: '96px Lalezar', fill: '#fff', stroke: '#000', sw: 10, glow: T.b, gb: 24 }); g.restore();
}
export function pop(g, s, x, y, k, { color = '#FFD23F', rot = -.12, size = 90, ink = '#1A0612' } = {}){
  if (k <= 0 || k >= 1) return; const sc = k < .3 ? elastic(k / .3) : 1, a = k > .8 ? (1 - k) / .2 : 1;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha = a;
  g.beginPath(); const n = 14; for (let i = 0; i <= n * 2; i++){ const r = (i % 2 ? .62 : 1) * size * 1.5, an = i / (n * 2) * Math.PI * 2; g.lineTo(Math.cos(an) * r * 1.35, Math.sin(an) * r); }
  g.fillStyle = color; g.fill(); g.lineWidth = 7; g.strokeStyle = ink; g.stroke();
  txt(g, s, 0, 6, { font: `${size}px Lalezar`, fill: '#FFFFFF', stroke: ink, sw: 12 }); g.restore();
}
export function stamp(g, s, x, y, k, { color = '#FF2A4A', rot = -.18, size = 150 } = {}){
  if (k <= 0) return; const sc = k < .25 ? lerp(3, 1, eo(k / .25)) : 1;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha = cl(k * 4) * .92;
  g.font = `900 ${size}px Anton`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(s).width + 70;
  g.lineWidth = 14; g.strokeStyle = color; rr(g, -w / 2, -size * .65, w, size * 1.3, 22); g.stroke();
  g.fillStyle = color; g.fillText(s, 0, 8); g.restore();
}
export function wifi(g, x, y, k){
  if (k <= 0) return; const sc = elastic(cl(k * 1.5));
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.fillStyle = 'rgba(10,10,20,.75)'; g.beginPath(); g.arc(0, 0, 120, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#fff'; g.stroke();
  g.lineCap = 'round'; for (let i = 1; i <= 3; i++){ g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 16; g.beginPath(); g.arc(0, 45, i * 34, -Math.PI * .78, -Math.PI * .22); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.arc(0, 45, 10, 0, 7); g.fill();
  const xk = cl(k * 2 - .6); g.strokeStyle = '#FF3B3B'; g.lineWidth = 16; g.beginPath(); g.moveTo(-60, -60); g.lineTo(-60 + 120 * xk, -60 + 120 * xk); g.stroke();
  if (xk > .5){ const x2 = cl(xk * 2 - 1); g.beginPath(); g.moveTo(60, -60); g.lineTo(60 - 120 * x2, -60 + 120 * x2); g.stroke(); }
  g.restore();
}
export function circleMark(g, x, y, r, k, label){
  if (k <= 0) return; g.save(); g.strokeStyle = '#FF2A4A'; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); for (let i = 0; i <= 60 * cl(k * 1.6); i++){ const a = i / 60 * Math.PI * 2.15 - .5, rr2 = r * (1 + Math.sin(a * 3) * .06); g.lineTo(x + Math.cos(a) * rr2 * 1.15, y + Math.sin(a) * rr2); } g.stroke();
  const ak = cl(k * 2 - .8); if (ak > 0){ const ax = x + r * 1.3, ay = y - r * 1.1, bx = ax + 170 * ak, by = ay - 120 * ak; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    txt(g, label, bx + 10, by - 30, { font: '72px Lalezar', fill: '#FFF', stroke: '#FF2A4A', sw: 12, align: 'left', alpha: ak }); }
  g.restore();
}
export function vsSplit(g, k, left, right){
  if (k <= 0) return; const e = eo(cl(k * 1.5)); g.save();
  g.globalAlpha = .9; g.fillStyle = TEAM.sayyad.dark; g.beginPath(); g.moveTo(0, 119); g.lineTo(960 * e + 80, 119); g.lineTo(960 * e - 80, 961); g.lineTo(0, 961); g.fill();
  g.fillStyle = TEAM.rival.dark; g.beginPath(); g.moveTo(1920, 119); g.lineTo(1920 - 960 * e + 80, 119); g.lineTo(1920 - 960 * e - 80, 961); g.lineTo(1920, 961); g.fill();
  g.globalAlpha = 1; txt(g, left, 480, 540, { font: '110px Lalezar', fill: TEAM.sayyad.a, stroke: '#000', sw: 12, alpha: e });
  txt(g, right, 1440, 540, { font: '110px Lalezar', fill: TEAM.rival.a, stroke: '#000', sw: 12, alpha: e });
  const vk = cl(k * 2 - .5); if (vk > 0){ g.save(); g.translate(960, 540); g.scale(elastic(vk) * 1, elastic(vk)); txt(g, 'VS', 0, 0, { font: '260px Anton', dir: 'ltr', fill: '#FFFFFF', stroke: '#000', sw: 16, glow: '#FF3FA4', gb: 40 }); g.restore(); }
  g.restore();
}
export function captions(g, t, words, color){
  const cur = words.findIndex(w => t >= w.s - .05 && t < w.e + .25);
  const li = cur >= 0 ? words[cur].line : (words.filter(w => w.s <= t).pop() || { line: -1 }).line;
  const line = words.filter(w => w.line === li).map(w => ({ ...w, w: w.w.replace(/[\u064B-\u0652]/g, '') })); if (!line.length) return;
  if (t > line[line.length - 1].e + .45) return;
  const inA = eo(seg(t, line[0].s - .1, line[0].s + .08));
  const who = line[0].who, NAMES = { leader: 'الشبّاس', hasan: 'حسن', jeff: 'الجيف', sulaili: 'سليلي', sulaili_dark: 'سليلي', alaish: 'العليش', ali: 'علي', aboudi: 'عبودي' };
  if (who && who !== 'narr' && NAMES[who]){ g.save(); g.globalAlpha = inA; g.font = '800 34px Tajawal'; const lw = g.measureText(NAMES[who]).width + 36; g.fillStyle = color; g.beginPath(); g.roundRect(960 - lw / 2, 948, lw, 44, 22); g.fill();
    txt(g, NAMES[who], 960, 971, { font: '800 34px Tajawal', fill: '#14081A' }); g.restore(); }
  g.save(); g.font = '900 54px Tajawal'; g.direction = 'rtl'; g.textBaseline = 'middle';
  let gap = 18, wd = line.map(w => g.measureText(w.w).width), tot = wd.reduce((a, b) => a + b, 0) + gap * (line.length - 1);
  const y = 1022; let px = 960 + tot / 2; g.globalAlpha = inA;
  line.forEach((w, i) => { const act = t >= w.s - .03 && t < w.e + .08, done = t >= w.e + .08;
    g.save(); g.translate(px - wd[i] / 2, y); const s = act ? lerp(.9, 1.08, back(seg(t, w.s - .03, w.s + .14))) : 1; g.scale(s, s); g.textAlign = 'center';
    g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineJoin = 'round'; if (act || done) g.strokeText(w.w, 0, 0);
    g.fillStyle = act ? color : (done ? '#FFFFFF' : 'rgba(255,255,255,.4)'); if (act){ g.shadowColor = color; g.shadowBlur = 18; } g.fillText(w.w, 0, 0); g.restore();
    px -= wd[i] + gap; });
  g.restore();
}
export function finePrint(g, s, k){ if (k <= 0) return; txt(g, s, 960, 935, { font: '700 30px Tajawal', fill: 'rgba(255,255,255,.85)', alpha: cl(k * 2) }); }
