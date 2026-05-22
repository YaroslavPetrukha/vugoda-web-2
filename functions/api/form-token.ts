// Cloudflare Pages Function: GET /api/form-token
// Issues a short-lived HMAC-signed time-trap token.
// Client fetches this on ContactForm mount; contact.ts validates it.

import { hmacSign } from '../_shared/hmac';

interface Env {
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

const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
    },
  });
}

export const onRequestGet: PagesFunction = async ({ env }) => {
  if (!env.TIME_TRAP_SECRET) {
    console.error('[config_error] TIME_TRAP_SECRET missing in form-token handler');
    return jsonResponse({ ok: false, error: 'config' }, 500);
  }

  const issuedAt = Date.now();
  const nonce = crypto.randomUUID();
  const message = `${issuedAt}.${nonce}`;
  const signature = await hmacSign(message, env.TIME_TRAP_SECRET);
  const token = `${issuedAt}.${nonce}.${signature}`;

  return jsonResponse({ ok: true, token }, 200);
};

// Reject all other HTTP methods
export const onRequest: PagesFunction = async () => {
  return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405);
};
