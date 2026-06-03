# Plan — Видимі рамки (site-wide) + гібридні фони (головна)

**Гілка:** feature/home-borders-bg · **Size:** M

## Рішення користувача
- Фон головної: **Гібрид** — HeroAmbient грід (lime 8%, центр-маска) + великий брендовий куб (mark.svg) focal-акцент + faint lime glow.
- Рамки: **site-wide** новий токен `--color-border`.

## Phase 1 — Border token (site-wide)
1. `src/index.css` `@theme`: додати `--color-border: #4D5563;` (cool-slate, видимий і на #2F3640, і на #020A0A). НЕ чіпати `--color-bg-surface` (він = фон карток/hover).
2. Механічний swap (sed, точні класи — НЕ чіпати `hover:bg-bg-surface/40` чи surface-фони):
   - `border-bg-surface` → `border-border`
   - `divide-bg-surface` → `divide-border`
   - `gap-px bg-bg-surface` → `gap-px bg-border`
   - deprecated alias `border-bg-alt`/`divide-bg-alt` → `border-border`/`divide-border` (якщо є)
   Blast radius: ~30 файлів, ~149 usages. Зміна уніформна (кожна бліда рамка → консистентно видима).
3. Gate: tsc + build. Spot-check: головна + /investoram + /kontakty + /portfolio/lakeview (рамки видимі, нічого не зламано).

## Phase 2 — Hybrid backgrounds (тільки app/routes/_index.tsx)
Новий компонент `src/components/SectionBackdrop.tsx`:
- reuse `<HeroAmbient grid noise topFade={false} bottomVignette={false} />` (грід+noise, без edge-fades для mid-page ритму)
- + faint lime radial glow (`rgb(var(--accent-rgb)/0.06)`)
- + великий mark.svg куб focal-акцент (opacity ~0.09, contain, position prop)

Застосування:
- **Темні секції** (`bg-bg-deep`): SYSTEMIC DEVELOPMENT, AUDIENCES, CTA — прибрати старі iso-grid `repeat` divs + mark watermark, поставити `<SectionBackdrop>`.
- **Base секції** (`bg-bg-base`): WHO WE ARE, DOCUMENTS — бамп існуючого mark-watermark opacity 0.035→~0.07 + трохи більший (видимий, але календарніший за dark-секції — alternation rhythm).
- **HERO** — лишити (має aerial-фото, не «пустий», не в скаргах).
- Видалити anti-pattern: `mix-blend-mode: overlay` більше не задіюється (iso-grid tile прибрано).

Gate: tsc + build + Playwright скрін головної (до/після).

## Стоп-кордони (не робити)
- НЕ чіпати WIP-файли (portfolio.lakeview.tsx, ContactForm.tsx) — чужа гілка.
- НЕ міняти `--color-bg-surface` токен (зламає картки/hover).
- НЕ робити accent рамки за замовч. (брендбук: accent = point-use). Border = нейтральний slate.
- Комітити тільки свої файли.

## Acceptance
1. Рамки/divider-и видно неозброєним оком на #2F3640 (головна + сайт).
2. Темні блоки головної мають структуру+колір (грід+куб+glow), не сірий шум.
3. tsc 0, build OK, інші роути не зламані.
