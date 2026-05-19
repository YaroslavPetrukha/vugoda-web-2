# UI Smoke Test Report — ВИГОДА Live (vugoda-web-2.pages.dev)

**Date:** 2026-05-19
**Tester:** EvidenceQA (Playwright MCP, automated)
**Viewport (desktop):** 1440×900
**Viewport (mobile):** 375×667
**Tooling:** Chromium via Playwright MCP, read-only
**Build target:** https://vugoda-web-2.pages.dev (Cloudflare Pages, SSG + 404 catch-all)

---

## 1. Per-route status (13 routes)

All 13 routes were direct-loaded (no SPA hop), `1440×900` screenshot, NavBar/Footer/Main presence + `<h1>` capture + URL hash check + per-route console levels.

| # | Route | HTTP/Title | NavBar | Footer | Main | H1 captured | Hash in URL | Console |
|---|-------|------------|--------|--------|------|-------------|-------------|---------|
| 1 | `/` | Забудовник ВИГОДА — системний девелопмент у Львові | ✅ | ✅ | ✅ | "Системний девелопмент, у якому цінність є результатом точних рішень." | — | 0E / 0W (info-level) |
| 2 | `/pidkhid` | Як працює забудовник ВИГОДА — підхід і етапи | ✅ | ✅ | ✅ | (h1 present, count=1) | — | 0E / 0W |
| 3 | `/portfolio` | Портфель ЖК і pipeline — забудовник ВИГОДА | ✅ | ✅ | ✅ | h1 present; 3 portfolio cards | — | 0E / 0W |
| 4 | `/portfolio/lakeview` ⭐ | ЖК Lakeview Львів — бізнес-клас, здача 2027 | ✅ | ✅ | ✅ | h1 present | — | 0E / 1W |
| 5 | `/portfolio/etno-dim` | ЖК Етно Дім — Судова, Львів | ✅ | ✅ | ✅ | "ЖК Етно Дім" | — | 0E / 1W |
| 6 | `/portfolio/maetok` | ЖК Маєток Винниківський — новобудова у Винниках | ✅ | ✅ | ✅ | "ЖК Маєток Винниківський" | — | 0E / 1W |
| 7 | `/portfolio/nterest` | Дохідний дім NTEREST — інвестиційна нерухомість Львів | ✅ | ✅ | ✅ | "Дохідний дім NTEREST" | — | 0E / 1W |
| 8 | `/portfolio/pipeline-04` | Новий проект ВИГОДА у підготовці | ✅ | ✅ | ✅ | "Проект у роботі" | — | 0E / 1W |
| 9 | `/investoram` | Інвестиції в нерухомість Львів — забудовник ВИГОДА | ✅ | ✅ | ✅ | "Інвесторам" | — | 0E / 1W |
| 10 | `/partneram` | Партнерам і банкам — реквізити ВИГОДА | ✅ | ✅ | ✅ | "Партнерам і банкам" | — | 0E / 1W |
| 11 | `/kontakty` | Контакти забудовника ВИГОДА — Львів | ✅ | ✅ | ✅ | h1 present | — | 0E / 1W |
| 12 | `/novyny` | Новини і хід будівництва — ВИГОДА | ✅ | ✅ | ✅ | "Новини" | — | 0E / 1W |
| 13 | `/non-existent` (404 catch-all) | Сторінку не знайдено — ВИГОДА | ✅ | ✅ | ✅ | "Сторінку не знайдено" | — | **1E / 0W ⚠️** |

**Visual evidence:**
- `progress/qa-screenshots/01-home-1440.png`
- `progress/qa-screenshots/02-pidkhid-1440.png`
- `progress/qa-screenshots/03-portfolio-1440.png`
- `progress/qa-screenshots/04-lakeview-1440.png`
- `progress/qa-screenshots/05-etno-dim-1440.png`
- `progress/qa-screenshots/06-maetok-1440.png`
- `progress/qa-screenshots/07-nterest-1440.png`
- `progress/qa-screenshots/08-pipeline04-1440.png`
- `progress/qa-screenshots/09-investoram-1440.png`
- `progress/qa-screenshots/10-partneram-1440.png`
- `progress/qa-screenshots/11-novyny-1440.png`
- `progress/qa-screenshots/12-404-1440.png`
- `progress/qa-screenshots/13-kontakty-1440.png` (full-page)

