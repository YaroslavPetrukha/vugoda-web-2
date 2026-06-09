import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
// Indexable routes (path + SEO attrs + source file) come from the single
// source of truth — see shared/route-manifest.mjs.
import { indexableRoutes } from '../shared/route-manifest.mjs';

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://vyhoda.lviv.ua').trim().replace(/\/$/, '');
const TODAY = new Date().toISOString().split('T')[0];

// lastmod derived from the route's source file via `git log -1 --format=%cs`.
// Falls back to TODAY if git lookup fails (shallow CI clone, file removed) or
// the route has no associated source file.
function gitLastmod(file) {
  if (!file) return TODAY;
  try {
    const result = execSync(`git log -1 --format=%cs -- "${file}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return result || TODAY;
  } catch (err) {
    console.warn(`[sitemap] git lastmod fallback for ${file}: ${err.message?.slice(0, 200) || 'no message'}`);
    return TODAY;
  }
}

const urls = indexableRoutes.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${gitLastmod(r.file)}</lastmod>
    <changefreq>${r.sitemap.changefreq}</changefreq>
    <priority>${r.sitemap.priority}</priority>
  </url>`,
).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const OUT = path.join(process.cwd(), 'build', 'client', 'sitemap.xml');
fs.writeFileSync(OUT, xml, 'utf8');
console.log(`[generate-sitemap] Wrote ${indexableRoutes.length} URLs to ${OUT}`);
