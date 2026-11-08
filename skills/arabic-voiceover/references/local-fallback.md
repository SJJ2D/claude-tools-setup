# Local fallback: Chatterbox Multilingual (only when ElevenLabs is not allowed)

Install (CPU, ~2 GB + ~3 GB weights): `bash <repo>/installers/on-demand.sh tts` → `~/tts/.venv`
(chatterbox-tts 0.1.7 dependencies + the GitHub source at commit ab55923, which adds the **V3** multilingual weights; faster-whisper, parselmouth, num2words).

**Use V3:** `ChatterboxMultilingualTTS.from_pretrained(device='cpu', t3_model='v3')`. Measured on the same 7 MSA sentences × 2 takes:
| | V2 (default) | V3 |
|---|---|---|
| CER with waqf tashkeel | 2.4% | 3.5% (same range; one take dropped a ط) |
| CER without tashkeel | 13.6% | 9.3% |
| Raw take length (tail mumbling) | 7.9 s | 4.1 s |
| Generation time per line | 47 s | 27 s |
V3 nearly removes the mumbling after the sentence and is ~40% faster. Keep generating 2 takes per line and let `assemble_vo.py` pick.
Known weakness in both: ج sometimes comes out like ش without tashkeel («فاشتهد»); full waqf tashkeel fixed it in our test. ض/ظ cannot be judged by Whisper (it confuses them itself).

Settings that worked (Arabic, the user's voice):
- Reference: a **calm** 10 s window from the user's voice (the first 6 s matter most), not an excited one. Prefer the user's real recording over ElevenLabs output.
- `exaggeration=0.4, cfg_weight=0.5, temperature=0.7`, a separate seed per take, and generate line by line.
- Expected (from our trailer): naturalness score ~3.4 to 4.0, speaker similarity ~0.9; HNR around the reference value (~14 to 15 dB).
- Known problems: the model adds 0.7 to 1.7 s of mumbling after some sentences (trim it), MSA intonation even with a dialect text, and some short words get swallowed («سهلة» → «سهل»).
- It embeds an inaudible watermark (Perth) in what it generates.

## Tone bank (emotion_bank/): the user's tones without ElevenLabs
10 reference clips of the user's voice (T.Sajjad, generated once from ElevenLabs v4 in Bahraini, 6–10 s each):
`calm warm happy excited sad angry sarcastic whisper nervous dramatic` → `emotion_bank/bahraini/<tone>.wav` (Bahraini) and `emotion_bank/msa/<tone>.wav` (MSA). Choose the folder that matches the script's language.
Usage: pass the tone's clip as `audio_prompt_path` and the model copies the tone onto any new text:
```python
wav = m.generate(text, language_id='ar', audio_prompt_path='emotion_bank/bahraini/angry.wav', exaggeration=.8, cfg_weight=.5, temperature=.75)
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

### MSA bank (emotion_bank/msa/): tested result
The sentence «سأخبركم الآن بما حدث اليوم في السوق، ولن تصدقوا ما رأيت» with each tone:
| Tone | exaggeration | Result |
|---|---|---|
| angry | .8 | strong ✓ (204 Hz), but one word came out wrong → redo the take |
| sarcastic | .55 | strong ✓ (205 Hz) |
| happy / excited | .6 / .9 | good ✓ (~172 Hz). Excited is better than in the Bahraini bank because exaggeration is .9 |
| dramatic | .55 | deep ✓ (127 Hz) |
| sad | .45 | quieter ✓ |
| warm / calm | .45 / .4 | good ✓ |
| whisper | .4 | partial: quieter and softer (HNR 10), not a full whisper |
| nervous | .75 | moderate, and a word came out wrong → redo the take |
- Rule: 2–3 takes for each line in a strong tone, and pick by transcription accuracy (CER).

## Distinct character voices (locally, from the user's voice only)
Proven method (the "الحرب العظمى v2" trailer): generate the line in the user's voice with the right tone from `emotion_bank`, then reshape the voice with Praat `Change gender` (parselmouth) by changing the formants and pitch:
```python
from parselmouth.praat import call
out = call(parselmouth.Sound(w, sampling_frequency=24000), "Change gender", 75, 600, formant_ratio, pitch_median_hz, pitch_range_factor, duration_factor)
```
| Character | formant | pitch Hz | range | duration | Extra |
|---|---|---|---|---|---|
| Cute / child | 1.10 | 255 | 1.4 | 1.0 | equalizer 3.5 kHz +2 dB (higher = less clear: 330 Hz was not understood) |
| Fast and excited | 1.08 | 185 | 1.4 | .9 | — |
| Cool and deep | .93 | 112 | .85 | 1.0 | aecho 180 ms light (not a short echo) |
| Giant / tank | .86 | 98 | .8 | 1.08 | sub-octave layer at 0.2 + 3.5 dB |
| Sharp / mischievous | 1.06 | 165 | 1.4 | .95 | — |
| Robot / beta | 1.0 | 125 | .15 (monotone) | 1.0 | flanger + light acrusher (afftfilt robot made the words unclear) |
- Check intelligibility with the transcriber *after* the change (CER). If it rises, reduce the pitch or formant shift.
- Speed: narrator ×1.15 and characters ×1.06 (atempo) shortened the trailer without hurting clarity.
- Trim the model's tail after the last word, and shorten long pauses inside the line to ≤ 0.24 s.
- Lip sync: a loudness envelope at 30 fps for each character line drives the mouth opening.
- Note: VAD in faster-whisper can drop short lines inside a music mix; check with `vad_filter=False`.
