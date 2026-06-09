# Spec — Site-load Preloader (Vugoda cube «Конструктор»)

**Date:** 2026-06-09 · **Size:** M · **Research:** `thoughts/research/2026-06-09-preloader-cube-animation.md`

## Problem
Клієнт хоче брендовану анімацію завантаження сайту, що переживикористовує улюблений анімований куб ВИГОДА. Має бути швидко, ефектно, якісно — і не шкодити SEO/Core Web Vitals.

## Goal
Повноекранний сплеш на темному тлі з кубом, що «зводиться» (метафора будівництва), показується **раз на сесію** при hard-load, плавно зникає й відкриває сайт.

## Scope
- Новий presentational компонент куба-сплеша (CSS-driven, без motion/react).
- Інтеграція у `app/root.tsx`: markup у статичному HTML + inline критичний CSS/скрипт у `<head>`.
- Splash keyframes у `src/index.css`.
- Юніт-тест.

## Acceptance Criteria
- **AC1.** Сплеш малюється у prerendered HTML (byte 0), без білого спалаху перед ним (темний фон на `<html>` inline).
- **AC2.** Анімація «Конструктор»: 3 лаймові грані `translateY→0` + stroke-draw + fill-reveal, stagger ~0.18s, easing `cubic-bezier(0.65,0,0.35,1)`; тонка лінія-«ґрунт» під кубом. Тільки куб, без тексту.
- **AC3.** Повний reveal ≤ ~1.4s, потім overlay fade-out ~0.4s. Без штучних затримок понад анімацію.
- **AC4.** **Раз на сесію:** перший hard-load сесії → повна анімація; наступні → миттєвий вихід (~0.25s, куб у фінальному стані). Прапорець читається синхронно до paint → без блимання.
- **AC5.** **Не** програється на client-side навігації RR (лише hard-load).
- **AC6.** `prefers-reduced-motion: reduce` → без руху, миттєвий вихід (без 1.25s очікування).
- **AC7.** Overlay `fixed inset-0` → **CLS = 0**; герой prerendered за ним → LCP не страждає (Google фільтрує full-viewport overlay).
- **AC8.** **Failsafe:** сплеш ніколи не «застрягає» — CSS авто-hide наприкінці анімації + JS `setTimeout` force-hide @3s навіть якщо CSS/JS частково впав.
- **AC9.** A11y: overlay `aria-hidden="true"`, без focus-trap, без фокусованих дітей.
- **AC10.** Gates: `tsc` 0, `lint` 0, `vitest` green (+ новий тест), `build` green, 0 «2019»/license regressions (pre-commit sweep).

## Constraints
- Stack: RR v7.15 `ssr:false` prerender, React 19, Tailwind v4 `@theme`, motion/react вже є.
- CSS-only анімація (0 KB бандла; не додавати GSAP).
- Кольори з токенів: bg-deep `#020A0A`, accent `#C1F33D` / `--accent-rgb`.
- Геометрія куба = `public/mark.svg` (ті самі path-и, що в `MarkCube.tsx`).

## Non-Goals
- Не чіпати `MarkCube.tsx` та інші hero-компоненти.
- Без progress-бару реального завантаження, без вордмарка/тексту.
- Без per-route splash на SPA-навігації.
