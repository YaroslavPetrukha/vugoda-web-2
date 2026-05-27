import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://vyhoda.lviv.ua')
  .trim()
  .replace(/\/$/, '');

// Article manifest kept in sync with `src/data/articles.ts` (3 article TSX modules).
// When adding a new article: append entry here AND in:
//   - src/data/articles.ts (manifest + body component import)
//   - react-router.config.ts (ARTICLE_SLUGS array)
//   - scripts/generate-sitemap.mjs (FILE_MAP + ROUTES)
const ARTICLES = [
  {
    slug: 'lakeview-progress-2026-04-05',
    title: 'Хід будівництва ЖК Lakeview: квітень–травень 2026',
    description:
      'Інверсійна покрівля першої секції, фасадні роботи та технічні умови на електропостачання — детальний звіт про будівництво ЖК Lakeview у Львові.',
    publishedAt: '2026-05-13',
    categoryLabel: 'Хід будівництва',
  },
  {
    slug: 'chek-list-pereveryty-zabudovnyka',
    title: 'Як перевірити забудовника перед купівлею: 8 пунктів',
    description:
      'Практичний чек-лист з 8 пунктів для перевірки забудовника в Україні. ЄДРПОУ, дозволи, договір, репутація — що перевіряти і де шукати.',
    publishedAt: '2026-05-26',
    categoryLabel: 'Гайди',
  },
  {
    slug: 'frankivskyi-raion-lokatsiia-lviv',
    title: 'Чому ми будуємо у Франківському районі Львова',
    description:
      'Аналіз локації Франківського району Львова: інфраструктура, демографія, ринок нерухомості та чому ЖК Lakeview розташований саме тут.',
    publishedAt: '2026-05-20',
    categoryLabel: 'Аналіз ринку',
  },
];

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(isoDate) {
  // Pad ISO date to noon UTC so RSS dates feel stable; RFC 822 requires day-of-week + offset.
  const d = new Date(`${isoDate}T12:00:00Z`);
  return d.toUTCString();
}

const sortedArticles = [...ARTICLES].sort((a, b) =>
  a.publishedAt < b.publishedAt ? 1 : -1,
);

const lastBuildDate = new Date().toUTCString();
const channelPubDate = toRfc822(sortedArticles[0]?.publishedAt ?? new Date().toISOString().slice(0, 10));

const items = sortedArticles
  .map((a) => {
    const link = `${SITE_URL}/novyny/${a.slug}`;
    return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(a.publishedAt)}</pubDate>
      <description>${escapeXml(a.description)}</description>
      <category>${escapeXml(a.categoryLabel)}</category>
    </item>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Новини ВИГОДА — забудовник Львів</title>
    <link>${SITE_URL}/novyny</link>
    <description>Хід будівництва ЖК Lakeview, гайди для покупців нерухомості та аналіз ринку Львова.</description>
    <language>uk-UA</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${channelPubDate}</pubDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

const OUT = path.join(process.cwd(), 'build', 'client', 'feed.xml');
fs.writeFileSync(OUT, xml, 'utf8');
console.log(`[generate-rss] Wrote ${ARTICLES.length} items to ${OUT}`);
