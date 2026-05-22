# Phase 4 — Defense-in-depth: Handoff

**Date:** 2026-05-22
**Branch:** `feature/contact-form-defense`
**Commit:** `e5b47ef7e9121adab956eb485c0d315ef8a93c52`
**Agent:** Security Engineer

---

## Files Created / Modified

| File | Change | Notes |
|------|--------|-------|
| `shared/disposable-emails.ts` | NEW | Curated blocklist + `isDisposableEmail()` helper |
| `functions/api/contact.ts` | MODIFIED | Import + step 8a check added |
| `progress/cf-waf-rate-limit-runbook.md` | NEW | Manual CF Dashboard setup guide |
| `tests/unit/disposable-email.test.ts` | NEW | 29 test cases, all green |

---

## Blocklist stats

| Metric | Value |
|--------|-------|
| Unique domains in Set | **200** |
| Raw file size | 7.7 KB |
| Gzip size | 2.1 KB |
| CF Workers bundle impact | ~2 KB (gzip) — within spec ("~10KB OK") |
| Legitimates excluded | protonmail.com, tutanota.com, pm.me, zoho.com, fastmail.com, hey.com, icloud.com, yahoo.com, gmail.com, ukr.net, i.ua, meta.ua |

Coverage areas: 10-minute/timed-expiry services, Mailinator family, Guerrilla Mail / yopmail cluster, throwaway/trashmail services, fakeinbox / spambox / airmail, bot-favourite burner domains (armyspy, cuvox, dayrep, etc.), Cyrillic-targeting typo domains.

---

## How the check works

Location in `functions/api/contact.ts`: **step 8a**, after Zod parse succeeds (`parsed.data` is available), before TIME_TRAP_SECRET config check (step 8).

```
Origin check → Body size → Rate limit → JSON parse → Honeypot
→ Zod validation → [8a] Disposable email check  ← NEW
→ TIME_TRAP_SECRET check → Time-trap HMAC → Sanitize
→ URL block → Phone normalize → Soft flags → Turnstile → Telegram
```

Rejected requests log `[spam_disposable_email] requestId=<uuid>` and return:

```json
HTTP 400
{
  "ok": false,
  "error": "validation",
  "message": "Тимчасові email не приймаються. Вкажіть, будь ласка, основну адресу.",
  "requestId": "<uuid>"
}
```

Email field is optional in the schema — check only runs `if (data.email)`.

---

## Gates status

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | PASS (0 errors) |
| `npm run lint` | PASS (0 errors) |
| `npm run test` | PASS (149/149 tests, 9 test files) |
| `npm run build` | PASS (built in 5.33s) |
| `npm run build:verify` | PASS (20/20 SEO checks) |

---

## Manual action required — CF WAF Rate Limit

**This is the only non-code step.** See:
`progress/cf-waf-rate-limit-runbook.md`

Summary: CF Dashboard → Security → WAF → Rate limiting rules → Create rule:
- Expression: `(http.request.uri.path eq "/api/contact" and http.request.method eq "POST")`
- Counter: 5 requests / 1 minute / IP address
- Action: Block, 60 seconds, 429 + custom JSON body

Do this after deploying this branch to production. Free CF tier supports 1 rate-limit rule.

---

## Acceptance criteria coverage

| Criterion (spec §Phase 4) | Status |
|---------------------------|--------|
| CF WAF Rate Limit rule — manual setup documented | DONE (runbook) |
| `shared/disposable-emails.ts` with top-200 entries | DONE (200 unique domains) |
| Email validation: if email provided AND domain matches → `error: 'validation'` + UA message | DONE |

---

## Security posture after Phase 4

All 4 contact form hardening phases are now on the branch. Defense layers in order:

1. Origin allowlist
2. Body size limit (10 KB)
3. CF WAF Rate Limit — 5/min/IP at edge (manual setup, isolate-safe)
4. In-memory rate limit — 5/min/IP per isolate (defense-in-depth for preview/non-zone paths)
5. JSON parse
6. Honeypot (silent 200)
7. Zod schema validation
8. Disposable email blocklist (Phase 4)
9. Time-trap HMAC (min 3s, max 30min)
10. Unicode sanitization + whitespace collapse
11. URL hard-block in structural fields
12. Phone normalization + foreign flag
13. Soft flags (mixed-script, repetition, all-caps, emoji density)
14. Turnstile CAPTCHA verification
15. Telegram delivery with timeout + retry
