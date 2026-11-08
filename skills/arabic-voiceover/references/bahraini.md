# Writing guide: Bahraini dialect (for voiceover)

> General guide. Bahrain has more than one variety (for example the dialect of the Arabs of Muharraq and Riffa, and the dialect of the Baharna), and pronunciations differ. If the user corrects a word, write the correction into "User notes" at the end of this file.

## Common words and expressions (use them instead of MSA)
| MSA | Bahraini |
|---|---|
| ماذا / ما | شنو |
| كثيرًا / جدًا | وايد / حيل |
| هكذا | جذي |
| الآن | الحين |
| دائمًا | دوم |
| وحده / بمفرده | بروحه / بروحها |
| الجهة / الجانب | الصوب |
| سهل جدًا | سهالات |
| هل أنتم مستعدون؟ | انتو مستعدين؟ |
| سوف يبدأ / ستبدأ | بيبدا / بتبدا |
| لا تنخدع بمظهره | لا يغرّك شكله |
| ليس | مو |
| يريد | يبي |
| لماذا / أين / من / كيف | ليش / وين / منو / شلون |
| اثنان | ثنين |
| حسنًا / جيد | زين |
| انتبه / في الحقيقة | ترى |
| ما بك؟ | شفيك؟ |
| يا إلهي (تعجب) | يا حافظ / الله يستر |

## Writing tips for the voice model
- **Future tense with «بـ»:** «بتبدا الحرب»، «بنشوف»، «بيوصل».
- **The «ق» sound:** in many Bahraini Arab words it comes out "g" (قال ← «گال»). The model may not read «گ» or «چ»: try them, and if it ignores them, go back to «ق» or «ك» and use the IPA option on v4/v3 for important words only.
- **Drop case endings:** no tanween or final diacritics (عالمٍ ← عالم).
- **«ة» at the end:** pronounced "a" (سهلة ← sahla). If the model drops it, try light diacritics «سَهْلَة» or use the IPA option.
- **Name parentheses and nicknames:** keep them as the user wrote them («الشبّاس الصيّاد»).

## Tested examples (from the "الحرب العظمى" trailer)
- «في عالم... ما فيه قانون... ولا رحمة... ولا حتى واي فاي.»
- «في ولاية ليونيدا... بتبدا الحرب العظمى.»
- «حسن محمد البيب... دوم يوصل قبل الكل.»
- «الشامة بروحها سلاح.» / «وفي الصوب الثاني...» / «خمسة ضد ثنين؟ سهالات... لا والله... مو سهالات!»

## Spelling of g / ch sounds (measured, Chatterbox V3, Bahraini warm reference, 4 lines × 2 takes)
- **Standard spelling** («قال، سمك، كذا»): 2.3% CER, every line clear; the engine says them the MSA way (q / k).
- **Phonetic spelling with گ / چ** («گال، سمچ، چذي»): 6.8% CER; Whisper heard «آل»، «سمسا»، «هذي». The local engine does **not** turn گ/چ into g/ch, it blurs them.
- Rule: for the local engine keep the standard spelling and accept MSA-like q/k. Real Bahraini g/ch («گال»، «چذي»، «باچر») needs ElevenLabs with the user's cloned voice (with his consent). The phonetic spelling there is untested: try two takes.
- Use `prep_text.py --dialect gulf` (numbers in spoken Gulf form: «خمسة وعشرين»، «مية») with `--tashkeel none`.

## User notes (add his corrections here)
- (empty)
