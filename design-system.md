# ВИГОДА — Design System Specification

> **Призначення:** канонічна специфікація для імплементації клікабельного прототипу корпоративного сайту ТОВ "БК Вигода Груп". Виконується Frontend Developer.
> **Стек (фіксований):** React 19 + Vite 6 + Tailwind v4 (`@theme`) + motion/react + lucide-react. **Не змінювати.**
> **Джерело правди для дизайну:** `CONTEXT.md` §1.4 (брендбук) + затверджений концепт `src/App.tsx`.
> **Принцип:** інженерна ясність, не "преміум-золото". Кутова геометрія, точкові акценти, без декору.

---

## 0. Швидкий чеклист розбіжностей (must-fix перед усім іншим)

| # | Було (поточно в `App.tsx` / `index.css`) | Стало | Причина |
|---|------------------------------------------|-------|---------|
| 1 | `--color-bg-base: #2a3038`, `--color-bg-alt: #1e2329`, `--color-bg-dark: #000000` | `--color-bg-base: #2F3640`, `--color-bg-surface: #3D3B43`, `--color-bg-deep: #020A0A` | Брендбук палітра |
| 2 | Кастомний 3-circle SVG-логотип у компоненті `Logo` | `<img src="/logo-dark.svg" />` (скопіювати з `brand-assets/logo/dark.svg` у `web-design/public/logo-dark.svg`) | Офіційний логотип |
| 3 | `rounded-full`, `rounded-[2rem]`, `rounded-2xl` | `rounded-none` (0) або `rounded-sm` (2px) max | Брендбук виключає круглі форми |
| 4 | Hero JSX-плейсхолдери: `ЖК Центральний`, `ЖК Резиденція Захід`, `Комплекс Парковий` | Реальні дані з `CONTEXT.md` §2 (Lakeview, Етно Дім, Маєток Винниківський, NTEREST, безіменний) — **через `data/projects.ts`, не у JSX** | Канонічний фактаж |
| 5 | Картка зі статусом "ЗДАНО" | Прибрати. Використовувати лише `Будівництво`, `Меморандум`, `Кошторис`, `Дозвільна` (0 зданих) | §2.0 портфель |
| 6 | Hero widget "ROI 18%" / "Готовність 65%" / прогрес-бар | Прибрати. Замість — `TrustStripe` з ЄДРПОУ, ліцензія, монолітно-каркас, 4 проекти у роботі | ToV "без прайс-комунікації" §9 |
| 7 | Меню з 3 пунктів (Проєкти / Цінності / Контакт) | 5 пунктів: Проєкти / Як ми будуємо / Про компанію / Новини / Контакт | Структура сайту |
| 8 | Hero CTA `bg-text-primary` (білий) | `bg-accent` (acid-lime) — primary action завжди лайм | Брендбук CTA-логіка |

---

## 1. Tokens (`src/index.css`)

Замінити поточний файл повністю:

