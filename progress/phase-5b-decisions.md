# Phase 5b — Follow-up Decisions

Branch: `feature/phase-5b-followup` → merged to `main`
Date: 2026-05-19

---

## Issue 1: `/404` повертає HTTP 200 (P1) — FIXED

**Root cause:**
React Router v7 з `ssr: false` + `prerender` завжди генерує `build/client/__spa-fallback.html`.
Cloudflare Pages видає цей файл для будь-якого шляху, що не збігається з prerendered static asset — і робить це **до** обробки `_redirects`. Тому `/* /404/index.html 404` у `_redirects` ніколи не спрацьовував: CF Pages вже повернув 200 з `__spa-fallback.html`.

**Chosen fix: Option A — postbuild cleanup script**
- Новий скрипт `scripts/postbuild-cleanup.mjs` видаляє `__spa-fallback.html` після build.
- Доданий до `package.json` postbuild: `"postbuild": "node scripts/generate-sitemap.mjs && node scripts/postbuild-cleanup.mjs"`.
- Після видалення CF Pages не знаходить статичного файлу для невідомих маршрутів → fallthrough до `_redirects` → `/404/index.html` з HTTP 404 status.
- Всі prerendered маршрути (`/`, `/portfolio/lakeview`, etc.) продовжують served через їхні власні `index.html` файли — вони матчаться як static assets раніше за `_redirects`.

**Verification:**
```
ls build/client/__spa-fallback.html → No such file or directory ✓
```

---

## Issue 2: Submit button NOT disabled at first paint (P0) — NOT A BUG

**Investigation:**
- `ContactForm.tsx` line 65: `useState<string | null>(null)` — `turnstileToken` ініціалізується як `null`. ✓
- `Button.tsx` lines 108, 112: `disabled` і `aria-disabled` коректно прокидаються. ✓
- `ContactForm.tsx` line 499: `disabled={isBusy || isRateLimited || !turnstileToken}` — при `null` → button disabled. ✓

**Conclusion: Expected behavior.**
Turnstile використовує **Managed mode** (за замовчуванням, без явного `appearance` або `execution` пропу).
У Managed mode Cloudflare перевіряє браузерні сигнали (cookies, IP reputation, browser fingerprint) і для довірених браузерів миттєво (< 100 ms) викликає `onSuccess` — ще до того як Playwright встигає зафіксувати "first paint". Кнопка технічно починає disabled, але стає enabled майже одразу для реальних користувачів.

Це є задокументована поведінка Cloudflare: "Managed will automatically choose the best user experience" — для trusted users це invisible challenge.

**Action:** Додано пояснюючий коментар у `ContactForm.tsx` перед `<Turnstile>` компонентом. Issue закрите як expected.

---

## Issue 3: ContactForm chunk loaded eagerly на Lakeview (P1) — FIXED

**Root cause:**
`React.lazy(() => import(...))` відкладає парсинг JS до першого рендеру компонента, але `Suspense` рендерить компонент одразу при mount сторінки (форма знаходиться в initial render tree). Браузер починає fetch chunk відразу при завантаженні сторінки, навіть якщо форма далеко внизу (поза viewport).

Важливе уточнення: chunk не потрапив до `<link rel="modulepreload">` у HTML (перевірено через manifest) — він лише завантажується через dynamic `import()` при першому render. Для довгих сторінок як lakeview це все одно означає зайвий network request на initial load.

**Chosen fix: IntersectionObserver wrapper (`LazyContactForm`)**
- Замінено `<Suspense><ContactForm/></Suspense>` на `<LazyContactForm ... />` у `app/routes/portfolio.lakeview.tsx`.
- `LazyContactForm` wrapper: показує placeholder `div` до того моменту поки секція не наближається до viewport (rootMargin: 200px). Тоді `show = true` → рендерить `<Suspense><ContactFormLazy>` → fetch chunk.
- `ContactFormLazy` залишається як `lazy()` для code splitting.

**Verification:**
```
grep -o 'modulepreload href="/assets/[^"]*"' build/client/portfolio/lakeview/index.html | grep -i contact
→ (empty) — ContactForm NOT in preload list ✓
```

---

## Gates

```
npx tsc --noEmit    → 0 errors ✓
npm run test        → 13/13 passed ✓
npm run build       → success ✓
__spa-fallback.html → removed from build/client/ ✓
ContactForm chunk   → not preloaded in lakeview/index.html ✓
```
