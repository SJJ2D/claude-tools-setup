
/* ---------------- main 3D scene: a little solar system ---------------- */
var canvas=$("#scene");
var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setClearColor(0x000000,0);
var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(42,1,.1,300);
var hemi=new THREE.HemisphereLight(0xffffff,0x4a2fa0,.62);scene.add(hemi);
var keyL=new THREE.DirectionalLight(0xffffff,.95);keyL.position.set(-5,9,9);scene.add(keyL);
var TOONG=(function(){var c=document.createElement("canvas");c.width=3;c.height=1;var x=c.getContext("2d");["#7a7a7a","#c4c4c4","#f4f4f4"].forEach(function(col,i){x.fillStyle=col;x.fillRect(i,0,1,1);});var t=new THREE.CanvasTexture(c);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;})();
var TOK={color:1,emissive:1,emissiveIntensity:1,map:1,transparent:1,opacity:1,side:1,depthWrite:1,flatShading:1};
var M=function(c,o){var p={color:c,gradientMap:TOONG};if(o)for(var k in o)if(TOK[k])p[k]=o[k];return new THREE.MeshToonMaterial(p);};
var B=function(c,o){var p={color:c};if(o)for(var k in o)p[k]=o[k];return new THREE.MeshBasicMaterial(p);};
function ctex(w,h,fn){var c=document.createElement("canvas");c.width=w;c.height=h;fn(c.getContext("2d"),w,h);return new THREE.CanvasTexture(c);}
function glowTex(stops){return ctex(128,128,function(x){var g=x.createRadialGradient(64,64,0,64,64,64);stops.forEach(function(s){g.addColorStop(s[0],s[1]);});x.fillStyle=g;x.fillRect(0,0,128,128);});}

/* deep space: hidden in AR and camera modes */
var deep=new THREE.Group();scene.add(deep);
(function(){var N=1600,pos=new Float32Array(N*3),col=new Float32Array(N*3),pal=[[1,1,1],[.75,.85,1],[1,.92,.75],[1,.75,.92],[.7,1,.98]];
  for(var i=0;i<N;i++){var u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=70+Math.random()*60,s=Math.sqrt(1-u*u);pos[i*3]=Math.cos(a)*s*r;pos[i*3+1]=u*r*.8+10;pos[i*3+2]=Math.sin(a)*s*r;
    var p=pal[i%pal.length],k=.55+Math.random()*.45;col[i*3]=p[0]*k;col[i*3+1]=p[1]*k;col[i*3+2]=p[2]*k;}
  var g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));
  deep.add(new THREE.Points(g,new THREE.PointsMaterial({size:.55,vertexColors:true,map:glowTex([[0,"rgba(255,255,255,1)"],[.3,"rgba(255,255,255,.8)"],[1,"rgba(255,255,255,0)"]]),transparent:true,depthWrite:false})));})();
[[-38,14,-70,60,"255,70,180",.5],[42,22,-80,70,"60,170,255",.42],[0,-10,-90,80,"140,80,255",.45],[-70,30,-20,50,"255,140,60",.28]].forEach(function(n){
  var s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0,"rgba("+n[4]+","+n[5]+")"],[.5,"rgba("+n[4]+","+(n[5]*.35)+")"],[1,"rgba("+n[4]+",0)"]]),transparent:true,depthWrite:false}));
  s.position.set(n[0],n[1],n[2]);s.scale.setScalar(n[3]);deep.add(s);});
function bandTex(cols){return ctex(64,256,function(x,w,h){var y=0,i=0;while(y<h){var bh=10+Math.random()*26;x.fillStyle=cols[i%cols.length];x.fillRect(0,y,w,bh);y+=bh;i++;}});}
var farPlanet=new THREE.Group();farPlanet.position.set(-11,5.2,-15);deep.add(farPlanet);
(function(){var pl=new THREE.Mesh(new THREE.SphereGeometry(2.1,40,28),M(0xffffff,{map:bandTex(["#FF8FD0","#C04BFF","#FF6FB0","#8A3BE0","#FFB3E6"])}));pl.rotation.z=.35;farPlanet.add(pl);
  var rt=ctex(256,8,function(x,w){var g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,"rgba(255,216,102,0)");g.addColorStop(.2,"rgba(255,216,102,.9)");g.addColorStop(.5,"rgba(255,143,224,.7)");g.addColorStop(.75,"rgba(127,227,255,.85)");g.addColorStop(1,"rgba(127,227,255,0)");x.fillStyle=g;x.fillRect(0,0,w,8);});
  var rg=new THREE.RingGeometry(2.7,4.4,64,1),uv=rg.attributes.uv,p=rg.attributes.position,v=new THREE.Vector3();for(var i=0;i<p.count;i++){v.fromBufferAttribute(p,i);uv.setXY(i,(v.length()-2.7)/1.7,.5);}
  var ring=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({map:rt,transparent:true,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2+.42;ring.rotation.y=.35;farPlanet.add(ring);})();
var bluePlanet=new THREE.Mesh(new THREE.SphereGeometry(1.15,36,24),M(0xffffff,{map:bandTex(["#3FD7FF","#1F8BFF","#5CE6E0","#2A6BFF"])}));bluePlanet.position.set(12,7.5,-17);deep.add(bluePlanet);
var tinyMoon=new THREE.Mesh(new THREE.SphereGeometry(.35,20,14),M(0xD9DCE6));deep.add(tinyMoon);
var farRocks=new THREE.Group();deep.add(farRocks);

/* the stage: everything that also goes into AR */
var stage=new THREE.Group();scene.add(stage);
var ROCKC=[0x8F7BC8,0xB0785A,0x6F86C6,0xC48FB8,0x7D6EA8];
function rock(s,c){var m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,0),M(c,{flatShading:true}));m.scale.set(1,.75+Math.random()*.4,.85+Math.random()*.3);m.rotation.set(Math.random()*3,Math.random()*3,0);return m;}
// the sun
var sun=new THREE.Group();sun.position.y=1.5;stage.add(sun);
var sunTex=ctex(256,128,function(x,w,h){var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#FFB02E");g.addColorStop(.5,"#FFD34A");g.addColorStop(1,"#FF8A1F");x.fillStyle=g;x.fillRect(0,0,w,h);
  for(var i=0;i<160;i++){x.fillStyle="rgba(255,"+(110+Math.floor(Math.random()*120))+",30,"+(.25+Math.random()*.35)+")";x.beginPath();x.arc(Math.random()*w,Math.random()*h,2+Math.random()*9,0,7);x.fill();}});
