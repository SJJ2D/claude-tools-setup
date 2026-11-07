---
name: study-tools
description: أدوات سجاد المحلية للعمل الجامعي والتعليمي والوسائط: بحث عن أبحاث (paper-search)، توثيق APA 7 بـ Pandoc، تحويل PDF/Word/PPTX إلى نص (markitdown)، تشكيل النصوص العربية (CATT)، قياس صعوبة القراءة العربية (BAREC) لملاءمة الصفوف 1–3، خرائط ذهنية (markmap)، خطوط عربية، نص عربي في Three.js (troika)، مزامنة الشفاه (rhubarb). استخدمها في الأسايمنتات والخطط والمراجع والمراجعة الأدبية ونصوص القراءة للأطفال والفيديوهات.
---
# أدوات الدراسة والوسائط (مركّبة من install-approved-tools.sh)

اقرأ أولاً `profile/study-guide.md` في المستودع لأي مهمة دراسية.

## الشبكة في الحاوية
قبل أدوات بايثون التي تتصل بالإنترنت: `export REQUESTS_CA_BUNDLE=~/tools/ca-all.pem SSL_CERT_FILE=~/tools/ca-all.pem` (الملف = شهادات certifi العامة + شهادة البروكسي؛ تنشئه سكربتات installers تلقائياً. شهادة البروكسي وحدها تفشل مع مواقع مثل raw.githubusercontent).

## البحث عن مصادر
- `paper-search search "<query>" -s crossref,openalex,semantic -n 10` (JSON). تنزيل: `paper-search download <source> <id> -o ./papers`.
- لا تستخدم مصدر sci-hub. تحقّق من كل مرجع (DOI، السنة، المؤلف) قبل كتابته؛ لا تخترع مراجع.
- أبحاث التربية: ابدأ بـ crossref وopenalex وsemantic وdoaj وeric إن توفر.

## APA 7
- اكتب Markdown مع `[@key]` وملف `.bib`، ثم:
  `pandoc in.md --citeproc --bibliography refs.bib --csl ~/tools/csl/apa.csl -o out.docx`
- للعربية أضف `-V dir=rtl` أو `--reference-doc` بقالب RTL. راجع المراجع العربية يدوياً.

## قراءة الملفات
- `~/.local/bin/markitdown file.pdf > file.md` (PDF/DOCX/PPTX/XLSX/HTML). الملفات الممسوحة ضوئياً تحتاج OCR.

## نصوص عربية للأطفال (ثقيل؛ يُركّب عند أول استخدام: `bash installers/arabic-nlp.sh`)
- تشكيل: `~/tools/arabic-venv/bin/python <المستودع>/tools/arabic_nlp.py tashkeel "<نص|ملف>"`
- مستوى القراءة: `... arabic_nlp.py readability "<نص|ملف>"` → مستوى BAREC لكل جملة (1–19). تقريباً: ≤6 روضة/أول، ~6–7 ثاني، ≤11 حتى الرابع. جملة فوق ~9 لطفل صف 1–3 تحتاج تبسيطاً.
- التشكيل الآلي فيه أخطاء (مثال مُختبر: «تُغْنِي» بدل «تُغَنِّي»)؛ راجعه دائماً قبل إعطائه للأطفال، وقل للمستخدم ذلك. النتائج "ملاءمة تقديرية" وليست مطابقة رسمية للمنهج.

## خرائط ذهنية
- `markmap notes.md -o map.html --offline` ثم لقطة PNG عبر Playwright. اختبر اتجاه العربية.

## وسائط
- خطوط عربية (OFL) في `~/.local/share/fonts/arabic`: Almarai، Cairo، Tajawal، Baloo Bhaijaan 2 (أطفال)، Amiri، Readex Pro، Lalezar، Reem Kufi، Noto Naskh/Kufi، Aref Ruqaa، Rakkas، Alexandria.
- نص عربي متصل داخل Three.js: `~/tools/js/node_modules/troika-three-text` (انسخه إلى مشروع الويب).
- مزامنة الشفاه: `~/tools/rhubarb/rhubarb -r phonetic -f json voice.wav > mouth.json` (للعربية استخدم phonetic).
- أصول 3D CC0: `~/tools/assets3d` (RobotExpressive.glb). حزم Quaternius/KayKit/Kenney تُنزّل يدوياً من itch.io (مواقعها تمنع التنزيل الآلي)؛ إذا رفعها المستخدم ضعها في `assets/3d/` في المستودع (CC0 يسمح).

## MCP المركّبة
chrome-devtools (متصفح حقيقي لفحص المواقع والألعاب)، memory (ذاكرة في `memory/memory.jsonl` داخل المستودع؛ لا بيانات طلاب)، sequential-thinking، fetch.

## أدوات ثقيلة عند الطلب: `bash <المستودع>/installers/on-demand.sh <أداة>`
لا تعمل عند بداية الجلسة. إذا احتاجت المهمة أداة منها: ركّبها أولاً (idempotent، يتحقق من المساحة)، ثم استخدمها.
| الأداة | متى | الاستخدام بعد التركيب | المساحة |
|---|---|---|---|
| `rembg` | إزالة خلفية صورة | `~/tools/media-venv/bin/rembg i -m isnet-general-use in.png out.png` (لا تستخدم النموذج الافتراضي bria: رخصته تجارية) | ~0.5GB |
| `upscale` | تكبير/تحسين صورة لبوستر | `~/tools/media-venv/bin/python <المستودع>/tools/upscale.py in.png out.png x4` (~10ث لصورة 320px) | ~0.2GB |
| `manim` | أنيميشن رياضيات/علوم | `~/tools/media-venv/bin/manim -qh scene.py Scene`؛ عربي: `Text("...", font="Almarai")` (مُختبر، الحروف متصلة صحيحة) | ~0.3GB |
| `blender` | نمذجة/رندر 3D احترافي | `~/tools/blender/blender -b -P script.py` (4.5 LTS؛ EEVEE وCycles يعملان على CPU؛ احذف مكعب المشهد الافتراضي أولاً) | ~1GB |
| `docling` | PDF معقد بجداول | `~/tools/arabic-venv/bin/docling file.pdf --to md --output out/` | ~1.5GB |
| `camel` | صرف عربي (جذر، وزن، نوع الكلمة)، لهجات | `~/tools/camel-venv/bin/python` + `camel_tools.morphology` (مثال مُختبر: المدرسة → د.ر.س) | ~2GB |
| `qari` | OCR لكتاب عربي مصوّر | `~/tools/arabic-venv/bin/python <المستودع>/tools/arabic_ocr.py page.png` (دقائق للصفحة على CPU) | ~7GB |
| `habibi` | صوت خليجي (سعودي/إماراتي) | `~/tools/habibi-venv/bin/habibi-tts_infer-cli --dialect SAU ...` (لا بحريني؛ SAU/UAE غير تجاري) | ~6GB |
| `acestep` | توليد موسيقى حقيقية | `~/tools/ACE-Step-1.5` (اقرأ README) | ~15GB |
| `arabic` | تشكيل + مستوى القراءة | انظر القسم أعلاه | ~1.5GB |
| `careerops` | بحث عن وظائف وسيرة ذاتية | `~/tools/career-ops` (افتح Claude داخله؛ بيانات شخصية، لا ترفعه) | ~0.3GB |

المساحة محدودة في الحاوية (~8GB حرة في جلسة نموذجية): لا تركّب qari وhabibi وacestep معاً. نظّف قبلها: `rm -rf ~/.cache/pip ~/.cache/uv` وحذف أدوات غير مطلوبة من `~/tools`.
