# Plan Verification — Production-Readiness Migration

**Date:** 2026-05-18
**Reviewer:** Plan agent (verification mode, read-only)
**Status:** Critical review of spec v1.1 + 5 research artifacts
**Verdict:** План **80% готовий**. Архітектурно правильний, але має 6 гапів, 2 з яких блокують або сильно ускладнюють Phase 1.

---

## Що покрите коректно

- **Routing/SSG.** RR v7 framework mode — обґрунтований вибір (офіційний maintainer `vite-react-ssg` сам редиректить туди). React 19 native meta hoisting + `MetaFunction` повністю закриває per-page `<title>`/`<meta>`/`og:*`/`twitter:*`/`canonical` без `react-helmet-async`.
- **Form security defense-in-depth.** Origin + Turnstile + Rate-limit + Honeypot + Zod + HTML escape — стандарт галузі, нічого не пропущено. Telegram-only варіант знімає `~$0` ризик і SPF/DKIM/DMARC скоуп.
- **Image strategy.** vite-imagetools + Sharp + `<Picture>` + AVIF/WebP/JPEG fallback ladder + preset-based directives — production-grade. Цифри (10.9 MB → 365 KB mobile) реалістичні.
- **Cloudflare Pages deployment.** Git integration, NODE_VERSION через `.nvmrc`, `_headers`/`_redirects`, відмова від `wrangler.toml` через bug #8544 — все відповідає поточному стану CF docs.
- **GDPR.** Видимий чекбокс + `consent_timestamp` в Telegram — мінімум, що проходить ЗУ «Про захист персональних даних».
- **Acceptance criteria.** §5 testable. Lighthouse thresholds, curl-перевірки заголовків, smoke-test Telegram — все можна автоматизувати або зробити за 30 хв ручного QA.

---

## Гапи (треба додати у план)

### G1. Hard-coded `/vugoda-web-2/` рознесений по 12 файлах — це повноцінна задача

- **40 входжень** у 12 файлах коду. Включає `<img src>`, `backgroundImage: url(...)`, `<Logo>`, `<IsometricCubePlaceholder>`, `<PageHero image>`, `index.html` favicon.
- Замін типу «знайти-замінити» НЕ достатньо: коли картинки переїздять з `public/projects/` у `src/assets/projects/` (для vite-imagetools), референси мають бути **імпортами**, не строковими шляхами.
- **Залишок public-файлів** (`isometric-grid.svg`, `mark.svg`, `logo-dark.svg`, `favicon.svg`, `logo-primary.svg`, `favicon-32.svg`) залишаються у `public/` і повинні стати `/isometric-grid.svg` (root-relative).
- **`data/projects.ts:11-12`** містить `rendersDir` і `cardImage` як rooted paths — тип треба змінити з `string` на `PictureSource`, або зробити `import.meta.glob`.

**Action:** додати окремий step «Path migration audit» до Phase 1 з власним grep-check у CI: `grep -rn "vugoda-web-2" src/ index.html` → fail build.

### G2. `index.html` зникає у RR v7 framework mode — куди йдуть favicon, theme-color, Google Fonts?

- `<link rel="icon">` — переноситься у `root.tsx` через `<Links />` або статичний JSX.
- `<meta name="theme-color" content="#2F3640">` — це треба у global `meta()` функції у `root.tsx`.
- Google Fonts Montserrat — поточно render-blocking CSS. У `root.tsx` ця проблема не зникне. **Рекомендую self-host через `@fontsource/montserrat`** як окрему задачу Phase 1.
- Spec §5.1 каже «5 per-project + 6 типових OG-картинок» — це 11 файлів 1200×630. **Хто і коли їх генерує?** Має бути окрема Phase 0 — підготовка OG-assets.

**Action:** додати у Phase 1 task «Створити `root.tsx` з повним HTML-shell». Додати Phase 0 «Generate 11 OG cards».

### G3. `motion` hydration з `<FadeIn>` (13 файлів) — не «1% edge case»

- `<FadeIn>` обгортка з `motion.div`, `initial={{ opacity: 0, y: 20 }}`, `whileInView={...}` — використовується у **13 файлах**.
- На SSG rendered HTML кожен FadeIn-блок отримує **`opacity:0; transform: translateY(20px)`** у inline-style. Якщо JS не виконається — користувач бачить білу сторінку.
- **CLS-ризик:** якщо motion-блоки змінюють layout, можемо отримати CLS > 0.

**Action:** додати task «Motion fallback strategy» — встановити `MotionConfig reducedMotion="always"` у server-rendered context щоб skipnut-и initial state, АБО обгорнути `<FadeIn>` у CSS-only fallback (поки JS не завантажився, контент видимий, потім motion бере контроль). Опція (b) — production-стандарт.

