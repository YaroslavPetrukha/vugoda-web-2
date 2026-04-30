# Code Review — ВИГОДА web prototype
Дата: 2026-04-30
Reviewer: Code Reviewer agent
Verdict: **SHIP WITH FIXES** (нічого блокуючого; 2 Major, рекомендовані до правки перед хвилею 4)

## Підсумок
- **Lint** (`tsc --noEmit`): **PASS** — без помилок типів
- **Build** (`vite build`): **PASS** — 2115 модулів, 3.02s
  - HTML 1.08 KB (gz 0.61 KB)
  - **CSS 33.89 KB → gz 6.59 KB** ✅
  - **JS 463.67 KB → gz 136.49 KB** ✅ (лишилось у нормі: React 19 + motion + lucide + react-router важать ~130 KB gz baseline)
- Critical issues: **0**
- Major issues: **2**
- Minor / nits: **9**

Стек використано грамотно: HashRouter замість BrowserRouter (правильно для gh-pages, окремий 404.html не потрібен), `RouteObject[]` + `useRoutes`, nested layout через `<Outlet/>`, `NavLink` з рендер-функцією для active state. Lint чистий, build чистий, типи строгі (включно з discriminated union у `Button.tsx`).

---

## Critical (блокує деплой)
**Немає.**

---

## Major (треба виправити, але не блокує)

### 🟡 M1. Хардкод `/vugoda-web-2/` у 33 місцях замість `import.meta.env.BASE_URL`
**Файли:**
- `src/components/Logo.tsx:11` — `src="/vugoda-web-2/logo-dark.svg"`
- `src/components/PageHero.tsx:44` — `src="/vugoda-web-2/isometric-grid.svg"`
- `src/components/ProjectCard.tsx:50` — `src={`/vugoda-web-2${project.cardImage}`}`
- `src/pages/Home.tsx:64,71,154` — три хардкоди
- `src/pages/ProjectLakeview.tsx:35–73,88` — десятки шляхів у RENDERS / CONSTRUCTION_GROUPS
- `src/pages/ProjectEtnoDim.tsx:19,30`, `ProjectMaetok.tsx:18–19,29`, `ProjectNterest.tsx:22–24,34`
- `index.html:6` — `<link rel="icon" href="/vugoda-web-2/favicon.svg" />`

**Чому це Major.** `vite.config.ts:9` має `base: '/vugoda-web-2/'`, і Vite автоматично переписує тільки шляхи в `import`-ах і у CSS. Шляхи у `src=""` всередині JSX/TSX **Vite не переписує** — тому довелось хардкодити. Якщо репо переїде з `vugoda-web-2` на `vugoda` (або domain root), доведеться замінити 33 місця і у 14 файлах.

**Рекомендація.** Створити утиліту `src/utils/asset.ts`:
```ts
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
```
Замінити всі `/vugoda-web-2/foo.jpg` на `asset('/foo.jpg')`. Для `index.html` — використати `%BASE_URL%favicon.svg` (Vite його розкриє при build).

Можна відкласти на хвилю 4, але якщо це не виправити одразу — ризик «ой, забули один шлях» при першому ж change-base-path.

---

### 🟡 M2. Невикористані залежності у `package.json` ваготять prod build і збивають аудит
**Файл:** `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/package.json:13–24`

`@google/genai`, `express`, `dotenv` — **жодного імпорту у `src/`** (перевірено grep). Це залишки від scaffold (`metadata.json` згадує AI Studio template).

**Чому це Major.** 
1. `@google/genai` важить ~150 KB у `node_modules` і інколи tree-shaking лишає shim-и.
2. `express` + `dotenv` — серверні залежності для статичного сайту виглядають дивно при code review зі сторони (партнерський аудит, due diligence).
3. `vite.config.ts:12` досі визначає `process.env.GEMINI_API_KEY` — мертвий код у конфізі.

**Рекомендація.**
```bash
npm uninstall @google/genai express dotenv @types/express tsx
```
І прибрати `define: { 'process.env.GEMINI_API_KEY': ... }` з `vite.config.ts`.

`vite.config.ts:7` `loadEnv` теж стане непотрібним — спростити до `defineConfig({ base: '/vugoda-web-2/', plugins: [react(), tailwindcss()], resolve: {...} })`.

---

## Minor / Nits

