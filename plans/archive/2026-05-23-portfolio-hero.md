# Plan — /portfolio Hero Redesign

**Date:** 2026-05-23 (continued 2026-05-24)
**Branch:** `feature/portfolio-hero`
**Bulletproof stage:** 3 (Plan + Challenge Loop)
**Reads:** `thoughts/research/2026-05-23-portfolio-hero.md`, `specs/2026-05-23-portfolio-hero.md`

---

## Challenge Loop

### Q1 — Does this plan solve the problem (per spec acceptance criteria)?

Mapping plan items → spec acceptance criteria:

| Spec criterion | Plan action | Coverage |
|---|---|---|
| A1–A6 brand fidelity (palette, font, mark.svg, ambient, voice, structure) | Phase 1 — нова `PortfolioHero.tsx` дзеркалить class structure InvestorHero/PartnerHero. Палітра через існуючі Tailwind токени. MarkCube + HeroAmbient reuse. | ✅ Full |
| B1–B10 axioms (10) | Phase 1 — structure (3fr/2fr), trust row `<dl>`, single primary CTA + text-link, mobile responsive, reduced-motion через MarkCube/HeroAmbient defaults | ✅ Full |
| C1 only Lakeview public | Phase 3 — `portfolio._index.tsx` рендерить лише Lakeview ProjectCard. Hero не згадує інших проектів. | ✅ Full |
| C2 filter bar removed | Phase 3 — рядки 49-77 portfolio._index.tsx видаляються повністю | ✅ Full |
| C3 Pipeline/«Як читати» removed | Already done (зараз тільки 1 проект у DOM; pipeline блок не існує) | ✅ Already |
| C4 no license user-visible | Grep verification у pre-commit sweep | ✅ Verified |
| C5 capacity statement neutral | Phase 3 — copy «Системна дисципліна» (user-approved) | ✅ Full |
| D1–D6 technical (tsc/build/lint/tests/routes.ts Write/bundle) | Gates після кожної phase | ✅ Full |
| E1–E5 workflow (pilot first, sweep, branch, no agent file creation) | Phases 1-4 sequence + pre-commit checklist | ✅ Full |
| F1–F4 verification (live preview, mobile, cutover preview, reduced-motion) | Phase 2 — user-driven approval; Phase 4 — final QA | ✅ Full |

**Verdict:** All 30+ acceptance criteria mapped. Жодного uncovered.

### Q2 — Is this the most efficient solution?

3 alternatives considered:

**Alt A** — Edit `portfolio._index.tsx` directly без нової компоненти (інлайн hero JSX).
- Pros: -1 файл, simpler.
- Cons: порушує cross-page coherence (всі інші 6 героїв = окремі компоненти), важче reuse для майбутніх змін, breaks pattern usability (InvestorHero/PartnerHero/etc — всі extracted).
- Verdict: ❌ no.

**Alt B** — Reuse `InvestorHero` directly з custom props (custom projects=[]).
- Pros: 0 new components.
- Cons: InvestorHero має iso-grid map + 5 markers як hard-coded structure. Для portfolio overview не потрібна карта (немає markers). Removing map breaks hierarchy axiom (text 60% + visual 40%) — залишиться text без anchor.
- Verdict: ❌ no — semantic mismatch.

**Alt C (CHOSEN)** — Окрема `PortfolioHero.tsx` mirror-ить class structure InvestorHero, але візуал = MarkCube як secondary (right column), не map.
- Pros: maximally reuses existing patterns, brand-coherent, mirrors all 5 other heroes, minimal code (1 new component ~180 LoC), easy to test/review.
- Cons: +1 файл.
- Verdict: ✅ best.

**Bonus efficiency:** capacity statement — окрема секція HTML (~30 LoC) під hero у portfolio._index.tsx, не окремий компонент. Reuse-я нема, single-use only.

### Q3 — Is there code-for-code's-sake?

Auditing each plan item against spec goal:

| Plan item | Tied to spec? | Decision |
|---|---|---|
| New `PortfolioHero.tsx` | Spec goal: brand-coherent hero | ✅ keep |
| Pilot `pilot-portfolio.tsx` | E1: pilot route before prod (memory rule) | ✅ keep |
| `app/routes.ts` Write | D5 routes.ts Write-only (memory rule) | ✅ keep |
| `portfolio._index.tsx` cutover | C2 filter removal + Phase 9 cross-page coherence | ✅ keep |
| Capacity statement section | C5 + UX research recommendation | ✅ keep |
| **NO** ProjectCard refactor | Outside scope (Spec §Non-goals) | ✅ excluded |
| **NO** PageHero deletion | Used by 5 legacy routes (out of scope) | ✅ excluded |
| **NO** new tests | Existing smoke tests cover render+meta; ne change shape | ✅ excluded |
| **NO** routes.ts schema redesign | Just adding/removing 1 pilot entry | ✅ excluded |

