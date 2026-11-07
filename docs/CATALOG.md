# حقيبة المعلم: ما الذي ركّبته ولماذا

كل ما هنا تحققت منه بنفسي: نزّلت المستودع، وعددت المهارات، وقرأت الرخصة، وفحصت الملفات بحثاً عن أوامر خطرة، وثبّتّ التركيب على نسخة (commit) محددة. **لا يوجد كود طرف ثالث منسوخ داخل هذا المستودع**؛ السكربت ينزّله من المصدر الرسمي (لاحترام الرخص).

| المصدر | الرخصة | وش يفيدك |
|---|---|---|
| **anthropics/skills** (12 مهارة مفعّلة) | لكل مهارة رخصتها في مجلدها | Word وPDF وPowerPoint وExcel، وتصميم الواجهات والمواقع (`frontend-design`, `web-artifacts-builder`)، واللوحات والشعارات، واختبار المواقع، وكتابة مستندات بالتعاون. |
| **GarethManning/education-agent-skills** (165 مهارة؛ 43 مفعّلة والباقي في `teacher-library`) | CC BY-SA 4.0 (المؤلف Gareth Manning) | تخطيط الوحدات بالتصميم العكسي، ومواءمة المنهج، وفحص صلاحية الاختبارات، والتعليم الصريح، والدمج والتصميم الشامل، والأسئلة والنقاش، وعلم التذكر، ودعم متعلمي اللغة. |
| **zarazhangrui/frontend-slides** | MIT | شرائح HTML جميلة، وتحويل PowerPoint إلى HTML. |
| **gamedev-skills (Phaser / PixiJS / Three.js)** (4 مهارات) | Apache-2.0 | ألعاب تعليمية تعمل في المتصفح، من 2D إلى 3D. |
| **OleksiiDotsenko/lesson-in-game** | MIT | تصف درسك فيتحول إلى لعبة جماعية يلعبها الطلاب على جوالاتهم عبر شبكة الصف، وتعطيك تقريراً بما يحتاج إعادة تدريس. محلي بالكامل ولا حسابات. |
| **6missedcalls/video-editing-skill** | MIT | مونتاج بسيط بالكلام: قص، وإزالة السكتات، وكابشن، وتسريع (ffmpeg وWhisper). |
| **iart-ai/explainer-video-skills** (5 مهارات) | MIT | فيديوهات شرح وسبورة بيضاء ورسوم متحركة للمفاهيم، مناسبة لمحتوى المعلمين. |
| **every-app/open-seo** (مهارات SEO، في `install-all.sh`) | MIT | تحتاج مفتاح DataForSEO المدفوع؛ فائدتها لك محدودة إلا لو عندك موقع. |

## حقيبة البرمجة والتصميم (`install-dev-design-toolkit.sh`)
| المصدر | الرخصة | وش يفيدك |
|---|---|---|
| **obra/superpowers** (15 مهارة) | MIT | منهجية تطوير: تخطيط، TDD، تصحيح الأخطاء، مراجعة الكود. |
| **wshobson/agents** (59 مهارة مختارة) | MIT | Python وJavaScript/TypeScript، وAPIs، وقواعد البيانات، والأمان، والواجهات، وإتاحة الوصول، والألعاب، وسكربتات Shell. |
| **ahmed-badawood/designing-arabic-frontends** | MIT | واجهات عربية: RTL، الخطوط، الأرقام والتواريخ، Tailwind/React. |
| **plugin87/ux-ui-agent-skills** (27 مهارة) | MIT | أنظمة تصميم، رموز (tokens)، WCAG، مراجعة التصميم. يُحفظ كاملاً في `~/tools` وتحتاج تشغّل Claude Code من داخل مجلده. |

