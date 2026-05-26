import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://vyhoda.lviv.ua').trim().replace(/\/$/, '');

const CANONICAL_URL = 'https://vyhoda.lviv.ua';

// Detect deployment environment. CF Pages auto-injects CF_PAGES_BRANCH and CF_PAGES
// on every build. A production deploy is one of:
//   (a) CF Pages build on the main branch
//   (b) local build (no CF_PAGES env var — assume operator intent is production-targeted)
// Anything else (PR previews, branch previews) gets a Disallow: / robots.txt so we
// never compete with the canonical domain for the same content.
const CF_BRANCH = process.env.CF_PAGES_BRANCH;
const IS_CF_PREVIEW = process.env.CF_PAGES === '1' && CF_BRANCH && CF_BRANCH !== 'main';
const IS_NON_CANONICAL_URL = !SITE_URL.includes('vyhoda.lviv.ua');
const IS_PREVIEW = IS_CF_PREVIEW || IS_NON_CANONICAL_URL;

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

const content = IS_PREVIEW ? previewContent : productionContent;
const mode = IS_PREVIEW
  ? `preview-disallow (CF_PAGES_BRANCH=${CF_BRANCH ?? 'unset'}, SITE_URL=${SITE_URL})`
  : 'production';

const OUT = path.join(process.cwd(), 'build', 'client', 'robots.txt');
fs.writeFileSync(OUT, content, 'utf8');
console.log(`[generate-robots] Wrote ${OUT} (mode: ${mode})`);
