#!/bin/bash
# install-design-toolkit.sh — مهارة design-toolkit (GSAP وLenis وReact Bits و21st.dev) + مهارات 21st.dev الرسمية الثمانية.
#   الاستخدام:  bash install-design-toolkit.sh
#   مهارة design-toolkit (نصوصي أنا) محفوظة في مجلد skills/ هنا. أما مكتبات الطرف الثالث فتُنزَّل وقت التركيب من مصادرها الرسمية
#   على نسخ مثبّتة (npm لـ GSAP وLenis، وreactbits.dev لمكوّنات React Bits، و21st.dev لمهاراتها)، ولا يُنسخ كودها داخل المستودع.
#   لا يستبدل مهارة موجودة. أي خطوة تفشل تُطبع ويكمل الباقي.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
mkdir -p "$SKILLS"
FAIL=0; ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }

# 1) مهارة design-toolkit
SRC="$HERE/../skills/design-toolkit"
DST="$SKILLS/design-toolkit"
if [ -f "$SRC/SKILL.md" ]; then
  [ -e "$DST" ] || cp -R "$SRC" "$DST"
  ok "design-toolkit (المهارة)"
else bad "design-toolkit: ما لقيت $SRC"; fi

# 2) نسخ محلية من المكتبات داخل assets/ (GSAP 3.15.1 وLenis 1.3.27 من npm، ومكوّنات React Bits من موقعها الرسمي)
A="$DST/assets"
if [ -d "$DST" ] && [ ! -d "$A/gsap" ] && command -v npm >/dev/null 2>&1; then
  mkdir -p "$A/gsap" "$A/lenis" "$A/react-bits" "$DST/references"
  if (cd "$WORK" && npm pack -s gsap@3.15.1 lenis@1.3.27 >/dev/null 2>&1 && for t in gsap-3.15.1.tgz lenis-1.3.27.tgz; do mkdir -p "x-$t" && tar -xzf "$t" -C "x-$t"; done); then
    for f in gsap ScrollTrigger SplitText Flip Draggable DrawSVGPlugin MotionPathPlugin Observer ScrollToPlugin TextPlugin CustomEase EasePack; do
      cp "$WORK/x-gsap-3.15.1.tgz/package/dist/$f.min.js" "$A/gsap/" 2>/dev/null
    done
    cp "$WORK/x-lenis-1.3.27.tgz/package/dist/lenis.min.js" "$WORK/x-lenis-1.3.27.tgz/package/dist/lenis.css" "$A/lenis/" 2>/dev/null
    cp "$WORK/x-lenis-1.3.27.tgz/package/README.md" "$DST/references/lenis-readme.md" 2>/dev/null
    ok "GSAP 3.15.1 وLenis 1.3.27 (assets)"
  else bad "GSAP/Lenis: فشل التنزيل من npm"; fi
fi
if [ -d "$DST" ] && [ ! -f "$A/react-bits/react-bits-ts-tailwind.json" ]; then
  mkdir -p "$A/react-bits"
  if curl -fsSL -m 120 https://reactbits.dev/r/registry.json -o "$WORK/rb.json" 2>/dev/null \
     && python3 - "$WORK/rb.json" "$A/react-bits/react-bits-ts-tailwind.json" <<'PY'
import json,sys
items=json.load(open(sys.argv[1]))['items']
json.dump({i['name']:i for i in items if i['name'].endswith('-TS-TW')},open(sys.argv[2],'w'),ensure_ascii=False)
PY
  then ok "مكوّنات React Bits (assets/react-bits)"; else bad "React Bits: فشل التنزيل"; fi
  curl -fsSL -m 60 https://reactbits.dev/llms.txt -o "$DST/references/react-bits-catalog.txt" 2>/dev/null || true
  curl -fsSL -m 60 https://21st.dev/llms.txt -o "$DST/references/21st-dev-overview.md" 2>/dev/null || true
fi

# 3) مهارات 21st.dev الرسمية (تحتاج أداة 21st ومفتاح API من 21st.dev/settings/api-keys للجلب والتوليد)
n=0
for s in 21st-cli-use 21st-ai 21st-registry 21st-design-sync 21st-ui-build 21st-ui-explore 21st-ui-review 21st-video; do
  [ -e "$SKILLS/$s" ] && continue
  mkdir -p "$WORK/$s"
  if curl -fsSL -m 30 "https://21st.dev/.well-known/skills/$s/SKILL.md" -o "$WORK/$s/SKILL.md" 2>/dev/null && head -1 "$WORK/$s/SKILL.md" | grep -q '^---'; then
    cp -R "$WORK/$s" "$SKILLS/$s" && n=$((n+1))
  fi
done
[ "$n" -gt 0 ] && ok "مهارات 21st.dev: $n" || echo "• مهارات 21st.dev: لا جديد (مركّبة مسبقاً أو تعذّر التنزيل)"
exit $FAIL
