# Runbook — Cloudflare WAF Rate Limit для /api/contact

**Дата:** 2026-05-22
**Автор:** Security Engineer agent (Phase 4 contact form hardening)

---

## Навіщо

In-memory rate limit у `functions/api/contact.ts` (5 req/60s/IP) НЕ shared між CF Worker isolate-ами. Кожен isolate тримає свій `Map` незалежно, тому в реальних умовах ліміт практично не спрацьовує проти розподілених або паралельних атак.

CF WAF Rate Limit — це edge-рівень, isolate-safe, без коду. Free tier достатньо.

---

## Передумови

- Plan: **CF Free** (1 rate-limit rule включена безкоштовно)
- Проєкт: `vugoda-web-2` на `pages.dev`
- Custom domain: `vyhoda.lviv.ua` (після DNS делегації на CF)
- Права: доступ до CF Dashboard для акаунту, що керує доменом/Pages

---

## Налаштування (5 хвилин)

### Крок 1. Увійди до CF Dashboard

Відкрий [https://dash.cloudflare.com/](https://dash.cloudflare.com/) і обери потрібний акаунт.

### Крок 2. Обери домен або Pages проєкт

- Якщо вже є custom domain `vyhoda.lviv.ua` → обери його у sidebar.
- Якщо домен ще не на CF (тільки Pages) → правила можна поставити через **Pages → Settings → Functions** → але rate limit через WAF доступний тільки на повноцінних zone-рівні. Тому спочатку підключи custom domain до CF.

### Крок 3. Перейди до WAF

Sidebar: **Security** → **WAF** → вкладка **Rate limiting rules**

### Крок 4. Натисни **Create rule**

### Крок 5. Заповни параметри

| Поле | Значення |
|------|----------|
| **Rule name** | `contact-api-rate-limit` |
| **Description** (опційно) | `Block brute-force on POST /api/contact` |

**If incoming requests match** — Expression Editor (або форма):

```
(http.request.uri.path eq "/api/contact" and http.request.method eq "POST")
```

Або через UI:
- Field: `URI Path` / Operator: `equals` / Value: `/api/contact`
- **+ AND**
- Field: `Request Method` / Operator: `equals` / Value: `POST`

**When rate exceeds:**

| Параметри | Значення |
|-----------|----------|
| Requests | `5` |
| Period | `1 minute` |
| Per | `IP address` |

**Then take action:**

| Параметри | Значення |
|-----------|----------|
| Action | `Block` |
| Block duration | `60 seconds` |
| Response type | `Custom JSON` (рекомендовано) |
| Response code | `429` |

Custom response body (рекомендовано):

```json
{"ok":false,"error":"rate_limit","message":"Забагато запитів. Спробуйте через хвилину.","retryAfter":60}
```

### Крок 6. Deploy

Натисни **Deploy** (або **Save and deploy**).

---

## Перевірка після налаштування

Запусти з терміналу (7 запитів — перші 5 мають отримати `400` від Zod, 6-й і 7-й — `429` від WAF):

```bash
for i in $(seq 1 7); do
  curl -s -o /dev/null -w "req $i: %{http_code}\n" \
    -X POST https://vugoda-web-2.pages.dev/api/contact \
    -H "Origin: https://vugoda-web-2.pages.dev" \
    -H "Content-Type: application/json" \
    -d '{}'
done
```

Очікуваний вивід:

```
req 1: 400
req 2: 400
req 3: 400
req 4: 400
req 5: 400
req 6: 429
req 7: 429
```

Якщо `req 6` повертає `400` замість `429` — WAF rule ще не активна або не поширилась (зачекай 1-2 хвилини після deploy).

---

## Видалення або зміна правила

**Security** → **WAF** → **Rate limiting rules** → знайди `contact-api-rate-limit` → **Edit** або **Delete**.

---

## Trade-offs і архітектурні нотатки

### WAF Block vs. in-memory rate limit

Дія `Block` означає, що request **не дійде до Worker** — це бажана поведінка (захист backend). Водночас in-memory rate limit у `contact.ts` ніколи не спрацює для заблокованих запитів — це нормально, він залишається як defense-in-depth на випадок:

- Нестандартних шляхів (staging, preview deployments без WAF zone)
- Конфігураційних змін WAF

### Free tier ліміт

Free tier: **1 rate-limit rule**. Якщо знадобиться більше правил (окремі ліміти для `/api/form-token` тощо) — CF Pro ($20/міс).

### Pages preview deployments

WAF rule на zone `vyhoda.lviv.ua` НЕ покриває `*.vugoda-web-2.pages.dev` (це окрема zone). Preview deployments залежать від in-memory rate limit у Worker.

### Rollback

Видали rule у dashboard — Workers одразу перестануть отримувати WAF block.

---

## Pillars (cross-reference)

- [`shared/disposable-emails.ts`](../shared/disposable-emails.ts) — blocklist disposable email (Phase 4, code)
- [`shared/contact-schema.ts`](../shared/contact-schema.ts) — Zod source-of-truth для валідації
- [`functions/api/contact.ts`](../functions/api/contact.ts) — in-memory rate limit + усі server-side checks
- [`functions/api/form-token.ts`](../functions/api/form-token.ts) — time-trap HMAC endpoint
- [`specs/2026-05-21-contact-form-hardening.md`](../specs/2026-05-21-contact-form-hardening.md) — Phase 4 acceptance criteria
