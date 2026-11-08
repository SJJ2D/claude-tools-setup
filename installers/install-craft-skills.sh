#!/bin/bash
# install-craft-skills.sh — مهارات الحِرفة (نوفمبر 2026) مرتبة حسب المجال: الإخراج، التصميم، المونتاج، الصوت.
#   كل مهارة: مجلد واحد من مستودعها على commit مثبّت، بعد قراءة SKILL.md والسكربتات وتدقيقات skills.sh.
#   لا يُستبدل ما هو مركّب. التفاصيل والأسباب في docs/CATALOG.md (قسم «مهارات الحرفة»).
set -uo pipefail
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"; WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT; mkdir -p "$SKILLS"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }
sparse(){ # $1=owner/repo $2=commit $3=dir $4..=أنماط sparse (يجلب الملفات المطلوبة فقط؛ بعض المستودعات مئات الميغابايت)
  local repo=$1 sha=$2 dir=$3; shift 3
  git clone -q --filter=blob:none --no-checkout "https://github.com/$repo" "$dir" 2>/dev/null && git -C "$dir" sparse-checkout set --no-cone "$@" 2>/dev/null && git -C "$dir" checkout -q "$sha" 2>/dev/null; }
take(){ # $1=owner/repo $2=commit $3..=مجلدات المهارات (تُنسخ باسم المجلد)
  local repo=$1 sha=$2; shift 2; local dir="$WORK/$(echo "$repo" | tr / _)" pats=() p n
  for p in "$@"; do pats+=("/$p/"); done
  sparse "$repo" "$sha" "$dir" "${pats[@]}" || { bad "$repo"; return; }
  for p in "$@"; do n=$(basename "$p")
    if [ -e "$SKILLS/$n" ]; then ok "$n (موجودة)"; elif [ -f "$dir/$p/SKILL.md" ] && cp -R "$dir/$p" "$SKILLS/$n"; then ok "$n"; else bad "$n"; fi
  done; }
takeas(){ # $1=owner/repo $2=commit $3=اسم المهارة $4=المسار داخل المستودع ("." للجذر) $5..=عناصر تُنسخ فقط
  local repo=$1 sha=$2 name=$3 base=$4; shift 4; local dir="$WORK/$name" pats=() x
  [ -e "$SKILLS/$name" ] && { ok "$name (موجودة)"; return; }
  for x in "$@"; do if [ "$base" = . ]; then pats+=("/$x"); else pats+=("/$base/$x"); fi; done
  sparse "$repo" "$sha" "$dir" "${pats[@]}" || { bad "$name"; return; }
  mkdir -p "$SKILLS/$name" && for x in "$@"; do [ -e "$dir/$base/$x" ] && cp -R "$dir/$base/$x" "$SKILLS/$name/"; done
  [ -f "$SKILLS/$name/SKILL.md" ] && ok "$name" || { rm -rf "$SKILLS/$name"; bad "$name"; }; }

# ───────── 1) الإخراج وما قبل الإنتاج ─────────
CAL=skills/production
take calesthio/generative-media-skills 8c85352d5d75d4dcbe58480bd138e37b9742bab1 \
  $CAL/creative-direction/storyboard-previsualization $CAL/content-formats/cinematic-trailer-production \
  $CAL/creative-direction/cinematic-shot-direction $CAL/content-formats/educational-animation-production \
  $CAL/post-production/color-grading-finishing $CAL/post-production/editing-montage \
  $CAL/creative-direction/performance-direction $CAL/creative-direction/character-design-continuity \
  $CAL/audio-craft/sound-design-foley $CAL/audio-craft/audio-mixing-mastering $CAL/audio-craft/music-supervision-scoring \
  $CAL/runtime-assembly/threejs-scene-composition $CAL/runtime-assembly/gsap-animation-composition $CAL/runtime-assembly/manim-explainer-animation \
  $CAL/runtime-assembly/procedural-canvas-animation $CAL/runtime-assembly/lottie-animation-delivery $CAL/runtime-assembly/audio-reactive-video-composition \
  $CAL/creative-direction/2d-character-rig-animation   # الصوت: منهجية فقط. runtime-assembly: رندر حتمي إطاراً بإطار (قسم الحركة)
take iart-ai/motion-design-skills 3c129f769d90a1328c209c386492333c9ac62312 skills/motion-art-direction skills/shot-composition skills/beat-sync-editing \
  skills/logo-animation skills/after-effects skills/color-motion   # beat-sync للمونتاج؛ الثلاث الأخيرة للحركة (فيها روابط تسويقية لـiart.ai: تجاهلها)
