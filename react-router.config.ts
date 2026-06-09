import type { Config } from '@react-router/dev/config';
// Single source of truth for all route paths — see shared/route-manifest.mjs.
import { prerenderRoutes } from './shared/route-manifest.mjs';

export default {
  ssr: false,
  prerender: prerenderRoutes,
  appDirectory: 'app',
} satisfies Config;