## ملاحظات صريحة
- **راجع قبل الاعتماد:** مهارات التربية هي تعليمات عامة مبنية على أبحاث، وليست مصمّمة لمنهج البحرين. اطلب مني ربطها بمنهج وزارة التربية والتعليم.
- **أبرز ما يناسب مجالك فوراً:** `backwards-design-unit-planner` للخطط، وفحص الاختبارات، و`frontend-design` للمواقع، وPhaser وlesson-in-game للألعاب.
- **للمواد العربية:** اللغة العربية تعمل في الشرائح والمستندات، لكن تأكد من اتجاه النص (RTL) في أي ناتج جديد.
- **أشياء بحثت عنها ولم أراجعها** (لا تُركّب قبل المراجعة): `tunapanda/h5p-standalone` (عرض محتوى H5P التفاعلي)، `Dragon-01-you/lesson-plan-skill` (صيني)، `EtherealMingo/university-teacher-skills` (صيني، رخصته غير واضحة)، `michaelseth/claude-education-skills` (بلا رخصة، فلا يجوز نسخه).
- ما لقيت أدوات جاهزة تستحق التوصية لتوليد أوراق العمل أو مواد عربية خاصة؛ هذا يُصنع عبر المهارات أعلاه حسب الطلب.


## B Studio
ملف `B Studio.zip` في جذر المستودع رفعه صاحب المستودع بنفسه ويتحمل مسؤولية حقوقه. السكربت يستخدمه، وإن غاب ينزّل الاستوديو من المستودع الرسمي.

## مهارات مونتاج وفيديو برمجي (install-video-skills.sh) — من claude-video-editor.nadr.ai
فُحصت بـ NVIDIA SkillSpector (بدون LLM) + مراجعة يدوية لأنماط الشبكة والمفاتيح والأوامر الخطرة.

| المهارة | الرخصة | الحالة |
|---|---|---|
| HyperFrames (9 مهارات) | Apache-2.0 | تُركَّب. فيها تتبّع استخدام PostHog في media-use؛ عطّله بـ DO_NOT_TRACK=1. الفحص الكامل للمستودع انتهت مهلته، فراجعتُ مجلد skills يدوياً |
| Lemo Opuscar | MIT | تُركَّب مع مكتبتها مثبّتة في ~/lemo-opuscar. سكربت setup.sh الخاص بالمهارة قد يحدّث المكتبة من الإنترنت |
| OneTake | PolyForm Noncommercial | تُركَّب. SkillSpector قال CRITICAL / DO_NOT_INSTALL بسبب حدود تغطية الماسح؛ مراجعتي اليدوية: ffmpeg وملفات مؤقتة فقط، بلا شبكة ولا مفاتيح. للاستخدام غير التجاري فقط |
| Clawd Animation Base | MIT | ليست مهارة (لا SKILL.md): قاعدة Node في ~/tools/ClaudeAnimationBase. الفحص LOW |
| Collage B-roll | — | اختيارية (INSTALL_COLLAGE=1). SkillSpector HIGH أغلبه إنذارات كاذبة، لكنها تحتاج أدوات مدفوعة (MaxFusion/Gemini) وتوجّه Claude ألا يسأل المستخدم |

## أدوات برمجة عامة (install-agent-tools.sh)
فُحصت بـ SkillSpector (بدون LLM). الدرجات تحذيرية فقط؛ راجعت أعلاها يدوياً.

| المصدر | الرخصة | الفحص والملاحظات |
|---|---|---|
| addyosmani/agent-skills (25 مهارة) | MIT | CRITICAL / DO_NOT_INSTALL بسبب مهارة security-and-hardening (محتواها دفاعي: نموذج تهديدات وقوائم أمان، والماسح يطابق كلمات مثل exploit) وملفات مرجعية لم تُفحص كاملة (تغطية 80%). المهارات الأخرى LOW/MEDIUM. مراجعتي اليدوية: نصوص إرشادية، والتحذير «تجاهل التعليمات» في browser-testing هو قاعدة تمنع حقن الأوامر وليس حقناً |
| upstash/context7 (3 مهارات) | MIT | MEDIUM / CAUTION. الخادم MCP يرسل أسئلة الأكواد لخدمة Upstash؛ يُضاف يدوياً |
| 21st-dev/magic-mcp (مهارة 21st-ui) | ISC | LOW / SAFE. الخادم يحتاج مفتاح API من 21st.dev |
| usestrix/strix (9 مهارات) | Apache-2.0 | HIGH / DO_NOT_INSTALL بسبب مهارة CI التي تشرح `curl strix.ai/install \| bash` كمثال في GitHub Actions (توثيق وليس تنفيذاً هنا). مهارات اختبار اختراق: لتطبيقاتك أو بإذن فقط. الأداة نفسها تحتاج Docker |
| Graphify-Labs/graphify | Apache-2.0 | أداة بايثون تُركَّب بـ uv على نسخة مثبّتة ثم `graphify install` يسجّل المهارة. لم أفحصها بـ SkillSpector لأنها حزمة وليست مهارة |

