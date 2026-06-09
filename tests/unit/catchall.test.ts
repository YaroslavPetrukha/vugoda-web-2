// Regress-тест для functions/[[catchall]].ts.
// Баг (2026-06-09): RR v7 single-fetch запитує `/novyny/<slug>.data` при
// client-side навігації на статтю (єдині routes з loader). Catchall не
// пропускав `.data` → 404 → усі посилання на статті ламались при кліку.
// Це третій production-404 від whitelist-drift у catchall (Phase 6, 14, тепер).

import { describe, it, expect, vi } from 'vitest';

// Динамічний import — у назві файлу спецсимволи [[ ]].
const mod = await import('../../functions/[[catchall]].ts');
const onRequest = mod.onRequest as (ctx: unknown) => Promise<Response>;

function ctx(path: string) {
  const next = vi.fn(async () => new Response('ASSET', { status: 200 }));
  return {
    c: { request: new Request(`https://vyhoda.lviv.ua${path}`), env: {}, next },
    next,
  };
}

describe('catchall function', () => {
  it('пропускає RR single-fetch .data (regression: article links 404)', async () => {
    const { c, next } = ctx('/novyny/frankivskyi-raion-lokatsiia-lviv.data');
    const res = await onRequest(c);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
  });

  it('пропускає .data навіть з query (?_routes=...)', async () => {
    const { c, next } = ctx('/novyny/chek-list-pereveryty-zabudovnyka.data?_routes=root');
    await onRequest(c);
    expect(next).toHaveBeenCalledOnce();
  });

  it('404-ить .data для НЕВІДОМОГО route (no 200 SPA-fallback leak)', async () => {
    const { c, next } = ctx('/novyny/does-not-exist.data');
    const res = await onRequest(c);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(404);
  });

  it('404-ить bogus top-level .data', async () => {
    const { c, next } = ctx('/totally-bogus.data');
    const res = await onRequest(c);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(404);
  });

  it('пропускає відому prerendered-сторінку', async () => {
    const { c, next } = ctx('/novyny/frankivskyi-raion-lokatsiia-lviv');
    await onRequest(c);
    expect(next).toHaveBeenCalledOnce();
  });

  it('пропускає статичні асети (.css/.js/.svg)', async () => {
    for (const p of ['/assets/app.css', '/assets/app.js', '/mark.svg']) {
      const { c, next } = ctx(p);
      await onRequest(c);
      expect(next, p).toHaveBeenCalledOnce();
    }
  });

  it('віддає JSON 404 для невідомого /api/*', async () => {
    const { c, next } = ctx('/api/does-not-exist');
    const res = await onRequest(c);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('application/json');
  });
});
