# SSG/Router Migration Research

**Дата:** 2026-05-18
**Автор:** Software Architect (research mode)
**Проєкт:** vugoda-web-2 — корпоративний сайт забудовника «ВИГОДА» (Львів)
**Мета:** обрати стратегію SSG + `BrowserRouter` для деплою на Cloudflare Pages

---

## Поточний стан (з коду)

### Стек
- **Vite 6.2** + **React 19.0** + **react-router-dom 7.14.2** + **TypeScript 5.8** + **Tailwind 4.1**
- **Анімації:** `motion@12.23.24` (Framer Motion), `MotionConfig reducedMotion="user"` в `src/main.tsx`
- **Іконки:** `lucide-react`

### Архітектура роутингу (БЛОКЕР для SEO)
- `src/App.tsx` — обгортка `<HashRouter><AppRoutes /></HashRouter>`
- `src/main.tsx` — створює root через `createRoot(...).render(<MotionConfig><App /></MotionConfig>)`
- `src/routes.tsx` — **declarative `RouteObject[]`**, який передається в `useRoutes()` (data mode, але без `createBrowserRouter`)
- `src/components/Layout.tsx` — спільний layout (NavBar + `<Outlet />` + Footer) з `useEffect(() => window.scrollTo(0,0), [location.pathname])`

### Сторінок: 13
- `/` Home
- `/pidkhid` Approach
- `/portfolio` + 5 проєктних: `lakeview`, `etno-dim`, `maetok`, `nterest`, `pipeline-04`
- `/investoram`, `/partneram`, `/kontakty`, `/novyny`
- `*` NotFound
- **Усі шляхи статичні** — жодного `:slug`. Pre-render списком — тривіальний.

### `vite.config.ts`
- `base: '/vugoda-web-2/'` (для GitHub Pages) — **треба замінити на `'/'`** для Cloudflare Pages, бо CF Pages віддає сайт з кореня домену.
- Плагіни: `@vitejs/plugin-react`, `@tailwindcss/vite`.

### `index.html`
- Один `<title>` і один `<meta description>` на всі сторінки.
- Завантажує Google Fonts (Montserrat) через `<link rel="stylesheet">` — `preconnect` є.
- Жодних `og:*`, `twitter:*`, `canonical`, JSON-LD.

### Чому це блокує SEO
1. `HashRouter` → URL виду `/#/portfolio/lakeview`. Google технічно індексує SPA, але краулинг-бюджет витрачається на JS, шанс на повноцінну індексацію та потрапляння в AI Overviews / Perplexity — низький.
2. Всі сторінки мають однакові `<title>` + `<meta description>` → каноально неможливо ранжуватись по різних запитах.
3. Соц-превʼюшки (Telegram, Facebook, LinkedIn) показують один і той самий блок на всі URL.

---

## Опції міграції

### Опція A: vite-react-ssg (Daydreamer-riri)

**Версія:** v0.9.0 (опубліковано 2026-02-05).
**Принцип:** обгортка над Vite SSR API, яка робить static prerender для роутів `react-router-dom`.

#### Як працює
```ts
// src/main.tsx
import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';

export const createRoot = ViteReactSSG({ routes });
```
- Скрипти: `"build": "vite-react-ssg build"`, `"dev": "vite-react-ssg dev"`.
- Meta-теги через власний `<Head />` компонент (обгортка `react-helmet-async`).
- Підтримує існуючий формат `RouteObject[]` — **точно як у нас зараз**.

#### Pros
- **Мінімальна зміна структури коду.** `routes.tsx`, `Layout.tsx`, всі `pages/*.tsx` залишаються майже без змін.
- Працює з data routes, не змушує переписувати на file-based роутинг.
- Власний `<Head>` API — простий, працює per-route.
- Виплювати чисті статичні `index.html` файли — нативна функція.

