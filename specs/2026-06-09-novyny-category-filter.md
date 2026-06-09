# Spec — /novyny category filter

**Date:** 2026-06-09 · **Size:** M · **Research:** `thoughts/research/2026-06-09-novyny-category-filter.md` (агент-звіт нижче)

## Problem
На `/novyny` є чипси категорій (`<button aria-pressed>`), але **без onClick** — декоративні, фільтрація не працює. `articles.map()` рендерить усі статті незалежно.

## Goal
Робоча фільтрація статей по категоріях — грамотно, по бест-практісах: URL-driven, accessible, SEO-safe, з прогресивним покращенням.

## Approach (locked by research)
- **State у URL** через `useSearchParams` (`?category=<slug>`); `null` = «Усі». (RR v7 API, вже вживаний у `diakuyu.tsx`.)
- **Чипси = `<Link>`** (не кнопки): «Усі» → `/novyny`, категорія → `/novyny?category=<slug>`. Прогресивне покращення: без JS prerendered `/novyny` показує ВСІ статті (fail-open), нічого не ховається від краулерів.
- **ARIA:** `<nav aria-label>` + `aria-current="true"` на активному чипсі (НЕ tabs, НЕ aria-pressed). `preventScrollReset`.
- **sr-only `role="status" aria-live="polite"`** — «Показано N публікацій».
- **Чипси derived з даних** (`articles` + фіксований `ARTICLE_CATEGORY_ORDER`), не hardcode.
- **SEO:** canonical лишити `siteUrl(location.pathname)` → усі `?category=` фасети консолідуються на `/novyny` (вже коректно). Без noindex, без окремих category-маршрутів.

## Acceptance Criteria
- **AC1.** `/novyny` (без param) → усі статті, чип «Усі» активний (`aria-current`).
- **AC2.** `/novyny?category=guide` → лише статті з `category==='guide'`; відповідний чип активний; інші ні.
- **AC3.** Клік по чипсу змінює URL (client-side, без reload), грид оновлюється миттєво; back/forward відновлює фільтр.
- **AC4.** Чипси — `<Link>` із реальним `href`; `<nav aria-label="Категорії новин">`; активний має `aria-current`; жодного `aria-pressed`.
- **AC5.** sr-only `role="status"` оголошує кількість показаних публікацій.
- **AC6.** Чипси derived з `articles` (фіксований порядок `construction-progress, guide, analysis`, лише наявні), + «Усі». Hardcoded `CATEGORIES` видалено.
- **AC7.** Empty-state: якщо 0 результатів (невідома/порожня категорія) → повідомлення + `<Link to="/novyny">Показати всі</Link>`, не порожній грид.
- **AC8.** Без JS / до hydration: prerendered `/novyny` показує всі статті (fail-open). Reduced-motion: card-fade вже CSS-only й вимикається глобально.
- **AC9.** SEO: canonical на будь-якому `?category=` лишається `/novyny`. News short-updates секція НЕ фільтрується (окремі дані).
- **AC10.** Gates: tsc 0, lint 0, vitest green (+ нові тести), build green.

## Constraints
- Тільки `app/routes/novyny.tsx` + helper у `src/data/articles.ts`. Не чіпати meta()/canonical, не чіпати news-секцію, не додавати залежностей.
- Prerender ssr:false — фільтр суто клієнтський; HTML лишається повним суперсетом.

## Non-Goals
- Pagination, search, per-category counts (поки 1 стаття/категорія), окремі індексовані category-сторінки, фільтр news short-updates.
