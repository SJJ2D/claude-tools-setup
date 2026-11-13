/* ===== the one link to fill in: the published game «رائد الفضاء الصغير» ===== */
var GAME_URL = "https://claude.ai/artifact/466imp5M4GvFKvrocomw6e";
var STELLARIUM_URL = "https://stellarium-web.org";
(function(){
"use strict";
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
var $ = function(s){return document.querySelector(s);};
var D = window.__DATA;
function toAr(n){return String(n).replace(/\d/g,function(d){return "٠١٢٣٤٥٦٧٨٩"[d];});}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
function gameReady(){return /^https?:\/\//.test(GAME_URL);}
function gameLink(label,cls){return '<a class="'+(cls||"cta")+'" data-game href="'+esc(GAME_URL)+'" target="_blank" rel="noopener">'+label+'</a>';}
function stelLink(label,cls){return '<a class="'+(cls||"cta alt")+'" href="'+STELLARIUM_URL+'" target="_blank" rel="noopener">'+label+'</a>';}

/* ---------------- the eight planets (order from the sun) and the two bodies that are not planets ---------------- */
var PLANETS=[
 {id:"mercury",n:"عطارد",ord:"الأول",c:"#B7B0CC",c2:"#6E6884"},
 {id:"venus",n:"الزهرة",ord:"الثاني",c:"#FFD98A",c2:"#E0943E"},
 {id:"earth",n:"الأرض",ord:"الثالث",c:"#3F9BFF",c2:"#1A4FC0"},
 {id:"mars",n:"المريخ",ord:"الرابع",c:"#FF7A4A",c2:"#B7341A"},
 {id:"jupiter",n:"المشتري",ord:"الخامس",c:"#F3BE86",c2:"#C1703F"},
 {id:"saturn",n:"زحل",ord:"السادس",c:"#F6DC8C",c2:"#C99A45"},
 {id:"uranus",n:"أورانوس",ord:"السابع",c:"#8DF3F0",c2:"#2FB5CB"},
 {id:"neptune",n:"نبتون",ord:"الثامن",c:"#5C86FF",c2:"#1E2FA8"}];
var NONP=[{id:"moon",n:"القمر",c:"#D9DCE6",c2:"#8E93A6",why:"يتبع كوكبًا هو الأرض"},{id:"probe",n:"مسبار الفضاء",c:"#C8D2DC",c2:"#6E7C8A",why:"آلة تُطلق من الأرض"}];
function pgrad(p){return "radial-gradient(circle at 34% 30%,#ffffff 0,"+p.c+" 30%,"+p.c2+" 100%)";}
function byId(id){return PLANETS.concat(NONP).find(function(p){return p.id===id;});}

/* ---------------- panorama painted in code: inside a space-station dome, the sun and the eight planets around ---------------- */
var PANO_AZ={sun:180,mercury:154,venus:128,earth:100,moon:86,mars:66,jupiter:34,saturn:356,uranus:318,neptune:284};
var PANO_EL={sun:9,mercury:9,venus:11,earth:6,moon:21,mars:9,jupiter:14,saturn:12,uranus:11,neptune:8};
var PANO_R={sun:150,mercury:34,venus:54,earth:60,moon:22,mars:44,jupiter:122,saturn:92,uranus:66,neptune:64};
function paintPanorama(c){
  var W=4096,H=2048;c.width=W;c.height=H;var g=c.getContext("2d");
  var X=function(az){return ((az%360)+360)%360/360*W;};
  var Y=function(el){return (90-el)/180*H;};
  var seed=7;var rnd=function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  var PI=Math.PI,DEG=W/360;
  var stretch=function(el){return 1/Math.max(.12,Math.cos(el*PI/180));};
  function wrap(x,r,fn){fn(x);if(x-r<0)fn(x+W);if(x+r>W)fn(x-W);}
  // deep space
  var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#05041C");gr.addColorStop(.32,"#140A48");gr.addColorStop(.5,"#0D1556");gr.addColorStop(.6,"#0A0F3C");gr.addColorStop(1,"#05061A");
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  function blob(az,el,rx,ry,col,a){var k=rx*stretch(el)/ry;wrap(X(az),rx*stretch(el),function(x){g.save();g.translate(x,Y(el));g.scale(k,1);
    var rg=g.createRadialGradient(0,0,0,0,0,ry);rg.addColorStop(0,"rgba("+col+","+a+")");rg.addColorStop(.45,"rgba("+col+","+(a*.5)+")");rg.addColorStop(1,"rgba("+col+",0)");
    g.fillStyle=rg;g.beginPath();g.arc(0,0,ry,0,PI*2);g.fill();g.restore();});}
  blob(112,26,640,250,"255,60,170",.34);blob(62,36,520,220,"140,80,255",.4);blob(330,24,620,240,"40,180,255",.3);blob(14,32,520,200,"255,90,120",.26);
  blob(250,30,700,260,"120,60,255",.32);blob(205,16,460,190,"255,140,60",.24);blob(150,42,480,170,"60,220,220",.22);blob(300,46,400,160,"255,95,210",.26);
  // milky way band
  for(var i=0;i<3000;i++){var az=rnd()*360,el=20*Math.sin((az-40)*PI/180)+(rnd()-.5)*18*rnd();var a=.08+rnd()*.3;
    g.fillStyle="rgba("+(rnd()<.5?"230,220,255":"200,230,255")+","+a+")";var rr=.6+rnd()*1.6;g.beginPath();g.ellipse(X(az),Y(el),rr*stretch(el),rr,0,0,PI*2);g.fill();}
  // stars
  var SC=["255,255,255","200,225,255","255,240,200","255,200,235","190,255,250"];
  for(i=0;i<3400;i++){az=rnd()*360;el=Math.asin(2*rnd()-1)*180/PI;var r=.7+Math.pow(rnd(),3)*2.6,col=SC[Math.floor(rnd()*SC.length)];
    g.fillStyle="rgba("+col+","+(.45+rnd()*.55)+")";g.beginPath();g.ellipse(X(az),Y(el),r*stretch(el),r,0,0,PI*2);g.fill();
    if(r>2.6&&Math.abs(el)<60){g.strokeStyle="rgba("+col+",.55)";g.lineWidth=1.2;var x=X(az),y=Y(el);g.beginPath();g.moveTo(x-r*4,y);g.lineTo(x+r*4,y);g.moveTo(x,y-r*4);g.lineTo(x,y+r*4);g.stroke();}}
  // the sun
  (function(){var x=X(PANO_AZ.sun),y=Y(PANO_EL.sun),r=PANO_R.sun;
    var rg=g.createRadialGradient(x,y,r*.6,x,y,r*6);rg.addColorStop(0,"rgba(255,214,90,.95)");rg.addColorStop(.18,"rgba(255,150,50,.55)");rg.addColorStop(.5,"rgba(255,80,60,.16)");rg.addColorStop(1,"rgba(255,80,60,0)");
    g.fillStyle=rg;g.beginPath();g.arc(x,y,r*6,0,PI*2);g.fill();
    g.save();g.translate(x,y);for(var k=0;k<28;k++){g.rotate(PI*2/28);var L=r*(1.35+((k*37)%7)/9);var sg=g.createLinearGradient(r*.9,0,L,0);sg.addColorStop(0,"rgba(255,210,90,.75)");sg.addColorStop(1,"rgba(255,140,40,0)");
      g.fillStyle=sg;g.beginPath();g.moveTo(r*.92,-r*.07);g.lineTo(L,0);g.lineTo(r*.92,r*.07);g.fill();}g.restore();
    var cg=g.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);cg.addColorStop(0,"#FFFBE2");cg.addColorStop(.45,"#FFDA4F");cg.addColorStop(.85,"#FF9A1F");cg.addColorStop(1,"#FF6A1A");
    g.fillStyle=cg;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();
    g.save();g.beginPath();g.arc(x,y,r,0,PI*2);g.clip();for(k=0;k<70;k++){var a2=rnd()*PI*2,d=rnd()*r;g.fillStyle="rgba(255,"+(120+Math.round(rnd()*90))+",40,"+(.15+rnd()*.2)+")";
      g.beginPath();g.arc(x+Math.cos(a2)*d,y+Math.sin(a2)*d,6+rnd()*18,0,PI*2);g.fill();}g.restore();})();
  // planets
  function lightDir(az){var d=((180-az)%360+360)%360;return d<180?1:-1;}
  function body(id,paint){var az=PANO_AZ[id],el=PANO_EL[id],r=PANO_R[id],k=stretch(el),lx=lightDir(az);
    wrap(X(az),r*3*k,function(x){g.save();g.translate(x,Y(el));g.scale(k,1);
      var p=byId(id)||{c:"#fff",c2:"#888"};
      var at=g.createRadialGradient(0,0,r*.9,0,0,r*1.6);at.addColorStop(0,"rgba(255,255,255,.18)");at.addColorStop(.25,hexA(p.c,.28));at.addColorStop(1,hexA(p.c,0));
      g.fillStyle=at;g.beginPath();g.arc(0,0,r*1.6,0,PI*2);g.fill();
      if(paint.back)paint.back(r,lx);
      g.save();g.beginPath();g.arc(0,0,r,0,PI*2);g.clip();
      var bg=g.createLinearGradient(0,-r,0,r);bg.addColorStop(0,p.c);bg.addColorStop(1,p.c2);g.fillStyle=bg;g.fillRect(-r,-r,r*2,r*2);
      paint.surf(r,lx);
      var sh=g.createRadialGradient(lx*r*.45,-r*.32,r*.05,lx*r*.2,-r*.1,r*1.45);sh.addColorStop(0,"rgba(255,255,255,.32)");sh.addColorStop(.42,"rgba(255,255,255,0)");sh.addColorStop(.75,"rgba(5,4,30,.35)");sh.addColorStop(1,"rgba(5,4,30,.82)");
      g.fillStyle=sh;g.fillRect(-r,-r,r*2,r*2);g.restore();
      if(paint.front)paint.front(r,lx);
      g.restore();});}
  function hexA(h,a){h=h.replace("#","");return "rgba("+parseInt(h.substr(0,2),16)+","+parseInt(h.substr(2,2),16)+","+parseInt(h.substr(4,2),16)+","+a+")";}
  function craters(r,n,col,rim){for(var q=0;q<n;q++){var a=rnd()*PI*2,d=Math.sqrt(rnd())*r*.85,cr=r*(.06+rnd()*.13),cx=Math.cos(a)*d,cy=Math.sin(a)*d;
    g.fillStyle=col;g.beginPath();g.arc(cx,cy,cr,0,PI*2);g.fill();g.strokeStyle=rim;g.lineWidth=Math.max(1.5,cr*.22);g.beginPath();g.arc(cx-cr*.1,cy-cr*.1,cr,PI*.9,PI*1.7);g.stroke();}}
  function bands(r,cols,wob){var y=-r;var q=0;while(y<r){var h=r*(.1+rnd()*.16);g.fillStyle=cols[q%cols.length];g.beginPath();g.moveTo(-r,y);
    for(var xx=-r;xx<=r;xx+=r/10)g.lineTo(xx,y+Math.sin(xx/r*5+q)*r*wob);g.lineTo(r,y+h);g.lineTo(-r,y+h);g.closePath();g.fill();y+=h;q++;}}
  body("mercury",{surf:function(r){craters(r,11,"rgba(90,84,110,.55)","rgba(235,230,250,.45)");}});
  body("venus",{surf:function(r){g.strokeStyle="rgba(255,246,214,.55)";g.lineWidth=r*.12;g.lineCap="round";
    for(var q=0;q<6;q++){g.beginPath();g.arc(r*(rnd()-.5),r*(rnd()-.5),r*(.3+rnd()*.5),rnd()*PI,rnd()*PI+PI*.8);g.stroke();}}});
  body("earth",{surf:function(r){var og=g.createLinearGradient(0,-r,0,r);og.addColorStop(0,"#3FA6FF");og.addColorStop(1,"#1240B0");g.fillStyle=og;g.fillRect(-r,-r,r*2,r*2);
    [[-.35,-.25,.42,.3,"#3DBE5C"],[.3,.15,.38,.26,"#2FA552"],[-.1,.45,.3,.16,"#E8C36A"],[.45,-.45,.2,.14,"#46C863"]].forEach(function(b){g.fillStyle=b[4];g.beginPath();
      g.ellipse(b[0]*r,b[1]*r,b[2]*r,b[3]*r,rnd()*PI,0,PI*2);g.fill();g.beginPath();g.ellipse(b[0]*r+b[2]*r*.6,b[1]*r+b[3]*r*.5,b[2]*r*.5,b[3]*r*.6,0,0,PI*2);g.fill();});
    g.fillStyle="#F2F8FF";g.beginPath();g.ellipse(0,-r*.93,r*.5,r*.14,0,0,PI*2);g.fill();
    g.strokeStyle="rgba(255,255,255,.75)";g.lineWidth=r*.07;g.lineCap="round";for(var q=0;q<5;q++){g.beginPath();g.arc(r*(rnd()-.5)*1.4,r*(rnd()-.5)*1.4,r*(.25+rnd()*.3),rnd()*PI,rnd()*PI+PI*.6);g.stroke();}}});
  body("moon",{surf:function(r){craters(r,7,"rgba(120,124,145,.6)","rgba(255,255,255,.4)");}});
  body("mars",{surf:function(r){g.fillStyle="rgba(140,40,20,.55)";for(var q=0;q<6;q++){g.beginPath();g.ellipse(r*(rnd()-.5)*1.5,r*(rnd()-.5)*1.3,r*(.12+rnd()*.25),r*(.06+rnd()*.12),rnd()*PI,0,PI*2);g.fill();}
    g.fillStyle="#FFF4EE";g.beginPath();g.ellipse(0,-r*.95,r*.4,r*.12,0,0,PI*2);g.fill();}});
  body("jupiter",{surf:function(r,lx){bands(r,["#F8DDB3","#D98E55","#F2C690","#B8673C","#EFD0A6","#C9824F","#F6E2C2"],.03);
    g.fillStyle="#C8462A";g.beginPath();g.ellipse(-lx*r*.25,r*.3,r*.22,r*.12,0,0,PI*2);g.fill();g.strokeStyle="rgba(255,230,200,.6)";g.lineWidth=r*.03;g.stroke();}});
  var ringBack=function(r){ring(r,PI,PI*2);},ringFront=function(r){ring(r,0,PI);};
  function ring(r,a0,a1){g.save();g.rotate(-.22);[[2.35,.06,"rgba(240,214,150,.55)"],[2.15,.1,"rgba(250,228,170,.85)"],[1.9,.12,"rgba(214,180,110,.8)"],[1.62,.08,"rgba(255,236,190,.6)"]].forEach(function(b){
      g.strokeStyle=b[2];g.lineWidth=r*b[1];g.beginPath();g.ellipse(0,0,r*b[0],r*b[0]*.26,0,a0,a1);g.stroke();});g.restore();}
  body("saturn",{back:ringBack,front:ringFront,surf:function(r){bands(r,["#FBE7A8","#E6C070","#F7DB92","#D4A75A","#FAEAB8"],.015);}});
  body("uranus",{back:function(r){g.save();g.rotate(1.35);g.strokeStyle="rgba(200,255,255,.35)";g.lineWidth=r*.05;g.beginPath();g.ellipse(0,0,r*1.7,r*.3,0,PI,PI*2);g.stroke();g.restore();},
    front:function(r){g.save();g.rotate(1.35);g.strokeStyle="rgba(200,255,255,.45)";g.lineWidth=r*.05;g.beginPath();g.ellipse(0,0,r*1.7,r*.3,0,0,PI);g.stroke();g.restore();},
    surf:function(r){g.fillStyle="rgba(255,255,255,.18)";g.fillRect(-r,-r*.15,r*2,r*.18);}});
  body("neptune",{surf:function(r,lx){g.strokeStyle="rgba(170,200,255,.5)";g.lineWidth=r*.05;for(var q=0;q<4;q++){var yy=r*(-.5+q*.32);g.beginPath();g.moveTo(-r*.7,yy);g.quadraticCurveTo(0,yy-r*.08,r*.7,yy);g.stroke();}
    g.fillStyle="#11207A";g.beginPath();g.ellipse(-lx*r*.15,r*.2,r*.2,r*.12,0,0,PI*2);g.fill();}});
  // glass sheen
  g.save();for(i=0;i<14;i++){var sx=rnd()*W,sw=40+rnd()*120;var sg=g.createLinearGradient(sx,0,sx+sw,0);sg.addColorStop(0,"rgba(160,200,255,0)");sg.addColorStop(.5,"rgba(160,200,255,.05)");sg.addColorStop(1,"rgba(160,200,255,0)");
    g.fillStyle=sg;g.beginPath();g.moveTo(sx,Y(48));g.lineTo(sx+sw,Y(48));g.lineTo(sx+sw-160,Y(-10));g.lineTo(sx-160,Y(-10));g.closePath();g.fill();}g.restore();
  // ceiling of the dome
  gr=g.createLinearGradient(0,Y(84),0,Y(48));gr.addColorStop(0,"#0E1240");gr.addColorStop(1,"#1D2366");g.fillStyle=gr;g.fillRect(0,Y(84),W,Y(48)-Y(84));
  function hline(el,col,w,blur){g.save();g.strokeStyle=col;g.lineWidth=w;if(blur){g.shadowColor=col;g.shadowBlur=blur;}g.beginPath();g.moveTo(0,Y(el));g.lineTo(W,Y(el));g.stroke();g.restore();}
  for(i=0;i<48;i++){var cx=i*W/48;g.strokeStyle="rgba(70,84,200,.55)";g.lineWidth=3;g.beginPath();g.moveTo(cx,Y(84));g.lineTo(cx,Y(52));g.stroke();}
  hline(60,"#2AD4F7",5,16);hline(71,"#FF5FD2",5,16);hline(84,"#9D6BFF",8,10);
  for(i=0;i<36;i++){var lx2=(i+.5)*W/36;g.fillStyle=i%3?"#FFC83D":"#2AD4F7";g.beginPath();g.ellipse(lx2,Y(66),5*stretch(66)*.4,5,0,0,PI*2);g.fill();}
  // upper window frame
  gr=g.createLinearGradient(0,Y(53),0,Y(46));gr.addColorStop(0,"#2C347C");gr.addColorStop(.6,"#1A2060");gr.addColorStop(1,"#3B47B8");g.fillStyle=gr;g.fillRect(0,Y(53),W,Y(46)-Y(53));
  hline(46.6,"#FF5FD2",5,18);
  // ribs between the planets
  var RIBS=[194,166,141,114,76,50,15,337,301,262,236,212];
  RIBS.forEach(function(az){for(var e=-10;e<53;e+=1){var w=24*Math.min(stretch(e),2.4),x=X(az),y0=Y(e+1),y1=Y(e);
      g.fillStyle="#1A2060";g.fillRect(x-w/2,y0,w,y1-y0+1);g.fillStyle="#3B47B8";g.fillRect(x-w/2,y0,3,y1-y0+1);g.fillStyle="#0C0F33";g.fillRect(x+w/2-4,y0,4,y1-y0+1);
      g.fillStyle="rgba(42,212,247,.85)";g.fillRect(x-1.5,y0,3,y1-y0+1);}
    if(X(az)<30){}});
  // lower window sill
  gr=g.createLinearGradient(0,Y(-10),0,Y(-18));gr.addColorStop(0,"#3A46B6");gr.addColorStop(.25,"#232A78");gr.addColorStop(1,"#141A4E");g.fillStyle=gr;g.fillRect(0,Y(-10),W,Y(-18)-Y(-10));
  hline(-10,"#2AD4F7",6,20);
  for(i=0;i<72;i++){var bx=(i+.5)*W/72;g.fillStyle=["#FFC83D","#FF4F7B","#2EE6A8","#2AD4F7"][i%4];g.beginPath();g.arc(bx,Y(-14),4.5,0,PI*2);g.fill();}
  // floor of the station
  gr=g.createLinearGradient(0,Y(-18),0,H);gr.addColorStop(0,"#1B2160");gr.addColorStop(.4,"#11164A");gr.addColorStop(1,"#0B0E33");g.fillStyle=gr;g.fillRect(0,Y(-18),W,H-Y(-18));
  for(i=0;i<24;i++){var fx=i*W/24;g.strokeStyle="rgba(76,90,210,.55)";g.lineWidth=3;g.beginPath();g.moveTo(fx,Y(-18));g.lineTo(fx,H);g.stroke();}
  [-26,-36,-50,-66].forEach(function(e){hline(e,"rgba(76,90,210,.6)",3);});
  hline(-42,"#2AD4F7",6,22);hline(-80,"#FF5FD2",8,16);hline(-86,"#FFC83D",6,10);
  // control console behind the student (az 210-262)
  (function(){var a0=206,a1=262,top=Y(-8),mid=Y(-17),bot=Y(-27);
    g.fillStyle="#232A78";g.beginPath();g.moveTo(X(a0),top);g.lineTo(X(a1),top);g.lineTo(X(a1)+30,mid);g.lineTo(X(a0)-30,mid);g.closePath();g.fill();
    g.fillStyle="#161B55";g.beginPath();g.moveTo(X(a0)-30,mid);g.lineTo(X(a1)+30,mid);g.lineTo(X(a1)+10,bot);g.lineTo(X(a0)-10,bot);g.closePath();g.fill();
    g.strokeStyle="#2AD4F7";g.lineWidth=4;g.beginPath();g.moveTo(X(a0)-30,mid);g.lineTo(X(a1)+30,mid);g.stroke();
    for(var q=0;q<26;q++){var bx2=X(a0)+(q+.5)*(X(a1)-X(a0))/26;g.fillStyle=["#FF4F7B","#FFC83D","#2EE6A8","#2AD4F7","#9D6BFF"][q%5];rrect2(bx2-14,Y(-12)-8,28,16,5);g.fill();}
    // screens rising above the sill
    function screen(x0,x1,y0,y1,fn){g.fillStyle="#05061A";rrect2(x0-8,y0-8,x1-x0+16,y1-y0+16,18);g.fill();var sgr=g.createLinearGradient(0,y0,0,y1);sgr.addColorStop(0,"#0B2A6A");sgr.addColorStop(1,"#071640");
      g.fillStyle=sgr;rrect2(x0,y0,x1-x0,y1-y0,12);g.fill();g.save();g.beginPath();rrect2(x0,y0,x1-x0,y1-y0,12);g.clip();fn(x0,y0,x1-x0,y1-y0);g.restore();
      g.strokeStyle="#2AD4F7";g.lineWidth=3;rrect2(x0,y0,x1-x0,y1-y0,12);g.stroke();}
    screen(X(212),X(236),Y(2),Y(-8),function(x,y,w,h){var sx2=x+w*.9,sy=y+h*.5;g.fillStyle="#FFC83D";g.beginPath();g.arc(sx2,sy,h*.16,0,PI*2);g.fill();
      PLANETS.forEach(function(p,k){var rr=w*(.09+k*.098);g.strokeStyle="rgba(120,160,255,.45)";g.lineWidth=2;g.beginPath();g.arc(sx2,sy,rr,PI*.82,PI*1.18);g.stroke();
        g.fillStyle=p.c;g.beginPath();g.arc(sx2-rr,sy+(k%2?-1:1)*h*.06,4+(k===4||k===5?5:2),0,PI*2);g.fill();});});
    screen(X(239),X(259),Y(2),Y(-8),function(x,y,w,h){g.fillStyle="#2EE6A8";g.font="700 40px Changa, Tahoma, sans-serif";g.direction="rtl";g.textAlign="center";g.textBaseline="middle";
      g.fillText("محطة رائد الفضاء الصغير",x+w/2,y+h*.32);g.fillStyle="#FFC83D";g.font="600 32px Changa, Tahoma, sans-serif";g.fillText("المهمة: رتّب الكواكب من الشمس",x+w/2,y+h*.7);});
  })();
  function rrect2(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
  return c;
}
var panoCanvas=paintPanorama(document.createElement("canvas")),panoTex=[];
/* repaint once the display font is ready so the console text uses it */
if(document.fonts&&document.fonts.load){document.fonts.load("700 40px Changa","محطة").then(function(){paintPanorama(panoCanvas);panoTex.forEach(function(t){t.needsUpdate=true;});},function(){});}

/* ---------------- content (all from the lesson plan) ---------------- */
var STAGES=[
 {t:"التهيئة: السرد القصصي",s:"السرد القصصي ومهمة (روّاد الفضاء الصغار)",
  mat:"صورة السماء ليلًا على السبورة الذكية، (سجل رائد الفضاء)، الأجهزة اللوحية، عرض شرائح التعلم الذاتي",
  proc:"يبدأ المعلم الدرس بعرض صورة للسماء ليلًا على السبورة الذكية، ويسأل: (هل تستطيعون أن ترتبوا الكواكب من الأقرب إلى الشمس إلى الأبعد؟). يستمع لتوقعات التلاميذ دون أن يصحّحها، ويطلب من كل تلميذ أن يكتب توقعه في (سجل رائد الفضاء). ثم يعلن المهمة: (أنتم اليوم روّاد فضاء صغار، ستستكشفون الكواكب بأنفسكم، ثم تصمّمون نموذجًا لنظامنا الشمسي). بعدها يوزّع الأجهزة اللوحية، ويوجّه كل تلميذ إلى فتح عرض الشرائح الذي أعدّه والتنقل فيه بمفرده.<br>إجابات متوقعة: (الأرض أول كوكب)، (المشتري الأقرب لأنه كبير)، (ما أعرف الترتيب).",
  te:["يعرض صورة السماء ليلًا على السبورة الذكية ويطرح سؤال ترتيب الكواكب.","يستمع لتوقعات التلاميذ دون تصحيحها.","يطلب من كل تلميذ كتابة توقعه في (سجل رائد الفضاء).","يعلن مهمة (رواد الفضاء الصغار).","يوزّع الأجهزة اللوحية ويوجّه كل تلميذ إلى فتح عرض الشرائح."],
  st:["يلاحظ الصورة ويجيب عن سؤال المعلم.","يكتب توقعه في (سجل رائد الفضاء).","يستلم الجهاز ويفتح عرض الشرائح ويتنقّل فيه بمفرده."]},
 {t:"التدريس: جولة رائد الفضاء",s:"التعلم الذاتي + التعلم الغامر بالواقع المعزز والتعلم بالاكتشاف في موقع Stellarium",
  mat:"شريحة (جولة رائد الفضاء) وتعليماتها، موقع Stellarium للواقع المعزز، الأجهزة اللوحية، (سجل رائد الفضاء)",
  steps:["اضغط على الرابط في الشريحة التالية لفتح موقع Stellarium.","فعّل وضع الواقع المعزز (AR)، ثم اسمح للموقع باستخدام كاميرا الجهاز.","ارفع الجهاز وحرّكه حولك، فتظهر الكواكب فوق صورة الصف وتتحرك مع حركتك.","اضغط أيقونة البحث، واكتب اسم الكوكب، ثم حرّك الجهاز حتى تجده.","اضغط على الكوكب لتظهر بطاقته، واقرأ ترتيبه من الشمس.","سجّل الكواكب الثمانية في (سجل رائد الفضاء) من الأقرب إلى الأبعد."],
  proc:"يهدف هذا الجزء إلى أن يتعرّف التلميذ إلى كواكب النظام الشمسي الثمانية وترتيبها من الشمس، من خلال استكشافها بتقنية الواقع المعزز في موقع Stellarium. بعد قراءة التعليمات ينتقل التلميذ إلى الشريحة التالية ويضغط على الرابط، فتنفتح أمامه قبة السماء. يفعّل الواقع المعزز، فيرى صفّه من خلال كاميرا الجهاز وقد ظهرت فوقه الأجرام السماوية، وتتحرك معه كلما حرّك الجهاز. يبدأ بالبحث عن عطارد، فيحرّك الجهاز حتى يجده، ثم يضغط عليه فتظهر بطاقته، ويقرأ فيها أنه أقرب الكواكب إلى الشمس، فيسجّله أولًا. وعلى هذا المنوال ينتقل إلى الزهرة ثم الأرض ثم المريخ، ويلاحظ أن مكان الكوكب في السماء لا يدل على ترتيبه، وأن البطاقة هي التي تخبره به. وعند المشتري وزحل يقرّب الصورة ليرى ضخامتهما وحلقات زحل، ثم يختم بأورانوس ونبتون أبعد الكواكب عن الشمس. وبانتهاء الجولة يكون قد كوّن في سجله قائمة مرتبة للكواكب الثمانية، فيعود إلى الشرائح ليكمل رحلته.",
  te:["يعرض شريحة التعليمات ويتأكد أن كل تلميذ فتح الرابط.","يتجوّل بين التلاميذ ويساعد من يواجه صعوبة في تشغيل الواقع المعزز أو في البحث.","يوجّه التلاميذ إلى أخذ الترتيب من بطاقة الكوكب لا من موقعه في السماء.","يسأل من ينهي مبكرًا: (أي كوكب يأتي بعد الأرض؟ وكيف عرفت؟)."],
  st:["يقرأ شريحة التعليمات ويفتح رابط Stellarium.","يفعّل الواقع المعزز ويحرّك الجهاز للبحث عن كل كوكب.","يضغط على الكوكب ويقرأ بطاقته ليعرف ترتيبه.","يسجّل الكواكب الثمانية في (سجل رائد الفضاء) من الأقرب إلى الأبعد."]},
 {t:"التدريب: لعبة رائد الفضاء الصغير",s:"التعلم القائم على اللعب بتغذية راجعة فورية ونجوم",
  mat:"لعبة (رائد الفضاء الصغير): قسم (النظام الشمسي) وقسم (المرصد)، وشريحة تعليمات اللعبة",
  steps:["اضغط رابط لعبة (رائد الفضاء الصغير)، ثم اضغط (ابدأ الرحلة).","اختر بدلة رائد الفضاء واكتب اسمك، ثم اضغط (جاهز للإطلاق).","في قسم (النظام الشمسي): اضغط على الكوكب الذي يظهر لك، واسحبه إلى مداره حول الشمس.","إذا ظهرت لك رسالة تصحيح، اقرأها جيدًا ثم أعد المحاولة.","في قسم (المرصد): قرّب الصورة واختر الكوكب المطلوب.","اجمع أكبر عدد من النجوم، ثم توقّف عند القسم الثالث وانتظر تعليمات المعلم."],
  proc:"بعد الجولة ينتقل التلميذ إلى مرحلة التدريب من خلال لعبة (رائد الفضاء الصغير) التي تهدف إلى أن يطبّق ما تعلّمه عن ترتيب الكواكب ويصحّح أخطاءه فورًا؛ فاللعبة تقدّم للتلميذ تغذية راجعة فورية في قسميها الأول والثاني، ويجمع فيها النجوم لتحفيزه. يدخل التلميذ اللعبة فتظهر له قصة مهمة رائد الفضاء، ثم ينتقل إلى قسم (النظام الشمسي) حيث يرى الشمس ومداراتها الثمانية فارغة. تعرض عليه اللعبة كوكبًا في كل مرة، كالأرض مثلًا، فيضغط عليه ويسحبه إلى المدار الذي يراه مناسبًا؛ فإن وضعه في مداره الصحيح ثبت مكانه وحصل على نجمة، وإن أخطأ ظهرت له تغذية راجعة فورية توضّح سبب الخطأ وتذكّره بموقع الكوكب، فيعيد المحاولة حتى يكتمل النظام الشمسي أمامه. ثم ينتقل إلى قسم (المرصد)، وهو مرصد تفاعلي يقرّب فيه الصورة ويختار الكوكب المطلوب، فيربط شكل الكوكب باسمه وموقعه، متابعًا النجوم التي جمعها في أعلى الشاشة.",
  te:["يعرض شريحة تعليمات اللعبة ويتأكد أن كل تلميذ دخلها.","يتابع تقدّم التلاميذ في القسمين الأول والثاني وعدد نجومهم.","يرصد الكواكب التي تكرّر فيها الخطأ ويعالجها قبل التقويم.","يطلب من التلاميذ التوقف قبل القسم الثالث حتى يعلن بدء التقويم."],
  st:["يقرأ التعليمات ويدخل اللعبة ويكتب اسمه.","يبني النظام الشمسي بسحب كل كوكب إلى مداره في قسم (النظام الشمسي).","يقرأ التغذية الراجعة عند الخطأ ويعيد المحاولة.","يرصد الكواكب في قسم (المرصد) ويجمع النجوم."]},
 {t:"التقويم والختام: مصمم النظام الشمسي",s:"تصميم مستقل دون تغذية راجعة أثناء التصميم، ثم مقارنة بالتوقع الأول",
  mat:"القسم الثالث (مصمم النظام الشمسي) من لعبة (رائد الفضاء الصغير)، السبورة الذكية، (سجل رائد الفضاء)",
  steps:["اضغط رابط اللعبة، وافتح القسم الثالث (مصمم النظام الشمسي)، واكتب اسمك.","اسحب كل كوكب إلى مداره حسب بعده عن الشمس.","انتبه: بين البطاقات جسمان ليسا كوكبين، فلا تضعهما في المدارات.","راجع نموذجك، ثم اضغط (تحقّق من نموذجي)؛ لديك محاولة واحدة."],
  proc:"ينتقل التلميذ إلى شريحة لعبة التقويم (مصمم النظام الشمسي) ويصمّم نموذجه منفردًا: تظهر الشمس وثمانية مدارات فارغة، وأسفلها عشر بطاقات: الكواكب الثمانية وجسمان ليسا كوكبين (القمر ومسبار الفضاء). يصمّم التلميذ نموذجه بسحب كل كوكب إلى مداره واستبعاد الجسمين، ولا يُظهر هذا القسم صحة الإجابة أثناء التصميم؛ ليطبّق التلميذ فهمه باستقلال. بعد التحقق تعرض اللعبة نموذج التلميذ بجانب النموذج الصحيح، وتميّز المواقع الخاطئة، وتقدّم تفسيرًا علميًا مختصرًا، ثم تعرض الدرجة والوقت. وفي الختام يعرض المعلم نموذجًا صحيحًا للنظام الشمسي على السبورة الذكية، ويطلب من التلاميذ مقارنته بتوقعاتهم في بداية الدرس: (من توقّع أن المشتري هو الأقرب؟ ماذا اكتشفت الآن؟).",
  te:["يتابع نتائج التلاميذ لحظة ظهورها ويسجّلها.","يقدّم تغذية راجعة فردية لمن لم يكتمل نموذجه، ويوجّهه إلى الدعم المناسب.","يعرض النموذج الصحيح على السبورة الذكية ويقود مقارنة التلاميذ بتوقعاتهم."],
  st:["يصمّم نموذجه منفردًا دون مساعدة.","يقارن نموذجه بالنموذج الصحيح، ويقرأ التفسير العلمي.","يقارن توقعه الأول بما اكتشفه، ويصرّح بما تغيّر في فهمه."]}
];

var SPOTS=[
 {id:"mercury",q:"ما ترتيب عطارد من الشمس؟",o:["الأول","الرابع","الثامن"],c:0,
  e:"صحيح. عطارد أقرب الكواكب إلى الشمس، فهو الكوكب الأول. لذلك يبحث عنه رائد الفضاء الصغير أولًا في جولة Stellarium ويسجّله أول القائمة."},
 {id:"venus",q:"الزهرة هي الكوكب الثاني. أيّ كوكب يأتي بعدها مباشرة؟",o:["المشتري","الأرض","نبتون"],c:1,
  e:"صحيح. بعد الزهرة تأتي الأرض. الترتيب حتى الآن: عطارد، ثم الزهرة، ثم الأرض."},
 {id:"earth",q:"قال تلميذ في بداية الدرس: (الأرض أول كوكب). ما ترتيب الأرض الصحيح من الشمس؟",o:["الأول","الثالث","السادس"],c:1,
  e:"صحيح. الأرض الكوكب الثالث؛ يسبقها عطارد ثم الزهرة. والأرض واحدة من ثمانية كواكب تدور حول الشمس."},
 {id:"moon",q:"هذا الجسم يدور حول الأرض. هل هو كوكب؟",o:["نعم، هو الكوكب التاسع","لا، القمر يتبع كوكبًا هو الأرض","نعم، لأنه قريب منا"],c:1,
  e:"صحيح. القمر ليس كوكبًا؛ فهو يتبع كوكبًا هو الأرض. لذلك يستبعده التلميذ من المدارات في (مصمم النظام الشمسي)، ومعه مسبار الفضاء، وهو آلة تُطلق من الأرض."},
 {id:"mars",q:"المريخ كوكب أحمر. بين أيّ كوكبين يقع؟",o:["بين الأرض والمشتري","بين عطارد والزهرة","بين زحل وأورانوس"],c:0,
  e:"صحيح. المريخ الكوكب الرابع: بعد الأرض وقبل المشتري."},
 {id:"jupiter",q:"قال تلميذ: (المشتري الأقرب إلى الشمس لأنه كبير). ما رأيك؟",o:["صحيح، الأكبر هو الأقرب","غير صحيح، المشتري الخامس، وحجمه لا يحدد ترتيبه","غير صحيح، المشتري أبعد الكواكب"],c:1,
  e:"صحيح. المشتري أضخم الكواكب، لكن الحجم لا يدل على الترتيب؛ فهو الكوكب الخامس بعد المريخ. وفي Stellarium يقرّب التلميذ الصورة ليرى ضخامته."},
 {id:"saturn",q:"هذا كوكب الحلقات. ما ترتيب زحل من الشمس؟",o:["الثاني","السادس","الثامن"],c:1,
  e:"صحيح. زحل الكوكب السادس بعد المشتري، ويقرّب التلميذ صورته في Stellarium ليرى حلقاته."},
 {id:"uranus",q:"أيّ كوكب يأتي قبل أورانوس مباشرة؟",o:["زحل","المريخ","الأرض"],c:0,
  e:"صحيح. أورانوس الكوكب السابع بعد زحل، وهو مع نبتون أبعد الكواكب عن الشمس."},
 {id:"neptune",q:"نبتون أبعد الكواكب عن الشمس. لماذا يبدو لنا من الأرض صغيرًا جدًا؟",o:["لأنه بعيد جدًا عنا","لأنه أصغر من القمر","لأنه لا يدور حول الشمس"],c:0,
  e:"صحيح. نبتون الكوكب الثامن والأخير. ويذكر الكتاب أن الكواكب تبدو صغيرة لبعدها، وأن مشاهدتها ممكنة في ليلة صافية (ص ٣٧)."}
];
SPOTS.forEach(function(s){var b=byId(s.id);s.name=b.n;s.az=PANO_AZ[s.id];s.el=PANO_EL[s.id]-PANO_R[s.id]/(4096/360)-4.2;});

var ITEMS=[
 {key:"student",name:"بيانات الطالب",kind:"الكائن ١ من ٩",accent:0x9D6BFF},
 {key:"objective",name:"الهدف التعليمي",kind:"الكائن ٢ من ٩",accent:0xFF4F7B},
 {key:"lesson",name:"بيانات الدرس",kind:"الكائن ٣ من ٩",accent:0x2EE6A8},
 {key:"plan",name:"خطة الدرس",kind:"الكائن ٤ من ٩",accent:0xFF8A3D},
 {key:"tech",name:"التقنية الغامرة",kind:"الكائن ٥ من ٩",accent:0x2AD4F7},
 {key:"activity",name:"النشاط الغامر",kind:"الكائن ٦ من ٩",accent:0xFFC83D},
 {key:"assess",name:"التقييم",kind:"الكائن ٧ من ٩",accent:0xB7F23F},
 {key:"pano",name:"تجربة 360",kind:"الكائن ٨ من ٩",accent:0xFF5FD2},
 {key:"refs",name:"المراجع",kind:"الكائن ٩ من ٩",accent:0x5B93FF}
];

var ICO_EXT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></svg>';
function techBlock(which){
  if(which==="stellar") return '<p>موقع ويب مجاني يدعم اللغة العربية والواقع المعزز (AR)؛ يحاكي قبة السماء ويعرض الكواكب فوق صورة كاميرا الجهاز، ويقدّم لكل كوكب بطاقة بخصائصه وترتيبه، ولا يحتاج إلى تثبيت.</p>'+
    '<p>يفتحه التلميذ في مرحلة التدريس (جولة رائد الفضاء): يفعّل الواقع المعزز، ويبحث عن كل كوكب بتحريك الجهاز، ويضغط عليه ليقرأ ترتيبه من الشمس في بطاقته.</p>'+
    stelLink("افتح Stellarium Web "+ICO_EXT)+'<p class="url">'+STELLARIUM_URL+'</p>';
  return '<p>تطبيق ويب عربي صمّمته بمساعدة أداة Claude Code، ويتكوّن من ثلاثة أقسام. يقدّم القسمان الأولان نجومًا وتغذية راجعة فورية، ويقيس الثالث تصميم التلميذ المستقل.</p>'+
    '<ol><li><b>النظام الشمسي:</b> بناء النظام بالسحب والإفلات، كل كوكب إلى مداره حول الشمس.</li><li><b>المرصد:</b> مرصد تفاعلي يقرّب فيه التلميذ الصورة ويختار الكوكب المطلوب.</li><li><b>مصمم النظام الشمسي:</b> قسم التقويم؛ ثمانية مدارات فارغة وعشر بطاقات.</li></ol>'+
    gameLink("العب: رائد الفضاء الصغير "+ICO_EXT,"cta pink");
}

var PANELS={
 student:function(){return '<div class="idcard"><div class="idcard-top"><svg aria-hidden="true"><use href="#astro"/></svg><div><b>جامعة البحرين</b><span>كلية محمد جابر الأنصاري للمعلمين</span></div></div>'+
  '<dl class="meta"><dt>الاسم</dt><dd>قاسم عبدالنبي منصور أحمد</dd><dt>الرقم الجامعي</dt><dd><bdi dir=ltr>202210335</bdi></dd><dt>الشعبة</dt><dd>1</dd>'+
  '<dt>المقرر</dt><dd>تكنولوجيا التعليم الإبداعية (<bdi dir=ltr>TCIT419</bdi>)</dd><dt>التكليف</dt><dd>التقييم 2: تطوير تجربة تعليمية، العمل الفردي</dd><dt>السنة</dt><dd><bdi dir=ltr>2026–2027</bdi></dd></dl></div>'+
  '<p>هذه الصفحة هي مشروعي الفردي في الواقع المعزز لدرس (الكواكب): تسعة عوالم صغيرة تدور حول الشمس، ولكل عالم كائن من كائنات التكليف. اضغط على أي مجسم، أو ضع النظام الشمسي كله على طاولتك بزر «الواقع المعزز».</p>';},
 objective:function(){return '<p class="big">أن يصمّمَ التلميذُ نموذجًا للنظامِ الشمسيِّ يتضمّنُ الكواكبَ الثمانيةَ مرتّبةً وفق بُعدِها عن الشمس من خلال لعبة (رائد الفضاء الصغير).</p>'+
  '<dl class="meta"><dt>المستوى المعرفي</dt><dd>التركيب</dd><dt>يُقاس بـ</dt><dd>القسم الثالث (مصمم النظام الشمسي) من اللعبة، وسلّم تقدير من ١٠ درجات</dd><dt>يتحقق عند</dt><dd>١٠ من ١٠: الكواكب الثمانية في مداراتها، واستبعاد الجسمين اللذين ليسا كوكبين</dd></dl>'+
  '<h3>الطريق إلى الهدف</h3><p>تتدرّج الاستراتيجيات بالتلميذ نحو مستوى التركيب:</p>'+
  '<ol class="path3"><li>استكشاف<small>جولة Stellarium بالواقع المعزز</small></li><li>بناء موجَّه<small>القسمان الأول والثاني بتغذية راجعة</small></li><li>تصميم مستقل<small>مصمم النظام الشمسي في التقويم</small></li></ol>'+
  '<p>الهدف أن يصمّم التلميذ النموذج لا أن يشاهده فقط؛ فيمهّد Stellarium للمعرفة، ثم تحوّلها اللعبة إلى نموذج يبنيه التلميذ بنفسه مع تغذية راجعة فورية، ثم يقيس قسم (مصمم النظام الشمسي) تصميمه المستقل.</p>'+
  '<h3>الكفايات الأساسية</h3><ul class="chips"><li>التفكير العلمي: الملاحظة والترتيب والتصميم</li><li>الكفاية الرقمية</li><li>التعلم الذاتي</li></ul>';},
 lesson:function(){var h='<figure class="figure"><img id="lessonArt" alt="رسم توضيحي: الشمس والكواكب الثمانية مرتبة على مداراتها من عطارد إلى نبتون"><figcaption>رسم توضيحي للنظام الشمسي أعددته لهذا المشروع، يعرض الكواكب الثمانية مرتبة من الشمس. وليس صورة من صفحات الكتاب.</figcaption></figure>'+
  '<dl class="meta"><dt>الدرس</dt><dd>الكواكب</dd><dt>الكتاب</dt><dd>العلوم، الصف الثالث الابتدائي، الجزء الثاني</dd><dt>الصفحات</dt><dd>ص ٣٤–٣٩</dd><dt>المادة/ المرحلة</dt><dd>العلوم / الحلقة الأولى</dd><dt>الصف</dt><dd>الثالث الابتدائي</dd><dt>المدة</dt><dd>٣٠ دقيقة</dd><dt>السنة</dt><dd>٢٠٢٦ / ٢٠٢٧</dd></dl>'+
  '<h3>المفاهيم الجديدة</h3><ul class="chips"><li>النظام الشمسي</li><li>الكوكب</li><li>المدار</li><li>ترتيب الكواكب من الشمس</li></ul>'+
  '<h3>ترتيب الكواكب من الشمس</h3><ol class="order">';
  PLANETS.forEach(function(p,i){h+='<li><i style="--pc:'+pgrad(p)+'"></i>'+p.n+'<small>'+toAr(i+1)+'</small></li>';});
  return h+'</ol><h3>الخلفية المعرفية</h3><p>الشمس نجم يضيء بنفسه، والأرض كوكب نعيش عليه، والترتيب (الأول، الثاني، ...)، واستخدام الجهاز اللوحي باللمس والسحب.</p>'+
  '<h3>المحتوى المعرفي</h3><p>يتناول الدرس النظام الشمسي الذي تنتمي إليه الأرض، والكوكب بوصفه جسمًا ضخمًا كرويّ الشكل تقريبًا من الصخر أو الغاز يدور حول نجم، وأن الأرض واحدة من ثمانية كواكب تدور حول الشمس. ويميّز التلميذ بين الكوكب وغيره من الأجسام، كالقمر الذي يتبع كوكبًا ومسبار الفضاء الذي هو آلة تُطلق من الأرض.</p>'+
  '<p class="note">تصوّر خاطئ شائع يعالجه النشاط: أن موقع الكوكب في السماء يدل على ترتيبه من الشمس.</p>'+
  '<h3>الكفايات الأساسية/ الفرعية</h3><ul class="chips"><li>التفكير العلمي (الملاحظة والترتيب والتصميم)</li><li>الكفاية الرقمية</li><li>التعلم الذاتي</li></ul>'+
  '<h3>المواد والمصادر</h3><ul><li>كتاب العلوم.</li><li>موقع Stellarium للواقع المعزز.</li><li>لعبة (رائد الفضاء الصغير) بأقسامها الثلاثة.</li><li>عرض شرائح التعلم الذاتي.</li><li>أجهزة لوحية، والسبورة الذكية، و(سجل رائد الفضاء).</li></ul>';},
 plan:function(){var n=D.pages.length;return '<p>خطة الدرس كما أعددتها، في '+toAr(n)+' صفحات. قلّب الصفحات، أو نزّل الخطة بصيغتيها.</p>'+
  '<div class="viewer"><div class="vscroll" id="vscroll" data-lenis-prevent><img id="pimg" alt="خطة الدرس، الصفحة ١"></div>'+
  '<div class="vctl"><button class="btn" id="pprev">السابقة</button><span id="pnum"></span><button class="btn" id="pnext">التالية</button></div></div>'+
  '<div class="row"><button class="btn" id="pzoom" aria-pressed="false">كبّر الصفحة</button></div>'+
  '<div class="dl"><button class="cta" id="dlpdf" type="button">نزّل الخطة PDF<small>ملف PDF</small></button><button class="cta alt" id="dldoc" type="button">نزّل الخطة Word<small>ملف وورد (docx)</small></button></div>';},
 tech:function(){return '<p>تقنيتان غامرتان تعملان من المتصفح على الأجهزة اللوحية دون تثبيت، ومعهما جولة 360 أضفتها في هذا المشروع.</p>'+
  '<div class="tech"><h3>Stellarium Web <span class="tag">واقع معزز</span></h3>'+techBlock("stellar")+'</div>'+
  '<div class="tech"><h3>لعبة (رائد الفضاء الصغير) <span class="tag">لعبة تعليمية</span></h3>'+techBlock("game")+'</div>'+
  '<div class="tech"><h3>جولة 360: محطة الفضاء <span class="tag">إضافة جديدة</span></h3><p>يقف التلميذ داخل قبة محطة فضائية، ويدور بإصبعه أو بتحريك جهازه حول الشمس والكواكب الثمانية والقمر، ويجيب عن سؤال عند كل جرم.</p><button class="cta" data-pano>ابدأ الجولة</button></div>'+
  '<h3>لماذا اخترت هذه التقنية</h3><ol>'+
  '<li><b>مناسبتها للمحتوى:</b> ترتيب الكواكب خارج ما يدركه التلميذ بحواسه؛ فالكتاب يعرضه في رسم ثابت (ص ٣٦)، ويشير إلى أن الكواكب تبدو صغيرة لبعدها، وإلى أن مشاهدتها ممكنة في ليلة صافية (ص ٣٧)، أي أن التلميذ لا يراها في حصة صباحية. ويحل Stellarium هذه المشكلة بإظهار السماء وكواكبها داخل الصف.</li>'+
  '<li><b>تحقيقها للغمر:</b> يحقق الواقع المعزز عنصري الغمر الأساسيين: الواقعية والتفاعل؛ فيرى التلميذ الكواكب فوق صورة صفّه ويبحث عنها بنفسه ويقرأ بطاقتها، ويبقى متصلًا ببيئة صفّه ومعلمه دون نظارات خاصة.</li>'+
  '<li><b>مناسبتها للهدف:</b> يمهّد Stellarium للمعرفة، ثم تحوّلها اللعبة إلى نموذج يبنيه التلميذ بنفسه، ثم يقيس قسم (مصمم النظام الشمسي) تصميمه المستقل. ونشاط الكتاب (ص ٣٥) الذي يقف فيه تسعة تلاميذ على خط بترتيب الكواكب حول كرسي يمثل الشمس يتعذّر على كل تلميذ منفردًا؛ فالتقنية بديل فردي له.</li>'+
  '<li><b>قيمتها المضافة (TPACK):</b> رؤية الكواكب في السماء، وتغذية راجعة فورية لكل تلميذ، وقياس فردي للتصميم.</li>'+
  '<li><b>عمليّتها:</b> مجانية وعربية، وتعمل من المتصفح على الأجهزة اللوحية دون تثبيت.</li></ol>'+
  '<h3>ما يتطلبه من المعلم</h3><p>إعداد الشرائح، واختبار الروابط وتفعيل الكاميرا على الأجهزة قبل الحصة، وتجهيز النموذج الصحيح للمقارنة.</p>';},
 stellar:function(){return techBlock("stellar")+'<p class="kicker">تُستخدم في المرحلة الثانية من النشاط (التدريس).</p>';},
 game:function(){return techBlock("game")+'<p class="kicker">تُستخدم في المرحلتين الثالثة (التدريب) والرابعة (التقويم والختام).</p>';},
 activity:function(){
  var h='<p>نشاط غامر يعيش فيه التلميذ مراحل الدرس الأربع كما في الخطة. لكل مرحلة مشهد متحرك من عالم الفضاء، وتجربة قصيرة يؤديها بيده، ودور واضح للمعلم وللتلميذ.</p>'+
    '<button class="cta" data-act="0">ادخل النشاط الغامر</button><h3>المراحل والإجراءات ودور كل من المعلم والتلميذ</h3><ol class="timeline">';
  STAGES.forEach(function(s,i){h+='<li><h3>'+s.t+'</h3><p class="st-meta">'+s.s+'. المواد: '+s.mat+'.</p>'+
    '<details class="more"><summary>الإجراءات</summary><p>'+s.proc+'</p>'+(s.steps?'<p class="kicker">تعليمات الشريحة:</p><ol>'+s.steps.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ol>':'')+'</details>'+
    '<div class="role te"><b>دور المعلم</b><ul>'+s.te.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>'+
    '<div class="role"><b>دور التلميذ</b><ul>'+s.st.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>'+
    '<button class="btn sm" data-act="'+i+'">ادخل هذه المرحلة</button></li>';});
  return h+'</ol>';},
 assess:function(){return '<p>يقيس التقويم الهدف كاملًا: تصميم النموذج بالكواكب الثمانية مرتبة مع استبعاد ما ليس كوكبًا. وهذه خطواته وأدواته كما في الخطة.</p><ol class="steps">'+
  '<li><h3>تقويم تكويني أثناء التدريب</h3><p><b>الأداة:</b> القسمان الأول (النظام الشمسي) والثاني (المرصد) من لعبة (رائد الفضاء الصغير).</p><p>تقدّم اللعبة تغذية راجعة فورية توضّح سبب الخطأ وتذكّر التلميذ بموقع الكوكب، ويجمع النجوم. ويتابع المعلم تقدّم التلاميذ وعدد نجومهم، ويرصد الكواكب التي تكرّر فيها الخطأ ويعالجها قبل التقويم، ثم يطلب منهم التوقف قبل القسم الثالث.</p></li>'+
  '<li><h3>التقويم: مصمم النظام الشمسي</h3><p><b>الأداة:</b> القسم الثالث (مصمم النظام الشمسي)، وهو لعبة رقمية من إعداد المعلم ترتبط مباشرة بالهدف.</p>'+
  '<p>تظهر الشمس وثمانية مدارات فارغة، وأسفلها عشر بطاقات: الكواكب الثمانية وجسمان ليسا كوكبين (القمر ومسبار الفضاء). يصمّم التلميذ نموذجه منفردًا بسحب كل كوكب إلى مداره واستبعاد الجسمين، ولا يُظهر هذا القسم صحة الإجابة أثناء التصميم.</p>'+
  '<p class="kicker">تعليمات الشريحة:</p><ol><li>اضغط رابط اللعبة، وافتح القسم الثالث (مصمم النظام الشمسي)، واكتب اسمك.</li><li>اسحب كل كوكب إلى مداره حسب بعده عن الشمس.</li><li>انتبه: بين البطاقات جسمان ليسا كوكبين، فلا تضعهما في المدارات.</li><li>راجع نموذجك، ثم اضغط (تحقّق من نموذجي)؛ لديك محاولة واحدة.</li></ol>'+
  '<p>بعد التحقق تعرض اللعبة نموذج التلميذ بجانب النموذج الصحيح، وتميّز المواقع الخاطئة، وتقدّم تفسيرًا علميًا مختصرًا، ثم تعرض الدرجة والوقت.</p>'+gameLink("افتح اللعبة: القسم الثالث "+ICO_EXT,"cta pink")+'</li>'+
  '<li><h3>سلّم التقدير (١٠ درجات)</h3><div class="tablewrap"><table><thead><tr><th scope="col">المعيار</th><th scope="col">الدرجة</th></tr></thead><tbody>'+
  '<tr><th scope="row">كل كوكب في مداره الصحيح</th><td>درجة لكل كوكب (٨)</td></tr><tr><th scope="row">استبعاد كل جسم ليس كوكبًا (القمر، مسبار الفضاء)</th><td>درجة لكل جسم (٢)</td></tr></tbody>'+
  '<tfoot><tr><th scope="row">المجموع</th><td>١٠ درجات، ويتحقق الهدف عند ١٠ من ١٠</td></tr></tfoot></table></div>'+
  '<div class="calc glow"><p class="kicker" style="margin:0">جرّب سلّم التقدير: ماذا يحدث بعد التقويم؟</p>'+
  '<label for="cP" style="display:block"><span>كواكب في مداراتها الصحيحة: <b id="cPv"></b></span><input type="range" id="cP" min="0" max="8" step="1" value="8"></label>'+
  '<label><input type="checkbox" id="cM" checked><span>استبعد القمر</span></label><label><input type="checkbox" id="cR" checked><span>استبعد مسبار الفضاء</span></label>'+
  '<div class="score"><b id="cS"></b><span id="cT" aria-live="polite"></span></div></div></li>'+
  '<li><h3>بعد التقويم: المتابعة</h3><ul><li>من حصل على ١٠ من ١٠ تحقق عنده الهدف.</li><li>من حصل على ٨–٩ يعيد قسم (النظام الشمسي) ثم يعاود المحاولة.</li><li>من حصل على أقل من ٨ يعيد جولة Stellarium مع المعلم.</li></ul>'+
  '<p>يتابع المعلم النتائج لحظة ظهورها ويسجّلها، ويقدّم تغذية راجعة فردية لمن لم يكتمل نموذجه ويوجّهه إلى الدعم المناسب.</p></li>'+
  '<li><h3>الختام: المقارنة بالتوقع الأول</h3><p>يعرض المعلم نموذجًا صحيحًا للنظام الشمسي على السبورة الذكية، ويطلب من التلاميذ مقارنته بتوقعاتهم في (سجل رائد الفضاء): (من توقّع أن المشتري هو الأقرب؟ ماذا اكتشفت الآن؟). ويصرّح كل تلميذ بما تغيّر في فهمه.</p></li></ol>'+
  '<p class="note">إضافة: في جولة 360 تسعة أسئلة باختيار من ثلاثة، بتغذية راجعة فورية، ولا تُحسب النقطة إلا بعد الإجابة الصحيحة، فيراجع التلميذ الترتيب قبل التقويم.</p>';},
 pano:function(){
  var h='<img class="panoprev" id="panoprev" alt="لقطة من جولة 360: الشمس والكواكب من نافذة محطة الفضاء">'+
  '<p>جولة بانورامية رسمتها لهذا الدرس: يقف التلميذ داخل قبة محطة فضائية، وحوله من النوافذ الشمس والكواكب الثمانية بترتيبها والقمر. يدور بإصبعه أو بتحريك جهازه، ويفتح تسع نقاط مضيئة، ولكل نقطة سؤال وتغذية راجعة فورية.</p>'+
  '<button class="cta" data-pano>ابدأ الجولة</button><h3>النقاط التسع</h3><ul class="chips">';
  SPOTS.forEach(function(s){h+='<li>'+s.name+'</li>';});
  h+='</ul><h3>علاقتها بالهدف</h3><p>يرى التلميذ الكواكب الثمانية حول الشمس بترتيبها الصحيح، وهو ما لا يعرضه Stellarium الذي يُظهرها كما تُرى من الأرض. وتراجع الأسئلة الترتيب، وتعالج التصورين الخاطئين: (الأرض أول كوكب) و(المشتري الأقرب لأنه كبير)، وتميّز القمر من الكواكب؛ وهذا ما يحتاجه التلميذ ليصمّم نموذجه.</p>'+
  '<h3>طريقة الاستخدام</h3><p>اسحب لتنظر حولك، وقرّب بإصبعين أو بعجلة الفأرة. على الهاتف والجهاز اللوحي يدور المشهد مع حركتك عند تشغيل «حرّك جهازك».</p>';
  return h;},
 refs:function(){return '<ul class="refs">'+
  '<li>[١] العلوم: الصف الثالث الابتدائي، الجزء الثاني. درس الكواكب (ص ٣٤–٣٩).</li>'+
  '<li>[٢] جامعة البحرين، كلية البحرين للمعلمين. (٢٠٢٦). <i>التعلم الغامر</i>. مقرر TCIT419 تكنولوجيا التعليم الإبداعية.</li>'+
  '<li>[٣] جامعة البحرين، كلية البحرين للمعلمين. (٢٠٢٦). <i>البحث التربوي في الابتكار</i>، مقرر TCIT419 تكنولوجيا التعليم الإبداعية.</li>'+
  '<li dir="ltr">Anderson, L. W., &amp; Krathwohl, D. R. (Eds.). (2001). <i>A taxonomy for learning, teaching, and assessing: A revision of Bloom\'s taxonomy of educational objectives</i>. Longman.</li>'+
  '<li dir="ltr">Kapp, K. M. (2012). <i>The gamification of learning and instruction: Game-based methods and strategies for training and education</i>. Pfeiffer.</li>'+
  '<li dir="ltr">Mishra, P., &amp; Koehler, M. J. (2006). Technological pedagogical content knowledge: A framework for teacher knowledge. <i>Teachers College Record, 108</i>(6), 1017–1054.</li>'+
  '<li dir="ltr">Stellarium Web. (n.d.). <i>Stellarium Web online star map</i>. https://stellarium-web.org</li></ul>'+
  '<h3>شكر وإسناد</h3><p class="credit">الأصوات والموسيقى: أصوات حرة الاستخدام (CC0) من Kenney وHoliznaCC0 وAlvana. الواقع المعزز على الآيفون: <a href="https://github.com/8thwall/engine/blob/main/LICENSE" target="_blank" rel="noopener">8th Wall Engine © Niantic Spatial</a>. المجسمات ثلاثية الأبعاد والرسوم والجولة مرسومة بالكود في هذا المشروع.</p>';}
};
var TITLES={stellar:["التقنية الغامرة","Stellarium Web"],game:["التقنية الغامرة","لعبة رائد الفضاء الصغير"]};
