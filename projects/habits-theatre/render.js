const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1123,height:794}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>m.type()==='error'&&console.log(m.text()));
await p.goto('file://'+__dirname+'/print.html');await p.waitForFunction('window.done');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
await p.pdf({path:__dirname+'/masrah_alfareej_print.pdf',width:'297mm',height:'210mm',printBackground:true,margin:{top:0,bottom:0,left:0,right:0}});await b.close();})();
