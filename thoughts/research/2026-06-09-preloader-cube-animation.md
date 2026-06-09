# Brainstorm / Research — Site-load Preloader (Vugoda cube)

**Date:** 2026-06-09
**Task:** Клієнт хоче анімацію завантаження сайту, що переживикористовує улюблений анімований куб ВИГОДА. Має бути швидко, ефектно, якісно.
**Mode:** bulletproof Stage 1 (research-only, no code). 3 parallel agents.

---

## 1. Що вже є (codebase facts)

**Анімований куб = `src/components/MarkCube.tsx`** (motion/react v12.23, React 19).
- 3 зовнішні лаймові (#C1F33D) грані малюються через `pathLength: 0→1`, тривалість **1.0s кожна**, **stagger 0.32s** (грань 0 @0ms, 1 @320ms, 2 @640ms), easing **`cubic-bezier(0.65, 0, 0.35, 1)`**.
- `fillOpacity 0→0.6` проявляється @ +0.8s; `strokeOpacity 0.95→0` гасне @ +0.9s.
- 3 внутрішні «вирізи» (#020A0A) `opacity 0→1` @ +1.1s.
- **Повний reveal ≈ 2.0–2.1s.** Тригер: `useInView({ once: true })` — одноразово при скролі.
- Геометрія = `/public/mark.svg`. Той самий контур, що клієнт надіслав.
- Варіанти куба: `IsometricCubePlaceholder` (статичний img), `PartnerHero` (інтерактивний цикл граней), watermark у `ContactsHero`. Сітка `InvestorHero` — окремий asset.

**Стек/boot:**
- RR v7.15, **`ssr:false`**, **prerender** кожного маршруту в окремий `index.html` (11+ маршрутів). React 19 `hydrateRoot(document, …)`.
- `app/root.tsx`: `<App>` обгорнутий `<MotionConfig reducedMotion="user">`. **Немає** `HydrateFallback`, немає preloader.
- Tailwind v4 `@theme` (`src/index.css`): `--color-bg-base:#2F3640`, `--color-bg-deep:#020A0A`, `--color-accent:#C1F33D`, `--accent-rgb:193 243 61`. Шрифти self-hosted (`@fontsource/montserrat`).
- Глобальний `@media (prefers-reduced-motion: reduce)` вже вбиває анімації.
- ⚠ **Ризик білого спалаху:** фон body встановлюється лише через CSS; до завантаження CSS можливий default-white. Треба фон на `<html>` inline.

---

## 2. Best-practice висновки (web research, з джерелами)

1. **LCP не страждає** від повноекранного сплеша — Google **фільтрує full-viewport overlay** з кандидатів LCP (web.dev/lcp). Реальний ризик — НЕ тримати/не відкладати рендер справжнього героя. Hero вже у prerendered HTML, тому overlay над ним не зсуває LCP.
2. **Тривалість:** тримати **~0.8–1.5s** (Nielsen: 1s — межа «потоку думки», 10s — межа уваги). Не «доганяти» анімацію штучною затримкою.
3. **Коли показувати:** лише на **hard load**. **НЕ** програвати на client-side навігації RR (типова помилка, що робить SPA «повільним»). «Once per session» дає мало користі на prerendered SPA (сплеш все одно малюється у статичному HTML до JS) і додає FOUC-вектор.
4. **Архітектура для RR v7:** export `HydrateFallback` з `root.tsx` → запікається у статичний `index.html`, **малюється миттєво, 0 JS**. CSS — **inline у `<head>`**, темний фон на `<html>` + `<meta theme-color>` → без білого спалаху. Overlay `fixed inset-0` → **CLS=0**.
5. **Анімація — CSS-only:** для one-shot reveal CSS достатньо; GSAP (~25–32KB) НЕ виправданий. Принцип «анімуй лише transform/opacity» для 60fps; `stroke-dashoffset` draw для одного лого — дешево й стандартно.
6. **A11y:** `prefers-reduced-motion` → статичне лого + миттєвий fade; overlay `aria-hidden` (декоративний) АБО `role=status aria-busy`; без focus-trap.
7. **Failsafe (критично):** подвійний — (a) CSS-keyframe авто-гасить overlay до `opacity:0;pointer-events:none` на ~4s навіть БЕЗ JS; (b) JS `setTimeout` force-hide на ~3s. Сплеш ніколи не «застрягає».

**КЛЮЧОВИЙ ІНСАЙТ:** улюблена анімація = stroke-draw + fill/opacity sequence. Це **відтворюється 1:1 у чистому CSS** (та сама геометрія, той самий stagger, той самий cubic-bezier, той самий fill-reveal). CSS-версія візуально ідентична motion-версії, але малюється на byte 0 і не важить нічого. → Немає компромісу «улюблена анімація VS швидко».

---

## 3. Архітектурні опції

| | A. Prerendered CSS (HydrateFallback) | B. Motion/react `<Preloader>` після mount | C. Гібрид |
|---|---|---|---|
| Коли малюється | byte 0 (статичний HTML) | після завантаження JS + mount | byte 0 |
| Анімує | CSS keyframes (репліка куба) | точні motion-варіанти MarkCube | CSS малює, motion підхоплює |
| LCP/perf | ✅ найкраще, 0 JS | ❌ герой вже намальований → сплеш накриває намальоване (anti-pattern) | ✅ але складніше |
| Точність до оригіналу | ~99% (репліка) | 100% (той самий код) | 100% |
| Складність | низька | висока (треба ховати контент до mount) | висока |
| **Вердикт** | **★ Рекомендовано** | відхилено | надлишково |

→ **Архітектура A.** B відхилена: сплеш на motion малюється ПІСЛЯ того, як prerendered герой уже на екрані — або накриває намальоване (блимання), або вимагає ховати контент і губити LCP. C — зайва складність заради 1% точності.

---

## 4. Креативні напрями (що саме бачить користувач)

**Концепт 1 — «Чиста збірка» (faithful).** Куб по центру на тлі `#020A0A`, точний 3-гранний staggered draw + fill reveal (~1.2–1.4s), потім увесь overlay fade-out (~0.4s) відкриває сторінку. Мінімалізм, преміально, максимально близько до улюбленого. *Найбезпечніше.*

**Концепт 2 — «Збірка + підпис».** Куб малюється → знизу проявляється вордмарк «ВИГОДА» з тонким лаймовим hairline-прогресом 0→100% по нижньому краю. Більше «брендовий сплеш». ~1.4–1.6s.

**Концепт 3 — «Конструктор» (thematic, для забудовника).** До draw додається «зведення»: кожна грань-ромб «виростає» на місце (translateY+opacity, GPU-cheap) — метафора будівництва. Тонка лінія-«ґрунт». Найбільш ефектно й тематично. ~1.5s.

**Концепт 4 — «Розкриття» (exit-focused).** Куб малюється швидко (~0.9s), далі overlay не просто гасне, а **розходиться під 30° ізо-кутами куба** (transform-wipe), відкриваючи героя. «Вау» в exit. Трохи складніше, але лише transform.

---

## 5. Рекомендація

**Архітектура A + Концепт 1 (база), з опційним апгрейдом до Концепту 3.**
- Один компонент-репліка куба в CSS, inline критичний CSS у `<head>`, темний фон на `<html>`.
- ~1.2s reveal, hard-load only, без replay на SPA-навігації.
- reduced-motion → статичне лого + миттєвий fade.
- Подвійний failsafe (CSS 4s + JS 3s).
- Зберігаємо точний stagger 0.32s + cubic-bezier(0.65,0,0.35,1) з MarkCube → візуальна тяглість бренду.

**Розмір задачі:** M (3–6 файлів: root.tsx head/HydrateFallback, новий Preloader CSS-компонент/markup, index.css keyframes, маленький inline-script hide + failsafe, тест). Далі — Stage 2 Spec → Stage 3 Plan → реалізація на feature-гілці з PR-preview.

---

## 6. LOCKED DECISIONS (клієнт, 2026-06-09)

- **Концепт 3 — «Конструктор».** Грані-ромби «виростають» на місце (translateY + opacity) ПЛЮС stroke-draw + fill reveal; тонка лінія-«ґрунт». ~1.5s. Метафора будівництва.
- **Раз на сесію.** Перший hard-load сесії → повна анімація; наступні hard-reload у тій самій сесії → миттєвий/скорочений вихід.
- **Тільки куб.** Без вордмарка/тексту → швидше, без font-dependency, без CLS-ризику.
- **Архітектура A** (prerendered CSS `HydrateFallback`, dark bg inline, без replay на SPA-навігації, reduced-motion → static, подвійний failsafe).

### ⚠ Технічний нюанс «раз на сесію» на prerendered SPA
Сплеш запечений у статичний HTML → малюється на byte 0 на КОЖНОМУ hard-load, ще ДО JS. Тому `sessionStorage`-прапорець не може скасувати першу мальовку. Що він РОБИТЬ: inline `<head>`-скрипт читає прапорець синхронно (до paint) і, якщо «вже бачив», додає клас на `<html>` (напр. `data-splash=seen`), який змушує overlay **пропустити build-анімацію і згаснути майже миттєво** (швидкий opacity-out ~0.2s). Перший раз сесії → повний «Конструктор» ~1.5s, потім `sessionStorage.setItem('vg_splash','1')`. Прапорець читається до першого paint → жодного блимання.

### Параметри анімації (з MarkCube, зберегти тяглість)
- stagger граней **0.32s**, easing **cubic-bezier(0.65, 0, 0.35, 1)**
- draw 1.0s/грань, fill-opacity→0.6 @ +0.8s, inner cutout @ +1.1s
- «зведення»: translateY ~ +14px→0, синхронно з draw кожної грані (лише transform/opacity = 60fps)
- exit fade overlay ~0.4s ease-out; reduced-motion → без translateY/draw, статичний куб + 0.15s fade
- failsafe: CSS auto-hide @4s + JS setTimeout force-hide @3s

### Наступні кроки (bulletproof)
Stage 2 Spec → Stage 3 Plan (+ challenge loop) → Stage 4 реалізація на `feature/preloader-cube` → gates (tsc/lint/vitest/build) → PR → CF preview → merge. Розмір: **M**.

---

## Джерела
web.dev/articles/lcp · web.dev/articles/optimize-lcp · nngroup.com response-time-limits · reactrouter.com/how-to/spa · reactrouter.com/how-to/pre-rendering · RR issues #12699/#13473 · svgai.org SVG encyclopedia · motion.dev gsap-vs-motion · css-tricks prefers-reduced-motion · joshwcomeau reduced-motion · Pope Tech accessible-animation · Productboard 300ms-delay
