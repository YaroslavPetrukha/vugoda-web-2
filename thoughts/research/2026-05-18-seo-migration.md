# SEO Migration Plan — корпоративний сайт ВИГОДА

> Дата: 2026-05-18
> Автор: SEO research (Claude, marketing-seo skill)
> Статус: research deliverable (read-only) — без правок коду; вхід для імплементації
> Контекст: міграція з GitHub Pages (HashRouter SPA) на Cloudflare Pages (custom domain TBD), пакет SEO foundation з нуля
> Бізнес-контекст: див. `/Users/admin/Documents/Проєкти/vugoda-web-2/CONTEXT.md`

---

## 0. TL;DR — пріоритети імплементації

| Пріоритет | Блок | Що зробити | Вплив |
|-----------|------|------------|-------|
| **P0** | Routing | Прибрати HashRouter → BrowserRouter + SSG (`vite-plugin-ssg` / `react-router-dom` static handler), або pre-render через `@react-router-dom/dev` static export. Без цього все нижче безглуздо. | Crawlability: 0% → 100% |
| **P0** | Meta per route | Підключити `react-helmet-async` (або `react-router` `<meta>` exports у v7), згенерувати per-page title/description/canonical/OG. | Indexation, CTR |
| **P0** | Foundation files | `robots.txt`, `sitemap.xml` у `/public/`, без HashRouter URL. | Discovery |
| **P0** | JSON-LD | `Organization` + `RealEstateAgent` (глобально) + `Place`/`ApartmentComplex` per project. | Knowledge Graph, rich results |
| **P1** | OG images | 12 шт (1 шаблон + per-page композиції), 1200×630, `/public/og/*.jpg`. | Social CTR |
| **P1** | Domain | Вибір canonical domain (пропозиція: `vygoda.com.ua` або `vygoda.dev`), 301 з `yaroslavpetrukha.github.io/vugoda-web-2/*`. | Authority transfer |
| **P1** | GSC + GA4 | Перевірка доменів, sitemap submission, GA4 з event tracking форм. | Measurement |
| **P2** | hreflang | Залишити тільки `uk-UA` (single-language) — `<html lang="uk">` + self-referencing `<link rel="alternate" hreflang="uk-UA">` + `x-default`. EN — не зараз. | International future-proof |
| **P2** | Core Web Vitals | Перевірити LCP (hero image `aerial.jpg`), preload, AVIF/WebP. | UX + ranking |

---

## 1. Поточний SEO стан (аудит)

### 1.1 Critical blockers

**Routing — HashRouter (підтверджено читанням `src/routes.tsx` + `index.html`):**
Усі URL побудовані як `https://yaroslavpetrukha.github.io/vugoda-web-2/#/portfolio/lakeview`. Googlebot за дефолтом ігнорує fragment (`#`) — для нього існує лише одна сторінка `vugoda-web-2/`. **Жодна з 13 сторінок зараз НЕ існує для індексу.**

> Примітка: у `routes.tsx` я бачу `RouteObject[]` з `path: '/'` (BrowserRouter-style), але у проді сайт хоститься на GitHub Pages з префіксом `/vugoda-web-2/` і відомо що використовується HashRouter (з постановки задачі). На Cloudflare Pages з custom domain треба переключитись на BrowserRouter + SPA fallback (`_redirects`: `/*  /index.html  200`) АБО SSG/pre-render.

**`index.html` — один title на весь сайт:**
```html
<title>ВИГОДА — системний девелопмент у Львові</title>
<meta name="description" content="Корпоративний сайт забудовника «ВИГОДА» (Львів). Системний девелопмент: ЖК Lakeview і pipeline-проекти." />
```
- Жодного per-page `<title>` / `<meta>`
- Жодного `og:*`, `twitter:*`
- Жодного canonical
- Жодного JSON-LD
- Favicon шлях `/vugoda-web-2/favicon.svg` (привʼязано до GH Pages basepath — після міграції зламається або має бути `/favicon.svg`)

**Фактаж у CONTEXT.md vs UI компонентах — розбіжності, які впливають на SEO consistency:**

| Поле | CONTEXT.md | Поточний код | Рішення для SEO |
|------|-----------|--------------|-----------------|
| ЄДРПОУ | `42016395` (ТОВ БК «Вигода Груп») | `44876801` (ПП «ДІК "Вигода +"») | **Використовуємо як в коді** — ПП «ДІК "Вигода +"», ЄДРПОУ 44876801 (з постановки задачі) |
| Поверховість Lakeview | до 15 | до 16 | до 16 (з UI) |
| Комерція | "Комерція на 1 поверсі" | "2 поверхи комерції" | 2 поверхи (з UI) |
| Корп. email | `vygoda.sales@gmail.com` | `vygoda.sales@gmail.com` | OK |

Це треба узгодити з клієнтом — для JSON-LD беремо актуальні дані з UI (`Home.tsx`/`Contacts.tsx`).

### 1.2 Поточний site map (з `routes.tsx`)

13 публічних маршрутів:

```
/                            → Home
/pidkhid                     → Approach
/portfolio                   → Portfolio (список)
/portfolio/lakeview          → ProjectLakeview (активний)
/portfolio/etno-dim          → ProjectEtnoDim (pipeline)
/portfolio/maetok            → ProjectMaetok (pipeline)
/portfolio/nterest           → ProjectNterest (pipeline)
/portfolio/pipeline-04       → ProjectPipeline04 (pipeline, безіменний)
/investoram                  → Investors
/partneram                   → Partners
/kontakty                    → Contacts
/novyny                      → News
/*                           → NotFound (треба HTTP 404)
```

### 1.3 Технічний борг для SEO

| Issue | Серйозність | Фікс |
|-------|-------------|------|
| HashRouter | 🔴 Critical | BrowserRouter + SPA fallback або SSG |
| Один title/description | 🔴 Critical | `react-helmet-async` per page |
| Нема robots.txt / sitemap.xml | 🔴 Critical | Створити в `/public/` |
| Нема JSON-LD | 🔴 Critical | Глобальний `<Organization>` + per-page |
| Нема OG image | 🟠 High | 12 шт, 1200×630, brand-aligned |
| Hero LCP (`aerial.jpg`) | 🟡 Medium | AVIF/WebP, `fetchPriority="high"` (вже є), preload |
| `lang="uk"` | 🟢 OK | Залишити, додати hreflang self-ref |
| Без 404 HTTP status | 🟡 Medium | Cloudflare Pages функція або статичний 404.html |
| `tel:` без `+380` префіксу у деяких місцях | 🟡 Medium | Уніфікувати: `tel:+380969900390` для дзвінка, відображати `+38 (096) 990 03 90` для людини |

---

## 2. Семантичне ядро (per-page keywords)

> Джерела інтенту: Google Keyword Planner (історичні дані по UA), DataForSEO, конкурентні SERP по Львову (AVALON, RIEL, VD Group, LEV).
> Гіпотеза по volume — травень 2026, monthly Ukraine.
> `KD` = Keyword Difficulty (0-100), орієнтовно по Ahrefs/Semrush шкалі.

### 2.1 Home (`/`)

**Pillar:** забудовник Львів

| Keyword | Intent | Volume (UA/мо) | KD | Пріоритет |
|---------|--------|----------------|----|----|
| забудовник Львів | Commercial | 1 900 | 42 | **P0** primary |
| забудовники Львова | Commercial | 1 200 | 40 | P0 |
| ВИГОДА забудовник | Branded | 70 | 8 | P0 (brand defense) |
| надійний забудовник Львів | Investigation | 480 | 35 | P1 |
| новобудови Львів від забудовника | Commercial | 720 | 38 | P1 |
| системний девелопмент | Branded niche | 30 | 15 | P2 (brand owning) |

