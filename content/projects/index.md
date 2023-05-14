---
title: "Projects"
description: "A list of notable projects."
showMeta: false
showTitle: false
---
# sprite
[sprite](https://github.com/jsmolka/sprite) is a Game Boy emulator written in [drizzle](#drizzle) and serves as the ultimate stress test for the programming language. It implements most components of the system with reasonable accuracy, but there is no sound or saves, and the cartridge types are limited to MBC0, MBC1, and MBC3.

{{<wrap>}}
  {{<image src="img/technology.png" caption="Technology is incredible guy">}}
  {{<image src="img/zelda.png" caption="Zelda intro sequence">}}
{{</wrap>}}

The initial implementation didn't even manage to emulate the console at half speed. Optimizations like using a [specializing adaptive interpreter]({{<relref "posts/a-new-hope/#specializing-adaptive-interpreter">}}) in drizzle and replacing the class with free functions and variables in sprite increased the performance to 125%, which resulted in a stable frame rate at native speed.

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
  for i in 0 .. len(polygon):
    s = s + polygon[i - 1].cross(polygon[i])
  return s / 2

var triangle = [Point(0, 0), Point(4, 4), Point(0, 4)]

assert(area(triangle) == 8.0)
```

It started as an exercise for language design and whitespace-aware parsing and grew into something powerful enough to run a [Game Boy emulator](#sprite). It provides simple SDL2 and filesystem abstractions to achieve that. The latest version also features a [specializing adaptive interpreter]({{<relref "posts/a-new-hope/#specializing-adaptive-interpreter">}}) to squeeze out the last bit of performance.

{{<wrap>}}
  {{<image src="img/icon-drizzle.png" caption="Icon of drizzle rendered with SDL2">}}
  {{<image src="img/icon-eggvance.png" caption="Icon of eggvance rendered with SDL2">}}
{{</wrap>}}

# eggvance
[eggvance](https://github.com/jsmolka/eggvance) is a fast and accurate Game Boy Advance emulator. The processor grew instruction by instruction in conjunction with its [test suite](https://github.com/jsmolka/gba-tests) to ensure a solid implementation with all edge cases covered.

{{<wrap>}}
  {{<image src="img/mew.png" caption="Mew on Faraway Island">}}
  {{<image src="img/mother.png" caption="Final moments of Mother 3">}}
{{</wrap>}}

Other components of the system soon followed, and the emulator got to a stage where it was able to run most games and demos you threw at it. Around that time, I spent a weekend porting it to [WebAssembly]({{<relref "posts/wasm">}}). Audio emulation was something I had been putting off until the end due to my lack of experience, but I managed to do it eventually.

{{<wrap>}}
  {{<audio src="audio/battle-frontier.mp3" caption="Pokémon Emerald battle frontier theme">}}
{{</wrap>}}

The final year of development went into performance and accuracy improvements. I released version 1.0 around 2.5 years after the initial commit and wrote a couple of [progress reports]({{<relref "eggvance">}}) along the way.
