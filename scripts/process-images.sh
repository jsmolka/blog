#!/bin/bash

# sudo apt-get install advancecomp imagemagick libjpeg-progs zopfli

shopt -s globstar nullglob

dir="$1"
if [[ -z "$dir" || ! -d "$dir" ]]; then
  echo "Usage: $0 <directory>"
  exit 1
fi

w=1280
h=1280
q=80

for img in "$dir"/**/*.{jpg,jpeg}; do
  echo "$img"

  img_w=$(identify -format "%w" "$img")
  img_h=$(identify -format "%h" "$img")
  img_q=$(identify -format "%Q" "$img")
  if (( img_w <= w && img_h <= h && img_q <= q )); then
    continue
  fi

  tmp=$(mktemp)
  convert "$img" -resize "${w}x${h}>" ppm:- | cjpeg -quality $(( img_q < q ? img_q : q )) -progressive -optimize > "$tmp"

  if [[ -f "$tmp" ]]; then
    img_size=$(stat -c%s "$img")
    tmp_size=$(stat -c%s "$tmp")
    if (( tmp_size < img_size )); then
      mv -f "$tmp" "$img"
    else
      rm "$tmp"
    fi
  fi
done

for img in "$dir"/**/*.png; do
  echo "$img"

  tmp=$(mktemp)
  convert "$img" -resize "${w}x${h}>" "$tmp"
  zopflipng -m -y "$tmp" "$tmp" >/dev/null
  advpng -z4 "$tmp" >/dev/null

  if [[ -f "$tmp" ]]; then
    img_size=$(stat -c%s "$img")
    tmp_size=$(stat -c%s "$tmp")
    if (( tmp_size < img_size )); then
      mv -f "$tmp" "$img"
    else
      rm "$tmp"
    fi
  fi
done