#### Cons (КРИТИЧНІ)
- **Офіційний disclaimer в репо:** *"React Router v7 now has built-in SSG support. If you are using React Router v7, we recommend using its official SSG capabilities."* Тобто maintainer сам перенаправляє на RR v7.
- **React 19** — у roadmap, **не реалізовано** на v0.9.0. Hydration з React 19 може мати edge-cases (особливо з `motion`).
- Реальне співтовариство — нішеве: один основний maintainer, повільніший release cycle (~3-4 рази на рік).
- `<Head />` через `react-helmet-async` — додаткова залежність, яку React 19 робить непотрібною (нативні `<title>` / `<meta>` тепер автоматично переносяться в `<head>`).

#### Effort migration
- ~3 файли (`main.tsx`, `package.json` scripts, можна залишити `App.tsx`, але краще прибрати `HashRouter`).
- Додати `<Head>` у кожну з 13 сторінок (≈13 файлів).
- **Реальний effort:** ~16 файлів, ~2-3 години.

---

### Опція B: React Router v7 framework mode (офіційний)

**Принцип:** RR v7 — це Remix-у-новій-обгортці. Framework mode = file-based routes + `react-router.config.ts` + auto-prerender.

#### Як працює
```ts
// react-router.config.ts
import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  ssr: false,           // без рантайм-сервера
  prerender: true,      // pre-render всіх статичних шляхів
} satisfies Config;
```
```ts
// vite.config.ts
import { reactRouter } from '@react-router/dev/vite';
export default defineConfig({ plugins: [reactRouter(), tailwindcss()] });
```
```ts
// src/routes.ts (новий формат)
import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  layout('components/Layout.tsx', [
    index('pages/Home.tsx'),
    route('pidkhid', 'pages/Approach.tsx'),
    route('portfolio', 'pages/Portfolio.tsx'),
    route('portfolio/lakeview', 'pages/ProjectLakeview.tsx'),
    // ...
    route('*', 'pages/NotFound.tsx'),
  ]),
] satisfies RouteConfig;
```
```tsx
// src/root.tsx (новий, обовʼязковий)
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() { return <Outlet />; }
```
```tsx
// src/entry.client.tsx (новий, обовʼязковий)
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { MotionConfig } from 'motion/react';

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <MotionConfig reducedMotion="user">
        <HydratedRouter />
      </MotionConfig>
    </StrictMode>
  );
});
```

#### Meta API (per-route)
```tsx
// src/pages/ProjectLakeview.tsx
import type { Route } from './+types/ProjectLakeview';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'ЖК Lakeview — Львів | ВИГОДА' },
    { name: 'description', content: 'ЖК Lakeview...' },
    { property: 'og:title', content: 'ЖК Lakeview — Львів' },
    { property: 'og:image', content: 'https://vygoda.com/og/lakeview.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];
}

export default function ProjectLakeview() { /* існуючий компонент */ }
```

#### Pros
- **Офіційне рішення від команди React Router.** Підтримка гарантована (Remix-team у Shopify).
- React 19 повністю підтримується.
- `MetaFunction` тип-сейф, інтегрується з `loader` (хоча у нас loader не потрібен).
- `prerender: true` + `ssr: false` → видає чисті `*.html` у `build/client/` → ідеальний для Cloudflare Pages (drag-n-drop або wrangler).
- Автоматичне code-splitting per-route.
- Майбутнє: легко додати SSR, ISR, server actions, якщо колись захочемо динамічну форму contact-page.
- Документація і приклади на Cloudflare Pages вже є (m12u.com — повна стаття 2025).

#### Cons
- **Більший рефактор.** Треба:
  - Створити `root.tsx`, `entry.client.tsx`, `react-router.config.ts`.
  - Замінити `src/routes.tsx` (RouteObject[]) на `src/routes.ts` (file-based RouteConfig).
  - Перенести логіку з `index.html` → у `root.tsx` (preconnect-и до Google Fonts, favicon).
  - Видалити `src/App.tsx` і `src/main.tsx` у нинішньому вигляді.
- `Layout.tsx` залишається, але буде обгорнутий через `layout(...)` в routes.ts.
- Build-команда змінюється: `react-router build` (через `@react-router/dev`).
- Потрібно тримати в голові: `<a>` теги на зовнішні ресурси, або `<Link>` для внутрішніх — RR v7 сам hydrate-ить навігацію.
- **Caveat для Cloudflare:** офіційний `@cloudflare/vite-plugin` НЕ підтримує prerender (потрібен для Workers SSR). Але для **чисто статичного** деплою на CF Pages це не проблема — просто `npm run build` → upload `build/client/`.
- Динамічних шляхів немає → `prerender: true` працює "з коробки".

