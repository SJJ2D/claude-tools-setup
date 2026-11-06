# تعليمات للجلسات
- المهارات المركّبة في ~/.claude/skills تُستخدم تلقائياً حسب الحاجة بدون انتظار أمر من المستخدم: اختر المهارة التي تفيد المهمة وطبّقها.
- سجل التركيب: /tmp/claude-tools-install.log. إن لم تظهر مهارة، شغّل: bash install-all.sh
- مصادر خارجية (Context7 وغيره) لا تُرسل لها أسراراً ولا بيانات طلاب.

## من أنا (اقرأ أولاً)
- المستخدم: سجاد، طالب سنة رابعة في كلية المعلمين بجامعة البحرين. ملفه الكامل وطريقة العمل معه في `profile/study-guide.md`.
- قبل أي أسايمنت أو خطة درس أو تقرير أو عرض أو تأمل: اقرأ `profile/study-guide.md` كاملاً وطبّق الأجزاء المرتبطة بالمهمة (ترتيب المرجعيات، SMART، بلوم، التكامل، STEAM، صيغة النقد، قائمة الفحص).
- خاطبه بالمذكر وبلهجة بحرينية بسيطة في النقاش، وفصحى طبيعية في النص الأكاديمي. لا تختلق مراجع أو تجارب أو مطابقة رسمية للمنهج.
- إذا صحّح معلومة أو أضاف تفضيلاً دائماً: حدّث الملف ثم commit وpush.
- أدوات الدراسة المحلية (أبحاث، APA، تشكيل، مستوى القراءة، خرائط ذهنية، خطوط، lip sync): `skills-own/study-tools/SKILL.md`.
- لا أساعد في تمويه نصوص مولّدة لتجاوز كواشف الذكاء الاصطناعي في الواجبات؛ أساعده يكتب بصوته وأفكاره (كما في ملفه، القسم 2).

## Video and voiceover preferences (from the user's notes on the "الحرب العظمى" trailer)
- **Camera:** steady with smooth movements. No continuous handheld shake, and no strong shake on steps or impacts. If needed, one light, short shake on an important hit only. Transitions use a cut on the beat or a fade instead of a fast camera spin.
- **Lighting:** consistent across the whole video. Measure each shot's brightness and match it to one level, use one colour grade, and don't shoot characters against the sun (silhouettes); light them from the side or from behind the camera.
- **Voice:** use the `arabic-voiceover` skill. The user wants a professional voice like ElevenLabs, and the dialect for real (Bahraini) when he asks for it, not MSA. The best option is his own voice on ElevenLabs (v4/v3 with tags), with his consent. The local model is only a fallback, and if used he must be told clearly that it leans toward MSA.
- Before rendering a long video: an approval package (script + voice sample + stills), then the edits in one batch.

## The repo as a memory between sessions
- Your own skills are in `skills-own/` inside this repo and can be read directly even if they didn't load as a skill in this session:
  - `skills-own/arabic-voiceover/SKILL.md`: any Arabic voiceover (the user's voice, dialect, tones, quality checks).
  - `skills-own/animation-styles/SKILL.md`: short animations and video styles.
- Before any task related to video, voice, education or design: read the relevant skill from `skills-own/` and apply it, without waiting for an instruction.
- When the user gives a new note or preference, or you learn a lesson from a mistake: add it to the relevant section here or in the relevant skill, then commit and push (that way it is remembered in the next session).
- **Transitions the user liked (v2):** a GTA-style character switch. The camera rises to the sky, crosses to the next location, then descends onto the next character, with three thumps. Plus characters in different locations (beach, city centre, desert) and a living world (pedestrians and animals that react).
- **Lighting:** after building the shots, measure each shot's mean brightness (`__lum`) and set an exposure multiplier so each matches a target (~0.55 by day, ~0.42 for intentional dusk).
- **Comedy he likes:** absurd exaggeration around the nickname ("زلفه يوصل قبله بثانيتين", "هرنه يوصل قبله", "الشامة عندها متابعين أكثر منه"), plus characters talking in distinct voices.
- Last project's files (not in the repo): /home/user/film4 (web/, voice/, score.py). Local voices from emotion_bank.
