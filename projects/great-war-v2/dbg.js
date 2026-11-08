const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | '))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
  await p.goto('http://localhost:8766/index.html?render', { waitUntil: 'networkidle', timeout: 120000 });
  try { await p.evaluate(() => window.ready); console.log(JSON.stringify(await p.evaluate(() => __dbg()))); } catch (e) { console.log('ERR', e.message.slice(0, 500)); }
  console.log(errs.slice(0, 8).join('\n') || 'no errors'); await b.close(); })();
