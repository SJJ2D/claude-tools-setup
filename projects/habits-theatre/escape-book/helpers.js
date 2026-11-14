const OUT="#2b1d14", SW=3.2;
// ───────── cartoon parts ─────────
function face(cx,cy,r,o={}){
  const e=r*.33, ey=cy-r*.05;
  let s=`<ellipse cx="${cx-e}" cy="${ey}" rx="${r*.1}" ry="${r*.14}" fill="${OUT}"/><ellipse cx="${cx+e}" cy="${ey}" rx="${r*.1}" ry="${r*.14}" fill="${OUT}"/>
  <circle cx="${cx-e+r*.035}" cy="${ey-r*.05}" r="${r*.035}" fill="#fff"/><circle cx="${cx+e+r*.035}" cy="${ey-r*.05}" r="${r*.035}" fill="#fff"/>
  <ellipse cx="${cx-r*.55}" cy="${cy+r*.25}" rx="${r*.16}" ry="${r*.1}" fill="#F28B82" opacity=".55"/><ellipse cx="${cx+r*.55}" cy="${cy+r*.25}" rx="${r*.16}" ry="${r*.1}" fill="#F28B82" opacity=".55"/>`;
  if(o.sleepy) s=`<path d="M${cx-e-r*.13} ${ey} q${r*.13} ${r*.1} ${r*.26} 0 M${cx+e-r*.13} ${ey} q${r*.13} ${r*.1} ${r*.26} 0" stroke="${OUT}" stroke-width="${SW}" fill="none" stroke-linecap="round"/>`+s.split('\n')[1].replace(/<circle[^>]*>/g,'');
  s+= o.open? `<path d="M${cx-r*.22} ${cy+r*.28} q${r*.22} ${r*.34} ${r*.44} 0 z" fill="#8b2b2b" stroke="${OUT}" stroke-width="${SW*.7}" stroke-linejoin="round"/>`
            : `<path d="M${cx-r*.22} ${cy+r*.3} q${r*.22} ${r*.22} ${r*.44} 0" stroke="${OUT}" stroke-width="${SW*.9}" fill="none" stroke-linecap="round"/>`;
  return s;
}
const skin=['#F2C9A0','#E0AC80','#C98E62'];
function kid(x,y,s,o){ // feet at (x,y), height ≈ 230*s
  const g=o.girl, c=o.color, k=o.skin||skin[0], hy=y-170*s, hr=52*s;
  let a=`<g>`;
  a+=`<ellipse cx="${x}" cy="${y+4*s}" rx="${50*s}" ry="${10*s}" fill="#000" opacity=".15"/>`;
  // legs
  a+=`<rect x="${x-22*s}" y="${y-28*s}" width="${16*s}" height="${28*s}" rx="${6*s}" fill="${k}" stroke="${OUT}" stroke-width="${SW}"/><rect x="${x+6*s}" y="${y-28*s}" width="${16*s}" height="${28*s}" rx="${6*s}" fill="${k}" stroke="${OUT}" stroke-width="${SW}"/>`;
  // robe
  a+=`<path d="M${x-30*s} ${y-120*s} L${x+30*s} ${y-120*s} L${x+46*s} ${y-22*s} Q${x} ${y-12*s} ${x-46*s} ${y-22*s} Z" fill="${c}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  if(g) for(let i=0;i<5;i++) a+=`<circle cx="${x-30*s+i*15*s}" cy="${y-30*s}" r="${3.5*s}" fill="#FFD54A"/>`;
  else a+=`<path d="M${x} ${y-118*s} v${40*s}" stroke="${OUT}" stroke-width="${SW*.6}" opacity=".35"/>`;
  // arms
  const arm=(sx,ex,ey)=>`<path d="M${x+sx*s} ${y-108*s} Q${x+(sx+ex)/2*s} ${y-(108+ey)/2*s-10*s} ${x+ex*s} ${y-ey*s}" stroke="${c}" stroke-width="${18*s}" fill="none" stroke-linecap="round"/><path d="M${x+sx*s} ${y-108*s} Q${x+(sx+ex)/2*s} ${y-(108+ey)/2*s-10*s} ${x+ex*s} ${y-ey*s}" stroke="${OUT}" stroke-width="${18*s+SW*2}" fill="none" stroke-linecap="round" opacity="0"/><circle cx="${x+ex*s}" cy="${y-ey*s}" r="${10*s}" fill="${k}" stroke="${OUT}" stroke-width="${SW}"/>`;
  const L=o.armL||[-58,70], Rr=o.armR||[58,70];
  a+=arm(-24,L[0],L[1])+arm(24,Rr[0],Rr[1]);
  // head
  if(g){ a+=`<path d="M${x-hr*1.15} ${hy+hr*.2} Q${x-hr*1.25} ${hy-hr*1.35} ${x} ${hy-hr*1.3} Q${x+hr*1.25} ${hy-hr*1.35} ${x+hr*1.15} ${hy+hr*.2} L${x+hr*1.05} ${hy+hr*1.45} Q${x} ${hy+hr*1.75} ${x-hr*1.05} ${hy+hr*1.45} Z" fill="${o.scarf||'#7B3FA0'}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    for(let i=0;i<9;i++){const t=i/8*Math.PI;a+=`<circle cx="${x-Math.cos(t)*hr*1.05}" cy="${hy-Math.sin(t)*hr*1.15+hr*.15}" r="${3.4*s}" fill="#FFD54A"/>`;} }
  a+=`<circle cx="${x}" cy="${hy}" r="${hr}" fill="${k}" stroke="${OUT}" stroke-width="${SW}"/>`;
  if(!g) a+=`<path d="M${x-hr*.95} ${hy-hr*.35} Q${x} ${hy-hr*1.45} ${x+hr*.95} ${hy-hr*.35} Z" fill="${o.cap||'#fff'}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`+[...Array(4)].map((_,i)=>`<circle cx="${x-hr*.5+i*hr*.33}" cy="${hy-hr*.62}" r="${2.6*s}" fill="#C9A227"/>`).join('');
  a+=face(x,hy+hr*.08,hr*.9,o);
  if(o.extra) a+=o.extra;
  return a+`</g>`;
}
function bag(x,y,s,c){return `<path d="M${x-8*s} ${y-22*s} q8 -10 16 0" stroke="${OUT}" stroke-width="${SW}" fill="none"/><path d="M${x-26*s} ${y-18*s} Q${x-34*s} ${y+30*s} ${x} ${y+34*s} Q${x+34*s} ${y+30*s} ${x+26*s} ${y-18*s} Z" fill="${c}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`+
  ['#fff','#FF5DA2','#FFD54A','#5BC0EB'].map((cc,i)=>`<circle cx="${x-15*s+i*10*s}" cy="${y-20*s-(i%2)*6*s}" r="${6*s}" fill="${cc}" stroke="${OUT}" stroke-width="${SW*.6}"/>`).join('')+
  `<path d="M${x-26*s} ${y-2*s} h${52*s}" stroke="#fff" stroke-width="${3*s}" opacity=".7" stroke-dasharray="${5*s} ${5*s}"/>`;}
