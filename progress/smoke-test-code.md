# Code Review — Phase 4 Form Backend

**Reviewer:** Code Reviewer (independent, Bulletproof Stage 9)
**Date:** 2026-05-19
**Files:**
- `shared/contact-schema.ts` (68 lines)
- `functions/api/contact.ts` (286 lines)
- `src/components/ContactForm.tsx` (498 lines)

**Spec:** `specs/2026-05-18-production-readiness.md` §5.3

---

## Verdict

**Block** — є один прямий спец-провал (P0-1 rate limit), один логіко-критичний баг state machine на клієнті (P0-2), і кілька серйозних надійнісних дірок (P1). Telegram-доставка з валідними даними працюватиме у happy-path, але defense-in-depth не виконано на рівні, який вимагає §5.3 спеки і яким його позиціонує план.

Підтверджую вже знайдені іншими агентами проблеми (security headers, `Cache-Control: no-store` на 405, Turnstile test key fallback, submit-enabled-at-first-paint) — НЕ дублюю їх у списку нижче.

---

## Critical issues (P0)

### 1. Rate limit обовʼязковий по спеці — відсутній повністю

- **File:** `functions/api/contact.ts` (вся функція, очікувано після рядка 247 перед Telegram)
- **Spec:** §5.3 рядок 145 — "Rate limit — > 5 запитів з одного IP за 60 секунд → 429 із заголовком `Retry-After: 60`"
- **Why critical:**
  - Прямий blocker за спецою. Контрактний пункт, не nice-to-have.
  - Атакер може відправити 10k запитів/хв з одного IP і виснажити Telegram bot API quota (30 повідомлень/сек на чат) → DoS для реальних лідів.
  - Клієнт **вже обробляє** rate_limited state (`ContactForm.tsx:78-84, 135-138, 480, 484-486`) — UX логіка візуалізує countdown 60s, очікуючи `retryAfter` у відповіді 429. Сервер ніколи цього не повертає → код мертвий і вводить читача коду в оману.
  - Discriminated union `ContactResponse` має поле `retryAfter: z.number().optional()` (`contact-schema.ts:62`) — навмисний контракт без реалізації.
- **Recommended fix:**
  - Використати Cloudflare Rate Limiting binding (`unsafe-bindings: rate_limiting_api`) як прямо прописано у спеці ("Cloudflare native binding, не KV").
  - Альтернатива: `caches.default` з ключем `rl:${ipHash}` і encoded timestamps — менш надійно, але працює без paid binding.
  - Status 429, header `Retry-After: 60`, тіло `{ ok: false, error: 'rate_limit', message: '...', retryAfter: 60 }`.

### 2. Client state machine завмирає при некоректній відповіді

- **File:** `src/components/ContactForm.tsx:128-146`
- **Why critical:**
  ```typescript
  if (data.ok) { ... return; }
  if (data.ok === false) { ... return; }
  // Жодного else / fallthrough — state залишається 'submitting' назавжди
  ```
  - Якщо сервер віддає не-JSON (Cloudflare worker error page при OOM/timeout), пустий body, або payload без поля `ok` — `await r.json()` кине exception → потрапить у `catch` (OK). Але якщо JSON парситься валідно, але `data.ok` === `undefined` (наприклад майбутня версія API, malformed response від CDN-кеша) — обидва `if`-и пропускаються, `state` залишається `{ kind: 'submitting' }`, кнопка disabled навіки, користувач має refresh-ити сторінку. Це гірше за whitescreen — це silent UX-deadlock.
  - Також: `r.ok` (HTTP status) взагалі не перевіряється до `r.json()`. Якщо сервер віддає 500 + порожній body, `r.json()` кине, `catch` спрацює — OK. Якщо віддає 500 + JSON body, потрапимо у `data.ok === false`, але без перевірки `r.status === 429` для rate-limit-перевірки крім випадку `429`. Логіка хибна: rate-limit перевіряється тільки коли `data.ok === false` І `r.status === 429`. Якщо сервер забуде виставити status 429 (а current implementation його і не виставляє), countdown не запуститься.
- **Recommended fix:**
  - Замінити на `if (data.ok) {...} else {...}` — TypeScript discriminated union гарантує покриття.
  - Перевіряти `error === 'rate_limit'` а не `r.status === 429` (надійніше, бо контракт у тілі).
  - Або: додати `default` гілку, що ставить generic error.

---

## Important issues (P1)

### 3. Phone regex приймає мотлох — UA-формат не валідується

