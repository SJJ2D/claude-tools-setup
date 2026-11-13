(function(){
'use strict';
/* ================= helpers ================= */
var $=function(s){return document.querySelector(s);};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};
var ERR=[];
window.addEventListener('error',function(e){ERR.push(String(e.message||e));});
window.addEventListener('unhandledrejection',function(e){ERR.push('rej:'+String(e.reason&&e.reason.message||e.reason));});
var mq=matchMedia('(prefers-reduced-motion: reduce)');
var RM=mq.matches; try{mq.addEventListener('change',function(e){RM=e.matches;});}catch(_){}
var SPEED=1;
function D(ms){return Math.max(1,ms*SPEED);}
function wait(ms){return new Promise(function(r){setTimeout(r,D(ms));});}
function AR(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d];});}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function lerp(a,b,t){return a+(b-a)*t;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function now(){return performance.now();}
var store={get:function(k,d){try{var v=localStorage.getItem('rfs_'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:function(k,v){try{localStorage.setItem('rfs_'+k,JSON.stringify(v));}catch(e){}}};
var DEG=Math.PI/180;

/* easing: cubic-bezier solved by bisection */
function bez(x1,y1,x2,y2){var cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
  function sx(t){return((ax*t+bx)*t+cx)*t;} function sy(t){return((ay*t+by)*t+cy)*t;}
  return function(x){if(x<=0)return 0;if(x>=1)return 1;var lo=0,hi=1,t=x;for(var i=0;i<26;i++){t=(lo+hi)/2;if(sx(t)<x)lo=t;else hi=t;}return sy(t);};}
var EIN=bez(.16,1,.3,1),EOUT=bez(.7,0,.84,0),EMOVE=bez(.65,0,.35,1),EPOP=bez(.34,1.56,.64,1);
var CIN='cubic-bezier(.16,1,.3,1)',COUT='cubic-bezier(.7,0,.84,0)',CMOVE='cubic-bezier(.65,0,.35,1)',CPOP='cubic-bezier(.34,1.56,.64,1)';

var tweens=[];
function tween(dur,ease,fn,key){
  if(key){tweens.forEach(function(t){if(t.key===key)t.dead=true;});}
  return new Promise(function(res){tweens.push({t0:now(),dur:D(dur),ease:ease,fn:fn,res:res,key:key});});
}
function stepTweens(t){
  for(var i=tweens.length-1;i>=0;i--){var tw=tweens[i];
    if(tw.dead){tweens.splice(i,1);tw.res();continue;}
    var p=(t-tw.t0)/tw.dur; if(p>=1)p=1; if(p<0)p=0;
    tw.fn(tw.ease(p)); if(p>=1){tweens.splice(i,1);tw.res();}}
}
function anim(el,frames,dur,easing,extra){
  if(!el||!el.animate)return Promise.resolve();
  var o={duration:D(dur),easing:easing||CIN,fill:'both'}; if(extra)for(var k in extra)o[k]=extra[k];
  var a=el.animate(frames,o); return a.finished.then(function(){return a;},function(){return a;});
}

/* ================= content ================= */
var PLANETS=[
 {id:'mercury',name:'عطارد',f:0,size:.24,tilt:.03,spin:.25,
  fact:'عطارد أقرب الكواكب إلى الشمس وأصغرها، وسطحه صخري مليء بالحُفر.',
  look:'صغير رمادي، سطحه مليء بالحُفر',dot:'#d9d4cf'},
 {id:'venus',name:'الزهرة',f:1,size:.38,tilt:.05,spin:.12,
  fact:'الزهرة الكوكب الثاني من الشمس، تغطيها غيوم صفراء كثيفة، وهي أشد الكواكب حرارة.',
  look:'صفراء فاتحة تغطيها الغيوم',dot:'#fff1c4'},
 {id:'earth',name:'الأرض',f:1,size:.40,tilt:.41,spin:.5,
  fact:'الأرض الكوكب الثالث من الشمس، وهي بيتنا! فيها محيطات زرقاء ويابسة وهواء نتنفسه.',
  look:'زرقاء فيها محيطات ويابسة خضراء وغيوم بيضاء',dot:'#bfe0ff'},
 {id:'mars',name:'المريخ',f:0,size:.30,tilt:.44,spin:.48,
  fact:'المريخ الكوكب الرابع من الشمس، ويسمّى الكوكب الأحمر لأن تربته حمراء تشبه الصدأ.',
  look:'أحمر برتقالي يشبه لون الصدأ',dot:'#ffb08a'},
 {id:'jupiter',name:'المشتري',f:0,size:.85,tilt:.05,spin:.9,
  fact:'المشتري الكوكب الخامس من الشمس، وهو أكبر الكواكب، فيه أحزمة ملوّنة وبقعة حمراء كبيرة هي عاصفة ضخمة.',
  look:'أكبر الكواكب، فيه أحزمة ملوّنة وبقعة حمراء',dot:'#ffe6c4'},
 {id:'saturn',name:'زحل',f:0,size:.70,tilt:.47,spin:.8,
  fact:'زحل الكوكب السادس من الشمس، تحيط به حلقات جميلة من الجليد والصخور.',
  look:'تحيط به حلقات واسعة جميلة',dot:'#fff0c8'},
 {id:'uranus',name:'أورانوس',f:0,size:.52,tilt:1.71,spin:.6,
  fact:'أورانوس الكوكب السابع من الشمس، لونه أزرق مخضرّ فاتح، ويدور وهو مائل على جنبه.',
  look:'أزرق مخضرّ فاتح، حوله حلقة باهتة',dot:'#c8fbff'},
 {id:'neptune',name:'نبتون',f:0,size:.50,tilt:.49,spin:.6,
  fact:'نبتون الكوكب الثامن والأبعد عن الشمس، لونه أزرق داكن، ورياحه أقوى رياح في النظام الشمسي.',
  look:'أزرق داكن',dot:'#9fbaff'}
];
var OTHERS=[
 {id:'moon',name:'القمر',f:0,size:.19,tilt:.1,spin:.2,other:1,why:'القمر ليس كوكبًا؛ إنه يدور حول الأرض ويتبعها.'},
 {id:'probe',name:'مسبار الفضاء',f:0,size:.32,tilt:0,spin:.4,other:1,why:'مسبار الفضاء ليس كوكبًا؛ إنه آلة صنعها الإنسان وأطلقها من الأرض لتستكشف الفضاء.'}
];
var ALL=PLANETS.concat(OTHERS); var BY={}; ALL.forEach(function(b,i){BY[b.id]=b;b.idx=i;});
var ORD=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن'];
var SUITS=[{n:'البرتقالية',c:'#ff8a1f',d:'#c85a00'},{n:'الزرقاء',c:'#2f8cff',d:'#1a56b8'},{n:'البنفسجية',c:'#a05cff',d:'#6a2fc0'},{n:'الخضراء',c:'#22c872',d:'#138a4c'}];
function THIS(p){return p.f?'هذه':'هذا';}
function countPlanets(n){ if(n===1)return 'كوكبًا واحدًا'; if(n===2)return 'كوكبين'; return AR(n)+' '+(n<=10?'كواكب':'كوكبًا'); }

/* ================= state ================= */
var S={name:'',suit:0,stars:0,shown:0,sound:store.get('sound',true),music:store.get('music',true),
  s1:null,s2:null,s3:null,nb:{placed:{},seen:{}},result:null};
var cur='title';

/* ================= sound & speech ================= */
function snd(n,v,r){ if(!S.sound||!window.SFX)return; try{SFX.play(n,v,r);}catch(e){} }
var unlocked=false;
function unlock(){ if(unlocked)return; unlocked=true; try{SFX.unlock(); if(S.music)SFX.music(true);}catch(e){} }
document.addEventListener('pointerdown',unlock,true); document.addEventListener('keydown',unlock,true);
var arVoice=null;
function pickVoice(){ try{var vs=speechSynthesis.getVoices()||[]; arVoice=null; for(var i=0;i<vs.length;i++){ if(/^ar([-_]|$)/i.test(vs[i].lang)){arVoice=vs[i];break;} } }catch(e){arVoice=null;} document.body.classList.toggle('tts',!!arVoice); }
if('speechSynthesis' in window){ pickVoice(); try{speechSynthesis.addEventListener('voiceschanged',pickVoice);}catch(e){} }
function speak(text){ if(!arVoice)return; try{speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(text); u.voice=arVoice; u.lang=arVoice.lang; u.rate=.9; speechSynthesis.speak(u);}catch(e){} }
function stopSpeak(){ try{ if('speechSynthesis' in window)speechSynthesis.cancel(); }catch(e){} }

/* ================= SVG art ================= */
var ROBOT='<svg viewBox="0 0 100 100" aria-hidden="true">'+
 '<line x1="50" y1="10" x2="50" y2="22" stroke="#9aa8e8" stroke-width="3.5" stroke-linecap="round"/>'+
 '<circle class="rb-ant" cx="50" cy="8" r="6.5" fill="#ffd23f"/>'+
 '<rect x="6" y="42" width="11" height="22" rx="5.5" fill="#ff8a3d"/><rect x="83" y="42" width="11" height="22" rx="5.5" fill="#ff8a3d"/>'+
 '<rect x="13" y="20" width="74" height="64" rx="25" fill="url(#gRbHead)" stroke="#8fa0ee" stroke-width="2"/>'+
 '<rect x="21" y="29" width="58" height="42" rx="17" fill="#16204f"/>'+
 '<g class="rb-eyes"><rect class="eye" x="33" y="38" width="11" height="15" rx="5.5" fill="#4ff0ff"/><rect class="eye" x="56" y="38" width="11" height="15" rx="5.5" fill="#4ff0ff"/></g>'+
 '<g class="rb-happy" fill="none" stroke="#4ff0ff" stroke-width="4.5" stroke-linecap="round"><path d="M32 50q6.5-9 13 0M55 50q6.5-9 13 0"/></g>'+
 '<g class="rb-think" fill="#4ff0ff"><rect x="33" y="43" width="11" height="9" rx="4.5"/><rect x="56" y="38" width="11" height="14" rx="5.5"/></g>'+
 '<path d="M41 60q9 7 18 0" stroke="#4ff0ff" stroke-width="3.5" fill="none" stroke-linecap="round"/>'+
 '<circle cx="24" cy="76" r="3.6" fill="#ff8fc0"/><circle cx="76" cy="76" r="3.6" fill="#ff8fc0"/>'+
 '<rect x="31" y="86" width="38" height="11" rx="5.5" fill="#8a97e6"/></svg>';
function astroSVG(i){var s=SUITS[i];return '<svg viewBox="0 0 120 150" aria-hidden="true">'+
 '<rect x="27" y="60" width="66" height="54" rx="16" fill="'+s.d+'"/>'+
 '<g fill="'+s.c+'"><rect x="18" y="68" width="18" height="40" rx="9" transform="rotate(16 27 72)"/><rect x="84" y="68" width="18" height="40" rx="9" transform="rotate(-16 93 72)"/>'+
 '<rect x="38" y="102" width="19" height="32" rx="8"/><rect x="63" y="102" width="19" height="32" rx="8"/></g>'+
 '<circle cx="18" cy="104" r="9" fill="#f4f6ff"/><circle cx="102" cy="104" r="9" fill="#f4f6ff"/>'+
 '<rect x="34" y="128" width="26" height="14" rx="7" fill="#e3e7ff"/><rect x="60" y="128" width="26" height="14" rx="7" fill="#e3e7ff"/>'+
 '<rect x="33" y="62" width="54" height="52" rx="18" fill="'+s.c+'"/>'+
 '<rect x="45" y="78" width="30" height="19" rx="5" fill="#ffffff" opacity=".94"/>'+
 '<circle cx="52" cy="87.5" r="3.6" fill="#ff4f6d"/><circle cx="60" cy="87.5" r="3.6" fill="#ffd23f"/><circle cx="68" cy="87.5" r="3.6" fill="#35d07f"/>'+
 '<circle cx="60" cy="37" r="32" fill="#f4f6ff" stroke="#c9d1ff" stroke-width="3"/>'+
 '<rect x="35" y="21" width="50" height="34" rx="17" fill="url(#gVisor)"/>'+
 '<path d="M43 31q8-7 19-6" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".75"/>'+
 '<circle cx="89" cy="18" r="4.5" fill="'+s.c+'"/></svg>';}
function rocketSVG(i){var s=SUITS[i];return '<svg viewBox="0 0 100 200" aria-hidden="true">'+
 '<path class="flame" d="M35 146 Q50 222 65 146 Q50 156 35 146Z" fill="url(#gFlame)"/>'+
 '<path d="M30 104 L8 146 L33 138Z" fill="'+s.c+'"/><path d="M70 104 L92 146 L67 138Z" fill="'+s.c+'"/>'+
 '<path d="M50 6 C77 30 79 82 72 140 L28 140 C21 82 23 30 50 6Z" fill="url(#gRocket)" stroke="#9aa3d6" stroke-width="2"/>'+
 '<path d="M50 6 C62 17 68 28 71 40 L29 40 C32 28 38 17 50 6Z" fill="'+s.c+'"/>'+
 '<rect x="35" y="138" width="30" height="11" rx="4" fill="#6c74a8"/>'+
 '<circle cx="50" cy="74" r="16" fill="#1b2a72" stroke="'+s.c+'" stroke-width="5"/>'+
 '<circle cx="50" cy="77" r="10" fill="#f4f6ff"/><rect x="43.5" y="72" width="13" height="8" rx="4" fill="url(#gVisor)"/>'+
 '<path d="M50 112 L50 138" stroke="'+s.c+'" stroke-width="6" stroke-linecap="round"/></svg>';}
var ICONS={
 orbits:'<svg viewBox="0 0 72 72"><ellipse cx="36" cy="38" rx="31" ry="13" fill="none" stroke="#9fb0ff" stroke-width="2"/><ellipse cx="36" cy="38" rx="21" ry="9" fill="none" stroke="#9fb0ff" stroke-width="2"/><circle cx="36" cy="38" r="8" fill="#ffc02e"/><circle cx="36" cy="38" r="12" fill="#ffc02e" opacity=".25"/><circle cx="57" cy="32" r="4.5" fill="#3fa0ff"/><circle cx="12" cy="44" r="6" fill="#ff9a5a"/><circle cx="22" cy="31" r="3" fill="#ff5a3c"/></svg>',
 scope:'<svg viewBox="0 0 72 72"><circle cx="54" cy="16" r="3" fill="#ffd23f"/><circle cx="62" cy="30" r="2" fill="#fff"/><g transform="rotate(-28 36 36)"><rect x="14" y="26" width="40" height="14" rx="5" fill="#3fe6ff"/><rect x="50" y="23" width="10" height="20" rx="3" fill="#8a7dff"/><rect x="8" y="29" width="8" height="8" rx="2" fill="#c9d0ff"/></g><path d="M34 44 L24 64 M38 44 L46 64 M36 44 L36 62" stroke="#c9d0ff" stroke-width="3" stroke-linecap="round"/></svg>',
 design:'<svg viewBox="0 0 72 72"><rect x="10" y="12" width="46" height="50" rx="6" fill="#2d4bb8"/><path d="M10 24h46M10 36h46M10 48h46M22 12v50M34 12v50M46 12v50" stroke="#7aa0ff" stroke-width="1" opacity=".6"/><circle cx="18" cy="22" r="5" fill="#ffc02e"/><path d="M18 22 a20 20 0 0 1 20 20" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 3"/><circle cx="38" cy="42" r="4" fill="#ff7ab6"/><g transform="rotate(40 50 40)"><rect x="46" y="18" width="9" height="36" rx="2" fill="#ffd23f"/><path d="M46 54 L50.5 62 L55 54Z" fill="#ffe7b0"/></g></svg>',
 teacher:'<svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="50" fill="#ff7ab6" opacity=".2"/><circle cx="55" cy="55" r="40" fill="#2a1f7a" stroke="#ff9ac8" stroke-width="4"/><path d="M40 30h30M40 80h30" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/><path d="M43 31c0 14 24 14 24 24s-24 10-24 24h24c0-14-24-14-24-24s24-10 24-24z" fill="#3fe6ff" opacity=".35" stroke="#c9f6ff" stroke-width="2.5" stroke-linejoin="round"/><path d="M49 74h12l-6-7z" fill="#ffd23f"/></svg>'
};
function fillArt(){
  $$('[data-bot]').forEach(function(el){el.innerHTML=ROBOT;});
  $$('[data-icon]').forEach(function(el){el.innerHTML=ICONS[el.getAttribute('data-icon')]||'';});
  $('#titleAstro').innerHTML=astroSVG(0);
}

/* ================= procedural textures ================= */
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function Noise(seed){
  var r=rng(seed),perm=new Uint8Array(512),val=new Float32Array(256),p=[],i;
  for(i=0;i<256;i++)p.push(i);
  for(i=255;i>0;i--){var j=Math.floor(r()*(i+1));var t=p[i];p[i]=p[j];p[j]=t;}
  for(i=0;i<512;i++)perm[i]=p[i&255]; for(i=0;i<256;i++)val[i]=r();
  function n(x,y,z){var X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z);x-=X;y-=Y;z-=Z;var xi=X&255,yi=Y&255,zi=Z&255;
    var u=x*x*(3-2*x),v=y*y*(3-2*y),w=z*z*(3-2*z);
    var a=perm[xi]+yi,aa=perm[a]+zi,ab=perm[a+1]+zi,b=perm[xi+1]+yi,ba=perm[b]+zi,bb=perm[b+1]+zi;
    var x1=val[perm[aa]]+(val[perm[ba]]-val[perm[aa]])*u, x2=val[perm[ab]]+(val[perm[bb]]-val[perm[ab]])*u;
    var x3=val[perm[aa+1]]+(val[perm[ba+1]]-val[perm[aa+1]])*u, x4=val[perm[ab+1]]+(val[perm[bb+1]]-val[perm[ab+1]])*u;
    var y1=x1+(x2-x1)*v, y2=x3+(x4-x3)*v; return y1+(y2-y1)*w;}
  function fbm(x,y,z,o){var s=0,a=.5,f=1,t=0;for(var k=0;k<o;k++){s+=a*n(x*f,y*f,z*f);t+=a;a*=.5;f*=2;}return s/t;}
  return {n:n,fbm:fbm};
}
function hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function mix(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function sst(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
function pal(st,t){t=clamp(t,0,1)*(st.length-1);var i=Math.min(st.length-2,Math.floor(t));return mix(st[i],st[i+1],t-i);}
function put(o,c){o[0]=c[0];o[1]=c[1];o[2]=c[2];}
function craterSet(seed,n,mn,mx){var r=rng(seed),a=[];for(var i=0;i<n;i++){var u=r()*2-1,th=r()*Math.PI*2,s=Math.sqrt(1-u*u),rad=mn+(mx-mn)*Math.pow(r(),2);a.push([s*Math.cos(th),u,s*Math.sin(th),rad,Math.cos(rad*1.2)]);}return a;}
function craterShade(cr,x,y,z){var m=1;for(var i=0;i<cr.length;i++){var c=cr[i];var d=x*c[0]+y*c[1]+z*c[2];if(d<c[4])continue;var t=Math.acos(Math.min(1,d))/c[3];if(t<.82)m*=.8+.12*t;else if(t<1.12)m*=1.13;}return m;}
function paint(w,h,fn){
  var c=document.createElement('canvas');c.width=w;c.height=h;var ctx=c.getContext('2d');var img=ctx.createImageData(w,h);var d=img.data;var o=[0,0,0,255];
  for(var j=0;j<h;j++){var lat=(.5-(j+.5)/h)*Math.PI,cl=Math.cos(lat),sl=Math.sin(lat);
    for(var i=0;i<w;i++){var lon=(i+.5)/w*Math.PI*2;o[3]=255;fn(cl*Math.cos(lon),sl,cl*Math.sin(lon),lat,lon,o);var k=(j*w+i)*4;d[k]=o[0];d[k+1]=o[1];d[k+2]=o[2];d[k+3]=o[3];}}
  ctx.putImageData(img,0,0);return {canvas:c,data:d,w:w,h:h};
}
function angDiff(a,b){var d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}
var TEXD={};
function genTextures(){
  var N1=Noise(3),N2=Noise(11),N3=Noise(21),N4=Noise(31),N5=Noise(41),N6=Noise(51),N7=Noise(61),N8=Noise(71),N9=Noise(81),N10=Noise(91);
  var CR1=craterSet(5,70,.04,.2),CR2=craterSet(9,26,.03,.1),CR3=craterSet(13,90,.03,.16);
  var SUN=['#ff5a00','#ff8a14','#ffc23a','#fff0a0'].map(hex);
  TEXD.sun=paint(256,128,function(x,y,z,lat,lon,o){var v=N1.fbm(x*5,y*5,z*5,5),w=N1.fbm(x*16+3,y*16,z*16,3);put(o,pal(SUN,v*1.35-.2+(w-.5)*.5));});
  var ME=['#55514e','#8c8681','#c4bdb5'].map(hex);
  TEXD.mercury=paint(256,128,function(x,y,z,lat,lon,o){var v=N2.fbm(x*3,y*3,z*3,5);var c=pal(ME,v*1.4-.2);var m=craterShade(CR1,x,y,z);put(o,[c[0]*m,c[1]*m,c[2]*m]);});
  var VE=['#c98a3e','#e4bb72','#f4dea8','#fff3d6'].map(hex);
  TEXD.venus=paint(256,128,function(x,y,z,lat,lon,o){var w=N3.fbm(x*2,y*2,z*2,3);var v=N3.fbm(x*1.5+w*1.8,y*5+w*2.4,z*1.5,4);put(o,pal(VE,v*1.4-.15));});
  var OC1=hex('#3aa6ec'),OC2=hex('#0f3a96'),LG1=hex('#49a84f'),LG2=hex('#2e7a3a'),DS=hex('#d8b56e'),MT=hex('#8a7356');
  TEXD.earth=paint(384,192,function(x,y,z,lat,lon,o){var h=N4.fbm(x*1.7+2,y*1.7+1,z*1.7,6),al=Math.abs(lat);
    if(al>1.2+(N4.n(x*8,y*8,z*8)-.5)*.2){put(o,[236,244,252]);return;}
    if(h>.52){var t=clamp((h-.52)/.16,0,1);var c=mix(LG1,LG2,t);var dry=sst(.22,.45,al)*(1-sst(.6,.85,al));var dn=N4.n(x*5+7,y*5,z*5);if(dry*dn>.3)c=mix(c,DS,clamp((dry*dn-.3)*4,0,1));if(t>.6)c=mix(c,MT,(t-.6)*1.4);put(o,c);}
    else{put(o,mix(OC1,OC2,clamp((.52-h)*7,0,1)));}});
  TEXD.clouds=paint(384,192,function(x,y,z,lat,lon,o){var w=N5.fbm(x*2,y*2,z*2,3);var c=N5.fbm(x*2.5+w*1.6,y*5+w,z*2.5,5);o[0]=o[1]=o[2]=255;o[3]=sst(.52,.7,c)*235;});
  var MA=['#7e2a10','#bf4e1e','#e07a3c','#f2a46a'].map(hex),MD=hex('#5e2210');
  TEXD.mars=paint(256,128,function(x,y,z,lat,lon,o){var v=N6.fbm(x*2.2,y*2.2,z*2.2,6);var c=pal(MA,v*1.5-.2);var d=N6.fbm(x*1.1+5,y*1.1,z*1.1,3);if(d<.45)c=mix(c,MD,clamp((.45-d)*5,0,.8));var m=craterShade(CR2,x,y,z);c=[c[0]*m,c[1]*m,c[2]*m];var al=Math.abs(lat);if(al>1.3)c=mix(c,[248,242,236],sst(1.3,1.4,al));put(o,c);});
  var JP=['#f3e6cc','#d9a26a','#efd9b4','#b8652f','#e8c89a','#c98a52','#f6ecd8','#a95a2c'].map(hex),RS=hex('#c0482a'),RL=hex('#eaa477');
  TEXD.jupiter=paint(384,192,function(x,y,z,lat,lon,o){var t=N7.fbm(x*3,y*3,z*3,4);var n=JP.length;
    var b=(Math.sin(lat)*.5+.5)*n*1.15+(t-.5)*1.1+.06*N7.n(x*18,y*55,z*18);var idx=((b%n)+n)%n;var i=Math.floor(idx),f=idx-i;var c=mix(JP[i],JP[(i+1)%n],sst(0,1,f));
    var dl=angDiff(lon,4.2)*Math.cos(lat)/.21,dt=(lat+.36)/.085,e=dl*dl+dt*dt;if(e<1.7){var sp=e<1?mix(RS,RL,e*e*.7):RL;c=mix(c,sp,clamp((1.7-e)/.7,0,1));}put(o,c);});
  var SA=['#f2e3b3','#dcc07c','#f7ecc9','#c99f5a','#ead39a','#d8b878'].map(hex);
  TEXD.saturn=paint(256,128,function(x,y,z,lat,lon,o){var t=N8.fbm(x*3,y*3,z*3,3);var n=SA.length;var b=(Math.sin(lat)*.5+.5)*n*1.6+(t-.5)*.5;var idx=((b%n)+n)%n;var i=Math.floor(idx);put(o,mix(SA[i],SA[(i+1)%n],sst(0,1,idx-i)));});
  var U1=hex('#86d2de'),U2=hex('#c6f4f6');
  TEXD.uranus=paint(256,128,function(x,y,z,lat,lon,o){var v=.55+.05*Math.sin(lat*10)+(N9.fbm(x*2,y*6,z*2,3)-.5)*.18;put(o,mix(U1,U2,clamp(v,0,1)));});
  var NE=['#16307e','#2a56d6','#4c84f2'].map(hex),NS=hex('#132668');
  TEXD.neptune=paint(256,128,function(x,y,z,lat,lon,o){var t=N10.fbm(x*2.5,y*2.5,z*2.5,4);var c=pal(NE,(Math.sin(lat*7)*.5+.5)*.45+(t-.5)*.9+.35);
    var dl=angDiff(lon,1.6)*Math.cos(lat)/.18,dt=(lat+.35)/.08,e=dl*dl+dt*dt;if(e<1.4)c=mix(c,NS,clamp((1.4-e)/.6,0,1));
    var s=N10.n(x*5,y*28,z*5);if(s>.74&&Math.abs(lat-.3)<.14)c=mix(c,[235,242,255],(s-.74)*3);put(o,c);});
  var MO=['#717175','#a9a9a8','#d6d5d0'].map(hex),MM=hex('#68686d');
  TEXD.moon=paint(256,128,function(x,y,z,lat,lon,o){var v=N1.fbm(x*3+9,y*3,z*3,5);var c=pal(MO,v*1.3-.1);var m=N2.fbm(x*1.3+3,y*1.3,z*1.3,3);if(m<.44)c=mix(c,MM,clamp((.44-m)*6,0,.85));var k=craterShade(CR3,x,y,z);put(o,[c[0]*k,c[1]*k,c[2]*k]);});
}
function ringCanvas(kind){var c=document.createElement('canvas');c.width=256;c.height=4;var ctx=c.getContext('2d');
  for(var x=0;x<256;x++){var t=x/255,a,col;
    if(kind==='saturn'){a=.66+.18*Math.sin(t*19)+.08*Math.sin(t*47+1);if(t>.6&&t<.67)a*=.1;a*=sst(0,.07,t)*(1-sst(.93,1,t));col=mix(hex('#cbb07a'),hex('#f5e7c4'),.5+.5*Math.sin(t*23));}
    else{a=(Math.exp(-Math.pow((t-.5)/.12,2)))*.7;col=[210,245,250];}
    ctx.fillStyle='rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+','+clamp(a,0,1).toFixed(3)+')';ctx.fillRect(x,0,1,4);}
  return c;}

/* ---- 2D sphere thumbnails (used by cards, tray, notebook, results) ---- */
var THUMB={},THUMBC={};
function sphereInto(ctx,T,cx,cy,R,opt){
  var size=Math.ceil(R*2)+4,tc=document.createElement('canvas');tc.width=tc.height=size;var tx=tc.getContext('2d');var img=tx.createImageData(size,size),d=img.data;
  var L=[.5,-.42,.76],ll=Math.hypot(L[0],L[1],L[2]);L=[L[0]/ll,L[1]/ll,L[2]/ll];
  var tilt=opt.tilt||-.32,ct=Math.cos(tilt),st=Math.sin(tilt),lon0=opt.lon0||0,atm=opt.atm,c0=size/2;
  for(var py=0;py<size;py++)for(var px=0;px<size;px++){
    var nx=(px+.5-c0)/R,ny=(py+.5-c0)/R,d2=nx*nx+ny*ny;if(d2>1.04)continue;
    var dd=Math.sqrt(d2),edge=clamp((1-dd)*R+.6,0,1),nz=Math.sqrt(Math.max(0,1-Math.min(d2,1)));
    var y2=ny*ct-nz*st,z2=ny*st+nz*ct;var lat=Math.asin(clamp(-y2,-1,1)),lon=Math.atan2(nx,z2)+lon0;
    var u=((lon/(Math.PI*2))%1+1)%1,v=clamp(.5-lat/Math.PI,0,.999);var ti=(Math.floor(v*T.h)*T.w+Math.floor(u*T.w))*4;
    var dif=Math.max(0,nx*L[0]+ny*L[1]+nz*L[2]);var sh=.32+.86*dif;
    var r=T.data[ti]*sh,g=T.data[ti+1]*sh,b=T.data[ti+2]*sh;
    if(opt.clouds){var ca=opt.clouds.data[ti+3]/255*.9;r=lerp(r,255*sh,ca);g=lerp(g,255*sh,ca);b=lerp(b,255*sh,ca);}
    if(atm){var rim=Math.pow(1-nz,2.6)*.85;r+=atm[0]*rim;g+=atm[1]*rim;b+=atm[2]*rim;}
    var k=(py*size+px)*4;d[k]=r;d[k+1]=g;d[k+2]=b;d[k+3]=255*edge;}
  tx.putImageData(img,0,0);ctx.drawImage(tc,cx-c0,cy-c0);
}
function ringInto(ctx,cx,cy,R,rc,front,squash,rot,i0,i1,alphaMul){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.beginPath();if(front)ctx.rect(-R*3,0,R*6,R*3);else ctx.rect(-R*3,-R*3,R*6,R*3);ctx.clip();
  var rctx=rc.getContext('2d'),rd=rctx.getImageData(0,0,256,1).data;
  for(var k=0;k<=40;k++){var t=k/40,rr=R*(i0+(i1-i0)*t),pi=Math.min(255,Math.round(t*255))*4;
    ctx.strokeStyle='rgba('+rd[pi]+','+rd[pi+1]+','+rd[pi+2]+','+(rd[pi+3]/255*alphaMul).toFixed(3)+')';ctx.lineWidth=R*(i1-i0)/40+1;
    ctx.beginPath();ctx.ellipse(0,0,rr,rr*squash,0,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}
function drawProbe(ctx,s){
  ctx.save();ctx.translate(s/2,s/2);ctx.rotate(-.35);var u=s/100;
  ctx.strokeStyle='#c9d0ff';ctx.lineWidth=3*u;ctx.beginPath();ctx.moveTo(-40*u,0);ctx.lineTo(40*u,0);ctx.stroke();
  [-1,1].forEach(function(sd){ctx.fillStyle='#2f5fe0';ctx.fillRect(sd>0?14*u:-46*u,-11*u,32*u,22*u);ctx.strokeStyle='#9fc0ff';ctx.lineWidth=1.2*u;
    for(var g=0;g<4;g++){var x0=(sd>0?14:-46)*u+g*8*u;ctx.beginPath();ctx.moveTo(x0,-11*u);ctx.lineTo(x0,11*u);ctx.stroke();}
    ctx.beginPath();ctx.moveTo((sd>0?14:-46)*u,0);ctx.lineTo((sd>0?46:-14)*u,0);ctx.stroke();});
  var gr=ctx.createLinearGradient(-12*u,-12*u,12*u,12*u);gr.addColorStop(0,'#ffe08a');gr.addColorStop(1,'#c88a12');ctx.fillStyle=gr;
  ctx.beginPath();ctx.roundRect?ctx.roundRect(-13*u,-13*u,26*u,26*u,4*u):ctx.rect(-13*u,-13*u,26*u,26*u);ctx.fill();
  ctx.fillStyle='#f1f3ff';ctx.beginPath();ctx.ellipse(0,-22*u,17*u,7*u,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#aab3e6';ctx.lineWidth=1.5*u;ctx.stroke();
  ctx.strokeStyle='#f1f3ff';ctx.lineWidth=2*u;ctx.beginPath();ctx.moveTo(0,-22*u);ctx.lineTo(0,-34*u);ctx.stroke();ctx.fillStyle='#ff5a6e';ctx.beginPath();ctx.arc(0,-35*u,3*u,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function bestEarthLon(){var T=TEXD.earth,best=0,bs=-1;for(var k=0;k<16;k++){var l0=k/16*Math.PI*2,s=0;for(var a=-1.2;a<=1.2;a+=.2)for(var b=-.8;b<=.8;b+=.2){var u=(((l0+a)/(Math.PI*2))%1+1)%1,v=.5-b/Math.PI;var ti=(Math.floor(v*T.h)*T.w+Math.floor(u*T.w))*4;if(T.data[ti+1]>T.data[ti+2])s++;}if(s>bs){bs=s;best=l0;}}return best;}
function genThumbs(){
  var size=160,earthLon=bestEarthLon();
  ALL.forEach(function(b){var c=document.createElement('canvas');c.width=c.height=size;var ctx=c.getContext('2d');
    if(b.id==='probe'){drawProbe(ctx,size);}
    else if(b.id==='saturn'){var R=size*.235,rc=ringCanvas('saturn');ringInto(ctx,size/2,size/2,R,rc,false,.34,-.32,1.25,2.05,1);sphereInto(ctx,TEXD.saturn,size/2,size/2,R,{tilt:-.3});ringInto(ctx,size/2,size/2,R,rc,true,.34,-.32,1.25,2.05,1);}
    else if(b.id==='uranus'){var R2=size*.38,rc2=ringCanvas('uranus');ringInto(ctx,size/2,size/2,R2,rc2,false,.22,1.35,1.12,1.26,1);sphereInto(ctx,TEXD.uranus,size/2,size/2,R2,{tilt:-.2,atm:[90,170,170]});ringInto(ctx,size/2,size/2,R2,rc2,true,.22,1.35,1.12,1.26,1);}
    else{var opt={};if(b.id==='earth'){opt.clouds=TEXD.clouds;opt.atm=[70,140,255];opt.lon0=earthLon;}if(b.id==='neptune')opt.atm=[80,120,255];if(b.id==='venus')opt.atm=[200,160,80];if(b.id==='jupiter')opt.lon0=4.2+Math.PI/2*0;
      sphereInto(ctx,TEXD[b.id],size/2,size/2,size*.42,opt);}
    THUMBC[b.id]=c;THUMB[b.id]=c.toDataURL('image/png');});
}

/* ================= three.js scene ================= */
var VW=innerWidth,VH=innerHeight,T=0;
var glOK=!!window.THREE,renderer,scene,camera;
var R0=2.45,STEP=1.08,SUN_R=1.3,FOV=40,FOV0=50,ZMAX=12;
function orbitR(i){return R0+i*STEP;}
function omega(i){return .42*Math.pow(R0/orbitR(i),1.5);}
var B={},ORB=[],solarGroup,skyGroup,sun,corona,corona2,stars,amb,sunLight,skyLight,MAT={},GEO={};
var solarMode='system',orbitSpeed=.6,hoverOrbit=-1,hintOrbit=-1,flash={};
var _v,_v2,ray,plane,ndc;

function canvasTex(c){var t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
function ringGeo(inner,outer,seg){var g=new THREE.RingGeometry(inner,outer,seg,1);var pos=g.attributes.position,uv=g.attributes.uv;for(var i=0;i<pos.count;i++){var r=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(r-inner)/(outer-inner),.5);}return g;}
function radialCanvas(stops,size){var c=document.createElement('canvas');c.width=c.height=size||256;var x=c.getContext('2d');var g=x.createRadialGradient(c.width/2,c.width/2,0,c.width/2,c.width/2,c.width/2);stops.forEach(function(s){g.addColorStop(s[0],s[1]);});x.fillStyle=g;x.fillRect(0,0,c.width,c.width);return c;}
function raysCanvas(){var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d');x.translate(128,128);var r=rng(7);
  for(var i=0;i<28;i++){var a=i/28*Math.PI*2+r()*.1,len=70+r()*55,w=.05+r()*.06;var g=x.createLinearGradient(0,0,Math.cos(a)*len,Math.sin(a)*len);g.addColorStop(0,'rgba(255,220,120,.55)');g.addColorStop(1,'rgba(255,150,40,0)');x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a-w)*len,Math.sin(a-w)*len);x.lineTo(Math.cos(a+w)*len,Math.sin(a+w)*len);x.closePath();x.fill();}
  return c;}
function bandCanvas(){var c=document.createElement('canvas');c.width=128;c.height=4;var x=c.getContext('2d');for(var i=0;i<128;i++){var t=i/127,a=Math.exp(-Math.pow((t-.5)/.2,2));x.fillStyle='rgba(255,255,255,'+a.toFixed(3)+')';x.fillRect(i,0,1,4);}return c;}
function labelCanvas(i){var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');
  x.clearRect(0,0,128,128);x.beginPath();x.arc(64,64,56,0,Math.PI*2);x.fillStyle='rgba(22,16,76,.92)';x.fill();x.lineWidth=7;x.strokeStyle='#b9c4ff';x.stroke();
  x.direction='rtl';x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.font='800 70px "Baloo Bhaijaan 2","Readex Pro",Tajawal,sans-serif';x.fillText(AR(i+1),64,72);return c;}
function atmMat(col,strength){return new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(col)},k:{value:strength||.85}},
  vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 c;uniform float k;varying vec3 vN;varying vec3 vV;void main(){float f=1.0-max(dot(normalize(vN),normalize(vV)),0.0);f=pow(f,2.2);gl_FragColor=vec4(c,f*k);}',
  transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});}
function makeProbe(){var g=new THREE.Group();
  var gold=new THREE.MeshPhongMaterial({color:0xe0b23a,shininess:70,specular:0x886622}),white=new THREE.MeshPhongMaterial({color:0xf1f3ff,shininess:30,side:THREE.DoubleSide}),blue=new THREE.MeshPhongMaterial({color:0x2f5fe0,shininess:60,specular:0x5577ff,emissive:0x0a1a50});
  var body=new THREE.Mesh(new THREE.BoxGeometry(.26,.2,.2),gold);g.add(body);
  var dish=new THREE.Mesh(new THREE.SphereGeometry(.2,24,10,0,Math.PI*2,0,1.0),white);dish.rotation.x=Math.PI;dish.position.y=.26;g.add(dish);
  var mast=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.2),white);mast.position.y=.16;g.add(mast);
  [-1,1].forEach(function(s){var p=new THREE.Mesh(new THREE.BoxGeometry(.46,.012,.2),blue);p.position.x=s*.38;g.add(p);var st=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.16),white);st.rotation.z=Math.PI/2;st.position.x=s*.13;g.add(st);});
  var ant=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),new THREE.MeshBasicMaterial({color:0xff5a6e}));ant.position.set(0,-.14,.0);g.add(ant);
  g.rotation.x=.5;return g;}
