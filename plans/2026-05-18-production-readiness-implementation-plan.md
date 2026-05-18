# Implementation Plan: Vugoda Web Production-Readiness

**Spec:** `specs/2026-05-18-production-readiness.md` v1.1
**Verification:** `thoughts/research/2026-05-18-plan-verification.md`
**Date:** 2026-05-18
**Total effort:** 4-5 робочих днів (з 25% buffer на ризики)
**Mode:** Bulletproof Size L (12-stage workflow: Research → Plan → Challenge → Execute → Verify per stage)
**Team:** 1 соло-розробник + AI-асистент
**Strategy:** 6 атомарних фаз, кожна — окрема feature-гілка, окремий PR, окремий `/clear` перед наступною

---

## Огляд фаз

| # | Phase | Effort | Залежить від | Branch | Critical path |
|---|---|---|---|---|---|
| 0 | Prep & Safety net | 4 год | — | `feature/phase-0-prep` | Yes |
| 1 | Architecture migration (paths + router + images + fonts) | 8 год | Phase 0 | `feature/phase-1-architecture` | Yes |
| 2 | SEO content (meta + sitemap + Schema.org) | 4 год | Phase 1 | `feature/phase-2-seo` | Yes |
| 3 | Cloudflare Pages deploy (без форми) | 4 год | Phase 2 | `feature/phase-3-cf-deploy` | Partially blocks Phase 4 |
| 4 | Form backend (Telegram-only) | 8 год | Phase 3 | `feature/phase-4-form` | Yes |
| 5 | Polish + handoff (опційно) | 4 год | Phase 4 | `feature/phase-5-polish` | No |

**Branching strategy:** кожна фаза мерджиться у `main` через PR після проходження Gates. Це дає reset cognitive load + clean rollback на будь-якій точці.

---

## Phase 0: Prep & Safety net

**Goal:** Забезпечити швидкий feedback loop і генерувати OG-assets, без яких Phase 2 не закриється. **Без цього кроку — кожна наступна правка йде "наосліп" без тестів.**

**Effort:** 4 год
**Branch:** `feature/phase-0-prep`
**Acceptance criteria from spec:** §5.4 (`.nvmrc` 20.18.0); §5.1 (per-page OG картки — 11 файлів готові до використання у Phase 2).
**Verification gap addressed:** G4 (тестів немає), G2 (OG-картки треба згенерувати).

### Tasks

1. **Створити `.nvmrc` з версією Node**
   - Files: `.nvmrc` (новий, content: `20.18.0`)
   - Acceptance: `cat .nvmrc` повертає `20.18.0`; `nvm use` в репо перемикає на 20.18.0
   - Dependencies: немає

2. **Встановити та сконфігурувати Vitest**
   - Files: `package.json` (`devDependencies`: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`), `vitest.config.ts` (новий), `tests/setup.ts` (новий)
   - Acceptance: `npm run test` запускає Vitest, `npm run test:ui` відкриває UI
   - Dependencies: немає

3. **Написати smoke-test на render для всіх 13 сторінок**
   - Files: `tests/smoke/pages.test.tsx` (новий)
   - Структура: масив з 13 шляхами → для кожного `render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)` → перевіряємо що падає НЕ через runtime error (initial guard).
   - Acceptance: `npm run test` — 13 PASS
   - Dependencies: Task 2

4. **Створити `scripts/verify-build.mjs`**
   - Files: `scripts/verify-build.mjs` (новий), `package.json` (`"build:verify": "node scripts/verify-build.mjs"`)
   - Script перевіряє у `build/client/` (або `dist/` поки що): існує `index.html` для кожного з 13 маршрутів, кожен містить унікальний `<title>`, не містить рядка `/vugoda-web-2/`.
   - Acceptance: `npm run build:verify` exits 0 (поки що — на старому HashRouter build script просто проходить як no-op, у Phase 1 заповнюємо реальною логікою)
   - Dependencies: немає

5. **CI guard: grep на `vugoda-web-2` в src/**
   - Files: `scripts/check-no-legacy-paths.mjs` (новий), `package.json` (`"check:paths": "node scripts/check-no-legacy-paths.mjs"`)
   - Script: `grep -rn "vugoda-web-2" src/ index.html` → якщо знайде — exit 1. На цій фазі — пишемо `// TODO: enable in Phase 1` коментар; сам скрипт пишемо. Реальний enforcement — у Phase 1 (інакше зараз падає).
   - Acceptance: скрипт існує, документований, не активний у CI поки що
   - Dependencies: немає

6. **Pre-commit hook через simple-git-hooks**
   - Files: `package.json` (додати `"simple-git-hooks"` + конфіг `"pre-commit": "npm run lint && npm run test"`)
   - Acceptance: `git commit` запускає `tsc --noEmit + vitest run`
   - Dependencies: Tasks 2-3

7. **Згенерувати 11 OG-карток 1200×630 у `public/og/`**
   - Files: `public/og/home.png`, `og/lakeview.png`, `og/etno-dim.png`, `og/maetok.png`, `og/nterest.png`, `og/pipeline-04.png`, `og/approach.png`, `og/investors.png`, `og/partners.png`, `og/contacts.png`, `og/news.png` (11 файлів)
   - Підхід: AI-генерація через брендбук (logo на dark-bg + назва проєкту/сторінки + slogan). Альтернатива — Figma template + 11 exports.
   - Acceptance: 11 PNG-файлів 1200×630 у `public/og/`, кожен < 200 KB
   - Dependencies: немає (можна паралелити)

