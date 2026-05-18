# Spec: Vygoda Web — Production Readiness Migration

**Version:** 1.1 (фінальна після рішень замовника 18.05.2026)
**Date:** 2026-05-18
**Status:** Approved — готово до Stage 3 plan
**Domain:** `https://vyhoda.lviv.ua` (канонічний, через env `VITE_SITE_URL`)
**Legal entity:** ПП «ДІК "Вигода +"», ЄДРПОУ **44876801** (канонічно)
**Form delivery:** Telegram-only (MVP — Resend/email НЕ в скоупі)
**Owner:** СЕО маркетингу + соло-розробник з AI-асистом
**Stakeholders:** замовник ПП «ДІК "Вигода +"», менеджер продажів (отримувач лідів у Telegram)

---

## ⚡ 3 зафіксовані рішення (НЕ переглядаються)

1. **Канонічний домен `https://vyhoda.lviv.ua`.** Регіональний `.lviv.ua` дає геосигнал Google для забудовника Львова. У коді — через `VITE_SITE_URL` env var (default = `https://vyhoda.lviv.ua`). DNS буде налаштовано клієнтом — до того моменту сайт доступний на `vugoda-web-2.pages.dev`, canonical у HTML вже вказує на vyhoda.lviv.ua.

2. **Контактна форма — ТІЛЬКИ Telegram-канал.** `functions/api/contact.ts` шле повідомлення у Telegram-групу через Bot API. Resend/email НЕ використовуємо (виключено зі скоупу для MVP). Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

3. **Канонічна юр.особа — ПП «ДІК "Вигода +"», ЄДРПОУ 44876801.** Використовується у global JSON-LD `Organization` + `RealEstateAgent`, у футері та на `/partneram`. Розбіжність з CONTEXT.md (42016395) — поза скоупом цієї міграції.

---

## 1. Problem statement

Поточний сайт `vugoda-web-2` — це UI-прототип, не production-ready продукт. Архітектурно він не виконує жодної з трьох комерційних функцій, заради яких сайт існує: **не приводить трафік, не генерує ліди, не справляє враження надійного забудовника на тих, хто на нього таки потрапив.**

**Конкретні провали і їх бізнес-вплив:**

- **SEO = нуль.** Сайт працює на `HashRouter` (URL виду `/#/portfolio/lakeview`), один спільний `<title>` і `<meta description>` на всі 13 сторінок, відсутні `og:*`, `twitter:*`, `canonical`, `robots.txt`, `sitemap.xml`, Schema.org. Google не може коректно проіндексувати окремі сторінки → нуль органічного трафіку → нуль лідів з пошуку по запитах «ЖК Lakeview Львів», «новобудова Львів бізнес-клас», «забудовник Львів». Соцпревʼюшки (Telegram, Facebook, LinkedIn) показують один і той же заголовок незалежно від URL — кожне посилання у месенджері виглядає однаково.

- **Форма-заглушка.** `ContactForm.tsx` робить `console.log(payload)` і нічого більше. Кожна заявка інвестора з потенційним чеком $50-200k літерально зникає у DevTools браузера. Це не баг — це **відсутній бекенд**. Сайт мовчки втрачає 100% вхідного попиту через форму.

- **Core Web Vitals провалені.** На сторінці `/portfolio/lakeview` віддається ~10.9 МБ незжатих JPG (один `aerial.jpg` = 1.54 МБ). Прогнозований LCP на мобільному 4G = 4.8-5.5s (target <2.5s). Це означає: інвестор, який клікнув з Google або соцмережі, бачить білий екран ~5 секунд і йде. Bounce rate на mobile при LCP >4s — типово 50-60% проти 20-25% при LCP <2.5s. Втрачаємо більшість того невеликого трафіку, що таки до нас доходить.

