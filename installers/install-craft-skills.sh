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
  $CAL/audio-craft/sound-design-foley $CAL/audio-craft/audio-mixing-mastering $CAL/audio-craft/music-supervision-scoring   # الأخيرة الثلاث تخص الصوت (منهجية فقط)
take iart-ai/motion-design-skills 3c129f769d90a1328c209c386492333c9ac62312 skills/motion-art-direction skills/shot-composition skills/beat-sync-editing   # beat-sync-editing يخص المونتاج
take iart-ai/freelance-motion-skills d85c2b484693d0387333c778d9c95230fa1856ce skills/creative-brief
take jtydhr88/screenwriting-skills 51115f18d160aa8b2ac5813e4432b6f0b425358f plugins/screenwriting/skills/sw-sitcom-comedy plugins/screenwriting/skills/sw-scene-craft
take social-media-skills/skills f28cef2b7067ec64e79c9d85421c022c06659e03 skills/scripting-and-storyboarding

# ───────── 2) التصميم ─────────
# color-expert: CC BY 4.0 (النص الأصلي)، وملفات references لأصحابها (THIRD_PARTY_NOTICES). معرفة ألوان عميقة (OKLCH، تباين APCA/WCAG، طباعة/شاشة).
takeas meodai/skill.color-expert 5bf7c7704d56bccc6aeea38c36bcf449abe56a6c color-expert . SKILL.md LICENSE THIRD_PARTY_NOTICES.md references
take jakubkrehel/skills f41f027797f77cb1594a5c718aeee3e6a7fe99ba skills/better-typography skills/better-layout          # MIT: طباعة وتخطيط (اختبار عكس RTL)
take anthropics/skills 2c5958ecac7cee2b583967a2c4981d0f4a75c579 skills/algorithmic-art                                  # Apache-2.0: فن توليدي p5.js لخلفيات البوسترات والألعاب
take narumiruna/skills 5b10d1cf0d834337534549c3d14c738ffd68458f skills/optional/create-svg-illustrations skills/optional/design-slide-colors   # MIT
take mengto/skills 5ea1661a0e05d82b054553daaa6baf6d0233c33c agent-skills/illustration/illustration-flat agent-skills/illustration/illustration-one-line agent-skills/illustration/illustration-ink-sketch agent-skills/illustration/illustration-vintage-emblem   # MIT: أساليب رسم SVG
# better-icons (MIT): المهارة فقط. الأداة تُشغَّل عند الحاجة: npx -y better-icons@1.0.4 ... (لا تشغّل "better-icons setup": يكتب في إعدادات Claude). الشبكة: api.iconify.design فقط.
takeas better-auth/better-icons 033316ecb8f4982235af4111a2257e80231f5ab1 better-icons skills SKILL.md

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
exit $FAIL