var sunBall=new THREE.Mesh(new THREE.SphereGeometry(.8,48,32),new THREE.MeshBasicMaterial({map:sunTex,color:0xffffff}));sun.add(sunBall);
var sunGlow1=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0,"rgba(255,220,120,.95)"],[.35,"rgba(255,160,50,.55)"],[1,"rgba(255,90,40,0)"]]),transparent:true,depthWrite:false}));sunGlow1.scale.setScalar(3.8);sun.add(sunGlow1);
var sunGlow2=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0,"rgba(255,120,60,.45)"],[.5,"rgba(255,70,120,.16)"],[1,"rgba(255,70,120,0)"]]),transparent:true,depthWrite:false}));sunGlow2.scale.setScalar(8);sun.add(sunGlow2);
var corona=new THREE.Mesh(new THREE.TorusGeometry(1.04,.03,8,80),B(0xFFE07A,{transparent:true,opacity:.85}));sun.add(corona);
var corona2=new THREE.Mesh(new THREE.TorusGeometry(1.16,.022,8,80),B(0xFF8A3D,{transparent:true,opacity:.75}));corona2.rotation.x=Math.PI/2.4;sun.add(corona2);
var sunLight=new THREE.PointLight(0xFFB547,1.1,14,1.6);sunLight.position.y=1.55;stage.add(sunLight);
// orbits
var ORB=[[1.95,0x2AD4F7,.55],[3.35,0xFF5FD2,.42],[4.95,0x9D6BFF,.5],[6.2,0x2EE6A8,.32]];
var orbits=new THREE.Group();stage.add(orbits);
ORB.forEach(function(o){var t=new THREE.Mesh(new THREE.TorusGeometry(o[0],.022,6,160),B(o[1],{transparent:true,opacity:o[2]}));t.rotation.x=Math.PI/2;t.position.y=.02;orbits.add(t);});
// small planets on the inner orbit, like a moving model of the lesson
var mini=[];[[0xB7B0CC,.13],[0xFFD98A,.17],[0x3F9BFF,.18],[0xFF7A4A,.15]].forEach(function(p,i){var m=new THREE.Mesh(new THREE.SphereGeometry(p[1],20,14),M(p[0]));m.userData.a=i*1.57;stage.add(m);mini.push(m);});
// asteroid belt
var belt=new THREE.Group();stage.add(belt);
for(var bi=0;bi<34;bi++){var a=bi/34*Math.PI*2+Math.random()*.12,rr=5.45+Math.random()*.9,rk=rock(.07+Math.random()*.16,ROCKC[bi%ROCKC.length]);rk.position.set(Math.cos(a)*rr,(Math.random()-.5)*.5+.1,Math.sin(a)*rr);rk.userData.s=.5+Math.random();belt.add(rk);}
for(bi=0;bi<16;bi++){var fr=rock(.25+Math.random()*.5,ROCKC[bi%ROCKC.length]);var fa=Math.random()*Math.PI*2;fr.position.set(Math.cos(fa)*(12+Math.random()*10),(Math.random()-.3)*9,-6-Math.random()*16);farRocks.add(fr);}
// a little rocket on its own orbit
function mRocket(){var g=new THREE.Group(),pts=[];
  for(var i=0;i<=24;i++){var t=i/24;pts.push(new THREE.Vector2(.16*Math.sin(Math.PI*Math.min(1,t*1.08))*(t<.15?.75+t*1.6:1)+.001,t*.78-.05));}
  var body=new THREE.Mesh(new THREE.LatheGeometry(pts,28),M(0xF4F6FF));g.add(body);
  var nose=new THREE.Mesh(new THREE.ConeGeometry(.12,.2,24),M(0xFF4F7B));nose.position.y=.78;g.add(nose);
  var win=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.04,24),M(0x2AD4F7,{emissive:0x0a5a8a,emissiveIntensity:.6}));win.rotation.x=Math.PI/2;win.position.set(0,.45,.15);g.add(win);
  for(var f=0;f<3;f++){var fh=new THREE.Group();fh.rotation.y=f*Math.PI*2/3;var fin=new THREE.Mesh(new THREE.BoxGeometry(.03,.2,.14),M(0xFF4F7B));fin.position.set(0,.05,.17);fh.add(fin);g.add(fh);}
  var flame=new THREE.Mesh(new THREE.ConeGeometry(.08,.26,18),B(0xFFB12E,{transparent:true,opacity:.92}));flame.rotation.x=Math.PI;flame.position.y=-.16;g.add(flame);
  var flame2=new THREE.Mesh(new THREE.ConeGeometry(.045,.16,14),B(0xFFF2B0));flame2.rotation.x=Math.PI;flame2.position.y=-.12;g.add(flame2);
  g.userData.flame=flame;return g;}
var flyer=mRocket();flyer.scale.setScalar(.9);stage.add(flyer);
// AR base: a dark disc with a glowing rim, only when placed in a real room
var arBase=new THREE.Mesh(new THREE.CircleGeometry(7.1,80),M(0x161C56));arBase.rotation.x=-Math.PI/2;arBase.position.y=-.31;arBase.visible=false;stage.add(arBase);
var arRim=new THREE.Mesh(new THREE.TorusGeometry(7.1,.1,8,120),B(0x2AD4F7));arRim.rotation.x=-Math.PI/2;arRim.position.y=-.3;arRim.visible=false;stage.add(arRim);

// ---- object models
function mHelmet(){var g=new THREE.Group();
  var h=new THREE.Mesh(new THREE.SphereGeometry(.34,40,28),M(0xF4F6FF));h.position.y=.6;g.add(h);
  var vis=new THREE.Mesh(new THREE.SphereGeometry(.348,40,24,Math.PI/2-.95,1.9,.72,1.25),M(0xFFB43B,{emissive:0x8a3a00,emissiveIntensity:.35,side:THREE.DoubleSide}));vis.position.y=.6;g.add(vis);
  var shine=new THREE.Mesh(new THREE.SphereGeometry(.05,12,8),B(0xffffff));shine.position.set(-.12,.72,.3);g.add(shine);
  var neck=new THREE.Mesh(new THREE.TorusGeometry(.25,.07,12,40),M(0x9D6BFF));neck.rotation.x=Math.PI/2;neck.position.y=.28;g.add(neck);
  [-1,1].forEach(function(s){var ear=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.08,20),M(0x2AD4F7));ear.rotation.z=Math.PI/2;ear.position.set(s*.35,.6,0);g.add(ear);});
  var ant=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.22,6),M(0x9AA7D0));ant.position.set(.2,.98,0);g.add(ant);
  var tip=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),B(0xFF4F7B));tip.position.set(.2,1.1,0);g.add(tip);g.userData.blink=tip;return g;}
