---
title: "Interpreterception"
description: "Feels like I have done this before."
tags: ["sprite", "emulation", "programming"]
date: 2022-07-09
type: post
---
The next project in the pipeline is a Game Boy emulator written in my own programming language. An interpreter within an interpreter and a stress test for the virtual machine and its functionality. It also opens the door for future optimizations because those are quite hard to do without a sizable program to test them on.

The heart of a console is its CPU. I decided to write a reference implementation in C++ and then translate it to drizzle on each milestone. That way, I can debug it without using the good old `print` method and know whether the reason it's not working is a mistake in the emulator or the drizzle machinery.

Getting it up and running was a tedious task. Emulating a complex instruction set processor lends itself to packing all opcodes into a giant `switch` statement and calling it a day. And that's why I ended up with [256 cases](https://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html) of pure fun. Looking back at the GBAs [ARM7](https://github.com/jsmolka/eggvance/blob/master/eggvance/src/arm/instr_arm.cpp), the code was more elegant, but drizzle imposes some restrictions in terms of performance and features.

```drizzle
class GameBoy:
  def inc(value):
    value = (value + 1) & 0xFF
    this.set_f(value == 0, 0, (value & 0x0F) == 0x00, null)
    return value

  def and(other):
    this.a = this.a & other
    this.set_f(this.a == 0, 0, 1, 0)

  def xor(other):
    this.a = this.a ^ other
    this.set_f(this.a == 0, 0, 0, 0)

  def step_cpu():
    var opcode = this.read_byte_pc()
    switch opcode:
      case 0x04:  # INC B
        this.b = this.inc(this.b)
      case 0x41:  # LD B, C
        this.b = this.c
      case 0xA0:  # AND A, B
        this.and(this.b)
      case 0xA8:  # XOR A, B
        this.xor(this.b)
```

I tested it with the infamous [blargg test ROMs](https://github.com/retrio/gb-test-roms), and it appears to work! The second test fails because I haven't implemented interrupts, but those are next in line.

```
01 - special              Passed
02 - interrupts EI        Failed #2
03 - op sp,hl             Passed
04 - op r,imm             Passed
05 - op rp                Passed
06 - ld r,r               Passed
07 - jr,jp,call,ret,rst   Passed
08 - misc instrs          Passed
09 - op r,r               Passed
10 - bit ops              Passed
11 - op a,(hl)            Passed
```
