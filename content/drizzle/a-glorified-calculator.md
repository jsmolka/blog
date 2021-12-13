---
title: "A Glorified Calculator"
summary: "The worlds most complicated calculator."
tags: ["drizzle", "language", "programming"]
date: 2021-09-20
type: post
---
Creating a programming language has been on my mind for a while, and the paperback release of [Crafting Interpreters](http://www.craftinginterpreters.com/), as well as the 1.1 release of eggvance, finally gave me the time and motivation to start working on it. I didn't know much about grammar or parsing back then, but I know at least something now.

drizzle is a dynamic interpreted programming language, and its C++ implementation uses a bytecode virtual machine to execute the code as fast as possible. I was surprised to see that this is essentially just another emulator with a custom CISC instruction set. That means I can at least use some of the knowledge acquired from my previous endeavor.

In its current state, drizzle is nothing more than a glorified calculator and supports the following operators:

{{<table>}}
| Precedence | Operator                                  | Description                                                            |
|------------|-------------------------------------------|------------------------------------------------------------------------|
| 1          | `-`&ensp;`~`                              | Unary minus and bitwise complement                                     |
| 2          | `*`&ensp;`/`&ensp;`%`&ensp;`//`&ensp;`**` | Multiplication, division, modulo division, integer division, and power |
| 3          | `+`&ensp;`-`                              | Addition and subtraction                                               |
| 4          | `<<`&ensp;`>>`&ensp;`>>>`                 | Logical shift left, arithmetic shift right and logical shift right     |
| 5          | `<`&ensp;`<=`&ensp;`>`&ensp;`>=`          | Relational operators                                                   |
| 6          | `==`&ensp;`!=`                            | Equality operators                                                     |
| 7          | `&`                                       | Bitwise and                                                            |
| 8          | `^`                                       | Bitwise exclusive or                                                   |
| 9          | `\|`                                      | Bitwise exclusive or                                                   |
| 10         | `&&`                                      | Logical and                                                            |
| 11         | `\|\|`                                    | Logical or                                                             |
{{</table>}}

Arithmetic operations accept the three primitive data types:
{{<table>}}
| Rank | Type  | Representation    |
|------|-------|-------------------|
| 1    | bool  | bool              |
| 2    | int   | 64-bit signed int |
| 3    | float | 64-bit float      |
{{</table>}}

Operands in mixed operations are promoted to the highest ranked operand type to prevent loss of information. That means adding a float to an int results in a float. An exception to this rule is division, where the result will always be a float. Bitwise operations work similar to arithmetic ones but don't accept float values.

```error
Line 1 | 255 >> 0xZ
                  ^
SyntaxError: expected hex digit
```

I tried to make errors as informative as possible. Syntax errors can be reported with their exact location because I'm either scanning or compiling tokens at that time. Runtime errors like the one above happen during bytecode execution, and the best I can do is show the line number where the error occurred.

```error
Line 1 | 1 >> 0.1

TypeError: bad operand types for '>>': 'int' and 'float'
```

That's about it. There is still a lot of coding and documenting ahead of me. Next, I will implement statements and with that assignment, printing, and assertions for automatic testing, which is currently limited to the scanner.