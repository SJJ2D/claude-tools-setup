#!/usr/bin/env bash
# الأدوات المعتمدة (نوفمبر 2026): بحث أكاديمي، APA، خرائط ذهنية، تحويل مستندات، MCP رسمية،
# Chrome DevTools، خطوط عربية، نص عربي في Three.js، مزامنة الشفاه، أصول CC0.
# الثقيل (تشكيل CATT + مستوى القراءة BAREC) يُركّب عند أول استخدام: bash installers/arabic-nlp.sh
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS="$HOME/.claude/skills"; T="$HOME/tools"; mkdir -p "$SKILLS" "$T"
ok(){ echo "✓ $*"; }; bad(){ echo "✗ $*"; FAIL=1; }; FAIL=0
CA=/root/.ccr/ca-bundle.crt; C=()
if [ -f "$CA" ]; then  # بعض المواقع تمر عبر بروكسي الحاوية وبعضها لا: نحتاج الشهادات العامة + شهادة البروكسي معاً
  CA_ALL="$HOME/tools/ca-all.pem"; mkdir -p "$HOME/tools"
  [ -s "$CA_ALL" ] || cat "$(python3 -m certifi 2>/dev/null || echo /etc/ssl/certs/ca-certificates.crt)" "$CA" > "$CA_ALL"
  export SSL_CERT_FILE="$CA_ALL" REQUESTS_CA_BUNDLE="$CA_ALL" NODE_EXTRA_CA_CERTS="$CA"; C=(--cert "$CA_ALL")
fi

# 1) البحث الأكاديمي: paper-search (CLI + مهارة). لا تفعّل مصدر sci-hub.
if command -v paper-search >/dev/null 2>&1 || uv tool install -q paper-search-mcp >/dev/null 2>&1; then
  mkdir -p "$SKILLS/paper-search"
  curl -fsSL https://raw.githubusercontent.com/openags/paper-search-mcp/main/claude-code/SKILL.md -o "$SKILLS/paper-search/SKILL.md" && ok "paper-search (أبحاث من ~20 مصدر)" || bad "paper-search: مهارة"
else bad "paper-search: تركيب"; fi

# 3) Pandoc + APA 7
mkdir -p "$T/csl"
command -v pandoc >/dev/null || (apt-get install -y -qq pandoc >/dev/null 2>&1) || bad "pandoc"
curl -fsSL https://raw.githubusercontent.com/citation-style-language/styles/master/apa.csl -o "$T/csl/apa.csl" && ok "APA 7 CSL: $T/csl/apa.csl" || bad "apa.csl"

# 27) MarkItDown
[ -x "$HOME/.local/bin/markitdown" ] || uv tool install -q --force 'markitdown[all]' >/dev/null 2>&1
[ -x "$HOME/.local/bin/markitdown" ] && ok "markitdown: ~/.local/bin/markitdown" || bad "markitdown"

# 9) markmap + 14) troika-three-text (نسخة محلية للمشاريع)
command -v markmap >/dev/null || npm i -g -s markmap-cli >/dev/null 2>&1
command -v markmap >/dev/null && ok "markmap (خرائط ذهنية)" || bad "markmap"
if [ ! -d "$T/js/node_modules/troika-three-text" ]; then mkdir -p "$T/js" && (cd "$T/js" && npm i -s --no-audit --no-fund troika-three-text >/dev/null 2>&1); fi
[ -d "$T/js/node_modules/troika-three-text" ] && ok "troika-three-text: $T/js/node_modules" || bad "troika-three-text"

# 15) Rhubarb Lip Sync
if [ ! -x "$T/rhubarb/rhubarb" ]; then
  curl -fsSL -o /tmp/rhubarb.zip https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.14.0/Rhubarb-Lip-Sync-1.14.0-Linux.zip \
   && rm -rf /tmp/rhub && unzip -q /tmp/rhubarb.zip -d /tmp/rhub && rm -rf "$T/rhubarb" && mv /tmp/rhub/Rhubarb-Lip-Sync-* "$T/rhubarb" && rm -f /tmp/rhubarb.zip
fi
[ -x "$T/rhubarb/rhubarb" ] && ok "rhubarb: $T/rhubarb/rhubarb" || bad "rhubarb"

# 18) خطوط عربية (OFL)
F="$HOME/.local/share/fonts/arabic"; mkdir -p "$F"; n=0
for f in almarai/Almarai-Regular.ttf almarai/Almarai-Bold.ttf almarai/Almarai-ExtraBold.ttf 'cairo/Cairo[slnt,wght].ttf' tajawal/Tajawal-Regular.ttf tajawal/Tajawal-Bold.ttf \
         'baloobhaijaan2/BalooBhaijaan2[wght].ttf' amiri/Amiri-Regular.ttf amiri/Amiri-Bold.ttf 'readexpro/ReadexPro[HEXP,wght].ttf' lalezar/Lalezar-Regular.ttf 'reemkufi/ReemKufi[wght].ttf' \
         'notonaskharabic/NotoNaskhArabic[wght].ttf' 'notokufiarabic/NotoKufiArabic[wght].ttf' arefruqaa/ArefRuqaa-Regular.ttf rakkas/Rakkas-Regular.ttf 'alexandria/Alexandria[wght].ttf'; do
  out="$F/$(basename "$f" | tr -d '[]' | tr ',' '-')"
  [ -s "$out" ] || curl -fsSL "https://raw.githubusercontent.com/google/fonts/main/ofl/$(echo "$f" | sed 's/\[/%5B/g;s/\]/%5D/g')" -o "$out" || { rm -f "$out"; continue; }
  n=$((n+1))
done
command -v fc-cache >/dev/null && fc-cache -f "$F" >/dev/null 2>&1; ok "خطوط عربية: $n في $F"

# 13) أصول CC0 (ما يمكن تنزيله آلياً). حزم Quaternius/KayKit/Kenney تُنزّل يدوياً من itch.io وتوضع في assets/3d/
A="$T/assets3d"; mkdir -p "$A"
[ -s "$A/RobotExpressive.glb" ] || curl -fsSL https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb -o "$A/RobotExpressive.glb"
[ -d "$HERE/assets/3d" ] && cp -Rn "$HERE/assets/3d/." "$A/" 2>/dev/null
ok "أصول 3D: $(ls "$A" | wc -l) ملف في $A"

# 26/28) خوادم MCP: Chrome DevTools + memory + sequential-thinking + fetch
if command -v claude >/dev/null; then
  have(){ claude mcp list 2>/dev/null | grep -q "^$1:"; }
  CH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux64/chrome 2>/dev/null | head -1)
  have chrome-devtools || claude mcp add --scope user chrome-devtools -- npx -y chrome-devtools-mcp@1.12.0 --headless --isolated ${CH:+--executablePath "$CH"} --chromeArg=--no-sandbox >/dev/null 2>&1
  mkdir -p "$HERE/memory"
  have memory || claude mcp add --scope user memory -e MEMORY_FILE_PATH="$HERE/memory/memory.jsonl" -- npx -y @modelcontextprotocol/server-memory@2.1.0 >/dev/null 2>&1
  have sequential-thinking || claude mcp add --scope user sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking@2.1.1 >/dev/null 2>&1
  have fetch || claude mcp add --scope user fetch -- uvx mcp-server-fetch >/dev/null 2>&1
  for s in chrome-devtools memory sequential-thinking fetch; do have $s && ok "MCP $s" || bad "MCP $s"; done
else bad "claude CLI غير موجود لتسجيل MCP"; fi
exit $FAIL