- **File:** `shared/contact-schema.ts:21`
- **Pattern:** `/^[+\d][\d\s()+-]{7,20}$/`
- **Why important:**
  - Приймає: `+++++++++++`, `(((((((`, `+---------`, `12345678` (US), `+99999999999`. Жодного контролю кількості цифр.
  - Не приймає валідне `+38 (067) 123-45-67` — string має 19 знаків, але разом з `+` — це 19 chars, входить в [8,21]. OK. Але приймає `+12345678` (US-like short).
  - UA-вимога: 10 цифр (`0XX XXX XX XX`) або 12 з кодом країни (`+380XX XXX XX XX`).
- **Recommended fix:**
  - Двоступенева валідація: `.regex(/^[+\d][\d\s()-]{8,20}$/)` для UI-friendly формату + `.refine(s => { const d = s.replace(/\D/g, ''); return d.length === 10 || d.length === 12; }, 'Невірна кількість цифр')`.
  - Або сильніше: `/^(\+380|380|0)\d{9}$/.test(phone.replace(/[\s()-]/g, ''))`.

### 4. Дві назви для одного source: `kontakty` + `contacts`

- **File:** `shared/contact-schema.ts:8-9`, `functions/api/contact.ts:104-106`
- **Why important:**
  - Дубль semantic ідентифікаторів — `kontakty` і `contacts` обидва мапляться на label `'Контакти'`.
  - Збільшує surface для bugs (хто керує яким значенням з якої сторінки? — нерегламентовано).
  - У Telegram звіті неможливо відрізнити сторінку `/kontakty` від `/contacts` якщо обидві існують, або зрозуміти legacy reason.
- **Recommended fix:** Один canonical source (`kontakty` — поточний URL українською). Якщо `contacts` потрібен для зворотної сумісності — додати коментар чому.

### 5. Race condition: подвійний submit при швидкому кліку

- **File:** `src/components/ContactForm.tsx:86-89`
- **Why important:**
  - `if (state.kind === 'submitting' || ...) return;` — захист через React state.
  - React 18 батчить setState, але не гарантує що між кліком N і кліком N+1 (50ms) `state` встигне оновитися. Особливо при slow CPU / DevTools profiling.
  - Турнстайл-токен single-use → другий submit отримає 403 з валідною помилкою. Так що це не security-bug, а UX-bug + зайвий запит до Telegram (першим виграє race).
- **Recommended fix:** `const inFlightRef = useRef(false);` — перевірка перед setState. Гарантовано синхронне блокування.

### 6. Telegram fetch без таймауту — CF Worker 30s wall time burn

- **File:** `functions/api/contact.ts:157-169`
- **Why important:**
  - `await fetch('https://api.telegram.org/...')` — без AbortController/AbortSignal.
  - Якщо Telegram API повиснув (інцидент в Telegram був не раз), CF Worker дочекається 30s default cap і поверне 524-style помилку до клієнта (вже після `r.ok` так і не настане).
  - Клієнт-side `fetch` теж без timeout — sit and wait.
- **Recommended fix:**
  ```typescript
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try { const r = await fetch(url, { ..., signal: ctrl.signal }); }
  finally { clearTimeout(t); }
  ```
  - 8s — досить для p99 Telegram + залишок на retry/log.

### 7. Telegram 429/5xx не обробляються

- **File:** `functions/api/contact.ts:171`
- **Why important:**
  - `return r.ok` — true тільки для 2xx. 429/5xx від Telegram → клієнт побачить generic "не вдалось доставити".
  - При 429 від Telegram (flood control на чат, типово при 30+ msg/sec) ідеально було б retry з backoff, або хоча б `retryAfter` у тілі помилки парсити (Telegram віддає `parameters.retry_after`).
  - Зараз заявка просто губиться. Користувач отримує "зателефонуйте", але якщо заявка вже доставлена на дублі retry — буде дубль.
- **Recommended fix:**
  - Один retry з backoff 500ms при 429/5xx.
  - Log status code: `console.error(`[telegram_fail] requestId=${requestId} status=${r.status}`)`.

### 8. No JSON body size limit — DoS surface

- **File:** `functions/api/contact.ts:197`
- **Why important:**
  - `await request.json()` без перевірки `Content-Length`. CF Workers має 100 MB body cap — це 100 MB парсингу для bot, який POST-ить 50 MB JSON.
  - Турнстайл-перевірка тільки ПІСЛЯ парсингу → бот без токена тратить наш CPU на парсинг 50MB.
  - На Free tier CPU time = quota.
- **Recommended fix:**
  ```typescript
  const cl = parseInt(request.headers.get('Content-Length') ?? '0');
  if (cl > 16 * 1024) return jsonResponse({ ok: false, error: 'validation', message: 'Payload too large' }, 413);
  ```
  - 16 KB — генерує запас x8 проти реалістичних 2 KB форми.

