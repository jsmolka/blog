---
title: "Progress Report #6"
author: "Julian Smolka"
summary: "The sixth progress report of the eggvance GBA emulator."
date: 2021-02-03
type: post
---
2020 came to an end and left me with an output of two progress reports and a simple, short release note. That's less than I was hoping for, but the most time this year went into improving the code base and some performance tinkering for personal pleasure. In my defense, the last progress report had much higher quality than the previous ones, and I'd like to keep it this way!

### Undefined Behavior
In that spirit, let's start with an [issue](https://github.com/jsmolka/eggvance/issues/4) which has been reported by fleroviux in June last year. He tried to play Pokémon Sapphire and his game froze right after the intro sequence when the character shrinks in size and then enters the world in a moving truck. The same also happens in Ruby because they are essentially the same game.

{{<flex>}}
  {{<figure src="eggvance/sapphire-bad-bios-bug.png" caption="Figure 1: Freezing during intro sequence">}}
  {{<figure src="eggvance/sapphire-bad-bios.png" caption="Figure 2: In the truck where we belong">}}
{{</flex>}}

He used the bundled replacement BIOS made by Normmatt where bugs in games are to be expected. I tried it with the original one, and the freezing stopped happening. So I closed the issue and blamed the BIOS for doing some unexpected things, but he quickly reassured me that the bug wasn't happening in his emulator or mGBA when using the same BIOS. I verified that and was left scratching my head about the possible origin of this problem.

I figured it had something to do with the BIOS implementation but I couldn't find anything wrong with it. Many failed attempts later GitHub suggested me the [pret](https://github.com/pret) project which is the decompilation of all GB, GBA, and even some NDS Pokémon games. I can't believe how people do such things but I'll gladly use their work to fix bugs in my emulator. I skimmed through the intro-sequence related parts of the code and [this function](https://github.com/pret/pokeruby/blob/c7bbd485c3103c6a51d15f6e0081922d3c14d42d/src/fieldmap.c#L87):

```c
static void InitBackupMapLayoutConnections(struct MapHeader *mapHeader) {
  int count = mapHeader->connections->count;
  struct MapConnection *connection = mapHeader->connections->connections;
  int i;

  gMapConnectionFlags = sDummyConnectionFlags;
  for (i = 0; i < count; i++, connection++) {
    // Handle
  }
}
```

At first glance, there seems to be nothing wrong this it, but this comment doesn't agree:

> BUG: This results in a null pointer dereference when `mapHeader->connections` is `NULL`, causing count to be assigned a garbage value. This garbage value just so happens to have the most significant bit set, so it is treated as negative and the loop below thankfully never executes in this scenario.

