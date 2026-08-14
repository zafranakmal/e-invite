#!/usr/bin/env bash
#
# Encode a background-music track for public/static/ and print the VOLUME
# constant to pair with it.
#
#   ./scripts/encode-track.sh ~/Downloads/"Some Song.mp3" endless-love
#
# ...writes public/static/endless-love-96k.mp3.
#
# Three things this does that are easy to get wrong by hand:
#
# 1. Mono downmix INSIDE the filter chain. `-ac 1 -af loudnorm=...` applies the
#    filter first and downmixes after, so loudnorm measures a signal that isn't
#    the one you ship. On a widely-miked piano the difference is over 2 LU —
#    L+R partially cancels — and you calibrate against the wrong number.
# 2. Two-pass loudnorm. One-pass is dynamic-only and lands short of the target.
# 3. Measures the ACTUAL OUTPUT FILE afterwards rather than trusting either
#    pass, and derives VOLUME from that.
#
# Why -16 LUFS: it is where a linear gain stops being possible on most masters
# (they arrive near 0 dBTP, so there is no headroom to gain into) and it leaves
# LRA around 10 LU, which is still genuinely dynamic. The playback attenuation
# then happens in the browser, where it costs nothing.
set -euo pipefail

SRC=${1:?usage: encode-track.sh <source-audio> <slug>}
SLUG=${2:?usage: encode-track.sh <source-audio> <slug>}

BITRATE=96k
TARGET_I=-16
# The reference: the original track sat at -15.9 LUFS and was hand-tuned to
# VOLUME 0.6, i.e. this much loudness actually reaching the guest. Every track
# since is matched to it rather than re-tuned by ear.
REFERENCE_EFFECTIVE_LUFS=-20.34

OUT="public/static/${SLUG}-${BITRATE}.mp3"
MONO="aformat=channel_layouts=mono"

echo "==> pass 1: measuring the mono signal"
STATS=$(ffmpeg -hide_banner -i "$SRC" \
  -af "${MONO},loudnorm=I=${TARGET_I}:TP=-1.5:LRA=11:print_format=json" \
  -f null - 2>&1 | sed -n '/^{/,/^}/p')

read -r M_I M_TP M_LRA M_THRESH M_OFFSET < <(
  printf '%s' "$STATS" | python3 -c '
import json,sys
d=json.load(sys.stdin)
print(d["input_i"],d["input_tp"],d["input_lra"],d["input_thresh"],d["target_offset"])'
)
echo "    input: I=${M_I} TP=${M_TP} LRA=${M_LRA}"

echo "==> pass 2: encoding ${OUT}"
ffmpeg -v error -y -i "$SRC" \
  -af "${MONO},loudnorm=I=${TARGET_I}:TP=-1.5:LRA=11:measured_I=${M_I}:measured_TP=${M_TP}:measured_LRA=${M_LRA}:measured_thresh=${M_THRESH}:offset=${M_OFFSET}" \
  -ac 1 -b:a "$BITRATE" -map_metadata -1 "$OUT"

echo "==> measuring the output file"
EBUR=$(ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1)
OUT_I=$(printf '%s' "$EBUR" | grep -E '^\s+I:' | tail -1 | grep -oE '\-?[0-9]+\.[0-9]+')
OUT_LRA=$(printf '%s' "$EBUR" | grep -E '^\s+LRA:' | tail -1 | grep -oE '\-?[0-9]+\.[0-9]+')
OUT_PK=$(printf '%s' "$EBUR" | grep -E '^\s+Peak:' | tail -1 | grep -oE '\-?[0-9]+\.[0-9]+')

VOLUME=$(python3 -c "print(f'{10 ** ((${REFERENCE_EFFECTIVE_LUFS} - (${OUT_I})) / 20):.2f}')")

printf '\n    %s\n' "$OUT"
printf '    %s, %s\n' "$(du -h "$OUT" | cut -f1)" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT" | cut -d. -f1)s"
printf '    I=%s LUFS  LRA=%s LU  peak=%s dBFS\n\n' "$OUT_I" "$OUT_LRA" "$OUT_PK"
printf '    Set in components/MusicControl.tsx:\n'
printf '      const TRACK_SRC = %s;\n' "'/static/$(basename "$OUT")'"
printf '      const VOLUME = %s;\n\n' "$VOLUME"

if python3 -c "import sys; sys.exit(0 if ${VOLUME} > 1 else 1)"; then
  echo "    WARNING: VOLUME > 1 is not reachable — HTMLMediaElement clamps to 1."
  echo "    The track is too quiet; raise TARGET_I and re-run."
fi