### 9. `as` cast на `request.json()` без runtime-guard

- **File:** `functions/api/contact.ts:206`
- **Why important:**
  - `const rawRecord = raw as Record<string, unknown> | null;`
  - `raw` може бути string, array, number, boolean — `request.json()` парсить будь-який JSON.
  - У поточному коді `rawRecord?.company` для string/array поверне undefined (string має `.company === undefined`, як і array). Honeypot ОК пропустить.
  - Але далі `ContactSchema.safeParse(raw)` отримує невалідний тип → 400. ОК, але через цей довгий шлях.
  - Більш чистий guard: `if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return 400` перед honeypot.
- **Recommended fix:** Type-guard блок одразу після парсингу JSON, до honeypot.

### 10. Constant salt у IP hash — pseudonymization slabka

- **File:** `functions/api/contact.ts:174-181`
- **Why important:**
  - `'vugoda-salt-2026'` — константа. Rainbow table для всіх IPv4 (4 млрд) можна предобчислити за пару годин.
  - GDPR Recital 26: hashed/pseudonymized data is still personal data if reversal is feasible.
  - У спеці §5.3 пункт 160: "У логах Cloudflare Pages Functions немає plain-text персональних даних — тільки `requestId`, IP-hash" — IP-hash наявний, але це **persona data за GDPR**.
- **Recommended fix:**
  - Прийнятно для internal log (12-char prefix, не повний hash).
  - Якщо суворіше — daily-rotating salt з env var, що ротується раз/рік.
  - Якщо цей рейтинг не блокер — лишити, але документувати у privacy policy.

### 11. PII logging — `console.error(..., e)` потенційно

- **File:** `functions/api/contact.ts:267`
- **Why important:**
  - `console.error(`[server_error] requestId=${requestId}`, e);`
  - Якщо `e` — це нормальний `Error` від fetch, він не містить body. ОК.
  - Якщо хтось додасть `throw new Error(\`payload: ${JSON.stringify(payload)}\`)` пізніше — leak. Зараз безпечно, але крихкий код.
- **Recommended fix:** Log тільки `e.message` або `String(e)`, не сам обʼєкт. Або whitelist полів.

---

## Nice-to-have (P2)

### 12. `secondsLeft` cast зайвий — TS narrowing проблема

- **File:** `src/components/ContactForm.tsx:179-181`
- ```typescript
  const isRateLimited = state.kind === 'rate_limited';
  const secondsLeft = isRateLimited
    ? (state as { kind: 'rate_limited'; secondsLeft: number }).secondsLeft
    : 0;
  ```
- TS не наративить через const-extracted boolean. Cast technically correct, але:
- **Better:** `const secondsLeft = state.kind === 'rate_limited' ? state.secondsLeft : 0;` — пряме narrowing, нуль cast-ів.

### 13. Honeypot field не має `aria-hidden` на label

- **File:** `src/components/ContactForm.tsx:203-210`
- Input має `aria-hidden="true"` — добре.
- Але input має `name="company"`, що для screen reader все одно через AT може бути зачитане якщо знайде через form-iteration API.
- **Better:** Додати `<input ... aria-hidden="true" tabIndex={-1} autoComplete="off" />` обгорнути у `<div aria-hidden="true">` для повної ізоляції від AT-навігації.

### 14. `phoneClean` для tel: link — superflous escapeHtml

- **File:** `functions/api/contact.ts:128`
- `phoneClean = payload.phone.replace(/[^\d+]/g, '')` — після цього `phoneClean` містить ТІЛЬКИ `\d` та `+`. `escapeHtml(phoneClean)` — no-op, бо жоден з цих символів не екранується.
- Безпечно, але дезорієнтує читача: "чого це тут escape?".
- **Better:** Коментар `// escapeHtml is no-op on \d+ chars but kept for consistency`. Або просто прибрати.

### 15. Submit handler не cancel-ить fetch на unmount

- **File:** `src/components/ContactForm.tsx:121-156`
- Якщо користувач натиснув submit → перейшов на іншу сторінку до резолва — `setState` спрацює на unmounted компоненті. React 18 ignore-ить warning, але кращий стиль — `AbortController` в `useRef` + `useEffect` cleanup.

### 16. Telegram message trim на 4000 — фіксована константа