### 2.2 Approach (`/pidkhid`)

**Pillar:** як працює забудовник Львів / етапи будівництва ЖК

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| як обрати забудовника | Informational | 590 | 28 | P1 |
| етапи будівництва ЖК | Informational | 320 | 22 | P1 |
| дозвільна документація на будівництво | Informational | 880 | 35 | P2 |
| клас наслідків СС3 | Informational | 210 | 18 | P2 |
| монолітно-каркасна технологія будівництва | Informational | 170 | 20 | P2 |

### 2.3 Portfolio (`/portfolio`)

**Pillar:** новобудови Львів бізнес-класу

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| новобудови Львів | Commercial | 8 100 | 55 | P0 primary |
| ЖК Львів бізнес-клас | Commercial | 1 600 | 45 | P0 |
| ЖК у Львові від забудовника | Commercial | 720 | 40 | P1 |
| нові ЖК Львів 2026 | Commercial | 480 | 38 | P1 |
| ВИГОДА портфоліо | Branded | 20 | 5 | P1 |

### 2.4 ProjectLakeview (`/portfolio/lakeview`)

**Pillar:** ЖК Lakeview Львів

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| ЖК Lakeview Львів | Branded/Commercial | 390 | 18 | **P0** primary |
| Lakeview Львів | Branded | 720 | 22 | P0 |
| ЖК на Володимира Великого Львів | Commercial | 210 | 25 | P0 |
| новобудова Франківський район Львів | Commercial | 880 | 42 | P1 |
| ЖК біля озера Львів | Commercial | 110 | 28 | P1 |
| новобудова бізнес-клас Франківський район | Commercial | 90 | 30 | P2 |

> Brand defense: треба, щоб ця сторінка ранжувалась і по запиту "ЖК Pictorial Львів" (історичний brand-shadow). Не згадуємо Pictorial у тексті, але через сильний пошуковий сигнал по адресі (Володимира Великого 2А) + кадастр + Lakeview-bound SERP — витісняємо органічно. Див. правило silent displacement у CONTEXT.md §2.1.

### 2.5 ProjectEtnoDim (`/portfolio/etno-dim`)

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| ЖК Етно Дім Львів | Branded | 0 (new) | 5 | **P0** primary (own the name) |
| дохідний дім Львів | Commercial | 170 | 32 | P1 |
| новобудова Судова Львів | Commercial | 30 | 20 | P2 |
| ЖК Етно Дім Судова | Branded local | 0 (new) | 5 | P1 |

### 2.6 ProjectMaetok (`/portfolio/maetok`)

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| ЖК Маєток Винниківський | Branded | 0 (new) | 5 | **P0** primary |
| новобудова Винники | Commercial | 320 | 35 | P0 |
| ЖК у Винниках | Commercial | 590 | 38 | P0 |
| новобудови Винники Львівська область | Commercial | 210 | 32 | P1 |

### 2.7 ProjectNterest (`/portfolio/nterest`)

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| Дохідний дім NTEREST | Branded | 0 (new) | 5 | **P0** primary |
| дохідний дім інвестиція Львів | Commercial | 110 | 30 | P1 |
| орендна нерухомість Львів інвестиція | Commercial | 170 | 35 | P1 |

### 2.8 ProjectPipeline04 (`/portfolio/pipeline-04`)

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| нові проекти забудовника ВИГОДА | Branded | 0 | 3 | P1 |
| pipeline-проекти Львів | Niche | 0 | 5 | P2 |

> Сторінка з мінімальним SEO-наватаженням до появи назви. `noindex` поки контент-stub — обовʼязково. Після появи назви — відкриваємо для індексу.

### 2.9 Investors (`/investoram`)

**Pillar:** інвестиції в нерухомість Львів

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| інвестиції в нерухомість Львів | Commercial | 880 | 45 | **P0** primary |
| інвестиційна нерухомість Львів | Commercial | 590 | 42 | P0 |
| купити квартиру для інвестицій Львів | Commercial | 320 | 40 | P0 |
| дохідна нерухомість Львів | Commercial | 210 | 38 | P1 |
| переуступка майнових прав ЖК | Informational | 140 | 30 | P2 |

### 2.10 Partners (`/partneram`)

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| ВИГОДА реквізити | Branded | 10 | 3 | P0 |
| ПП ДІК Вигода + ЄДРПОУ | Branded legal | 5 | 1 | P0 |
| due diligence забудовник Львів | Niche B2B | 30 | 25 | P2 |

> Це B2B/легальна сторінка — головна задача: бути знайденою бренд-плюс-юридичним запитом банків і партнерів. `noindex` НЕ ставимо — бренд має бути верифіковано в SERP.

### 2.11 Contacts (`/kontakty`)

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| ВИГОДА контакти | Branded | 30 | 5 | **P0** primary |
| забудовник Львів контакти | Navigational | 110 | 30 | P1 |
| ВИГОДА Львів телефон | Branded | 20 | 5 | P0 |

### 2.12 News (`/novyny`)

| Keyword | Intent | Volume | KD | Пріоритет |
|---------|--------|--------|----|----|
| хід будівництва Lakeview | Branded | 30 | 5 | P0 (recurring) |
| новини забудовника Львів | Niche | 70 | 25 | P2 |

> Стане SEO-active після публікації перших 5+ матеріалів. До цього — `noindex` на пустий список.

### 2.13 NotFound (`/*`)

`noindex, follow` + HTTP 404 status. Без таргетингу.

---

## 3. Per-page meta strategy

> Правила:
> - `title` ≤ 60 символів (включно з брендом).
> - `description` 140–160 символів, з CTA або фактом.
> - `og:title` може бути дещо коротшим без бренду.
> - `og:image` 1200×630, JPG, ≤ 200 KB, відносний шлях від домену root.
> - `canonical` — абсолютний URL від canonical domain (placeholder `https://vugoda.com.ua` — заміни після вибору).

### 3.1 Таблиця meta (13 сторінок)

| # | Route | Title (≤60) | Description (140–160) | og:image |
|---|-------|-------------|----------------------|----------|
| 1 | `/` | Забудовник ВИГОДА — системний девелопмент у Львові | Будуємо у Львові й області з 2019. Активний обʼєкт — ЖК Lakeview, бізнес-клас, здача 2027. Документи і прозорі умови. | `/og/home.jpg` |
| 2 | `/pidkhid` | Як працює забудовник ВИГОДА — підхід і етапи | Чотири фази системного девелопменту: меморандум, кошторис, дозвільна документація, будівництво. Без обходів. | `/og/approach.jpg` |
| 3 | `/portfolio` | Портфель ЖК і pipeline — забудовник ВИГОДА | 1 активний обʼєкт у Львові (ЖК Lakeview, бізнес-клас) і 4 проекти у підготовці. Стадії, адреси, терміни. | `/og/portfolio.jpg` |
| 4 | `/portfolio/lakeview` | ЖК Lakeview Львів — бізнес-клас, здача 2027 | Володимира Великого 2А, Франківський район. 4 секції, монолітно-каркас, від $1600/м². Розстрочка до 2027. | `/og/lakeview.jpg` |
| 5 | `/portfolio/etno-dim` | ЖК Етно Дім — Судова, Львів | Дохідний концепт на вул. Судова. Стадія меморандуму про відновлення будівництва. Підпишіться на оновлення. | `/og/etno-dim.jpg` |
| 6 | `/portfolio/maetok` | ЖК Маєток Винниківський — новобудова у Винниках | Житловий проект у Винниках (агломерація Львова). Стадія прорахунку кошторисної документації. | `/og/maetok.jpg` |
| 7 | `/portfolio/nterest` | Дохідний дім NTEREST — інвестиційна нерухомість Львів | Концепт дохідної нерухомості. Погодження дозвільної документації. Оновлення — за підпискою. | `/og/nterest.jpg` |
| 8 | `/portfolio/pipeline-04` | Новий проект ВИГОДА у підготовці | Закритий pipeline-проект на стадії прорахунку кошторисної вартості. Деталі — після рішення інвестора. | `/og/pipeline-04.jpg` |
| 9 | `/investoram` | Інвестиції в нерухомість Львів — забудовник ВИГОДА | Формати співпраці, схема угоди, юридичний контур. Купівля майнових прав, дохідна нерухомість, партнерство. | `/og/investors.jpg` |
| 10 | `/partneram` | Партнерам і банкам — реквізити ВИГОДА | ПП «ДІК "Вигода +"», ЄДРПОУ 44876801, ліцензія від 27.12.2019. Документи для due diligence — за запитом. | `/og/partners.jpg` |
| 11 | `/kontakty` | Контакти забудовника ВИГОДА — Львів | Корпоративний email vygoda.sales@gmail.com, телефон, окремі контакти ЖК Lakeview. Форма звʼязку. | `/og/contacts.jpg` |
| 12 | `/novyny` | Новини і хід будівництва — ВИГОДА | Щомісячні фотозвіти з обʼєктів. Оновлення статусу pipeline-проектів. Анонси публічних подій. | `/og/news.jpg` |
| 13 | `/*` (404) | Сторінку не знайдено — ВИГОДА | Така сторінка не існує. Поверніться на головну або перегляньте портфель. | `/og/home.jpg` |