function makeBody(id){var d=BY[id];var g=new THREE.Group(),tilt=new THREE.Group();tilt.rotation.z=d.tilt||0;g.add(tilt);var spin;
  if(id==='probe'){spin=makeProbe();spin.scale.setScalar(1.15);tilt.add(spin);}
  else{spin=new THREE.Mesh(GEO.sph,MAT[id]);spin.scale.setScalar(d.size);tilt.add(spin);
    if(id==='earth'){var cl=new THREE.Mesh(GEO.sph,MAT.clouds);cl.scale.setScalar(1.025);spin.add(cl);}
    var atm={earth:[0x5aa8ff,.95],neptune:[0x5b84ff,.8],uranus:[0x8ff2ff,.6],venus:[0xffd890,.55]}[id];
    if(atm){var a=new THREE.Mesh(GEO.sph,atmMat(atm[0],atm[1]));a.scale.setScalar(d.size*1.07);tilt.add(a);}
    if(id==='saturn'||id==='uranus'){var ring=new THREE.Mesh(id==='saturn'?GEO.ringS:GEO.ringU,id==='saturn'?MAT.ringS:MAT.ringU);ring.rotation.x=-Math.PI/2;ring.scale.setScalar(d.size);tilt.add(ring);}}
  g.userData={spin:spin};return g;}
