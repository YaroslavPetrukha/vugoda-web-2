# Research — Route-manifest unification

**Date:** 2026-06-09 · **Size:** M · bulletproof Stage 1
**Trigger:** 3-й production-404 від whitelist-drift у catchall (Phase 6, 14, 20). Маршрути дублюються у 5 місцях → треба single source of truth.

## Поточні джерела правди (дублювання)

| Surface | Що містить | Формат |
|---|---|---|
| `react-router.config.ts` | `ARTICLE_SLUGS` + `prerender[]` (усі статичні + статті + /diakuyu + /404) | TS |
| `functions/[[catchall]].ts` | `KNOWN_PRERENDERED_ROUTES` Set (усі + `/404/index.html`) + `KNOWN_API_ENDPOINTS` | TS (CF Worker) |
| `scripts/generate-sitemap.mjs` | `FILE_MAP` (route→file для lastmod) + `ROUTES[]` (тільки indexable + priority/changefreq) | node .mjs |
| `scripts/generate-rss.mjs` | `ARTICLES[]` (slug + **title/description/publishedAt/categoryLabel**) | node .mjs |
| `src/data/articles.ts` | article registry (імпортує `metadata` з .tsx) — slug derived з .tsx ✅ | TS (React) |
| article `*.tsx` | `export const metadata` (slug, title, description, excerpt, hero, …) | TSX |

**Списки НЕ ідентичні:** catchall має все + `/404/index.html`; config має все + `/404`; sitemap — лише indexable (без pipeline noindex, /diakuyu, /404) + SEO-атрибути. Тому manifest має кодувати per-route атрибути (indexable? priority/changefreq? source file?), а не один плаский список.

**Знайдений drift (доказ цінності):** rss `categoryLabel: 'Аналіз ринку'` для frankivskyi, а `.tsx` metadata = `'Аналітика'`. Тихий розсинхрон у проді.

## Технічні обмеження (вирішені)

1. **CF Pages Functions МОЖУТЬ імпортувати модулі поза `functions/`** — підтверджено офіційно (esbuild bundling) І емпірично: `functions/api/contact.ts` вже імпортує `../../shared/contact-schema`, `../../src/lib/sanitize`, `../../src/lib/phone-ua`, `../../shared/disposable-emails`. Є готова `shared/` директорія.
2. **Формат:** `.mjs` plain-data export — єдиний формат, що його споживають ВСІ три середовища без додаткового тулінгу: node scripts (нативно), Vite/RR config + catchall TS (через esbuild/vite), CF Workers bundle (esbuild inline). `.json` уникати (не документований для Workers import). `.ts` не годиться для node .mjs scripts без TS-loader.
3. **tsconfig:** `allowJs:true` + `moduleResolution:bundler` → TS-консьюмери імпортують `.mjs` з типами (JSDoc) без окремого `.d.ts`.
4. **Runtime:** manifest має бути pure-data, **без** node built-ins (fs/path/process), без React — щоб бандлитись у Worker і імпортуватись у .tsx/браузер.
5. **slug === filename** для всіх 3 статей (`frankivskyi-raion-lokatsiia-lviv.tsx` → slug `frankivskyi-raion-lokatsiia-lviv`) → можна валідувати glob-ом у тесті.

## Рекомендація

`shared/route-manifest.mjs` (pure data) = єдине джерело структури URL:
- `STATIC_ROUTES[]` — `{ path, file, sitemap: {priority,changefreq}|null }` (null = noindex, не в sitemap).
- `ARTICLE_SLUGS[]`, `ARTICLE_SITEMAP` defaults.
- `API_ENDPOINTS[]`.
- derived: `articleRoutes`, `prerenderRoutes` (для config + catchall), `indexableRoutes` (для sitemap).

Консьюмери імпортують → нуль route-літералів поза manifest:
- `react-router.config.ts` → `prerender: prerenderRoutes`.
- `functions/[[catchall]].ts` → `new Set([...prerenderRoutes,'/404/index.html'])` + `new Set(API_ENDPOINTS)`.
- `generate-sitemap.mjs` → ітерує `indexableRoutes`.
- `generate-rss.mjs` → slug-список/links з `ARTICLE_SLUGS`.

**Drift-guard:** `tests/unit/route-manifest.test.ts` — manifest `ARTICLE_SLUGS` === `articles.ts` slugs === `src/content/articles/*.tsx` файли на диску; кожен `STATIC_ROUTES.file` існує. → новий маршрут/стаття без manifest-запису = провал тесту (ніколи більше тихих 404).

**Відкритий фork (article CONTENT meta):** чи централізувати title/desc/category статей у manifest (kills categoryLabel-drift, але торкається 3 .tsx) — рішення user (див. spec/plan).

## Джерела
developers.cloudflare.com/pages/functions/module-support · /typescript · /routing · workers/wrangler/bundling
