// Verifies build output structure after react-router build.
// Phase 1: checks build/client/ exists with 13 per-route index.html files.
// Phase 2+ TODO: enforce unique titles + JSON-LD + no legacy paths in HTML.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const BUILD_DIR = path.join(ROOT, 'build', 'client');

const PRERENDERED_ROUTES = [
  '/',
  '/pidkhid',
  '/portfolio',
  '/portfolio/lakeview',
  '/portfolio/etno-dim',
  '/portfolio/maetok',
  '/portfolio/nterest',
  '/portfolio/pipeline-04',
  '/investoram',
  '/partneram',
  '/kontakty',
  '/novyny',
];

function fail(msg) {
  console.error(`[verify-build] FAIL: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`[verify-build] OK: ${msg}`);
}

if (!fs.existsSync(BUILD_DIR)) fail(`Build directory missing: ${BUILD_DIR}`);
pass('build/client/ exists');

// Перевіряємо кожен prerendered маршрут
for (const route of PRERENDERED_ROUTES) {
  const indexPath = path.join(BUILD_DIR, route, 'index.html');
  if (!fs.existsSync(indexPath)) fail(`Missing prerendered page: ${indexPath}`);
  pass(`prerendered: ${route}`);
}

// Перевіряємо відсутність legacy paths у build output
let legacyFound = false;
for (const route of PRERENDERED_ROUTES) {
  const indexPath = path.join(BUILD_DIR, route, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  if (html.includes('/vugoda-web-2/')) {
    console.error(`[verify-build] FAIL: legacy path found in ${route}/index.html`);
    legacyFound = true;
  }
}
if (legacyFound) process.exit(1);
pass('no legacy /vugoda-web-2/ paths in HTML output');

console.log('[verify-build] All checks passed');
