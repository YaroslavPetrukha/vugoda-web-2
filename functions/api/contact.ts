// Cloudflare Pages Function: POST /api/contact
// Telegram-only delivery (per spec §5.3 — Resend is out of scope)
// Defense layers: Origin / Body-size / Rate-limit / Honeypot / Zod /
//                 Time-trap HMAC / Sanitize / URL-block / Turnstile / Telegram

import { ContactSchema, type ContactPayload } from '../../shared/contact-schema';
import { hmacSign } from '../_shared/hmac';
import { sanitizeUnicode, collapseWhitespace, containsUrl, isMixedScript, hasRepetition, isAllCaps, emojiCount } from '../../src/lib/sanitize';
import { normalizePhoneUA } from '../../src/lib/phone-ua';
import { isDisposableEmail } from '../../shared/disposable-emails';

// Minimal Cloudflare Pages Function types — avoids requiring @cloudflare/workers-types
interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  TURNSTILE_SECRET_KEY: string;
  HASH_SALT: string;
  TIME_TRAP_SECRET: string;
}

interface EventContext<E = Env> {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}

type PagesFunction<E = Env> = (context: EventContext<E>) => Response | Promise<Response>;

// ---------------------------------------------------------------------------
// Security headers applied to EVERY response (P1-1).
// public/_headers is NOT applied to Function responses on CF Pages.
// ---------------------------------------------------------------------------
const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const ALLOWED_ORIGINS: Array<string | RegExp> = [
  'https://vyhoda.lviv.ua',
  'https://www.vyhoda.lviv.ua',
  // Cloudflare Pages preview deployments
  /^https:\/\/[a-z0-9-]+\.vugoda-web-2\.pages\.dev$/,
  'https://vugoda-web-2.pages.dev',
];

// ---------------------------------------------------------------------------
// In-memory rate limiter: 5 req / 60s / IP hash (P0-1).
//
// CAVEAT: in-memory state is NOT shared across CF Worker instances and does
// NOT persist across Worker restarts. This is acceptable for MVP: combined
// with Turnstile it provides sufficient defense. For production scale replace
// with Cloudflare KV or Durable Objects.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Cleanup stale entries for this key
  const timestamps = (rateLimitMap.get(ipHash) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    // Update cleaned list without adding new entry
    rateLimitMap.set(ipHash, timestamps);
    return false; // rate limited
  }

  timestamps.push(now);
  rateLimitMap.set(ipHash, timestamps);
  return true; // allowed
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((rule) =>
    typeof rule === 'string' ? rule === origin : rule.test(origin),
  );
}

function jsonResponse(
  body: object,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

// HTML escape — applied to all user-controlled values before Telegram parse_mode=HTML
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp?: string,
): Promise<boolean> {
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  if (remoteIp) formData.append('remoteip', remoteIp);

  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  const data = (await r.json()) as { success: boolean; 'error-codes'?: string[] };
  return data.success === true;
}

function sourceLabel(source: ContactPayload['source']): string {
  switch (source) {
    case 'investors':
      return 'Інвестор';
    case 'partners':
      return 'Партнер';
    case 'project-lakeview':
      return 'Lakeview';
    case 'project-maetok':
      return 'Маєток';
    case 'project-etno-dim':
      return 'Етно Дім';
    case 'project-nterest':
      return 'NTEREST';
    case 'project-pipeline-04':
      return 'Pipeline-04';
    case 'news-subscribe':
      return 'Новини';
    case 'hero':
      return 'Головна';
    case 'kontakty':
      return 'Контакти';
    default:
      return source;
  }
}