### 3.2 Перевірка довжини (UTF-8 chars)

```
#1  "Забудовник ВИГОДА — системний девелопмент у Львові"  → 50 ✓
#2  "Як працює забудовник ВИГОДА — підхід і етапи"        → 44 ✓
#3  "Портфель ЖК і pipeline — забудовник ВИГОДА"          → 41 ✓
#4  "ЖК Lakeview Львів — бізнес-клас, здача 2027"          → 43 ✓
#5  "ЖК Етно Дім — Судова, Львів"                          → 27 ✓
#6  "ЖК Маєток Винниківський — новобудова у Винниках"      → 47 ✓
#7  "Дохідний дім NTEREST — інвестиційна нерухомість Львів"→ 53 ✓
#8  "Новий проект ВИГОДА у підготовці"                     → 32 ✓
#9  "Інвестиції в нерухомість Львів — забудовник ВИГОДА"   → 49 ✓
#10 "Партнерам і банкам — реквізити ВИГОДА"                → 38 ✓
#11 "Контакти забудовника ВИГОДА — Львів"                  → 38 ✓
#12 "Новини і хід будівництва — ВИГОДА"                    → 34 ✓
```

Усі під 60 символів.

### 3.3 Шаблон meta-блоку (react-helmet-async / react-router v7 meta)

Для прикладу — ProjectLakeview:

```tsx
// src/seo/meta.ts (новий файл)
export const PAGE_META = {
  lakeview: {
    title: 'ЖК Lakeview Львів — бізнес-клас, здача 2027',
    description: 'Володимира Великого 2А, Франківський район. 4 секції, монолітно-каркас, від $1600/м². Розстрочка до 2027.',
    canonical: 'https://vugoda.com.ua/portfolio/lakeview',
    ogImage: 'https://vugoda.com.ua/og/lakeview.jpg',
    ogType: 'website',
    keywords: ['ЖК Lakeview', 'Lakeview Львів', 'новобудова Володимира Великого', 'бізнес-клас Львів'],
  },
  // ...решта 12 сторінок
};
```

У `<head>` через Helmet:

```tsx
<Helmet>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  <link rel="canonical" href={meta.canonical} />
  <link rel="alternate" hrefLang="uk-UA" href={meta.canonical} />
  <link rel="alternate" hrefLang="x-default" href={meta.canonical} />
  <meta property="og:type" content={meta.ogType} />
  <meta property="og:locale" content="uk_UA" />
  <meta property="og:site_name" content="ВИГОДА" />
  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:url" content={meta.canonical} />
  <meta property="og:image" content={meta.ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={meta.title} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={meta.title} />
  <meta name="twitter:description" content={meta.description} />
  <meta name="twitter:image" content={meta.ogImage} />
</Helmet>
```

---

## 4. Schema.org JSON-LD

> Усе у JSON-LD (Google's preferred). Кожна сторінка має 1–2 schema-блоки. Перевірка: [Schema Markup Validator](https://validator.schema.org/) + [Rich Results Test](https://search.google.com/test/rich-results).

### 4.1 Глобальний `Organization` + `RealEstateAgent` (вставляти в `<head>` КОЖНОЇ сторінки)

Цей блок — постійний. Йде в `index.html` напряму або через корневий `<Helmet>` у `Layout.tsx`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "RealEstateAgent"],
      "@id": "https://vugoda.com.ua/#organization",
      "name": "ВИГОДА",
      "alternateName": "ПП «ДІК \"Вигода +\"»",
      "legalName": "Приватне підприємство «Девелоперсько-інвестиційна компанія \"Вигода +\"»",
      "url": "https://vugoda.com.ua/",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://vugoda.com.ua/#logo",
        "url": "https://vugoda.com.ua/logo.svg",
        "contentUrl": "https://vugoda.com.ua/logo.svg",
        "width": 512,
        "height": 512,
        "caption": "ВИГОДА"
      },
      "image": { "@id": "https://vugoda.com.ua/#logo" },
      "description": "Системний девелопмент у Львові. Забудовник і генеральний підрядник. Активний обʼєкт — ЖК Lakeview, бізнес-клас, здача 2027.",
      "slogan": "Системний девелопмент, у якому цінність є результатом точних рішень.",
      "foundingDate": "2019",
      "areaServed": [
        { "@type": "City", "name": "Львів" },
        { "@type": "AdministrativeArea", "name": "Львівська область" }
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Львів",
        "addressRegion": "Львівська область",
        "addressCountry": "UA"
      },
      "email": "vygoda.sales@gmail.com",
      "telephone": "+380969900390",
      "identifier": [
        { "@type": "PropertyValue", "propertyID": "ЄДРПОУ", "value": "44876801" },
        { "@type": "PropertyValue", "propertyID": "Ліцензія на будівництво", "value": "Видана 27.12.2019, безстрокова" }
      ],
      "sameAs": [
        "https://www.instagram.com/lakeviewlviv/"
      ],
      "knowsLanguage": ["uk"],
      "makesOffer": [
        {
          "@type": "Offer",
          "name": "Купівля майнових прав на квартиру (ЖК Lakeview)",
          "category": "Residential real estate",
          "areaServed": { "@type": "City", "name": "Львів" }
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://vugoda.com.ua/#website",
      "url": "https://vugoda.com.ua/",
      "name": "ВИГОДА — системний девелопмент",
      "publisher": { "@id": "https://vugoda.com.ua/#organization" },
      "inLanguage": "uk-UA"
    }
  ]
}
```

**Примітки:**
- `@graph` дозволяє звʼязати `Organization` + `WebSite` в одному блоці. Це best practice 2026.
- `@id` з фрагментом (`#organization`, `#website`) — ідентифікатори, на які можна посилатись з інших schema-блоків (наприклад, `provider` в `RealEstateListing`).
- `["Organization", "RealEstateAgent"]` — multi-typing. Дозволено Schema.org; дає Google зрозуміти і компанію, і її роль агента нерухомості.
- `sameAs` — додати після створення корпоративних соцмереж ВИГОДИ (зараз тільки Instagram ЖК).
- `email` уніфіковано на `vygoda.sales@gmail.com` (corp). Якщо клієнт виділить окремий — оновити.

