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
