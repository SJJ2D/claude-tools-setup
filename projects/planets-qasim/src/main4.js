
/* ---------------- GSAP, Lenis and micro-interactions ---------------- */
var G=window.gsap,fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
function words(el){var txt=el.textContent;el.setAttribute("aria-label",txt);el.textContent="";
  txt.split(/\s+/).filter(Boolean).forEach(function(w,i,a){var s=document.createElement("span");s.className="w";s.setAttribute("aria-hidden","true");s.textContent=w;el.appendChild(s);if(i<a.length-1)el.appendChild(document.createTextNode(" "));});
  return el.querySelectorAll(".w");}
function sheetFx(){if(!G||reduce)return;var ws=words($("#sheetTitle"));
  G.from(ws,{opacity:0,y:-16,filter:"blur(10px)",duration:.6,stagger:.09,ease:"power3.out",clearProps:"filter,transform,opacity"});
  G.from(Array.prototype.slice.call(sheetInner.children,0,8),{opacity:0,y:20,filter:"blur(8px)",duration:.7,stagger:.07,ease:"power3.out",delay:.12,clearProps:"filter,transform,opacity"});}
function actFx(i){if(!G||reduce)return;var ws=words($("#actTitle"));
  G.from(ws,{opacity:0,y:-14,filter:"blur(10px)",duration:.6,stagger:.09,ease:"power3.out",clearProps:"filter,transform,opacity"});
  var d=dotsBox.querySelectorAll("button")[i];if(d)G.fromTo(d,{scale:.5},{scale:1,duration:.6,ease:"back.out(3)",clearProps:"transform"});}
if(window.Lenis){try{
  lenS=new Lenis({wrapper:sheetBody,content:sheetInner,autoRaf:true,lerp:.09});
  lenA=new Lenis({wrapper:$("#actScroll"),content:$("#actInner"),autoRaf:true,lerp:.09});
}catch(err){lenS=lenA=null;}}
if(G&&fine&&!reduce){
  var mag=null;
  var unmag=function(){if(mag){G.to(mag,{x:0,y:0,duration:.7,ease:"elastic.out(1,.5)",overwrite:"auto"});mag=null;}};
  document.addEventListener("pointermove",function(e){var el=e.target.closest&&e.target.closest(".pill,.cta,.act-close,.pbtn");
    if(el!==mag)unmag();if(!el)return;mag=el;var r=el.getBoundingClientRect();
    G.to(el,{x:(e.clientX-(r.left+r.width/2))*.22,y:(e.clientY-(r.top+r.height/2))*.28,duration:.3,ease:"power3.out",overwrite:"auto"});});
  document.addEventListener("pointerleave",unmag);
}
if(fine){document.addEventListener("pointermove",function(e){var g=e.target.closest&&e.target.closest(".glow");if(!g)return;var r=g.getBoundingClientRect();
  g.style.setProperty("--mx",(e.clientX-r.left)+"px");g.style.setProperty("--my",(e.clientY-r.top)+"px");});}
if(G&&!reduce){document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest(".cta,.btn,.pill,#rail button,.act-close,.act-dots button,.pbtn,.opt,.plist button,.skyp,.groundBtn");if(!el)return;
  var x=e.clientX,y=e.clientY;if(!x&&!y){var r=el.getBoundingClientRect();x=r.left+r.width/2;y=r.top+r.height/2;}
  for(var i=0;i<8;i++){var s=document.createElement("span");s.className="spark"+(i%2?" g":"");document.body.appendChild(s);
    var a=i*Math.PI/4+Math.random()*.2,dist=30+Math.random()*14;G.set(s,{x:x,y:y,rotation:a*180/Math.PI+90});
    G.to(s,{x:x+Math.cos(a)*dist,y:y+Math.sin(a)*dist,opacity:0,scale:.3,duration:.55,ease:"power2.out",onComplete:function(){this.targets()[0].remove();}});}
});}

/* ---------------- star backdrops (drawn once) ---------------- */
function starURL(n,w,h,big){var c=document.createElement("canvas");c.width=w;c.height=h;var x=c.getContext("2d");var cols=["#ffffff","#CFE0FF","#FFE9C2","#FFD0EE","#C8FFF8"];
  for(var i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.globalAlpha=.35+Math.random()*.65;var r=Math.random()<.08?big:Math.random()*.9+.35;x.beginPath();x.arc(Math.random()*w,Math.random()*h,r,0,7);x.fill();}return c.toDataURL();}
(function(){var s1=document.querySelector(".space .s1"),s2=document.querySelector(".space .s2"),ws=$("#wStars");
  try{var u1=starURL(140,420,420,1.3),u2=starURL(50,520,520,1.9);s1.style.backgroundImage="url("+u1+")";s2.style.backgroundImage="url("+u2+")";ws.style.backgroundImage="url("+u1+"),url("+u2+")";}catch(e){}})();

