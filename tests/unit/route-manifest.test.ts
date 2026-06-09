// Drift-guard for shared/route-manifest.mjs — the single source of truth for
// site URL structure. These assertions make silent route/slug drift (the cause
// of 3 production 404s: Phase 6, 14, 20) impossible: any mismatch fails CI.

import { readdirSync, existsSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

import {
  STATIC_ROUTES,
  ARTICLE_SLUGS,
  API_ENDPOINTS,
  articleRoutes,
  prerenderRoutes,
  indexableRoutes,
} from '../../shared/route-manifest.mjs';
import { articles } from '../../src/data/articles';

const sorted = (a: string[]) => [...a].sort();

describe('route-manifest drift-guard', () => {
  it('ARTICLE_SLUGS === slugs у src/data/articles.ts (React-registry)', () => {
    expect(sorted(ARTICLE_SLUGS)).toEqual(sorted(articles.map((a) => a.slug)));
  });

  it('ARTICLE_SLUGS === файли src/content/articles/*.tsx на диску', () => {
    const onDisk = readdirSync('src/content/articles')
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => f.replace(/\.tsx$/, ''));
    expect(sorted(ARTICLE_SLUGS)).toEqual(sorted(onDisk));
  });

  it('кожен STATIC_ROUTES.file (де є) існує на диску', () => {
    for (const r of STATIC_ROUTES) {
      if (r.file) expect(existsSync(r.file), `${r.path} → ${r.file}`).toBe(true);
    }
  });

  it('prerenderRoutes = усі static paths + усі article routes, без дублікатів', () => {
    expect(prerenderRoutes).toEqual([
      ...STATIC_ROUTES.map((r) => r.path),
      ...articleRoutes,
    ]);
    expect(new Set(prerenderRoutes).size).toBe(prerenderRoutes.length);
  });

  it('indexableRoutes ⊆ prerenderRoutes', () => {
    const pre = new Set(prerenderRoutes);
    for (const r of indexableRoutes) expect(pre.has(r.path), r.path).toBe(true);
  });

  it('жоден noindex-маршрут (pipeline/diakuyu/404) не в indexableRoutes', () => {
    const idx = new Set(indexableRoutes.map((r) => r.path));
    for (const p of ['/portfolio/etno-dim', '/portfolio/maetok', '/portfolio/nterest', '/portfolio/pipeline-04', '/diakuyu', '/404']) {
      expect(idx.has(p), p).toBe(false);
    }
  });

  it('API_ENDPOINTS відповідають functions/api/*.ts', () => {
    const onDisk = readdirSync('functions/api')
      .filter((f) => f.endsWith('.ts'))
      .map((f) => `/api/${f.replace(/\.ts$/, '')}`);
    expect(sorted(API_ENDPOINTS)).toEqual(sorted(onDisk));
  });
});
