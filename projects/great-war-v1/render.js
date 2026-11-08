// node render.js out.mp4 [fps=30] [from=0] [to=60]  — frame-exact capture piped to ffmpeg; writes events.json too
const { chromium } = require('playwright'); const fs = require('fs'); const { spawn } = require('child_process');
(async () => {
  const [out, fpsS, fromS, toS] = process.argv.slice(2); const fps = +(fpsS || 30), from = +(fromS || 0), to = +(toS || 60);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:8765/index.html?render', { waitUntil: 'networkidle', timeout: 120000 }); await p.evaluate(() => window.ready);
  fs.writeFileSync(out.replace(/\.mp4$/, '.events.json'), JSON.stringify(await p.evaluate(() => __events()), null, 1));
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(from * fps), n1 = Math.round(to * fps), st = Date.now();
  for (let i = n0; i < n1; i++){
    const d = await p.evaluate(t => frame(t, .94), i / fps); const buf = Buffer.from(d.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - n0) % 60 === 0) { const el = (Date.now() - st) / 1000, done = i - n0 + 1; console.log(`frame ${i}/${n1}  ${el.toFixed(0)}s elapsed, eta ${((n1 - n0 - done) * el / done / 60).toFixed(1)} min`); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('DONE', n1 - n0, 'frames', errs.length ? 'ERRORS ' + errs.slice(0, 5).join(' | ') : 'no page errors'); await b.close();
})();
