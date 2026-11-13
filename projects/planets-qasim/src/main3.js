
/* ---------------- 360 tour: the space station ---------------- */
var pano=null,solved={},panoEl=$("#pano"),qcard=$("#qcard");
function initPano(){
  var cv=$("#panoCanvas"),r=new THREE.WebGLRenderer({canvas:cv,antialias:true});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(75,1,.1,200);cam.rotation.order="YXZ";
  var tex=new THREE.CanvasTexture(panoCanvas);tex.anisotropy=r.capabilities.getMaxAnisotropy();panoTex.push(tex);
  var geo=new THREE.SphereGeometry(60,96,64);geo.scale(-1,1,1);sc.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex})));
  var dir=function(az,el){var ph=az*Math.PI/180,th=(90-el)*Math.PI/180;return new THREE.Vector3(Math.cos(ph)*Math.sin(th),Math.cos(th),Math.sin(ph)*Math.sin(th));};
  var faceYaw=function(az){var ph=az*Math.PI/180;return Math.atan2(-Math.cos(ph),-Math.sin(ph));};
  var st={yaw:faceYaw(166),pitch:.12,fov:75,raf:0,gyro:false,a0:null,yaw0:0};
  var spotsBox=$("#spots");spotsBox.innerHTML="";
  var spots=SPOTS.map(function(s){var b=document.createElement("button");b.type="button";b.className="spot";b.setAttribute("aria-label",s.name+": سؤال");
    b.innerHTML='<i aria-hidden="true">؟</i><span>'+esc(s.name)+'</span>';b.addEventListener("click",function(e){e.stopPropagation();openQ(s);});
    spotsBox.appendChild(b);return {s:s,b:b,v:dir(s.az,s.el).multiplyScalar(40)};});
  function size(){var w=window.innerWidth,h=window.innerHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.fov=st.fov;cam.updateProjectionMatrix();}
  window.addEventListener("resize",size);
  var ptrs={},pinch0=0,fov0=75,dragged=0;
  cv.addEventListener("pointerdown",function(e){cv.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY};dragged=0;
    var ids=Object.keys(ptrs);if(ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]];pinch0=Math.hypot(a.x-b.x,a.y-b.y);fov0=st.fov;}});
  cv.addEventListener("pointermove",function(e){var p=ptrs[e.pointerId];if(!p)return;var ids=Object.keys(ptrs);
    if(ids.length===2){p.x=e.clientX;p.y=e.clientY;var a=ptrs[ids[0]],b=ptrs[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0>0){st.fov=Math.max(40,Math.min(95,fov0*pinch0/d));size();}return;}
    var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;dragged+=Math.abs(dx)+Math.abs(dy);var k=.0042*st.fov/75;
    st.yaw+=dx*k;if(st.gyro){st.yaw0+=dx*k;}st.pitch=Math.max(-1.35,Math.min(1.35,st.pitch+dy*k));if(dragged>8)$("#phint").style.opacity="0";});
  var up=function(e){delete ptrs[e.pointerId];pinch0=0;};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  cv.addEventListener("wheel",function(e){e.preventDefault();st.fov=Math.max(40,Math.min(95,st.fov+e.deltaY*.04));size();},{passive:false});
  function onOri(e){if(e.alpha==null)return;st.gotOri=true;var a=e.alpha*Math.PI/180;if(st.a0===null){st.a0=a;st.yaw0=st.yaw;}
    st.yaw=st.yaw0+(a-st.a0);var ang=(screen.orientation&&screen.orientation.angle)||window.orientation||0;
    if(ang===0&&e.beta!=null){st.pitch=Math.max(-1.35,Math.min(1.35,(e.beta-90)*Math.PI/180));}}
  var gyroBtn=$("#gyroBtn");
  gyroBtn.addEventListener("click",function(){
    if(st.gyro){window.removeEventListener("deviceorientation",onOri);st.gyro=false;gyroBtn.setAttribute("aria-pressed","false");return;}
    var start=function(){st.a0=null;st.gotOri=false;window.addEventListener("deviceorientation",onOri);st.gyro=true;gyroBtn.setAttribute("aria-pressed","true");
      setTimeout(function(){if(st.gyro&&!st.gotOri){window.removeEventListener("deviceorientation",onOri);st.gyro=false;gyroBtn.setAttribute("aria-pressed","false");
        toast("الجهاز لم يرسل بيانات الحركة في هذه الصفحة. استخدم إصبعك للسحب، أو افتح الرابط في متصفح الجهاز مباشرة.");}},1500);};
    if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"){
      DeviceOrientationEvent.requestPermission().then(function(r){if(r==="granted")start();else toast("لم يُسمح باستخدام حركة الجهاز. يمكنك السحب بإصبعك.");},function(){toast("لم يُسمح باستخدام حركة الجهاز. يمكنك السحب بإصبعك.");});
    }else start();
  });
  var pv=new THREE.Vector3();
  function frame(){st.raf=requestAnimationFrame(frame);cam.rotation.set(st.pitch,st.yaw,0);
    var w=window.innerWidth,h=window.innerHeight;cam.updateMatrixWorld();
    spots.forEach(function(o){pv.copy(o.v).project(cam);var vis=pv.z<1&&pv.x>-1.2&&pv.x<1.2&&pv.y>-1.2&&pv.y<1.2;
      if(!vis){o.b.style.visibility="hidden";return;}o.b.style.visibility="visible";
      o.b.style.transform="translate("+((pv.x+1)/2*w).toFixed(1)+"px,"+((-pv.y+1)/2*h).toFixed(1)+"px) translate(-50%,-25px)";
      o.b.classList.toggle("done",!!solved[o.s.id]);o.b.querySelector("i").textContent=solved[o.s.id]?"✓":"؟";});
    r.render(sc,cam);}
  return {start:function(){size();cancelAnimationFrame(st.raf);frame();},
          stop:function(){cancelAnimationFrame(st.raf);if(st.gyro){window.removeEventListener("deviceorientation",onOri);st.gyro=false;gyroBtn.setAttribute("aria-pressed","false");}},
          face:function(az){st.yaw=faceYaw(az);st.pitch=.12;},st:st};
}
function count(){var n=Object.keys(solved).length;$("#pcount").textContent="اكتشفت "+toAr(n)+" من "+toAr(SPOTS.length);return n;}
var panoReturn=null;
function openPano(){panoReturn=document.activeElement;if(sheetOpen)closePanel();running=false;panoEl.hidden=false;if(!pano)pano=initPano();pano.start();count();
  $("#phint").style.opacity="1";setTimeout(function(){$("#panoClose").focus({preventScroll:true});},30);}
