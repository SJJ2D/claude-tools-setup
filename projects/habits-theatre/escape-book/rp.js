const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/print.html');await p.waitForFunction('window.done');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.pdf({path:__dirname+'/kitab_alfareej_print.pdf',width:'210mm',height:'297mm',printBackground:true,margin:{top:0,bottom:0,left:0,right:0}});await b.close();})();
