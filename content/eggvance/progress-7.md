---
title: "Progress Report #7"
author: "Julian Smolka"
summary: "The seventh progress report of the eggvance GBA emulator."
date: 2021-03-25
type: post
draft: true
---
This were some productive weeks for me. I made visible, audible and technical progress which brings me one step closer to the finish line. I never intended for the emulator to be perfect, hell, I didn't even know if I could do it at all. I just wanted something accurate and fast. The current version almost represents that dream state. There are just some very minor things and general code cleanup left to do. But that's all unimportant for now, let's talk about the actual improvements.

### Beep boop
Audio has been one of the most challenging things for me to do. I pushed it back to a late stage in development because my brain just couldn't grasp the idea of combining frequencies and aplitudes into something that sounds pleasent to the human ear. However I made good progress on that front during the last months and finally have something I am really content with.

Sound processing on the GBA can be divided into two different parts: FIFO and PSG channels. The former are a new addition to the console and account for most of the sound you hear in games. They are quite different from the legacy PSG channels in that they use a stream of precomposed 8-bit samples. The samples are fed to the FIFO using DMA. It can hold up to 32 bytes and automatically refills itself once half empty to ensure smooth sound ouput.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier-fifo.mp3" caption="Audio 1: Pokémon Emerald battle frontier FIFO channels">}}
{{</flex>}}

The four PSG (procedural sound generator) channels are the same as on the original Game Boy. There are two square, a wave and a noise channel with additional effects like sweep (frequency change over time), envelope (volume change over time) and sound length. Most GBA games use them for auxiliary sounds or not at all.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier-psg.mp3" caption="Audio 2: Pokémon Emerald battle frontier PSG channels">}}
{{</flex>}}

The initial implementation of these channels was unoptimized and caused quite the performance drop. Each CPU tick ran all enabled audio channels and the so called frame sequencer, which controls the modulation units (sweep, envelope and length). This meant that there were more samples generated than necessary. The optimized version runs the up until the current point in time and provides no more than the exact sample we need. This is possible because all channels apart from the noise channel are linear and easy to predict. The noise channel is supposed to be random and thus no suitable for this optimization.

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier.mp3" caption="Audio 3: Pokémon Emerald battle frontier theme all channels">}}
{{</flex>}}

### Scheduler
As time went on it became more and more apparent that I needed some sort of scheduling in my emulator. There were lots of cycling counters scattered across the codebase which slowed the emulator down and increased complexity. Not having a scheduler also caused some audio [issues](https://github.com/jsmolka/eggvance/issues/14) if a game made good use of halting because it led to issues with the frame sequencer.

{{<flex>}}
  {{<audio src="eggvance/gba-bios-metallic.mp3" caption="Audio 4: Metallic GBA BIOS">}}
  {{<audio src="eggvance/gba-bios.mp3" caption="Audio 5: Fixed GBA BIOS">}}
{{</flex>}}

I tested different data structures in terms of performance and decided to go with a circular doubly linked list. The list must be doubly linked to allow fast removal of scheduled events. Being cirular improves performance because it eliminates null check in the code. To prevent infinite looping during insertion there must be a dummy event at the last position.

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

  (*iter) = node;
}

