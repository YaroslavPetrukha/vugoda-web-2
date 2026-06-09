// Single source of truth for the site's URL structure.
//
// Consumed by ALL route surfaces so they can never drift (the cause of 3
// production 404s — Phase 6, 14, 20):
//   - react-router.config.ts   → prerender list
//   - functions/[[catchall]].ts → known-route + API allow-lists
//   - scripts/generate-sitemap.mjs → indexable URLs + SEO attrs
//   - scripts/generate-rss.mjs  → article slug list
//
// Format is plain-data `.mjs` on purpose: it must import cleanly into THREE
// runtimes with zero extra tooling — Node (build scripts), Vite/RR TS config,
// and the Cloudflare Workers bundle (Functions, via esbuild). So: NO Node
// built-ins (fs/path/process), NO React, no side effects — just exported data.
//
// Adding/removing a route or article? Edit ONLY this file. A drift-guard test
// (tests/unit/route-manifest.test.ts) fails the build if anything falls out of
// sync with the article files on disk.

/**
 * @typedef {{ priority: number, changefreq: string }} SitemapAttrs
 * @typedef {{ path: string, file: string | null, sitemap: SitemapAttrs | null }} StaticRoute
 *   `sitemap: null` ⇒ route is prerendered but NOT in sitemap.xml (noindex:
 *   pipeline projects, /diakuyu, /404). `file` drives <lastmod> via git log.
 */

/** @type {StaticRoute[]} */
export const STATIC_ROUTES = [
  { path: '/',                  file: 'app/routes/_index.tsx',           sitemap: { priority: 1.0, changefreq: 'weekly' } },
  { path: '/pidkhid',           file: 'app/routes/pidkhid.tsx',          sitemap: { priority: 0.7, changefreq: 'monthly' } },
  { path: '/portfolio',         file: 'app/routes/portfolio._index.tsx', sitemap: { priority: 0.9, changefreq: 'weekly' } },
  { path: '/portfolio/lakeview', file: 'app/routes/portfolio.lakeview.tsx', sitemap: { priority: 0.9, changefreq: 'weekly' } },
  // Pipeline projects — noindex (follow), excluded from sitemap.
  { path: '/portfolio/etno-dim',    file: 'app/routes/portfolio.etno-dim.tsx',    sitemap: null },
  { path: '/portfolio/maetok',      file: 'app/routes/portfolio.maetok.tsx',      sitemap: null },
  { path: '/portfolio/nterest',     file: 'app/routes/portfolio.nterest.tsx',     sitemap: null },
  { path: '/portfolio/pipeline-04', file: 'app/routes/portfolio.pipeline-04.tsx', sitemap: null },
  { path: '/investoram',        file: 'app/routes/investoram.tsx',       sitemap: { priority: 0.8, changefreq: 'monthly' } },
  { path: '/partneram',         file: 'app/routes/partneram.tsx',        sitemap: { priority: 0.6, changefreq: 'monthly' } },
  { path: '/kontakty',          file: 'app/routes/kontakty.tsx',         sitemap: { priority: 0.8, changefreq: 'monthly' } },
  { path: '/novyny',            file: 'app/routes/novyny.tsx',           sitemap: { priority: 0.8, changefreq: 'weekly' } },
  // Thank-you — conversion page, noindex, prerendered for clean URL tracking.
  { path: '/diakuyu',           file: 'app/routes/diakuyu.tsx',          sitemap: null },
  // Catch-all 404 — prerendered (rendered by app/routes/$.tsx) so CF serves 404.
  { path: '/404',               file: null,                              sitemap: null },
];

/**
 * Article slugs for the dynamic /novyny/:slug route.
 * Each MUST have a matching src/content/articles/<slug>.tsx (slug === filename).
 * Article CONTENT metadata (title/description/category) lives in those .tsx
 * files — this list is only the canonical slug set. The drift-guard test
 * asserts: this === src/data/articles.ts slugs === files on disk.
 * @type {string[]}
 */
export const ARTICLE_SLUGS = [
  'lakeview-progress-2026-04-05',
  'chek-list-pereveryty-zabudovnyka',
  'frankivskyi-raion-lokatsiia-lviv',
];

/** Sitemap defaults shared by every article. @type {SitemapAttrs} */
export const ARTICLE_SITEMAP = { priority: 0.7, changefreq: 'monthly' };

/** Real API endpoints (functions/api/*.ts). Keep in sync with that dir. @type {string[]} */
export const API_ENDPOINTS = ['/api/contact', '/api/form-token'];

// ── Derived ────────────────────────────────────────────────────────────────

/** Article URL paths. @type {string[]} */
export const articleRoutes = ARTICLE_SLUGS.map((slug) => `/novyny/${slug}`);

/**
 * Every prerendered path — for react-router.config prerender + catchall allow-list.
 * @type {string[]}
 */
export const prerenderRoutes = [
  ...STATIC_ROUTES.map((r) => r.path),
  ...articleRoutes,
];

/**
 * Indexable routes for sitemap.xml — static routes with sitemap attrs, then
 * every article. Order is preserved to keep sitemap.xml output stable.
 * @type {{ path: string, file: string | null, sitemap: SitemapAttrs }[]}
 */
export const indexableRoutes = [
  ...STATIC_ROUTES.filter((r) => r.sitemap !== null).map((r) => ({
    path: r.path,
    file: r.file,
    sitemap: /** @type {SitemapAttrs} */ (r.sitemap),
  })),
  ...ARTICLE_SLUGS.map((slug) => ({
    path: `/novyny/${slug}`,
    file: `src/content/articles/${slug}.tsx`,
    sitemap: ARTICLE_SITEMAP,
  })),
];