```css
@import "tailwindcss";

@theme {
  /* === BRAND PALETTE (брендбук, закрита) === */
  --color-bg-base: #2F3640;        /* головний темний фон, body */
  --color-bg-surface: #3D3B43;     /* антрацит — картки, поверхні, hover-стани */
  --color-bg-deep: #020A0A;        /* глибокий чорний — header, hero overlay */
  --color-accent: #C1F33D;         /* acid-lime, ТІЛЬКИ point-use: CTA, active, focus */
  --color-text-primary: #F5F7FA;   /* основний текст */
  --color-text-secondary: #A7AFBC; /* допоміжний сірий, lead, captions */
  --color-text-muted: #A7AFBC;     /* alias на text-secondary, для семантики */

  /* === TYPOGRAPHY === */
  --font-sans: "Montserrat", system-ui, sans-serif;

  /* === RADII (брендбук виключає круглі форми) === */
  --radius-none: 0;
  --radius-sm: 2px;
  --radius-md: 4px;       /* MAX для UI-елементів */

  /* === SPACING (4/8 grid) === */
  --space-section: 8rem;     /* py-32: hero, projects, values */
  --space-section-sm: 4rem;  /* py-16: news strip, trust stripe */

  /* === SHADOWS (мінімалістичні) === */
  --shadow-sm: 0 1px 2px 0 rgba(2, 10, 10, 0.4);
  --shadow-md: 0 4px 12px -2px rgba(2, 10, 10, 0.5);
}

@layer base {
  body {
    background-color: var(--color-bg-base);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* Focus-visible ring глобально (a11y) */
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* Прибираємо дефолтний focus для миші */
  :focus:not(:focus-visible) { outline: none; }

  ::selection {
    background-color: var(--color-accent);
    color: var(--color-bg-deep);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

### 1.1 Type scale (Tailwind utility-классы; без custom CSS)

| Token | Tailwind | font-size | line-height | letter-spacing | weight |
|-------|----------|-----------|-------------|----------------|--------|
| `display` | `text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-tight font-bold` | 48–112px (clamp) | 0.95 | -0.02em | 700 |
| `h1` | `text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight font-bold` | 40–72px | 1.05 | -0.015em | 700 |
| `h2` | `text-3xl md:text-5xl leading-[1.1] tracking-tight font-bold` | 30 / 48px | 1.1 | -0.01em | 700 |
| `h3` | `text-xl md:text-2xl leading-snug font-bold` | 20 / 24px | 1.3 | 0 | 700 |
| `body-lg` | `text-lg leading-relaxed` | 18px | 1.6 | 0 | 400 |
| `body` | `text-base leading-relaxed` | 16px | 1.6 | 0 | 400 |
| `small` | `text-sm leading-normal` | 14px | 1.45 | 0 | 400/500 |
| `caption` | `text-xs uppercase tracking-[0.18em] font-medium` | 12px | 1.4 | 0.18em | 500 |
| `eyebrow` | `text-xs font-mono tracking-widest text-accent uppercase` | 12px | 1 | wider | 500 |

`font-mono` для eyebrow (`// 02`) — Tailwind дефолтний `ui-monospace` системний; додаткова Google-Font не потрібна.

### 1.2 Spacing scale

База 4px. Tailwind дефолтний скейл (`gap-2` = 8px, `p-6` = 24px, `py-32` = 128px).

- **Section padding:** `py-32` (128px) для великих секцій (hero, projects, values), `py-16` (64px) для компактних (trust stripe, news strip).
- **Container:** `max-w-7xl mx-auto px-6 lg:px-8` — підтверджено, лишаємо.
- **Component gaps:** карточки в grid `gap-px` (1px роздільник на тлі `bg-bg-surface`) АБО `gap-6` (24px).

### 1.3 Radii — критичне правило

**Default = `rounded-none`.** Дозволено `rounded-sm` (2px) для inputs/buttons за бажанням. **Заборонено** `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`.

Виключення: `IsometricCubePlaceholder` SVG — куби wireframe мають гострі кути за замовчуванням.

### 1.4 Shadows

- Картки на світлому тлі — `shadow-none` (використовуємо border `border-bg-surface`).
- Overlay-картки на hero / project images — `backdrop-blur-md bg-bg-deep/70 border border-bg-surface/50`. **Прозорість 70%** (не 80%, як у поточному концепті — нова палітра темніша).

---

## 2. Components

Усі компоненти — **функціональні React-компоненти у `src/components/`**, по одному файлу. ARIA-атрибути обов'язкові де вказано.

### 2.1 `<Logo />`

**Файл:** `src/components/Logo.tsx`. **Прибираємо кастомний SVG з App.tsx.**

```tsx
type LogoProps = { size?: 40 | 56; className?: string };

export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <a href="/" aria-label="Вигода — на головну" className={`inline-flex items-center ${className}`}>
      <img
        src="/logo-dark.svg"
        alt="Вигода — системний девелопмент"
        width={size === 40 ? 160 : 224}
        height={size}
        className="block"
      />
    </a>
  );
}
```

Логотип містить вордмарк "ВИГОДА" + дескриптор "СИСТЕМНИЙ ДЕВЕЛОПМЕНТ" — окремих текстових елементів поруч **не додаємо**. Aspect ratio `dark.svg` ≈ 4:1, тому ширина обчислюється від висоти.

**Setup-крок:** `cp brand-assets/logo/dark.svg web-design/public/logo-dark.svg` (виконати руками; файл уже є в репо).

### 2.2 `<Button />`