void remove(Event& item) {
  Event* node = &item;

  node->prev->next = node->next;
  node->next->prev = node->prev;

  if (head == node)
    head = node->next;
}
```

<!-- Conclusion? -->

### Edging closer to perfection
<!-- Accurracy is the top priority to that emulator developers -->
Nintendo developed a test cartrige for the GBA called AGS Aging. It contains a fair amount of demanding hardware tests for various parts of the system. It fails on most emulators and even some GBA hardware clones. There is only one emulator that I know of which passes all tests: [NanoBoyAdvance](https://github.com/fleroviux/NanoBoyAdvance). This is mostly due to the extremely accurate prefetch buffer emulation.

{{<flex>}}
  {{<figure src="eggvance/ags-0.3.png" caption="Figure 1: eggvance 0.3">}}
  {{<figure src="eggvance/ags-1.0.png" caption="Figure 2: eggvance 1.0">}}
{{</flex>}}

The amount of red in these tests made me quite sad. I thought it would pass more but it didn't even run through the whole suite without locking up. Missing SIO emulation and the resulting lack of interrupting caused an infinite loop in a test. Proper multiplayer capability is out of scope for this project so a barebones and hacky SIO implementation has been added to at least pass the test.

Until a few months ago it was quite hard to figure out what the tests do exactly. Of course Nintendo never cared to document their secret test ROM. Fortunately DenSinH took it upon himself, disassembled the imporant pieces and published his work on [GitHub](https://github.com/DenSinH/AGSTests). His work was an immense help and allowed me to pass many more of these tests. The lasts failing ones are extremely timing sensitive and don't even pass in mGBA.

Speaking of mGBA, these are the results for its test suite across all eggvance versions:

{{<table>}}
| Test           | eggvance 0.1 | eggvance 0.2 | eggvance 0.3 | eggvance 1.0 | Total |
|:---------------|:-------------|:-------------|:-------------|:-------------|:------|
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

All that being said, passing tests might not translate well into actual game coverage. But it certainly helps and leaves a good feeling in a programmers mind. It helps us sleep at night.

### DMA fixes
Towards the end of development there were some issues remaining and I couldn't quite figure out the problem. The issues were randomly occuring black lines in Pokémon Emerald, interfering and flickering backgrounds in The Legend of Zelda as well as annoying typing sounds on the right ear during the Final Fantasy VI intro sequence.

{{<flex>}}
  {{<figure src="eggvance/dma-bug-emerald.png" caption="Figure 3: Random black lines at the top">}}
  {{<figure src="eggvance/dma-bug-zelda.png" caption="Figure 4: Background interference">}}
{{</flex>}}

{{<flex>}}
  {{<audio src="eggvance/ff6-intro-bug.mp3" caption="Audio 6: FF6 intro bugged">}}
  {{<audio src="eggvance/ff6-intro.mp3" caption="Audio 7: FF6 intro fixed">}}
{{</flex>}}

Debugging the sound issue made me realize that the DMA was writing to a register it wasn't supposed to. It triggered the square wave the caused the annoying sound. DMA uses internal reference registers to store the source and destination address as well as some other values. My implementation had a few problems in that regard and didn't update the destination properly. Solving this issue killed three birds with one stone and made me quite happy.

### Blending
Blending also required some more work. Acrobat Kid uses semi-transparent objects to display characters in the menu. They are special because they force alpha blending regardless of the current blend mode. The old blending implementation already did this but had some limitations with semi-transparent objects. I reworked and then optimized it. It also fixed problems in Castlevania which I thought were unrelated. It displayed garbage values for one frame when entering the menu.

{{<flex>}}
  {{<figure src="eggvance/acrobat-kid-bug.png" caption="Figure 5: Acrobat Kid menu bug">}}
  {{<figure src="eggvance/castlevania-menu-bug.png" caption="Figure 6: Castlevania menu bug">}}
{{</flex>}}

### User interface
The user interface was one of the things that stood in the way of releasing version 1.0. Because what would a final version be without some convenience? I didn't want to use Qt because it's such a huge dependency to pull into such a small project. Apart from that I really like small binaries and using Qt makes that pretty much impossible.

So I did the usual Google search for small, cross-platform UI libraries and ended up with the infamous DearImGui. Adding it to the project was nothing more than copying some files and including them in the build process. Unfortunately ImGui didn't play well with `SDL_Renderer` which I was using to draw the framebuffer to the screen. I switched from that to an OpenGL texture for rendering and got a small FPS as bonus.

Including all relevant inputs in the UI also allowed me to move the config file from the executable directory into a common, global location. SDL provides a nice function for that called `SDL_GetPrefPath`.

{{<flex>}}
  {{<figure src="eggvance/gui-1.png" caption="Figure 7: Video layer selection">}}
  {{<figure src="eggvance/gui-2.png" caption="Figure 8: Controller config">}}
{{</flex>}}

### Performance
Time to compare the performance accross all release versions. I benchmarked everything on an i7-4790K and a RTX 2080 so it should be CPU limited.

| Version      | Pokémon Emerald | Yoshi's Island | Mother 3   |
|:-------------|:----------------|:---------------|:-----------|
| eggvance 0.1 | 575.7 fps       | 513.1 fps      | 639.4 fps  |
| eggvance 0.2 | 619.5 fps       | 538.5 fps      | 1033.9 fps |
| eggvance 0.3 | 589.7 fps       | 508.9 fps      | 813.2 fps  |
| eggvance 1.0 | 550.4 fps       | 501.6 fps      | 866.6 fps  |

The following things can be observed:
- 0.2 is the fastest
- 0.3 dropped in performance because of prefetch emulation
- 1.0 is almost as fast even though it has audio emulation

I am quite content with the overall performance.

### Mother 3
Finishing the emulator also meant finally getting to "test" some games. One thing I can't recommend enough is Mother 3. It's the final installment of the Mother series, best known for its second entry EarthBound. Unfortunately Nintendo never bothered to release the game in the western world so we have to rely on the excellent [fan translation](http://mother3.fobby.net/). The game has everything you want:

{{<flex>}}
  {{<figure src="eggvance/m3-shark.png" caption="Figure 9: Weird creatures">}}
  {{<figure src="eggvance/m3-toilet.png" caption="Figure 10: Golden toilets">}}
{{</flex>}}

{{<flex>}}
  {{<figure src="eggvance/m3-shrooms.png" caption="Figure 11: Mushroom trips">}}
  {{<figure src="eggvance/m3-rats.png" caption="Figure 12: Rat corpses">}}
{{</flex>}}

Do yourself a favor and take some time out of your day to play this gem of game.

### Conclusion and the future
That's it. I am done here. Version 1.0 is out and it's more than I ever wanted it to be. It took almost two and a half years to get from zero to this point. Two and a half years of long nights, frustrating debugging and obsessive behavior. Next I want to downgrade eggvance into a GB emulator and improve the architecture. I want to get rid of global state and better separate frontend and backend. Then I want to apply the learned things to a another system like the NES and finally move on to NDS emulation. I won't do progress reports for the GB and the NES because they shouldn't take too long to complete.
