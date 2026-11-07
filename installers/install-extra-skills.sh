#!/bin/bash
# install-extra-skills.sh — مهارات إضافية (نوفمبر 2026) بعد فحص الكود. كل مصدر على commit مثبّت.
#   karpathy-guidelines (MIT)، ui-ux-pro-max (MIT)، humanizer (MIT: نسخة داخل المستودع كي لا تعتمد على مزامنة الحساب)، motion (MIT: motion.dev).
#   لم تُركّب: claude-mem (يلتقط كل ما يفعله الوكيل ويعمل كخدمة خلفية وتحليلات افتراضية)، GSD (يضيف hooks تغيّر سلوك كل جلسة)، career-ops (تُركّب عند الطلب).
set -uo pipefail
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"; WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT; mkdir -p "$SKILLS"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }
fetch(){ git clone -q --filter=blob:none "https://github.com/$1" "$3" 2>/dev/null && git -C "$3" checkout -q "$2" 2>/dev/null; }
put(){ [ -f "$1/SKILL.md" ] && [ ! -e "$SKILLS/$(basename "$1")" ] && cp -R "$1" "$SKILLS/$(basename "$1")"; }
have(){ [ -e "$SKILLS/$1" ]; }

have karpathy-guidelines || { fetch multica-ai/andrej-karpathy-skills 2c606141936f1eeef17fa3043a72095b4765b9c2 "$WORK/k" && put "$WORK/k/skills/karpathy-guidelines"; }
have karpathy-guidelines && ok "karpathy-guidelines" || bad "karpathy-guidelines"

have ui-ux-pro-max || { fetch nextlevelbuilder/ui-ux-pro-max-skill b7d5353e0130feb8c5574ef1251f8a1db1873ccb "$WORK/u" && put "$WORK/u/.claude/skills/ui-ux-pro-max"; }
have ui-ux-pro-max && ok "ui-ux-pro-max (بحث محلي بسكربت بايثون؛ بياناته داخل المهارة)" || bad "ui-ux-pro-max"

have humanizer || { fetch blader/humanizer 0ef9fe5bc3572734fd3ae6c448fe00a30cd5dcf0 "$WORK/h" && rm -rf "$WORK/h/.git" && mkdir -p "$WORK/hh" && cp -R "$WORK/h" "$WORK/hh/humanizer" && put "$WORK/hh/humanizer"; }
have humanizer && ok "humanizer" || bad "humanizer"

# motion.dev AI Kit (MIT): مهارة /motion (أفضل ممارسات الحركة، بحث الوثائق، توليد CSS springs) + خادم Motion MCP المجاني (بحث وثائق بلا حساب).
# خادم Motion+ (مدفوع/حساب) لا يُفعَّل. استعلامات البحث تذهب إلى mcp.motion.dev: لا تُرسل له أسراراً أو بيانات طلاب.
have motion || { fetch motiondivision/ai-kit 1e424943582cbbdb6e3f410687e39f96451447bb "$WORK/m" && put "$WORK/m/plugins/motion/skills/motion"; }
have motion && ok "motion (مهارة /motion من motion.dev)" || bad "motion"
if command -v claude >/dev/null 2>&1; then
  claude mcp list 2>/dev/null | grep -q '^motion:' || claude mcp add --transport http --scope user motion https://mcp.motion.dev >/dev/null 2>&1
  claude mcp list 2>/dev/null | grep -q '^motion:' && ok "Motion MCP (بحث وثائق مجاني)" || bad "Motion MCP"
fi
exit $FAIL
