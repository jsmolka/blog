import Flatbush from 'flatbush';
import { writeFileSync } from 'fs';
import simplify_ from 'simplify-js';
import step1 from './data/1-geometry.json' with { type: 'json' };

function sort(polylines) {
  const bush = new Flatbush(polylines.length);
  for (const [[lng, lat]] of polylines) {
    bush.add(lng, lat);
  }
  bush.finish();

  const sorted = [];
  const sortedIndices = new Set();
  while (sorted.length < polylines.length) {
    const [lng, lat] = sorted.at(-1)?.at(-1) ?? [0, 0];
    const index = bush.neighbors(lng, lat, 1, Infinity, (index) => !sortedIndices.has(index))[0];

    sorted.push(polylines[index]);
    sortedIndices.add(index);
  }
  return sorted;
}

function simplify(polylines) {
  return polylines.map((polyline) => {
    let minLat = +Infinity;
    let maxLat = -Infinity;
    for (const [_, lat] of polyline) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }

    const lngToMeters = 111320 * Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
    const latToMeters = 110574;

    return simplify_(
      polyline.map((coordinates) => ({
        x: coordinates[0] * lngToMeters,
        y: coordinates[1] * latToMeters,
        coordinates,
      })),
      0.5,
      true,
    ).map(({ coordinates }) => coordinates);
  });
}

const PRECISION = 5;
const SCALE = 10 ** PRECISION;

function precision(polylines) {
  return polylines.map((polyline) =>
    polyline.map((coordinates) => coordinates.map((coordinate) => Math.round(coordinate * SCALE))),
  );
}

function offset(polylines) {
  const previous = [0, 0];
  return polylines.map((polyline) =>
    polyline.map((coordinates) =>
      coordinates.map((coordinate, index) => {
        const offset = coordinate - previous[index];
        previous[index] = coordinate;
        return offset;
      }),
    ),
  );
}

function zigzag(polylines) {
  return polylines.map((polyline) =>
    polyline.map((coordinates) =>
      coordinates.map((coordinate) => (coordinate >= 0 ? coordinate * 2 : -coordinate * 2 - 1)),
    ),
  );
}

function writeVarint(out, value) {
  while (value > 0x7f) {
    out.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  out.push(value);
  return out;
}

function encode(polylines) {
  const out = [];
  writeVarint(out, polylines.length);
  for (const polyline of polylines) {
    writeVarint(out, polyline.length);
    for (const coordinates of polyline) {
      for (const coordinate of coordinates) {
        writeVarint(out, coordinate);
      }
    }
  }
  return Uint8Array.from(out);
}

async function compress(bytes) {
  const stream = new CompressionStream('deflate-raw');
  const response = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await response.arrayBuffer());
}

async function main() {
  const sample = 556430;

  const step2 = sort(step1);
  console.log('sort >', step2[sample]);
  writeFileSync('./data/2-sort.json', JSON.stringify(step2));

  const step3 = simplify(step2);
  console.log('simplify >', step3[sample]);
  writeFileSync('./data/3-simplify.json', JSON.stringify(step3));

  const step4 = precision(step3);
  console.log('precision >', step4[sample]);
  writeFileSync('./data/4-precision.json', JSON.stringify(step4));

  const step5 = offset(step4);
  console.log('offset >', step5[sample]);
  writeFileSync('./data/5-offset.json', JSON.stringify(step5));

  const step6 = zigzag(step5);
  console.log('zigzag >', step6[sample]);
  writeFileSync('./data/6-zigzag.json', JSON.stringify(step6));

  const step7 = encode(step6);
  console.log(
    'encode >',
    step6[sample].map((coordinates) =>
      coordinates.map((coordinate) =>
        writeVarint([], coordinate)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join(' '),
      ),
    ),
  );
  writeFileSync('./data/7-encode.bin', step7);

  const step8 = await compress(step7);
  writeFileSync('./data/8-compress.bin', step8);
}

main();