- **File:** `functions/api/contact.ts:155`
- Telegram ліміт 4096. Запас 96 чарів на `...` + entities encoding. ОК.
- Але якщо trim ріже посередині HTML-tag (наприклад, `<b>Повідомле...`), Telegram відхилить весь меседж з parse error.
- **Better:** Trim по словах + переконатися що `< ... >` не порушені. Або просто truncate `payload.message` до 3000 чарів ДО формування HTML.

### 17. Disclaimer повідомлення — `'on'` залежність від HTML behavior

- **File:** `src/components/ContactForm.tsx:99-103`
- `v === 'on'` — стандарт HTML, але крихкий для testing (jsdom може віддати `'true'` залежно від setup).
- **Better:** `raw.consent = !!v;` — checkbox FormData буде `'on'` тільки якщо checked, інакше field взагалі відсутній. `!!v` працює як truthy check.

### 18. `successText` prop використовується, але `description` в success state — ні

- **File:** `src/components/ContactForm.tsx:158-173`
- Success-стан показує hard-coded `'Прийнято.'` як `<h3>`, ігноруючи `heading` і `description` props. Це не баг, а свідомий UX-вибір — але дуже легко випадково регресити на A11y rebuild.

### 19. `Cache-Control: no-store` для 405 fallback відсутній

- **File:** `functions/api/contact.ts:280-285` — `onRequest` повертає plain Response без `Cache-Control`.
- Вже флагнуто API-тестером. Лишаю тут для повноти reviewer-чек-листа.

---

## Security analysis

| Категорія | Статус | Деталі |
|---|---|---|
| **HTML injection (Telegram parse_mode=HTML)** | **SAFE** | Усі user inputs пройшли `escapeHtml` (`contact.ts:121, 123, 128, 131-140`). 5 чарів покрито (`& < > " '`). Telegram parse_mode HTML вимагає `& < >` мінімум — є з запасом. |
| **Origin spoofing** | **SAFE з нюансом** | Регекс `/^https:\/\/[a-z0-9-]+\.vugoda-web-2\.pages\.dev$/` anchored, hostname-only. Header `Origin` від браузера не може бути підроблений з-під JS на чужому домені (CORS preflight). Прямі curl-запити можуть підробити Origin — це accepted attack vector для backend без auth. Захист: Turnstile + honeypot. |
| **Turnstile replay** | **MITIGATED** | Cloudflare Turnstile siteverify rejects duplicate tokens (server-side single-use guarantee — це у Cloudflare docs). Клієнт reset-ить widget на error (`ContactForm.tsx:141-142, 148-149`). Жодного власного кешу не треба. |
| **DoS** | **VULNERABLE** | (1) Немає rate limit (P0-1). (2) Немає body size limit (P1-8). (3) Telegram fetch без timeout (P1-6). Bot з одного IP може 100 req/s → Telegram quota burn. |
| **PII logging** | **MOSTLY SAFE** | Усі логи містять тільки `requestId` (`contact.ts:210, 253, 267`) + ipHash. Імʼя/телефон/email — НЕ логуються у `console.*`. `console.error(..., e)` має теоретичний leak risk (P1-11), але поточний код не передає payload у Error message. |
| **Honeypot strength** | **WEAK** | Просто off-screen `<input name="company">` (CSS-only). Сучасні headless bots (puppeteer, playwright) рендерять CSS і пропускають hidden inputs з фокусом. Combined з Turnstile — ОК для MVP. |
| **Phone tel: link injection** | **SAFE** | `phoneClean = phone.replace(/[^\d+]/g, '')` — strip до `\d+` тільки. `href="tel:..."` отримує тільки цифри і `+`. Безпечно. |
| **JSON body DoS** | **VULNERABLE** | P1-8 above. |
| **Information disclosure** | **GOOD** | Error messages генеричні ("Validation failed", "Перевірка Turnstile не пройдена"). `parsed.error.issues[0]?.message` — українські повідомлення з Zod schema, не leak логіки. ОК. |
| **Race conditions** | **MINOR** | Client double-submit (P1-5). Server stateless, race на rate_limit неможливий до реалізації. |

---

## Correctness analysis