**Variants:** `primary` | `secondary` | `ghost` | `link`. **Sizes:** `sm` | `md` | `lg`.

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  as?: 'button' | 'a';
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
};
```

**Базові класи (всі варіанти):**
`inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider rounded-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`

| Variant | Class | Hover | Active |
|---------|-------|-------|--------|
| `primary` | `bg-accent text-bg-deep font-bold` | `hover:bg-text-primary` | `active:bg-accent active:translate-y-px` |
| `secondary` | `bg-text-primary text-bg-deep font-bold` | `hover:bg-accent` | `active:translate-y-px` |
| `ghost` | `border border-text-primary text-text-primary bg-transparent` | `hover:border-accent hover:text-accent` | — |
| `link` | `text-text-primary underline underline-offset-4 decoration-accent decoration-1 px-0` | `hover:text-accent` | — |

| Size | Padding + text |
|------|----------------|
| `sm` | `px-4 py-2 text-xs` |
| `md` | `px-6 py-3 text-sm` |
| `lg` | `px-8 py-4 text-sm` |

ARIA: якщо `as="a"` без видимого тексту (іконка-only) — обов'язковий `aria-label`. `disabled` на `<a>` → `aria-disabled="true"` + `tabIndex={-1}`.

### 2.3 Form fields

**Стиль:** underline-only (як у поточному `App.tsx`). Без border-box.

```tsx
// Input / Tel / Email
<label className="flex flex-col gap-2">
  <span className="text-xs uppercase tracking-widest text-text-secondary">
    Імʼя <span className="text-accent" aria-hidden="true">*</span>
  </span>
  <input
    type="text"
    required
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "field-error" : undefined}
    placeholder="Як до вас звертатися"
    className="bg-transparent border-b border-bg-surface pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent disabled:opacity-50 rounded-none"
  />
  {hasError && (
    <span id="field-error" role="alert" className="text-xs text-accent">
      Поле обовʼязкове для заповнення
    </span>
  )}
</label>
```

**Textarea:** додатково `resize-none rows={4}`.
**Select:** не використовуємо у v1 (заздалегідь не потрібно).

**States:**
- default — `border-bg-surface`
- focus — `border-accent` (без glow/ring; underline тільки)
- error — `border-accent` + текст помилки (нижче, `text-xs`)
- disabled — `opacity-50 cursor-not-allowed`

Placeholder українською, інструктивний (не рекламний): `"Як до вас звертатися"`, `"+380 ..."`, `"Опишіть запит"`.

### 2.4 `<ContactForm />`

**Контракт пропсів:**
```tsx
type ContactFormProps = {
  heading: string;             // "Ініціювати діалог"
  description?: string;        // "Залиште заявку — звʼяжемося протягом 2 годин."
  fields?: Array<'email' | 'message'>;  // додаткові; завжди є name+phone
  submitLabel?: string;        // default "Надіслати запит"
  source: string;              // для аналітики: 'home-hero' | 'project-lakeview' | etc.
};
```

**Завжди:** `name` (text, required), `phone` (tel, required). Додаткові — за пропсом.

**Privacy line (під кнопкою):**
```
Натискаючи кнопку, ви погоджуєтесь із <a href="/privacy" className="underline decoration-accent">політикою конфіденційності</a>.
```

**Layout:** `<form>` → `<fieldset>` (без `<legend>` візуального — тільки `aria-labelledby` на heading). Сітка `grid grid-cols-1 md:grid-cols-2 gap-8` для name+phone у ряд.

`onSubmit` — `e.preventDefault()` + console.log payload (заглушка для прототипу).

### 2.5 `<ProjectCard />`

**Variants:** `featured` (Lakeview, hero-карта), `default` (Етно Дім / Маєток / NTEREST з рендерами), `placeholder` (безіменний, з `IsometricCubePlaceholder` замість фото).

```tsx
type ProjectCardProps = {
  variant: 'featured' | 'default' | 'placeholder';
  title: string;               // "ЖК Lakeview"
  location: string;            // "вул. В. Великого, 2А, Львів"
  stage: 'construction' | 'memorandum' | 'estimate' | 'permit';
  image?: string;              // не для placeholder
  href: string;                // "/proekty/lakeview" або external
  external?: boolean;          // true для Lakeview (свій сайт)
};
```

**Базова обгортка (всі варіанти):**
`relative block overflow-hidden bg-bg-surface border border-bg-surface group rounded-none`

**Featured:** `aspect-[16/10] md:col-span-2`
**Default:** `aspect-[4/5]`
**Placeholder:** `aspect-[4/5] flex items-center justify-center` (рендериться `<IsometricCubePlaceholder />` з opacity 30%)

**Image (не placeholder):**
```tsx
<img src={image} alt={title} loading="lazy"
     className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