## من مدونة nexcode.codes (install-nexcode-skills.sh)
قرأتُ كل تدوينات المدونة (صفحتان) واستخرجت منها المستودعات. المركّب:

| المصدر | الرخصة | الفحص |
|---|---|---|
| Leonxlnx/taste-skill | MIT | مراجعة يدوية (SkillSpector انتهت مهلته): تحميل ملفاته المحلية فقط عبر fetch، بلا مفاتيح ولا أوامر خطرة. حجمها كبير (1617 ملف) |
| pbakaus/impeccable | Apache-2.0 | مراجعة يدوية: سكربت `impeccable` ينزّل «محرّك» بنسخة محددة عند أول تشغيل، وlive mode يشغّل خادماً محلياً؛ لا تحقنه في موقع منشور |
| microsoft/playwright-cli (مهارة) | Apache-2.0 | SkillSpector بدون درجة (تغطية 79%). الأداة نفسها: `npm install -g @playwright/cli` ولم أثبّتها |
| img2threejs/img2threejs | Apache-2.0 | مراجعة يدوية: بايثون يشغّل عمليات فرعية محدودة ويمرّر متغيرات بيئة من قائمة سماح |
| Jakeschincariol/youtube-agent-skill (11) | MIT | SkillSpector: بلا نتائج مرتفعة، تغطية 100%. أغلب أدواتها لا تقرأ العربية |
| Jakeschincariol/console-skill (11) | MIT | HIGH / DO_NOT_INSTALL بسبب نسخ متغيرات البيئة في console-anywhere وconsole-tester؛ راجعتها يدوياً: تمرير البيئة لعملية فرعية فقط، بلا شبكة. استخدمها على أقراصك أنت فقط |
| VoltAgent/awesome-design-md | MIT | ملفات نصية مرجعية، تبقى في ~/tools/awesome-design-md |

**REA وCallMe رُكّبا لاحقاً بطلب المستخدم (install-rea-callme.sh، خارج وضع SKIP_HEAVY).** الأسطر التالية كانت قبل ذلك:

**لم يُركَّب افتراضياً:**
- **REA** (morluto/rea): أداة هندسة عكسية تعدّل إعدادات الوكلاء وتضيف خادم MCP، وتُشغَّل بـ `npx rea-agents@latest setup` من مجلد موثوق. قرارك متى تحتاجها.
- **CallMe** (ZeframLou/call-me): يتصل بجوالك عبر مزوّد هاتف (Telnyx) ومفتاح OpenAI ونفق ngrok يعرّض خادماً محلياً للإنترنت.
- **تطبيقات لا مهارات:** OpenMausBot، وتطبيقات المدونة المفتوحة (AppFlowy وOpenProject وChatwoot وCap وCal.diy وOpenWhispr). منها Open Generative AI وVoiceStudio وOpenSEO مضافة أصلاً.
- تدوينات الأنيميشن (19 ستايل): برومتات فقط وليست مهارات.

## مهارات خاصة بي (skills/)
- `arabic-voiceover`: تعليق صوتي عربي (بحريني/فصحى)، بنك النبرات (emotion_bank) وفحص الجودة.
- `study-tools`: دليل استخدام الأدوات المعتمدة أدناه.
- `motion-craft`: قواعد جودة الفيديو والحركة بالكود. دروسي من إعلان «الحرب العظمى» وفيديو المستودع، مع أفكار عامة من ملف عام لصاحب قناة (ISOM Motion، Google Drive، بلا رخصة مكتوبة) أعيدت صياغتها دون نسخ النص، وأُهمل ما يخص الماك وأجهزته (Premiere MCP لا يعمل في الحاوية).
- `animation-styles`: 19 ستايل أنيميشن من تدوينتَي nexcode مع قالب البرومت وكتلة التنفيذ (seek(t)) وسكربت التصدير إلى mp4 وجدول توجيه للمهارات الأخرى. تُنسخ تلقائياً في `install-all.sh`. الستايل 19 وصل مبتوراً من الصفحة فبطاقته مختصرة.