function starField(n,R,seed){var r=rng(seed),pos=new Float32Array(n*3),col=new Float32Array(n*3),sz=new Float32Array(n),ph=new Float32Array(n);
  var tints=[[1,1,1],[.8,.9,1],[1,.94,.78],[1,.8,.92],[.78,1,1]];
  for(var i=0;i<n;i++){var u=r()*2-1,t=r()*Math.PI*2,s=Math.sqrt(1-u*u);pos[i*3]=s*Math.cos(t)*R;pos[i*3+1]=u*R;pos[i*3+2]=s*Math.sin(t)*R;var c=tints[Math.floor(r()*5)];col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];sz[i]=1.2+Math.pow(r(),3)*4;ph[i]=r();}
  var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('acol',new THREE.BufferAttribute(col,3));g.setAttribute('asize',new THREE.BufferAttribute(sz,1));g.setAttribute('aph',new THREE.BufferAttribute(ph,1));
  var m=new THREE.ShaderMaterial({uniforms:{time:{value:0},pr:{value:1},tw:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'attribute vec3 acol;attribute float asize;attribute float aph;uniform float time;uniform float pr;uniform float tw;varying vec3 vC;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;float s=0.5+0.5*sin(time*(0.7+aph*1.9)+aph*6.283);vA=mix(1.0,0.45+0.55*s,tw);vC=acol;gl_PointSize=asize*pr*(0.85+0.25*s*tw);}',
    fragmentShader:'varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-vec2(0.5));float a=smoothstep(0.5,0.0,d);a=a*a;gl_FragColor=vec4(vC,a*vA);}'});
  var p=new THREE.Points(g,m);p.frustumCulled=false;return p;}