<div className="absolute inset-0 bg-gradient-to-b from-bg-deep/10 via-transparent to-bg-deep/80" aria-hidden="true" />
```

**Bottom overlay (info):** замість `rounded-2xl bg-white/10` (поточно) — **кутовий бар на повну ширину знизу**:
```tsx
<div className="absolute bottom-0 left-0 right-0 p-6 bg-bg-deep/70 backdrop-blur-md border-t border-bg-surface flex items-end justify-between gap-4">
  <div>
    <StagePill stage={stage} />
    <h3 className="text-lg md:text-2xl font-bold text-text-primary mt-3">{title}</h3>
    <p className="text-sm text-text-secondary mt-1">{location}</p>
  </div>
  <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" aria-hidden="true" />
</div>
```

**Link wrap:** весь корпус `<a href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>`. ARIA: `aria-label` зі stage + title (для screen-reader) — `aria-label={\`${title}, стадія: ${stageLabel(stage)}\`}`.

`Heart`-favorite іконку **прибираємо** (це e-comm patterns, не наш ToV).

### 2.6 `<NavBar />`

```
[Logo (40px)] ... [Проєкти | Як ми будуємо | Про компанію | Новини | Контакт] ... [Button primary sm "Заявка"]
```

**Container:** `sticky top-0 z-50 bg-bg-deep border-b border-bg-surface`
**Inner:** `max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between`

**Desktop nav:** `hidden md:flex items-center gap-8` — links `text-sm font-medium text-text-secondary hover:text-accent transition-colors`.

**Active link** (треба додати при routing): `text-text-primary` + `border-b border-accent pb-1`.

**Mobile (≤md):** гамбургер-кнопка `<button aria-expanded={open} aria-controls="mobile-menu" aria-label="Відкрити меню">` з `<Menu />` / `<X />` з lucide. Відкрите меню — повноекранне:
```tsx
<div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Головне меню"
     className="fixed inset-0 z-40 bg-bg-deep flex flex-col items-start justify-center gap-8 px-6">
  {/* links text-3xl */}
</div>
```
Закриття — `Escape` + клік на X. Trap focus (стандартним focus-visible достатньо для прототипу).

### 2.7 `<Footer />`

**Layout:** `bg-bg-deep py-16 px-6` → `max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8`.

**Колонки:**
1. Logo (56px) + дескриптор (`<p className="text-text-secondary text-sm mt-4 max-w-xs">Системний девелопмент у Львові.</p>`)
2. **Навігація:** Проєкти / Як ми будуємо / Про компанію / Новини
3. **Контакти:** телефон, email (`vygoda.sales@gmail.com`), адреса, Instagram
4. **Юридичне:** ЄДРПОУ 42016395, Ліцензія від 27.12.2019

**Юр.рядок (нижче grid):**
```tsx
<div className="border-t border-bg-surface mt-16 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-text-secondary">
  <span>© 2026 ТОВ "БК Вигода Груп" · ЄДРПОУ 42016395 · Ліцензія від 27.12.2019</span>
  <a href="/privacy" className="hover:text-accent">Політика конфіденційності</a>
</div>
```

### 2.8 `<PageHero />`

Універсальний для внутрішніх сторінок (`/proekty`, `/about`, `/novyny`, `/kontakt`).

```tsx
type PageHeroProps = {
  eyebrow?: string;        // "// Розділ 02"
  title: string;           // H1
  lead?: string;           // підзаголовок body-lg
  image?: string;          // опціональний bg
  align?: 'left' | 'center';
};
```

**Класи:** `relative bg-bg-deep py-24 md:py-32 px-6 border-b border-bg-surface overflow-hidden` + ізометричний патерн як `<img src="/isometric-grid.svg" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" />` (опціонально, через окремий проп `decorative={true}`).

H1: `text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight font-bold text-text-primary`.

### 2.9 `<SectionHeading />`

```tsx
type SectionHeadingProps = {
  eyebrow?: string;        // "// 02"
  title: string;
  align?: 'left' | 'center';
  as?: 'h2' | 'h3';
};
```

Eyebrow:
```tsx
<span className="inline-block text-xs font-mono tracking-widest text-accent uppercase mb-4">
  // {eyebrow}
</span>
```

H2: `text-3xl md:text-5xl font-bold text-text-primary tracking-tight`.

### 2.10 `<TrustStripe />`

Один рядок з 4 фактами на тлі `bg-bg-deep` під hero.

```tsx
<section className="bg-bg-deep border-y border-bg-surface py-8 px-6">
  <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-bg-surface">
    {[
      { label: "ЄДРПОУ", value: "42016395" },
      { label: "Ліцензія", value: "від 27.12.2019" },
      { label: "Технологія", value: "Монолітно-каркас" },
      { label: "У роботі", value: "4 проєкти" },
    ].map((f) => (
      <div key={f.label} className="bg-bg-deep p-6">
        <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">{f.label}</div>
        <div className="text-lg font-bold text-text-primary">{f.value}</div>
      </div>
    ))}
  </div>
</section>
```

### 2.11 `<StagePill />`

**Кутова плашка** (не pill як форма — назва історична). 0 radius.

```tsx
const STAGE_LABEL = {
  construction: { label: 'Будівництво', tone: 'accent' },
  memorandum: { label: 'Меморандум', tone: 'muted' },
  estimate: { label: 'Кошторис', tone: 'muted' },
  permit: { label: 'Дозвільна', tone: 'muted' },
} as const;

export function StagePill({ stage }: { stage: keyof typeof STAGE_LABEL }) {
  const { label, tone } = STAGE_LABEL[stage];
  const cls = tone === 'accent'
    ? 'bg-accent text-bg-deep'
    : 'bg-bg-surface text-text-primary border border-text-secondary/30';
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-none ${cls}`}>
      {label}
    </span>
  );
}
```

### 2.12 `<NewsCard />`

```tsx
type NewsCardProps = {
  date: string;       // "30.04.2026"
  category: string;   // "Будівництво"
  title: string;
  lead: string;
  href: string;
};
```

**Layout:** `block bg-bg-surface border border-bg-surface hover:border-accent transition-colors p-6 md:p-8 group`.

```tsx
<article>
  <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-text-secondary mb-4">
    <time dateTime={isoDate}>{date}</time>
    <span aria-hidden="true">·</span>
    <span className="text-accent">{category}</span>
  </div>
  <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">{title}</h3>
  <p className="text-text-secondary text-sm leading-relaxed mb-6">{lead}</p>
  <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
    Читати далі <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
  </span>
