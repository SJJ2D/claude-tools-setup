import json,numpy as np,soundfile as sf
from scipy.ndimage import uniform_filter1d
P=json.load(open('/home/user/work/zelf/audio/placement.json'));SR=48000;N=int(P['dur']*SR)
vo=np.zeros(N,np.float32)
for i,t in P['place'].items():
    y,_=sf.read(f'/home/user/work/zelf/audio/lines/{i}.wav',dtype='float32');a=int(round(t*SR));vo[a:a+len(y)]+=y[:N-a]
sf.write('/home/user/work/zelf/audio/vo.wav',vo,SR,subtype='PCM_16')
hop=SR//30;n=N//hop;r=np.array([np.sqrt(np.mean(vo[k*hop:(k+1)*hop]**2)) for k in range(n)])
r=uniform_filter1d(r,3);db=20*np.log10(r+1e-9);e=np.clip((db+48)/(-20+48+6),0,1)   # -48dB->0 ; ~ -14dB ->1
e[r<10**(-46/20)]=0;e=np.clip(e/ (np.percentile(e[e>0],95)),0,1)
json.dump({'rate':30,'env':[round(float(x),3) for x in e]},open('/home/user/work/zelf/audio/env.json','w'))
print('vo',len(vo)/SR,'env frames',n,'nonzero',int((e>0).sum()))
