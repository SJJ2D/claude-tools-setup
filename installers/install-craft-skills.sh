#!/bin/bash
# install-craft-skills.sh — مهارات الحِرفة (نوفمبر 2026) مرتبة حسب المجال: الإخراج، التصميم، المونتاج، الصوت.
#   كل مهارة: مجلد واحد من مستودعها على commit مثبّت، بعد قراءة SKILL.md والسكربتات وتدقيقات skills.sh.
#   لا يُستبدل ما هو مركّب. التفاصيل والأسباب في docs/CATALOG.md (قسم «مهارات الحرفة»).
set -uo pipefail
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"; WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT; mkdir -p "$SKILLS"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }
declare -A GOT
take(){ # $1=owner/repo $2=commit $3..=مسارات مجلدات المهارات داخل المستودع
  local repo=$1 sha=$2; shift 2; local dir="$WORK/$(echo "$repo" | tr / _)"
  [ -n "${GOT[$repo]:-}" ] || { git clone -q --filter=blob:none "https://github.com/$repo" "$dir" 2>/dev/null && git -C "$dir" checkout -q "$sha" 2>/dev/null && GOT[$repo]=1; } || { bad "$repo"; return; }
  for p in "$@"; do local n; n=$(basename "$p")
    if [ -e "$SKILLS/$n" ]; then ok "$n (موجودة)"; elif [ -f "$dir/$p/SKILL.md" ] && cp -R "$dir/$p" "$SKILLS/$n"; then ok "$n"; else bad "$n"; fi
  done
}

# ───────── 1) الإخراج وما قبل الإنتاج ─────────
CAL=skills/production
take calesthio/generative-media-skills 8c85352d5d75d4dcbe58480bd138e37b9742bab1 \
  $CAL/creative-direction/storyboard-previsualization $CAL/content-formats/cinematic-trailer-production \
  $CAL/creative-direction/cinematic-shot-direction $CAL/content-formats/educational-animation-production \
  $CAL/post-production/color-grading-finishing $CAL/post-production/editing-montage \
  $CAL/creative-direction/performance-direction $CAL/creative-direction/character-design-continuity
take iart-ai/motion-design-skills 3c129f769d90a1328c209c386492333c9ac62312 skills/motion-art-direction skills/shot-composition
take iart-ai/freelance-motion-skills d85c2b484693d0387333c778d9c95230fa1856ce skills/creative-brief
take jtydhr88/screenwriting-skills 51115f18d160aa8b2ac5813e4432b6f0b425358f plugins/screenwriting/skills/sw-sitcom-comedy plugins/screenwriting/skills/sw-scene-craft
take social-media-skills/skills f28cef2b7067ec64e79c9d85421c022c06659e03 skills/scripting-and-storyboarding

# ───────── 2) التصميم ─────────
# ───────── 3) المونتاج ─────────
# ───────── 4) الصوت ─────────
exit $FAIL
