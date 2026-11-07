#!/bin/bash
# install-video-skills.sh — مهارات مونتاج وفيديو برمجي (من صفحة claude-video-editor.nadr.ai) بعد فحصها.
#   الاستخدام:  bash install-video-skills.sh            (يركّب HyperFrames وLemo Opuscar وOneTake وClawd)
#               INSTALL_COLLAGE=1 bash install-video-skills.sh   (يضيف Collage B-roll أيضاً)
#   كل مصدر يُنزَّل من مستودعه الرسمي على نسخة (commit) مثبّتة ومفحوصة. لا يُنسخ كود أحد داخل مستودعك.
#   ملاحظات الفحص (SkillSpector + مراجعة يدوية) في CATALOG.md.
set -uo pipefail
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
mkdir -p "$SKILLS"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }
fetch(){ git clone -q --filter=blob:none "https://github.com/$1" "$3" 2>/dev/null && git -C "$3" checkout -q "$2" 2>/dev/null; }
put(){ [ -f "$1/SKILL.md" ] && [ ! -e "$SKILLS/$(basename "$1")" ] && cp -R "$1" "$SKILLS/$(basename "$1")"; }

# 1) HyperFrames (HeyGen، Apache-2.0): فيديو من HTML. تنبيه: مهارة media-use فيها تتبّع استخدام (PostHog) يُعطَّل بـ DO_NOT_TRACK=1
if fetch heygen-com/hyperframes 555c788a333c592e9878139db318ea52f1315cec "$WORK/hf"; then
  # تحديث نوفمبر 2026: نستبدل النسخ القديمة، ونضيف مهارات «العقيدة» الداخلية (ربط المشاهد كحركة كاميرا واحدة، الانتقالات، منع الوميض، الكابشن، المؤشر).
  # changelog-video لم يُضف: خاص بمنتجهم وفيه خطوط تجارية.
  n=0; for s in "$WORK"/hf/skills/*/ "$WORK"/hf/.claude/skills/{motion-doctrine,seam-craft,cut-the-curve,captions-overlay,oversized-cursor}/; do
    [ -f "$s/SKILL.md" ] || continue; rm -rf "$SKILLS/$(basename "$s")"; cp -R "${s%/}" "$SKILLS/$(basename "$s")" && n=$((n+1)); done
  # مكتبة القوالب (210 قالب، منها 3D: extruded-logo، glass-shard-title، cuboid-carousel، gallery-tunnel، exploded-stack...) نسخة محلية للقراءة
  mkdir -p "$HOME/tools/hyperframes-registry" && cp -R "$WORK/hf/registry/." "$HOME/tools/hyperframes-registry/" 2>/dev/null
  ok "HyperFrames: $n مهارات + قوالب في ~/tools/hyperframes-registry (شغّل مع DO_NOT_TRACK=1 لتعطيل التتبّع)"
else bad "HyperFrames"; fi

# 2) Lemo Opuscar (MIT): المهارة تحمّل المكتبة؛ نحمّلها نحن مثبّتة في ~/lemo-opuscar
LEMO="${LEMO_DIR:-$HOME/lemo-opuscar}"
if fetch lemomo-ai/lemo-opuscar bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00 "$WORK/lemo"; then
  put "$WORK/lemo/plugin/skills/lemo-opuscar" && ok "lemo-opuscar (مهارة)"
  [ -e "$LEMO" ] || { cp -R "$WORK/lemo" "$LEMO" && ok "مكتبة Lemo في $LEMO (مثبّتة؛ سكربت setup.sh الخاص بالمهارة قد يحدّثها من الإنترنت)"; }
else bad "lemo-opuscar"; fi

# 3) OneTake (رخصة PolyForm Noncommercial: للاستخدام غير التجاري فقط — مناسب للدراسة والتعليم)
if fetch feitangyuan/onetake abb6d17279cdc749e27e99aa534a062d8fd01ced "$WORK/ot"; then
  rm -rf "$WORK/ot/.git"; mkdir -p "$WORK/otp/onetake" && cp -R "$WORK/ot/." "$WORK/otp/onetake/" && put "$WORK/otp/onetake" && ok "onetake (غير تجاري فقط)"
else bad "onetake"; fi

# 4) Clawd Animation Base (MIT): قاعدة Node للرسوم، ليست مهارة؛ تبقى كمجلد في ~/tools مع دليلها ANIMATION_GUIDE.md
CL="${CLAWD_DIR:-$HOME/tools/ClaudeAnimationBase}"
if [ -e "$CL" ]; then ok "ClaudeAnimationBase موجود"
elif fetch JohnHeibel/ClaudeAnimationBase 0ac8bf2b31942376cb6b8c4074715595d512acd2 "$CL"; then ok "ClaudeAnimationBase في $CL (شغّل npm install داخله عند الحاجة)"
else bad "ClaudeAnimationBase"; fi

# 5) Collage B-roll: اختياري. يحتاج أدوات مدفوعة (MaxFusion/Gemini) ويوجّه Claude ألا يسأل المستخدم؛ لذا لا يُركَّب افتراضياً
if [ "${INSTALL_COLLAGE:-0}" = 1 ]; then
  if fetch MegaTroll222/VOX-COLLAGE-BROLL 2e9b8a93a2834e4d670700ab9e4827a8baf3b668 "$WORK/cb"; then
    rm -rf "$WORK/cb/.git"; mkdir -p "$WORK/cbp/collage-broll" && cp -R "$WORK/cb/." "$WORK/cbp/collage-broll/" && put "$WORK/cbp/collage-broll" && ok "collage-broll"
  else bad "collage-broll"; fi
else echo "• Collage B-roll تخطّيته (اختياري: INSTALL_COLLAGE=1)"; fi

echo; [ "$FAIL" = 0 ] && echo "انتهى بدون أخطاء. ابدأ محادثة جديدة لتظهر المهارات." || echo "انتهى مع تنبيهات ✗ فوق."
exit $FAIL