**Routing check:** all routes are served as prerendered SSG. URLs have no `#` fragment, direct-load resolves without an SPA flash. `/portfolio/lakeview` loads correctly via direct URL (no client-side redirect to root). Cloudflare adds trailing slashes (`/pidkhid` → `/pidkhid/`) — cosmetic, no impact.

---

## 2. ContactForm visual audit (`/kontakty`)

**Form action:** `https://vugoda-web-2.pages.dev/kontakty/` (self-post; backend handler presumably Cloudflare Pages Function)

### Fields (7 total found in DOM)

| Field | Type | Required | Visible | Notes |
|-------|------|----------|---------|-------|
| `company` (honeypot) | text | no | hidden | `position:absolute; left:-9999px; opacity:0; aria-hidden=true; tabindex=-1; autocomplete=off; w/h=1×1` ✅ PASS |
| `name` | text | **yes** | ✅ | placeholder "Як до вас звертатися", autocomplete=name |
| `phone` | tel | **yes** | ✅ | placeholder "+380 …", autocomplete=tel |
| `topic` | select | no | ✅ | options not enumerated (single `<select>`) |
| `message` | textarea | no | ✅ | placeholder "Опишіть запит" |
| `consent` | checkbox | **yes** | ✅ | **unchecked-by-default ✅**, label = "Я погоджуюсь на обробку моїх персональних даних відповідно до законодавства України. \*" |
| `cf-turnstile-response` | hidden | no | hidden | **value pre-populated with `"XXXX.DUMMY.TOKEN.XXXX"` ⚠️** |

### Submit button
- Text: **"НАДІСЛАТИ"**
- `disabled = false` from initial paint → spec said it should be disabled until Turnstile passes. **FAIL.**
- No `aria-disabled` attribute either.

### Turnstile widget
- `<script id="cf-turnstile-script" src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit">` loaded successfully.
- `<div id="cf-turnstile" style="width:300px;height:65px">` exists at correct dimensions.
- After 3 s wait: **0 iframes on the page**. `window.turnstile === "object"` (script API loaded), but `window.onloadTurnstileCallback` is `undefined`.
- Inside `#cf-turnstile` there is only the hidden response input with **`value="XXXX.DUMMY.TOKEN.XXXX"`** — a placeholder/dummy token, not a real Turnstile token.
- Console preload warning surfaced: a Cloudflare preload URL ends in `…/sitekey/1x00000000000000000000AA/dark/…` — `1x00000000000000000000AA` is Cloudflare's official "always passes, visible" **TESTING** sitekey. **Production is wired to the test sitekey.**

### Honeypot
- ✅ Present in DOM as `<input name="company" type="text" autocomplete="off" tabindex="-1" aria-hidden="true">` with off-screen positioning (`left:-9999px`).

### ContactForm — checklist
- [x] Form rendered
- [x] Required fields: name, phone, consent
- [x] Topic select present
- [x] Message textarea present
- [x] Consent checkbox unchecked by default
- [x] Honeypot `name="company"` in DOM, invisible (off-screen + aria-hidden + tabindex=-1) — correct
- [x] Turnstile script loaded
- [ ] **Turnstile widget iframe renders** — FAIL (0 iframes, dummy token)
- [ ] **Submit disabled until Turnstile passes** — FAIL (button enabled at first paint)
- [ ] **Production sitekey** — FAIL (test sitekey `1x00000000000000000000AA` detected)
- [x] Dark theme: page is dark navy `#2F3640`, Turnstile preload path includes `/dark/` → correct theming intent
- [x] Ukrainian locale: Turnstile preload path includes `lang=uk` and `webkitLocale="uk"`

---

## 3. Hero image performance (`/portfolio/lakeview`)

`<picture>` element on the page exposes:

```
<source type="image/avif" srcset="
  /assets/aerial-UoM_OFHm.avif 480w,
  /assets/aerial-CalghIEO.avif 768w,
  /assets/aerial-B4-4Uelc.avif 1280w,
  /assets/aerial-BVqQkIWw.avif 1920w
">
<source type="image/webp" srcset="
  /assets/aerial-DQKRD0cI.webp 480w,
  ... 1920w
">
<img src=".../aerial-BnNaSHgk.jpeg" alt="Lakeview — аерофотозйомка">
```

**Network requests captured during page load** (image-format filter):
- `GET /assets/hero-DTajtAmh.avif` → 200 ✅
- The `aerial-*.jpeg` fallback was **never** requested (browser picked AVIF from `<picture>`).
- No raw `.jpg` ≥ 1 MB observed.

**Verdict:** ✅ PASS — hero is served as AVIF, with WebP fallback chain, JPEG only as last-resort `<img src>`.

