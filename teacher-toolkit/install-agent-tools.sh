#!/bin/bash
# install-agent-tools.sh — مهارات وأدوات عامة للبرمجة: Addy Osmani وContext7 وGraphify و21st Magic وStrix.
#   الاستخدام:  bash install-agent-tools.sh
#   كل مصدر يُنزَّل من مستودعه الرسمي على نسخة (commit) مثبّتة ومفحوصة. لا يُنسخ كود أحد داخل مستودعك. لا يستبدل مهارة موجودة.
set -uo pipefail
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
mkdir -p "$SKILLS"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }
fetch(){ git clone -q --filter=blob:none "https://github.com/$1" "$3" 2>/dev/null && git -C "$3" checkout -q "$2" 2>/dev/null; }
put(){ [ -f "$1/SKILL.md" ] && [ ! -e "$SKILLS/$(basename "$1")" ] && cp -R "$1" "$SKILLS/$(basename "$1")"; }

# 1) Addy Osmani agent-skills (MIT): 25 مهارة هندسة برمجيات (مواصفات، TDD، مراجعة، أمان، أداء، شحن)
if fetch addyosmani/agent-skills 301b02b12bff98e4688e6984af6556802322bbde "$WORK/ao"; then
  n=0; for s in "$WORK"/ao/skills/*/; do put "${s%/}" && n=$((n+1)); done
  [ -e "$SKILLS/references" ] || cp -R "$WORK/ao/references" "$SKILLS/references"   # مهاراته تشير إلى ../references
  ok "agent-skills (Addy Osmani): $n"
else bad "agent-skills"; fi

# 2) Context7 (MIT): مهارات توثيق المكتبات الحديثة. الخادم نفسه (MCP) يُضاف بأمر منفصل، انظر أسفل
if fetch upstash/context7 76d68b5d2b19eb0f5d96c3e44c12c710f6a7a5ab "$WORK/c7"; then
  n=0; for s in context7-mcp context7-cli find-docs; do put "$WORK/c7/skills/$s" && n=$((n+1)); done; ok "context7: $n مهارات"
else bad "context7"; fi

# 3) 21st Magic (ISC): مهارة 21st-ui لتوليد مكوّنات واجهات
if fetch 21st-dev/magic-mcp 6b5299e8a83ceffa73d4fc4e148905bb3eeeeb55 "$WORK/mg"; then
  put "$WORK/mg/skills/21st-ui" && ok "21st-ui"
else bad "21st-ui"; fi

# 4) Strix (Apache-2.0): 9 مهارات اختبار اختراق. للاستخدام على تطبيقاتك أنت أو بإذن صريح فقط
if fetch usestrix/strix 06015506625a78b981ae0b34be40239fc1b389be "$WORK/sx"; then
  n=0; for s in "$WORK"/sx/skills/*/; do put "${s%/}" && n=$((n+1)); done; ok "strix (مهارات): $n"
else bad "strix"; fi

# 5) Graphify (Apache-2.0): أداة بايثون تبني رسماً معرفياً للمشروع وتسجّل مهارتها في Claude Code
if command -v uv >/dev/null 2>&1; then
  if uv tool install -q "git+https://github.com/Graphify-Labs/graphify@16218bfc80d4ca2799734d045039f7ed1a5fa9fb" >/dev/null 2>&1 \
     || uv tool install -q --force "git+https://github.com/Graphify-Labs/graphify@16218bfc80d4ca2799734d045039f7ed1a5fa9fb" >/dev/null 2>&1; then
    PATH="$(uv tool dir --bin 2>/dev/null):$HOME/.local/bin:$PATH" graphify install >/dev/null 2>&1 && ok "graphify (للاستخدام: /graphify .)" || bad "graphify: فشل graphify install"
  else bad "graphify: فشل التركيب"; fi
else bad "graphify: uv غير موجود"; fi

cat <<'MSG'

أدوات خارجية تحتاج حسابك (لا أركّبها بدون موافقتك):
  • Context7 MCP (يرسل أسئلة الأكواد لخدمة Upstash):  claude mcp add --transport http context7 https://mcp.context7.com/mcp
  • 21st Magic MCP يحتاج مفتاح API من 21st.dev (مهارة 21st-ui تعمل بدونه لكن لن تولّد مكوّنات)
  • Strix نفسه يحتاج Docker ومفتاح نموذج (pip/uv install strix-agent)؛ المركّب هنا مهاراته فقط
MSG
echo; [ "$FAIL" = 0 ] && echo "انتهى بدون أخطاء. ابدأ محادثة جديدة لتظهر المهارات." || echo "انتهى مع تنبيهات ✗ فوق."
exit $FAIL
