# Research — /novyny category filter (best practices)

**Date:** 2026-06-09 · bulletproof Stage 1 · general-purpose research agent + codebase map.

## Ground truth (codebase)
- `app/routes/novyny.tsx`: чипси `CATEGORIES=['Усі','Хід будівництва','Гід покупця','Аналітика']` — `<button aria-pressed>` БЕЗ onClick (декоративні). `articles.map()` рендерить усі.
- `ArticleCategory` (types.ts): `construction-progress | guide | analysis`. Article `category`+`categoryLabel`:
  - construction-progress → «Хід будівництва» (lakeview-progress)
  - guide → «Гід покупця» (chek-list)
  - analysis → «Аналітика» (frankivskyi)
- `useSearchParams` вже вживається у `diakuyu.tsx`. `preventScrollReset` ще ні.
- Canonical у meta() = `siteUrl(location.pathname)` → query виключено (вже SEO-коректно).

## Decisions (з рекомендацій агента, з джерелами)
1. **URL state** `useSearchParams` (`?category=slug`), не `useState` — shareable, back/forward, bookmark. SPA-prerender: query НЕ дає окремого HTML → prerendered `/novyny` = повний суперсет, клієнт фільтрує. [reactrouter useSearchParams, LogRocket]
2. **`<Link>`, не `<button>`** — фільтр = навігація на нову URL-адресу; anchor дає crawlable href + open-in-new-tab + прогресивне покращення (fail-open без JS). [Vispero, TestParty]
3. **ARIA = links + `aria-current`**, НЕ tabs (tabs = panel-swapping з arrow-key контрактом, хибна модель для фільтрації), НЕ `aria-pressed` (це in-place toggle, не навігація). `<nav aria-label="Категорії новин">`. [W3C APG Tabs, Vispero]
4. **aria-live polite** sr-only `role="status"` — «Показано N публікацій» (DOM оновлюється без focus-move → SR не отримає feedback інакше).
5. **Focus/scroll:** не красти фокус; `preventScrollReset` щоб не стрибати вгору.
6. **SEO faceted-nav:** canonical-to-base (вже є) — правильно; БЕЗ noindex, БЕЗ окремих category-URL (thin duplicates). [Google faceted-nav, SearchEngineLand]
7. **Derive чипси з даних** (фіксований `ARTICLE_CATEGORY_ORDER`, лише наявні) + «Усі» — проти drift (чип без статей / категорія без чипа). [NN/g filter categories]
8. **UX:** «Усі» default; миттєве застосування (exploratory); empty-state + reset якщо 0; без counts поки мало статей; не ламати фільтр на сторонніх діях. [NN/g applying-filters]

## Recommendation
URL-driven `<Link>` чипси у `<nav aria-label>` з `aria-current`, derived з `articles`, фільтр `active ? articles.filter(a=>a.category===active) : articles`, sr-only count, empty-state+reset, canonical без змін. Файли: `novyny.tsx` + helper у `src/data/articles.ts`.

## Sources
reactrouter.com/api/hooks/useSearchParams · blog.logrocket.com/url-state-usesearchparams · developers.google.com/crawling/docs/faceted-navigation · w3.org/WAI/ARIA/apg/patterns/tabs · vispero.com what-state-aria-in · nngroup.com applying-filters + filter-categories-values · MDN prefers-reduced-motion
