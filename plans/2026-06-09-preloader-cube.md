# Plan — Preloader cube «Конструктор»

**Spec:** `specs/2026-06-09-preloader-cube.md` · **Branch:** `feature/preloader-cube`

## Challenge Log
1. **Solves the problem?** Так — кожен AC покритий (markup у HTML→AC1/7; CSS keyframes→AC2/3; head script→AC4; root placement→AC5; media query→AC6; CSS+JS failsafe→AC8; aria-hidden→AC9; gates→AC10).
2. **Most efficient?** Альтернативи: (a) motion/react `<Preloader>` після mount — відхилено (малюється після того, як герой уже на екрані → блимання, ризик LCP); (b) HydrateFallback — відхилено (RR #12699 gotcha для non-root + prerender кладе у HTML реальний контент, не fallback); (c) **CSS-overlay у Layout** — ✅ обрано: byte-0 paint, 0 JS-залежність анімації, framework-version-independent, працює на всіх prerendered + SPA-fallback маршрутах.
3. **Code for code's sake?** Ні — не чіпаємо MarkCube/інші; лише root.tsx + index.css + новий компонент + тест.

## Architecture
`#vg-splash` рендериться у `Layout`'s `<body>` (sibling до `{children}`) → запікається у статичний HTML кожного маршруту. Уся анімація — CSS keyframes у `index.css` (render-blocking stylesheet → стилі на першому paint). Inline `<head>`: (1) `<style>` темний фон на html (anti-white-flash); (2) sync `<script>` читає `sessionStorage` → клас `vg-seen`. React (App) лише ставить JS-failsafe. На SPA-навігації компонент не ремоунтиться → анімація не повторюється.

## Phases (single phase — M)
### Phase 1: Splash component + CSS + root integration + test
**Files:**
- `src/components/Splash.tsx` (new) — `<div id="vg-splash" aria-hidden>` → wrap → `<svg>` 3×`<g.vg-face style="--i:n">`(outer+inner) + `.vg-ground`. Чистий статичний JSX, без хуків/Date/random (hydration-safe).
- `src/index.css` (append) — keyframes `vg-grow / vg-draw / vg-fill / vg-inner-in / vg-ground-in / vg-splash-out`; селектори `#vg-splash`, `.vg-face/.vg-outer/.vg-inner/.vg-ground`; `html.vg-seen …` fast-path; `@media (prefers-reduced-motion: reduce)` explicit override (zero delay).
- `app/root.tsx` (edit) — inline `<style>` + `<script>` у `<head>`; `<Splash/>` у `<body>`; failsafe `useEffect` у App (`setTimeout(()=>el.style.display='none',3000)`).
- `tests/unit/splash.test.tsx` (new) — рендерить Splash, перевіряє `#vg-splash[aria-hidden=true]`, 3 `.vg-face`, 3 `.vg-outer` з `pathLength=1`.

**Timing constants (snappy ~1.3s):**
stagger `var(--i)*0.18s`; grow 0.6s; draw 0.7s (cubic-bezier(0.65,0,0.35,1)); fill 0.4s @ +0.5s (fill-opacity→0.6, stroke-opacity→0); inner 0.3s @ +0.7s; ground 0.6s @ +0.3s; splash-out 0.4s @ 1.25s forwards.

**Edge cases handled:**
- sessionStorage throws (private mode) → try/catch → сплеш просто грає щоразу (graceful).
- JS вимкнено → CSS сам грає й ховає overlay (failsafe keyframe).
- reduced-motion → explicit override: overlay зникає миттєво (не чекає 1.25s).
- hydration mismatch → markup детермінований, ідентичний на prerender/client.
- React vs DOM: Splash статичний (без state) → React не чіпає після hydrate → ручний `display:none` failsafe безпечний.

## Gates
`npx tsc --noEmit` · `npm run lint` · `npm test` · `npm run build` + grep build/client для `#vg-splash` присутній і для `2019` відсутній (regression).

## Verification
Local preview (`npm run build && preview`) + Playwright screenshot home — overlay видно, потім зникає; reduced-motion emulate — миттєвий вихід.
