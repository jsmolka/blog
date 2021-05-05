---
title: "Progress Report #1"
author: "Julian Smolka"
summary: "The first progress report of the eggvance GBA emulator."
date: 2019-08-31
type: post
---
At the end of last year I finished my introduction project to C++. Since then, I read a couple of books about the language and I really started to like it. Finishing my previous project also meant looking for a new one. The idea of creating a GBA emulator originated in a C++ class where one of my fellow students asked if the emulator I was playing on was the project for the class. I said no but the idea got stuck in my head (thanks Robert).

After writing a basic [Chip-8](https://github.com/jsmolka/sandbox-cpp/tree/master/chip8) emulator and a less than half finished [GB](https://github.com/jsmolka/egg-gb) emulator, I moved on to the GBA because that's what I really wanted to do. Now, exactly seven months after the initial commit, I feel like the emulator is in a state that is worth talking about.

{{<flex>}}
  {{<figure src="eggvance/emerald-title-screen.png" caption="Figure 1 - Pokemon Emerald">}}
  {{<figure src="eggvance/yoshi-title-screen.png" caption="Figure 2 - Yoshi's Island">}}
{{</flex>}}

### Early steps
The first thing I did was implement the CPU, an ARM7TDMI to the precise, which took me a couple months. My main sources for this were the official ARM datasheet and [GBATEK](https://problemkaputt.de/gbatek.htm). The most important thing I did during all that time was to write CPU tests which cover pretty much all common and most of the edge cases. This turned out to be a great time investment because I could rely on my CPU implementation when debugging problems related to other parts of the emulator. The code below shows a simple test for the ARM multiply instruction.

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

Three months after the initial commit I had a more or less reliable CPU implementation. It was still missing some crucial things like hardware and software interrupts, but those weren’t important for the upcoming goal - implementing graphics. Understanding how they work just by going through GBATEK was near impossible due to its nature of being a reference document. As a result of that I went along TONC’s GBA programming tutorials and reverse engineered all the given examples for graphics, effects, timers, interrupts and DMA (Direct Memory Access). The figures below show examples for affine backgrounds and sprites. Both use matrix transformations to alter the scene shown on the screen.

{{<flex>}}
  {{<figure src="eggvance/tonc-sbb-aff.png" caption="Figure 3 - Affine tiled background">}}
  {{<figure src="eggvance/tonc-obj-aff.png" caption="Figure 4 - Affine sprite">}}
{{</flex>}}

The last thing I did was clean up the memory interface. I implemented things like bus widths, memory mirroring and read / write only registers. This actually fixed some of the bugs I had and allowed me to play through Pokémon Emerald. A precondition for playing through a whole game was implementing cartridge backup types like SRAM, EEPROM and Flash. Finding out which save type to use and wrapping my head around how they all work took some time but I managed to figure it out.


### Milestones
- 30/01/19: Initial commit
- 20/04/19: Passes [armwrestler](https://github.com/Emu-Docs/Emu-Docs/tree/master/Game%20Boy%20Advance/test_roms/arm_wrestler) tests
- 02/05/19: Displays [tonc](https://www.coranac.com/tonc/text/) bitmap demos
- 29/05/19: Displays tonc regular sprite and background demos
- 08/06/19: Displays tonc affine sprite and background demos
- 27/06/19: Displays tonc graphic effect demos
- 03/07/19: Displays tonc interrupt and bios call demos
- 11/07/19: Displays tonc mode 7 demos
- 14/07/19: Runs Kirby - Nightmare In Dreamland
- 16/07/19: Displays the BIOS
- 07/08/19: Displays all tonc demos
- 17/08/19: Runs Pokémon Emerald

### Some working games
- Advance Wars
- Castlevania - Aria of Sorrow
- Mario Kart - Super Circuit
- Mega Man Zero
- Metroid Fusion
- Pokémon - Emerald
- Pokémon Mystery Dungeon - Red Rescue Team
- Super Mario Advance 3 - Yoshi's Island
- The Legend of Zelda - A Link To The Past & Four Swords

### Conclusion
All of this progress sounds great. Sadly you can't hear it because there is no audio implementation just yet. That's the last thing I'll do. Before that I need to improve accuracy and performance (it's not bad but I could be better) of the emulator. This report will serve as a baseline and I'll make more of those with specific progress information in the future.
