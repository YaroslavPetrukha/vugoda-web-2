// Cloudflare Pages Function: catch-all для unknown routes.
// Returns HTTP 404 with prerendered 404 page content.
//
// CF Pages routing order:
//   1. Static files (prerendered HTML, assets) — served directly, never reach here
//   2. Functions in functions/                  — THIS file
//   3. _redirects rules
//
// Only truly unknown paths reach this function → we return HTTP 404.
//
// Minimal inline types — avoids requiring @cloudflare/workers-types dev dep.

interface EventContext<E = Record<string, unknown>> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
}

type PagesFunction = (context: EventContext) => Response | Promise<Response>;

// Extensions that CF Pages serves as static assets automatically.
// We pass these through in case the static file doesn't exist yet on cold deploy.
const STATIC_EXT =
  /\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|css|js|mjs|json|xml|txt|map|pdf|mp4|mp3|webm)$/i;

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const { pathname } = url;

  // Pass through API routes — they have dedicated function handlers.
  if (pathname.startsWith('/api/')) {
    return context.next();
  }

  // Pass through static asset requests — CF Pages handles them before this function,
  // but if a request somehow leaks through (cold start edge case), let it propagate.
  if (STATIC_EXT.test(pathname)) {
    return context.next();
  }

  // Fetch the prerendered 404 page content from the same origin.
  const fourOhFourUrl = new URL('/404/index.html', url.origin);

  let html: string;
  try {
    const res = await fetch(fourOhFourUrl.toString());
    if (!res.ok) throw new Error(`/404/index.html returned ${res.status}`);
    html = await res.text();
  } catch {
    // Minimal inline fallback if the prerendered 404 page is unavailable.
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
