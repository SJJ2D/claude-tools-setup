---
name: arabic-voiceover
description: Produce a natural, professional Arabic voiceover (Bahraini/Gulf dialect or MSA) in the user's own voice, mainly through ElevenLabs (eleven_v4 / eleven_v3 with audio tags), with a measured QA pass and a mixing chain that avoids nasal or "AI" coloration. Use for any narration, ad, trailer, explainer or dialogue in Arabic, or when the user says "صوتي", "تعليق صوتي", "باللهجة البحرينية", "بالفصحى", "خلّه طبيعي".
---
# arabic-voiceover

Goal: a voice that sounds like the user, in the dialect asked, and not like AI. This skill comes from lessons learned in practice: what failed in an earlier video, and why.

## 1. Choose the engine (most important decision)
**User's standing decision (Nov 2026): do NOT use ElevenLabs.** Only if he explicitly asks for it again in a new request.
| Situation | Engine |
|---|---|
| **Bahraini** (montage, entertainment) | **His own recording** of the lines (default). Send him the script split into short lines; he records on his phone in a quiet room. We clean it (`on-demand.sh denoise`, DeepFilterNet), cut silences, level to −16 LUFS, and sync motion to the word times (faster-whisper). |
| Bahraini draft before he records | Local Chatterbox **V2**, standard spelling («قال، سمك، كذا»; his pick #4). Tell him plainly it has no Bahraini accent and sounds AI. |
| **MSA** | Local Chatterbox **V2** (`from_pretrained(device='cpu')`) + **full tashkeel with waqf** written by Claude (his pick #2). V3 only when speed matters. |
| A real recording of him is available | Use it as the clone reference instead of the bank. |

## 2. Write the script in the dialect itself, not "MSA with a few words"
- **Bahraini:** follow `references/bahraini.md`. Write the words as they are said («بتبدا»، «دوم»، «بروحه»، «الصوب»، «انتو مستعدين؟»). Avoid «هل» and «سوف» and MSA case endings.
- **MSA:** follow `references/msa.md` (light tashkeel only where reading is ambiguous).
- Short sentences with natural punctuation. «…» gives a dramatic pause, «،» a short breath, «—» a quick cut.
- Names and difficult words: on v4/v3 write the pronunciation in IPA between `/…/` if the model misreads them, but show the normal spelling in the captions.

## 2b. Prepare the text before any engine (`scripts/prep_text.py`)
`~/tools/arabic-venv/bin/python scripts/prep_text.py script.txt --dialect msa|gulf --engine chatterbox|eleven [--check] --json > sents.json`
- **Numbers → words** in the spoken form («عام ألفين وستة وعشرين»), punctuation unified, «...» → «…», Latin words flagged (write them in Arabic letters for local engines).
- **MSA diacritics (measured, Chatterbox, 7 sentences × 2 takes):** full tashkeel with **waqf** (sukun on the last word before each punctuation mark) gave **2.4% CER**, against 5.1% (word-internal only), 13.5% (shadda/tanween only) and 13.6% (none). Only waqf got «فاجتهد» right (others: «فاشتهد») and a short phrase right. So: **Claude writes the full tashkeel itself** (more accurate than CATT: ~4.7% vs ~20% word errors in published tests), then `--tashkeel keep --check` lets CATT flag disagreements to review. With no tashkeel in the input, the default is CATT + waqf.
- **Dialect:** no case endings; mark only ambiguous internal vowels (`--tashkeel none` + manual marks).
- **Chunks:** the tool splits at . ؟ ! … ؛ : (Chatterbox turns … : ؛ into a comma, so the pause would be lost) and **merges any chunk under 4 words into the next** (alone, «الغيمة الصغيرة…» came out as gibberish). The pause inside a merged chunk is cut in at the word boundary by `assemble_vo.py`.
- **Pauses (s):** ، 0.22 · ؛ : 0.32 · . 0.50 · ؟ ! 0.55 · … 0.75 · — 0.14 · paragraph 1.1. ElevenLabs v3/v4 ignore `<break>`: use «…», `[short pause]`, `[long pause]`.
- **Assemble:** `~/tts/.venv/bin/python scripts/assemble_vo.py sents.json raw/ out.wav` → best take per chunk by CER (digits normalised), model tail trimmed, inner gaps ≤ 0.24 s, exact pauses, `out.timing.json` with word times for syncing motion to words.
- CER cannot hear vowels (Whisper writes without them) or ض/ظ (it confuses them itself): listen to the waqf take for case endings.

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