**Verdict:** No drive-by refactoring. Every change directly serves spec acceptance.

---

## Phases (sequential, single session OK для Size M)

### Pre-flight (always before each phase)
```bash
cd /Users/admin/Documents/Проєкти/vugoda-web-2/web-design
git branch --show-current  # must = feature/portfolio-hero
git status --short | head -5
```

If branch ≠ `feature/portfolio-hero` → STOP, fix branch.

---

### Phase 1 — `PortfolioHero.tsx` component + pilot route

**Files:**
- CREATE `src/components/PortfolioHero.tsx` (~180-220 LoC)
- CREATE `app/routes/pilot-portfolio.tsx` (~60 LoC — копія portfolio._index minimal з PortfolioHero swapped in)
- WRITE `app/routes.ts` (повний файл з додатковим entry `route('/pilot-portfolio', ...)`)

**Component spec (PortfolioHero.tsx):**
```tsx
type TrustItem = { label: string; value: string };

type PortfolioHeroProps = {
  eyebrow?: string;          // default "Розділ 03"
  title: ReactNode;          // required, declarative
  lead?: ReactNode;          // optional subhead
  trust?: TrustItem[];       // default canonical 4: ЄДРПОУ/Технологія/У роботі/Здача
  children?: ReactNode;      // CTAs (primary button + text-link)
};
```

Structure (mirrors InvestorHero layout):
- `<section className="relative bg-bg-deep py-12 md:py-16 px-6 lg:px-8 border-b border-bg-surface overflow-hidden">`
- `<HeroAmbient />` (default — all 4 layers)
- `grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-12 items-center`
  - Text column (md:order-1):
    - eyebrow `// Розділ 03` (mono, accent, tracking-wider, uppercase)
    - h1 `text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] tracking-tight font-bold`
    - lead `text-base md:text-lg leading-relaxed text-text-secondary`
    - children (CTAs container)
    - `<dl>` trust row (4 cells: dt label uppercase mono / dd value medium)
  - Cube column (md:order-2):
    - `<MarkCube />` with `className="max-w-[240px] sm:max-w-[300px] md:max-w-[380px] mx-auto md:mx-0"`
    - Default `faceHi={0}` (passive wireframe drawing)

**Pilot route spec (pilot-portfolio.tsx):**
- Copy portfolio._index.tsx structure
- Replace `<PageHero>` with `<PortfolioHero>` (new)
- Remove decorative filter bar (lines 49-77 of prod)
- Insert capacity statement section between hero і ProjectCard
- Keep Lakeview featured + meta + «Деталі проекту»
- `meta()` function — додати `noindex,nofollow` (pilot не для індексації)

**Gates after Phase 1:**
- `npx tsc --noEmit` → 0 errors
- `npm run build` → success, route count = 11 (10 prod + 1 pilot)
- `curl -s http://localhost:3000/pilot-portfolio | head -50` → renders
- Manual viewport check на desktop + mobile (375px)

---

### Phase 2 — User approval gate

**Steps:**
1. Start dev server: `npm run dev` background.
2. Send user message: pilot ready at `http://localhost:3000/pilot-portfolio`.
3. AskUserQuestion with options:
   - ✅ Approve → proceed to Phase 3
   - 🔧 Need copy adjustments (запитати які)
   - 🎨 Need visual adjustments (запитати які)
   - ❌ Reject → stop, revise component

**No code changes у Phase 2** — user-driven decision.

---

### Phase 3 — Production cutover

**Files:**
- EDIT `app/routes/portfolio._index.tsx`:
  - Replace `import PageHero` → `import PortfolioHero`
  - Replace `<PageHero ... children>...</PageHero>` блок (рядки ~38-47) на `<PortfolioHero ... />`
  - Delete decorative filter bar section (рядки 49-77)
  - Add capacity statement section (~30 LoC) between hero і ProjectCard
- WRITE `app/routes.ts` (повний файл, видалити pilot entry — cleanup)
- DELETE `app/routes/pilot-portfolio.tsx`