/* ---------------- icons, astronaut tips, passport ---------------- */
var SV=function(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="#0A0C2C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';};
var ICON={
 student:SV('<circle cx="12" cy="10" r="7.5" fill="#fff"/><rect x="7.5" y="7" width="9" height="6" rx="3" fill="#2AD4F7"/><path d="M6 20c1.5-2.5 3.5-3.5 6-3.5s4.5 1 6 3.5"/>'),
 objective:SV('<circle cx="12" cy="12" r="9" fill="#fff"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="#0A0C2C"/>'),
 lesson:SV('<path d="M3 5.5c3-1.2 6-1 9 1 3-2 6-2.2 9-1v13c-3-1-6-.8-9 1-3-1.8-6-2-9-1z" fill="#fff"/><path d="M12 6.5v13"/>'),
 plan:SV('<rect x="5" y="4" width="14" height="17" rx="2.5" fill="#fff"/><rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="#0A0C2C"/><path d="M8.5 10.5h7M8.5 14h7M8.5 17.5h4"/>'),
 tech:SV('<path d="M12 2.5c3 2.3 4.5 5.6 4.5 9.5l-1.8 4.5H9.3L7.5 12c0-3.9 1.5-7.2 4.5-9.5z" fill="#fff"/><circle cx="12" cy="10" r="1.8"/><path d="M9.5 18.5l2.5 3 2.5-3"/>'),
 activity:SV('<rect x="3" y="12" width="18" height="8" rx="3" fill="#fff"/><path d="M9 12V6"/><circle cx="9" cy="5" r="2.2" fill="#FF4F7B"/><circle cx="15.5" cy="16" r="1.3" fill="#0A0C2C"/><circle cx="18" cy="16" r="1.3" fill="#0A0C2C"/>'),
 assess:SV('<circle cx="12" cy="10" r="7" fill="#fff"/><path d="M12 6.3l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 12.3l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z" fill="#0A0C2C"/><path d="M8.5 16.5L7 22l5-2 5 2-1.5-5.5"/>'),
 pano:SV('<circle cx="12" cy="12" r="9" fill="#fff"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><path d="M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/>'),
 refs:SV('<rect x="3" y="15" width="18" height="5" rx="1.5" fill="#fff"/><rect x="5" y="10" width="15" height="5" rx="1.5" fill="#fff"/><rect x="4" y="5" width="13" height="5" rx="1.5" fill="#fff"/>')
};
var TIPS={
 student:"مرحبًا! أنا رائد الفضاء الصغير، وهذه بطاقة صاحب المشروع.",
 objective:"هذا ما سيصمّمه التلميذ في نهاية الدرس.",
 lesson:"تعال نتعرّف إلى درس الكواكب (ص ٣٤–٣٩).",
 plan:"قلّب صفحات الخطة، ونزّلها PDF أو Word.",
 tech:"رحلتان تنتظرانك: Stellarium واللعبة، ومعهما جولة 360.",
 stellar:"ارفع الجهاز وابحث عن الكواكب فوق صفّك!",
 game:"اسحب كل كوكب إلى مداره واجمع النجوم.",
 activity:"أربع مراحل، جرّب كل واحدة بيدك.",
 assess:"هكذا نعرف أن التلميذ صمّم النموذج بنفسه.",
 pano:"قف في محطة الفضاء ودُر حولك!",
 refs:"هذه المصادر التي اعتمدت عليها الخطة."
};
Object.keys(PANELS).forEach(function(k){var orig=PANELS[k];PANELS[k]=function(){
  return '<div class="tip"><svg aria-hidden="true"><use href="#astro"/></svg><span>'+esc(TIPS[k]||"")+'</span></div>'+orig();};});
Array.prototype.forEach.call(rail.children,function(b,i){b.insertAdjacentHTML("afterbegin",'<span class="ri" aria-hidden="true">'+ICON[ITEMS[i].key]+'</span>');});
var visited={},pass=$("#passport");
ITEMS.forEach(function(){pass.insertAdjacentHTML("beforeend",'<svg aria-hidden="true"><use href="#star"/></svg>');});
pass.insertAdjacentHTML("beforeend",'<b id="passN">٠/٩</b>');
function visit(key){var i=ITEMS.findIndex(function(it){return it.key===key;});if(i<0||visited[key])return;visited[key]=1;
  var st=pass.querySelectorAll("svg")[i];st.classList.add("on");if(G&&!reduce)G.fromTo(st,{scale:.2,rotation:-90},{scale:1,rotation:0,duration:.6,ease:"back.out(3)",transformOrigin:"50% 50%"});
  rail.children[i].classList.add("seen");items[i].lbl.classList.add("seen");sfx("sparkle");
  var n=Object.keys(visited).length;$("#passN").textContent=toAr(n)+"/"+toAr(ITEMS.length);pass.setAttribute("aria-label","سجل رائد الفضاء: زرت "+toAr(n)+" من "+toAr(ITEMS.length));
  if(n===ITEMS.length){setTimeout(function(){sfx("win");confetti(110);toast("رائع يا رائد الفضاء! زرت العوالم التسعة كلها، وامتلأ سجلّك بالنجوم.");},500);}}
var _open=openPanel;
openPanel=function(key){var meta=ITEMS.find(function(it){return it.key===key;})||ITEMS[4];
  sheet.style.setProperty("--c",hexCss(meta.accent));$("#sheetIcon").innerHTML=ICON[meta.key];_open(key);visit(meta.key);sfx("open");
  if(G&&!reduce)G.fromTo("#sheetIcon",{scale:.3,rotation:-25},{scale:1,rotation:0,duration:.7,ease:"back.out(2.6)",delay:.15});};

/* ---------------- sounds: recorded CC0 space sounds (window.SFX), synthesised tones as a fallback ---------------- */
var AC=null,soundOn=true,musicOn=true,X=window.SFX||null;
function actx(){if(!soundOn)return null;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();}catch(e){AC=null;}return AC;}
function tone(f,d,type,v,delay){var a=actx();if(!a)return;var t=a.currentTime+(delay||0),o=a.createOscillator(),gn=a.createGain();o.type=type||"sine";o.frequency.setValueAtTime(f,t);
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(v||.12,t+.015);gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+d+.05);}
var SMAP={pop:["ok",.3],open:["whoosh",.4],good:["collect",.55],no:["wrong",.5],start:["rise",.5],win:["win",.6],scan:["scan",.45],tick:["laser",.12],launch:["engine",.45],whoosh:["whoosh",.3],sparkle:["sparkle",.32],power:["power",.5]};
function sfxTone(k){
  if(k==="pop"||k==="tick")tone(620+Math.random()*180,.09,"triangle",k==="tick"?.05:.1);
  else if(k==="open"||k==="whoosh"){tone(440,.12,"sine",.08);tone(660,.14,"sine",.08,.07);}
  else if(k==="good"||k==="sparkle")[523,659,784,1047].forEach(function(f,i){tone(f,.2,"triangle",.1,i*.08);});
  else if(k==="no"){tone(300,.14,"sine",.09);tone(220,.2,"sine",.08,.1);}
  else if(k==="scan")[880,1175].forEach(function(f,i){tone(f,.12,"sine",.07,i*.06);});
  else if(k==="start"||k==="launch"||k==="power")[220,330,440,554,659].forEach(function(f,i){tone(f,.2,"sawtooth",.04,i*.07);});
  else if(k==="win")[392,523,659,784,1047,1319].forEach(function(f,i){tone(f,.26,"square",.045,i*.09);});}
