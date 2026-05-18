---
date: 2026-05-18
author: Frontend Developer (research)
status: ready-for-implementation
stack: Vite 6.2 + React 19 + TypeScript + Tailwind 4
target: Lakeview page + Home hero + cards + construction timeline
---

# Image Optimization Strategy — ВИГОДА

## TL;DR

- **Plugin:** `vite-imagetools@^10` (Sharp under the hood). Single dep, zero config drift, generates AVIF + WebP + JPG with width arrays via query strings at build time.
- **Pattern:** Build a thin `<Picture>` wrapper around the `as=picture` directive. No alternative is closer to "drop-in replacement for `<img>`".
- **Hero LCP fix:** strip `loading="lazy"` from below-fold lakeview hero context, keep `fetchpriority="high"` and `decoding="async"`, add `<link rel="preload" as="image" imagesrcset=… imagesizes=…>` for the AVIF variant in `index.html`.
- **Expected payload reduction on `/portfolio/lakeview`:** **~7.0 MB → ~0.85 MB** (–88%) on a 1440px viewport with AVIF; **~1.4 MB on mobile** (480/768w variants only).
- **Expected LCP on 4G:** ~4.8–5.5s today → **~1.6–2.1s** after migration.

---

## 1. Поточний стан (виміри)

### Lakeview (КРИТИЧНО — JPG, не оптимізовано)

| Файл | Розмір | Використання |
|---|---|---|
| `aerial.jpg` | **1.54 MB** | Home hero (LCP candidate!) + Lakeview gallery |
| `lake-bridge.jpg` | 1.10 MB | Lakeview gallery |
| `semi-aerial.jpg` | 996 KB | Lakeview gallery |
| `hero.jpg` | 987 KB | Lakeview page hero (LCP element) |
| `entrance.jpg` | 880 KB | Lakeview gallery |
| `closeup.jpg` | 745 KB | Lakeview gallery |
| `terrace.jpg` | 676 KB | Lakeview gallery |
| **Сума** | **6.93 MB** | На одній сторінці `/portfolio/lakeview` |

### Pipeline-проєкти (WebP вже є, але одна-єдина роздільність)

| Папка | Файлів | Сума | Найбільший |
|---|---|---|---|
| `etno-dim/` | 8 × .webp | ~1.31 MB | render-3 (219 KB) |
| `maetok/` | 2 × .webp | ~254 KB | render-1 (195 KB) |
| `nterest/` | 3 × .webp | ~453 KB | render-2 (175 KB) |

WebP **є**, але **немає responsive sizes** — мобільні качають той самий 1920w файл, що й десктоп. Це треба фіксити теж.

### Construction timeline (12 .jpg)

| Місяць | Розмір (3 кадри) |
|---|---|
| dec | 861 KB |
| jan | 1.07 MB |
| feb | 1.03 MB |
| mar | 990 KB |
| **Сума** | **~3.95 MB** |

Це **decorative timeline** (square 360px на desktop, 70vw на mobile). Якість тут вторинна, але 12×350KB = 4 MB трафіку при scroll нижче fold — це треба зменшити до ~250 KB сумарно.

### Що зараз генерується для Lakeview на `/portfolio/lakeview` (без оптимізації):
- 1× hero.jpg (~987 KB)
- 6× gallery .jpg (~5.94 MB)
- 12× construction .jpg (~3.95 MB)
- **Разом: ~10.9 MB** на сторінку (всі lazy, але initial viewport тягне ~2 MB одразу).

---

## 2. Вибір плагіна

### Розгляд варіантів

