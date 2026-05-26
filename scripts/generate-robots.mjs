import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://vyhoda.lviv.ua').trim().replace(/\/$/, '');
const IS_CANONICAL = SITE_URL.includes('vyhoda.lviv.ua');

const CANONICAL_URL = 'https://vyhoda.lviv.ua';

const previewContent = `# Preview / non-canonical deploy — crawling disabled to prevent duplicate-content indexation.
# Canonical domain: ${CANONICAL_URL}
User-agent: *
Disallow: /

Sitemap: ${CANONICAL_URL}/sitemap.xml
`;

const productionContent = `User-agent: *
Allow: /

# AI crawlers — must be explicit; * fallback alone is not enough for some bots.
# Google-Extended is required to be eligible for Google AI Overviews.
User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const content = IS_CANONICAL ? productionContent : previewContent;

const OUT = path.join(process.cwd(), 'build', 'client', 'robots.txt');
fs.writeFileSync(OUT, content, 'utf8');
console.log(`[generate-robots] Wrote ${OUT} (mode: ${IS_CANONICAL ? 'production' : 'preview-disallow'})`);
