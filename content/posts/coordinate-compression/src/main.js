import data from './data/1-geometry.json' with { type: 'json' };
import { writeFileSync } from 'fs';
import simplify_ from 'simplify-js';

function simplify(polylines) {
  return polylines.map((polyline) => {
    const degToMetersLat = 110574;
    const degToMetersLng = 111320 * Math.cos(polyline[0][0] * (Math.PI / 180));

    return simplify_(
      polyline.map((coordinates) => ({
        x: coordinates[0] * degToMetersLat,
        y: coordinates[1] * degToMetersLng,
        coordinates,
      })),
      1,
      true,
    ).map(({ coordinates }) => coordinates);
  });
}

const PRECISION = 5;

function precision(polylines) {
  return polylines.map((polyline) =>
    polyline.map((coordinates) =>
      coordinates.map((coordinate) => Math.round(coordinate * 10 ** PRECISION)),
    ),
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
  out.push(0); // Metadata length
  return Uint8Array.from(out);
}

async function compress(bytes) {
  const stream = new CompressionStream('deflate-raw');
  const response = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await response.arrayBuffer());
}

async function main() {
  const step2 = simplify(data);
  writeFileSync('./data/2-simplify.json', JSON.stringify(step2));
  const step3 = precision(step2);
  writeFileSync('./data/3-precision.json', JSON.stringify(step3));
  const step4 = offset(step3);
  writeFileSync('./data/4-offset.json', JSON.stringify(step4));
  const step5 = zigzag(step4);
  writeFileSync('./data/5-zigzag.json', JSON.stringify(step5));
  const step6 = encode(step5);
  writeFileSync('./data/6-encode.bin', step6);
  const step7 = await compress(step6);
  writeFileSync('./data/7-compress.bin', step7);
}

main();
