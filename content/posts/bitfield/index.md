---
title: "Bitfield"
description: "A bitfield macro made for emulation."
tags: ["spirit", "emulation"]
date: 2023-01-29
type: post
---
A lot of emulation comes down to bit manipulation. Consoles are nothing more than microcontrollers designed to be as efficient as possible without wasting precious memory. Memory-mapped I/O registers are the norm and control everything from the pixels you see on the screen to the samples that come out of the speakers. A typical data structure to deal with that kind of data is a bitfield, which Rust doesn't support [natively](https://github.com/rust-lang/rfcs/pull/3113).

I understand and support the design decision not to add them to the language. Rust is supposed to be memory-safe and bitfields tend to go hand in hand with [unions](https://doc.rust-lang.org/reference/items/unions.html), which are inherently `unsafe` creatures. Rust's macro system is also flexible enough to implement a fully functional bitfield yourself. Many [crates](https://immunant.com/blog/2020/01/bitfields/) have attempted to fill that gaping hole in the language, but until now, I wasn't able to find one that fits my needs:

- An elegant syntax
- Automatic masking of unused bits
- Accessors for individual bytes
- Pipes for the return value

The last feature is quite specific to emulation and not something you'd ever want to add to a generic bitfield implementation. So I sat down this weekend and wrote my own `bitfield!` [macro](https://github.com/jsmolka/sandbox-rs/blob/master/bitfield_macro/src/lib.rs). The documentation about procedural marcos is sparse, to say the least, unlike everything else in Rust, which tends to be documented very well.

```rust
bitfield! {
    struct Bitfield: u8 {
        lower_nibble: u8 @ 0..4,
        upper_nibble: u8 @ 4..8,
    }
}

let bitfield = Bitfield::new(0xAB);
assert_eq!(bitfield.lower_nibble(), 0xB);
assert_eq!(bitfield.upper_nibble(), 0xA);
```

The `bitfield!` macro takes a token stream with a format similar to that of an ordinary `struct` and defines getters and setters for each field, which require a range expression to indicate their size and position. Let's use the NES' PPUCTRL register as a real-world example:

```
7  bit  0
---- ----
VPHB SINN
|||| ||||
|||| ||++- Base nametable address
|||| ||    (0 = $2000; 1 = $2400; 2 = $2800; 3 = $2C00)
|||| |+--- VRAM address increment per CPU read/write of PPUDATA
|||| |     (0: add 1, going across; 1: add 32, going down)
|||| +---- Sprite pattern table address for 8x8 sprites
||||       (0: $0000; 1: $1000; ignored in 8x16 mode)
|||+------ Background pattern table address (0: $0000; 1: $1000)
||+------- Sprite size (0: 8x8 pixels; 1: 8x16 pixels – see PPU OAM#Byte 1)
|+-------- PPU master/slave select
|          (0: read backdrop from EXT pins; 1: output color on EXT pins)
+--------- Generate an NMI at the start of the
           vertical blanking interval (0: off; 1: on)
```

Which translates into this bitfield:

```rust
bitfield! {
    struct PPUCTRL: u8 {
        nametable: u8 @ 0..2,
        vram_increment: u8 @ 2..3,
        sprite_addr: u8 @ 3..4,
        bg_addr: u8 @ 4..5,
        sprite_height: u8 @ 5..6,
        master: bool @ 6..7,
        nmi: bool @ 7..8,
    }
}
```

The problem one might encounter when using it in an emulator is that the accessors return the bits instead of the mapped value. The `nametable` function returns a value between zero and three instead of the address associated with that value. It would be fine for bitfields in other applications, but in an emulator, the bit value rarely is what you want. That's why I added an optional pipe, which can be used to transform the returned value:

```rust
bitfield! {
    struct PPUCTRL: u8 {
        nametable: u8 @ 0..2 => |value| -> u16 {
            0x2000 + (value as u16) * 0x400
        },
    }
}
```

Now `nametable` returns the address associated with the bit value and there is no need to add yet another getter to the `struct`. I will use the `bitfield!` macro throughout my NES emulator and see how it works out!
