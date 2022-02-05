---
title: "Projects"
description: "A list of notable projects."
showMeta: false
showTitle: false
---
# eggvance
eggvance is a fast and accurate Game Boy Advance emulator written in C++. Its processor grew instruction by instruction in conjunction with the [test suite](https://github.com/jsmolka/gba-tests) to ensure a solid implementation with all edge cases covered.

{{<flex>}}
  {{<image src="eggvance/emerald-fame.png" caption="Pokémon Emerald hall of fame">}}
  {{<image src="eggvance/gui-3.png" caption="ImGui user interface">}}
{{</flex>}}

Other components of the system soon followed, and the emulator got to a stage where it was able to run most games and demos you threw at it. Around that time, I spent a weekend porting it to [WebAssembly]({{<ref "eggvance/wasm">}}). Audio emulation was something I had been putting off until the end due to my lack of experience, but I managed to do it eventually.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier.mp3" caption="Pokémon Emerald battle frontier theme">}}
{{</flex>}}

The final year of development went into performance and accuracy improvements. I released version 1.0 around 2.5 years after the initial commit and wrote a couple of progress reports along the way. If you're interested in that kind of stuff, you can check them out [here]({{<ref "eggvance">}}).