- **Інфраструктура GitHub Pages = тупик.** GH Pages не дає serverless-функцій → форму неможливо підключити без зовнішнього бекенду. Sub-path mounting `/vugoda-web-2/` ламає canonical URLs у SEO/OG/Schema.org. Немає preview-деплоїв для feature-гілок, немає immutable cache headers, немає WAF. Це інфраструктура для демки, не для комерційного сайту забудовника, який збирає персональні дані інвесторів і має репутаційний ризик.

**Сукупний ефект:** $1600+/м² проект (Lakeview) зі стартовим чеком ~$70k за 44 м² квартиру представляється у вебі сайтом, який за технічними показниками 2026 року не пройшов би due diligence жодного банку-партнера. Це блокує всі три цільові аудиторії: інвестори не довіряють (немає реквізитів у Schema.org, форма не працює), банки не верифікують (немає сайту як офіційного представництва юрособи), кінцеві покупці не знаходять (нульове SEO).

---

## 2. Goal (бізнес-результат)

**Один speak-orient рядок:**
Сайт `vugoda` приводить органічний трафік з Google за брендовими і керованими query, форма-заявка інвестора надходить менеджеру в Telegram + email за секунди, сторінки відкриваються миттєво, а соцпревʼюшки коректно відтворюються у месенджерах і соцмережах.

**Вимірювані метрики (90 днів після релізу):**

| Метрика | Поточний baseline | Target |
|---|---|---|
| LCP на мобільному (Lakeview-сторінка) | ~5s (4G) | < 2.5s |
| Загальний розмір сторінки `/portfolio/lakeview` (mobile) | ~10.9 МБ | < 1 МБ |
| Кількість сторінок, проіндексованих Google як окремі URL | 0-1 (SPA-fallback) | 12 (всі крім pipeline-04) |
| Час доставки заявки з форми у Telegram | ∞ (не доставляється) | < 5 сек |
| OG-картка у Telegram/FB/LinkedIn рендериться per-URL | ні | так (унікальна на 12 сторінок) |
| Lighthouse SEO score (mobile) | ~50-60 | ≥ 95 |
| Lighthouse Performance score (mobile, Lakeview) | ~30-40 | ≥ 85 |

---

## 3. Scope (in)

### Must-have для production (P0 — blockers релізу)

Без цих пунктів не можна казати "сайт у проді". Якщо щось з P0 не готове — реліз не відбувається.

1. **Перехід з HashRouter на BrowserRouter + SSG.** Кожен з 13 маршрутів отримує фізичний `index.html` файл у `dist/` (pre-rendered на build-time). URL вигляду `https://<домен>/portfolio/lakeview` без `#`.

