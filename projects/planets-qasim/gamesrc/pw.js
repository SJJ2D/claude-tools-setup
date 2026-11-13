const {chromium}=require('playwright');
const fs=require('fs');
const P='/home/user/work/p3/';
exports.open=async function(vp){
  const browser=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const ctx=await browser.newContext(vp);
  const page=await ctx.newPage();
  const errs=[];
  page.on('pageerror',e=>errs.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await page.route('**/*',r=>{const u=r.request().url();
    if(u.includes('three.js/r128/three.min.js'))return r.fulfill({path:P+'three128.min.js',contentType:'application/javascript'});
    if(u.startsWith('file:')||u.includes('fonts.googleapis.com')||u.includes('fonts.gstatic.com'))return r.continue();
    return r.abort();});
  await page.goto('file://'+P+'game/index.html');
  await page.waitForFunction(()=>window.__test,null,{timeout:20000});
  await page.waitForTimeout(1500);
  return {browser,page,errs};
};
exports.VP={
  phone:{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2},
  tablet:{viewport:{width:820,height:1180},isMobile:true,hasTouch:true,deviceScaleFactor:1},
  desk:{viewport:{width:1366,height:800},deviceScaleFactor:1}};