// ---------------------------------------------------------------------------
// Time-trap HMAC token verification.
// Token format: `${issuedAt}.${nonce}.${signature}`
// Window: 3s (min) … 30min (max)
// ---------------------------------------------------------------------------
async function verifyFormToken(
  token: string,
  secret: string,
): Promise<{ valid: boolean; reason?: string }> {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, reason: 'malformed' };

  const [issuedAtStr, nonce, signature] = parts;
  const issuedAt = parseInt(issuedAtStr, 10);
  if (!Number.isFinite(issuedAt)) return { valid: false, reason: 'bad-timestamp' };

  const expected = await hmacSign(`${issuedAtStr}.${nonce}`, secret);

  // Constant-time compare — guard against timing attacks
  if (signature.length !== expected.length) return { valid: false, reason: 'sig-mismatch' };
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return { valid: false, reason: 'sig-mismatch' };

  const age = Date.now() - issuedAt;
  if (age < 3000) return { valid: false, reason: 'too-fast' };
  if (age > 30 * 60 * 1000) return { valid: false, reason: 'expired' };

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Telegram sender with AbortController timeout (P1-3) and 1 retry on
// 429/5xx with 2-second backoff (P1-4).
// ---------------------------------------------------------------------------
async function sendTelegram(
  payload: ContactPayload,
  env: Env,
  requestId: string,
  ipHash: string,
  normalizedPhone: string,
  flags: string[],
): Promise<boolean> {
  const lines: string[] = [];
  const label = sourceLabel(payload.source);

  lines.push(`<b>Нова заявка — ${escapeHtml(label)}</b>`);
  lines.push('');
  lines.push(`<b>Імʼя:</b> ${escapeHtml(payload.name)}`);

  // Phone: use normalized canonical form for tel: link
  lines.push(
    `<b>Телефон:</b> <a href="tel:${escapeHtml(normalizedPhone)}">${escapeHtml(normalizedPhone)}</a>`,
  );

  if (payload.email) lines.push(`<b>Email:</b> ${escapeHtml(payload.email)}`);
  if (payload.topic) lines.push(`<b>Тема:</b> ${escapeHtml(payload.topic)}`);
  if (payload.project) lines.push(`<b>Проєкт:</b> ${escapeHtml(payload.project)}`);
  if (payload.investor_format)
    lines.push(`<b>Формат інтересу:</b> ${escapeHtml(payload.investor_format)}`);
  if (payload.org_type)
    lines.push(`<b>Тип організації:</b> ${escapeHtml(payload.org_type)}`);
  if (payload.goal) lines.push(`<b>Ціль:</b> ${escapeHtml(payload.goal)}`);
  if (payload.message)
    lines.push(`<b>Повідомлення:</b>\n${escapeHtml(payload.message)}`);

  if (flags.length > 0) {
    lines.push('');
    lines.push(`<b>Flags:</b> ${escapeHtml(flags.join(', '))}`);
  }

  lines.push('');
  lines.push(`<i>requestId: ${escapeHtml(requestId)}</i>`);
  lines.push(`<i>IP hash: ${escapeHtml(ipHash)}</i>`);
  lines.push(
    `<i>Час: ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })} (Europe/Kyiv)</i>`,
  );
  lines.push('');
  lines.push(
    `<i>Згода на обробку ПД отримана: ${new Date().toISOString()}</i>`,
  );

  const text = lines.join('\n');
  // Telegram message limit is 4096 characters
  const trimmed = text.length > 4000 ? text.slice(0, 3997) + '...' : text;

  const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const telegramBody = JSON.stringify({
    chat_id: env.TELEGRAM_CHAT_ID,
    text: trimmed,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });

  const doFetch = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      return await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: telegramBody,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  const r = await doFetch();

  if (r.ok) return true;

  // Retry once on 429 or 5xx with 2s backoff (P1-4)
  if (r.status === 429 || r.status >= 500) {
    const body = await r.text().catch(() => '');
    console.error('[telegram_retry]', { status: r.status, body });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const r2 = await doFetch();
    return r2.ok;
  }

  return false;
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(ip + salt);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12);
}

