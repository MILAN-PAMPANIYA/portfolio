import sharp from "sharp";

const input = "public/portrait.png";
const output = "public/portrait.png";

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

function lum(i) {
  return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
}

const samples = [];
for (let x = 0; x < width; x += 6) {
  samples.push(lum(x * 4), lum(((height - 1) * width + x) * 4));
}
for (let y = 0; y < height; y += 6) {
  samples.push(lum(y * width * 4), lum((y * width + width - 1) * 4));
}
samples.sort((a, b) => a - b);
const bg = samples[samples.length >> 1];
console.log("edge median luma", bg.toFixed(1));

const maxLuma = 2;
const seen = new Uint8Array(width * height);
const qx = new Int32Array(width * height);
const qy = new Int32Array(width * height);
let qs = 0;
let qe = 0;

function push(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const p = y * width + x;
  if (seen[p]) return;
  if (lum(p * 4) > maxLuma) return;
  seen[p] = 1;
  qx[qe] = x;
  qy[qe] = y;
  qe += 1;
}

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

const alpha = new Uint8Array(width * height);
alpha.fill(255);
let removed = 0;
for (let p = 0; p < seen.length; p += 1) {
  if (seen[p]) {
    alpha[p] = 0;
    removed += 1;
  }
}

for (let y = 1; y < height - 1; y += 1) {
  for (let x = 1; x < width - 1; x += 1) {
    const p = y * width + x;
    if (!alpha[p]) continue;
    let open = 0;
    if (!alpha[p - 1]) open += 1;
    if (!alpha[p + 1]) open += 1;
    if (!alpha[p - width]) open += 1;
    if (!alpha[p + width]) open += 1;
    if (!open) continue;
    const l = lum(p * 4);
    if (l < 6) alpha[p] = Math.round((l / 6) * 180);
  }
}

for (let p = 0; p < alpha.length; p += 1) data[p * 4 + 3] = alpha[p];

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile("public/portrait-cut.png");

const kept = [...alpha].filter((v) => v > 16).length;
console.log(
  `removed ${(removed / alpha.length * 100).toFixed(1)}%  kept ${(kept / alpha.length * 100).toFixed(1)}%`,
);
