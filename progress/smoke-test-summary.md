# Glибокий Smoke Test — Підсумок

**Date:** 2026-05-19
**Target:** `https://vugoda-web-2.pages.dev` (live на CF Pages)
**Тестували:** 5 спеціалізованих агентів (API Tester, Evidence Collector, Performance Benchmarker, SEO Specialist, Code Reviewer)

## 🔴 P0 BLOCKERS — реліз неможливий

| # | Issue | Source | Action |
|---|-------|--------|--------|
| 1 | **Turnstile widget НЕ рендериться** — production build використовує test key `1x00000000000000000000AA` замість `0x4AAAAAADR7M-xCIrkB62Ol`. Anti-bot OFF. Form = spam funnel. | Evidence Collector | User: verify `VITE_TURNSTILE_SITE_KEY` у CF Pages Production env vars + trigger redeploy (VITE_* baked at build time) |
| 2 | **Submit button enabled at first paint** — без turnstileToken можна submit | Evidence Collector | Code fix у `ContactForm.tsx` |
| 3 | **Rate limit ВІДСУТНІЙ** у backend — пряме порушення spec §5.3 ("5 req/60s → 429 + Retry-After") | Code Reviewer | Code fix у `functions/api/contact.ts` |
| 4 | **Client state machine deadlock** — на malformed JSON стан назавжди `submitting`, кнопка disabled, recovery тільки refresh | Code Reviewer | Code fix у `ContactForm.tsx:128-146` |
| 5 | **OG cross-domain broken** — canonical/og:image → `vyhoda.lviv.ua`, DNS=ECONNREFUSED. Facebook/Telegram/LinkedIn previews 404 + кешуються 30 днів | SEO Specialist | User: DNS delegation АБО env-aware build з pages.dev fallback |

## 🟠 P1 — варто до launch

| # | Issue | Source |
|---|-------|--------|
| 6 | Security headers відсутні на API responses (_headers не діє на Functions) | API Tester |
| 7 | 405 fallback повертає text/plain без Cache-Control | API Tester |
| 8 | Soft-404: `/non-existent` повертає 200 замість 404 — SEO + analytics noise | Performance Benchmarker |
| 9 | React error #418 (hydration mismatch) на 404 page | Evidence Collector |
| 10 | Phone regex приймає `+++++++++++` і `+12345678` — нема digit-count refinement | Code Reviewer |
| 11 | Duplicate `kontakty` + `contacts` у FORM_SOURCES enum | Code Reviewer |
| 12 | Race condition на double submit — потрібен useRef-lock | Code Reviewer |
| 13 | Telegram fetch без AbortController/timeout (Worker 30s burn-risk) | Code Reviewer |
| 14 | Telegram 429/5xx — нема retry, нема логування | Code Reviewer |
| 15 | Body size limit відсутній — DoS surface | Code Reviewer |
| 16 | `Picture-BZGE-1TC.js` 42KB Brotli на кожній сторінці — audit transitive deps | Performance |
| 17 | `ContactForm` 24.7KB preloaded на Lakeview (below fold) — lazy import | Performance |
| 18 | Stale `dist/` artifact у repo — старий Vite shell | SEO Specialist |

## 🟡 P2 — polish

| # | Issue |
|---|-------|
| 19 | 1px horizontal overflow на mobile home (376 vs 375) |
| 20 | Mobile dialog без видимого "✕" close button |
| 21 | SVG `logo-dark.svg`, `isometric-grid.svg` мають `max-age=0` — should be 1d+ |
| 22 | 6 Montserrat woff2 файлів (89.6KB) на кожній сторінці — Latin subset може бути unused (~56KB potential saving) |
| 23 | Constant salt у `hashIp` — слабка pseudonymization |
| 24 | Sitemap lastmod = global build date, не per-URL git log |
| 25 | Sitemap trailing-slash inconsistency (`/` vs bare URLs) |
| 26 | CSP/COOP/CORP не присутні (defensible для brochure site) |
| 27 | OG картки потребують long TTL cache headers |

## ✅ Що працює добре

| Категорія | Метрика |
|-----------|---------|
| **API endpoint** | 19/19 functional tests PASS (Origin/Honeypot/Turnstile/Zod) |
| **LCP /** mobile cold | 248ms (target 2100ms) — 88% headroom |
| **LCP /portfolio/lakeview/** mobile | 272ms — 87% headroom |
| **Lakeview total page weight** mobile AVIF | 478KB (target 1MB) — 52% headroom |
| **Initial JS** Brotli | 186KB (target 200KB gzip) — 7% headroom |
| **CLS** mobile | 0 ✓ |
| **CLS** desktop home | 0.0361 (good band, font swap likely) |
| **AVIF served correctly** | Chromium: 480w mobile, 1920w desktop |
| **Security headers HTML** | HSTS preload, XFO=DENY, XCTO=nosniff, Referrer, Permissions ✓ |
| **All 13 routes** | Loaded with NavBar/Footer/content, no white screens |
| **Routing without #** | ✓ |
| **Sitemap.xml** | 10 URLs valid XML |
| **Robots.txt** | AI crawlers allowed, Sitemap directive |
| **Honeypot logic** | Silent 200, no Telegram leak |
| **Telegram HTML escape** | All user inputs sanitized correctly |
| **Single-source Zod schema** | client + server, no drift |

## Plan

### Immediate (потребує user action)
1. **Перевір CF Pages env vars** — особливо `VITE_TURNSTILE_SITE_KEY=0x4AAAAAADR7M-xCIrkB62Ol` (Plaintext). Якщо додавав ПІСЛЯ deploy — потрібен Retry deployment з UI.
2. **DNS статус vyhoda.lviv.ua** — коли плануєш делегувати? Це блокер для соціальних shares.

### Code fixes (я можу зробити)
- Phase 5 mini-batch усіх P0 + P1 code issues
- Окремий branch `feature/phase-5-smoke-fixes`
- Сонет агент для кожної категорії (form fixes, backend hardening, perf optimization, SEO polish)

### Polish (P2)
- Окремо після launch

## Reports (повний детальний фактаж)
- `progress/smoke-test-api.md` — API endpoint tests
- `progress/smoke-test-ui.md` — UI visual smoke (Playwright)
- `progress/smoke-test-perf.md` — Performance + headers
- `progress/smoke-test-seo.md` — SEO + Schema.org (з обмеженнями tooling)
- `progress/smoke-test-code.md` — Code review Phase 4
