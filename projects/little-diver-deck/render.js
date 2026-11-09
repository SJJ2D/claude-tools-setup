// node render.js slides.html outdir [--pdf out.pdf] [--only id1,id2] [--scale 1]
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  const html = path.resolve(args[0]); const out = path.resolve(args[1]);
  const pdfIdx = args.indexOf('--pdf'); const pdf = pdfIdx > -1 ? path.resolve(args[pdfIdx + 1]) : null;
  const onlyIdx = args.indexOf('--only'); const only = onlyIdx > -1 ? args[onlyIdx + 1].split(',') : null;
  const scIdx = args.indexOf('--scale'); const scale = scIdx > -1 ? parseFloat(args[scIdx + 1]) : 1;
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
  await page.goto('file://' + html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const ids = await page.$$eval('section.slide', els => els.map(e => e.id));
  let i = 0;
  for (const id of ids) {
    i++;
    if (only && !only.includes(id)) continue;
    const el = await page.$('#' + id);
    await el.screenshot({ path: path.join(out, String(i).padStart(2, '0') + '_' + id + '.png') });
  }
  if (pdf) {
    await page.pdf({ path: pdf, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  }
  // overflow report: any element whose box leaves its slide or text overflowing its container
  const issues = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('section.slide').forEach(s => {
      const sr = s.getBoundingClientRect();
      s.querySelectorAll('.card, .body, table, .titlebox, .namebar, .head').forEach(e => {
        if (e.scrollHeight > e.clientHeight + 2 && getComputedStyle(e).overflow !== 'visible') res.push(s.id + ': overflow in ' + e.className);
        const r = e.getBoundingClientRect();
        if (r.bottom > sr.bottom - 4 || r.top < sr.top || r.left < sr.left || r.right > sr.right) res.push(s.id + ': outside slide ' + (e.className || e.tagName) + ' bottom=' + Math.round(r.bottom - sr.top));
      });
      const body = s.querySelector('.body');
      if (body) {
        const br = body.getBoundingClientRect();
        body.querySelectorAll('*').forEach(c => { const r = c.getBoundingClientRect(); if (r.height > 0 && r.bottom > br.bottom + 2) res.push(s.id + ': content below body bottom by ' + Math.round(r.bottom - br.bottom) + 'px (' + c.tagName + '.' + c.className + ')'); });
      }
    });
    return [...new Set(res)];
  });
  console.log(issues.length ? issues.join('\n') : 'no layout issues');
  await browser.close();
})();