function sfx(k){if(!soundOn)return;var m=SMAP[k];if(X&&m){try{X.unlock();var src=X.play(m[0],m[1],k==="pop"?.92+Math.random()*.2:null);if(src){if(k==="launch")setTimeout(function(){try{src.stop();}catch(e){}},2600);return;}}catch(e){}}sfxTone(k);}
document.addEventListener("pointerdown",function(){if(X)try{X.unlock();}catch(e){}},{passive:true});
var sndBtn=$("#sndBtn"),musBtn=$("#musBtn");
sndBtn.addEventListener("click",function(){soundOn=!soundOn;sndBtn.setAttribute("aria-pressed",soundOn?"true":"false");
  sndBtn.querySelector(".wv").style.display=soundOn?"":"none";if(X)X.enabled(soundOn);if(soundOn){sfx("pop");if(musicOn&&X)X.music(true);}});
musBtn.addEventListener("click",function(){musicOn=!musicOn;musBtn.setAttribute("aria-pressed",musicOn?"true":"false");if(X)X.music(musicOn&&soundOn);});
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("button,.cta,.btn");
  if(!b||b.classList.contains("opt")||b.id==="goBtn"||b.id==="sndBtn"||b.closest("#rail")||b.closest(".plist")||b.classList.contains("skyp")||b.classList.contains("groundBtn"))return;sfx("pop");});
qcard.addEventListener("click",function(e){var b=e.target.closest(".opt");if(b&&b.classList.contains("no"))sfx("no");});

/* 360: progress bar, chime, celebration */
var _count=count;count=function(){var n=_count(),m=$("#pmeter");if(m)m.style.width=(n/SPOTS.length*100)+"%";return n;};
var chimed={},_good=showGood;showGood=function(s){_good(s);if(!chimed[s.id]){chimed[s.id]=1;sfx("good");}};
var _finish=finish;finish=function(){_finish();sfx("win");confetti(100);};
var _end=showEnd;showEnd=function(){_end();};

