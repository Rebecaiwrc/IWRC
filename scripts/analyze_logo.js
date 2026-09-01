const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Read raw PNG file
function readPng(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width = 0, height = 0;
  let idatBuffers = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatBuffers.push(data);
    }
    pos += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatBuffers));
  const rgba = Buffer.alloc(width * height * 4);
  let srcPos = 0;
  let rowLen = width * 4;
  let prevRow = Buffer.alloc(rowLen);

  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcPos++];
    const currentRow = decompressed.subarray(srcPos, srcPos + rowLen);
    srcPos += rowLen;
    const unfilter = Buffer.alloc(rowLen);

    for (let x = 0; x < rowLen; x++) {
      const a = x >= 4 ? unfilter[x - 4] : 0;
      const b = prevRow[x];
      const c = x >= 4 ? prevRow[x - 4] : 0;
      let val = currentRow[x];
      if (filter === 0) {}
      else if (filter === 1) val = (val + a) & 0xff;
      else if (filter === 2) val = (val + b) & 0xff;
      else if (filter === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        val = (val + pr) & 0xff;
      }
      unfilter[x] = val;
    }
    unfilter.copy(rgba, y * rowLen);
    prevRow = unfilter;
  }
  return { width, height, rgba };
}

const logo = readPng(path.join(__dirname, '..', 'public', 'iwrc-logo.png'));

// Column density profile
const colDensity = new Array(logo.width).fill(0);
for (let x = 0; x < logo.width; x++) {
  for (let y = 0; y < logo.height; y++) {
    const idx = (y * logo.width + x) * 4;
    if (logo.rgba[idx + 3] > 20) {
      colDensity[x]++;
    }
  }
}

// Find gaps
let gaps = [];
for (let x = 159; x <= 860; x++) {
  if (colDensity[x] === 0) {
    gaps.push(x);
  }
}
console.log('Zero columns / gaps:', gaps);

// Let's find segments
let inLetter = false;
let segments = [];
let start = 0;
for (let x = 150; x <= 870; x++) {
  if (colDensity[x] > 0 && !inLetter) {
    inLetter = true;
    start = x;
  } else if (colDensity[x] === 0 && inLetter) {
    inLetter = false;
    segments.push({ start, end: x - 1, width: x - start });
  }
}
console.log('Letter segments:', segments);
