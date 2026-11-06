#!/bin/bash
# install-teacher-toolkit.sh — يركّب مهارات وأدوات للمعلم (تصميم، مواقع، ألعاب، خطط، تقويم، شمول).
#   الاستخدام:  bash install-teacher-toolkit.sh
#   كل مصدر يُنزَّل من مستودعه الرسمي ويُثبَّت على نسخة (commit) راجعتها بنفسي، ولا يُنسخ كوده داخل هذا المستودع
#   (احتراماً لرخص أصحابها). لا يحذف شيئاً. الخطوة التي تفشل تُطبع ويكمل الباقي.
set -uo pipefail
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
LIB="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/teacher-library"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
mkdir -p "$SKILLS" "$LIB"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }

fetch(){  # fetch <owner/repo> <sha> <dir>
  git clone -q --filter=blob:none "https://github.com/$1" "$3" 2>/dev/null && git -C "$3" checkout -q "$2" 2>/dev/null
}
put(){ [ -f "$1/SKILL.md" ] && cp -R "$1" "$SKILLS/$(basename "$1")"; }

# 1) مهارات Anthropic الرسمية: مستندات وعروض وتصميم ومواقع (لكل مهارة رخصتها داخل مجلدها)
if fetch anthropics/skills ca45fc496a3436251f191354091d557da31c15b5 "$WORK/anthropic"; then
  n=0; for s in docx pdf pptx xlsx frontend-design canvas-design web-artifacts-builder webapp-testing doc-coauthoring theme-factory brand-guidelines skill-creator; do put "$WORK/anthropic/skills/$s" && n=$((n+1)); done
  ok "Anthropic skills: $n"
else bad "anthropics/skills"; fi

# 2) مكتبة مهارات التربية (165 مهارة، CC BY-SA 4.0 — المؤلف Gareth Manning): المكتبة كاملة + 7 مجالات مفعّلة
if fetch GarethManning/education-agent-skills 135d6275e7db0657d70b147f46d3191c5430677d "$WORK/edu"; then
  cp -R "$WORK/edu/skills/." "$LIB/"
  n=0; for c in curriculum-assessment curriculum-alignment explicit-instruction inclusive-design questioning-discussion memory-learning-science eal-language-development; do
    for s in "$WORK/edu/skills/$c"/*/; do put "${s%/}" && n=$((n+1)); done; done
  ok "مهارات التربية المفعّلة: $n (والمكتبة كاملة في $LIB لتنسخ منها ما تحتاج)"
else bad "education-agent-skills"; fi

# 3) شرائح HTML جميلة وتحويل PowerPoint (MIT)
if fetch zarazhangrui/frontend-slides 9906a34d640d2111f724544cbc50f7f130569ae1 "$WORK/slides"; then
  put "$WORK/slides/plugins/frontend-slides/skills/frontend-slides" && ok "frontend-slides"
else bad "frontend-slides"; fi

# 4) ألعاب الويب (Phaser وPixi وThree.js) من مكتبة مهارات الألعاب (Apache-2.0)
if fetch gamedev-skills/awesome-gamedev-agent-skills 19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9 "$WORK/gd"; then
  n=0; for s in phaser-core phaser-arcade-physics pixijs-rendering threejs-scene-setup; do put "$WORK/gd/skills/web-engines/$s" && n=$((n+1)); done; ok "مهارات ألعاب الويب: $n"
else bad "gamedev skills"; fi

# 5) Lesson in Game: درسك يتحول إلى لعبة جماعية تُلعب على جوالات الطلاب عبر شبكة الصف (MIT، محلي بالكامل)
LG="${LESSON_IN_GAME_DIR:-$HOME/tools/lesson-in-game}"
if [ -d "$LG/.git" ] || fetch OleksiiDotsenko/lesson-in-game 01986910c771974b9494e11180ddc254fe8b5660 "$LG"; then
  n=0; for s in "$LG"/lesson-in-game/skills/*/; do put "${s%/}" && n=$((n+1)); done
  if command -v npm >/dev/null 2>&1 && (cd "$LG/lesson-in-game/engine" && npm install --silent --no-audit --no-fund >/dev/null 2>&1); then
    ok "Lesson in Game: $n مهارات + المحرك في $LG (اقرأ README قبل التشغيل)"
  else bad "Lesson in Game: تركيب npm فشل (المهارات نُسخت: $n)"; fi
else bad "lesson-in-game"; fi

# 6) المونتاج (بدائل مفتوحة المصدر، MIT): قص وإزالة السكتات وكابشن بـ ffmpeg وWhisper
if fetch 6missedcalls/video-editing-skill 7dc6e1da66f43eff44c3692d4b84e06aef6590b6 "$WORK/vedit"; then
  rm -rf "$WORK/vedit/.git"; mkdir -p "$SKILLS/video-editing-skill" && cp -R "$WORK/vedit/." "$SKILLS/video-editing-skill/" && ok "video-editing-skill (يحتاج ffmpeg وWhisper)"
else bad "video-editing-skill"; fi

# 7) فيديوهات شرح وسبورة بيضاء وأنيميشن للمعلمين (MIT)
if fetch iart-ai/explainer-video-skills 3e2d411b725d9a72939cf8e5eb81579e751373e7 "$WORK/expl"; then
  n=0; for s in "$WORK"/expl/skills/*/; do put "${s%/}" && n=$((n+1)); done; ok "فيديوهات الشرح والأنيميشن: $n"
else bad "explainer-video-skills"; fi

echo; [ "$FAIL" = 0 ] && echo "انتهى بدون أخطاء. ابدأ محادثة جديدة لتظهر المهارات." || echo "انتهى مع تنبيهات ✗ فوق."
exit $FAIL