function confetti(n){if(!G||reduce)return;var cols=["#FF4F7B","#FFC83D","#2AD4F7","#2EE6A8","#9D6BFF","#FF5FD2"];
  for(var i=0;i<n;i++){var s=document.createElement("span");s.className="confetti";s.style.background=cols[i%cols.length];document.body.appendChild(s);
    var x=innerWidth*(.15+Math.random()*.7);G.set(s,{x:x,y:-24,rotation:Math.random()*360,scale:.6+Math.random()*.7});
    G.to(s,{x:x+(Math.random()-.5)*420,y:innerHeight+40,rotation:"+="+(360+Math.random()*720),duration:2.2+Math.random()*1.6,ease:"power1.in",delay:Math.random()*.5,
      onComplete:function(){this.targets()[0].remove();}});}}

/* ---------------- welcome screen ---------------- */
var wel=$("#welcome");
function startAdventure(){wel.hidden=true;introT0=performance.now();hint.classList.remove("gone");setTimeout(hideHint,9000);
  if(G&&!reduce){G.from(".plate-in",{y:-50,opacity:0,scale:.85,duration:1.1,ease:"elastic.out(1,.6)",delay:.6});
    G.from(".tools .pill",{x:-40,opacity:0,duration:.7,stagger:.1,ease:"back.out(1.8)",delay:.8});
    G.from("#rail button",{y:46,opacity:0,duration:.7,stagger:.06,ease:"back.out(1.6)",delay:1.3});
    G.from(".passport svg",{scale:0,duration:.4,stagger:.05,ease:"back.out(3)",delay:1.6,transformOrigin:"50% 50%"});}
  setTimeout(function(){canvas.focus&&canvas.focus({preventScroll:true});},60);}
$("#goBtn").addEventListener("click",function(){sfx("start");if(X&&musicOn&&soundOn)X.music(true);
  if(G&&!reduce){G.killTweensOf("#wAstro,#wPlanet");G.to(".wcard",{y:-30,scale:.9,opacity:0,duration:.45,ease:"back.in(1.6)"});G.to(wel,{opacity:0,duration:.5,delay:.25,onComplete:startAdventure});}
  else startAdventure();});
if(G&&!reduce){
  G.from(".wcard",{y:70,scale:.85,opacity:0,duration:1.1,ease:"elastic.out(1,.6)"});
  G.from("#wAstro",{x:-90,y:-40,rotation:24,opacity:0,duration:1.2,delay:.4,ease:"back.out(1.7)"});
  G.from("#wPlanet",{scale:.3,opacity:0,duration:1.1,delay:.55,ease:"elastic.out(1,.55)",transformOrigin:"50% 50%"});
  G.from("#wTitle",{scale:.4,opacity:0,duration:.9,delay:.45,ease:"elastic.out(1,.5)"});
  G.from(words($("#wSub")),{opacity:0,y:14,filter:"blur(8px)",duration:.6,stagger:.08,delay:.8,ease:"power3.out",clearProps:"filter,transform,opacity"});
  G.from(".w-feats li",{y:22,opacity:0,duration:.55,stagger:.08,delay:1.1,ease:"back.out(2)"});
  G.from("#goBtn",{scale:.5,opacity:0,duration:1,delay:1.4,ease:"elastic.out(1,.5)"});
  G.to("#wAstro",{y:-10,rotation:-6,duration:2.2,yoyo:true,repeat:-1,ease:"sine.inOut",delay:1.6,transformOrigin:"50% 60%"});
  G.to("#wPlanet",{rotation:8,y:-5,duration:3,yoyo:true,repeat:-1,ease:"sine.inOut",delay:1.7,transformOrigin:"50% 50%"});
}
setTimeout(function(){$("#goBtn").focus({preventScroll:true});},50);
window.addEventListener("keydown",function(e){if(!wel.hidden&&e.key==="Escape"){$("#goBtn").click();}});

/* ---------------- world-tracked AR (WebXR, Android): the whole solar system sits on a real table ---------------- */
var xrui=$("#xrui"),xrbar=$("#xrbar"),xrSession=null,xrHit=null,xrOK=false,placedAR=false,arScale=.045;
var reticle=new THREE.Group();reticle.matrixAutoUpdate=false;reticle.visible=false;scene.add(reticle);
(function(){var r1=new THREE.Mesh(new THREE.RingGeometry(.09,.11,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xFFC83D}));reticle.add(r1);
  var r2=new THREE.Mesh(new THREE.CircleGeometry(.09,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x2AD4F7,transparent:true,opacity:.35}));reticle.add(r2);})();
function arLook(on){arBase.visible=arRim.visible=on;deep.visible=!on&&!document.body.classList.contains("ar");}
function PC(){if(renderer.xr.isPresenting){var c=renderer.xr.getCamera(camera);return (c.cameras&&c.cameras[0])||c;}return camera;}
var _inv=new THREE.Matrix4();
function setRay(n){if(!renderer.xr.isPresenting){ray.setFromCamera(n,camera);return;}
  var c=PC();ray.ray.origin.setFromMatrixPosition(c.matrixWorld);_inv.copy(c.projectionMatrix).invert();
  ray.ray.direction.set(n.x,n.y,.5).applyMatrix4(_inv).applyMatrix4(c.matrixWorld).sub(ray.ray.origin).normalize();}
