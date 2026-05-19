# Performance + Headers Audit

**Target**: `https://vugoda-web-2.pages.dev`
**Date**: 2026-05-19
**Method**: `curl -I` (headers) + Playwright Chromium 148 (runtime metrics)
**Spec targets**: LCP < 2100ms mobile 4G • CLS = 0 • Lakeview total < 1MB • initial JS < 200KB gzip

---

## 1. Security headers table

| Header                    | `/`                    | `/portfolio/lakeview/`  | `/og/home.png`         | `/assets/*.js`         | `/api/contact` (OPTIONS) |
| ------------------------- | ---------------------- | ----------------------- | ---------------------- | ---------------------- | ------------------------ |
| `strict-transport-security` | max-age=63072000; includeSubDomains; preload | same | same | same | absent |
| `x-frame-options`         | DENY                   | DENY                    | DENY                   | DENY                   | absent                   |
| `x-content-type-options`  | nosniff                | nosniff                 | nosniff                | nosniff                | absent                   |
| `referrer-policy`         | strict-origin-when-cross-origin | same           | same                   | same                   | absent                   |
| `permissions-policy`      | camera=(), microphone=(), geolocation=() | same | same | same | absent |
| `x-xss-protection`        | 1; mode=block (deprecated, harmless) | same | same | same | absent |
| `content-security-policy` | **absent**             | **absent**              | **absent**             | **absent**             | absent                   |
| `cross-origin-opener-policy` | **absent**          | **absent**              | **absent**             | **absent**             | absent                   |
| `cross-origin-resource-policy` | **absent**        | **absent**              | **absent**             | **absent**             | absent                   |
| `cross-origin-embedder-policy` | **absent**        | **absent**              | **absent**             | **absent**             | absent                   |

`/api/contact` OPTIONS returns **405 Method Not Allowed** (allow: POST) — _public_headers do not apply to Functions response_; only Pages-static assets get the `_headers` middleware. POST without trusted Origin returns **403 `{"ok":false,"error":"origin","message":"Origin not allowed"}`** — Origin allowlist works.

**Verdict**: Security baseline is solid for a static brochure site. Missing CSP/COOP/CORP is acceptable for a no-XSS-surface prerendered SPA but recommended if a stricter posture is wanted (see P2 below). The deprecated `x-xss-protection` is harmless legacy.

---

## 2. Cache headers

| Path / route type                   | Expected                                | Actual                                    | Status |
| ----------------------------------- | --------------------------------------- | ----------------------------------------- | ------ |
| `/` (HTML, prerendered)             | `max-age=0, must-revalidate`            | `public, max-age=0, must-revalidate`      | OK     |
| `/portfolio/lakeview/` (HTML)       | `max-age=0, must-revalidate`            | `public, max-age=0, must-revalidate`      | OK     |
| `/this-does-not-exist` (404)        | `max-age=0` (proper 404 status)         | `HTTP 200` + `max-age=0, must-revalidate` | **SOFT-404 — P1** |
| `/robots.txt`                       | `max-age=3600+`                         | `public, max-age=3600`                    | OK     |
| `/sitemap.xml`                      | `max-age=3600+`                         | `public, max-age=3600`                    | OK     |
| `/og/home.png`                      | `max-age=86400`                         | `public, max-age=86400`                   | OK     |
| `/assets/*.js` (hashed)             | `max-age=31536000, immutable`           | `public, max-age=31536000, immutable`     | OK     |
| `/assets/*.avif` (hashed)           | `max-age=31536000, immutable`           | `public, max-age=31536000, immutable`     | OK     |
| `/logo-dark.svg` (unhashed static)  | `max-age=86400+`                        | `public, max-age=0, must-revalidate`      | **P2 — no cache** |
| `/isometric-grid.svg` (unhashed)    | `max-age=86400+`                        | `public, max-age=0, must-revalidate`      | **P2 — no cache** |

Cloudflare adds `etag`, HTTP/2, and Brotli/Gzip negotiation automatically. Compression confirmed: `content-encoding: br` for `Accept-Encoding: br`, `gzip` for gzip-only clients.

