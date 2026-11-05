#!/bin/bash
# install-dev-design-toolkit.sh — مهارات للبرمجة والتصميم (واجهات، عربي/RTL، اختبارات، أمان، قواعد بيانات، APIs، ألعاب).
#   الاستخدام:  bash install-dev-design-toolkit.sh
#   كل مصدر يُنزَّل من مستودعه الرسمي ويُثبَّت على نسخة (commit) راجعتها. لا يُنسخ كود أحد داخل مستودعك. لا يحذف شيئاً ولا يستبدل مهارة موجودة.
set -uo pipefail
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
mkdir -p "$SKILLS"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }
fetch(){ git clone -q --filter=blob:none "https://github.com/$1" "$3" 2>/dev/null && git -C "$3" checkout -q "$2" 2>/dev/null; }
put(){ [ -f "$1/SKILL.md" ] && [ ! -e "$SKILLS/$(basename "$1")" ] && cp -R "$1" "$SKILLS/$(basename "$1")"; }

# 1) Superpowers: منهجية تطوير (تخطيط، TDD، تصحيح الأخطاء، مراجعة الكود) — MIT
if fetch obra/superpowers 22f0b463e7a5e579904dd6211a520321035526f7 "$WORK/sp"; then
  n=0; for s in "$WORK"/sp/skills/*/; do put "${s%/}" && n=$((n+1)); done; ok "superpowers: $n"
else bad "superpowers"; fi

# 2) wshobson/agents (MIT): مهارات مختارة للبرمجة
if fetch wshobson/agents 4bde3168b43c0655c4d00ea2726e631719908a6d "$WORK/wh"; then
  n=0; for p in developer-essentials python-development javascript-typescript frontend-mobile-development accessibility-compliance api-scaffolding database-design security-scanning game-development shell-scripting backend-development file-conversion; do
    for s in "$WORK/wh/plugins/$p/skills"/*/; do [ -d "$s" ] && put "${s%/}" && n=$((n+1)); done; done
  ok "مهارات البرمجة (wshobson): $n"
else bad "wshobson/agents"; fi

# 3) واجهات عربية RTL وخطوط وأرقام وتواريخ (MIT)
if fetch ahmed-badawood/designing-arabic-frontends b9fdb39c6908303ffe20d0a52c48ad48d87e09f7 "$WORK/ar"; then
  rm -rf "$WORK/ar/.git"; mkdir -p "$WORK/arskill/designing-arabic-frontends" && cp -R "$WORK/ar/." "$WORK/arskill/designing-arabic-frontends/" && put "$WORK/arskill/designing-arabic-frontends" && ok "designing-arabic-frontends"
else bad "designing-arabic-frontends"; fi

# 4) UX/UI: أنظمة تصميم، رموز، إتاحة WCAG، مراجعة تصميم (MIT). مهاراتها تشير لملفات داخل المستودع، فيبقى كاملاً في ~/tools
UX="${UXUI_DIR:-$HOME/tools/ux-ui-agent-skills}"
if fetch plugin87/ux-ui-agent-skills def84a70fadc3490d80901295a4f1951fdb2cc69 "$UX"; then
  ok "ux-ui-agent-skills في $UX — لأفضل نتيجة شغّل Claude Code من داخل هذا المجلد (مهاراته مشروع)"
else bad "ux-ui-agent-skills"; fi

echo; [ "$FAIL" = 0 ] && echo "انتهى بدون أخطاء. ابدأ محادثة جديدة لتظهر المهارات." || echo "انتهى مع تنبيهات ✗ فوق."
exit $FAIL