I never ran into this bug during testing because it has been fixed in [Pokémon Emerald](https://github.com/pret/pokeemerald/blob/64460e01aede2bbcaa8d1dd18dd3fab590fa4a6e/src/fieldmap.c#L114), and that's the game I usually use for quick testing (and pure nostalgia). The dereferenced null pointer returns something they call garbage, which is quite offensive to the poor BIOS in my opinion. Why the BIOS? Because it starts at address 0, and that's where a dereferenced null pointer reads from.

```none
00000000-00003FFF   BIOS - System ROM
00004000-01FFFFFF   Not used
02000000-0203FFFF   WRAM - On-board Work RAM
02040000-02FFFFFF   Not used
03000000-03007FFF   WRAM - On-chip Work RAM
03008000-03FFFFFF   Not used
04000000-040003FE   I/O Registers
04000400-04FFFFFF   Not used
```

The BIOS in the Game Boy Advance is read-protected to prevent dumping (guess how that turned out). It means that we can only read from the BIOS if the program counter is inside of it. Otherwise, it will return the last read value, which will be the one located at address

- 0x0DC+8 after startup
- 0x188+8 after SWI
- 0x134+8 during IRQ
- 0x13C+8 after IRQ

In the case of our dereferenced null pointer, we've just returned from a SWI. The code for this in the original BIOS looks like the following:

```armv4t
movs      pc, lr          ; addr: 00000188  data: E1B0F00E
mov       r12, 0x4000000  ; addr: 0000018C  data: E3A0C301
mov       r2, 0x4         ; addr: 00000190  data: E3A02004
```

It uses the instruction `movs pc, lr` to move the link register into the program counter. The link register contains the next instruction after a function call, so it pretty much acts like your typical `return`. Because of the GBAs two staged instruction pipeline, we've already fetched the value at address 0x190, and its value will be returned for future protected BIOS reads (like dereferenced null pointers). In this case, the value has its sign bit set and the loop is never executed.

```armv4t
movs      pc, lr                ; addr: 000000AC  data: E1B0F00E
andeq     r1, r0, r4, lsl 0x10  ; addr: 000000B0  data: 00001804
andeq     r1, r0, r4, lsr 0xA   ; addr: 000000B4  data: 00001524
```

Unfortunately, the replacement BIOS doesn't reproduce this behavior. Here we return with the same instruction, but the prefetched value now is positive and we run the loop 1524 times. I thought this was the source of the problem, but it wasn't. Until this point, the emulator did every correctly and the bug hunt ended with an anticlimactic result.

I fixed the bug when working on something completely different. Reads from unused memory regions return values based on prefetched values in the CPUs pipeline. There were some small issues in that code that were fixed in [this commit](https://github.com/jsmolka/eggvance/commit/213c7ab0a18502125b725536c433da3bf90d0b84). It seems that the game tries to access unused memory regions at some point when running the loop with the wrong loop counter and returning 'proper bad value' fixes the freezing behavior.

### Sprite Render Cycles
This [issue](https://github.com/jsmolka/eggvance/issues/2) was quite a simple fix compared to the previous one and has also been reported by fleroviux. The total available render cycles for sprites are 1210 if the H-Blank interval free bit in the display control register is set or 954 otherwise. This means that the amount of sprites per scanline is limited. If you ignore that limit you get something like in figure 3, where the sprite on top overlaps with the status bar.

{{<flex>}}
  {{<figure src="eggvance/gunstar-sprite-cycles-bug.png" caption="Figure 3: Gunstar Super Heroes without render cycles">}}
  {{<figure src="eggvance/gunstar-sprite-cycles.png" caption="Figure 4: Gunstar Super Heroes with render cycles">}}
{{</flex>}}

Calculating the number of cycles it takes to render a sprite is quite easy. It takes `width` cycles for normal and `2 * width + 10` cycles for sprites with affine transformations. Sprites with x-coordinates outside of the screen also affect this quota and programmers should be mindful to explicitly disable sprites instead of moving them outside the screen.

### Real-Time Clock
The next thing I want to talk about is an actual new feature in the emulator. If you own a third generation Pokémon game and start it, you will notice that it complains about a drained battery. Time based events will no longer work because its internal real-time clock ran dry.

{{<flex>}}
  {{<figure src="eggvance/emerald-bad-rtc.png" caption="Figure 5: Empty battery warning">}}
  {{<figure src="eggvance/emerald-bad-flash.png" caption="Figure 6: Ever saw that back then? (bonus)">}}
{{</flex>}}

Until now, eggvance perfectly emulated old Pokémon cartridges in the sense that both RTCs don't work (it's a feature). The RTC is connected to three of the four GamePak GPIO pins as follows:

- Serial Clock (SCK) at address 0x80000C4
- Serial Input/Output (SIO) at address 0x80000C5
- Clock Select (CS) at address 0x80000C6

A typical transfer looks like this:

- Set CS=0 and SCK=1
- Wait for a rising CS edge
- Receive command byte (described below)
- Send / receive command bytes
- Wait for a falling CS edge

Receiving a command byte looks like this:

- Wait for a rising SCK edge
- Read SIO bit
- Repeat until a byte has been transferred

Combining these two flows allows us to implement a functioning RTC. The documentation in GBATEK can be quite confusing in that regard because it first describes the NDS RTC and then the differences to GBA one. Once everything has been put into place, I was able to grow berries in the Pokémon Emerald.

{{<flex>}}
  {{<figure src="eggvance/emerald-berry-1.png" caption="Figure 7: Berry first stage">}}
  {{<figure src="eggvance/emerald-berry-2.png" caption="Figure 8: Berry last stage">}}
{{</flex>}}

I later stumbled across a NanoboyAdvance [issue](https://github.com/fleroviux/NanoboyAdvance/issues/136) reported by Robert Peip, which mentions that the RTC doesn't work in Sennen Kazoku. The game boots and then show an error screen mentioning 'broken clock equipment'. I tested it in my emulator and observed the same result.

{{<flex>}}
  {{<figure src="eggvance/sennen-rtc-bug.png" caption="Figure 9: Complaining about a bad RTC">}}
  {{<figure src="eggvance/sennen-rtc.png" caption="Figure 10: It works!">}}
{{</flex>}}

Debugging the game showed that Sennen Kazoku didn't set SCK high in step one of the transfer sequence. I removed the conditions and then everything worked as expected. Other games with RTCs continued to work with that change, so I kept it.

```diff-cpp
 switch (state) {
   case State::InitOne:
-    if (port.cs.low() && port.sck.high())
+    if (port.cs.low())
       setState(State::InitTwo);
     break;

   // ...
 }
```

### Accuracy Improvements
I mentioned three remaining things in the last release [release post]({{<relref "release-0.2.md">}}): RTC emulation, improved accuracy, and audio. With RTC off the list, there was only one thing left before I could start implementing audio. Even though eggvance is quite accurate, it has some problems in the timing section because [prefetch](https://mgba.io/2015/06/27/cycle-counting-prefetch/) isn't emulated.

Here are some of the things I implemented / changed:

- DMA bus
- Memory improvements
- Interrupt delay
- Timer delay
- Prefetch emulation (not perfect)

And the resulting [mGBA suite](https://github.com/mgba-emu/suite) coverage compared to other established emulators:

{{<table>}}
| Test           | eggvance 0.2 | eggvance 0.3 | mGBA 0.8.4 | higan v115 | Total |
|----------------|--------------|--------------|------------|------------|-------|
| Memory         | 1456         | 1552         | 1552       | 1552       | 1552  |
| I/O read       | 123          | 123          | 114        | 123        | 123   |
| Timing         | 404          | 1496         | 1520       | 1424       | 1660  |
| Timer count-up | 365          | 496          | 610        | 449        | 936   |
| Timer IRQ      | 28           | 65           | 70         | 36         | 90    |
| Shifter        | 140          | 140          | 132        | 132        | 140   |
| Carry          | 93           | 93           | 93         | 93         | 93    |
| Multiply long  | 52           | 52           | 52         | 52         | 72    |
| DMA            | 1048         | 1220         | 1232       | 1136       | 1256  |
| Edge case      | 1            | 2            | 6          | 1          | 10    |
{{</table>}}

I was happy to finally have something you could call relatively cycle accurate. But it came at a cost. Prefetch emulation tanked performance, going from 635 fps in the Pokémon Emerald home town down to mere 485 fps. I was shocked, but the issue turned out to be easier than expected. The MSVC optimizer just didn't inline the prefetch code.

That might not sound like a problem until you realize that we are on the hottest of paths out there. It gets called millions of times per second, so eliminating the function call overhead is very important. After force inlining it, I was back at 575 fps which is a nice value. My goal is to finish the emulator at something around 500 fps mark for demanding games (the ones that don't utilize the CPUs halt functionality, I am looking at you GameFreak devs).

### Sound?
I really love my writing efficiency. I began this progress report at the start of January, with all the previous topics lined out as bullet points. Then I continued working on my emulator, implemented the FIFO channel relatively quickly, and decided to add it. And then the squares channels. And then the wave channel. And then the noise channel. And now I'm here with a well working APU / DSP, but it never was supposed to be a part of this report.

{{<flex>}}
  {{<audio src="eggvance/tengoku.mp3" caption="Audio 1: Intro sequence of Rhythm Tengoku with some nice stereo">}}
{{</flex>}}

I'll write another one where I describe some of the sound basics and also give some examples. Most of the GBAs sound is composed of FIFO samples, so it's hard to show all audio channels in action and how they add up into a nice result.

### Conclusion
That's it. I'm done. The roadmap for this year is:

- ~~implement all sound channels~~
- optimize sound
- implement a scheduler
- improve [AGS](https://tcrf.net/AGS_Aging_Cartridge) coverage
- implement more features (better config, savestates, whatever)
- cleanup the code

Then I will put this project to rest and dive into something new. I thought about writing a classic GameBoy emulator, which shouldn't take more than a month because the GBA is a supercharged version of that, and most code could be reused. Another nice thing would be an NES emulator, which was my first console back in the day. I also thought about jumping into NDS emulation, but I'm not sure if I'm good enough for that, we'll see...