function closePano(){if(pano)pano.stop();closeQ(true);panoEl.hidden=true;running=true;last=performance.now();
  if(panoReturn&&panoReturn.focus&&document.contains(panoReturn))panoReturn.focus({preventScroll:true});}
$("#panoClose").addEventListener("click",function(){closePano();});
var qReturn=null;
function qHead(s){var b=byId(s.id);return '<h3><span class="pdot" style="--pc:'+pgrad(b)+'"></span>'+esc(s.name)+'</h3>';}
function openQ(s){qReturn=document.activeElement;var opts=s.o.map(function(o,i){return '<button class="opt" type="button" data-i="'+i+'">'+esc(o)+'</button>';}).join("");
  qcard.innerHTML=qHead(s)+'<p>'+esc(s.q)+'</p><div class="opts">'+opts+'</div><div id="fb"></div>';
  if(solved[s.id]){showGood(s);}
  Array.prototype.forEach.call(qcard.querySelectorAll(".opt"),function(b){b.addEventListener("click",function(){var i=+b.dataset.i;
    if(i===s.c){b.classList.add("ok");solved[s.id]=true;count();showGood(s);}
    else{b.classList.add("no");b.disabled=true;$("#fb").innerHTML='<div class="fb try">ليس هذا. انظر إلى النافذة مرة أخرى وتذكّر ترتيب الكواكب من الشمس، ثم جرّب خيارًا آخر.</div>';}});});
  qcard.hidden=false;if(typeof sfx==="function")sfx("scan");var first=qcard.querySelector(".opt:not([disabled])")||qcard.querySelector(".cta");if(first)first.focus({preventScroll:true});}
function showGood(s){Array.prototype.forEach.call(qcard.querySelectorAll(".opt"),function(b){b.disabled=true;if(+b.dataset.i===s.c)b.classList.add("ok");});
  $("#fb").innerHTML='<div class="fb good">'+esc(s.e)+'</div><button class="cta" type="button" id="qnext">'+(count()===SPOTS.length?"اعرض النتيجة":"تابع الجولة")+'</button>';
  $("#qnext").addEventListener("click",function(){if(count()===SPOTS.length)finish();else closeQ();});$("#qnext").focus({preventScroll:true});}
function closeQ(silent){qcard.hidden=true;qcard.innerHTML="";if(!silent&&qReturn&&qReturn.focus&&document.contains(qReturn))qReturn.focus({preventScroll:true});}
function finish(){qcard.innerHTML='<div class="finish"><h3>أكملت الجولة يا رائد الفضاء</h3><p>اكتشفت النقاط التسع. هذا ترتيب الكواكب الثمانية من الأقرب إلى الشمس إلى الأبعد:</p><ol>'+
  PLANETS.map(function(p){return '<li>'+p.n+'</li>';}).join("")+'</ol>'+
  '<p>والقمر ليس كوكبًا لأنه يتبع كوكبًا هو الأرض. وحجم الكوكب أو مكانه في السماء لا يدل على ترتيبه.</p>'+
  gameLink("طبّق ما تعلمته في لعبة رائد الفضاء الصغير")+'<button class="cta alt" type="button" id="again">أعد الجولة</button><button class="btn" type="button" id="back" style="width:100%">عودة إلى المدار</button></div>';
  qcard.hidden=false;$("#again").addEventListener("click",function(){solved={};count();var m=$("#pmeter");if(m)m.style.width="0%";closeQ(true);pano.face(166);});
  $("#back").addEventListener("click",function(){closePano();});$("#again").focus({preventScroll:true});}

/* ---------------- immersive activity ---------------- */
var actEl=$("#act"),actCv=$("#actCanvas"),actG=actCv.getContext("2d"),actCard=$("#actCard"),actOv=$("#actOv");
var AS={i:0,raf:0,pred:"",refl:"",seen:{},role:"st",t0:0,launch:0,
  sky:{k:0,log:[],msg:"",zoom:null},train:{placed:{},fly:{},round:[],stars:0,msg:""},design:{ex:{},checked:false,reveal:0},done:false,conf:[]};
var actReturn=null,actW=1,actH=1,AREA={x:0,y:0,w:1,h:1};
var ORDER=PLANETS.map(function(p){return p.id;});
var SKYPOS={mercury:[.66,.7,40],venus:[.22,.44,46],mars:[.82,.3,42],jupiter:[.4,.64,62],saturn:[.56,.24,52],uranus:[.12,.76,44],neptune:[.88,.66,44]};
var shuffle=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;};
function liList(a){return a.map(function(x){return '<li>'+x+'</li>';}).join("");}
function skyMsg(){var S=AS.sky;if(S.k>=8)return "اكتمل سجلّك! كوّنت قائمة مرتبة للكواكب الثمانية من الأقرب إلى الشمس إلى الأبعد.";
  var t=byId(ORDER[S.k]);if(t.id==="earth")return "ابحث عن: الأرض. هل تراها في السماء؟ نحن نقف عليها! اضغط زر الأرض أسفل المشهد.";return "ابحث عن: "+t.n+". اضغط على الكواكب في السماء واقرأ بطاقة كل كوكب.";}
function skyUpdate(){var S=AS.sky,lb=$("#logbook");if(!lb)return;var h="";for(var i=0;i<8;i++){h+=i<S.log.length?'<li>'+toAr(i+1)+'. '+byId(S.log[i]).n+'</li>':'<li class="empty">'+toAr(i+1)+'. …</li>';}lb.innerHTML=h;
  $("#skyMsg").textContent=S.msg||skyMsg();$("#skyMsg").className="say"+(S.good===true?" good":S.good===false?" bad":"");
  var chip=$("#skyChip");if(chip)chip.innerHTML=S.k>=8?"اكتمل (سجل رائد الفضاء)":"ابحث عن: <b>"+byId(ORDER[Math.min(S.k,7)]).n+"</b>";
  Array.prototype.forEach.call(document.querySelectorAll(".skyp,[data-ground]"),function(b){b.classList.toggle("found",S.log.indexOf(b.dataset.p)>=0);});}
