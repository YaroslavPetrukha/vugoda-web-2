# Spec — /portfolio Hero Redesign

**Date:** 2026-05-23
**Branch:** `feature/portfolio-hero`
**Bulletproof stage:** 2 (Spec / PRD)
**Reads:** `thoughts/research/2026-05-23-portfolio-hero.md`

---

## Problem

Сторінка `/portfolio` (production, на main після squash `bea7eae`) — єдина з 7 публічних non-project routes що ще НЕ має axiom-driven hero. Поточний state:

- Legacy `PageHero` з декларативним але загальним H1
- **Decorative filter bar з фейковим лічильником "5"** — інформує про 5 проектів, але DOM рендерить тільки 1 (Lakeview)
- Створює plurality mismatch: «Портфель» (catalog) + filter «(5)» + 1 картка → buyer думає «is this all?», bounces
- Не використовує canonical trust signals (`ЄДРПОУ + Технологія + У роботі + Здача`)
- Не reuse-ить design DNA (HeroAmbient, MarkCube, ізометрія) — порушує cross-page coherence з 6 production heroes

## Goal

Single sentence — what success looks like:

> Замінити legacy hero + decorative filter bar на **axiom-driven «System/Method» hero**, який чесно показує позицію «1 активний обʼєкт» як systemic strength, узгоджений з brand-system + 6 existing axiom heroes, без apology і без публікації pipeline проектів.

## Scope

### IN scope
- Новий компонент `src/components/PortfolioHero.tsx`
- Pilot route `app/routes/pilot-portfolio.tsx` для visual approval
- Edit `app/routes.ts` (Write-only — memory rule) — додати pilot entry
- Edit `app/routes/portfolio._index.tsx` — production cutover (тільки після approval):
  - Import PortfolioHero
  - Replace `<PageHero>...` блок на `<PortfolioHero ... />`
  - Видалити decorative filter bar (рядки 49-77 поточного файлу)
  - Додати «Capacity statement» секцію між hero і ProjectCard
  - Зберегти ProjectCard featured (Lakeview) + meta info + «Деталі проекту» CTA
- Cleanup: видалити pilot файли + pilot entry у routes.ts після cutover
- Pre-commit sweep + tsc + build + commit на feature branch
- Verification: live preview через `npm run dev`, mobile + desktop viewports

### OUT of scope
- Subscription gate / email capture (lead-magnet — окрема feature)
- Methodology page link («Як обираємо ділянки», «Технологія») — окремий contentовий розділ
- Refactor `ProjectCard.tsx`, `PageHero.tsx` (used by 5 legacy routes — окрема задача)
- Redesign internal project pages (`/portfolio/lakeview` etc.) — окремий pilot
- Динамічна стадія `У роботі` з live data (фото / phase %) — потребує data source
- Перейменування filter labels (КОРЕКТИВИ §«Фільтри») — філтр повністю видаляється, тому переіменування неактуальне
- A/B test of capacity statement copy
- Squash merge → main (Stage 12, потребує explicit user approval)
- Production deploy

## Acceptance criteria

### A. Brand fidelity (HARD constraint)
- [ ] **A1.** Палітра — тільки з brand-system: bg `#020A0A`, accent `#C1F33D` (точкові дози: CTA, trust value highlight, cube), text `#F5F7FA`, secondary `#A7AFBC`, surface `#3D3B43`. Жодних кольорів поза палітрою.
- [ ] **A2.** Шрифт — тільки Montserrat. Ваги: Bold (H1), Medium (eyebrow/CTA), Regular (body, trust labels). НЕ Light, НЕ ExtraBold.
- [ ] **A3.** Логотип/cube — `MarkCube` reuse з `src/components/`. **НЕ чіпати геометрію** mark.svg (rule `feedback_brandbook_fidelity`). Тільки sizing/viewBox.
- [ ] **A4.** Ambient layer — обов'язково `<HeroAmbient />` без props (default grid 8% + noise 14% soft-light + top fade + bottom vignette). **НЕ** bare solid background (anti-pattern).
- [ ] **A5.** Voice — декларативні короткі заголовки. **Заборонені** слова: «мрія», «найкращий», «унікальний», «преміум», «елітний», «ваш дім мрії». **Дозволені**: «системний девелопмент», «один обʼєкт», «повний цикл», «відкритий стан робіт», «у роботі».
- [ ] **A6.** Cross-page coherence — структура hero (`section.relative.bg-bg-deep.py-12.md:py-16.px-6.lg:px-8.border-b.border-bg-surface.overflow-hidden`) ідентична до InvestorHero/PartnerHero/ApproachHero.