### G4. Тестів немає — нема способу швидко переконатися що нічого не зламали

- `package.json` має `"lint": "tsc --noEmit"` — це єдина перевірка.
- Для соло-розробника з AI feedback loop **має бути швидкий**.

**Action:** додати в Phase 0 минимум:
- **Vitest** + 1 smoke-test для кожної сторінки (render не падає, meta-теги в DOM).
- **Build verification script:** `npm run build && node scripts/verify-build.mjs` — перевіряє що `build/client/portfolio/lakeview/index.html` існує, містить унікальний title, унікальний og:image, не містить `/vugoda-web-2/`.
- **Pre-commit hook** через simple-git-hooks: `tsc --noEmit && npm run build:verify`.

### G5. Order of Phase 4 (Images) vs Phase 1 (Router) — конфлікт shared concern

Запропонований порядок: Phase 1 (router) → Phase 4 (images). Проблема:

- **`base: '/vugoda-web-2/'` removal** — це **Phase 1** task.
- **Move `public/projects/` → `src/assets/projects/`** — це **Phase 4** task.
- Але **обидва** оперують одними й тими ж 40 hard-coded шляхами у 12 файлах.

**Action:** об'єднати «path migration» у одну фазу. Або:
- (а) Phase 4 (images) **перед** Phase 1: переїзд у `src/assets/` + vite-imagetools на старому build, потім router-міграція не торкає img-шляхи.
- (б) Phase 1 + Phase 4 разом як одну Phase «Architecture migration». **Рекомендована.**

Опція (а) дає бонус: можна **виміряти LCP покращення ізольовано** на старому `vugoda-web-2.github.io` build.

### G6. Cloudflare Functions `_headers`/`_redirects` НЕ застосовуються до `/api/contact` responses

- §5.4 каже «security headers через curl» — на HTML сторінках через `_headers`.
- На `/api/contact` POST response — `_headers` ignored. CORS/HSTS/CSP треба ставити в коді функції.
- **Forgotten check:** preflight OPTIONS на `/api/contact` має повертати 405.

**Action:** додати в Phase 3 acceptance: «`curl -X OPTIONS https://.../api/contact -I` повертає 405 або 204».

---

## Ризики що можуть взривати реліз

### R1. `wrangler pages dev` локально != `vite dev` UX

- `wrangler pages dev` працює **лише з built output**, не з `vite dev`. Тобто dev-loop форми = `npm run build && wrangler pages dev dist`. Це 30-60s на ітерацію.
- Альтернатива: Vite dev на :3000, mock-ати `/api/contact` через Vite proxy на localhost worker.

### R2. `prerender: true` + `ssr: false` + dynamic 404

- Якщо у `routes.ts` є `route('*', 'pages/NotFound.tsx')` — RR v7 може запреррендерити `*` як `index.html` і затирати реальний index.
- Spec §5.4 каже про SPA-fallback через `_redirects` — research-deployment §7 каже «не додавати `/* /index.html 200`».

**Mitigation:** після першого `npm run build` зробити `ls build/client/` і явно подивитися.

### R3. Telegram chat_id у preview = prod — leak ризик

- Якщо забути створити test-bot — preview-форма залляє sales-канал.

**Mitigation:** окремий dummy chat для preview env.

### R4. `noindex` на `pipeline-04` через meta — sitemap НЕ перевіряє це автоматично

**Mitigation:** generator script має приймати explicit `excludeFromSitemap: true` flag.

### R5. Cloudflare account ownership — vendor lock-in

Spec §9 фіксує «виконавець реєструє, клієнт як collaborator». Bus factor = 1.

**Mitigation (sales/legal action):** у Phase 3 додати: створити CF account на email клієнта, виконавець як invited member.

---

## Альтернативи варті розгляду

### A1. vite-imagetools з `include` для public/ — НЕ працює

Research правий. **Перенос обов'язковий**.

### A2. vite-react-ssg як 80/20

- RR v7 framework mode: ~4-6 годин setup.
- `vite-react-ssg`: ~2-3 години setup.

**Висновок:** RR v7 — правильний вибір для довгострокової маржі. Якщо клієнт хоче «за 2 дні» — `vite-react-ssg` зекономить 4 години. Рекомендую залишити RR v7.

### A3. Resend як другий канал — відкладено правильно

### A4. Native CF Rate Limit Binding потребує `wrangler.toml` — конфлікт з NODE_VERSION

**Conflict.** Якщо `wrangler.toml` зламає NODE_VERSION — Rate Limit Binding не активується.

**Рекомендація:** WAF rule через dashboard (zero-code, працює одразу). Перевести §5.3 acceptance з «native binding» на «WAF rule».