**Capacity statement HTML (user-approved):**
```tsx
<section className="bg-bg-deep border-b border-bg-surface py-12 md:py-16 px-6 lg:px-8">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
    <div>
      <span className="text-xs font-mono tracking-[0.18em] text-accent uppercase">
        // Позиція в портфелі
      </span>
    </div>
    <div className="flex flex-col gap-5">
      <p className="text-xl md:text-2xl font-bold text-text-primary leading-snug max-w-2xl">
        Один активний обʼєкт — не обмеження, а принцип.
      </p>
      <p className="text-base text-text-secondary leading-relaxed max-w-2xl">
        Системний девелопмент означає не масштабувати кількість, а тримати якість від проектування до здачі. Повний фокус команди — на живому обʼєкті.
      </p>
      <p className="text-base text-text-secondary leading-relaxed max-w-2xl">
        Наступні проекти — у підготовці дозвільної документації. Публічний анонс — після завершення процедур.
      </p>
    </div>
  </div>
</section>
```

**Gates after Phase 3:**
- `npx tsc --noEmit` → 0 errors
- `npm run build` → 10 prerendered routes (pilot removed)
- `curl -s http://localhost:3000/portfolio | grep "PortfolioHero\|Системний девелопмент"` → matches
- Manual visual diff: production route at `/portfolio` має новий hero + capacity statement, Lakeview card зберігається.

---

### Phase 4 — Self-Audit + Verification + Impact

**Per Stage 5-7 of bulletproof (inner loop):**

**5.1 Spec compliance check:**
- Walk through every acceptance criterion (A/B/C/D/E/F sections of spec)
- For each: check implementation point (file+line або behavior)
- Mark covered / uncovered

**5.2 Self-challenge:**
- Look at code fresh eyes — does it solve the problem?
- Any unnecessary abstractions?
- Any drive-by refactoring?

**6.1 Bug hunt (real bugs only):**
- Logic: trust row stacking на sm breakpoint
- Data: Lakeview record still exists (no breaking change у data layer)
- Security: nothing user-input у hero, нема XSS surface
- Performance: HeroAmbient adds minimal CSS, MarkCube ~6 SVG paths

**6.2 False positive filter:**
- Don't fix «for beauty»
- Don't refactor cube animations
- Don't optimize HeroAmbient (works)

**7.1 Regression check:**
- Other portfolio routes (.lakeview, .etno-dim, .maetok, .nterest, .pipeline-04) — unchanged
- Other production routes (pidkhid, investoram, partneram, novyny, kontakty, _index) — unchanged
- All routes still pre-render (10 routes у build/client/)
- Smoke tests pass (якщо є тести на /portfolio meta — мають continue to pass)

**7.2 Side effects:**
- `PageHero` still imported by 5 routes (_index, portfolio.lakeview, portfolio.etno-dim, portfolio.maetok, portfolio.nterest, portfolio.pipeline-04 minus pipeline-04 which already uses PipelineHero). Untouched.
- `ProjectCard` API unchanged — used by 4 routes still working.
- `app/routes.ts` schema unchanged (just removed pilot entry).

**7.3 Think ahead:**
- What if user adds другий проект до portfolio пізніше? — PortfolioHero не залежить від project count; cards rendering у portfolio._index.tsx — окрема логіка.
- What if brand-tokens change? — Tailwind classes (bg-bg-deep etc) — single source of truth, change propagates.
- Concurrent edits? — single-author solo, нерелевантно.

---

### Phase 5 — Pre-commit sweep + commit

**Bash one-liner (memory rule `feedback_pre_commit_sweep`):**
```bash
echo "=== BRANCH ===" && git branch --show-current && \
echo "=== LICENSE RULE ===" && grep -rn "ліцензі\|27.12.2019\|ліцензован" app/routes/ src/components/ 2>&1 | grep -vE "\.tsx:[0-9]+: \*" | head -10 ; \
echo "=== DIRTY-OLIVE RISK ===" && grep -rn "mix-blend-mode.*overlay\|mixBlendMode.*overlay" src/components/ app/ 2>&1 | head -5 ; \
echo "=== ORPHAN PILOT FILES ===" && ls app/routes/ | grep -i pilot ; \
echo "=== ORPHAN PILOT ROUTES ===" && grep pilot app/routes.ts ; \
echo "=== TSC ===" && npx tsc --noEmit 2>&1 | tail -3 ; \
echo "=== BUILD ===" && npm run build 2>&1 | tail -5
```

**Expected:** all clean except documenting comment in HeroAmbient.tsx (known false positive).