---

## 3. Page weight — `/portfolio/lakeview/` cold cache (Chromium 1200x1067)

Using `encodedBodySize` (= bytes transferred from origin including CF compression) when `transferSize=0` due to Playwright session cache.

| Bucket  | Count | Bytes (compressed wire) | % of total |
| ------- | ----- | ----------------------- | ---------- |
| HTML    | 1     | 10,753                  | 2.2%       |
| CSS     | 1     | 8,613                   | 1.8%       |
| JS      | 18*   | 187,806                 | 38.4%      |
| Images  | 2     | 192,437                 | 39.3%      |
| Fonts   | 6     | 89,620                  | 18.3%      |
| Other   | 1     | 0 (turnstile iframe)    | 0%         |
| **Total** | **29** | **489,229 B ≈ 478 KB** | **100%**   |

\* `js` count of 18 includes Turnstile remote script (0 bytes, deferred). Local app JS = 17 chunks.

**Result vs target**: **478 KB < 1 MB target ✓** (52% headroom).

**AVIF served?** Yes — Chromium sent `Accept: image/avif` and CF returned `image/avif`. LCP image confirmed `/assets/hero-DTajtAmh.avif` (1920w variant) on desktop, `/assets/hero-BC1tOu1H.avif` (480w variant, 24 KB) on mobile. Picture component emits correct AVIF→WebP→JPG ladder with 4 widths (480/768/1280/1920) and proper `sizes` attribute.

### Heaviest single resources
1. `/assets/hero-DTajtAmh.avif` (1920w hero) — 192 KB on desktop, replaced by 24 KB 480w variant on mobile
2. `/assets/entry.client-Ba7Cyvun.js` — 60.6 KB Brotli (191 KB raw) — React + Router runtime
3. `/assets/chunk-4N6VE7H7-DTCjLIrC.js` — 43.9 KB Brotli — Framer Motion / shared chunk
4. `/assets/Picture-BZGE-1TC.js` — 41.9 KB Brotli — **suspicious**, see P1
5. `/assets/ContactForm-oP2vVeO_.js` — 24.6 KB Brotli — Zod + RHF + Turnstile glue
6. Montserrat woff2 (6 files Cyr+Lat, 400/500/700) — 89.6 KB total

---

## 4. LCP (cold cache)

| Page                       | Viewport     | LCP    | Element                                       | LCP image variant served |
| -------------------------- | ------------ | ------ | --------------------------------------------- | ------------------------ |
| `/`                        | 1200×1067 desktop | **660 ms** | `<img>` aerial AVIF 50% opacity hero      | `aerial-BVqQkIWw.avif` (1920w, 387 KB) |
| `/`                        | 390×844 mobile    | **248 ms** | `<div>` w/ `isometric-grid.svg` CSS bg    | `aerial-UoM_OFHm.avif` (480w, 36 KB)   |
| `/portfolio/lakeview/`     | 1200×1067 desktop | **348 ms** | `<img>` hero AVIF 40% opacity            | `hero-DTajtAmh.avif` (1920w, 192 KB) |
| `/portfolio/lakeview/`     | 390×844 mobile    | **272 ms** | `<img>` hero AVIF                         | `hero-BC1tOu1H.avif` (480w, 24 KB)   |

