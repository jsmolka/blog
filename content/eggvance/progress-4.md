---
title: "Progress Report #4"
summary: "The fourth progress report of the eggvance GBA emulator."
tags: ["eggvance", "emulation", "programming"]
date: 2020-01-07
type: post
---
Hello there! It has been quite a while since the last progress report, two months to be exact. Development of the emulator has slowed down a little during that time because I started working as a JavaScript developer. Apart from cleaning up my codebase, I also fixed and implemented some things which might be of interest to some people.

### Bitmap modes
The GBA has six different background modes which are evenly split into three tile-based and three bitmap modes. One would assume that games utilize bitmaps as much as tiles, but that's not the case in reality. Tiles tend to be faster and easier to understand and are therefore used in most games. One rare example of a game using bitmap modes is DOOM II, which uses them to display the scene created by its internal software renderer. Due to this kind of game being so rare, I didn't notice bugs in the bitmap implementation until very recently, when I was going through some of the demos on [gbadev.org](https://www.gbadev.org/).

{{<flex>}}
  {{<image src="eggvance/yeti-bitmap.png" caption="Figure 1: Yeti demo">}}
  {{<image src="eggvance/yeti-bitmap-bug.png" caption="Figure 2: Yeti demo bug">}}
{{</flex>}}

Figure 1 shows the technically impressive Yeti demo. It's a first-person shooter with a custom 3D engine and uses background mode 5 to display the scene. The dimensions of the bitmap are 160x128 (the screen dimensions are 240x160). Figure 2 shows an old version of the emulator which simply copied the bitmap to the screen without further processing. This was incorrect because bitmaps can make use of the rotation / scaling matrix.

```cpp
void PPU::renderBgMode5(int bg) {
  // Maximum dimensions of this bitmap
  static constexpr Dimensions dims(160, 128);
  // Iterate over horizontal screen pixels
  for (int x = 0; x < SCREEN_W; ++x) {
    // Map current pixel to bitmap coordiantes
    // Remove fractional portion with shift
    const auto texture = transform(x, bg) >> 8;
    // Invalid coordinates are transparent
    if (!dims.contains(texture)) {
      backgrounds[bg][x] = TRANSPARENT;
      continue;
    }
    // Bitmap offset = 16-bit color * (160 * texture.y + texture.x)
    int offset = sizeof(u16) * texture.offset(dims.w);
    // Read and mask (explained in next section) color
    backgrounds[bg][x] = mmu.vram.readHalfFast(
      io.dispcnt.base_frame + offset) & 0x7FFF;
  }
}
```

The fixed version of the renderer applies the `transform` function to the current pixel, which returns the coordinates inside the bitmap. Those are then used to determine the pixel's color. The matrix used in the Yeti demo scales the bitmap by two and thus fills the entire screen. The black pixels on the right are caused by the game and not by the emulator.

### Color masking
The GBA uses the BGR555 format to encode colors and stores them in 16-bit units. Most colors are stored in the palette RAM which is a dedicated area in memory with a size of 0x400 bytes. It consists of two halves which are used to store background and sprite colors. The first color in each half can be used to draw transparent pixels. An obvious use case for this are sprites, which aren't always perfect squares. If a pixel has been marked as transparent, the next pixel in the drawing order will be displayed.

{{<flex>}}
  {{<image src="eggvance/safety-screen.png" caption="Figure 3: Safety screen">}}
  {{<image src="eggvance/safety-screen-bug.png" caption="Figure 4: Safety screen bug">}}
{{</flex>}}

Since the drawing process is separated from combining the backgrounds and sprites into the final scene, transparent pixels must be marked as such. Luckily the most significant bit in each color doesn't carry information and can be used for this purpose. This means that transparent pixels are represented by the color 0x8000. This approach worked well until I booted the game Mother 3. Its intro screen uses 0x8000 to display white and messed up my whole system (figure 4).

```cpp
u16 Palette::colorBGOpaque(int index, int bank) {
  return readHalfFast(0x20 * bank + 2 * index) & 0x7FFF;
}

u16 Palette::colorBG(int index, int bank) {
  return index == 0
    ? TRANSPARENT
    : colorBGOpaque(index, bank);
}
```

This problem can be eliminated with a quite simple solution. Every color read from the palette needs to be masked with 0x7FFF to clear the most significant bit. This prevents confusing transparent pixels with malformed white pixels (figure 3).

### Sprite tile restrictions

This issue is another prime example for the 'most games don't use bitmaps, therefore I can't test them' category. If you compare both figures down below you will notice some strange, colorful pixels in the upper left corner of figure 6. Those are uninitialized sprites (or objects if you listen to Nintendo) that were wrongfully rendered by the emulator.

{{<flex>}}
  {{<image src="eggvance/pokemon-series.png" caption="Figure 5: Pokémon series">}}
  {{<image src="eggvance/pokemon-series-bug.png" caption="Figure 6: Pokémon series bug">}}
{{</flex>}}

The cause of this problem is best described in Martin Korths [GBATEK](https://problemkaputt.de/gbatek.htm#lcdobjoverview), which is the most comprehensive and complete reference document for the GBA. This even holds up when comparing against Nintendos official programming manual.

> OBJs are always combined of one or more 8x8 pixel Tiles (much like BG Tiles in BG Modes 0-2). However, OBJ Tiles are stored in a separate area in VRAM: 06010000-06017FFF (32 KBytes) in BG Mode 0-2, or 06014000-06017FFF (16 KBytes) in BG Mode 3-5. Depending on the size of the above area (16K or 32K), and on the OBJ color depth (4bit or 8bit), 256-1024 8x8 dots OBJ Tiles can be defined.

The important part here is the one talking about tile address restrictions for different background modes. Bitmap modes (background modes 3 - 5) can't use as many sprite tiles as tiled backgrounds. This is because some bitmap modes use multiple frames which occupy the first 0x4000 bytes of the sprite tile memory. The code below shows the calculation of a tile address followed by the necessary check.

```cpp
u32 addr = mmu.vram.mirror(entry.base_tile + size * tile.offset(tiles));
if (addr < 0x1'4000 && io.dispcnt.isBitmap())
    continue;
```

### Conclusion
That's it with the changes worth writing about and even those were pretty meh. Most of the things I did during the last months were minor accuracy improvements and cleanups in the codebase. Even the DOOM II color problems have been fixed with a rather simple [commit](https://github.com/jsmolka/eggvance/commit/36e2cdd38e795d09a39594353e256b5b83fe9c47). Another important thing is the addition of [Linux](https://github.com/jsmolka/eggvance#linux) support. Removing Windows-dependent code and writing a simple CMake file took more time than I'd like to admit.

{{<flex>}}
  {{<image src="eggvance/doom.png" caption="Figure 7: DOOM II">}}
  {{<image src="eggvance/doom-bug-2.png" caption="Figure 8: DOOM II bug">}}
{{</flex>}}
