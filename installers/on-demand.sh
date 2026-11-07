#!/usr/bin/env bash
# الأدوات الثقيلة: تُركّب عند الحاجة فقط (لا تعمل عند بداية الجلسة).
#   bash installers/on-demand.sh <أداة> [أداة...]      |   bash installers/on-demand.sh list
# كل أداة idempotent: إن كانت مركّبة لا يعيد تنزيلها. يتحقق من المساحة قبل البدء.
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"; T="$HOME/tools"; mkdir -p "$T"
CA=/root/.ccr/ca-bundle.crt; C=()
if [ -f "$CA" ]; then  # بعض المواقع تمر عبر بروكسي الحاوية وبعضها لا: نحتاج الشهادات العامة + شهادة البروكسي معاً
  CA_ALL="$HOME/tools/ca-all.pem"; mkdir -p "$HOME/tools"
  [ -s "$CA_ALL" ] || cat "$(python3 -m certifi 2>/dev/null || echo /etc/ssl/certs/ca-certificates.crt)" "$CA" > "$CA_ALL"
  export SSL_CERT_FILE="$CA_ALL" REQUESTS_CA_BUNDLE="$CA_ALL" NODE_EXTRA_CA_CERTS="$CA"; C=(--cert "$CA_ALL")
fi
TORCH_IDX=(--extra-index-url https://download.pytorch.org/whl/cpu)
ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; RC=1; }; RC=0

need_gb(){ local free; free=$(df -BG --output=avail "$HOME" | tail -1 | tr -dc 0-9)
  [ "$free" -ge "$1" ] && return 0
  echo "✗ المساحة $free GB والمطلوب ~$1 GB. نظّف: rm -rf ~/.cache/pip ~/.cache/uv ، أو احذف أداة: rm -rf ~/tools/<أداة>"; return 1; }
venv(){ local v="$T/$1"; [ -x "$v/bin/python" ] || { uv venv -q -p 3.11 --seed "$v" 2>/dev/null || python3.11 -m venv "$v"; } ; echo "$v"; }
pipi(){ local v="$1"; shift; "$v/bin/python" -m pip install -q --no-cache-dir "${C[@]}" "$@"; }

# ── وسائط خفيفة نسبياً: venv واحد مشترك (media-venv) ──
rembg(){ need_gb 1 || return; local v; v=$(venv media-venv)
  [ -x "$v/bin/rembg" ] || pipi "$v" "rembg[cpu,cli]" || { bad rembg; return; }
  # النموذج الافتراضي bria-rmbg يحتاج رخصة تجارية؛ نستخدم isnet-general-use (MIT/Apache)
  "$v/bin/python" -c "from rembg import new_session; new_session('isnet-general-use')" >/dev/null 2>&1
  ok "rembg: $v/bin/rembg i -m isnet-general-use in.png out.png"; }
upscale(){ need_gb 1 || return; local v; v=$(venv media-venv)
  "$v/bin/python" -c "import onnxruntime,PIL" 2>/dev/null || pipi "$v" onnxruntime pillow numpy || { bad upscale; return; }
  mkdir -p "$T/models"; for m in x2 x4; do [ -s "$T/models/real_esrgan_$m.onnx" ] || curl -fsSL "https://huggingface.co/SceneWorks/real-esrgan-onnx/resolve/main/real_esrgan_$m.onnx" -o "$T/models/real_esrgan_$m.onnx"; done
  ok "Real-ESRGAN: $v/bin/python $HERE/tools/upscale.py in.png out.png [x2|x4]"; }
manim(){ need_gb 2 || return; local v; v=$(venv media-venv)
  [ -x "$v/bin/manim" ] && { ok "manim: $v/bin/manim"; return; }
  command -v pkg-config >/dev/null && pkg-config --exists cairo pango 2>/dev/null || { apt-get update -qq >/dev/null 2>&1; apt-get install -y -qq libcairo2-dev libpango1.0-dev pkg-config >/dev/null 2>&1; }
  pipi "$v" manim && ok "manim: $v/bin/manim -qh scene.py Scene (العربي عبر Text/MarkupText مع خط عربي)" || bad manim; }
blender(){ need_gb 2 || return; local B="$T/blender"
  if [ ! -x "$B/blender" ]; then
    local ver=4.5.15 url; url="https://download.blender.org/release/Blender4.5/blender-$ver-linux-x64.tar.xz"
    curl -fsSL "$url" | tar -xJ -C "$T" && rm -rf "$B" && mv "$T/blender-$ver-linux-x64" "$B" || { bad blender; return; }
    ldconfig -p | grep -q libEGL.so.1 || { apt-get update -qq >/dev/null 2>&1; apt-get install -y -qq libegl1 libxkbcommon0 libxi6 libxxf86vm1 libxfixes3 libxrender1 libgl1 libsm6 >/dev/null 2>&1; }
  fi
  "$B/blender" -b --version 2>/dev/null | head -1 | grep -q Blender && ok "Blender: $B/blender -b -P script.py (headless، رندر EEVEE/Cycles على CPU بطيء)" || bad "blender لا يعمل"; }

# ── عربي / مستندات: venv تعلّم آلي مشترك مع التشكيل (arabic-venv، فيه torch CPU) ──
mlvenv(){ local v; v=$(venv arabic-venv); "$v/bin/python" -c "import torch" 2>/dev/null || pipi "$v" "${TORCH_IDX[@]}" torch; echo "$v"; }
docling(){ need_gb 3 || return; local v; v=$(mlvenv)
  [ -x "$v/bin/docling" ] || pipi "$v" "${TORCH_IDX[@]}" docling || { bad docling; return; }
  ok "docling: $v/bin/docling file.pdf --to md --output out/  (جداول وترتيب قراءة وOCR)"; }
