// Cloudflare Pages Function: POST /api/contact
// Telegram-only delivery (per spec §5.3 — Resend is out of scope)
// 4-layer defense: Origin / Turnstile / Honeypot / Zod

import { ContactSchema, type ContactPayload } from '../../shared/contact-schema';

// Minimal Cloudflare Pages Function types — avoids requiring @cloudflare/workers-types
interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  TURNSTILE_SECRET_KEY: string;
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

const ALLOWED_ORIGINS: Array<string | RegExp> = [
  'https://vyhoda.lviv.ua',
  'https://www.vyhoda.lviv.ua',
  // Cloudflare Pages preview deployments
  /^https:\/\/[a-z0-9-]+\.vugoda-web-2\.pages\.dev$/,
  'https://vugoda-web-2.pages.dev',
];

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
    case 'contacts':
    case 'kontakty':
      return 'Контакти';
    default:
      return source;
  }
}

async function sendTelegram(
  payload: ContactPayload,
  env: Env,
  requestId: string,
  ipHash: string,
): Promise<boolean> {
  const lines: string[] = [];
  const label = sourceLabel(payload.source);

  lines.push(`<b>Нова заявка — ${escapeHtml(label)}</b>`);
  lines.push('');
  lines.push(`<b>Імʼя:</b> ${escapeHtml(payload.name)}`);

  // Phone wrapped as tel: link for one-tap dial from mobile
  const phoneClean = payload.phone.replace(/[^\d+]/g, '');
  lines.push(
    `<b>Телефон:</b> <a href="tel:${escapeHtml(phoneClean)}">${escapeHtml(payload.phone)}</a>`,
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

  const r = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: trimmed,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    },
  );

  return r.ok;
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + 'vugoda-salt-2026');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12);
}

// Handle POST /api/contact
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  // 1. Origin check
  const origin = request.headers.get('Origin');
  if (!isOriginAllowed(origin)) {
    return jsonResponse(
      { ok: false, error: 'origin', message: 'Origin not allowed' },
      403,
    );
  }

  // 2. Parse JSON body
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, error: 'validation', message: 'Invalid JSON' },
      400,
    );
  }

  // 3. Honeypot check before Zod — if company field filled, bot detected (silent 200)
  const rawRecord = raw as Record<string, unknown> | null;
  const honeypotValue = rawRecord?.company;
  if (typeof honeypotValue === 'string' && honeypotValue.length > 0) {
    const requestId = crypto.randomUUID();
    console.log(`[spam_honeypot] requestId=${requestId}`);
    return jsonResponse({ ok: true, requestId }, 200);
  }

  // 4. Zod validation
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        error: 'validation',
        message: parsed.error.issues[0]?.message ?? 'Validation failed',
      },
      400,
    );
  }

  const payload = parsed.data;
  const requestId = crypto.randomUUID();
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const ipHash = await hashIp(ip);

  // 5. Turnstile server-side verification (runs BEFORE Telegram)
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
      },
      403,
    );
  }

  // 6. Send to Telegram
  try {
    const sent = await sendTelegram(payload, env, requestId, ipHash);
    if (!sent) {
      console.error(`[telegram_fail] requestId=${requestId}`);
      return jsonResponse(
        {
          ok: false,
          error: 'server',
          message:
            'Не вдалось доставити повідомлення. Зателефонуйте напряму: 0969 900 390',
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
        message: 'Серверна помилка. Зателефонуйте напряму: 0969 900 390',
      },
      500,
    );
  }
};

// Reject all other HTTP methods
export const onRequest: PagesFunction = async () => {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
};
