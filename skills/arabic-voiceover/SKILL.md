---
name: arabic-voiceover
description: Produce a natural, professional Arabic voiceover (Bahraini/Gulf dialect or MSA) in the user's own voice, mainly through ElevenLabs (eleven_v4 / eleven_v3 with audio tags), with a measured QA pass and a mixing chain that avoids nasal or "AI" coloration. Use for any narration, ad, trailer, explainer or dialogue in Arabic, or when the user says "صوتي", "تعليق صوتي", "باللهجة البحرينية", "بالفصحى", "خلّه طبيعي".
---
# arabic-voiceover

Goal: a voice that sounds like the user, in the dialect asked, and not like AI. This skill comes from lessons learned in practice: what failed in an earlier video, and why.

## 1. Choose the engine (most important decision)
| Situation | Engine |
|---|---|
| The user's voice, any dialect, best quality | **ElevenLabs** with the user's voice `T.Sajjad` (`voice_id GYQVQTYvlwEHrFDjXtC4`, cloned, ar-bahraini) on `eleven_v4` (or `eleven_v3`) |
| The user forbids ElevenLabs or wants something local | Chatterbox Multilingual (`references/local-fallback.md`). Tell him plainly: it pronounces dialect words, but its intonation leans MSA and it sounds more "AI" |
| A real recording of the user is available | Use it as the clone reference (not ElevenLabs output: cloning a clone loses quality) |

Do not switch to ElevenLabs without the user's consent if he said "not from ElevenLabs". Generating speech uses his credits; don't repeat a generation for the same text without a reason.

## 2. Write the script in the dialect itself, not "MSA with a few words"
- **Bahraini:** follow `references/bahraini.md`. Write the words as they are said («بتبدا»، «دوم»، «بروحه»، «الصوب»، «انتو مستعدين؟»). Avoid «هل» and «سوف» and MSA case endings.
- **MSA:** follow `references/msa.md` (light tashkeel only where reading is ambiguous).
- Short sentences with natural punctuation. «…» gives a dramatic pause, «،» a short breath, «—» a quick cut.
- Names and difficult words: on v4/v3 write the pronunciation in IPA between `/…/` if the model misreads them, but show the normal spelling in the captions.

## 3. Tone and emotion (v4/v3 audio tags) — full table and measurements in `references/emotions.md`
Tags are in English, inside brackets, placed right before the words they colour, and they last until the next tag. Examples:
- Trailer: `[dramatically] في عالم... ما فيه قانون... [pause] [sarcastic] ولا حتى واي فاي.`
- Comedy: `[mischievously] سليلي الكيوت... [whispers] لا يغرّك شكله.`
- Excitement: `[excited] انتو مستعدين... [shouting] للحرب العظمى؟`
- Non-verbal: `[laughs]` `[chuckles]` `[sighs]` `[gasps]` `[clears throat]`
- Dialect: try `[strong Bahraini Arabic accent]` or `[Gulf Arabic accent]` at the start of the text (**not officially documented for Arabic**: test two takes with and without the tag, and keep the better one by the checks below).
- Rules: tags describe *how* the line is said, not actions (`[grinning]` does not work). No hyphens inside a tag. Don't put a tag on every sentence.
- Models without tags (multilingual_v2/flash/turbo): no brackets; use `<break time="1.0s" />` and punctuation.

## 4. Generate, then measure (never trust without measuring)
1. Generate each sentence or paragraph separately when it is long (long text drifts and adds mumbling at the end).
2. Two takes for short lines.
3. QA with `scripts/voice_qa.py` (an ASR transcript compared with the text, naturalness (UTMOS), similarity to the user's voice, HNR for hoarseness, LTAS for tonal balance):
   - CER > 0.08 → redo the line or rephrase it (a dialect word the transcriber doesn't know is not an error: check manually).
   - HNR clearly below the reference (by 3 dB or more) = hoarse or "sick" → reject the take.
   - Sound after the last word (≥ 0.3 s) = model mumbling → trim at the end of the last word.
4. Transcribe the final mix after the music: every sentence must come out readable.

## 5. Mixing chain (proven to avoid the nasal sound)
- **Forbidden:** short echo (aecho 40–120 ms) → comb filtering that sounds nasal. Boosting 2.5–3.5 kHz together with cutting 200–300 Hz → a thin voice "from the nose".
- **Allowed:** high-pass at 55 Hz only, a gentle match-EQ toward the original voice's LTAS (clamp ±3 to 5 dB), a gentle de-esser, a 2:1 compressor, a *warm* (low-passed) room reverb at a low level (wet ≈ −20 dB).
- Level: narration −16 LUFS on its own; final mix −14 LUFS / TP −1. Music under the voice via sidechain (ratio ~8, release ~350 ms).

## 6. Before delivery
Be honest with the user: which engine, which dialect, and what you measured but could not hear yourself. If he says "it sounds like AI" or "MSA", the fix is the engine and the reference first, then the writing, then the tags. More processing is not the fix.
