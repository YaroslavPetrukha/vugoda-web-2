# Brand Audit — ВИГОДА web prototype
Дата: 2026-04-30
Аудитор: Brand Guardian (звіряння з офіційним брендбуком клієнта)
Скоуп: `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/` — 13 сторінок (`src/pages/*`), 15 компонентів (`src/components/*`), токени (`src/index.css`), index.html, дані (`src/data/*`).
Джерела правди: `CONTEXT.md` §1.3–1.4, §2.1, §9 + `web-design/design-system.md` + `web-design/content/copy.md`.

---

## Підсумок

- **Total checks**: 38
- **Pass**: 36
- **Fail**: 2 (1 критичний, 1 некритичний)
- **Verdict**: **PASS-WITH-FIXES** — прототип готовий до деплою на GitHub Pages після виправлення одного критичного дефекту в `Logo.tsx` (дублювання вордмарку поруч з офіційним SVG, що містить його всередині). Всі заборонені слова, ROI-плашки, ex-identity, FOMO-патерни, photo of leadership — відсутні. Юр.фактаж присутній на кожній сторінці. Палітра і типографіка узгоджені з брендбуком.

---

## Детальний звіт

### A. Палітра (`src/index.css`)

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| A1 | `#2F3640` як `--color-bg-base` | PASS | `index.css:5` |
| A2 | `#3D3B43` як `--color-bg-surface` | PASS | `index.css:6` |
| A3 | `#020A0A` як `--color-bg-deep` | PASS | `index.css:7` |
| A4 | `#C1F33D` як `--color-accent` | PASS | `index.css:8` |
| A5 | `#F5F7FA` як `--color-text-primary` | PASS | `index.css:9` |
| A6 | `#A7AFBC` як `--color-text-secondary` | PASS | `index.css:10` |
| A7 | Старі токени `#2a3038`, `#1e2329`, `#000000` відсутні | PASS | `grep -rEn "2a3038\|1e2329\|#000000" src/` повертає 0 збігів |
| A8 | Acid-lime використовується точково (CTA, focus, accents) — не як основний фон | PASS | `Button.tsx:48` (primary), `index.css:45` (focus), `StagePill.tsx:24` (active stage) — фон сторінок завжди `bg-bg-base` або `bg-bg-deep` |

**Підсумок A:** Палітра 100% збігається з брендбуком.
Невелика примітка: у `index.css:14–15` залишені backwards-compat aliases (`--color-bg-alt`, `--color-bg-dark`) з коментарем "deprecated" — це не порушення, тільки cleanup-завдання для коду (див. Code Review, не Brand Audit).

---

### B. Типографіка

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| B1 | Один шрифт — Montserrat (400/500/700) | PASS | `index.html:11` (`Montserrat:wght@400;500;700`), `index.css:18` (`--font-sans`) |
| B2 | H1/H2 — Bold (700) | PASS | `PageHero.tsx:57` (`font-bold`), `SectionHeading.tsx:23` (`font-bold`), пр. `Home.tsx:97` |
| B3 | Body — Regular (400) | PASS | дефолтний `font-weight` для `<p>` через body, всі `<p>` без явного `font-bold`/`font-medium` |
| B4 | Підзаголовки/eyebrow/captions — Medium (500) | PASS | `Button.tsx:45` (`font-medium`), eyebrow `font-mono tracking-widest` |
| B5 | Кирилиця — повна підтримка | PASS | Google Fonts Montserrat має кирилицю; `<html lang="uk">` у `index.html:2` |

**Підсумок B:** Типографічна шкала точно відповідає `design-system.md §1.1`.

---

