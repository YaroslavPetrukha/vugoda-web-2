import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = process.env.VITE_SITE_URL ?? 'https://vyhoda.lviv.ua';
const TODAY = new Date().toISOString().split('T')[0];

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
    <lastmod>${TODAY}</lastmod>
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
