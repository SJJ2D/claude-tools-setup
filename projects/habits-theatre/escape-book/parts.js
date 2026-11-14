const TXT=(x,y,t,sz,c,w=700)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Almarai" font-weight="700" font-size="${sz}" fill="${c}">${t}</text>`;
const lock=(x,y,s)=>`<g transform="translate(${x},${y}) scale(${s})" filter="url(#sh)"><path d="M-46 -20 v-40 a46 46 0 0 1 92 0 v40" fill="none" stroke="#B8891E" stroke-width="18"/><path d="M-46 -20 v-40 a46 46 0 0 1 92 0 v40" fill="none" stroke="${OUT}" stroke-width="4" opacity=".5"/><rect x="-70" y="-24" width="140" height="120" rx="20" fill="#F4C542" stroke="${OUT}" stroke-width="5"/><rect x="-58" y="-12" width="116" height="96" rx="14" fill="none" stroke="#C99A2E" stroke-width="4"/><circle cx="0" cy="22" r="14" fill="${OUT}"/><path d="M-7 28 h14 l-4 30 h-6z" fill="${OUT}"/></g>`;
const letterBadge=(x,y,L,r=44)=>`<g filter="url(#sh)"><circle cx="${x}" cy="${y}" r="${r}" fill="#FFD54A" stroke="${OUT}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${r-8}" fill="none" stroke="#C99A2E" stroke-width="3"/>${T(x,y+r*.42,L,r*1.2,'#8A2B1A')}</g>`;
// flap: closed or open (lifted) ; content under
function flap(x,y,w,h,label,col,state,under){ // state: 'closed' | 'right' | 'wrong'
  if(state==='closed') return `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${col}" stroke="${OUT}" stroke-width="3"/>${T(x+w/2,y+h*.52,label,Math.min(26,w*.13),'#fff')}${T(x+w/2,y+h*.85,'ارفع ↑',16,'#fff','opacity=".85"')}</g>`;
  let s=`<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#FFFDF6" stroke="${col}" stroke-width="4"/></g>`;
  s+= state==='right'? letterBadge(x+w/2,y+h/2+4,under,Math.min(h*.36,46)) : `${T(x+w/2,y+h/2-2,'حاول مرة',20,'#9a6a4a')}${T(x+w/2,y+h/2+24,'ثانية 💪',20,'#9a6a4a')}`;
  s+=`<g filter="url(#sh)"><path d="M${x} ${y} L${x+w} ${y} L${x+w-10} ${y-h*.62} L${x+10} ${y-h*.62} Z" fill="${col}" stroke="${OUT}" stroke-width="3" opacity=".96"/>${T(x+w/2,y-h*.24,label,Math.min(22,w*.12),'#fff')}</g>`;
  return s;}
const card=(x,y,w,h,title,col)=>`<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="#FFF6E4" stroke="${OUT}" stroke-width="4"/></g><rect x="${x}" y="${y}" width="${w}" height="58" rx="20" fill="${col}" stroke="${OUT}" stroke-width="4"/><rect x="${x+2}" y="${y+36}" width="${w-4}" height="22" fill="${col}"/>${T(x+w/2,y+40,title,28,'#fff')}`;
const bubble=(x,y,w,h,lines,col='#2b1d14')=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#fff" stroke="${OUT}" stroke-width="3"/>${lines.map((l,i)=>TXT(x+w/2,y+38+i*34,l,23,col)).join('')}</g>`;
const musahhar=(x,y,s)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M-40 0 L-30 -110 L30 -110 L40 0 Z" fill="#F7F3E8" stroke="${OUT}" stroke-width="4"/><circle cx="0" cy="-140" r="34" fill="${skin[1]}" stroke="${OUT}" stroke-width="4"/><path d="M-36 -140 Q-40 -186 0 -188 Q40 -186 36 -140 L40 -100 L24 -126 Q0 -170 -24 -126 L-40 -100Z" fill="#fff" stroke="${OUT}" stroke-width="4"/><path d="M-32 -164 Q0 -178 32 -164" stroke="#222" stroke-width="8" fill="none"/><path d="M-22 -122 Q0 -98 22 -122 Q0 -112 -22 -122" fill="#4A3426"/>${face(0,-140,30,{open:true})}${drum(-40,-50,.6)}</g>`;
const sadu=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sadu)"/>`;

const W1=900,H1=1240;
let c=`<rect width="${W1}" height="${H1}" rx="24" fill="url(#paper)"/><clipPath id="cc"><rect x="34" y="34" width="${W1-68}" height="${H1-68}" rx="14"/></clipPath>
<linearGradient id="nt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1650"/><stop offset=".7" stop-color="#3B2F86"/><stop offset="1" stop-color="#8A5BB0"/></linearGradient>
<g clip-path="url(#cc)"><rect width="${W1}" height="${H1}" fill="url(#nt)"/>
${[...Array(60)].map((_,i)=>`<circle cx="${(i*137)%900}" cy="${(i*89)%560}" r="${1.5+(i%3)}" fill="#FFF6C8" opacity="${.5+(i%4)*.12}"/>`).join('')}
<path d="M720 150 a60 60 0 1 0 48 94 a48 48 0 1 1 -48 -94z" fill="#FFF3B0"/>
${house(-20,1000,300,330,{lit:true,barjeel:true,doorX:.5})}${house(600,1000,330,300,{lit:true,color:'#F0CF9A',doorX:.3})}
<path d="M-10 640 Q450 720 910 640" stroke="${OUT}" stroke-width="3" fill="none"/>${[...Array(9)].map((_,i)=>{const x=40+i*100,y=652+Math.sin(i/8*Math.PI)*34;const cc=['#FF5DA2','#FFD54A','#3FAE49','#5BC0EB','#FF8A3D'][i%5];return `<ellipse cx="${x}" cy="${y+18}" rx="14" ry="20" fill="${cc}" stroke="${OUT}" stroke-width="2.5"/><circle cx="${x}" cy="${y+18}" r="28" fill="${cc}" opacity=".2"/>`}).join('')}
<rect y="1000" width="900" height="240" fill="#E8C48A"/>
${kid(250,1175,1.05,{color:'#3FAE49',open:true,armL:[-60,170],armR:[60,170]})}${kid(650,1175,1.05,{girl:true,color:'#FF5DA2',scarf:'#6A2C91',armL:[-60,70],armR:[60,120]})}
</g><rect x="34" y="34" width="${W1-68}" height="${H1-68}" rx="14" fill="none" stroke="url(#sadu)" stroke-width="22"/>
${scroll(450,330,600,'كتاب الفريج السري',64)}
<g filter="url(#sh)"><rect x="200" y="400" width="500" height="58" rx="29" fill="#E8467C" stroke="${OUT}" stroke-width="4"/>${T(450,440,'مغامرة البحث عن كلمة السر',30,'#fff')}</g>
${lock(450,560,1.0)}
<g>${[0,1,2,3,4].map(i=>`<rect x="${265+i*76}" y="700" width="64" height="74" rx="12" fill="#FFF8EA" stroke="${OUT}" stroke-width="4"/>${T(297+i*76,752,'؟',44,'#8A2B1A')}`).join('')}</g>
<g filter="url(#sh)"><rect x="230" y="800" width="440" height="64" rx="14" fill="#FFF8EA" stroke="${OUT}" stroke-width="3"/>${T(450,842,'المستكشف: ..........................',24,'#5a3518')}</g>
${bubble(80,120,330,110,['يدّوه خبّت كنزها','في الفريج!'],'#8A2B1A')}`;
window.COVER=c;
