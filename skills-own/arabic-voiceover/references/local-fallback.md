# Local fallback: Chatterbox Multilingual (only when ElevenLabs is not allowed)

Install (CPU, ~2 GB):
```bash
uv venv --seed -p 3.11 ~/tts/.venv && ~/tts/.venv/bin/pip install --cert /root/.ccr/ca-bundle.crt --extra-index-url https://download.pytorch.org/whl/cpu "torch==2.6.0+cpu" "torchaudio==2.6.0+cpu" "chatterbox-tts==0.1.7" "setuptools<81" faster-whisper==1.2.1 praat-parselmouth
```
(`setuptools<81` is required for the watermark library; uv in this container needs pip with `--cert`.)

Settings that worked (Arabic, the user's voice):
- Reference: a **calm** 10 s window from the user's voice (the first 6 s matter most), not an excited one. Prefer the user's real recording over ElevenLabs output.
- `exaggeration=0.4, cfg_weight=0.5, temperature=0.7`, a separate seed per take, and generate line by line.
- Expected (from our trailer): naturalness score ~3.4 to 4.0, speaker similarity ~0.9; HNR around the reference value (~14 to 15 dB).
- Known problems: the model adds 0.7 to 1.7 s of mumbling after some sentences (trim it), MSA intonation even with a dialect text, and some short words get swallowed («سهلة» → «سهل»).
- It embeds an inaudible watermark (Perth) in what it generates.
