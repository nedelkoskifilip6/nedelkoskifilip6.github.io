import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Keep a small, full-frame photograph in the initial HTML while the sharp asset loads.
// Regenerate these only when replacing the corresponding Hero photographs.
await mkdir('src/assets', { recursive: true });
for (const [source, target, width] of [
  ['hero-salmon-wide-20261021.webp', 'hero-startup-wide.webp', 480],
  ['hero-salmon-20261021-mobile.webp', 'hero-startup-mobile.webp', 360],
]) {
  const result = await sharp(`public/images/${source}`).resize({ width }).webp({ quality: 62, effort: 6 }).toFile(`src/assets/${target}`);
  console.log(`${target}: ${result.width}×${result.height}, ${result.size} bytes`);
}
