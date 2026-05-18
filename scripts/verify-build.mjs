// Verifies build output structure after vite build.
// Phase 0: lenient — just checks dist/ exists with index.html.
// Phase 1+ TODO: enforce 13 per-route index.html files + unique titles + no '/vugoda-web-2/' refs.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const BUILD_DIR = path.join(ROOT, 'dist'); // Phase 1: change to 'build/client'

function fail(msg) {
  console.error(`[verify-build] FAIL: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`[verify-build] OK: ${msg}`);
}

if (!fs.existsSync(BUILD_DIR)) fail(`Build directory missing: ${BUILD_DIR}`);
if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) fail('index.html missing in build');
pass('build/index.html exists');

// TODO Phase 1: iterate 13 routes, check unique titles, no legacy paths
// const ROUTES = ['/', '/pidkhid', '/portfolio', ...];
// for (const route of ROUTES) {
//   const indexPath = path.join(BUILD_DIR, route, 'index.html');
//   if (!fs.existsSync(indexPath)) fail(`Missing prerender: ${indexPath}`);
//   const html = fs.readFileSync(indexPath, 'utf8');
//   if (html.includes('/vugoda-web-2/')) fail(`Legacy path in ${route}`);
// }

console.log('[verify-build] All checks passed');
