const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1100}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/chest.html');await p.waitForFunction('window.done');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await (await p.$('#mock svg')).screenshot({path:__dirname+'/mock.png'});
await p.evaluate(()=>document.getElementById('mock').remove());
await p.pdf({path:__dirname+'/sandooq_yaddo_print.pdf',width:'297mm',height:'210mm',printBackground:true,margin:{top:0,bottom:0,left:0,right:0}});await b.close();})();
