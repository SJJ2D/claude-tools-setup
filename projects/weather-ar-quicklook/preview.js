const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); p.on('pageerror', e => console.log('ERR', String(e))); p.on('console', m => { if (m.type() === 'error') console.log('C', m.text()); });
  await p.goto('http://127.0.0.1:8813/preview.html'); await p.waitForFunction(() => window.ready);
  console.log('size m', JSON.stringify(await p.evaluate(() => window.go())), 'minY', await p.evaluate(() => window.minY));
  await p.screenshot({ path: __dirname + '/chk/prev_a.png' });
  await p.evaluate(() => window.view([0.0, 0.35, 0.95])); await p.screenshot({ path: __dirname + '/chk/prev_b.png' });
  await b.close(); })();
