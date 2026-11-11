/* ---------------- iPhone / iPad: world-tracked AR in Safari with the 8th Wall engine (SLAM) ----------------
   Safari on iOS has no WebXR. The 8th Wall Distributed Engine Binary (© Niantic Spatial, limited-use licence)
   tracks the room with the camera, so the island stays fixed on the bed or table while the student walks
   around it, and every station stays tappable: a tap opens its page, panel or game exactly as on the island. */
var AR8={on:false,loading:false,scene:null,cam:null,ret:null,ground:null,ray:new THREE.Raycaster(),c:new THREE.Vector2(),aim:null};
var ar8canvas=document.createElement("canvas");ar8canvas.id="ar8canvas";
ar8canvas.style.cssText="position:fixed;inset:0;width:100%;height:100%;z-index:1;display:none;touch-action:none";
document.body.insertBefore(ar8canvas,document.body.firstChild);
var ar8badge=document.createElement("a");ar8badge.id="ar8badge";ar8badge.href="https://github.com/8thwall/engine/blob/main/LICENSE";ar8badge.target="_blank";ar8badge.rel="noopener";
ar8badge.textContent="الواقع المعزز: 8th Wall Engine © Niantic Spatial";ar8badge.hidden=true;
ar8badge.style.cssText="position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);z-index:7;font:600 11px/1.3 'Readex Pro',sans-serif;color:#fff;background:rgba(0,0,0,.45);padding:3px 8px;border-radius:8px;text-decoration:none;pointer-events:auto";
document.body.appendChild(ar8badge);
function loadScript(src){return new Promise(function(ok,no){var s=document.createElement("script");s.src=src;s.crossOrigin="anonymous";s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function ar8Engine(){
  if(window.XR8)return Promise.resolve();
  var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js";s.async=true;s.crossOrigin="anonymous";s.setAttribute("data-preload-chunks","slam");
  return new Promise(function(ok,no){window.addEventListener("xrloaded",function(){ok();},{once:true});s.onerror=no;document.head.appendChild(s);
    setTimeout(function(){if(!window.XR8)no(new Error("timeout"));},45000);}).then(function(){return window.XRExtras?0:loadScript("https://cdn.jsdelivr.net/npm/@8thwall/xrextras@1/dist/xrextras.js");});
}
function ar8Module(){return{name:"weatherisland",
  onStart:function(){var x=XR8.Threejs.xrScene();AR8.scene=x.scene;AR8.cam=x.camera;
    x.renderer.outputEncoding=renderer.outputEncoding;
    AR8.scene.add(new THREE.HemisphereLight(0xffffff,0x9a8a7a,1.05));var dl=new THREE.DirectionalLight(0xffffff,.85);dl.position.set(2,5,3);AR8.scene.add(dl);
    AR8.ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({visible:false}));AR8.scene.add(AR8.ground);
    AR8.ret=new THREE.Group();var r1=new THREE.Mesh(new THREE.RingGeometry(.09,.115,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xFFC93C}));
    var r2=new THREE.Mesh(new THREE.CircleGeometry(.09,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35}));AR8.ret.add(r1,r2);AR8.scene.add(AR8.ret);
    scene.remove(stage);AR8.scene.add(stage);sea.visible=false;arSea.visible=arRim.visible=true;dhow.position.set(6.6,-.24,-5.6);
    stage.visible=false;placedAR=false;
    AR8.cam.position.set(0,1.2,0);
    XR8.XrController.updateCameraProjectionMatrix({origin:AR8.cam.position,facing:AR8.cam.quaternion});
    xrHint("وجّه الكاميرا إلى السرير أو الطاولة وحرّكها قليلًا حتى تظهر الدائرة الصفراء، ثم اضغط على الشاشة لتضع الجزيرة");},
  onUpdate:function(){if(!AR8.cam||placedAR){if(AR8.ret)AR8.ret.visible=false;return;}
    AR8.c.set(0,-.15);AR8.ray.setFromCamera(AR8.c,AR8.cam);var h=AR8.ray.intersectObject(AR8.ground)[0];
    AR8.ret.visible=!!h;if(h){AR8.ret.position.copy(h.point);AR8.aim=h.point.clone();}},
  onCameraStatusChange:function(e){if(e.status==="failed"){ar8Fail();}}};}
