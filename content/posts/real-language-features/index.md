---
title: "Real Language Features"
description: "Late binding, collections and iterators."
tags: ["drizzle"]
date: 2022-06-04
type: post
---
Following some weeks of pause and slow progress, I finally found the motivation to work on the remaining language features required to implement a Game Boy emulator in my own programming language.

## Late Binding
A limitation of drizzle 0.2 was the lack of late binding. Take the following code as an example:

```drizzle
def a():
  b()
def b():
  noop
```

Running it resulted in a syntax error because the compiler was unable to resolve `b`.

```
Line 2 |   b()
           ^
SyntaxError: undefined variable 'b'
```

Local variables are resolved at compile-time and are therefore fast at runtime. The compiler emits `Opcode::Load` and `Opcode::Store` instructions with an index, which then manipulate the stack directly. If a variable cannot be resolved, the compiler must throw an error to prevent undefined behavior.

Now, instead of throwing, each unresolved variable is assumed to be a global one and gets its own slot in the VMs `globals` vector. Globals with the same name refer to the same slot. That way, they are almost as fast as local variables. We just need to make sure that we don't allow accessing variables that are still in an undefined state.

```cpp
template<typename Integral>
void Vm::loadGlobal() {
  const auto  index = read<Integral>();
  const auto& value = globals[index];
  if (value.isUndefined()) {
    // Throw
  }
  stack.push(value);
}
```

## Collections
Lists and maps are vital parts of a programming language and drizzle wouldn't be complete without them. Parsing the values of a list and the key-value pairs of a map was a little annoying due to drizzle being whitespace aware [^1]. Each indent, dedent and new line must be taken care of or the parser throws a syntax error.

[^1]: If I were to design another language, I definitely wouldn't do whitespace awareness again. It makes many things complicated or outright impossible:

    - What counts as an indentation?
    - Can we mix spaces and tabs? If so, how many spaces are one tab?
    - How do we define anonymous functions with multiple lines?
    - How do we define a classic `for` loop with initializer, condition and expression?
    - How do we parse list/map expressions with multiple lines?

    Just use braces and ignore whitespace. It makes life much easier.

```drizzle
var list = [0, 1, 2]
list.push(3)
list.pop()

var map = {}
map.set("key", "value")
map.get("key")
```

Apart from the usual things you'd expect, drizzle also offers some quality of life features:

```drizzle
# Negative subscript
var list = [0, 1, 2]
assert(list[-1] == 2)

# Type independent hashing
var map = {1: 0}
assert(map.get(1) == 0)
assert(map.get(true) == 0)
assert(map.get(1.0) == 0)
```

## Iterators
Until now, the `while` statement was the only possibility to loop in drizzle. It was sufficient because all loops can be remodeled into `while` loops. I didn't implement the classic `for` loop with initializer, condition and expression because it doesn't play nice with whitespace awareness. After the introduction of collections, it made sense to implement iterators and the `for .. in` loop known from other languages.

```drizzle
var l = [0, 1, 2]
var i = forward(l)  # Create forward iterator
var r = reverse(l)  # Create reverse iterator

# Automatic `forward` is this context
for x in l:
  print(x)
```

Other features related to iterators are Pythons `range` function and Rusts `..` expression.

```drizzle
for i in 0 .. 10:
  print(i)

assert(range(0, 10, 1) == (0 .. 10))
```

Unfortunately, iterators in drizzle are not zero cost like in compiled languages. Using the `..` expression first allocates a `Range` and then a `RangeIterator` object. The worst-case in that regard is iterating a string. There are no single characters in drizzle which means that every character is represented as an immutable string which is allocated in each iteration.

```drizzle
for c in "slow":
  print(c)
```

## Outlook
Now I will start working on the Game Boy emulator. I will write a prototype in C++ and then translate it to drizzle. Because of the lack of a proper foreign function interface, I will add SDL-related classes to drizzle and make it possible to enable them with a compiler switch. I also have the feeling that there are some hard-to-find bugs left in the code that will make me suffer.
