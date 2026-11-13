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
  return polylines.map((polyline) => {
    return polyline.map((coordinates) => {
      return coordinates.map((coordinate) => {
        return Math.round(coordinate * SCALE);
      });
    });
  });
}

function offset(polylines) {
  const previous = [0, 0];
  return polylines.map((polyline) => {
    return polyline.map((coordinates) =>
      coordinates.map((coordinate, index) => {
        const offset = coordinate - previous[index];
        previous[index] = coordinate;
        return offset;
      }),
    );
  });
}

function zigzag(polylines) {
  const occurrences = new Map();
  return {
    polylines: polylines.map((polyline) => {
      return polyline.map((offsets) => {
        return offsets.map((offset) => {
          if (occurrences.has(offset)) {
            occurrences.set(offset, occurrences.get(offset) + 1);
          } else {
            occurrences.set(offset, 1);
          }
          return offset >= 0 ? offset * 2 : -offset * 2 - 1;
        });
      });
    }),
    occurrences: Array.from(occurrences.entries()).sort((a, b) => b[1] - a[1]),
  };
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
    for (const offsets of polyline) {
      for (const offset of offsets) {
        writeVarint(out, offset);
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

function stats(polylines) {
  let vertices = 0;
  for (const polyline of polylines) {
    vertices += polyline.length;
  }

  console.log('polylines:', polylines.length);
  console.log('length:', vertices / polylines.length);
}

async function main() {
  const sample = 556430;

  const step2 = sort(step1);
  writeFileSync('./data/2-sort.json', JSON.stringify(step2));
  console.log('# sort');
  console.log('data:', step2[sample]);
  stats(step2);

  const step3 = simplify(step2);
  writeFileSync('./data/3-simplify.json', JSON.stringify(step3));
  console.log('\n# simplify');
  console.log('data:', step3[sample]);
  stats(step3);

  const step4 = precision(step3);
  writeFileSync('./data/4-precision.json', JSON.stringify(step4));
  console.log('\n# precision');
  console.log('data:', step4[sample]);

  const step5 = offset(step4);
  writeFileSync('./data/5-offset.json', JSON.stringify(step5));
  console.log('\n# offset');
  console.log('data:', step5[sample]);

  const { polylines: step6, occurrences } = zigzag(step5);
  writeFileSync('./data/6-zigzag.json', JSON.stringify(step6));
  console.log('\n# zigzag');
  console.log('data:', step6[sample]);
  console.log('occurrences:', occurrences);

  const step7 = encode(step6);
  writeFileSync('./data/7-encode.bin', step7);
  console.log('\n# encode');
  console.log(
    'data:',
    step6[sample].map((coordinates) =>
      coordinates.map((coordinate) =>
        writeVarint([], coordinate)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join(' '),
      ),
    ),
  );

  const step8 = await compress(step7);
  writeFileSync('./data/8-compress.bin', step8);
}

main();
