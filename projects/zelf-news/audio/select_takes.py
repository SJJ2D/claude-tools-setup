import json,re,glob,os,subprocess,sys,tempfile,numpy as np,librosa,soundfile as sf
sys.path.insert(0,'/home/user/claude-tools-setup/skills/arabic-voiceover/scripts')
from faster_whisper import WhisperModel
SR=24000; TMP=tempfile.mkdtemp()
def digits(s): return s
def norm(s):
    s=re.sub(r'[ً-ْٰـ]','',s); s=re.sub(r'(ون|ان)(?=\s|$)','ين',s)
    s=re.sub('[إأآ]','ا',s).replace('ة','ه').replace('ى','ي'); return re.sub(r'[^ء-ي]','',s)
def cer(ref,hyp):
    a,b=norm(ref),norm(hyp);d=list(range(len(b)+1))
    for i,ca in enumerate(a,1):
        p,d[0]=d[0],i
        for j,cb in enumerate(b,1): p,d[j]=d[j],min(d[j]+1,d[j-1]+1,p+(ca!=cb))
    return d[len(b)]/max(1,len(a))
asr=WhisperModel('medium',device='cpu',compute_type='int8')
def words(w):
    f=os.path.join(TMP,'a.wav');sf.write(f,w,SR)
    segs,_=asr.transcribe(f,language='ar',word_timestamps=True,beam_size=5,vad_filter=False)
    return [(x.start,x.end,x.word.strip()) for s in segs for x in s.words]
def squeeze(w,maxgap=.24):
    iv=librosa.effects.split(w,top_db=36,frame_length=1024,hop_length=256)
    if len(iv)==0:return w
    out=[]
    for k,(s,e) in enumerate(iv):
        if k: out.append(np.zeros(int(min((s-iv[k-1][1])/SR,maxgap)*SR),np.float32))
        out.append(w[s:e])
    return np.concatenate(out)
S=json.load(open('/home/user/work/zelf/script.json',encoding='utf-8'))['lines']
META={}; TARGET=-20.0
for l in S:
    ref=l['text'].lstrip('…').strip(); best=None
    for f in sorted(glob.glob(f"raw/{l['id']}_s*.wav")):
        w,_=librosa.load(f,sr=SR);w,_=librosa.effects.trim(w,top_db=38)
        ws=words(w)
        if not ws: continue
        w=w[:int(min(len(w)/SR,ws[-1][1]+.12)*SR)];w=squeeze(w);ws=words(w)
        c=cer(ref,' '.join(x[2] for x in ws)); sc=-c-0.02*len(w)/SR
        if best is None or sc>best[0]: best=(sc,f,w,c,ws)
    _,f,w,c,ws=best
    w=w.astype(np.float32); sf.write(f'{TMP}/pre.wav',w,SR)
    af='aresample=48000'
    if l['speaker']=='zelf': af+=',rubberband=pitch=%f:pitchq=quality'%(2**(6/12))
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'{TMP}/pre.wav','-af',af,'-ar','48000','-ac','1',f'{TMP}/p.wav'],check=True)
    y,_=sf.read(f'{TMP}/p.wav',dtype='float32')
    act=y[np.abs(y)>0.02] if (np.abs(y)>0.02).any() else y
    rms=np.sqrt(np.mean(act**2)); y=y*(10**(TARGET/20)/rms)
    pk=np.abs(y).max()
    if pk>0.95: y=y*0.95/pk
    y=y.copy(); n=int(.008*48000); y[:n]*=np.linspace(0,1,n); y[-n:]*=np.linspace(1,0,n)
    sf.write(f"lines/{l['id']}.wav",y,48000,subtype='PCM_16')
    META[l['id']]={'dur':round(len(y)/48000,3),'words':[[round(x[0],3),x[2]] for x in ws],'cer':round(c,3),'take':os.path.basename(f)}
    print(l['id'],META[l['id']]['take'],META[l['id']]['dur'],'CER',round(c,3),flush=True)
json.dump(META,open('lines_meta.json','w'),ensure_ascii=False,indent=1)