function skyTap(id,el){var S=AS.sky,p=byId(id),i=ORDER.indexOf(id),want=ORDER[S.k];
  var card=$("#pcardBox");if(card){var r=el.getBoundingClientRect(),ar=actEl.getBoundingClientRect();card.style.left=Math.min(actW-120,Math.max(120,r.left+r.width/2-ar.left))+"px";card.style.top=Math.max(80,r.top-ar.top-14)+"px";
    card.innerHTML='<div class="pcard pop"><b>'+p.n+'</b>الترتيب من الشمس: '+p.ord+'</div>';card.hidden=false;clearTimeout(S.ct);S.ct=setTimeout(function(){card.hidden=true;},2600);}
  if(S.k>=8){S.msg="بطاقة "+p.n+": الكوكب "+p.ord+" من الشمس.";S.good=null;skyUpdate();return;}
  if(id===want){S.log.push(id);S.k++;S.good=true;
    S.msg="أحسنت! قرأت البطاقة: "+p.n+" الكوكب "+p.ord+" من الشمس، فسجّلته في السجل."+(id==="jupiter"?" قرّب الصورة لترى ضخامته.":id==="saturn"?" قرّب الصورة لترى حلقاته.":"")+(S.k===4?" لاحظ أن مكان الكوكب في السماء لا يدل على ترتيبه، والبطاقة هي التي تخبرك به.":"");
    if(id==="jupiter"||id==="saturn")S.zoom={id:id,t0:performance.now()};
    if(S.k>=8){S.msg=skyMsg()+" عُد إلى الشرائح لتكمل رحلتك.";burst(90);sfx("win");}else sfx("good");}
  else{S.good=false;S.msg="هذا "+p.n+"، ترتيبه من الشمس "+p.ord+". لكنك تبحث عن "+byId(want).n+": خذ الترتيب من البطاقة لا من مكان الكوكب في السماء.";sfx("no");}
  skyUpdate();}
function trainNew(){var T=AS.train,left=ORDER.filter(function(id){return !T.placed[id];});if(!left.length){T.placed={};T.fly={};left=ORDER.slice();}
  T.round=shuffle(shuffle(left).slice(0,Math.min(3,left.length)));T.msg="اضغط الكوكب الأقرب إلى الشمس أولًا.";T.good=null;trainUpdate();}
function trainUpdate(){var T=AS.train,box=$("#trainChips");if(!box)return;
  box.innerHTML=T.round.map(function(id){var p=byId(id);return '<button type="button" data-p="'+id+'"'+(T.placed[id]?' disabled':'')+'><i style="--pc:'+pgrad(p)+'"></i>'+p.n+'</button>';}).join("");
  Array.prototype.forEach.call(box.querySelectorAll("button"),function(b){b.addEventListener("click",function(){trainTap(b.dataset.p);});});
  $("#trainMsg").textContent=T.msg;$("#trainMsg").className="say"+(T.good===true?" good":T.good===false?" bad":"");
  var n=Object.keys(T.placed).length;$("#trainStars").textContent="★ "+toAr(T.stars)+" · في المدارات "+toAr(n)+" من ٨";var c=$("#trainChip");if(c)c.innerHTML="النجوم: <b>★ "+toAr(T.stars)+"</b>";}
function trainTap(id){var T=AS.train,rest=T.round.filter(function(x){return !T.placed[x];}).sort(function(a,b){return ORDER.indexOf(a)-ORDER.indexOf(b);}),want=rest[0],p=byId(id);
  if(id===want){T.placed[id]=1;T.fly[id]=performance.now();T.stars++;T.good=true;T.msg="صحيح! "+p.n+" ثبت في مداره (الكوكب "+p.ord+")، وحصلت على نجمة.";sfx("good");
    if(Object.keys(T.placed).length===8){T.msg="رائع! اكتمل النظام الشمسي أمامك: الكواكب الثمانية في مداراتها.";burst(100);sfx("win");}
    else if(rest.length===1)T.msg+=" انتهت الجولة، اضغط (جولة جديدة).";}
  else{T.good=false;T.msg="تغذية راجعة: "+p.n+" أبعد عن الشمس من "+byId(want).n+". ابدأ بالكوكب الأقرب إلى الشمس، ثم أعد المحاولة.";sfx("no");}
  trainUpdate();}
var DCARDS=shuffle(ORDER.concat(["moon","probe"]));
function designUpdate(){var Dd=AS.design,box=$("#dCards");if(!box)return;
  box.innerHTML=DCARDS.map(function(id){var p=byId(id);return '<button type="button" data-p="'+id+'" aria-pressed="'+(Dd.ex[id]?"true":"false")+'"'+(Dd.checked?" disabled":"")+'><i style="--pc:'+pgrad(p)+'"></i>'+p.n+'</button>';}).join("");
  Array.prototype.forEach.call(box.querySelectorAll("button"),function(b){b.addEventListener("click",function(){Dd.ex[b.dataset.p]=!Dd.ex[b.dataset.p];designUpdate();});});
  var ck=$("#dCheck");ck.disabled=Dd.checked;
  if(Dd.checked){var good=["moon","probe"].filter(function(id){return Dd.ex[id];}),bad=ORDER.filter(function(id){return Dd.ex[id];});
    var t="استبعدت "+toAr(good.length)+" من ٢ من الجسمين اللذين ليسا كوكبين: القمر يتبع كوكبًا هو الأرض، ومسبار الفضاء آلة تُطلق من الأرض.";
    if(bad.length)t+=" لكن "+bad.map(function(id){return byId(id).n;}).join(" و")+" "+(bad.length>1?"كواكب":"كوكب")+"، ومكانه في مدار من المدارات الثمانية.";
    if(good.length===2&&!bad.length)t+=" ممتاز: هاتان درجتان من سلّم التقدير، والدرجات الثماني الأخرى لوضع كل كوكب في مداره.";
    var r=$("#dRes");r.textContent=t;r.hidden=false;r.className="say"+(good.length===2&&!bad.length?" good":" bad");}}