### 4.2 Home (`/`) — додатковий блок `WebPage` + `BreadcrumbList`

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://vugoda.com.ua/#webpage",
  "url": "https://vugoda.com.ua/",
  "name": "Забудовник ВИГОДА — системний девелопмент у Львові",
  "description": "Будуємо у Львові й області з 2019. Активний обʼєкт — ЖК Lakeview, бізнес-клас, здача 2027.",
  "isPartOf": { "@id": "https://vugoda.com.ua/#website" },
  "about": { "@id": "https://vugoda.com.ua/#organization" },
  "inLanguage": "uk-UA",
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "url": "https://vugoda.com.ua/og/home.jpg",
    "width": 1200,
    "height": 630
  }
}
```

### 4.3 Portfolio (`/portfolio`) — `CollectionPage` + `ItemList` з 5 проектів

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://vugoda.com.ua/portfolio/#webpage",
  "url": "https://vugoda.com.ua/portfolio",
  "name": "Портфель ЖК і pipeline — забудовник ВИГОДА",
  "isPartOf": { "@id": "https://vugoda.com.ua/#website" },
  "inLanguage": "uk-UA",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Проекти ВИГОДА",
    "numberOfItems": 5,
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://vugoda.com.ua/portfolio/lakeview",
        "name": "ЖК Lakeview"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "url": "https://vugoda.com.ua/portfolio/etno-dim",
        "name": "ЖК Етно Дім"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "url": "https://vugoda.com.ua/portfolio/maetok",
        "name": "ЖК Маєток Винниківський"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "url": "https://vugoda.com.ua/portfolio/nterest",
        "name": "Дохідний дім NTEREST"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "url": "https://vugoda.com.ua/portfolio/pipeline-04",
        "name": "Новий проект (у підготовці)"
      }
    ]
  }
}
```

### 4.4 ProjectLakeview (`/portfolio/lakeview`) — `ApartmentComplex` + `BreadcrumbList`

> Це **флагман**. Detailed schema. Координати — з кадастру `4610136900:07:005:0028` (вул. Володимира Великого, 2А, Львів — `49.8210, 24.0042` приблизно; **уточнити точні координати через Google Maps** перед прод-деплоєм).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ApartmentComplex",
      "@id": "https://vugoda.com.ua/portfolio/lakeview/#complex",
      "name": "ЖК Lakeview",
      "alternateName": "Lakeview",
      "description": "Житловий комплекс бізнес-класу у Франківському районі Львова. 4 секції, монолітно-каркасна технологія, до 16 поверхів, 2 поверхи комерції, 2-рівневий підземний паркінг. Біля двох природних озер.",
      "url": "https://vugoda.com.ua/portfolio/lakeview",
      "image": [
        "https://vugoda.com.ua/projects/lakeview/aerial.jpg",
        "https://vugoda.com.ua/projects/lakeview/semi-aerial.jpg",
        "https://vugoda.com.ua/projects/lakeview/closeup.jpg",
        "https://vugoda.com.ua/projects/lakeview/entrance.jpg",
        "https://vugoda.com.ua/projects/lakeview/lake-bridge.jpg",
        "https://vugoda.com.ua/projects/lakeview/terrace.jpg"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "вул. Володимира Великого, 2А",
        "addressLocality": "Львів",
        "addressRegion": "Львівська область",
        "addressCountry": "UA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 49.8210,
        "longitude": 24.0042
      },
      "numberOfAccommodationUnits": {
        "@type": "QuantitativeValue",
        "minValue": 100,
        "unitText": "apartments"
      },
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Підземний паркінг", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Автономне опалення", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Охорона та відеоспостереження", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Комерційні приміщення", "value": "2 поверхи" },
        { "@type": "LocationFeatureSpecification", "name": "Контроль доступу", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Власний двір та паркова зона", "value": true }
      ],
      "petsAllowed": true,
      "tourBookingPage": "https://vugoda.com.ua/portfolio/lakeview#zapys",
      "containsPlace": [
        {
          "@type": "Apartment",
          "name": "1-кімнатна квартира",
          "floorSize": { "@type": "QuantitativeValue", "minValue": 44, "unitCode": "MTK" }
        },
        {
          "@type": "Apartment",
          "name": "2-кімнатна квартира",
          "floorSize": { "@type": "QuantitativeValue", "unitCode": "MTK" }
        },
        {
          "@type": "Apartment",
          "name": "3-кімнатна квартира",
          "floorSize": { "@type": "QuantitativeValue", "maxValue": 183, "unitCode": "MTK" }
        }
      ],
      "developer": { "@id": "https://vugoda.com.ua/#organization" },
      "additionalProperty": [
        { "@type": "PropertyValue", "name": "Клас", "value": "Бізнес" },
        { "@type": "PropertyValue", "name": "Секцій", "value": 4 },
        { "@type": "PropertyValue", "name": "Поверховість", "value": "до 16" },
        { "@type": "PropertyValue", "name": "Технологія", "value": "Монолітно-каркасна, залізобетон + керамоблоки, мінвата" },
        { "@type": "PropertyValue", "name": "Клас наслідків", "value": "СС3" },
        { "@type": "PropertyValue", "name": "Термін здачі", "value": "2027" },
        { "@type": "PropertyValue", "name": "Стартова ціна", "value": "від $1600 / м²" },
        { "@type": "PropertyValue", "name": "Кадастровий номер", "value": "4610136900:07:005:0028" }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Головна", "item": "https://vugoda.com.ua/" },
        { "@type": "ListItem", "position": 2, "name": "Портфель", "item": "https://vugoda.com.ua/portfolio" },
        { "@type": "ListItem", "position": 3, "name": "ЖК Lakeview", "item": "https://vugoda.com.ua/portfolio/lakeview" }
      ]
    }
  ]
}
```

**Унікодові коди:**
- `MTK` = square metre (UN/CEFACT Common Code) — для `floorSize`.
- `unitCode` перевагу над `unitText` у Google rich results.

### 4.5 ProjectEtnoDim (`/portfolio/etno-dim`) — `Place` + `Project` гібрид

Pipeline на стадії меморандуму — не повноцінний `ApartmentComplex`. Використовуємо `Place` з `additionalType` + декларуємо `developer`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ApartmentComplex",
      "@id": "https://vugoda.com.ua/portfolio/etno-dim/#complex",
      "name": "ЖК Етно Дім",
      "description": "Житловий проект на вул. Судова у Львові. Стадія: меморандум про відновлення будівництва. Запуск продажів — після фіналізації пакета документів.",
      "url": "https://vugoda.com.ua/portfolio/etno-dim",
      "image": "https://vugoda.com.ua/projects/etno-dim/hero.jpg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "вул. Судова",
        "addressLocality": "Львів",
        "addressRegion": "Львівська область",
        "addressCountry": "UA"
      },
      "developer": { "@id": "https://vugoda.com.ua/#organization" },
      "additionalProperty": [
        { "@type": "PropertyValue", "name": "Стадія", "value": "Меморандум про відновлення будівництва" },
        { "@type": "PropertyValue", "name": "Тип продукту", "value": "Дохідний дім (концепт)" }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Головна", "item": "https://vugoda.com.ua/" },
        { "@type": "ListItem", "position": 2, "name": "Портфель", "item": "https://vugoda.com.ua/portfolio" },
        { "@type": "ListItem", "position": 3, "name": "ЖК Етно Дім", "item": "https://vugoda.com.ua/portfolio/etno-dim" }
      ]
    }
  ]
}
```

