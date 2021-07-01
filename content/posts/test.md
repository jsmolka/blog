---
title: "Test"
summary: "This is a test site."
tags: ["testing", "those", "dimmed", "tags"]
date: 2021-06-24
type: post
draft: true
---
Lorem ipsum [^1] dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum [^2] dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.

| Version      | Pokémon Emerald | Yoshi's Island | Mother 3   |
|:-------------|:----------------|:---------------|:-----------|
| eggvance 0.1 | 575.7 fps       | 513.1 fps      | 639.4 fps  |
| eggvance 0.2 | 619.5 fps       | 538.5 fps      | 1033.9 fps |
| eggvance 0.3 | 589.7 fps       | 508.9 fps      | 813.2 fps  |
| eggvance 1.0 | 550.4 fps       | 501.6 fps      | 866.6 fps  |

> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
>
> &mdash; Me

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier.mp3" caption="Audio 3: Pokémon Emerald battle frontier theme all channels">}}
{{</flex>}}

{{<flex>}}
  {{<figure src="eggvance/suite-passed.png" caption="Figure 1: Test suite passed">}}
  {{<figure src="eggvance/suite-failed.png" caption="Figure 2: Test suite failed">}}
{{</flex>}}

```c
static void InitBackupMapLayoutConnections(struct MapHeader *mapHeader) {
  int count = mapHeader->connections->count;
  struct MapConnection *connection = mapHeader->connections->connections;
  int i;

  gMapConnectionFlags = sDummyConnectionFlags;
  for (i = 0; i < count; i++, connection++) {
    // Handle
  }
}
```

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed `diam nonumy` eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

This is an ordered list with:
1. item 1
2. and item 2
3. and item 3
4. and item 4

This is an unordered list with:
- item 1
- and item 2
- and item 3
- and item 4

### Notes
[^1]: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.

[^2]: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.