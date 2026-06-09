# Research — Scroll-to-top button

**Date:** 2026-06-09 · **Task:** Додати логічну, продуману кнопку прокрутки вгору · **Size:** S (1 new component + 1-line wire)

## Problem
On long pages (/portfolio/lakeview, /novyny, /pidkhid) the user has no fast way back to the top / to the nav + primary CTA. A scroll-to-top affordance reduces friction on mobile especially.

## Codebase findings
- **Mount point:** `src/components/Layout.tsx` is the shared visual shell (NavBar + `<main>` + Footer), applied to every route via `app/routes.ts → layout(...)`. The button belongs here, after `<Footer/>`, so it overlays all routes. (`app/root.tsx`'s `Layout` is the HTML document — wrong place.)
- **Already-solved analog:** `Layout.tsx` already does `window.scrollTo(0,0)` on `location.pathname` change (route-change reset). Our button is the *manual, within-page* complement — no conflict.
- **Brand tokens** (`src/index.css`): brandbook **excludes circular forms** — radius max `--radius-md: 4px`; `rounded-none` is the house style. → **square button, not a circular FAB.** `--color-accent` (acid-lime) is explicitly **"point-use: CTA, active, focus"** → reserve loud lime for conversion CTAs; the scroll-top utility should be quieter chrome (dark surface + border) that lights up lime on hover/focus.
- **z-index map:** splash `9999`, NavBar sticky `50`, mobile menu fixed `40`, `<main>` `10`, decorative lines `0`. → button at **z-30**: above content, below the mobile menu (so it never covers an open menu) and navbar.
- **Reduced-motion:** global `@media (prefers-reduced-motion: reduce)` in `index.css` collapses all transition/animation durations to `0.01ms` and forces `scroll-behavior:auto`. JS smooth-scroll bypasses CSS `scroll-behavior`, so the component must check `matchMedia('(prefers-reduced-motion: reduce)')` itself and pass `behavior:'auto'`. Established pattern: `PartnerHero.tsx` / `HeroAmbient.tsx` use `window.matchMedia` in a client `useEffect`.
- **Icons:** `lucide-react ^0.546` available (NavBar uses `Menu`/`X`). Use `ArrowUp` (clear "to top" semantics).
- **Focus ring:** global `button:focus-visible` already gives accent outline + dark halo — no per-component focus CSS needed.
- **Tests:** vitest + RTL, `tests/setup.ts` mocks `matchMedia` (matches:false) / observers. `jsdom` lacks `window.scrollTo` → mock it in the test. Pattern dir: `tests/unit/*.test.tsx`.

## Best-solution conclusion
Self-contained **client-only** component `src/components/ScrollToTop.tsx`, always mounted in `Layout.tsx`:
- Visibility toggled by scroll position (`scrollY > ~one viewport`), listener `passive` + `requestAnimationFrame`-throttled.
- Always rendered (enables CSS fade/translate transition); when hidden → `opacity-0 translate-y-2 pointer-events-none`, `tabIndex=-1`, `aria-hidden` (no hidden tab-stop).
- Square, dark surface (`bg-bg-deep/90` + `border-border`), hover/focus → `border-accent text-accent`; `ArrowUp` icon; `aria-label="Прокрутити вгору"`.
- Click → `window.scrollTo({top:0, behavior: reducedMotion ? 'auto' : 'smooth'})`.

Rejected: circular FAB (violates brandbook no-circles); loud lime fill (competes with "Заявка" CTA, against point-use rule); `motion/react` animation (CSS transition is SSR-safe + lighter, matches `FadeIn`/`Splash` CSS-first house style).

**Acceptance:** appears only after meaningful scroll; returns to top smoothly (instant under reduced-motion); keyboard-reachable only when visible; no CLS (fixed); brand-consistent (square, quiet→lime); 0 tsc/test errors.
