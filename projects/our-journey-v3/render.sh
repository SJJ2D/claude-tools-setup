#!/usr/bin/env bash
# Montage: era logos + music for our_journey_final_v2.mp4 -> our_journey_final_v3.mp4
set -euo pipefail
cd "$(dirname "$0")"
A=ana                     # symlinks to the supplied assets
mkdir -p prep

# ---------- 1) Logos: crop the logo out of each recording, put it on pure black, 24 fps ----------
# name | file | crop w:h:x:y | trim start (s) | extra filter
H=432   # every logo scaled to the same height (60% of 720), aspect kept
prep_logo () {  # $1 name  $2 src  $3 crop  $4 ss  $5 pre-filter  $6 outline radius (px)
  local d
  ffmpeg -v error -y -ss "$4" -i "$2" -map 0:v:0 \
    -vf "fps=24,crop=$3,$5scale=-2:$H:flags=lanczos,format=yuv420p" \
    -c:v libx264 -crf 8 -preset fast -an "prep/logo_$1.mp4"
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "prep/logo_$1.mp4")
  # real alpha: letters keep their black outline; glow keeps its colour; fade in 0.3 s / out 0.4 s
  rm -rf "prep/$1"; python3 make_alpha.py "prep/logo_$1.mp4" "prep/$1" "$6"
  echo "logo $1: $d s"
}
prep_logo sa "$A/logo_sa.mov" 710:620:1050:150  0    "" 5
prep_logo vc "$A/logo_vc.mov" 700:890:1060:200  1.1  "" 4   # 0-1.1 s is a full-frame game scene: skipped
prep_logo iv "$A/logo_iv.mov" 940:725:940:260   0    "" 5
prep_logo v  "$A/logo_v.mov"  685:600:230:670   0    "" 5
# GTA VI background is dark grey (28,29,39): pull it down to black so screen blend leaves no box
prep_logo vi "$A/logo_vi.mov" 1232:930:724:180  0    "lutrgb=r='clip((val-30)*255/225,0,255)':g='clip((val-31)*255/224,0,255)':b='clip((val-41)*255/214,0,255)'," 4

# ---------- 2) Timeline (seconds, checked frame by frame) ----------
T_SA=1.00; T_VC=25.03; T_IV=54.08; T_V=103.12; T_VI=216.50
SRC_DUR=230.377
ELDER_START=$(python3 -c "print(round($T_VI-9.5,3))")          # second 9.5 of Elderbrook = GTA VI logo
ELDER_LEN=28.28
END=$(python3 -c "print(round($ELDER_START+$ELDER_LEN,3))")    # film extended so the song plays to the end
EXT=$(python3 -c "print(round($END-$SRC_DUR,3))")
FADE_ST=$(python3 -c "print(round($END-1.2,3))")
echo "Elderbrook starts $ELDER_START, film ends $END (+$EXT s)"

# music placement: start on timeline | offset inside track | length used ; 1.0 s crossfades
SA_S=0;       SA_OFF=1.0;  SA_LEN=54.58
V_S=53.58;    V_OFF=0;     V_LEN=60.04
FL_S=112.62;  FL_OFF=0;    FL_LEN=39.03
RA_S=150.65;  RA_OFF=0;    RA_LEN=$(python3 -c "print(round($ELDER_START+0.5-150.65,3))")
EL_S=$ELDER_START; EL_OFF=0; EL_LEN=$ELDER_LEN

trk () { # $1 input index $2 offset $3 length $4 start $5 label ; each track levelled to -16 LUFS first
  local fo; fo=$(python3 -c "print(round($3-1.0,3))")
  echo "[$1:a:0]atrim=start=$2:duration=$3,asetpts=PTS-STARTPTS,aresample=48000,loudnorm=I=-16:TP=-2:LRA=11,aresample=48000,afade=t=in:d=1.0,afade=t=out:st=$fo:d=1.0,adelay=$(python3 -c "print(int(round($4*1000)))"):all=1[$5];"
}

# the film fades to black at 229.0-230.4: instead of freezing a black frame, the last shot
# (walk toward the city, 226.125-229.0) is slowed with motion interpolation until the song ends
LAST=226.125; LAST_END=229.0
SLOW=$(python3 -c "print(round(($END-$LAST)/($LAST_END-$LAST),4))")
FC="[0:v]fps=24,split[ma][mb];[ma]trim=0:$LAST,setpts=PTS-STARTPTS[p1];"
FC+="[mb]trim=$LAST:$LAST_END,setpts=(PTS-STARTPTS)*$SLOW,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1[p2];"
FC+="[p1][p2]concat=n=2:v=1:a=0,trim=duration=$END,setpts=PTS-STARTPTS,format=yuv420p[bg];"
i=1
for L in sa vc iv v vi; do
  eval T=\$T_$(echo $L | tr a-z A-Z)
  FC+="[$i:v]setpts=PTS-STARTPTS+$T/TB[l$i];"
  i=$((i+1))
done
FC+="[bg][l1]overlay=(W-w)/2:(H-h)/2:eof_action=pass[b1];"
FC+="[b1][l2]overlay=(W-w)/2:(H-h)/2:eof_action=pass[b2];"
FC+="[b2][l3]overlay=(W-w)/2:(H-h)/2:eof_action=pass[b3];"
FC+="[b3][l4]overlay=(W-w)/2:(H-h)/2:eof_action=pass[b4];"
FC+="[b4][l5]overlay=(W-w)/2:(H-h)/2:eof_action=pass[vlog];"
FC+="[vlog]format=yuv420p,fade=t=out:st=$FADE_ST:d=1.2[vout];"
# film sound kept under the music at 30 %
FC+="[0:a]aresample=48000,volume=0.3,apad=whole_dur=$END[film];"
FC+="$(trk 6 $SA_OFF $SA_LEN $SA_S m1)$(trk 7 $V_OFF $V_LEN $V_S m2)$(trk 8 $FL_OFF $FL_LEN $FL_S m3)$(trk 9 $RA_OFF $RA_LEN $RA_S m4)$(trk 10 $EL_OFF $EL_LEN $EL_S m5)"
FC+="[film][m1][m2][m3][m4][m5]amix=inputs=6:normalize=0:duration=first,atrim=duration=$END,afade=t=out:st=$FADE_ST:d=1.2,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]"

ffmpeg -v error -stats -y \
  -i our_journey_final_v2.mp4 \
  -framerate 24 -i prep/sa/f%04d.png -framerate 24 -i prep/vc/f%04d.png -framerate 24 -i prep/iv/f%04d.png \
  -framerate 24 -i prep/v/f%04d.png -framerate 24 -i prep/vi/f%04d.png \
  -i "$A/mus_sa.mp4" -i "$A/mus_v.mov" -i "$A/mus_flower.mov" -i "$A/mus_raul.mp4" -i "$A/mus_elder.mp4" \
  -filter_complex "$FC" -map "[vout]" -map "[aout]" \
  -c:v libx264 -profile:v high -crf 18 -preset slow -r 24 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -movflags +faststart our_journey_final_v3.mp4
echo done