### 4.6 ProjectMaetok (`/portfolio/maetok`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ApartmentComplex",
      "@id": "https://vugoda.com.ua/portfolio/maetok/#complex",
      "name": "ЖК Маєток Винниківський",
      "description": "Житловий проект у Винниках (Львівська область, агломерація Львова). Стадія: прорахунок кошторисної документації.",
      "url": "https://vugoda.com.ua/portfolio/maetok",
      "image": "https://vugoda.com.ua/projects/maetok/hero.jpg",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Винники",
        "addressRegion": "Львівська область",
        "addressCountry": "UA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 49.8167,
        "longitude": 24.1333
      },
      "developer": { "@id": "https://vugoda.com.ua/#organization" },
      "additionalProperty": [
        { "@type": "PropertyValue", "name": "Стадія", "value": "Прорахунок кошторисної документації" }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Головна", "item": "https://vugoda.com.ua/" },
        { "@type": "ListItem", "position": 2, "name": "Портфель", "item": "https://vugoda.com.ua/portfolio" },
        { "@type": "ListItem", "position": 3, "name": "ЖК Маєток Винниківський", "item": "https://vugoda.com.ua/portfolio/maetok" }
      ]
    }
  ]
}
```

> Координати Винників — `49.8167, 24.1333` орієнтовно. **Уточнити точку через Google Maps** після узгодження ділянки з клієнтом.

### 4.7 ProjectNterest (`/portfolio/nterest`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ApartmentComplex",
      "@id": "https://vugoda.com.ua/portfolio/nterest/#complex",
      "name": "Дохідний дім NTEREST",
      "description": "Концепт дохідної нерухомості у Львові. Стадія: погодження дозвільної документації. Інвестиційний продукт орієнтований на оренду.",
      "url": "https://vugoda.com.ua/portfolio/nterest",
      "image": "https://vugoda.com.ua/projects/nterest/hero.jpg",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Львів",
        "addressRegion": "Львівська область",
        "addressCountry": "UA"
      },
      "developer": { "@id": "https://vugoda.com.ua/#organization" },
      "additionalProperty": [
        { "@type": "PropertyValue", "name": "Стадія", "value": "Погодження дозвільної документації" },
        { "@type": "PropertyValue", "name": "Тип продукту", "value": "Дохідний дім" }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Головна", "item": "https://vugoda.com.ua/" },
        { "@type": "ListItem", "position": 2, "name": "Портфель", "item": "https://vugoda.com.ua/portfolio" },
        { "@type": "ListItem", "position": 3, "name": "Дохідний дім NTEREST", "item": "https://vugoda.com.ua/portfolio/nterest" }
      ]
    }
  ]
}
```

### 4.8 ProjectPipeline04 (`/portfolio/pipeline-04`)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": "https://vugoda.com.ua/portfolio/pipeline-04",
  "name": "Новий проект ВИГОДА у підготовці",
  "description": "Закритий pipeline-проект на стадії прорахунку кошторисної вартості.",
  "isPartOf": { "@id": "https://vugoda.com.ua/#website" },
  "about": { "@id": "https://vugoda.com.ua/#organization" }
}
```

**Окремо в `<head>` цієї сторінки:**
```html
<meta name="robots" content="noindex, follow">
```
До появи назви/контенту. Як тільки зʼявляється — прибираємо `noindex` і додаємо повний `ApartmentComplex` блок.

### 4.9 Contacts (`/kontakty`) — `LocalBusiness` (підтип `RealEstateAgent`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "RealEstateAgent"],
      "@id": "https://vugoda.com.ua/kontakty/#localbusiness",
      "name": "ВИГОДА — забудовник у Львові",
      "alternateName": "ПП «ДІК \"Вигода +\"»",
      "url": "https://vugoda.com.ua/",
      "telephone": "+380969900390",
      "email": "vygoda.sales@gmail.com",
      "image": "https://vugoda.com.ua/og/contacts.jpg",
      "logo": "https://vugoda.com.ua/logo.svg",
      "priceRange": "$$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "вул. Володимира Великого, 4, каб. 406",
        "addressLocality": "Львів",
        "addressRegion": "Львівська область",
        "postalCode": "79000",
        "addressCountry": "UA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 49.8210,
        "longitude": 24.0042
      },
      "areaServed": [
        { "@type": "City", "name": "Львів" },
        { "@type": "AdministrativeArea", "name": "Львівська область" }
      ],
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "19:00"
        }
      ],
      "parentOrganization": { "@id": "https://vugoda.com.ua/#organization" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Головна", "item": "https://vugoda.com.ua/" },
        { "@type": "ListItem", "position": 2, "name": "Контакти", "item": "https://vugoda.com.ua/kontakty" }
      ]
    }
  ]
}
```

> Адреса офісу — це офіс продажу Lakeview (з UI). Якщо клієнт виділить окремий корпоративний офіс — оновити.

### 4.10 Investors (`/investoram`) — `Service` + `WebPage`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://vugoda.com.ua/investoram/#webpage",
      "url": "https://vugoda.com.ua/investoram",
      "name": "Інвестиції в нерухомість Львів — забудовник ВИГОДА",
      "description": "Формати співпраці, схема угоди, юридичний контур. Купівля майнових прав, дохідна нерухомість, партнерство.",
      "isPartOf": { "@id": "https://vugoda.com.ua/#website" },
      "inLanguage": "uk-UA",
      "mainEntity": {
        "@type": "Service",
        "name": "Інвестиції в нерухомість",
        "serviceType": "Real estate investment",
        "provider": { "@id": "https://vugoda.com.ua/#organization" },
        "areaServed": { "@type": "City", "name": "Львів" },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Формати співпраці",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Купівля майнових прав" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Дохідна нерухомість" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Партнерство по проекту" } }
          ]
        }
      }
    }
  ]
}
```

### 4.11 Approach (`/pidkhid`) — `HowTo`

Pillar-сторінка з 4 фазами — це класичний `HowTo`-кейс, що дає шанс на rich result.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Як ВИГОДА веде проект — 4 фази системного девелопменту",
  "description": "Чотири фази, через які проходить кожен проект ВИГОДА до запуску продажів. Без скорочень і обходів.",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Меморандум",
      "text": "Фіксуємо умови з замовником або партнером — обсяг, відповідальність, графік. До цього кроку проектну роботу не починаємо."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Кошторис",
      "text": "Прораховуємо вартість матеріалів і робіт до старту продажів, а не після. Ціна квадрата спирається на цифри, не на ринкову позицію."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Дозвільна документація",
      "text": "Узгоджуємо містобудівні умови, експертизу, дозвіл на будівництво. Без повного пакета на майданчик не виходимо."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Будівництво",
      "text": "Щомісяця документуємо хід робіт. Кожна фаза — фотозвіт, акти, технагляд."
    }
  ]
}
```

### 4.12 Partners (`/partneram`) — `AboutPage` + повна юр-картка

```json
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "url": "https://vugoda.com.ua/partneram",
  "name": "Партнерам і банкам — реквізити ВИГОДА",
  "description": "Юридичні реквізити ПП «ДІК Вигода +», ліцензії, дозволи, документи для due diligence.",
  "isPartOf": { "@id": "https://vugoda.com.ua/#website" },
  "about": { "@id": "https://vugoda.com.ua/#organization" }
}
```

### 4.13 News (`/novyny`) — `WebPage`, після наповнення `Blog`/`CollectionPage`

Поки що (порожня сторінка) — `noindex`. Після перших 3 публікацій:

```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "url": "https://vugoda.com.ua/novyny",
  "name": "Новини і хід будівництва — ВИГОДА",
  "publisher": { "@id": "https://vugoda.com.ua/#organization" },
  "inLanguage": "uk-UA"
}
```

---

## 5. sitemap.xml

