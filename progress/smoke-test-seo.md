# SEO Smoke Test Report — vugoda-web-2.pages.dev

**Audit date:** 2026-05-19
**Tester:** SEO Specialist agent
**Target:** `https://vugoda-web-2.pages.dev` (canonical: `vyhoda.lviv.ua`, DNS НЕ делегований)

## Tooling limitation
WebFetch у середовищі агента робить server-side HTML→markdown конверсію ПЕРЕД analysis. `<head>` section повністю не доступний для inspect. Підтверджено в 6 спробах.

## Що верифіковано

### Sitemap (`/sitemap.xml`) ✅ OK
- 10 `<url>` блоків (matches spec)
- Всі `<loc>` на `vyhoda.lviv.ua`
- pipeline-04 і novyny ВИКЛЮЧЕНІ
- `<lastmod>`, `<changefreq>`, `<priority>` присутні

### Robots.txt ✅ OK
- AI crawlers (GPTBot, PerplexityBot, ClaudeBot) explicitly allowed
- Sitemap directive → vyhoda.lviv.ua/sitemap.xml

### Всі 12 routes відповідають HTTP 200, рендерять реальний контент

### OG cards exist на pages.dev
- `/og/home.png` 28.8 KB ✓
- `/og/lakeview.png` 27.5 KB ✓
- `/og/pipeline-04.png` 23.9 KB ✓

## CRITICAL: OG cross-domain dead reference

DNS `vyhoda.lviv.ua` зараз = `ECONNREFUSED`.

Якщо `<meta property="og:image">` вказує на `https://vyhoda.lviv.ua/og/SLUG.png` (як canonical strategy):
- Facebook Sharing Debugger → 404
- Telegram bot preview → 404
- LinkedIn Post Inspector → 404
- Twitter Card validator → 404

**Соцпосиланнями НЕ можна користуватись до DNS handoff.** Facebook кешує OG cards ~30 днів — поганий share зараз → 30 днів зламаних previews.

### Mitigation options
- **A (recommended):** Override og:image, og:url, canonical → pages.dev до DNS handoff
- **B (cleanest):** Environment-aware build (VITE_SITE_URL = pages.dev now, → vyhoda.lviv.ua at DNS day)
- **C (accept):** Block social sharing до DNS resolves

## Інші знахідки

### CRIT-2: Stale `dist/` artifact
`/dist/index.html` існує в repo як bare Vite shell з hardcoded `/vugoda-web-2/` paths. НЕ використовується у deploy (CF builds від `build/client/`), але міг би редеплоїтись помилково.

**Fix:** delete `dist/` from working tree.

### CRIT-3: `<head>` audit blocked by tooling
Title, description, canonical, robots meta, JSON-LD payload НЕ можуть бути верифіковані через WebFetch. Потребує:
- `curl -s URL | grep` з shell
- АБО https://validator.schema.org/, https://search.google.com/test/rich-results

### Sitemap trailing-slash issue
Home `/`, інші pages bare (no trailing slash). pages.dev зараз serve both — переконатись що non-trailing-slash це canonical 200, інакше duplicate content.

### Sitemap lastmod hygiene
Усі entries share `lastmod=2026-05-18`. Reduces signal value over time. Wire per-URL git-log lastmod.

### Cache headers
- `/og/*.png` — потребує long TTL, immutable
- `/sitemap.xml` — short TTL ~1h

## Recommendations

### Must-fix before public launch (P0)
- Resolve DNS for vyhoda.lviv.ua
- Run real `<head>` validation з shell
- Decide OG cross-domain strategy

### P1
- Sitemap trailing-slash audit
- Cache headers /og/*.png, /sitemap.xml
- Delete stale dist/

### P2
- 301 redirect pages.dev/* → vyhoda.lviv.ua/* after DNS
- GSC setup
- User-agent: CCBot directive

## Verdict
- Verified OK: sitemap, robots.txt, OG cards exist, all routes work
- CRITICAL: OG cross-domain DNS gap → social shares broken
- BLOCKED for direct audit: titles, meta descriptions, JSON-LD (tooling limitation)

## Next-step validation tools
- https://validator.schema.org/
- https://search.google.com/test/rich-results
- https://developers.facebook.com/tools/debug/
- https://www.linkedin.com/post-inspector/
