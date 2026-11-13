const {open,VP}=require('./pw.js');const SH='/home/user/work/p3/game/shots/';
const vpName=process.argv[2]||'tablet';
(async()=>{const {browser,page,errs}=await open(VP[vpName]);const pre=SH+vpName+'-';
const T=(f,...a)=>page.evaluate(f,...a);const st=()=>T(()=>__test.state());
const tap=async(sel)=>{await T(s=>{const e=document.querySelector(s);e.scrollIntoView({block:'center'});},sel);await page.waitForTimeout(120);const r=await T(s=>__test.rect(s),sel);await TP(r.x,r.y);};
const drag=async(a,b)=>{await page.mouse.move(a.x,a.y);await page.mouse.down();for(let i=1;i<=12;i++){await page.mouse.move(a.x+(b.x-a.x)*i/12,a.y+(b.y-a.y)*i/12);await page.waitForTimeout(16);}await page.mouse.up();};
const TP=async(x,y)=>{if(vpName==='desk')await page.mouse.click(x,y);else await page.touchscreen.tap(x,y);};
const shot=async n=>{await page.screenshot({path:pre+n+'.png'});};
await tap('#startBtn');await page.waitForTimeout(1600);await shot('story');
await tap('#storyGo');await page.waitForTimeout(900);
await tap('.suit[data-i="2"]');await page.fill('#nameIn','سجاد');await shot('suit');
await tap('#readyBtn');await page.waitForTimeout(4200);await shot('launch');
await page.waitForFunction(()=>__test.state().screen==='map',null,{timeout:15000});await page.waitForTimeout(1200);await shot('map');
await tap('#st1');await page.waitForTimeout(1600);await shot('s1-start');
let s=await st();console.log('s1 cur',s.s1.cur);
// wrong drag
const tok=await T(()=>__test.rect('#s1Tok'));const cur=['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'].indexOf(s.s1.cur);
const wrongK=(cur+3)%8;let p=await T(([i])=>__test.orbitPoint(i,-30),[wrongK]);await drag(tok,p);await page.waitForTimeout(500);await shot('s1-wrong');
s=await st();console.log('after wrong tries',s.s1.tries,'placed',s.s1.placed.filter(Boolean).length);
p=await T(([i])=>__test.orbitPoint(i,-30),[cur]);await drag(tok,{x:p.x,y:p.y});await page.waitForTimeout(700);await shot('s1-right');
s=await st();console.log('after right placed',s.s1.placed.filter(Boolean).length,'stars',s.stars);
// tap mode
await tap('#s1Next');await page.waitForTimeout(700);s=await st();const c2=['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'].indexOf(s.s1.cur);
await tap('#s1Tok');await page.waitForTimeout(200);p=await T(([i])=>__test.orbitPoint(i,20),[c2]);await TP(p.x,p.y);await page.waitForTimeout(600);
s=await st();console.log('tap-mode placed',s.s1.placed.filter(Boolean).length,'stars',s.stars);
await T(()=>__test.fast());
for(let i=0;i<20;i++){const r=await T(()=>__test.solveStep());if(r===false)break;await page.waitForTimeout(60);}
await page.waitForTimeout(400);await T(()=>__test.fast(false));await page.waitForTimeout(2500);await shot('s1-done');
s=await st();console.log('s1 done',s.s1.done,'stars',s.stars,'shown',s.shown);
// S2
await tap('#s1ToS2');await page.waitForTimeout(1500);await shot('s2-intro');await tap('#s2Begin');await page.waitForTimeout(900);
s=await st();let a=s.s2.asked;let sp=await T(id=>__test.skyPoint(id),a);console.log('asked',a,sp);await TP(sp.x,sp.y);await page.waitForTimeout(1300);await shot('s2-zoomed');
sp=await T(id=>__test.skyPoint(id),a);await TP(sp.x,sp.y);await page.waitForTimeout(1200);await shot('s2-correct');
s=await st();console.log('s2 correct',s.s2.correct,'stars',s.stars);
await tap('#s2Next');await page.waitForTimeout(900);await T(()=>__test.zoom(5));await page.waitForTimeout(300);await T(()=>__test.wrong());await page.waitForTimeout(500);await shot('s2-wrong');
await T(()=>__test.fast());for(let i=0;i<30;i++){const r=await T(()=>__test.solveStep());if(r===false)break;await page.waitForTimeout(60);}
await T(()=>__test.fast(false));await page.waitForTimeout(1500);await shot('s2-done');s=await st();console.log('s2',JSON.stringify(s.s2),'stars',s.stars);
await tap('#s2ToMap');await page.waitForTimeout(1500);await shot('map2');
await tap('#st3');await page.waitForTimeout(1200);await shot('gate');await tap('#gateGo');await page.waitForTimeout(900);await shot('s3name');await tap('#s3Begin');await page.waitForTimeout(1600);await shot('s3-start');
// S3 with mistakes via real drags
const card=id=>T(i=>__test.rect('.card[data-id="'+i+'"]'),id);const op=(i,d)=>T(([i,d])=>__test.orbitPoint(i,d),[i,d]);
await drag(await card('moon'),await op(2,-20));await page.waitForTimeout(300);
await drag(await card('probe'),await T(()=>__test.rect('#bin')));await page.waitForTimeout(300);
await drag(await card('mars'),await op(4,-40));await page.waitForTimeout(300);
await drag(await card('jupiter'),await op(3,15));await page.waitForTimeout(300);
// tap mode for mercury
await tap('.card[data-id="mercury"]');p=await op(0,10);await TP(p.x,p.y);await page.waitForTimeout(300);
for(const [id,k] of [['venus',1],['saturn',5],['uranus',6],['neptune',7]])await T(([id,k])=>__test.s3Place(id,k),[id,k]);
await page.waitForTimeout(800);await shot('s3-design');s=await st();console.log('s3',JSON.stringify(s.s3.has),JSON.stringify(s.s3.where));
await tap('#checkBtn');await page.waitForTimeout(500);await shot('s3-confirm');await tap('#mYes');await page.waitForTimeout(1500);await shot('result');
s=await st();console.log('result',JSON.stringify(s.result));
await tap('#showScore');await page.waitForTimeout(3000);await shot('scorecard');
// perfect
console.log('btns',await T(()=>!document.querySelector('#resBtns').classList.contains('hidden')),'scrollTop',await T(()=>document.querySelector('#scr-result').scrollTop));await T(()=>__test.fast());await tap('#resRetry');await page.waitForTimeout(400);console.log('scr',(await st()).screen);await tap('#gateGo');await page.waitForTimeout(400);console.log('scr',(await st()).screen);await tap('#s3Begin');await page.waitForTimeout(500);console.log('scr',(await st()).screen);
for(let i=0;i<10;i++){if((await T(()=>__test.solveStep()))===false)break;}
await T(()=>__test.s3Bin('moon'));await tap('#checkBtn');await page.waitForTimeout(150);await tap('#mYes');await page.waitForTimeout(500);await T(()=>__test.fast(false));
await tap('#showScore');await page.waitForTimeout(3500);await shot('perfect');s=await st();console.log('perfect',JSON.stringify(s.result));
console.log('errors',errs,await T(()=>__test.errors),'scrollW',await T(()=>document.documentElement.scrollWidth));
await browser.close();})().catch(e=>{console.error('FAIL',e);process.exit(1);});
