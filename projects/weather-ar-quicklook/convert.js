// runs inside the r128 weather page: builds a Quick-Look-friendly copy of the AR island and returns ObjectLoader JSON
window.__buildAR = async function () {
  const Z = window.__ZN, T = THREE;
  await document.fonts.load("800 64px 'Baloo Bhaijaan 2'", 'الطقس');
  Z.sea.visible = false; Z.arSea.visible = true; Z.arRim.visible = true; Z.sparkles.visible = false;
  Z.dhow.position.set(6.6, -.24, -5.6); Z.ring.rotation.set(0, 0, 0); if (Z.cyc) Z.cyc.visible = false;
  Z.items.forEach(x => { x.grp.scale.set(1, 1, 1); x.grp.visible = true; x.model.scale.set(1, 1, 1); x.model.visible = true; });
  Z.stage.position.set(0, 0, 0); Z.stage.rotation.set(0, 0, 0); Z.stage.scale.set(1, 1, 1);
  const c = Z.stage.clone(true);
  const drop = [];
  c.traverse(o => {
    if (!o.visible || o.isPoints || o.isSprite || o.isLine) { drop.push(o); return; }
    if (!o.isMesh) return;
    const mats = [].concat(o.material).map(m => {
      if (!m || (m.opacity !== undefined && m.opacity < 0.06)) return null;
      const p = { color: m.color ? m.color.clone() : new T.Color(1, 1, 1), roughness: 0.7, metalness: 0, side: m.side };
      if (m.map) p.map = m.map;
      if (m.transparent && m.opacity < 1) { p.transparent = true; p.opacity = m.opacity; }
      if (m.emissive && m.emissive.getHex() > 0) { p.emissive = m.emissive.clone(); p.emissiveIntensity = Math.max(.15, m.emissiveIntensity || 1); }
      if (m.type === 'MeshBasicMaterial') { p.emissive = p.color.clone().multiplyScalar(.45); if (p.map) p.emissiveMap = p.map; }
      return new T.MeshStandardMaterial(p);
    });
    if (mats.some(m => !m)) { drop.push(o); return; }
    o.material = Array.isArray(o.material) ? mats : mats[0];
  });
  drop.forEach(o => o.parent && o.parent.remove(o));
  // Arabic name plates under each station (facing outward like the site's labels)
  Z.ITEMS.forEach((it, i) => {
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 160; const g = cv.getContext('2d');
    g.fillStyle = '#2A2550'; roundRect(g, 4, 4, 632, 152, 76); g.fill();
    g.fillStyle = '#FFFFFF'; roundRect(g, 14, 14, 612, 132, 66); g.fill();
    g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2A2550';
    let fs = 78; g.font = `800 ${fs}px 'Baloo Bhaijaan 2'`; while (g.measureText(it.name).width > 560) { fs -= 4; g.font = `800 ${fs}px 'Baloo Bhaijaan 2'`; }
    g.fillText(it.name, 320, 86);
    const tex = new T.CanvasTexture(cv);
    const m = new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new T.Color(.55, .55, .55), roughness: .9, transparent: true });
    const pl = new T.Mesh(new T.PlaneGeometry(1.5, .375), m);
    const th = -i * Z.STEP, r = Z.R + .95;
    pl.position.set(r * Math.sin(th), .05, r * Math.cos(th)); pl.rotation.set(-0.35, th, 0, 'YXZ');
    c.add(pl);
  });
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  const root = new T.Group(); root.name = 'WeatherIsland';
  const S = 0.045; c.scale.setScalar(S); c.position.y = 0.28 * S; root.add(c);
  root.updateMatrixWorld(true);
  let n = 0; root.traverse(o => { if (o.isMesh) n++; });
  return { json: JSON.stringify(root.toJSON()), meshes: n };
};
