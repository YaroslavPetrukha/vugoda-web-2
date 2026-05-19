// Cloudflare Pages Function: catch-all for unknown routes.
//
// CF Pages routing reality (confirmed empirically 2026-05-19):
//   - Functions with [[rest]] / [[catchall]] parameters intercept requests
//     BEFORE static asset resolution (prerendered HTML, files in public/).
//   - This means a naive "intercept everything, return 404" breaks every
//     prerendered HTML route. We must explicitly pass through known routes.
//
// Strategy: hardcoded whitelist of the 12 prerendered routes from
// `app/routes.ts` + `/404`. Anything outside the whitelist is treated as
// an unknown path and served as HTTP 404 with the prerendered 404 page
// content (X-Robots-Tag: noindex).
//
// When adding/removing a route: update KNOWN_PRERENDERED_ROUTES below.

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
  '/404',
  '/404/index.html',
]);

// Static asset extensions served as-is. Functions still intercept these,
// so we must explicitly pass them through to CF Pages' static handler.
// `html` is included to keep direct /<route>/index.html requests stable
// and to protect against any internal sub-request loops to the 404 page.
const STATIC_EXT =
  /\.(html|jpg|jpeg|png|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|css|js|mjs|json|xml|txt|map|pdf|mp4|mp3|webm)$/i;

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const pathname = normalize(url.pathname);

  // Pass-through: API routes (handled by functions/api/*).
  if (pathname.startsWith('/api/')) {
    return context.next();
  }

  // Pass-through: static asset requests.
  if (STATIC_EXT.test(pathname)) {
    return context.next();
  }

  // Pass-through: known prerendered HTML routes.
  if (KNOWN_PRERENDERED_ROUTES.has(pathname)) {
    return context.next();
  }

  // Unknown route: serve prerendered 404 page content with HTTP 404 status.
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
