import { cp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staging = join(root, '.pages-build');
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/birdradar3315';
if (basePath !== '' && !/^\/[a-zA-Z0-9_-]+$/.test(basePath)) {
  throw new Error('NEXT_PUBLIC_BASE_PATH must be empty or a single /repository-name segment.');
}

// Build a disposable static project. Keep the normal API routes and running .next intact.
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
for (const entry of ['app', 'components', 'contexts', 'lib', 'utils', 'package.json', 'package-lock.json', 'next-env.d.ts', 'next.config.mjs', 'postcss.config.js', 'tailwind.config.js', 'tsconfig.json']) {
  await cp(join(root, entry), join(staging, entry), {
    recursive: true,
    filter: (source) => source !== join(root, 'app', 'api') && !source.endsWith('.DS_Store'),
  });
}
await symlink(join(root, 'node_modules'), join(staging, 'node_modules'), 'dir');
await cp(join(root, 'public'), join(staging, 'public'), {
  recursive: true,
  filter: (source) => {
    if (source.endsWith('.DS_Store') || source.endsWith('.prompt.txt') || source.endsWith('.webp.json')) return false;
    // Large original archive films are preserved in Git; only optimized derivatives are served.
    return !(dirname(source) === join(root, 'public', 'assets') && source.endsWith('.mp4'));
  },
});
for (const dir of ['assets/atlas', 'assets/films']) {
  for (const name of await readdir(join(staging, 'public', dir))) {
    if (name.endsWith('.mp4')) {
      const bytes = await readFile(join(staging, 'public', dir, name));
      if (bytes.subarray(0, 80).toString().startsWith('version https://git-lfs.github.com/spec/v1')) {
        throw new Error(`Missing video contents: ${dir}/${name}. Run git lfs pull for atlas and films.`);
      }
    }
  }
}
const result = spawnSync(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'build'], {
  cwd: staging,
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: 'true', NEXT_PUBLIC_BASE_PATH: basePath },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
await writeFile(join(staging, 'out', '.nojekyll'), '');
await rm(join(root, 'out'), { recursive: true, force: true });
await cp(join(staging, 'out'), join(root, 'out'), { recursive: true });
console.log(`Static site exported to web/out (base path: ${basePath || '/'}).`);
