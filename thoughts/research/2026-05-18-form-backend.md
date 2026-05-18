# Contact Form Backend Architecture

> **Status:** Research + architectural proposal
> **Date:** 2026-05-18
> **Scope:** Serverless backend для контактної форми сайту ЖК «ВИГОДА»
> **Frontend:** Vite + React SPA → SSG (Vite + react-static / Astro), хостинг Cloudflare Pages
> **Source-of-truth для форми:** `/Users/admin/Documents/Проєкти/vugoda-web-2/web-design/src/components/ContactForm.tsx`

---

## 1. Поточний стан форми

### Файл
`src/components/ContactForm.tsx` (260 рядків). Компонент **універсальний** — рендериться різними варіантами на сторінках hero / investors / partners / kontakty через props.

### Поля (фактично з коду)

| name (атрибут input) | тип | required | примітка |
|---|---|---|---|
| `name` | text | **так** | autoComplete="name" |
| `phone` | tel | **так** | autoComplete="tel", без маски/валідації формату |
| `email` | email | ні | опційно через `fields=['email']` |
| `topic` | select | ні | values: `investments`, `partnership`, `media`, `career`, `other` |
| `investor_format` | select | ні | values: `property-rights`, `rental-income`, `project-partnership` |
| `org_type` | select | ні | values: `bank`, `contractor`, `supplier`, `legal`, `other` |
| `goal` | text | ні | вільний короткий текст |
| `message` | textarea | ні | rows=4 |

### Підмішується програмно
- `source: string` — ідентифікатор форми, передається через props. Прогнозовані значення: `hero`, `investors`, `partners`, `kontakty` (й інші, що додасть кодова база).

### Поточна логіка submit (рядки 47–58)
```ts
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const payload: Record<string, string> = { source };
  data.forEach((v, k) => { payload[k] = String(v); });
  console.log('[contact-form]', payload);   // ← тільки лог, бекенду немає
  setSubmitted(true);                        // ← оптимістичний UI без перевірки
};
```

### Проблеми, які треба усунути на бекенді
1. **Немає валідації** — ні клієнтської (крім HTML5 `required`), ні серверної.
2. **Немає anti-spam** — будь-який бот форму засабмітить.
3. **Немає state-машини submission** — лише `submitted: boolean`. Бракує `loading | error`.
4. **Немає логування** реальних спроб / помилок.
5. **GDPR-згода** — текст показано, але **факт згоди не зберігається** (немає чекбокса з timestamp; згода неявна через натискання кнопки — це юридично слабке формулювання).

---

## 2. Архітектурний вибір

### 2.1 Pages Functions vs Workers

**Висновок: Pages Functions** (`functions/api/contact.ts`).

| Критерій | Pages Functions | Standalone Worker |
|---|---|---|
| Складність налаштування | мінімальна — папка `functions/` в репо | окремий wrangler-проєкт, окремий деплой |
| CORS / same-origin | автоматичний — той же домен, що сайт | потрібен `Access-Control-Allow-Origin`, обмін через CORS preflight |
| Секрети | Cloudflare dashboard → Pages → Project → Settings → Environment variables | Cloudflare dashboard → Workers → Worker → Settings |
| Cold start | ≈0 (V8 isolate, не Lambda) | ≈0 |
| Деплой | один `git push` — деплоїть SPA + Function атомарно | дві pipeline (front + worker), ризик розсинхрону |
| Preview URL для PR | спадково з Pages, Function теж буде у preview | окремо для Worker |
| Бінди (KV, Rate Limit, secrets) | повна підтримка | повна підтримка |