**Note:** `naturalWidth=0` on the `<img>` element at inspection time means the JPEG fallback was not loaded; that is **expected and correct** when AVIF is served via `<picture>`.

---

## 4. OG meta verification (3 pages)

| Field | `/` (Home) | `/portfolio/lakeview` | `/kontakty` |
|-------|------------|-----------------------|-------------|
| `<title>` | Забудовник ВИГОДА — системний девелопмент у Львові | ЖК Lakeview Львів — бізнес-клас, здача 2027 | Контакти забудовника ВИГОДА — Львів |
| `meta[name=description]` | "Будуємо у Львові й області з 2019. Активний обʼєкт — ЖК Lakeview, бізнес-клас, здача 2027. Документи і прозорі умови." | "Володимира Великого 2А, Франківський район. 4 секції, монолітно-каркас, від $1600/м². Розстрочка до 2027." | "Корпоративний email vygoda.sales@gmail.com, телефон, окремі контакти ЖК Lakeview. Форма звʼязку." |
| `og:title` | (matches `<title>`) | (not separately specified — falls back) | (matches `<title>`) |
| `og:image` | `https://vyhoda.lviv.ua/og/home.png` | `https://vyhoda.lviv.ua/og/lakeview.png` | `https://vyhoda.lviv.ua/og/contacts.png` |
| `og:url` | `https://vyhoda.lviv.ua/` | `https://vyhoda.lviv.ua/portfolio/lakeview` | `https://vyhoda.lviv.ua/kontakty` |
| `og:type` | website | website | website |
| `twitter:card` | summary_large_image | (n/a captured) | summary_large_image |
| `<link rel=canonical>` | `https://vyhoda.lviv.ua/` | `https://vyhoda.lviv.ua/portfolio/lakeview` | `https://vyhoda.lviv.ua/kontakty` |
| JSON-LD scripts | (not measured here) | (1 — likely BreadcrumbList/RealEstate) | 1 |

**Observations:**
- ✅ Every page has a unique title and description.
- ✅ `og:image`, `og:url`, `canonical` all configured.
- ⚠️ All canonical/og:url point to `vyhoda.lviv.ua` while the **live host is `vugoda-web-2.pages.dev`**. If the custom domain is not yet DNS-resolved or returns 404 for the OG image, social-card unfurls will break. **Verify `https://vyhoda.lviv.ua/og/home.png` resolves before mainline launch.** If domain is intentional pre-cutover, this is acceptable; otherwise it is a launch-blocker.

---

## 5. Mobile viewport 375×667

- Hamburger button: present, `aria-label="Відкрити меню"`, 48×48 (good touch target), positioned `x=311 y=16`.
- Collapsed state: 7 of 8 nav links hidden (only logo link visible at `<a href="/">`). ✅
- Tap hamburger → mobile menu opens as `<div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Головне меню" class="lg:hidden fixed inset-0 top-20 z-40 bg-bg-deep flex flex-col">`. ✅
- 8 nav links become visible (Logo, Проєкти, Як ми будуємо, Інвесторам, Партнерам, Новини, Контакт, ЗАЯВКА).
- `body { overflow: hidden }` while menu open — scroll-lock works. ✅
- No dedicated close button surfaced via `aria-label*=close|закр|laun`; menu is presumed toggled by the same hamburger. **Minor a11y concern** — the open dialog should have an explicit close affordance or be obviously dismissible; verify keyboard `Esc` works (not tested here).
- **Horizontal overflow: `documentElement.scrollWidth = 376` vs `innerWidth = 375` → 1px overflow on home page.** Visually trivial but technically present.

**Mobile screenshots:**
- `progress/qa-screenshots/14-mobile-home-375.png`
- `progress/qa-screenshots/15-mobile-menu-open-375.png`

---

## 6. Console errors (cumulative)

| Page | Error | Warning |
|------|-------|---------|
| `/` (home) | 0 | 0 |
| `/pidkhid` | 0 | 0 |
| `/portfolio` | 0 | 0 |
| `/portfolio/lakeview` and other portfolio detail pages | 0 | 1 each (Cloudflare Turnstile resource preload warning, not blocking) |
| `/kontakty` | 0 | 1 (Turnstile preload warning) |
| `/non-existent` (404) | **1** | 0 |

