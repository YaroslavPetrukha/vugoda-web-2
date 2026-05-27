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
  '/investoram': 'app/routes/investoram.tsx',
  '/partneram': 'app/routes/partneram.tsx',
  '/kontakty': 'app/routes/kontakty.tsx',
  '/novyny': 'app/routes/novyny.tsx',
  '/novyny/lakeview-progress-2026-04-05':
    'src/content/articles/lakeview-progress-2026-04-05.tsx',
  '/novyny/chek-list-pereveryty-zabudovnyka':
    'src/content/articles/chek-list-pereveryty-zabudovnyka.tsx',
  '/novyny/frankivskyi-raion-lokatsiia-lviv':
    'src/content/articles/frankivskyi-raion-lokatsiia-lviv.tsx',
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
  // pipeline routes (etno-dim, maetok, nterest, pipeline-04) excluded — they are noindex
  { path: '/investoram', priority: 0.8, changefreq: 'monthly' },
  { path: '/partneram', priority: 0.6, changefreq: 'monthly' },
  { path: '/kontakty', priority: 0.8, changefreq: 'monthly' },
  { path: '/novyny', priority: 0.8, changefreq: 'weekly' },
  { path: '/novyny/lakeview-progress-2026-04-05', priority: 0.7, changefreq: 'monthly' },
  { path: '/novyny/chek-list-pereveryty-zabudovnyka', priority: 0.7, changefreq: 'monthly' },
  { path: '/novyny/frankivskyi-raion-lokatsiia-lviv', priority: 0.7, changefreq: 'monthly' },
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