function initGL(){
  if(!glOK){$('#nogl').style.display='block';return;}
  try{renderer=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){glOK=false;$('#nogl').style.display='block';return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(VW,VH,false);renderer.setClearColor(0x000000,0);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(FOV,VW/VH,.05,1200);camera.rotation.order='YXZ';
  _v=new THREE.Vector3();_v2=new THREE.Vector3();ray=new THREE.Raycaster();plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);ndc=new THREE.Vector2();
  GEO.sph=new THREE.SphereGeometry(1,48,32);GEO.ringS=ringGeo(1.25,2.25,128);GEO.ringU=ringGeo(1.55,1.72,96);
  PLANETS.concat([OTHERS[0]]).forEach(function(p){MAT[p.id]=new THREE.MeshPhongMaterial({map:canvasTex(TEXD[p.id].canvas),shininess:p.id==='earth'?24:6,specular:new THREE.Color(p.id==='earth'?0x2a4466:0x111111)});});
  MAT.clouds=new THREE.MeshPhongMaterial({map:canvasTex(TEXD.clouds.canvas),transparent:true,depthWrite:false,shininess:0});
  MAT.ringS=new THREE.MeshBasicMaterial({map:canvasTex(ringCanvas('saturn')),transparent:true,side:THREE.DoubleSide,depthWrite:false,color:0xf2ead8});
  MAT.ringU=new THREE.MeshBasicMaterial({map:canvasTex(ringCanvas('uranus')),transparent:true,side:THREE.DoubleSide,depthWrite:false,opacity:.7});
  amb=new THREE.AmbientLight(0x8a92cc,.62);scene.add(amb);
  sunLight=new THREE.PointLight(0xfff0dc,1.35,0);scene.add(sunLight);
  skyLight=new THREE.DirectionalLight(0xffffff,0);skyLight.position.set(1,.35,.55);scene.add(skyLight);
  stars=starField(1700,300,4);scene.add(stars);
  solarGroup=new THREE.Group();scene.add(solarGroup);
  sun=new THREE.Mesh(new THREE.SphereGeometry(SUN_R,48,32),new THREE.MeshBasicMaterial({map:canvasTex(TEXD.sun.canvas)}));solarGroup.add(sun);
  corona=new THREE.Sprite(new THREE.SpriteMaterial({map:canvasTex(radialCanvas([[0,'rgba(255,246,200,1)'],[.2,'rgba(255,214,110,.9)'],[.36,'rgba(255,160,40,.45)'],[.6,'rgba(255,100,20,.14)'],[1,'rgba(255,80,0,0)']])),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
  corona.scale.set(SUN_R*5.4,SUN_R*5.4,1);solarGroup.add(corona);
  corona2=new THREE.Sprite(new THREE.SpriteMaterial({map:canvasTex(raysCanvas()),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.85}));
  corona2.scale.set(SUN_R*6.2,SUN_R*6.2,1);solarGroup.add(corona2);
  var bandT=canvasTex(bandCanvas());
  for(var i=0;i<8;i++){var r=orbitR(i);
    var line=new THREE.Mesh(ringGeo(r-.03,r+.03,180),new THREE.MeshBasicMaterial({color:0xaebcff,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide}));line.rotation.x=-Math.PI/2;solarGroup.add(line);
    var glow=new THREE.Mesh(ringGeo(r-.46,r+.46,180),new THREE.MeshBasicMaterial({map:bandT,color:0x3fe6ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));glow.rotation.x=-Math.PI/2;solarGroup.add(glow);
    var lt=canvasTex(labelCanvas(i));var lab=new THREE.Sprite(new THREE.SpriteMaterial({map:lt,depthTest:false,transparent:true}));lab.renderOrder=10;
    var la=(i%2?44:30)*DEG;lab.position.set(r*Math.sin(la),0,r*Math.cos(la));solarGroup.add(lab);
    ORB.push({line:line,glow:glow,lab:lab,ltex:lt,cur:0,col:new THREE.Color(0x3fe6ff),size:.6});}
  ALL.forEach(function(b,i){var o=makeBody(b.id);solarGroup.add(o);B[b.id]={obj:o,orbit:b.other?-1:i,ang:i*1.7+.4,s:1,vis:1,pop:null,sa:0,scat:new THREE.Vector3(),ph:i*1.3};});
  B.moon.orbit=-2;B.probe.vis=0;B.probe.s=0;
  var sr=rng(77);ALL.forEach(function(b){var a=sr()*Math.PI*2,rr=3+sr()*8.5;B[b.id].scat.set(Math.sin(a)*rr,(sr()-.5)*4,Math.cos(a)*rr);});
  skyGroup=new THREE.Group();skyGroup.visible=false;scene.add(skyGroup);
  var dotT=canvasTex(radialCanvas([[0,'rgba(255,255,255,1)'],[.18,'rgba(255,255,255,.9)'],[.45,'rgba(255,255,255,.22)'],[1,'rgba(255,255,255,0)']],64));
  PLANETS.forEach(function(p){var holder=new THREE.Group();var body=makeBody(p.id);holder.add(body);body.rotation.x=.42;
    var dot=new THREE.Sprite(new THREE.SpriteMaterial({map:dotT,color:new THREE.Color(p.dot),transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending}));
    skyGroup.add(holder);skyGroup.add(dot);sky.P[p.id]={g:holder,body:body,dot:dot,u:0,v:0,yaw:0,pitch:0,wr:1};});
  document.fonts&&document.fonts.ready.then(function(){ORB.forEach(function(o,i){var c=labelCanvas(i);o.ltex.image=c;o.ltex.needsUpdate=true;});});
  setTimeout(function(){$('#gl').classList.add('ready');},30);
}

/* ---------- camera rig ---------- */
var cam={el:20,az:0,dist:40,tx:0,ty:0,tz:0,ox:0,oy:0,fov:FOV},drift=0,driftCur=0;
function applyCam(){
  if(solarMode==='sky'){var fov=fovOf(sky.z);camera.position.set(0,0,0);camera.rotation.set(sky.pitch,-sky.yaw,0);camera.fov=fov;camera.setViewOffset(VW,VH,VW/2-sky.cx,VH/2-sky.cy,VW,VH);camera.updateProjectionMatrix();return;}
  var az=(cam.az+driftCur*Math.sin(T*.06))*DEG,el=cam.el*DEG;
  camera.fov=cam.fov;camera.position.set(cam.tx+cam.dist*Math.cos(el)*Math.sin(az),cam.ty+cam.dist*Math.sin(el),cam.tz+cam.dist*Math.cos(el)*Math.cos(az));
  camera.up.set(0,1,0);camera.lookAt(cam.tx,cam.ty,cam.tz);camera.setViewOffset(VW,VH,cam.ox,cam.oy,VW,VH);camera.updateProjectionMatrix();
  var ppu=(VH/2)/Math.tan(cam.fov*DEG/2)/cam.dist,spacing=STEP*ppu,lpx=clamp(spacing*1.05,18,30);
  ORB.forEach(function(o){o.size=lpx/ppu;});
}
function camTo(p,dur,ease){var f={};for(var k in p)f[k]=cam[k];return tween(dur||1400,ease||EMOVE,function(t){for(var k in p)cam[k]=f[k]+(p[k]-f[k])*t;},'cam');}
var _tc=null,FIT=[];
function fitSolar(rect,el,az,R,cropX,cropY){
  if(!_tc){_tc=new THREE.PerspectiveCamera();for(var i=0;i<48;i++){var t=i/48*Math.PI*2;FIT.push([Math.sin(t),-.7,Math.cos(t)],[Math.sin(t),.7,Math.cos(t)]);}}
  _tc.fov=FOV;_tc.aspect=VW/VH;_tc.near=.05;_tc.far=2000;_tc.updateProjectionMatrix();
  var e=el*DEG,a=az*DEG,dx=Math.cos(e)*Math.sin(a),dy=Math.sin(e),dz=Math.cos(e)*Math.cos(a);
  function bb(d){_tc.position.set(dx*d,dy*d,dz*d);_tc.lookAt(0,0,0);_tc.updateMatrixWorld();var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
    for(var i=0;i<FIT.length+2;i++){if(i<FIT.length)_v.set(FIT[i][0]*R,FIT[i][1],FIT[i][2]*R);else _v.set(0,i===FIT.length?SUN_R*1.5:-SUN_R*1.5,0);_v.project(_tc);var sx=(_v.x+1)/2*VW,sy=(1-_v.y)/2*VH;if(sx<x0)x0=sx;if(sx>x1)x1=sx;if(sy<y0)y0=sy;if(sy>y1)y1=sy;}
    return[x0,x1,y0,y1];}
  var m=8,lo=R*1.15,hi=R*40;
  for(var k=0;k<34;k++){var mid=(lo+hi)/2,b=bb(mid);if(b[1]-b[0]<=(rect.w-2*m)*(cropX||1)&&b[3]-b[2]<=(rect.h-2*m)*(cropY||1))hi=mid;else lo=mid;}
  var b2=bb(hi);return{el:el,az:az,dist:hi,tx:0,ty:0,tz:0,fov:FOV,ox:(b2[0]+b2[1])/2-(rect.x+rect.w/2),oy:(b2[2]+b2[3])/2-(rect.y+rect.h/2)};
}
function rectOf(sel){var el=$(sel);if(!el)return{x:0,y:0,w:VW,h:VH};var r=el.getBoundingClientRect();return{x:r.left,y:r.top,w:Math.max(60,r.width),h:Math.max(60,r.height)};}
function poseFor(name){var RF=orbitR(7)+.95;
  if(name==='title')return fitSolar(rectOf('#scr-title .stage'),20,0,RF,1.5,1.35);
  if(name==='story')return fitSolar({x:0,y:0,w:VW,h:VH*.62},34,25,RF+1.5,1,1);
  if(name==='s1'||name==='s3'){var r=rectOf('#scr-'+name+' .stage'),a=r.w/r.h,el=a<.8?62:a<1.15?54:a<1.6?46:40;return fitSolar(r,el,0,RF,a<.8?1.2:1,1);}
  return fitSolar({x:0,y:0,w:VW,h:VH},30,-12,RF,1.25,1.15);
}
function toScreen(v){_v2.copy(v).project(camera);return{x:(_v2.x+1)/2*VW,y:(1-_v2.y)/2*VH};}
function groundAt(x,y){ndc.set(x/VW*2-1,-(y/VH)*2+1);ray.setFromCamera(ndc,camera);var p=new THREE.Vector3();return ray.ray.intersectPlane(plane,p)?p:null;}
function orbitAt(x,y){if(!glOK||solarMode==='sky')return null;var g=groundAt(x,y);if(!g)return null;var r=Math.hypot(g.x,g.z),i=Math.round((r-R0)/STEP);if(i<0||i>7)return null;if(Math.abs(r-orbitR(i))>STEP*.5)return null;return{i:i,ang:Math.atan2(g.x,g.z)};}

/* ---------- solar body modes ---------- */
function setSolarMode(m){
  solarMode=m; if(!glOK)return;
  var build=(m==='s1'||m==='s3');
  solarGroup.visible=(m!=='sky');skyGroup.visible=(m==='sky');
  sunLight.intensity=m==='sky'?0:1.5;skyLight.intensity=m==='sky'?1.15:0;amb.intensity=m==='sky'?.45:.62;
  ORB.forEach(function(o){o.line.material.opacity=build?.62:.22;o.lab.visible=build;});
  orbitSpeed={system:.6,story:.25,s1:.7,s3:.22,launch:0,sky:0}[m];
  drift={system:7,story:4}[m]||0;
  hoverOrbit=-1;hintOrbit=-1;flash={};
  var sa=m==='story'?1:0;
  ALL.forEach(function(b,i){var s=B[b.id];
    if(m==='system'||m==='launch'||m==='story'){s.orbit=b.other?(b.id==='moon'?-2:-1):i;s.vis=b.id==='probe'?0:1;}
    else if(m==='s1'){s.orbit=b.other?-1:i;s.vis=(!b.other&&S.s1&&S.s1.placed[i])?1:0;}
    else if(m==='s3'){var w=S.s3?S.s3.where[b.id]:'tray';if(typeof w==='number'){s.orbit=w;s.vis=1;}else{s.vis=0;}}
  });
  var from=ALL.map(function(b){return B[b.id].sa;});
  tween(m==='story'?1800:1100,EIN,function(t){ALL.forEach(function(b,i){B[b.id].sa=lerp(from[i],sa,t);});},'scat');
}
function updateSolar(dt){
  var sp=orbitSpeed*(RM?.25:1),t=now();
  driftCur+=((RM?0:drift)-driftCur)*(1-Math.exp(-dt*1.5));
  ALL.forEach(function(b){var s=B[b.id],o=s.obj;
    if(s.pop){var p=clamp((t-s.pop.t0)/s.pop.dur,0,1);s.s=EPOP(p);if(p>=1)s.pop=null;}else s.s+=(s.vis-s.s)*(1-Math.exp(-dt*9));
    o.visible=s.s>.01;o.scale.setScalar(Math.max(s.s,.001));
    var x=o.position.x,y=0,z=o.position.z;
    if(s.orbit>=0){s.ang+=dt*sp*omega(s.orbit);var r=orbitR(s.orbit);x=r*Math.sin(s.ang);z=r*Math.cos(s.ang);}
    else if(s.orbit===-2){s.ang+=dt*(orbitSpeed>0?1:0)*(RM?.3:1.1);var e=B.earth.obj.position;x=e.x+.78*Math.sin(s.ang);z=e.z+.78*Math.cos(s.ang);}
    if(s.sa>.001){var bob=Math.sin(T*.6+s.ph)*.25;x=lerp(x,s.scat.x,s.sa);y=lerp(0,s.scat.y+bob,s.sa);z=lerp(z,s.scat.z,s.sa);}
    o.position.set(x,y,z);o.userData.spin.rotation.y+=dt*BY[b.id].spin*(RM?.3:1);
  });
  sun.rotation.y+=dt*.04;corona2.material.rotation+=dt*(RM?0:.025);
  var dragging=(drag.on&&drag.moved)||!!sel;
  ORB.forEach(function(o,i){var tgt=0,col=0x3fe6ff;
    if(dragging&&(solarMode==='s1'||solarMode==='s3'))tgt=.14;
    if(hintOrbit===i){tgt=.32+.26*(.5+.5*Math.sin(T*4));col=0xffd23f;}
    if(hoverOrbit===i){tgt=.62;col=0x3fe6ff;}
    if(flash[i]&&flash[i]>t){tgt=.6;col=0xff7a5a;}
    o.cur+=(tgt-o.cur)*(1-Math.exp(-dt*12));o.glow.material.opacity=o.cur;o.glow.material.color.setHex(col);
    var k=o.size*(1+(hoverOrbit===i?.35:0));o.lab.scale.set(k,k,1);});
}

/* ---------- observatory sky ---------- */
var sky={yaw:0,pitch:0,z:1,fa:.3,cx:0,cy:0,Rc:100,P:{},K:1};
function fovOf(z){return 2*Math.atan(Math.tan(FOV0*DEG/2)/z)/DEG;}
function ppr(z){return(VH/2)/Math.tan(fovOf(z)*DEG/2);}
function skyLayout(){var st=rectOf('#s2Stage');var size=Math.max(80,Math.min(st.w,st.h)-30);sky.Rc=size/2;sky.cx=st.x+st.w/2;sky.cy=st.y+st.h/2;
  var sc=$('#scope');sc.style.width=sc.style.height=size+'px';sc.style.left=(st.w-size)/2+'px';sc.style.top=(st.h-size)/2+'px';
  var p1=ppr(1);sky.fa=Math.atan(sky.Rc*.88/p1);var jpx=Math.max(4.5,sky.Rc*.024);sky.K=(jpx/p1)*60/.85;
  PLANETS.forEach(function(p){var q=sky.P[p.id];q.wr=p.size*sky.K;q.g.scale.setScalar(sky.K);skyPos(q);});}
function skyPos(q){q.yaw=q.u*sky.fa;q.pitch=q.v*sky.fa;var cp=Math.cos(q.pitch);q.g.position.set(Math.sin(q.yaw)*cp*60,Math.sin(q.pitch)*60,-Math.cos(q.yaw)*cp*60);q.dot.position.copy(q.g.position);}
function skyShuffle(){var pts=[],tries=0;while(pts.length<8&&tries<4000){tries++;var a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*.84;var u=Math.cos(a)*r,v=Math.sin(a)*r,ok=true;for(var i=0;i<pts.length;i++)if(Math.hypot(pts[i][0]-u,pts[i][1]-v)<.4){ok=false;break;}if(ok)pts.push([u,v]);}
  while(pts.length<8)pts.push([Math.random()*1.4-.7,Math.random()*1.4-.7]);
  shuffle(PLANETS).forEach(function(p,i){var q=sky.P[p.id];q.u=pts[i][0];q.v=pts[i][1];skyPos(q);});}
function skyClamp(){var lim=sky.fa*Math.max(0,1-1/sky.z)+.01;sky.yaw=clamp(sky.yaw,-lim,lim);sky.pitch=clamp(sky.pitch,-lim,lim);}
function skyProject(id){var q=sky.P[id];var s=toScreen(q.g.position);s.r=q.wr/60*ppr(sky.z);return s;}
function updateSky(dt){var p=ppr(sky.z);
  PLANETS.forEach(function(pl){var q=sky.P[pl.id];q.body.userData.spin.rotation.y+=dt*pl.spin*.6*(RM?.3:1);var rpx=q.wr/60*p;var op=clamp(1-(rpx-3)/9,0,1);q.dot.material.opacity=op;var w=(10/p)*60;q.dot.scale.set(w,w,1);q.dot.visible=op>.01;});
}
var lastScan=0;
function setZoom(z,ax,ay){z=clamp(z,1,ZMAX);var p1=ppr(sky.z),p2=ppr(z);
  if(ax!=null){var dx=ax-sky.cx,dy=ay-sky.cy;sky.yaw+=dx/p1-dx/p2;sky.pitch+=-dy/p1+dy/p2;}
  sky.z=z;skyClamp();syncZoomUI();var t=now();if(t-lastScan>420){lastScan=t;snd('scan',.22);}}
function syncZoomUI(){$('#zSlider').value=sky.z.toFixed(2);$('#zRead').textContent='×'+AR(Math.max(1,Math.round(sky.z)));}

/* ================= fx particles ================= */
var fx={c:$('#fx'),ctx:null,p:[],dpr:1,dirty:false};
function fxResize(){fx.dpr=Math.min(window.devicePixelRatio||1,2);fx.c.width=Math.round(VW*fx.dpr);fx.c.height=Math.round(VH*fx.dpr);fx.ctx=fx.c.getContext('2d');}
var FXC=['#ffd23f','#ff7ab6','#3fe6ff','#7dffa8','#ffffff','#b28cff'];
function burst(x,y,n){n=n||24;if(RM)n=Math.ceil(n/4);for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,sp=110+Math.random()*250;fx.p.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-90,g:420,life:0,max:.7+Math.random()*.6,size:5+Math.random()*7,col:FXC[i%FXC.length],rot:Math.random()*6,vr:(Math.random()-.5)*7,star:i%2===0});}}
function confetti(n){n=n||110;if(RM)n=Math.ceil(n/5);for(var i=0;i<n;i++){fx.p.push({x:Math.random()*VW,y:-20-Math.random()*VH*.3,vx:(Math.random()-.5)*60,vy:90+Math.random()*170,g:60,life:0,max:2.6+Math.random()*1.4,size:6+Math.random()*7,col:FXC[i%FXC.length],rot:Math.random()*6,vr:(Math.random()-.5)*6,star:Math.random()<.3,rect:true});}}
function starPath(c,r){c.beginPath();for(var i=0;i<10;i++){var a=i/10*Math.PI*2-Math.PI/2,rr=i%2?r*.45:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();}
function fxStep(dt){if(!fx.p.length&&!fx.dirty)return;var c=fx.ctx;c.setTransform(fx.dpr,0,0,fx.dpr,0,0);c.clearRect(0,0,VW,VH);
  for(var i=fx.p.length-1;i>=0;i--){var p=fx.p[i];p.life+=dt;if(p.life>=p.max){fx.p.splice(i,1);continue;}p.vy+=p.g*dt;p.vx*=Math.pow(.6,dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    var a=1-Math.pow(p.life/p.max,3);c.save();c.globalAlpha=a;c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;
    if(p.star){starPath(c,p.size);c.fill();}else if(p.rect){c.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);}else{c.beginPath();c.arc(0,0,p.size/2,0,Math.PI*2);c.fill();}c.restore();}
  fx.dirty=fx.p.length>0;}

/* ================= main loop ================= */
var last=now();
function frame(t){requestAnimationFrame(frame);var dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;T+=dt;
  stepTweens(t);
  if(glOK){stars.material.uniforms.time.value=T;stars.material.uniforms.tw.value=RM?0:1;stars.material.uniforms.pr.value=renderer.getPixelRatio();
    if(solarMode==='sky')updateSky(dt);else updateSolar(dt);
    applyCam();stars.position.copy(camera.position);renderer.render(scene,camera);}
  updateMarks();fxStep(dt);}

/* ================= UI helpers ================= */
function say(sel,html,mood){var el=$(sel);if(!el)return;el.innerHTML=html;var bub=el.closest('.bubble');if(bub){bub.classList.remove('good','warn');if(mood==='good')bub.classList.add('good');if(mood==='warn')bub.classList.add('warn');
    if(!RM)anim(bub,[{transform:'scale(.97)',opacity:.6},{transform:'scale(1)',opacity:1}],300,CIN);}
  var g=el.closest('.guide'),bot=g&&g.querySelector('.bot');if(bot){bot.classList.remove('happy','think');if(mood==='good')bot.classList.add('happy');if(mood==='warn')bot.classList.add('think');}}
var toastT=0;function toast(msg,ms){var t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on');},ms||2600);}
function updateStars(pop){$('#starN').textContent=AR(S.shown);if(pop){var p=$('#starPill');p.classList.remove('pop');void p.offsetWidth;p.classList.add('pop');}}
function award(x,y){S.stars++;var el=document.createElement('div');el.className='flystar';el.innerHTML='<svg viewBox="0 0 24 24"><use href="#i-star"/></svg>';document.body.appendChild(el);
  var r=$('#starPill').getBoundingClientRect(),tx=r.left+26,ty=r.top+r.height/2,mx=(x+tx)/2+(Math.random()-.5)*80,my=Math.min(y,ty)-60;
  var a=el.animate([{transform:'translate('+x+'px,'+y+'px) scale(.3)',opacity:0},{transform:'translate('+x+'px,'+(y-36)+'px) scale(1.45)',opacity:1,offset:.2},{transform:'translate('+mx+'px,'+my+'px) scale(1.1)',opacity:1,offset:.55},{transform:'translate('+tx+'px,'+ty+'px) scale(.5)',opacity:1}],{duration:D(RM?350:1000),easing:CMOVE,fill:'forwards'});
  function done(){el.remove();S.shown=Math.min(S.stars,S.shown+1);updateStars(true);}
  a.onfinish=done;a.oncancel=done;}
function syncStars(){S.shown=S.stars;updateStars(false);}
function progDots(sel,n,on,curI){var h='';for(var i=0;i<n;i++)h+='<i class="'+(on(i)?'on':(i===curI?'cur':''))+'"></i>';$(sel).innerHTML=h;}
function strip(sel,hl,emptyFn){var h='';PLANETS.forEach(function(p,i){h+='<div class="sl'+(hl===i?' hl':'')+'"><img alt="" src="'+THUMB[p.id]+'"><span>'+p.name+'</span></div>';});$(sel).innerHTML='<div class="sun" title="الشمس"></div>'+h;}
function setAvatar(){$('#tbAvatar').innerHTML=astroSVG(S.suit);}

/* ================= screens ================= */
var SCREEN_MODE={title:'system',story:'story',suit:'system',launch:'launch',map:'system',s1:'s1',s2:'sky',gate:'system',s3name:'system',s3:'s3',result:'system'};
var navBusy=false;
function goto(name,opt){opt=opt||{};
  var prevName=cur,prev=$('#scr-'+cur),next=$('#scr-'+name);if(!next)return Promise.resolve();
  if(prevName===name&&!opt.force)return Promise.resolve();
  stopSpeak();clearSel();cancelDrag();clearMarks();closeModal(true);
  if(prevName==='s2')s2Leave();
  if(prev&&prev!==next){prev.style.pointerEvents='none';anim(prev,[{opacity:1},{opacity:0}],200,COUT).then(function(a){if(cur!==prevName){prev.classList.remove('on');}prev.style.pointerEvents='';if(a&&a.cancel)a.cancel();});}
  cur=name;document.body.setAttribute('data-screen',name);next.classList.add('on');next.scrollTop=0;
  anim(next,RM?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],380,CIN).then(function(a){if(a&&a.cancel)a.cancel();});
  syncStars();
  var m=SCREEN_MODE[name];
  if(m!=='launch'&&m!=='sky')setSolarMode(m);
  var enter=ENTER[name];var r=enter?enter(opt):null;
  if(glOK&&m!=='launch'&&m!=='sky'){requestAnimationFrame(function(){camTo(poseFor(name),opt.camDur||(prevName==='title'&&name==='story'?1800:1400),EMOVE);});}
  return Promise.resolve(r);
}
var ENTER={};

/* ---- title / story / suit ---- */
ENTER.title=function(){};
ENTER.story=function(){};
function buildSuits(){var h='';SUITS.forEach(function(s,i){h+='<button class="suit" role="radio" aria-checked="'+(i===S.suit)+'" data-i="'+i+'">'+astroSVG(i)+'<span>'+s.n+'</span><span class="tick"><svg viewBox="0 0 24 24"><use href="#i-check"/></svg></span></button>';});$('#suits').innerHTML=h;}
ENTER.suit=function(){buildSuits();$('#nameIn').value=S.name||'';$('#nameErr').textContent='';};
function chooseSuit(i){S.suit=i;$$('.suit').forEach(function(b){b.setAttribute('aria-checked',String(+b.getAttribute('data-i')===i));});snd('sparkle',.45);var b=$('.suit[data-i="'+i+'"] svg');if(b&&!RM)anim(b,[{transform:'translateY(0) rotate(0)'},{transform:'translateY(-10px) rotate(-6deg)',offset:.4},{transform:'translateY(0) rotate(0)'}],500,CPOP);}
function cleanName(v){return String(v||'').replace(/\s+/g,' ').trim().slice(0,20);}

/* ---- launch ---- */
ENTER.launch=function(){launchSeq();};
async function launchSeq(){
  var rk=$('#rocket');rk.innerHTML=rocketSVG(S.suit);rk.classList.remove('lit');rk.style.transform='translateX(-50%)';rk.getAnimations&&rk.getAnimations().forEach(function(a){a.cancel();});
  var cnt=$('#count');cnt.textContent='';cnt.style.opacity=0;
  if(glOK){setSolarMode('launch');var mp=poseFor('map');var ea=(mp.az-180+50)*DEG;B.earth.ang=ea;var er=orbitR(2);var ex=er*Math.sin(ea),ez=er*Math.cos(ea);B.earth.obj.position.set(ex,0,ez);B.moon.ang=2.4;
    var Rpx=Math.min(VW*.46,VH*.3),p0=(VH/2)/Math.tan(FOV*DEG/2),dist=BY.earth.size*p0/Rpx,cy=VH*.78+Rpx*.92;
    tweens.forEach(function(t){if(t.key==='cam')t.dead=true;});
    cam.el=6;cam.az=mp.az;cam.dist=dist;cam.tx=ex;cam.ty=0;cam.tz=ez;cam.ox=0;cam.oy=VH/2-cy;cam.fov=FOV;driftCur=0;}
  await wait(350);
  if(!RM){for(var i=3;i>=1;i--){cnt.textContent=AR(i);snd('power',.45);anim(cnt,[{opacity:0,transform:'scale(.45)'},{opacity:1,transform:'scale(1)',offset:.45},{opacity:1,transform:'scale(1)',offset:.75},{opacity:0,transform:'scale(1.08)'}],800,'linear');await wait(820);}}
  cnt.textContent='انطلق!';anim(cnt,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1)',offset:.3},{opacity:1,offset:.75},{opacity:0}],1500,'linear');
  snd('engine',.7);snd('rise',.5);rk.classList.add('lit');
  spawnPuffs(rk);
  rk.animate([{transform:'translateX(-50%) translateY(0)'},{transform:'translateX(-50%) translateY(6px)',offset:.12},{transform:'translateX(-50%) translateY(-135vh)'}],{duration:D(RM?600:2300),easing:'cubic-bezier(.55,0,.8,.25)',fill:'forwards'});
  await wait(RM?200:650);
  if(glOK){var mp2=poseFor('map');camTo(mp2,RM?600:2700,EMOVE).then(function(){if(cur==='map'||cur==='launch'){orbitSpeed=.6;}});
    tween(2700,EIN,function(t){orbitSpeed=.6*t;},'spd');}
  await wait(RM?700:2300);
  if(cur==='launch'){S.launched=true;goto('map',{camDur:300});}
}
function spawnPuffs(rk){if(RM)return;var r=rk.getBoundingClientRect(),scr=$('#scr-launch');for(var i=0;i<14;i++){(function(i){setTimeout(function(){var d=document.createElement('div');d.className='puff';var s=40+Math.random()*50;d.style.width=d.style.height=s+'px';d.style.left=(r.left+r.width/2-s/2+(Math.random()-.5)*40)+'px';d.style.top=(r.bottom-s/2-10)+'px';scr.appendChild(d);
  anim(d,[{transform:'scale(.3)',opacity:.9},{transform:'translate('+((Math.random()-.5)*160)+'px,'+(20+Math.random()*40)+'px) scale(2.2)',opacity:0}],1400,CIN).then(function(){d.remove();});},D(i*70));})(i);}}

/* ---- map ---- */
ENTER.map=function(){
  var s1n=S.s1?S.s1.placed.filter(Boolean).length:0,s2n=S.s2?S.s2.correct:0;
  $('#st1s').textContent=AR(s1n)+' من ٨';$('#st2s').textContent=AR(s2n)+' من ٧';
  var s1d=S.s1&&S.s1.done,s2d=S.s2&&S.s2.done;
  $('#st1').classList.toggle('done',!!s1d);$('#st2').classList.toggle('done',!!s2d);
  $('#st1').classList.toggle('next',!s1d);$('#st2').classList.toggle('next',!!s1d&&!s2d);$('#st3').classList.toggle('next',!!s1d&&!!s2d&&!S.result);
  if(S.result){$('#st3s').textContent=AR(S.result.score)+' من ١٠';}
  var n=esc(S.name||'رائد الفضاء'),msg;
  if(S.result)msg='نتيجتك في التقويم: <b>'+AR(S.result.score)+' من ١٠</b>. يمكنك مراجعة القسمين الأول والثاني متى شئت.';
  else if(s1d&&s2d)msg='أحسنت يا '+n+'! عدد نجومك: <b>'+AR(S.stars)+'</b>. <b>توقّف الآن</b> وانتظر تعليمات معلمك قبل القسم الثالث.';
  else if(s1d)msg='رائع! بنيتَ النظام الشمسي. انطلق الآن إلى <b>المرصد</b>.';
  else if(S.s1&&s1n>0)msg='أكمل بناء النظام الشمسي يا '+n+'، بقي '+AR(8-s1n)+' من الكواكب.';
  else msg='مرحبًا يا '+n+'! ابدأ بالمحطة الأولى: <b>النظام الشمسي</b>.';
  say('#mapSay',msg,s1d&&s2d&&!S.result?'warn':null);
};

/* ================= drag & select ================= */
var drag={on:false,moved:false},sel=null;
function ghostXY(){return{x:drag.x,y:drag.y-(drag.touch?56:0)};}
function beginDrag(e,kind,id,src,fromOrbit){if(e.button>0)return;e.preventDefault&&e.preventDefault();
  drag={on:true,kind:kind,id:id,src:src,pid:e.pointerId,sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,moved:false,touch:e.pointerType==='touch'||e.pointerType==='pen',hover:null,bin:false,fromOrbit:!!fromOrbit};
  window.addEventListener('pointermove',dragMove);window.addEventListener('pointerup',dragUp);window.addEventListener('pointercancel',dragCancelEv);}
function endDragListeners(){window.removeEventListener('pointermove',dragMove);window.removeEventListener('pointerup',dragUp);window.removeEventListener('pointercancel',dragCancelEv);}
function dragMove(e){if(!drag.on||e.pointerId!==drag.pid)return;drag.x=e.clientX;drag.y=e.clientY;
  if(!drag.moved&&Math.hypot(drag.x-drag.sx,drag.y-drag.sy)>9){drag.moved=true;clearSel();var gh=$('#ghost');gh.querySelector('img').src=THUMB[drag.id];gh.style.display='block';
    if(drag.src)drag.src.classList.add('dragging');if(drag.kind==='s3'&&drag.fromOrbit){s3Detach(drag.id,true);}}
  if(drag.moved){var g=ghostXY();$('#ghost').style.transform='translate('+g.x+'px,'+g.y+'px)';var o=orbitAt(g.x,g.y);drag.hover=o;hoverOrbit=o?o.i:-1;
    if(drag.kind==='s3'){var br=$('#bin').getBoundingClientRect();drag.bin=g.x>=br.left&&g.x<=br.right&&g.y>=br.top&&g.y<=br.bottom;$('#bin').classList.toggle('hot',drag.bin);if(drag.bin){hoverOrbit=-1;drag.hover=null;}}}}
function dragUp(e){if(!drag.on||e.pointerId!==drag.pid)return;endDragListeners();var d=drag;drag={on:false,moved:false};hoverOrbit=-1;$('#bin').classList.remove('hot');
  if(!d.moved){onItemTap(d.kind,d.id,d.fromOrbit);return;}
  var g={x:d.x,y:d.y-(d.touch?56:0)};
  if(d.src)d.src.classList.remove('dragging');
  if(d.hover){$('#ghost').style.display='none';dropOn(d.kind,d.id,d.hover.i,d.hover.ang,g);}
  else if(d.kind==='s3'&&d.bin){$('#ghost').style.display='none';s3ToBin(d.id);}
  else{flyBack(g,d.src);if(d.kind==='s3')s3RefreshUI();}}
function dragCancelEv(e){if(e.pointerId!==drag.pid)return;cancelDrag();}
function cancelDrag(){if(!drag.on)return;endDragListeners();if(drag.src)drag.src.classList.remove('dragging');$('#ghost').style.display='none';hoverOrbit=-1;drag={on:false,moved:false};if(cur==='s3')s3RefreshUI();}
function flyBack(g,src){var gh=$('#ghost');if(!src||RM){gh.style.display='none';return;}var r=src.getBoundingClientRect();
  var a=gh.animate([{transform:'translate('+g.x+'px,'+g.y+'px)'},{transform:'translate('+(r.left+r.width/2)+'px,'+(r.top+r.height/2)+'px) scale(.8)'}],{duration:D(340),easing:CIN});
  a.onfinish=function(){gh.style.display='none';};}
function setSel(kind,id,el){clearSel();sel={kind:kind,id:id,el:el};el.classList.add('sel');snd('sparkle',.3);
  if(kind==='s1')$('#s1Hint').innerHTML='الآن <b>اضغط على المدار</b> الذي تراه مناسبًا.';
  if(kind==='s3')say('#s3Say','اخترتَ <b>'+BY[id].name+'</b>. اضغط على المدار الذي تريده، أو على «ليس كوكبًا».');}
function clearSel(){if(sel&&sel.el)sel.el.classList.remove('sel');if(sel&&sel.kind==='s1')$('#s1Hint').innerHTML='<b>اسحب</b> الكوكب إلى مداره، أو <b>اضغط</b> عليه ثم اضغط على المدار.';sel=null;}
function onItemTap(kind,id,fromOrbit){
  if(kind==='s1'){if(S.s1.busy)return;if(sel&&sel.id===id){clearSel();return;}setSel('s1',id,$('#s1Tok'));return;}
  if(kind==='s3'){if(S.s3.locked)return;var w=S.s3.where[id];
    if(w!=='tray'){s3ToTray(id);return;}
    if(sel&&sel.id===id){clearSel();return;}setSel('s3',id,cardEl(id));}}
function dropOn(kind,id,k,ang,g){clearSel();if(kind==='s1')s1Drop(k,ang,g);else s3Place(id,k,ang);}
/* canvas taps (select → orbit, s3 pick-up) */
var ctap=null;
function glDown(e){if(cur==='s2'){skyDown(e);return;}
  if(cur==='s3'&&S.s3&&!S.s3.locked&&!sel){var id=pick3D(e.clientX,e.clientY);if(id){beginDrag(e,'s3',id,cardEl(id),true);return;}}
  ctap={x:e.clientX,y:e.clientY,id:e.pointerId};}
function glUp(e){if(cur==='s2'){skyUp(e);return;}
  if(ctap&&ctap.id===e.pointerId&&Math.hypot(e.clientX-ctap.x,e.clientY-ctap.y)<12){
    if(sel){var o=orbitAt(e.clientX,e.clientY);if(o){var s=sel;dropOn(s.kind,s.id,o.i,o.ang,{x:e.clientX,y:e.clientY});}}
    else if(cur==='s1'&&!S.s1.busy&&!S.s1.done&&orbitAt(e.clientX,e.clientY)){$('#s1Hint').innerHTML='اضغط على <b>الكوكب</b> أولًا، ثم اضغط على المدار.';pulse($('#s1Tok'));}}
  ctap=null;}
function pulse(el){if(el&&!RM)anim(el,[{transform:'scale(1)'},{transform:'scale(1.12)',offset:.4},{transform:'scale(1)'}],420,CPOP);}
function pick3D(x,y){var best=null,bd=1e9;ALL.forEach(function(b){var w=S.s3.where[b.id];if(typeof w!=='number')return;var s=B[b.id];var p=toScreen(s.obj.position);var d=Math.hypot(p.x-x,p.y-y);if(d<34&&d<bd){bd=d;best=b.id;}});return best;}

/* ================= SECTION 1: build the solar system ================= */
function s1Reset(){S.s1={order:[2].concat(shuffle([0,1,3,4,5,6,7])),idx:0,placed:[0,0,0,0,0,0,0,0].map(function(){return false;}),tries:0,done:false,busy:false};}
function s1Cur(){return S.s1.order[S.s1.idx];}
ENTER.s1=function(opt){if(!S.s1||S.s1.done||opt.reset)s1Reset();setSolarMode('s1');
  $('#s1Done').classList.add('hidden');$('#s1Offer').classList.remove('hidden');$('#s1Side').classList.remove('hidden');
  if(S.s1.busy){S.s1.idx++;S.s1.busy=false;}
  if(S.s1.idx>=8){s1Complete(true);return;}
  s1Offer();};
function s1Prog(){progDots('#s1Prog',8,function(i){return S.s1.placed[i];},-1);}
function s1Offer(){var pi=s1Cur(),p=PLANETS[pi];S.s1.tries=0;S.s1.busy=false;hintOrbit=-1;
  var tok=$('#s1Tok');tok.querySelector('img').src=THUMB[p.id];tok.setAttribute('aria-label',p.name);tok.style.visibility='visible';$('#s1TokName').textContent=p.name;
  $('#s1Next').classList.add('hidden');$('#s1Hint').classList.remove('hidden');clearSel();s1Prog();
  say('#s1Say','<span class="q">أين مدار '+p.name+'؟</span>'+(p.f?'ضعها في مدارها':'ضعه في مداره')+' حول الشمس.');
  if(!RM)anim($('#s1Offer'),[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1)'}],520,CPOP);}
function s1WrongText(pi,k){var p=PLANETS[pi],v=p.f?'تأتي':'يأتي',pr=p.f?'فهي':'فهو',t='';
  if(S.s1.placed[k])t+='هذا مدار <b>'+PLANETS[k].name+'</b>، وقد وضعته فيه من قبل. ';
  else t+=(k<pi?'المدار '+ORD[k]+' <b>أقرب</b> إلى الشمس من مدار '+p.name+'. ':'المدار '+ORD[k]+' <b>أبعد</b> عن الشمس من مدار '+p.name+'. ');
  if(p.id==='jupiter'&&k<4)t+='المشتري كبير جدًا، لكن الحجم لا يعني أنه قريب! ';
  if(pi===0)t+='تذكّر: <b>عطارد</b> أقرب الكواكب إلى الشمس، فمداره الأول.';
  else t+='تذكّر: <b>'+p.name+'</b> '+v+' بعد '+PLANETS[pi-1].name+' مباشرة، '+pr+' الكوكب '+ORD[pi]+(pi===7?' والأبعد عن الشمس':'')+'.';
  return t;}
var PRAISE=['أحسنت!','رائع!','ممتاز!','إجابة صحيحة!','عمل رائع!'];
function s1Drop(k,ang,g){if(!S.s1||S.s1.busy||S.s1.done)return;var pi=s1Cur(),p=PLANETS[pi];
  if(k===pi){S.s1.busy=true;S.s1.placed[pi]=true;S.nb.placed[p.id]=1;var b=B[p.id];b.orbit=pi;b.ang=ang;b.vis=1;b.s=0;b.pop={t0:now(),dur:D(650)};hintOrbit=-1;
    snd('ok',.7);setTimeout(function(){snd('collect',.55);},D(160));
    var sp=g||toScreen(new THREE.Vector3(orbitR(pi)*Math.sin(ang),0,orbitR(pi)*Math.cos(ang)));burst(sp.x,sp.y,26);award(sp.x,sp.y);
    var pr=PRAISE[Math.floor(Math.random()*PRAISE.length)];if(Math.random()<.4&&S.name)pr='أحسنت يا '+esc(S.name)+'!';
    say('#s1Say','<span class="q">'+pr+'</span>'+p.fact,'good');
    $('#s1Tok').style.visibility='hidden';$('#s1TokName').textContent='';$('#s1Hint').classList.add('hidden');s1Prog();
    if(S.s1.placed.every(Boolean)){setTimeout(function(){if(cur==='s1')s1Complete();},D(1500));}
    else{var nb=$('#s1Next');nb.classList.remove('hidden');if(!RM)anim(nb,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],380,CIN);}}
  else{S.s1.tries++;snd('wrong',.32);flash[k]=now()+D(900);
    var t=s1WrongText(pi,k);if(S.s1.tries>=2){hintOrbit=pi;t+=' <b>انظر إلى المدار المضيء.</b>';}
    say('#s1Say',t,'warn');pulse($('#s1Tok'));}}
function s1NextPlanet(){if(!S.s1||!S.s1.busy)return;S.s1.idx++;S.s1.busy=false;if(S.s1.idx>=8){s1Complete();return;}s1Offer();}
function s1Complete(silent){S.s1.done=true;S.s1.busy=false;$('#s1Offer').classList.add('hidden');$('#s1Side').classList.add('hidden');$('#s1Done').classList.remove('hidden');strip('#s1Strip',-1);
  orbitSpeed=1;say('#s1Say','<span class="q">رائع يا '+esc(S.name||'بطل')+'!</span>بنيتَ النظام الشمسي كاملًا: ثمانية كواكب تدور حول الشمس، من عطارد الأقرب إلى نبتون الأبعد.','good');
  if(!silent){snd('rise',.5);setTimeout(function(){snd('sparkle',.5);},D(300));confetti(120);
    if(glOK&&!RM){var p=poseFor('s1');p.az=22;camTo(p,3200,EMOVE);}}}

/* ================= SECTION 2: observatory ================= */
function s2Reset(){S.s2={rounds:shuffle([0,1,2,3,4,5,6,7]).slice(0,7),r:0,correct:0,locked:false,done:false,started:false};}
ENTER.s2=function(){if(!S.s2||S.s2.done)s2Reset();setSolarMode('sky');sky.z=1;sky.yaw=0;sky.pitch=0;
  requestAnimationFrame(function(){skyLayout();skyShuffle();syncZoomUI();});
  $('#s2Done').classList.add('hidden');$('#s2Next').classList.add('hidden');
  if(!S.s2.started){$('#s2Intro').classList.remove('hidden');say('#s2Say','<span class="q">المرصد</span>هنا نرصد الكواكب بالمنظار.');$('#zoombar').style.visibility='hidden';}
  else{$('#s2Intro').classList.add('hidden');$('#zoombar').style.visibility='visible';s2Round();}
  s2Prog();};
function s2Leave(){S.s2&&(S.s2.locked=false);skyPts.clear();}
function s2Prog(){progDots('#s2Prog',7,function(i){return i<S.s2.correct;},S.s2.done?-1:S.s2.r);}
function s2Asked(){return PLANETS[S.s2.rounds[S.s2.r]];}
function s2Round(){S.s2.locked=false;clearMarks();$('#s2Next').classList.add('hidden');var a=s2Asked();
  if(S.s2.r>0||S.s2.reshuffle)skyShuffle();S.s2.reshuffle=true;
  var fy=sky.yaw,fp=sky.pitch,fz=sky.z;tween(700,EMOVE,function(t){sky.yaw=lerp(fy,0,t);sky.pitch=lerp(fp,0,t);sky.z=lerp(fz,1,t);syncZoomUI();},'sky');
  say('#s2Say','<span class="q">أين '+a.name+'؟</span>قرّب المنظار، ثم اضغط على '+a.name+'.');s2Prog();}
function s2Begin(){S.s2.started=true;$('#s2Intro').classList.add('hidden');var zb=$('#zoombar');zb.style.visibility='visible';if(!RM)anim(zb,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],420,CIN);snd('whoosh',.4);s2Round();}
function autoZoom(id){var q=sky.P[id],pr=skyProject(id);var target=Math.max(40,sky.Rc*.2);var z=clamp(sky.z*target/Math.max(pr.r,.5),1,ZMAX);
  var fy=sky.yaw,fp=sky.pitch,fz=sky.z;snd('scan',.35);lastScan=now();
  tween(950,EMOVE,function(t){sky.yaw=lerp(fy,q.yaw,t);sky.pitch=lerp(fp,q.pitch,t);sky.z=lerp(fz,z,t);syncZoomUI();},'sky');
  say('#s2Say','اقتربنا من أحد الكواكب! هل هذا الكوكب هو <b>'+s2Asked().name+'</b>؟ إن كان هو فاضغط عليه، وإلا فابتعد وابحث عن غيره.');}
function skyTap(x,y){if(!S.s2||!S.s2.started||S.s2.locked||S.s2.done)return;if(Math.hypot(x-sky.cx,y-sky.cy)>sky.Rc+6)return;
  var best=null,bd=1e9;PLANETS.forEach(function(p){var s=skyProject(p.id);var d=Math.hypot(s.x-x,s.y-y),thr=Math.max(26,s.r*(p.id==='saturn'?2.1:1.05)+14);if(d<thr&&d<bd){bd=d;best=p.id;}});
  if(!best)return;var pr=skyProject(best);if(pr.r<11){autoZoom(best);return;}s2Answer(best);}
function s2Answer(id){if(S.s2.locked)return;var a=s2Asked(),p=BY[id],pi=PLANETS.indexOf(p);
  if(id===a.id){S.s2.locked=true;S.s2.correct++;S.nb.seen[id]=1;snd('ok',.7);setTimeout(function(){snd('collect',.55);},D(160));
    var q=sky.P[id],pr0=skyProject(id);award(pr0.x,pr0.y);burst(pr0.x,pr0.y,22);
    var target=Math.max(56,sky.Rc*.3),z=clamp(sky.z*target/Math.max(pr0.r,.5),1,ZMAX),fy=sky.yaw,fp=sky.pitch,fz=sky.z;
    tween(900,EMOVE,function(t){sky.yaw=lerp(fy,q.yaw,t);sky.pitch=lerp(fp,q.pitch,t);sky.z=lerp(fz,z,t);syncZoomUI();},'sky');
    addMark(id,'good',a.name);
    say('#s2Say','<span class="q">صحيح! '+THIS(p)+' '+p.name+'</span>'+p.name+' '+p.look+'، '+(p.f?'وهي':'وهو')+' الكوكب '+ORD[pi]+' من الشمس.','good');
    s2Prog();var nb=$('#s2Next');nb.classList.remove('hidden');nb.innerHTML=(S.s2.r>=6?'أنهيتُ الرصد':'الجولة التالية')+' <svg viewBox="0 0 24 24"><use href="#i-next"/></svg>';if(!RM)anim(nb,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],380,CIN);}
  else{snd('wrong',.3);addMark(id,'warn',p.name,2600);
    say('#s2Say',THIS(p)+' <b>'+p.name+'</b>: '+p.look+'. أما <b>'+a.name+'</b> ف'+a.look+'. ابحث مرة أخرى!','warn');}}
function s2NextRound(){if(!S.s2.locked)return;S.s2.r++;if(S.s2.r>=7){s2Complete();return;}s2Round();}
function s2Complete(){S.s2.done=true;S.s2.locked=true;clearMarks();$('#s2Next').classList.add('hidden');$('#zoombar').style.visibility='hidden';
  strip('#s2Strip',-1);$('#s2DoneTxt').innerHTML='رصدتَ '+countPlanets(S.s2.correct)+' وربطتَ شكل كل كوكب باسمه. تذكّر: هذا ترتيب الكواكب من الشمس، مهما كان مكانها في السماء.';
  var c=$('#s2Done');c.classList.remove('hidden');if(!RM)anim(c,[{opacity:0,transform:'scale(.9)'},{opacity:1,transform:'none'}],450,CPOP);
  var fy=sky.yaw,fp=sky.pitch,fz=sky.z;tween(900,EMOVE,function(t){sky.yaw=lerp(fy,0,t);sky.pitch=lerp(fp,0,t);sky.z=lerp(fz,1,t);syncZoomUI();},'sky');
  say('#s2Say','<span class="q">أحسنت أيها الراصد!</span>عُد إلى الخريطة، ثم توقّف وانتظر تعليمات معلمك.','good');snd('rise',.5);confetti(100);s2Prog();}
/* marks (labels that follow planets in the telescope) */
var marks=[];
function addMark(id,kind,label,ttl){var ring=document.createElement('div');ring.className='ring-mark'+(kind==='warn'?' warn':'');var tag=document.createElement('div');tag.className='ptag '+(kind==='warn'?'warn':'good');tag.textContent=label;document.body.appendChild(ring);document.body.appendChild(tag);
  var m={id:id,ring:ring,tag:tag};marks.push(m);if(!RM){anim(ring,[{opacity:0},{opacity:1}],300,CIN);anim(tag,[{opacity:0},{opacity:1}],300,CIN);}
  if(ttl)setTimeout(function(){removeMark(m);},ttl);updateMarks();}
function removeMark(m){var i=marks.indexOf(m);if(i<0)return;marks.splice(i,1);m.ring.remove();m.tag.remove();}
function clearMarks(){marks.slice().forEach(removeMark);}
function updateMarks(){if(!marks.length||!glOK)return;marks.forEach(function(m){var s=skyProject(m.id);var rr=Math.max(14,s.r*(m.id==='saturn'?2.15:1.12)+8);
  m.ring.style.left=(s.x-rr)+'px';m.ring.style.top=(s.y-rr)+'px';m.ring.style.width=m.ring.style.height=(rr*2)+'px';m.tag.style.left=s.x+'px';m.tag.style.top=(s.y-rr-6)+'px';});}
/* telescope pointer input: pan, pinch, wheel, tap */
var skyPts=new Map(),skyT=null,pinch=null;
function skyDown(e){try{$('#gl').setPointerCapture(e.pointerId);}catch(_){}skyPts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(skyPts.size===1)skyT={id:e.pointerId,x:e.clientX,y:e.clientY,t:now(),moved:false};
  if(skyPts.size===2){var a=Array.from(skyPts.values());pinch={d0:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z0:sky.z};skyT=null;}}
function skyMove(e){if(cur!=='s2'||!skyPts.has(e.pointerId))return;var p=skyPts.get(e.pointerId),dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(!S.s2||!S.s2.started||S.s2.done)return;
  if(pinch&&skyPts.size>=2){var a=Array.from(skyPts.values()),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);tweensKill('sky');setZoom(pinch.z0*d/Math.max(20,pinch.d0),(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2);return;}
  if(skyT&&Math.hypot(e.clientX-skyT.x,e.clientY-skyT.y)>8)skyT.moved=true;
  if(skyT&&skyT.moved){tweensKill('sky');var pp=ppr(sky.z);sky.yaw-=dx/pp;sky.pitch+=dy/pp;skyClamp();}}
function skyUp(e){var t=skyT;skyPts.delete(e.pointerId);if(skyPts.size<2)pinch=null;
  if(t&&t.id===e.pointerId&&!t.moved&&now()-t.t<700)skyTap(e.clientX,e.clientY);skyT=null;}
function tweensKill(key){tweens.forEach(function(t){if(t.key===key)t.dead=true;});}

/* ================= SECTION 3: designer (assessment) ================= */
function s3Reset(){S.s3={where:{},has:[null,null,null,null,null,null,null,null],order:shuffle(ALL.map(function(b){return b.id;})),t0:0,locked:false,started:false};ALL.forEach(function(b){S.s3.where[b.id]='tray';});}
function cardEl(id){return $('.card[data-id="'+id+'"]');}
function s3Build(){var h='';S.s3.order.forEach(function(id){var b=BY[id];h+='<button class="card" data-id="'+id+'" data-state="tray" aria-label="'+b.name+'"><span class="badge"></span><img alt="" src="'+THUMB[id]+'"><span class="cn">'+b.name+'</span></button>';});$('#cards').innerHTML=h;s3RefreshUI();}
function s3RefreshUI(){if(!S.s3)return;ALL.forEach(function(b){var c=cardEl(b.id);if(!c)return;var w=S.s3.where[b.id];c.setAttribute('data-state',typeof w==='number'?'orbit':w);c.querySelector('.badge').textContent=typeof w==='number'?AR(w+1):(w==='bin'?'✕':'');
    c.setAttribute('aria-label',b.name+(typeof w==='number'?' — في المدار '+ORD[w]:w==='bin'?' — ليس كوكبًا':''));});
  var bi='';ALL.forEach(function(b){if(S.s3.where[b.id]==='bin')bi+='<img alt="'+b.name+'" title="'+b.name+'" src="'+THUMB[b.id]+'">';});$('#binItems').innerHTML=bi;}
ENTER.s3name=function(){$('#name3').value=S.name||'';$('#name3Err').textContent='';};
ENTER.s3=function(){if(!S.s3||S.s3.locked)s3Reset();setSolarMode('s3');s3Build();if(!S.s3.started){S.s3.started=true;S.s3.t0=Date.now();}
  say('#s3Say','<span class="q">صمّم نموذجك</span>اسحب كل كوكب إلى مداره. وما ليس كوكبًا ضعه في «ليس كوكبًا» أو اتركه في مكانه.');};
function s3Count(){return S.s3.has.filter(Boolean).length;}
function s3Detach(id,keepCard){var w=S.s3.where[id];if(typeof w==='number'){S.s3.has[w]=null;B[id].vis=0;if(keepCard){B[id].s=0;}}S.s3.where[id]='tray';if(!keepCard)s3RefreshUI();}
function s3Place(id,k,ang){if(!S.s3||S.s3.locked)return;var prev=S.s3.has[k],msg='';
  if(prev&&prev!==id){s3Detach(prev);msg=' وأعدتُ <b>'+BY[prev].name+'</b> إلى البطاقات.';}
  s3Detach(id,true);S.s3.has[k]=id;S.s3.where[id]=k;var b=B[id];b.orbit=k;b.ang=ang;b.vis=1;b.s=0;b.pop={t0:now(),dur:D(550)};
  snd('sparkle',.42);s3RefreshUI();var n=s3Count();
  say('#s3Say','وضعتَ <b>'+BY[id].name+'</b> في المدار '+ORD[k]+'.'+msg+' في المدارات الآن: '+AR(n)+' من ٨.'+(n===8?' راجع نموذجك، ثم اضغط «تحقّق من نموذجي».':''));}
function s3ToBin(id){if(!S.s3||S.s3.locked)return;s3Detach(id,true);S.s3.where[id]='bin';snd('whoosh',.35);s3RefreshUI();say('#s3Say','وضعتَ <b>'+BY[id].name+'</b> في «ليس كوكبًا».');}
function s3ToTray(id){if(!S.s3||S.s3.locked)return;s3Detach(id);snd('whoosh',.25);say('#s3Say','أعدتَ <b>'+BY[id].name+'</b> إلى البطاقات.');}
function s3Ask(){if(!S.s3||S.s3.locked)return;clearSel();var empty=8-s3Count();
  openModal('<h2 id="mTitle">تحقّق من نموذجي</h2><p>هل أنت متأكد من نموذجك؟ لديك <b>محاولة واحدة</b> فقط.</p>'+(empty?'<p class="warnline">ما زالت '+AR(empty)+' من المدارات فارغة.</p>':'')+
    '<div class="btnrow"><button class="btn primary" id="mYes">نعم، تحقّق</button><button class="btn" id="mNo">أراجع نموذجي</button></div>');
  $('#mYes').onclick=function(){closeModal();s3Finish();};$('#mNo').onclick=function(){closeModal();};}
function s3Finish(){if(!S.s3||S.s3.locked)return;S.s3.locked=true;clearSel();cancelDrag();
  var ms=Date.now()-S.s3.t0,planetsOk=0,nonOk=0,where={};ALL.forEach(function(b){where[b.id]=S.s3.where[b.id];});
  PLANETS.forEach(function(p,i){if(where[p.id]===i)planetsOk++;});OTHERS.forEach(function(o){if(typeof where[o.id]!=='number')nonOk++;});
  S.result={score:planetsOk+nonOk,planetsOk:planetsOk,nonOk:nonOk,ms:ms,where:where,has:S.s3.has.slice(),name:S.name,date:new Date()};
  snd('laser',.4);goto('result');}

/* ---------- result ---------- */
function fmtTime(ms){var s=Math.max(0,Math.round(ms/1000)),m=Math.floor(s/60),r=s%60;return AR(m)+':'+AR(r<10?'0'+r:r);}
function fmtDate(d){try{return new Intl.DateTimeFormat('ar-BH',{day:'numeric',month:'long',year:'numeric'}).format(d);}catch(e){return AR(d.getDate())+'/'+AR(d.getMonth()+1)+'/'+AR(d.getFullYear());}}
function drawModel(cv,has,mode,res){var W=Math.max(140,Math.round(cv.clientWidth||cv.parentNode.clientWidth-8||160)),rowH=46,top=50,H=top+8*rowH+6,dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+'px';var c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  var cx=Math.round(W*.66),cy=-10;var g=c.createRadialGradient(cx,cy,4,cx,cy,52);g.addColorStop(0,'#fff6b0');g.addColorStop(.5,'#ffb020');g.addColorStop(1,'rgba(255,122,0,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,52,0,Math.PI*2);c.fill();
  c.direction='rtl';
  for(var i=0;i<8;i++){var y=top+i*rowH+rowH/2-4,r=y-cy;c.strokeStyle='rgba(174,188,255,.32)';c.lineWidth=1.4;c.beginPath();c.arc(cx,cy,r,.12,Math.PI-.12);c.stroke();
    c.fillStyle='#aab4ee';c.font='700 13px "Baloo Bhaijaan 2","Readex Pro",sans-serif';c.textAlign='right';c.textBaseline='middle';c.fillText(AR(i+1),W-4,y+1);
    var id=has?has[i]:null;var wrong=false;
    if(mode==='mine'){wrong=(id!==PLANETS[i].id);}
    else{var cid=PLANETS[i].id;id=cid;wrong=(res.where[cid]!==i);}
    if(id){var b=BY[id],R=b.other?12:Math.round(9+b.size*13);c.drawImage(THUMBC[id],cx-R*1.25,y-R*1.25,R*2.5,R*2.5);
      if(mode==='mine'){c.lineWidth=3;c.strokeStyle=wrong?'#ff6b7d':'#3ee08f';c.beginPath();c.arc(cx,y,R+5,0,Math.PI*2);c.stroke();}
      else if(wrong){c.lineWidth=3;c.strokeStyle='#ffd23f';c.setLineDash([5,4]);c.beginPath();c.arc(cx,y,R+5,0,Math.PI*2);c.stroke();c.setLineDash([]);}
      var nm=b.name,fs=13;c.font='600 '+fs+'px "Readex Pro",Tajawal,sans-serif';var avail=cx-R-12;while(c.measureText(nm).width>avail&&fs>9){fs--;c.font='600 '+fs+'px "Readex Pro",Tajawal,sans-serif';}
      c.fillStyle=(mode==='mine'&&wrong)?'#ffb3bf':'#ffffff';c.textAlign='right';c.fillText(nm,cx-R-9,y+1);
      if(mode==='mine'){var bx=cx+R+4,by=y-R+1;c.fillStyle=wrong?'#ff6b7d':'#3ee08f';c.beginPath();c.arc(bx,by,7.5,0,Math.PI*2);c.fill();c.strokeStyle='#14104a';c.lineWidth=2.2;c.beginPath();
        if(wrong){c.moveTo(bx-3,by-3);c.lineTo(bx+3,by+3);c.moveTo(bx+3,by-3);c.lineTo(bx-3,by+3);}else{c.moveTo(bx-3.4,by);c.lineTo(bx-1,by+2.6);c.lineTo(bx+3.6,by-2.6);}c.stroke();}}
    else{c.setLineDash([4,4]);c.strokeStyle='#ff6b7d';c.lineWidth=2;c.beginPath();c.arc(cx,y,12,0,Math.PI*2);c.stroke();c.setLineDash([]);c.fillStyle='#ffb3bf';c.font='600 12px "Readex Pro",Tajawal,sans-serif';c.textAlign='right';c.fillText('فارغ',cx-20,y+1);}}}
function explainItems(res){var li=[],W=res.where;
  PLANETS.forEach(function(p,i){var w=W[p.id];if(w===i)return;var pr=p.f?'لكنها':'لكنه',v=p.f?'تأتي':'يأتي',t;
    var rel=i===0?'فهو أقرب الكواكب إلى الشمس':v+' بعد '+PLANETS[i-1].name+' مباشرة';
    if(typeof w==='number'){t='وضعتَ <b>'+p.name+'</b> في المدار '+ORD[w]+'، '+pr+' الكوكب '+ORD[i]+' من الشمس؛ '+rel+'.';if(p.id==='jupiter'&&w<4)t+=' حجمه الكبير لا يعني أنه قريب من الشمس.';}
    else if(w==='bin')t='وضعتَ <b>'+p.name+'</b> في «ليس كوكبًا»، '+pr+' كوكب: '+(p.f?'هي':'هو')+' الكوكب '+ORD[i]+' من الشمس.';
    else t='لم تضع <b>'+p.name+'</b> في '+(p.f?'مدارها':'مداره')+'؛ '+(p.f?'هي':'هو')+' الكوكب '+ORD[i]+' من الشمس.';
    li.push({id:p.id,ok:false,t:t});});
  OTHERS.forEach(function(o){var w=W[o.id];if(typeof w==='number')li.push({id:o.id,ok:false,t:'وضعتَ <b>'+o.name+'</b> في المدار '+ORD[w]+'، لكن '+o.why});
    else li.push({id:o.id,ok:true,t:'أحسنت: استبعدتَ <b>'+o.name+'</b>؛ '+o.why.replace(/^[^؛]+؛ /,'لأنه ليس كوكبًا، ')});});
  if(res.planetsOk>0)li.unshift({id:'earth',ok:true,t:res.planetsOk===8?'<b>كل الكواكب الثمانية</b> في مداراتها الصحيحة.':'وضعتَ <b>'+countPlanets(res.planetsOk)+'</b> في '+(res.planetsOk===1?'مداره الصحيح':'مداراتها الصحيحة')+'.'});
  return li;}
ENTER.result=function(){var res=S.result;if(!res){goto('map');return;}
  $('#scorecard').classList.add('hidden');$('#resBtns').classList.add('hidden');$('#showScore').classList.remove('hidden');
  requestAnimationFrame(function(){drawModel($('#cmpMine'),res.has,'mine',res);drawModel($('#cmpRight'),null,'right',res);});
  var out=[];ALL.forEach(function(b){if(typeof res.where[b.id]!=='number')out.push('<b class="'+(b.other?'ok':'no')+'">'+b.name+'</b>');});
  $('#outMine').innerHTML=out.length?'خارج المدارات: '+out.join('، '):'لا شيء خارج المدارات.';
  var h='';explainItems(res).forEach(function(x){h+='<li class="'+(x.ok?'ok':'')+'"><img alt="" src="'+THUMB[x.id]+'"><span>'+x.t+'</span></li>';});$('#explain').innerHTML=h;};
function revealScore(){var res=S.result;if(!res)return;$('#showScore').classList.add('hidden');var card=$('#scorecard');card.classList.remove('hidden');
  $('#scAv').innerHTML=astroSVG(S.suit);$('#scName').textContent=res.name||S.name||'رائد الفضاء';$('#scTime').textContent=fmtTime(res.ms);$('#scDate').textContent=fmtDate(res.date);$('#scPl').textContent=AR(res.planetsOk)+' من ٨';
  var pips='';PLANETS.forEach(function(p,i){pips+='<i data-k="'+i+'"></i>';});pips+='<span class="sep"></span><i class="np" data-k="8"></i><i class="np" data-k="9"></i>';$('#scPips').innerHTML=pips;
  var onSet=[];PLANETS.forEach(function(p,i){if(res.where[p.id]===i)onSet.push(i);});var nk=8;OTHERS.forEach(function(o){if(typeof res.where[o.id]!=='number')onSet.push(nk);nk++;});
  var met=res.score===10;var g=$('#scGoal');g.className='goal '+(met?'met':'not');g.textContent=met?'تحقّق الهدف: صمّمتَ نموذجًا صحيحًا للنظام الشمسي':'لم يتحقّق الهدف بعد';
  $('#scAdvice').textContent=met?'أحسنت! نموذجك فيه الكواكب الثمانية مرتّبة حسب بُعدها عن الشمس.':(res.score>=8?'قريب جدًا! أعد قسم «النظام الشمسي» ثم حاول مرة أخرى.':'أعد جولة Stellarium مع معلمك، ثم حاول مرة أخرى.');
  $('#resS1').classList.toggle('hidden',met);
  var num=$('#scNum');num.innerHTML=AR(0)+' <small>من ١٠</small>';
  if(!RM)anim(card,[{opacity:0,transform:'translateY(24px) scale(.96)'},{opacity:1,transform:'none'}],520,CIN);
  card.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
  snd('win',.65);if(met)setTimeout(function(){confetti(150);},D(500));
  var k=0;function step(){if(k>=onSet.length){num.innerHTML=AR(res.score)+' <small>من ١٠</small>';$('#resBtns').classList.remove('hidden');return;}var i=onSet[k++];var el=$('#scPips [data-k="'+i+'"]');el&&el.classList.add('on');num.innerHTML=AR(k)+' <small>من ١٠</small>';setTimeout(step,D(RM?20:140));}
  setTimeout(step,D(450));}

/* ================= modal: about / notebook ================= */
var modalOpen=false;
function openModal(html){var m=$('#modal');$('#mbox').innerHTML=html;m.classList.add('on');modalOpen=true;if(!RM)anim($('#mbox'),[{opacity:0,transform:'scale(.92) translateY(10px)'},{opacity:1,transform:'none'}],360,CIN);var f=$('#mbox button');f&&f.focus({preventScroll:true});}
function closeModal(silent){if(!modalOpen)return;$('#modal').classList.remove('on');modalOpen=false;}
function openAbout(){openModal('<h2 id="mTitle">عن اللعبة</h2><p><b>رائد الفضاء الصغير</b> لعبة تعليمية لدرس <b>الكواكب</b> (العلوم، الصف الثالث الابتدائي، الجزء الثاني، ص ٣٤–٣٩).</p>'+
  '<ul><li><b>النظام الشمسي:</b> تدريب بتغذية راجعة فورية لبناء النظام بوضع كل كوكب في مداره.</li><li><b>المرصد:</b> تدريب على ربط شكل كل كوكب باسمه وترتيبه.</li><li><b>مصمم النظام الشمسي:</b> التقويم؛ لا تظهر صحة الإجابة إلا بعد التحقق، ولكل كوكب في مداره درجة (٨)، ولاستبعاد كل جسم ليس كوكبًا درجة (٢).</li></ul>'+
  '<p class="warnline">المسافات والأحجام في اللعبة مقرّبة لتظهر على الشاشة، وليست بمقياس حقيقي؛ لكن ترتيب الكواكب من الشمس وترتيب أحجامها صحيحان.</p>'+
  '<p class="credit">أصوات وموسيقى مجانية الحقوق (CC0): Kenney، HoliznaCC0، Alvana.<br>الرسوم ثلاثية الأبعاد: three.js.</p><div class="center"><button class="btn primary" id="mOk">حسنًا</button></div>');$('#mOk').onclick=function(){closeModal();};}
function openBook(){var h='<h2 id="mTitle">دفتري: سجل رائد الفضاء</h2><p>الكواكب التي وضعتَها في مداراتها، مرتبة من الأقرب إلى الشمس:</p><div class="nb-grid">';
  PLANETS.forEach(function(p,i){var pl=S.nb.placed[p.id],sn=S.nb.seen[p.id];var known=pl||sn;h+='<div class="nb'+(known?'':' empty')+'"><span class="o">الكوكب '+ORD[i]+'</span><img alt="" src="'+THUMB[p.id]+'"><b>'+(known?p.name:'؟')+'</b><div class="bd">'+(pl?'<span>في مداره</span>':'')+(sn?'<span class="sk">رصدتُه</span>':'')+'</div></div>';});
  h+='</div><div class="center"><button class="btn primary" id="mOk">إغلاق</button></div>';openModal(h);$('#mOk').onclick=function(){closeModal();};}

/* ================= wiring ================= */
function wire(){
  $('#startBtn').onclick=function(){snd('whoosh',.5);goto('story');};
  $('#aboutBtn1').onclick=openAbout;$('#aboutBtn2').onclick=openAbout;
  $('#storyGo').onclick=function(){snd('whoosh',.45);goto('suit');};
  $('#storyRead').onclick=function(){speak($('#storyText').textContent+' '+$$('.mission li').map(function(l){return l.textContent;}).join('. '));};
  $('#suits').addEventListener('click',function(e){var b=e.target.closest('.suit');if(b)chooseSuit(+b.getAttribute('data-i'));});
  $('#suits').addEventListener('keydown',function(e){var k={ArrowLeft:1,ArrowRight:-1,ArrowDown:1,ArrowUp:-1}[e.key];if(k){e.preventDefault();var i=(S.suit+k+4)%4;chooseSuit(i);$('.suit[data-i="'+i+'"]').focus();}});
  function ready(){var n=cleanName($('#nameIn').value);if(!n){$('#nameErr').textContent='اكتب اسمك يا رائد الفضاء.';$('#nameIn').focus();snd('wrong',.25);return;}S.name=n;setAvatar();snd('power',.5);goto('launch');}
  $('#readyBtn').onclick=ready;$('#nameIn').addEventListener('keydown',function(e){if(e.key==='Enter')ready();});
  $$('.station').forEach(function(b){b.onclick=function(){snd('whoosh',.4);var g=b.getAttribute('data-go');goto(g==='s3'?'gate':g);};});
  $('#btnHome').onclick=function(){if(cur==='s3'&&S.s3&&!S.s3.locked){openModal('<h2 id="mTitle">الخروج من التقويم؟</h2><p>نموذجك محفوظ، ويمكنك العودة إليه.</p><div class="btnrow"><button class="btn primary" id="mStay">أكمل التصميم</button><button class="btn" id="mLeave">إلى الخريطة</button></div>');$('#mStay').onclick=function(){closeModal();};$('#mLeave').onclick=function(){closeModal();goto('map');};return;}
    if(cur!=='map')goto('map');};
  $('#btnBook').onclick=openBook;
  $('#btnSound').onclick=function(){S.sound=!S.sound;store.set('sound',S.sound);syncToggles();if(S.sound)snd('sparkle',.4);};
  $('#btnMusic').onclick=function(){S.music=!S.music;store.set('music',S.music);syncToggles();try{SFX.music(S.music);}catch(e){}};
  $('#modal').addEventListener('click',function(e){if(e.target.id==='modal'&&!$('#mYes'))closeModal();});
  document.addEventListener('click',function(e){var rb=e.target.closest('.readbtn');if(rb){var s=rb.parentNode.querySelector('.say');s&&speak(s.textContent);}});
  /* S1 */
  var tok=$('#s1Tok');tok.addEventListener('pointerdown',function(e){if(!S.s1||S.s1.busy||S.s1.done)return;beginDrag(e,'s1',PLANETS[s1Cur()].id,tok);});
  tok.addEventListener('click',function(e){if(e.detail===0&&S.s1&&!S.s1.busy)onItemTap('s1',PLANETS[s1Cur()].id);});
  $('#s1Next').onclick=function(){snd('whoosh',.35);s1NextPlanet();};
  $('#s1ToS2').onclick=function(){goto('s2');};$('#s1ToMap').onclick=function(){goto('map');};
  /* S2 */
  $('#s2Begin').onclick=s2Begin;$('#s2Next').onclick=function(){snd('whoosh',.35);s2NextRound();};$('#s2ToMap').onclick=function(){goto('map');};
  $('#zSlider').addEventListener('input',function(e){tweensKill('sky');setZoom(parseFloat(e.target.value));});
  $('#zIn').onclick=function(){var f=sky.z,t=clamp(f*1.7,1,ZMAX);tween(380,EIN,function(k){setZoom(lerp(f,t,k));},'sky');};
  $('#zOut').onclick=function(){var f=sky.z,t=clamp(f/1.7,1,ZMAX);tween(380,EIN,function(k){setZoom(lerp(f,t,k));},'sky');};
  $('#s2Hint').onclick=function(){if(!S.s2||S.s2.done||S.s2.locked||!S.s2.started)return;var a=s2Asked();say('#s2Say','<b>تلميح:</b> '+a.name+' '+a.look+'.','warn');snd('sparkle',.3);};
  /* gate & S3 */
  $('#gateGo').onclick=function(){snd('power',.45);goto('s3name');};$('#gateBack').onclick=function(){goto('map');};
  function s3go(){var n=cleanName($('#name3').value);if(!n){$('#name3Err').textContent='اكتب اسمك قبل أن تبدأ.';$('#name3').focus();return;}S.name=n;snd('whoosh',.4);goto('s3');}
  $('#s3Begin').onclick=s3go;$('#name3').addEventListener('keydown',function(e){if(e.key==='Enter')s3go();});
  $('#cards').addEventListener('pointerdown',function(e){var c=e.target.closest('.card');if(!c||!S.s3||S.s3.locked)return;beginDrag(e,'s3',c.getAttribute('data-id'),c,false);});
  $('#cards').addEventListener('click',function(e){var c=e.target.closest('.card');if(c&&e.detail===0)onItemTap('s3',c.getAttribute('data-id'));});
  $('#bin').addEventListener('click',function(){if(sel&&sel.kind==='s3'){var id=sel.id;clearSel();s3ToBin(id);}});
  $('#bin').addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&sel&&sel.kind==='s3'){e.preventDefault();var id=sel.id;clearSel();s3ToBin(id);}});
  $('#checkBtn').onclick=s3Ask;
  $('#showScore').onclick=revealScore;
  $('#resS1').onclick=function(){goto('s1',{reset:true});};$('#resMap').onclick=function(){goto('map');};$('#resRetry').onclick=function(){S.s3=null;goto('gate');};
  /* canvas */
  var gl=$('#gl');gl.addEventListener('pointerdown',glDown);gl.addEventListener('pointerup',glUp);gl.addEventListener('pointermove',skyMove);gl.addEventListener('pointercancel',function(e){skyPts.delete(e.pointerId);pinch=null;skyT=null;ctap=null;});
  gl.addEventListener('wheel',function(e){if(cur!=='s2'||!S.s2||!S.s2.started||S.s2.done)return;e.preventDefault();tweensKill('sky');setZoom(sky.z*Math.exp(-e.deltaY*.0016),e.clientX,e.clientY);},{passive:false});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){if(modalOpen&&!$('#mYes'))closeModal();else clearSel();return;}
    if(sel&&/^[1-8]$/.test(e.key)&&(cur==='s1'||cur==='s3')){var k=+e.key-1,s=sel;dropOn(s.kind,s.id,k,.35+Math.random()*.4,null);}});
  window.addEventListener('resize',onResize);
  document.addEventListener('gesturestart',function(e){e.preventDefault();});
}
function syncToggles(){var bs=$('#btnSound'),bm=$('#btnMusic');bs.classList.toggle('off',!S.sound);bm.classList.toggle('off',!S.music);bs.setAttribute('aria-pressed',String(S.sound));bm.setAttribute('aria-pressed',String(S.music));
  bs.querySelector('use').setAttribute('href',S.sound?'#i-sound':'#i-soundoff');bm.querySelector('use').setAttribute('href',S.music?'#i-music':'#i-musicoff');}