**Commit:**
```
git add app/routes/portfolio._index.tsx app/routes.ts src/components/PortfolioHero.tsx \
        specs/2026-05-23-portfolio-hero.md plans/2026-05-23-portfolio-hero.md \
        thoughts/research/2026-05-23-portfolio-hero.md
git commit -m "feat: PortfolioHero (System/Method axiom-driven) + capacity statement

Replaces legacy PageHero + decorative filter bar with axiom-driven
hero on /portfolio overview. Honest 1-active-object framing per
client rule (Wave 1-5 — only Lakeview public).

Hero structure (PortfolioHero.tsx):
- text 3fr (md:order-1) + MarkCube 2fr (md:order-2)
- HeroAmbient (grid 8% + noise 14% soft-light + fades)
- 4-cell trust row: ЄДРПОУ 44876801 / монолітно-каркас / ЖК Lakeview · бізнес-клас / 2027
- single primary CTA + small text-link (Hick's Law)

Capacity statement (replaces fake filter '(5)'):
- 'Системна дисципліна' copy — quality > quantity reframe
- Honest pipeline messaging (after permitting procedures)
- No 'coming soon', no silhouetted cards

Removed:
- decorative filter bar (рядки 49-77 portfolio._index.tsx)
- 'Портфель і pipeline' eyebrow (now 'Розділ 03')

Reuses: HeroAmbient, MarkCube, ProjectCard featured, canonical
trust signal pool. Mirrors structure of 6 other production heroes
(pidkhid/investoram/partneram/novyny/kontakty/pipeline-04).

Bulletproof Size M: research + spec + plan + impl + audit + gates.
Pilot route removed post-cutover.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Phase 6 — Code Review (fresh context, Stage 9 of bulletproof)

**After commit:**
- Launch `Code Reviewer` agent fresh context
- Inputs: portfolio._index.tsx, PortfolioHero.tsx, plans/, specs/
- Output: findings classified HIGH/MED/LOW

**Если findings:**
- HIGH → fix immediately, re-gate, amend or new commit
- MEDIUM → fix у same session if quick, else create follow-up task
- LOW → log, optional fix

---

### Phase 7 — Final verification

- Re-run pre-commit sweep
- Re-run `npx tsc --noEmit && npm run build`
- Manual visual diff: production /portfolio + mobile + reduced-motion
- Update memory: `project_phase_progress.md` Phase 10 section
- Stage 12 — Squash merge → main awaits **explicit user request**

---

## File map (final state after all phases)

```
NEW    src/components/PortfolioHero.tsx
EDIT   app/routes/portfolio._index.tsx
EDIT   app/routes.ts (revert pilot entry — net 0 diff after cleanup)
NEW    specs/2026-05-23-portfolio-hero.md
NEW    plans/2026-05-23-portfolio-hero.md
NEW    thoughts/research/2026-05-23-portfolio-hero.md

DELETED (created in Phase 1, deleted in Phase 3):
app/routes/pilot-portfolio.tsx
```

## Test plan

Pre-existing smoke tests cover render+meta. Manual verification:

- [ ] **Visual:** Pilot route renders correctly on desktop (1440px) + tablet (768px) + mobile (375px)
- [ ] **Animation:** MarkCube draws on viewport entry (motion pathLength 0→1)
- [ ] **Ambient:** HeroAmbient grid visible (8% lime), noise visible cross-device
- [ ] **CTAs:** Primary lime button → /portfolio/lakeview navigates; text-link → /kontakty navigates
- [ ] **Trust row:** 4 cells stack 2×2 on mobile, 4×1 on md+
- [ ] **Reduced-motion:** Chrome DevTools `prefers-reduced-motion: reduce` → cube static, noise opacity 0.08
- [ ] **Capacity statement:** copy renders, no «coming soon» language
- [ ] **No fake count:** No «(5)» anywhere in DOM
- [ ] **Production /portfolio:** Lakeview featured card зберігається, meta info, Деталі проекту CTA працює
- [ ] **Sweep clean:** license / dirty-olive / orphan pilots / tsc / build all green

## Decisions log

| Decision | Source | Rationale |
|---|---|---|
| Pattern C (System/Method) over A/B/D/E | Research §6 | Brand-coherent, client-rule safe, reuses existing assets |
| Capacity copy: «Системна дисципліна» | User AskUserQuestion 2026-05-24 | Aligned with brand voice «системний девелопмент» |
| Single primary CTA + text-link | `project_design_pilots.md` §Anti-patterns | Hick's Law, не дві size=lg кнопки |
| Cube right column (md:order-2) | Mirror InvestorHero/PartnerHero | Cross-page coherence |
| Trust pool canonical only | `project_design_pilots.md` §Канонічні trust signals | No «висосані» signals |
| Pilot route → cutover (not direct edit) | `feedback_local_preview_first` | Visual approval gate |
| Squash merge → main is Stage 12, separate approval | Bulletproof Stage 12 rule | Deploy ≠ commit |

## Out

Plan finalized. Перехід до Stage 4 (Phase 1 — implementation).