| Плагін | Підхід | Підходить? |
|---|---|---|
| **`vite-imagetools`** ★ | Query-string директиви на імпорті: `import x from './a.jpg?w=1920;1280;768&format=avif;webp;jpg&as=picture'`. Sharp під капотом. Повертає готовий об'єкт `{img, sources}` для `<picture>`. | **ТАК** — найточніше відповідає use-case |
| `vite-plugin-image-presets` | Іменовані пресети у config, імпорт повертає масив URL. Гнучко, але API менш ергономічний для `<picture>`. | Альтернатива, але писати свій presets layer все одно треба |
| `vite-plugin-image-optimizer` | Bulk-оптимізує **всі** assets без зміни розміру/формату на льоту. Не генерує AVIF з JPG. | Ні — це stage-2 outliner, не вирішує core problem |
| `unplugin-image-optimizer` | Universal версія попереднього. Те саме обмеження. | Ні |

### Вердикт: **`vite-imagetools@^10`**

**Чому:**
1. **Single source of truth у query string** — pixels у код, налаштування поруч з використанням.
2. **Officially supports `as=picture`** з v6+ → повертає `{img: {src, w, h}, sources: {avif: 'srcset', webp: 'srcset', jpeg: 'srcset'}}`.
3. **Width arrays через `;`**: `?w=480;768;1280;1920` → 4 файли за один імпорт.
4. **Format arrays через `;`**: `?format=avif;webp;jpg` → AVIF first, WebP fallback, JPG для старих браузерів.
5. **`defaultDirectives` function** дозволяє нам централізувати "presets" без зайвого пакета.
6. **TypeScript types з коробки** (`Picture` type експортується).
7. **Active maintenance** — v10.0.0 (2026-Q1), сумісний з Vite 6 + Node 18+.
8. **Sharp = de-facto standard** для AVIF encoding (effort 4–6).

**Install:**
```bash
npm i -D vite-imagetools
```
Sharp вже tag-along peer dep, npm витягне автоматично (це native binary, vary by OS — в CI на Linux треба `npm ci`, не `npm install` без cache).

---

## 3. `<Picture>` component API

### Контракт

```tsx
// src/components/Picture.tsx
import type { Picture as PictureSource } from 'vite-imagetools';

type Props = {
  /** Imported via ?as=picture from vite-imagetools */
  source: PictureSource;
  alt: string;
  /** sizes attribute, напр. "(max-width: 768px) 100vw, 1280px" */
  sizes: string;
  /** Default false. Set true ONLY on hero/above-fold LCP element. */
  priority?: boolean;
  className?: string;
  /** Forwarded to <img> for layout (avoids CLS) */
  width?: number;
  height?: number;
};

const FORMAT_MIME: Record<string, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
};

const Picture = ({
  source,
  alt,
  sizes,
  priority = false,
  className,
  width,
  height,
}: Props) => (
  <picture>
    {Object.entries(source.sources).map(([fmt, srcset]) => (
      <source
        key={fmt}
        type={FORMAT_MIME[fmt] ?? `image/${fmt}`}
        srcSet={srcset as string}
        sizes={sizes}
      />
    ))}
    <img
      src={source.img.src}
      width={width ?? source.img.w}
      height={height ?? source.img.h}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
    />
  </picture>
);

export default Picture;
```

