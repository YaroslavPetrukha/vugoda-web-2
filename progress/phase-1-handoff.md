# Phase 1 Handoff — Architecture Migration

**Date completed:** 2026-05-19
**Branch:** `feature/phase-1-architecture`
**Duration:** ~3 години (3 послідовні Sonnet-агенти + integration + gates)
**Status:** ✅ Усі acceptance criteria spec §5.1, §5.2 виконано

## Що зроблено (3 sub-stages)

### Phase 1A — Additive changes
- `src/components/ui/Picture.tsx` — компонент з AVIF/WebP/JPEG fallback ladder
- `src/lib/site-url.ts` — siteUrl() utility (для Phase 2 SEO)
- `src/index.css` — @fontsource/montserrat imports (self-host шрифту)
- `src/components/FadeIn.tsx` — `initial={false}` для SSG safety (G3 gap)

### Phase 1B — RR v7 framework mode + path migration
**Створено:**
- `react-router.config.ts` — `ssr: false, prerender: 12 routes`
- `app/root.tsx` — HTML shell з Meta/Links/Scripts/ScrollRestoration
- `app/entry.client.tsx` — HydratedRouter hydration entry
- `app/routes.ts` — RouteConfig з layout() для Layout.tsx
- 13 файлів у `app/routes/` (з міграцією контенту з src/pages/)

**Видалено:**
- `index.html` (корінь)
- `src/App.tsx`, `src/main.tsx`, `src/routes.tsx`
- `src/pages/` (13 файлів)

**Оновлено:**
- `vite.config.ts` — `reactRouter()` + `imagetools()` + прибрано `base: '/vugoda-web-2/'`
- `package.json` — scripts на `react-router dev/build`, додано `prebuild: check:paths:enforce`
- `scripts/check-no-legacy-paths.mjs` — сканує app/ теж
- `scripts/verify-build.mjs` — перевіряє `build/client/`
- `tests/smoke/pages.test.tsx` — імпорти з `@/app/routes/*`
- Компоненти: Layout, NavBar, Footer, Logo, PageHero, ProjectCard, ProjectGalleryStrip, IsometricCubePlaceholder, Button — `react-router-dom` → `react-router`, шляхи без `/vugoda-web-2/`

### Phase 1C — Image optimization pipeline
- `vite.config.ts` — presets (hero/card/gallery/construction) активовані
- `image-presets.d.ts` — ambient declarations для `?preset=...` ESM imports
- `vitest.config.ts` — імітація `?preset=` для тестового середовища
- `src/types.ts` — `cardImage?: string` → `PictureSource`
- `src/components/{PageHero,ProjectCard,ProjectGalleryStrip}.tsx` — `<img>` → `<Picture>` з `sizes`, priority для hero
- `app/routes/_index.tsx` — hero aerial з `?preset=hero` + `priority`
- `app/routes/portfolio.lakeview.tsx` — 7 renders + 12 construction з відповідними presets
- `app/routes/portfolio.{etno-dim,maetok,nterest}.tsx` — renders з gallery/hero presets
- `src/data/projects.ts` — cardImage imports з `?preset=card`

## Файли переміщено
- `public/projects/` → `src/assets/projects/` (19 файлів)
- `public/construction/` → `src/assets/construction/` (12 файлів)

## Файли залишилися у `public/`
SVG-шки + статичні файли:
- `favicon.svg`, `favicon-32.svg`, `logo-dark.svg`, `logo-primary.svg`, `mark.svg`, `isometric-grid.svg`
- `og/*.png` (11 OG-карток з Phase 0)

## Dependencies додано
- `react-router@7.15.1`, `react-router-dom@7.15.1` (upgraded з 7.14.2)
- `@react-router/dev@7.15.1` (devDep)
- `@react-router/node@7.15.1`
- `@fontsource/montserrat@5.x`
- `vite-imagetools@^7` (Vite 6 сумісний; v10 потребує Vite 7)

## Gates passed

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run test` | ✅ 13/13 PASS |
| `npm run build` | ✅ 12 prerendered HTML + SPA fallback |
| `npm run check:paths` | ✅ 0 legacy paths |
| `npm run check:paths:enforce` | ✅ exit 0 (активовано як prebuild) |
| `npm run build:verify` | ✅ exit 0 |
| Pre-commit hook | ✅ запускається |

## Image optimization метрики (Lakeview hero `aerial.jpg`)

| Variant | Size | Reduction vs original |
|---------|------|----------------------|
| Original JPG | 1.54 MB | baseline |
| AVIF 480w (mobile) | 17 KB | **-98.9%** |
| AVIF 768w | 37 KB | -97.6% |
| AVIF 1280w | 82 KB | -94.7% |
| AVIF 1920w | 388 KB | -75% |
| WebP 480w | 24 KB | -98.4% |
| JPEG fallback 480w | 24 KB | -98.4% |

**Build output:**
- 82 AVIF files
- 82 WebP files
- 0 raw JPG/WebP (все через imagetools)
- Total `build/client/`: 22 MB (включає всі variants — користувач отримує тільки 1 на запит)

## SEO impact (готовність до Phase 2)

✅ 12 фізичних `index.html` у `build/client/` для:
- `/`, `/pidkhid`, `/portfolio`, `/portfolio/lakeview`, `/portfolio/etno-dim`, `/portfolio/maetok`, `/portfolio/nterest`, `/portfolio/pipeline-04`, `/investoram`, `/partneram`, `/kontakty`, `/novyny`
- `__spa-fallback.html` для catch-all

✅ Google зможе індексувати кожну сторінку окремо (Phase 2 додасть per-page meta + JSON-LD)

## Що НЕ зроблено (відкладено)

- ❌ Per-page `meta()` функції — **Phase 2**
- ❌ Global Organization + RealEstateAgent JSON-LD у root.tsx — **Phase 2**
- ❌ `ApartmentComplex` JSON-LD на Lakeview — **Phase 2**
- ❌ `robots.txt`, `sitemap.xml` — **Phase 2**
- ❌ `noindex, follow` для pipeline-04 і novyny — **Phase 2**
- ❌ Cloudflare Pages deploy — **Phase 3**
- ❌ Telegram form backend — **Phase 4**

## Технічні нотатки для Phase 2

### Layout integration
`src/components/Layout.tsx` використовується через `layout('../src/components/Layout.tsx', [...])` у `app/routes.ts`. У Phase 2 при додаванні Schema.org у root.tsx — пам'ятай що Layout живе нижче по hierarchy.

### Meta function signature (RR v7)
```ts
export function meta({ data, params, location }: Route.MetaArgs): Route.MetaDescriptors {
  return [
    { title: '...' },
    { name: 'description', content: '...' },
    { property: 'og:title', content: '...' },
    { tagName: 'link', rel: 'canonical', href: siteUrl(location.pathname) },
  ];
}
```

### siteUrl() utility вже готовий
`src/lib/site-url.ts` — використовуй для absolute URLs у meta/og/canonical/sitemap.

## Команда для Phase 2

```
git checkout main
git merge feature/phase-1-architecture
git push origin main  # коли готовий
git checkout -b feature/phase-2-seo
/clear
# у новій сесії:
# "Implement Phase 2 according to plan"
```
