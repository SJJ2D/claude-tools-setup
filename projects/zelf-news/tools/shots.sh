#!/bin/bash
# tools/shots.sh "<t1,t2,...>" <name> [only-ids] [v]
#   → full-res PNGs in out/stills/<name>_<t>.png and a labelled contact sheet out/stills/<name>_sheet.jpg (with mean luma per frame)
# Examples:  tools/shots.sh "21.0,24.5,29.8" s3 S3,newsui        tools/shots.sh "2,5" s1 S1 v
cd "$(dirname "$0")/.." || exit 1
T="$1"; NAME="${2:-still}"; ONLY="$3"; V="$4"
ARGS=(--t "$T" --name "$NAME"); [ -n "$ONLY" ] && ARGS+=(--only "$ONLY"); [ "$V" = "v" ] && ARGS+=(--v)
NODE_PATH=$(npm root -g) node tools/still.js "${ARGS[@]}" | tee /tmp/zn_still_$NAME.log
python3 tools/sheet.py "$NAME" $(grep '\.png$' /tmp/zn_still_$NAME.log)
