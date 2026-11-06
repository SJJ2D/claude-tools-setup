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

## Tone bank (emotion_bank/): the user's tones without ElevenLabs
10 reference clips of the user's voice (T.Sajjad, generated once from ElevenLabs v4 in Bahraini, 6–10 s each):
`calm warm happy excited sad angry sarcastic whisper nervous dramatic` → `emotion_bank/<tone>.wav`.
Usage: pass the tone's clip as `audio_prompt_path` and the model copies the tone onto any new text:
```python
wav = m.generate(text, language_id='ar', audio_prompt_path='emotion_bank/angry.wav', exaggeration=.8, cfg_weight=.5, temperature=.75)
```
Tested result (the same new sentence with each tone; transcription accurate in all 10):
| Tone | exaggeration | Transfer | Measurement |
|---|---|---|---|
| angry | .8 | strong ✓ | 222 Hz, loudest (−19 dB) |
| happy | .6 | good ✓ | 175 Hz |
| sarcastic | .55 | good ✓ | 182 Hz, dry |
| dramatic | .55 | good ✓ | deep, 123 Hz |
| sad | .45 | good ✓ | quieter (−27 dB) |
| warm / calm | .45 / .4 | good ✓ | 146–149 Hz |
| excited | .75 | weak ⚠ | 153 Hz only (the reference is 207); raise exaggeration to .9, or use ElevenLabs |
| nervous | .6 | weak ⚠ | close to warm |
| whisper | .4 | does not work ✗ | the model does not whisper (HNR 14.5); use ElevenLabs `[whispers]` |
- The mumbling after the sentence was long in sad, sarcastic and dramatic (up to 2.5 s): you must trim at the end of the last word.
- Rule: use the bank when ElevenLabs is not allowed. For a professional job (an ad, a whisper, strong hype), use ElevenLabs directly.
