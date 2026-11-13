const {open,VP}=require('./pw.js');
(async()=>{const vp=Object.assign({},VP.tablet,{reducedMotion:'reduce'});const {browser,page,errs}=await open(vp);const T=f=>page.evaluate(f);
await T(()=>__test.go('s1'));await page.waitForTimeout(800);for(let i=0;i<20;i++){if((await T(()=>__test.solveStep()))===false)break;await page.waitForTimeout(80);}
await T(()=>__test.go('s2'));await page.waitForTimeout(800);for(let i=0;i<20;i++){if((await T(()=>__test.solveStep()))===false)break;await page.waitForTimeout(80);}
await T(()=>__test.go('launch'));await page.waitForTimeout(3000);
const s=await T(()=>__test.state());console.log(s.screen,s.s1.done,s.s2.done,s.stars,errs,await T(()=>__test.errors));
await page.screenshot({path:'/home/user/work/p3/game/shots/tablet-reduced-map.png'});await browser.close();})();