// ---------------------------------------------------------------------------
// Handle POST /api/contact
// ---------------------------------------------------------------------------
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  // 1. Origin check
  const origin = request.headers.get('Origin');
  if (!isOriginAllowed(origin)) {
    const requestId = crypto.randomUUID();
    return jsonResponse(
      { ok: false, error: 'origin', message: 'Origin not allowed', requestId },
      403,
    );
  }

  // 2. Body size limit — max 10 KB (P1-5)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 10240) {
    const requestId = crypto.randomUUID();
    return jsonResponse(
      { ok: false, error: 'validation', message: 'Payload too large', requestId },
      413,
    );
  }

  // Generate requestId early — referenced by rate-limit, honeypot, and all downstream paths
  const requestId = crypto.randomUUID();

  // 3. IP hash (needed for rate limit before we parse body)
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  // HASH_SALT fail-closed — no fallback string in source (P2: security hardening)
  if (!env.HASH_SALT) {
    console.error(`[config_error] HASH_SALT missing requestId=${requestId}`);
    return jsonResponse({ ok: false, error: 'server', message: 'Server config error', requestId }, 500);
  }
  const salt = env.HASH_SALT;
  const ipHash = await hashIp(ip, salt);

  // 4. Rate limit: 5 req / 60s / IP (P0-1)
  if (!checkRateLimit(ipHash)) {
    return jsonResponse(
      { ok: false, error: 'rate_limit', message: 'Забагато запитів. Спробуйте через хвилину.', retryAfter: 60, requestId },
      429,
      { 'Retry-After': '60' },
    );
  }

  // 5. Parse JSON body
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, error: 'validation', message: 'Invalid JSON', requestId },
      400,
    );
  }

  // 6. Honeypot check before Zod — if company field filled, bot detected (silent 200)
  const rawRecord = raw as Record<string, unknown> | null;
  const honeypotValue = rawRecord?.company;
  if (typeof honeypotValue === 'string' && honeypotValue.length > 0) {
    console.log(`[spam_honeypot] requestId=${requestId}`);
    return jsonResponse({ ok: true, requestId }, 200);
  }

  // 7. Zod validation
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        error: 'validation',
        message: parsed.error.issues[0]?.message ?? 'Validation failed',
        requestId,
      },
      400,
    );
  }

  const data = parsed.data;

  // 8a. Disposable email check — reject known burner domains (Phase 4)
  if (data.email && isDisposableEmail(data.email)) {
    console.log(`[spam_disposable_email] requestId=${requestId}`);
    return jsonResponse(
      {
        ok: false,
        error: 'validation',
        message: 'Тимчасові email не приймаються. Вкажіть, будь ласка, основну адресу.',
        requestId,
      },
      400,
    );
  }

  // 8. TIME_TRAP_SECRET config check — fail-closed
  if (!env.TIME_TRAP_SECRET) {
    console.error(`[config_error] TIME_TRAP_SECRET missing requestId=${requestId}`);
    return jsonResponse({ ok: false, error: 'server', message: 'Server config error', requestId }, 500);
  }

  // 9. Time-trap HMAC verification
  const tokenCheck = await verifyFormToken(data.formToken, env.TIME_TRAP_SECRET);
  if (!tokenCheck.valid) {
    console.log(`[spam_time_trap] requestId=${requestId} reason=${tokenCheck.reason}`);
    return jsonResponse(
      { ok: false, error: 'spam', message: 'Перевірка форми не пройдена. Оновіть сторінку.', requestId },
      403,
    );
  }

  // 10. Sanitize — Unicode normalization + whitespace collapse on name
  const sanitizedData = {
    ...data,
    name: collapseWhitespace(sanitizeUnicode(data.name)),
    message: data.message ? sanitizeUnicode(data.message) : data.message,
    goal: data.goal ? sanitizeUnicode(data.goal) : data.goal,
    topic: data.topic ? sanitizeUnicode(data.topic) : data.topic,
  };
  const payload = sanitizedData;

  // 11. URL detection — hard reject URLs in structural fields
  const noUrlFields = ['name', 'goal', 'topic', 'org_type', 'investor_format', 'project'] as const;
  for (const field of noUrlFields) {
    const value = payload[field];
    if (typeof value === 'string' && containsUrl(value)) {
      console.log(`[spam_url_block] requestId=${requestId} field=${field}`);
      return jsonResponse(
        { ok: false, error: 'spam', message: 'Виявлено заборонені посилання у полях форми', requestId },
        400,
      );
    }
  }

  // 12. Phone normalization
  const phoneResult = normalizePhoneUA(payload.phone);
  if (!phoneResult) {
    return jsonResponse(
      { ok: false, error: 'validation', message: 'Невірний формат телефону', requestId },
      400,
    );
  }
  const normalizedPhone = phoneResult.canonical;
  const isForeignPhone = phoneResult.isForeign;

  // 13. Soft flag collection — informational, sent to Telegram but do NOT block submission
  const flags: string[] = [];
  if (isForeignPhone) flags.push('foreign-phone');
  if (payload.message && containsUrl(payload.message)) flags.push('url-in-msg');
  if (isMixedScript(payload.name)) flags.push('mixed-script');
  if (hasRepetition(payload.name) || (payload.message && hasRepetition(payload.message)))
    flags.push('repetition');
  if (payload.message && isAllCaps(payload.message)) flags.push('all-caps');
  if (emojiCount(payload.name) > 5 || (payload.message && emojiCount(payload.message) > 10))
    flags.push('emoji-spam');

  if (flags.length > 0) {
    console.log(`[spam_flags] requestId=${requestId} flags=${flags.join(',')}`);
  }

  // 14. Turnstile server-side verification (runs BEFORE Telegram)
  const turnstileOk = await verifyTurnstile(
    payload.turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    ip,
  );
  if (!turnstileOk) {
    return jsonResponse(
      {
        ok: false,
        error: 'turnstile',
        message: 'Перевірка Turnstile не пройдена. Оновіть сторінку і спробуйте знову.',
        requestId,
      },
      403,
    );
  }

  // 15. Send to Telegram (with timeout + retry)
  try {
    const sent = await sendTelegram(payload, env, requestId, ipHash, normalizedPhone, flags);
    if (!sent) {
      console.error(`[telegram_fail] requestId=${requestId}`);
      return jsonResponse(
        {
          ok: false,
          error: 'server',
          message:
            'Не вдалось доставити повідомлення. Зателефонуйте напряму: 096 990 03 90',
          requestId,
        },
        500,
      );
    }

    return jsonResponse({ ok: true, requestId }, 200);
  } catch (e) {
    console.error(`[server_error] requestId=${requestId}`, e);
    return jsonResponse(
      {
        ok: false,
        error: 'server',
        message: 'Серверна помилка. Зателефонуйте напряму: 096 990 03 90',
        requestId,
      },
      500,
    );
  }
};

// ---------------------------------------------------------------------------
// Reject all other HTTP methods (P1-2: JSON response instead of text/plain)
// ---------------------------------------------------------------------------
export const onRequest: PagesFunction = async () => {
  return jsonResponse(
    { ok: false, error: 'method_not_allowed', message: 'Only POST allowed' },
    405,
    { Allow: 'POST' },
  );
};
