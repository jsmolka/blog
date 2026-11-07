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
out skel geom qt;
```

> Cannot create a string longer than `0x1fffffe8` characters
>
> <cite>Node.js</cite>

## Simplify
<!-- https://poi.smolka.dev/#19.98/51.2961833/12.3971305 -->
- ![](img/simplify-0.0.png "Tolerance 0")
- ![](img/simplify-0.5.png "Tolerance 0.5")
{.fluent}

- ![](img/simplify-1.0.png "Tolerance 1")
- ![](img/simplify-2.0.png "Tolerance 2")
{.fluent}

## Precision
```js
const PRECISION = 5;
const SCALE = 10 ** PRECISION;

function precision(polyline) {
  return polyline.map((coordinates) =>
    coordinates.map((coordinate) => Math.round(coordinate * SCALE)),
  );
}
```

## Offset
```js
const previous = [0, 0];

function offset(polyline) {
  return polyline.map((coordinates) =>
    coordinates.map((coordinate, index) => {
      const offset = coordinate - previous[index];
      previous[index] = coordinate;
      return offset;
    }),
  );
}
```

## Zigzag
```js
function zigzag(polyline) {
  return polyline.map((coordinates) =>
    coordinates.map((coordinate) => (
      coordinate >= 0 ? coordinate * 2 : -coordinate * 2 - 1
    )),
  );
}
```

## Encode
```js
function writeVarint(out, value) {
  while (value > 0x7f) {
    out.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  out.push(value);
}
```

## Conclusion
| Step      | Description                                | Size [KB] |
| --------- | ------------------------------------------ | --------: |
| Raw       | Raw data returned by the Overpass query    |   614,312 |
| Geometry  | Remove all but geometric data              |   239,784 |
| Simplify  | Simplify polylines with a tolerance of 0.5 |   196,512 |
| Precision | Round coordinates to 5 decimal places      |   148,189 |
| Offset    | Store offset to previous coordinates       |    73,864 |
| Zigzag    | Convert negative to positive numbers       |    70,296 |
| Encode    | Encode in a binary format using varints    |    20,783 |
| Compress  | Compress with deflate                      |    17,994 |
{.tabular-nums}