---

## Рекомендований порядок фаз (ПЕРЕОРГАНІЗОВАНО)

### Phase 0 (0.5 дня) — Preparation & Safety net
- `.nvmrc` (20.18.0).
- Vitest + 1 smoke-test на render для 13 сторінок.
- `scripts/verify-build.mjs`.
- Згенерувати 11 OG-карток у `public/og/`.

### Phase 1 (1 день) — Architecture migration: paths + router + images (ОБ'ЄДНАНО)
1. `git mv public/projects/ src/assets/projects/`.
2. vite-imagetools + `<Picture>` компонент.
3. `react-router.config.ts`, `root.tsx`, `entry.client.tsx`, новий `routes.ts`.
4. Замінити всі `/vugoda-web-2/<asset>.jpg` на ESM-імпорти.
5. Видалити `App.tsx`, старий `main.tsx`, `routes.tsx`, `index.html`.
6. `motion` fallback strategy для `<FadeIn>`.
7. Self-host Montserrat через `@fontsource/montserrat`.
8. CI check: `grep -rn "vugoda-web-2" src/` → fail.

### Phase 2 (0.5 дня) — SEO content (meta + robots + sitemap + Schema.org)
- Per-page `meta()` функції.
- Global `Organization`/`RealEstateAgent` JSON-LD у `root.tsx`.
- `ApartmentComplex` JSON-LD на Lakeview.
- `robots.txt`, `sitemap.xml` (11 URL).
- `noindex, follow` для pipeline-04 і novyny.

### Phase 3 (0.5 дня) — Cloudflare Pages deploy (без форми)
- CF account на email клієнта, виконавець як collaborator.
- Connect GitHub, build config, secrets.
- `_headers`, `_redirects`.
- First deploy → smoke test.
- GH Pages workflow_dispatch-only режим.
- WAF rule для `/api/contact` rate limit.

### Phase 4 (1 день) — Form backend (Telegram)
- `shared/contact-schema.ts` (Zod).
- `functions/api/contact.ts` з 4 шарами захисту.
- `ContactForm.tsx` переписаний на fetch + state machine + Turnstile + honeypot + consent checkbox.
- E2E smoke-test.

### Phase 5 (опційно, 0.5 дня) — Polish + handoff

---

## Прогнозований effort

| Phase | Час (соло + AI) | Critical path? |
|---|---|---|
| Phase 0 (prep + tests + OG cards) | 4 год | Yes |
| Phase 1 (architecture: paths + router + images) | 8 год | Yes |
| Phase 2 (SEO content) | 4 год | Yes |
| Phase 3 (CF deploy) | 4 год | Partially blocks Phase 4 |
| Phase 4 (form backend) | 8 год | Yes |
| Phase 5 (polish) | 4 год | No, optional |
| **Total** | **28-32 год = 3.5-4 робочих дні** | |

**Risk buffer:** +25% → **realistically 4-5 днів**.

Spec §7 каже «клієнт хоче 2-3 дні». **Це не реалістично** з огляду на 6 гапів. Якщо клієнт жорстко тримається 2-3 днів:
- Phase 5 — повністю в backlog.
- Phase 2 Schema.org — мінімум `Organization` + `ApartmentComplex` на Lakeview. Решта (`Service`, `LocalBusiness`, `WebPage`) — backlog.
- Phase 0 OG-cards — генерувати на ходу AI-промптом.

---

## TL;DR для прийняття рішень

1. **План архітектурно правильний.**
2. **Об'єднай Phase 1 (router) з Phase 4 (images)** — обидві торкають одні й ті ж 40 hard-coded шляхів.
3. **Додай Phase 0 (tests + OG cards)** — без цього feedback loop повільний.
4. **Замість native Rate Limit Binding → WAF rule** — обходить bug #8544.
5. **Motion fallback для `<FadeIn>`** — 13 файлів. CSS-only fallback обов'язковий.
6. **CF account на email клієнта** — bus factor мітигація, нульовий ефорт.
7. **Realistic 4-5 days, not 2-3.**

---

## Critical files for implementation

- `src/pages/Home.tsx` — найскладніший комбо: hard-coded paths × 8, LCP candidate, motion, hero CTA.
- `src/pages/ProjectLakeview.tsx` — 18 hard-coded шляхів, RENDERS + CONSTRUCTION_GROUPS, Schema.org `ApartmentComplex` цільова сторінка, OG-картка #1 за пріоритетом.
- `src/components/ContactForm.tsx` — повне переписування (Phase 4).
- `vite.config.ts` — базова точка міграції.
- `src/data/projects.ts` — критичний контракт: `cardImage: string` → `cardImage: PictureSource` змінює тип у 5 проєктних об'єктах.
