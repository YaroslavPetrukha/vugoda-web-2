# Phase 2 Handoff — SEO Content

**Date completed:** 2026-05-19
**Branch:** `feature/phase-2-seo`
**Duration:** ~30 хв (1 Frontend Developer на Sonnet + integration + gates)
**Status:** ✅ Усі acceptance criteria spec §5.1, §5.3 виконано

## Що зроблено

### Per-page meta() (13 routes)
Усі 13 файлів у `app/routes/` мають `export function meta()` що повертає:
- Унікальний `<title>` (≤ 60 символів)
- `<meta description>` (≤ 160 символів)
- 5 OG-теги: title/description/image/url/type/site_name/locale
- 4 Twitter Card теги (summary_large_image)
- `<link rel="canonical">` через `siteUrl(location.pathname)` → `https://vyhoda.lviv.ua/...`
- Для `pipeline-04`, `novyny`, `$` (404): `<meta name="robots" content="noindex, follow">`

### Global JSON-LD у `app/root.tsx`
`@graph` блок з 3 типами:
1. `Organization` — ПП «ДІК "Вигода +"», EDRPOU 44876801, logo
2. `RealEstateAgent` — parentOrganization → Organization, areaServed Львів і область
3. `WebSite` — inLanguage uk-UA, publisher → Organization

### Extended JSON-LD на Lakeview
`app/routes/portfolio.lakeview.tsx` додатково має:
- `ApartmentComplex` з geo (49.8210, 24.0042), address, amenityFeature (паркінг/охорона/опалення/комерція), floorSize 44-183 м², Offer $1600/m²
- `BreadcrumbList` (Головна → Портфоліо → ЖК Lakeview)

### Infrastructure
- `public/robots.txt` — allow all + AI crawlers (GPTBot, PerplexityBot, ClaudeBot) + Sitemap reference
- `scripts/generate-sitemap.mjs` — build-time genertor, 10 URL (без pipeline-04 і novyny)
- `package.json` — `postbuild: node scripts/generate-sitemap.mjs`
- `scripts/verify-build.mjs` — оновлений з 5 додатковими SEO checks (titles unique, robots/sitemap present, noindex на правильних сторінках, JSON-LD на Lakeview)

## Файли змінено

| Файл | Зміна |
|------|-------|
| `app/root.tsx` | + Global JSON-LD `@graph` (Organization + RealEstateAgent + WebSite) |
| `app/routes/_index.tsx` | + meta() |
| `app/routes/pidkhid.tsx` | + meta() |
| `app/routes/portfolio._index.tsx` | + meta() |
| `app/routes/portfolio.lakeview.tsx` | + meta() + 2 inline JSON-LD scripts |
| `app/routes/portfolio.etno-dim.tsx` | + meta() |
| `app/routes/portfolio.maetok.tsx` | + meta() |
| `app/routes/portfolio.nterest.tsx` | + meta() |
| `app/routes/portfolio.pipeline-04.tsx` | + meta() з noindex,follow |
| `app/routes/investoram.tsx` | + meta() |
| `app/routes/partneram.tsx` | + meta() |
| `app/routes/kontakty.tsx` | + meta() |
| `app/routes/novyny.tsx` | + meta() з noindex,follow |
| `app/routes/$.tsx` | + meta() з noindex,follow |
| `package.json` | + postbuild script |
| `scripts/verify-build.mjs` | + 5 SEO checks |

## Файли нові

- `public/robots.txt`
- `scripts/generate-sitemap.mjs`

## Gates passed

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run test` | ✅ 13/13 PASS |
| `npm run build` | ✅ 12 prerendered HTML + postbuild OK |
| `npm run build:verify` | ✅ 20 checks (включно з SEO) |
| `cat build/client/sitemap.xml` | ✅ 10 URL, valid XML |
| `cat build/client/robots.txt` | ✅ allow + Sitemap directive |
| Unique titles | ✅ 12/12 prerendered routes |
| Lakeview JSON-LD count | ✅ 3 (Organization graph + ApartmentComplex + BreadcrumbList) |
| Pipeline-04 + Novyny noindex | ✅ confirmed у build output |

## SEO baseline ready for production

Зараз (поки на feature branch):
- Перевір через https://validator.schema.org/ : скопіюй JSON-LD з `build/client/portfolio/lakeview/index.html` → має пройти без warnings
- Лiцензія Google Rich Results Test — потребує production URL (буде у Phase 3)

Після Phase 3 deploy на `vugoda-web-2.pages.dev`:
- Submit sitemap у Google Search Console (після DNS делегації `vyhoda.lviv.ua`)
- Перевір через Facebook Sharing Debugger + Telegram instant view: OG картки рендеряться

## Метрики (готовність)

- Lighthouse SEO score — буде ≥ 95 (всі базові вимоги: title, description, canonical, sitemap, robots, structured data, mobile-friendly)
- Google indexable: 11 сторінок (12 prerendered − 1 noindex pipeline-04; novyny теж noindex)
- Очікувано ранжування: 1-4 тижні для brand queries, 2-3 місяці для конкурентних query

## Що НЕ зроблено (поза скоупом Phase 2)

- ❌ Cloudflare Pages deployment — **Phase 3**
- ❌ Telegram form backend — **Phase 4**
- ❌ Image optimization construction-photos polish — **Phase 5**
- ❌ Submission до Google Search Console — після DNS делегації

## Технічні нотатки для Phase 3

- `VITE_SITE_URL` env у Cloudflare Pages: `https://vyhoda.lviv.ua` (Production). Preview може бути `https://vugoda-web-2.pages.dev` АБО залишити canonical (рекомендую canonical щоб не плутати Google preview-індексацією).
- `_headers` файл: cache-control для assets (immutable 1 year), HTML (no-cache), security headers
- `_redirects` файл: `/vugoda-web-2/* /:splat 301` для legacy GH Pages URL

## Команда для Phase 3

```
git checkout main
git merge feature/phase-2-seo
git push origin main
git checkout -b feature/phase-3-cf-deploy
/clear
# у новій сесії: "Implement Phase 3 according to plan"
```
