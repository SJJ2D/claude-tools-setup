# Objective voice metrics: UTMOS (naturalness), speaker similarity, HNR (hoarseness), F0 stats, LTAS.
import sys, numpy as np, torch, librosa, parselmouth
import os
SPEECHMOS = os.environ.get('SPEECHMOS_DIR', os.path.expanduser('~/tools/speechmos'))   # git clone --branch v1.2.0 https://github.com/tarepan/SpeechMOS
CKPT = os.environ.get('UTMOS_CKPT', os.path.join(SPEECHMOS, 'utmos22_strong_step7459_v1.pt'))  # from the repo's v1.0.0 release
_utmos = None
def utmos(w16):
    global _utmos
    if _utmos is None:
        sys.path.insert(0, SPEECHMOS); from speechmos.utmos22.strong.model import UTMOS22Strong
        _utmos = UTMOS22Strong(); _utmos.load_state_dict(torch.load(CKPT, map_location='cpu')); _utmos.eval()
    with torch.no_grad(): return float(_utmos(torch.from_numpy(w16).float().unsqueeze(0), 16000))
def hnr_f0(w, sr):
    snd = parselmouth.Sound(w.astype(np.float64), sampling_frequency=sr)
    h = snd.to_harmonicity_cc(time_step=0.01, minimum_pitch=75); hv = h.values[h.values > -100]
    p = snd.to_pitch(time_step=0.01, pitch_floor=75, pitch_ceiling=400); f = p.selected_array['frequency']; f = f[f > 0]
    return float(np.mean(hv)) if hv.size else 0.0, float(np.median(f)) if f.size else 0.0, float(np.std(12 * np.log2(f / np.median(f)))) if f.size else 0.0
def ltas(w, sr, bands=None):
    S = np.abs(librosa.stft(w, n_fft=2048, hop_length=512)) ** 2
    fr = librosa.fft_frequencies(sr=sr, n_fft=2048)
    act = S.sum(0) > np.percentile(S.sum(0), 40)       # voiced/active frames only
    spec = S[:, act].mean(1) + 1e-12
    bands = bands or [100,160,250,400,630,1000,1600,2500,4000,6300,10000]
    out = []
    for lo, hi in zip(bands[:-1], bands[1:]):
        m = (fr >= lo) & (fr < hi); out.append(10 * np.log10(spec[m].mean()))
    out = np.array(out); return out - out.mean()
