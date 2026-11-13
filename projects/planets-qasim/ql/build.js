// node ql/build.js -> hub/planets_hub.usdz (server: python3 -m http.server 8814 in /home/user/work/p3)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const P3 = '/home/user/work/p3', LIB = '/home/user/work/arql/lib';
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, r => { const u = r.request().url();
    if (u.includes('three.js/r128')) return r.fulfill({ path: P3 + '/three128.min.js', contentType: 'application/javascript' });
    if (u.includes('gsap')) return r.fulfill({ path: LIB + '/gsap.min.js', contentType: 'application/javascript' });
    if (u.includes('lenis')) return r.fulfill({ path: LIB + '/lenis.min.js', contentType: 'application/javascript' });
    return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://127.0.0.1:8814/hub/index.html?ql', { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => window.__ZN, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.addScriptTag({ path: path.join(__dirname, 'convert.js') });
  const out = await p.evaluate(() => window.__buildAR());
  console.log('meshes', out.meshes, 'json', (out.json.length / 1e6).toFixed(1), 'MB', errs.length ? 'ERR ' + errs.slice(0, 3) : '');
  const q = await ctx.newPage(); q.on('pageerror', e => console.log('export err', String(e))); q.on('console', m => { if (m.type() === 'error') console.log('export console', m.text()); });
  await q.goto('http://127.0.0.1:8814/ql/export.html'); await q.waitForFunction(() => window.ready);
  const b64 = await q.evaluate(j => window.exportUSDZ(j), out.json);
  const f = P3 + '/hub/planets_hub.usdz'; fs.writeFileSync(f, Buffer.from(b64, 'base64'));
  console.log('usdz', f, (fs.statSync(f).size / 1e6).toFixed(2), 'MB');
  await b.close();
})();