function mTarget(){var g=new THREE.Group();
  [[.48,0xFF4F7B,0],[.37,0xFFFFFF,.013],[.26,0xFF4F7B,.026],[.14,0xFFC83D,.039]].forEach(function(d){var m=new THREE.Mesh(new THREE.CylinderGeometry(d[0],d[0],.06,44),M(d[1]));m.rotation.x=Math.PI/2;m.position.set(0,.66,d[2]);g.add(m);});
  var leg=new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,.6,8),M(0x3B47B8));leg.position.set(0,.28,-.12);leg.rotation.x=-.25;g.add(leg);
  var ar=new THREE.Group(),sh=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.7,8),M(0x141A4E));sh.rotation.x=Math.PI/2;sh.position.z=.35;ar.add(sh);
  var fl=new THREE.Mesh(new THREE.ConeGeometry(.08,.18,3),M(0x2AD4F7));fl.rotation.x=Math.PI/2;fl.position.z=.68;ar.add(fl);
  ar.position.set(.03,.68,.05);ar.rotation.set(.22,.32,0);g.add(ar);
  var orb=new THREE.Group();orb.position.y=.66;g.add(orb);[0x2AD4F7,0xB7F23F].forEach(function(c,i){var p=new THREE.Mesh(new THREE.SphereGeometry(.06,14,10),M(c));p.position.set(Math.cos(i*3.1)*.62,Math.sin(i*3.1)*.62,0);orb.add(p);});
  g.userData.orb=orb;return g;}
function mBook(){var g=new THREE.Group(),bk=new THREE.Group();
  [-1,1].forEach(function(s){var h=new THREE.Group();var c=new THREE.Mesh(new THREE.BoxGeometry(.46,.035,.62),M(0x6C3BFF));c.position.x=s*.23;h.add(c);
    var p=new THREE.Mesh(new THREE.BoxGeometry(.42,.05,.56),M(0xFFFFFF));p.position.set(s*.22,.035,0);h.add(p);
    for(var i=0;i<4;i++){var l=new THREE.Mesh(new THREE.BoxGeometry(.3,.003,.025),M(0x9FA9E8));l.position.set(s*.22,.062,-.18+i*.11);h.add(l);}
    h.rotation.z=-s*.2;bk.add(h);});
  bk.rotation.x=.75;bk.position.y=.4;g.add(bk);
  var sys=new THREE.Group();sys.position.set(0,.95,0);g.add(sys);
  var s=new THREE.Mesh(new THREE.SphereGeometry(.12,20,14),B(0xFFC83D));sys.add(s);
  [[.22,0x3F9BFF,.05],[.34,0xFF7A4A,.045],[.46,0xF6DC8C,.07]].forEach(function(o,i){var p=new THREE.Mesh(new THREE.SphereGeometry(o[2],14,10),M(o[1]));p.position.set(Math.cos(i*2.2)*o[0],0,Math.sin(i*2.2)*o[0]);sys.add(p);
    var t=new THREE.Mesh(new THREE.TorusGeometry(o[0],.006,4,48),B(0xBAC2F3,{transparent:true,opacity:.6}));t.rotation.x=Math.PI/2;sys.add(t);});
  sys.rotation.x=.35;g.userData.spin=sys;return g;}
function mClip(){var g=new THREE.Group(),b=new THREE.Group();
  b.add(new THREE.Mesh(new THREE.BoxGeometry(.62,.82,.05),M(0x3B4BD8)));
  var pp=new THREE.Mesh(new THREE.BoxGeometry(.52,.66,.012),M(0xFFFFFF));pp.position.set(0,-.03,.032);b.add(pp);
  var cp=new THREE.Mesh(new THREE.BoxGeometry(.26,.08,.07),M(0xC9D2F0));cp.position.set(0,.39,.04);b.add(cp);
  for(var i=0;i<5;i++){var bx=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.008),M([0x2EE6A8,0xFF4F7B,0xFFC83D,0x2AD4F7,0x9D6BFF][i]));bx.position.set(.17,.2-i*.1,.04);b.add(bx);
    var l=new THREE.Mesh(new THREE.BoxGeometry(.3,.024,.006),M(0x9FA9E8));l.position.set(-.04,.2-i*.1,.04);b.add(l);}
  var st=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),M(0xFF5FD2));st.position.set(-.17,-.28,.06);b.add(st);
  b.position.y=.52;b.rotation.x=-.16;g.add(b);return g;}
function mGoggles(){var g=new THREE.Group();
  var body=new THREE.Mesh(new THREE.BoxGeometry(.5,.24,.2),M(0xFF5FD2));body.position.y=.62;g.add(body);
  [-1,1].forEach(function(s){var l=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.05,24),M(0x2AD4F7,{emissive:0x1a8ab0,emissiveIntensity:.7}));l.rotation.x=Math.PI/2;l.position.set(s*.12,.62,.11);g.add(l);});
  var strap=new THREE.Mesh(new THREE.TorusGeometry(.27,.03,8,40,Math.PI),M(0x141A4E));strap.rotation.x=-Math.PI/2;strap.position.set(0,.62,-.05);g.add(strap);
  var st=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.45,10),M(0x3B47B8));st.position.y=.27;g.add(st);
  var stars=new THREE.Group();stars.position.y=.98;g.add(stars);
  [0xFFC83D,0xFFFFFF,0x2AD4F7].forEach(function(c,i){var s=new THREE.Mesh(new THREE.OctahedronGeometry(.045,0),B(c));s.position.set((i-1)*.16,Math.sin(i*2)*.06,0);stars.add(s);});
  g.userData.twinkle=stars;return g;}
