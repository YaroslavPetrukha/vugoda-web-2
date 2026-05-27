// Verifies build output structure after react-router build.
// Phase 1: checks build/client/ exists with 12 per-route index.html files.
// Phase 2: enforces unique titles, JSON-LD, noindex, robots.txt, sitemap.xml.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const BUILD_DIR = path.join(ROOT, 'build', 'client');

const ARTICLE_SLUGS = [
  'lakeview-progress-2026-04-05',
  'chek-list-pereveryty-zabudovnyka',
  'frankivskyi-raion-lokatsiia-lviv',
];

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
  ...ARTICLE_SLUGS.map((slug) => `/novyny/${slug}`),
  '/diakuyu',
];

// Routes that are in sitemap (excludes noindex routes)
// /novyny + article slugs are now indexed (Phase 13C launch), pipeline routes excluded.
const SITEMAP_ROUTES = [
  '/',
  '/pidkhid',
  '/portfolio',
  '/portfolio/lakeview',
  '/investoram',
  '/partneram',
  '/kontakty',
  '/novyny',
  ...ARTICLE_SLUGS.map((slug) => `/novyny/${slug}`),
];

// Pipeline routes + thank-you are noindex. /novyny is now indexable (Phase 13C).
const NOINDEX_ROUTES = [
  '/portfolio/pipeline-04',
  '/portfolio/etno-dim',
  '/portfolio/maetok',
  '/portfolio/nterest',
  '/diakuyu',
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

// Check each prerendered route exists
for (const route of PRERENDERED_ROUTES) {
  const indexPath = path.join(BUILD_DIR, route, 'index.html');
  if (!fs.existsSync(indexPath)) fail(`Missing prerendered page: ${indexPath}`);
  pass(`prerendered: ${route}`);
}

// Check no legacy paths in HTML output
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

// Check unique titles across all prerendered routes
const titles = new Set();
for (const route of PRERENDERED_ROUTES) {
  const indexPath = path.join(BUILD_DIR, route, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  if (!titleMatch) fail(`No <title> in ${route}`);
  const titleText = titleMatch[1];
  if (titles.has(titleText)) fail(`Duplicate title "${titleText}" found in ${route}`);
  titles.add(titleText);
}
pass(`${PRERENDERED_ROUTES.length} unique titles across all prerendered routes`);

// Check robots.txt exists and has Sitemap reference
const robotsPath = path.join(BUILD_DIR, 'robots.txt');
if (!fs.existsSync(robotsPath)) fail('Missing robots.txt in build/client/');
const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
if (!robotsTxt.includes('Sitemap:')) fail('robots.txt is missing Sitemap: directive');
pass('robots.txt present with Sitemap: directive');

// Check sitemap.xml exists and has enough URLs
const sitemapPath = path.join(BUILD_DIR, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) fail('Missing sitemap.xml in build/client/');
const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
const urlMatches = sitemapXml.match(/<url>/g);
if (!urlMatches || urlMatches.length < 10)
  fail(`sitemap.xml has only ${urlMatches?.length ?? 0} URLs, expected ≥ 10`);
pass(`sitemap.xml present with ${urlMatches.length} URLs`);

// Check noindex on pipeline-04 and novyny
for (const route of NOINDEX_ROUTES) {
  const indexPath = path.join(BUILD_DIR, route, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  if (!html.includes('content="noindex'))
    fail(`Missing noindex robots meta in ${route}/index.html`);
}
pass(`noindex robots meta present on ${NOINDEX_ROUTES.length} routes (pipeline + diakuyu)`);

// Check Lakeview has 3 JSON-LD blocks (global org + lakeview complex + breadcrumb)
const lakeviewPath = path.join(BUILD_DIR, '/portfolio/lakeview', 'index.html');
const lakeviewHtml = fs.readFileSync(lakeviewPath, 'utf8');
const lakeviewLdMatches = lakeviewHtml.match(/type="application\/ld\+json"/g);
if (!lakeviewLdMatches || lakeviewLdMatches.length < 3)
  fail(
    `lakeview/index.html has ${lakeviewLdMatches?.length ?? 0} JSON-LD blocks, expected ≥ 3`,
  );
pass(`lakeview/index.html has ${lakeviewLdMatches.length} JSON-LD blocks`);

console.log('[verify-build] All checks passed');