var TRY=[
 {html:function(){return '<h3>جرّب: سجل رائد الفضاء</h3><p>سؤال المعلم أمام صورة السماء ليلًا: (هل تستطيعون أن ترتبوا الكواكب من الأقرب إلى الشمس إلى الأبعد؟)</p>'+
   '<label class="lbl2" for="predIn">اكتب توقعك كما يكتبه التلميذ في (سجل رائد الفضاء):</label><textarea id="predIn" placeholder="أتوقع أن الترتيب …"></textarea>'+
   '<p class="small" style="margin:6px 0 0">إجابات متوقعة من التلاميذ (اضغط واحدة لتجرّبها):</p><div class="qchips"><button type="button">الأرض أول كوكب</button><button type="button">المشتري الأقرب لأنه كبير</button><button type="button">ما أعرف الترتيب</button></div>'+
   '<button class="cta" id="missionBtn" type="button">أعلن المهمة وأطلق الصاروخ</button><p class="say" id="missionTxt" hidden>أنتم اليوم روّاد فضاء صغار، ستستكشفون الكواكب بأنفسكم، ثم تصمّمون نموذجًا لنظامنا الشمسي.</p>'+
   '<p class="small">لا يصحّح المعلم التوقعات الآن؛ يظهر توقعك في المرحلة الأخيرة لتقارنه بما اكتشفته.</p>';},
  wire:function(){var t=$("#predIn");t.value=AS.pred;t.addEventListener("input",function(){AS.pred=t.value;});
    Array.prototype.forEach.call(document.querySelectorAll("#actTry .qchips button"),function(b){b.addEventListener("click",function(){t.value="("+b.textContent+")";AS.pred=t.value;});});
    var show=function(){$("#missionTxt").hidden=false;var c=$("#missionChip");if(c)c.hidden=false;};if(AS.launch)show();
    $("#missionBtn").addEventListener("click",function(){AS.launch=performance.now();show();sfx("launch");});},
  ov:function(){return '<div class="ov" style="--fx:.5;--fy:.3"><div class="vbubble pop"><svg aria-hidden="true"><use href="#astro"/></svg><span>هل تستطيعون أن ترتبوا الكواكب من الأقرب إلى الشمس إلى الأبعد؟</span></div></div>'+
    '<div class="ov" style="--fx:.5;--fy:.08"><div class="chip-top" id="missionChip"'+(AS.launch?'':' hidden')+'>المهمة: <b>روّاد الفضاء الصغار</b></div></div>';}},
 {html:function(){return '<h3>جرّب: جولة رائد الفضاء</h3><p class="small" style="margin:0">في المشهد سماء فوق صورة الصف، كما يراها التلميذ بالواقع المعزز. اضغط على الكواكب واقرأ بطاقتها.</p>'+
   '<p class="say" id="skyMsg" aria-live="polite"></p><p class="small" style="margin:0">(سجل رائد الفضاء) من الأقرب إلى الأبعد:</p><ol class="logbook" id="logbook"></ol>'+
   '<div class="row2" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="skyReset" type="button">أعد الجولة</button></div>'+
   '<details class="more"><summary>تعليمات الشريحة (٦)</summary><ol>'+liList(STAGES[1].steps)+'</ol></details>'+stelLink("افتح Stellarium Web "+ICO_EXT);},
  wire:function(){$("#skyReset").addEventListener("click",function(){AS.sky={k:0,log:[],msg:"",zoom:null};skyUpdate();});
    Array.prototype.forEach.call(actOv.querySelectorAll(".skyp,[data-ground]"),function(b){b.addEventListener("click",function(){skyTap(b.dataset.p,b);});});skyUpdate();},
  ov:function(){var h='<div class="ov" style="--fx:.5;--fy:.06"><div class="chip-top" id="skyChip"></div></div>';
    Object.keys(SKYPOS).forEach(function(id,k){var s=SKYPOS[id],p=byId(id);h+='<div class="ov hit" style="--fx:'+s[0]+';--fy:'+s[1]+'"><button type="button" class="skyp'+(id==="saturn"?" ring":"")+'" data-p="'+id+'" aria-label="'+p.n+'" style="--sz:'+s[2]+'px;--pg:'+pgrad(p)+';--pgl:'+p.c+';--d:'+(-k*.7)+'s"></button></div>';});
    return h+'<div class="ov hit" style="--fx:.5;--fy:.92"><button type="button" class="groundBtn" data-ground data-p="earth">الأرض: نقف عليها</button></div><div id="pcardBox" class="ov" style="--fx:0;--fy:0;transform:translate(-50%,-100%)" hidden></div>';}},
 {html:function(){return '<h3>جرّب: قسم (النظام الشمسي)</h3><p>اضغط الكواكب بالترتيب من الأقرب إلى الشمس إلى الأبعد، فيثبت كل كوكب في مداره وتحصل على نجمة.</p>'+
   '<div class="plist" id="trainChips"></div><p class="say" id="trainMsg" aria-live="polite"></p><p class="stars" id="trainStars"></p>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="trainNew" type="button">جولة جديدة</button></div>'+
   '<details class="more"><summary>تعليمات الشريحة (٦)</summary><ol>'+liList(STAGES[2].steps)+'</ol></details>'+gameLink("افتح لعبة رائد الفضاء الصغير "+ICO_EXT,"cta pink");},
  wire:function(){if(!AS.train.round.length)trainNew();else trainUpdate();$("#trainNew").addEventListener("click",trainNew);},
  ov:function(){return '<div class="ov" style="--fx:.5;--fy:.06"><div class="chip-top" id="trainChip"></div></div>';}},
 {html:function(){return '<h3>جرّب: جزء من (مصمم النظام الشمسي)</h3><p>بين البطاقات العشر جسمان ليسا كوكبين. اضغط عليهما لتستبعدهما، ثم اضغط (تحقّق من نموذجي). لديك محاولة واحدة، ولا تظهر صحة الإجابة قبل التحقق.</p>'+
   '<div class="plist" id="dCards"></div><button class="cta" id="dCheck" type="button">تحقّق من نموذجي</button><p class="say" id="dRes" hidden aria-live="polite"></p>'+
   '<details class="more"><summary>تعليمات الشريحة (٤)</summary><ol>'+liList(STAGES[3].steps)+'</ol></details>'+
   '<h3>الختام: قارن بتوقعك الأول</h3><p class="small" style="margin:0">توقعك في (سجل رائد الفضاء):</p><blockquote class="pred" id="predOut"></blockquote>'+
   '<p class="say">سؤال المعلم أمام النموذج الصحيح: (من توقّع أن المشتري هو الأقرب؟ ماذا اكتشفت الآن؟)</p>'+
   '<label class="lbl2" for="reflIn">ماذا اكتشفت الآن؟</label><textarea id="reflIn" placeholder="كنت أظن أن … والآن اكتشفت أن …"></textarea><p class="say good" id="endMsg" hidden></p>'+
   gameLink("افتح اللعبة: القسم الثالث "+ICO_EXT,"cta pink");},
  wire:function(){designUpdate();$("#dCheck").addEventListener("click",function(){if(AS.design.checked)return;AS.design.checked=true;AS.design.reveal=performance.now();designUpdate();
      var ok=AS.design.ex.moon&&AS.design.ex.probe&&!ORDER.some(function(id){return AS.design.ex[id];});sfx(ok?"good":"no");});
    $("#predOut").textContent=AS.pred.trim()||"لم تكتب توقعًا في المرحلة الأولى. ارجع إليها واكتبه، ثم قارنه هنا.";var r=$("#reflIn");r.value=AS.refl;r.addEventListener("input",function(){AS.refl=r.value;});
    if(AS.done)showEnd();},
  ov:function(){return '<div class="ov" style="--fx:.5;--fy:.06"><div class="chip-top">التقويم: محاولة واحدة · <b>١٠ درجات</b></div></div>';}}
];
function showEnd(){var e=$("#endMsg");if(!e)return;e.hidden=false;e.textContent="أحسنت يا رائد الفضاء الصغير! أكملت مراحل النشاط الأربع: توقّعت، ثم استكشفت الكواكب في السماء، ثم بنيت النظام الشمسي، ثم صمّمت نموذجك وقارنته بتوقعك الأول.";}