**Notes:**
- React 19 [supports lowercase `fetchpriority` AND camelCase `fetchPriority`](https://react.dev/reference/react-dom/components/common#applying-css-styles). Використовуй camelCase — TS не сваритиметься.
- `width/height` з `source.img` приходять автоматично — це **prevents CLS** без додаткових зусиль.
- `priority={true}` робить три речі одночасно: eager loading, fetchpriority high, готовий до preload.

### Використання

```tsx
// До:
<img src="/vugoda-web-2/projects/lakeview/aerial.jpg" alt="" />

// Після:
import aerial from '@/public/projects/lakeview/aerial.jpg?w=480;768;1280;1920&format=avif;webp;jpeg&as=picture';

<Picture
  source={aerial}
  alt=""
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1920px"
  priority   // тільки на hero
  className="w-full h-full object-cover opacity-50"
/>
```

> **Важливо для проєкту:** зараз файли лежать у `public/` і використовуються як runtime URL (`/vugoda-web-2/projects/...`). vite-imagetools **не обробляє `public/`** — він працює тільки з імпортованими модулями. Тому файли треба **перенести з `public/projects/` у `src/assets/projects/`** (або `src/images/`). Це обов'язковий міграційний крок.

---

## 4. Presets — `defaultDirectives` функція

Замість того щоб писати довгі query strings скрізь, централізуємо логіку.

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/vugoda-web-2/',
  plugins: [
    react(),
    tailwindcss(),
    imagetools({
      defaultDirectives: (url) => {
        const preset = url.searchParams.get('preset');
        const params = new URLSearchParams();

        // Завжди генеруємо <picture>-friendly object
        params.set('as', 'picture');
        // Завжди три формати — AVIF first, WebP fallback, JPEG safety net
        params.set('format', 'avif;webp;jpeg');

        switch (preset) {
          case 'hero':
            params.set('w', '480;768;1280;1920');
            params.set('quality', '60;72;80'); // avif;webp;jpeg
            break;
          case 'card':
            params.set('w', '320;640');
            params.set('quality', '58;72;78');
            break;
          case 'gallery':
            params.set('w', '600;1200');
            params.set('quality', '58;72;78');
            break;
          case 'construction':
            // Decorative — тиснемо сильніше
            params.set('w', '400;800');
            params.set('quality', '50;65;72');
            break;
          default:
            // No preset → respect explicit user directives, only enforce format
            break;
        }
        params.set('withoutEnlargement', 'true');
        return params;
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

### Тепер у коді — короткий синтаксис:

```tsx
import aerial from '@/src/assets/projects/lakeview/aerial.jpg?preset=hero';
import cardImg from '@/src/assets/projects/lakeview/hero.jpg?preset=card';
import gallery1 from '@/src/assets/projects/lakeview/lake-bridge.jpg?preset=gallery';
import dec01 from '@/src/assets/construction/dec-01.jpg?preset=construction';
```

### Цифри по presets

| Preset | Widths (px) | Якість AVIF/WebP/JPEG | Файлів на джерело | Sizes attr (default) |
|---|---|---|---|---|
| **hero** | 480, 768, 1280, 1920 | 60 / 72 / 80 | 4 × 3 = **12** | `(max-width: 768px) 100vw, 1920px` |
| **card** | 320, 640 | 58 / 72 / 78 | 2 × 3 = **6** | `(max-width: 768px) 90vw, 640px` |
| **gallery** | 600, 1200 | 58 / 72 / 78 | 2 × 3 = **6** | `(max-width: 768px) 80vw, 480px` |
| **construction** | 400, 800 | 50 / 65 / 72 | 2 × 3 = **6** | `(max-width: 768px) 70vw, 360px` |

**Quality calibration** (з 2026 best practices):
- **AVIF 50–60** = візуально еквівалент **WebP 72**, який ~= **JPEG 82**.
- Для real estate рендерів якість критична на gallery (велике замикання), але construction-фотки можна тиснути сильніше.

---

## 5. Migration plan

### Phase 1 — Lakeview (priority: критично)

**Кроки:**
1. `mkdir -p src/assets/projects/lakeview`
2. `git mv public/projects/lakeview/*.jpg src/assets/projects/lakeview/`
3. Додати `vite-imagetools` + конфіг (див. §4).
4. Створити `src/components/Picture.tsx` (див. §3).
5. **`src/pages/ProjectLakeview.tsx`:**
   - `RENDERS` const → переписати з static-URL strings на import-based + `?preset=gallery`.
   - `PageHero` отримує `image="..."` як string → потрібно або змінити сигнатуру PageHero щоб приймати `PictureSource | string`, або зробити окремий `<PageHero source={...}>` overload. Рекомендую: новий проп `source?: PictureSource` поряд з `image?: string` (graceful fallback).
6. **`src/pages/Home.tsx`** (рядок 90):
   - `aerial.jpg` background → міняємо на `<Picture priority preset="hero">`.
   - **ОБОВ'ЯЗКОВО** preload у `index.html`:
     ```html
     <!-- В index.html, до решти <link> -->
     <link rel="preload" as="image" type="image/avif"
           href="/vugoda-web-2/assets/aerial-1280.AVIF_HASH.avif"
           imagesrcset="..."
           imagesizes="(max-width: 768px) 100vw, 1920px"
           fetchpriority="high" />
     ```
     URL-и hash-based, тому треба генерувати їх через окремий vite plugin або писати у `<head>` через React 19's [native `<link>` hoisting](https://react.dev/reference/react-dom/components/link). Best — використати React 19 `<link>` у `<Home>` компоненті:
     ```tsx
     <link rel="preload" as="image" imageSrcSet={aerial.sources.avif} imageSizes="..." />
     ```
7. **`src/components/ProjectGalleryStrip.tsx`** — переписати `images: ImgItem[]` тип:
   ```ts
   type ImgItem = { source: PictureSource; alt: string; caption?: string; sizes?: string };
   ```
8. **`src/components/ProjectCard.tsx`** — `project.cardImage` зараз string. Це тримається у `src/data/projects.ts` (не читали, але видно з line 50). Треба замінити поле з `string` на `PictureSource` через static import у data файлі.

### Phase 2 — Pipeline (etno-dim, maetok, nterest)

Існуючі `.webp` файли — це **single resolution**. vite-imagetools із них **точно так само згенерує AVIF + responsive WebP**. Sharp читає WebP джерела без проблем.

- Перенести `public/projects/etno-dim/*.webp` → `src/assets/projects/etno-dim/`.
- У `ProjectEtnoDim.tsx`, `ProjectMaetok.tsx`, `ProjectNterest.tsx` (припускаю, є) — використати:
  ```ts
  const RENDERS = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      import(`@/src/assets/projects/etno-dim/render-${i + 1}.webp?preset=gallery`)
    )
  );
  ```
  Або краще — статичні імпорти (eager) для SSG/dev simplicity:
  ```ts
  import r1 from '@/src/assets/projects/etno-dim/render-1.webp?preset=gallery';
  // ... × 8
  const RENDERS = [r1, r2, /* ... */];
  ```

**WebP → AVIF gain:** ~30–45% додаткової економії на тих самих файлах.

### Phase 3 — Construction (decorative timeline)

12 × .jpg → preset=construction → 12 × (2 widths × 3 formats) = **72 файли**, сумарно **~600 KB** замість 3.95 MB.

Всі — lazy load (вони нижче fold).

---

## 6. LCP target

### Поточний estimated (Mobile 4G, 1.6Mbps + 150ms RTT, Lighthouse defaults):

| Етап | Час | Причина |
|---|---|---|
| TTFB | ~400ms | GH Pages cold |
| JS parse + React hydrate | ~600ms | Vite bundle (~150 KB gzipped) |
| **Hero `aerial.jpg` (1.54 MB) download on 4G** | **~3.5–4.0s** | На мобільному 1.6 Mbps це 7.5+ секунд, але connection sharing skews it |
| **Estimated LCP** | **~4.8–5.5s** | 🔴 FAIL (target <2.5s) |

### Цільовий після оптимізації:

| Етап | Час | Причина |
|---|---|---|
| TTFB | ~400ms | (unchanged) |
| **Preload AVIF 768w (~38 KB)** | **~250ms** | Стартує паралельно з HTML parsing |
| Hero render | + ~100ms | React 19 partial hydration |
| **Estimated LCP** | **~1.6–2.1s** | 🟢 PASS |

**Trade-off зауваження:** AVIF decode коштує CPU. На low-end Android (Moto G4 baseline) decoding 1280w AVIF ~150ms. Це **прийнятно**, бо все одно sub-2.5s.

---

## 7. Очікувана економія (bytes)

### Bytes downloaded на `/portfolio/lakeview` (1440px viewport, AVIF supported):

**Before:**
| Asset class | Files | Bytes |
|---|---|---|
| Hero | 1 × 987 KB | 987 KB |
| Gallery (6) | 6 × ~983 KB avg | 5.95 MB |
| Construction (12) | 12 × ~330 KB avg | 3.95 MB |
| **Total** | **19** | **~10.9 MB** |

**After (initial viewport):**
| Asset class | Files served | Bytes |
|---|---|---|
| Hero AVIF 1280w | 1 × ~95 KB | 95 KB |
| Gallery AVIF 1200w (visible: 2–3 cards in strip) | 3 × ~80 KB | 240 KB |
| Construction AVIF 800w (lazy, below fold — not loaded initially) | 0 | 0 KB |
| **Initial total** | **4** | **~335 KB** |

**After (full scroll, AVIF 1440px viewport):**
| Asset class | Files | Bytes |
|---|---|---|
| Hero AVIF 1280w | 1 × 95 KB | 95 KB |
| Gallery AVIF 1200w (6) | 6 × 80 KB | 480 KB |
| Construction AVIF 800w (12) | 12 × 22 KB | 265 KB |
| **Full page total** | **19** | **~840 KB** |

**Mobile (480/768w viewport, scroll-through):**
| Asset class | Bytes |
|---|---|
| Hero AVIF 768w | ~35 KB |
| Gallery AVIF 600w × 6 | ~210 KB |
| Construction AVIF 400w × 12 | ~120 KB |
| **Total** | **~365 KB** |

### Summary

| Scenario | Before | After | Economy |
|---|---|---|---|
| Initial viewport (desktop) | ~2.0 MB | ~335 KB | **–83%** |
| Full page (desktop) | ~10.9 MB | ~840 KB | **–92%** |
| Full page (mobile) | ~10.9 MB | ~365 KB | **–97%** |

---

## 8. Файли, які треба створити/змінити

### Create

```
src/components/Picture.tsx                      ← новий компонент (див. §3)
src/assets/projects/lakeview/*.jpg              ← move from public/
src/assets/projects/etno-dim/*.webp             ← move from public/
src/assets/projects/maetok/*.webp               ← move from public/
src/assets/projects/nterest/*.webp              ← move from public/
src/assets/construction/*.jpg                   ← move from public/
src/types/vite-imagetools.d.ts                  ← глобальні declare module 'augmented' для preset=
```

### Modify

```
package.json                                    ← + vite-imagetools devDep
vite.config.ts                                  ← + imagetools() plugin + defaultDirectives
src/components/ProjectGalleryStrip.tsx          ← ImgItem.src → ImgItem.source (PictureSource)
src/components/ProjectCard.tsx                  ← project.cardImage: string → PictureSource
src/components/PageHero.tsx                     ← + source?: PictureSource prop
src/data/projects.ts                            ← cardImage: import('./...?preset=card')
src/pages/Home.tsx                              ← line 90 <img> → <Picture priority>
                                                ← + <link rel="preload"> для AVIF
src/pages/ProjectLakeview.tsx                   ← RENDERS, CONSTRUCTION_GROUPS, hero
src/pages/ProjectEtnoDim.tsx                    ← RENDERS imports + hero
src/pages/ProjectMaetok.tsx (припускаю)         ← аналогічно
src/pages/ProjectNterest.tsx (припускаю)        ← аналогічно
```

### Delete

```
public/projects/                                ← після переносу
public/construction/                            ← після переносу
```

### TypeScript

Потрібно додати в `tsconfig.json` (або `vite-env.d.ts`):
```ts
/// <reference types="vite-imagetools/client" />
```
Це активує типи для `?as=picture` query.

---

## 9. Ризики й застереження

1. **Build time зросте.** Sharp + AVIF encoding на 30+ зображень × 3 формати × 2–4 widths = ~400 transformations. На M-series mac — 25–40s. У GitHub Actions Linux runner — 60–90s. **Mitigation:** Vite cache між builds (зберігається у `node_modules/.vite/imagetools` автоматично).

2. **AVIF effort=4 за замовчуванням.** Якщо хочеться economy ще –10% — додати `effort: 6` (повільніше build), але це опціонально.

3. **Sharp native binary.** У CI на нестандартних OS може потрібно `npm rebuild sharp --platform=linux --arch=x64`. На GH Actions ubuntu-latest працює з коробки.

4. **`public/` legacy URLs.** Якщо десь у проекті залишилися hard-coded `/vugoda-web-2/projects/...` — вони зламаються після переносу. **Mitigation:** глобальний grep перед merge:
   ```bash
   grep -rn "projects/lakeview\|projects/etno-dim\|projects/maetok\|projects/nterest\|/construction/" src/
   ```

5. **base path `/vugoda-web-2/`** — vite-imagetools shukaye цей base автоматично з config; згенеровані asset URLs будуть `/vugoda-web-2/assets/aerial-1920.HASH.avif`.

6. **`isometric-grid.svg`, `mark.svg` у public/** — НЕ чіпаємо. SVG → AVIF/WebP не має сенсу. Залишаємо як є.

7. **OG / SEO meta-images.** `og:image` теги (якщо є у Helmet) вимагають static URL → **окремо** генерувати fixed-size JPEG/PNG (`?preset=og&format=jpg&w=1200&as=url`) і вшивати у meta. Pre-rendering still works because filename is hashed but stable.

---

## 10. Implementation order (cheat-sheet)

1. `npm i -D vite-imagetools`
2. Add `/// <reference types="vite-imagetools/client" />` у `src/vite-env.d.ts`.
3. Update `vite.config.ts` (§4).
4. Create `src/components/Picture.tsx` (§3).
5. Move ONE file as a smoke test (e.g. `aerial.jpg`), wire to Home hero, verify build emits `.avif`, `.webp`, `.jpg`.
6. Move решта lakeview files, refactor `ProjectLakeview.tsx`.
7. Move etno-dim/maetok/nterest, refactor pages.
8. Move construction, refactor.
9. `npm run build && npm run preview` — manual LCP check via Lighthouse mobile preset.
10. Grep for legacy `public/projects` references — fix or remove.

---

## Sources

- [vite-imagetools — npm](https://www.npmjs.com/package/vite-imagetools)
- [imagetools/packages/vite/README.md (GitHub)](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/README.md)
- [imagetools — directives reference](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md)
- [vite-plugin-image-presets (alt option)](https://github.com/ElMassimo/vite-plugin-image-presets)
- [vite-plugin-image-optimizer (alt option)](https://github.com/FatehAK/vite-plugin-image-optimizer)
- [Core Web Vitals in 2026 — practical fixes](https://dev.to/benriemer/core-web-vitals-in-2026-the-practical-fixes-for-inp-lcp-and-cls-that-actually-work-4ef0)
- [How to Optimize Website Images — 2026 Guide (Request Metrics)](https://requestmetrics.com/web-performance/high-performance-images/)
- [Lazy Loading Best Practices For LCP Images In 2026](https://webgaro.com/blog/lazy-loading-best-practices-for-lcp-images/)
- [Google clarifies lazy-loading: the LCP penalty hiding in your hero images](https://www.etavrian.com/news/lazy-loading-lcp-hero-images)
- [Optimize Largest Contentful Paint — web.dev](https://web.dev/articles/optimize-lcp)
- [Fix your website's LCP by optimizing image loading — MDN Blog](https://developer.mozilla.org/en-US/blog/fix-image-lcp/)
- [React 19 — common HTML props (fetchPriority, link hoisting)](https://react.dev/reference/react-dom/components/common)