function xrFrame(frame){if(!frame||!xrHit||placedAR)return;var ref=renderer.xr.getReferenceSpace(),hits=frame.getHitTestResults(xrHit);
  if(hits.length){reticle.visible=true;reticle.matrix.fromArray(hits[0].getPose(ref).transform.matrix);}else reticle.visible=false;}
function xrHint(m){var h=$("#xrhint");if(!m){h.hidden=true;return;}h.textContent=m;h.hidden=false;}
var PLACED_MSG="ثبّتّ النظام الشمسي. امشِ حوله، واسحب بإصبعك يمينًا ويسارًا لتدوير العوالم، واضغط على أي مجسم لتفتحه.";
function placeHub(){if(!reticle.visible)return;stage.position.setFromMatrixPosition(reticle.matrix);stage.position.y+=.32*arScale;
  var cp=new THREE.Vector3().setFromMatrixPosition(PC().matrixWorld);stage.rotation.set(0,Math.atan2(cp.x-stage.position.x,cp.z-stage.position.z),0);
  stage.visible=true;placedAR=true;reticle.visible=false;document.body.classList.add("placed");xrHint("");sfx("start");
  if(G&&!reduce){stage.scale.setScalar(arScale*.2);G.to(stage.scale,{x:arScale,y:arScale,z:arScale,duration:.9,ease:"elastic.out(1,.6)"});}else stage.scale.setScalar(arScale);
  toast(PLACED_MSG);}
function setScaleAR(s){arScale=Math.max(.015,Math.min(.2,s));if(placedAR){if(G)G.to(stage.scale,{x:arScale,y:arScale,z:arScale,duration:.35,ease:"back.out(2)"});else stage.scale.setScalar(arScale);}}
function startXR(){if(stream){camBtn.click();}
  navigator.xr.requestSession("immersive-ar",{requiredFeatures:["hit-test"],optionalFeatures:["dom-overlay"],domOverlay:{root:xrui}}).then(function(s){
    xrSession=s;renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType("local");
    return renderer.xr.setSession(s).then(function(){
      s.requestReferenceSpace("viewer").then(function(vs){return s.requestHitTestSource({space:vs});}).then(function(src){xrHit=src;});
      var ctl=renderer.xr.getController(0);scene.add(ctl);ctl.addEventListener("select",function(){if(!placedAR)placeHub();});
      document.body.classList.add("xr","ar");document.body.classList.remove("placed");if(sheetOpen)closePanel();arLook(true);sfx("power");
      stage.visible=false;placedAR=false;xrbar.hidden=false;camBtn.setAttribute("aria-pressed","true");
      xrHint("وجّه الكاميرا إلى الطاولة وحرّكها ببطء حتى تظهر الدائرة الصفراء، ثم اضغط على الشاشة لتضع النظام الشمسي");
      s.addEventListener("end",onXREnd);});
  }).catch(function(){toast("تعذّر بدء الواقع المعزز على هذا الجهاز. سأشغّل وضع الكاميرا العادي.");camFallback();});}
function onXREnd(){xrSession=null;xrHit=null;renderer.xr.enabled=false;document.body.classList.remove("xr","ar","placed");
  stage.position.set(0,0,0);stage.rotation.set(0,0,0);stage.scale.setScalar(1);stage.visible=true;arLook(false);
  reticle.visible=false;placedAR=false;xrbar.hidden=true;xrHint("");camBtn.setAttribute("aria-pressed","false");setFog();resize();
  if(xrAfter){var f=xrAfter;xrAfter=null;setTimeout(f,60);}}
var xrAfter=null;function endXRThen(f){xrAfter=f;xrSession.end();}
var camFallback=null;
camBtn.addEventListener("click",function(e){if(xrSession){e.stopImmediatePropagation();xrSession.end();return;}
  if(xrOK&&!stream){e.stopImmediatePropagation();startXR();}},true);
camFallback=function(){xrOK=false;camBtn.click();xrOK=true;};
$("#tourBtn").addEventListener("click",function(e){if(xrSession){e.stopImmediatePropagation();endXRThen(openPano);}},true);
var _openAct=openAct;openAct=function(i){if(xrSession){endXRThen(function(){_openAct(i);});return;}_openAct(i);};
var _openPano=openPano;openPano=function(){if(xrSession){endXRThen(_openPano);return;}_openPano();};
if(navigator.xr&&navigator.xr.isSessionSupported){navigator.xr.isSessionSupported("immersive-ar").then(function(ok){xrOK=!!ok;
  if(ok){camBtn.querySelector("span:last-child").textContent="الواقع المعزز";var w=$("#wArNote");if(w)w.hidden=false;}},function(){});}