function mJoy(){var g=new THREE.Group();
  var base=new THREE.Mesh(new THREE.BoxGeometry(.66,.16,.46),M(0x6C3BFF));base.position.y=.12;g.add(base);
  var top=new THREE.Mesh(new THREE.BoxGeometry(.6,.03,.4),M(0x8F6BFF));top.position.y=.215;g.add(top);
  var stk=new THREE.Group();stk.position.set(-.12,.22,0);g.add(stk);
  var sh=new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,.36,10),M(0x141A4E));sh.position.y=.18;stk.add(sh);
  var ball=new THREE.Mesh(new THREE.SphereGeometry(.1,20,14),M(0xFF4F7B));ball.position.y=.38;stk.add(ball);
  [[.12,0xFFC83D],[.22,0x2AD4F7],[.17,0xB7F23F]].forEach(function(b,i){var bt=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.05,20),M(b[1]));bt.position.set(b[0]+(i===2?0:0),.24,i===2?-.1:.06*(i?1:-1)+.02);g.add(bt);});
  var star=new THREE.Mesh(new THREE.OctahedronGeometry(.09,0),B(0xFFC83D));star.position.set(.12,.8,0);g.add(star);g.userData.stick=stk;g.userData.star=star;return g;}
function starShape(r1,r2){var s=new THREE.Shape();for(var i=0;i<10;i++){var a=i*Math.PI/5+Math.PI/2,r=i%2?r2:r1;if(i)s.lineTo(Math.cos(a)*r,Math.sin(a)*r);else s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}s.closePath();return s;}
function mMedal(){var g=new THREE.Group(),md=new THREE.Group();md.position.y=.52;g.add(md);
  var d=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.06,40),M(0xFFC83D,{emissive:0x6a4200,emissiveIntensity:.25}));d.rotation.x=Math.PI/2;md.add(d);
  var rim=new THREE.Mesh(new THREE.TorusGeometry(.28,.03,8,40),M(0xFF8A3D));md.add(rim);
  var st=new THREE.Mesh(new THREE.ExtrudeGeometry(starShape(.17,.075),{depth:.03,bevelEnabled:false}),M(0xFFFFFF));st.position.z=.03;md.add(st);
  [[-1,0xFF4F7B],[1,0x2AD4F7]].forEach(function(r){var rb=new THREE.Mesh(new THREE.BoxGeometry(.14,.42,.02),M(r[1]));rb.position.set(r[0]*.09,.36,-.02);rb.rotation.z=-r[0]*.32;md.add(rb);});
  var ck=new THREE.Group();ck.position.set(.0,-.02,.05);g.userData.medal=md;return g;}
function mBall(){var g=new THREE.Group(),tex=new THREE.CanvasTexture(panoCanvas);panoTex.push(tex);
  var inner=new THREE.Mesh(new THREE.SphereGeometry(.38,48,32),new THREE.MeshBasicMaterial({map:tex}));inner.position.y=.64;g.add(inner);
  var shell=new THREE.Mesh(new THREE.SphereGeometry(.415,40,28),M(0xffffff,{transparent:true,opacity:.14}));shell.position.y=.64;g.add(shell);
  var r1=new THREE.Mesh(new THREE.TorusGeometry(.47,.018,8,64),B(0xFF5FD2));r1.position.y=.64;r1.rotation.x=Math.PI/2.3;g.add(r1);
  var st=new THREE.Mesh(new THREE.CylinderGeometry(.16,.26,.22,32),M(0x3B47B8));st.position.y=.11;g.add(st);
  var sr=new THREE.Mesh(new THREE.TorusGeometry(.2,.03,8,40),B(0x2AD4F7));sr.rotation.x=Math.PI/2;sr.position.y=.23;g.add(sr);
  g.userData.ball=inner;g.userData.ring=r1;return g;}
function mBooks(){var g=new THREE.Group();[0x9D6BFF,0xFF4F7B,0x2AD4F7].forEach(function(c,i){
  var b=new THREE.Mesh(new THREE.BoxGeometry(.62-i*.06,.14,.44-i*.03),M(c));b.position.y=.07+i*.145;b.rotation.y=(i-1)*.18;g.add(b);
  var p=new THREE.Mesh(new THREE.BoxGeometry(.6-i*.06,.11,.425-i*.03),M(0xF4EFE4));p.position.copy(b.position);p.position.x+=.016;p.rotation.copy(b.rotation);g.add(p);});
  var tel=new THREE.Group();tel.position.set(0,.5,0);tel.rotation.z=.6;g.add(tel);
  var tb=new THREE.Mesh(new THREE.CylinderGeometry(.045,.07,.42,16),M(0xFFC83D));tel.add(tb);var ln=new THREE.Mesh(new THREE.CylinderGeometry(.072,.072,.03,16),M(0x2AD4F7,{emissive:0x1a8ab0,emissiveIntensity:.6}));ln.position.y=.22;tel.add(ln);
  return g;}
function planetoid(acc){var g=new THREE.Group(),c=new THREE.Color(acc),dark=c.clone().multiplyScalar(.62),lite=c.clone().lerp(new THREE.Color(0xffffff),.12);
  var bowl=new THREE.Mesh(new THREE.SphereGeometry(.64,36,18,0,Math.PI*2,Math.PI/2,Math.PI/2),M(acc));bowl.scale.y=.62;bowl.position.y=.34;g.add(bowl);
  var top=new THREE.Mesh(new THREE.CylinderGeometry(.64,.64,.06,48),M(lite.getHex()));top.position.y=.36;g.add(top);
  for(var i=0;i<5;i++){var a=i*1.3+.4,cr=new THREE.Mesh(new THREE.SphereGeometry(.07+(i%3)*.025,12,8),M(dark.getHex()));cr.position.set(Math.cos(a)*.52,.16-(i%2)*.08,Math.sin(a)*.52);cr.scale.y=.5;g.add(cr);}
  return g;}