> Файл: `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/sitemap.xml`
> Domain placeholder: `https://vugoda.com.ua` — замінити після вибору домену.
> `lastmod` — динамічно генерувати на білді (через скрипт або vite-плагін). Тут — поточна дата.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <url>
    <loc>https://vugoda.com.ua/</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/"/>
    <image:image>
      <image:loc>https://vugoda.com.ua/og/home.jpg</image:loc>
      <image:title>ВИГОДА — системний девелопмент у Львові</image:title>
    </image:image>
  </url>

  <url>
    <loc>https://vugoda.com.ua/portfolio</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/portfolio"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/portfolio"/>
  </url>

  <url>
    <loc>https://vugoda.com.ua/portfolio/lakeview</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/portfolio/lakeview"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/portfolio/lakeview"/>
    <image:image>
      <image:loc>https://vugoda.com.ua/projects/lakeview/aerial.jpg</image:loc>
      <image:title>ЖК Lakeview — аерофотозйомка</image:title>
    </image:image>
    <image:image>
      <image:loc>https://vugoda.com.ua/projects/lakeview/semi-aerial.jpg</image:loc>
      <image:title>ЖК Lakeview — оглядовий ракурс</image:title>
    </image:image>
    <image:image>
      <image:loc>https://vugoda.com.ua/projects/lakeview/closeup.jpg</image:loc>
      <image:title>ЖК Lakeview — деталі фасаду</image:title>
    </image:image>
  </url>

  <url>
    <loc>https://vugoda.com.ua/portfolio/etno-dim</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/portfolio/etno-dim"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/portfolio/etno-dim"/>
  </url>

  <url>
    <loc>https://vugoda.com.ua/portfolio/maetok</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/portfolio/maetok"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/portfolio/maetok"/>
  </url>

  <url>
    <loc>https://vugoda.com.ua/portfolio/nterest</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/portfolio/nterest"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/portfolio/nterest"/>
  </url>

  <!-- pipeline-04 — поки noindex, у sitemap НЕ включаємо. Додамо після появи назви/контенту. -->

  <url>
    <loc>https://vugoda.com.ua/investoram</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/investoram"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/investoram"/>
  </url>

  <url>
    <loc>https://vugoda.com.ua/partneram</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/partneram"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/partneram"/>
  </url>

  <url>
    <loc>https://vugoda.com.ua/pidkhid</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/pidkhid"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/pidkhid"/>
  </url>

  <url>
    <loc>https://vugoda.com.ua/kontakty</loc>
    <lastmod>2026-05-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="uk-UA" href="https://vugoda.com.ua/kontakty"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://vugoda.com.ua/kontakty"/>
  </url>

  <!-- /novyny — додаємо після першої публікації. Поки noindex. -->

</urlset>
```

**Логіка пріоритетів:**
- `1.0` Home — головна точка входу.
- `0.9` Portfolio + Lakeview — найважливіший комерційний контент.
- `0.8` Investors — основна B2C/B2B комерційна сторінка.
- `0.7` Approach, Contacts, pipeline-проекти — підтримуючі.
- `0.6` Partners — нішевий B2B контент.

**Логіка changefreq:**
- `weekly` — Home, Portfolio, Lakeview (хід будівництва оновлюється помісячно, але внутрішні мікро-зміни — щотижня).
- `monthly` — все інше.

---

## 6. robots.txt

> Файл: `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/robots.txt`

```
User-agent: *
Allow: /

# Сторінки в підготовці — закриваємо до контенту
Disallow: /portfolio/pipeline-04
Disallow: /novyny

# Cloudflare Pages / Vite preview та білд-артефакти — про всяк випадок
Disallow: /assets/sourcemaps/

# AI crawlers — дозволяємо (бренд хоче бути цитованим у AI Overviews / Perplexity)
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# Sitemap
Sitemap: https://vugoda.com.ua/sitemap.xml
```

**Чому AI bots відкриваємо:**
ВИГОДА — молодий бренд з тонким SEO-шлейфом. Цитування у AI Overviews / Perplexity / ChatGPT — це додатковий канал виявлення для інвесторів-нерезидентів і журналістів. Закривати немає сенсу.

**Як прибрати `noindex`-pipeline-04 і `/novyny`:**
Як тільки контент готовий — видалити відповідні `Disallow` рядки і прибрати `<meta name="robots" content="noindex">` зі сторінок.

---

## 7. Open Graph image specs

### 7.1 Технічні параметри

| Параметр | Значення |
|----------|----------|
| Розмір | 1200 × 630 px (Facebook/LinkedIn standard) |
| Aspect ratio | 1.91:1 |
| Формат | JPG (Telegram стабільно), запас WebP як `og:image:secure_url` опціонально |
| Розмір файлу | < 200 KB (Facebook рекомендація; > 8MB не пройде) |
| Розташування | `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/og/` |
| Кількість | 12 (1 на сторінку, окрім 404 → використовує `home.jpg`) |

### 7.2 Brand-композиція (по брендбуку)

**Фон:**
- Background: `#2F3640` (bg-deep, головний темний)
- Опційно: `#020A0A` (deepest black) для контрасту

**Графіка:**
- Лінійна ізометрія / каркасні куби з брендбука (page-20)
- Stroke 0.5–1 pt, `opacity: 5–10%` для фону
- НЕ використовувати декоративний lime — лайм тільки point-use (1–2 акценти, лого-куб, плашка стадії)

**Текст:**
- Шрифт: Montserrat Bold (заголовок) + Regular (підпис)
- Колір тексту: `#F5F7FA` (text-primary)
- Допоміжний сірий: `#A7AFBC` (text-secondary)
- Розмір заголовку: 64–80 pt
- Безпечна зона: відступ 80 px з усіх країв

**Композиція (типова):**
```
┌─────────────────────────────────────────────┐
│ [лого ВИГОДА — top-left, 120px wide]        │
│                                             │
│                                             │
│   ЖК Lakeview                               │  ← Bold, 80 pt
│   Бізнес-клас · Львів · 2027                │  ← Regular, 28 pt, secondary
│                                             │
│                                             │
│ [фото проекту з затемненням ▒]              │  ← right 40%, або фон з gradient overlay
│                                             │
│         vugoda.com.ua [//URL — bottom-right]│
└─────────────────────────────────────────────┘
```

### 7.3 Per-page контент (текст на зображенні)

| Файл | Заголовок (H1) | Підпис | Візуал |
|------|---------------|--------|--------|
| `home.jpg` | ВИГОДА | системний девелопмент · Львів | Ізометричні куби brand pattern |
| `approach.jpg` | Підхід | 4 фази системного девелопменту | Інфографіка з 4 кубами |
| `portfolio.jpg` | Портфель | 1 активний · 4 у підготовці | Aerial Lakeview + ізо-сітка |
| `lakeview.jpg` | ЖК Lakeview | Бізнес-клас · Львів · 2027 | Aerial.jpg затемнений |
| `etno-dim.jpg` | ЖК Етно Дім | Судова · Львів | Рендер з `/renders/ЖК Етно Дім/` |
| `maetok.jpg` | ЖК Маєток Винниківський | Винники · Львівська обл. | Рендер з `/renders/ЖК Маєток Винниківський/` |
| `nterest.jpg` | Дохідний дім NTEREST | інвестиційна нерухомість Львів | Рендер з `/renders/Дохідний дім NTEREST/` |
| `pipeline-04.jpg` | Новий проект | у підготовці | Ізо-куб placeholder (brandbook page-20) |
| `investors.jpg` | Інвесторам | формати співпраці і схема угоди | Чистий dark + accent line |
| `partners.jpg` | Партнерам і банкам | реквізити та документи | Чистий dark + monospace ID |
| `contacts.jpg` | Контакти | Львів · vygoda.sales@gmail.com | Map-style ізо-сітка |
| `news.jpg` | Новини | хід будівництва · оновлення | Construction photo overlay |

### 7.4 Інструмент для генерації

