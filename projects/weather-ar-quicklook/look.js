const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const LIB = path.join(__dirname, 'lib'); const map = { 'three.js/r128/three.min.js': 'three128.min.js', 'gsap.min.js': 'gsap.min.js', 'lenis.min.js': 'lenis.min.js' };
  for (const [name, url, vp] of [['new', 'http://127.0.0.1:8813/deploy/weather/index.html', { width: 390, height: 844 }], ['old', 'http://127.0.0.1:8813/site/weather/index.html', { width: 390, height: 844 }], ['newd', 'http://127.0.0.1:8813/deploy/weather/index.html', { width: 1280, height: 760 }]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: vp.width < 500, hasTouch: vp.width < 500 });
    await ctx.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, r => { const u = r.request().url(); const k = Object.keys(map).find(k => u.includes(k)); return k ? r.fulfill({ path: path.join(LIB, map[k]), contentType: 'application/javascript' }) : r.abort(); });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto(url); await p.waitForTimeout(2500); await p.screenshot({ path: `chk/look_${name}_0.png` });
    await p.evaluate(() => { const g = document.querySelector('#goBtn'); g && g.click(); }); await p.waitForTimeout(3500);
    await p.screenshot({ path: `chk/look_${name}_1.png` });
    await p.evaluate(() => { const r = document.querySelectorAll('#rail button'); r[6] && r[6].click(); }); await p.waitForTimeout(1500);
    await p.screenshot({ path: `chk/look_${name}_2.png` }); console.log(name, errs.length ? errs.join('|') : 'no errors'); await ctx.close(); }
  await b.close(); })();
