const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://localhost:8766/index.html?render', { waitUntil: 'networkidle' }); await p.evaluate(() => window.ready);
  const sh = (await p.evaluate(() => __dbg())).shots; const out = [];
  for (const [i, t0, t1, loc, sw] of sh){ const ts = [t0 + (t1 - t0) * .35, t0 + (t1 - t0) * .7].map(t => sw ? Math.max(t, t0 + .8) : t); let s = 0; for (const t of ts) s += await p.evaluate(t => __lum(t), t); out.push([i, loc, +(s / ts.length).toFixed(3)]); }
  console.log(JSON.stringify(out)); await b.close(); })();
