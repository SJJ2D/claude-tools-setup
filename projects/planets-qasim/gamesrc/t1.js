const {open,VP}=require('./pw.js');const S='/home/user/work/p3/game/shots/';
(async()=>{for(const k of ['phone','tablet','desk']){const {browser,page,errs}=await open(VP[k]);
  const info=await page.evaluate(()=>({gen:window.__genMs,err:__test.errors,sw:document.documentElement.scrollWidth,iw:innerWidth}));
  await page.screenshot({path:S+k+'-title.png'});
  console.log(k,JSON.stringify(info),errs);await browser.close();}})();
