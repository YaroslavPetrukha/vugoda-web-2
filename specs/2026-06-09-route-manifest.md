# Spec — Route-manifest unification

**Date:** 2026-06-09 · **Size:** M · **Research:** `thoughts/research/2026-06-09-route-manifest-unification.md`

## Problem
Маршрути сайту дублюються у 5 джерелах (react-router.config, catchall, sitemap, rss, articles.ts). Ручна синхронізація вже спричинила **3 production-404** (Phase 6, 14, 20). Потрібне єдине джерело правди для структури URL.

## Goal
Один `shared/route-manifest.mjs` — канонічне джерело route-патів, article-slug-ів, sitemap-атрибутів і API-endpoint-ів. Усі консьюмери деривують із нього. Додавання/видалення маршруту чи статті = редагування ОДНОГО місця; розсинхрон = провал тесту/білда.

## Scope
- Новий `shared/route-manifest.mjs` (pure data, без node/React deps).
- Рефактор консьюмерів на імпорт із manifest: `react-router.config.ts`, `functions/[[catchall]].ts`, `scripts/generate-sitemap.mjs`, `scripts/generate-rss.mjs`.
- Drift-guard `tests/unit/route-manifest.test.ts`.
- **Out of scope (locked):** централізація article CONTENT meta (title/desc/category) — статті лишають власний контент у `.tsx`; guard-тест ловить slug-розсинхрон.

## Acceptance Criteria
- **AC1.** `shared/route-manifest.mjs` експортує: `STATIC_ROUTES` (`{path,file,sitemap:{priority,changefreq}|null}`), `ARTICLE_SLUGS`, `ARTICLE_SITEMAP`, `API_ENDPOINTS` + derived `articleRoutes`, `prerenderRoutes`, `indexableRoutes`. Pure data, без `fs/path/process`, без React.
- **AC2.** `react-router.config.ts` `prerender` = `prerenderRoutes` (нуль route-літералів локально).
- **AC3.** `functions/[[catchall]].ts` `KNOWN_PRERENDERED_ROUTES` = `new Set([...prerenderRoutes,'/404/index.html'])`, `KNOWN_API_ENDPOINTS` = `new Set(API_ENDPOINTS)`. **Поведінка ідентична** поточній (той самий фінальний набір шляхів, включно з `.data` fix Phase 20).
- **AC4.** `generate-sitemap.mjs` ітерує `indexableRoutes` (path + priority/changefreq + file для lastmod). Вивід **байт-у-байт** як зараз (ті самі 11 URL, атрибути, порядок).
- **AC5.** `generate-rss.mjs` деривує slug-список/links із `ARTICLE_SLUGS`. RSS вивід еквівалентний (3 items, ті самі links).
- **AC6.** Drift-guard тест: `ARTICLE_SLUGS` === slugs з `articles.ts` === файли `src/content/articles/*.tsx`; кожен `STATIC_ROUTES.file` існує; `prerenderRoutes` покриває всі catchall-маршрути.
- **AC7.** Gates: tsc 0, lint 0, vitest green (+ новий тест), build green, **diff sitemap.xml / feed.xml порожній** проти поточного проду (no behaviour change).
- **AC8.** Live regression: після деплою всі маршрути + article `.data` + sitemap/feed працюють як раніше (нічого не зламано).

## Constraints
- Manifest формат `.mjs` (єдиний, що його їдять усі 3 середовища: node scripts, Vite/RR TS config, CF Workers bundle).
- Не змінювати фактичну множину prerendered/indexable маршрутів — це **рефактор**, не зміна поведінки.
- Зберегти Phase 20 `.data` fix у catchall (STATIC_EXT).

## Non-Goals
- Article content meta unification.
- Зміна SEO-атрибутів, додавання/видалення маршрутів.
- llms.txt автогенерація.
