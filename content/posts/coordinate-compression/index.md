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

This innocent looking query forced Node.js into its knees. "Cannot create a string longer than `0x1fffffe8` characters" it whispered with its dying breath. It couldn't handle the incoming wave a
