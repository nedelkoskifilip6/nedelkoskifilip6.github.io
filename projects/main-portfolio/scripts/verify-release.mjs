import { execFileSync } from 'node:child_process';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(projectRoot, '../..');
const baseline = 'd2f9122c81e0ec761af848315dea1c972634e4a5';
const siteOrigin = 'https://nedelkoskifilip6.github.io';
const useDist = process.argv.includes('--dist');
const artifactRoot = useDist ? path.join(projectRoot, 'dist') : repositoryRoot;
const protectedPaths = [
  'tesla-motors/',
  'revolut-finance/',
  'miku-vancouver/',
  'projects/miku-vancouver/',
  'projects/revolut-finance/',
];
const expectedProjects = new Map([
  ['revolut', { name: 'REVOLUT', status: 'live', href: `${siteOrigin}/revolut-finance/` }],
  ['miku', { name: 'MIKU VANCOUVER', status: 'live', href: `${siteOrigin}/miku-vancouver/` }],
  ['six-senses', { name: 'SIX SENSES IBIZA', status: 'live', href: `${siteOrigin}/six-senses-ibiza/` }],
  ['bang-olufsen', { name: 'BANG & OLUFSEN', status: 'coming-soon' }],
  ['sothebys', { name: 'SOTHEBY’S INTERNATIONAL REALTY', status: 'coming-soon' }],
]);
const errors = [];
const checkedFiles = new Set();
let referenceCount = 0;

const git = (...args) =>
  execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const fail = (message) => errors.push(message);
const splitNull = (output) => output.split('\0').filter(Boolean);
const decode = (value) =>
  value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, (entity) => {
    const known = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    if (known[entity.toLowerCase()]) return known[entity.toLowerCase()];
    const hexadecimal = entity.toLowerCase().startsWith('&#x');
    return String.fromCodePoint(
      parseInt(entity.slice(hexadecimal ? 3 : 2, -1), hexadecimal ? 16 : 10),
    );
  });

function attributes(source) {
  const result = {};
  const pattern = /([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern))
    result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  return result;
}

function tagsFrom(html) {
  // Scripts and styles are checked separately; their text is not HTML markup.
  const stripped = html
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<(script|style)\b([^>]*?)>[^]*?<\/\1\s*>/gi, '<$1$2></$1>');
  const tags = [];
  for (const match of stripped.matchAll(
    /<(\/?)([a-z][\w:-]*)(\s(?:"[^"]*"|'[^']*'|[^'">])*)?\s*\/?\s*>/gi,
  )) {
    tags.push({
      name: match[2].toLowerCase(),
      closing: Boolean(match[1]),
      attrs: attributes(match[3] || ''),
      selfClosing: /\/\s*>$/.test(match[0]),
    });
  }
  return tags;
}

function ownedPath(relative) {
  return (
    relative === 'index.html' ||
    relative === 'favicon-portfolio.svg' ||
    relative === 'social-portfolio.jpg' ||
    relative.startsWith('portfolio-assets/') ||
    relative.startsWith('portfolio-media/') ||
    relative.startsWith('projects/main-portfolio/')
  );
}

function verifyScope() {
  git('rev-parse', '--verify', `${baseline}^{commit}`);
  const protectedChanges = splitNull(
    git('diff', '--name-only', '--no-renames', '-z', baseline, '--', ...protectedPaths),
  );
  if (protectedChanges.length)
    fail(`Legacy project files differ from ${baseline}: ${protectedChanges.join(', ')}`);
  const changed = new Set([
    ...splitNull(git('diff', '--name-only', '--no-renames', '-z', baseline, '--')),
    ...splitNull(git('ls-files', '--others', '--exclude-standard', '-z')),
  ]);
  for (const relative of changed) {
    if (ownedPath(relative)) continue;
    // A new, explicitly added Pages workflow may be reviewed, but existing workflows cannot change.
    if (/^\.github\/workflows\/[^/]+\.ya?ml$/.test(relative)) {
      try {
        git('cat-file', '-e', `${baseline}:${relative}`);
      } catch {
        continue;
      }
    }
    fail(`Change outside portfolio release scope: ${relative}`);
  }
  return changed.size;
}

async function inspectArtifact(target) {
  const info = await lstat(target);
  if (info.isSymbolicLink())
    throw new Error(`Published assets cannot be symbolic links: ${target}`);
  if (!info.isFile() && !info.isDirectory()) throw new Error(`Unsupported asset type: ${target}`);
  if (info.isDirectory())
    for (const entry of await readdir(target)) await inspectArtifact(path.join(target, entry));
}