var ring=new THREE.Group();stage.add(ring);
var R=3.35, STEP=Math.PI*2/ITEMS.length, pickables=[], items=[];
var labelsBox=$("#labels");
function hexCss(n){return "#"+("00000"+n.toString(16)).slice(-6);}
ITEMS.forEach(function(it,i){
  var th=-i*STEP, grp=new THREE.Group();grp.position.set(R*Math.sin(th),0,R*Math.cos(th));grp.rotation.y=th;ring.add(grp);
  var ped=planetoid(it.accent);ped.position.y=-.06;grp.add(ped);ped.traverse(function(o){o.userData.key=it.key;});
  var halo=new THREE.Mesh(new THREE.TorusGeometry(.72,.035,8,64),M(0xFFE27A,{emissive:0xFFC83D,emissiveIntensity:.15}));halo.rotation.x=Math.PI/2;halo.position.y=.31;grp.add(halo);
  var model=new THREE.Group();model.position.y=.36;grp.add(model);
  var inner;
  switch(it.key){
    case "student":inner=mHelmet();break;case "objective":inner=mTarget();break;case "lesson":inner=mBook();break;case "plan":inner=mClip();break;
    case "tech":inner=new THREE.Group();var gg=mGoggles();gg.position.x=-.3;gg.scale.setScalar(.92);gg.userData.key="stellar";var rk2=mRocket();rk2.position.set(.3,.2,0);rk2.scale.setScalar(.95);rk2.userData.key="game";inner.add(gg,rk2);inner.userData.b=gg;inner.userData.d=rk2;break;
    case "activity":inner=mJoy();break;case "assess":inner=mMedal();break;case "pano":inner=mBall();break;case "refs":inner=mBooks();break;
  }
  if(!inner.userData.key && it.key!=="tech") inner.userData.key=it.key;
  model.add(inner);
  grp.traverse(function(o){if(o.isMesh)pickables.push(o);});
  var anchor=new THREE.Object3D();anchor.position.y=-.1;grp.add(anchor);
  var lbl=document.createElement("div");lbl.className="lbl";lbl.textContent=it.name;lbl.style.setProperty("--lc",hexCss(it.accent));labelsBox.appendChild(lbl);
  items.push({it:it,grp:grp,model:model,inner:inner,halo:halo,anchor:anchor,lbl:lbl,ped:ped});
});
function dotTex(){return glowTex([[0,"rgba(255,255,255,1)"],[.25,"rgba(255,240,170,.95)"],[1,"rgba(255,220,90,0)"]]);}
var SPN=30,spPos=new Float32Array(SPN*3),spData=[];
for(var si=0;si<SPN;si++){spData.push({a:Math.random()*Math.PI*2,r:.66+Math.random()*.5,y:.3+Math.random()*1.4,s:.35+Math.random()*.8});}
var spGeo=new THREE.BufferGeometry();spGeo.setAttribute("position",new THREE.BufferAttribute(spPos,3));
var sparkles=new THREE.Points(spGeo,new THREE.PointsMaterial({map:dotTex(),size:.22,transparent:true,opacity:.95,depthWrite:false,color:0xffffff}));
sparkles.position.set(0,0,R);sparkles.visible=false;stage.add(sparkles);
function clamp01(x){return x<0?0:x>1?1:x;}
function easeOutBack(x){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);}
var introT0=1e12,introDone=reduce,camStart=new THREE.Vector3(0,16,22),camTarget=new THREE.Vector3(),lookTarget=new THREE.Vector3();
if(/[?&]ql\b/.test(location.search))window.__ZN={stage:stage,ring:ring,items:items,sparkles:sparkles,STEP:STEP,R:R,ITEMS:ITEMS,arBase:arBase,arRim:arRim,sunGlows:[sunGlow1,sunGlow2],flyer:flyer,mini:mini};

/* ---------------- rail ---------------- */
var rail=$("#rail");
ITEMS.forEach(function(it,i){var b=document.createElement("button");b.type="button";b.textContent=it.name;b.dataset.i=i;b.style.setProperty("--c",hexCss(it.accent));
  b.addEventListener("click",function(){selectIndex(i);openPanel(it.key);});rail.appendChild(b);});

/* ---------------- layout ---------------- */
var W=1,H=1,viewX=0,viewY=0,viewXT=0,viewYT=0,sheetOpen=false;
function resize(){W=window.innerWidth;H=window.innerHeight;if(!renderer.xr.isPresenting)renderer.setSize(W,H,false);camera.aspect=W/H;
  var portrait=W/H<.85,narrow=W/H<.6;camera.fov=narrow?56:portrait?50:36;var dist=narrow?15.5:portrait?13.6:11.6;
  camTarget.set(0,narrow?6.6:portrait?5.6:4.4,dist);lookTarget.set(0,narrow?-.15:.75,0);
  if(introDone){camera.position.copy(camTarget);camera.lookAt(lookTarget);}
  updateViewTargets();camera.updateProjectionMatrix();}
function frontScreenY(){var c=camera.clone();c.clearViewOffset();c.updateProjectionMatrix();c.updateMatrixWorld();var v=new THREE.Vector3(0,1.1,R).project(c);return (-v.y+1)/2*H;}
function updateViewTargets(){var wide=W>=960;viewXT=(sheetOpen&&wide)?-245:0;
  viewYT=0;if(sheetOpen&&!wide){var sh=document.getElementById("sheet").offsetHeight;viewYT=Math.max(0,Math.round(frontScreenY()-(H-sh)*.58));}
  document.body.classList.toggle("sheet-open",sheetOpen);}
function applyView(){if(Math.abs(viewX)<.5&&Math.abs(viewY)<.5&&viewXT===0&&viewYT===0){if(camera.view&&camera.view.enabled){camera.clearViewOffset();}return;}
  camera.setViewOffset(W,H,viewX,viewY,W,H);}
window.addEventListener("resize",resize);resize();
function setFog(){deep.visible=!document.body.classList.contains("ar");}

/* ---------------- carousel ---------------- */
var rot=0,rotT=0,current=0;
function nearestFront(){return ((Math.round(rot/STEP)%ITEMS.length)+ITEMS.length)%ITEMS.length;}
function selectIndex(i){var base=i*STEP,k=Math.round((rotT-base)/(Math.PI*2));rotT=base+k*Math.PI*2;if(items[i])items[i].bounce=performance.now();}
function markCurrent(i){if(i===current&&rail.dataset.init)return;current=i;rail.dataset.init=1;
  Array.prototype.forEach.call(rail.children,function(b,j){b.setAttribute("aria-current",j===i?"true":"false");});
  items.forEach(function(o,j){o.lbl.classList.toggle("on",j===i);o.halo.material.emissiveIntensity=j===i?.95:.15;});
  var btn=rail.children[i];if(btn&&btn.scrollIntoView&&rail.scrollWidth>rail.clientWidth+4){btn.scrollIntoView({block:"nearest",inline:"center",behavior:reduce?"auto":"smooth"});}
  if(typeof sfx==="function"&&introDone&&rail.dataset.ready)sfx("tick");rail.dataset.ready=1;}
