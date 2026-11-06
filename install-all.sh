#!/bin/bash
# install-all.sh — يركّب كل المهارات والأدوات في جلسة Claude Code سحابية جديدة (لينكس).
#   الاستخدام:   bash install-all.sh            (يستخدم «B Studio.zip» الموجود بجانب السكربت، وإلا ينزّله من مستودعه الرسمي)
#                bash install-all.sh /مسار/B_Studio.zip   (أو من ملفك المحلي)
#   - B Studio: يفك الملف المضغوط ثم يشغّل install.sh الرسمي الذي بداخله (لا ينسخ ولا يرفع شيئاً لأي مكان).
#   - مهارات OpenSEO الاثنتا عشرة: تُنزَّل من مستودعها الرسمي (رخصة MIT).
#   - VoiceStudio: يُنزَّل من مستودعه الرسمي (رخصة AGPL) ويُركَّب خادمه على CPU (حوالي 2.3 جيجابايت). النماذج لا تنزل قبل موافقتك على رخصتها.
#   - أدوات المونتاج على لينكس: بيئة بايثون 3.12 بنسخ ثابتة (faster-whisper وmediapipe).
#   لا يحذف شيئاً. أي خطوة تفشل تُطبع ويكمل الباقي.
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ZIP="${1:-}"
[ -z "$ZIP" ] && [ -f "$HERE/B Studio.zip" ] && ZIP="$HERE/B Studio.zip"   # الملف الموجود في المستودع
SKILLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$SKILLS"
FAIL=0
ok(){ echo "✓ $*"; }
bad(){ echo "✗ $*"; FAIL=1; }

# ───────────── 1) B Studio (من ملفك أنت، لا يُرفع لأي مكان: الرخصة تمنع النشر) ─────────────
mkdir -p "$WORK/bstudio"
if [ -n "$ZIP" ] && [ -f "$ZIP" ]; then
  unzip -o -q "$ZIP" -d "$WORK/bstudio" || bad "B Studio: فشل فك الضغط"
else
  # بلا ملف zip: نزّله من المستودع الرسمي لصاحبه (الدليل نفسه يطلب التركيب من هذا الرابط)
  git clone --depth 1 -q https://github.com/bassam-pt95/edit-studio "$WORK/bstudio/official" 2>/dev/null || bad "B Studio: فشل تنزيله من المستودع الرسمي (جرّب مع ملف zip)"
fi
INST="$(find "$WORK/bstudio" -name install.sh -path '*edit-studio*' -prune -o -name install.sh -print 2>/dev/null | head -1)"
if [ -n "$INST" ]; then
  mkdir -p "$WORK/shim"   # لينكس ما فيه ditto (أمر ماك): بديل يعمل نفس النسخ
  printf '#!/bin/bash\n[ "$1" = "--noqtn" ] && shift\ncp -R "$1" "$2"\n' > "$WORK/shim/ditto"; chmod +x "$WORK/shim/ditto"
  if PATH="$WORK/shim:$PATH" bash "$INST"; then ok "B Studio والمهارتان edit-studio وvideo-edit"; else bad "B Studio: install.sh فشل"; fi
else
  bad "B Studio: ما لقيت install.sh"
fi

if [ "${SKIP_HEAVY:-0}" != 1 ]; then
# ───────────── 2) أدوات المونتاج على لينكس ─────────────
VEB="${VEB_HOME:-$HOME/Documents/video-edit}"
if command -v python3.12 >/dev/null 2>&1; then
  mkdir -p "$VEB/tools"
  if [ ! -x "$VEB/tools/py/bin/python" ]; then python3.12 -m venv "$VEB/tools/py"; fi
  if "$VEB/tools/py/bin/python" -m pip install --quiet --disable-pip-version-check --only-binary=:all: \
       "numpy==1.26.4" "faster-whisper==1.2.1" "ctranslate2==4.8.4" "av==14.2.0" "mediapipe==0.10.21"; then
    ok "بيئة المونتاج: $VEB/tools/py (بايثون 3.12)"
  else
    bad "بيئة المونتاج: فشل تنزيل الحزم"
  fi
else
  bad "بايثون 3.12 غير موجود: ثبّته أولاً (مثلاً uv python install 3.12)"
fi
fi
for t in ffmpeg node; do command -v $t >/dev/null 2>&1 && ok "$t موجود" || bad "$t غير موجود، ثبّته"; done

# ───────────── 3) مهارات OpenSEO (12 مهارة، MIT) ─────────────
if git clone --depth 1 --filter=blob:none --sparse -q https://github.com/every-app/open-seo "$WORK/open-seo" 2>/dev/null \
   && git -C "$WORK/open-seo" sparse-checkout set plugins/openseo/skills 2>/dev/null; then
  N=0
  for d in "$WORK"/open-seo/plugins/openseo/skills/*/; do
    [ -f "$d/SKILL.md" ] || continue
    cp -R "$d" "$SKILLS/$(basename "$d")" && N=$((N+1))
  done
  ok "مهارات OpenSEO: $N (تحتاج خادم OpenSEO ومفتاح DataForSEO لبيانات حقيقية)"
else
  bad "OpenSEO: فشل تنزيل المستودع"
fi
if [ "${SKIP_HEAVY:-0}" != 1 ]; then
# ───────────── 4) VoiceStudio (استنساخ الصوت محلياً، CPU) ─────────────
VS="${VOICESTUDIO_DIR:-$HOME/tools/VoiceStudio}"
if command -v uv >/dev/null 2>&1; then
  mkdir -p "$(dirname "$VS")"
  [ -d "$VS/.git" ] || git clone --depth 1 -q https://github.com/debpalash/VoiceStudio "$VS" || bad "VoiceStudio: فشل تنزيل المستودع"
  if [ -d "$VS" ] && (cd "$VS" && UV_PROJECT_ENVIRONMENT="$VS/../voicestudio-venv" uv sync --no-default-groups --group cpu --frozen -q); then
    ok "VoiceStudio: ركّبته. للتشغيل:  OMNIVOICE_API_KEY=مفتاحك $VS/../voicestudio-venv/bin/python -m uvicorn backend.main:app --port 3900  (من داخل $VS)"
  else
    bad "VoiceStudio: فشل تركيب الحزم"
  fi
else
  bad "VoiceStudio: أداة uv غير موجودة (curl -LsSf https://astral.sh/uv/install.sh | sh)"
fi
fi

# ───────────── 5) حقيبة المعلم + حقيبة البرمجة والتصميم ─────────────
for t in install-teacher-toolkit.sh install-dev-design-toolkit.sh install-video-skills.sh install-agent-tools.sh install-nexcode-skills.sh; do
  [ -f "$HERE/teacher-toolkit/$t" ] && { bash "$HERE/teacher-toolkit/$t" || FAIL=1; }
done

echo
[ "$FAIL" = 0 ] && echo "انتهى بدون أخطاء. ابدأ محادثة جديدة لتظهر المهارات." || echo "انتهى مع تنبيهات ✗ فوق."
exit $FAIL