#### Effort migration
- ~6 нових файлів (`root.tsx`, `entry.client.tsx`, `react-router.config.ts`, новий `routes.ts`, оновлений `vite.config.ts`, оновлений `package.json`).
- Видалити: `App.tsx`, старий `main.tsx`.
- Додати `export function meta(...)` у 13 сторінок.
- `Layout.tsx` — потрібно прибрати з нього `<NavBar />` всередину окремого route layout або залишити як є + переконатися, що `Outlet` працює.
- **Реальний effort:** ~22 файли, ~4-6 годин (плюс перший build + debug hydration).

---

### Опція C: vite-plugin-prerender / vite-ssg (puppeteer-based або general purpose)

#### vite-plugin-prerender (puppeteer)
- Запускає headless Chromium після `vite build`, обходить кожен URL, дампає DOM в `index.html`.
- **Pros:** працює з будь-яким SPA-кодом без рефактору. Підтримує `motion` без зусиль (анімації виконуються у Chromium → отриманий HTML вже має фінальний DOM).
- **Cons:**
  - Стара технологія (фактично — `prerender-spa-plugin` під Vite).
  - Низька активність у 2025-2026 (останні релізи рідко).
  - Build повільний (5-15 хв для 13 сторінок з Puppeteer на CI).
  - Hydration mismatch — гарантовано буде "сюрприз" з `motion`, бо у DOM вже застиглі трансформи з анімацій.
  - Не дає чистого `meta`-API — треба `react-helmet-async` зверху.
- **Effort:** ~5 файлів, але **тонна боротьби з hydration warnings**.

#### vite-ssg (від @antfu, Vue-orient)
- Generic SSG, але офіційно для Vue. React-форк = `vite-react-ssg` (Опція A).
- Не маємо сенсу розглядати окремо.

#### Вердикт по C
- `vite-plugin-prerender` — антипатерн у 2026, коли є офіційний RR v7.
- Розглядати тільки як аварійний fallback, якщо щось у RR v7 зламає `motion` (малоймовірно).

---

## Meta-tags стратегія

### react-helmet-async — НЕ ПОТРІБЕН
- React 19 нативно піднімає `<title>`, `<meta>`, `<link>` у `<head>` — навіть з компонента глибоко у дереві.
- Тобто варіант "просто додати `<title>{...}</title>` у компонент сторінки" — працює в SPA-режимі без жодних бібліотек.
- **АЛЕ:** у SSG-режимі (build-time render) React 19 hoist працює лише якщо renderer бачить ці теги. RR v7 `MetaFunction` гарантує, що теги попадуть у HTML на етапі build.

### Рекомендація: гібрид
| Випадок | Що використовувати |
|---|---|
| Статичні теги per route (title, description, og:*, twitter:*) | `export function meta()` у RR v7 framework mode |
| Динамічні теги, що залежать від клієнтського state (рідко) | Нативні React 19 `<title>`, `<meta>` у JSX |
| `<link rel="canonical">`, `<meta name="robots">` | `meta()` + `Route.MetaArgs.location.pathname` |
| Schema.org JSON-LD | `meta()` повертає `{ "script:ld+json": {...} }` (RR v7 підтримує) |

### Підсумок: react-helmet-async — **архаїчно**, не потрібно. `MetaFunction` + React 19 native = достатньо.

---

## РЕКОМЕНДАЦІЯ

### Опція B: React Router v7 framework mode

**Чому:**

