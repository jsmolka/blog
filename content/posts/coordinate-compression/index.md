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
out skel geom;
```
Return all gravel roads [^gravel] in Germany and their geometry. This innocent looking [Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API) query forced Node.js to its knees. _"Cannot create a string longer than `0x1fffffe8` characters"_, it whispered with its dying breath. Limited to an internal string length of 512 MB, it was not prepared to deal with vast amounts of data flooding in.

[^gravel]: I hereby use the power granted to me by myself to define what is gravel and what is not. Something the gravel community still struggles with.

I had to switch the response type to `stream` and use the [stream-json](https://github.com/uhop/stream-json) library to parse it. The result measured 614 MB, even though it only contained the basic structural `skel` and geometric `geom` data. I stripped it down even further to just the polylines and their coordinates. 239 MB and 1,032,029 polylines with an average length of 10.15 coordinates to be exact.


```js
[
  // [longitude, latitude]
  [9.5720777, 51.8684697],
  [9.5713593, 51.8682805],
  [9.5709083, 51.8681333],
  [9.5705485, 51.8679984],
  [9.5703925, 51.8679399]
]
```

614,312 KB -> 239,784 KB

## Simplify
The first two rounds of compression are lossy. The polylines contain more detail than we need, so we drop as many coordinates as possible. There are [a couple algorithms](https://dulldrums.github.io/polygon-reduction-algorithms-demo/) to choose from and one of them is [Douglas--Peucker](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm). It recursively  divides a polyline into segments by including the most distant point from the current segment until all points are either included or within a given tolerance.

Here are some examples of different tolerances applied to the same [polyline](https://poi.smolka.dev/#19.98/51.2961833/12.3971305):

- ![](img/simplify-0.0.png "Full detail")
- ![](img/simplify-0.5.png "Tolerance of 0.5 meters")
{.fluent}

- ![](img/simplify-1.0.png "Tolerance of 1 meter")
- ![](img/simplify-2.0.png "Tolerance of 2 meters")
{.fluent}

I chose a tolerance of 0.5 meters because it still looks smooth and close to the original compared to the other ones. Using it decreased the average polyline length by around 20% to 8.3 coordinates.

```js
[
  [9.5720777, 51.8684697],
  [9.5713593, 51.8682805],
  [9.5709083, 51.8681333],
  // Removed [9.5705485, 51.8679984]
  [9.5703925, 51.8679399]
]
```

239,784 KB -> 196,512 KB

## Precision
The second lossy compression step concerns the [coordinate precision](https://wiki.openstreetmap.org/wiki/Precision_of_coordinates). More decimal places mean more precision, but also more data. The following applies to latitudes:

| DD.dddddd° | Decimal places | DD°MM'SS.ssss" | Meters   |
| ---------- | -------------- | -------------- | -------- |
| 1°         | 0              | 1°             | 111,120  |
| 0.1°       | 1              | 0°06'          | 11,112   |
| 0.01°      | 2              | 0°00'36"       | 1,111.2  |
| 0.001°     | 3              | 0°00'03.6"     | 111.12   |
| 0.0001°    | 4              | 0°00'00.36"    | 11.112   |
| 0.00001°   | 5              | 0°00'00.04"    | 1.1112   |
| 0.000001°  | 6              | 0°00'00.004"   | 0.11112  |
| 0.0000001° | 7              | 0°00'00.0004"  | 0.011112 |
{.tabular-nums}

Longitudes have the same precision at the equator and get more accurate closer to the poles.

```js
function precision(coordinate) {
  return Math.round(coordinate * 1e5);
}
```

The obvious choice here is five decimal places, because it is neither too coarse nor too fine.

```js
[
  [957208, 5186847], // [round(9.5720777 * 1e5), round(51.8684697 * 1e5)]
  [957136, 5186828], // [round(9.5713593 * 1e5), round(51.8682805 * 1e5)]
  [957091, 5186813], // [round(9.5709083 * 1e5), round(51.8681333 * 1e5)]
  [957039, 5186794]  // [round(9.5703925 * 1e5), round(51.8679399 * 1e5)]
]
```

196,512 KB -> 148,188 KB

## Offset
Now come the lossless compression steps. Coordinates in polylines are usually within close proximity, so it makes sense to store their offset instead of the full coordinate.

```js
const previous = [0, 0];

