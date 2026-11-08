const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://localhost:8765/index.html?render', { waitUntil: 'networkidle' }); await p.evaluate(() => window.ready);
  console.log(JSON.stringify(await p.evaluate(() => __dbg(50)))); await b.close(); })();
