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
put(){ [ -f "$1/SKILL.md" ] && [ ! -e "$SKILLS/$(basename "$1")" ] && cp -R "$1" "$SKILLS/$(basename "$1")"; }  # لا يستبدل ولا يعشّش نسخة داخل المهارة عند إعادة التشغيل

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
  # مختارة من مجالات أخرى (الجولة الثالثة): التأمل (Schön/Kolb/Brookfield)، البحث الإجرائي، دراسة الدرس والملاحظة، CPA للرياضيات، تعقيد النص، روبرك النقطة الواحدة، ومذاكرته هو
  for s in professional-learning/reflective-practice-prompt-generator environmental-experiential-learning/experiential-learning-cycle-designer \
    professional-learning/teacher-inquiry-cycle-designer professional-learning/lesson-study-cycle-designer professional-learning/lesson-observation-protocol-designer \
    global-cross-cultural-pedagogies/cpa-sequence-designer literacy-critical-thinking/text-complexity-analyser original-frameworks/single-point-rubric-designer \
    student-learning/teach-back-evaluator student-learning/retrieve-first-gate student-learning/confidence-calibration-check; do put "$WORK/edu/skills/$s" && n=$((n+1)); done
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

# 8) البحث الأكاديمي والكتابة العربية (الجولة الثالثة، نوفمبر 2026) — نسخ مجلد المهارة فقط (sparse)
sp(){ # $1=owner/repo $2=sha $3..=مسارات مجلدات المهارات
  local r=$1 sha=$2 d="$WORK/$(echo "$1" | tr / _)" x pats=(); shift 2; for x in "$@"; do pats+=("/$x/"); done
  git clone -q --filter=blob:none --no-checkout "https://github.com/$r" "$d" 2>/dev/null && git -C "$d" sparse-checkout set --no-cone "${pats[@]}" && git -C "$d" checkout -q "$sha" 2>/dev/null || { bad "$r"; return; }
  for x in "$@"; do [ -e "$SKILLS/$(basename "$x")" ] && ok "$(basename "$x") (موجودة)" || { put "$d/$x" && ok "$(basename "$x")" || bad "$(basename "$x")"; }; done; }
# التحقق من المراجع (Crossref/OpenAlex/arXiv: يكشف DOI مختلق أو لبحث آخر — جُرّب)، APA 7، تحويل صيغ المراجع، مراجعة منهجية PRISMA. مكتبة بايثون القياسية فقط
sp kalarislabs/research-agent-skills 29fe36d26127205057d5e0ed8425f6b0e9a8c13a skills/citation-verification skills/apa7 skills/reference-manager-interop skills/systematic-review-prisma
# العربي الأكاديمي (IMRaD، اقتباس، إعادة صياغة موثّقة) — مثاله في APA يذكر مدينة الناشر (APA 6): الأولوية لـ profile/study-guide.md
sp specailm5/arabic-academic-skill 3794abdded86edd816f980fca24dce7be1e64ef5 skills/arabic-academic-skill
sp specailm5/arabic-editing-skill 6c276ba129441a2b9c989d2e7abbafb5b827dc6b skills/arabic-editing-skill          # تقرير تحريري يحفظ صوت الكاتب
sp specailm5/arabic-grammar-skill 9b61efda4a20c43a264312a0d3fe9960fc56bfd7 skills/arabic-grammar-skill          # الإعراب والتحليل النحوي
sp specailm5/arabic-children-story-skill a300b7b040a186299023ca22abc4113c1efbfb48 skills/arabic-children-story-skill   # قصص وأناشيد حسب العمر
# بطاقات Anki عربية (.apkg) بلا تطبيق: شغّلها بـ --no-import (genanki مثبّت أدناه)
sp Dooc-Nuken/teaching-skills a3c86e2e1a3f4701c92da2e59d074062bc5588c9 skills/anki-flashcards
python3 -c "import genanki" 2>/dev/null || python3 -m pip install -q $( [ -s "$HOME/tools/ca-all.pem" ] && echo --cert "$HOME/tools/ca-all.pem") genanki==0.13.1 2>/dev/null && ok "genanki" || bad "genanki"
# ERIC (قاعدة البحوث التربوية، بلا مفتاح): tools/eric_search.py في المستودع

echo; [ "$FAIL" = 0 ] && echo "انتهى بدون أخطاء. ابدأ محادثة جديدة لتظهر المهارات." || echo "انتهى مع تنبيهات ✗ فوق."
exit $FAIL