**Pages Functions = Worker** (підтверджено: «Pages Functions ARE Workers… compiles routes into a Worker, same V8 isolate, same CPU limits, same billing» — [Cloudflare Pages vs Workers 2026](https://dev.to/rickcogley/cloudflare-pages-vs-workers-in-2026-migration-guide-ka7)). Технічної переваги Worker для цього кейсу немає, а DX гірший.

**Routing convention:**
- `functions/api/contact.ts` → URL `/api/contact`
- експортується `onRequestPost` — обробить тільки POST; інші методи → 405 автоматично.

### 2.2 Канал доставки: Email vs Telegram vs Both

**Висновок: Both, з пріоритетом Telegram для MVP.**

| Канал | Швидкість для менеджера | Архів / пошук | Складність | Вартість |
|---|---|---|---|---|
| Telegram | миттєво (push на телефон) | приватний чат / канал — можна шукати | мінімальна, без верифікації домену | $0 безкоштовно |
| Email (Resend) | 1–5 сек | пошта компанії — повноцінний архів, fwd, CRM | потребує верифікації домену `vygoda.ua` через DNS (SPF, DKIM, DMARC) | free: 100/день, 3000/міс (вистачить з лишком — забудовник зі собівартістю м² $1600+ навряд має >100 лідів/добу) |

**Чому both:**
- **Telegram** — швидкий канал «гарячого реагування» для менеджера продажів. Інвестиційна заявка ($1600+/м²) — критичний лід, який має побачити менеджер за хвилину, а не за годину.
- **Email** — формальний архів, можна форвардити юристам, бухгалтерії, CRM-системі (Bitrix24 / KeyCRM в майбутньому).
- **Резервування:** якщо Telegram-бот ляже або токен відкличуть — email все одно дійде. Якщо Resend впаде — Telegram доставить. На бекенді запускаємо обидва канали через `Promise.allSettled` — навіть якщо один впав, відповідь користувачу 200 OK.

**Чому НЕ тільки Telegram:** бот можна випадково видалити, чат — покинути; немає юридичної фіксації запиту персональних даних, що важливо для українського ЗУ «Про захист персональних даних».

**Чому НЕ тільки Email:** менеджер може не дивитись пошту по 4 години — інвестиційний лід остигне.

### 2.3 Anti-spam: Cloudflare Turnstile

**Як працює:**
- Невидимий widget (`appearance="interaction-only"`) — користувач взагалі не бачить капчу, якщо Cloudflare переконаний що це людина.
- Якщо є підозра — показується управління-головоломка (без OCR-кошмарів reCAPTCHA).
- Сайту видається `cf-turnstile-response` токен → форма його відправляє у POST → бекенд викликає `https://challenges.cloudflare.com/turnstile/v0/siteverify` з SECRET_KEY → отримує `{ success: true, hostname, action }`.
- Токен **одноразовий**, валідний 300 секунд.

**Чому Turnstile, а не reCAPTCHA / hCaptcha:**
- Безкоштовний без квот.
- Не передає дані Google (важливо для українського ринку нерухомості — GDPR-friendly).
- Той самий вендор, що і Pages — менше points of failure.
- Працює без JS-фінгерпринтингу, який тригерить privacy-режим Safari.

**Додаткові шари захисту (defense in depth):**
1. Honeypot-поле (`hidden` input з назвою «company» — якщо заповнене → бот).
2. Origin check (`Origin: https://vygoda.ua` → інакше 403).
3. Rate limit per IP (5 запитів за 60 секунд через Cloudflare Rate Limit binding).
4. Zod schema validation на сервері.

---

## 3. API Contract

### 3.1 Endpoint
```
POST https://vygoda.ua/api/contact
Content-Type: application/json
```

### 3.2 Request body schema (Zod)

```ts
// shared/contact-schema.ts — використовується клієнтом і сервером
import { z } from 'zod';

const phoneRegex = /^\+?[\d\s\-\(\)]{9,20}$/;

export const ContactPayloadSchema = z.object({
  // Required
  name: z.string().trim().min(2, 'Імʼя занадто коротке').max(100),
  phone: z.string().trim().regex(phoneRegex, 'Невірний формат телефону'),
  source: z.enum(['hero', 'investors', 'partners', 'kontakty']),

  // Anti-spam (required)
  turnstileToken: z.string().min(1, 'Підтвердіть, що ви не робот'),
  honeypot: z.string().max(0).optional(),         // має бути порожнім

  // GDPR consent (required)
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Потрібна згода на обробку даних' })
  }),

  // Optional fields (залежить від source)
  email: z.string().email('Невірний email').optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional(),
  topic: z.enum(['investments', 'partnership', 'media', 'career', 'other']).optional(),
  investor_format: z.enum(['property-rights', 'rental-income', 'project-partnership']).optional(),
  org_type: z.enum(['bank', 'contractor', 'supplier', 'legal', 'other']).optional(),
  goal: z.string().trim().max(200).optional(),
  project: z.string().trim().max(100).optional(),
});

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;
```

> **Зауваження:** поле `honeypot` має бути **порожнім** (бот його заповнить — Zod завалить запит). Поле `consent` — обовʼязковий `true`, а не неявна згода через натискання.

### 3.3 Response schema

**200 OK — успіх:**
```json
{
  "ok": true,
  "id": "req_01HX...",          // ULID/UUID для трекінгу в логах
  "deliveredVia": ["email", "telegram"]   // які канали спрацювали
}
```

**400 Bad Request — валідація:**
```json
{
  "ok": false,
  "error": "VALIDATION_ERROR",
  "fieldErrors": {
    "phone": "Невірний формат телефону",
    "consent": "Потрібна згода на обробку даних"
  }
}
```

**403 Forbidden — origin / Turnstile fail:**
```json
{
  "ok": false,
  "error": "VERIFICATION_FAILED",
  "message": "Перевірка не пройдена. Оновіть сторінку і спробуйте знову."
}
```

**429 Too Many Requests — rate limit:**
```json
{
  "ok": false,
  "error": "RATE_LIMITED",
  "message": "Забагато спроб. Спробуйте за хвилину.",
  "retryAfter": 60
}
```

Header: `Retry-After: 60`

**500 Internal Server Error — delivery fail:**
```json
{
  "ok": false,
  "error": "DELIVERY_FAILED",
  "message": "Тимчасова помилка. Зателефонуйте нам: +380 ..."
}
```

> **Принцип:** клієнту НЕ розкриваємо деталі (який саме канал упав, який ключ невалідний) — це для лог-агрегатора. Користувачу — людська фраза.

### 3.4 HTTP status codes — повна таблиця

| Status | Коли | Дія на клієнті |
|---|---|---|
| 200 | усе ок (мінімум один канал доставив) | показати `successText` |
| 400 | Zod validation, honeypot triggered | показати `fieldErrors` під полями |
| 403 | Turnstile fail, origin mismatch | показати загальне повідомлення + reset Turnstile widget |
| 405 | не POST | не повинно виникнути від форми |
| 429 | rate limit | disable submit на 60 сек + countdown |
| 500 | внутрішня помилка / **обидва** канали впали | показати «зателефонуйте» з номером |

---

## 4. Security

### 4.1 Origin check / CORS

Pages Functions і фронт = **той самий домен** (`vygoda.ua`), тому CORS взагалі не потрібен (browser same-origin). Але робимо **явну перевірку Origin/Referer** для захисту від cross-site form submission з ботнету:

```ts
const ALLOWED_ORIGINS = [
  'https://vygoda.ua',
  'https://www.vygoda.ua',
  'https://vygoda-web-2.pages.dev',          // Cloudflare preview
];
// Дозволяємо також *.vygoda-web-2.pages.dev для PR preview URLs:
const isPreview = (origin: string) =>
  /^https:\/\/[a-z0-9-]+\.vygoda-web-2\.pages\.dev$/.test(origin);

const origin = request.headers.get('Origin') || '';
if (!ALLOWED_ORIGINS.includes(origin) && !isPreview(origin)) {
  return json({ ok: false, error: 'FORBIDDEN' }, 403);
}
```

### 4.2 Rate limiting

**Native Cloudflare Rate Limit binding** (доступний для Pages Functions через wrangler.toml у репо):

```toml
# wrangler.toml (root of repo)
name = "vygoda-web"
compatibility_date = "2026-05-01"

[[ratelimits]]
name = "CONTACT_FORM_LIMITER"
namespace_id = "2001"

  [ratelimits.simple]
  limit = 5
  period = 60
```

Використання у функції:
```ts
const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
const { success } = await env.CONTACT_FORM_LIMITER.limit({ key: ip });
if (!success) {
  return json({ ok: false, error: 'RATE_LIMITED', retryAfter: 60 }, 429, {
    'Retry-After': '60'
  });
}
```

**Чому не KV:** eventually consistent → паралельні запити нерейтрейтяться. Native Rate Limit API синхронний у межах локації (а нам не потрібен глобальний — спам йде з одного IP).

**Чому не Durable Objects:** оверкіл для контактної форми; native binding безкоштовний на free plan.

### 4.3 Honeypot

У формі додаємо невидиме поле:
```html
<input
  type="text"
  name="company"
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  style="position:absolute;left:-9999px;opacity:0;height:0;width:0"
/>
```

Боти заповнюють всі поля. Користувачі — не побачать. На сервері: якщо `honeypot.length > 0` → **миттєво 200 OK без відправки** (щоб бот не зрозумів, що пастка спрацювала) + лог `spam_honeypot`.

### 4.4 Turnstile token validation

```ts
async function verifyTurnstile(
  token: string,
  ip: string,
  secret: string
): Promise<{ ok: boolean; reason?: string }> {
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  form.append('remoteip', ip);
  form.append('idempotency_key', crypto.randomUUID());

  const r = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: form }
  );
  const data = await r.json<{
    success: boolean;
    hostname?: string;
    'error-codes'?: string[];
  }>();

  if (!data.success) {
    return { ok: false, reason: (data['error-codes'] || []).join(',') };
  }
  if (data.hostname && !['vygoda.ua', 'www.vygoda.ua'].includes(data.hostname)
      && !data.hostname.endsWith('.pages.dev')) {
    return { ok: false, reason: 'hostname-mismatch' };
  }
  return { ok: true };
}
```

> **Важливо:** перевіряємо `hostname` — захист від випадку, коли хтось вкрав sitekey і вставив на свій домен.

### 4.5 Логування

Cloudflare Pages Functions має нативний `console.log` → видно в **Workers Logs** (real-time tail + Logpush у R2/S3 для довгого зберігання).

Логуємо:
```ts
console.log(JSON.stringify({
  level: 'info',
  event: 'contact_form_submit',
  id: requestId,
  source: payload.source,
  ip: ip,
  ua: request.headers.get('User-Agent'),
  channels: ['email:ok', 'telegram:ok'],
  timestamp: new Date().toISOString(),
}));
```

Для невдач — `level: 'warn'` або `'error'`, з причиною, **без PII** (без імені/телефону) — для GDPR-compliance. Зберігаємо лише `phone_hash = sha256(phone)` якщо треба відстежити повторні спроби.

---

## 5. Email template (Resend)

### Конфігурація
- **Sender domain:** `noreply@vygoda.ua` (треба DNS-верифікація: SPF, DKIM, DMARC).
- **Recipient:** `sales@vygoda.ua` (внутрішня скринька менеджера продажів) — або кілька через `to: [...]`.
- **Reply-To:** email клієнта, якщо вказано — щоб менеджер відповідав одним кліком прямо клієнту.
- **From-name:** `ВИГОДА | Заявка з сайту`.

### Тема листа (динамічна за source)
```
[ВИГОДА · investors] Заявка від Олена Кравченко · +380 67 123 45 67
[ВИГОДА · hero]       Заявка від Андрій
[ВИГОДА · partners]   Партнерство · Банк · ТОВ "Райффайзен"
```

### HTML-тіло (HTML + inline CSS — Resend підтримує)

```html
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px;">

  <div style="border-left:4px solid #c8a35a;padding:8px 16px;margin-bottom:24px;background:#faf7f0;">
    <div style="text-transform:uppercase;font-size:11px;letter-spacing:2px;color:#888;">Джерело</div>
    <div style="font-size:18px;font-weight:600;">Investors page · {{source}}</div>
  </div>

  <h2 style="font-size:22px;margin:0 0 16px;">Нова заявка</h2>

  <table style="width:100%;border-collapse:collapse;font-size:15px;">
    <tr style="border-bottom:1px solid #eee;">
      <td style="padding:10px 0;color:#888;width:40%;">Імʼя</td>
      <td style="padding:10px 0;font-weight:600;">{{name}}</td>
    </tr>
    <tr style="border-bottom:1px solid #eee;">
      <td style="padding:10px 0;color:#888;">Телефон</td>
      <td style="padding:10px 0;">
        <a href="tel:{{phone}}" style="color:#c8a35a;text-decoration:none;font-weight:600;">{{phone}}</a>
      </td>
    </tr>
    <tr style="border-bottom:1px solid #eee;">
      <td style="padding:10px 0;color:#888;">Email</td>
      <td style="padding:10px 0;">
        <a href="mailto:{{email}}" style="color:#c8a35a;">{{email}}</a>
      </td>
    </tr>
    <!-- Опційні поля рендеряться тільки якщо заповнені -->
    <tr style="border-bottom:1px solid #eee;">
      <td style="padding:10px 0;color:#888;">Формат інтересу</td>
      <td style="padding:10px 0;">{{investor_format_human}}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#888;vertical-align:top;">Повідомлення</td>
      <td style="padding:10px 0;white-space:pre-wrap;">{{message}}</td>
    </tr>
  </table>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#aaa;">
    <div>ID запиту: {{requestId}}</div>
    <div>Час: {{timestamp}} (Europe/Kyiv)</div>
    <div>IP: {{ip}} · User-Agent: {{ua_short}}</div>
    <div>Згода на обробку ПД: ✓ ({{consent_timestamp}})</div>
  </div>

</body>
</html>
```

Plain-text fallback (для деяких поштовиків):
```
[ВИГОДА · investors]

Імʼя:    Олена Кравченко
Телефон: +380 67 123 45 67
Email:   olena@example.com

Формат:  Купівля майнових прав
Повідомлення:
  Цікавить інвестиція 2-3 квартири у 2-ій черзі.

—
ID: req_01HX...
Час: 18.05.2026 14:32 Europe/Kyiv
```

> **Маппінг машинних значень у людські** робимо на сервері (`property-rights` → «Купівля майнових прав»), бо менеджер не повинен памʼятати enum-коди.

---

## 6. Telegram template

### Налаштування
1. У @BotFather створити бот: `/newbot` → `vygoda_leads_bot` → отримати TOKEN.
2. Менеджер пише боту `/start` → бот логує `chat.id`.
3. Альтернативно — створити приватний канал, додати бота як адміна, використовувати `chat_id` каналу (через `getUpdates` або @userinfobot).
4. Зберегти `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID` як секрети.

### Endpoint
```
POST https://api.telegram.org/bot<TOKEN>/sendMessage
Content-Type: application/json

{
  "chat_id": -1001234567890,
  "text": "...",
  "parse_mode": "HTML",
  "disable_web_page_preview": true
}
```

### Шаблон повідомлення (HTML, ліміт **4096 символів**)

```html
🔔 <b>Нова заявка · investors</b>

👤 <b>Олена Кравченко</b>
📞 <a href="tel:+380671234567">+380 67 123 45 67</a>
✉️ <a href="mailto:olena@example.com">olena@example.com</a>

💼 <b>Формат:</b> Купівля майнових прав

💬 <i>Цікавить інвестиція 2-3 квартири у 2-ій черзі. Розгляну також пакетну пропозицію.</i>

<code>req_01HX3K2YT5...</code> · 14:32
```

### Особливості Telegram HTML
- Підтримує: `<b>`, `<i>`, `<u>`, `<s>`, `<code>`, `<pre>`, `<a href>`, `<blockquote>`.
- НЕ підтримує: `<br>`, `<p>`, `<div>` — використовуй `\n` для переносів.
- Спецсимволи `<`, `>`, `&` у тексті користувача → escape перед вставкою (інакше Telegram поверне `Bad Request: can't parse entities`).
- `tel:` лінк відкриває диалер на телефоні менеджера — **критична UX-фіча** для гарячого ліда.

### Escape helper
```ts
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
```

---

## 7. Environment variables

Налаштовуються у Cloudflare Dashboard → **Pages → vygoda-web → Settings → Environment variables**. Розділяти **Production** і **Preview** scopes — для preview можна вказати тестового бота / Resend test-key.

| Variable | Type | Where | Опис |
|---|---|---|---|
| `TURNSTILE_SITE_KEY` | plain text | Production, Preview | публічний sitekey (також використовується клієнтом — можна inline у HTML) |
| `TURNSTILE_SECRET_KEY` | **Secret** | Production, Preview | для виклику siteverify |
| `RESEND_API_KEY` | **Secret** | Production, Preview (test key) | для надсилання email |
| `RESEND_FROM` | plain text | Production | `ВИГОДА <noreply@vygoda.ua>` |
| `RESEND_TO` | plain text | Production | `sales@vygoda.ua` або CSV `sales@vygoda.ua,owner@vygoda.ua` |
| `TELEGRAM_BOT_TOKEN` | **Secret** | Production | токен від @BotFather |
| `TELEGRAM_CHAT_ID` | plain text | Production | негативне число для каналу, додатнє для приватного чату |
| `CONTACT_ALLOWED_ORIGINS` | plain text | Production | CSV: `https://vygoda.ua,https://www.vygoda.ua` |

**Binding (через wrangler.toml у репо, не через UI):**
- `CONTACT_FORM_LIMITER` — Rate Limit binding (див. розділ 4.2).

> **Безпекове правило:** `*_SECRET_KEY` і `*_TOKEN` — завжди **Secret** type. Видно лише в момент створення; пізніше тільки замінити, не прочитати.

---

## 8. GDPR / обробка ПД

Український ЗУ «Про захист персональних даних» + дисклеймер у формі:
> «Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних…»

### Поточна проблема
Згода **неявна** (через факт натискання). Юридично слабка позиція — клієнт може стверджувати, що «не помітив текст».

### Рекомендація — мінімальне посилення без зміни UX
Додати **прихований checkbox** який автоматично виставлений у `true` коли користувач сабмітить (тобто сабміт = акт згоди), АЛЕ:
- зберігати на бекенді `consent_text` (точний текст, який бачив користувач) + `consent_timestamp` у логах **разом** із записом про заявку.
- передавати ці поля в email менеджеру для архіву.

### Максимальне посилення (якщо клієнт просить)
Видимий **необовʼязковий** чекбокс з посиланням на «Політику обробки персональних даних» (`/politika-konfidentsiynosti`). Чекбокс має бути ВИМКНЕНИЙ за замовчуванням (це GDPR-вимога — opt-in, не opt-out). Без галочки кнопка submit `disabled`.

**Не зберігати** у логах поля `name`, `phone`, `email` у відкритому вигляді довше **30 днів** — Workers Logs сам ротує, але якщо включаєш Logpush → потрібно ввімкнути redaction або хешування. У самому листі/Telegram дані лишаються (бо це сенс системи).

---

## 9. Файли, які треба буде створити

```
web-design/
├── functions/
│   └── api/
│       └── contact.ts                 ← onRequestPost handler
├── shared/
│   ├── contact-schema.ts              ← Zod schema (імпортується клієнтом і сервером)
│   └── form-types.ts                  ← TS типи, derived з Zod
├── src/
│   ├── components/
│   │   ├── ContactForm.tsx            ← переписати: fetch, state, errors
│   │   ├── TurnstileWidget.tsx        ← обгортка над window.turnstile
│   │   └── (опц.) HoneypotField.tsx
│   └── hooks/
│       └── useContactSubmit.ts        ← інкапсуляція fetch + retry + state
├── wrangler.toml                       ← rate limit binding, compatibility_date
├── .dev.vars                           ← локальні секрети для `wrangler pages dev`
│                                         (в .gitignore!)
└── thoughts/
    └── research/
        └── 2026-05-18-form-backend.md  ← цей документ
```

### Скелет `functions/api/contact.ts`
```ts
import { ContactPayloadSchema } from '../../shared/contact-schema';

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  RESEND_TO: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  CONTACT_ALLOWED_ORIGINS: string;
  CONTACT_FORM_LIMITER: RateLimit;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  const requestId = crypto.randomUUID();

  // 1. Origin check
  // 2. Rate limit (env.CONTACT_FORM_LIMITER.limit)
  // 3. Parse JSON → Zod validate
  // 4. Honeypot check → 200 OK silently if filled
  // 5. Turnstile verify (siteverify)
  // 6. Promise.allSettled([sendEmail, sendTelegram])
  // 7. Return 200 / 4xx / 5xx
};
```

### Зміни у `ContactForm.tsx` (high-level)
- Стани: `idle | loading | success | error`.
- `useReducer` або 3 `useState` для прозорості.
- Поле Turnstile-widget (видимий або invisible).
- Поле honeypot (прихований).
- Поле consent — checkbox (видимий або hidden+true).
- На submit: `fetch('/api/contact', { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type':'application/json'} })`.
- Retry policy: лише для 5xx, 1 повтор через 2 сек.
- Disable submit на час `loading` + після 429 на 60 сек.

---

## 10. Локальна розробка

```bash
# wrangler pages dev — підтримує functions/ нативно
npx wrangler pages dev ./dist --compatibility-date=2026-05-01
# Використовує .dev.vars для секретів (NOT .env)
```

Файл `.dev.vars` (в `.gitignore`):
```
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
# ← це тестовий ключ, який ЗАВЖДИ повертає success: true
RESEND_API_KEY=re_test_...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

**Turnstile test keys** (для dev/CI без капчі):
- sitekey `1x00000000000000000000AA` → завжди проходить
- sitekey `2x00000000000000000000AB` → завжди блокує
- secret `1x0000000000000000000000000000000AA` → завжди success
- secret `2x0000000000000000000000000000000AA` → завжди fail

---

## 11. Майбутні розширення (post-MVP)

Не для першої ітерації, але закласти у архітектуру:

1. **CRM-інтеграція** — додати третій канал `pushToCRM()` в `Promise.allSettled` (Bitrix24 / KeyCRM webhook).
2. **D1 (SQLite) для архіву заявок** — якщо клієнт захоче дашборд статистики (скільки лідів з якої форми за тиждень).
3. **Webhook у Slack** — якщо команда мігрує з Telegram.
4. **AI-класифікатор** — використати Cloudflare Workers AI для класифікації важливості ліда (інвестор з пропозицією на 5+ квартир → пріоритет alert).
5. **Email auto-reply** — підтвердження клієнту з юр.особою ВИГОДА+ (реквізити з пам'яті проєкту), щоб у спам не пішло.

---

## 12. Sources

- [Cloudflare Pages vs Workers in 2026: Migration Guide](https://dev.to/rickcogley/cloudflare-pages-vs-workers-in-2026-migration-guide-ka7)
- [Cloudflare Pages Functions docs](https://developers.cloudflare.com/pages/functions/)
- [Cloudflare Pages Functions API Reference](https://developers.cloudflare.com/pages/functions/api-reference/)
- [Cloudflare Pages Functions Routing](https://developers.cloudflare.com/pages/functions/routing/)
- [Cloudflare Workers Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Cloudflare Turnstile — Get Started](https://developers.cloudflare.com/turnstile/get-started/)
- [Cloudflare Turnstile — Server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Turnstile — Client-side rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Resend — Pricing](https://resend.com/pricing)
- [Resend — Send with Cloudflare Workers](https://resend.com/docs/send-with-cloudflare-workers)
- [Resend — Account Quotas and Limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Cloudflare Workers KV vs Durable Objects for Rate Limiting](https://community.cloudflare.com/t/cloudflare-workers-kv-and-rate-limiting/137207)