function house(x,y,w,h,o={}){ // bottom-left at (x,y)
  const c=o.color||'#E9C48C', sh=o.shade||'#D3A86B'; let a='';
  a+=`<rect x="${x}" y="${y-h}" width="${w}" height="${h}" fill="${c}" stroke="${OUT}" stroke-width="${SW}"/>`;
  a+=`<rect x="${x+w-w*.18}" y="${y-h}" width="${w*.18}" height="${h}" fill="${sh}" opacity=".55"/>`;
  for(let i=0;i<Math.floor(w/42);i++) a+=`<path d="M${x+8+i*42} ${y-h} v-16 h24 v16" fill="${c}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  a+=`<rect x="${x-4}" y="${y-h+12}" width="${w+8}" height="10" fill="${sh}" stroke="${OUT}" stroke-width="${SW*.8}"/>`;
  if(o.barjeel){const bx=x+w*.15,bw=w*.38,bh=h*.6;a+=`<rect x="${bx}" y="${y-h-bh}" width="${bw}" height="${bh}" fill="${c}" stroke="${OUT}" stroke-width="${SW}"/>`;for(let i=1;i<4;i++)a+=`<rect x="${bx+i*bw/4-5}" y="${y-h-bh+12}" width="10" height="${bh*.6}" rx="4" fill="${sh}" stroke="${OUT}" stroke-width="${SW*.6}"/>`;a+=`<rect x="${bx-6}" y="${y-h-bh-8}" width="${bw+12}" height="12" fill="${sh}" stroke="${OUT}" stroke-width="${SW*.8}"/>`;}
  const win=o.lit?'#FFD966':'#5A3A22';
  (o.wins||[[.18,.42],[.62,.42]]).forEach(([fx,fy])=>{a+=`<path d="M${x+w*fx} ${y-h+h*fy+40} v-30 a17 17 0 0 1 34 0 v30 z" fill="${win}" stroke="${OUT}" stroke-width="${SW}"/>`;if(o.lit)a+=`<path d="M${x+w*fx+17} ${y-h+h*fy-6} v46 M${x+w*fx} ${y-h+h*fy+18} h34" stroke="${OUT}" stroke-width="${SW*.6}"/>`;});
  if(o.door!==false){const dx=x+w*(o.doorX||.36),dw=Math.min(70,w*.32),dh=h*.46;a+=`<path d="M${dx} ${y} v-${dh-20} a${dw/2} 20 0 0 1 ${dw} 0 v${dh-20} z" fill="${o.doorColor||'#9B5A2A'}" stroke="${OUT}" stroke-width="${SW}"/><path d="M${dx+dw/2} ${y} v-${dh-6}" stroke="${OUT}" stroke-width="${SW*.7}"/>`;for(let i=0;i<3;i++)for(let j=0;j<2;j++)a+=`<circle cx="${dx+dw*(.25+j*.5)}" cy="${y-dh*.25-i*dh*.22}" r="3" fill="#F4C542"/>`;}
  return a;}
function palm(x,y,s){let a=`<path d="M${x} ${y} Q${x+18*s} ${y-90*s} ${x+6*s} ${y-190*s}" stroke="${OUT}" stroke-width="${26*s+SW*2}" fill="none" stroke-linecap="round"/><path d="M${x} ${y} Q${x+18*s} ${y-90*s} ${x+6*s} ${y-190*s}" stroke="#A0703F" stroke-width="${26*s}" fill="none" stroke-linecap="round"/>`;
  for(let i=0;i<7;i++)a+=`<path d="M${x+(6+i*0)*s} ${y-(182+i*0)*s} q${0} 0 0 0" />`;
  a+=`<path d="M${x+6*s} ${y-188*s} q${10*s} ${-40*s} ${0} ${-46*s}" stroke="#7A4F28" stroke-width="${6*s}" fill="none"/>`;
  [[-1,0.3],[-1,-.3],[1,0.3],[1,-.3],[-.4,-1],[.4,-1],[0,-1.1]].forEach(([dx,dy])=>{const ex=x+6*s+dx*110*s, ey=y-190*s+dy*40*s+40*s*(Math.abs(dx)>.5?1:0);a+=`<path d="M${x+6*s} ${y-190*s} Q${x+6*s+dx*60*s} ${y-190*s+dy*80*s-30*s} ${ex} ${ey} Q${x+6*s+dx*50*s} ${y-190*s+dy*40*s} ${x+6*s} ${y-190*s} Z" fill="#3FAE49" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`;});
  a+=[0,1,2].map(i=>`<circle cx="${x+(-6+i*12)*s}" cy="${y-176*s}" r="${8*s}" fill="#C2571A" stroke="${OUT}" stroke-width="${SW*.6}"/>`).join('');return a;}
const stars=(n,h,seed)=>{let a='',r=seed;const rnd=()=>{r=(r*9301+49297)%233280;return r/233280;};for(let i=0;i<n;i++){const x=rnd()*1200,y=rnd()*h,s=1.5+rnd()*3;a+=`<path d="M${x} ${y-s*2}L${x+s*.6} ${y-s*.6}L${x+s*2} ${y}L${x+s*.6} ${y+s*.6}L${x} ${y+s*2}L${x-s*.6} ${y+s*.6}L${x-s*2} ${y}L${x-s*.6} ${y-s*.6}Z" fill="#FFF6C8" opacity="${.6+rnd()*.4}"/>`;}return a;};
const banner=(t,c)=>`<g><rect x="400" y="716" width="400" height="66" rx="33" fill="${c}" stroke="${OUT}" stroke-width="${SW}"/><text x="600" y="762" text-anchor="middle" font-family="Almarai" font-weight="800" font-size="38" fill="#fff">${t}</text></g>`;
const bunting=(y,cols)=>{let a=`<path d="M-10 ${y} Q600 ${y+60} 1210 ${y}" stroke="${OUT}" stroke-width="2.5" fill="none"/>`;for(let i=0;i<16;i++){const x=20+i*76, yy=y+Math.sin(i/15*Math.PI)*28+ (x>0?0:0);a+=`<path d="M${x} ${yy} l34 0 l-17 34 z" fill="${cols[i%cols.length]}" stroke="${OUT}" stroke-width="2"/>`;}return a;};

function basket(x,y,s){return `<path d="M${x-36*s} ${y-22*s} Q${x} ${y+30*s} ${x+36*s} ${y-22*s} Z" fill="#C98B3C" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M${x-30*s} ${y-12*s} h${60*s} M${x-22*s} ${y-2*s} h${44*s}" stroke="#8A5A2A" stroke-width="${3*s}"/>`+
 [-24,-12,0,12,24].map((d,i)=>`<path d="M${x+d*s} ${y-22*s} q${(i%2?8:-8)*s} ${-24*s} ${(i%2?2:-2)*s} ${-42*s}" stroke="#2E9E44" stroke-width="${5*s}" fill="none" stroke-linecap="round"/><ellipse cx="${x+d*s+(i%2?6:-6)*s}" cy="${y-50*s}" rx="${8*s}" ry="${5*s}" fill="#5CCB5F" stroke="${OUT}" stroke-width="1.6" transform="rotate(${i%2?30:-30} ${x+d*s} ${y-50*s})"/>`).join('');}
