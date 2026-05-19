import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  prerender: [
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
    // Catch-all 404 — prerendered so CF Pages can serve it with 404 status
    // via _redirects rule: /* /404/index.html 404
    '/404',
  ],
  appDirectory: 'app',
} satisfies Config;