markCurrent(0);

var hint=$("#hint");function hideHint(){hint.classList.add("gone");}
setTimeout(hideHint,9000);
var drag=null;
canvas.addEventListener("pointerdown",function(e){drag={x:e.clientX,y:e.clientY,lx:e.clientX,moved:0,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",function(e){if(!drag||e.pointerId!==drag.id)return;var dx=e.clientX-drag.lx;drag.lx=e.clientX;drag.moved+=Math.abs(dx)+Math.abs(e.movementY||0);
  if(drag.moved>6){canvas.classList.add("dragging");rotT+=dx*.0065;rot+=dx*.0065;hideHint();}});
canvas.addEventListener("pointerup",function(e){if(!drag)return;var wasTap=drag.moved<=6;canvas.classList.remove("dragging");drag=null;
  if(wasTap){pick(e.clientX,e.clientY);}else{rotT=Math.round(rotT/STEP)*STEP;}});
canvas.addEventListener("pointercancel",function(){drag=null;canvas.classList.remove("dragging");rotT=Math.round(rotT/STEP)*STEP;});
var ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function pick(x,y){ndc.set(x/W*2-1,-(y/H)*2+1);setRay(ndc);var hit=ray.intersectObjects(pickables,false)[0];if(!hit)return;
  var o=hit.object,key=null;while(o){if(o.userData&&o.userData.key){key=o.userData.key;break;}o=o.parent;}if(!key)return;
  var idx=ITEMS.findIndex(function(it){return it.key===key;});if(idx<0)idx=4;selectIndex(idx);openPanel(key);hideHint();}
window.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&!actEl.hidden){closeAct();return;}
  if(e.key==="Escape"){if(!$("#pano").hidden){if(!$("#qcard").hidden)closeQ();else closePano();}else if(sheetOpen)closePanel();return;}
  if(sheetOpen||!$("#pano").hidden||!actEl.hidden||!$("#welcome").hidden)return;
  if(e.key==="ArrowLeft"){selectIndex((current+1)%ITEMS.length);}
  if(e.key==="ArrowRight"){selectIndex((current-1+ITEMS.length)%ITEMS.length);}
});

/* ---------------- sheet ---------------- */
var sheet=$("#sheet"),sheetBody=$("#sheetBody"),sheetInner=$("#sheetInner"),lastFocus=null,lenS=null,lenA=null;
function openPanel(key){
  var meta=ITEMS.find(function(it){return it.key===key;});
  $("#sheetKind").textContent=meta?meta.kind:"الكائن ٥ من ٩: التقنية الغامرة";
  $("#sheetTitle").textContent=meta?meta.name:TITLES[key][1];
  sheetInner.innerHTML=PANELS[key]();if(lenS)lenS.scrollTo(0,{immediate:true});else sheetBody.scrollTop=0;
  sheetInner.querySelectorAll(".idcard,.note").forEach(function(e){e.classList.add("glow");});
  wirePanel(key);sheetFx();
  lastFocus=document.activeElement;sheet.removeAttribute("inert");sheet.classList.add("open");sheetOpen=true;updateViewTargets();
  setTimeout(function(){$("#sheetTitle").focus({preventScroll:true});},reduce?0:60);
}
function closePanel(){sheet.classList.remove("open");sheet.setAttribute("inert","");sheetOpen=false;updateViewTargets();
  if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))lastFocus.focus({preventScroll:true});}
$("#sheetClose").addEventListener("click",closePanel);
var downloads=null,lessonArtURL=null;
function wirePanel(key){
  Array.prototype.forEach.call(sheetBody.querySelectorAll("[data-pano]"),function(b){b.addEventListener("click",function(){openPano();});});
  Array.prototype.forEach.call(sheetBody.querySelectorAll("[data-act]"),function(b){b.addEventListener("click",function(){openAct(+b.dataset.act);});});
  if(key==="plan"){
    var pg=0,img=$("#pimg"),n=D.pages.length;
    var show=function(){img.src=D.pages[pg];img.alt="خطة الدرس، الصفحة "+toAr(pg+1)+" من "+toAr(n);$("#pnum").textContent="الصفحة "+toAr(pg+1)+" من "+toAr(n);
      $("#pprev").disabled=pg===0;$("#pnext").disabled=pg===n-1;$("#vscroll").scrollTop=0;};
    $("#pprev").addEventListener("click",function(){if(pg>0){pg--;show();}});
    $("#pnext").addEventListener("click",function(){if(pg<n-1){pg++;show();}});
    $("#pzoom").addEventListener("click",function(){var z=$("#vscroll").classList.toggle("zoom");this.setAttribute("aria-pressed",z);this.textContent=z?"صغّر الصفحة":"كبّر الصفحة";});
    show();
    $("#dlpdf").addEventListener("click",function(){saveFile("pdf");});$("#dldoc").addEventListener("click",function(){saveFile("docx");});
  }
  if(key==="lesson"){if(!lessonArtURL)lessonArtURL=drawLessonArt();$("#lessonArt").src=lessonArtURL;}
  if(key==="assess"){var cP=$("#cP"),cM=$("#cM"),cR=$("#cR");var up=function(){var p=+cP.value,s=p+(cM.checked?1:0)+(cR.checked?1:0);
      $("#cPv").textContent=toAr(p)+" من ٨";$("#cS").textContent=toAr(s)+" / ١٠";
      $("#cT").textContent=s===10?"تحقق الهدف: صمّم التلميذ النظام الشمسي كاملًا.":s>=8?"يعيد التلميذ قسم (النظام الشمسي) ثم يعاود المحاولة.":"يعيد التلميذ جولة Stellarium مع المعلم.";};
    [cP,cM,cR].forEach(function(el){el.addEventListener("input",up);el.addEventListener("change",up);});up();}
  if(key==="pano"){var pv=$("#panoprev");if(pv){var c=document.createElement("canvas");c.width=1000;c.height=340;var x=c.getContext("2d");
    x.drawImage(panoCanvas,panoCanvas.width*10/360,panoCanvas.height*.3,panoCanvas.width*190/360,panoCanvas.height*.3,0,0,1000,340);pv.src=c.toDataURL("image/jpeg",.85);}}
}
var FILES={pdf:{name:"خطة درس الكواكب - قاسم عبدالنبي منصور.pdf",type:"application/pdf",label:"الخطة PDF"},
  docx:{name:"خطة درس الكواكب - قاسم عبدالنبي منصور.docx",type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",label:"الخطة Word"}};
function fileBlob(kind){var bin=atob(D[kind]),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:FILES[kind].type});}
function saveFile(kind){var f=FILES[kind];
  if(downloads){downloads.save({filename:f.name,data:fileBlob(kind)}).then(function(){toast("نزلت "+f.label+".");},function(err){
      if(err&&err.code==="declined")return;toast("لم يكتمل التنزيل. جرّب مرة أخرى بعد لحظات.");});return;}
  var a=document.createElement("a");a.href=URL.createObjectURL(fileBlob(kind));a.download=f.name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},2000);toast("بدأ تنزيل "+f.label+".");}