var xp={},xdrag=null,pinch0=0,scale0=arScale;
function uiTarget(t){return t.closest&&t.closest("button,a,input,textarea,label,.sheet,#act,#pano,.rail,.tools,.plate,.toast,#xrbar,#welcome");}
xrui.addEventListener("pointerdown",function(e){if(!xrSession||uiTarget(e.target))return;xp[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(xp);
  if(ids.length===2){var a=xp[ids[0]],b=xp[ids[1]];pinch0=Math.hypot(a.x-b.x,a.y-b.y);scale0=arScale;xdrag=null;}else xdrag={x:e.clientX,lx:e.clientX,moved:0};});
xrui.addEventListener("pointermove",function(e){if(!xrSession||!xp[e.pointerId])return;xp[e.pointerId].x=e.clientX;xp[e.pointerId].y=e.clientY;var ids=Object.keys(xp);
  if(ids.length===2&&pinch0>0&&placedAR){var a=xp[ids[0]],b=xp[ids[1]];arScale=Math.max(.015,Math.min(.2,scale0*Math.hypot(a.x-b.x,a.y-b.y)/pinch0));stage.scale.setScalar(arScale);return;}
  if(!xdrag||!placedAR)return;var dx=e.clientX-xdrag.lx;xdrag.lx=e.clientX;xdrag.moved+=Math.abs(dx);if(xdrag.moved>8){rotT+=dx*.0065;rot+=dx*.0065;}});
function xup(e){if(!xp[e.pointerId])return;delete xp[e.pointerId];if(Object.keys(xp).length)return;pinch0=0;
  var d=xdrag;xdrag=null;if(!d||!placedAR)return;if(d.moved<=8)pick(e.clientX,e.clientY);else rotT=Math.round(rotT/STEP)*STEP;}
xrui.addEventListener("pointerup",xup);xrui.addEventListener("pointercancel",function(e){delete xp[e.pointerId];xdrag=null;pinch0=0;});
Array.prototype.forEach.call(document.querySelectorAll("#xrui .rail,#xrui .tools,#xrui .plate,#xrui .sheet,#xrbar,#xrui .toast"),function(el){
  el.addEventListener("beforexrselect",function(ev){ev.preventDefault();});});
var MOVE_MSG="وجّه الكاميرا إلى المكان الجديد حتى تظهر الدائرة الصفراء، ثم اضغط على الشاشة";
$("#xrMove").addEventListener("click",function(){placedAR=false;stage.visible=false;document.body.classList.remove("placed");xrHint(MOVE_MSG);});
$("#xrBig").addEventListener("click",function(){setScaleAR(arScale*1.25);});
$("#xrSmall").addEventListener("click",function(){setScaleAR(arScale/1.25);});
$("#xrLeft").addEventListener("click",function(){selectIndex((current+1)%ITEMS.length);});
$("#xrRight").addEventListener("click",function(){selectIndex((current-1+ITEMS.length)%ITEMS.length);});
$("#xrExit").addEventListener("click",function(){if(xrSession)xrSession.end();});

/* ---------------- iPhone / iPad: Apple AR Quick Look (fallback when tracked AR cannot start) ---------------- */
var QL=(function(){var a=document.createElement("a");return !!(a.relList&&a.relList.supports&&a.relList.supports("ar"));})();
function openQL(){var a=document.createElement("a");a.rel="ar";a.href="planets_hub.usdz#allowsContentScaling=1";
  a.appendChild(document.createElement("img"));a.style.display="none";document.body.appendChild(a);a.click();setTimeout(function(){a.remove();},1500);
  toast("وجّه الكاميرا إلى السرير أو الطاولة حتى يثبت النظام الشمسي عليه. حرّكه بإصبع واحد، ودوّره بإصبعين، وكبّره بالقرص.");}
if(QL){camBtn.querySelector("span:last-child").textContent="الواقع المعزز";var wq=$("#wArNote");
  if(wq){wq.textContent="جهازك يدعم الواقع المعزز: بعد البدء اضغط زر «الواقع المعزز»، فيثبت النظام الشمسي على السرير أو الطاولة كأنه مجسم حقيقي، وتضغط على أي مجسم لتفتحه.";wq.hidden=false;}}

/* ---------------- iPhone / iPad: world-tracked AR in Safari with the 8th Wall engine (SLAM) ----------------
   Safari on iOS has no WebXR. The 8th Wall Distributed Engine Binary (© Niantic Spatial, limited-use licence)
   tracks the room with the camera, so the solar system stays fixed on the bed or table while the student walks
   around it, and every world stays tappable: a tap opens its page, panel or activity exactly as on screen. */
var AR8={on:false,loading:false,scene:null,cam:null,ret:null,ground:null,ray:new THREE.Raycaster(),c:new THREE.Vector2(),aim:null};
window.__AR8=AR8;window.__ar8items=items;var ar8canvas=document.createElement("canvas");ar8canvas.id="ar8canvas";
ar8canvas.style.cssText="position:fixed;inset:0;width:100%;height:100%;z-index:1;display:none;touch-action:none";
document.body.insertBefore(ar8canvas,document.body.firstChild);
var ar8badge=document.createElement("a");ar8badge.id="ar8badge";ar8badge.href="https://github.com/8thwall/engine/blob/main/LICENSE";ar8badge.target="_blank";ar8badge.rel="noopener";
ar8badge.textContent="الواقع المعزز: 8th Wall Engine © Niantic Spatial";ar8badge.hidden=true;
ar8badge.style.cssText="position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);z-index:7;font:600 11px/1.3 'Readex Pro',sans-serif;color:#fff;background:rgba(0,0,0,.5);padding:3px 8px;border-radius:8px;text-decoration:none;pointer-events:auto";
document.body.appendChild(ar8badge);
function loadScript(src){return new Promise(function(ok,no){var s=document.createElement("script");s.src=src;s.crossOrigin="anonymous";s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function ar8Engine(){
  if(window.XR8)return Promise.resolve();
  var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js";s.async=true;s.crossOrigin="anonymous";s.setAttribute("data-preload-chunks","slam");
  return new Promise(function(ok,no){window.addEventListener("xrloaded",function(){ok();},{once:true});s.onerror=no;document.head.appendChild(s);
    setTimeout(function(){if(!window.XR8)no(new Error("timeout"));},45000);}).then(function(){return window.XRExtras?0:loadScript("https://cdn.jsdelivr.net/npm/@8thwall/xrextras@1/dist/xrextras.js");});
}
function ar8Module(){return{name:"planetshub",
  onStart:function(){var x=XR8.Threejs.xrScene();AR8.scene=x.scene;AR8.cam=x.camera;
    x.renderer.outputEncoding=renderer.outputEncoding;
    AR8.scene.add(new THREE.HemisphereLight(0xffffff,0x4a2fa0,.8));var dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(2,5,3);AR8.scene.add(dl);
    AR8.ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({visible:false}));AR8.scene.add(AR8.ground);
    AR8.ret=new THREE.Group();var r1=new THREE.Mesh(new THREE.RingGeometry(.09,.115,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xFFC83D}));
    var r2=new THREE.Mesh(new THREE.CircleGeometry(.09,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x2AD4F7,transparent:true,opacity:.35}));AR8.ret.add(r1,r2);AR8.scene.add(AR8.ret);
    scene.remove(stage);AR8.scene.add(stage);arLook(true);
    stage.visible=false;placedAR=false;
    AR8.cam.position.set(0,1.2,0);
    XR8.XrController.updateCameraProjectionMatrix({origin:AR8.cam.position,facing:AR8.cam.quaternion});
    xrHint("وجّه الكاميرا إلى السرير أو الطاولة وحرّكها قليلًا حتى تظهر الدائرة الصفراء، ثم اضغط على الشاشة لتضع النظام الشمسي");},
  onUpdate:function(){if(!AR8.cam||placedAR){if(AR8.ret)AR8.ret.visible=false;return;}
    AR8.c.set(0,-.15);AR8.ray.setFromCamera(AR8.c,AR8.cam);var h=AR8.ray.intersectObject(AR8.ground)[0];
    AR8.ret.visible=!!h;if(h){AR8.ret.position.copy(h.point);AR8.aim=h.point.clone();}},
  onCameraStatusChange:function(e){if(e.status==="failed"){ar8Fail();}}};}
function ar8Place(){if(!AR8.aim)return;stage.position.copy(AR8.aim);stage.position.y+=.32*arScale;
  var cp=AR8.cam.position;stage.rotation.set(0,Math.atan2(cp.x-stage.position.x,cp.z-stage.position.z),0);
  stage.visible=true;placedAR=true;AR8.ret.visible=false;document.body.classList.add("placed");xrHint("");sfx("start");
  if(G&&!reduce){stage.scale.setScalar(arScale*.2);G.to(stage.scale,{x:arScale,y:arScale,z:arScale,duration:.9,ease:"elastic.out(1,.6)"});}else stage.scale.setScalar(arScale);
  toast("ثبّتّ النظام الشمسي على السطح. امشِ حوله، واضغط على أي مجسم لتفتحه، واسحب لتدويره، وقرّب إصبعين أو باعدهما لتصغيره أو تكبيره.");}
function startAR8(){if(AR8.on||AR8.loading)return;AR8.loading=true;toast("جاري تشغيل الواقع المعزز… اسمح باستخدام الكاميرا والحركة.");
  if(sheetOpen)closePanel();
  var perm=(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==="function")?DeviceMotionEvent.requestPermission().catch(function(){}):Promise.resolve();
  perm.then(ar8Engine).then(function(){
    AR8.loading=false;AR8.on=true;window.__AR8on=true;ar8canvas.style.display="block";ar8badge.hidden=false;sfx("power");
    document.body.classList.add("xr","ar");document.body.classList.remove("placed");xrbar.hidden=false;camBtn.setAttribute("aria-pressed","true");
    XR8.clearCameraPipelineModules();
    XR8.addCameraPipelineModules([XR8.GlTextureRenderer.pipelineModule(),XR8.Threejs.pipelineModule(),XR8.XrController.pipelineModule(),
      XRExtras.FullWindowCanvas.pipelineModule(),XRExtras.Loading.pipelineModule(),ar8Module()]);
    XR8.XrController.configure({disableWorldTracking:false});
    XR8.run({canvas:ar8canvas});
  }).catch(function(){AR8.loading=false;ar8Fail();});}
function stopAR8(){if(!AR8.on)return;try{XR8.stop();XR8.clearCameraPipelineModules();}catch(e){}
  AR8.on=false;window.__AR8on=false;ar8canvas.style.display="none";ar8badge.hidden=true;
  if(AR8.scene)AR8.scene.remove(stage);scene.add(stage);stage.position.set(0,0,0);stage.rotation.set(0,0,0);stage.scale.setScalar(1);stage.visible=true;
  placedAR=false;document.body.classList.remove("xr","ar","placed");arLook(false);xrbar.hidden=true;xrHint("");camBtn.setAttribute("aria-pressed","false");setFog();resize();}
function ar8Fail(){stopAR8();
  if(QL){toast("تعذّر تتبّع المكان على هذا الجهاز، فسأفتح النظام الشمسي بعارض أبل.");setTimeout(openQL,700);}
  else toast("تعذّر تشغيل الواقع المعزز على هذا الجهاز. جرّب Safari على الآيفون أو Chrome على أندرويد.");}
var _PC=PC;PC=function(){return AR8.on&&AR8.cam?AR8.cam:_PC();};
var _setRay=setRay;setRay=function(n){if(AR8.on&&AR8.cam){ray.setFromCamera(n,AR8.cam);return;}_setRay(n);};
var a8p={},a8drag=null,a8pinch=0,a8s0=arScale;
function a8target(e){return !AR8.on||uiTarget(e.target)||e.target===ar8badge;}
window.addEventListener("pointerdown",function(e){if(a8target(e))return;a8p[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(a8p);
  if(ids.length===2){var a=a8p[ids[0]],b=a8p[ids[1]];a8pinch=Math.hypot(a.x-b.x,a.y-b.y);a8s0=arScale;a8drag=null;}else a8drag={lx:e.clientX,moved:0};},true);
window.addEventListener("pointermove",function(e){if(!AR8.on||!a8p[e.pointerId])return;a8p[e.pointerId].x=e.clientX;a8p[e.pointerId].y=e.clientY;var ids=Object.keys(a8p);
  if(ids.length===2&&a8pinch>0&&placedAR){var a=a8p[ids[0]],b=a8p[ids[1]];arScale=Math.max(.015,Math.min(.2,a8s0*Math.hypot(a.x-b.x,a.y-b.y)/a8pinch));stage.scale.setScalar(arScale);return;}
  if(!a8drag||!placedAR)return;var dx=e.clientX-a8drag.lx;a8drag.lx=e.clientX;a8drag.moved+=Math.abs(dx);if(a8drag.moved>8){rotT+=dx*.0065;rot+=dx*.0065;}},true);
function a8up(e){if(!a8p[e.pointerId])return;delete a8p[e.pointerId];if(Object.keys(a8p).length)return;a8pinch=0;var d=a8drag;a8drag=null;if(!d)return;
  if(!placedAR){if(d.moved<=8)ar8Place();return;}
  if(d.moved<=8)pick(e.clientX,e.clientY);else rotT=Math.round(rotT/STEP)*STEP;}
window.addEventListener("pointerup",a8up,true);window.addEventListener("pointercancel",function(e){delete a8p[e.pointerId];a8drag=null;a8pinch=0;},true);
$("#xrExit").addEventListener("click",function(e){if(AR8.on){e.stopImmediatePropagation();stopAR8();}},true);
$("#xrMove").addEventListener("click",function(e){if(AR8.on){e.stopImmediatePropagation();placedAR=false;stage.visible=false;document.body.classList.remove("placed");xrHint(MOVE_MSG);}},true);
var _openAct8=openAct;openAct=function(i){if(AR8.on){stopAR8();setTimeout(function(){_openAct8(i);},60);return;}_openAct8(i);};
var _openPano8=openPano;openPano=function(){if(AR8.on){stopAR8();setTimeout(_openPano8,60);return;}_openPano8();};
if(QL){camBtn.addEventListener("click",function(e){if(xrOK||xrSession||stream)return;e.stopImmediatePropagation();if(AR8.on)stopAR8();else startAR8();},true);}
window.__hub={openPanel:function(k){openPanel(k);},openPano:function(){openPano();},openAct:function(i){openAct(i);},ITEMS:ITEMS,items:items,camera:camera,PC:function(){return PC();},
  state:function(){return {sheet:sheetOpen,cur:current,visited:Object.keys(visited).length};}};
})();
