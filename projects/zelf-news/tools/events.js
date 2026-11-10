// node tools/events.js  → out/events.json (sound events registered by all scenes, sorted) + page errors
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'index.html')); await p.evaluate(() => window.__ready);
  const ev = await p.evaluate(() => window.__events()); const dur = await p.evaluate(() => window.__meta.dur);
  fs.mkdirSync(path.resolve(__dirname, '..', 'out'), { recursive: true });
  fs.writeFileSync(path.resolve(__dirname, '..', 'out', 'events.json'), JSON.stringify({ dur, events: ev }, null, 1));
  console.log('events', ev.length, 'dur', dur, 'errors', JSON.stringify(await p.evaluate(() => window.__errors())));
  await b.close();
})();
