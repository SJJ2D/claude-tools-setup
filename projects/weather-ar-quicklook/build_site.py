"""Rebuild deploy/ from the original site (ar_src) with every patch, keeping the original saturated colours.
python3 tools/build_site.py"""
import re, glob, os, shutil, base64, json
SRC='/home/user/work/ar_src'; D='/home/user/work/arql/deploy'; A='/home/user/work/arql'
shutil.rmtree(D, ignore_errors=True); os.makedirs(D)
for n in ['index.html','weather','nasma','nada','ar']:
    s=os.path.join(SRC,n); (shutil.copytree if os.path.isdir(s) else shutil.copy)(s, os.path.join(D,n))
for f in ['stripped.html','plan.pdf','plan.txt','plan_raw.txt']+[os.path.basename(x) for x in glob.glob(SRC+'/weather/pg-*.png')]:
    try: os.remove(os.path.join(D,'weather',f))
    except FileNotFoundError: pass
shutil.copy(A+'/site/weather/weather_island.usdz', D+'/weather/')
open(D+'/_headers','w').write('/*.usdz\n  Content-Type: model/vnd.usdz+zip\n  Cache-Control: public, max-age=3600\n')
for f in glob.glob(D+'/**/index.html', recursive=True):
    s=open(f,encoding='utf-8').read()
    s=re.sub(r'<script[^>]*/\.netlify/scripts/hud[^>]*></script>\s*','',s)
    s=re.sub(r'<!-- This site is hosted on Netlify.*?-->\s*','',s,flags=re.S)
    open(f,'w',encoding='utf-8').write(s)
p=D+'/weather/index.html'; s=open(p,encoding='utf-8').read()
def R(a,b,cnt=1):
    global s
    assert a in s, a[:80]; s=s.replace(a,b,cnt)
# ---- less white wash on the island, colours stay saturated ----
R('--sky-bottom:#DFF6FF;','--sky-bottom:#B9E6FF;')
R('var hemi=new THREE.HemisphereLight(0xffffff,0xffe2a8,.95);','var hemi=new THREE.HemisphereLight(0xffffff,0xd9a860,.6);')
R('var sunL=new THREE.DirectionalLight(0xffffff,.85);','var sunL=new THREE.DirectionalLight(0xfff4e0,1.0);')
R('["#9a9a9a","#d6d6d6","#ffffff"]','["#868686","#c8c8c8","#f2f2f2"]')
R('new THREE.Fog(horizonColor(),17,48)','new THREE.Fog(horizonColor(),36,110)')
R('hemi.intensity=.95;sunL.intensity=.85;sea.material.color.setHex(0x2EC4E6);island.material.color.setHex(0xF6C86F);','hemi.intensity=.58;sunL.intensity=1.05;sea.material.color.setHex(0x16B4DD);island.material.color.setHex(0xF2B850);')
R('new THREE.MeshPhongMaterial({color:0x2EC4E6,shininess:80,specular:0xb8f0ff,flatShading:true})','new THREE.MeshPhongMaterial({color:0x16B4DD,shininess:60,specular:0x5fb8d0,flatShading:true})')
R('new THREE.MeshLambertMaterial({color:0xF6C86F})','new THREE.MeshLambertMaterial({color:0xF2B850})')
R('(front?1:(.2+.6*zf))','(front?1:(.55+.45*zf))')

R('new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5}));\nfoam','new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.3}));\nfoam') if 'opacity:.5}));\nfoam' in s else R('new THREE.RingGeometry(4.95,5.7,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5})','new THREE.RingGeometry(4.95,5.7,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.3})')
R('var cap=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,.04,40),M(0xffffff));','var cap=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,.04,40),M(0xFFF3D6));')
# ---- games on the same site ----
R('var NASMA = "https://unique-cascaron-6d65d9.netlify.app/nasma/";','var SAME=/netlify\\.app$/.test(location.hostname);\nvar NASMA = SAME?"../nasma/":"https://unique-cascaron-6d65d9.netlify.app/nasma/";')
R('var NADA = "https://unique-cascaron-6d65d9.netlify.app/nada/";','var NADA = SAME?"../nada/":"https://unique-cascaron-6d65d9.netlify.app/nada/";')
# ---- recorded sounds (CC0) with the synthesised tones as fallback ----
snd={k:base64.b64encode(open(f'{A}/snd/{k}.mp3','rb').read()).decode() for k in ['pop','open','good','no','start','win']}
i=s.index('function sfx(k){'); j=s.index('var sndBtn=',i); old=s[i:j]
s=s[:i]+'''/* recorded sounds (CC0: Alvana audio library, Kenney interface sounds); the synthesised tones stay as a fallback */
var SND='''+json.dumps(snd)+''',SBUF={},SVOL={pop:.5,open:.55,good:.6,no:.5,start:.55,win:.6};
function sndLoad(){var a=actx();if(!a||SBUF._l)return;SBUF._l=1;Object.keys(SND).forEach(function(k){try{var bin=atob(SND[k]),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  a.decodeAudioData(u.buffer,function(b){SBUF[k]=b;},function(){});}catch(e){}});}
document.addEventListener("pointerdown",sndLoad,{passive:true});
function sfxTone(k){'''+old[len('function sfx(k){'):]+'''function sfx(k){var a=actx();if(!a)return;sndLoad();var b=SBUF[k];if(!b){sfxTone(k);return;}
  var src=a.createBufferSource(),g=a.createGain();src.buffer=b;if(k==="pop")src.playbackRate.value=.92+Math.random()*.2;g.gain.value=SVOL[k]||.5;src.connect(g);g.connect(a.destination);src.start();}
'''+s[j:]
# ---- render loop yields to the 8th Wall renderer ----
R('  renderer.render(scene,camera);}\nrenderer.setAnimationLoop(loop);','  if(!window.__AR8on)renderer.render(scene,camera);}\nrenderer.setAnimationLoop(loop);')
# ---- iPhone AR: Quick Look helper + 8th Wall tracked AR ----
ql='''/* ---------------- iPhone / iPad: Apple AR Quick Look (fallback when tracked AR cannot start) ---------------- */
var QL=(function(){var a=document.createElement("a");return !!(a.relList&&a.relList.supports&&a.relList.supports("ar"));})();
function openQL(){var a=document.createElement("a");a.rel="ar";a.href="weather_island.usdz#allowsContentScaling=1";
  a.appendChild(document.createElement("img"));a.style.display="none";document.body.appendChild(a);a.click();setTimeout(function(){a.remove();},1500);
  toast("وجّه الكاميرا إلى السرير أو الطاولة حتى تثبت الجزيرة عليه. حرّكها بإصبع واحد، ودوّرها بإصبعين، وكبّرها بالقرص.");}
if(QL){camBtn.querySelector("span:last-child").textContent="الواقع المعزز";var wq=$("#wArNote");
  if(wq){wq.textContent="جهازك يدعم الواقع المعزز: بعد البدء اضغط زر «الواقع المعزز»، فتثبت الجزيرة على السرير أو الطاولة كأنها مجسم حقيقي، وتضغط على أي مجسم لتفتحه.";wq.hidden=false;}}

'''
ar8=open(A+'/ar8.js',encoding='utf-8').read().replace('var AR8={on:false','window.__AR8=null;var AR8={on:false',1).replace('var ar8canvas=document.createElement("canvas");','window.__AR8=AR8;window.__ar8items=items;var ar8canvas=document.createElement("canvas");',1)
anchor='/* outside claude.ai: offer the plan PDF as a plain download */'
R(anchor, ql+ar8+'\n'+anchor)
open(p,'w',encoding='utf-8').write(s); print('ok', len(s))
