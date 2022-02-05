---
title: "Release 0.2"
description: "Second release of the eggvance GBA emulator."
tags: ["eggvance", "emulation", "programming"]
date: 2020-11-02
type: post
---
I finally reached a point in development where I am not utterly discontent with the code I wrote and decided to release the second version of my emulator. It includes all the changes mentioned in previous progress reports as well as some other features like optional color correction. Binaries can be found on [GitHub](https://github.com/jsmolka/eggvance/releases).

{{<flex>}}
  {{<image src="eggvance/emerald-mew.png" caption="Oversaturated colors in memory">}}
  {{<image src="eggvance/emerald-mew-lcd.png" caption="Corrected colors on the LCD">}}
{{</flex>}}

That marks the end of the impossible quest for clean code. Now it's time to pour countless hours into the last important features:
- RTC emulation for games like Pokémon
- Prefetch emulation for better overall accuracy
- Audio emulation to break the silence (and my will to live)

See you in the next progress report!
