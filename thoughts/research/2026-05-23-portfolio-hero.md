# Research — /portfolio Hero Redesign

**Date:** 2026-05-23
**Author:** Claude (research synthesis)
**Branch:** `feature/portfolio-hero`
**Bulletproof stage:** 1 (Deep Research)

---

## 1. Problem

Поточна сторінка `/portfolio` (`app/routes/portfolio._index.tsx`):
- Використовує legacy `PageHero` блок (без axiom-driven structure)
- Показує **decorative filter bar з фейковим лічильником "5"** (`Фільтр за стадією · Усі (5)`) — informational-only прототип, який натякає на pipeline, але насправді grid рендерить тільки 1 картку (Lakeview)
- Семантичний дисонанс: заголовок «Портфель і pipeline», filter показує "5", page тіло — 1 проект
- Не використовує trust-signal архітектуру з brand-system (ЄДРПОУ / Технологія / У роботі / Здача)
- Не reuse-ить існуючі axiom-driven компоненти

**Чому це баг:** буyer/інвестор/банк бачить filter "5", очікує 5 проектів, скролить — і знаходить лише 1. Це або дезорієнтує (баг), або сприймається як ознака слабкості/невпевненості бренду (анти-marketing).

## 2. Constraints (hard)

### Client rule (Wave 1-5 правок Олексія, 15.05.2026, `КОРЕКТИВИ_КЛІЄНТА.md`)
- ❌ «Блок "Чотири проекти у роботі" (Pipeline) — повністю видалити»
- ❌ «Блок "Як читати стадії" — повністю видалити»
- ✅ Новий вступний текст (тон: «1 обʼєкт у будівництві»)
- 4 інші проекти (etno-dim, maetok, nterest, pipeline-04) існують як дані + окремі route-сторінки, але **публічно НЕ виводяться** на overview

### Brand-system fidelity (з `brand-system.md` + memory)
- Палітра закрита: dark bg `#020A0A` / `#2F3640`, lime accent `#C1F33D` (тільки точково: CTA, активні стани, цифра-лічильник), text `#F5F7FA`, secondary `#A7AFBC`
- Шрифт: Montserrat (Bold для H1/H2, Medium підзаголовки, Regular body)
- Графічна мова: лінійна ізометрія + каркасні куби (stroke 0.5–1.5 pt, opacity 5–60%)
- Тон: чітко, впевнено, предметно, стримано. Заголовки декларативні, короткі. CTA функціональні.
- Заборонено: «мрія», «найкращий», «унікальний», курсив, тіні/глоу/неон, лайм-фон широких блоків

### Project rules (memory)
- `feedback_no_license_date`: НЕ використовувати «ліцензія» / «27.12.2019». Canonical trust signals: ЄДРПОУ + Технологія + У роботі + Здача
- `feedback_brandbook_fidelity`: НЕ чіпати геометрію mark.svg / isometric-grid.svg. Тільки sizing/viewBox
- `feedback_design_axioms`: 10 mandatory web-design axioms (hierarchy / 5-sec test / fold ≤650px / trust signals / specificity / conversion gravity / mobile-first / reduced-motion / cross-device guards / no anti-pattern dirty-olive)
- `feedback_portfolio_lakeview_only`: на /portfolio публічно ТІЛЬКИ Lakeview
- `feedback_local_preview_first`: пілотний route `/pilot-portfolio` перед prod cutover
- `feedback_routes_ts_linter_override`: для `app/routes.ts` використовувати тільки `Write`, не `Edit`
- `feedback_agent_worktree_trap`: НЕ делегувати file creation у Frontend Developer subagent

### Технічний stack (зафіксовано)
- React Router v7 framework mode, `ssr:false + prerender:true`
- Tailwind v4 (custom `@theme` у `src/index.css`)
- `motion/react` v11+ animations
- TypeScript strict
- Cloudflare Pages deploy

## 3. Existing reusable assets (з `src/components/`)

| Компонент | Що дає | Чи можна reuse |
|---|---|---|
| `HeroAmbient.tsx` | Reusable ambient overlay: CSS grid 8% lime + SVG noise 14% (soft-light) + top fade + bottom vignette. Cross-device guards (2dppx + reduced-motion). Уникає dirty-olive | ✅ MUST reuse |
| `MarkCube.tsx` | Inline brand mark.svg, 6 path split (3 outer + 3 inner), motion.path pathLength → fillOpacity 0.6. `faceHi` для hover-highlight + face numbers | ✅ reuse як accent |
| `InvestorHero.tsx` | text 60% + iso-grid landscape 40%, 5 markers. Pattern для iso-grid map | partial reuse — без markers (тільки Lakeview) |
| `PartnerHero.tsx` | «Жива печатка»: куб auto-cycle через 3 trust facts | partial reuse — концепт «document stamp» |
| `PipelineHero.tsx` | Cube-as-hero (primary visual) + Pratfall framing для no-name проекту | NOT reuse — інший контекст |
| `ApproachHero.tsx` | text + trust bar + куб secondary | partial reuse — pattern trust bar |
| `ProjectCard.tsx` | 3 variants (featured / default / placeholder) для проектних карток | ✅ keep — Lakeview featured card нижче hero |

