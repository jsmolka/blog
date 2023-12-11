---
title: "Progress Report #3"
tags: ["eggvance", "emulation", "programming"]
date: 2019-11-03
type: post
---
This month in your favorite emulator: a complete rewrite. That's what happens when you aren't satisfied with your project and have a whole month of spare time at your disposal. Some parts have been reused, but almost every area has been improved to some extent, accuracy and performance-wise.

## Optimizing Instruction Execution
The GBA's processor can execute either 16-bit Thumb or 32-bit ARM instructions. Each instruction has a different number of fixed and variable bits. Fixed bits provide information about the used format, while variable bits are used to encode parameters like registers, register lists, flags and immediate values. As a result of having 16 additional bits, ARM instructions tend to be much more complex.

<table>
  <thead>
    <th colspan="10">Pattern</th>
    <th>Instruction</th>
  </thead>
  <tbody style="text-align: center">
    <tr>
      <td>1</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td style="text-align: left" colspan="2">Offset</td>
      <td style="text-align: left">Add offset to stack pointer</td>
    </tr>
    <tr>
      <td>1</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>L</td>
      <td>1</td>
      <td>0</td>
      <td>R</td>
      <td style="text-align: left" colspan="2">Rlist</td>
      <td style="text-align: left">Push/pop registers</td>
    </tr>
    <tr>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>L</td>
      <td style="text-align: left" colspan="3">Rb</td>
      <td style="text-align: left" colspan="2">Rlist</td>
      <td style="text-align: left">Multiple load/store</td>
    </tr>
    <tr>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>1</td>
      <td style="text-align: left" colspan="4">Condition</td>
      <td style="text-align: left" colspan="2">Offset</td>
      <td style="text-align: left">Conditional branch</td>
    </tr>
  </tbody>
</table>

The table above shows a small subset of the 19 possible Thumb instructions. When looking at them as a whole, you will notice that they can be decoded by using the most significant eight bits. In the previous version of the emulator, decoding and executing an instruction were two separate steps. First, a static array of enumerations was used to identify the instruction format, and then a switch case executed the matching instruction handler.

```cpp
enum class ThumbFormat {
  MoveShiftedRegister,
  // ...
};

static ThumbFormat lut[256] = {
  // ...
};

void ARM::executeThumb(u16 instr) {
  switch (lut[instr >> 8]) {
    case ThumbFormat::MoveShiftedRegister:
      Thumb_MoveShiftedRegister(instr);
      break;
    // ...
  }
}
```

This approach can be optimized by storing template function pointers inside the array. Flags, registers and immediate values that occur inside the ten, extended from eight, most significant bits can be passed as template parameters and are therefore optimized by the compiler. Doing this also eliminates the necessity to extract these values later in the instruction handler.

```cpp
std::array<void(ARM::*)(u16), 1024> ARM::instr_thumb = {
  &ARM::Thumb_MoveShiftedRegister<0, 0>,
  &ARM::Thumb_MoveShiftedRegister<1, 0>,
  &ARM::Thumb_MoveShiftedRegister<2, 0>,
  // ...
}

void ARM::executeThumb(u16 instr) {
  (this->*instr_thumb[instr >> 6])(instr);
}
```

## Initializing Unused Registers
At some point in development, the emulator was able to boot every tested game apart from the Sonic Advance series. Resolving issues like this usually involves running my emulator against established ones like No$GBA. After two hours of comparing, I ended up noticing that a different value of the RCNT register, which is used for multiplayer functionality, caused a chain of events that led to gray bars on the screen instead of the intro and soft-locked the game.

- ![](img/sonic-rcnt-bug.png "Uninitialized RCNT")
- ![](img/sonic-rcnt.png "Initalized RCNT")
{.fluent}

This problem was caused by skipping the BIOS and directly jumping inside the ROM. Apart from showing the animated intro sequence, the BIOS also initializes registers like RCNT and DISPCNT to their default value. I knew about this and properly initialized all implemented registers to their post-BIOS state, but RCNT is not, and probably never will be, used in my emulator and was, therefore, left untouched. Doing a test run with the BIOS could've saved me a couple of hours but, that's something I usually don't do during development.

