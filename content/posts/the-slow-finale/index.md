---
title: "The Slow Finale"
tags: ["sprite", "emulation", "programming"]
date: 2022-10-08
type: post
---
Hello ladies and gentlemen! Please take a seat and enjoy the finale of the series nobody asked for: yet another Game Boy emulator. Over the course of the [last few episodes](https://github.com/jsmolka/sprite/compare/0.3...0.4), we managed to implement a stunning three of eight relevant memory banking controllers. That allowed us to load ROMs with a size of up to two megabytes and increased our catalog of potential commercial games to more than two. Technology is truly incredible!

- ![](img/technology.png "Technology is incredible guy")
- ![](img/super-mario-land.png "Super Mario Land stage three boss")
{.fluent}

But of what use is potential if you don't act upon it? All the graphics and game logic are stored in the additional memory, and we just draw boring background tiles with some scrolling sprinkled in. But then two more actors enter the stage: sprites and windows. Suddenly, the whole thing becomes more lively and resembles something you saw in your childhood.

- ![](img/zelda-intro.png "Zelda intro sequence")
- ![](img/zelda-bow-wow.png "[Madam MeowMeow's](https://zelda.fandom.com/wiki/Madam_MeowMeow) [BowWow](https://zelda.fandom.com/wiki/BowWow)")
{.fluent}

- ![](img/zelda-shield.png "Link receives his shield")
- ![](img/zelda-sword.png "Not the Master Sword")
{.fluent}

Seeing this gets you all hyped up. You jump right into the game, and then the slow slideshow starts. What? The emulator doesn't even manage to run a 30-year-old game at full speed? Sorry to disappoint you. It reaches about 45% speed of the console. I could increase that to 65% by using free functions and variables instead of a class, but that doesn't seem worth it at this point. I may put more time into the language and the emulator to achieve the magic 100%, but for now, this is the finale. Stay tuned for the sequel.
