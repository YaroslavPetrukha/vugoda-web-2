# Cloudflare Pages Deployment Plan

**Дата:** 2026-05-18
**Автор:** DevOps research agent
**Статус:** research + runbook, готовий до виконання
**Контекст:** міграція корпоративного сайту забудовника ВИГОДА з GitHub Pages на Cloudflare Pages.

---

## 1. Поточний deploy (GitHub Pages)

### Інфраструктура
- **Git remote:** `https://github.com/YaroslavPetrukha/vugoda-web-2.git`
- **Workflow:** `.github/workflows/deploy.yml`
  - Тригер: `push` на `main` + `workflow_dispatch`
  - Runner: `ubuntu-latest`, Node 20 з `cache: npm`
  - Кроки: `actions/checkout@v4` → `setup-node@v4` → `npm ci` → `npm run build` → `actions/upload-pages-artifact@v3` (`./dist`) → `actions/deploy-pages@v4`
  - Concurrency: `group: pages, cancel-in-progress: false`
- **Build:** Vite 6.2 (`vite build`), output → `dist/`
- **Vite config:** `base: '/vugoda-web-2/'` — підрядковий префікс для GitHub Pages
- **URL:** `https://yaroslavpetrukha.github.io/vugoda-web-2/`

### Обмеження поточної архітектури
1. **Нема server-side**: GitHub Pages — суто статика. `/api/contact` неможливо реалізувати без зовнішнього бекенду.
2. **Sub-path mounting** (`/vugoda-web-2/`): ускладнює інтеграції (Schema.org canonical URLs, OG-теги, sitemap, programmatic SEO).
3. **Нема preview deployments** для feature-гілок — клієнт не може передивитись зміни до merge.
4. **Cache headers**: дефолтні, не immutable для fingerprinted assets.
5. **Кастомний домен** прив'язується до GitHub Pages через `CNAME` файл — повільні TTL, нема WAF, нема Cloudflare CDN edge.

---

## 2. Цільова архітектура

```
                 ┌──────────────────────────────────────────────┐
                 │  GitHub: YaroslavPetrukha/vugoda-web-2       │
                 │  (branch: main + feature/*)                  │
                 └────────────────────┬─────────────────────────┘
                                      │ push → webhook
                                      ▼
                 ┌──────────────────────────────────────────────┐
                 │  Cloudflare Pages (Git integration)          │
                 │  Project: vugoda-web-2                       │
                 │                                              │
                 │  Build container (Pages build image v3):     │
                 │    NODE_VERSION=20.18.0                      │
                 │    npm ci && npm run build                   │
                 │    output: dist/                             │
                 │                                              │
                 │  Deploy targets:                             │
                 │    main      → production  (custom domain)   │
                 │    feature/* → preview     (*.pages.dev)     │
                 └────────────────────┬─────────────────────────┘
                                      │
                ┌─────────────────────┴────────────────────────┐
                ▼                                              ▼
   ┌──────────────────────────┐                ┌────────────────────────────┐
   │ Static assets            │                │ Pages Functions            │
   │ (dist/ → CF edge cache)  │                │ functions/api/contact.ts   │
   │ + _headers (immutable)   │                │ env: RESEND_API_KEY,       │
   │ + _redirects (SPA + 301) │                │      TELEGRAM_BOT_TOKEN,   │
   │                          │                │      TURNSTILE_SECRET_KEY  │
   └──────────────────────────┘                └────────────────────────────┘
                ▲                                              ▲
                └────────────── Cloudflare Edge ───────────────┘
                                      │
                                      ▼
                   ┌──────────────────────────────────┐
                   │  Кінцевий користувач             │
                   │  https://<домен>.ua              │
                   │  (поки: vugoda-web-2.pages.dev)  │
                   └──────────────────────────────────┘
```

### Чому CF Pages, а не Workers напряму
- **Зараз:** проєкт = переважно статика + 1 endpoint (`/api/contact`). Pages з Functions покриває це на 100%, без `wrangler.toml` і без CLI.
- **Pages Functions = Workers під капотом** (той самий V8 isolate runtime, той самий білінг). Перехід Pages → Workers пізніше — це одна команда `wrangler deploy` коли потрібні Durable Objects / Cron / multi-Worker setup.
- **Cloudflare офіційно конвергує Pages і Workers** в єдиний продукт; новий проект на Pages у 2026 = валідний вибір для static-first сайту.