1. **Офіційна підтримка.** Maintainer `vite-react-ssg` сам рекомендує RR v7. У 2026 нема сенсу йти в нішевий плагін, коли є first-party.
2. **React 19 first-class.** `MetaFunction` + native hoisting працюють разом без `react-helmet-async`.
3. **Чистий static output.** `ssr: false` + `prerender: true` → 13 HTML файлів у `build/client/` → drag-n-drop на CF Pages.
4. **Reversibility.** Якщо завтра захочемо динамічну форму (контакти через CF Worker), просто додаємо `action()` у потрібний route і перемикаємо `ssr: true`. Жоден існуючий компонент не зламається.
5. **Майбутнє платформи.** RR v7 — це фундамент для усього React-eco (Vercel, Shopify, Cloudflare). Інвестиція в нішевий плагін — borrowed time.
6. **`motion` сумісність.** Framework mode використовує стандартний React 19 hydration через `HydratedRouter`. `MotionConfig` обгортає в `entry.client.tsx`. Anti-hydration трюки (`'use client'`) — не потрібні, бо це не Next.js. Жодних React Server Components → жодних "createContext not found" помилок.

### Контр-аргумент (чесно)
- Опція A (`vite-react-ssg`) дала би результат на ~2 години швидше. Але це **технічний борг через 6 міс**, коли v0.9.0 не дочекається React 19 hydration fixes, а проект почне рости (новини, динамічні слаги).
- Опція B = ~4 додаткові години **зараз**, які зекономлять ~20 годин **через рік**.

### Альтернативна позиція (якщо клієнт хоче МАКСИМУМ швидкості)
Якщо стек "заморожений" і ми хочемо мінімум змін **сьогодні** — Опція A. Але я не рекомендую — це передбачуваний legacy через 6 міс.

---

## Файли, які треба змінити (Опція B)

### Створити (нові)
1. `/web-design/react-router.config.ts` — `{ ssr: false, prerender: true, appDirectory: 'src' }`
2. `/web-design/src/root.tsx` — HTML shell + `<Meta />`, `<Links />`, `<Scripts />`, `<ScrollRestoration />`, винести `lang="uk"`, favicon, Google Fonts preconnect з `index.html`
3. `/web-design/src/entry.client.tsx` — `hydrateRoot(document, <StrictMode><MotionConfig><HydratedRouter /></MotionConfig></StrictMode>)`
4. `/web-design/src/routes.ts` — новий формат `RouteConfig` з `layout()` + `index()` + `route()`

### Видалити
5. `/web-design/src/App.tsx` (більше не потрібен — `HydratedRouter` робить його роботу)
6. `/web-design/src/main.tsx` (замінюється на `entry.client.tsx`)
7. `/web-design/src/routes.tsx` (замінюється на `routes.ts`)
8. `/web-design/index.html` (RR v7 генерує HTML з `root.tsx`)

### Модифікувати
9. `/web-design/vite.config.ts` — додати `reactRouter()` плагін, прибрати `base: '/vugoda-web-2/'` (або змінити на `'/'` для CF Pages), розібратися з `@` alias, який зараз вказує на корінь проєкту (можливо, треба змінити на `src`)
10. `/web-design/package.json` — додати `@react-router/dev`, `@react-router/node`, `@react-router/fs-routes` (опційно), змінити scripts: `"dev": "react-router dev"`, `"build": "react-router build"`, `"preview": "react-router-serve ./build/server/index.js"` (для preview, якщо потрібно)
11. `/web-design/src/components/Layout.tsx` — залишається, але стає route component (експортується default + опційно `Layout` named export). `useEffect(scrollTo)` можна замінити на `<ScrollRestoration />` у `root.tsx`.
12. `/web-design/src/components/NavBar.tsx` — перевірити, що `<Link>` з `react-router-dom` працює (має працювати без змін, RR v7 експортує і з `react-router`, і з `react-router-dom`)
13-25. `/web-design/src/pages/*.tsx` (13 файлів) — додати `export function meta(args: Route.MetaArgs) { return [...] }` з title/description/og:*/twitter:* per page

### Конфіг для деплою
26. `/web-design/_headers` або CF Pages dashboard — security headers (CSP, HSTS, X-Frame-Options)
27. `/web-design/_redirects` — `*` → `/404.html` 404 (RR v7 згенерує статичний `404.html` з NotFound)
28. `/web-design/public/robots.txt` — `Allow: /`, лінк на sitemap
29. `/web-design/public/sitemap.xml` — згенерувати list із 13 URLs (можна вручну, або post-build скриптом)

