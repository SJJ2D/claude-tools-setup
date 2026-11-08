import sys, json, numpy as np, librosa
sys.path.insert(0, '/home/user/film3/voice'); import metrics
ref, _ = librosa.load('/home/user/btc/video/audio/voice_final.wav', sr=24000)
R = metrics.ltas(ref, 24000)
bands = [100,160,250,400,630,1000,1600,2500,4000,6300,10000]
print('band   ' + ' '.join(f'{b:>6}' for b in bands[:-1]))
for f in ['lab_r100_B.wav', 'lab_r100_C.wav', 'lab_r70_A.wav', 'lab_r130_C.wav', '/home/user/film2/v_s1.wav', '/home/user/film/v1_s2.wav']:
    w, _ = librosa.load(f, sr=24000); d = metrics.ltas(w, 24000) - R
    print(f'{f.split("/")[-1][:14]:14s}' + ' '.join(f'{x:6.1f}' for x in d), '| rms dev', round(float(np.sqrt((d ** 2).mean())), 2))
