import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import photos from '../src/data/photos.json' with { type: 'json' };

const source = process.argv[2];
if (!source) throw new Error('Supply the directory containing the licensed original JPEG masters.');
await mkdir('public/images', { recursive: true });
for (const photo of photos) {
  const name = photo.filename.replace('.jpg', '');
  const input = resolve(source, photo.filename);
  const desktop = await sharp(input).rotate().resize({ width: 2200, height: 1467, fit: 'cover', position: sharp.strategy.attention, withoutEnlargement: true }).webp({ quality: 88, effort: 6 }).toFile(`public/images/${name}.webp`);
  const mobile = await sharp(input).rotate().resize({ width: 900, height: 1200, fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 87, effort: 6 }).toFile(`public/images/${name}-mobile.webp`);
  console.log(`${name}: desktop ${Math.round(desktop.size / 1024)} KB; mobile ${Math.round(mobile.size / 1024)} KB`);
}
