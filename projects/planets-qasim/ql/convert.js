// runs inside the hub page (?ql): builds a Quick-Look-friendly copy of the AR solar system and returns ObjectLoader JSON
window.__buildAR = async function () {
  const Z = window.__ZN, T = THREE;
  await document.fonts.load("800 64px Changa", 'الكواكب');
  Z.arBase.visible = true; Z.arRim.visible = true; Z.sparkles.visible = false; Z.sunGlows.forEach(s => s.visible = false);
  Z.ring.rotation.set(0, 0, 0);
  Z.items.forEach(x => { x.grp.scale.set(1, 1, 1); x.grp.visible = true; x.model.scale.set(1, 1, 1); x.model.position.y = .36; x.ped.position.y = -.06; x.model.visible = true; });
  Z.flyer.position.set(-4.4, 1.5, -2.6); Z.flyer.rotation.set(0, .8, -.5);
  Z.mini.forEach((m, i) => { const a = i * 1.57 + .4; m.position.set(Math.cos(a) * 1.95, .05, Math.sin(a) * 1.95); });
  Z.stage.position.set(0, 0, 0); Z.stage.rotation.set(0, 0, 0); Z.stage.scale.set(1, 1, 1);
  const c = Z.stage.clone(true);
  const drop = [];
  c.traverse(o => {
    if (!o.visible || o.isPoints || o.isSprite || o.isLine || o.isLight) { drop.push(o); return; }
    if (!o.isMesh) return;
    const mats = [].concat(o.material).map(m => {
      if (!m || (m.opacity !== undefined && m.opacity < 0.06)) return null;
      const p = { color: m.color ? m.color.clone() : new T.Color(1, 1, 1), roughness: 0.7, metalness: 0, side: m.side };
      if (m.map) p.map = m.map;
      if (m.transparent && m.opacity < 1) { p.transparent = true; p.opacity = m.opacity; }
      if (m.emissive && m.emissive.getHex() > 0) { p.emissive = m.emissive.clone(); p.emissiveIntensity = Math.max(.15, m.emissiveIntensity || 1); }
      if (m.type === 'MeshBasicMaterial') { p.emissive = p.color.clone().multiplyScalar(.6); if (p.map) p.emissiveMap = p.map; }
      return new T.MeshStandardMaterial(p);
    });
    if (mats.some(m => !m)) { drop.push(o); return; }
    o.material = Array.isArray(o.material) ? mats : mats[0];
  });
  drop.forEach(o => o.parent && o.parent.remove(o));
  Z.ITEMS.forEach((it, i) => {
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 160; const g = cv.getContext('2d');
    const col = '#' + ('00000' + it.accent.toString(16)).slice(-6);
    g.fillStyle = col; roundRect(g, 4, 4, 632, 152, 76); g.fill();
    g.fillStyle = '#141A4E'; roundRect(g, 16, 16, 608, 128, 64); g.fill();
    g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#FFFFFF';
    let fs = 76; g.font = `800 ${fs}px Changa`; while (g.measureText(it.name).width > 540) { fs -= 4; g.font = `800 ${fs}px Changa`; }
    g.fillText(it.name, 320, 84);
    const tex = new T.CanvasTexture(cv);
    const m = new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new T.Color(.7, .7, .7), roughness: .9, transparent: true });
    const pl = new T.Mesh(new T.PlaneGeometry(1.5, .375), m);
    const th = -i * Z.STEP, r = Z.R + 1.0;
    pl.position.set(r * Math.sin(th), .02, r * Math.cos(th)); pl.rotation.set(-0.35, th, 0, 'YXZ');
    c.add(pl);
  });
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  const root = new T.Group(); root.name = 'PlanetsHub';
  const S = 0.045; c.scale.setScalar(S); c.position.y = 0.32 * S; root.add(c);
  root.updateMatrixWorld(true);
  let n = 0; root.traverse(o => { if (o.isMesh) n++; });
  return { json: JSON.stringify(root.toJSON()), meshes: n };
};
