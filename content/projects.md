---
title: "Projects"
summary: "A list of my projects."
showMeta: false
showTitle: false
---
# Eggvance
Eggvance is a fast and accurate Game Boy Advance emulator written in C++. The processor grew instruction by instruction in conjunction with its [test suite](https://github.com/jsmolka/gba-tests) to ensure a solid implementation with all important edge cases covered.

{{<flex>}}
  {{<image src="eggvance/emerald-victory.png" caption="Pokémon Emerald hall of fame">}}
  {{<image src="eggvance/gui-3.png" caption="ImGui user interface">}}
{{</flex>}}

Other components of the system soon followed, and the emulator got to a stage where it was able to run most demos and games you threw at it. Around that time, I spent a weekend porting it to [WebAssembly]({{<ref "eggvance/wasm">}}). The audio implementation was last in line but got there eventually.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier.mp3" caption="Pokémon Emerald battle frontier theme">}}
{{</flex>}}

The final year of development went into performance and accuracy improvements. I released version 1.0 around 2.5 years after the initial commit and wrote a couple of progress report along the way. If you're interested in that kind of stuff, you can check them out [here]({{<ref "eggvance">}}).
