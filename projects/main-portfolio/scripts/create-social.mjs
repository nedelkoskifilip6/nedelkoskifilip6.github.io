import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const media = path.join(root, 'public/portfolio-media');
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
async function preview(file, transform, label, pending = false) {
  const source = await sharp(path.join(media, file))
    .resize(1000, 550, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 90 })
    .toBuffer();
  return `<g transform="${transform}"><rect width="1000" height="574" rx="5" fill="#111" stroke="#ffffff55" stroke-width="2"/><image xlink:href="data:image/jpeg;base64,${source.toString('base64')}" y="24" width="1000" height="550" clip-path="url(#frame)"/><path d="M5 0h990q5 0 5 5v19H0V5q0-5 5-5" fill="#ddd"/><g fill="#999"><circle cx="15" cy="12" r="3"/><circle cx="27" cy="12" r="3"/><circle cx="39" cy="12" r="3"/></g><text x="500" y="16" text-anchor="middle" fill="#555" font-size="8" letter-spacing="1">${escape(label)}</text>${pending ? '<rect x="18" y="523" width="170" height="30" rx="2" fill="#000e"/><text x="32" y="543" fill="#fff" font-size="10" letter-spacing="1.5">COMING SOON</text>' : ''}</g>`;
}
const frames = await Promise.all([
  preview('six-senses-1440.webp', 'matrix(.32,-.075,.04,.31,100,90)', 'SIX SENSES IBIZA'),
  preview('bang-concept.svg', 'matrix(.32,-.075,.04,.31,790,130)', 'BANG & OLUFSEN', true),
  preview('sothebys-concept.svg', 'matrix(.29,-.068,.036,.28,170,425)', 'SOTHEBY’S', true),
  preview('miku-1600.webp', 'matrix(.42,-.098,.052,.41,680,350)', 'MIKU VANCOUVER'),
  preview('revolut-1600.webp', 'matrix(.59,-.138,.073,.575,215,235)', 'REVOLUT'),
]);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630"><defs><clipPath id="frame"><rect y="24" width="1000" height="550" rx="4"/></clipPath><linearGradient id="veil" x2="0" y2="1"><stop stop-color="#000" stop-opacity=".65"/><stop offset=".24" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></linearGradient></defs><rect width="1200" height="630" fill="#000"/><g font-family="Arial,sans-serif">${frames.join('')}<rect width="1200" height="630" fill="url(#veil)"/><g fill="#eee"><text x="600" y="37" text-anchor="middle" font-size="12" letter-spacing="2">FILIP NEDELKOSKI</text><text x="600" y="53" text-anchor="middle" fill="#999" font-size="6" letter-spacing="1.8">FRONT-END ENGINEER</text><text x="38" y="606" font-size="10">Front-end engineering with a different perspective.</text><text x="1162" y="606" text-anchor="end" fill="#aaa" font-size="8" letter-spacing="1.5">SELECTED WORK / 2026</text></g><g stroke="#eee" stroke-width="1.2" transform="translate(48 38)"><path d="M-11 0h22M0-11v22M-8-8 8 8M-8 8 8-8"/></g><rect x="1015" y="23" width="145" height="33" rx="17" fill="#151515" stroke="#ffffff33"/><text x="1087" y="44" text-anchor="middle" fill="#ddd" font-size="9">Work · Design · Motion</text></g></svg>`;
await sharp(Buffer.from(svg))
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(path.join(root, 'public/social-portfolio.jpg'));
console.log('Created portfolio social image from the verified project previews.');