async function checkReference(raw, owner, { htmlAsset = false, asset = false } = {}) {
  const value = decode(raw).trim();
  if (!value || /^(?:data:|blob:|mailto:|tel:)/i.test(value)) return;
  if (/^(?:javascript:|file:)/i.test(value)) {
    fail(`Unsafe URL in ${owner}: ${value}`);
    return;
  }
  if (value.startsWith('#')) return;
  let url;
  try {
    url = new URL(value, `${siteOrigin}/${owner === 'index.html' ? '' : owner}`);
  } catch {
    fail(`Invalid URL in ${owner}: ${value}`);
    return;
  }
  if (url.origin !== siteOrigin) return;
  if (htmlAsset && !value.startsWith('/') && !value.startsWith(siteOrigin))
    fail(`HTML asset must use the root base path in ${owner}: ${value}`);
  let relative;
  try {
    relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  } catch {
    fail(`Invalid encoded path in ${owner}: ${value}`);
    return;
  }
  if (relative.includes('\\') || relative.split('/').includes('..')) {
    fail(`Invalid local path in ${owner}: ${value}`);
    return;
  }
  const isPortfolioAsset =
    relative.startsWith('portfolio-assets/') ||
    relative.startsWith('portfolio-media/') ||
    ['favicon-portfolio.svg', 'social-portfolio.jpg'].includes(relative);
  if ((htmlAsset || asset) && !isPortfolioAsset)
    fail(`Asset is outside portfolio namespaces in ${owner}: ${value}`);
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  const target = path.resolve(artifactRoot, relative);
  if (!target.startsWith(`${artifactRoot}${path.sep}`)) {
    fail(`Local path escapes release root: ${value}`);
    return;
  }
  referenceCount++;
  try {
    const info = await lstat(target);
    if (info.isSymbolicLink() || !info.isFile())
      fail(`Local reference is not a regular file in ${owner}: ${value}`);
  } catch {
    fail(`Missing local reference in ${owner}: ${value}`);
    return;
  }
  if (/\.css$/i.test(relative)) await verifyCss(relative);
}

async function verifyCss(relative) {
  if (checkedFiles.has(relative)) return;
  checkedFiles.add(relative);
  const css = await readFile(path.join(artifactRoot, relative), 'utf8');
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/gi))
    await checkReference(match[1] ?? match[2] ?? match[3], relative, { asset: true });
  for (const match of css.matchAll(/@import\s+["']([^"']+)["']/gi))
    await checkReference(match[1], relative, { asset: true });
}

function verifyProjects(tags) {
  const scenes = tags.filter((tag) => !tag.closing && Object.hasOwn(tag.attrs, 'data-project'));
  if (scenes.length !== 5)
    fail(`Expected exactly 5 project presentations; found ${scenes.length}.`);
  const seen = new Set();
  for (const scene of scenes) {
    const slug = scene.attrs['data-project'];
    const expected = expectedProjects.get(slug);
    if (!expected) {
      fail(`Unexpected project slug: ${slug}`);
      continue;
    }
    if (seen.has(slug)) fail(`Duplicate project presentation: ${slug}`);
    seen.add(slug);
    if (scene.attrs['data-status'] !== expected.status)
      fail(`${expected.name} must have data-status="${expected.status}".`);
  }
  for (const slug of expectedProjects.keys())
    if (!seen.has(slug)) fail(`Missing project presentation: ${slug}`);
  const linkedProjects = new Set();
  const stack = [];
  const voidElements = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ]);
  for (const tag of tags) {
    if (tag.closing) {
      const index = stack.findLastIndex((parent) => parent.name === tag.name);
      if (index >= 0) stack.splice(index);
      continue;
    }
    if (tag.name === 'a' && Object.hasOwn(tag.attrs, 'href')) {
      const projectContext = [...stack, tag].findLast(
        (item) => item.attrs['data-project'] || item.attrs['data-index-project'],
      );
      const contextSlug =
        projectContext?.attrs['data-project'] || projectContext?.attrs['data-index-project'];
      const slug = tag.attrs['data-project-link'] || contextSlug;
      if (
        contextSlug &&
        tag.attrs['data-project-link'] &&
        tag.attrs['data-project-link'] !== contextSlug
      )
        fail(
          `Project link slug does not match its presentation: ${contextSlug} / ${tag.attrs['data-project-link']}`,
        );
      if (contextSlug && expectedProjects.get(contextSlug)?.status !== 'live')
        fail(`Unpublished project must not contain an active hyperlink: ${contextSlug}`);
      if (slug) {
        const expected = expectedProjects.get(slug);
        if (!expected || expected.status !== 'live')
          fail(`Unpublished project must not have an active hyperlink: ${slug}`);
        else {
          if (tag.attrs['data-project-link'] !== slug)
            fail(`Project link is missing data-project-link="${slug}".`);
          if (tag.attrs.href !== expected.href)
            fail(`${expected.name} links to an unverified URL: ${tag.attrs.href}`);
          linkedProjects.add(slug);
        }
      }
      if (
        tag.attrs.href.includes('/bang-olufsen/') ||
        tag.attrs.href.includes('/sothebys/')
      )
        fail(`Coming-soon project has a live-looking link: ${tag.attrs.href}`);
    }
    if (!tag.selfClosing && !voidElements.has(tag.name)) stack.push(tag);
  }
  for (const [slug, expected] of expectedProjects)
    if (expected.status === 'live' && !linkedProjects.has(slug))
      fail(`Missing verified live link for ${expected.name}.`);
}

