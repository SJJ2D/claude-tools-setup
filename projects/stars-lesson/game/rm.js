const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true});
const reqs=[];c.on('request',r=>reqs.push(r.url().slice(0,80)));
await c.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync('/home/user/work/stars/three128.min.js'),contentType:'application/javascript'});return r.continue();});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/work/stars/game/index.html');await p.waitForTimeout(1000);await p.click('#bStart');
for(let i=0;i<120;i++){const s=await p.evaluate(()=>__test.state());if(s.stage===6)break;await p.evaluate(()=>__test.solve());await p.waitForTimeout(350);}
console.log(await p.evaluate(()=>__test.state()));await p.screenshot({path:'/home/user/work/stars/game/shots/m-rm-end.png'});
console.log('errors',errs);console.log([...new Set(reqs.filter(u=>!u.startsWith('file')))]);
console.log('fonts',await p.evaluate(()=>[document.fonts.check('16px "Readex Pro"'),document.fonts.check('16px "Baloo Bhaijaan 2"')]));await b.close();})();
