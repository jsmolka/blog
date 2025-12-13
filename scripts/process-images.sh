#!/bin/bash

# sudo apt-get install curl imagemagick libjpeg-progs
# curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# cargo install oxipng

dir="$1"
if [[ -z "$dir" ]]; then
  echo "Usage: $0 <directory>"
  exit 1
fi

if [[ ! -d "$dir" ]]; then
  echo "$dir does not exist"
  exit 1
fi

w=1280
h=1280
q=80

shopt -s globstar nullglob

for img in "$dir"/**/*.{jpg,jpeg,png}; do
  echo "$img"

  if [[ "$img" =~ \.(jpg|jpeg)$ ]]; then
    img_w=$(identify -quiet -format "%w" "$img")
    img_h=$(identify -quiet -format "%h" "$img")
    img_q=$(identify -quiet -format "%Q" "$img")

    if (( img_w <= w && img_h <= h && img_q <= q )); then
      continue
    fi

    tmp=$(mktemp)
    convert "$img" -resize "${w}x${h}>" ppm:- | cjpeg -quality $(( img_q < q ? img_q : q )) -progressive -optimize > "$tmp"
  else
    tmp=$(mktemp)
    convert "$img" -resize "${w}x${h}>" png:- | oxipng --opt max --zopfli --fast -s -q - --out "$tmp"
  fi

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
