// node shots.js out_prefix t1 t2 ...   (frames are composited inside the page, no compositor timing issues)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [pre, ...ts] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e)); p.on('console', m => { if (['error'].includes(m.type())) errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  await p.goto('http://localhost:8766/index.html?render', { waitUntil: 'networkidle', timeout: 120000 });
  await p.evaluate(() => window.ready);
  for (const t of ts.map(Number)) { const s = Date.now(); const d = await p.evaluate(t => frame(t, .85), t); fs.writeFileSync(`${pre}_${t}.jpg`, Buffer.from(d.split(',')[1], 'base64')); console.log('t=' + t, ((Date.now() - s) / 1000).toFixed(2) + 's'); }
  console.log(errs.slice(0, 15).join('\n') || 'no errors'); await b.close();
})();