camel(){ need_gb 3 || return; local v; v=$(venv camel-venv)
  "$v/bin/python" -c "import camel_tools" 2>/dev/null || pipi "$v" "${TORCH_IDX[@]}" camel-tools || { bad "camel-tools (يحتاج cmake/rust/boost)"; return; }
  "$v/bin/camel_data" -i light >/dev/null 2>&1 || "$v/bin/camel_data" -i morphology-db-msa-r13 >/dev/null 2>&1
  ok "CAMeL Tools: $v/bin/python (camel_tools.morphology، camel_morphology، camel_word_tokenize)"; }
qari(){ need_gb 7 || return; local v; v=$(mlvenv)
  "$v/bin/python" -c "import transformers,PIL,accelerate" 2>/dev/null || pipi "$v" transformers accelerate pillow pdf2image || { bad qari; return; }
  ok "Qari-OCR: $v/bin/python $HERE/tools/arabic_ocr.py page.png  (ينزّل النموذج ~4.5GB أول مرة؛ بطيء على CPU: دقائق للصفحة)"; }

# ── صوت وموسيقى (كبيرة جداً) ──
habibi(){ need_gb 6 || return; local v; v=$(venv habibi-venv)
  [ -x "$v/bin/habibi-tts_infer-cli" ] || pipi "$v" "${TORCH_IDX[@]}" torch torchaudio habibi-tts || { bad habibi; return; }
  ok "Habibi-TTS: $v/bin/habibi-tts_infer-cli --dialect SAU|UAE|MSA ... (لا يوجد بحريني؛ نماذج SAU/UAE غير تجارية CC-BY-NC-SA)"; }
acestep(){ need_gb 15 || return; local d="$T/ACE-Step-1.5" v
  [ -d "$d/.git" ] || git clone -q --depth 1 https://github.com/ace-step/ACE-Step-1.5 "$d" || { bad "ace-step clone"; return; }
  v=$(venv acestep-venv); "$v/bin/python" -c "import acestep" 2>/dev/null || pipi "$v" "${TORCH_IDX[@]}" -e "$d" || { bad acestep; return; }
  ok "ACE-Step 1.5: $d (اقرأ README للأوامر؛ النماذج تُنزّل أول تشغيل؛ على CPU دقائق للمقطع)"; }

careerops(){ need_gb 1 || return; local d="$T/career-ops"
  [ -d "$d/.git" ] || git clone -q --depth 1 https://github.com/career-ops-hq/career-ops "$d" && git -C "$d" fetch -q --depth 1 origin 0339acb4176f67ba3eee76e16276998d87ed869a && git -C "$d" checkout -q 0339acb4176f67ba3eee76e16276998d87ed869a || { bad careerops; return; }
  (cd "$d" && npm i -s --no-audit --no-fund >/dev/null 2>&1)
  ok "career-ops (MIT): $d. افتح Claude داخل المجلد؛ يخزّن سيرتك الذاتية فيه (بيانات شخصية: لا ترفعه لأي مستودع). لم يُختبر."; }

edittools(){ need_gb 1 || return; mkdir -p "$T/bin" "$T/models"
  # auto-editor 31.8.0 (Unlicense): ثنائي واحد، نتحقق من بصمته
  local AE="$T/bin/auto-editor" SUM=ab6da1fb01019505eea416b948d053b4d5918778ddaeea9955b90bafd8227713
  if [ ! -x "$AE" ]; then curl -fsSL -o "$AE.tmp" https://github.com/WyattBlue/auto-editor/releases/download/31.8.0/auto-editor-linux-x86_64 \
    && [ "$(sha256sum "$AE.tmp" | cut -d' ' -f1)" = "$SUM" ] && mv "$AE.tmp" "$AE" && chmod +x "$AE" || { rm -f "$AE.tmp"; bad "auto-editor (البصمة لم تطابق)"; }; fi
  # مكتبات بايثون صغيرة: كابشن ASS مُنسَّق (pysubs2)، جهارة EBU R128، كشف المشاهد (بلا opencv إضافي)، تصدير الخط الزمني OTIO/FCPXML/EDL (ffsubsync أُسقط: تعتمد حزمه على بناء يفشل هنا)
  python3 -m pip install -q "${C[@]}" pysubs2 ffmpeg-normalize opentimelineio otio-fcpx-xml-adapter otio-cmx3600-adapter click platformdirs tqdm 2>/dev/null \
    && python3 -m pip install -q "${C[@]}" --no-deps scenedetect 2>/dev/null || bad "edit python libs"
  # كاشف الوجوه YuNet (MIT، ~230KB) لإعادة تأطير 16:9 → 9:16 يتبع الوجه بـ OpenCV
  [ -s "$T/models/face_detection_yunet_2023mar.onnx" ] || curl -fsSL -o "$T/models/face_detection_yunet_2023mar.onnx" https://huggingface.co/opencv/face_detection_yunet/resolve/main/face_detection_yunet_2023mar.onnx
  "$AE" --version >/dev/null 2>&1 && ok "edittools: $AE، pysubs2، ffmpeg-normalize، scenedetect، OTIO، YuNet ($T/models)"; }

ALL="rembg upscale manim blender docling camel qari habibi acestep careerops edittools"
[ $# -eq 0 ] && set -- list
for t in "$@"; do case "$t" in
  list) echo "الأدوات: $ALL"; for x in $ALL; do printf '  %-8s' "$x"; done; echo;;
  rembg|upscale|manim|blender|docling|camel|qari|habibi|acestep|careerops|edittools) "$t";;
  arabic) bash "$HERE/installers/arabic-nlp.sh" || RC=1;;
  *) bad "أداة غير معروفة: $t";;
esac; done
exit $RC
