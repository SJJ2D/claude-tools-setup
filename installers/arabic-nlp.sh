#!/usr/bin/env bash
# تركيب عند الحاجة (ثقيل ~1–2GB): تشكيل CATT + مستوى صعوبة القراءة BAREC (CAMeL Lab).
# الاستخدام بعد التركيب:
#   ~/tools/arabic-venv/bin/python tools/arabic_nlp.py tashkeel  "النص"   (أو ملف .txt)
#   ~/tools/arabic-venv/bin/python tools/arabic_nlp.py readability "النص"
set -e
V="$HOME/tools/arabic-venv"; CA=/root/.ccr/ca-bundle.crt
C=(); [ -f "$CA" ] && { export SSL_CERT_FILE="$CA" REQUESTS_CA_BUNDLE="$CA"; C=(--cert "$CA"); }
[ -x "$V/bin/python" ] || { uv venv -q -p 3.11 --seed "$V" || python3 -m venv "$V"; }
"$V/bin/python" -m pip install -q "${C[@]}" --extra-index-url https://download.pytorch.org/whl/cpu torch catt-tashkeel transformers
echo "✓ arabic-venv جاهز: $V"
