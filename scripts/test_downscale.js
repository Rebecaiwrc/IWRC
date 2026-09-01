const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Same readPng / createPng functions
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

function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdr);

  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawScanlines[y * (1 + width * 4)] = 0;
    const rowSource = y * width * 4;
    const rowDest = y * (1 + width * 4) + 1;
    rgbaBuffer.copy(rawScanlines, rowDest, rowSource, rowSource + width * 4);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function downscale(srcImg, targetSize) {
  const buf = Buffer.alloc(targetSize * targetSize * 4);
  const scale = srcImg.width / targetSize;

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
      const startX = Math.floor(x * scale);
      const endX = Math.min(srcImg.width, Math.ceil((x + 1) * scale));
      const startY = Math.floor(y * scale);
      const endY = Math.min(srcImg.height, Math.ceil((y + 1) * scale));

      for (let sy = startY; sy < endY; sy++) {
        for (let sx = startX; sx < endX; sx++) {
          const idx = (sy * srcImg.width + sx) * 4;
          const a = srcImg.rgba[idx + 3] / 255;
          rSum += srcImg.rgba[idx + 0] * a;
          gSum += srcImg.rgba[idx + 1] * a;
          bSum += srcImg.rgba[idx + 2] * a;
          aSum += a;
          count++;
        }
      }

      const outIdx = (y * targetSize + x) * 4;
      if (aSum > 0) {
        buf[outIdx + 0] = Math.round(rSum / aSum);
        buf[outIdx + 1] = Math.round(gSum / aSum);
        buf[outIdx + 2] = Math.round(bSum / aSum);
        buf[outIdx + 3] = Math.round((aSum / count) * 255);
      }
    }
  }
  return createPng(targetSize, targetSize, buf);
}

const iwImg = readPng(path.join(__dirname, 'preview_iw_dark.png'));
fs.writeFileSync(path.join(__dirname, 'preview_iw_32.png'), downscale(iwImg, 32));
fs.writeFileSync(path.join(__dirname, 'preview_iw_16.png'), downscale(iwImg, 16));

console.log('Downscaled versions generated!');
