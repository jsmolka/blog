---
title: "Signs of Life"
description: "It looks and quacks like a programming language."
tags: ["drizzle", "language", "programming"]
date: 2021-10-09
type: post
---
I made some good progress with drizzle. It's now smart enough to understand expressions, statements, and control flow. It's barebones but functional. The lack of shorthand operators results in more typing than necessary, but that's something I'll fix in the future.

```drizzle
# Print even numbers
var x = 0
while x <= 10:
  if x % 2 == 0:
    print x
  x = x + 1
```

Each level of indentation increases the scope depth. Variables with different depths can shadow each other. In addition to the commonly known control flow constructs, drizzle also supports `block` statements, which "just" increase the scope depth.

```drizzle
# Shadowing
var x = 0
block:
  var x = x
  x = 1
  print x  # 1
print x  # 0
```

Blocks can also be labeled to break out of nested loops.

```drizzle
# Labeled blocks
block label:
  while true:
    while true:
      break label
```

Implementing the many binary operations in a clean, efficient, and extensible way was quite the challenge. Internally, the `binary` function pops the right operand off the stack and takes a reference to the left operand, which will also be used as the destination. It then "hashes" the value types and uses a jump table to call an optimized handler.

```cpp
void Vm::power() {
  binary("**", [](DzValue& dst, auto a, auto b) {
    using A = decltype(a);
    using B = decltype(b);

    if constexpr (is_dz_int_v<A, B> || is_dz_float_v<A, B>) {
      dst = std::pow(a, b);
      return true;
    }
    return false;
  });
}
```

The `binary` function also takes care of implicit type promotions. Inside the handler, we need to check which type the operands have and act accordingly. If the handler returns `false`, the operation doesn't support the operand types, and the VM throws a type error.

```
Line 1 | "test" ** 2

TypeError: bad operand types for '**': 'string' and 'int'
```

Nothing more to see here. Next up are functions, classes, garbage collection, and some proper tests/documentation of the current state.
