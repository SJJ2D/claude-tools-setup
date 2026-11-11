// node build.js → site/weather/weather_island.usdz (+ preview of the exported scene)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const W = __dirname, LIB = path.join(W, 'lib');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const map = { 'three.js/r128/three.min.js': 'three128.min.js', 'gsap.min.js': 'gsap.min.js', 'lenis.min.js': 'lenis.min.js' };
  await ctx.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, r => { const u = r.request().url(); const k = Object.keys(map).find(k => u.includes(k));
    return k ? r.fulfill({ path: path.join(LIB, map[k]), contentType: 'application/javascript' }) : r.abort(); });
  await ctx.route(/netlify\/scripts/, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://127.0.0.1:8813/site/weather/index.html', { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => window.__ZN, null, { timeout: 60000 });
  await p.addScriptTag({ path: path.join(W, 'convert.js') });
  const out = await p.evaluate(() => window.__buildAR());
  console.log('meshes', out.meshes, 'json', (out.json.length / 1e6).toFixed(1), 'MB', errs.length ? 'ERR ' + errs.slice(0, 3) : '');
  const q = await ctx.newPage(); q.on('pageerror', e => console.log('export err', String(e))); q.on('console', m => { if (m.type() === 'error') console.log('export console', m.text()); });
  await q.goto('http://127.0.0.1:8813/export.html'); await q.waitForFunction(() => window.ready);
  const b64 = await q.evaluate(j => window.exportUSDZ(j), out.json);
  const f = path.join(W, 'site/weather/weather_island.usdz'); fs.writeFileSync(f, Buffer.from(b64, 'base64'));
  console.log('usdz', f, (fs.statSync(f).size / 1e6).toFixed(2), 'MB');
  await b.close();
})();