### C. Графічна мова

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| C1 | Логотип — `public/logo-dark.svg` (офіційний) | PARTIAL | `Logo.tsx:11` використовує `/vugoda-web-2/logo-dark.svg`. **Але:** SVG вже містить вордмарк "ВИГОДА" + дескриптор всередині, а компонент додає текст `<span>вигода</span>` + "системний девелопмент" поруч (рядки 19–26) — **дублювання**. Див. Критичні порушення. |
| C2 | Жодного кастомного 3-circle SVG логотипу | PASS | `grep "circle"` у Logo.tsx — 0; кастомний SVG прибраний |
| C3 | Радіуси ≤ 4px | PASS | 15 використань `rounded-none`, 0 `rounded-full`, 0 `rounded-2xl`, 0 `rounded-md/lg/xl`. Вся UI — кутова |
| C4 | Лінійна ізометрія/каркасний куб для placeholder pipeline-04 | PASS | `IsometricCubePlaceholder.tsx` — stroke 1, butt cap, miter join, без fill (рядки 23–28). Використовується в `ProjectCard variant="placeholder"` (`ProjectCard.tsx:62–69`) і у `ProjectPipeline04.tsx:42–46` |
| C5 | Декоративні лінії — прямі, тонкі, низької opacity | PASS | `Layout.tsx:20–22` — `w-px bg-accent opacity-[0.07]` (3 вертикальні лінії, як специфіковано в `design-system §3` зі зменшеною opacity з 15% до 7-10%) |
| C6 | Ізометрична сітка-патерн — opacity ≤ 10% | PASS | `Home.tsx:73` (`opacity-[0.06]`), `Home.tsx:156` (`opacity-[0.06]`), `PageHero.tsx:46` (`opacity-[0.08]`) |

**Підсумок C:** Графічна мова відповідає брендбуку, окрім дублювання вордмарку у `Logo.tsx` — критичний фікс.

---

### D. Tone of voice

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| D1 | Жодних "мрія", "найкращий", "унікальний", "преміальний", "ваша історія", "ваш дім" в активному контексті | PASS | `grep -rEn "мрі\|найкращ\|унікальн\|преміальн\|ваш дім\|ваша історія"` повертає **єдиний** збіг — `Approach.tsx:69` "Не використовуємо рекламний словник «мрії» і «преміального стилю»" — це **інтенціональна цитата** в негативному контексті (виняток дозволений у завданні) |
| D2 | Жодного "premium/exclusive/елітний/престижний" | PASS | `grep -rEn "premium\|exclusive\|престиж\|еліт\|елітн"` — 0 збігів |
| D3 | Декларативні короткі заголовки (стан справ) | PASS | "Хто ми", "Поточний фокус", "Як ми ухвалюємо рішення", "Чого ми не робимо", "Стадія", "Параметри", "Що далі", "Юридичний фундамент" — всі декларативні |
| D4 | CTA функціональні (не "Почніть свою мрію") | PASS | "Переглянути портфель" (`Home.tsx:107`), "Записатись на огляд" (`ProjectLakeview.tsx:95`), "Записатись на зустріч" (`Investors.tsx:81`), "Запит документів" (`Partners.tsx:57`), "Підписатись на оновлення" (`ProjectEtnoDim.tsx:135`), "Надіслати запит" (`ContactForm.tsx:39`). Жодного "Почніть свою мрію" |
| D5 | Факти над обіцянками: ЄДРПОУ, ліцензія, СС3 | PASS | ЄДРПОУ 42016395 — у Footer (кожна сторінка), TrustStripe, Home, Approach, Partners, Investors, Contacts. Ліцензія 27.12.2019 — там же. СС3 — `ProjectLakeview.tsx:18,105`, `Portfolio.tsx:93`, `Home.tsx`/Approach (через 6 принципів) |
| D6 | "Бізнес-клас" — це фактологічна категорія Lakeview, не "преміальний словник" | PASS | `Portfolio.tsx:93`, `ProjectLakeview.tsx:87,145`, `Investors.tsx:50`. Категорія взята з лендінгу Lakeview (`CONTEXT.md §2.1`), а не як рекламний епітет |

