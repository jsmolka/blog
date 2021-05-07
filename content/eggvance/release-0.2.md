---
title: "Release 0.2"
author: "Julian Smolka"
summary: "The second release of the eggvance GBA emulator."
date: 2020-11-02
type: post
---
I finally reached a point where I am not utterly discontent with the code I wrote and decided to release the second version of my emulator. It includes all the changes mentioned in previous progress reports as well as some other changes like optional color correction. Binaries can be found on [GitHub](https://github.com/jsmolka/eggvance/releases).

{{<flex>}}
  {{<figure src="eggvance/emerald-mew.png" caption="Figure 1: Oversaturated colors in memory">}}
  {{<figure src="eggvance/emerald-mew-lcd.png" caption="Figure 2: Corrected colors on the LCD">}}
{{</flex>}}

This marks the end of the impossible quest for clean code. Now it's time to pour countless hours into the last important features:
- RTC emulation for games like Pokemon
- Prefetch emulation for better overall accuracy
- Audio emulation to break the silence (and my will to live)

See you in the next progress report!
