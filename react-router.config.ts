import type { Config } from '@react-router/dev/config';

const ARTICLE_SLUGS = [
  'lakeview-progress-2026-04-05',
  'chek-list-pereveryty-zabudovnyka',
  'frankivskyi-raion-lokatsiia-lviv',
] as const;

export default {
  ssr: false,
  prerender: [
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
    // Thank-you page — conversion page, noindex, prerendered for clean URL tracking
    '/diakuyu',
    // Catch-all 404 — prerendered so CF Pages can serve it with 404 status
    // via _redirects rule: /* /404/index.html 404
    '/404',
  ],
  appDirectory: 'app',
} satisfies Config;
