# Plan — Route-manifest unification

**Spec:** `specs/2026-06-09-route-manifest.md` · **Branch:** `feature/route-manifest`

## Challenge Log
1. **Solves the problem?** Так — manifest стає єдиним джерелом; усі 4 infra-консьюмери деривують; guard-тест унеможливлює тихий розсинхрон (AC1-6). Прямо закриває 404-клас (Phase 6/14/20).
2. **Most efficient?** Альтернативи: (a) залишити 5 копій + лише тест-гард — відхилено (дублювання лишається, легко забути оновити одне місце); (b) повна централізація article content — відхилено user (вищий ризик, торкається рендеру статей); (c) **`.mjs` manifest + derive** — ✅ обрано: 1 джерело, працює в усіх 3 середовищах (доведено: `functions/api/*` вже імпортує `shared/`), нуль нового тулінгу.
3. **Code for code's sake?** Ні — це чистий рефактор поведінково-нейтральний (AC7: sitemap/feed byte-identical). categoryLabel-drift fix — окрема дрібна корекція, бо знайдено в процесі.

## Architecture
`shared/route-manifest.mjs` (pure data) → derived helpers → імпортується усіма. Поведінка не змінюється (та сама множина маршрутів). Guard-тест зв'язує manifest ↔ articles.ts ↔ файли на диску.

## Phase 1 (single, M)
**Files:**
1. `shared/route-manifest.mjs` (new) — JSDoc-typed pure data:
   - `STATIC_ROUTES` = `[{path,file,sitemap:{priority,changefreq}|null}]` у поточному порядку (incl pipeline noindex → sitemap:null; /diakuyu, /404 → sitemap:null).
   - `ARTICLE_SLUGS`, `ARTICLE_SITEMAP={priority:0.7,changefreq:'monthly'}`, `API_ENDPOINTS=['/api/contact','/api/form-token']`.
   - derived: `articleRoutes`, `prerenderRoutes=[...STATIC paths,...articleRoutes]`, `indexableRoutes=[...STATIC(sitemap≠null),...articles(ARTICLE_SITEMAP)]`.
2. `react-router.config.ts` (edit) — `import {prerenderRoutes}`; `prerender: prerenderRoutes`; прибрати локальний ARTICLE_SLUGS.
3. `functions/[[catchall]].ts` (edit) — `import {prerenderRoutes,API_ENDPOINTS}`; `KNOWN_PRERENDERED_ROUTES=new Set([...prerenderRoutes,'/404/index.html'])`; `KNOWN_API_ENDPOINTS=new Set(API_ENDPOINTS)`. STATIC_EXT (Phase 20 `.data`) НЕ чіпати.
4. `scripts/generate-sitemap.mjs` (edit) — `import {indexableRoutes}`; ітерувати їх (path, sitemap.priority/changefreq, file→gitLastmod). Прибрати FILE_MAP+ROUTES.
5. `scripts/generate-rss.mjs` (edit) — `import {ARTICLE_SLUGS}`; CONTENT map keyed by slug; assert `keys===ARTICLE_SLUGS`; iterate. Виправити categoryLabel-drift (узгодити з .tsx). Оновити «keep in sync» коментар.
6. `tests/unit/route-manifest.test.ts` (new) — guard (TDD).

**Drift-guard test assertions:**
- `ARTICLE_SLUGS` (sorted) === `articles.ts` slugs === basename `src/content/articles/*.tsx` (sorted).
- кожен `STATIC_ROUTES.file` (де ≠null) існує на диску.
- `prerenderRoutes` ⊇ кожен article route + усі static paths; нема дублікатів.
- `indexableRoutes` ⊆ `prerenderRoutes`; жоден noindex (pipeline/diakuyu/404) не в indexable.

**Edge cases:**
- order prerender/catchall — нерелевантний (array prerender + Set). sitemap order ЗБЕРЕГТИ (indexable statics→articles) для byte-identical.
- `.mjs` import у TS — `allowJs:true` → типи з JSDoc, tsc OK.
- CF Worker import `../../shared/route-manifest.mjs` — доведено (api/contact вже так робить).
- node script import `.mjs` — нативно.

## Gates
`tsc --noEmit` · `lint` · `vitest` (+guard) · `build` + **diff**: зберегти поточні `build/client/sitemap.xml` і `feed.xml`, перебілдити, `diff` → порожньо (AC7).

## Verification
Build → diff sitemap/feed (byte-identical). Post-deploy: spot-check кілька маршрутів + article `.data` + /sitemap.xml + /feed.xml.