### Чому GitHub integration, а не Direct Upload
- **Git integration** дає: auto-build на push, preview deployments для feature-гілок, status checks у PR (Cloudflare пише deployment status у GitHub PR), коментарі з preview-URL.
- **Direct Upload** (`wrangler pages deploy`) — для випадків коли треба нестандартний build pipeline (наприклад, Hugo з 100+ зображень оптимізується кожен раз з нуля). Наш Vite-build займає секунди, переваг від Direct Upload нема.
- **Trade-off:** після переходу на Git integration не можна переключитись на Direct Upload в межах того ж проєкту (треба буде створити новий project на CF).

---

## 3. Step-by-step migration runbook

### Stage 0. Preparation (локально, без deploy)

**0.1.** Створити окрему гілку: `git checkout -b chore/cloudflare-pages-migration`

**0.2.** Зміни в `vite.config.ts`:
```ts
// БУЛО:
export default defineConfig({
  base: '/vugoda-web-2/',
  ...
});

// СТАЛО:
export default defineConfig({
  // base за замовчуванням '/' — це і потрібно для root domain
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

**0.3.** Створити `public/_headers` (див. секцію 8).

**0.4.** Створити `public/_redirects` з SPA-fallback і legacy-redirect (див. секцію 8).

**0.5.** Створити `functions/api/contact.ts` як skeleton (без реальної логіки на цьому етапі — просто HTTP 501 stub; повна реалізація — Phase 2 у /thoughts/plans).

**0.6.** Створити `.nvmrc` у корені:
```
20.18.0
```
Це дублюючий механізм (поряд з `NODE_VERSION` env var на CF) і також корисно локально.

**0.7.** Локальний тест:
```bash
npm ci
npm run build
npx wrangler pages dev dist --compatibility-date=2025-05-18
```
Це підніме локальний preview, ідентичний CF runtime, включно з Functions.

**0.8.** Commit + push гілки → відкрити PR. PR залишається відкритий до завершення міграції.

---

### Stage 1. Cloudflare dashboard setup

**1.1.** Залогінитись у Cloudflare dashboard (https://dash.cloudflare.com).

**1.2.** Якщо акаунту нема — створити Free plan. Workers & Pages free tier:
- 500 builds/month (≈16/day) — достатньо
- Unlimited bandwidth + unlimited requests на статику
- 100 000 Pages Functions requests/day (рахуються в Workers free quota)

**1.3.** Перейти: **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.

**1.4.** Sign in with GitHub → **Install & Authorize**. Дати доступ:
- Або до всіх репо (Organization-wide) — простіше, але широкий scope.
- Або тільки до `YaroslavPetrukha/vugoda-web-2` — recommended.

**1.5.** Вибрати репо `vugoda-web-2` → **Begin setup**.

---

### Stage 2. Build configuration

У формі **Set up builds and deployments**:

| Поле | Значення |
|---|---|
| **Project name** | `vugoda-web-2` (буде доменом `vugoda-web-2.pages.dev`) |
| **Production branch** | `main` |
| **Framework preset** | `None` (не Vite, бо Vite-пресет накидає зайвого; вручну точніше) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | (порожнє — git repo вже `web-design/` content) |
| **Environment variables (build)** | `NODE_VERSION=20.18.0` |

**Важливо про Root directory:** у нас git-repo саме = `web-design/`. Якщо CF клонує `vugoda-web-2.git` — він одразу побачить `package.json` у корені. Root directory залишити **порожнім**.

**Важливо про NODE_VERSION:** проблема, описана в GitHub issue cloudflare/workers-sdk#8544 — якщо є `wrangler.toml`, NODE_VERSION env var ігнорується. У нас зараз `wrangler.toml` нема. Альтернатива: `.nvmrc` (priority вища за env var) — це безпечніше.

**2.1.** Натиснути **Save and Deploy**. Перший build стартує одразу.

**2.2.** Спостерігати лог build:
- Має побачити `Detected Node.js version 20.18.0` (або з `.nvmrc`)
- `npm ci` → `npm run build` → `dist/` створено
- `Found _headers, _redirects in /dist` → parsed
- `Found Functions directory` → compiled to Worker
- Deploy → `https://<hash>.vugoda-web-2.pages.dev`
- Production alias: `https://vugoda-web-2.pages.dev`