function ar8Place(){if(!AR8.aim)return;stage.position.copy(AR8.aim);stage.position.y+=.28*arScale;
  var cp=AR8.cam.position;stage.rotation.set(0,Math.atan2(cp.x-stage.position.x,cp.z-stage.position.z),0);
  stage.visible=true;placedAR=true;AR8.ret.visible=false;document.body.classList.add("placed");xrHint("");sfx("start");
  if(G&&!reduce){stage.scale.setScalar(arScale*.2);G.to(stage.scale,{x:arScale,y:arScale,z:arScale,duration:.9,ease:"elastic.out(1,.6)"});}else stage.scale.setScalar(arScale);
  toast("ثبّتّ الجزيرة على السطح. امشِ حولها، واضغط على أي مجسم لتفتحه، واسحب لتدويرها، وقرّب إصبعين أو باعدهما لتصغيرها أو تكبيرها.");}
function startAR8(){if(AR8.on||AR8.loading)return;AR8.loading=true;toast("جاري تشغيل الواقع المعزز… اسمح باستخدام الكاميرا والحركة.");
  if(sheetOpen)closePanel();
  var perm=(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==="function")?DeviceMotionEvent.requestPermission().catch(function(){}):Promise.resolve();
  perm.then(ar8Engine).then(function(){
    AR8.loading=false;AR8.on=true;window.__AR8on=true;ar8canvas.style.display="block";ar8badge.hidden=false;
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
  sea.visible=true;arSea.visible=arRim.visible=false;dhow.position.copy(dhowHome);placedAR=false;
  document.body.classList.remove("xr","ar","placed");xrbar.hidden=true;xrHint("");camBtn.setAttribute("aria-pressed","false");setFog();resize();}
function ar8Fail(){var was=AR8.on;stopAR8();
  if(QL){toast("تعذّر تتبّع المكان على هذا الجهاز، فسأفتح الجزيرة بعارض أبل.");setTimeout(openQL,700);}
  else toast("تعذّر تشغيل الواقع المعزز على هذا الجهاز. جرّب Safari على الآيفون أو Chrome على أندرويد.");}
/* the shared code asks PC() for the camera that draws the AR view (labels, picking) */
var _PC=PC;PC=function(){return AR8.on&&AR8.cam?AR8.cam:_PC();};
var _setRay=setRay;setRay=function(n){if(AR8.on&&AR8.cam){ray.setFromCamera(n,AR8.cam);return;}_setRay(n);};
/* touch on the AR view: first tap places the island; then tap opens a station, drag turns, pinch resizes */
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
/* the AR toolbar works in this mode too */
$("#xrExit").addEventListener("click",function(e){if(AR8.on){e.stopImmediatePropagation();stopAR8();}},true);
$("#xrMove").addEventListener("click",function(e){if(AR8.on){e.stopImmediatePropagation();placedAR=false;stage.visible=false;document.body.classList.remove("placed");
  xrHint("وجّه الكاميرا إلى المكان الجديد حتى تظهر الدائرة الصفراء، ثم اضغط على الشاشة");}},true);
/* games and the 360 tour open as full pages: leave AR first so the camera is released */
var _openAct8=openAct;openAct=function(i){if(AR8.on){stopAR8();setTimeout(function(){_openAct8(i);},60);return;}_openAct8(i);};
var _openPano8=openPano;openPano=function(){if(AR8.on){stopAR8();setTimeout(_openPano8,60);return;}_openPano8();};
/* iPhone: the AR button starts tracked AR (8th Wall); Quick Look stays as the fallback */
if(QL){camBtn.addEventListener("click",function(e){if(xrOK||xrSession||stream)return;e.stopImmediatePropagation();if(AR8.on)stopAR8();else startAR8();},true);}