**Підсумок D:** Tone of voice 100% відповідає `CONTEXT.md §9`.

---

### E. Заборони з CONTEXT.md

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| E1 | Жодних фото/імен керівництва і команди | PASS | `grep -rEn "керівниц\|керівник\|CEO\|директор\|founder"` — єдиний збіг `Approach.tsx:70` "Не публікуємо облич і імен команди" — це декларація політики, **підкріплює правило**. Жодних `<img>` команди, жодних розділів "Наша команда" |
| E2 | Жодної згадки Pictorial / Рубікон / Rubikon | PASS | `grep -rEn "Pictorial\|Рубікон\|Rubikon"` повертає 0 збігів у `src/`, `public/`, `index.html` |
| E3 | Pipeline-проекти називаються тільки власними назвами | PASS | `data/projects.ts`: "ЖК Lakeview", "ЖК Етно Дім", "ЖК Маєток Винниківський", "Дохідний дім NTEREST", "Проект у роботі" — жодного "ex-Pictorial", "колишній...", "INTEREST" (старе ім'я) |
| E4 | Жодної згадки "INTEREST" (стара назва) | PASS | `grep -rEn "INTEREST"` повертає 0 збігів — використовується тільки нова "NTEREST" (без "I") |
| E5 | Не імітується "20 років досвіду" / "тисячі мешканців" | PASS | `grep -rEn "20 років\|тисячі"` — 0 збігів. Чесна позиція "0 зданих · 1 будується · 4 у pipeline" присутня — `Home.tsx:274`, `TrustStripe.tsx:13` (формулювання "У роботі: 4 проєкти") |
| E6 | На картках проектів немає статусу "ЗДАНО" | PASS | `grep -rEn "ЗДАНО\|здано"` повертає 0 збігів. Дозволені stage-лейбли: construction/memorandum/estimation/permits/pre-budget — тільки відображають реальні стадії |
| E7 | Немає ROI-плашки 18% / Готовність 65% / прогрес-бару | PASS | `grep -rEn "ROI\|18%\|65%"` — 0 збігів. У hero — `<TrustStripe />` з ЄДРПОУ/ліцензія/технологія/4 проекти, як специфіковано |

**Підсумок E:** Всі заборони з CONTEXT.md дотримані.

---

### F. Lakeview-розмежування

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| F1 | Корп.email `vygoda.sales@gmail.com` явно у корп-розділі | PASS | `Contacts.tsx:9` (Корпоративні контакти), `Partners.tsx:22` (Реквізити), `Footer.tsx:62`, `NavBar.tsx:119` (mobile menu) |
| F2 | Lakeview-канали `vygoda.plus@gmail.com`, `+38 066 990 03 90`, `@lakeviewlviv` — у Lakeview-секції | PASS | `Contacts.tsx:39–52` (окрема секція "ЖК Lakeview — окремі контакти"), `ProjectLakeview.tsx:265–270` |
| F3 | Чітке розмежування — на сторінці контактів і Lakeview | PASS | `Contacts.tsx:144–147` явно: `description="Це контакти проекту, не корпоративні. Бронювання, перегляди, ціни — за цими каналами."`. `ProjectLakeview.tsx:261` теж явно: `description="Це окремі контакти проекту. Корпоративні контакти ВИГОДИ — у розділі /kontakty."` |
| F4 | Lakeview-сторінка має явний міст на власний сайт ЖК | PASS | `ProjectLakeview.tsx:78` `LAKEVIEW_SITE = 'https://yaroslavpetrukha.github.io/Lakeview/'` використовується у hero-CTA (`:91`), у "Деталі і планування" (`:244`), у "Хід будівництва" (`:226`). Також у footer (`Footer.tsx:70`) і у data-layer для зовнішнього лінка картки (`projects.ts:10`) |

**Підсумок F:** Розмежування коректне; сайт послідовно показує Lakeview як окремий проектний бренд з власним каналом.

---

### G. Юридичний фактаж

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| G1 | Footer на КОЖНІЙ сторінці містить юр.рядок | PASS | `Layout.tsx:29` рендерить `<Footer />` як спільний layout-елемент → footer присутній на всіх 13 routes. Юр.рядок: `Footer.tsx:94–98` ("© 2026 ТОВ «БК ВИГОДА ГРУП» · ЄДРПОУ 42016395 · Ліцензія від 27.12.2019") |
| G2 | На `/partneram` — повний реквізитний блок | PASS | `Partners.tsx:14–28` REQUISITES: повна назва (з лапками і латинським шрифтом-маркером), скорочена, ЄДРПОУ, email, сфера діяльності, юр.адреса. Ще плюс LICENSES (`:30–34`) і блок для банків |
| G3 | Footer disclaimer (інформативний характер) | PASS | `Footer.tsx:100–103` — "Інформація про обʼєкти має ознайомлювальний характер. Точні параметри, ціни і умови — у договорі та на сайті відповідного ЖК." Збігається з `copy.md` рядок 768 |

**Підсумок G:** Юр.фактаж присутній і дублюється на необхідних сторінках.

---

### H. Форми

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| H1 | Усі форми мають Імʼя* + Телефон* як обовʼязкові | PASS | `ContactForm.tsx:108–115` (name `required` `aria-required`), `:121–129` (phone `required` `aria-required`). Це shared-компонент, який використаний у всіх 9 форм-секціях (home, lakeview, etno-dim, maetok, nterest, pipeline-04, investors, partners, contacts, news). |
| H2 | Privacy disclaimer присутній під кнопкою | PASS | `ContactForm.tsx:250–252` (рендериться завжди, default-текст). Кожна сторінка передає кастомний disclaimer (`ProjectLakeview.tsx:307`, `Investors.tsx:223`, `Partners.tsx:179`, etc.) |
| H3 | Жодного pop-up exit-intent | PASS | `grep -rEn "exit\|popup\|modal.*intent"` — 0 збігів. У проекті взагалі немає модальних/popup-компонентів |
| H4 | Жодних агресивних таймерів/countdown | PASS | `grep -rEn "countdown\|timer\|таймер\|лічильник"` — єдиний збіг `ProjectLakeview.tsx:22` "лічильники" — це **електролічильники** в описі того, що входить у вартість квартири, не маркетинговий timer |
| H5 | Форма має `aria-required`, `aria-invalid`-готовність, `<label>` обгортка | PASS | `ContactForm.tsx:103–116` — повний a11y-контракт |

**Підсумок H:** Всі форми consistent через shared `<ContactForm />`. Агресивних патернів немає.

---

### I. Anti-patterns (з growth-strategy)

| # | Перевірка | Статус | Доказ |
|---|-----------|--------|-------|
| I1 | Жодних "до здачі залишилось X днів" | PASS | `grep -rEn "залишилось.*днів"` — 0 збігів |
| I2 | Жодних "залишилось 2 квартири" / FOMO | PASS | `grep -rEn "залишилось.*квартир\|FOMO"` — 0 збігів. Hero на головній містить тільки `min-h-[88vh]` aerial-фото Lakeview + текст-фактаж — без FOMO-плашок |
| I3 | Жодних stock-фото сімей | PASS | `public/projects/` містить тільки `etno-dim/`, `lakeview/`, `maetok/`, `nterest/` (рендери архітектури). `public/construction/` — 12 фото будівельного майданчика. Жодних людей-в-кадрі. Жодного `unsplash.com` / `pexels.com` URL |
| I4 | Hero — реальний рендер Lakeview, не stock | PASS | `Home.tsx:64` `src="/vugoda-web-2/projects/lakeview/aerial.jpg"` — реальний рендер з `renders/Pictorial/aerial.jpg` (через копіювання у `public/`) |

**Підсумок I:** Жодного growth-strategy anti-pattern. Сайт чесно не імітує traction.

---

## Критичні порушення (must-fix перед деплоєм)

### CR-1. Дублювання вордмарку в `Logo.tsx` — порушує `design-system §0/§2.1`

**Файл:** `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/components/Logo.tsx`
**Рядки:** 7–30 (весь компонент), специфічно — **18–27** (текстовий блок `showWordmark`)

**Що знайдено:**
Офіційний `public/logo-dark.svg` (`viewBox="60 80 810 250"`, aspect ≈ 4:1) **уже містить** вордмарк "ВИГОДА" і дескриптор "СИСТЕМНИЙ ДЕВЕЛОПМЕНТ" як SVG-paths (це повноцінний логотип з брендбуку). Однак `Logo.tsx` додає поруч ще один текстовий блок:

```tsx
{showWordmark && (
  <span className="hidden sm:flex flex-col justify-center leading-none">
    <span className="font-bold text-xl tracking-tight lowercase text-text-primary">
      вигода
    </span>
    <span className="text-text-secondary text-[9px] uppercase tracking-[0.18em] mt-1">
      системний девелопмент
    </span>
  </span>
)}
```

**Чому це brand-violation:**
1. `design-system.md §2.1` явно: *"Логотип містить вордмарк ВИГОДА + дескриптор СИСТЕМНИЙ ДЕВЕЛОПМЕНТ — окремих текстових елементів поруч не додаємо."*
2. На екрані ≥ `sm` користувач бачить вордмарк двічі — у SVG (як design-asset брендбуку) і поруч як текст у `lowercase`. Це псує бренд-цілісність і створює перцептивний конфлікт (брендбук — uppercase у SVG vs lowercase у тексті — два різні стилі вордмарка одночасно).
3. Дескриптор "системний девелопмент" дубльований двічі — не вирівнюється з оригіналом ні за tracking, ні за weight, ні за case.

**Має бути:**
```tsx
type LogoProps = { size?: 40 | 56; className?: string };

const Logo = ({ size = 40, className = '' }: LogoProps) => (
  <img
    src="/vugoda-web-2/logo-dark.svg"
    alt="Вигода — системний девелопмент"
    width={size === 40 ? 160 : 224}
    height={size}
    className={`block h-8 w-auto md:h-10 select-none ${className}`}
    draggable={false}
  />
);

export default Logo;
```

(Прибрати prop `showWordmark`, прибрати `<span>вигода</span>` і `<span>системний девелопмент</span>`. Aspect ratio SVG ≈ 4:1 — `width = size * 4`. Залишити тільки `<img>`. Перевірити рендер у `NavBar.tsx:50` і `Footer.tsx:29` — обидва передають дефолтні пропси, тож зміна сумісна.)

**Severity:** **КРИТИЧНО** — це единий критичний brand-fail, що блокує деплой. На стрічці в nav і у footer вордмарк зараз показується двічі, що порушує канонічний брендбук-логотип.

---

## Некритичні зауваження (nice-to-fix)

### NW-1. NavBar має 6 пунктів, дизайн-спека вимагала 5

**Файл:** `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/components/NavBar.tsx`
**Рядки:** 7–14

**Знайдено:** `navLinks` містить 6 пунктів — Проєкти / Як ми будуємо / Інвесторам / Партнерам / Новини / Контакт.
`design-system.md §0` row #7 і `§2.6` вимагали 5: Проєкти / Як ми будуємо / Про компанію / Новини / Контакт.

**Аналіз:** Інформаційна архітектура еволюціонувала після написання design-system: Інвесторам і Партнерам стали окремими функціональними розділами (це підтверджено `copy.md` сторінками `/investoram` і `/partneram` з власним фактажем). Це **розумна еволюція IA**, не порушення бренду. Однак 6 пунктів у nav на десктопі — край перенавантаження уваги.

**Рекомендація (опціонально):**
- Варіант A: згрупувати "Інвесторам" + "Партнерам" в один пункт "Співпраця" з drop-down (як у `Footer.tsx:5–21`), де 2 колонки — Сайт / Співпраця).
- Варіант B: лишити як є, але прибрати primary CTA "Заявка" з desktop nav при ширині < `xl` (на md/lg-екранах nav буде менш щільним).
- Варіант C: оновити `design-system.md §2.6` під фактичний стан (5 → 6 пунктів) — і документація стане синхронною з реалізацією.

