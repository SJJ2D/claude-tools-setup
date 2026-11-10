#!/usr/bin/env python3
"""audio/mix.py : vo.wav + music (with music_cues.json) + out/events.json sfx -> audio/mix.wav (48k stereo, -14 LUFS, TP<=-1)
and audio/sample_draft.mp3 (first 17.5 s).   python3 audio/mix.py"""
import json,os,subprocess,numpy as np,soundfile as sf,librosa,pyloudnorm as pyln
A=os.path.dirname(os.path.abspath(__file__)); R=os.path.join(A,'..'); SR=48000
P=json.load(open(f'{A}/placement.json')); DUR=P['dur']; N=int(DUR*SR)
def load(f,gain=1.0):
    y,sr=librosa.load(f,sr=SR,mono=True); return y.astype(np.float32)
def put(buf,y,t,g=1.0):
    i=int(round(t*SR))
    if i>=len(buf): return
    y=y[:len(buf)-i]; buf[i:i+len(y)]+=y*g
# voice at -16 LUFS
vo=load(f'{A}/vo.wav'); vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
m=pyln.Meter(SR); vo=vo*10**((-16-m.integrated_loudness(vo))/20)
# music with dead stops
C=json.load(open(f'{A}/music_cues.json')); bed=load(C['bed']); mus=np.zeros(N,np.float32)
for s in C['segments']:
    a,b=int(s['on']*SR),int(s['off']*SR); seg=np.zeros(N,np.float32)
    # bed position follows timeline (continues), looping if shorter
    idx=(np.arange(a,b))%len(bed); seg[a:b]=bed[idx]
    env=np.ones(b-a,np.float32); fi=int(s.get('fade_in',0)*SR)
    if fi: env[:fi]=np.linspace(0,1,fi)
    fo=int(s.get('fade_out',0)*SR)
    if fo: env[-fo:]=np.minimum(env[-fo:],np.linspace(1,0,fo))
    seg[a:b]*=env*10**(s['gain_db']/20); mus+=seg
# duck: smooth envelope from voice activity, about -10 dB
hop=int(.01*SR); fr=np.sqrt(np.convolve(vo**2,np.ones(hop)/hop,'same'))[::hop]
act=(fr>10**(-45/20)).astype(np.float32)
from scipy.ndimage import uniform_filter1d, maximum_filter1d
act=maximum_filter1d(act,25); sm=uniform_filter1d(act,15)          # hold .25 s, ramp ~.15 s
duck=np.interp(np.arange(N)/SR,np.arange(len(sm))*.01,10**(-10*sm/20)).astype(np.float32)
mus*=duck
mix=vo.copy()+mus
if os.environ.get('STEMS'): sf.write(f'{A}/music_stem.wav',mus,SR)
# sfx
SF=json.load(open(f'{A}/sfx_map.json')); cache={}
evp=f'{R}/out/events.json'; ev=json.load(open(evp)).get('events',[]) if os.path.exists(evp) else []
used=0
for e in ev:
    n=e['name'] if e['name'] in SF else 'pop'
    if n not in cache:
        y=load(SF[n]['file']); pk=np.abs(y).max() or 1; cache[n]=y/pk*10**(-14/20)*SF[n]['gain']
    put(mix,cache[n],float(e['t']),float(e.get('gain',1.0))); used+=1
# final loudness -14 LUFS, true peak <= -1 dBTP: gain -> limiter, iterate gain until LUFS ok
def tpk(x):
    up=librosa.resample(x.T,orig_sr=SR,target_sr=SR*4); return 20*np.log10(np.abs(up).max()+1e-9)
def limit(x):
    sf.write('/tmp/_pre.wav',x,SR,subtype='FLOAT')
    subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/_pre.wav','-af','alimiter=limit=0.82:attack=3:release=60:level=disabled:asc=0','-c:a','pcm_f32le','/tmp/_lim.wav'],check=True)
    return sf.read('/tmp/_lim.wav',dtype='float32')[0]
x=mix.copy(); g=-14-m.integrated_loudness(x)
for _ in range(5):
    y=limit(np.stack([x,x],1)*10**(g/20)); L=m.integrated_loudness(y)
    if abs(L+14)<0.3: break
    g+=-14-L
tp=tpk(y)
if tp>-1.0: y=y*10**((-1.05-tp)/20); tp=tpk(y)
x=y
sf.write(f'{A}/mix.wav',x,SR,subtype='PCM_16')
subprocess.run(['ffmpeg','-v','error','-y','-t','17.5','-i',f'{A}/mix.wav','-b:a','160k',f'{A}/sample_draft.mp3'],check=True)
print('sfx events mixed',used,'| LUFS',round(m.integrated_loudness(x),2),'| TP',round(tp,2))