### 💭 N1. `key={i}` для статичних списків — припустимо, але не ідеально
**Файли:**
- `src/pages/Approach.tsx:168` (NOT_DOING)
- `src/pages/Investors.tsx:119,143` (STEPS, RECEIVES)
- `src/pages/Partners.tsx:111,136,157` (LICENSES, FOR_BANKS, FOR_CONTRACTORS)
- `src/pages/Contacts.tsx:189` (LEGAL)
- `src/pages/ProjectPipeline04.tsx:79` (NO_NAME_REASONS)
- `src/pages/ProjectLakeview.tsx:161` (INFRA)

Ці масиви статичні (визначені на module-scope), тому `key={i}` не зашкодить. Але правило-гайдлайн каже про стабільні ключі. Підняти до коректного: `key={item.slug ?? item}` або `key={`${prefix}-${i}`}`. Низький пріоритет — це прототип, дані не реордеряться.

### 💭 N2. `FadeIn.tsx:8` декларує `key?: Key | null` у пропсах — це антипатерн
**Файл:** `src/components/FadeIn.tsx:1,8`

```tsx
import type { ReactNode, Key } from 'react';
...
type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  key?: Key | null;  // ← React автоматично інтерсептить, у проп ніколи не приходить
};
```

`key` — спеціальний React prop, його не можна декларувати в props (React видаляє його перед передачею). Прибрати поле і `Key` з імпорту.

### 💭 N3. Дублювання дизайн-патерна `gap-px bg-bg-surface border border-bg-surface` у grid-картках
Зустрічається ~15 разів по сторінках (Home, ProjectLakeview, Approach, Partners тощо). Це grid-trick для тонких ліній між картками. На цьому етапі ОК, але якщо клієнт захоче змінити стиль розділювача — буде 15 правок.

**Рекомендація (post-launch).** Винести у компонент `<DataGrid items={...} renderCell={...} />` або хоча б у CSS-клас у `index.css`.

### 💭 N4. `aspect-[4/5]` дубль у `ProjectCard.tsx:36–39`
```tsx
const aspect =
  v === 'featured' ? 'aspect-[16/10]'
  : v === 'placeholder' ? 'aspect-[4/5]'
  : 'aspect-[4/5]';
```
Дві гілки з тим самим значенням. Спростити: `v === 'featured' ? 'aspect-[16/10]' : 'aspect-[4/5]'`.

### 💭 N5. Повторювані `disclaimer` тексти у формах
У 8 викликах `<ContactForm>` — варіант «Натискаючи кнопку, ви погоджуєтесь...». Винести дефолт у `ContactForm.tsx:41` (вже є, але багато сторінок його перевизначають однаковим текстом).

### 💭 N6. Email/телефон розкидані у 5 файлах замість одного `data/contacts.ts`
```
vygoda.sales@gmail.com — у 6 файлах (NavBar, Footer, Home, Contacts, Investors, Partners)
vygoda.plus@gmail.com — у 2 файлах (Lakeview, Contacts)
+38 066 990 03 90 — у 2 файлах (Lakeview, Contacts)
ЄДРПОУ 42016395 — у 5 файлах (Footer, Home (двічі), Approach, Contacts, Investors, Partners, TrustStripe)
```

Зміна email-у потенційно вимагає правок у 6 файлах. На рівні прототипу — не критично, але радив би створити `src/data/company.ts`:
```ts
export const COMPANY = {
  name: 'ТОВ «БК ВИГОДА ГРУП»',
  edrpou: '42016395',
  license: 'від 27.12.2019',
  email: 'vygoda.sales@gmail.com',
  lakeview: { phone: '+38 066 990 03 90', email: 'vygoda.plus@gmail.com' },
};
```

### 💭 N7. `index.html` — Google Fonts завантаження блокує render
**Файл:** `index.html:9–11`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet">
```

Має `display=swap` — це OK. Але для GitHub Pages з offline-юзерами і LCP-budget краще або:
- (a) self-host Montserrat у `public/fonts/` з `@font-face` і `font-display: swap`;
- (b) додати `media="print" onload="this.media='all'"` фолбек.

Не блокує, але впливає на LCP/CLS на slow networks.

### 💭 N8. `ProjectCard.tsx:50` — `loading="lazy"` стоїть, але hero-зображення на сторінках проектів — без `fetchpriority="high"`
**Файли:** `src/components/PageHero.tsx:32`, `src/pages/Home.tsx:65`

Hero `<img>` повинен бути `loading="eager" fetchpriority="high"` для кращого LCP. У `PageHero.tsx` не вказано взагалі — браузер дефолтно eager, що не зле, але без `fetchpriority` на `aerial.jpg` (1.5 MB на Home hero) є хвилинна затримка LCP.

**Рекомендація.** У `PageHero.tsx:31`:
```tsx
<img
  src={image}
  alt={imageAlt}
  loading="eager"
  fetchPriority="high"
  className="absolute inset-0 w-full h-full object-cover opacity-40"