**Severity:** Некритично. Не порушує бренд як такий — пункт IA-полірування.

---

### NW-2. Backwards-compat aliases у `index.css`

**Файл:** `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/index.css`
**Рядки:** 13–15

```css
/* Backwards-compat aliases (deprecated, не використовувати в новому коді) */
--color-bg-alt: #3D3B43;
--color-bg-dark: #020A0A;
```

**Знайдено:** Aliases оголошені, але `grep -rEn "bg-alt\|bg-dark" src/`  повертає 0 використань у новому коді — вони «висять» у CSS без споживачів.

**Рекомендація:** Видалити рядки 13–15 — вони порушують принцип closure палітри (брендбук — закрита палітра з 6 кольорів, без додаткових alias-токенів). Це cleanup, не brand fail.

**Severity:** Некритично, але радив би прибрати в той самий PR що і CR-1 — буде один чистий commit «brand polish».

---

## Зведення відповідності розділів CONTEXT.md

| Розділ CONTEXT | Вимога | Статус |
|----------------|--------|--------|
| §1.3 Команда | Жодних фото/імен команди | PASS |
| §1.4 Палітра | 6 кольорів закритої палітри | PASS |
| §1.4 Типографіка | Montserrat (400/500/700) | PASS |
| §1.4 Графіка | Лінійна ізометрія, каркасний куб | PASS |
| §1.4 Логотип | Офіційний з брендбуку | FAIL (CR-1) |
| §1.4 Радіуси | Без круглих форм | PASS |
| §2.0 Портфель | 0 зданих, 1 будується, 4 pipeline | PASS |
| §2.1 Pictorial | Не ініціюємо тему | PASS |
| §2.2-2.5 Назви | Власні назви без ex-identity | PASS |
| §6.1 Контакти | Корп-email явний | PASS |
| §9 ToV | Стримано, без рекламних слів | PASS |
| §9 Чесність | Не імітуємо досвід | PASS |

