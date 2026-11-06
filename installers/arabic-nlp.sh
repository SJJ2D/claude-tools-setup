#!/usr/bin/env bash
# تركيب عند الحاجة (ثقيل ~1–2GB): تشكيل CATT + مستوى صعوبة القراءة BAREC (CAMeL Lab).
# الاستخدام بعد التركيب:
#   ~/tools/arabic-venv/bin/python tools/arabic_nlp.py tashkeel  "النص"   (أو ملف .txt)
#   ~/tools/arabic-venv/bin/python tools/arabic_nlp.py readability "النص"
set -e
V="$HOME/tools/arabic-venv"
CA=/root/.ccr/ca-bundle.crt; C=()
if [ -f "$CA" ]; then  # بعض المواقع تمر عبر بروكسي الحاوية وبعضها لا: نحتاج الشهادات العامة + شهادة البروكسي معاً
  CA_ALL="$HOME/tools/ca-all.pem"; mkdir -p "$HOME/tools"
  [ -s "$CA_ALL" ] || cat "$(python3 -m certifi 2>/dev/null || echo /etc/ssl/certs/ca-certificates.crt)" "$CA" > "$CA_ALL"
  export SSL_CERT_FILE="$CA_ALL" REQUESTS_CA_BUNDLE="$CA_ALL" NODE_EXTRA_CA_CERTS="$CA"; C=(--cert "$CA_ALL")
fi
[ -x "$V/bin/python" ] || { uv venv -q -p 3.11 --seed "$V" || python3 -m venv "$V"; }
"$V/bin/python" -m pip install -q "${C[@]}" --extra-index-url https://download.pytorch.org/whl/cpu torch catt-tashkeel transformers
echo "✓ arabic-venv جاهز: $V"
