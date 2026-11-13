const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const URL = 'file:///home/user/work/stars/game/index.html';
const SHOTS = '/home/user/work/stars/game/shots';
const THREE = fs.readFileSync('/home/user/work/stars/three128.min.js');
const only = process.argv[2];

async function run(name, ctxOpts) {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext(ctxOpts);
  const external = new Set();
  await context.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('file:') || u.startsWith('data:')) return route.continue();
    if (u.includes('cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')) return route.fulfill({ status: 200, contentType: 'application/javascript', body: THREE });
    external.add(u.split('?')[0]);
    if (u.includes('fonts.googleapis.com') || u.includes('fonts.gstatic.com')) return route.continue().catch(() => route.abort());
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('dialog', d => { errors.push('DIALOG ' + d.type()); d.dismiss(); });
  await page.goto(URL);
  await page.waitForTimeout(1500);
  const shot = async (n) => { await page.screenshot({ path: path.join(SHOTS, `${name}-${n}.png`) }); console.log(name, n, JSON.stringify(await page.evaluate(() => __test.state()))); };
  const st = () => page.evaluate(() => __test.state());
  const solve = () => page.evaluate(() => __test.solve());
  const waitSub = async (subs, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await st(); if (subs.includes(s.sub) && !s.modal) return s; await page.waitForTimeout(120); } throw new Error('timeout waiting ' + subs + ' got ' + JSON.stringify(await st())); };
  const waitModal = async (ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await st()).modal) return; await page.waitForTimeout(100); } throw new Error('no modal'); };
  const tap = async (x, y) => { if (ctxOpts.hasTouch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
  const drag = async (x0, y0, x1, y1, steps = 14) => { await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); await page.waitForTimeout(16); } await page.waitForTimeout(150); };
  const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  if (!noHScroll) errors.push('HORIZONTAL SCROLL');

  await shot('01-title');
  await page.click('#bStart');
  await page.waitForTimeout(1600); await shot('02-travel');
  await waitSub(['catch']);
  await page.waitForTimeout(2600); await shot('03-s1-sparks');
  // real tap on a spark
  let caught = false;
  for (let k = 0; k < 40 && !caught; k++) {
    const sp = await page.evaluate(() => __test.sparks());
    const vis = sp.find(p => p.x > 20 && p.x < ctxW() && p.y > 120);
    function ctxW() { return 2000; }
    if (vis) { await tap(vis.x, vis.y); await page.waitForTimeout(300); caught = (await st()).caught > 0; }
    else await page.waitForTimeout(250);
  }
  console.log('real spark tap caught:', caught);
  await waitModal(); await page.waitForTimeout(700); await shot('04-s1-fact');
  let hinted = false; for (let i = 0; i < 30; i++) { const s = await st(); if (s.sub === 'done') break; if (s.modal || s.sub === 'catch') await solve(); await page.waitForTimeout(500); if (i >= 3 && !hinted && !(await st()).modal) { hinted = true; await page.click('#bHint'); await page.waitForTimeout(300); await shot('05-s1-hint'); } }
  await page.waitForTimeout(900); await shot('06-s1-ignite');
  await solve();
  await waitSub(['scan']); await page.waitForTimeout(800); await shot('07-s2-sensor');
  // real drag of reticle onto the blue star
  const r = await page.evaluate(() => __test.reticle()); const b = await page.evaluate(() => __test.screen('blue'));
  await drag(r.x, r.y, b.x, b.y, 16);
  await page.waitForTimeout(400); await shot('08-s2-scanning');
  await page.waitForTimeout(800); await page.mouse.up();
  await waitSub(['q']); await page.waitForTimeout(600);
  await page.evaluate(() => __test.wrong()); await page.waitForTimeout(500); await shot('09-s2-question-wrong');
  await solve(); await waitModal(); await page.waitForTimeout(700); await shot('10-s2-card');
  await solve(); await waitSub(['done']); await page.waitForTimeout(600); await shot('11-s2-done');
  await solve();
  await waitSub(['off']); await page.waitForTimeout(1500); await shot('12-s3-dust');
  await solve(); await page.waitForTimeout(1400);
  const s3 = await page.evaluate(() => __test.screen('blue'));
  const r3 = await page.evaluate(() => __test.reticle());
  await drag(r3.x, r3.y, s3.x, s3.y, 12); await page.mouse.up(); await page.waitForTimeout(400);
  await shot('13-s3-thermal');
  await solve(); await page.waitForTimeout(700); await shot('14-s3-ref');
  await solve(); await waitModal(15000); await page.waitForTimeout(800); await shot('15-s3-redgiant');
  await solve(); await waitSub(['q']); await page.waitForTimeout(500); await shot('16-s3-question');
  await solve(); await waitModal(); await page.waitForTimeout(700); await shot('17-s3-rule');
  await solve(); await waitSub(['done']); await solve();
  await waitSub(['tiles']); await page.waitForTimeout(800); await shot('18-s4-tiles');
  // real interaction: tap two tiles and drag one
  const tiles = await page.$$eval('.pool .tile', els => els.map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent, x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
  const t1 = tiles.find(t => t.t === 'النجم'); await tap(t1.x, t1.y); await page.waitForTimeout(450);
  const tiles2 = await page.$$eval('.pool .tile', els => els.map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent, x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
  const slot2 = await page.$$eval('.slot', els => { const r = els[1].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const t2 = tiles2.find(t => t.t === 'الأزرق'); await drag(t2.x, t2.y, slot2.x, slot2.y, 12); await page.mouse.up(); await page.waitForTimeout(500);
  await shot('19-s4-partial');
  const placed = await page.$$eval('.slot', els => els.map(e => e.textContent));
  console.log('slots after tap+drag:', placed);
  await solve(); await page.waitForTimeout(500); await shot('20-s4-correct');
  for (let i = 0; i < 20; i++) { const s = await st(); if (s.sub === 'done') break; await solve(); await page.waitForTimeout(900); }
  await solve();
  await waitSub(['lens']); await page.waitForTimeout(900); await shot('21-s5-lens');
  // real drag of lens onto first clue
  const L = await page.evaluate(() => __test.lens()); const c0 = await page.$$eval('.clue', els => { const r = els[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await drag(L.x, L.y, c0.x, c0.y, 12); await page.waitForTimeout(900); await page.mouse.up(); await shot('22-s5-reveal1');
  await solve(); await waitSub(['choose']); await page.waitForTimeout(500); await shot('23-s5-choose');
  await solve(); await page.waitForTimeout(1500); await shot('24-s5-solved');
  await waitSub(['lens']); await solve(); await waitSub(['choose']); await solve();
  await waitSub(['lens']); await solve(); await waitSub(['choose']); await page.evaluate(() => __test.wrong()); await page.waitForTimeout(500); await shot('25-s5-twist-wrong');
  await solve(); await page.waitForTimeout(1600); await shot('26-s5-twist-solved');
  await waitSub(['done']); await solve(); await page.waitForTimeout(1500); await shot('27-certificate');
  await page.click('.mcard .btn'); await page.waitForTimeout(500);
  // about panel
  await page.click('#bAbout'); await page.waitForTimeout(600); await shot('28-about');
  // direct jumps
  for (const n of [1, 2, 3, 4, 5]) { await page.evaluate(n => __test.stage(n), n); await page.waitForTimeout(900); }
  const hs = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth);
  if (!hs) errors.push('HORIZONTAL SCROLL late');
  console.log(name, 'external requests:', [...external]);
  console.log(name, 'ERRORS:', errors.length ? errors : 'none');
  await browser.close();
}
(async () => {
  if (!only || only === 'm') await run('m', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  if (!only || only === 'd') await run('d', { viewport: { width: 1366, height: 800 }, deviceScaleFactor: 1 });
})().catch(e => { console.error('FAIL', e); process.exit(1); });