### B. Web-design axioms (10 mandatory, з `feedback_design_axioms.md`)
- [ ] **B1.** Hierarchy — text primary (col 3fr md:order-1) + cube secondary (col 2fr md:order-2). Mobile: text first, cube under.
- [ ] **B2.** 5-second test — title + lead + trust row + CTA читаються одразу. Без декоративних елементів які потребують пояснення.
- [ ] **B3.** Fold ≤650px desktop — `py-12 md:py-16` (як у решта героїв). На viewport ≥768px hero займає ≤650px висоти.
- [ ] **B4.** Trust signals first — 4-cell trust row під hero (`<dl><dt><dd>` semantic) до будь-яких CTA decoration. Тільки **canonical pool** (`project_design_pilots.md` §«Канонічні trust signals»).
- [ ] **B5.** Specificity — конкретні слова: «ЄДРПОУ 44876801», «монолітно-каркас», «ЖК Lakeview · бізнес-клас», «2027». Без округлених узагальнень («багатоповерхове житло»).
- [ ] **B6.** Don't make me think — куб просто малюється (motion pathLength 0→1 on view, як у MarkCube). Без interactive face-hover.
- [ ] **B7.** Mobile-first — cube max-width 240px на sm, 320px на md, 400px на lg. Trust row stacks 2×2 на sm, 4×1 на md+.
- [ ] **B8.** Reduced-motion — `prefers-reduced-motion: reduce` → MarkCube `faceHi=0` (всі грані статичні рівно), HeroAmbient noise 8% (через media query, реалізовано в компоненті).
- [ ] **B9.** Conversion gravity — 1 primary CTA `→ Перейти до Lakeview` (lime button, size=md, у hero) + 1 small text-link `↗ Залишити заявку` (inline, після CTA). **НЕ** 2 повноцінні size=lg кнопки (Hick's Law anti-pattern).
- [ ] **B10.** No anti-patterns — перевірка через `project_design_pilots.md` §«Anti-patterns»:
  - ❌ `mix-blend-mode: overlay` → ✅ use `soft-light` (через HeroAmbient defaults)
  - ❌ «висосані з пальця» trust signals → ✅ тільки canonical pool
  - ❌ 2 повноцінні кнопки primary+ghost wrap → ✅ single primary + text-link
  - ❌ bare solid bg → ✅ HeroAmbient
  - ❌ opacity 4-6% → ✅ defaults 8/14%
  - ❌ SVG text labels → ✅ HTML labels (не використовуємо у цьому hero)
  - ❌ tile-stamp iso-grid bg → ✅ HeroAmbient grid через CSS lines
  - ❌ annotation lines між picture і text → ✅ trust row під hero, не annotations
  - ❌ великий куб + список принципів одночасно → ✅ cube + 1 declarative title + lead + 4 trust cells (не principles list)
  - ❌ делегувати file creation у Frontend Developer subagent → ✅ всі файли я пишу через Write tool сам

### C. Client rules
- [ ] **C1.** Тільки Lakeview публічно. Жодних згадок проектів etno-dim / maetok / nterest / pipeline-04 у hero чи нижче (rule `feedback_portfolio_lakeview_only`).
- [ ] **C2.** Decorative filter bar — повністю видалений. Жодних counts чи stage labels.
- [ ] **C3.** «Pipeline» / «Чотири проекти у роботі» / «Як читати стадії» — повністю видалені (КОРЕКТИВИ §«Сторінка Портфель»).
- [ ] **C4.** Жодних «ліцензія» / «27.12.2019» / «ліцензований» у user-visible copy (rule `feedback_no_license_date`). Verify через grep before commit.
- [ ] **C5.** Capacity statement (UX research Option A) — нейтральна формулировка про дисципліну дозвільних процедур. Заборонено: «скоро», «у розробці», «coming soon», silhouetted cards, vague pipeline hints.

### D. Technical
- [ ] **D1.** TypeScript strict — 0 errors (`npx tsc --noEmit`)
- [ ] **D2.** Build — 10 routes prerendered (pilot route додається, потім видаляється; production count незмінний)
- [ ] **D3.** Lint — 0 errors (`npm run lint` якщо доступно)
- [ ] **D4.** Existing tests — pass (smoke tests на portfolio routes — meta tags, render). Не змінюємо.
- [ ] **D5.** `app/routes.ts` — модифікується тільки через `Write` (повний файл), НЕ через `Edit` (rule `feedback_routes_ts_linter_override`).
- [ ] **D6.** Bundle size — додавання <5KB до route chunk (PortfolioHero ~180 LoC, без heavy deps).

### E. Workflow rules
- [ ] **E1.** Pilot route `app/routes/pilot-portfolio.tsx` створений перед prod cutover (rule `feedback_local_preview_first`).
- [ ] **E2.** Pilot route видалений + routes.ts cleaned ПІСЛЯ cutover і approval. Не залишати orphan pilot routes.
- [ ] **E3.** Pre-commit sweep one-liner passed (license / dirty-olive / orphan pilots / tsc / build) — rule `feedback_pre_commit_sweep`.
- [ ] **E4.** `git branch --show-current` = `feature/portfolio-hero` ПЕРЕД кожною серією edits (rule `feedback_branch_awareness`).
- [ ] **E5.** Frontend Developer subagent НЕ використовується для file creation (rule `feedback_agent_worktree_trap`). Файли пишу через Write/Edit особисто.

### F. Verification
- [ ] **F1.** Live preview `npm run dev` на http://localhost:3000/pilot-portfolio:
  - Hero renders без console errors
  - Cube draws on view (motion animation)
  - HeroAmbient layers видимі (grid + noise) на dark bg
  - Trust row 4 cells правильно spaced
  - Primary CTA hover state working (transitions to text-primary bg)
  - Text-link secondary CTA — underline on hover
- [ ] **F2.** Mobile viewport (375px width): cube НЕ перекриває title, trust row stacks 2×2, CTA primary full-width (як у ContactForm після `c113db3`).
- [ ] **F3.** Production cutover preview `/portfolio` — Lakeview featured card зберігається, meta info нижче, «Деталі проекту» CTA працює, capacity statement render-ed.
- [ ] **F4.** Reduced-motion check — Chrome DevTools `prefers-reduced-motion: reduce` → cube статичний, noise opacity 0.08.

## Non-goals

Explicitly NOT doing:

- Не редизайн всієї `/portfolio` сторінки нижче hero (тільки hero + capacity statement + filter bar removal)
- Не зміна data layer `src/data/projects.ts` (Lakeview record + інші стають routing-only)
- Не зміна `ProjectCard.tsx` API (variants, props зберігаються)
- Не зміна `app/root.tsx` SEO meta global (sitemap, robots)
- Не A/B test infrastructure
- Не analytics events / GA4 instrumentation (поза scope hero pilot)
- Не legal page rewrite (`/rekvisity` etc.)
- Не PWA changes, не manifest, не favicons

## Constraints

### Hard (cannot violate)

1. **Pattern C** з research — System/Method hero. **НЕ** Pattern A/B/D/E (всі мають порушення brand або client constraints).
2. **Тільки Lakeview публічно** — 0 згадок інших 4 проектів у user-visible copy чи DOM (rule `feedback_portfolio_lakeview_only`).
3. **Канонічний пул trust signals** — тільки набір з `project_design_pilots.md` §«Канонічні trust signals». Жодних «висосаних» сигналів.
4. **Brandbook fidelity** — mark.svg / isometric-grid.svg геометрія БЕЗ змін. Тільки sizing/viewBox.
5. **`app/routes.ts` Write-only** — повний файл переписується, не Edit окремих рядків.
6. **Pilot перед prod** — `pilot-portfolio.tsx` route існує, я перевіряю його сам, потім запитую user про approval для cutover.

### Soft (default, can override з обґрунтуванням)

1. `PortfolioHero` props shape — за умовчанням mirror InvestorHero (eyebrow, title, lead, trust, children). Override якщо capacity statement вимагає extra prop.
2. Cube position — за умовчанням md:order-2 right column. Override якщо тести покажуть кращий CLS з left column.
3. Cube animation — за умовчанням `MarkCube` baseline (draw on view, без faceHi). Override якщо клієнт хоче subtle hover interactivity (але тільки після approval).
4. Capacity statement — за умовчанням окрема секція під hero, перед ProjectCard. Override якщо UX тест покаже що краще inside hero (але це збільшить fold).

## Dependencies

- Existing components: `HeroAmbient`, `MarkCube`, `Button`, `FadeIn`, `ProjectCard` (всі є у `src/components/`)
- Existing data: `src/data/projects.ts` — Lakeview record (slug='lakeview')
- Existing tokens: Tailwind classes `bg-bg-deep`, `text-text-primary`, `text-text-secondary`, `border-bg-surface`, `bg-accent`, `text-accent` (через `@theme` у `src/index.css`)
- React Router v7 framework mode — `app/routes.ts` keyed routing
- Memory rules (всі вище зацитовані)

## Risks

| Ризик | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Capacity statement copy звучить defensive | High | Medium | 2-3 drafts on Stage 3 plan, фінал — найфактовіший. User review before commit. |
| Mobile fold breaks ≤650px з кубом + текстом | Medium | Low | Mirror InvestorHero responsive pattern (3fr/2fr → 1col). Manual viewport test (Stage 4 verification). |
| `app/routes.ts` linter revert | Medium | Medium | Write повний файл, не Edit. Перевірка post-write через Read. |
| TS strict — `PortfolioHero` props mismatch | Low | Low | Mirror InvestorHero props shape (типизація вже відпрацьована). |
| Pre-existing smoke tests fail після cutover | Low | Low | Tests перевіряють meta tags + render, які зберігаються. Якщо є snapshot — оновити. |
| User не approve-ить capacity statement copy на pilot | Medium | Medium | Pilot з 2-3 варіантами тексту, AskUserQuestion з previews для вибору. |
| Cutover вводить regression на 5 legacy routes що ще на PageHero | Low | Low | Не чіпаємо PageHero.tsx чи інші routes. Тільки portfolio._index.tsx. |

## Success metric (post-deploy, для майбутньої сесії)

Якщо станемо deployʼити (Stage 12, окремий approve):
- Bounce rate на `/portfolio` ↓ vs baseline (через 2 тижні, GA4)
- Click-through rate на `/portfolio/lakeview` ↑
- Inbound заявок з `/portfolio` як landing → /kontakty ↑

Зараз — ці метрики не вимірюються формально. Якісний критерій: клієнт (Олексій) approve-ить візуал.

## Out

Spec finalized. Перехід до Stage 3 (Planning) — мапімо acceptance criteria у конкретні файли + кроки + Challenge Loop.