/>
```

### 💭 N9. `ProjectGalleryStrip.tsx:33` — `key={`${img.src}-${i}`}` коли `img.src` уже унікальний
Можна спростити до `key={img.src}`. Дрібниця.

---

## Що зроблено правильно

1. **Discriminated union у `Button.tsx:15–42`** — три типи (button/anchor/Link) з `as` прапорцем і per-variant полями. Чистий TS-патерн, який не дозволяє передати `href` у `<button>` і навпаки. Молодець, хто це зробив.
2. **HashRouter + `useRoutes` + nested `Layout` + `<Outlet/>`** — каноніка react-router v7. Зовсім без надлишків.
3. **Дані відокремлені від UI** (`src/data/projects.ts`, `news.ts`) і друкуються через хелпери (`getProjectBySlug`). Один кейс шукання `find((p) => p.slug === 'lakeview')!` (Home, Portfolio) — припустимо, бо дані статичні.
4. **A11y базово коректне:**
   - `<button aria-expanded aria-controls aria-label>` для гамбургера (`NavBar.tsx:74–83`)
   - `aria-modal role="dialog" aria-label` на mobile menu (`NavBar.tsx:87–93`)
   - Esc-handler і `overflow:hidden` на body для модалки
   - `:focus-visible` ring у `index.css:44–51`
   - `<dl><dt><dd>` для параметрів проектів — це правильна семантика
   - `<time dateTime>` у `NewsCard.tsx:25`
   - `prefers-reduced-motion` глобально у `index.css:58–65` ✅
5. **`viewport={{ once: true, margin: '-50px' }}`** у `FadeIn.tsx:15` — анімація грається один раз, не перезапускається при скролі назад. Точно як треба.
6. **Layout scroll-to-top на route change** (`Layout.tsx:9–11`) — стандартний react-router-pattern.
7. **Декомпозиція адекватна:** найбільший компонент 322 рядки (ProjectLakeview), середнє по компонентах 110 рядків. Жодного God-Component-а. ContactForm ~260 рядків — ок, бо це гнучка форма з 7 опціональними полями і чесно лінійний код.

---

## Recommendations for Wave 4 (deploy)

1. **Перед деплоєм виправити M2** (видалити `@google/genai`, `express`, `dotenv` і `GEMINI_API_KEY` define). Це 5 хвилин, але чистить виглядання у `package.json` для будь-кого, хто буде дивитися репо.
2. **Якщо є запас — виправити M1** (BASE_URL утиліта). Інакше — лишити як є, але не змінювати `base` у `vite.config.ts`. Якщо clinet вирішить переїхати з `/vugoda-web-2/` на корінь — це буде 33 місцями find-replace.
3. **GitHub Pages workflow:** треба налаштувати CI (`.github/workflows/deploy.yml`) з `npm ci && npm run build && actions-pages-deploy`. Базовий шлях у Vite вже стоїть — тому артефакт `dist/` працюватиме на `https://<user>.github.io/vugoda-web-2/`.
4. **HashRouter і відсутність 404.html** — це не проблема, бо HashRouter маршрутизує client-side і GitHub Pages віддає корінь. Але для SEO це програш; якщо буде завдання індексувати — переходити на BrowserRouter і додавати `404.html` копію `index.html`.
5. **Перед деплоєм** перевірити Lighthouse: я очікую LCP 2.5–3 s через 1.5 MB hero на Home (`aerial.jpg`). Або стиснути до < 400 KB, або додати `fetchPriority="high"` (N8).
6. **Не забути favicon.svg перевірити після зміни base path** — це єдине посилання у `index.html` на `/vugoda-web-2/favicon.svg`, яке не керується JSX-компонентами.

---

## Приклад патчу (M1 — найбільший impact)

```ts
// src/utils/asset.ts
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const asset = (p: string) => `${BASE}${p.startsWith('/') ? p : `/${p}`}`;
```

```tsx
// src/components/Logo.tsx
import { asset } from '../utils/asset';
// ...
<img src={asset('/logo-dark.svg')} alt="Вигода" ... />
```

Час на повний рефакторинг: ~30 хвилин, бо 33 місця, всі однотипні.
