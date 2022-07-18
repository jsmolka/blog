---
title: "Projects"
description: "A list of notable projects."
showMeta: false
showTitle: false
---
# drizzle
[drizzle](https://github.com/jsmolka/drizzle) is a dynamic interpreted programming language with a syntax similar to Python.

```drizzle
class Point:
  def init(x, y):
    this.x = x
    this.y = y
  def cross(other):
    return this.x * other.y - this.y * other.x

# Stokes' theorem
def area(polygon):
  var s = 0
  for i in 0 .. polygon.size():
    s = s + polygon[i - 1].cross(polygon[i])
  return s / 2

var triangle = [Point(0, 0), Point(4, 4), Point(0, 4)]

assert(area(triangle) == 8.0)
```

It started as an exercise for language design and whitespace-aware parsing and grew into something powerful enough to run a Game Boy emulator. It provides simple SDL2 and filesystem interfaces to achieve that.

{{<flex>}}
  {{<image src="drizzle/drizzle-icon.png" caption="Icon of drizzle rendered with SDL2">}}
  {{<image src="drizzle/eggvance-icon.png" caption="Icon of eggvance rendered with SDL2">}}
{{</flex>}}

# eggvance
[eggvance](https://github.com/jsmolka/eggvance) is a fast and accurate Game Boy Advance emulator. The processor grew instruction by instruction in conjunction with its [test suite](https://github.com/jsmolka/gba-tests) to ensure a solid implementation with all edge cases covered.

{{<flex>}}
  {{<image src="eggvance/emerald-mew-lcd.png" caption="Mew on Faraway Island">}}
  {{<image src="eggvance/m3-ending.png" caption="Final moments of Mother 3">}}
{{</flex>}}

Other components of the system soon followed, and the emulator got to a stage where it was able to run most games and demos you threw at it. Around that time, I spent a weekend porting it to [WebAssembly]({{<relref "eggvance/wasm">}}). Audio emulation was something I had been putting off until the end due to my lack of experience, but I managed to do it eventually.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier.mp3" caption="Pokémon Emerald battle frontier theme">}}
{{</flex>}}

The final year of development went into performance and accuracy improvements. I released version 1.0 around 2.5 years after the initial commit and wrote a couple of progress reports along the way. If you're interested in that kind of stuff, you can check them out [here]({{<relref "eggvance">}}).
