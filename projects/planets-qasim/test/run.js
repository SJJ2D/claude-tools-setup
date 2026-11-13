// node test/run.js [w h tag] : full functional pass + screenshots into hub/shots
const { chromium } = require('playwright'); const path = require('path');
const LIB = '/home/user/work/arql/lib', P3 = '/home/user/work/p3';
const [W, H, TAG] = [+(process.argv[2] || 390), +(process.argv[3] || 844), process.argv[4] || 'phone'];
const FULL = process.argv[5] !== 'quick';
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const mobile = W < 900;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  await ctx.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, r => { const u = r.request().url();
    if (u.includes('three.js/r128')) return r.fulfill({ path: P3 + '/three128.min.js', contentType: 'application/javascript' });
    if (u.includes('gsap')) return r.fulfill({ path: LIB + '/gsap.min.js', contentType: 'application/javascript' });
    if (u.includes('lenis')) return r.fulfill({ path: LIB + '/lenis.min.js', contentType: 'application/javascript' });
    return r.abort(); });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.continue().catch(() => r.abort()));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const shot = async n => p.screenshot({ path: `${P3}/hub/shots/${TAG}_${n}.png` });
  const click = async sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) throw new Error('missing ' + s); e.click(); }, sel);
  await p.goto('http://127.0.0.1:8814/hub/index.html', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2600);
  await shot('00_welcome');
  await click('#goBtn'); await p.waitForTimeout(4200); await shot('01_hub');
  const hs = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  console.log('hscroll', hs.sw > hs.cw ? 'YES ' + JSON.stringify(hs) : 'no');
  const rail = await p.evaluate(() => document.querySelectorAll('#rail button').length);
  const res = [];
  for (let i = 0; i < rail; i++) {
    await p.evaluate(i => document.querySelectorAll('#rail button')[i].click(), i); await p.waitForTimeout(1500);
    const t = await p.evaluate(() => ({ open: !!document.querySelector('#sheet.open'), title: document.querySelector('#sheetTitle').getAttribute('aria-label') || document.querySelector('#sheetTitle').textContent, len: document.querySelector('#sheetInner').innerText.length }));
    res.push(`${i + 1}:${t.open ? 'open' : 'CLOSED'}:${t.title}:${t.len}`);
    if (FULL || i === 0) await shot(`1${i + 1}_obj`);
    if (i === 3) { // plan viewer
      const pv = await p.evaluate(async () => { const n = document.querySelector('#pnext'); for (let k = 0; k < 5; k++) n.click(); await new Promise(r => setTimeout(r, 300));
        return { num: document.querySelector('#pnum').textContent, pdf: !!document.querySelector('#dlpdf'), doc: !!document.querySelector('#dldoc'), imgOK: document.querySelector('#pimg').naturalWidth }; });
      console.log('plan viewer', JSON.stringify(pv));
      for (const id of ['#dlpdf', '#dldoc']) { const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), click(id)]);
        console.log('download', id, dl ? dl.suggestedFilename() + ' ' + (require('fs').statSync(await dl.path()).size) : 'NONE'); }
    }
    await p.evaluate(() => { const x = document.querySelector('#sheetClose'); if (document.querySelector('#sheet.open')) x.click(); }); await p.waitForTimeout(600);
  }
  console.log(res.join('\n'));
  // tap each 3D model
  const taps = [];
  for (let i = 0; i < rail; i++) {
    await p.evaluate(i => { window.__hub.items; document.querySelectorAll('#rail button')[i].click(); document.querySelector('#sheetClose').click(); }, i); await p.waitForTimeout(1300);
    const pt = await p.evaluate(i => { const o = window.__hub.items[i], m0 = (() => { let m = null; o.inner.traverse(x => { if (!m && x.isMesh) m = x; }); return m; })(), bx = new THREE.Box3().setFromObject(m0), v = new THREE.Vector3(); bx.getCenter(v); if (i === 4) { o.inner.userData.d.getWorldPosition(v); v.y += .35 * o.grp.scale.y; } v.project(window.__hub.PC()); return { x: (v.x + 1) / 2 * innerWidth, y: (-v.y + 1) / 2 * innerHeight }; }, i);
    if (mobile) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y);
    await p.waitForTimeout(900);
    const t = await p.evaluate(() => document.querySelector('#sheet.open') ? document.querySelector('#sheetTitle').getAttribute('aria-label') || document.querySelector('#sheetTitle').textContent : 'NONE');
    taps.push(`${i + 1}:${t}`);
    await p.evaluate(() => { if (document.querySelector('#sheet.open')) document.querySelector('#sheetClose').click(); }); await p.waitForTimeout(500);
  }
  console.log('3D taps', taps.join(' | '));
  console.log('passport', await p.evaluate(() => document.querySelector('#passN').textContent));
  // 360
  await click('#tourBtn'); await p.waitForTimeout(2500); await shot('21_pano');
  await p.evaluate(() => { const s = [...document.querySelectorAll('.spot')].find(s => s.style.visibility !== 'hidden'); s.click(); }); await p.waitForTimeout(700);
  await p.evaluate(() => { [...document.querySelectorAll('.opt')].forEach(b => { }); document.querySelectorAll('.opt')[2].click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { [...document.querySelectorAll('.opt')].filter(b => !b.disabled)[0].click(); }); await p.waitForTimeout(500);
  await shot('22_pano_q');
  console.log('pano', await p.evaluate(() => document.querySelector('#pcount').textContent + ' | ' + (document.querySelector('.fb') || {}).textContent));
  // answer all to see the finish card
  await p.evaluate(async () => { const S = [...document.querySelectorAll('.spot')]; for (const s of S) { s.click(); await new Promise(r => setTimeout(r, 120));
      for (const o of [...document.querySelectorAll('.opt')]) { if (document.querySelector('.fb.good')) break; if (!o.disabled) o.click(); await new Promise(r => setTimeout(r, 60)); }
      const n = document.querySelector('#qnext'); if (n && n.textContent !== 'اعرض النتيجة') n.click(); } const n = document.querySelector('#qnext'); if (n) n.click(); });
  await p.waitForTimeout(1500); await shot('23_pano_done');
  console.log('pano done', await p.evaluate(() => document.querySelector('#pcount').textContent + ' finish=' + !!document.querySelector('.finish')));
  await p.evaluate(() => document.querySelector('#back').click()); await p.waitForTimeout(600);
  // activity
  await click('#actBtn'); await p.waitForTimeout(1600);
  await p.evaluate(() => { const t = document.querySelector('#predIn'); t.value = 'أتوقع أن المشتري الأقرب'; t.dispatchEvent(new Event('input')); document.querySelector('#missionBtn').click(); });
  await p.waitForTimeout(1800); await shot('31_act1');
  await click('#actNext'); await p.waitForTimeout(1200);
  const sky = await p.evaluate(async () => { const order = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    document.querySelector('[data-p="mars"]').click(); await new Promise(r => setTimeout(r, 200)); const wrong = document.querySelector('#skyMsg').textContent;
    for (const id of order.slice(0, 5)) { document.querySelector('#actOv [data-p="' + id + '"]').click(); await new Promise(r => setTimeout(r, 120)); }
    return wrong + ' || ' + document.querySelector('#skyMsg').textContent + ' || log=' + document.querySelectorAll('#logbook li:not(.empty)').length; });
  console.log('sky', sky); await p.waitForTimeout(600); await shot('32_act2');
  await p.evaluate(async () => { for (const id of ['saturn', 'uranus', 'neptune']) { document.querySelector('#actOv [data-p="' + id + '"]').click(); await new Promise(r => setTimeout(r, 100)); } });
  console.log('sky done', await p.evaluate(() => document.querySelector('#skyMsg').textContent));
  await click('#actNext'); await p.waitForTimeout(1000);
  const tr = await p.evaluate(async () => { const order = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']; let log = [];
    for (let r = 0; r < 4; r++) { const ids = [...document.querySelectorAll('#trainChips button:not([disabled])')].map(b => b.dataset.p).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      if (r === 0 && ids.length > 1) { document.querySelector('#trainChips [data-p="' + ids[ids.length - 1] + '"]').click(); log.push(document.querySelector('#trainMsg').textContent); }
      for (const id of ids) { document.querySelector('#trainChips [data-p="' + id + '"]').click(); await new Promise(r => setTimeout(r, 80)); }
      if (r < 3 && !/اكتمل/.test(document.querySelector('#trainMsg').textContent)) document.querySelector('#trainNew').click(); }
    log.push(document.querySelector('#trainMsg').textContent, document.querySelector('#trainStars').textContent); return log.join(' || '); });
  console.log('train', tr); await p.waitForTimeout(1200); await shot('33_act3');
  await click('#actNext'); await p.waitForTimeout(900);
  await p.evaluate(() => { document.querySelector('#dCards [data-p="moon"]').click(); document.querySelector('#dCards [data-p="probe"]').click(); document.querySelector('#dCheck').click(); });
  await p.waitForTimeout(2600);
  console.log('design', await p.evaluate(() => document.querySelector('#dRes').textContent + ' | pred=' + document.querySelector('#predOut').textContent));
  await click('#actNext'); await p.waitForTimeout(800); await shot('34_act4');
  console.log('end', await p.evaluate(() => document.querySelector('#endMsg').textContent.slice(0, 40)));
  await click('#actClose'); await p.waitForTimeout(500);
  console.log('roles', await p.evaluate(() => { window.__hub.openAct(1); document.querySelector('#roleTe').click(); return document.querySelector('#actRole').innerText.slice(0, 60); }));
  console.log('game link', await p.evaluate(() => [...document.querySelectorAll('a[data-game]')].map(a => a.getAttribute('href')).slice(0, 1).join()));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close();
})();