---

### Stage 3. Environment variables and secrets

**3.1.** Перейти: **Pages project → Settings → Variables and Secrets**.

**3.2.** Створити для **Production** і **Preview** окремо (clone values якщо однакові, але краще різні Resend audience і різний Telegram chat для тестування):

| Name | Type | Production | Preview | Призначення |
|---|---|---|---|---|
| `NODE_VERSION` | plaintext | `20.18.0` | `20.18.0` | Build-time, Node для CF builder |
| `RESEND_API_KEY` | **secret (encrypted)** | `re_prod_...` | `re_test_...` | Functions: відправка email через Resend |
| `RESEND_FROM_EMAIL` | plaintext | `noreply@<домен>` | `noreply@<домен>` | From-адреса в листах |
| `RESEND_TO_EMAIL` | plaintext | `sales@<домен>` | `dev@<домен>` | Куди йдуть заявки |
| `TELEGRAM_BOT_TOKEN` | **secret** | `<prod token>` | `<test token>` | Functions: Telegram-нотифікації |
| `TELEGRAM_CHAT_ID` | plaintext | `<prod chat>` | `<dev chat>` | Куди шле бот |
| `TURNSTILE_SECRET_KEY` | **secret** | `0x4AAA...` | `1x0000...` (test) | Backend-перевірка Turnstile (anti-bot) |
| `VITE_TURNSTILE_SITE_KEY` | plaintext | `0x4AAA...` | `1x0000...` (test) | Frontend (Vite вшиє в build, тому має префікс `VITE_`) |

**Правила:**
- **Все що "ключ доступу" / "токен"** → `Encrypt` (secret). Після save value не видно навіть власнику.
- **Все що "конфігурація" / "email-адреса"** → plaintext. Бачити value корисно для debugging.
- **VITE_*** змінні — публічні (Vite вшиває їх у frontend bundle). Тримати тут тільки те, що ОК показати в DevTools (наприклад Turnstile site key — спеціально public).
- **Окремі значення для Preview** = окремий Turnstile test key (Cloudflare надає `1x00000000000000000000AA` — завжди-проходить test key) → frontend dev на preview не блокується.

**3.3.** Trigger redeploy після додавання secrets: **Deployments → Retry deployment** на останньому build. Без retry старий deploy не має нових bindings.

---

### Stage 4. Domain strategy

#### Stage 4a. Поки нема custom domain
- Production URL: `https://vugoda-web-2.pages.dev`
- Preview URLs: `https://<branch-name>.vugoda-web-2.pages.dev` (branch alias) + `https://<commit-hash>.vugoda-web-2.pages.dev` (immutable per-deploy URL)
- Поділитись з клієнтом: `vugoda-web-2.pages.dev` — це валідний публічний URL з SSL.

#### Stage 4b. Коли клієнт надасть domain (sequence)

**Сценарій A: домен керується через Cloudflare DNS (recommended)**

1. У Cloudflare → **Add a Site** → ввести домен → вибрати Free plan.
2. Cloudflare покаже два nameserver (наприклад `xxx.ns.cloudflare.com`).
3. Клієнт міняє NS у свого реєстратора (GoDaddy, namecheap, hostmaster.ua, ukraine.com.ua…). TTL поширення: 1-24 години.
4. Після того як зона активна (status: Active у Cloudflare) → **Pages project → Custom domains → Set up a custom domain**.
5. Ввести: `<домен>.ua` і `www.<домен>.ua`.
6. Cloudflare **автоматично** створить CNAME записи в DNS zone і випустить SSL-сертифікат (Universal SSL).
7. Стара GitHub Pages запис (якщо була) — видалити.

**Сценарій B: домен керується через зовнішній DNS (NS НЕ на Cloudflare)**

