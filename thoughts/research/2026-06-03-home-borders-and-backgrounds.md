# Research — Головна: невидимі рамки + сирі патерн-фони

**Дата:** 2026-06-03
**Гілка:** feature/home-borders-bg
**Задача:** (1) зробити рамки/divider-и видимими на тлі #2F3640; (2) замінити tile-stamp isometric-grid патерни на щось толкове (брейншторм).

## Знахідки

### Issue #1 — Рамки невидимі (root cause)
Колірні токени (`src/index.css`):
- `--color-bg-base: #2F3640` (rgb 47,54,64) — головний фон секцій
- `--color-bg-surface: #3D3B43` (rgb 61,59,67) — антрацит: картки/hover **І border-колір**
- `--color-bg-deep: #020A0A` — near-black

Усі borders на головній (`app/routes/_index.tsx`) використовують `border-bg-surface` / `divide-bg-surface` / `gap-px bg-bg-surface`.
**#3D3B43 на #2F3640 = ΔRGB лише ~(14,5,3)** → майже нульовий контраст → людина не бачить.

`bg-surface` НЕ можна перефарбувати — він також = фон карток і hover (`hover:bg-bg-surface/40`).
**Рішення:** новий токен `--color-border` (світліший cool-slate), swap структурних borders на нього.

Usages у `_index.tsx`: рядки 217, 234, 304, 322, 336, 345, 362, 391, 421, 441, 499 (+ `gap-px bg-bg-surface` між картками).

### Issue #2 — Сирі патерн-фони (root cause = documented anti-patterns)
Головна тайлить `isometric-grid.svg` (`repeat`, рядки 153/285/377/505) та `mark.svg` watermark (222/426/519) на **opacity 0.035–0.05**.

Памʼять `project_design_pilots.md` → секція Anti-patterns прямо забороняє це:
- ❌ Opacity 4-6% texture на dark UI → невидиме cross-device. **Sweet spot 8-15%.**
- ❌ Tile-stamp isometric-grid як background → візуальний шум, не несе значення.
- ❌ Bare solid background → завжди `<HeroAmbient>`.
- ❌ `mix-blend-mode: overlay` лайму поверх темного → dirty-olive (а `isometric-grid.svg` cls-2 саме його містить).

### Готове рішення вже в кодбейзі
`src/components/HeroAmbient.tsx` — канонічний ambient overlay, що використовують 7 інших роутів. 4 шари (всі opt-in):
- CSS grid lines: accent-tinted lime 1.25px @ 88px, **8% opacity**, radial center-mask (центрований архітектурний «креслярський» скелет)
- SVG noise grain (soft-light, 14%, +retina/reduced-motion guards)
- top fade + bottom vignette
Це по суті і є «один великий гарно відцентрований грід» з кольором — лише cross-device-перевірений.

`MarkCube.tsx` — inline mark.svg куб (готовий до переюзу як focal-акцент).

## Висновок / рекомендація
1. **Borders:** додати `--color-border` (cool-slate ~#4D5563, видимий і на base, і на deep), замінити структурні `bg-surface` borders/divider/grid-gap на головній. Розглянути site-wide rollout (це токен).
2. **Backgrounds:** прибрати tile-stamp + low-opacity watermark; поставити `<HeroAmbient>` на темні секції (canonical fix) — опційно + один великий `MarkCube`/iso-структура як focal-акцент із кольором (lime tint + faint gradient), щоб блоки не були пустими. Точний напрям — за брейнштормом з користувачем (genuine design fork).

**Ризик:** низький. Зміни візуальні, ізольовані у `_index.tsx` + `index.css` (+ можливо переюз HeroAmbient/MarkCube). 0 змін даних/роутів/схем.