## design-toolkit ومهارات 21st.dev (install-design-toolkit.sh)
| المصدر | الرخصة | الملاحظات |
|---|---|---|
| `skills/design-toolkit` (كتبتها مع Claude، داخل هذا المستودع) | تابعة لمستودعك | متى تُستخدم GSAP وLenis وReact Bits و21st.dev، وقواعد حركة (تقليل الحركة، RTL، الأداء). |
| GSAP 3.15.1 وLenis 1.3.27 (من npm وقت التركيب) | GSAP: رخصة GreenSock المجانية (مجانية حتى تجاريًا)، Lenis: MIT | نسخ محلية في `assets/` داخل المهارة، ولا تُحفظ في المستودع. |
| مكوّنات React Bits (من reactbits.dev وقت التركيب) | MIT مع Commons Clause (لا تُباع كما هي) | كود 218 مكوّنًا (TS + Tailwind) في `assets/react-bits`. |
| 21st.dev: 8 مهارات رسمية من `21st.dev/.well-known/skills` | يحددها الموقع | الجلب والتوليد والنشر تحتاج أداة `21st` ومفتاح API من 21st.dev/settings/api-keys. قرأتها قبل التركيب فلم أجد أوامر خطرة. لا تُثبَّت على نسخة commit لأن الموقع لا يوفر نسخًا مثبّتة. |

## الأدوات المعتمدة (نوفمبر 2026، install-approved-tools.sh)
| الأداة | المصدر | الرخصة | ملاحظات |
|---|---|---|---|
| paper-search (CLI + مهارة) | openags/paper-search-mcp | MIT | بحث في ~20 قاعدة أبحاث. الاستعلامات تذهب لمواقع خارجية؛ لا يُفعّل sci-hub. |
| Pandoc + apa.csl | citation-style-language/styles | CC BY-SA 3.0 | توثيق APA 7 بدون إنترنت → `~/tools/csl/apa.csl`. |
| markitdown[all] | microsoft/markitdown | MIT | PDF/DOCX/PPTX/XLSX → Markdown. |
| markmap-cli | markmap/markmap | MIT | خرائط ذهنية. |
| troika-three-text | protectwise/troika | MIT | نص عربي متصل في Three.js → `~/tools/js`. |
| Rhubarb Lip Sync 1.14.0 | DanielSWolf/rhubarb-lip-sync | MIT | حركة الفم من الصوت → `~/tools/rhubarb`. |
| 17 خط عربي | google/fonts (ofl) | OFL | `~/.local/share/fonts/arabic`. |
| RobotExpressive.glb | three.js examples | CC0 | حزم Quaternius/KayKit/Kenney تُنزّل يدوياً (تمنع التنزيل الآلي) وتوضع في `assets/3d/`. |
| MCP: chrome-devtools 1.12.0، memory 2.1.0، sequential-thinking 2.1.1، fetch | ChromeDevTools / modelcontextprotocol | Apache-2.0 / MIT | memory يحفظ في `memory/memory.jsonl` داخل المستودع (بدون بيانات طلاب). |
| CATT + BAREC (عند الطلب: installers/arabic-nlp.sh) | abjadai/catt، CAMeL-Lab | Apache-2.0 / MIT | تشكيل وقياس مستوى القراءة؛ ~1–2GB؛ النتائج تحتاج مراجعة. |

## أدوات ثقيلة عند الطلب (installers/on-demand.sh)
| الأداة | المصدر | الرخصة | الحالة |
|---|---|---|---|
| rembg (نموذج isnet-general-use) | danielgatis/rembg | MIT | مُختبرة |
| Real-ESRGAN ONNX x2/x4 | SceneWorks/real-esrgan-onnx | BSD-3 | مُختبرة (`tools/upscale.py`) |
| Manim 0.22 | ManimCommunity/manim | MIT | مُختبرة مع خط عربي |
| Blender 4.5 LTS | download.blender.org | GPL | مُختبرة (EEVEE وCycles بدون واجهة). بدل blender-mcp نكتب سكربتات `-b -P` مباشرة لأنها أوثق في حاوية بلا شاشة. |
| Docling | docling-project/docling | MIT | مُختبرة (Word بجدول عربي → Markdown) |
| CAMeL Tools 1.6 | CAMeL-Lab/camel_tools | MIT | مُختبرة (تحليل صرفي) |
| Qari-OCR v0.3 | NAMAA-Space | Apache-2.0 | السكربت جاهز (`tools/arabic_ocr.py`)؛ لم يُختبر لضيق المساحة (~7GB) |
| Habibi-TTS | SWivid/Habibi-TTS | كود MIT؛ نماذج SAU/UAE غير تجارية | السكربت جاهز؛ لم يُختبر (~6GB) |
| ACE-Step 1.5 | ace-step/ACE-Step-1.5 | MIT | السكربت جاهز؛ لم يُختبر (~15GB) |

