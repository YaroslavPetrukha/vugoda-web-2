/**
 * Post-build cleanup for Cloudflare Pages deployment.
 *
 * React Router v7 (ssr:false + prerender) always emits `__spa-fallback.html`
 * into build/client/. CF Pages serves this file for any path that doesn't
 * match a static asset, BEFORE evaluating _redirects rules. This means
 * unknown routes get a 200 response from __spa-fallback.html instead of the
 * 404 status defined in _redirects (/* /404/index.html 404).
 *
 * Fix: delete __spa-fallback.html after build. CF Pages then falls through to
 * _redirects and correctly serves /404/index.html with HTTP 404 status.
 *
 * All prerendered known routes continue to serve their own index.html files
 * (e.g. /portfolio/lakeview/index.html) — they are matched first as static
 * assets, so removing __spa-fallback.html does not affect them.
 */

import fs from 'node:fs';
import path from 'node:path';

const SPA_FALLBACK = path.join(process.cwd(), 'build', 'client', '__spa-fallback.html');

if (fs.existsSync(SPA_FALLBACK)) {
  fs.rmSync(SPA_FALLBACK);
  console.log('[postbuild-cleanup] Removed __spa-fallback.html — CF Pages will now use _redirects 404 rule.');
} else {
  console.log('[postbuild-cleanup] __spa-fallback.html not found, skipping.');
}
