#!/bin/bash
# install-nexcode-skills.sh — مهارات وأدوات من مدونة nexcode.codes/blog بعد فحصها.
#   الاستخدام:  bash install-nexcode-skills.sh
#   كل مصدر يُنزَّل من مستودعه الرسمي على نسخة (commit) مثبّتة. لا يُنسخ كود أحد داخل مستودعك. لا يستبدل مهارة موجودة.
#   لم أركّب افتراضياً: REA (أداة هندسة عكسية تعدّل إعدادات الوكلاء) وCallMe (مكالمات هاتفية + نفق ngrok + مفاتيح). التفاصيل في CATALOG.md
set -uo pipefail
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
mkdir -p "$SKILLS"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }
fetch(){ git clone -q --filter=blob:none "https://github.com/$1" "$3" 2>/dev/null && git -C "$3" checkout -q "$2" 2>/dev/null; }
put(){ [ -f "$1/SKILL.md" ] && [ ! -e "$SKILLS/$(basename "$1")" ] && cp -R "$1" "$SKILLS/$(basename "$1")"; }
whole(){ # مستودع كامل يعمل كمهارة واحدة: $1=مجلد مستنسخ $2=اسم المهارة
  [ -e "$SKILLS/$2" ] && return 0; rm -rf "$1/.git"; mkdir -p "$WORK/w/$2" && cp -R "$1/." "$WORK/w/$2/" && put "$WORK/w/$2"; }

# 1) Taste (MIT): اتجاه تصميم وصور مرجعية للواجهات
if fetch Leonxlnx/taste-skill 9b4bf937a1f69348126959c15d2f99a73e65699b "$WORK/ts"; then put "$WORK/ts/skills/taste-skill" && ok "taste-skill"; else bad "taste-skill"; fi

# 2) Impeccable (Apache-2.0): أوامر تصميم (polish, critique, audit). تنبيه: سكربتاته تنزّل «محرّك» بنسخة محددة عند أول تشغيل
if fetch pbakaus/impeccable c3bb418ee38ee49a6b999b7752c1368f3123a2bd "$WORK/im"; then put "$WORK/im/plugin/skills/impeccable" && ok "impeccable"; else bad "impeccable"; fi

# 3) Playwright CLI (Apache-2.0): مهارة playwright-cli. الأداة نفسها:  npm install -g @playwright/cli  (لم أثبّتها تلقائياً)
if fetch microsoft/playwright-cli 4bc00fb7fa5b4329f2fb53ac4743a066c2c664e8 "$WORK/pw"; then put "$WORK/pw/skills/playwright-cli" && ok "playwright-cli (مهارة)"; else bad "playwright-cli"; fi

# 4) img2threejs (Apache-2.0): صورة مرجعية → كود Three.js. يحتاج Node 18+ وبايثون 3.10+
if fetch img2threejs/img2threejs 0c0c49bc168e648dbaf9c8c080474de0b3a941b6 "$WORK/i3"; then whole "$WORK/i3" img2threejs && ok "img2threejs"; else bad "img2threejs"; fi

# 5) YouTube Agent (MIT): 11 مهارة لتجهيز فيديو يوتيوب
if fetch Jakeschincariol/youtube-agent-skill a2feb2104981a375ffd4f87ee04f4f5344ac43c6 "$WORK/yt"; then
  n=0; for s in "$WORK"/yt/skills/yt-*/; do put "${s%/}" && n=$((n+1)); done; ok "youtube-agent: $n"
else bad "youtube-agent"; fi

# 6) Console Skill (MIT): 11 مهارة لتحويل لعبة تملكها (PS2) إلى برنامج حاسوب. استخدمها على أقراصك أنت فقط
if fetch Jakeschincariol/console-skill a508929f1e8f5dd6f54afe489fd74340df3b6f74 "$WORK/cs"; then
  n=0; for s in "$WORK"/cs/console-*/; do put "${s%/}" && n=$((n+1)); done; ok "console-skill: $n"
else bad "console-skill"; fi

# 7) Awesome Design MD (MIT): ملفات DESIGN.md من مواقع حقيقية كمراجع ستايل، تبقى في ~/tools
AD="${AWESOME_DESIGN_DIR:-$HOME/tools/awesome-design-md}"
if [ -e "$AD" ]; then ok "awesome-design-md موجود"
elif fetch VoltAgent/awesome-design-md fcc70284932276d085f01ef9f83edde90b1258cb "$AD"; then ok "awesome-design-md في $AD (انسخ ملف الموقع المطلوب إلى جذر مشروعك)"
else bad "awesome-design-md"; fi

echo; [ "$FAIL" = 0 ] && echo "انتهى بدون أخطاء. ابدأ محادثة جديدة لتظهر المهارات." || echo "انتهى مع تنبيهات ✗ فوق."
exit $FAIL
