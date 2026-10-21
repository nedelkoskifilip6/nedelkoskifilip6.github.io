import { cp, lstat, mkdir, mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(projectRoot, '../..');
const sourceRoot = path.join(projectRoot, 'dist');
const allowed = new Map([
  ['index.html', 'file'],
  ['portfolio-assets', 'directory'],
  ['portfolio-media', 'directory'],
  ['favicon-portfolio.svg', 'file'],
  ['social-portfolio.jpg', 'file'],
]);

async function inspectTree(target, expectedType) {
  const info = await lstat(target);
  if (info.isSymbolicLink()) throw new Error(`Symbolic links cannot be published: ${target}`);
  const actualType = info.isDirectory() ? 'directory' : info.isFile() ? 'file' : 'unsupported';
  if (actualType !== expectedType)
    throw new Error(`Expected ${expectedType}, received ${actualType}: ${target}`);
  if (info.isDirectory()) {
    for (const entry of await readdir(target, { withFileTypes: true })) {
      await inspectTree(path.join(target, entry.name), entry.isDirectory() ? 'directory' : 'file');
    }
  }
}

async function exists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function publish() {
  const actualRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: projectRoot,
    encoding: 'utf8',
  }).trim();
  if (path.resolve(actualRoot) !== repositoryRoot)
    throw new Error('The project is not in its expected repository root.');
  await inspectTree(sourceRoot, 'directory');
  const names = (await readdir(sourceRoot)).sort();
  const unexpected = names.filter((name) => !allowed.has(name));
  if (unexpected.length)
    throw new Error(
      `Build contains output outside the portfolio whitelist: ${unexpected.join(', ')}. Configure Astro build.assets as "portfolio-assets" and use portfolio-media for public media.`,
    );
  if (!names.includes('index.html'))
    throw new Error('Build is missing dist/index.html. Run the production build first.');

  // Validate every source and destination before changing the published root.
  for (const name of names) {
    await inspectTree(path.join(sourceRoot, name), allowed.get(name));
    const destination = path.join(repositoryRoot, name);
    if (await exists(destination)) await inspectTree(destination, allowed.get(name));
  }

  const stagingRoot = await mkdtemp(path.join(projectRoot, '.publish-build-'));
  const stagedRoot = path.join(stagingRoot, 'new');
  const backupRoot = path.join(stagingRoot, 'previous');
  const installed = [];
  const backedUp = [];
  let removeStaging = true;
  try {
    await mkdir(stagedRoot);
    await mkdir(backupRoot);
    for (const name of names)
      await cp(path.join(sourceRoot, name), path.join(stagedRoot, name), {
        recursive: true,
        errorOnExist: true,
        force: false,
      });
    try {
      for (const name of names) {
        const destination = path.join(repositoryRoot, name);
        if (await exists(destination)) {
          await rename(destination, path.join(backupRoot, name));
          backedUp.push(name);
        }
        await rename(path.join(stagedRoot, name), destination);
        installed.push(name);
      }
    } catch (error) {
      // Roll back only the same whitelisted paths if installation fails.
      try {
        for (const name of installed.reverse())
          await rm(path.join(repositoryRoot, name), { recursive: true, force: true });
        for (const name of backedUp.reverse())
          await rename(path.join(backupRoot, name), path.join(repositoryRoot, name));
      } catch (rollbackError) {
        removeStaging = false;
        throw new AggregateError(
          [error, rollbackError],
          `Installation and rollback failed. Recoverable backups remain at ${backupRoot}.`,
        );
      }
      throw error;
    }
  } finally {
    if (removeStaging) await rm(stagingRoot, { recursive: true, force: true });
  }
  console.log(
    `Published ${names.join(', ')} to the repository root. Existing project directories were not touched.`,
  );
}

publish().catch((error) => {
  console.error(`Portfolio publish failed: ${error.message}`);
  process.exitCode = 1;
});