## 4. Research findings (synthesis)

### 4.1 Trend Researcher (real-estate hero patterns)
Перевірено: SAGA, RIEL, Avalon, Greenville (UA), Cain International, NREP, Berkeley Group, Niam (EU/global).

**Key insight:** UA забудовники конкурують через **volume** (28 проектів у RIEL, 18 у Saga) — Vugoda не може грати у цю гру. EU премʼєр-девелопери (Cain $14.4bn AUM, NREP €12.5bn) — рідко показують окремі проекти; натомість показують **categories/platforms + 1-2 case studies + metrics**. Apple-парадигма: одна добре презентована річ перевершує багато погано презентованих.

**5 patterns evaluated:**
- A — «Active Object Spotlight» (single project as hero)
- B — «Platform / Category» (Cain-style)
- C — «System / Method» (NREP + Berkeley restraint) ← **WINNER**
- D — «Map + Stage Markers» (анонімні маркери — РИЗИК: легально close call, клієнт заборонив)
- E — «Receipt / Stamp» (PartnerHero-style — як layer ВСЕРЕДИНІ pattern C)

### 4.2 UX Researcher (conversion behavior)
3 персони на сторінці:
- **Olena (B2C, 60%)**: catalog-mind. Скан: назва + локація + дата здачі + ціна-від + фото. Bounce trigger: «is this all?» + stock renders + no date
- **Ihor (B2B, 20%)**: due-diligence mind. Скан: ЄДРПОУ + completed sqm + general contractor + delivery track record
- **Mariana (Bank/Partner, 20%)**: legal mind. Скан: ЄДРПОУ + юр. адреса + дозвільні + beneficiary

**Trust signal stack** (post-2022 UA: legal signals +3x weight):
1. ЄДРПОУ clickable → YouControl/Opendatabot (single highest)
2. Date-stamped construction photos (proves «у роботі»)
3. Specific delivery quarter (Q4 2027 > 2027)
4. Технологія named (монолітно-каркасна, БІМ, енергоклас)
5. Генпідрядник + архітектор named
6. Banking/escrow partner
7. Founded 2019 + delivered sqm

**Anti-patterns** (single-project):
- ❌ Empty grid 1 card + 4 placeholders («failed to fill»)
- ❌ «Coming soon» картки без дат (instant credibility loss)
- ❌ Filter bar над 1 result
- ❌ Lifestyle stock photos
- ❌ Generic «Ми будуємо мрії»
- ❌ Founder personal story / awards (low ROI для voice)

**Pipeline communication «more without lying»:**
- **Option A (RECOMMENDED):** Capacity statement — «Інші проєкти у підготовці документації, не підлягають публічному анонсуванню до завершення дозвільних процедур»
- Option B: Subscription gate (закриті анонси) — captures B2B leads
- Option C: Methodology page link («Як обираємо ділянки», «Технологія») — proves capability без named projects

**Key reframe:** з «portfolio» (catalog) → «обʼєкт у роботі» (focus). Цей one-line edit вбиває plurality mismatch.

### 4.3 Brand-system alignment (with `brand-system.md`)

| Pattern element | Brand-system rule | Compatible? |
|---|---|---|
| Dark bg `#020A0A` для hero | «темний фон базовий, чорний для зваженого акценту» | ✅ |
| Lime `#C1F33D` тільки на CTA + trust numbers + cube | «точкові дози, ніколи фон широких блоків» | ✅ |
| Iso-cube (MarkCube reuse) | «куб основний модуль, повторюваний візуальний якір» | ✅ |
| HeroAmbient grid 8% + noise 14% | «лінійна ізометрія + каркасні структури, opacity 5-60%, stroke 0.5-1.5pt» | ✅ |
| Trust row 4 cells (ЄДРПОУ / Технологія / У роботі / Здача) | «велика негативна площа, структура сіткою, чіткі поділи тонкими лініями» | ✅ |
| Декларативний H1 «Один обʼєкт. Повний цикл. Відкритий стан.» | «декларативні короткі заголовки, без пафосу, без декоративних слів» | ✅ — точне попадання у voice |
| CTA: «Перейти до Lakeview» + «Залишити заявку» | «CTA функціональні, не емоційні» | ✅ |

