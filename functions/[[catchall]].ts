// Cloudflare Pages Function: catch-all for unknown routes.
//
// CF Pages routing reality (confirmed empirically 2026-05-19..21):
//   - Functions with [[rest]] / [[catchall]] parameters intercept requests
//     BEFORE static asset resolution (prerendered HTML, files in public/).
//   - CF Pages serves __spa-fallback.html / /index.html for any path that
//     reaches static resolution unmatched — including unknown /api/* paths.
//     So passing /api/foo through context.next() yields HTTP 200 with home
//     page HTML. Bad for SEO (Google indexes /api/foo as duplicate /),
//     bad for clients (clients expect JSON 404 from API).
//
// Strategy: explicit whitelists for:
//   1. Prerendered HTML routes (from app/routes.ts) → context.next()
//   2. Real API endpoints (functions/api/*.ts) → context.next()
//   3. Static asset extensions → context.next()
// Everything else → HTTP 404. Unknown /api/* paths get JSON 404. Unknown
// HTML paths get the prerendered 404 page with HTTP 404 status.
//
// When adding a route or API endpoint: update the relevant whitelist below.

interface EventContext<E = Record<string, unknown>> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
}

type PagesFunction = (context: EventContext) => Response | Promise<Response>;

// Routes that have a prerendered index.html in build/client/.
// Keep in sync with app/routes.ts. `/404/index.html` is included so the
// fetch() call inside the 404 branch can resolve via context.next() and
// avoid recursing back into this Worker.
const KNOWN_PRERENDERED_ROUTES = new Set<string>([
  '/',
  '/pidkhid',
  '/portfolio',
  '/portfolio/lakeview',
  '/portfolio/etno-dim',
  '/portfolio/maetok',
  '/portfolio/nterest',
  '/portfolio/pipeline-04',
  '/investoram',
  '/partneram',
  '/kontakty',
  '/novyny',
  '/novyny/lakeview-progress-2026-04-05',
  '/novyny/chek-list-pereveryty-zabudovnyka',
  '/novyny/frankivskyi-raion-lokatsiia-lviv',
  '/diakuyu',
  '/404',
  '/404/index.html',
]);

// Real API endpoints — Pages Functions in functions/api/.
// Keep in sync with functions/api/*.ts file list.
const KNOWN_API_ENDPOINTS = new Set<string>([
  '/api/contact',
  '/api/form-token',
]);

// Static asset extensions served as-is. Functions still intercept these,
// so we must explicitly pass them through to CF Pages' static handler.
// `html` intentionally NOT included — /foo.html requests are unknown and
// should 404 (not fall through to __spa-fallback.html). /404/index.html
// is covered by KNOWN_PRERENDERED_ROUTES whitelist instead.
const STATIC_EXT =
  /\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|css|js|mjs|json|xml|txt|map|pdf|mp4|mp3|webm)$/i;

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function jsonNotFound(): Response {
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const pathname = normalize(url.pathname);

  // API namespace: pass-through ONLY for known endpoints. Unknown /api/* → 404 JSON.
  if (pathname.startsWith('/api/')) {
    if (KNOWN_API_ENDPOINTS.has(pathname)) {
      return context.next();
    }
    return jsonNotFound();
  }

  // Pass-through: static asset requests.
  if (STATIC_EXT.test(pathname)) {
    return context.next();
  }

  // Pass-through: known prerendered HTML routes.
  if (KNOWN_PRERENDERED_ROUTES.has(pathname)) {
    return context.next();
  }

  // Unknown HTML route: serve prerendered 404 page content with HTTP 404 status.
  const fourOhFourUrl = new URL('/404/index.html', url.origin);
  let html: string;
  try {
    const res = await fetch(fourOhFourUrl.toString());
    if (!res.ok) throw new Error(`/404/index.html returned ${res.status}`);
    html = await res.text();
  } catch {
    html =
      '<!doctype html><html lang="uk"><head><meta charset="utf-8">' +
      '<title>404 — ВИГОДА</title>' +
      '<meta name="robots" content="noindex,nofollow"></head>' +
      '<body><h1>Сторінку не знайдено</h1></body></html>';
  }

  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
