# Plan — /novyny category filter

**Spec:** `specs/2026-06-09-novyny-category-filter.md` · **Branch:** `feature/novyny-category-filter`

## Challenge Log
1. **Solves problem?** Так — кожен AC покритий (URL-state→AC2/3; Link/ARIA→AC4; live→AC5; derive→AC6; empty→AC7; prerender fail-open→AC8; canonical untouched→AC9).
2. **Most efficient?** Alt: (a) useState — відхилено (не shareable/back-forward); (b) buttons+setSearchParams — відхилено (не anchor, без прогресивного покращення/crawl); (c) tabs ARIA — відхилено (хибна модель); **(d) `<Link>`+aria-current+useSearchParams** — ✅ бест-практіс, мінімум коду, derived з даних.
3. **Code for code's sake?** Ні — лише novyny.tsx + helper у articles.ts. meta/canonical/news-секція не чіпаються.

## Phase 1 (single)
**Files:**
1. `src/data/articles.ts` — додати `ARTICLE_CATEGORY_ORDER: ArticleCategory[] = ['construction-progress','guide','analysis']` + `articleCategoryChips = ORDER.filter(present).map(slug→{slug,label})`. Single source для чипсів.
2. `app/routes/novyny.tsx`:
   - import `useSearchParams`, `articleCategoryChips`. Прибрати hardcoded `CATEGORIES`.
   - `const [sp]=useSearchParams(); const active=sp.get('category'); const filtered = active ? articles.filter(a=>a.category===active) : articles;`
   - Чипси: `<nav aria-label="Категорії новин">` + `<Link to={slug?`/novyny?category=${slug}`:'/novyny'} aria-current={isActive?'true':undefined} preventScrollReset>`. «Усі» active коли `!active`.
   - sr-only `<p role="status" aria-live="polite">Показано {filtered.length} публікацій</p>`.
   - Грид рендерить `filtered`; якщо `filtered.length===0` → empty-state + `<Link to="/novyny">Показати всі</Link>`.
3. `tests/unit/novyny-filter.test.tsx` (new) — TDD.

**Test cases (TDD):**
- helper: `articleCategoryChips` = 3 чипи у порядку, slug+label коректні.
- render `<MemoryRouter initialEntries={['/novyny']}>` → 3 article cards, «Усі» має aria-current.
- `?category=analysis` → лише «Аналітика»-стаття; чип analysis active.
- `?category=guide` → лише guide-стаття.
- `?category=bogus` → empty-state + reset link, count «0».
- nav має aria-label; жодного `aria-pressed` у секції чипсів.

**Edge cases:** unknown category→empty-state (recover via reset); active!=null але не співпадає→жоден chip active крім none (ок); news-секція не фільтрується; FadeIn replay на фільтр — CSS-only, reduced-motion-safe (глобальне правило).

## Gates
tsc · lint · vitest (+novyny-filter) · build. + smoke: build/client/novyny/index.html містить усі 3 статті (prerender суперсет, fail-open).

## Verification
Local: тест покриває логіку. Post-merge: live `?category=` фільтрує, back/forward, canonical=/novyny.
