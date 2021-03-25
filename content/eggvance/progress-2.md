---
title: "Progress Report #2"
author: "Julian Smolka"
summary: "The second progress report of the eggvance GBA emulator."
date: 2019-09-30
type: post
---
One month has passed since the last update and I'm back with another progress report. This month I've focused on improving the accuracy and the performance of the pixel processing unit (PPU). Its main purpose is converting the data stored inside memory, like VRAM and OAM (Object Attribute Memory), into pixels you can see on the screen.

### Rendering Engine
Let's begin with the most interesting thing I've done during the last month - rewriting the rendering engine. The Game Boy Advance can use up to four different backgrounds and an object layer. Each background and object has its own priority which determines the drawing order. Backgrounds with high priority are drawn in front of backgrounds with low priority. Transparent areas inside backgrounds are used to display the background with the next highest priority.

When talking about the rendering engine, I really mean the part of the emulator which combines the different layers into the final scene you can see on the screen. The name of this part changed during development and ended up being `collapse`.

```cpp
renderObjects();

switch (mmio.dispcnt.mode) {
  case 1:
    renderBg(&PPU::renderBgMode0, 0);
    renderBg(&PPU::renderBgMode0, 1);
    renderBg(&PPU::renderBgMode2, 2);
    collapse(0, 3);
    break;
}
```

The code snippet above shows the parts of the PPU which contribute to rendering the Pokémon Emerald title screen. The used backgrounds and their rendering functions are dependent on the selected video mode found in the DISPCNT register. The produced layers can be seen in figures 1 to 4.

{{<flex>}}
  {{<figure src="eggvance/emerald-layer-bg0.png" caption="Figure 1 - Background layer 0">}}
  {{<figure src="eggvance/emerald-layer-bg1.png" caption="Figure 2 - Background layer 1">}}
{{</flex>}}

{{<flex>}}
  {{<figure src="eggvance/emerald-layer-bg2.png" caption="Figure 3 - Background layer 2">}}
  {{<figure src="eggvance/emerald-layer-obj.png" caption="Figure 4 - Object layer">}}
{{</flex>}}

One of the most challenging aspects of emulating the PPU is combining the different layers into the final scene. That's what the `collapse` function is doing. The process itself is rather straightforward for simple scenes. Just loop over the layers from highest to lowest priority and use the first opaque pixel you find. It gets much harder when dealing with effects like windows and color blending which need to look at multiple layers at the same time. An example for color blending can be found in figure 5.

{{<flex>}}
  {{<figure src="eggvance/emerald-layer-blend.png" caption="Figure 5 - Blending backgrounds 0 and 1">}}
  {{<figure src="eggvance/emerald-title-screen.png" caption="Figure 6 - Final scene">}}
{{</flex>}}

The predecessor of the `collapse` function ate a sizable amount of CPU time and was a prime candidate to be reworked. The new and heavily templated [version](https://github.com/jsmolka/eggvance/blob/d89f078a1ecf74c98837cc26b8f9ee2c6a1980f5/eggvance/src/ppu/collapse.inl) has improved performance by around 30-35%. It also fixed several bugs that were related to object windows.

### Forced Blank
Even though the GBA is using an LCD, its hardware behaves like a CRT (Cathode Ray Tube). In those displays the electron beam has to return to the start of the next line after finishing the previous one. This time period is called horizontal blank (or H-Blank). Once the whole frame has been drawn, the beam must return to the beginning of the frame which is called vertical blank (or V-Blank). A visual representation of this process can be found in figure 7 (with line numbers of the classic Game Boy, <a href="http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-GPU-Timings">source</a>).

{{<flex>}}
  {{<figure src="eggvance/blanking-intervals.png" caption="Figure 7: Blanking intervals" class="w-full sm:w-1/2">}}
{{</flex>}}

Most of the game logic and graphics processing is done during the blanking intervals because they don't interfere with the scanline drawing process. Another reason is the fact that access to video memory outside of the blanking intervals is either restricted or has negative side effects, like reducing the total number of displayable objects. This restriction can be lifted by setting the "forced blank"-bit in the DISPCNT register, which causes a white line to be displayed. There isn't much to do emulation wise apart from filling the current scanline with white pixels.

```cpp
if (mmio.dispcnt.force_blank) {
  u32* scanline = &backend.buffer[WIDTH * mmio.vcount];
  std::fill_n(scanline, WIDTH, 0xFFFF'FFFF);
  return;
}
```

### SDL Texture Changes
The GBA uses one 16-bit halfword to encode colors in a BGR555 format. This effectively wastes one bit but that doesn't seem to be a problem. Modern 16-bit color formats like RGB565 tend to use that extra bit for more green values because the human eye can distinguish shades of green the easiest.

I'm using the [SDL2](https://www.libsdl.org/) library for video, audio and user input. It allows the creation of textures in the desired BGR555 format which are then used for hardware accelerated rendering. The only problem with this approach is the fact that modern hardware tends to use the ARGB8888 color format which causes SDL to convert the whole frame from one format to the other. Removing this implicit conversion by converting the colors myself resulted in a 10-15% performance increase.

```cpp
u32 PPU::argb(u16 color) {
  return 0xFF000000            // Alpha
    | (color & 0x001F) << 19   // Red
    | (color & 0x03E0) <<  6   // Green
    | (color & 0x7C00) >>  7;  // Blue
}
```

### High Resolution Clock
Timing an emulator can be quite hard. If the frame has been rendered early, there isn't much you can do aside from waiting. The GBA has a refresh rate of 59.737 Hz (280896 cycles per frame on a 16.78 MHz CPU). The ideal frame time for this scenario are 16740 microseconds.

Using components from the C++ STL would result in inaccuracies which accumulate  over time. Luckily I found an [answer](https://stackoverflow.com/a/41862592) on stackoverflow which solves this problem with platform specific code. Using this as a base for the high resolution clock in my emulator resulted in consistent frames per second which tend to stay in the range 59.7 - 59.8 all the time.

### Conclusion
Aside from the things talked about in this progress report, there are many small bug fixes and accuracy improvements in several areas. The overall performance of the emulator has been increased by quite a bit. My next goal is creating the first release version with compiled Windows binaries. This means adding an editable configuration file and fixing several bugs in games.