---

## Висновок

Прототип демонструє **зразкову дисципліну ToV і брендових заборон**: жодного забороненого слова в активному контексті, жодної згадки Pictorial/Rubikon/INTEREST, чітке Lakeview-розмежування контактів, повний юр.фактаж на кожній сторінці, кутова геометрія без радіусів, чесна позиція "0 зданих · 1 будується · 4 у pipeline". Палітра і типографіка — точна копія брендбуку. Жодних анти-паттернів growth-marketing (FOMO, countdown, exit-popup, stock-фото).

**Блокер деплою — рівно один:** дублювання вордмарку в `Logo.tsx` (CR-1). Офіційний SVG-логотип з брендбуку самодостатній — він уже містить "ВИГОДА" + "СИСТЕМНИЙ ДЕВЕЛОПМЕНТ" всередині. Текстовий блок `<span>вигода</span>` поруч (рядки 18–27) показує вордмарк двічі і порушує `design-system §2.1`. Виправлення — 30 секунд (видалити блок `showWordmark`, спростити пропси до `{ size, className }`). Після цього прототип готовий до GitHub Pages.

Некритичні зауваження (NW-1 розширений nav з 6 пунктів, NW-2 deprecated CSS-aliases) не блокують деплой і можуть бути виправлені в окремому follow-up commit.

**Recommendation:** PASS-WITH-FIXES. Очікую один commit з фіксом `Logo.tsx`, після якого підтверджую деплой.
