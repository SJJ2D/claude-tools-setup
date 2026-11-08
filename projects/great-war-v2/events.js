const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://localhost:8766/index.html?render', { waitUntil: 'networkidle' }); await p.evaluate(() => window.ready);
  fs.writeFileSync(process.argv[2], JSON.stringify(await p.evaluate(() => __events()), null, 1)); await b.close(); console.log('events written'); })();