take iart-ai/freelance-motion-skills d85c2b484693d0387333c778d9c95230fa1856ce skills/creative-brief
take jtydhr88/screenwriting-skills 51115f18d160aa8b2ac5813e4432b6f0b425358f plugins/screenwriting/skills/sw-sitcom-comedy plugins/screenwriting/skills/sw-scene-craft
take social-media-skills/skills f28cef2b7067ec64e79c9d85421c022c06659e03 skills/scripting-and-storyboarding skills/thumbnail-design skills/infographic-and-data-viz \
  skills/canva skills/design-and-templates   # الأخيرتان: صور مصغّرة وإنفوجرافيك (تصميم)

# ───────── 2) التصميم ─────────
# color-expert: CC BY 4.0 (النص الأصلي)، وملفات references لأصحابها (THIRD_PARTY_NOTICES). معرفة ألوان عميقة (OKLCH، تباين APCA/WCAG، طباعة/شاشة).
takeas meodai/skill.color-expert 5bf7c7704d56bccc6aeea38c36bcf449abe56a6c color-expert . SKILL.md LICENSE THIRD_PARTY_NOTICES.md references
take jakubkrehel/skills f41f027797f77cb1594a5c718aeee3e6a7fe99ba skills/better-typography skills/better-layout          # MIT: طباعة وتخطيط (اختبار عكس RTL)
take anthropics/skills 2c5958ecac7cee2b583967a2c4981d0f4a75c579 skills/algorithmic-art                                  # Apache-2.0: فن توليدي p5.js لخلفيات البوسترات والألعاب
take narumiruna/skills 5b10d1cf0d834337534549c3d14c738ffd68458f skills/optional/create-svg-illustrations skills/optional/design-slide-colors   # MIT
take mengto/skills 5ea1661a0e05d82b054553daaa6baf6d0233c33c agent-skills/illustration/illustration-flat agent-skills/illustration/illustration-one-line agent-skills/illustration/illustration-ink-sketch agent-skills/illustration/illustration-vintage-emblem   # MIT: أساليب رسم SVG
# better-icons (MIT): المهارة فقط. الأداة تُشغَّل عند الحاجة: npx -y better-icons@1.0.4 ... (لا تشغّل "better-icons setup": يكتب في إعدادات Claude). الشبكة: api.iconify.design فقط.
takeas better-auth/better-icons 033316ecb8f4982235af4111a2257e80231f5ab1 better-icons skills SKILL.md

# Three.js (MIT، cloudai-x، ~24 ألف تثبيت): أساسيات وإضاءة ومواد وظلال ومعالجة صورة وأداء — لمشاهدنا ثلاثية الأبعاد
CX=skills/threejs; take cloudai-x/threejs-skills 0e181866f095b5f06d005133876e926515390d95 $CX-fundamentals $CX-animation $CX-lighting $CX-materials $CX-geometry $CX-shaders $CX-postprocessing $CX-performance $CX-loaders $CX-asset-pipeline $CX-interaction $CX-react-three-fiber
take lottiefiles/motion-design-skill f9a8a041b85185ee4881b3471d3415e939aac772 skills/motion-design                           # MIT، LottieFiles الرسمية: مبادئ حركة وتوجيه
take iart-ai/kinetic-typography-skills fccc94bd325d824235ee9e715e65abde57b6513a skills/kinetic-typography                     # MIT: نصوص متحركة (للعربي: لا تقسيم حرفي)
take iart-ai/data-animation-skills 8ce2709c3992490251e8a991535b1945f01c6865 skills/animated-infographic                       # MIT: إنفوجرافيك متحرك
take antvis/chart-visualization-skills a105fa12a9fa41fccccc2eba7f4b34973628f5d3 skills/antv-infographic                      # MIT، AntV: إنفوجرافيك (ثبّت إصدار المكتبة بدل @latest)
take omer-metin/skills-for-antigravity e8dcf4e8737921a10088bd5c9eb65e81f74c051f skills/pixel-art skills/pixel-art-sprites      # Apache-2.0: بكسل آرت وسبرايتس (لشخصياتنا البكسلية)