/* drawing helpers */
function hex(h){h=h.replace("#","");return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function css(a,al){return "rgba("+Math.round(a[0])+","+Math.round(a[1])+","+Math.round(a[2])+","+(al==null?1:al)+")";}
function vfill(g,y0,y1,c0,c1,x,y,w,h){var gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(x,y,w,h);}
function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
var STARS=[];for(var sti=0;sti<220;sti++)STARS.push([Math.random(),Math.random(),Math.random()*6,Math.random()<.15?2.4:1.5]);
function starsDraw(g,W,H,al,t){if(al<=0)return;g.save();g.fillStyle="#fff";STARS.forEach(function(s){g.globalAlpha=al*(.35+.65*Math.abs(Math.sin(t*1.4+s[2])));g.fillRect(s[0]*W,s[1]*H,s[3],s[3]);});g.restore();}
function nebula(g,x,y,r,col,a){var rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,"rgba("+col+","+a+")");rg.addColorStop(1,"rgba("+col+",0)");g.fillStyle=rg;g.fillRect(x-r,y-r,r*2,r*2);}
function planetDraw(g,x,y,r,p,ring){if(ring||p.id==="saturn"){g.save();g.strokeStyle="rgba(246,220,140,.85)";g.lineWidth=Math.max(2,r*.18);g.beginPath();g.ellipse(x,y,r*2,r*.5,-.3,Math.PI,Math.PI*2);g.stroke();g.restore();}
  var gl=g.createRadialGradient(x,y,r*.8,x,y,r*1.8);gl.addColorStop(0,css(hex(p.c),.35));gl.addColorStop(1,css(hex(p.c),0));g.fillStyle=gl;g.beginPath();g.arc(x,y,r*1.8,0,7);g.fill();
  var pg=g.createRadialGradient(x-r*.35,y-r*.35,r*.08,x,y,r);pg.addColorStop(0,"#ffffff");pg.addColorStop(.3,p.c);pg.addColorStop(1,p.c2);g.fillStyle=pg;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  if(p.id==="jupiter"){g.save();g.beginPath();g.arc(x,y,r,0,7);g.clip();g.fillStyle="rgba(170,90,50,.35)";for(var i=-2;i<3;i++)g.fillRect(x-r,y+i*r*.32,r*2,r*.12);g.restore();}
  if(ring||p.id==="saturn"){g.save();g.strokeStyle="rgba(246,220,140,.95)";g.lineWidth=Math.max(2,r*.18);g.beginPath();g.ellipse(x,y,r*2,r*.5,-.3,0,Math.PI);g.stroke();g.restore();}}
function sunDraw(g,x,y,r,t){var gl=g.createRadialGradient(x,y,r*.4,x,y,r*3.4);gl.addColorStop(0,"rgba(255,206,90,.8)");gl.addColorStop(.4,"rgba(255,120,60,.3)");gl.addColorStop(1,"rgba(255,90,60,0)");
  g.fillStyle=gl;g.beginPath();g.arc(x,y,r*3.4,0,7);g.fill();g.save();g.translate(x,y);g.rotate(t*.2);g.fillStyle="rgba(255,190,60,.65)";
  for(var i=0;i<14;i++){g.rotate(Math.PI/7);g.beginPath();g.moveTo(r*1.1,-r*.1);g.lineTo(r*1.6,0);g.lineTo(r*1.1,r*.1);g.fill();}g.restore();
  var d=g.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);d.addColorStop(0,"#FFFBE2");d.addColorStop(.5,"#FFD34A");d.addColorStop(1,"#FF8A1F");g.fillStyle=d;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
function rocketDraw(g,x,y,s,ang,t){g.save();g.translate(x,y);g.rotate(ang);
  var fl=s*(.9+Math.sin(t*40)*.15);var fg=g.createLinearGradient(0,s*.6,0,s*.6+fl);fg.addColorStop(0,"#FFF2B0");fg.addColorStop(.4,"#FFB12E");fg.addColorStop(1,"rgba(255,79,123,0)");
  g.fillStyle=fg;g.beginPath();g.moveTo(-s*.22,s*.55);g.quadraticCurveTo(0,s*.6+fl*1.3,s*.22,s*.55);g.fill();
  g.fillStyle="#FF4F7B";g.beginPath();g.moveTo(-s*.28,s*.25);g.lineTo(-s*.5,s*.65);g.lineTo(-s*.2,s*.55);g.fill();g.beginPath();g.moveTo(s*.28,s*.25);g.lineTo(s*.5,s*.65);g.lineTo(s*.2,s*.55);g.fill();
  g.fillStyle="#F4F6FF";g.beginPath();g.moveTo(0,-s*.8);g.bezierCurveTo(s*.38,-s*.4,s*.3,s*.4,s*.22,s*.58);g.lineTo(-s*.22,s*.58);g.bezierCurveTo(-s*.3,s*.4,-s*.38,-s*.4,0,-s*.8);g.fill();
  g.fillStyle="#FF4F7B";g.beginPath();g.moveTo(0,-s*.8);g.bezierCurveTo(s*.2,-s*.62,s*.26,-s*.5,s*.27,-s*.45);g.lineTo(-s*.27,-s*.45);g.bezierCurveTo(-s*.26,-s*.5,-s*.2,-s*.62,0,-s*.8);g.fill();
  g.fillStyle="#2AD4F7";g.strokeStyle="#141A4E";g.lineWidth=Math.max(1.5,s*.05);g.beginPath();g.arc(0,-s*.12,s*.13,0,7);g.fill();g.stroke();g.restore();}