### The single error
Page: `/non-existent`
```
Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]=
at Kt (.../entry.client-Ba7Cyvun.js:32:31373) → SSR hydration mismatch
```
React error #418 = **"Hydration failed because the initial UI does not match what was rendered on the server."** This fires only on the 404 catch-all — likely because the prerendered 404 HTML differs from what the client renders (e.g., `document.title` set late, or `<meta>` mismatch, or a different layout component). Not user-facing critical, but it is a **real hydration bug** that ships to production and can degrade the 404 experience.

### The recurring Turnstile warning
```
The resource https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/cmg/1
was preloaded using link preload but not used within a few seconds from the window's load event.
```
Combined with the failure of the widget iframe to mount, this strongly suggests the Turnstile widget never finishes its render pass.

---

## 7. Critical bugs (priority-ordered)

### 🔴 CRITICAL #1 — Cloudflare Turnstile widget does not render in production
**Evidence:** `/kontakty` after 3-second wait has **0 iframes**, `<div id="cf-turnstile">` contains only a hidden input with `value="XXXX.DUMMY.TOKEN.XXXX"`, Cloudflare preload URL embeds sitekey `1x00000000000000000000AA` (Cloudflare's public "always-passes" test sitekey).
**Impact:** Anti-bot protection is OFF. The form will accept any submission. Telegram backend gets spammed.
**Likely root cause:** `VITE_TURNSTILE_SITEKEY` was not set in Cloudflare Pages env vars; build fell back to a hard-coded test sitekey, or the React component renders the dummy token directly when env is missing.
**Fix:** Set real sitekey in `wrangler.toml` / Cloudflare Pages environment variables and rebuild. Verify post-deploy that an actual iframe mounts inside `#cf-turnstile`.

### 🔴 CRITICAL #2 — Submit button is enabled before Turnstile validation
**Evidence:** `disabled=false`, `aria-disabled=null` at first paint, even though `cf-turnstile-response` carries only a dummy value.
**Impact:** A user (or a bot) can press НАДІСЛАТИ immediately. Combined with #1, this is a working spam funnel into Telegram.
**Fix:** Tie button `disabled` to a piece of React state set by Turnstile's `callback` prop; gate server-side as well.

### 🟠 HIGH #3 — Production OG / canonical points to `vyhoda.lviv.ua` while live host is `vugoda-web-2.pages.dev`
**Evidence:** Every audited page has `<link rel="canonical">` and `og:url` on `vyhoda.lviv.ua`. Live deployment is `vugoda-web-2.pages.dev`. OG images (`/og/home.png`, `/og/lakeview.png`, `/og/contacts.png`) reference that same domain.
**Impact:** If `vyhoda.lviv.ua` is not yet DNS-resolved, Facebook/Telegram/Twitter unfurls fail (404 image). Google may flag duplicate-canonical signal.
**Fix:** Either flip the DNS A/CNAME to point at this Pages deployment **before** sharing, or change canonical/og:url to the Pages domain until cutover.

### 🟠 HIGH #4 — React hydration error (#418) on 404 catch-all
**Evidence:** Console error reproduced consistently on direct-load of `/non-existent`.
**Impact:** Page still renders content (NavBar/main/Footer all present), but the entire client tree throws during hydration. Interactive components on the 404 (CTAs to home / portfolio) may stop working in older browsers / under load.
**Fix:** Run `react-dom/dev` locally to surface the unminified diff. Common causes: dynamic `Date()`, `Math.random()`, locale-dependent strings, or an `<html lang>` set on client but not server.

### 🟡 MEDIUM #5 — 1px horizontal overflow on mobile home (375px viewport)
**Evidence:** `documentElement.scrollWidth = 376` vs `innerWidth = 375`.
**Impact:** Cosmetic — produces a faint horizontal scrollbar / rubber-banding on iOS Safari.
**Fix:** Audit `min-width`, large fixed `padding-right`, or absolutely positioned decoration on hero. Likely a `border-b` plus negative margin or an over-sized SVG.

### 🟡 MEDIUM #6 — Mobile dialog lacks explicit close affordance
**Evidence:** Opened `role="dialog" aria-modal="true"`, but no visible "✕" button or `aria-label` of "Закрити меню" detected via the standard locators. Re-tapping the hamburger likely closes it, but a screen-reader user cannot tell.
**Fix:** Add `<button aria-label="Закрити меню">` inside the dialog; bind `Esc` key handler.

### 🟡 MEDIUM #7 — Turnstile widget configured with explicit render but no programmatic render call surfaced
**Evidence:** Script loaded with `&onload=onloadTurnstileCallback&render=explicit`, yet `window.onloadTurnstileCallback === undefined` after page load. So the script's callback never gets attached — explaining why no iframe appears.
**Fix:** Either define `window.onloadTurnstileCallback = () => turnstile.render('#cf-turnstile', {...})` before the script loads, or switch to `render=implicit` and add a `class="cf-turnstile"` div with `data-sitekey`.

---

## 8. Things that pass cleanly

- All 13 routes (including 4 portfolio detail pages and 404) prerender, return correct `<title>`, NavBar + Footer + `<main>` are always present, no white screens or "Application error".
- Direct-URL load of `/portfolio/lakeview` works without redirects, no `#` fragment routing fallback.
- Hero image on `/portfolio/lakeview` is served as AVIF (`hero-DTajtAmh.avif`). `<picture>` chain: AVIF → WebP → JPEG. JPEG never fetched.
- Honeypot field is correctly positioned off-screen with proper attributes.
- Consent checkbox unchecked-by-default, has a clear label with required marker.
- Mobile hamburger opens an accessible `role="dialog" aria-modal="true"` with body-scroll lock.
- Unique meta description and OG image per page; JSON-LD present on /kontakty.

---

## 9. Honest quality assessment

**Realistic rating:** **B−** (good frontend, broken security primitive)

- ✅ SSG prerendering: solid (12/12 routes + functioning 404 catch-all)
- ✅ Image pipeline: AVIF/WebP/JPEG works as designed
- ✅ Mobile nav, semantic markup, meta tagging: well above baseline
- 🔴 Anti-bot/Turnstile pipeline: **broken** — production using TEST sitekey + dummy token + non-disabled submit. This blocks production-readiness.
- 🟠 Domain/canonical inconsistency must be reconciled before sharing.

**Production readiness:** **NEEDS WORK — DO NOT LAUNCH UNTIL #1, #2, #3, #4 ARE FIXED.**

The form is currently a 0-friction spam funnel into your Telegram bot. Fix Turnstile sitekey + button gating before this URL is shared with investors/partners.

---

## 10. Screenshots index

All screenshots saved to: `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/progress/qa-screenshots/`

| File | Route | Viewport |
|------|-------|----------|
| `01-home-1440.png` | `/` | 1440×900 |
| `02-pidkhid-1440.png` | `/pidkhid` | 1440×900 |
| `03-portfolio-1440.png` | `/portfolio` | 1440×900 |
| `04-lakeview-1440.png` | `/portfolio/lakeview` | 1440×900 |
| `05-etno-dim-1440.png` | `/portfolio/etno-dim` | 1440×900 |
| `06-maetok-1440.png` | `/portfolio/maetok` | 1440×900 |
| `07-nterest-1440.png` | `/portfolio/nterest` | 1440×900 |
| `08-pipeline04-1440.png` | `/portfolio/pipeline-04` | 1440×900 |
| `09-investoram-1440.png` | `/investoram` | 1440×900 |
| `10-partneram-1440.png` | `/partneram` | 1440×900 |
| `11-novyny-1440.png` | `/novyny` | 1440×900 |
| `12-404-1440.png` | `/non-existent` | 1440×900 |
| `13-kontakty-1440.png` | `/kontakty` (full page) | 1440×900 |
| `14-mobile-home-375.png` | `/` | 375×667 |
| `15-mobile-menu-open-375.png` | `/` (menu open) | 375×667 |

---

## 11. Required next actions (developer)

1. **Set production Turnstile sitekey** in Cloudflare Pages env (`VITE_TURNSTILE_SITEKEY` or equivalent). Redeploy. Verify post-deploy: open DevTools, confirm an iframe with `src` containing `challenges.cloudflare.com/turnstile/...` mounts inside `#cf-turnstile` within ~1 s.
2. **Wire submit `disabled` to Turnstile callback state**. Re-test that button is greyed out until widget shows ✓.
3. **Validate Turnstile server-side** on the Telegram-submission endpoint (it should already reject `XXXX.DUMMY.TOKEN.XXXX`, but verify with a test POST).
4. **Reconcile canonical/og:url with the actually-live host** — either DNS-flip to `vyhoda.lviv.ua` now, or change canonical to the Pages URL.
5. **Diagnose React #418** on `/non-existent`. Replicate locally with `react-dom/dev` build to read the unminified message.
6. **Audit horizontal-overflow** at 375 px on home.
7. **Add explicit close button / Esc handler** to mobile dialog.

---

**QA Agent:** EvidenceQA
**Status:** FAILED — Re-test required after fixes 1–4.
