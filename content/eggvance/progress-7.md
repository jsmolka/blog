---
title: "Progress Report #7"
author: "Julian Smolka"
summary: "The seventh progress report of the eggvance GBA emulator."
date: 2021-03-25
type: post
draft: true
---
This were some productive weeks for me. I made visible, audible and technical progress which brings me one step closer to the finish line. I never intended for the emulator to be perfect, hell, I didn't even know if I could do it at all. I just wanted something accurate and fast. The current version almost represents that dream state. There are just some very minor things and general code cleanup left to do. But that's all unimportant for now, let's talk about the actual improvements.

### Beep Boop
Audio has been one of the most challenging things for me to do. I pushed it back to a late stage in development because my brain just couldn't grasp the idea of combining frequencies and aplitudes into something that sounds pleasent to the human ear. However I made good progress on that front during the last months and finally have something I am really content with.

Sound processing on the GBA can be divided into two different parts: FIFO and PSG channels. The former are a new addition to the console and account for most of the sound you hear in games. They are quite different from the legacy PSG channels in that they use a stream of precomposed 8-bit samples. The samples are fed to the FIFO using DMA. It can hold up to 32 bytes and automatically refills itself once half empty to ensure smooth sound ouput.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier-fifo.mp3" caption="Audio 1: Pokémon Emerald battle frontier FIFO channels">}}
{{</flex>}}

The four PSG (procedural sound generator) channels are the same as on the original Game Boy. There are two square, a wave and a noise channel with additional effects like sweep (frequency change over time), envelope (volume change over time) and sound length. Most GBA games use them for auxiliary sounds or not at all.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier-psg.mp3" caption="Audio 2: Pokémon Emerald battle frontier PSG channels">}}
{{</flex>}}

The initial implementation of these channels was unoptimized and caused quite the performance drop. Each CPU tick ran all enabled audio channels and the so called frame sequencer, which controls the modulation units (sweep, envelope and length). This meant that there were more samples generated than necessary. The optimized version runs the up until the current point in time and provides no more than the exact sample we need. This is possible because all channels apart from the noise channel are linear and easy to predict. The noise channel is supposed to be random and thus no suitable for this optimization.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier.mp3" caption="Audio 3: Pokémon Emerald battle frontier theme all channels">}}
{{</flex>}}

### Scheduler
As time went on

- first vector
- heap?
- circular list with infinite head
- problems with running late https://github.com/jsmolka/eggvance/issues/18

{{<flex>}}
  {{<audio src="eggvance/gba-bios-metallic.mp3" caption="Audio 1: Metallic GBA BIOS">}}
  {{<audio src="eggvance/gba-bios.mp3" caption="Audio 2: Fixed GBA BIOS">}}
{{</flex>}}

### AGS Aging
- edging closer to perfection?
- show dma improvements in mgba suite

### DMA Improvements
- three birds with one stone https://github.com/jsmolka/eggvance/commit/551edfcaa6ebe162acc18f9dc0d424b498147166

### Blending
- 2 bugs fixed

### ImGui
- min window size
- weird behavior after moving / resizing on Windows

### Miscellaneous
- Top Gun thing, is this worth it?

### Mother 3

### Conclusion and future
- talk about people aborting projects early
- GB -> NES -> NDS (no posts for GB / NES)
- GB to improve architecture, does not need to be super accurate
- NES to apply the learned to a "new" system
- NDS as magnum opus with long occupation
  - start with #0.x progress reports and learn NDS programming first