# ───────── 2ب) الحركة والشيدر والـ3D (الجولة الثالثة، نوفمبر 2026) ─────────
take greensock/gsap-skills aed9cfd3277740755f6bfc1155c7aa645403b760 skills/gsap-core skills/gsap-timeline skills/gsap-plugins skills/gsap-utils skills/gsap-performance   # MIT، GSAP الرسمية (CustomEase، MorphSVG، SplitText...)
take gl-transitions/gl-transitions 531feb85ade7d7402d8636f6331adcd1663a4616 skills/gl-transitions   # MIT: ~125 انتقال GLSL؛ استخدم الحزمة المحلية (أدناه) لا روابط @2
take minimax-ai/skills 60aaae52bb2af8162732751a4332f62a5fef518b skills/shader-dev                  # MIT: 36 تقنية GLSL (raymarching، ضوضاء، سوائل، جزيئات)
take iart-ai/webgl-animation-skills 50697d659fbf70152f48f9f8aadf1efe78bbdde1 skills/particle-system skills/shader-glsl   # MIT: جزيئات حتمية ببذرة + seek
take diffusionstudio/lottie 3c72912fad543897f90045ed4d355813837927fc skills/text-to-lottie          # MIT: كتابة Lottie JSON (لا تشغّل npx degit غير المثبّت؛ انظر الملاحظة المحلية)
take adithya-s-k/manim_skill cef045011722d285692e3381d12d4d637da56e18 skills/manimce-best-practices # MIT: Manim CE (الأداة: on-demand.sh manim)
take dgreenheck/webgpu-claude-skill af2319bd01bb7cc881267a9ef42cafdaf5e9029d skills/webgpu-threejs-tsl # MIT (README): TSL وجزيئات compute؛ في الرندر بلا GPU يرجع لـWebGL2
# ملاحظات محلية تُلحق بالمهارات (مرة واحدة)
note(){ local f="$SKILLS/$1/SKILL.md"; [ -f "$f" ] && ! grep -q 'سياسة محلية' "$f" && printf '\n\n## سياسة محلية (claude-tools-setup)\n%s\n' "$2" >> "$f"; }
note gl-transitions "الحزمة مثبّتة محلياً: ~/tools/js/node_modules/gl-transitions (الإصدار 3.0.0). حمّل GLSL منها بدل روابط jsDelivr @2 (الإصدار 3 حذف 12 اسماً). عيّن كل uniform لقيمته الافتراضية، وافحص الإطار عند progress 0 و0.5 و1."
note text-to-lottie "لا تشغّل npx degit (غير مثبّت الإصدار). للمعاينة: HyperFrames يشغّل Lottie، أو lottie-web من ~/tools/js. لا ترفع ملفات المستخدم لأي خدمة."
[ -d "$HOME/tools/js/node_modules/gl-transitions" ] || npm i -s --no-audit --no-fund --prefix "$HOME/tools/js" gl-transitions@3.0.0 >/dev/null 2>&1 && ok "gl-transitions@3.0.0 (حزمة GLSL)" || bad "gl-transitions npm"

# ───────── 2ج) تصميم وبرمجة (الجولة الثالثة) ─────────
# logo-design (MIT): شعارات وهوية من الموجز إلى SVG ثم تدقيق وتصدير favicon/أيقونات. بلا مكتبة SVG لعلامات تجارية لغيرنا (14MB).
if [ -e "$SKILLS/logo-design" ]; then ok "logo-design (موجودة)"
elif sparse kaankiziltug/logo-design-skill bbf31e521d765eb6d53242549bbee7c2e5bbd6bc "$WORK/logo" '/skills/logo-design/' '!/skills/logo-design/assets/library/svg/' '!/skills/logo-design/assets/library/gallery.html' \
  && cp -R "$WORK/logo/skills/logo-design" "$SKILLS/"; then ok logo-design; else bad logo-design; fi
note logo-design "render_png.py يعلق هنا (Chrome بلا --no-sandbox). للـPNG: pip install cairosvg ثم cairosvg in.svg -o out.png -W 1024، أو Playwright. لا تستخدم شعارات علامات تجارية لغيرنا."
take vercel-labs/agent-skills 1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62 skills/react-best-practices          # MIT، Vercel: أداء React/Next.js
take gamedev-skills/awesome-gamedev-agent-skills 19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9 skills/other-engines/pygame-core skills/disciplines/create-game-assets   # Apache-2.0: ألعاب بايثون وأصول الألعاب
take alinaqi/maggy 55aabe2493627e1de9cd09459d555181d66f3111 skills/pwa-development                       # MIT: تطبيقات صف تعمل بلا إنترنت (PWA)
take openai/skills 49f948faa9258a0c61caceaf225e179651397431 skills/.curated/jupyter-notebook              # Apache-2.0: دفاتر Jupyter (تحليل بحث إجرائي)
# عند الحاجة (installers/on-demand.sh): typst (بوسترات وشهادات PDF عربية)، denoise (DeepFilterNet). SVG: npx -y svgo@4.1.0 in.svg -o out.svg

