# Research — Production 404 + Logo brand-compliance audit

**Дата:** 2026-05-19
**Розмір задачі:** M (multi-file fix у production hot-fix + brand-visual fix)
**Контекст:** Скарга на сайт у проді — повторна перевірка показала що ВСІ HTML сторінки повертають 404. Паралельно — питання про логотип на чорному фоні відносно брендбуку.

---

## Частина A — Production 404 (КРИТИЧНО, BLOCKER)

### Reproduction (2026-05-19 ~11:00 EEST)

```
curl -sI https://vugoda-web-2.pages.dev/
HTTP/2 404
content-type: text/html
x-robots-tag: noindex
```

Перевірені роути → **усі HTML повертають 404**:
| Route | Очікувано | Реально |
|-------|-----------|---------|
| `/` | 200 | **404** |
| `/portfolio` | 200 | **404** |
| `/portfolio/lakeview` | 200 | **404** |
| `/pidkhid`, `/kontakty`, etc. | 200 | **404** |
| `/sitemap.xml`, `/robots.txt`, `/og/*.png` | 200 | ✅ 200 |
| `/non-existent` | 404 | 404 |

Сайт фактично **down** — тільки статичні non-HTML асети доступні. Memo `feedback-technical-lessons` стверджує що final live verification 2026-05-19 11:44 показала "12 prerendered routes ✅ HTTP 200", але це або застаріло, або був короткий вікно роботи перед регресією.

### Root cause

Файл `web-design/functions/[[catchall]].ts` (Phase 5d, commit `679b325`) містить **невірне припущення** про порядок routing у CF Pages:

```typescript
// CF Pages routing order:
//   1. Static files (prerendered HTML, assets) — served directly, never reach here
//   2. Functions in functions/                  — THIS file
//   3. _redirects rules
```

**Реальність:** Pages Functions з `[[catchall]]` (rest parameters) мають **ВИЩИЙ** пріоритет ніж static assets. Це задокументовано у CF Pages docs під розділом "Static assets and functions" — функції перехоплюють запити **ПЕРЕД** перевіркою статичних файлів.

Поточна логіка `onRequest`:
```typescript
if (pathname.startsWith('/api/')) return context.next();   // ✅ pass through API
if (STATIC_EXT.test(pathname)) return context.next();      // ✅ pass through .png, .svg, etc.
// ВСЕ інше → fetch /404/index.html, повернути HTTP 404
```

Тобто **кожен HTML route без розширення** (`/`, `/portfolio`, `/kontakty`) ловиться функцією і повертається як 404. Prerendered `index.html` файли у `build/client/portfolio/index.html` ніколи не дістаються до клієнта.

### Чому це не помітили одразу

- Memo `feedback-technical-lessons #2` каже що "CF Pages автоматично fallback на `/index.html` для unknown routes" — це було спостереження ДО додавання `[[catchall]]` функції.
- Phase 5d commit message: "CF Pages Function intercept-ить unknown routes" — інженерне припущення було що CF Pages serve prerendered HTML до того як reach функцію. Це припущення помилкове.
- Final verification 2026-05-19 11:44 могла бути на короткому проміжку до повного propagation, або тести робили з кешу.

### Можливі рішення

| Варіант | Опис | Pros | Cons | Risk |
|---------|------|------|------|------|
| **1. Whitelist відомих routes** | Тримати Set із 12 prerendered routes; `context.next()` для них, 404 для інших | Детермінований, без залежності від CF internals, легко тестувати | Треба синхронізувати з `app/routes.ts` (ризик drift) | Низький |
| **2. Probe through `context.next()`** | Викликати `next()` спочатку; якщо response 404 — обернути у custom 404; інакше pass through | Без manual sync списку routes | Покладається на те, що CF Pages **справді** поверне 404 коли prerendered + `__spa-fallback.html` видалено. Memo #2 каже навпаки — поверне `/index.html` з 200 | Середній |
| **3. Видалити catchall, повернутися до Phase 5b** | Покладатись на `postbuild-cleanup` (delete `__spa-fallback.html`) + `_redirects /* /404/index.html 404` | Найпростіше, без CF-specific logic | Memo каже що Phase 5b не давала 404 status — `_redirects 404` rule ігнорувалась | Високий (memo каже не працює) |
| **4. Whitelist + autogeneration** | Скрипт `scripts/generate-route-manifest.mjs` парсить `app/routes.ts` → JSON; catchall reads JSON у build time | Без manual sync, детермінований | Складніше; потребує build hook | Низький |

### Рекомендація

**Варіант 1 (whitelist hardcoded)** — найбезпечніший і найшвидший fix для production-down інциденту. Список з 12 routes стабільний (не змінювався з Phase 1). Можна додати CI guard: `verify-build.mjs` перевіряє що whitelist у `[[catchall]].ts` синхронний з `app/routes.ts`.

**Чому НЕ варіант 2:** memo `feedback-technical-lessons #2` чітко зафіксовано — CF Pages serve `__spa-fallback.html` або `/index.html` навіть якщо файл видалений (built-in SPA fallback). Тому `next()` не дасть достовірного 404 для unknown route. Без живого тесту на preview deployment покладатися ризиковано.

**Чому НЕ варіант 4 зараз:** додаткова complexity не виправдана для 12 stable routes. Якщо routes почнуть швидко змінюватись — мігруємо тоді.