</article>
```

### 2.13 `<IsometricCubePlaceholder />`

Inline SVG куб (на основі брендбукової графічної мови — лінійна ізометрія, stroke 1pt, без fill).

```tsx
export function IsometricCubePlaceholder({ size = 200, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      className={className}
      role="img"
      aria-label="Проєкт у стадії планування"
    >
      <g fill="none" stroke="#C1F33D" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter">
        {/* top face */}
        <polygon points="100,20 180,60 100,100 20,60" />
        {/* left face */}
        <polygon points="20,60 100,100 100,200 20,160" />
        {/* right face */}
        <polygon points="180,60 100,100 100,200 180,160" />
        {/* internal edges, opacity-low */}
        <line x1="100" y1="100" x2="100" y2="200" opacity="0.5" />
      </g>
    </svg>
  );
}
```

Використання у `ProjectCard variant="placeholder"`: контейнер `bg-bg-deep`, куб `opacity-40`, поряд текст "Назва — після узгодження з інвестором" + `<StagePill stage="estimate" />`.

### 2.14 `<ProjectGalleryStrip />`

Горизонтальна стрічка превʼю рендерів на сторінці проекту.

```tsx
type Props = { images: { src: string; alt: string }[] };
```

**Layout:** `flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 lg:mx-0 lg:px-0` (edge-to-edge на mobile).

Кожен `<img>` — `flex-none w-[80%] md:w-[480px] aspect-[4/3] object-cover snap-start rounded-none`. Native scroll, без JS-каруселі.

ARIA: `<ul role="list">` обгортка, кожен item `<li>` з `<button aria-label="Переглянути на повну">`.

---

## 3. Layout patterns

- **Container:** `max-w-7xl mx-auto px-6 lg:px-8` (підтверджено).
- **Section padding:** `py-32 px-6` для primary, `py-16 px-6` для secondary.
- **Decorative vertical lines** (з `App.tsx` рядки 37–41) — **лишаємо**, але:
  - opacity змінюємо з `opacity-15` на `opacity-10` (лайм яскравий проти нового `#2F3640`);
  - використовуємо лише на сторінках з `bg-base`, не на `bg-deep` (де патерн).
