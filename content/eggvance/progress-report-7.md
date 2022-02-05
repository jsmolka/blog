---
title: "Progress Report #7"
description: "Seventh progress report of the eggvance GBA emulator."
tags: ["eggvance", "emulation", "programming"]
date: 2021-05-11
type: post
---
These were some productive weeks for me. I made visible, audible, and technical progress, which pushed the project over the finish line. I never intended for this emulator to be good. Hell, I didn't even know if I could do it at all. I started working on it with the expectation of running Pokémon Emerald someday. The current version blows this expectation out of the window to the point that you could actually recommend it to another person. So let's go over the final improvements of version 1.0.

## Beep Boop
Audio has been one of the most challenging things for me to do. I pushed it back to a late stage in development because my brain just couldn't grasp the idea of combining frequencies and amplitudes into something that sounds pleasant to the human ear, with emphasis on pleasant. I was talking about that with a college, and he noted that audio issues stand out much more than minor graphical glitches. High-quality audio emulation is important, and I made good progress on that front over the last few months.

Sound processing on the Game Boy Advance can be divided into two parts: FIFO and PSG channels. The former are a new addition to the console and account for most of the sound you hear in games. They are quite different from the legacy PSG channels in that they use a stream of precomposed 8-bit samples. The samples are fed to the FIFO using DMA. It can store up to 32 of them at a time and automatically refills itself once half-empty to ensure smooth sound output.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier-fifo.mp3" caption="Pokémon Emerald battle frontier FIFO channels">}}
{{</flex>}}

The four PSG (procedural sound generator) channels are the same as on the original Game Boy. There are two square, a wave, and a noise channel, with additional effects like sweep (frequency change over time), envelope (volume change over time), and sound length. Most GBA games use them for auxiliary sounds or not at all.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier-psg.mp3" caption="Pokémon Emerald battle frontier PSG channels">}}
{{</flex>}}

The initial implementation of these channels was unoptimized and caused quite a performance drop. Each CPU tick ran all enabled channels and the so-called frame sequencer, which controls the modulation units (sweep, envelope, and length). That means there were more samples generated than necessary because the GBA resamples everything to 32 kHz.

The optimized version runs up until the current point in time and provides no more than the exact amount of samples we need. That is possible because all PSG channels apart from the noise channel are linear and easy to predict. The noise channel is supposed to be random and thus not suitable for this sort of optimization.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier.mp3" caption="Pokémon Emerald battle frontier theme all channels">}}
{{</flex>}}

