import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Preserve the official Miku red seal, documented on the photography/sources page.
const original = await readFile(new URL('../public/favicon-192x192.png', import.meta.url));
const directory = new URL('../public/brand/', import.meta.url);
await mkdir(directory, { recursive: true });
const version = 'v3-20261015';
for (const size of [16, 32, 192]) {
  await writeFile(new URL(`miku-seal-${size}-${version}.png`, directory), await sharp(original).resize(size, size).png().toBuffer());
}
await writeFile(new URL(`miku-touch-${version}.png`, directory), await readFile(new URL('../public/apple-touch-icon.png', import.meta.url)));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><image width="192" height="192" href="data:image/png;base64,${original.toString('base64')}"/></svg>\n`;
await writeFile(new URL(`miku-seal-${version}.svg`, directory), svg);
await writeFile(new URL('../public/favicon.svg', import.meta.url), svg);

// ICO entries may contain PNG images; retain transparency at every desktop size.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(original).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + images.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
for (let index = 0; index < images.length; index += 1) {
  const entry = 6 + index * 16;
  header[entry] = sizes[index]; header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[index].length, entry + 8); header.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
}
const ico = Buffer.concat([header, ...images]);
await writeFile(new URL(`miku-seal-${version}.ico`, directory), ico);
await writeFile(new URL('../public/favicon.ico', import.meta.url), ico);
console.log('Generated versioned official Miku seal icons and replaced legacy SVG/ICO fallbacks.');
