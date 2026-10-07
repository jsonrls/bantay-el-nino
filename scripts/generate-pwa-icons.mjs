import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Ensure directory exists
const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate clean SVG icon (Bantay El Niño: Solar beacon / Philippine climate monitor)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#1A1814" />
  <!-- Outer warm paper border -->
  <rect x="24" y="24" width="464" height="464" fill="none" stroke="#FAF9F5" stroke-width="4" stroke-opacity="0.3"/>
  <!-- Central Signal Sun Motif (#C2410C) -->
  <circle cx="256" cy="256" r="96" fill="#C2410C" />
  <!-- Radiant Gauge Rays -->
  <line x1="256" y1="96" x2="256" y2="136" stroke="#FAF9F5" stroke-width="12" stroke-linecap="square"/>
  <line x1="256" y1="376" x2="256" y2="416" stroke="#FAF9F5" stroke-width="12" stroke-linecap="square"/>
  <line x1="96" y1="256" x2="136" y2="256" stroke="#FAF9F5" stroke-width="12" stroke-linecap="square"/>
  <line x1="376" y1="256" x2="416" y2="256" stroke="#FAF9F5" stroke-width="12" stroke-linecap="square"/>
  <line x1="142" y1="142" x2="172" y2="172" stroke="#FAF9F5" stroke-width="10" stroke-linecap="square"/>
  <line x1="340" y1="340" x2="370" y2="370" stroke="#FAF9F5" stroke-width="10" stroke-linecap="square"/>
  <line x1="340" y1="172" x2="370" y2="142" stroke="#FAF9F5" stroke-width="10" stroke-linecap="square"/>
  <line x1="142" y1="370" x2="172" y2="340" stroke="#FAF9F5" stroke-width="10" stroke-linecap="square"/>
  <!-- Internal Indicator Core -->
  <circle cx="256" cy="256" r="32" fill="#FAF9F5" />
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf8');

// 2. Pure Node.js PNG encoder helper
function createPng(width, height, getPixel) {
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function writeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const full = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(full), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = writeChunk('IHDR', ihdrData);

  // Raw image data with scanline filter 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = writeChunk('IDAT', idatData);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Pixel function drawing the Bantay El Niño emblem
function drawEmblem(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: warm ink #1A1814
  let r = 26, g = 24, b = 20, a = 255;

  const sunRadius = isMaskable ? w * 0.16 : w * 0.19;
  const coreRadius = isMaskable ? w * 0.05 : w * 0.06;

  // Signal Sun (#C2410C)
  if (dist <= sunRadius) {
    r = 194; g = 65; b = 12; // #C2410C
  }

  // Core (#FAF9F5)
  if (dist <= coreRadius) {
    r = 250; g = 249; b = 245; // #FAF9F5
  }

  // 8 Rays (#FAF9F5)
  const angle = Math.atan2(dy, dx);
  const rayInner = sunRadius * 1.35;
  const rayOuter = sunRadius * 1.85;

  if (dist >= rayInner && dist <= rayOuter) {
    for (let i = 0; i < 8; i++) {
      const rayAngle = (i * Math.PI) / 4;
      let diff = Math.abs(angle - rayAngle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      const arcDist = dist * diff;
      if (arcDist <= (w * 0.018)) {
        r = 250; g = 249; b = 245;
      }
    }
  }

  return [r, g, b, a];
}

console.log('Generating PWA PNG icons...');
const png192 = createPng(192, 192, (x, y, w, h) => drawEmblem(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);

const png512 = createPng(512, 512, (x, y, w, h) => drawEmblem(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);

const pngMaskable = createPng(512, 512, (x, y, w, h) => drawEmblem(x, y, w, h, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), pngMaskable);

const appleTouch = createPng(180, 180, (x, y, w, h) => drawEmblem(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleTouch);

console.log('Successfully generated all PWA icons in public/icons/');
