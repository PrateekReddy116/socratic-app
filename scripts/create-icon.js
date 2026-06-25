const fs = require('fs');
const zlib = require('zlib');

const w = 16;
const h = 16;
const raw = Buffer.alloc((w * 4 + 1) * h);

for (let y = 0; y < h; y++) {
  raw[y * (w * 4 + 1)] = 0;
  for (let x = 0; x < w; x++) {
    const i = y * (w * 4 + 1) + 1 + x * 4;
    const cx = x - 8;
    const cy = y - 8;
    const d = Math.sqrt(cx * cx + cy * cy);
    if (d < 7) {
      raw[i] = 99;
      raw[i + 1] = 102;
      raw[i + 2] = 241;
      raw[i + 3] = 255;
    } else {
      raw[i] = 24;
      raw[i + 1] = 24;
      raw[i + 2] = 27;
      raw[i + 3] = 255;
    }
  }
}

const idat = zlib.deflateSync(raw);

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crcBuf = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, typeB, data, crc]);
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(w, 0);
ihdr.writeUInt32BE(h, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/icon.png', png);
console.log('icon created');
