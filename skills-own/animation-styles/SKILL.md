---
name: animation-styles
description: Choose and build a short (≈6 s, vertical 1080×1920) code-drawn animation in one of 19 named styles (pixel art, chalkboard, neon sketch, PS2, comic, flat vector, minimal B/W, CGI, LEGO, 3D explainer, ink doodle, neon shadow, blueprint, space, corporate cartoon, glowing world, glass map, diary doodle, relief map), as one HTML file driven by window.seek(t) and rendered to mp4. Use when the user asks for an animation, short, reel or visual in a style, or says "سو لي أنيميشن", "ستايل", or doesn't know which style fits an idea; also routes bigger video jobs to the right installed skill.
---
# animation-styles

## الخطوات
1. اقرأ `references/styles.md` واختر الستايل حسب الفكرة (أو اعرض خيارين أو ثلاثة على المستخدم إذا لم يحدد). افتراضياً: شرح/تعليم → سبورة أو فلات فيكتور أو مخطط أزرق؛ مال/أرقام → كرتون شركات؛ قصة يومية → رسم حبر أو دودل؛ علوم → فضاء سينمائي؛ تاريخ/جغرافيا → خريطة تضاريس؛ منتج/تقنية → سكتش مضيء أو CGI؛ حنين → بكسل آرت أو PS2.
2. ابنِ البرومت بالقالب في `references/implementation-block.md`: سطر الستايل + قصة بجدول زمني + كتلة الستايل + كتلة التنفيذ. الأنماط ثلاثية الأبعاد تحتاج Three.js فقط.
3. اكتب ملف HTML واحداً يعرّف `window.seek(t)` ولا يعتمد على Math.random أو timers.
4. صدّره: `node scripts/capture.js page.html out.mp4 30 6` (Playwright + ffmpeg). افحص إطاراً أو اثنين بالعين قبل التسليم، خصوصاً اتصال حروف العربية.
5. للتعليق الصوتي أو الموسيقى: ادمج بـffmpeg؛ الصوت المستنسخ للمستخدم عبر مهارات ElevenLabs/B Studio.

## توجيه الطلبات الأكبر إلى المهارات المركّبة
| الطلب | استخدم |
|---|---|
| مقطع قصير جاهز بستايل من القائمة | هذه المهارة |
| فيديو HTML طويل متعدد المشاهد، عناوين وكابشن وانتقالات | `hyperframes` (+ `hyperframes-registry` للقوالب، `media-use` للصوت والصور) |
| فيديو إطلاق/تعريف بمنتج بحركة عالية | `onetake` (غير تجاري) |
| فيلم قصير بستايل فني مسمّى (زيتي، ألوان مائية، أوكيو-إي) | `lemo-opuscar` |
| تحويل فيديو موجود إلى مشروع قابل للتعديل | `reverse-any-video` |
| رسم مخطط متحرك (SVG/D3/Framer) أو isometric | `diagram-animation` / `isometric-animation` |
| مونتاج مقطعه هو وتعديل ملاحظات | `video-edit` و`edit-studio` (B Studio) |
| شرح للأطفال بصوته | `explainer-video` + ElevenLabs |
| مجسم Three.js من صورة | `img2threejs` |

اللغة: العربية بخط Tajawal أو Baloo Bhaijaan 2 أو Cairo، وRTL، والأرقام الشرقية/الغربية حسب سياق المستخدم (انظر `designing-arabic-frontends`).
