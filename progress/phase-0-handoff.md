# Phase 0 Handoff — Prep & Safety net

**Date completed:** 2026-05-18
**Branch:** `feature/phase-0-prep`
**Duration:** ~30 хв (2 паралельні Sonnet-агенти + integration)
**Status:** ✅ Усі acceptance criteria виконано

## Що зроблено

### Test infrastructure
- `vitest.config.ts` — jsdom env, `@` alias, setupFiles
- `tests/setup.ts` — jest-dom matchers + IntersectionObserver/ResizeObserver мок-класи (потрібні через motion)
- `tests/smoke/pages.test.tsx` — 13 smoke-тестів на render всіх сторінок через MemoryRouter
- **Результат:** `npm run test` → 13/13 PASS

### Build verification
- `scripts/verify-build.mjs` — placeholder перевірки `dist/index.html`. **TODO Phase 1:** додати enforcement на 13 per-route index.html + унікальні titles + no legacy paths.
- `scripts/check-no-legacy-paths.mjs` — знаходить 40 legacy `/vugoda-web-2/` шляхів у src/. Поки non-enforcing. У Phase 1 — додати `prebuild: npm run check:paths:enforce`.

### Open Graph cards (11 файлів)
- `scripts/generate-og-cards.mjs` — SVG→PNG через sharp, брендована палітра
- `public/og/{home,approach,investors,partners,contacts,news,lakeview,etno-dim,maetok,nterest,pipeline-04}.png` — 1200×630 RGBA, 22-30 KB кожна (well under 200 KB ліміту)
- **Visual verified:** `home.png` рендерить з acid-lime accent, Montserrat-fallback typography, "ВИГОДА·" wordmark

### Infrastructure
- `.nvmrc` → `20.18.0` (для Cloudflare Pages NODE_VERSION)
- `simple-git-hooks` pre-commit: `npm run lint && npm run test`
- `.gitignore` додано: `.dev.vars`, `.wrangler/`, `node_modules/.vitest`

### Dependencies added
```
@testing-library/dom@^10.4.1
@testing-library/jest-dom@^6.9.1
@testing-library/react@^16.3.2
@vitest/ui@^4.1.6
jsdom@^29.1.1
sharp@^0.34.5
simple-git-hooks@^2.13.1
vitest@^4.1.6
```

## Що НЕ зроблено (свідомо — поза скоупом Phase 0)

- НЕ змінено `src/`, `vite.config.ts`, router — це для Phase 1
- НЕ active CI prebuild guard — Phase 1 активує `check:paths:enforce`
- НЕ self-hosted Montserrat — Phase 1 додає `@fontsource/montserrat`
- НЕ install Phase 1+ deps (react-router framework mode, vite-imagetools) — у Phase 1

## Gates passed

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run test` | ✅ 13/13 PASS |
| `npm run build` | ✅ 466 KB JS, 3.4s |
| `npm run build:verify` | ✅ exit 0 |
| `npm run check:paths` | ✅ found 40 legacy (expected) |
| Pre-commit hook executable | ✅ 238 bytes, `npm run lint && npm run test` |
| OG card visual | ✅ home.png renders correctly |

## Файли треба знати на Phase 1

**Створені у Phase 0 — використовуються у Phase 1:**
- `scripts/check-no-legacy-paths.mjs` — активувати через `"prebuild": "npm run check:paths:enforce"` після усунення legacy paths
- `scripts/verify-build.mjs` — оновити: change `BUILD_DIR = 'dist'` → `'build/client'`, додати ROUTES перевірку (13 per-route)
- `tests/smoke/pages.test.tsx` — оновити пости-Phase 1 для нової `app/routes/` структури
- `public/og/*.png` — використати у Phase 2 `og:image` meta-тегах

**Файли під видалення/велику зміну у Phase 1:**
- `src/App.tsx` (HashRouter wrapper) — DELETE
- `src/main.tsx` — replace з `entry.client.tsx`
- `src/routes.tsx` — replace з `app/routes.ts` (RR v7 framework mode)
- `index.html` — DELETE, replace з `app/root.tsx`
- 12 файлів зі legacy `/vugoda-web-2/` шляхами — replace на ESM imports

## Команда для Phase 1

```
git checkout main
git pull origin main
git checkout -b feature/phase-1-architecture
/clear
# у новій сесії:
# "Implement Phase 1 according to plan, не виходь за scope"
```

## Залишилось у TODO до production

- **Operational:** TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID отримані, чекають Phase 3 dashboard
- **Operational:** Cloudflare Pages account створити у Phase 3
- **Operational:** DNS vyhoda.lviv.ua — клієнт делегує у Phase 3-5
- **Architecture:** Schema.org Lakeview public data — узгодити з клієнтом перед Phase 2