(function useDownloads(tries){if(window.claude&&typeof window.claude.use==="function"){window.claude.use("downloads").then(function(ns){downloads=ns;},function(){});}
  else if(tries<40){setTimeout(function(){useDownloads(tries+1);},250);}})(0);

/* the lesson illustration (drawn here, not a scan of the book) */
function drawLessonArt(){var c=document.createElement("canvas"),w=1200,h=640;c.width=w;c.height=h;var g=c.getContext("2d");
  var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,"#120A48");gr.addColorStop(.6,"#0B1452");gr.addColorStop(1,"#1A0B3D");g.fillStyle=gr;g.fillRect(0,0,w,h);
  [[200,120,260,"255,64,170",.35],[900,500,300,"42,170,255",.3],[700,120,220,"140,80,255",.4]].forEach(function(n){var r=g.createRadialGradient(n[0],n[1],0,n[0],n[1],n[2]);r.addColorStop(0,"rgba("+n[3]+","+n[4]+")");r.addColorStop(1,"rgba("+n[3]+",0)");g.fillStyle=r;g.fillRect(0,0,w,h);});
  for(var i=0;i<260;i++){g.fillStyle="rgba(255,255,255,"+(.3+Math.random()*.7)+")";g.beginPath();g.arc(Math.random()*w,Math.random()*h,Math.random()*1.6+.3,0,7);g.fill();}
  var sx=w+60,sy=h*.52,sr=230;var sg=g.createRadialGradient(sx,sy,sr*.5,sx,sy,sr*1.7);sg.addColorStop(0,"rgba(255,200,80,.9)");sg.addColorStop(1,"rgba(255,90,40,0)");g.fillStyle=sg;g.fillRect(0,0,w,h);
  var cg=g.createRadialGradient(sx-60,sy-60,20,sx,sy,sr);cg.addColorStop(0,"#FFF8D0");cg.addColorStop(.5,"#FFD34A");cg.addColorStop(1,"#FF8A1F");g.fillStyle=cg;g.beginPath();g.arc(sx,sy,sr,0,7);g.fill();
  var R0=[300,370,445,520,640,790,915,1025],RS=[11,17,18,14,46,38,26,25];
  g.font="700 26px Changa, Tahoma, sans-serif";g.textAlign="center";g.direction="rtl";
  PLANETS.forEach(function(p,k){var rr=R0[k];g.strokeStyle="rgba(186,194,243,.35)";g.lineWidth=2;g.beginPath();g.arc(sx,sy,rr,Math.PI*.72,Math.PI*1.28);g.stroke();
    var ang=Math.PI+((k%2)?-.09:.09)*(k<4?1.6:1),px=sx+Math.cos(ang)*rr,py=sy+Math.sin(ang)*rr,r=RS[k];
    if(p.id==="saturn"){g.strokeStyle="rgba(246,220,140,.9)";g.lineWidth=5;g.beginPath();g.ellipse(px,py,r*2,r*.5,-.3,0,7);g.stroke();}
    var pg=g.createRadialGradient(px-r*.35,py-r*.35,r*.1,px,py,r);pg.addColorStop(0,"#ffffff");pg.addColorStop(.3,p.c);pg.addColorStop(1,p.c2);g.fillStyle=pg;g.beginPath();g.arc(px,py,r,0,7);g.fill();
    if(p.id==="saturn"){g.strokeStyle="rgba(246,220,140,.9)";g.lineWidth=5;g.beginPath();g.ellipse(px,py,r*2,r*.5,-.3,0,Math.PI);g.stroke();}
    var ly=(k%2)?py+r+40:py-r-18;g.fillStyle="#F4F6FF";g.fillText(p.n,px,ly);g.fillStyle="#FFC83D";g.font="800 22px Changa, Tahoma, sans-serif";g.fillText(toAr(k+1),px,(k%2)?ly+28:ly-30);g.font="700 26px Changa, Tahoma, sans-serif";});
  g.fillStyle="#FFC83D";g.font="800 30px Changa, Tahoma, sans-serif";g.textAlign="right";g.fillText("الشمس",w-24,sy+sr*.0+10);
  g.fillStyle="rgba(244,246,255,.85)";g.font="700 24px Changa, Tahoma, sans-serif";g.textAlign="center";g.fillText("الكواكب الثمانية مرتبة من الأقرب إلى الشمس إلى الأبعد",w*.45,h-26);
  return c.toDataURL("image/jpeg",.9);}

var toastEl=$("#toast"),toastT=0;
function toast(msg){toastEl.textContent=msg;toastEl.classList.add("show");clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove("show");},6000);}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[data-game]");if(!a)return;
  if(!gameReady()){e.preventDefault();toast("رابط لعبة (رائد الفضاء الصغير) يُضاف هنا عند نشرها.");}});

/* ---------------- camera (AR) ---------------- */
var stream=null,camBtn=$("#camBtn"),video=$("#cam");
camBtn.addEventListener("click",function(){
  if(stream){stream.getTracks().forEach(function(t){t.stop();});stream=null;video.srcObject=null;document.body.classList.remove("ar");setFog();
    camBtn.setAttribute("aria-pressed","false");camBtn.querySelector("span:last-child").textContent="شغّل الكاميرا";return;}
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast("هذا المتصفح لا يتيح الكاميرا. افتح الرابط في Chrome أو Safari على الجهاز.");return;}
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false}).then(function(s){stream=s;video.srcObject=s;return video.play();}).then(function(){
    document.body.classList.add("ar");setFog();camBtn.setAttribute("aria-pressed","true");camBtn.querySelector("span:last-child").textContent="أوقف الكاميرا";
  }).catch(function(){toast("لم تعمل الكاميرا هنا. افتح الرابط في متصفح الجهاز مباشرة، ثم اسمح للصفحة باستخدام الكاميرا.");});
});
$("#tourBtn").addEventListener("click",function(){openPano();});

