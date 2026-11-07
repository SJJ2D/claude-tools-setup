#!/bin/bash
# install-extra-skills.sh — مهارات إضافية (نوفمبر 2026) بعد فحص الكود. كل مصدر على commit مثبّت.
#   karpathy-guidelines (MIT)، ui-ux-pro-max (MIT)، humanizer (MIT: نسخة داخل المستودع كي لا تعتمد على مزامنة الحساب)، motion (MIT: motion.dev)، find-skills (MIT: vercel-labs)، وثلاث مهارات عربية: arabic-design وarabic-writing وarabic-rtl-fixer-ai-skill.
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

# find-skills (MIT، vercel-labs/skills): اكتشاف المهارات عبر skills.sh. نعدّل الخطوة 6: لا تثبيت تلقائي (-y) قبل مراجعة المحتوى وموافقة المستخدم.
if ! have find-skills; then
  if fetch vercel-labs/skills d3701c11b1101251af14c9d148f026e1a47ebe17 "$WORK/f" && put "$WORK/f/skills/find-skills"; then
    python3 - "$SKILLS/find-skills/SKILL.md" <<'PYEOF'
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
i = s.index('### Step 6: Offer to Install'); j = s.index('## Common Skill Categories')
safe = """### Step 6: Offer to Install (local policy: review first, never auto-install)

Never run `npx skills add ... -y`. Before installing anything: (1) read the skill's SKILL.md and scripts from its GitHub repo and check for commands that download or run code, send data out, or edit settings/hooks; (2) check the skills.sh page for the security-audit results (Snyk, Socket, Gen Agent Trust Hub) and say so if any shows Warn; (3) tell the user what it does and its install count, and install only after they agree. The user's repo is the memory: after approval add the skill to `installers/install-extra-skills.sh` at a pinned commit rather than leaving a one-off install.
In this container run the CLI with `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`. Search queries go to skills.sh: never put secrets or student data in them.

"""
open(p, 'w', encoding='utf-8').write(s[:i] + safe + s[j:])
PYEOF
  fi
fi
have find-skills && ok "find-skills (مع سياسة: مراجعة قبل التثبيت)" || bad "find-skills"

# مهارات عربية (MIT، راجعتها: نصوص إرشادية فقط، وأدوات rtl-fixer سكربتات OOXML محلية بلا شبكة ولا subprocess)
have arabic-design || { fetch JamalMohafil/claude-skills ca8c888abeffa8616b611032510c631d43a263ef "$WORK/ad" && put "$WORK/ad/arabic-design"; }
have arabic-design && ok "arabic-design (عربي نظيف في HTML/CSS)" || bad "arabic-design"
have arabic-writing || { fetch ahmeddabak/claude-arabic-writing 7001831e49a510f499a22368966fd14fc271b493 "$WORK/aw" && put "$WORK/aw/skills/arabic-writing"; }
have arabic-writing && ok "arabic-writing (تدقيق وكتابة عربية سليمة)" || bad "arabic-writing"
if ! have arabic-rtl-fixer-ai-skill; then
  if fetch ibadwi/arabic-rtl-fixer-ai-skill 015b98f5434580ae439db5c30f1864b64085c872 "$WORK/rf"; then
    mkdir -p "$WORK/rfs/arabic-rtl-fixer-ai-skill" && for x in SKILL.md LICENSE THIRD_PARTY_LICENSE.md SECURITY.md references scripts; do cp -R "$WORK/rf/$x" "$WORK/rfs/arabic-rtl-fixer-ai-skill/"; done
    put "$WORK/rfs/arabic-rtl-fixer-ai-skill"
  fi
fi
have arabic-rtl-fixer-ai-skill && ok "arabic-rtl-fixer-ai-skill (RTL في Word/PowerPoint/PDF/ويب)" || bad "arabic-rtl-fixer-ai-skill"
exit $FAIL
