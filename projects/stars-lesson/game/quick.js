const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,o] of [['m',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}],['d',{viewport:{width:1366,height:800}}]]){
const c=await b.newContext(o);await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('file:'))return r.continue();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync('/home/user/work/stars/three128.min.js'),contentType:'application/javascript'});return r.abort();});
const p=await c.newPage();await p.goto('file:///home/user/work/stars/game/index.html');await p.waitForTimeout(1800);await p.screenshot({path:`/home/user/work/stars/game/shots/${n}-01-title.png`});
const args=process.argv.slice(2);for(const a of args){await p.evaluate(a);await p.waitForTimeout(1500);await p.screenshot({path:`/home/user/work/stars/game/shots/${n}-q-${args.indexOf(a)}.png`});}
await c.close();}await b.close();})();