**لم تُركّب:** Anki MCP وZotero MCP (يحتاجان تطبيقات على جهازك، لا تعمل في الحاوية السحابية).

## تحديث HyperFrames (نوفمبر 2026)
- commit `555c788`: استبدال المهارات القديمة + مهارات «العقيدة» من `.claude/skills` (motion-doctrine، seam-craft، cut-the-curve، captions-overlay، oversized-cursor). لم يُضف changelog-video (خاص بمنتجهم وفيه خطوط تجارية).
- مكتبة القوالب (210 قالب، منها ثلاثية الأبعاد) تُنسخ إلى `~/tools/hyperframes-registry` (~109MB).
- اتصالات الشبكة في سكربتاتها اختيارية (مفتاح Gemini، حساب HeyGen، بحث Openverse)، وتتبّع PostHog في media-use يُعطَّل بـ`DO_NOT_TRACK=1`.

## مهارات إضافية (install-extra-skills.sh، نوفمبر 2026)
| المهارة | المصدر | الرخصة | الحالة |
|---|---|---|---|
| karpathy-guidelines | multica-ai/andrej-karpathy-skills (230 ألف نجمة) | MIT | مركّبة: قواعد تقلل أخطاء البرمجة (تغييرات دقيقة، افتراضات صريحة، معيار نجاح قابل للتحقق). |
| ui-ux-pro-max | nextlevelbuilder/ui-ux-pro-max-skill | MIT | مركّبة ومُختبرة: بحث محلي بسكربت بايثون في قاعدة أنماط وألوان وخطوط، مع دعم `--rtl` للعربية. أخذت المهارة الرئيسية فقط (أخواتها design وbrand وslides تتداخل مع مهارات عندك وبعضها يحمّل صوراً من الإنترنت). |
| humanizer | blader/humanizer | MIT | نسخة محفوظة في السكربت كي لا تعتمد على مزامنة الحساب. |
| motion (/motion) | motiondivision/ai-kit (commit 1e42494) | MIT | مركّبة: أفضل ممارسات حركة الويب (CSS أم Motion، React/Vue/vanilla، الأداء) وبحث الوثائق وتوليد CSS springs. معها خادم Motion MCP المجاني (`https://mcp.motion.dev`، بلا حساب). **لم يُفعَّل** خادم Motion+ (يحتاج حساباً/اشتراكاً: تدقيق الأداء MotionScore وشيفرة الأمثلة). استعلامات البحث تذهب لخوادمهم: لا أسرار ولا بيانات طلاب. يظهر الخادم في جلسة جديدة بعد التركيب. |
| find-skills | vercel-labs/skills (4.2 مليون تثبيت، 38 ألف نجمة، commit d3701c1) | MIT | مركّبة بتعديل محلي: الخطوة 6 الأصلية تثبّت بـ`-y` تلقائياً، فاستبدلتها بقاعدة «راجع الكود وتدقيقات skills.sh أولاً ولا تثبّت إلا بموافقة المستخدم». تبحث بـ`npx skills find` في skills.sh (مُختبر من الحاوية). |
| arabic-design | JamalMohafil/claude-skills (commit ca8c888) | MIT | مركّبة: قواعد عربي نظيف في الواجهات. نص إرشادي فقط. |
| arabic-writing | ahmeddabak/claude-arabic-writing (commit 7001831) | MIT | مركّبة: تدقيق وكتابة فصحى سليمة مع ملف للهجة الخليجية. نصوص إرشادية فقط. |
| arabic-rtl-fixer-ai-skill | ibadwi/arabic-rtl-fixer-ai-skill (commit 015b98f) | MIT (مع جزء من arabic-presentations بـMIT) | مركّبة: أخذت SKILL وreferences وscripts فقط. راجعت سكربتات بايثون (لا شبكة ولا subprocess)، وجربتها على الأمثلة. |
| career-ops | career-ops-hq/career-ops | MIT | عند الطلب (`on-demand.sh careerops`)؛ وكيل بحث عن وظائف يحتاج مجلده الخاص وسيرتك الذاتية. لم يُختبر. |

