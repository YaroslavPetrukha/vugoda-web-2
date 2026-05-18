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
  ],
  appDirectory: 'app',
} satisfies Config;
