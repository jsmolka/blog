---
title: "The Grind"
description: "Creating a programming language is fun."
tags: ["drizzle", "language", "programming"]
date: 2022-05-06
type: post
---
It has been two months since the last progress report, and the only thing I managed to implement were classes and bound methods. drizzle doesn't even support inheritance. Classes are just empty husks used to store data and methods.

```drizzle
class Vector:
  def init(x, y):
    this.x = x
    this.y = y
  def length():
    return (this.x ** 2 + this.y ** 2) ** 0.5

var vector = Vector(2, 4)
print(vector.x)  # 2
print(vector.y)  # 4

var length = vector.length
print(length())  # 4.47213595499958
```

I also bought a new road bike, and guess what: cycling up to 600 km a week keeps just enough energy in the tank to be somewhat productive at work and fall into bed at night. A few chapters were remaining in [Crafting Interpreters](http://www.craftinginterpreters.com/), but those were long, and every bit of tinkering felt like a grind. I managed to work through them in the days following an unfortunate [crash](https://www.strava.com/activities/7065053419). Rest in peace 700€ in equipment, and shoutout to my helmet!
