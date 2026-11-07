import step1 from './data/1-geometry.json' with { type: 'json' };
import { writeFileSync } from 'fs';
import simplify_ from 'simplify-js';

function simplify(polylines) {
  return polylines.map((polyline) => {
    const lngToMeters = 111320 * Math.cos(polyline[0][1] * (Math.PI / 180));
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
  const sample = 6;
  console.log('1 >', step1[sample]);
  const step2 = simplify(step1);
  console.log('2 >', step2[sample]);
  writeFileSync('./data/2-simplify.json', JSON.stringify(step2));
  const step3 = precision(step2);
  console.log('3 >', step3[sample]);
  writeFileSync('./data/3-precision.json', JSON.stringify(step3));
  const step4 = offset(step3);
  console.log('4 >', step4[sample]);
  writeFileSync('./data/4-offset.json', JSON.stringify(step4));
  const step5 = zigzag(step4);
  console.log('5 >', step5[sample]);
  writeFileSync('./data/5-zigzag.json', JSON.stringify(step5));
  const step6 = encode(step5);
  console.log(
    '6 >',
    step5[sample].map((coordinates) =>
      coordinates.map((coordinate) =>
        writeVarint([], coordinate)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join(' '),
      ),
    ),
  );
  writeFileSync('./data/6-encode.bin', step6);
  const step7 = await compress(step6);
  writeFileSync('./data/7-compress.bin', step7);
}

main();
