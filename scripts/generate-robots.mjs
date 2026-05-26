import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://vyhoda.lviv.ua').trim().replace(/\/$/, '');

const content = `User-agent: *
Allow: /

# AI crawlers (для AI search) — Phase 2 SEO research §6
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const OUT = path.join(process.cwd(), 'build', 'client', 'robots.txt');
fs.writeFileSync(OUT, content, 'utf8');
console.log(`[generate-robots] Wrote ${OUT}`);