var FLOAT=PLANETS.map(function(p,i){return {p:p,x:(i*.37+.08)%1,y:(i*.53+.12)%.7,s:.6+((i*7)%5)/6};});

/* stage scenes */
function scNight(g,W,H,A,t){vfill(g,0,H,"#07062A","#2A1466",0,0,W,H);nebula(g,A.x+A.w*.2,A.y+A.h*.25,A.w*.5,"255,64,170",.28);nebula(g,A.x+A.w*.85,A.y+A.h*.5,A.w*.45,"42,170,255",.24);
  starsDraw(g,W,H,1,t);var mn=Math.min(A.w,A.h);
  FLOAT.forEach(function(f,i){var x=A.x+A.w*(.08+f.x*.84)+Math.sin(t*.3+i)*12,y=A.y+A.h*(.12+f.y*.62)+Math.cos(t*.25+i)*8;planetDraw(g,x,y,mn*.025*f.s+3,f.p);});
  g.save();g.font="700 "+Math.round(Math.max(22,mn*.08))+"px Changa, Tahoma, sans-serif";g.textAlign="center";g.fillStyle="#FFC83D";
  for(var i=0;i<8;i++){var ph=(t*.06+i/8)%1,x=A.x+A.w*((i*.37+.06)%1),y=A.y+A.h*(1-ph*.95);g.globalAlpha=Math.sin(ph*Math.PI)*.45;g.fillText("؟",x+Math.sin(t+i)*10,y);}g.restore();
  // skyline
  var by=A.y+A.h*.9;g.fillStyle="#0A0820";g.beginPath();g.moveTo(0,H);g.lineTo(0,by);
  [[.02,.0],[.06,-.05],[.1,-.05],[.1,-.12],[.13,-.12],[.13,-.03],[.2,-.03],[.21,-.18],[.23,-.2],[.25,-.18],[.26,-.04],[.34,-.04],[.35,-.1],[.39,-.1],[.4,-.02],[.55,-.02],[.56,-.14],[.58,-.15],[.6,-.14],[.61,-.05],[.7,-.05],[.72,-.22],[.74,-.24],[.76,-.22],[.78,-.06],[.86,-.06],[.87,-.11],[.9,-.11],[.91,-.03],[1,-.03]].forEach(function(p){g.lineTo(A.x+A.w*p[0],by+A.h*p[1]);});
  g.lineTo(W,by);g.lineTo(W,H);g.closePath();g.fill();
  g.fillStyle="rgba(255,200,61,.7)";for(var w=0;w<22;w++){var wx=A.x+A.w*((w*.137+.21)%.6+.2),wy=by-A.h*((w*.31)%.12)-6;g.fillRect(wx,wy,3,4);}
  if(AS.launch){var lt=(performance.now()-AS.launch)/1000;if(lt<6){var k=Math.min(1,lt/4.5),e=k*k,rx=A.x+A.w*(.18+.5*e),ry=by-A.h*(e*1.05)-10,ang=.35+e*.5;
      g.save();g.strokeStyle="rgba(255,200,120,.55)";g.lineWidth=5;g.setLineDash([2,10]);g.beginPath();g.moveTo(A.x+A.w*.18,by-10);g.quadraticCurveTo(A.x+A.w*.3,by-A.h*.3,rx,ry);g.stroke();g.restore();
      rocketDraw(g,rx,ry,mn*.08,ang,t);}}}
