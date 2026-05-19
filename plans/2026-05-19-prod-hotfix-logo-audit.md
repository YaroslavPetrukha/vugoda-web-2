# Plan — Prod 404 hotfix + Logo brand fix

**Дата:** 2026-05-19
**Розмір:** M (lightweight per-phase)
**Research:** [`thoughts/research/2026-05-19-prod-404-logo-audit.md`](../thoughts/research/2026-05-19-prod-404-logo-audit.md)

## Challenge Log

1. **Does this solve the problem?**
   - Phase A: Так. Whitelist унеможливлює перехоплення prerendered routes. Acceptance: `curl /` → 200, `curl /non-existent` → 404.
   - Phase B: Так. Logo на `bg-bg-deep` (#020A0A) тепер відповідає брендбуку (стор. 13).

2. **Most efficient solution?**
   - Phase A (catchall): whitelist обрано над probe (`next()`) бо memo lesson #2 каже CF Pages serve `__spa-fallback.html`/`/index.html` навіть після postbuild-cleanup — `next()` не дасть достовірного 404.
   - Phase A (catchall): whitelist обрано над removal бо memo Phase 5d показав що `_redirects /* 404` не повертає 404 status.
   - Phase B (logo): додавання нового asset + 1-рядкова зміна — найпростіше.

3. **Code for code's sake?**
   - Phase A: ні. 1 файл, мінімальна логіка.
   - Phase B: ні. 1 copy, 1 edit. Variant prop API НЕ додаю — YAGNI (один use-case: всюди bg-bg-deep).

## Acceptance criteria

**Phase A (prod hot-fix):**
- ✅ `curl -sI https://vugoda-web-2.pages.dev/` → HTTP 200
- ✅ `curl -sI https://vugoda-web-2.pages.dev/portfolio/lakeview` → HTTP 200
- ✅ `curl -sI https://vugoda-web-2.pages.dev/non-existent-12345` → HTTP 404
- ✅ Smoke tests pass (`npm run test`)
- ✅ Build verify pass (`npm run build:verify`)

**Phase B (brand fix):**
- ✅ `public/logo-black.svg` exists, identical to `brand-assets/logo/black.svg`
- ✅ `Logo.tsx` references `/logo-black.svg`
- ✅ `curl https://vugoda-web-2.pages.dev/logo-black.svg` → HTTP 200
- ✅ Build HTML містить `<img src="/logo-black.svg">` у `<nav>` і `<footer>`
- ✅ Tests pass

## Phase A — Catchall whitelist (BLOCKER)

**Files:**
- `functions/[[catchall]].ts` — додати whitelist `KNOWN_PRERENDERED_ROUTES`

**Implementation:**
```typescript
const KNOWN_PRERENDERED_ROUTES = new Set([
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
  '/404',
]);
```
+ нормалізація trailing slash (`/portfolio/` → `/portfolio`).
+ оновити коментар з правильним описом CF Pages routing order.

**Verification:**
1. Local build: `npm run build` — успіх
2. Smoke tests: `npm run test` — 13/13
3. Commit: `fix(prod): catchall whitelist для prerendered routes`
4. Push до `main` → CF Pages auto-deploy (~3 хв)
5. Curl 5 routes + 1 non-existent → expected statuses

## Phase B — Logo для чорного фону (brand)

**Files:**
- `public/logo-black.svg` (NEW) — copy з `brand-assets/logo/black.svg`
- `src/components/Logo.tsx` — `src="/logo-dark.svg"` → `src="/logo-black.svg"`

**JSON-LD у root.tsx — НЕ чіпаємо:** `logo-primary.svg` залишається для пошуковиків (preview на світлому фоні соцмереж).

**Verification:**
1. Build: `npm run build`
2. Перевірити `build/client/logo-black.svg` exists
3. Перевірити що HTML посилається на `/logo-black.svg`
4. Tests pass
5. Commit: `feat(brand): logo-black.svg для фону #020A0A`
6. Push → CF Pages auto-deploy
7. Curl `/logo-black.svg` → 200, curl `/` → HTML містить `logo-black.svg`

## Out of scope

- Variant prop API для Logo (YAGNI: один use-case)
- CI guard для синхронізації routes.ts ↔ whitelist (next iteration якщо routes змінюються)
- DNS міграція vyhoda.lviv.ua
- CF WAF rate limit
