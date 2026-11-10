import json,sys,numpy as np,soundfile as sf,librosa,pyloudnorm as pyln
sys.argv=['x'];exec(open('select_takes.py').read().split("S=json.load")[0])
P=json.load(open('placement.json'));S=json.load(open('../script.json',encoding='utf-8'))['lines']
vo,_=librosa.load('vo.wav',sr=SR)
bad=[];tot=[]
for l in S:
    a,b=P['lines'][l['id']];w=vo[int(max(0,a-.1)*SR):int((b+.1)*SR)]
    c=cer(l['text'].lstrip('…'),' '.join(x[2] for x in words(w)));tot.append(c)
    print(l['id'],round(c,3));
    if c>.15:bad.append(l['id'])
print('mean',round(np.mean(tot),3),'bad',bad)
m,_=sf.read('music_stem.wav')
for a,b in [(2.883+.02,12.461),(67.109+.02,P['dur'])]:
    print('music peak in',a,b,np.abs(m[int(a*48000):int(b*48000)]).max())
print('music rms outside',20*np.log10(np.sqrt(np.mean(m[int(13*48000):int(60*48000)]**2))))
x,sr=sf.read('mix.wav');print('LUFS',pyln.Meter(sr).integrated_loudness(x),'dur',len(x)/sr)
