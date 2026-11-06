# Voice tones (eleven_v4 / eleven_v3 audio tags)

The user's voice in ElevenLabs: **T.Sajjad**, `voice_id = GYQVQTYvlwEHrFDjXtC4` (cloned, `ar-bahraini`). Use it for his voice in any narration.

## Tag table (place the tag right before the words; it lasts until the next tag)
| Tone | Tag | Note |
|---|---|---|
| Calm | `[calm]` `[softly]` | narration, explanation, the start of a video |
| Warm, friendly | `[warmly]` | welcome, thanks, children |
| Happy | `[happy]` `[cheerful]` | good news |
| Enthusiastic, hype | `[excited]` | announcements, ads, a countdown |
| Sad | `[sad]` `[softly]` | sad news, nostalgia |
| Angry | `[angry]` / louder: `[shouting]` | comic anger, objections |
| Sarcastic | `[sarcastic]` `[mischievously]` | comedy |
| Dramatic, epic | `[dramatically]` `[deep voice]` | trailers, "in a world..." |
| Whisper, secret | `[whispers]` | a secret, tension |
| Nervous, afraid | `[nervous]` `[trembling voice]` | suspense |
| Tired | `[tired]` `[sighs]` | comedy about exhaustion |
| Curious | `[curious]` | questions, quizzes |
| Surprised | `[surprised]` `[gasps]` | a twist |
| Laughing | `[laughs]` `[chuckles]` `[giggles]` | comedy |
| Pauses | `[short pause]` `[pause]` `[long pause]` or «…» | timing |
| Accent | `[strong Bahraini Arabic accent]` (try it) | untested for Arabic; compare a take with it and one without |

## Measurements from a test with the user's voice (samples/emotions_bahraini_take*.mp3)
Text: «[calm] هلا والله... [happy] ترى الخبر هذا وايد حلو! [excited] يالله يالله... [sad] بس للأسف... [angry] لا! منو اللي سوّى جذي؟! [sarcastic] أكيد... [whispers] تعال... [dramatically] والحين... الحرب العظمى. [laughs] لا تصدّق!»
| Tone | Pitch (F0) | Loudness | HNR | Conclusion |
|---|---|---|---|---|
| calm | ~140 Hz | −22 dB | 14 | normal reference |
| happy | ~185 Hz | −20 dB | 12 | brighter ✓ |
| excited | ~265 Hz | −20 dB | 13 | clearly higher ✓ |
| sad | ~130 Hz | −28 dB | 8–9 | lower and quieter ✓ |
| angry | ~240 Hz | −20 dB | 12–13 | sharp and loud ✓ |
| sarcastic | ~148 Hz | −22.5 dB | 7 | breathy, dry ✓ |
| whispers | quiet | −28 dB | 2.5 | genuine whisper (voiceless) ✓ |
| dramatically | ~140 Hz | −21 dB | 11 | slow and weighty ✓ |
- The transcriber understood all the Bahraini words («سوّى جذي» comes out with a Gulf «چ» sound, which is correct for the dialect).
- UTMOS drops (~1.9) on expressive and whispered audio. It **does not** measure naturalness in emotional performance, so don't use it to reject expressive takes; rely on listening, the transcription and HNR only for neutral lines.

## Tips
- Change the tag only where the emotion changes, not on every sentence.
- Long text gives the emotion room; a single line needs 2–3 takes.
- Combine: `[sad] [whispers]` or `[excited] [shouting]`.
- For a whole video: give each section one tone (calm opening → hype for the build → sarcastic for jokes → dramatic for the title).