- **Isometric pattern** як декоративне тло для `<PageHero decorative={true} />` і опціонально для секції "Як ми будуємо":
  ```tsx
  <img src="/isometric-grid.svg" aria-hidden="true"
       className="absolute inset-0 w-full h-full object-cover opacity-[0.08] mix-blend-overlay pointer-events-none" />
  ```
  Setup: `cp brand-assets/patterns/isometric-grid.svg web-design/public/isometric-grid.svg`.

### 3.1 Grid system

- 12-col на бажання, але переважно flex/grid utilities Tailwind.
- Mobile-first: всі сітки `grid-cols-1`, ламаємо на `md:` (≥768px) і `lg:` (≥1024px).

---

## 4. Motion (motion/react)

- **`<FadeIn>`** (з App.tsx 5–15) — лишаємо. Стандарт: `duration: 0.4, ease: "linear"`. ✓
- **Hero scale-in для "ВИГОДА"** (App.tsx 65–72) — лишаємо. `duration: 1, easeOut`. ✓
- **Hover на картках:** `transition-transform duration-500 group-hover:scale-[1.03]` — CSS-only, без motion. Скейл зменшено з `scale-105` (5%) до 3% — менш "магії".
- **Mobile menu відкриття:** `motion.div` з `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}`. Без slide — fade-only.
- **НЕ додавати:** `whileHover={{ y: -5 }}`, parallax-скрол, layout-анімації, magnetic cursor. Бренд — раціональний.
- **Reduced motion** глобально оброблено в `index.css` (див. 1.0).

---

## 5. Data layer

Створити `src/data/projects.ts`:

```ts
export type Stage = 'construction' | 'memorandum' | 'estimate' | 'permit';

export type Project = {
  slug: string;
  title: string;
  location: string;
  stage: Stage;
  image?: string;
  href: string;
  external?: boolean;
  variant: 'featured' | 'default' | 'placeholder';
};

export const projects: Project[] = [
  { slug: 'lakeview', title: 'ЖК Lakeview', location: 'вул. В. Великого, 2А, Львів',
    stage: 'construction', image: '/projects/lakeview.jpg',
    href: 'https://yaroslavpetrukha.github.io/Lakeview/', external: true, variant: 'featured' },
  { slug: 'etno-dim', title: 'ЖК Етно Дім', location: 'вул. Судова, Львів',
    stage: 'memorandum', image: '/projects/etno-dim.jpg',
    href: '/proekty/etno-dim', variant: 'default' },
  { slug: 'maetok-vynnykivskyi', title: 'ЖК Маєток Винниківський', location: 'м. Винники',
    stage: 'estimate', image: '/projects/maetok.jpg',
    href: '/proekty/maetok-vynnykivskyi', variant: 'default' },
  { slug: 'nterest', title: 'Дохідний дім NTEREST', location: 'Львів',
    stage: 'permit', image: '/projects/nterest.jpg',
    href: '/proekty/nterest', variant: 'default' },
  { slug: 'pipeline-4', title: 'Назва — після узгодження', location: 'Львівська обл.',
    stage: 'estimate', href: '/proekty/pipeline-4', variant: 'placeholder' },
];
```

JSX мапить `projects.map(p => <ProjectCard {...p} />)`. **Жодних inline-плейсхолдерів типу "ЖК Центральний" у JSX.**

---

## 6. Accessibility checklist (мінімум для прототипу)

