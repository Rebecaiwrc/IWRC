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

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

const logo = readPng(path.join(__dirname, '..', 'public', 'iwrc-logo.png'));

// Render high-res master icon on dark navy squircle with authentic iWrc geometry
function generateMasterIcon(outSize) {
  const buf = Buffer.alloc(outSize * outSize * 4);
  const radius = outSize * 0.22;

  // Background: Rich deep marine gradient with cyan highlight border
  const bgTop = [14, 42, 64];      // #0E2A40
  const bgBottom = [5, 18, 30];     // #05121E
  const borderCol = [56, 189, 248]; // #38BDF8

  for (let y = 0; y < outSize; y++) {
    for (let x = 0; x < outSize; x++) {
      const idx = (y * outSize + x) * 4;
      const dx = Math.max(0, Math.max(radius - x, x - (outSize - 1 - radius)));
      const dy = Math.max(0, Math.max(radius - y, y - (outSize - 1 - radius)));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) continue;

      const alphaEdge = dist > radius - 1 ? Math.max(0, Math.min(1, radius - dist)) : 1;
      const t = (x + y) / (outSize * 2);
      let r = Math.round(bgTop[0] * (1 - t) + bgBottom[0] * t);
      let g = Math.round(bgTop[1] * (1 - t) + bgBottom[1] * t);
      let b = Math.round(bgTop[2] * (1 - t) + bgBottom[2] * t);

      const isBorder = (x < 1.5 || x >= outSize - 1.5 || y < 1.5 || y >= outSize - 1.5 || dist > radius - 1.5);
      if (isBorder) {
        const bAlpha = 0.45;
        r = Math.round(r * (1 - bAlpha) + borderCol[0] * bAlpha);
        g = Math.round(g * (1 - bAlpha) + borderCol[1] * bAlpha);
        b = Math.round(b * (1 - bAlpha) + borderCol[2] * bAlpha);
      }

      buf[idx + 0] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = Math.round(255 * alphaEdge);
    }
  }

  // Exact crop of "i" + "W with Handshake"
  const srcMinX = 159;
  const srcMaxX = 557;
  const srcMinY = 173;
  const srcMaxY = 387;

  const cropW = srcMaxX - srcMinX;
  const cropH = srcMaxY - srcMinY;

  const padding = 0.10; // 10% breathing room
  const targetBoxW = outSize * (1 - padding * 2);
  const targetBoxH = outSize * (1 - padding * 2);

  const scale = Math.min(targetBoxW / cropW, targetBoxH / cropH);
  const finalW = cropW * scale;
  const finalH = cropH * scale;

  const destStartX = (outSize - finalW) / 2;
  const destStartY = (outSize - finalH) / 2;

  for (let destY = 0; destY < outSize; destY++) {
    for (let destX = 0; destX < outSize; destX++) {
      if (destX < destStartX || destX >= destStartX + finalW || destY < destStartY || destY >= destStartY + finalH) {
        continue;
      }

      const srcX = srcMinX + (destX - destStartX) / scale;
      const srcY = srcMinY + (destY - destStartY) / scale;

      const x0 = Math.floor(srcX);
      const x1 = Math.min(logo.width - 1, x0 + 1);
      const y0 = Math.floor(srcY);
      const y1 = Math.min(logo.height - 1, y0 + 1);

      const fx = srcX - x0;
      const fy = srcY - y0;

      const idx00 = (y0 * logo.width + x0) * 4;
      const idx10 = (y0 * logo.width + x1) * 4;
      const idx01 = (y1 * logo.width + x0) * 4;
      const idx11 = (y1 * logo.width + x1) * 4;

      function sampleChan(offset) {
        const top = logo.rgba[idx00 + offset] * (1 - fx) + logo.rgba[idx10 + offset] * fx;
        const bot = logo.rgba[idx01 + offset] * (1 - fx) + logo.rgba[idx11 + offset] * fx;
        return top * (1 - fy) + bot * fy;
      }

      let srcR = sampleChan(0);
      let srcG = sampleChan(1);
      let srcB = sampleChan(2);
      let srcA = sampleChan(3) / 255;

      if (srcA <= 0.01) continue;

      const outIdx = (destY * outSize + destX) * 4;
      const bgA = buf[outIdx + 3] / 255;
      if (bgA === 0) continue;

      // Enhance vibrancy and contrast of authentic iWrc blue/cyan on dark navy
      // Check if it's the white handshake detail (high brightness) or cyan/blue
      const isWhiteDetail = (srcR > 220 && srcG > 220 && srcB > 220);
      if (!isWhiteDetail) {
        // Boost cyan/blue saturation and luminance for perfect visibility in small tabs
        srcR = Math.min(255, srcR * 1.25 + 15);
        srcG = Math.min(255, srcG * 1.30 + 35);
        srcB = Math.min(255, srcB * 1.35 + 50);
      } else {
        // Crisp pure white for handshake lines
        srcR = 255;
        srcG = 255;
        srcB = 255;
      }

      const outR = Math.round(srcR * srcA + buf[outIdx + 0] * (1 - srcA));
      const outG = Math.round(srcG * srcA + buf[outIdx + 1] * (1 - srcA));
      const outB = Math.round(srcB * srcA + buf[outIdx + 2] * (1 - srcA));

      buf[outIdx + 0] = outR;
      buf[outIdx + 1] = outG;
      buf[outIdx + 2] = outB;
    }
  }

  return createPng(outSize, outSize, buf);
}

// Generate all target sizes
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

const png16 = generateMasterIcon(16);
const png32 = generateMasterIcon(32);
const png48 = generateMasterIcon(48);
const png180 = generateMasterIcon(180);
const png192 = generateMasterIcon(192);
const png512 = generateMasterIcon(512);

const icoBuffer = createIco([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 },
]);

// Write static assets
fs.writeFileSync(path.join(publicDir, 'icon.png'), png32);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

fs.writeFileSync(path.join(appDir, 'icon.png'), png32);
fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);

console.log('Successfully generated all authentic iWrc favicons and assets!');
