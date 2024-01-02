# sudo apt-get install fonttools

# https://jrgraphix.net/r/Unicode/
# U+0000-007F  Latin
# U+0080-00FF  Latin-1 Supplement
# U+2010-2027  Punctuation
# U+20AC       €
# U+2190       ←
# U+2192       →
# U+21A9       ↩
pyftsubset Inter.ttf --unicodes="U+0000-00FF,U+2010-2027,U+20AC,U+2190,U+2192,U+21A9" --layout-features="calt,kern,tnum" --flavor="woff2" --output-file="../assets/fonts/inter.woff2"
pyftsubset Inter-Bold.ttf --unicodes="U+0030-0039" --layout-features="calt,kern" --flavor="woff2" --output-file="../assets/fonts/inter-bold-numeric.woff2"
pyftsubset JetBrainsMono.ttf --unicodes="U+0000-007F" --layout-features="" --flavor="woff2" --output-file="../assets/fonts/jetbrains-mono.woff2"
pyftsubset JetBrainsMono-Italic.ttf --unicodes="U+0000-007F" --layout-features="" --flavor="woff2" --output-file="../assets/fonts/jetbrains-mono-italic.woff2"