// ───────── icons for card backs ─────────
const icon={
 qq:`<svg viewBox="0 0 200 170">${bag(100,90,2.0,'#FFD54A')}</svg>`,
 hb:`<svg viewBox="0 0 200 170">${basket(100,130,2.0)}</svg>`,
 ms:`<svg viewBox="0 0 200 170"><ellipse cx="100" cy="60" rx="80" ry="26" fill="#F2E3C6" stroke="${OUT}" stroke-width="4"/><path d="M20 60 v70 a80 26 0 0 0 160 0 v-70" fill="#C0392B" stroke="${OUT}" stroke-width="4"/>${[0,1,2,3,4,5].map(i=>`<path d="M${28+i*26} 82 l13 52 l13 -52" stroke="#FFD54A" stroke-width="5" fill="none"/>`).join('')}<path d="M130 40 l40 -36" stroke="#6B3E1E" stroke-width="10" stroke-linecap="round"/></svg>`,
 cn:`<svg viewBox="0 0 200 170"><g transform="translate(60,80) rotate(-15)"><rect x="-20" y="-24" width="140" height="48" rx="22" fill="#3A3F47" stroke="${OUT}" stroke-width="4"/><rect x="108" y="-30" width="22" height="60" rx="8" fill="#2A2E35" stroke="${OUT}" stroke-width="4"/></g><circle cx="70" cy="120" r="34" fill="#A0652F" stroke="${OUT}" stroke-width="4"/><circle cx="70" cy="120" r="8" fill="${OUT}"/><circle cx="170" cy="40" r="22" fill="#fff" stroke="${OUT}" stroke-width="3"/></svg>`};

