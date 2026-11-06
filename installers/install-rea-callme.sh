#!/bin/bash
# install-rea-callme.sh — REA (هندسة عكسية) وCallMe (اتصال هاتفي من Claude Code). مركّبان بطلب صريح من المستخدم.
#   REA: يضيف خادم MCP باسم rea (نسخة مثبّتة 6.8.0) ومهارة reverse-engineer-anything، ويحفظ نسخة احتياطية من ~/.claude.json
#   CallMe: إضافة تحتاج bun ومزوّد هاتف (Telnyx أو Twilio) ومفتاح OpenAI ونفق ngrok. بدون هذه المتغيرات لا تعمل المكالمات.
set -uo pipefail
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }
command -v claude >/dev/null 2>&1 || { bad "claude CLI غير موجود"; exit 1; }
mkdir -p "$HOME/tools"

# REA — من مجلد خارج أي مشروع كما تنصح وثائقه
if claude mcp list 2>/dev/null | grep -q '^rea:'; then ok "REA مفعّل مسبقاً"
elif (cd "$HOME/tools" && npx -y rea-agents@6.8.0 setup --client claude_code --yes >/dev/null 2>&1); then ok "REA 6.8.0 (MCP + مهارة)"
else bad "REA"; fi

# CallMe — الإضافة من المستودع الرسمي (ZeframLou/call-me، MIT)
if claude plugin list 2>/dev/null | grep -q 'callme@callme'; then ok "CallMe مركّب مسبقاً"
elif claude plugin marketplace add ZeframLou/call-me >/dev/null 2>&1 && claude plugin install callme@callme >/dev/null 2>&1; then
  ok "CallMe 1.0.3 (يحتاج CALLME_PHONE_* وCALLME_OPENAI_API_KEY وأخيراً ngrok لتشتغل المكالمات)"
else bad "CallMe"; fi
exit $FAIL
