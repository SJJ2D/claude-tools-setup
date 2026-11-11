const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const LIB = path.join(__dirname, 'lib');
  const map = { 'three.js/r128/three.min.js': 'three128.min.js', 'gsap.min.js': 'gsap.min.js', 'lenis.min.js': 'lenis.min.js' };
  await ctx.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, r => { const u = r.request().url(); const k = Object.keys(map).find(k => u.includes(k)); return k ? r.fulfill({ path: path.join(LIB, map[k]), contentType: 'application/javascript' }) : r.abort(); });
  // pretend to be iOS Safari with Quick Look support
  await ctx.addInitScript(() => { const orig = DOMTokenList.prototype.supports; DOMTokenList.prototype.supports = function (t) { return t === 'ar' ? true : (orig ? orig.call(this, t) : false); };
    window.__clicked = []; const oc = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { if (this.rel === 'ar') { window.__clicked.push(this.getAttribute('href')); return; } return oc.call(this); }; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://127.0.0.1:8813/deploy/weather/index.html'); await p.waitForTimeout(2500);
  const lbl = await p.evaluate(() => document.querySelector('#camBtn span:last-child').textContent);
  await p.evaluate(() => { const g = document.querySelector('#goBtn'); if (g) g.click(); }); await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelector('#camBtn').click()); await p.waitForTimeout(500);
  console.log('label:', lbl, '| quicklook href:', JSON.stringify(await p.evaluate(() => window.__clicked)), '| errors:', errs.length ? errs.join(' | ') : 'none');
  await p.screenshot({ path: __dirname + '/chk/smoke.png' });
  const r = await p.request.get('http://127.0.0.1:8813/deploy/weather/weather_island.usdz'); console.log('usdz', r.status(), (await r.body()).length);
  await b.close(); })();