**Підсумок:** ~12 модифікацій + 4 нові + 4 видалити = ~20 файлів реально торкаємось. Сторінкові компоненти (JSX/Tailwind) — без змін крім додавання `meta()`.

---

## Ризики

1. **`motion` hydration warnings.** `motion.div` з `initial={{ opacity: 0 }}` рендериться на build-time з `opacity: 0`, потім client hydrate-ить і додає трансформи. У 99% випадків працює; залишковий 1% — приглушити `suppressHydrationWarning` на motion-компонентах або обгорнути в `<ClientOnly>` HOC. **Мітигація:** перевірити кожну з 6 проєктних сторінок після першого build.
2. **`base: '/vugoda-web-2/'` сумісність.** Якщо переходимо на CF Pages з кореня домену → треба прибрати `base`. Але всі hard-coded шляхи виду `/vugoda-web-2/projects/lakeview/aerial.jpg` у `ProjectLakeview.tsx` стануть нечинні. **Мітигація:** глобальний find/replace `/vugoda-web-2/` → `/` АБО зберегти ту саму базу і перенести assets у відповідну папку. Перевага find/replace.
3. **Google Fonts blocking CSS.** Зараз стиль завантажується `<link href=".../css2?family=Montserrat">` з `index.html`. У RR v7 переноситься у `root.tsx`. Працює, але блокує перший рендер. **Мітигація:** self-host шрифт або використати `next/font`-аналог; альтернативно — `fontsource/montserrat` як npm-пакет (рекомендую).
4. **`@` alias у `vite.config.ts`.** Зараз `@` = `path.resolve(__dirname, '.')` (тобто корінь проєкту). У RR v7 framework mode `appDirectory: 'src'` змінює baseline. **Мітигація:** перевірити, чи alias десь використовується (`grep -r "from '@/"` у src). Якщо так — переналаштувати на `src`.
5. **Cloudflare Pages vs Workers плутанина.** CF тепер штовхає в Workers для RR v7 full-stack. Але **ми робимо чистий static** — це `build/client/` deploy на Pages, не Workers. Не дозволити CF wizard-у наплутати: не використовувати `@cloudflare/vite-plugin`, не вмикати `wrangler.toml`. Просто Pages з командою `npm run build` і output dir `build/client`.

### Бонус-ризик
6. **`ScrollRestoration` vs `useEffect(scrollTo)`.** RR v7 має нативний `<ScrollRestoration />`, який намагається відновити скрол на back-button. Поточний код у `Layout.tsx` форсує `scrollTo(0,0)` на КОЖНУ навігацію. **Мітигація:** замінити на `<ScrollRestoration getKey={(location) => location.pathname} />` для коректної поведінки (нова сторінка = top, back = restore).

---

## Sources

- [vite-react-ssg на npm](https://www.npmjs.com/package/vite-react-ssg)
- [vite-react-ssg GitHub (Daydreamer-riri)](https://github.com/Daydreamer-riri/vite-react-ssg)
- [React Router v7 Pre-rendering docs](https://reactrouter.com/how-to/pre-rendering)
- [React Router v7 Rendering Strategies](https://reactrouter.com/start/framework/rendering)
- [React Router v7 Route Module (meta export)](https://reactrouter.com/start/framework/route-module)
- [React Router v7 Migration from RouterProvider](https://reactrouter.com/upgrading/router-provider)
- [React Router v7 MetaFunction API](https://api.reactrouter.com/v7/interfaces/react-router.MetaFunction.html)
- [Deploying React Router v7 SSG to Cloudflare Pages (m12u.com)](https://m12u.com/blog/deploy-rr7-ssg-site/)
- [Cloudflare Workers React Router framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)
- [Framer Motion + React 19 SSR guide 2026 (inhaq.com)](https://inhaq.com/blog/framer-motion-complete-guide-react-nextjs-developers.html)
- [LogRocket — SSR with React Router v7](https://blog.logrocket.com/server-side-rendering-react-router-v7/)
- [Vintasoftware — Vite + React SSG/SSR overview](https://www.vintasoftware.com/blog/vite-react-ssg-ssr)