/* ---------------- main loop ---------------- */
var running=true,last=performance.now(),tmp=new THREE.Vector3(),sv=new THREE.Vector3();
function loop(t,frame){xrFrame(frame);if(!running){last=t;return;}
  var dt=Math.min((t-last)/1000,.05),time=t/1000;last=t;
  var ie=t-introT0;
  if(!introDone){var ik=clamp01(ie/2100),ke=1-Math.pow(1-ik,3);camera.position.lerpVectors(camStart,camTarget,ke);camera.lookAt(lookTarget);if(ik>=1)introDone=true;}
  rot+=(rotT-rot)*Math.min(1,dt*7);ring.rotation.y=rot;
  var f=nearestFront();if(f!==current)markCurrent(f);
  viewX+=(viewXT-viewX)*Math.min(1,dt*8);viewY+=(viewYT-viewY)*Math.min(1,dt*8);applyView();camera.updateProjectionMatrix();
  if(!reduce){sunBall.rotation.y=time*.12;var pul=1+Math.sin(time*1.6)*.05;sunGlow1.scale.setScalar(3.8*pul);sunGlow2.scale.setScalar(7*(2-pul));corona.rotation.z=time*.3;corona2.rotation.z=-time*.4;
    deep.rotation.y=time*.006;farPlanet.rotation.y=time*.05;bluePlanet.rotation.y=time*.12;tinyMoon.position.set(bluePlanet.position.x+Math.cos(time*.6)*2,bluePlanet.position.y+Math.sin(time*.6)*.5,bluePlanet.position.z+Math.sin(time*.6)*2);
    belt.rotation.y=time*.03;belt.children.forEach(function(r){r.rotation.x+=dt*r.userData.s*.6;r.rotation.y+=dt*r.userData.s*.4;});
    farRocks.children.forEach(function(r,i){r.rotation.x+=dt*.1*(1+i%3);});
    mini.forEach(function(m,i){var a=m.userData.a+time*(.5-i*.08);m.position.set(Math.cos(a)*1.95,.05+Math.sin(time+i)*.04,Math.sin(a)*1.95);m.rotation.y+=dt;});
    var fa=time*.32;flyer.position.set(Math.cos(fa)*5.7,2.9+Math.sin(time*.9)*.35,Math.sin(fa)*5.7);flyer.rotation.set(0,-fa-Math.PI/2,0);flyer.rotateZ(-Math.PI/2);flyer.rotateY(Math.sin(time*1.4)*.3);
    flyer.userData.flame.scale.y=.8+Math.random()*.5;}
  items.forEach(function(o,j){var front=j===current,s=front?1.16:1;sv.set(s,s,s);o.model.scale.lerp(sv,Math.min(1,dt*8));
    var gp=reduce?1:clamp01((ie-450-j*95)/650);o.grp.scale.setScalar(gp>=1?1:Math.max(.001,easeOutBack(gp)));
    var by=0;if(o.bounce){var bt=(t-o.bounce)/700;if(bt<1)by=Math.sin(bt*Math.PI)*.5*(1-bt*.4);else o.bounce=0;}
    if(!reduce){o.model.position.y=.36+Math.sin(time*1.4+j)*.04+by;o.ped.position.y=-.06+Math.sin(time*1.1+j*.7)*.03;o.inner.rotation.y=front?Math.sin(time*.8)*.35:o.inner.rotation.y*.95;
      var u=o.inner.userData;
      if(u.spin)u.spin.rotation.y+=dt*(front?1.6:.8);
      if(u.ball)u.ball.rotation.y+=dt*.25;if(u.ring)u.ring.rotation.z+=dt*.8;
      if(u.blink)u.blink.material.color.setHex(Math.sin(time*5)>0?0xFF4F7B:0xFFC83D);
      if(u.orb)u.orb.rotation.z+=dt*1.2;
      if(u.medal)u.medal.rotation.y=Math.sin(time*1.3)*.5;
      if(u.stick){u.stick.rotation.z=Math.sin(time*2.2)*.35;u.stick.rotation.x=Math.cos(time*1.7)*.25;u.star.rotation.y+=dt*2;u.star.position.y=.8+Math.sin(time*2)*.06;}
      if(u.b){u.b.position.y=Math.sin(time*1.1)*.05;u.b.userData.twinkle.rotation.y+=dt;u.d.position.y=.2+Math.abs(Math.sin(time*1.6))*.12;u.d.userData.flame.scale.y=.7+Math.random()*.6;}
      o.halo.scale.setScalar(front?1+Math.sin(time*3)*.04:1);}
    o.anchor.getWorldPosition(tmp);stage.worldToLocal(tmp);var zf=Math.max(0,Math.min(1,(tmp.z+R)/(2*R)));stage.localToWorld(tmp);tmp.project(PC());
    var lx=(tmp.x+1)/2*W,ly=(-tmp.y+1)/2*H;
    o.lbl.style.transform="translate("+lx.toFixed(1)+"px,"+ly.toFixed(1)+"px) translate(-50%,0) scale("+(.78+.26*zf).toFixed(3)+")";
    o.lbl.style.opacity=((front?1:(.5+.5*zf))*clamp01((ie-900-j*95)/400)).toFixed(2);o.lbl.style.zIndex=String(Math.round(zf*100));});
  sparkles.visible=introDone&&!reduce&&!drag;
  if(sparkles.visible){for(var si2=0;si2<SPN;si2++){var d2=spData[si2];d2.a+=dt*d2.s;var q=si2*3;spPos[q]=Math.cos(d2.a)*d2.r;spPos[q+1]=d2.y+Math.sin(time*2+d2.a)*.1;spPos[q+2]=Math.sin(d2.a)*d2.r;}
    spGeo.attributes.position.needsUpdate=true;sparkles.material.opacity=.55+.4*Math.sin(time*3);}
  if(!window.__AR8on)renderer.render(scene,camera);}
renderer.setAnimationLoop(loop);