function scSky(g,W,H,A,t){var mn=Math.min(A.w,A.h);
  vfill(g,0,H,"#3B3360","#6A5B6E",0,0,W,H);
  // the classroom seen through the camera
  g.fillStyle="#544A78";g.fillRect(0,A.y+A.h*.62,W,H);g.fillStyle="#2F7A5A";rrect(g,A.x+A.w*.3,A.y+A.h*.3,A.w*.4,A.h*.25,8);g.fill();g.strokeStyle="#C9A26B";g.lineWidth=6;g.stroke();
  g.fillStyle="#8FB8E8";rrect(g,A.x+A.w*.04,A.y+A.h*.2,A.w*.16,A.h*.3,6);g.fill();rrect(g,A.x+A.w*.8,A.y+A.h*.2,A.w*.16,A.h*.3,6);g.fill();
  g.fillStyle="#7A5A3A";for(var d=0;d<4;d++){var dx=A.x+A.w*(.08+d*.24);rrect(g,dx,A.y+A.h*.8,A.w*.16,A.h*.06,4);g.fill();g.fillRect(dx+6,A.y+A.h*.86,5,A.h*.14);g.fillRect(dx+A.w*.16-11,A.y+A.h*.86,5,A.h*.14);}
  // the AR sky over the room
  vfill(g,0,H,"rgba(8,6,40,.86)","rgba(20,12,70,.62)",0,0,W,H);nebula(g,A.x+A.w*.3,A.y+A.h*.3,A.w*.35,"140,80,255",.3);nebula(g,A.x+A.w*.75,A.y+A.h*.55,A.w*.3,"255,64,170",.22);
  starsDraw(g,W,H,.9,t);
  g.strokeStyle="rgba(127,227,255,.35)";g.lineWidth=1.5;g.beginPath();[[.08,.18],[.16,.12],[.25,.2],[.31,.13]].forEach(function(p,i){var x=A.x+A.w*p[0],y=A.y+A.h*p[1];if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.stroke();
  g.beginPath();[[.7,.12],[.76,.08],[.8,.15],[.74,.2],[.7,.12]].forEach(function(p,i){var x=A.x+A.w*p[0],y=A.y+A.h*p[1];if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.stroke();
  // AR frame
  g.strokeStyle="rgba(46,230,168,.9)";g.lineWidth=4;var m=14,L=28,x0=A.x+m,y0=A.y+m+30,x1=A.x+A.w-m,y1=A.y+A.h-m;
  [[x0,y0,1,1],[x1,y0,-1,1],[x0,y1,1,-1],[x1,y1,-1,-1]].forEach(function(c){g.beginPath();g.moveTo(c[0],c[1]+c[3]*L);g.lineTo(c[0],c[1]);g.lineTo(c[0]+c[2]*L,c[1]);g.stroke();});
  var cx=A.x+A.w/2,cy=A.y+A.h*.47;g.strokeStyle="rgba(255,255,255,.45)";g.lineWidth=2;g.beginPath();g.arc(cx,cy,16,0,7);g.moveTo(cx-26,cy);g.lineTo(cx-8,cy);g.moveTo(cx+8,cy);g.lineTo(cx+26,cy);g.stroke();
  var Z=AS.sky.zoom;if(Z){var zt=(performance.now()-Z.t0)/1000;if(zt>3.2)AS.sky.zoom=null;else{var a=Math.min(1,zt/.4,(3.2-zt)/.5),p=byId(Z.id);g.save();g.globalAlpha=a;
      var zr=mn*.24*(.7+.3*Math.min(1,zt/.6));g.fillStyle="rgba(5,7,34,.8)";g.beginPath();g.arc(cx,cy,zr*1.9,0,7);g.fill();g.strokeStyle="#2EE6A8";g.lineWidth=4;g.stroke();
      planetDraw(g,cx,cy,zr,p);g.restore();}}}
function trainGeo(A){var sx=A.x+A.w*1.04,sy=A.y+A.h*.58,span=A.w*.92;return {sx:sx,sy:sy,r:function(k){return span*(.14+k*.105);}};}
function scTrain(g,W,H,A,t){vfill(g,0,H,"#08082E","#1A1050",0,0,W,H);nebula(g,A.x+A.w*.3,A.y+A.h*.4,A.w*.5,"140,80,255",.3);starsDraw(g,W,H,.8,t);
  var G2=trainGeo(A),mn=Math.min(A.w,A.h),T=AS.train,now=performance.now();sunDraw(g,G2.sx,G2.sy,mn*.2,t);
  g.font="700 "+Math.round(Math.max(13,mn*.045))+"px Changa, Tahoma, sans-serif";g.textAlign="center";g.direction="rtl";
  ORDER.forEach(function(id,k){var rr=G2.r(k),p=byId(id);g.strokeStyle=T.placed[id]?"rgba(46,230,168,.55)":"rgba(186,194,243,.32)";g.lineWidth=2.5;g.setLineDash(T.placed[id]?[]:[6,8]);
    g.beginPath();g.arc(G2.sx,G2.sy,rr,Math.PI*.8,Math.PI*1.2);g.stroke();g.setLineDash([]);
    var ang=Math.PI+((k%2)?-.1:.1)+Math.sin(t*.3+k)*.03,px=G2.sx+Math.cos(ang)*rr,py=G2.sy+Math.sin(ang)*rr,pr=Math.max(6,mn*[.022,.03,.032,.026,.06,.05,.038,.037][k]);
    if(T.placed[id]){var ft=T.fly[id]?Math.min(1,(now-T.fly[id])/700):1,e=1-Math.pow(1-ft,3),fx=A.x+A.w*.5,fy=A.y+A.h*1.05;var qx=fx+(px-fx)*e,qy=fy+(py-fy)*e-Math.sin(e*Math.PI)*A.h*.25;
      planetDraw(g,qx,qy,pr,p);if(ft>=1){g.fillStyle="#F4F6FF";g.fillText(p.n,px,py+((k%2)?pr+mn*.06:-pr-mn*.025));}}
    else{g.strokeStyle="rgba(186,194,243,.45)";g.lineWidth=2;g.setLineDash([3,5]);g.beginPath();g.arc(px,py,pr,0,7);g.stroke();g.setLineDash([]);}});}
function scBoard(g,W,H,A,t){vfill(g,0,H,"#0B0F3A","#1C1250",0,0,W,H);starsDraw(g,W,H,.6,t);
  var bx=A.x+A.w*.05,by=A.y+A.h*.1,bw=A.w*.9,bh=A.h*.8,mn=Math.min(bw,bh);
  g.fillStyle="#05061A";rrect(g,bx-10,by-10,bw+20,bh+20,22);g.fill();g.strokeStyle="#3D49C6";g.lineWidth=4;g.stroke();
  var sg=g.createLinearGradient(0,by,0,by+bh);sg.addColorStop(0,"#101860");sg.addColorStop(1,"#0A0F3A");g.fillStyle=sg;rrect(g,bx,by,bw,bh,14);g.fill();
  g.save();rrect(g,bx,by,bw,bh,14);g.clip();
  var sx=bx+bw*1.0,sy=by+bh*.55,Dd=AS.design,rv=Dd.checked?(performance.now()-Dd.reveal)/1000:-1;sunDraw(g,sx,sy,mn*.2,t);
  g.font="700 "+Math.round(Math.max(12,mn*.055))+"px Changa, Tahoma, sans-serif";g.textAlign="center";g.direction="rtl";
  ORDER.forEach(function(id,k){var rr=bw*(.15+k*.104),p=byId(id);g.strokeStyle="rgba(186,194,243,.35)";g.lineWidth=2;g.beginPath();g.arc(sx,sy,rr,Math.PI*.78,Math.PI*1.22);g.stroke();
    var ang=Math.PI+((k%2)?-.11:.11),px=sx+Math.cos(ang)*rr,py=sy+Math.sin(ang)*rr,pr=Math.max(5,mn*[.025,.034,.036,.03,.07,.058,.044,.043][k]);
    var a=rv<0?0:clamp01((rv-k*.25)/.4);if(a<=0){g.strokeStyle="rgba(186,194,243,.4)";g.setLineDash([3,5]);g.beginPath();g.arc(px,py,pr,0,7);g.stroke();g.setLineDash([]);return;}
    g.save();g.globalAlpha=a;planetDraw(g,px,py-(1-a)*20,pr,p);g.fillStyle="#F4F6FF";g.fillText(p.n,px,py+((k%2)?pr+mn*.07:-pr-mn*.03));g.restore();});
  g.restore();
  g.fillStyle="#BAC2F3";g.font="600 "+Math.round(Math.max(12,mn*.05))+"px Changa, Tahoma, sans-serif";g.textAlign="center";
  g.fillText(Dd.checked?"السبورة الذكية: النموذج الصحيح للنظام الشمسي":"النموذج الصحيح يظهر على السبورة بعد التحقق",bx+bw/2,by+bh+Math.max(26,mn*.09));}
var SCENES=[scNight,scSky,scTrain,scBoard];
function burst(n){var cols=["#FF4F7B","#FFC83D","#2AD4F7","#2EE6A8","#9D6BFF","#FF5FD2"];for(var i=0;i<n;i++){AS.conf.push({x:AREA.x+AREA.w*(.3+Math.random()*.4),y:AREA.y+AREA.h*.35,vx:(Math.random()-.5)*9,vy:-4-Math.random()*8,c:cols[i%cols.length],r:4+Math.random()*5,a:Math.random()*6,va:(Math.random()-.5)*.3});}}
function confettiDraw(g){if(!AS.conf.length)return;var H=actH;AS.conf=AS.conf.filter(function(p){return p.y<H+20;});
  AS.conf.forEach(function(p){p.vy+=.25;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;g.save();g.translate(p.x,p.y);g.rotate(p.a);g.fillStyle=p.c;g.fillRect(-p.r,-p.r*.45,p.r*2,p.r*.9);g.restore();});}
function updArea(){var r=actCard.getBoundingClientRect(),a;
  if(r.width<actW*.7)a={x:Math.round(r.right),y:60,w:Math.max(200,Math.round(actW-r.right)),h:actH-60};else a={x:0,y:60,w:actW,h:Math.max(140,Math.round(r.top)-60)};
  if(a.x!==AREA.x||a.w!==AREA.w||a.h!==AREA.h||a.y!==AREA.y){AREA=a;actEl.style.setProperty("--ax",a.x+"px");actEl.style.setProperty("--ay",a.y+"px");actEl.style.setProperty("--aw",a.w+"px");actEl.style.setProperty("--ah",a.h+"px");}}
function actSize(){var dpr=Math.min(window.devicePixelRatio||1,2);actW=actCv.clientWidth||window.innerWidth;actH=actCv.clientHeight||window.innerHeight;
  actCv.width=Math.round(actW*dpr);actCv.height=Math.round(actH*dpr);actG.setTransform(dpr,0,0,dpr,0,0);AREA={x:-1};updArea();}
window.addEventListener("resize",function(){if(!actEl.hidden)actSize();});
function actFrame(ts){AS.raf=requestAnimationFrame(actFrame);var t=reduce?0:ts/1000;updArea();actG.clearRect(0,0,actW,actH);SCENES[AS.i](actG,actW,actH,AREA,t);confettiDraw(actG);}
var dotsBox=$("#actDots");
STAGES.forEach(function(s,i){var li=document.createElement("li"),b=document.createElement("button");b.type="button";b.textContent=toAr(i+1);b.setAttribute("aria-label","المرحلة "+toAr(i+1)+": "+s.t);
  b.addEventListener("click",function(){setStage(i);});li.appendChild(b);dotsBox.appendChild(li);});
function setRole(r){AS.role=r;$("#roleSt").setAttribute("aria-selected",r==="st"?"true":"false");$("#roleTe").setAttribute("aria-selected",r==="te"?"true":"false");
  var s=STAGES[AS.i];$("#actRole").innerHTML='<ul>'+liList(r==="st"?s.st:s.te)+'</ul>';}
$("#roleSt").addEventListener("click",function(){setRole("st");});$("#roleTe").addEventListener("click",function(){setRole("te");});
function setStage(i){AS.i=i;AS.seen[i]=true;AS.t0=performance.now();var s=STAGES[i];
  $("#actKicker").textContent="المرحلة "+toAr(i+1)+" من "+toAr(STAGES.length);
  $("#actTitle").textContent=s.t;$("#actMeta").innerHTML=s.s+". المواد: "+s.mat+".";
  actOv.innerHTML=TRY[i].ov();$("#actTry").innerHTML=TRY[i].html();TRY[i].wire();setRole(AS.role);
  $("#actProcBody").innerHTML=s.proc;$("#actProc").open=false;
  Array.prototype.forEach.call(dotsBox.querySelectorAll("button"),function(b,j){b.classList.toggle("seen",!!AS.seen[j]&&j!==i);if(j===i)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");});
  $("#actPrev").disabled=i===0;$("#actNext").textContent=i<STAGES.length-1?"المرحلة التالية":(AS.done?"عودة إلى المدار":"أنهِ النشاط");
  if(lenA)lenA.scrollTo(0,{immediate:true});else $("#actScroll").scrollTop=0;actCard.classList.remove("swap");void actCard.offsetWidth;actCard.classList.add("swap");
  var fl=$("#actFlash");if(!reduce){fl.classList.remove("go");void fl.offsetWidth;fl.classList.add("go");}
  AS.conf=[];actFx(i);if(typeof sfx==="function")sfx("whoosh");}
$("#actPrev").addEventListener("click",function(){if(AS.i>0)setStage(AS.i-1);});
$("#actNext").addEventListener("click",function(){if(AS.i<STAGES.length-1){setStage(AS.i+1);return;}
  if(AS.done){closeAct();return;}AS.done=true;showEnd();burst(160);sfx("win");$("#actNext").textContent="عودة إلى المدار";});
function openAct(i){actReturn=document.activeElement;if(sheetOpen)closePanel();running=false;actEl.hidden=false;actSize();setStage(i||0);
  cancelAnimationFrame(AS.raf);AS.raf=requestAnimationFrame(actFrame);setTimeout(function(){$("#actTitle").focus({preventScroll:true});},40);}
function closeAct(){cancelAnimationFrame(AS.raf);actEl.hidden=true;running=true;last=performance.now();if(actReturn&&actReturn.focus&&document.contains(actReturn))actReturn.focus({preventScroll:true});}
$("#actClose").addEventListener("click",function(){closeAct();});
$("#actBtn").addEventListener("click",function(){openAct(0);});