1. У Pages → **Custom domains → Set up a custom domain** → ввести домен.
2. Cloudflare покаже інструкцію: створити CNAME `<домен>` → `vugoda-web-2.pages.dev`.
3. Клієнт додає цей CNAME у своєму DNS (наприклад hostmaster.ua control panel).
4. **Критично:** не створювати CNAME раніше за крок 1 — інакше 522 error (CF не знає що цей домен належить вашому Pages project).
5. SSL Universal випуститься автоматично (ACME http-01 challenge) — 5-15 хв.

**Apex domain (`<домен>.ua` без www):**
- Класичний CNAME на apex заборонений RFC. Cloudflare використовує **CNAME flattening** — працює тільки якщо domain на Cloudflare DNS (Сценарій A).
- Якщо Сценарій B + потрібен apex → клієнт мусить переходити на Cloudflare DNS.

---

### Stage 5. Functions handoff (`/api/contact`)

**File:** `functions/api/contact.ts` (file-based routing: file path = URL path)

**Skeleton (Phase 2 буде повна імплементація з валідацією Zod, Resend, Telegram, Turnstile):**

```typescript
interface Env {
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_TO_EMAIL: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  TURNSTILE_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 1. Parse body
  const body = await request.json<{
    name: string;
    phone: string;
    email?: string;
    message?: string;
    turnstileToken: string;
  }>();

  // 2. Verify Turnstile
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: body.turnstileToken,
      remoteip: request.headers.get('CF-Connecting-IP') ?? '',
    }),
  });
  const verifyData = await verifyRes.json<{ success: boolean }>();
  if (!verifyData.success) {
    return new Response(JSON.stringify({ error: 'Captcha failed' }), { status: 403 });
  }

  // 3. Send via Resend
  // 4. Send via Telegram
  // ...повна імплементація — Phase 2

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Reject all non-POST
export const onRequest: PagesFunction<Env> = async () => {
  return new Response('Method Not Allowed', { status: 405 });
};
```

**Чому це Pages Function, а не окремий Worker:**
- Один deploy = і статика, і API. Один CI, один domain, один SSL.
- Спільні secrets, спільне середовище.
- File-based routing simpler за `wrangler.toml` routes config.
- Якщо в майбутньому потрібен Cron / Durable Object → міграція Pages → Worker (one-time `npx wrangler pages migrate`).

**Critical caveat:** `_redirects` і `_headers` **не застосовуються** до Functions responses. Headers для Functions треба ставити вручну у відповіді (`new Response(..., { headers: {...} })`).

---

### Stage 6. Видалення / неутралізація GitHub Pages workflow

**Опція 1 (recommended): видалити повністю**

Після того як CF production deploy працює і клієнт підтвердив:

```bash
git rm .github/workflows/deploy.yml
git commit -m "ci: remove GitHub Pages workflow (migrated to Cloudflare Pages)"
```

Також у GitHub repo settings: **Settings → Pages → Source → None**. Це деактивує GH Pages і звільнить домен `yaroslavpetrukha.github.io/vugoda-web-2/`.

**Опція 2: залишити для disaster recovery (1-2 тижні)**

Якщо боїтесь що CF Pages щось зламає — додати `if: false` або змінити trigger на manual-only:
```yaml
on:
  workflow_dispatch:   # тільки manual trigger
```
Через 2 тижні стабільної роботи CF — видалити.

**Опція 3: переробити workflow на CI checks (lint + typecheck) без deploy**