**لم تُركّب عمداً:**
- **claude-mem:** يلتقط كل ما يفعله الوكيل ويحفظه، ويشغّل خدمة خلفية، وتحليلات الاستخدام مفعّلة افتراضياً. هذا يتعارض مع قاعدة عدم تمرير بيانات الطلاب.
- **GSD (get-shit-done):** يضيف 13 hook تغيّر سلوك كل جلسة وفحص تحديثات من الشبكة. يناسب مشروعاً كبيراً بعينه: يُشغَّل داخل مجلد ذلك المشروع فقط عند الحاجة (`npx get-shit-done-cc`).
- **superpowers وgraphify وimpeccable وhyperframes:** كانت مركّبة أصلاً.

## مهارات الحِرفة (installers/install-craft-skills.sh، نوفمبر 2026)
بحث عميق بأربعة باحثين (إخراج، تصميم، مونتاج، صوت): كل مهارة قُرئ SKILL.md وسكربتاتها، وفُحصت الرخصة والحجم وتدقيقات skills.sh (Gen/Socket/Snyk)، وثُبّتت على commit. تُجلب بـ sparse checkout (الملفات المطلوبة فقط).

| المجال | المهارات | المصدر | الرخصة |
|---|---|---|---|
| **الإخراج** | storyboard-previsualization، cinematic-shot-direction، cinematic-trailer-production، educational-animation-production، performance-direction، character-design-continuity، color-grading-finishing، editing-montage | calesthio/generative-media-skills | MIT (نصوص فقط) |
| | motion-art-direction، shot-composition، beat-sync-editing | iart-ai/motion-design-skills | MIT |
| | creative-brief | iart-ai/freelance-motion-skills | MIT |
| | sw-sitcom-comedy، sw-scene-craft (كوميديا وبناء المشهد؛ النص صيني والرد بلغة المستخدم) | jtydhr88/screenwriting-skills | MIT |
| | scripting-and-storyboarding (سكربت عمودين، قائمة لقطات، حساب المدة) | social-media-skills/skills | MIT (فيه إعلانات لمنتجهم) |
| **التصميم** | color-expert (ألوان عميقة) | meodai/skill.color-expert | CC BY 4.0 + حقوق المراجع لأصحابها |
| | better-typography، better-layout | jakubkrehel/skills | MIT |
| | algorithmic-art (p5.js) | anthropics/skills | Apache-2.0 |
| | create-svg-illustrations، design-slide-colors (فيها سكربت تباين) | narumiruna/skills | MIT |
| | illustration-flat، -one-line، -ink-sketch، -vintage-emblem (أساليب SVG) | mengto/skills | MIT |
| | better-icons (المهارة فقط؛ الأداة `npx -y better-icons@1.0.4`؛ لا تشغّل `setup`) | better-auth/better-icons | MIT، الأيقونات حسب مجموعتها |
| | threejs-* (12 مهارة: أساسيات، حركة، إضاءة، مواد، هندسة، shaders، معالجة صورة، أداء، تحميل، أصول glTF، تفاعل، R3F) | cloudai-x/threejs-skills (~24 ألف تثبيت) | MIT |
| | motion-design (مبادئ الحركة والتوقيت) | lottiefiles/motion-design-skill (الرسمية) | MIT |
| | kinetic-typography، animated-infographic | iart-ai | MIT |
| | antv-infographic (يحمّل مكتبة AntV: ثبّت الإصدار بدل @latest) | antvis/chart-visualization-skills | MIT |
| | thumbnail-design، infographic-and-data-viz | social-media-skills/skills | MIT |
| | pixel-art، pixel-art-sprites (بكسل آرت وسبرايتس) | omer-metin/skills-for-antigravity | Apache-2.0 |
| **المونتاج** | ffmpeg-skill (42 أداة بايثون، بلا npm/MCP) | kajisho5/ffmpeg-skill | MIT |
| | auto-editor + -export/-transcribe/-effects/-transitions | WyattBlue/auto-editor | Unlicense |
| | ffmpeg-stabilize، ffmpeg-lut-grade، media-scenedetect، otio-convert، media-subtitle-sync (مختارة؛ الحزمة كاملة فيها hooks) | damionrashford/media-os | MIT |
| | أدوات عند الطلب `on-demand.sh edittools`: auto-editor 31.8.0 (ثنائي بتحقق sha256)، pysubs2، ffmpeg-normalize، scenedetect، OpenTimelineIO+محوّلات FCPXML/EDL، كاشف وجوه YuNet | PyPI / GitHub / HF | MIT/BSD/Apache/Unlicense |
| **الصوت** | sound-design-foley، audio-mixing-mastering، music-supervision-scoring (منهجية) | calesthio | MIT |
| | sound-effects (103 مؤثر CC0 + sound_pass.py للمزج والـducking و−16 LUFS) + سياسة محلية: alvana أولاً، Mixkit داخل المشروع فقط | barty-bart/motion-graphics | MIT |
| | مكتبة alvana-audio (1213 مؤثر مسجّل و157 مقطوعة، CC0 غالباً، 5 مقطوعات CC BY) عبر `tools/sfx_fetch.py` ملفاً ملفاً | seyedpouramir/alvana-audio (commit 2f72421) | CC0 / CC BY 4.0 |