## Scheduler
As time went on, it became more and more apparent that I needed some sort of scheduling in my emulator. There were lots of cycle counters scattered across the codebase, which slowed the emulator down and increased complexity. Not having a scheduler also caused some audio [issues](https://github.com/jsmolka/eggvance/issues/14) if a game made good use of halting. It led to problems with the frame sequencer, which skipped a sample or two and resulted in metallic sounds.

{{<flex>}}
  {{<audio src="eggvance/gba-bios-metallic.mp3" caption="Metallic GBA BIOS">}}
  {{<audio src="eggvance/gba-bios.mp3" caption="Fixed GBA BIOS">}}
{{</flex>}}

I tested different data structures in terms of performance and decided to go with a circular doubly linked list. The list must be doubly linked to allow fast removal of scheduled events. Being circular improves performance because it eliminates null checks in the code. There must be a dummy event at the last position to prevent infinite looping during insertion.

```cpp
void insert(Event& item) {
  Event*  node = &item;
  Event** iter = &head;

  while (**iter < *node)
    iter = &(*iter)->next;

  node->prev = (*iter)->prev;
  node->next = (*iter);
  node->prev->next = node;
  node->next->prev = node;

  *iter = node;
}
```

Using a list might seem counterintuitive, but most events are scheduled on short notice (like interrupt delays) or are infrequent enough to not tank performance. The scheduler itself was a great addition. It decreased complexity and improved performance as well as readability.

## Edging Closer to Perfection
Nintendo developed a test cartridge for the GBA called [AGS Aging](https://tcrf.net/AGS_Aging_Cartridge). It contains a fair amount of demanding hardware tests for various parts of the system. It fails on most emulators and even some GBA hardware clones. There is only one emulator that I know of which passes all tests: [NanoBoyAdvance](https://github.com/fleroviux/NanoBoyAdvance). That is mostly due to the extremely accurate prefetch buffer emulation.

{{<flex>}}
  {{<image src="eggvance/ags-0.3.png" caption="eggvance 0.3">}}
  {{<image src="eggvance/ags-1.0.png" caption="eggvance 1.0">}}
{{</flex>}}

The amount of red in version 0.3 made me quite sad. I thought it would pass more, but it didn't even run through the whole suite without locking up. Missing SIO emulation and the resulting lack of interrupting caused an infinite loop in a test. Proper multiplayer functionality is out of scope for this project, so a barebones SIO implementation has been added to at least pass the test.

Until a few months ago, it was quite hard to figure out what the tests do exactly. Of course, Nintendo never cared to document or release the source code of their internal test ROM. Fortunately, DenSinH took it upon himself to disassemble the important pieces and published his work on [GitHub](https://github.com/DenSinH/AGSTests). It was an immense help and allowed me to pass many more of these tests.

The last failing tests are extremely timing sensitive and don't even pass in mGBA. Speaking of mGBA, these are the results for its [test suite](https://github.com/mgba-emu/suite) across all eggvance versions:

{{<table>}}
| Test           | eggvance 0.1 | eggvance 0.2 | eggvance 0.3 | eggvance 1.0 | Total |
|:---------------|:-------------|:-------------|:-------------|:-------------|-------|
| Memory         | 1452         | 1456         | 1552         | 1552         | 1552  |
| Timing         | 457          | 404          | 1496         | 1496         | 1660  |
| DMA            | 1048         | 1048         | 1220         | 1256         | 1256  |
| Timer count-up | 356          | 365          | 496          | 496          | 936   |
| Shifter        | 139          | 140          | 140          | 140          | 140   |
| I/O read       | 123          | 123          | 123          | 123          | 123   |
| Carry          | 93           | 93           | 93           | 93           | 93    |
| Timer IRQ      | 0            | 28           | 65           | 65           | 90    |
| Multiply long  | 52           | 52           | 52           | 52           | 72    |
| Edge case      | 1            | 1            | 2            | 6            | 10    |
{{</table>}}

All that being said, passing tests might not translate well into actual game coverage. But it certainly helps and gives us programmer's some peace of mind.

## DMA Latches
Towards the end of development, some issues were remaining, and I couldn't quite figure out their cause. There were randomly occurring black lines in Pokémon Emerald, interfering and flickering backgrounds in The Legend of Zelda, as well as annoying typing sounds on the right ear during the Final Fantasy VI intro sequence.

{{<flex>}}
  {{<image src="eggvance/dma-bug-emerald.png" caption="Random black lines at the top">}}
  {{<image src="eggvance/dma-bug-zelda.png" caption="Background interference">}}
{{</flex>}}

{{<flex>}}
  {{<audio src="eggvance/ff6-intro-bug.mp3" caption="FF6 intro bugged">}}
  {{<audio src="eggvance/ff6-intro.mp3" caption="FF6 intro fixed">}}
{{</flex>}}

Debugging the sound issue made me realize that the DMA was writing to a register it wasn't supposed to. It triggered the square wave and caused the annoying sound. DMA uses internal reference registers to store the source and destination address as well as some other values. My implementation had a few problems in that regard and didn't update the destination properly. [Fixing](https://github.com/jsmolka/eggvance/commit/551edfcaa6ebe162acc18f9dc0d424b498147166) this issue killed three birds with one stone and saved me from many more hours of debugging.

## Blending
Blending also required some more work. Acrobat Kid uses semi-transparent objects to display characters in the menu. They are special because they force alpha blending regardless of the current blend mode. The old implementation already took this into account but had a few limitations.

I removed them with a slight rework and fixed the issue. That also eliminated problems in Castlevania, which I thought were completely unrelated. It used to display garbage values for one frame when entering the menu.

{{<flex>}}
  {{<image src="eggvance/acrobat-kid-bug.png" caption="Acrobat Kid transparency bug">}}
  {{<image src="eggvance/castlevania-menu-bug.png" caption="Castlevania menu bug">}}
{{</flex>}}

## User Interface
The missing user interface was one of the things that blocked the release of version 1.0. Because what would a final version be without some convenience? I didn't want to use Qt because it's such a huge dependency to pull into such a small project. Apart from that, I like small binaries, and using Qt makes that pretty much impossible.

So I did the usual Google search for small, cross-platform UI libraries and ended up with the infamous [ImGui](https://github.com/ocornut/imgui) by ocornut. Adding it to the project was nothing more than copying some files and including them in the build process. Unfortunately, ImGui doesn't play nice with `SDL_Renderer`, which I used to render the frame buffer to the screen. I switched from that to an OpenGL texture and got a small FPS boost as a bonus.

Now everything can be configured in the UI, and the emulator should be more accessible to new users.

{{<flex>}}
  {{<image src="eggvance/gui-1.png" caption="Video layer selection">}}
  {{<image src="eggvance/gui-2.png" caption="Controller config">}}
{{</flex>}}

## Performance
It's time to compare the performance across all release versions. I benchmarked everything for one minute and took the average FPS. I have an i7-4790K and an RTX 2080, so the results should be CPU-bound.

| Version      | Pokémon Emerald | Yoshi's Island | Mother 3   |
|:-------------|:----------------|:---------------|:-----------|
| eggvance 0.1 | 575.7 fps       | 513.1 fps      | 639.4 fps  |
| eggvance 0.2 | 619.5 fps       | 538.5 fps      | 1033.9 fps |
| eggvance 0.3 | 589.7 fps       | 508.9 fps      | 813.2 fps  |
| eggvance 1.0 | 550.4 fps       | 501.6 fps      | 866.6 fps  |

The following things can be observed:
- 0.2 is the fastest
- 0.3 dropped in performance because of major accuracy improvements
- 1.0 is almost as fast even though it has audio emulation

I invested quite some time in optimizations, and I think it paid off in the end.

## Mother 3
Finishing the emulator also meant finally getting to "test" some games. The one I can't recommend enough is Mother 3. It's the final installment of the Mother series, best known for its second entry EarthBound. Unfortunately, Nintendo never bothered to release the game in the western world, so we have to rely on the excellent [fan translation](http://mother3.fobby.net/). Do yourself a favor and take some time out of your day to play this gem of a game. It has everything you want:

{{<flex>}}
  {{<image src="eggvance/m3-shark.png" caption="Weird creatures">}}
  {{<image src="eggvance/m3-toilet.png" caption="Golden toilets">}}
{{</flex>}}

{{<flex>}}
  {{<image src="eggvance/m3-shrooms.png" caption="Mushroom trips">}}
  {{<image src="eggvance/m3-rats.png" caption="Rat corpses">}}
{{</flex>}}

## Final Words and the Future
That's it. I am done here. Version 1.0 is out, and it's more than I ever wanted it to be. It took almost two and a half years to get from zero to this point. Two and a half years of long nights, frustrating debugging, and obsessive behavior. Next, I want to downgrade eggvance into a GB emulator and improve the architecture. I want to get rid of global state and better separate the frontend and backend. Then I want to apply the learned things to another system like the NES and finally move on to NDS emulation.