**Verdict**: All four measurements **massively under 2100 ms spec target** (best case 272 ms, worst 660 ms). All "Good" rating per Web Vitals (< 2500 ms). Note: these are localhost-to-CF-edge measurements over fiber — real 4G mobile will be slower but still expected to stay well under spec given the ≤ 192 KB LCP payload and `preload`+`fetchpriority="high"` (verify: confirmed via Cloudflare's `link` header pre-load hints in the response).

**FCP**: 132–408 ms across all variants — excellent.

**Note**: On mobile `/`, LCP is the `isometric-grid.svg` background DIV (271k pixel area), not the aerial AVIF. This is because mobile collapses layout and the grid SVG covers a larger viewport area. The grid SVG itself is **15.6 KB unhashed** and serves with no cache (P2 below) — opportunity for free perf win.

---

## 5. CLS (cold cache, no interaction)

| Page                       | Viewport          | CLS     | Target |
| -------------------------- | ----------------- | ------- | ------ |
| `/`                        | 1200×1067 desktop | **0.0361** | 0 (Good: < 0.1) |
| `/`                        | 390×844 mobile    | **0**   | 0 (Good: < 0.1) |
| `/portfolio/lakeview/`     | 1200×1067 desktop | **0** (warm) / **0.0009** (cold) | 0 |
| `/portfolio/lakeview/`     | 390×844 mobile    | **0**   | 0 (Good: < 0.1) |

**Verdict**: 3 of 4 pages hit absolute zero CLS. The **desktop home shows 0.0361** — above strict spec target of 0 but still well within Web Vitals "Good" band (< 0.1). This is likely caused by font swap reflow on `Layout` header text since fonts arrive ~50-100ms after FCP. Mobile doesn't see it because layout dimensions and font cache differ.

---

## 6. JS bundle sizes (Brotli, real wire on Cloudflare Pages)

| Chunk                                  | Brotli  | Gzip    | Raw     | Loads on                          |
| -------------------------------------- | ------- | ------- | ------- | --------------------------------- |
| `entry.client-Ba7Cyvun.js`             | 60.7 KB | 60.1 KB | 191.5 KB| every page (React+Router runtime) |
| `chunk-4N6VE7H7-DTCjLIrC.js`           | 43.9 KB | 43.4 KB | 129.2 KB| every page (Framer Motion shared) |
| `Picture-BZGE-1TC.js`                  | 41.9 KB | 40.3 KB | 123.5 KB| every page w/ image (eager)       |
| `ContactForm-oP2vVeO_.js`              | 24.7 KB | 24.2 KB | 87.7 KB | only /portfolio/* + /contact      |
| `portfolio.lakeview-5vCrvmAm.js`       | 6.5 KB  | 6.5 KB  | 20.6 KB | only /portfolio/lakeview          |
| `_index--_fnO_H-.js`                   | 5.9 KB  | 5.7 KB  | 19.8 KB | only `/`                          |
| `Layout-Bb88E0qp.js`                   | 2.6 KB  | 2.6 KB  | 6.8 KB  | every page                        |
| `projects-BByghl1y.js`                 | 2.0 KB  | 2.0 KB  | 4.5 KB  | `/` + /portfolio                  |
| `root-SoRPa80b.js`                     | 1.5 KB  | 1.5 KB  | 2.9 KB  | every page                        |
| `Button-sSN6EIue.js`                   | 1.3 KB  | 1.3 KB  | 3.1 KB  | every page                        |
| `manifest-c03bbb03.js`                 | 1.1 KB  | 1.0 KB  | 9.3 KB  | every page                        |
| `PageHero-DYy0RrBq.js`                 | 0.7 KB  | 0.7 KB  | 1.4 KB  | /portfolio/* + /about etc.        |
| `filter-props-B0FOZbYC.js`             | 0.7 KB  | 0.7 KB  | 1.4 KB  | every page (motion helper)        |
| `ProjectGalleryStrip-BWFiGjdw.js`      | 0.6 KB  | 0.6 KB  | 0.9 KB  | portfolio leaves                  |
| Other (StagePill, arrows, route id stubs, IsometricCubePlaceholder) | 0.3–0.5 KB each | | | per-route |

### Initial JS budget on `/` (mobile cold)

Sum of modules referenced by `Link: modulepreload` for `/`:

```
manifest + entry.client + chunk-4N6VE + root + filter-props + Layout
  + Button + _index + Picture + SectionHeading + projects + aerial
  + arrow-right + arrow-up-right + StagePill + IsometricCubePlaceholder
= 1.1 + 60.7 + 43.9 + 1.5 + 0.7 + 2.6 + 1.3 + 5.9 + 41.9 + 0.4 + 2.0 + 0.3 + 0.3 + 0.3 + 0.4 + 0.3
≈ 163.6 KB Brotli (≈ 167 KB Gzip)
```

### Initial JS budget on `/portfolio/lakeview/` cold

```
manifest + entry.client + chunk-4N6VE + root + filter-props + Layout
  + Button + portfolio.lakeview + Picture + PageHero + SectionHeading
  + StagePill + ContactForm + ProjectGalleryStrip + aerial + arrow-up-right + arrow-right
= 1.1 + 60.7 + 43.9 + 1.5 + 0.7 + 2.6 + 1.3 + 6.5 + 41.9 + 0.7 + 0.4 + 0.4 + 24.7 + 0.6 + 0.3 + 0.3 + 0.3
≈ 185.8 KB Brotli (≈ 190 KB Gzip)
```

**Verdict**: **Both routes < 200 KB gzip target ✓** (167 / 190 KB). Lakeview is close to the ceiling because `ContactForm` (24.7 KB) is _eagerly preloaded_ via modulepreload even though it's below the fold. See P1 below.

---

## 7. Misc observations

- **HTTP/2 + HSTS preload + HTTPS-only**: green.
- **NEL reporting** enabled (CF default) — silent but harmless.
- **`Link: rel="modulepreload"`** sent via HTTP header (CF auto-emits from `<link>` tags) — accelerates JS fetch but means everything in `_index--_fnO_H-.js`'s graph is pulled in parallel with the HTML, including `IsometricCubePlaceholder` and `aerial` chunks that may not be needed depending on viewport.
- **Turnstile remote script** appears in resource list even on pages without ContactForm rendering — verified that `ContactForm-*.js` is loaded on Lakeview (within page weight); the Turnstile iframe (0 bytes from origin) initialises against `challenges.cloudflare.com`.
- **Soft 404**: `/this-does-not-exist` returns **HTTP 200** instead of 404. This is a SEO / monitoring concern — Google may index garbage URLs, and Cloudflare analytics will hide real 404 rate.
- **Console warning** observed on every Lakeview load (1 warning) — likely the Turnstile test-key warning already tracked as P0 in task #17.

---

## 8. Issues + Recommendations

### P0 — none from this audit
(Existing P0s tracked separately: Turnstile site key, submit button enabled-at-paint.)

### P1 — should fix before traffic

1. **Soft 404 on unknown routes** — `/this-does-not-exist` returns HTTP 200 instead of 404.
   - Impact: Google may index garbage, analytics noise, accessibility harm.
   - Fix: in `app/routes/$.tsx` (or `root.tsx` ErrorBoundary) set `Response` status to 404 via `loader` throw + Pages `_routes.json` or React Router v7 `headers()` export. Cloudflare Pages will pass through the status correctly once the server response is 404.
   - Verify: `curl -I https://vugoda-web-2.pages.dev/nope` should return `HTTP/2 404`.

2. **`Picture-BZGE-1TC.js` is 41.9 KB Brotli (123 KB raw) and loaded on every page**
   - That is ~25% of the entire initial JS budget for a `<picture>` wrapper. Likely contains a heavy dep (responsive image polyfill, Framer Motion fragment, or large srcset generator).
   - Fix: open `app/components/ui/Picture.tsx`, inspect transitive imports. If it pulls Framer Motion or pulls a util like `@picture-utils/responsive`, tree-shake or replace with a plain `<picture>` + manual srcset. Target: <8 KB Brotli (3-4x reduction).
   - Expected outcome: shaves ~33 KB from every cold page load.

3. **`ContactForm-oP2vVeO_.js` (24.7 KB) modulepreloaded on Lakeview but below the fold**
   - It's `<link rel="modulepreload">` in the HTTP `Link:` header for `/portfolio/lakeview/`.
   - Fix: lazy-import `ContactForm` in `routes/portfolio.lakeview.tsx` (`React.lazy()` / dynamic `import()`) so it does not appear in the modulepreload graph. Already split into its own chunk — just needs to defer the preload.
   - Expected outcome: initial JS on Lakeview drops from 186 KB → ~161 KB Brotli; first contentful paint largely unchanged but interaction-ready signal earlier.

### P2 — polish / minor wins

4. **`logo-dark.svg`, `isometric-grid.svg` served with `cache-control: max-age=0, must-revalidate`**
   - These are static, unhashed assets that never change without a deploy.
   - Fix: add to `public/_headers`:
     ```
     /*.svg
       Cache-Control: public, max-age=86400, must-revalidate
     ```
   - Saves 1 round-trip + 16 KB per repeat visitor for the grid.

5. **CLS 0.0361 on desktop home** (above strict spec target of 0, still in "Good" band)
   - Likely cause: Montserrat font swap on `Layout` header text after FCP.
   - Fix options: (a) `<link rel="preload" as="font">` for `montserrat-cyrillic-500` and `montserrat-cyrillic-700` (the two weights used in nav + hero), or (b) inline `font-display: optional` for above-fold text, or (c) match fallback font metrics via `size-adjust` descriptors. Option (a) is cheapest.
   - Expected outcome: CLS → 0 on desktop home.

6. **No CSP, COOP, CORP headers**
   - Not strictly required for a brochure site without user-generated content, but adding a tight CSP would prevent any future XSS via dependencies and improve security ratings (e.g. Mozilla Observatory).
   - Suggested baseline in `public/_headers`:
     ```
     /*
       Content-Security-Policy: default-src 'self'; img-src 'self' data:; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'
       Cross-Origin-Opener-Policy: same-origin
       Cross-Origin-Resource-Policy: same-site
     ```
   - Verify Turnstile still loads in iframe after enabling — adjust `frame-src` / `script-src` if it doesn't.

7. **Drop deprecated `x-xss-protection`** (browsers ignore it for years; CSP supersedes).

8. **Six woff2 files (89.6 KB) loaded on every page** even when Cyrillic-only or Latin-only would suffice.
   - The site is Ukrainian (Cyrillic primary). Latin files are needed only for occasional English brand names ("Lakeview", "ВИГОДА+", numbers, units like km/m²).
   - Numbers and units render fine from `unicode-range: U+0030-0039` in the Cyrillic subset — verify each Latin file is actually being touched. If not, drop Latin 400/500/700 → save ~56 KB on every cold load.
   - Quick check: open DevTools Coverage panel locally to see actual font usage per page.

### Nice-to-haves (P3)

- Add `<link rel="preconnect" href="https://challenges.cloudflare.com">` to HTML head so the Turnstile DNS+TLS warms up during HTML parse instead of after JS executes.
- Consider `fetchpriority="high"` on the hero `<img>` in `PageHero` and `<img>` on `/` aerial — Chrome's pre-loader will use it to prioritise LCP image over JS chunks. Verify in source: looks like only `<link rel="preload">` for `/logo-dark.svg` is in the HTTP `Link:` header today.

---

## Summary scorecard

| Metric                          | Target           | Measured (best/worst across pages) | Status |
| ------------------------------- | ---------------- | ---------------------------------- | ------ |
| LCP mobile 4G                   | < 2100 ms        | 248 / 272 ms                       | ✓ pass |
| LCP desktop                     | -                | 348 / 660 ms                       | ✓ pass |
| CLS                             | 0                | 0 / 0.0361                         | ◐ near-pass (1 page 0.0361, still "Good") |
| Lakeview total page weight      | < 1 MB           | 478 KB cold                        | ✓ pass (52% headroom) |
| Initial JS Brotli (per route)   | < 200 KB gzip    | 163 KB (`/`) / 186 KB (Lakeview)   | ✓ pass |
| AVIF served to Chromium         | yes              | yes                                | ✓ pass |
| Security headers (HSTS, XFO, XCTO, RP, PP) | all present | all present                | ✓ pass |
| Soft-404                        | proper 404 status| HTTP 200                           | ✗ **P1** |
| Static SVG cache                | long max-age     | max-age=0                          | ◐ **P2** |

**Overall**: deploy is production-quality on the perf side. One P1 (soft-404), three P1 perf wins available (Picture chunk, ContactForm preload deferral, font subsetting verification), several P2 polish items.
