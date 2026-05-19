# /api/contact Smoke Test Report

**Date:** 2026-05-19
**Tester:** API Tester agent (Opus)
**Endpoint:** `https://vugoda-web-2.pages.dev/api/contact`

## Test Matrix — 19/19 PASS

| # | Test | Method | Expected | Actual | Status |
|---|------|--------|----------|--------|--------|
| 1.1 | GET /api/contact | GET | 405 | 405, `Allow: POST` | ✅ PASS |
| 1.2 | OPTIONS /api/contact | OPTIONS | 405 / 204 | 405, `Allow: POST` | ✅ PASS |
| 1.3 | PUT /api/contact | PUT | 405 | 405 | ✅ PASS |
| 1.4 | DELETE /api/contact | DELETE | 405 | 405 | ✅ PASS |
| 2.1 | POST without Origin | POST | 403 origin | 403 `{ok:false,error:"origin"}` | ✅ PASS |
| 2.2 | POST Origin: evil.com | POST | 403 | 403 | ✅ PASS |
| 2.3 | POST pages.dev origin | POST | passes → Turnstile | 403 turnstile | ✅ PASS |
| 2.4 | POST preview origin (regex) | POST | passes → Turnstile | 403 turnstile | ✅ PASS |
| 2.5 | POST vyhoda.lviv.ua origin | POST | passes → Turnstile | 403 turnstile | ✅ PASS |
| 3.1 | POST invalid JSON | POST | 400 validation | 400 "Invalid JSON" | ✅ PASS |
| 3.2 | POST empty body | POST | 400 validation | 400 "Invalid JSON" | ✅ PASS |
| 4.1 | Empty name | POST | 400 name error | 400 "Ім'я має містити мінімум 2 символи" | ✅ PASS |
| 4.2 | Phone "abc" | POST | 400 phone error | 400 "Невірний формат телефону" | ✅ PASS |
| 4.3 | Missing source | POST | 400 | 400 enum error | ✅ PASS |
| 4.4 | source: "spam" | POST | 400 | 400 enum error | ✅ PASS |
| 4.5 | consent: false | POST | 400 consent | 400 "Згода на обробку ПД обов'язкова" | ✅ PASS |
| 4.6 | Missing turnstileToken | POST | 400 | 400 (EN error message) | ✅ PASS |
| 5 | Valid payload + fake Turnstile | POST | 403 turnstile | 403 turnstile | ✅ PASS |
| 6 | Honeypot company filled | POST | 200 silent | 200 ok with fake requestId | ✅ PASS |

## Honeypot — verified safe
Early-return BEFORE Turnstile siteverify AND `sendTelegram()`. No real Telegram message sent for honeypot test.

## Critical Issues Found

### MEDIUM: Security headers відсутні на API responses
**Корневая причина:** `public/_headers` правила `/*` не застосовуються до Pages Functions responses — це задокументована поведінка CF Pages. `_headers` діє ТІЛЬКИ на статичні assets.

**Поточно:**
- POST responses: `Content-Type: application/json`, `Cache-Control: no-store` ✅
- 405 responses: тільки `Allow: POST`, **жодних security headers**

**Відсутні на API:**
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`  
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

**Ризик:** X-Content-Type-Options відсутність — MEDIUM ризик (старі браузери можуть mime-sniffing). HSTS відсутність — LOW (вже встановлено зі static asset запиту).

### MEDIUM: 405 fallback повертає text/plain без JSON
`onRequest` fallback віддає `Method Not Allowed` як text без `Cache-Control: no-store`. Кешуванння 405 проміжним кешем могло б замаскувати endpoint.

### MEDIUM: CORS behavior — preflight ризик
Якщо production `vyhoda.lviv.ua` mapped як CF Pages custom domain → same-origin OK.
Якщо `vyhoda.lviv.ua` хостить десь інше і fetch йде cross-domain до pages.dev → preflight `OPTIONS` поверне 405 без CORS headers → форма зламається.

**Action:** перевірити що `vyhoda.lviv.ua` буде CF Pages custom domain (наш план — так).

### LOW: Verbose Zod errors leak enum values
Error на missing source повертає всі enum значення у повідомленні. Інформаційно, не security issue.

### LOW: Test 4.6 повідомлення англійською
`"Invalid input: expected string, received undefined"` замість `"Перевірка Turnstile не пройдена"`. Fix: `z.string({ required_error: "..." })`.

## Recommendations (priority order)

1. **P1:** додати security headers у `jsonResponse()` helper + 405 fallback у `functions/api/contact.ts`
2. **P2:** 405 fallback → JSON shape consistent з іншими errors + `Cache-Control: no-store`
3. **P2:** verify production topology — `vyhoda.lviv.ua` має бути CF Pages custom domain (same-origin)
4. **P3:** додати `required_error` у Zod schema для UA error parity
5. **P3:** browser-based E2E з реальним Turnstile widget (вимагає UI тест)

## Verdict
**🟢 PRODUCTION-READY for lead path.**

Security header gap і 405 JSON shape — hardening tasks, не блокери.
