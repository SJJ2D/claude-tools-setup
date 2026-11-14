const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2200,height:1300}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/mag.html');await p.waitForFunction('window.done');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
for(const id of ['cover','spread','back'])await (await p.$('#'+id+' svg')).screenshot({path:__dirname+'/'+id+'.png'});await b.close();})();
