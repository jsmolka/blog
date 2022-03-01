---
title: "Functions"
description: "Maximum recursion depth exceeded."
tags: ["drizzle", "language", "programming"]
date: 2022-03-01
type: post
---
drizzle now supports functions and starts to look like a proper programming language. Its syntax is similar to an unknown [snake-like language](https://www.python.org/) used in niche fields like machine learning. Keeping in line with that theme, here is how a function is defined:

```drizzle
def sum(a, b):
  return a + b
```

Simple, I know. But I still made some mistakes along the way. Consider this example:

```drizzle
def outer():
  def inner():
    noop
  return inner

outer()()
```

Here we first call the `outer` and then the returned `inner` function. The parser produces a `Call` expression, and the compiler then turns it into opcodes that push callee and arguments onto the stack.

```diff-cpp
 struct Call {
-  Identifier callee;
+  Expr callee;
   Exprs arguments;
 };
```

The initial implementation expected an identifier for the callee. That worked for simple cases, but using an expression is the correct to do it. The syntax tree reflects that change and properly displays chained function calls.

```code
program
  def outer
    def inner
      noop
    return
      variable inner
  expression_statement
    call
      call
        variable outer
```

## Closures
Programming languages with first-class functions support [closures](https://en.wikipedia.org/wiki/Closure_(computer_programming)). They are used to bind the surrounding lexical scope and make sure that referenced variables have the same lifetime as the function using them.

```drizzle
def make_counter():
  var i = 0
  def counter():
    i = i + 1
    return i
  return counter

var counter = make_counter()
counter()  # Returns 1
counter()  # Returns 2
```

The example would work if closures were implemented, but drizzle throws an error:

```code
Line 4 |     i = i + 1
                 ^
SyntaxError: cannot capture local variable
```

<!-- Hard in a stack-like languages because captured variables don't have stack behavior -->

Closures add quite some complexity to the code that I am not willing to introduce, and to be honest: I do not need them. I tried some magic tricks to achieve a minimalistic version, but all of them fell apart when it came to recursion. The best I could do were absolute stack offsets to access global variables.