function offset(coordinates) {
  return coordinates.map((coordinate, index) => {
    const offset = coordinate - previous[index];
    previous[index] = coordinate;
    return offset;
  });
}
```
The offset is calculated across polylines boundaries, so the offset of a polyline's first coordinates is calculated by using the previous polyline's last coordinate. That means the actual order of polylines is important too. There are four options to do that:

1. Random
2. Sort query output by quad tile `out qt;`
3. Sort polylines by nearest neighbor
4. Sort polylines optimally

Option four is impossible for our data size, because it resembles the infamous [traveling salesman problem](https://en.wikipedia.org/wiki/Travelling_salesman_problem) and it thus NP-hard. The second best option, sorting by nearest neighbors, yields a [minor compression improvement](https://github.com/jsmolka/poi/commit/1ffb6adfa8fea924f4425c73d0883f76834c2a26) compared to the others.

```js
[
  [240, 356], // [957208 - 957448, 5186847 - 5187203]
  [-72, -19], // [957136 - 957208, 5186828 - 5186847]
  [-45, -15], // [957091 - 957136, 5186813 - 5186828]
  [-52, -19]  // [957039 - 957091, 5186794 - 5186813]
]
```

148,188 KB -> 72,932 KB

## Zigzag
This step acts as preparation for the next one. We need to convert signed to unsigned integers while preserving a one-to-one mapping. To achieve that, we use the zigzag algorithm. If the offset is positive we zig `offset * 2 `, otherwise we zag `offset * 2 - 1`.

```js
function zigzag(offset) {
  return offset >= 0
    ? +offset * 2
    : -offset * 2 - 1;
}
```

To keep the mapped numbers as small as possible, one could also think about using a [Huffman table](https://en.wikipedia.org/wiki/Huffman_coding) for encoding. Fortunately, small offsets are the most frequent by nature, so there is no reason to make to code more complicated.

![](img/offset-distribution.png "Offset distribution excluding zero")

```js
[
  [480, 712], // [240 * 2, 356 * 2]
  [143,  37], // [72 * 2 - 1, 19 * 2 - 1]
  [ 89,  29], // [45 * 2 - 1, 15 * 2 - 1]
  [103,  37]  // [52 * 2 - 1, 19 * 2 - 1]
]
```

72,932 KB -> 69,300 KB

## Encode
The last step concerns encoding the polylines as variable integers, aka varints.

```js
function writeVarint(out, value) {
  while (value > 0x7f) {
    out.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  out.push(value);
}
```

```js
function encode(polylines) {
  const out = [];
  writeVarint(out, polylines.length);
  for (const polyline of polylines) {
    writeVarint(out, polyline.length);
    for (const offsets of polyline) {
      for (const offset of offsets) {
        writeVarint(out, offset);
      }
    }
  }
  return Uint8Array.from(out);
}
```

```js
0x0b,                   // Length
0xe0, 0x03, 0xc8, 0x05, // [(480 & 0x7f) | 0x80, (480 >> 7) & 0x7f, ...]
0x8f, 0x01, 0x25,       // [(143 & 0x7f) | 0x80, (143 >> 7) & 0x7f, ...]
0x59,       0x1d,       // [89 & 0x7f, ...]
0x67,       0x25        // [103 & 0x7f, ...]
```

69,300 KB -> 20,390 KB

## Conclusion
| Step      | Description                                | Size [KB] |
| --------- | ------------------------------------------ | --------: |
| Raw       | Raw data returned by the Overpass query    |   614,312 |
| Geometry  | Remove all but geometric data              |   239,784 |
| Simplify  | Simplify polylines with a tolerance of 0.5 |   196,512 |
| Precision | Round coordinates to 5 decimal places      |   148,188 |
| Offset    | Store offset to previous coordinates       |    72,932 |
| Zigzag    | Convert negative to positive numbers       |    69,300 |
| Encode    | Encode in a binary format using varints    |    20,390 |
| Compress  | Compress with deflate                      |    17,501 |
{.tabular-nums}

<details>
  <summary>Individual file sizes</summary>

  Similar compression applied to all data. Pois also include metadata, which makes up the largest amount. Vercel static file limit is 100 MB.

  | Country      | Cafes | Cemeteries | Cobbles |  Gas | Gravel | Grocers | Water |
  | ------------ | ----: | ---------: | ------: | ---: | -----: | ------: | ----: |
  | Austria      |   123 |         29 |      73 |   26 |  2,831 |      78 |    34 |
  | Belgium      |   109 |         38 |     204 |   23 |    637 |      78 |     6 |
  | Czechia      |    89 |         33 |     211 |   34 |    870 |      96 |     9 |
  | Denmark      |    78 |         17 |      45 |   15 |  1,545 |      40 |     4 |
  | France       |   683 |        269 |     317 |   91 |  5,045 |     450 |   101 |
  | Germany      | 1,082 |        270 |   1,887 |  176 | 17,387 |     571 |    44 |
  | Italy        |   611 |        149 |     755 |  133 |  5,131 |     262 |   257 |
  | Lichtenstein |     1 |          1 |       1 |    1 |     25 |       1 |     1 |
  | Luxembourg   |     8 |          4 |      12 |    3 |    102 |       6 |     1 |
  | Monaco       |     1 |          1 |       1 |    1 |      1 |       1 |     1 |
  | Netherlands  |   144 |         31 |      41 |   38 |    848 |      86 |    12 |
  | Poland       |   193 |        114 |     358 |   61 |  2,211 |     358 |    10 |
  | Portugal     |   178 |         39 |     610 |   23 |    466 |      66 |    27 |
  | Slovenia     |    27 |          9 |       7 |   10 |    847 |      15 |     8 |
  | Spain        |   381 |        135 |     270 |  114 |  3,119 |     239 |   178 |
  | Switzerland  |    98 |         18 |      96 |   29 |  2,067 |      88 |    57 |
  {.tabular-nums}
</details>


But with great datasets come great performance problems. To be continued.