| Перевірка | Статус | Коментар |
|---|---|---|
| **Phone regex UA formats** | **WEAK** | P1-3. Приймає `+12345678`, `+++++++++++`. Не блокер для лідів, але smut data у Telegram. |
| **`source` enum покриття** | **OK з дублем** | Усі 11 values покриті у `sourceLabel()`. `contacts`+`kontakty` дубль (P1-4). |
| **Submit button disabled state** | **OK** | `disabled={isBusy || isRateLimited || !turnstileToken}` — три причини disabled. Логічно правильно. Test-key fallback ламає це у production (вже флагнуто Evidence Collector). |
| **State machine usability** | **BROKEN** | P0-2. На malformed response state stuck на `submitting`. |
| **Turnstile token reset** | **OK** | Reset у `catch` (line 148) + у `error` гілці (line 141). Не reset на success (не потрібно — компонент unmounts на success). |
| **`consent` parsing** | **OK** | `v === 'on'` корректно для HTML checkbox. Init `consent: false` (line 97) гарантує дефолт. |
| **Network error handling** | **PARTIAL** | `catch { }` ловить fetch failures (line 147-155) — показує укр. помилку з резервним телефоном. ОК. Але `r.ok` не перевіряється до `r.json()` — якщо 500 з порожнім body, `r.json()` throw-ить → потрапляємо у catch (ОК). Якщо 5xx з JSON body — `data.ok === false` path (ОК). Дірка: 4xx з валідним JSON але без поля `ok` — state stuck (P0-2). |
| **Telegram timeout/retry** | **MISSING** | P1-6, P1-7. |
| **Unicode у name** | **OK** | Zod `.max(100)` рахує code units. Кирилиця 1 cu/char. 100 chars достатньо. |
| **Long message** | **OK з нюансом** | Trim на 4000 (P2-16) може ламати HTML посередині таги. |
| **CF Workers 30s timeout** | **AT RISK** | Без Telegram timeout (P1-6) — можливо хіт. |

---

## TypeScript health

| Перевірка | Статус |
|---|---|
| **Жодних `any`** | **PASS** — у всіх трьох файлах не знайдено `any`. |
| **Discriminated union `ContactResponse`** | **PASS на schema-рівні** (`contact-schema.ts:65-67`), **FAIL на client narrowing** (`ContactForm.tsx:128-146` — `if(data.ok)` / `if(data.ok === false)` без exhaustive check, потенційний gap, P0-2). |
| **`PagesFunction<Env>`** | **OK** — type визначений inline (`contact.ts:23`) бо `@cloudflare/workers-types` не імпортовано. Це робочий workaround. Краще було б додати `@cloudflare/workers-types` як devDep, але для одного файлу — прагматично. |
| **`as` casts** | 5 casts: `import.meta.env`, turnstile-response, `data as ContactResponse`, rate-limited state, `Record<string, unknown> \| null`. Жоден не `any`, але 2 з 5 (turnstile-response, ContactResponse) було б краще валідувати через Zod (`ContactSuccess.or(ContactError).parse(data)`). |
| **`type FormState`** | **OK** — clean discriminated union. |
| **`type ExtraField`** | **OK** — literal union, exhaustively mapped. |

---

## Conclusions

**Гнильна точка:** form backend має правильну архітектурну канву (4-layer defense, Zod на обох берегах, escapeHtml для HTML mode, single-source schema), але **§5.3 spec вимога #4 — rate limit — не реалізована повністю**. Це не "забули додати", це системна дірка: клієнт уже візуалізує rate_limited UX, schema має `retryAfter`, але серверний код не виставляє 429 і не лічить запити. Це блокер релізу.

**Друга гнильна точка:** state machine на клієнті має слабе місце на не-щасливих шляхах — silent deadlock на malformed response. На production-сервері це звучить як параноя, на CDN-cache misroute з 502+stale-cache це happens.

**Що добре:**
- HTML escape implementation коректний і consistent.
- Discriminated union на schema-рівні — добре. Single-source schema між клієнтом і сервером — найкращий patern для уникнення drift.
- Honeypot + Turnstile + Origin + Zod — defense in depth присутній.
- PII не логується (за винятком P1-10, P1-11 теоретичних шляхів).
- Phone tel: link справді SAFE завдяки strip-down (хоч і трохи confused-code).
- Жодних `any`. Жодних untyped fetch responses на критичному шляху.

**Рекомендований blocker-set перед production-merge:**
1. **P0-1** — реалізувати rate limit (Cloudflare RL binding) — спец вимога #4 з 5.3.
2. **P0-2** — виправити state machine fallthrough на клієнті.
3. **P1-3** — посилити phone regex з digit-count refinement.
4. **P1-6** — додати AbortController на Telegram fetch (8s timeout).
5. **P1-8** — додати Content-Length guard на 16 KB.

P1-4, P1-5, P1-7, P1-9, P1-10, P1-11 — у follow-up PR одразу після релізу. P2 — у backlog technical-debt.

**Time to fix P0+P1-blockers:** ~3-4 годин (rate limit binding setup найдовший, ~2h).

---

*Reviewer: Code Reviewer, незалежна оцінка Bulletproof Stage 9.*
*Файли НЕ змінювалися — це чистий code review.*