Корисно для PR-перевірок:
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build  # smoke-test build не падає
```
Це паралель до CF Pages build (який теж викидає на build error). Дублювання — навмисне, ловить помилки до того як CF почне build.

---

## 4. File changes (повний список)

| File | Дія | Призначення |
|---|---|---|
| `vite.config.ts` | **edit** | прибрати `base: '/vugoda-web-2/'` |
| `public/_headers` | **create** | cache headers, security headers |
| `public/_redirects` | **create** | SPA fallback + legacy GH Pages redirect |
| `functions/api/contact.ts` | **create** | Pages Function для контактної форми |
| `.nvmrc` | **create** | `20.18.0` (lock Node version) |
| `.gitignore` | **edit** | додати `.dev.vars`, `.dev.vars.*`, `.wrangler/` |
| `.github/workflows/deploy.yml` | **delete or refactor** | прибрати GH Pages deploy (див. Stage 6) |
| `wrangler.toml` | **NOT created** | Pages з Git integration не потребує. Якщо створимо — поламає NODE_VERSION env var (issue #8544) |
| `package.json` | **edit (optional)** | додати `wrangler` у `devDependencies` для local `wrangler pages dev` |

### `package.json` — додати dev dependency
```json
"devDependencies": {
  ...
  "wrangler": "^3.80.0",
  "@cloudflare/workers-types": "^4.20250518.0"
}
```
І опційно нові scripts:
```json
"scripts": {
  ...
  "preview:cf": "wrangler pages dev dist --compatibility-date=2025-05-18",
  "deploy:cf": "wrangler pages deploy dist --project-name=vugoda-web-2"
}
```
(Останній — для emergency manual deploy, обходячи Git integration. Використовувати рідко.)

---

## 5. CI/CD strategy

### Branch policy

| Branch | Target | URL | Build trigger |
|---|---|---|---|
| `main` | Production | `<custom-domain>` + `vugoda-web-2.pages.dev` | Auto on push |
| `feature/*` | Preview | `<branch>.vugoda-web-2.pages.dev` + `<hash>.vugoda-web-2.pages.dev` | Auto on push |
| `fix/*`, `chore/*` | Preview | те саме | Auto on push |
| `wip/*` | **excluded** | — | Не deploy (через Branch deployment controls) |

### Branch deployment controls

У **Pages → Settings → Builds → Branch control**:
- **Production branch:** `main`
- **Preview branch:** `Custom branches` → Include: `feature/*`, `fix/*`, `chore/*`. Exclude: `wip/*`, `experiment/*`.

Це економить free-tier builds (500/month) — не білдити сирі експерименти.

### PR workflow

1. Розробник створює `feature/contact-form` → push.
2. CF Pages auto-builds → preview URL `https://feature-contact-form.vugoda-web-2.pages.dev`.
3. Cloudflare GitHub App пише коментар у PR з посиланням + статус-чек "Cloudflare Pages — Deployed".
4. Reviewer відкриває preview → клікає по сайту → апрувить.
5. Merge у `main` → production deploy за 1-2 хв.
6. Rollback (якщо щось зламалось): **Pages → Deployments → ... поряд із попереднім успішним → Rollback**. Через ≈30 сек активний інший deploy.

### Status checks (GitHub branch protection — recommended)

У GitHub repo **Settings → Branches → Branch protection rule** для `main`:
- Require status checks to pass:
  - `Cloudflare Pages — vugoda-web-2 (Preview)`
  - (опційно) `CI / lint` якщо лишимо `lint.yml`
- Require pull request reviews before merging: 1 (для солової роботи можна 0)
- Require linear history: yes

---

## 6. Secrets list (для копіювання в CF dashboard)

### Encrypted secrets (cannot be viewed after save)
- `RESEND_API_KEY` — Resend API key (https://resend.com/api-keys)
- `TELEGRAM_BOT_TOKEN` — отримати через @BotFather (`/newbot`)
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile (https://dash.cloudflare.com/?to=/:account/turnstile)

### Plaintext env vars
- `NODE_VERSION` = `20.18.0` (build-time)
- `RESEND_FROM_EMAIL` = `noreply@<домен>` (наприклад `noreply@vugoda.ua` або `onboarding@resend.dev` для тестів)
- `RESEND_TO_EMAIL` = `sales@<домен>`
- `TELEGRAM_CHAT_ID` = numeric chat id (або `@channelname`)
- `VITE_TURNSTILE_SITE_KEY` = Turnstile **site key** (публічний, окремий від secret)

### Local development (`.dev.vars` у корені, у `.gitignore`)
```
RESEND_API_KEY="re_test_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"
RESEND_TO_EMAIL="dev-inbox@example.com"
TELEGRAM_BOT_TOKEN="test_token_or_disabled"
TELEGRAM_CHAT_ID="123456789"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
VITE_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
```
Останні два — це Cloudflare official **test keys** які завжди проходять (для розробки без реальної капчі).

---

## 7. Cache strategy

### `public/_headers`

```
# ===== Immutable assets (Vite hashed files) =====
# Vite за замовчуванням викидає в dist/assets/*.{js,css,...} з content hash
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Шрифти (якщо є локальні)
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# Зображення (статичні, не оптимізуються Vite але стабільні)
/images/*
  Cache-Control: public, max-age=2592000

# Favicons / маніфест
/favicon.ico
  Cache-Control: public, max-age=86400
/manifest.webmanifest
  Cache-Control: public, max-age=3600

# ===== HTML (always revalidate) =====
# Дефолт для решти. HTML не повинен бути immutable, бо assets-посилання в ньому змінюються.
/*
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Чому саме так:**
- Vite викидає `dist/assets/index-Bxh3k1A2.js` — фінгерпринт у назві = безпечно ставити `immutable`. Якщо вміст зміниться → зміниться hash → буде нове URL → cache miss природним чином.
- HTML — `max-age=0, must-revalidate`: cache валідний, але кожен запит ходить на edge перевіряти ETag. Якщо HTML не змінився — 304 Not Modified (швидко).
- Security headers: HSTS, anti-clickjacking, MIME sniff protection — production hygiene.
- **CSP не додаю тут** — він мусить бути cherry-picked під реальний bundle (inline scripts, fonts, analytics origins). Це окрема задача в Phase 3.

### `public/_redirects`

```
# ===== Legacy GitHub Pages paths =====
# Якщо хтось закладку зберіг з yaroslavpetrukha.github.io/vugoda-web-2/some/path —
# на новому домені /vugoda-web-2/* redirect на /*
# (Зверни увагу: працює тільки якщо хтось переходить безпосередньо на CF Pages
# і вводить URL з префіксом. GH Pages при видаленні віддасть свій 404.)
/vugoda-web-2/* /:splat 301

# ===== SPA fallback =====
# Всі неіснуючі шляхи → index.html з кодом 200 (для React Router client-side routing)
# КРИТИЧНО: ставити останнім — _redirects парситься top-down, перший match виграє.
/* /index.html 200
```

**Caveat зі SPA fallback:** в community-постах є скарги на "infinite loop detected" warning для `/* /index.html 200`. У 2026 це здебільшого fixed, але якщо CF build warning з'явиться:
1. Перейменувати `index.html` → `__spa-fallback.html` у build output (через Vite plugin або post-build script).
2. Або переключитися на Workers Static Assets з `not_found_handling: "single-page-application"` (це окрема міграція Pages → Workers).

**Альтернатива (краща):** залишити default Cloudflare Pages SPA-behavior — якщо у `dist/` нема файлу `404.html`, Pages автоматично віддає `index.html` з 200 для unmatched routes. Тобто **можна не писати `/* /index.html 200` взагалі**, просто переконатись що Vite не генерує `dist/404.html`.

**Recommended:** перевірити що `dist/404.html` нема після build, і **не додавати** `/* /index.html 200` у `_redirects`. Залишити в `_redirects` тільки legacy-redirect:
```
/vugoda-web-2/* /:splat 301
```

---

## 8. Custom domain handoff (коли клієнт надасть домен)

### Checklist перед підключенням
1. **Який саме домен?** apex (`vugoda.ua`) чи subdomain (`www.vugoda.ua`)? Обидва?
2. **Де керується DNS?** У реєстратора (hostmaster.ua, namecheap, GoDaddy, Cloudflare)?
3. **Canonical version?** `vugoda.ua` чи `www.vugoda.ua` — один з них canonical, інший 301 redirect.
4. **Чи є існуючий traffic на цьому домені?** (наприклад старий сайт). Якщо так — план тимчасового співіснування / cutover window.
5. **SSL очікування?** Cloudflare Universal SSL працює з коробки. Якщо клієнт хоче EV cert — це окремо.

### Runbook (Сценарій A — DNS на Cloudflare)

1. Cloudflare dashboard → **Add a site** → `vugoda.ua` (apex).
2. Free plan → автоматичний DNS scan з існуючих NS.
3. Cloudflare виводить 2 NS типу `arya.ns.cloudflare.com`, `bran.ns.cloudflare.com`.
4. Клієнт оновлює NS у реєстратора. **TTL window:** 1-48 годин (зазвичай 1-4).
5. Перевірка: `dig NS vugoda.ua +short` має повернути cloudflare NS.
6. У CF Pages project → **Custom domains → Set up a custom domain** → ввести `vugoda.ua`.
7. CF автоматично:
   - Створює CNAME запис `vugoda.ua` → `vugoda-web-2.pages.dev` (з flattening для apex).
   - Випускає SSL сертифікат (5-15 хв).
8. Повторити для `www.vugoda.ua`.
9. У **Pages → Custom domains → www.vugoda.ua → ...** обрати "Redirect to vugoda.ua" (або навпаки — canonical визначається на кроці 3 чеклісту).
10. Smoke test: `curl -I https://vugoda.ua` має повернути 200 і `cf-cache-status: HIT` для статики.

### Runbook (Сценарій B — DNS у зовнішнього провайдера)

1. Pages → Custom domains → Set up → `www.vugoda.ua` (apex через external DNS зазвичай не працює без ALIAS/ANAME — питайте провайдера).
2. CF покаже: "Створіть CNAME `www.vugoda.ua` → `vugoda-web-2.pages.dev`".
3. Клієнт додає CNAME у себе.
4. CF робить domain validation (через ACME challenge або CNAME-check) → 5-30 хв.
5. SSL certificate active.

### Post-cutover

- Перевірити: усі canonical URLs у HTML, Schema.org, sitemap.xml оновлені.
- GSC (Google Search Console): додати новий property `https://vugoda.ua`, submit sitemap.
- GA4/Plausible: оновити base URL property.
- Якщо був traffic на `yaroslavpetrukha.github.io/vugoda-web-2/` — submit "Change of Address" у GSC (працює тільки для верифікованих доменів, тому з github.io не вийде; роль грає `_redirects` rule `/vugoda-web-2/*` яку ми додали — але вона спрацює лише якщо хтось перейде безпосередньо на новий домен з префіксом).

---

## 9. Ризики міграції і mitigation

| Ризик | Ймовірність | Impact | Mitigation |
|---|---|---|---|
| **Зламані абсолютні посилання після прибрання `base: '/vugoda-web-2/'`** | medium | high | Перед merge — grep по `/vugoda-web-2/` у коді: `grep -rn "vugoda-web-2" src/`. Замінити hardcoded шляхи на relative або на `import.meta.env.BASE_URL`. Smoke test на preview deploy. |
| **NODE_VERSION ignored через wrangler.toml у майбутньому** | low | medium | Не створювати wrangler.toml поки не потрібно. Якщо знадобиться — використати `.nvmrc` як primary source. |
| **`_redirects` SPA-fallback infinite loop warning** | medium | low | Не додавати `/* /index.html 200`, покладатись на default SPA-behavior CF Pages (нема `dist/404.html` → auto-serve `index.html`). |
| **DNS propagation downtime при cutover на custom domain** | medium | medium | Cutover у low-traffic вікно (ніч, вихідний). Pre-warm CF cache. Залишити CF Pages alias `vugoda-web-2.pages.dev` як backup доступ. |
| **GH Pages deploy continues to run і consume runner minutes** | high (якщо забути) | low | Stage 6 — видалити `.github/workflows/deploy.yml` після верифікації CF Pages. |
| **Secrets leak через `console.log(env)` у Functions** | low | critical | Code review всіх Functions. Заборонити `console.log(context.env)`. CSP no-unsafe-inline. У Wrangler observability dashboard перевіряти logs. |
| **Turnstile site key неправильний для preview/prod** | medium | high | Дві окремі ключі: test для Preview env, real для Production env. Це Cloudflare-supported pattern. |
| **CF Pages free tier exhausted (500 builds/month)** | low | medium | Branch deployment controls — exclude `wip/*`. Якщо exceed — upgrade Workers Paid $5/month (5000 builds). |
| **Custom domain SSL stuck pending** | low | medium | Перевірити що CAA records у DNS зони не блокують Let's Encrypt / Google Trust Services (Cloudflare використовує обидва). |
| **`/api/contact` повертає 500 через відсутність secrets** | high (під час setup) | high | Health check endpoint `/api/health` що перевіряє наявність env-keys (не values) і повертає 200/503. Smoke-test після deploy. |
| **Search engines reindexing — drop у трафіку** | medium | medium | Submit sitemap у GSC після cutover. Legacy redirect `/vugoda-web-2/*`. 301 preserve PageRank. |

---

## 10. Acceptance criteria (definition of done)

- [ ] CF Pages project `vugoda-web-2` створений, Git integration активна.
- [ ] Push до `main` → production deploy за ≤2 хв.
- [ ] Push до `feature/test-preview` → preview URL з'являється в PR comment.
- [ ] `https://vugoda-web-2.pages.dev` віддає статику, всі шляхи React Router працюють (no 404).
- [ ] `https://vugoda-web-2.pages.dev/api/contact` (POST) повертає 200 (з реальною Functions імплементацією — Phase 2).
- [ ] `curl -I https://vugoda-web-2.pages.dev/assets/<any>.js` показує `cache-control: public, max-age=31536000, immutable`.
- [ ] `curl -I https://vugoda-web-2.pages.dev` показує security headers (HSTS, X-Frame-Options).
- [ ] `vite.config.ts` без `base`, build працює локально (`npm run build && npm run preview`).
- [ ] Secrets для Production і Preview різні, Production secrets ніде не залогавані.
- [ ] `.github/workflows/deploy.yml` видалений або переведений на CI-only.
- [ ] GitHub Pages у repo settings → Source: None.
- [ ] (Коли є custom domain) `https://<домен>` віддає 200 з валідним SSL, www → apex 301.
- [ ] Rollback procedure протестований: rollback на попередній deploy через CF dashboard займає ≤1 хв.

---

## 11. Sources

### Cloudflare Pages docs
- [Cloudflare Pages — Get Started with Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Direct Upload (alternative to Git integration)](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Git Integration configuration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [GitHub integration specifics](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Build configuration (build command, output dir)](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Build image (NODE_VERSION, runtime)](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Branch deployment controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Custom domains setup](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Headers configuration (`_headers`)](https://developers.cloudflare.com/pages/configuration/headers/)
- [Redirects configuration (`_redirects`)](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Serving Pages (SPA fallback default behavior)](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Pages Functions — Get started](https://developers.cloudflare.com/pages/functions/get-started/)
- [Pages Functions — Bindings (secrets)](https://developers.cloudflare.com/pages/functions/bindings/)
- [Pages Functions pricing (rolls into Workers quota)](https://developers.cloudflare.com/pages/functions/pricing/)
- [Pages — Limits (500 builds, unlimited bandwidth)](https://developers.cloudflare.com/pages/platform/limits/)

### Cloudflare Workers (relevant context)
- [Workers Secrets (encrypted env vars)](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Migrate from Pages to Workers (future-proofing)](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Workers SPA mode (alternative SPA pattern)](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Pricing / plans
- [Workers & Pages Pricing](https://www.cloudflare.com/plans/developer-platform/)

### Comparisons (2026 context)
- [Cloudflare Pages vs Workers 2026 (Morph)](https://www.morphllm.com/comparisons/cloudflare-pages-vs-workers)
- [Cloudflare Pages vs Workers 2026 Migration Guide (cogley.jp)](https://cogley.jp/articles/cloudflare-pages-to-workers-migration)
- [Why Direct Upload over Git integration (Genx Notes)](https://blog.genxnotes.com/en/tech/choosing-wrangler-upload-vs-github-integration-cloudflare-pages/)

### Known issues / caveats
- [wrangler.toml ignores NODE_VERSION (cloudflare/workers-sdk#8544)](https://github.com/cloudflare/workers-sdk/issues/8544)
- [SPA `_redirects` infinite loop detection (community)](https://community.cloudflare.com/t/how-to-configure-redirects-for-react-spa-without-infinite-loop-warning/872690)
- [Custom domain requirements 2026 (Silvermine AI)](https://www.silvermine.ai/newsletter/2026-03-13-cloudflare-pages-custom-domain-requirements)
