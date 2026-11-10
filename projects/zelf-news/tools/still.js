// node tools/still.js --t 3.2,5.5 [--name s3] [--only S3,newsui] [--v] [--dir out/stills]
// Seeks the composition to each time and saves a full-resolution PNG per time. Prints the paths and any page errors.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const a = process.argv.slice(2); const opt = (k, d) => a.includes(k) ? a[a.indexOf(k) + 1] : d;
  const times = String(opt('--t', '0')).split(',').map(Number); const name = opt('--name', 'still'); const dir = opt('--dir', 'out/stills');
  const vert = a.includes('--v'); const only = opt('--only', '');
  fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: vert ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + String(e))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FILE_NOT_FOUND/.test(m.text())) errs.push('console: ' + m.text()); });
  const qs = [vert ? 'v' : '', only ? 'only=' + only : ''].filter(Boolean).join('&');
  await p.goto('file://' + path.resolve(__dirname, '..', 'index.html') + (qs ? '?' + qs : ''));
  await p.evaluate(() => window.__ready);
  const out = [];
  for (const t of times) { await p.evaluate(t => window.__seek(t), t); const f = path.join(dir, `${name}_${t.toFixed(2)}.png`); await p.screenshot({ path: f }); out.push(f); }
  const se = await p.evaluate(() => window.__errors());
  console.log(out.join('\n')); console.log('dur', await p.evaluate(() => window.__meta.dur));
  console.log(errs.length || se.length ? 'ERRORS:\n' + errs.concat(se).slice(0, 12).join('\n') : 'no page errors');
  await b.close();
})();
