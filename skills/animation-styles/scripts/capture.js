// node capture.js page.html out.mp4 [fps=30] [total=6] [width=1080] [height=1920]
// يلتقط صفحة تعرّف window.seek(t) إطاراً إطاراً (Playwright) ويرسلها إلى ffmpeg. صفحة بلا ?render تعمل بالـrAF، فنضيف ?render.
const { chromium } = require('playwright'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const [html, outp, fpsS, totS, wS, hS] = process.argv.slice(2);
  const fps = +(fpsS || 30), total = +(totS || 6), W = +(wS || 1080), H = +(hS || 1920);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.resolve(html) + '?render', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const n = Math.round(total * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), outp], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.seek(t), i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('done', n, 'frames', errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
  await b.close();
})();
