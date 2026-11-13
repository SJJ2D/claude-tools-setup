const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const LIB = path.join(__dirname, 'lib'); const map = { 'three.js/r128/three.min.js': 'three128.min.js', 'gsap.min.js': 'gsap.min.js', 'lenis.min.js': 'lenis.min.js' };
  const ctx = await b.newContext({ viewport: { width: 1366, height: 800 }, deviceScaleFactor: 1 });
  await ctx.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, r => { const u = r.request().url(); const k = Object.keys(map).find(k => u.includes(k)); return k ? r.fulfill({ path: path.join(LIB, map[k]), contentType: 'application/javascript' }) : r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://127.0.0.1:8813/deploy/weather/index.html'); await p.waitForTimeout(2500);
  await p.screenshot({ path: 'shots/00_welcome.png' });
  await p.click('#goBtn'); await p.waitForTimeout(4000); await p.screenshot({ path: 'shots/01_interface.png' });
  const n = await p.evaluate(() => document.querySelectorAll('#rail button').length);
  for (let i = 0; i < n; i++) {
    await p.evaluate(i => document.querySelectorAll('#rail button')[i].click(), i); await p.waitForTimeout(1600);
    await p.screenshot({ path: `shots/1${i + 1}_obj.png` });
    await p.evaluate(() => { const x = document.querySelector('#sheetClose'); if (x && document.querySelector('#sheet.open')) x.click(); }); await p.waitForTimeout(700);
  }
  await p.click('#tourBtn'); await p.waitForTimeout(2500); await p.screenshot({ path: 'shots/21_pano.png' });
  await p.evaluate(() => { const s = document.querySelector('.spot'); s && s.click(); }); await p.waitForTimeout(1200); await p.screenshot({ path: 'shots/22_pano_q.png' });
  await p.click('#panoClose'); await p.waitForTimeout(800);
  await p.click('#actBtn'); await p.waitForTimeout(2500); await p.screenshot({ path: 'shots/23_activity.png' });
  console.log('objects', n, errs.length ? errs.join('|') : 'no errors'); await b.close(); })();
