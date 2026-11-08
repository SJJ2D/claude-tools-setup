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

getbin(){ # $1=المسار $2=sha256 $3=الرابط: تنزيل ثنائي والتحقق من بصمته
  [ -s "$1" ] && return 0; curl -fsSL -o "$1.tmp" "$3" && [ "$(sha256sum "$1.tmp" | cut -d' ' -f1)" = "$2" ] && mv "$1.tmp" "$1" || { rm -f "$1.tmp"; return 1; }; }

# Typst 0.15.1 (Apache-2.0): بوسترات وشهادات وأوراق عمل PDF بالعربي (جُرّب: الوصل وRTL والجداول سليمة) + مهارة typst (MIT)
typst(){ need_gb 1 || return; mkdir -p "$T/bin"; local A="$T/typst-0.15.1.tar.xz"
  getbin "$A" a6d077d0a95eed5a2eba715b2dae06be954f624ccbf85758a03f389ded33118c https://github.com/typst/typst/releases/download/v0.15.1/typst-x86_64-unknown-linux-musl.tar.xz \
    && tar -xJf "$A" -C "$T" && ln -sf "$T/typst-x86_64-unknown-linux-musl/typst" "$T/bin/typst" && rm -f "$A" || { bad "typst (البصمة)"; return; }
  local S="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/typst" W; W=$(mktemp -d)
  [ -e "$S" ] || { git clone -q --filter=blob:none --no-checkout https://github.com/lucifer1004/claude-skill-typst "$W/t" && git -C "$W/t" sparse-checkout set --no-cone '/skills/typst/' '!/skills/typst/data/' \
    && git -C "$W/t" checkout -q 4f984548fe9d375aaea42bbd2b5cc5b92a38bc13 && cp -R "$W/t/skills/typst" "$S"; }; rm -rf "$W"
  "$T/bin/typst" --version >/dev/null 2>&1 && ok "Typst: $T/bin/typst compile in.typ out.pdf --font-path ~/.local/share/fonts/arabic (مهارة typst بلا فهرس data/)"; }

# DeepFilterNet 0.5.6 (MIT/Apache): إزالة ضوضاء الكلام بالذكاء الاصطناعي على CPU (جُرّب: 8ث في 4ث، SNR 15→18.7dB). تستخدمه مهارة media-denoise-ai
denoise(){ need_gb 1 || return; mkdir -p "$T/bin"
  getbin "$T/bin/deep-filter" 70775e251eee44c0f2451a1e833326cf8bcbbe304d3e7cd12851e6fce72ef7da https://github.com/Rikorose/DeepFilterNet/releases/download/v0.5.6/deep-filter-0.5.6-x86_64-unknown-linux-musl \
    && chmod +x "$T/bin/deep-filter" || { bad "deep-filter (البصمة)"; return; }
  local S="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/media-denoise-ai" W; W=$(mktemp -d)
  [ -e "$S" ] || { git clone -q --filter=blob:none --no-checkout https://github.com/damionrashford/media-os "$W/m" && git -C "$W/m" sparse-checkout set --no-cone '/skills/media-denoise-ai/' \
    && git -C "$W/m" checkout -q 5014c1e8b23fd3e18d49926d9aa147d15a3aa08e && cp -R "$W/m/skills/media-denoise-ai" "$S"; }; rm -rf "$W"
  ok "DeepFilterNet: $T/bin/deep-filter -o outdir in.wav (48kHz). المهارة: media-denoise-ai"; }

# TTS عربي محلي بصوتك (بديل ElevenLabs): Chatterbox Multilingual مع أوزان V3 (أسرع 42% وتمتمة ذيل أقل بكثير؛ نفس الدقة؛ مُختبر)
#   + faster-whisper للفحص + parselmouth لأصوات الشخصيات + num2words. المسار ~/tts/.venv (تستخدمه سكربتات arabic-voiceover)
tts(){ need_gb 6 || return; local v="$HOME/tts/.venv"
  [ -x "$v/bin/python" ] || { mkdir -p "$HOME/tts"; uv venv -q --seed -p 3.11 "$v" 2>/dev/null || python3.11 -m venv "$v"; }
  "$v/bin/python" -c "import chatterbox, faster_whisper, parselmouth, num2words" 2>/dev/null || pipi "$v" "${TORCH_IDX[@]}" "torch==2.6.0+cpu" "torchaudio==2.6.0+cpu" \
    "chatterbox-tts==0.1.7" "setuptools<81" faster-whisper==1.2.1 praat-parselmouth num2words==0.5.14 librosa soundfile || { bad tts; return; }
  # الإصدار المنشور 0.1.7 لا يعرف V3: نثبّت الكود من GitHub على commit محدد فوقه بلا تغيير الاعتماديات (جُرّب مع transformers 5.2.0)
  "$v/bin/python" -c "import inspect; from chatterbox.mtl_tts import ChatterboxMultilingualTTS as C; assert 't3_model' in inspect.signature(C.from_pretrained).parameters" 2>/dev/null \
    || pipi "$v" --no-deps --force-reinstall "chatterbox-tts @ git+https://github.com/resemble-ai/chatterbox@ab55923c27757c90cfcc407baa57dc25a7d25217" || { bad "chatterbox V3"; return; }
  "$v/bin/python" -c "from huggingface_hub import snapshot_download as d; d('ResembleAI/chatterbox', allow_patterns=['ve.pt','t3_mtl23ls_v3.safetensors','s3gen.pt','grapheme_mtl_merged_expanded_v1.json','conds.pt','Cangjie5_TC.json'])" >/dev/null 2>&1 \
    && ok "TTS: $v (ChatterboxMultilingualTTS.from_pretrained(device='cpu', t3_model='v3'))" || bad "أوزان chatterbox"; }

ALL="rembg upscale manim blender docling camel qari habibi acestep careerops edittools typst denoise tts"
[ $# -eq 0 ] && set -- list
for t in "$@"; do case "$t" in
  list) echo "الأدوات: $ALL"; for x in $ALL; do printf '  %-8s' "$x"; done; echo;;
  rembg|upscale|manim|blender|docling|camel|qari|habibi|acestep|careerops|edittools|typst|denoise|tts) "$t";;
  arabic) bash "$HERE/installers/arabic-nlp.sh" || RC=1;;
  *) bad "أداة غير معروفة: $t";;
esac; done
exit $RC