**Conclusion:** Pattern C — це не winning «вибір», це **єдиний brand-coherent варіант**. Інші 4 патерни порушують або voice (A — гучний spotlight), або factual constraints (B — categories які не маємо доказів, D — анонімні маркери = ризик), або architecture (E соло — без supporting structure).

## 5. RECOMMENDATION

### Pattern C — «System / Method» hero with E (Receipt/Stamp) elements layered in

**Hero structure (concrete):**

```
┌──────────────────────────────────────────────────────────────────┐
│ // Розділ 03                                                     │
│                                                                  │
│   Один обʼєкт. Повний цикл.            ┌─────────────────────┐   │
│   Відкритий стан робіт.                │                     │   │
│                                        │   [MarkCube wireframe] │
│   Системний девелопмент означає        │   isometric, lime  │   │
│   не масштабувати кількість,           │   #C1F33D          │   │
│   а тримати якість.                    │                     │   │
│                                        │   ↑ animated path   │   │
│   [→ Перейти до Lakeview]              │     length 0→1     │   │
│   [↗ Залишити заявку]                  │                     │   │
│                                        └─────────────────────┘   │
│  ───────────────────────────────────────────────────────────     │
│  ЄДРПОУ        ТЕХНОЛОГІЯ        У РОБОТІ         ЗДАЧА          │
│  44876801      Монолітно-        ЖК Lakeview      2027           │
│                каркас            бізнес-клас                     │
└──────────────────────────────────────────────────────────────────┘
```