---

## Частина B — Logo на чорному фоні (брендбук)

### Brand-book правила (сторінки 11-13)

| Стор. | Версія | Призначення | Особливості |
|-------|--------|-------------|-------------|
| 11 | Основний (primary) | Світлі / контрастні фони | Куб лайм, "вигода" чорна, маркер навколо куба — **чорний/антрацит** |
| 12 | Для темного фону (dark) | Темний антрацит `#2F3640` | Куб лайм, "вигода" світла, маркер навколо куба — **темний антрацит** |
| 13 | Адаптація для чорного фону (black) | Чистий чорний `#020A0A` | Куб лайм, "вигода" світла, маркер навколо куба — **АНТРАЦИТ** (світліший за фон, щоб не зливатися) |

Ключова відмінність dark vs. black: маркер навколо куба. На фоні #2F3640 чорний маркер видно. На фоні #020A0A чорний маркер зливається — потрібен антрацит #3D3B43 для маркера.

### Поточний стан коду

**Фон у Layout (`src/index.css`):**
```css
--color-bg-base: #2F3640;        /* body — антрацит */
--color-bg-surface: #3D3B43;     /* картки */
--color-bg-deep: #020A0A;        /* header, hero overlay, footer — ЧОРНИЙ */
```

**Де використовується Logo:**
| Місце | Файл | Фон елемента | Поточний src |
|-------|------|--------------|--------------|
| NavBar (sticky top) | `src/components/NavBar.tsx:50` | `bg-bg-deep` = **#020A0A (ЧОРНИЙ)** | `/logo-dark.svg` ❌ |
| Footer | `src/components/Footer.tsx:29` | `bg-bg-deep` = **#020A0A (ЧОРНИЙ)** | `/logo-dark.svg` ❌ |
| Mobile menu overlay | NavBar inline | `bg-bg-deep` = **#020A0A (ЧОРНИЙ)** | `/logo-dark.svg` (через NavBar) ❌ |
| Structured data (JSON-LD) | `app/root.tsx:28` | n/a (URL у schema) | `/logo-primary.svg` ✅ (для пошуковиків — правильно) |

**Logo.tsx (src/components/Logo.tsx) поточний код:**
```tsx
<img src="/logo-dark.svg" alt="..." />
```

### Проблема

Усі видимі вживання Logo — на фоні `#020A0A`. Брендбук вимагає для цього фону `black.svg` (із антрацитовим маркером). Поточний `logo-dark.svg` (з чорним маркером) — для фону `#2F3640`. Маркер на чорному overlay візуально зливається.

### Доступні файли

```
/Users/admin/Documents/Проєкти/vugoda-web-2/brand-assets/logo/
├── black.svg, black.png, black-transparent.png, black.pdf   ← для чорного #020A0A
├── dark.svg, dark.png, dark-transparent.png, dark.pdf       ← для антрациту #2F3640
└── primary.svg, primary.png, primary.pdf                    ← для світлого

web-design/public/  (поточний deploy)
├── logo-dark.svg    ← скопійовано з dark.svg
├── logo-primary.svg ← скопійовано з primary.svg
└── (logo-black.svg відсутній!)
```

### Рекомендація

1. **Скопіювати `brand-assets/logo/black.svg` → `web-design/public/logo-black.svg`**
2. **Logo.tsx:** замінити `/logo-dark.svg` на `/logo-black.svg` (бо обидва вживання — на `bg-bg-deep` #020A0A)
3. **Майбутнє:** якщо колись Logo з'явиться на `bg-bg-base` (#2F3640) — додати пропс `variant: 'dark' | 'black' | 'primary'` з default `'black'`. Зараз не потрібно — YAGNI.
4. **JSON-LD logo:** залишити `logo-primary.svg` — це для пошуковиків/соцмереж де preview може бути на світлому фоні. Це коректно.

### Альтернативи (відкинуті)

- **CSS-фільтри (filter: invert / hue-rotate)** на `logo-dark.svg` — крихко, не підтримує антрацит маркера, недоступне для скрін-рідерів.
- **Inline SVG з CSS-змінними** — складніше за статичний asset, без переваги для одного вживання.
- **Залишити як є** — порушує брендбук, який клієнт явно зафіксував.

---

## Висновок та рекомендований план

**Phase A (BLOCKER, hot-fix):** Виправити `functions/[[catchall]].ts` через whitelist із 12 prerendered routes. Build → smoke test через `curl` → commit → push (auto-deploy CF Pages 2-4 хв).

**Phase B (brand-fix, не блокуючий):** Скопіювати `logo-black.svg` у `public/`, оновити `Logo.tsx`. Можна включити у той самий commit, або окремий.

**Verification:**
- Phase A: `curl -sI https://vugoda-web-2.pages.dev/` → HTTP 200, `curl -sI https://vugoda-web-2.pages.dev/non-existent` → HTTP 404.
- Phase B: DevTools на проді → `<img src="/logo-black.svg">` у `<nav>` і `<footer>`; візуально перевірити що маркер навколо куба видно на чорному фоні.

**Out-of-scope:**
- CF WAF rate limit (Phase 5 leftover, не пов'язано)
- DNS міграція `vyhoda.lviv.ua` (operational, не код)
- Logo variant prop API — додамо коли з'явиться другий use-case
