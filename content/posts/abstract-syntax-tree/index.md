---
title: "Abstract Syntax Tree"
description: "The root of tree obsession in programming."
tags: ["drizzle"]
date: 2022-01-08
type: post
---
drizzle started with a single-pass compiler. It took a stream of tokens and converted them into bytecode. There was no intermediate representation and to be honest: there was no need for it. A single-pass compiler is sufficient for a programming language. Just take a look at [Lua](https://www.lua.org/): it's small, simple and has fast startup times.

But this is a hobby project and I wanted to explore the mystical abstract syntax tree. I was a little surprised to find no code examples. I get the idea behind it, but there seems to be no universal way of doing it. The design I ended up with uses a tagged union:

```cpp
class Expression;

using Expr = std::unique_ptr<Expression>;

class Expression {
public:
  enum class Type {
    Group,
  };

  struct Group {
    Expr expression;
  };

  Type type;
  union {
    Group group;
  };
};
```

I did the same for statements. The `program` statement is the root of the tree. It contains other statements, which might be expressions, loops or control flow constructs. With the IR in place, I was also able to split the parser and compiler into two entities. The parser spits out an AST and the compiler uses it to produce bytecode. Take the following program as an example:

```drizzle
var x = 0
while x < 100:
  if x % 2 == 0:
    print x
  x = x + 1
```

Running `drizzle --ast file.dz` prints the tree:

```
program
  var x
    literal 0
  while
    binary <
      variable x
      literal 100
    if
      binary ==
        binary %
          variable x
          literal 2
        literal 0
      print
        variable x
    expression_statement
      assign x
        binary +
          variable x
          literal 1
```

I think it turned out pretty readable. Having this was a lifesaver for testing. I could throw anything at the parser and check if the produced AST matched my expectation. It will also be useful for compile-time optimizations. If we encounter a `binary` expression with two `literal` expressions as operands, we can fold them and emit a simplified `literal` expression.
