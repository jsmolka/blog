---
title: "Progress Report #1"
summary: "The first progress report of the eggvance GBA emulator."
tags: ["eggvance", "emulation", "programming"]
date: 2019-08-31
type: post
---
I finished my introduction project to C++ at the end of last year. Since then, I have read some books about the language and it really started to grow on me. It appears to be quite versatile and expressive with lots of horrific corners you better stay away from.

Finishing the previous project also meant looking for a new one. The idea of creating a GBA emulator originated in a C++ programming class [^1] where one of my fellow students asked if the emulator I was playing on was the project for the class. I responded with "no" but the idea got stuck in my head.

### Black box
The inner workings of an emulator were completely alien to me. It was a black box that took input in form of ROMs and produced output in form of childhood nostalgia. Not knowing anything about video console emulation or something alike, I headed out to [/r/EmuDev](https://www.reddit.com/r/EmuDev/) and asked how to get started. The people there proposed the typical order for someone new to emulation:

1. Write a [Chip-8](https://en.wikipedia.org/wiki/CHIP-8) emulator &mdash; the "Hello World" of emulation
2. Write an emulator for a simpler console like the GB or the NES
3. Do the thing you actually want to do

Getting the Chip-8 to work took a couple of hours. It was neither interesting nor challenging and I can't understand how some people pour weeks into creating visual debuggers or complex frontends for this boring thing. It was a nice exercise to get familiar with basic CPU concepts and graphics libraries but nothing more.

I then moved on to the GB and hoped for equally fast progress. I soon realized that it would require much more time to get something working (what a surprise /s) and decided to abandon it because it wasn't what I wanted to do [^2]. I wanted to write a GBA emulator and that's what I did. Now, exactly seven months after the initial commit, I feel like it's in a state that is worth talking about [^3].

{{<flex>}}
  {{<image src="eggvance/emerald-title-screen.png" caption="Figure 1: Pokemon Emerald">}}
  {{<image src="eggvance/yoshi-title-screen.png" caption="Figure 2: Yoshi's Island">}}
{{</flex>}}

### Initial progress
The first thing I did was implement the CPU, an ARM7TDMI to be precise. It's the heart of the console and dictates the clock at which all other components tick. The three stage pipeline and different memory access and cycle types make it quite hard to understand, especially when coming from the relatively simple Game Boy Z80ish processor. Fortunately the documentation is quite good. You can rely on the official ARM one or Martin Korths infamous [GBATEK](https://problemkaputt.de/gbatek.htm) if you're into condensed stuff.

I implemented the instructions one by one and wrote multiple tests for each of them. They cover pretty much all of the common and the important edge cases. This turned out to be a great time investment because I could rely on my CPU implementation being relatively robust while debugging problems related to other parts of the emulator. The following code shows a simple test for the ARM multiply instruction:

```armv4t
t300:                    ; test 300
    mov     r0, 4        ; r0 = 4
    mov     r1, 8        ; r1 = 8
    mul     r0, r0, r1   ; r0 *= r1
    cmp     r0, 32       ; r0 == 32?
    bne     f300         ; exit if false
    beq     t301         ; next test if true

f300:
    failed  300
```

Even with all of those precautions in place, there was always that bad feeling of a CPU bug lingering in the back of my mind when something didn't work as expected. I already had some of those, and they are a pain in the ass to find.

Three months after the initial commit I had a more or less reliable CPU implementation in place. It was still missing some crucial things like hardware and software interrupts, but those weren't important for the upcoming goal &mdash; graphics. The months of blind progress were coming to an end.

Understanding how they work just by going through GBATEK was near impossible because it lacks visual examples due to its nature of being a reference document. Instead, I went through the [Tonc GBA programming tutorial](https://www.coranac.com/tonc/text/) and reverse-engineered the chapters for graphics, effects, timers, interrupts, and direct memory access (DMA). The figures below show examples of affine backgrounds and sprites. Both use matrix transformations to rotate and/or scale the elements.

{{<flex>}}
  {{<image src="eggvance/tonc-sbb-aff.png" caption="Figure 3: Affine tiled background">}}
  {{<image src="eggvance/tonc-obj-aff.png" caption="Figure 4: Affine sprite">}}
{{</flex>}}

The last thing I did was clean up the memory interface. I implemented things like bus widths, memory mirroring, and read/write only registers. This fixed some of the bugs I had in Pokémon Emerald and allowed me to play through the game, one of my primary milestones.

A precondition for playing through a whole game were working save implementations for SRAM, EEPROM, and Flash. Finding out which one to use and understanding how each of them works took some time but I managed to figure it out in the end.

### Milestones
- 19/01/30 &mdash; Initial commit
- 19/04/20 &mdash; Passes [armwrestler tests](https://github.com/Emu-Docs/Emu-Docs/tree/master/Game%20Boy%20Advance/test_roms/arm_wrestler)
- 19/05/02 &mdash; Displays Tonc bitmap demos
- 19/05/29 &mdash; Displays Tonc regular sprite and background demos
- 19/06/08 &mdash; Displays Tonc affine sprite and background demos
- 19/06/27 &mdash; Displays Tonc graphic effect demos
- 19/07/03 &mdash; Displays Tonc interrupt and bios call demos
- 19/07/11 &mdash; Displays Tonc mode 7 demos
- 19/07/14 &mdash; Runs Kirby: Nightmare In Dreamland
- 19/07/16 &mdash; Displays the BIOS
- 19/08/07 &mdash; Displays all Tonc demos
- 19/08/17 &mdash; Runs Pokémon Emerald

### Some working games
- Advance Wars
- Castlevania: Aria of Sorrow
- Mario Kart: Super Circuit
- Mega Man Zero
- Metroid Fusion
- Pokémon Emerald
- Pokémon Mystery Dungeon: Red Rescue Team
- Yoshi's Island: Super Mario Advance 3
- The Legend of Zelda: A Link To The Past & Four Swords

### Epilogue
All of this progress sounds great. Sadly you can't hear it because there is no audio implementation just yet. That's the last thing I'll do. Before that, I need to improve the accuracy and performance of the emulator. It's not bad but I could be better. This report will serve as a baseline and I'll try to make more of those with specific information in the future.

### Notes
[^1]: What a boring class this was. The lecturer went over the basics of structured programming and the C/C++ memory model. At least I could use the time to work on my side projects.
[^2]: I'll revisit GB emulation at some point in the future but for now it just isn't what I want to do.
[^3]: I regret not starting this earlier. The sensation of getting even the simplest demo to work was amazing, and booting Pokémon Emerald for the first time made me jump across the room in euphoria.
