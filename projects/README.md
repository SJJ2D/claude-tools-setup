# مصادر المشاريع (للاستعادة والبناء عليها)

هنا ملفات المصدر الصغيرة فقط: الكود، والنصوص، والتوقيتات، والتعليق الصوتي النهائي بصيغة FLAC.
الرندرات النهائية على فرع `videos`. الرندرات المؤقتة والـ node_modules وthree.min.js لا تُحفظ.

| المجلد | المشروع | الفيديو النهائي على فرع `videos` |
|---|---|---|
| `gta6-voxel/` | إعلان GTA6 فوكسل v2 (Three.js + onetake). `comp2.html` هو v2 و`comp.html` هو المسودة الأولى | `gta6_voxel_v2.mp4`، `gta6_voxel_v2_story.mp4` |
| `repo-intro/` | الفيديو التعريفي للمستودع (onetake، تعليق بالفصحى) | — (مسودة) |
| `great-war-v2/` | إعلان «الحرب العظمى» v2 (Three.js، شخصيات، تبديل GTA) | `Great_War_v2.mp4`، `Great_War_v2_story_9x16.mp4` |
| `great-war-v1/` | v1: الكود والستوريبورد ومختبر الصوت (المقاييس وLTAS) | `Great_War_trailer_HQ.mp4` |

## الاستعادة في جلسة جديدة
```bash
P=/home/user/work/gta6 && mkdir -p $P && cp -r projects/gta6-voxel/* $P/ && cd $P
cp ~/.claude/skills/onetake/lib/motion.js .                       # motion.js من onetake كما هو
curl -sL https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js -o three.min.js
for f in vo/final/*.flac; do ffmpeg -loglevel error -i "$f" "${f%.flac}.wav"; done
```
- `fonts.js` يحمل الخطوط مضمّنة base64 (Readex Pro = AR، Lalezar = LZ، مجزّأة بـ fontTools).
- مشاريع «الحرب العظمى»: `cd web && npm install` (Three.js من package.json).
- بعض سكربتات الصوت فيها مسارات قديمة (`/home/user/film3`، أو مجلد scratchpad): عدّلها لمكانك الجديد.
- الرندر: `python3 ~/.claude/skills/onetake/scripts/render.py comp2.html --fps 30` (مسودة)، و`--final` (4K60) بعد الاعتماد. للعمودي: `--width 1080 --height 1920` مع `?v=1` في نسخة الـGTA.

## سياسة المساحة
- مساحة الجلسة حصة ثابتة (`df` مضلِّل). قبل أي رندر طويل اعرف المساحة المتاحة: `df -h / | tail -1`.
- بعد التسليم: ارفع الفيديو النهائي لفرع `videos`، واحفظ المصدر هنا، ثم احذف مجلد العمل (`out/`، الإطارات، الـ wav الوسيطة).
- أدوات `on-demand.sh` تُحذف بأمان (تعيد تركيبها عند الحاجة). كاش النماذج في `~/.cache/huggingface` هو أول ما يُحذف عند الضيق.
