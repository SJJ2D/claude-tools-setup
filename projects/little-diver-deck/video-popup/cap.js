const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(1500);
const N=+process.argv[4];for(let i=0;i<N;i++){await p.evaluate(t=>window.render(t),i/30);await p.screenshot({path:`${process.argv[3]}/${String(i).padStart(3,'0')}.png`});}
await b.close()})();