async function verify() {
  const changedCount = verifyScope();
  try {
    await inspectArtifact(path.join(artifactRoot, 'index.html'));
  } catch (error) {
    if (error.code === 'ENOENT')
      throw new Error(
        `Missing ${useDist ? 'dist/index.html; run npm run build first' : 'repository root index.html'}.`,
      );
    throw error;
  }
  for (const name of [
    'portfolio-assets',
    'portfolio-media',
    'favicon-portfolio.svg',
    'social-portfolio.jpg',
  ]) {
    try {
      await inspectArtifact(path.join(artifactRoot, name));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const html = await readFile(path.join(artifactRoot, 'index.html'), 'utf8');
  const tags = tagsFrom(html);
  const ids = new Set(
    tags.filter((tag) => !tag.closing && tag.attrs.id).map((tag) => tag.attrs.id),
  );
  verifyProjects(tags);
  for (const tag of tags.filter((item) => !item.closing)) {
    if (tag.name === 'base' && tag.attrs.href && !['/', `${siteOrigin}/`].includes(tag.attrs.href))
      fail(`Unexpected HTML base URL: ${tag.attrs.href}`);
    if (tag.name === 'link' && tag.attrs.rel === 'canonical' && tag.attrs.href !== `${siteOrigin}/`)
      fail(`Canonical URL must point to the GitHub Pages root: ${tag.attrs.href}`);
    if (
      tag.name === 'meta' &&
      tag.attrs.property === 'og:url' &&
      tag.attrs.content !== `${siteOrigin}/`
    )
      fail(`Open Graph URL must point to the GitHub Pages root: ${tag.attrs.content}`);
    if (
      tag.name === 'meta' &&
      (['og:image', 'og:image:url', 'og:image:secure_url'].includes(tag.attrs.property) ||
        tag.attrs.name === 'twitter:image') &&
      tag.attrs.content
    )
      await checkReference(tag.attrs.content, 'index.html', { htmlAsset: true });
    for (const attr of ['src', 'poster', 'component-url', 'renderer-url'])
      if (tag.attrs[attr]) await checkReference(tag.attrs[attr], 'index.html', { htmlAsset: true });
    if (tag.attrs.srcset)
      for (const candidate of tag.attrs.srcset.split(','))
        await checkReference(candidate.trim().split(/\s+/)[0], 'index.html', { htmlAsset: true });
    if (tag.attrs.href) {
      if (
        tag.attrs.href.startsWith('#') &&
        tag.attrs.href.length > 1 &&
        !ids.has(decodeURIComponent(tag.attrs.href.slice(1)))
      )
        fail(`Missing anchor target: ${tag.attrs.href}`);
      const assetLink =
        tag.name === 'link' &&
        (tag.attrs.rel || '')
          .split(/\s+/)
          .some((rel) =>
            ['stylesheet', 'icon', 'preload', 'modulepreload', 'manifest'].includes(rel),
          );
      const isAsset =
        (assetLink || ['image', 'use'].includes(tag.name)) && !tag.attrs.href.startsWith('#');
      // The three verified live project destinations remain outside the portfolio artifact.
      if (!tag.attrs['data-project-link'])
        await checkReference(tag.attrs.href, 'index.html', { htmlAsset: isAsset });
    }
    if (tag.attrs.style)
      for (const match of tag.attrs.style.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi))
        await checkReference(match[1], 'index.html', { htmlAsset: true });
  }
  for (const match of html.matchAll(/<style\b[^>]*>([^]*?)<\/style>/gi)) {
    for (const url of match[1].matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi))
      await checkReference(url[1], 'index.html', { htmlAsset: true });
  }
  if (errors.length) throw new Error(`\n${errors.map((error) => `- ${error}`).join('\n')}`);
  console.log(
    `Portfolio release verified (${useDist ? 'dist' : 'published root'}): 5 project statuses, 3 verified live destinations, ${referenceCount} local references, ${checkedFiles.size} stylesheets, ${changedCount} scoped changed files. Legacy tracked projects match ${baseline}.`,
  );
}

verify().catch((error) => {
  console.error(`Portfolio release verification failed: ${error.message}`);
  process.exitCode = 1;
});