var rsT=0;function onResize(){cancelAnimationFrame(rsT);rsT=requestAnimationFrame(function(){VW=innerWidth;VH=innerHeight;fxResize();if(!glOK)return;renderer.setSize(VW,VH,false);
  if(cur==='s2'){skyLayout();}else if(cur!=='launch'){tweensKill('cam');var p=poseFor(cur);if(cur==='s1'&&S.s1&&S.s1.done)p.az=22;for(var k in p)cam[k]=p[k];}});}

/* ================= test API ================= */
window.__test={
  errors:ERR,
  fast:function(on){SPEED=(on===false)?1:.03;return SPEED;},
  state:function(){return{screen:cur,stars:S.stars,shown:S.shown,name:S.name,suit:S.suit,
    s1:S.s1&&{idx:S.s1.idx,placed:S.s1.placed.slice(),done:S.s1.done,busy:S.s1.busy,cur:S.s1.idx<8?PLANETS[s1Cur()].id:null,tries:S.s1.tries,hint:hintOrbit},
    s2:S.s2&&{r:S.s2.r,correct:S.s2.correct,done:S.s2.done,locked:S.s2.locked,started:S.s2.started,asked:S.s2.r<7?s2Asked().id:null,z:sky.z},
    s3:S.s3&&{where:JSON.parse(JSON.stringify(S.s3.where)),has:S.s3.has.slice(),locked:S.s3.locked},
    result:S.result&&{score:S.result.score,planetsOk:S.result.planetsOk,nonOk:S.result.nonOk,ms:S.result.ms}};},
  go:function(name,opt){if(!S.name)S.name='تجربة';setAvatar();return goto(name,Object.assign({force:true},opt||{}));},
  orbitPoint:function(i,deg){var r=orbitR(i),a=(deg==null?-35:deg)*DEG;return toScreen(new THREE.Vector3(r*Math.sin(a),0,r*Math.cos(a)));},
  rect:function(sel){var r=$(sel).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};},
  skyPoint:function(id){return skyProject(id);},
  scope:function(){return{cx:sky.cx,cy:sky.cy,R:sky.Rc,z:sky.z};},
  solveStep:function(){
    if(cur==='s1'){if(S.s1.done)return false;if(S.s1.busy){s1NextPlanet();return 'next';}var pi=s1Cur();s1Drop(pi,.4+Math.random());return PLANETS[pi].id;}
    if(cur==='s2'){if(!S.s2.started){s2Begin();return 'begin';}if(S.s2.done)return false;if(S.s2.locked){s2NextRound();return 'next';}var a=s2Asked().id;s2Answer(a);return a;}
    if(cur==='s3'){for(var i=0;i<8;i++){if(S.s3.where[PLANETS[i].id]!==i){s3Place(PLANETS[i].id,i,.4+i*.5);return PLANETS[i].id;}}return false;}
    return null;},
  wrong:function(){
    if(cur==='s1'){var pi=s1Cur(),k=(pi+1)%8;while(S.s1.placed[k])k=(k+1)%8;if(k===pi)k=(pi+1)%8;s1Drop(k,.4);return k;}
    if(cur==='s2'){var a=s2Asked().id,o=PLANETS.filter(function(p){return p.id!==a;})[0].id;s2Answer(o);return o;}
    return null;},
  s3Place:function(id,k){s3Place(id,k,.3+k*.6);},s3Bin:function(id){s3ToBin(id);},s3Tray:function(id){s3ToTray(id);},
  s3Check:function(){s3Finish();},reveal:function(){revealScore();},
  zoom:function(z){setZoom(z);},
  speech:function(){return !!arVoice;}
};

/* ================= boot ================= */
function boot(){
  fillArt();setAvatar();syncToggles();updateStars(false);fxResize();wire();
  var t0=now();
  try{genTextures();genThumbs();}catch(e){ERR.push('tex:'+e.message);}
  window.__genMs=now()-t0;
  if(glOK){initGL();if(glOK){setSolarMode('system');var p=poseFor('title');for(var k in p)cam[k]=p[k];}}
  requestAnimationFrame(frame);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(cur==='result'&&S.result)ENTER.result();});
}
boot();
})();
