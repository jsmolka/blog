---
title: "Four Shades of Green"
tags: ["sprite", "emulation", "programming"]
date: 2022-09-17
type: post
---
Progress over the last months has been quite slow. I focused on improving my performance on the bike and took big strides in that regard. I found some time to tinker on sprite during my vacation. With a working CPU implementation in place, there isn't much left to do anyway. I had to fix a few timing-related problems and implement interrupts to pass the [blargg tests](https://github.com/retrio/gb-test-roms) I'm interested in. One nasty thing was a [compiler bug](https://github.com/jsmolka/drizzle/commit/acfb44b259298132a40482f15fcb9ff20e6f73be) in drizzle, which caused some variables to be popped off the stack early and resulted in undefined behavior.

Then it was time to start working on the screen to bring the whole thing to life. Since the Game Boy is just a dumbed-down version of the Game Boy Advance (surprise), I've already done most of the things once before, and the whole process was pretty straightforward.

```drizzle
def background():
  var map_base = 0x1800
  if this.lcdc & 0x08:
    map_base = map_base + 0x0400

  var tile_base = 0x1000
  if this.lcdc & 0x10:
    tile_base = tile_base - 0x1000

  var y = this.ly
  for x in 0 .. kScreenW:
    var texel_x = (x + this.scx) & 0xFF
    var texel_y = (y + this.scy) & 0xFF

    var tile_x = texel_x >> 3
    var tile_y = texel_y >> 3
    var tile = this.vram[32 * tile_y + tile_x + map_base]

    if (this.lcdc & 0x10) == 0:
      tile = sign_extend(tile)

    var pixel_x = texel_x & 0x7
    var pixel_y = texel_y & 0x7

    var index = this.read_tile(tile_base, tile, pixel_x, pixel_y)
    this.window.set_pixel(x, y, color(this.bgp, index))
```

That was enough to ditch serial port printing of the tests and show them in all their green glory.

- ![](img/blargg-timing.png "blargg instruction timing tests")
- ![](img/blargg-interrupts.png "blargg interrupt tests")
{.fluent}

Even some games that don't require memory banking are working!

- ![](img/tetris.png "Tetris title screen")
- ![](img/dr-mario.png "Dr. Mario title screen")
{.fluent}