### Gates (Stage 5/6/7 bulletproof)

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run test` → 13 PASS
- [ ] `npm run build` → success (на старому HashRouter — не ламаємо)
- [ ] `ls public/og/ | wc -l` → 11
- [ ] Кожен OG-файл коректно відкривається, читабельний на dark/light backgrounds Telegram
- [ ] `git commit` з порушенням TS — блокується pre-commit hook (тест роботи hook)

### Handoff

- [ ] Commit: `chore(phase-0): add vitest, smoke tests, build verification, og cards`
- [ ] Створити `progress/phase-0-handoff.md` з summary: що зроблено, що НЕ зроблено, які файли треба знати на Phase 1
- [ ] PR → merge до `main`
- [ ] `/clear` перед Phase 1

---

## Phase 1: Architecture Migration (paths + router + images + fonts)

**Goal:** Перевести проєкт з HashRouter+GH Pages базовим path-ом на React Router v7 framework mode зі SSG-рендером 13 сторінок, оптимізованими картинками та self-hosted шрифтами. **Це найкритичніша фаза — після неї жоден legacy-шлях не лишається.**

**Effort:** 8 год (1 день)
**Branch:** `feature/phase-1-architecture`
**Acceptance criteria from spec:** §5.1 (BrowserRouter, фізичний index.html для кожного маршруту, no #), §5.2 (AVIF/WebP, transfer size < 1MB, CLS = 0).
**Verification gap addressed:** G1 (hard-coded paths), G2 (index.html shell), G3 (motion fallback), G5 (router+images разом).

### Tasks

1. **Move `public/projects/` → `src/assets/projects/`**
   - Files: `git mv public/projects/ src/assets/projects/` (всі 19 JPG)
   - Acceptance: `ls src/assets/projects/` показує всі картинки; `ls public/projects/` не існує
   - Dependencies: немає

2. **Встановити та сконфігурувати vite-imagetools + Sharp**
   - Files: `package.json` (`devDependencies`: `vite-imagetools`, `sharp`), `vite.config.ts` (додати плагін з presets для `hero`, `gallery`, `card`)
   - Acceptance: `npm run build` зеленим, у `dist/assets/` зʼявляються AVIF + WebP варіанти
   - Dependencies: Task 1

3. **Створити `<Picture>` компонент**
   - Files: `src/components/ui/Picture.tsx` (новий)
   - Props: `source: PictureSource` (`{ avif: string, webp: string, fallback: string, width, height }`), `alt`, `loading`, `fetchPriority`, `className`
   - Render: `<picture><source type="image/avif"><source type="image/webp"><img></picture>` з обов'язковими `width`/`height` (для CLS=0)
   - Acceptance: компонент типізований, рендериться, smoke-test додано
   - Dependencies: Task 2

4. **Встановити React Router v7 framework mode**
   - Files: `package.json` (`devDependencies`: `@react-router/dev`, `@react-router/node`; dependencies лишається `react-router`), `react-router.config.ts` (новий: `ssr: false, prerender: ['/', '/pidkhid', '/portfolio', '/portfolio/lakeview', ...]`)
   - Acceptance: `npx react-router build` працює
   - Dependencies: немає

5. **Створити `root.tsx`, `entry.client.tsx`, `routes.ts`**
   - Files: `app/root.tsx` (новий — повний HTML shell: `<html lang="uk"><head><Links/><Meta/></head><body><Outlet/><Scripts/></body></html>`, favicon links, theme-color, global JSON-LD placeholder), `app/entry.client.tsx`, `app/routes.ts` (з 13 маршрутами)
   - Acceptance: build видає `build/client/index.html` + по одному index.html для кожного route у відповідній папці
   - Dependencies: Task 4

6. **Перенести сторінки з `src/pages/` у `app/routes/`**
   - Files: 13 файлів `app/routes/*.tsx` (один на route). Контент копіюємо з `src/pages/*.tsx`, обгортки виконують RR v7 convention.
   - Acceptance: `npm run dev` (через `react-router dev`) показує всі сторінки на правильних URL без `#`
   - Dependencies: Task 5

7. **Path migration audit: замінити всі legacy-шляхи на ESM-імпорти**
   - Files: всі компоненти, що містять `/vugoda-web-2/...` (за verification — 40 входжень у 12 файлах). Зокрема: `Home.tsx` (×8), `ProjectLakeview.tsx` (×18), `ProjectEtnoDim.tsx`, `ProjectMaetok.tsx`, `ProjectNterest.tsx`, `ProjectPipeline04.tsx`, `Investoram.tsx`, `Partneram.tsx`, `Kontakty.tsx`, `Logo.tsx`, `IsometricCubePlaceholder.tsx`, `PageHero.tsx`.
   - Замінити: `<img src="/vugoda-web-2/projects/lakeview/aerial.jpg">` → `import aerial from "~/assets/projects/lakeview/aerial.jpg?preset=hero"; <Picture source={aerial} ... />`
   - `data/projects.ts`: змінити тип `cardImage: string` → `cardImage: PictureSource`; усі 5 проєктних обʼєктів — на ESM-імпорти.
   - Залишок public-файлів (svg-шки `logo-dark`, `mark`, `favicon`, `isometric-grid`) — переписати на root-relative `/logo-dark.svg`.
   - Acceptance: `grep -rn "vugoda-web-2" src/ app/` → 0 результатів
   - Dependencies: Tasks 1, 3, 6

8. **Активувати CI guard для legacy-шляхів**
   - Files: `scripts/check-no-legacy-paths.mjs` (вже з Phase 0), `package.json` (додати у `prebuild` chain: `"prebuild": "npm run check:paths"`)
   - Acceptance: якщо хтось у майбутньому додасть `/vugoda-web-2/` — `npm run build` падає
   - Dependencies: Task 7

9. **Motion fallback strategy для `<FadeIn>`**
   - Files: `src/components/ui/FadeIn.tsx` (або де він є — оновити), додати CSS-only fallback
   - Підхід (рекомендований research): обгортка має `opacity: 1` за замовчуванням у CSS, а motion-трансформи додаються через `useEffect` після гідратації. Тобто при no-JS контент видимий, motion бере контроль після гідратації.
   - Перевірити в DevTools з вимкненим JS — всі 13 файлів з `<FadeIn>` показують контент.
   - Acceptance: відключити JS у DevTools → контент видимий на всіх сторінках; з увімкненим JS — motion-анімація працює
   - Dependencies: Task 6

10. **Self-host Montserrat через `@fontsource/montserrat`**
    - Files: `package.json` (`dependencies`: `@fontsource/montserrat`), імпорт ваг у `root.tsx`: `import "@fontsource/montserrat/400.css"; import "@fontsource/montserrat/600.css"; import "@fontsource/montserrat/700.css";`
    - Видалити `<link href="https://fonts.googleapis.com/...">` з `index.html` (а сам `index.html` буде видалений в Task 11).
    - Acceptance: Network tab показує self-hosted woff2 з origin, не з Google; LCP не блокується Google Fonts
    - Dependencies: Task 5

11. **Cleanup: видалити старі точки входу**
    - Files: видалити `src/App.tsx`, старий `src/main.tsx`, `src/routes.tsx`, `index.html` (корінь). Видалити `src/pages/` (після Task 6).
    - Acceptance: `npm run build` зеленим, `git status` показує усі видалені файли
    - Dependencies: Tasks 5, 6

12. **Hero LCP оптимізація для Lakeview**
    - Files: `app/routes/portfolio.lakeview.tsx` — додати `<link rel="preload" as="image" type="image/avif" href={aerialAvif} imageSrcSet={...} fetchPriority="high" />` у meta-функції; на `<Picture>` для hero — `fetchPriority="high"`, `loading="eager"`
    - Acceptance: Lighthouse — hero AVIF preloaded, LCP element = aerial
    - Dependencies: Tasks 3, 6

### Gates (Stage 5/6/7)

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run test` → 13 PASS (smoke-тести оновлені під нову структуру routes)
- [ ] `npm run build` → success
- [ ] `npm run build:verify` → 13 фізичних `index.html` файлів у правильних папках
- [ ] `grep -rn "vugoda-web-2" src/ app/ public/ build/client/` → 0 результатів
- [ ] `ls build/client/assets/ | grep "\.jpg$"` без `.avif`-сусідів → 0 (інакше fail)
- [ ] З вимкненим JS у DevTools — на 13 сторінках контент видимий (motion fallback)
- [ ] `curl -I http://localhost:3000/portfolio/lakeview` → 200, HTML містить `aerial.avif` у preload
- [ ] Lighthouse local (mobile, Slow 4G emulation) на Lakeview — Performance ≥ 80 (буде довертати у Phase 5)
- [ ] CLS = 0 на 3 сторінках візуально через DevTools

### Handoff

- [ ] Commit: `feat(phase-1): migrate to RR v7 framework mode, vite-imagetools, self-hosted fonts`
- [ ] `progress/phase-1-handoff.md` — список зробленого + перелік `data/projects.ts` нових полів + `<Picture>` API
- [ ] PR → merge до `main`
- [ ] `/clear` перед Phase 2

---

## Phase 2: SEO Content (meta + robots + sitemap + Schema.org)

**Goal:** Кожна з 12 індексованих сторінок отримує унікальний title/description/og:*; глобальний `Organization`/`RealEstateAgent` JSON-LD; розширений `ApartmentComplex` на Lakeview; `robots.txt` + `sitemap.xml` (11 URL); `noindex` для pipeline-04 і novyny.

**Effort:** 4 год (0.5 дня)
**Branch:** `feature/phase-2-seo`
**Acceptance criteria from spec:** §5.1 (унікальні meta, robots, sitemap, Schema.org, Lighthouse SEO ≥ 95).
**Verification gap addressed:** R4 (sitemap не перевіряє noindex автоматично — додано explicit flag).

### Tasks

1. **Per-page `meta()` функції для 13 сторінок**
   - Files: у кожному `app/routes/*.tsx` додати `export function meta()` з `title`, `description`, `og:title`, `og:description`, `og:image` (абсолютний URL з `VITE_SITE_URL`), `og:url`, `og:type`, `og:site_name`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `canonical`.
   - Title ≤ 60 символів; description ≤ 160 символів. Drafts взяти з SEO research (`thoughts/research/2026-05-18-seo-migration.md`).
   - Acceptance: 13 сторінок мають унікальні meta; `build/client/portfolio/lakeview/index.html` містить унікальний title
   - Dependencies: немає (Phase 1 завершена)

2. **Створити утиліту `siteUrl()` для абсолютних URL**
   - Files: `app/lib/site-url.ts` (новий)
   - Logic: `const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://vyhoda.lviv.ua"; export const siteUrl = (path: string) => new URL(path, SITE_URL).toString();`
   - Acceptance: `siteUrl("/portfolio/lakeview")` → `https://vyhoda.lviv.ua/portfolio/lakeview`
   - Dependencies: немає

3. **Global JSON-LD: Organization + RealEstateAgent у `root.tsx`**
   - Files: `app/root.tsx` додати `<script type="application/ld+json">` з обʼєктом: `Organization` + `RealEstateAgent` (ЄДРПОУ 44876801, ПП «ДІК "Вигода +"»)
   - Acceptance: на кожній сторінці JSON-LD валідний у Google Rich Results Test
   - Dependencies: Task 2

4. **Розширений `ApartmentComplex` JSON-LD на Lakeview**
   - Files: `app/routes/portfolio.lakeview.tsx` — додати окремий `<script type="application/ld+json">` з `ApartmentComplex`, `GeoCoordinates`, amenities, `BreadcrumbList`. Дані: $1600/м², 44-183 м², 2027 здача (потребує open question #11 — підтвердити з клієнтом перед production deploy).
   - Acceptance: Lakeview JSON-LD проходить Rich Results Test без warnings
   - Dependencies: Task 2

5. **`robots.txt`**
   - Files: `public/robots.txt` (новий)
   - Content: `User-agent: *\nAllow: /\nSitemap: https://vyhoda.lviv.ua/sitemap.xml`
   - Acceptance: `curl https://localhost/robots.txt` → 200 + content
   - Dependencies: немає

6. **`sitemap.xml` generator (build-time)**
   - Files: `scripts/generate-sitemap.mjs` (новий), `package.json` (`"postbuild": "node scripts/generate-sitemap.mjs"`)
   - Script читає список routes з `app/routes.ts` + `data/projects.ts`, виключає шляхи з `excludeFromSitemap: true` (нове поле). Видає `build/client/sitemap.xml` з 11 URL (всі крім pipeline-04 і novyny).
   - Acceptance: `cat build/client/sitemap.xml` — 11 `<url>` блоків, валідний XML
   - Dependencies: Task 2

7. **`noindex, follow` для pipeline-04 і novyny**
   - Files: `app/routes/portfolio.pipeline-04.tsx`, `app/routes/novyny.tsx` — у `meta()` додати `{ name: "robots", content: "noindex, follow" }`
   - Acceptance: `<meta name="robots" content="noindex, follow">` присутній у відповідних `build/client/.../index.html`
   - Dependencies: Task 1

8. **Перевірка через Google Rich Results Test**
   - Локально (через `react-router dev`) — НЕ дасть, потрібен production URL. Зробити після Phase 3 deploy.
   - На цій фазі — перевіряємо через JSON-LD validator (`https://validator.schema.org/`) шляхом copy-paste отриманого JSON-LD з `build/client/index.html`.
   - Acceptance: validator не показує errors
   - Dependencies: Tasks 3, 4

### Gates

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → success
- [ ] 13 `index.html` файлів — кожен має унікальний `<title>` (перевірка через `scripts/verify-build.mjs` — оновлений)
- [ ] `build/client/sitemap.xml` містить 11 URL (НЕ 13 — pipeline-04 і novyny виключені)
- [ ] `build/client/robots.txt` містить `Sitemap:` директиву
- [ ] pipeline-04 і novyny у `build/client/...html` мають `noindex, follow`
- [ ] JSON-LD на homepage і Lakeview проходить https://validator.schema.org/ (copy-paste з зібраного HTML)

### Handoff

- [ ] Commit: `feat(phase-2): per-page meta, sitemap, robots, JSON-LD`
- [ ] `progress/phase-2-handoff.md`
- [ ] PR → merge
- [ ] `/clear`

---

## Phase 3: Cloudflare Pages Deploy (без форми)

**Goal:** Робочий production-build на `vugoda-web-2.pages.dev` з усіма заголовками, редиректами, secrets для майбутньої форми. GitHub Pages — у `workflow_dispatch`-only режим на 14 днів.

**Effort:** 4 год (0.5 дня)
**Branch:** `feature/phase-3-cf-deploy`
**Acceptance criteria from spec:** §5.4 (CF Pages, cache headers, security headers, secrets, preview deployments, rollback).
**Verification gap addressed:** R5 (CF account ownership — на email клієнта); A4 (WAF rule замість native rate-limit binding); G6 (`_headers` не діє на функції — це для Phase 4).

### Tasks

1. **Зареєструвати Cloudflare account на email клієнта**
   - Action: створити CF account через `<email клієнта>`, виконавець інвітується як collaborator з admin-правами.
   - Acceptance: клієнт підтвердив email; виконавець бачить CF dashboard
   - Dependencies: bus factor mitigation (open question #5 у spec)

2. **Connect GitHub репо до Cloudflare Pages**
   - Action: CF dashboard → Pages → Create project → Connect GitHub → вибрати `vugoda-web-2` репо → branch `main` → build command `npm run build` → output dir `build/client`
   - Acceptance: перший автодеплой запустився після push у main
   - Dependencies: Task 1

3. **Cloudflare env vars (public + secrets, поки що тільки для site)**
   - Action: у CF Pages → Settings → Environment Variables:
     - Production: `VITE_SITE_URL=https://vyhoda.lviv.ua` (plain text), `NODE_VERSION=20.18.0` (plain text)
     - Preview: те ж саме, але `VITE_SITE_URL` залишаємо canonical (бо canonical у HTML має бути prod-URL завжди)
   - Telegram/Turnstile secrets — НЕ додаємо на цій фазі (вони у Phase 4)
   - Acceptance: env vars видно у dashboard
   - Dependencies: Task 2

4. **`public/_headers`**
   - Files: `public/_headers` (новий)
   - Content:
     ```
     /assets/*
       Cache-Control: public, max-age=31536000, immutable
     /*
       Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
       X-Frame-Options: DENY
       X-Content-Type-Options: nosniff
       Referrer-Policy: strict-origin-when-cross-origin
     /
       Cache-Control: public, max-age=0, must-revalidate
     ```
   - Acceptance: після deploy `curl -I https://vugoda-web-2.pages.dev/assets/<hash>.js` показує immutable; `curl -I https://vugoda-web-2.pages.dev/` показує no-cache
   - Dependencies: Task 2

5. **`public/_redirects`**
   - Files: `public/_redirects` (новий)
   - Content:
     ```
     /vugoda-web-2/*  /:splat  301
     /index.html      /        301
     ```
   - Acceptance: `curl -I https://vugoda-web-2.pages.dev/vugoda-web-2/portfolio/lakeview` → 301 до `/portfolio/lakeview`
   - Dependencies: Task 2

6. **WAF rule для `/api/contact` rate limit**
   - Action: CF dashboard → Security → WAF → Create rate-limiting rule
     - Match: `(http.request.uri.path eq "/api/contact" and http.request.method eq "POST")`
     - Rate: 5 requests per 60 seconds per IP
     - Action: Block, status 429, response header `Retry-After: 60`
   - Acceptance: rule створено, "enabled" toggle on
   - Dependencies: Task 2 (потрібен зареєстрований проєкт)

7. **GitHub Pages — `workflow_dispatch`-only режим**
   - Files: `.github/workflows/deploy.yml` — змінити trigger з `on: push` на `on: workflow_dispatch` (зберігаємо як manual fallback на 14 днів, потім видалимо).
   - Acceptance: `git push` НЕ запускає GH Pages deploy; видно manual "Run workflow" кнопку у GitHub Actions
   - Dependencies: Task 2 (CF деплой має працювати, перш ніж вимикати GH Pages)

8. **Перевірити CF preview deployments**
   - Action: push у `feature/test` гілку → CF створює preview URL → перевіряємо що відкривається
   - Acceptance: PR coment з preview URL від Cloudflare bot
   - Dependencies: Task 2

9. **Rollback drill**
   - Action: у CF dashboard виконати rollback на попередній deploy, перевірити що активний deploy переключився за < 1 хв.
   - Acceptance: rollback успішний, документувати скріншот або шлях у `progress/phase-3-handoff.md`
   - Dependencies: Task 2 (мінімум 2 deploys у історії)

### Gates

- [ ] CF Pages deploy `https://vugoda-web-2.pages.dev` працює, всі 13 URLs доступні з 200 OK
- [ ] `curl -I .../assets/<file>.js` → `Cache-Control: public, max-age=31536000, immutable`
- [ ] `curl -I .../` → HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] `curl -I .../vugoda-web-2/portfolio/lakeview` → 301
- [ ] Preview deployment на feature-гілці → URL від CF bot працює
- [ ] WAF rule для `/api/contact` enabled (видно у dashboard)
- [ ] GH Pages workflow у `workflow_dispatch`-only, push не тригерить
- [ ] Rollback drill пройдено

### Handoff

- [ ] Commit: `feat(phase-3): cloudflare pages deploy with headers, redirects, WAF`
- [ ] `progress/phase-3-handoff.md` з URL preview/production, переліком env vars, посиланнями на CF dashboard
- [ ] PR → merge
- [ ] `/clear`

---

## Phase 4: Form Backend (Telegram-only)

**Goal:** Реальний backend контактної форми. POST `/api/contact` як Cloudflare Pages Function. 4 шари захисту: Origin / Turnstile / WAF rate limit / Honeypot. Доставка у Telegram-групу < 5s. Видимий consent checkbox.

**Effort:** 8 год (1 день)
**Branch:** `feature/phase-4-form`
**Acceptance criteria from spec:** §5.3 (full ContactForm criteria — 17 пунктів).
**Verification gap addressed:** G6 (CORS у коді функції, не в `_headers`); R3 (separate test bot для preview).

### Tasks

1. **Реєстрація Telegram bot + chat IDs**
   - Action (клієнт + виконавець): через @BotFather створити `@vyhoda_leads_bot`, отримати token. Додати у Telegram-групу відділу продажів, отримати chat_id (`getUpdates`). Окремий test-bot для preview env або окрема test-група (R3 mitigation).
   - Acceptance: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (prod), `TELEGRAM_CHAT_ID_PREVIEW` (preview) — записані у secure vault / документ для клієнта
   - Dependencies: open question #8 закрита (клієнт виділив відповідального)

2. **Реєстрація Cloudflare Turnstile**
   - Action: CF dashboard → Turnstile → Add site → domain `vyhoda.lviv.ua` + `vugoda-web-2.pages.dev` → отримати `TURNSTILE_SITE_KEY` (public), `TURNSTILE_SECRET_KEY` (secret)
   - Test keys для preview: `1x00000000000000000000AA` (site) / `1x0000000000000000000000000000000AA` (secret)
   - Acceptance: keys отримані
   - Dependencies: Phase 3 deploy

3. **Додати secrets у CF Pages env**
   - Action: CF dashboard → Pages → Settings → Env vars:
     - Production secrets (Encrypted): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TURNSTILE_SECRET_KEY`
     - Production plain: `TURNSTILE_SITE_KEY`, `VITE_TURNSTILE_SITE_KEY` (для VITE doppelganger щоб клієнт мав доступ)
     - Preview secrets: ті ж змінні, але з test-токенами
   - Acceptance: 5 prod + 5 preview env vars присутні
   - Dependencies: Tasks 1, 2

4. **Zod-схема контракту: `shared/contact-schema.ts`**
   - Files: `shared/contact-schema.ts` (новий)
   - Поля: `name` (string min 2), `phone` (regex UA-маска), `source` (enum: hero/investors/partners/kontakty), `consent` (z.literal(true)), `turnstileToken` (string), `company` (honeypot — optional, has-to-be-empty), `message` (optional string)
   - Acceptance: `tsc --noEmit` зеленим, схема імпортується і клієнтом, і функцією
   - Dependencies: немає

5. **`functions/api/contact.ts` — Cloudflare Pages Function**
   - Files: `functions/api/contact.ts` (новий)
   - Структура (порядок шарів):
     1. Перевірити `request.method === 'POST'` → інакше 405
     2. **Origin check** — `Origin` header проти allow-list (`vyhoda.lviv.ua`, `www.vyhoda.lviv.ua`, `*.vugoda-web-2.pages.dev`) → інакше 403
     3. Parse JSON + Zod-валідація → 400 з помилками
     4. **Honeypot** — якщо `company` непорожнє → silent 200 + log `spam_honeypot`, НЕ викликати Telegram
     5. **Turnstile siteverify** — POST до `https://challenges.cloudflare.com/turnstile/v0/siteverify` з secret + token → якщо `!success` → 403
     6. WAF rate-limit вже спрацював на edge до функції (Phase 3 Task 6), тому додаткова логіка не потрібна
     7. HTML-escape всіх string-полів (`<`, `>`, `&`, `'`, `"`)
     8. Сформувати Telegram message (parse_mode=HTML): emoji-маркер `source`, name, `<a href="tel:+380...">phone</a>`, message, consent text + timestamp, requestId, IP-hash
     9. POST до `https://api.telegram.org/bot<TOKEN>/sendMessage` з retry × 2
     10. Response 200 OK з `{ ok: true, requestId }`; на 5xx Telegram — return 502 з повідомленням
   - CORS на response: `Access-Control-Allow-Origin` (echo з Origin якщо у whitelist), `Vary: Origin`. OPTIONS → 405 (бо лише POST, форма НЕ робить preflight для simple POST).
   - У логах НЕ зберігати plain phone/name (тільки requestId, IP-hash).
   - Acceptance: функція задеплоєна; `curl -X POST .../api/contact -d <invalid>` → 400; з валідним payload → 200
   - Dependencies: Tasks 1, 2, 3, 4

6. **`ContactForm.tsx` переписаний**
   - Files: `src/components/ContactForm.tsx` (повне переписування)
   - Логіка: useState machine (`idle | loading | success | error | rate-limited`), `fetch('/api/contact')`, Turnstile widget через `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer>` + `<div class="cf-turnstile" data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}>`, honeypot input (`style="position:absolute;left:-9999px"`, `tabindex="-1"`, `autocomplete="off"`), видимий unchecked-by-default consent checkbox.
   - Submit button: `disabled` на loading; на 429 — показує countdown "Спробуйте через {N}s" 60s.
   - Помилки: 400 → підсвітити поля; 5xx → "Технічна помилка, телефонуйте +380XX..." + кнопка повтору; success — без перезавантаження, чистимо форму, показуємо "Дякуємо, ми зателефонуємо протягом 1 год".
   - Phone input: `inputmode="tel"`, маска через простий regex (не масивна lib).
   - Acceptance: smoke-test (Vitest + RTL) на render форми проходить
   - Dependencies: Tasks 4, 5

7. **`.dev.vars` для local dev**
   - Files: `.dev.vars` (новий, у .gitignore), `.dev.vars.example` (новий, committed) — з placeholder-токенами для test-bot
   - Acceptance: `git status` НЕ показує `.dev.vars`; `cat .gitignore | grep dev.vars` → є
   - Dependencies: немає

8. **E2E smoke-test через Wrangler Pages Dev**
   - Action: локально `npm run build && wrangler pages dev build/client --binding TELEGRAM_BOT_TOKEN=... --binding TELEGRAM_CHAT_ID=...` → submit з браузера → перевірити що повідомлення в test-Telegram-групі за < 5s.
   - Acceptance: повідомлення прийшло, phone клікабельний, parse_mode HTML коректний (escaped)
   - Dependencies: Tasks 1, 5, 6, 7

9. **Production smoke-test**
   - Action: після merge у main → CF Pages auto-deploy → форма з production-URL → лід у production Telegram-групі.
   - Перевірити всі 4 точки входу форми (`source: hero | investors | partners | kontakty`).
   - Перевірити edge cases: rate-limit (натиснути 6 разів за 60с → 429), honeypot (через DevTools заповнити приховане поле → silent 200 без Telegram-повідомлення), invalid Turnstile (видалити токен → 403), invalid consent (unchecked → 400).
   - Acceptance: всі 4 source приходять; 4 захисти працюють
   - Dependencies: Task 8 (merge + auto-deploy)

10. **Перевірка git history на leak secrets**
    - Action: `git log --all -p | grep -iE "TELEGRAM_BOT_TOKEN|TURNSTILE_SECRET" | head` — має бути порожньо
    - Acceptance: 0 рядків
    - Dependencies: немає

### Gates

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run test` → all PASS (включно з form unit-тестами)
- [ ] `npm run build` → success
- [ ] Wrangler Pages Dev — форма submit'ить у test-Telegram-групу
- [ ] 4 шари захисту перевірені вручну (Origin / Turnstile / Rate-limit / Honeypot)
- [ ] 4 sources (hero/investors/partners/kontakty) приходять з різними emoji-маркерами
- [ ] Phone у Telegram — клікабельний `tel:` лінк
- [ ] Consent text + timestamp присутні у Telegram-повідомленні
- [ ] `.dev.vars` у .gitignore; git history не містить secrets
- [ ] `curl -X OPTIONS .../api/contact` → 405 або 204
- [ ] `curl -X GET .../api/contact` → 405

### Handoff

- [ ] Commit: `feat(phase-4): telegram contact form backend with 4-layer protection`
- [ ] `progress/phase-4-handoff.md` з прикладом payload, прикладом Telegram-повідомлення, troubleshooting (що робити якщо не приходить)
- [ ] PR → merge
- [ ] `/clear`
- [ ] **MILESTONE: P0 acceptance criteria всі закриті — спек §5 пройдений.**

---

## Phase 5: Polish (опційно)

**Goal:** Closure всіх P1 пунктів і Lighthouse тонкого тюнінгу.

**Effort:** 4 год (0.5 дня)
**Branch:** `feature/phase-5-polish`
**Acceptance criteria from spec:** §3 Should-have пункти (301 редиректи `_redirects`, preview deployments активовано — частково в Phase 3, оптимізація construction-фото та pipeline-проектів).

### Tasks

1. **Оптимізація construction-фото і pipeline-проектів** (12 JPG + WebP-рендери etno-dim/maetok/nterest через vite-imagetools preset)
2. **Додатковий редирект `/#/*` → `/*`** через JS-snippet у `app/root.tsx` (бо `_redirects` не бачить URL fragment)
3. **Lighthouse mobile pass:** Performance ≥ 85, SEO ≥ 95, Accessibility ≥ 95 (регресія) на `/`, `/portfolio/lakeview`, `/kontakty`. Якщо < target — debug через WebPageTest, оптимізувати.
4. **Production Google Rich Results Test** на homepage і Lakeview — фікс будь-яких warnings
5. **DNS handoff документація:** інструкція для клієнта як делегувати `vyhoda.lviv.ua` у Cloudflare (одна сторінка markdown у `docs/dns-handoff.md`)
6. **Видалити GH Pages workflow** (після 14 днів стабільного CF deploy)
7. **README update:** як запускати dev, deploy, де secrets, як rollback

### Gates

- [ ] Lighthouse mobile Performance ≥ 85, SEO ≥ 95 на 3 цільових сторінках
- [ ] Google Rich Results Test зелений на 2 цільових сторінках
- [ ] DNS handoff документ у `docs/`
- [ ] README відповідає реальному стану проекту

### Handoff

- [ ] Commit: `chore(phase-5): polish, lighthouse tuning, dns docs`
- [ ] `progress/final-handoff.md` — summary всієї міграції, посилання на всі phase-handoff документи
- [ ] PR → merge
- [ ] **MILESTONE: міграція завершена, спек закритий.**

---

## Per-phase Implementation Prompts

### Phase 0 Implementation Prompt

```
Контекст: спек `specs/2026-05-18-production-readiness.md` v1.1, verification `thoughts/research/2026-05-18-plan-verification.md`, план `plans/2026-05-18-production-readiness-implementation-plan.md`.

Виконай Phase 0 (Prep & Safety net) повністю згідно з планом. Без імпровізацій.

Завдання:
1. `.nvmrc` з 20.18.0
2. Vitest + setup + 13 smoke-tests на render сторінок
3. `scripts/verify-build.mjs` (нехай поки що — no-op, але executable, додається у package.json як build:verify)
4. `scripts/check-no-legacy-paths.mjs` (написати, НЕ активувати у prebuild — це Phase 1)
5. Pre-commit hook через simple-git-hooks (tsc + vitest)
6. 11 OG-карток 1200×630 у `public/og/` (AI-генерація через брендбук на dark-bg)

НЕ виходь за scope: НЕ чіпай router, НЕ переноси картинки, НЕ міняй вже існуючі компоненти. Тільки додавання нових файлів і `package.json` змін.

Gates перед commit:
- tsc → 0 errors
- vitest → 13 PASS
- build → success (на старому HashRouter)
- ls public/og/ → 11 файлів

Commit message: `chore(phase-0): add vitest, smoke tests, build verification, og cards`
Створи `progress/phase-0-handoff.md` із зробленим/незробленим.
```

### Phase 1 Implementation Prompt

```
Контекст: спек v1.1, verification (особливо G1, G2, G3, G5), план Phase 1. Phase 0 завершено, є vitest + 11 OG-карток + verify-script.

Виконай Phase 1 (Architecture migration) — переїзд на RR v7 framework mode + vite-imagetools + self-host Montserrat + усунення всіх legacy `/vugoda-web-2/` шляхів.

Завдання у такому порядку:
1. `git mv public/projects/ src/assets/projects/`
2. vite-imagetools + Sharp у devDeps; конфіг у vite.config.ts (presets: hero, gallery, card)
3. `<Picture>` компонент у `src/components/ui/Picture.tsx` (avif/webp/jpg fallback, обов'язкові width/height)
4. RR v7 framework mode: `@react-router/dev`, `react-router.config.ts` (ssr:false, prerender:[13 routes])
5. `app/root.tsx` (HTML shell + favicon links + theme-color + global JSON-LD placeholder + self-hosted Montserrat імпорти), `app/entry.client.tsx`, `app/routes.ts`
6. Перенести 13 сторінок з `src/pages/` у `app/routes/`
7. Замінити ВСІ 40 hard-coded `/vugoda-web-2/...` шляхів на ESM-імпорти через `<Picture>`. Включно з: `data/projects.ts` (cardImage: string → PictureSource), `Logo.tsx`, `IsometricCubePlaceholder.tsx`, `PageHero.tsx`, всі 5 проєктних сторінок + Home + Investors + Partners + Kontakty.
8. Активувати `npm run check:paths` у prebuild hook (Phase 0 script + enable)
9. Motion fallback: `<FadeIn>` має CSS-based opacity:1 за замовчуванням, motion підхоплює після гідратації. Перевірити з вимкненим JS.
10. `@fontsource/montserrat` (400, 600, 700) у root.tsx
11. Видалити `src/App.tsx`, старий `src/main.tsx`, `src/routes.tsx`, корінний `index.html`, `src/pages/`
12. Hero LCP preload на Lakeview

НЕ виходь за scope: НЕ пиши SEO meta (це Phase 2), НЕ налаштовуй Cloudflare (Phase 3), НЕ чіпай ContactForm (Phase 4).

Gates перед commit:
- tsc → 0 errors
- vitest → 13 PASS (оновити smoke-тести під нову routes структуру)
- build → success
- `grep -rn "vugoda-web-2" src/ app/ public/ build/client/` → 0
- 13 фізичних index.html у build/client
- `ls build/client/assets/ | grep "\.jpg$"` без AVIF-сусідів → 0
- З вимкненим JS — контент видимий на всіх сторінках

Commit: `feat(phase-1): migrate to RR v7 framework mode, vite-imagetools, self-hosted fonts`
Створи `progress/phase-1-handoff.md`.
```

### Phase 2 Implementation Prompt

```
Контекст: Phase 1 завершено (RR v7 + vite-imagetools + 0 legacy paths). Тепер додаємо SEO content згідно spec §5.1.

Виконай Phase 2 (SEO content) повністю згідно з планом.

Завдання:
1. Утиліта `app/lib/site-url.ts` для абсолютних URL через `VITE_SITE_URL`
2. Per-page `meta()` функції у 13 файлах `app/routes/*.tsx` (title ≤60, desc ≤160, og:*, twitter:*, canonical). Drafts з `thoughts/research/2026-05-18-seo-migration.md`.
3. Global JSON-LD `Organization` + `RealEstateAgent` (ЄДРПОУ 44876801) у `app/root.tsx`
4. Розширений `ApartmentComplex` JSON-LD на `app/routes/portfolio.lakeview.tsx` (з GeoCoordinates, amenities, BreadcrumbList)
5. `public/robots.txt`
6. `scripts/generate-sitemap.mjs` (build-time, post-build) — 11 URLs (виключити pipeline-04, novyny)
7. `noindex, follow` для pipeline-04 і novyny через meta()
8. Перевірка JSON-LD через https://validator.schema.org/ (copy-paste з build output)

НЕ виходь за scope: НЕ налаштовуй Cloudflare (Phase 3), НЕ пиши ContactForm backend (Phase 4).

Gates:
- tsc → 0
- vitest → all PASS
- build → success
- 13 index.html кожен з унікальним title (verify-script оновлений)
- sitemap.xml містить 11 URL
- pipeline-04, novyny мають noindex, follow
- JSON-LD валідний у validator.schema.org

Commit: `feat(phase-2): per-page meta, sitemap, robots, JSON-LD`
Створи `progress/phase-2-handoff.md`.
```

### Phase 3 Implementation Prompt

```
Контекст: Phase 2 завершено, site SEO-ready. Тепер деплоймо на Cloudflare Pages БЕЗ форми (форма у Phase 4).

Виконай Phase 3 (CF deploy) повністю згідно з планом.

Передумова: open question #5 закрита — CF account реєструється на email клієнта, виконавець як collaborator.

Завдання:
1. Створити CF account на email клієнта (узгодити з клієнтом перед стартом). Виконавця — invite як admin.
2. Connect GitHub repo → CF Pages → build cmd `npm run build`, output `build/client`
3. CF env vars (production + preview): VITE_SITE_URL, NODE_VERSION=20.18.0. БЕЗ Telegram/Turnstile (вони у Phase 4).
4. `public/_headers` (immutable для /assets/*, HSTS+X-Frame-Options+X-Content-Type-Options+Referrer-Policy для /*)
5. `public/_redirects` (`/vugoda-web-2/* → /:splat 301`)
6. WAF rule для `/api/contact` rate-limit (5 req / 60s / IP, 429 з Retry-After: 60) — створити, але форма ще не активна
7. GH Pages workflow → `on: workflow_dispatch` (зберегти як manual fallback на 14 днів)
8. Перевірити preview deployments на feature-гілці
9. Rollback drill: зробити 2 deploys, rollback, перевірити < 1 хв

НЕ виходь за scope: НЕ пиши ContactForm функцію (Phase 4), НЕ додавай Telegram secrets зараз.

Gates:
- CF Pages production deploy працює: https://vugoda-web-2.pages.dev/ → 200, всі 13 URLs доступні
- curl -I .../assets/<file>.js → immutable
- curl -I .../ → всі security headers
- /vugoda-web-2/portfolio/lakeview → 301
- Preview URL від CF bot працює
- WAF rule enabled (видно у dashboard)
- GH Pages workflow → workflow_dispatch-only
- Rollback drill пройдено

Commit: `feat(phase-3): cloudflare pages deploy with headers, redirects, WAF`
Створи `progress/phase-3-handoff.md` з URLs, env vars listing, CF dashboard посиланнями.
```

### Phase 4 Implementation Prompt

```
Контекст: Phase 3 завершено, site у production на CF Pages БЕЗ форми. Тепер форма (Telegram-only) — це фінальний P0 пункт.

Виконай Phase 4 (Form backend Telegram-only) повністю згідно з планом і spec §5.3 (17 acceptance пунктів).

Передумова: open question #8 закрита — клієнт надав TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (prod), TELEGRAM_CHAT_ID_PREVIEW (test bot/group). Якщо ще немає — STOP і запросити.

Завдання:
1. Зареєструвати/отримати Telegram bot через @BotFather, додати у sales-групу, отримати chat_id
2. Зареєструвати Cloudflare Turnstile для domain → отримати site/secret keys (test keys для preview: 1x00000000000000000000AA / 1x0000000000000000000000000000000AA)
3. Додати у CF Pages env: TELEGRAM_BOT_TOKEN/CHAT_ID/TURNSTILE_SECRET_KEY (encrypted) + TURNSTILE_SITE_KEY/VITE_TURNSTILE_SITE_KEY (plain) — production + preview окремо
4. `shared/contact-schema.ts` — Zod-схема (name, phone UA-mask, source enum, consent literal(true), turnstileToken, company honeypot, optional message)
5. `functions/api/contact.ts` — 4-layer protection:
   - Method check (POST only → 405)
   - Origin check (vyhoda.lviv.ua / www.vyhoda.lviv.ua / *.vugoda-web-2.pages.dev → 403)
   - Zod-валідація → 400
   - Honeypot (company filled → silent 200 + log, no Telegram)
   - Turnstile siteverify → 403 if !success
   - HTML escape (`<>&'"`)
   - Telegram sendMessage з parse_mode=HTML, retry × 2
   - 200 OK з requestId / 502 on Telegram fail
   - CORS echo Origin (whitelist), Vary: Origin
   - Logs: НЕ зберігати plain PII, тільки requestId + IP-hash
6. `src/components/ContactForm.tsx` повне переписування:
   - State machine (idle/loading/success/error/rate-limited)
   - Turnstile widget (script tag + div data-sitekey)
   - Honeypot off-screen input (tabindex=-1, autocomplete=off)
   - ВИДИМИЙ unchecked-by-default consent checkbox
   - Phone мітка inputmode=tel + regex маска UA
   - Submit disabled during loading
   - 429 → countdown 60s "Спробуйте через {N}s"
   - 5xx → "Технічна помилка, телефонуйте +380XX" + retry button
   - Success — без перезавантаження
7. `.dev.vars` (gitignored) + `.dev.vars.example` (committed)
8. E2E smoke-test через `wrangler pages dev build/client` — submit з браузера → test-Telegram-group отримує < 5s
9. Production smoke-test (після auto-deploy): 4 sources × 4 захисти = 16 verifications
10. `git log --all -p | grep -iE "TELEGRAM_BOT_TOKEN|TURNSTILE_SECRET"` → 0

НЕ виходь за scope: НЕ оптимізуй construction фото (Phase 5), НЕ роби extra Lighthouse tuning (Phase 5).

Gates (всі 17 пунктів spec §5.3):
- POST only (405 на інші методи, GET, OPTIONS)
- 4 sources приходять у Telegram з різними emoji
- Origin / Turnstile / Rate-limit / Honeypot — ручна верифікація
- Phone у Telegram — `<a href="tel:">` клікабельний
- Consent text + timestamp у повідомленні
- HTML escape працює
- Submit disabled during loading
- 429 countdown 60s
- Error messages читабельні українською
- .dev.vars gitignored, історія чиста
- tsc + vitest + build → 0/PASS/success

Commit: `feat(phase-4): telegram contact form backend with 4-layer protection`
Створи `progress/phase-4-handoff.md` з example payload, example Telegram message, troubleshooting guide.

ПІСЛЯ МЕРЖА: усі P0 пункти спеку закриті. Production-ready.
```

### Phase 5 Implementation Prompt

```
Контекст: Phase 4 завершено, всі P0 закриті. Phase 5 — опційний polish для P1 пунктів spec §3 Should-have.

Виконай Phase 5 (Polish) згідно з планом. Якщо клієнт хоче "хоч щось зекономити час" — пропусти або зменши scope.

Завдання:
1. Оптимізація construction-фото (12 JPG) + pipeline-проекти (etno-dim/maetok/nterest WebP renders) через vite-imagetools preset
2. JS-snippet у app/root.tsx для редиректу `/#/<path>` → `/<path>` (бо `_redirects` не бачить fragment)
3. Lighthouse mobile тюнінг: Performance ≥ 85, SEO ≥ 95, Accessibility ≥ 95 на /, /portfolio/lakeview, /kontakty. Якщо нижче — WebPageTest debug.
4. Production Google Rich Results Test на homepage і Lakeview — фікс warnings
5. `docs/dns-handoff.md` — інструкція клієнту як делегувати vyhoda.lviv.ua у Cloudflare
6. (Після 14 днів стабільного CF) — видалити .github/workflows/deploy.yml
7. README update: dev, build, deploy, rollback, secrets location

Gates:
- Lighthouse цілі досягнуті на 3 сторінках
- Rich Results Test зелений
- DNS handoff документ існує
- README актуальний

Commit: `chore(phase-5): polish, lighthouse tuning, dns docs`
Створи `progress/final-handoff.md` — summary всієї міграції.
```

---

## Challenge log (Bulletproof Stage 3 checks)

### 1. Does this solve the problem from spec?

Пройдено по 7 acceptance-блоках:

| Spec block | Покриває Phase | Status |
|---|---|---|
| §5.1 SEO / Routing (12 пунктів) | Phase 1 (BrowserRouter, prerender), Phase 2 (meta, JSON-LD, robots, sitemap, noindex) | Так |
| §5.2 Performance (7 пунктів) | Phase 1 (AVIF/WebP, hero preload, CLS=0), Phase 5 (Lighthouse тюнінг) | Так |
| §5.3 Form Telegram (17 пунктів) | Phase 4 цілком | Так |
| §5.4 Deployment (12 пунктів) | Phase 3 (CF deploy, headers, redirects, secrets, rollback), Phase 0 (.nvmrc) | Так |
| §5.5 Accessibility (4 пункти) | Phase 1 (regression-check у smoke-tests), Phase 5 (Lighthouse Accessibility ≥95) | Так |
| §6 NFR — Безпека | Phase 3 (HSTS), Phase 4 (origin, secrets) | Так |
| §6 NFR — Reversibility | Phase 3 (GH Pages workflow_dispatch, CF rollback drill), feature flag CONTACT_FORM_DISABLED — в backlog Phase 5 | Частково |

**Гап:** feature flag `CONTACT_FORM_DISABLED=true` (spec §6 reversibility) — НЕ додано в жодну фазу. **Action:** додати в Phase 4 Task 5 як `if (env.CONTACT_FORM_DISABLED === 'true') return new Response(JSON.stringify({error: 'Тимчасово недоступно, телефонуйте +380XX'}), {status: 503})`.

### 2. Is this the most efficient solution?

- Phase 1 + Phase 4 (images) ОБ'ЄДНАНО (verification G5) — економить ~3 год дублювання роботи з 40 hard-coded шляхами.
- Phase 3 (deploy) ДО Phase 4 (form) — це правильно, бо WAF rule і env vars для форми треба у CF, інакше Phase 4 не задеплоїться.
- Self-host Montserrat ЗАМІСТЬ Google Fonts — economy 200-400ms на LCP без коштів.
- WAF rule ЗАМІСТЬ native Rate Limit Binding — обходить bug #8544 (verification A4), zero code.
- vite-react-ssg як 80/20 альтернатива — verification A2 рекомендує лишити RR v7 для довгострокової маржі. Підтримую.

### 3. Is there "code for code's sake"?

- `scripts/verify-build.mjs` — не overhead, він критичний для catching regression при кожному build (verification G4).
- `<Picture>` компонент — обов'язковий для типобезпечного контракту з vite-imagetools (інакше будуть string-шляхи).
- Vitest smoke-tests (13 файлів) — мінімальний investment (~30 хв), що економить години debugging.
- pre-commit hook — single line, але catches 90% TS-помилок до commit.

Все служить spec criteria. Жодного "code for code's sake".

---

## Risks per phase + Rollback strategy

| Phase | Risk | Mitigation | Rollback |
|---|---|---|---|
| 0 | Sharp не встановлюється на mac M-series | `npm install --include=optional sharp` або `sharp-darwin-arm64` explicit | Видалити vite-imagetools, повернутися до старих JPG-шляхів |
| 1 | Hydration mismatch motion після SSG | Motion CSS-fallback + `MotionConfig reducedMotion` під час SSR | revert PR; ноду повернути на старий BrowserRouter |
| 1 | `prerender: ['*']` робить wildcard рендер замість index.html | Не використовувати wildcards, явний список 13 routes | revert PR |
| 2 | Title >60 символів проскочив (Google обрізає) | verify-build.mjs додає check на довжину | редагувати meta(), redeploy |
| 3 | GH Pages workflow видалений раніше часу — лишилися без fallback | Тримати у `workflow_dispatch`-only **14 днів**, не видаляти раніше | git revert; редеплой GH Pages |
| 3 | CF account ownership — клієнт не дав доступ | СТАРТ-блокер; узгодити з клієнтом ДО Phase 3 | n/a — це operational, не code |
| 4 | Telegram bot не у групі / wrong chat_id | Тест-bot у тест-групі перед production | змінити CF env var, redeploy |
| 4 | Turnstile блокує реальних користувачів (false positives) | Моніторити success rate у CF Turnstile dashboard | feature flag CONTACT_FORM_DISABLED=true + телефон у UI |
| 4 | Telegram API down — заявки втрачаються | retry × 2 у функції; 5xx → клієнт бачить "телефонуйте"; **майбутній sprint: Resend як другий канал** | n/a — комунікація з клієнтом |
| 5 | Lighthouse не досягає 85 Performance — потрібен deep WebPageTest | Час-box 2 год на тюнінг; якщо не виходить — фіксуємо що є, відкриваємо follow-up issue | n/a — це polish, не блокер |

**Global rollback:** на будь-якому commit у `main` — CF Pages dashboard → попередній deploy → Activate. Час < 1 хв. Це підтверджено drill-ом у Phase 3.

---

## Day-by-day Timeline

| День | Phase | Що робиться | End-of-day deliverable |
|---|---|---|---|
| **День 1** (ранок) | Phase 0 | .nvmrc, Vitest setup, 13 smoke-tests, verify-build script, OG-картки | Phase 0 merged → main; feedback loop працює |
| **День 1** (день) | Phase 1 (start) | git mv images, vite-imagetools, `<Picture>`, RR v7 framework mode setup | RR v7 build генерує 13 index.html |
| **День 2** | Phase 1 (end) | Path migration (40 шляхів), motion fallback, self-host Montserrat, видалити legacy entry points | Phase 1 merged; `grep vugoda-web-2 src/` → 0; build зеленим |
| **День 3** (ранок) | Phase 2 | Per-page meta, JSON-LD, robots.txt, sitemap.xml, noindex | Phase 2 merged; всі 13 сторінок мають unique meta |
| **День 3** (день) | Phase 3 | CF account, connect GitHub, _headers/_redirects, WAF rule, GH Pages → workflow_dispatch, rollback drill | Production на vugoda-web-2.pages.dev; preview deploys працюють |
| **День 4** | Phase 4 | Bot+Turnstile setup, contact-schema.ts, functions/api/contact.ts (4-layer), ContactForm.tsx переписаний, wrangler local smoke-test | Phase 4 merged; форма доставляє у Telegram з production |
| **День 5** | Phase 5 (optional) | Construction images, JS hash-fragment redirect, Lighthouse тюнінг до targets, Rich Results Test, DNS handoff docs, README | Final handoff document; всі gates спеку закриті |

**Buffer:** День 5 також служить буфером, якщо Phase 1/4 виявляться важчими. Якщо клієнт жорстко тиснe "2-3 дні" — Phase 5 повністю в backlog, частина §5.5 регресія перевірок прискорюється (за рахунок risk-tolerance).

---

## Файли, які цей план створить (для довідки)

- `plans/2026-05-18-production-readiness-implementation-plan.md` (цей файл)
- `progress/phase-0-handoff.md` ... `progress/phase-5-handoff.md` + `progress/final-handoff.md`
- 6 feature-гілок + 6 PR + 6 merge commits у `main`
