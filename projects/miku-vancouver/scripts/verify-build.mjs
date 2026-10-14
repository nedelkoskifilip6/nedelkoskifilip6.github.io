import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const BASE = '/miku-vancouver/';
const ORIGIN = 'https://nedelkoskifilip6.github.io';
const output = path.resolve(process.argv[2] ?? 'dist');
const errors = new Set();
const htmlIds = new Map();
let references = 0;

function fail(source, message) {
  errors.add(`${path.relative(output, source) || '.'}: ${message}`);
}

async function inspect(file) {
  try {
    return await stat(file);
  } catch {
    return null;
  }
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(location) : [location];
  }));
  return nested.flat().sort();
}

function decodeEntities(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt);|&#(?:x[\da-f]+|\d+);/gi, entity => {
    const known = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    if (known[entity.toLowerCase()]) return known[entity.toLowerCase()];
    const hexadecimal = entity[2]?.toLowerCase() === 'x';
    const number = Number.parseInt(entity.slice(hexadecimal ? 3 : 2, -1), hexadecimal ? 16 : 10);
    return Number.isFinite(number) && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
  });
}

function documentURL(file) {
  const relative = path.relative(output, file).split(path.sep).join('/');
  const route = relative.endsWith('index.html') ? relative.slice(0, -'index.html'.length) : relative;
  return new URL(`${BASE}${route}`, ORIGIN);
}

async function idsFor(file) {
  if (!htmlIds.has(file)) {
    const source = await readFile(file, 'utf8');
    const ids = new Set([...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => decodeEntities(match[1])));
    htmlIds.set(file, ids);
  }
  return htmlIds.get(file);
}

async function verifyReference(raw, source, kind = 'asset') {
  const value = decodeEntities(raw.trim());
  if (!value || /^(?:data|blob|mailto|tel|javascript):/i.test(value)) return;
  // Bundled module imports are relative URLs. Bare specifiers are not file paths.
  if (kind === 'module' && !/^(?:\.{1,2}\/|\/|https?:)/i.test(value)) return;
  let url;
  try {
    url = new URL(value, documentURL(source));
  } catch {
    fail(source, `invalid URL ${JSON.stringify(value)}`);
    return;
  }
  if (url.origin !== ORIGIN) return;
  if (url.pathname !== BASE.slice(0, -1) && !url.pathname.startsWith(BASE)) {
    fail(source, `local URL must use ${BASE}: ${value}`);
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    fail(source, `invalid URL encoding: ${value}`);
    return;
  }
  const relative = pathname === BASE.slice(0, -1) ? '' : pathname.slice(BASE.length);
  let target = path.resolve(output, relative);
  if (target !== output && !target.startsWith(`${output}${path.sep}`)) {
    fail(source, `URL escapes the build directory: ${value}`);
    return;
  }
  const details = await inspect(target);
  if (details?.isDirectory()) target = path.join(target, 'index.html');
  const resolved = await inspect(target);
  if (!resolved?.isFile()) {
    fail(source, `missing local ${kind}: ${value}`);
    return;
  }
  references += 1;
  if (kind === 'link' && url.hash && target.endsWith('.html')) {
    let fragment;
    try {
      fragment = decodeURIComponent(url.hash.slice(1));
    } catch {
      fail(source, `invalid anchor encoding: ${value}`);
      return;
    }
    // Text fragments are browser directives, rather than element IDs.
    if (fragment && !fragment.startsWith(':~:text=') && !(await idsFor(target)).has(fragment)) {
      fail(source, `missing local anchor: ${value}`);
    }
  }
}

async function verifyFile(file) {
  const extension = path.extname(file);
  if (!['.html', '.css', '.js', '.mjs'].includes(extension)) return;
  const source = await readFile(file, 'utf8');
  const jobs = [];
  const markup = extension === '.html' ? source.replace(/<!--[\s\S]*?-->/g, '').replace(/(<(?:script|style)\b[^>]*>)[\s\S]*?(<\/(?:script|style)\s*>)/gi, '$1$2') : '';
  if (extension === '.html') {
    // Sharing previews are real release assets even though their URLs use content.
    for (const match of markup.matchAll(/<meta\b[^>]*>/gi)) {
      const attributes = Object.fromEntries([...match[0].matchAll(/(property|name|content)\s*=\s*(["'])(.*?)\2/gi)].map(attribute => [attribute[1].toLowerCase(), attribute[3]]));
      if (['og:image', 'og:image:secure_url', 'twitter:image'].includes(attributes.property ?? attributes.name)) {
        jobs.push(verifyReference(attributes.content ?? '', file, 'social image'));
      }
    }
    // Inline runtime strings may contain markup such as href="t". Read the
    // real tags' attributes, retaining script/link tags but excluding raw text.
    for (const match of markup.matchAll(/(?:\s|<)(src|href|poster|srcset|imagesrcset|component-url|renderer-url|before-hydration-url)\s*=\s*(["'])(.*?)\2/gi)) {
      const [, attribute, , value] = match;
      if (attribute.toLowerCase().endsWith('srcset')) {
        // Inline data images are self-contained; their commas are not separators.
        if (value.trim().startsWith('data:')) continue;
        for (const candidate of value.split(',')) {
          const url = candidate.trim().split(/\s+/)[0];
          if (url) jobs.push(verifyReference(url, file));
        }
      } else {
        jobs.push(verifyReference(value, file, attribute.toLowerCase() === 'href' ? 'link' : 'asset'));
      }
    }
  }
  if (extension === '.css' || extension === '.html') {
    const css = extension === '.css' ? source : [
      ...[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map(match => match[1]),
      ...[...markup.matchAll(/\sstyle\s*=\s*(["'])(.*?)\1/gi)].map(match => decodeEntities(match[2])),
    ].join('\n');
    for (const match of css.matchAll(/url\(\s*(["']?)([^)"']+)\1\s*\)/gi)) {
      // SVG filters can refer to IDs within a document and are not asset URLs.
      if (!match[2].trim().startsWith('#')) jobs.push(verifyReference(match[2], file));
    }
    for (const match of css.matchAll(/@import\s+["']([^"']+)["']/gi)) {
      jobs.push(verifyReference(match[1], file));
    }
  }
  if (extension === '.js' || extension === '.mjs') {
    const imports = new Set();
    for (const expression of [
      /\b(?:import|export)\s*[^;]*?\bfrom\s*["']([^"']+)["']/g,
      /\bimport\s*["']([^"']+)["']/g,
      /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
      /\bnew\s+URL\s*\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g,
    ]) {
      for (const match of source.matchAll(expression)) imports.add(match[1]);
    }
    for (const imported of imports) jobs.push(verifyReference(imported, file, 'module'));
  }
  await Promise.all(jobs);
}

if (!(await inspect(output))?.isDirectory()) {
  console.error(`Build directory is missing: ${output}. Run astro build first.`);
  process.exit(1);
}
for (const expected of ['index.html', 'menu/index.html']) {
  if (!(await inspect(path.join(output, expected)))?.isFile()) errors.add(`Required page is missing: ${expected}`);
}
const files = await listFiles(output);
await Promise.all(files.map(verifyFile));
if (errors.size) {
  console.error(`GitHub Pages verification failed (${errors.size} issue${errors.size === 1 ? '' : 's'}):`);
  for (const error of [...errors].sort()) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`GitHub Pages verification passed: home/menu present; ${references} local references resolved under ${BASE}.`);