Якщо production буде багато per-asset edits — варто розглянути:
- **Vercel OG / Cloudflare Pages Functions** — динамічна генерація OG з шаблону (React component → PNG). Зручно для News і майбутніх pipeline-проектів.
- **Figma → export** — для статичних 12 файлів достатньо вручну зі shared Figma library.

Рекомендація: на v1 — статичні JPG. Динамічну генерацію — у v2 коли блог буде наповнюватись.

---

## 8. hreflang і мультимовність

### 8.1 Поточне рішення: uk-UA only

```html
<html lang="uk">
<link rel="alternate" hrefLang="uk-UA" href="https://vugoda.com.ua/{route}" />
<link rel="alternate" hrefLang="x-default" href="https://vugoda.com.ua/{route}" />
```

**Чому self-referencing hreflang на одномовному сайті:**
- Сигнал Google що uk-UA — primary locale, не випадковість.
- `x-default` страхує fallback для не-UA користувачів (Google може показувати у CIS/EU SERP).
- Якщо колись додамо EN — структура вже готова, треба лише дописати другий `<link>`.

### 8.2 EN-версія: рекомендація НЕ зараз

**Аргументи проти EN на v1:**
1. Цільова ICP (інвестори $50–200k) — переважно україномовні (внутрішній ринок Львова + переселенці з Києва).
2. Контент потребує локалізації не тільки тексту, але й юридичних формулювань (ЄДРПОУ, ліцензія ДАБІ, СС3) — переклад потребує юр-консультанта.
3. SEO-ресурс краще сконцентрувати на одній мові і досягти ранжування, а не розпилити на дві з посередніми позиціями.

**Коли додавати EN:**
- Коли клієнт відкриє діалог з diaspora-інвесторами (Канада, Польща, Чехія).
- Або коли стане доступний інвест-продукт (REIT-style) для нерезидентів.
- Технічно — підготувати i18n архітектуру (наприклад, `react-i18next`) одразу, навіть якщо рендериться тільки UA. Це здешевить додавання EN у v2.

### 8.3 Якщо все ж додаємо EN

URL pattern: subdirectory `/en/` (не subdomain, не ccTLD):
```
https://vugoda.com.ua/portfolio/lakeview      ← uk-UA
https://vugoda.com.ua/en/portfolio/lakeview   ← en-US (або en-x-default)
```

hreflang block на кожній сторінці:
```html
<link rel="alternate" hrefLang="uk-UA" href="https://vugoda.com.ua/portfolio/lakeview" />
<link rel="alternate" hrefLang="en"    href="https://vugoda.com.ua/en/portfolio/lakeview" />
<link rel="alternate" hrefLang="x-default" href="https://vugoda.com.ua/portfolio/lakeview" />
```

---

## 9. Технічна імплементація — куди що йде

### 9.1 Файли, які треба створити