2. **Per-page meta-теги.** Кожна сторінка має унікальний `<title>` (до 60 символів), `<meta description>` (до 160 символів), `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `twitter:card`, `canonical`.

3. **`robots.txt` + `sitemap.xml`.** Robots дозволяє crawl і вказує на sitemap. Sitemap містить 12 індексованих URL (pipeline-04 виключений як `noindex` — у нього ще немає назви).

4. **Реальний backend контактної форми (Telegram-only).** `POST /api/contact` як Cloudflare Pages Function (`functions/api/contact.ts`). Доставка — **тільки** Telegram Bot API у групу відділу продажів. Захист (4 шари): Origin check, Rate limit 5/60s per IP, Honeypot field, Cloudflare Turnstile. Zod-валідація payload. Phone обгорнуто у `tel:` лінк, HTML-escape для всіх полів.

5. **Картинки Lakeview переведені в AVIF + WebP.** 7 hero/gallery JPG-файлів (6.93 МБ сумарно) → responsive AVIF + WebP variants через `vite-imagetools`. Hero LCP-image отримує `<link rel="preload">` + `fetchpriority="high"`.

6. **Hosting на Cloudflare Pages.** Git-integration: `push` у `main` → автодеплой за < 2 хв. Preview-деплої для feature-гілок. Початково — `vugoda-web-2.pages.dev`; коли клієнт делегує DNS — підключаємо `vyhoda.lviv.ua` у Cloudflare dashboard (нуль code-changes). SSL автоматично. `.nvmrc` з 20.18.0; `wrangler.toml` НЕ створюємо (баг #8544).

7. **Schema.org JSON-LD.** Глобальний `Organization` + `RealEstateAgent` (ЄДРПОУ 44876801) у `<head>` КОЖНОЇ сторінки. Розширений `ApartmentComplex` з `GeoCoordinates` + amenities + `BreadcrumbList` — на `/portfolio/lakeview`. `WebPage`, `CollectionPage`, `LocalBusiness`, `Service` — per сторінка згідно research-артефакту. Усе проходить Google Rich Results Test.

### Should-have (P1 — варто до релізу, але не блокує)

Якщо часу впритул — переносимо у v1.1.

- **Оптимізація construction-фото і pipeline-проектів.** 12 construction-JPG (3.95 МБ) і WebP-рендери pipeline-проектів (etno-dim/maetok/nterest) — теж через `vite-imagetools`, але менший пріоритет, бо вони нижче fold і не впливають на LCP.
- **301-редиректи зі старих HashRouter URL.** `/vugoda-web-2/*` → `/*` через `_redirects`. Можливо також `/#/path` → `/path` через JS-snippet у `index.html` (бо `_redirects` не бачить fragment).
- **Preview deployments для гілок.** Активувати у Cloudflare Pages → branch deployment controls.
- **Cache headers (`_headers`).** Immutable для `/assets/*` (1 рік), no-cache для HTML. Security headers: HSTS, X-Frame-Options, Referrer-Policy.

---

## 4. Scope (out)

Свідомо НЕ робимо у цій ітерації. Кожен пункт — окрема майбутня ініціатива з власним обґрунтуванням:

- **CRM-інтеграція (Bitrix24, KeyCRM, HubSpot).** Спочатку треба переконатися, що базова лідогенерація працює і обʼєм лідів виправдовує налаштування CRM. Telegram + email — достатній MVP для команди в 1-2 менеджери продажів.
- **Аналітика (GTM, GA4, Hotjar, Meta Pixel).** Корисно, але не блокує запуск. Підключаємо після того, як сайт стабільно працює і є що міряти. Потребує консенту банеру (GDPR) — окрема робота.
- **Мультимовність (EN).** Поки клієнт не підтвердив, що цільовий ринок включає закордонних інвесторів — не подвоюємо обсяг контенту і не ускладнюємо SEO-архітектуру. Питання у Розділі 6 CONTEXT.md, пункт 16.
- **Блог / контент-маркетинг.** Окремий контент-проект, потребує редакційного плану і авторів. Не входить у міграцію.
- **A/B тести.** Немає достатнього трафіку для статистичної значущості. Перевідкриємо після 3-6 місяців у проді з реальними даними.
- **Custom CMS / адмінка для редагування контенту.** Поки контент змінюється рідко (статичні сторінки про забудовника + 5 проєктів) — Git як CMS достатньо. Перегляньмо коли зʼявиться pipeline новин або регулярних оновлень.
- **Live chat / Intercom / Crisp.** Не входить у scope; обговорюється окремо.
- **Динамічний контент (новини, акції, бронювання квартир).** Не входить у scope.
- **Видалення/публічне коментування історії Pictorial/Rubikon.** Згідно з CONTEXT.md §2.1 — комунікаційне правило: silent displacement, не ініціюємо тему. Це не технічна задача.

---

## 5. Acceptance Criteria

Усі критерії — **testable** (можна перевірити автоматично або ручним smoke-test).

### 5.1 SEO / Routing

- [ ] Використовується `BrowserRouter` (через React Router v7 framework mode або еквівалент); URL не містить `#/`.
- [ ] Build виплює фізичний `index.html` для кожного з 13 маршрутів у відповідній папці `dist/` (наприклад `dist/portfolio/lakeview/index.html`).
- [ ] Кожна з 12 індексованих сторінок має **унікальний** `<title>` довжиною до 60 символів.
- [ ] Кожна з 12 індексованих сторінок має **унікальний** `<meta description>` довжиною до 160 символів.
- [ ] Кожна сторінка має теги: `og:title`, `og:description`, `og:image` (URL веде на існуючий 1200×630 файл), `og:url`, `og:type`, `og:site_name`.
- [ ] Кожна сторінка має `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`.
- [ ] Кожна сторінка має `<link rel="canonical">` з абсолютним URL на самій себе.
- [ ] `robots.txt` доступний на `https://vyhoda.lviv.ua/robots.txt`, дозволяє crawl, містить `Sitemap: https://vyhoda.lviv.ua/sitemap.xml`.
- [ ] `sitemap.xml` доступний на `https://vyhoda.lviv.ua/sitemap.xml`, валідний XML, містить 11 URL (всі крім `/portfolio/pipeline-04` і `/novyny`).
- [ ] Сторінки `/portfolio/pipeline-04` І `/novyny` мають `<meta name="robots" content="noindex, follow">` (до повного наповнення контентом).
- [ ] Schema.org JSON-LD валідний у Google Rich Results Test (https://search.google.com/test/rich-results) на: головній (`Organization`) і `/portfolio/lakeview` (`RealEstateListing` або `Apartment`).
- [ ] Lighthouse SEO ≥ 95 на трьох сторінках: `/`, `/portfolio/lakeview`, `/kontakty`.
- [ ] Соцпревʼю перевірено через debugger Facebook (https://developers.facebook.com/tools/debug/) і Twitter Card Validator (або через telegram-share на 3 URL: `/`, `/portfolio/lakeview`, `/investoram`) — на кожному видно різну картку.

### 5.2 Performance

- [ ] LCP < 2.5s на мобільному (Moto G Power emulation, Slow 4G) для `/portfolio/lakeview`. Перевірка: Lighthouse mobile.
- [ ] LCP < 2.5s на мобільному для `/` (homepage з `aerial.jpg` як LCP candidate).
- [ ] Hero-зображення сторінки `/portfolio/lakeview`: AVIF варіант < 200 KB, WebP варіант < 350 KB.
- [ ] Сумарний transfer size сторінки `/portfolio/lakeview` на mobile-viewport (Slow 4G, AVIF supported, full scroll) — < 1 МБ.
- [ ] Lighthouse Performance ≥ 85 (mobile) і ≥ 95 (desktop) для `/portfolio/lakeview`.
- [ ] Cumulative Layout Shift (CLS) = 0 на `/portfolio/lakeview` (всі `<img>` мають `width`/`height`).
- [ ] Build НЕ виплює `dist/projects/*.jpg` без AVIF/WebP-сусіда (smoke-check: `ls dist/assets | grep ".jpg$"` і перехресна перевірка з `.avif`).

### 5.3 Form (Telegram-only)

- [ ] Створено `functions/api/contact.ts`, що приймає **виключно** POST (інші HTTP-методи → 405 Method Not Allowed).
- [ ] Заявка з кожного з 4 джерел (`source: hero` / `investors` / `partners` / `kontakty`) успішно надходить у Telegram-групу відділу продажів.
- [ ] Час від натискання Submit до повідомлення в Telegram < 5 секунд (P95).
- [ ] **Origin check** — приймаємо запити лише з `https://vyhoda.lviv.ua`, `https://www.vyhoda.lviv.ua`, `https://*.vugoda-web-2.pages.dev` (preview).
- [ ] **Turnstile** — без коректного токену POST `/api/contact` повертає 403; серверна валідація через `siteverify` ДО виклику Telegram API.
- [ ] **Rate limit** — > 5 запитів з одного IP за 60 секунд → 429 із заголовком `Retry-After: 60` (Cloudflare native binding, не KV).
- [ ] **Honeypot** — приховане поле `company` (off-screen). Якщо заповнене → сервер повертає 200 OK silent + log `spam_honeypot`, але повідомлення в Telegram **не** надсилається.
- [ ] **Zod валідація** на серверній стороні: `name`, `phone` (маска), `source` (enum), `consent: literal(true)`, `turnstileToken` (string).
- [ ] Telegram-повідомлення (`parse_mode: 'HTML'`) містить:
  - Емоджі-маркер `source` (наприклад, `📩 Інвестор`, `🏢 Партнер`)
  - Імʼя, телефон обгорнутий у `<a href="tel:+380...">` для one-tap call з мобільного
  - Усі поля з payload (валідовані)
  - `requestId`, timestamp `Europe/Kyiv`, IP (анонімізований)
  - Дублюється consent text + timestamp — як GDPR-архів
- [ ] **HTML-escape** для всіх user inputs (`<`, `>`, `&`, `'`, `"`) — щоб ніщо не зламало Telegram parse_mode HTML.
- [ ] Клієнт: кнопка Submit `disabled` під час loading.
- [ ] При 429 — кнопка показує `Спробуйте через {N}s` countdown 60 сек.
- [ ] При інших серверних помилках (5xx) — читабельне повідомлення українською з резервним телефоном (НЕ whitescreen, НЕ stack trace).
- [ ] При помилці валідації (400) — поля з помилками підсвічуються, повідомлення під ними українською.
- [ ] Success state без перезавантаження сторінки.
- [ ] У логах Cloudflare Pages Functions немає plain-text персональних даних — тільки `requestId`, IP-hash.

### 5.4 Deployment

- [ ] `git push origin main` → автоматичний деплой на Cloudflare Pages завершується за < 2 хв.
- [ ] Production-URL працює: початково `https://vugoda-web-2.pages.dev`, після DNS handoff — `https://vyhoda.lviv.ua` (canonical вже у HTML).
- [ ] GitHub Pages workflow (`.github/workflows/deploy.yml`) або видалений, або переведений у `workflow_dispatch`-only режим (manual fallback на 2 тижні).
- [ ] Cache headers перевірено через `curl -I`:
  - `/assets/*.js`, `/assets/*.css`, `/assets/*.avif`, `/assets/*.webp` → `Cache-Control: public, max-age=31536000, immutable`.
  - `/`, `/portfolio/lakeview` (HTML) → `Cache-Control: public, max-age=0, must-revalidate`.
- [ ] Security headers присутні: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- [ ] Push у feature-гілку (`feature/test`) → Cloudflare створює preview URL і коментує його у PR.
- [ ] Rollback процедура: один клік у Cloudflare dashboard на попередній deploy → активний deploy перемикається за < 1 хв (протестовано на тестовій гілці).
- [ ] Secrets (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TURNSTILE_SECRET_KEY) збережені як **Encrypted** у Cloudflare env vars (Production), не в коді чи у `.env.production`.
- [ ] Public vars (TURNSTILE_SITE_KEY, VITE_SITE_URL) — як plain text Cloudflare env.
- [ ] Preview env — окремі secrets для Preview (наприклад тестові Turnstile keys `1x00000000000000000000AA`).
- [ ] Файл `.dev.vars` присутній у `.gitignore`; перевірено `git log --all -p | grep -i "TELEGRAM_BOT_TOKEN\|TURNSTILE_SECRET"` — нема leak.

### 5.5 Accessibility (регресія неприпустима — вже виконано в попередніх ітераціях)

- [ ] WCAG AA: контраст основного тексту ≥ 4.5:1 (вже виконано — перевірка регресії).
- [ ] Touch targets ≥ 48×48px (вже виконано — перевірка регресії).
- [ ] `aria-*` атрибути на NavBar, формі, кнопках — збережені після SSG-міграції (regression-check).
- [ ] Форма доступна з клавіатури: Tab проходить через всі поля у логічному порядку, Enter сабмітить.

---

## 6. Non-functional requirements

- **Безпека.**
  - Secrets зберігаються виключно як Cloudflare encrypted env vars. Жоден токен/ключ не комітиться у Git (включно з історією).
  - Origin-перевірка на `/api/contact`: дозволені тільки `https://vyhoda.lviv.ua`, `https://www.vyhoda.lviv.ua`, `https://*.vugoda-web-2.pages.dev`.
  - HTTPS обовʼязковий, HSTS активний (`max-age=63072000; includeSubDomains; preload`).
  - Persona data (імʼя/телефон) в логах Pages Functions — заборонені; зберігаються тільки у Telegram-повідомленні менеджеру.

- **Reversibility.**
  - GitHub Pages workflow вимикається після зеленого Cloudflare deploy (рекомендація з research — 14 днів `workflow_dispatch`-only режим, потім видалення; open question #3 нижче).
  - Cloudflare Pages підтримує rollback на будь-який попередній deploy у dashboard за < 1 хв.
  - Якщо щось критично зламається у формі — feature flag через env var `CONTACT_FORM_DISABLED=true` віддає 503 з повідомленням і телефоном.

- **Maintainability.**
  - Жодних custom build-hacks. Використовуються лише офіційно підтримувані плагіни: `@react-router/dev`, `vite-imagetools`, `@tailwindcss/vite`.
  - Конфіги обмежені одним файлом на інструмент: `vite.config.ts`, `react-router.config.ts`, `_headers`, `_redirects`.
  - Документація як код: `README.md` + `thoughts/research/*` + `specs/*` живуть у репо.

- **Cost.**
  - Cloudflare Pages: Free tier (500 builds/month, unlimited bandwidth, 100k Functions requests/day) — достатньо для забудовника з очікуваним обсягом ≤ 50 заявок/день.
  - Cloudflare Turnstile: безкоштовний без квот.
  - Telegram Bot API: безкоштовний.
  - **Сумарна вартість інфраструктури: $0/місяць.** Resend/email — поза скоупом (потенційно майбутній +$20/міс Resend Pro якщо знадобиться).

- **Performance budgets (per page).**
  - Total transfer (mobile, AVIF): < 1 МБ.
  - JS bundle (gzipped, initial): < 200 KB.
  - Time to Interactive (TTI, mobile, Slow 4G): < 4s.

---

## 7. Constraints

- **Стек зафіксований:** React 19, Vite 6.2, react-router-dom 7.14, TypeScript 5.8, Tailwind 4.1, motion 12.23 (Framer). Жодних мажор-апгрейдів у скоупі цієї міграції.
- **Дизайн-система:** `design-system.md` + `brand-system.md` + офіційний брендбук (`Вигода_брендбук.pdf`) — без змін. Tone of voice, палітра, типографіка зафіксовані.
- **motion-анімації** мають продовжувати працювати після SSG-міграції (це окремий ризик, див. §8).
- **Часовий бюджет:** клієнт хоче "за 2-3 дні". Реалістична оцінка з research-документів — ~3-4 дні соло-розробнику з AI-асистом. Якщо впритул — Should-have пункти (P1) переносяться у v1.1.
- **Команда:** соло-розробник + AI-асистент. Немає окремого QA, DevOps, BE-розробника — обмеження впливає на choice of tools (мінімізуємо surface area).
- **Юридичні обмеження:** обробка персональних даних згідно з ЗУ "Про захист персональних даних" (Україна). Згода зберігається у бекенді разом із timestamp.
- **Контент-обмеження (з CONTEXT.md):**
  - Заборонено фото/імена керівництва на сайті.
  - Не публікувати історію Pictorial/Rubikon (silent displacement, тільки для Lakeview).
  - Заборонений словник: "мрія", "найкращий", "унікальний", "преміальний стиль життя".

---

## 8. Risks & assumptions

| Ризик | Ймовірність | Impact | Mitigation |
|---|---|---|---|
| **Hydration mismatch з motion-анімаціями після SSG.** `motion.div` з `initial={{ opacity: 0 }}` рендериться на build-time з opacity:0, клієнт додає трансформи → React 19 може видати warning або візуальний flicker. | Medium | Medium | Smoke-test всіх 6 проєктних сторінок після першого build. У 1% випадків — обгорнути критичний компонент у `<ClientOnly>` HOC або додати `suppressHydrationWarning`. |
| **Втрата SEO-equity з GitHub Pages URL.** | Low | Low | GH Pages зараз має ~0 indexed pages (HashRouter блокує індексацію). Втрачати нічого. `_redirects` правило `/vugoda-web-2/* → /:splat 301` додаємо як hygiene-захід. |
| **Telegram-канал як SPOF (єдиний канал доставки).** | Low | Medium | На MVP — це прийнятний trade-off. У наступній ітерації додаємо Resend як другий канал через `Promise.allSettled`. У моніторингу — алерт коли заявка не доставлена (return 5xx → клієнтський retry + fallback повідомлення з телефоном для прямого зворотного звʼязку). |
| **pipeline-04 без назви — SEO-сміття або дезорієнтація користувача.** | Medium | Low | Рішення: `noindex, follow` + ізометричний куб-плейсхолдер + CTA "Підписатись на оновлення". Не входить у sitemap. |
| **Custom domain `vyhoda.lviv.ua` DNS ще не делегований у Cloudflare.** | High | Low | Запускаємо production на `vugoda-web-2.pages.dev`, але canonical і og:url вже вказують на `vyhoda.lviv.ua` (через VITE_SITE_URL). До делегування DNS — НЕ submit'имо в Search Console. Підключення CF custom domain — одна операція без code-changes. |
| **Cloudflare account ownership.** Хто володіє акаунтом — клієнт чи виконавець? Якщо виконавець — bus factor 1. | Medium | High | У Stage 3 (plan) вирішити: створюємо акаунт від імені клієнта, виконавець як collaborator. Або клієнт створює сам, виконавець інвітується. |
| **`base: '/vugoda-web-2/'` legacy URLs у коді.** Hard-coded шляхи виду `/vugoda-web-2/projects/lakeview/aerial.jpg` залишаться нерозвʼязаними після зміни на `base: '/'`. | High | Medium | Перед merge — `grep -rn "vugoda-web-2" src/` і виправити всі hardcoded. Smoke-test на preview deploy. |
| **Sharp native binary у CI.** `vite-imagetools` потребує Sharp; на Cloudflare Pages builder OS можуть бути проблеми. | Low | Medium | `npm ci` у CF Pages build container — стандартний flow, Sharp на ubuntu-latest працює з коробки. Якщо проблема — pre-build assets локально і коммітити у репо. |
| **GDPR-юридична слабкість поточної згоди.** Текст-дисклеймер показано, але факт згоди не зберігається з timestamp. | Medium | Medium (юридичний) | У новій формі — `consent: z.literal(true)` обовʼязкове поле + `consent_timestamp` у Telegram-повідомленні. Максимальне посилення (видимий checkbox) — опціонально, обговорюємо з клієнтом. |

**Assumptions:**

- Очікуваний обсяг заявок: ≤ 10/день. Telegram витримує.
- Очікуваний органічний трафік у перші 90 днів: десятки-сотні сесій/міс (поки Google не проіндексує і не побудує rankings). Pages free tier тримає кратно більше.
- Менеджер продажів готовий отримувати лід-нотифікації в Telegram-групі (chat ID буде надано клієнтом).
- DNS для `vyhoda.lviv.ua` буде делеговано у Cloudflare протягом 2 тижнів після релізу production. До того часу сайт працює на `vugoda-web-2.pages.dev` — це прийнятно для забудовника, який ще не запустив масштабну рекламу.

---

## 9. Open questions — Resolution log

Усі архітектурні форки закриті 18.05.2026.

### ✅ Закриті (фіксовані рішення)
1. **Канонічний домен** → `vyhoda.lviv.ua` (через `VITE_SITE_URL`)
2. **Форма канал** → Telegram-only (Resend поза скоупом)
3. **ЄДРПОУ канонічний** → 44876801 (ПП «ДІК "Вигода +"»)
4. **Cloudflare account** → виконавець реєструє, клієнт як collaborator
5. **GitHub Pages після cutover** → 14 днів `workflow_dispatch`-only, потім видалити
6. **OG-картки** → 5 per-project (Lakeview, Етно Дім, Маєток, NTEREST, pipeline-04) + 6 типових (Home, Approach, Investors, Partners, Contacts, News) — статичні файли, рендер з брендбуку
7. **GDPR consent** → видимий unchecked-by-default checkbox, обов'язкове поле, archive timestamp у Telegram-повідомленні

### 🟡 Операційні (потрібні дані для Stage 4, але не блокують Stage 3 plan)
8. **Telegram bot token + chat ID** — реєстрація через @BotFather, додавання у Telegram-групу відділу продажів. Owner: клієнт / менеджер. Дедлайн: до старту Phase 3 (form integration).
9. **DNS делегація `vyhoda.lviv.ua`** — клієнт делегує NS records у Cloudflare. Не блокує реліз (deploy на `pages.dev` працює, canonical у HTML вже вказує на vyhoda.lviv.ua). Дедлайн: 2 тижні після релізу.
10. **Title/description draft approval** — SEO research артефакт містить draft для всіх 13 сторінок. Клієнт затверджує / коректує. Owner: клієнт.
11. **Schema.org `ApartmentComplex` Lakeview public data** — точна ціна $1600/м², квартирометри 44-183 м², дата здачі 2027, GPS-координати. Все вже публічне на Lakeview-лендингу — phrase-узгодження з клієнтом перед production deploy.

---

## 10. Out of scope для цього спеку

Підкреслюю, бо це найчастіший вектор scope creep від замовника:

- **CRM-інтеграція** (Bitrix24, KeyCRM, HubSpot, Pipedrive).
- **Аналітика** (Google Tag Manager, GA4, Hotjar, Meta Pixel, LinkedIn Insight Tag).
- **Cookie/consent banner** (потрібен для аналітики, тому пара з пунктом вище).
- **A/B тести** (Optimizely, Google Optimize-наступники, Cloudflare A/B).
- **Multi-language EN** (другий мовний шар, перекладена контент-структура, hreflang).
- **Блог / контент-маркетинг** (редакція, авторство, CMS для статей).
- **Live chat** (Crisp, Intercom, Tawk.to, Telegram Live Chat widget).
- **Динамічний контент** (новини, бронювання квартир online, особистий кабінет інвестора).
- **CMS для не-розробника** (Strapi, Sanity, Contentful, Decap CMS).
- **Email-розсилка / newsletter** (Resend audiences, Mailchimp, beehiiv).
- **Бронювання консультацій з календарем** (Calendly, Cal.com).
- **3D-тури по квартирах** (Matterport, Kuula).
- **Калькулятор іпотеки / єОселя**.
- **PDF-генерація комерційних пропозицій online**.
- **Інтеграція з банками для онлайн-акредитації**.

Кожен пункт — потенційний наступний спринт. Документується, але не виконується в межах цього спеку.

---

## Підпис і узгодження

| Роль | Імʼя | Дата затвердження |
|---|---|---|
| Замовник (Вигода Груп / Вигода +) | ____________ | ____________ |
| PM / Project owner (CMO маркетингу) | ____________ | ____________ |
| Виконавець (соло-розробник) | ____________ | ____________ |

**Наступний крок після затвердження:** Stage 3 — `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/thoughts/plans/2026-05-18-production-readiness-implementation-plan.md` (детальний implementation plan з task breakdown, послідовністю, dependencies і часовими оцінками).
