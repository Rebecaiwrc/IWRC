const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create PNG buffer from RGBA buffer
function createPng(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk (scanlines with filter byte 0)
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawScanlines[y * (1 + width * 4)] = 0; // Filter None
    const rowSource = y * width * 4;
    const rowDest = y * (1 + width * 4) + 1;
    rgbaBuffer.copy(rawScanlines, rowDest, rowSource, rowSource + width * 4);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table & calculator for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
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

// Simple ICO generator from 16x16 and 32x32 PNGs
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // Colors
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32BE(item.buffer.length, 8); // Image size in little endian? Wait, ICO entry size is uint32 LE!
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

// Generate stylized "iW" icon raster pixels
function renderIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = size * 0.22; // rounded corner radius

  // Colors
  const bgTop = [14, 42, 64];      // #0E2A40
  const bgBottom = [5, 18, 30];     // #05121E
  const borderColor = [56, 189, 248]; // #38BDF8
  const cyanColor = [56, 189, 248];   // #38BDF8
  const whiteColor = [255, 255, 255]; // #FFFFFF

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Check rounded corner distance
      const dx = Math.max(0, Math.max(radius - x, x - (size - 1 - radius)));
      const dy = Math.max(0, Math.max(radius - y, y - (size - 1 - radius)));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        // Transparent outside rounded corner
        buf[idx + 0] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Smooth anti-aliased edge
      const alphaEdge = dist > radius - 1 ? Math.max(0, Math.min(1, radius - dist)) : 1;

      // Gradient background
      const t = (x + y) / (size * 2);
      let r = Math.round(bgTop[0] * (1 - t) + bgBottom[0] * t);
      let g = Math.round(bgTop[1] * (1 - t) + bgBottom[1] * t);
      let b = Math.round(bgTop[2] * (1 - t) + bgBottom[2] * t);
      let a = Math.round(255 * alphaEdge);

      // Border highlight
      const isBorder = (x < 1.5 || x >= size - 1.5 || y < 1.5 || y >= size - 1.5 || dist > radius - 1.5);
      if (isBorder) {
        const borderAlpha = 0.35 + 0.35 * (1 - t);
        r = Math.round(r * (1 - borderAlpha) + borderColor[0] * borderAlpha);
        g = Math.round(g * (1 - borderAlpha) + borderColor[1] * borderAlpha);
        b = Math.round(b * (1 - borderAlpha) + borderColor[2] * borderAlpha);
      }

      buf[idx + 0] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  // Draw "i" and "W"
  // Normalized coordinates (0 to 1)
  function blendPixel(px, py, color, intensity) {
    if (px < 0 || px >= size || py < 0 || py >= size) return;
    const idx = (py * size + px) * 4;
    const currentA = buf[idx + 3] / 255;
    if (currentA === 0) return;

    const effA = Math.min(1, intensity);
    buf[idx + 0] = Math.round(buf[idx + 0] * (1 - effA) + color[0] * effA);
    buf[idx + 1] = Math.round(buf[idx + 1] * (1 - effA) + color[1] * effA);
    buf[idx + 2] = Math.round(buf[idx + 2] * (1 - effA) + color[2] * effA);
  }

  // Draw Letter "i"
  // Dot of the "i"
  const dotCenterX = size * 0.24;
  const dotCenterY = size * 0.28;
  const dotRadius = size * 0.095;

  // Body of the "i"
  const iLeft = size * 0.165;
  const iRight = size * 0.315;
  const iTop = size * 0.44;
  const iBottom = size * 0.82;
  const iRadius = (iRight - iLeft) / 2;

  // Draw "W"
  // 4 segments of W
  const wTop = size * 0.44;
  const wBottom = size * 0.82;
  const wStems = [
    { x1: size * 0.40, y1: wTop, x2: size * 0.50, y2: wBottom, color: whiteColor },
    { x1: size * 0.50, y1: wBottom, x2: size * 0.63, y2: wTop, color: whiteColor },
    { x1: size * 0.63, y1: wTop, x2: size * 0.74, y2: wBottom, color: whiteColor },
    { x1: size * 0.74, y1: wBottom, x2: size * 0.86, y2: wTop, color: whiteColor }
  ];
  const stemThickness = size * 0.11;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // 1. Dot of i
      const distDot = Math.hypot(x - dotCenterX, y - dotCenterY);
      if (distDot <= dotRadius + 1) {
        const factor = Math.max(0, Math.min(1, dotRadius + 1 - distDot));
        blendPixel(x, y, cyanColor, factor);
      }

      // 2. Stem of i (rounded pill)
      const clampedY = Math.max(iTop + iRadius, Math.min(iBottom - iRadius, y));
      const clampedX = (iLeft + iRight) / 2;
      const distI = Math.hypot(x - clampedX, y - clampedY);
      if (distI <= iRadius + 1) {
        const factor = Math.max(0, Math.min(1, iRadius + 1 - distI));
        blendPixel(x, y, cyanColor, factor);
      }

      // 3. W segments
      for (const stem of wStems) {
        // Distance from point (x,y) to line segment
        const l2 = (stem.x2 - stem.x1) ** 2 + (stem.y2 - stem.y1) ** 2;
        let t = ((x - stem.x1) * (stem.x2 - stem.x1) + (y - stem.y1) * (stem.y2 - stem.y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = stem.x1 + t * (stem.x2 - stem.x1);
        const projY = stem.y1 + t * (stem.y2 - stem.y1);
        const distW = Math.hypot(x - projX, y - projY);

        const halfThick = stemThickness / 2;
        if (distW <= halfThick + 0.8) {
          const factor = Math.max(0, Math.min(1, halfThick + 0.8 - distW));
          blendPixel(x, y, stem.color, factor);
        }
      }
    }
  }

  return createPng(size, size, buf);
}

// Execute Generation
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

const png16 = renderIcon(16);
const png32 = renderIcon(32);
const png48 = renderIcon(48);
const png180 = renderIcon(180);
const png192 = renderIcon(192);
const png512 = renderIcon(512);

const icoBuffer = createIco([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 },
]);

// Write static files
fs.writeFileSync(path.join(publicDir, 'icon.png'), png32);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

fs.writeFileSync(path.join(appDir, 'icon.png'), png32);
fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);

console.log('Successfully generated all favicons, apple touch icons, and ICO files!');