- text 60% (md:order-1, primary) + cube 40% (md:order-2, secondary)
- HeroAmbient (grid 8%, noise 14%) — той самий ambient як у InvestorHero/PartnerHero
- 4-cell trust row під hero — **canonical pool only** (`project_design_pilots.md`): ЄДРПОУ 44876801 + Технологія `монолітно-каркас` + У роботі `ЖК Lakeview · бізнес-клас` + Здача `2027`. **НЕ** використовуємо «4 pipeline» (клієнт заборонив), «стартова ціна» (поза scope портфоліо overview), license date
- Eyebrow «// Розділ 03» — у тому ж стилі що pidkhid/investoram
- **CTA (Hick's Law from design_pilots anti-pattern catalog):** single primary button `→ Перейти до Lakeview` + small text-link `↗ Залишити заявку` secondary. **НЕ** 2 повноцінні size=lg кнопки які wrap на mobile
- Mobile-first: cube згортається або зменшується до 200px max, text стає primary

**Below the fold (зберігаємо існуючу structure, прибираємо decoration):**
1. **Lakeview featured card** (existing ProjectCard, variant=featured) з labels-stack
2. **Capacity statement** (UX Option A): один блок з трьома короткими реченнями про дисципліну дозвільних процедур (не «coming soon»)
3. **Lakeview meta** (Параметри / Адреса / Опис — як зараз, але reword з КОРЕКТИВИ)
4. **CTA repeat** «Деталі проекту» → /portfolio/lakeview

**Що ВИДАЛЯЄМО:**
- ❌ Decorative filter bar з фейковим «(5)» — анти-pattern (sad UX, exposes scarcity)
- ❌ Eyebrow «Портфель і pipeline» → «Розділ 03» + новий H1
- ❌ Згадки «4 на стадіях меморандуму…» — клієнт викреслив

### Чому це найкращий варіант (Challenge Loop preview)

**Q1 — Does this solve the problem?**
- Усуває фейковий «(5)» — yes
- Bring brand fidelity на overview — yes (зараз єдина legacy сторінка без axiom hero серед production routes)
- Зберігає Lakeview як primary focus — yes
- Конвертує до /portfolio/lakeview та /kontakty — yes (2 CTA, conversion gravity axiom)
- Чесна позиція «1 обʼєкт» без apology — yes (Pattern C reframe)

**Q2 — Is this the most efficient solution?**
- Vs Pattern A (single spotlight) — порушує brand restraint, гучний
- Vs Pattern B (categories) — потребує доказів які не маємо (BIM/sertyfication/team)
- Vs Pattern D (map markers) — легально-маркетинговий ризик, клієнт заборонив pipeline references
- Vs Pattern E (receipt soло) — solo занадто корпоративно, треба soft entry
- Pattern C reuses 100% existing assets (HeroAmbient + MarkCube + ProjectCard + trust tokens) — мінімальний код-приріст: 1 новий компонент (`PortfolioHero.tsx`) + edit existing route + pilot route entry

**Q3 — Is there code-for-code's-sake?**
- НІ — кожен елемент tied до acceptance criteria
- НЕ робимо: subscription gate (поза scope), methodology link (поза scope), новий ProjectCard variant (не треба), redesign internal pages (поза scope)
- НЕ refactor: ProjectCard.tsx, PageHero.tsx (used by 6 other legacy routes — окрема задача)

## 6. Open questions (decision forks for Stage 3 plan)

Q1 — **Filter bar — повністю видалити чи замінити на capacity statement?**
- Recommend: **повністю видалити**. Filter над 1 елементом — UX анти-pattern. Capacity statement замінює функцію «hint at pipeline» етично.

Q2 — **Cube — passive wireframe чи з face-hover interactivity?**
- Recommend: **passive wireframe з drawing animation on view** (як baseline MarkCube without faceHi). Interactivity відволікає від primary CTA. Куб тут — brand anchor, не interactive object.

Q3 — **Capacity statement — у hero чи окремою секцією?**
- Recommend: **окрема секція under hero**, перед Lakeview card. Усередині hero перевантажує fold.

Q4 — **«У роботі» trust cell — динамічна стадія (% / phase) чи статичний «ЖК Lakeview · бізнес-клас»?**
- Recommend: **статичний** для першого прохід (бо немає live data source). Динамічна стадія = окрема задача (data feed, photos).

Q5 — **Subscribe-to-anonces gate?**
- Recommend: **out of scope для цього pilot**. Окрема feature (lead capture form, email service integration). Зараз — фокус на hero + capacity statement.

## 7. Files to touch

```
NEW    src/components/PortfolioHero.tsx       — System/Method hero, ~180-220 LoC
NEW    app/routes/pilot-portfolio.tsx          — pilot preview route (видалиться після cutover)
EDIT   app/routes.ts                           — додати pilot entry (Write, не Edit!)
EDIT   app/routes/portfolio._index.tsx         — production cutover (Stage 4 Phase 2)
```

**НЕ чіпаємо:**
- `src/components/ProjectCard.tsx` (works, used by 4 other portfolio routes)
- `src/components/PageHero.tsx` (used by 5 legacy routes — окрема задача)
- `src/data/projects.ts` (dataset stays — Lakeview routing requires it, інші проекти через окремі routes)
- `src/components/HeroAmbient.tsx`, `MarkCube.tsx` (reuse as-is)

## 8. Risk register

| Ризик | Severity | Mitigation |
|---|---|---|
| Capacity statement copy звучить defensive | High | Multiple drafts, A/B на 2-3 формулюваннях, фінал — найфактовіший |
| Cube над текстом на mobile breaks fold ≤650px | Medium | order-1/order-2 swap, cube max-width на md, на sm взагалі вгорі або hide |
| ProjectCard featured variant занадто широкий під новим hero | Low | aspect-[16/10] уже працює, не змінюємо |
| routes.ts linter revert (memory rule) | Medium | Тільки `Write` повного файлу, ніяких Edit малих чанків |
| TS strict — нові props на PortfolioHero | Low | Mirror InvestorHero props shape (eyebrow/title/lead/trust/children) |
| Pre-existing tests (smoke на portfolio routes) | Low | tests/smoke перевіряють що сторінка рендериться + meta теги — інваріант зберігається |

## 9. Final conclusion

**Recommended approach:** **Pattern C — System/Method hero**, реалізований як новий компонент `PortfolioHero.tsx`, який reuse-ить `HeroAmbient` + `MarkCube` + canonical trust tokens. Pilot route `/pilot-portfolio` перед production cutover, capacity statement як секція під hero, decorative filter bar видаляється повністю.

Це **єдиний** brand-coherent варіант з 5 досліджених patterns. Він:
- ✅ Працює з brandbook (палітра, шрифт, ізометрія, voice)
- ✅ Сумісний з existing axiom-driven heroes (узгоджена design DNA across site)
- ✅ Поважає client rule (Wave 1-5: тільки Lakeview публічно)
- ✅ Закриває anti-patterns single-project portfolio (no fake «5», no «coming soon»)
- ✅ Підтримує 3 персони (B2C / B2B / Bank) через canonical trust signals
- ✅ Реалізується за 1 нову компоненту + 1 edit без архітектурних змін

**Next step:** Stage 2 (Spec) — формалізувати acceptance criteria + проти-патерни як hard checks.
