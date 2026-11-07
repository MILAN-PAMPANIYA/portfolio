import sharp from "sharp";
import path from "node:path";

const input = path.resolve("Headshot.jpeg");
const output = path.resolve("public/headshot.png");

const resized = sharp(input).rotate().resize({ width: 1200, withoutEnlargement: true });
const { data, info } = await resized.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

function medianChannel(samples, channel) {
  const values = samples.map((sample) => sample[channel]).sort((a, b) => a - b);
  return values[values.length >> 1];
}

const samples = [];
function sample(x, y) {
  const i = (y * width + x) * 4;
  samples.push([data[i], data[i + 1], data[i + 2]]);
}
for (let x = 0; x < width; x += 8) {
  sample(x, 2);
  sample(x, height - 3);
}
for (let y = 0; y < height; y += 8) {
  sample(2, y);
  sample(width - 3, y);
}
const bg = [0, 1, 2].map((channel) => medianChannel(samples, channel));

function dist2(i) {
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  return dr * dr + dg * dg + db * db;
}

function flood(threshold) {
  const limit = threshold * threshold;
  const seen = new Uint8Array(width * height);
  const qx = new Int32Array(width * height);
  const qy = new Int32Array(width * height);
  let qs = 0;
  let qe = 0;
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (seen[p]) return;
    if (dist2(p * 4) > limit) return;
    seen[p] = 1;
    qx[qe] = x;
    qy[qe] = y;
    qe += 1;
  };
  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }
  while (qs < qe) {
    const x = qx[qs];
    const y = qy[qs];
    qs += 1;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }
  return seen;
}

let seen = flood(36);
let removed = 0;
for (let i = 0; i < seen.length; i += 1) if (seen[i]) removed += 1;
const ratio = removed / seen.length;
if (ratio < 0.12) seen = flood(52);
if (ratio > 0.72) seen = flood(24);

const alpha = new Uint8Array(width * height);
alpha.fill(255);
for (let p = 0; p < seen.length; p += 1) if (seen[p]) alpha[p] = 0;

for (let pass = 0; pass < 2; pass += 1) {
  const next = alpha.slice();
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = y * width + x;
      if (!alpha[p]) continue;
      let open = 0;
      if (!alpha[p - 1]) open += 1;
      if (!alpha[p + 1]) open += 1;
      if (!alpha[p - width]) open += 1;
      if (!alpha[p + width]) open += 1;
      if (open < 1) continue;
      const d = Math.sqrt(dist2(p * 4));
      if (d < 48) next[p] = 0;
      else if (d < 78 && open >= 2) next[p] = Math.round(alpha[p] * ((d - 48) / 30));
    }
  }
  alpha.set(next);
}

for (let p = 0; p < alpha.length; p += 1) data[p * 4 + 3] = alpha[p];

let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (data[(y * width + x) * 4 + 3] > 12) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}
const pad = 8;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
const cropped = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y += 1) {
  const src = ((y + minY) * width + minX) * 4;
  data.copy(cropped, y * cropW * 4, src, src + cropW * 4);
}

await sharp(cropped, { raw: { width: cropW, height: cropH, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(output);

const kept = [...alpha].filter((value) => value > 12).length;
console.log(`headshot ${cropW}x${cropH} bg=${bg.join(",")} kept=${((kept / alpha.length) * 100).toFixed(1)}%`);