## Fixing Arithmetic Operations
Running mGBA's [test suite](https://github.com/mgba-emu/suite) made me realize flaws in my carry/overflow detection mechanism for arithmetic operations, which caused sprite flickering bugs in games like Mario Kart.

- ![](img/kart-flickering-1.png "Mario Kart sprites invisible")
- ![](img/kart-flickering-2.png "Mario Kart sprites visible")
{.fluent}

The basic add, subtract and reverse subtract operations were doing fine, but their "[operation] with carry" counterparts resulted in a wrong carry and/or overflow flag. I found a nice [website](https://teaching.idallen.com/dat2343/10f/notes/040_overflow.txt) that explains overflow detection for basic addition and subtraction.

```cpp
bool carryAdd(u64 op1, u64 op2) {
  return (op1 + op2) > 0xFFFF'FFFF;
}
```

The function above can be used to check if the addition of two operands results in a carry. Please note that the arguments are 64-bit instead of 32-bit integers to prevent overflow during addition or while creating the operand itself. An example of its usage can be seen in the `add` function.

```cpp
u32 ARM::add(u32 op1, u32 op2, bool flags) {
  u32 res = op1 + op2;

  if (flags) {
    cpsr.z = zero(res);
    cpsr.n = sign(res);
    cpsr.c = carryAdd(op1, op2);
    cpsr.v = overflowAdd(op1, op2, res);
  }
  return res;
}
```

The old version of "add with carry" simply added the carry flag of the status register to the second operand and then called the `add` function.

```cpp
u32 ARM::adc(u32 op1, u32 op2, bool flags) {
  return add(op1, op2 + cpsr.c, flags);
}
```

This worked as expected and didn't produce any major bugs in the tested games. At least that's what I've thought. Imagine passing the maximum 32-bit value to the function and then adding the carry. The value overflows and the flags are calculated with the wrong operands. The result itself will be correct because we just care about the lower 32 bits anyway.

```cpp
u32 ARM::adc(u32 op1, u32 op2, bool flags) {
  u64 opc = static_cast<u64>(op2) + cpsr.c;
  u32 res = static_cast<u32>(op1 + opc);

  if (flags) {
    cpsr.z = zero(res);
    cpsr.n = sign(res);
    cpsr.c = carryAdd(op1, opc);
    cpsr.v = overflowAdd(op1, op2, res);
  }
  return res;
}
```

Using a 64-bit integer to store the second operand with added carry was the first improvement over the standard `add` function. Sadly this didn't fix all the problems. Comparing my results to the expected results of the mGBA test suite made me realize that the carry flag is only taken into consideration for carry detection and is completely ignored for overflow detection. The code above shows my final `adc` function. Note the usage of `opc`.

- ![](img/mgba-carry-fail.png "Carry tests fail")
- ![](img/mgba-carry-pass.png "Carry tests pass")
{.fluent}

## Config
One thing I wanted to have in the first release version was a customizable config. In terms of format, I decided to go with [TOML](https://github.com/toml-lang/toml) because I like its general structure and clarity. The config allows the user to freely configure keyboard and controller mappings for general input and shortcuts like fullscreen and different emulation speeds. A snippet of the general options is shown below, and the full version can be found on [GitHub](https://github.com/jsmolka/eggvance/blob/f2a1e0311e5467b3b91fa69b6ab4a7ddc292f525/eggvance/eggvance.toml).

```toml
[general]
# Relative or absolute BIOS file.
bios_file = "bios.bin"
# Skips the BIOS intro.
bios_skip = false
# Relative or absolute save directory. An empty
# value stores save files next to the ROM.
save_dir = ""
# Controller deadzone.
deadzone = 16000
```

## Final Words
That's all for this progress report. A Windows build of the latest version can be found on [GitHub](https://github.com/jsmolka/eggvance/releases). I used profile-guided optimization to squeeze out the last drop of performance. Most games can be played at 10x the normal speed. Of course, the current version is not perfect and bug-free, audio is still missing, and there are crashes and visual bugs in a few games like DOOM II.

- ![](img/doom-black-floor.png "DOOM II black floor")
- ![](img/doom-rainbow-floor.png "DOOM II rainbow floor")
{.fluent}