**مصادر صوت إضافية (يدوياً عند الحاجة):** حزم OpenGameArt CC0 (روابط مباشرة تعمل)، HoliznaCC0 (موسيقى CC0)، Incompetech (CC BY: حقوق إلزامية)، Meta Oculus Audio Pack (CC BY). **محجوبة/مقيّدة:** Freesound (403 من الحاوية)، Pixabay وZapsplat (403)، Mixkit (لا إعادة نشر)، BBC (شخصي/تعليمي فقط)، Sonniss (لا إعادة نشر، والنسخ المنشورة غير رسمية)، وأرشيف الإنترنت (رخص غير موثوقة).
**نماذج توليد الصوت:** MusicGen/AudioGen/AudioLDM غير تجارية؛ Stable Audio Open Small مقيدة ويتطلب مساحة غير متاحة؛ ACE-Step (MIT) ~10GB لا يتسع حالياً.
| **مشاهدة الفيديو** | watch (`/watch`): لقطات من أي فيديو (رابط أو ملف) + النص من الترجمة المرفقة. مضبوط على المحرك المحلي؛ التفريغ عند الحاجة بـ faster-whisper. Gemini/Groq/OpenAI لا تُفعّل بلا موافقة. مع yt-dlp | bradautomates/claude-video (commit 03ceb42، ~20 ألف نجمة) | MIT |

**فحص الفجوات (جولة ثانية):** بحثت عن three.js، بكسل آرت، الصور المصغّرة، النص المتحرك، Lottie، الإنفوجرافيك، Voxel، فن الألعاب، إعادة التأطير العمودي، وأضفت ما سبق. لم أضف: مهارات Voxel/فن الألعاب (تثبيتات قليلة جداً أو تعتمد Blender/منصات)، layer-pixel-art (منصة Layer)، صور مصغّرة عبر Higgsfield/muapi (خدمات مدفوعة)، baoyu-infographic (صور نقطية تحتاج مولّد صور)، k2f (تحذيرات أمان ولم يُختبر بالعربي)، web-typography (تكرار)، fcp-xml (للبريمير فقط)، ffsubsync (لا يُبنى هنا).
**مرفوضة:** cinetic (19MB، تحذير Socket)، take-one (روابط تسويق)، motion-director من baoyu (يعتمد مادة بلا رخصة)، web-design-guidelines من Vercel (يجلب قواعده من الشبكة كل تشغيل)، logo-generator/guizang (بلا رخصة)، claude-shorts (torch وmediapipe)، cut-as-code (160MB وخدمة دائمة)، earshot (يعتمد Freesound وtorch)، حزمة media-os كاملة (hooks على كل أمر).