- [ ] Контраст: `#F5F7FA` на `#2F3640` = 12.4:1 (AAA); `#C1F33D` на `#2F3640` = 9.7:1 (AAA); `#A7AFBC` на `#2F3640` = 5.2:1 (AA для body, не використовувати <14px без `font-medium`).
- [ ] Усі інтерактивні елементи мають `:focus-visible` (глобально через `index.css`).
- [ ] Зображення: `alt` обов'язковий. Декоративні — `alt=""` + `aria-hidden="true"`.
- [ ] Іконки lucide без видимого тексту — `aria-hidden="true"` + текстова мітка поряд або `aria-label` на батьку.
- [ ] Mobile menu — `role="dialog" aria-modal="true"`, закривається Escape.
- [ ] Form labels — `<label>` для кожного поля (у нашому стилі — обгортка з `<span>` + `<input>`).
- [ ] Required-поля — `aria-required="true"`, error-стан `aria-invalid` + `aria-describedby`.
- [ ] Touch-targets — мінімум 44px (наші `Button md/lg` — 48–52px).
- [ ] Семантика: `<nav>`, `<main>`, `<article>` (для NewsCard), `<section>` з `aria-labelledby`.

---

## 7. Setup-команди (один раз перед стартом)

```bash
cp /Users/admin/Documents/Проєкти/vugoda-web-2/brand-assets/logo/dark.svg \
   /Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/logo-dark.svg

cp /Users/admin/Documents/Проєкти/vugoda-web-2/brand-assets/patterns/isometric-grid.svg \
   /Users/admin/Documents/Проєкти/vugoda-web-2/web-design/public/isometric-grid.svg
```

Рендери проектів — з `/Users/admin/Documents/Проєкти/vugoda-web-2/renders/<Назва>/` копіювати у `web-design/public/projects/<slug>.jpg` (один найкращий рендер per slug для cards; повна стрічка — для page-route).

---

## 8. Структура файлів

```
src/
├── App.tsx                          # роут-обгортка (1 page для прототипу)
├── index.css                        # tokens (див. §1)
├── components/
│   ├── Logo.tsx
│   ├── Button.tsx
│   ├── ContactForm.tsx
│   ├── ProjectCard.tsx
│   ├── NavBar.tsx
│   ├── Footer.tsx
│   ├── PageHero.tsx
│   ├── SectionHeading.tsx
│   ├── TrustStripe.tsx
│   ├── StagePill.tsx
│   ├── NewsCard.tsx
│   ├── IsometricCubePlaceholder.tsx
│   ├── ProjectGalleryStrip.tsx
│   └── FadeIn.tsx                   # винести з App.tsx
├── data/
│   ├── projects.ts
│   └── news.ts                      # для /novyny
└── sections/                        # композиції під home page
    ├── HomeHero.tsx
    ├── BrandEssence.tsx
    ├── ProjectsGrid.tsx
    ├── ValuesGrid.tsx
    └── ContactSection.tsx
```

---

## 9. Definition of Done (acceptance)

- [ ] `index.css` має нові токени (`#2F3640` etc.); старі `#2a3038` повністю видалені (grep чисто).
- [ ] Логотип у nav і footer — `<img src="/logo-dark.svg" />`. Кастомний 3-circle SVG видалений.
- [ ] Жодного `rounded-full`, `rounded-2xl`, `rounded-[2rem]` у проекті (grep чисто).
- [ ] `data/projects.ts` існує, у JSX немає рядків "ЖК Центральний"/"Резиденція Захід"/"Парковий".
- [ ] Status "ЗДАНО" відсутній у будь-якому файлі (grep чисто).
- [ ] Hero-widget з ROI / прогрес-баром заміщено `<TrustStripe />`.
- [ ] NavBar має 5 пунктів + primary CTA, mobile-menu працює.
- [ ] Footer містить юр.рядок з ЄДРПОУ 42016395 і ліцензією 27.12.2019.
- [ ] `:focus-visible` глобально працює (Tab-навігація показує лайм-ring).
- [ ] Lighthouse Accessibility ≥ 95 (ціль), контраст без warnings.
- [ ] `prefers-reduced-motion: reduce` вимикає motion-анімації.

---

**Документ-джерело правди для імплементації.** При конфлікті з `App.tsx` — пріоритет за цим документом і брендбуком.