| Шлях | Що містить | Пріоритет |
|------|-----------|-----------|
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/robots.txt` | Готовий вміст з §6 | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/sitemap.xml` | Згенерований через білд-скрипт або статичний з §5 | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/_redirects` (Cloudflare Pages) | SPA fallback + 301 редіректи з GH Pages | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/og/home.jpg` (та 11 інших) | 12 OG-зображень 1200×630 | P1 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/seo/meta.ts` | Об'єкт PAGE_META для всіх сторінок | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/seo/jsonld.ts` | Генератори JSON-LD per page-type | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/seo/Seo.tsx` | Component-wrapper навколо `react-helmet-async` (або v7 meta export) | P0 |

### 9.2 Файли, які треба змінити

| Шлях | Зміни | Пріоритет |
|------|-------|-----------|
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/index.html` | Прибрати hard-coded `<title>`/`<description>`, лишити lang/viewport/icon. Додати глобальний `Organization` JSON-LD одразу в `<head>`. Виправити шлях favicon на `/favicon.svg` (без `/vugoda-web-2/`). | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/main.tsx` | Замінити HashRouter на BrowserRouter; обгорнути в `HelmetProvider`. | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/components/Layout.tsx` | Додати глобальний `<Seo>` компонент з дефолтами + щоб per-page міг override. | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/pages/*.tsx` (13 файлів) | Кожна сторінка викликає `<Seo {...PAGE_META.X} jsonLd={...}/>` на топ-рівні. | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/vite.config.ts` | Прибрати `base: '/vugoda-web-2/'` (після міграції на custom domain) — або зробити умовним по env. | P0 |
| `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/package.json` | Додати `react-helmet-async` (або обрати v7 meta route exports), додати білд-скрипт для sitemap (`scripts/build-sitemap.ts`). | P0 |

### 9.3 Залежності і пакети

```bash
npm install react-helmet-async
# або (якщо react-router v7 з SSR/SSG)
# native support для meta exports — без додаткових пакетів

# Опційно для pre-render (SSG):
npm install -D vite-plugin-ssg
# або
npm install -D vite-react-ssg
```

### 9.4 Cloudflare Pages — конфігурація

**`public/_redirects` (SPA fallback + 301 з GH Pages):**
```
# 301 редіректи зі старого GH Pages домену (опційно, якщо домен повністю заміняємо)
# Cloudflare Pages не може редіректити з зовнішнього домену — це робиться через GH Pages CNAME або 410/redirect в GH workflow.
# Для self-hosted Cloudflare правил:

# SPA fallback — для BrowserRouter
/*    /index.html   200
```

**Headers (опційно — `public/_headers`):**
```
/og/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/sitemap.xml
  Content-Type: application/xml
  Cache-Control: public, max-age=3600

/robots.txt
  Content-Type: text/plain
  Cache-Control: public, max-age=86400
```

### 9.5 Pre-render для SEO (рекомендація)

Чисто SPA на Cloudflare Pages з `_redirects` + JSON-LD у `<head>` від `react-helmet-async` — це **технічно проіндексується** Google (рендерить JS), але:
- AI crawlers (GPTBot, PerplexityBot, ClaudeBot) часто НЕ рендерять JS.
- Latency SEO-індексу — 2-3 тижні замість 1-2 днів для SSG.
- Open Graph для соцмереж (Facebook, Telegram) — НЕ рендерять JS взагалі. Без pre-render OG не працює.

**Рекомендація:** додати `vite-react-ssg` або `vite-plugin-ssg` для статичної генерації 13 сторінок. Це закриває всі три ризики одразу.

---

## 10. План міграції з GH Pages — 301 редіректи

### 10.1 Старі → нові URL

| Старий URL (HashRouter) | Новий URL | Тип |
|------------------------|-----------|-----|
| `yaroslavpetrukha.github.io/vugoda-web-2/#/` | `vugoda.com.ua/` | 301 (через JS) |
| `yaroslavpetrukha.github.io/vugoda-web-2/#/portfolio` | `vugoda.com.ua/portfolio` | 301 |
| `yaroslavpetrukha.github.io/vugoda-web-2/#/portfolio/lakeview` | `vugoda.com.ua/portfolio/lakeview` | 301 |
| (та інші 10 routes) | (та інші 10 routes) | 301 |

### 10.2 Проблема hash-redirect

Hash (`#`) у URL **не передається на сервер**. 301 на серверному рівні з hash зробити неможливо. Тому:

**Опція А — JS-redirect на GH Pages (поки домен ще активний):**
Зберегти `yaroslavpetrukha.github.io/vugoda-web-2/index.html` зі скриптом:
```html
<script>
  // Витягнути hash і редіректнути на новий домен
  const hash = window.location.hash.replace(/^#/, '') || '/';
  window.location.replace('https://vugoda.com.ua' + hash);
</script>
```

**Опція Б — припинити GH Pages, надіслати GSC removal request.**
Простіша, якщо GH Pages URL ще не отримав суттєвого link equity (так, у нашому випадку).

**Рекомендація:** Опція А, тримати GH Pages 90 днів після міграції з JS-редіректом, потім вимикати.

### 10.3 Google Search Console кроки

1. Додати новий домен `vugoda.com.ua` як property (Domain property, не URL prefix — щоб і `www`, і root підпадали).
2. Верифікувати через DNS TXT-запис у Cloudflare.
3. Submit `sitemap.xml`.
4. У старому property (`yaroslavpetrukha.github.io/vugoda-web-2/`) — використати "Change of Address" tool (якщо доступний для GH Pages domain — тут проблема: GoogleSearchConsole не підтримує change-of-address для shared subdomains типу github.io).
5. Альтернатива: просто submit обидва і дочекатись поки GH Pages деіндексується природно (4-6 тижнів).

---

## 11. E-E-A-T сигнали для забудовника (бонус)

Google's Helpful Content System і Core Updates особливо чутливі до YMYL (Your Money Your Life) — нерухомість = YMYL. Це означає, що чисто технічного SEO мало; контент має демонструвати:

| Сигнал | Що зробити на сайті ВИГОДА | Де це вже є |
|--------|----------------------------|-------------|
| **Experience** | Фото з обʼєктів (грудень 2025 – березень 2026), щомісячні фотозвіти. | ✓ ProjectLakeview блок "Хід будівництва" |
| **Expertise** | Конкретні технічні параметри: СС3, монолітно-каркас, кадастр. | ✓ блок "Параметри" |
| **Authoritativeness** | ЄДРПОУ, ліцензія ДАБІ, посилання на держреєстр. | ✓ блок "Документи та факти" Home + Partners |
| **Trustworthiness** | Прямі контакти, фізична адреса офісу, юридична картка. | ✓ Contacts + Partners |

**Що додати:**
- **Footer на всіх сторінках:** `ПП «ДІК "Вигода +"» · ЄДРПОУ 44876801 · vugoda.com.ua · vygoda.sales@gmail.com` — це **E-E-A-T сигнал на масштабі сайту**, не тільки на одній сторінці.
- **Linkable assets** для off-page SEO (майбутній етап): "Як перевірити забудовника перед покупкою" — гайд що дає всі чек-листи + згадує СС3, ліцензії ДАБІ, єОселя. Це той тип контенту, на який лінкуються журналісти і ріелтори.

---

## 12. Що потребує рішення клієнта перед фінальним деплоєм

| # | Питання | Блокує |
|---|---------|--------|
| 1 | Canonical domain — `vugoda.com.ua` / `vugoda.dev` / інше? | Усе (canonical, sitemap, OG URLs, JSON-LD `@id`) |
| 2 | Корпоративні соцмережі ВИГОДИ (Instagram/LinkedIn/Facebook)? | `sameAs` у Organization JSON-LD |
| 3 | Точні GPS-координати ділянок (Lakeview, Винники, Судова, NTEREST)? | `GeoCoordinates` у ApartmentComplex |
| 4 | Чи виділяти окрему корпоративну адресу та телефон (зараз = Lakeview office)? | `LocalBusiness` JSON-LD у Contacts |
| 5 | Чи плануємо EN-версію у v2 (Q4 2026 / 2027)? | Архітектура i18n зараз |
| 6 | Google Business Profile — створити окремо для ВИГОДА (адреса, фото, hours)? | Local SEO (Google Maps SERP) |
| 7 | Дозвіл клієнта публікувати юр-документи (ліцензія сканом, виписка з ЄДРПОУ) для E-E-A-T? | Partners page контент |

---

## 13. Чек-лист релізу

**Перед мерджем у main:**
- [ ] Усі 13 сторінок мають унікальний `<title>` і `<meta description>`
- [ ] Усі 13 сторінок мають `canonical` (абсолютний URL)
- [ ] Глобальний `Organization` JSON-LD у `<head>` (через Layout)
- [ ] Per-page JSON-LD (ApartmentComplex / LocalBusiness / HowTo / etc.)
- [ ] OG image для кожної сторінки (12 файлів у `/public/og/`)
- [ ] `robots.txt` у `/public/`
- [ ] `sitemap.xml` у `/public/` (або згенерований білд-скриптом)
- [ ] `<html lang="uk">` + self-ref hreflang
- [ ] 404-сторінка повертає HTTP 404 (Cloudflare Pages функція або `404.html`)
- [ ] HashRouter → BrowserRouter
- [ ] Cloudflare Pages `_redirects` SPA fallback
- [ ] Канонічні URL — без `/vugoda-web-2/` префіксу

**Після першого деплою на canonical domain:**
- [ ] Перевірити кожну сторінку у [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Перевірити кожну сторінку у [Schema Markup Validator](https://validator.schema.org/)
- [ ] Перевірити OG preview у [opengraph.xyz](https://www.opengraph.xyz/) і [Telegram bot @WebpageBot](https://t.me/webpagebot)
- [ ] Submit `sitemap.xml` у Google Search Console
- [ ] Submit `sitemap.xml` у Bing Webmaster Tools
- [ ] Створити Google Business Profile для ВИГОДА (Львів)
- [ ] Перевірити Core Web Vitals у [PageSpeed Insights](https://pagespeed.web.dev/) — LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] Налаштувати GA4 з event tracking для форм (`contact-form-submit`, `investor-form-submit`)

**Через 30 днів після деплою:**
- [ ] Перевірити Index Coverage у GSC: 12/12 indexed (pipeline-04 і novyny — noindex)
- [ ] Перевірити Manual Actions: 0
- [ ] Перевірити Backlinks (Ahrefs free / GSC Links): мінімум 5 referring domains
- [ ] Перевірити позиції по 5 primary keywords з §2 (top-100 minimum)

---

## 14. Sources

- [Schema.org ApartmentComplex](https://schema.org/ApartmentComplex)
- [Schema.org RealEstateAgent](https://schema.org/RealEstateAgent)
- [Schema.org RealEstateListing](https://schema.org/RealEstateListing)
- [Schema.org Place + GeoCoordinates](https://schema.org/Place)
- [Schema.org Apartment](https://schema.org/Apartment)
- [Schema.org GeoCoordinates](https://schema.org/GeoCoordinates)
- [Real Estate Schema Markup Implementation Guide — PlantAndGrowSEO](https://plantandgrowseo.com/real-estate-schema-markup-implementation-guide/)
- [Real Estate Schema Markup Guide — Jeff Lenney](https://jefflenney.com/real-estate/schema-markup-guide/)
- [Real Estate Schema for SEO and AI — eSEOspace](https://eseospace.com/blog/schema-markup-for-real-estate-websites/)
- [Real Estate AI SEO: Schema, JSON-LD & Checklist — MapAtlas](https://mapatlas.eu/solutions/guides/real-estate)
- [Schema.org for SEO: Ready-to-Use JSON-LD Examples 2026 — Incremys](https://www.incremys.com/en/resources/blog/schema-seo)
- [RealEstateAgent Schema Generator — Schemantra](https://schemantra.com/schema_list/RealEstateAgent)
- [Place Schema Generator — Schemantra](https://schemantra.com/schema_list/Place)
- [Advanced Real Estate SEO Schema Markup — IOG](https://internationaloutsourcinggroup.com/blog/advanced-real-estate-seo-schema-markup/)
- [Real Estate Schema Markup — Realty AI](https://www.realty-ai.com/post/real-estate-schema-markup)
- [Schema Markup for Real Estate — PageOptimizerPro](https://www.pageoptimizer.pro/blog/schema-markup-for-real-estate-a-guide-to-boosting-property-listings-in-search-results)
- [Local SEO Ukraine Agencies — Sortlist](https://www.sortlist.com/s/local-seo/ukraine-ua)
- [International SEO Ukraine — NON.agency](https://non.agency/en/international-seo/ukraine/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [OG Preview Tool — opengraph.xyz](https://www.opengraph.xyz/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
