# claude-tools-setup

مستودع أدواتي ومهاراتي وذاكرة Claude بين الجلسات. سكربت واحد يركّب كل شي في أي جلسة Claude Code جديدة (لينكس)، ويشتغل تلقائياً عند بداية الجلسة (`.claude/settings.json`).

## الاستخدام
```bash
git clone https://github.com/SJJ2D/claude-tools-setup && cd claude-tools-setup
bash install-all.sh
```
ثم ابدأ محادثة جديدة لتظهر المهارات. `SKIP_HEAVY=1` يتخطى الأدوات الثقيلة (هذا ما يستخدمه التشغيل التلقائي).

## ترتيب المستودع
| المسار | المحتوى |
|---|---|
| `CLAUDE.md` | تعليمات الجلسات: من أنا، المهارات، تفضيلات الفيديو والصوت، قواعد الذاكرة. |
| `profile/study-guide.md` | ملفي الدراسي وطريقة العمل معي في الأسايمنتات والخطط. |
| `install-all.sh` | المدخل الوحيد للتركيب؛ يشغّل سكربتات `installers/`. |
| `installers/` | سكربتات التركيب حسب المجال (المعلم، البرمجة والتصميم، الفيديو، الوكلاء، nexcode، design-toolkit، الأدوات المعتمدة، REA/CallMe، والأدوات الثقيلة عند الطلب `on-demand.sh` و`arabic-nlp.sh`). |
| `skills/` | مهاراتي الخاصة: `arabic-voiceover` (مع بنك النبرات)، `animation-styles`، `study-tools`، `design-toolkit`. |
| `tools/` | سكربتات مساعدة: `arabic_nlp.py` (تشكيل ومستوى القراءة)، `arabic_ocr.py` (OCR عربي)، `upscale.py` (تكبير الصور). |
| `docs/CATALOG.md` | الفهرس الكامل بالمصادر والرخص والملاحظات. |
| `memory/` | ذاكرة خادم MCP memory (حقائق عامة فقط، بدون بيانات طلاب). |
| `vendor/B Studio.zip` | حزمة B Studio (edit-studio وvideo-edit). |
| فرع `videos` | الفيديوهات النهائية الكبيرة للتحميل. |

## ملاحظات
- لا يُنسخ كود المصادر الخارجية داخل المستودع؛ السكربتات تنزّله من مصدره الرسمي على نسخة محددة تمت مراجعتها.
- مهارات حساب Claude (docx وpdf وpptx وxlsx...) تأتي مع الحساب تلقائياً.
