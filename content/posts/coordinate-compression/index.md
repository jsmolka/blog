---
title: "Coordinate Compression"
tags: ["poi", "cycling", "programming"]
date: 2026-10-30T07:35:47+01:00
type: post
---
```
[out:json][timeout:3600];
area["ISO3166-1"="DE"][admin_level=2];
way["highway"]["surface"~"^(gravel|fine_gravel|compacted|pebblestone)$"](area);
out geom;
```

> Cannot create a string longer than `0x1fffffe8` characters

- ![](img/simplify-0.0.png "Tolerance 0")
- ![](img/simplify-0.5.png "Tolerance 0.5")
{.fluent}

- ![](img/simplify-1.0.png "Tolerance 1")
- ![](img/simplify-2.0.png "Tolerance 2")
{.fluent}