# ───────── 3) المونتاج ─────────
# ffmpeg-skill (MIT): 42 أداة بايثون فوق ffmpeg (قص الصمت، تثبيت، LUT، جهارة، كشف مشاهد، كابشن بخط حسب اللغة). بلا المثبّت npm ولا خادم MCP.
takeas kajisho5/ffmpeg-skill ebc0f404ad7f9c41599528141ad3b30777fe432d ffmpeg-skill . SKILL.md LICENSE scripts references
# auto-editor (Unlicense): مهارات القص التلقائي والتصدير لـ Premiere/Resolve/Kdenlive. الأداة نفسها (ثنائي 48MB) عند الطلب: installers/on-demand.sh edittools
take WyattBlue/auto-editor a602b0e5e2e3120e00e279ee69207d5738e2ed03 skills/auto-editor skills/auto-editor-export skills/auto-editor-transcribe skills/auto-editor-effects skills/auto-editor-transitions
# media-os (MIT): خمس مهارات مختارة فقط. لا تركّب الحزمة كاملة (فيها hooks تعمل مع كل أمر).
take damionrashford/media-os 5014c1e8b23fd3e18d49926d9aa147d15a3aa08e skills/ffmpeg-stabilize skills/ffmpeg-lut-grade skills/media-scenedetect skills/otio-convert skills/media-subtitle-sync
# beat-sync-editing (القص على الإيقاع) يُجلب مع مهارات iart في قسم الإخراج أعلاه.
# ───────── 4) الصوت ─────────
# sound-effects (MIT، barty-bart): 103 مؤثر CC0 مضمّنة + sound_pass.py (قائمة الإشارات، الشبكة الإيقاعية، الـducking، −16 LUFS، CREDITS).
#   Mixkit يُنزَّل عند الحاجة داخل المشروع فقط (رخصته تمنع إعادة النشر)؛ الأولوية عندنا لمكتبة alvana-audio CC0 عبر tools/sfx_fetch.py.
if take barty-bart/motion-graphics 3d83d987d658601d8a1269eb691622bdcd427335 skills/sound-effects && [ -f "$SKILLS/sound-effects/SKILL.md" ] && ! grep -q "سياسة محلية" "$SKILLS/sound-effects/SKILL.md"; then
  printf '\n## سياسة محلية (claude-tools-setup)\nابحث أولاً في مكتبة alvana-audio المسجّلة (1213 مؤثر و157 مقطوعة، CC0 غالباً): `python3 <المستودع>/tools/sfx_fetch.py search <كلمات>` ثم `get`. استخدم Mixkit فقط إن لم يوجد بديل، وفي مجلد المشروع، ولا تحفظه في المستودع. أي رخصة CC-BY تحتاج سطر حقوق (`sfx_fetch.py credits`).\n' >> "$SKILLS/sound-effects/SKILL.md"
fi
# ───────── 5) مشاهدة الفيديو (روابط السوشال أو ملفات محلية) ─────────
# watch (MIT، bradautomates/claude-video ~20 ألف نجمة): لقطات + نص من الترجمة المرفقة. المحرك المحلي فقط افتراضياً.
#   Gemini/Groq/OpenAI اختيارية وترسل الفيديو/الصوت لجهات خارجية: لا تُفعّل بلا موافقة، ولا لبيانات طلاب. لم نأخذ hooks الإضافة.
if take bradautomates/claude-video 03ceb42f7fa2c4439aca01752118044baabffb8f skills/watch && [ -f "$SKILLS/watch/SKILL.md" ] && ! grep -q "سياسة محلية" "$SKILLS/watch/SKILL.md"; then
  printf '\n## سياسة محلية (claude-tools-setup)\nفي الحاوية السحابية: `setup.py --engine local --backend none --detail balanced` (لا WhisperX: يحتاج 3GB). إن لم توجد ترجمة مرفقة فرّغ الصوت بـ faster-whisper المركّب (`vad_filter=False`). يوتيوب كثيراً ما يحجب السيرفرات: اطلب من المستخدم رفع الملف أو ملف cookies من متصفحه. لا تستخدم محرك Gemini إلا بموافقة صريحة (يرسل الفيديو لجوجل).\n' >> "$SKILLS/watch/SKILL.md"
fi
command -v yt-dlp >/dev/null 2>&1 || python3 -m pip install -q --cert "${HOME}/tools/ca-all.pem" yt-dlp >/dev/null 2>&1 || python3 -m pip install -q yt-dlp >/dev/null 2>&1
command -v yt-dlp >/dev/null 2>&1 && ok "yt-dlp" || bad "yt-dlp"
exit $FAIL
