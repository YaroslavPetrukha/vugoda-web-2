import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://vyhoda.lviv.ua').trim().replace(/\/$/, '');
const TODAY = new Date().toISOString().split('T')[0];

// Map sitemap URL → source file used to derive lastmod via `git log -1 --format=%cs`.
// If git lookup fails (e.g. shallow CI clone, file removed) we fall back to TODAY.
const FILE_MAP = {
  '/': 'app/routes/_index.tsx',
  '/pidkhid': 'app/routes/pidkhid.tsx',
  '/portfolio': 'app/routes/portfolio._index.tsx',
  '/portfolio/lakeview': 'app/routes/portfolio.lakeview.tsx',
  '/portfolio/etno-dim': 'app/routes/portfolio.etno-dim.tsx',
  '/portfolio/maetok': 'app/routes/portfolio.maetok.tsx',
  '/portfolio/nterest': 'app/routes/portfolio.nterest.tsx',
  '/investoram': 'app/routes/investoram.tsx',
  '/partneram': 'app/routes/partneram.tsx',
  '/kontakty': 'app/routes/kontakty.tsx',
};

function gitLastmod(routePath) {
  const file = FILE_MAP[routePath];
  if (!file) return TODAY;
  try {
    const result = execSync(`git log -1 --format=%cs -- "${file}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return result || TODAY;
  } catch (err) {
    console.warn(`[sitemap] git lastmod fallback for ${routePath}: ${err.message?.slice(0, 200) || 'no message'}`);
    return TODAY;
  }
}

const ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/pidkhid', priority: 0.7, changefreq: 'monthly' },
  { path: '/portfolio', priority: 0.9, changefreq: 'weekly' },
  { path: '/portfolio/lakeview', priority: 0.9, changefreq: 'weekly' },
  { path: '/portfolio/etno-dim', priority: 0.7, changefreq: 'monthly' },
  { path: '/portfolio/maetok', priority: 0.7, changefreq: 'monthly' },
  { path: '/portfolio/nterest', priority: 0.7, changefreq: 'monthly' },
  // pipeline-04 excluded (noindex)
  { path: '/investoram', priority: 0.8, changefreq: 'monthly' },
  { path: '/partneram', priority: 0.6, changefreq: 'monthly' },
  { path: '/kontakty', priority: 0.8, changefreq: 'monthly' },
  // novyny excluded (noindex)
];

const urls = ROUTES.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${gitLastmod(r.path)}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const OUT = path.join(process.cwd(), 'build', 'client', 'sitemap.xml');
fs.writeFileSync(OUT, xml, 'utf8');
console.log(`[generate-sitemap] Wrote ${ROUTES.length} URLs to ${OUT}`);
