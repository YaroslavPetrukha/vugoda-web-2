// Regression guard for the hydration-safe Ukrainian date formatter.
// Locale/timezone/ICU-independent by construction (no Intl) — so this test is
// itself deterministic and proves the output can't drift between Node-at-build
// and the browser (the cause of React #418 — TD-Phase-26-1).
//
// Determinism note: run `TZ=America/Los_Angeles npx vitest run format-date`
// (UTC-8) and every assertion still passes — UTC getters prevent off-by-one.

import { describe, it, expect } from 'vitest';

import { formatUkDate } from './format-date';

describe('formatUkDate', () => {
  it('formats a date-only ISO string in Ukrainian genitive (no «р.» suffix)', () => {
    expect(formatUkDate('2026-05-26')).toBe('26 травня 2026');
    expect(formatUkDate('2026-05-20')).toBe('20 травня 2026');
    expect(formatUkDate('2026-05-13')).toBe('13 травня 2026');
  });

  it('handles month boundaries in UTC (no local-TZ off-by-one)', () => {
    expect(formatUkDate('2026-01-01')).toBe('1 січня 2026');
    expect(formatUkDate('2026-12-31')).toBe('31 грудня 2026');
  });

  it('ignores a stray time component (uses the date part, TZ-proof)', () => {
    expect(formatUkDate('2026-05-26T23:30:00')).toBe('26 травня 2026');
    expect(formatUkDate('2026-05-26T00:00:00Z')).toBe('26 травня 2026');
  });

  it('returns "" for malformed / out-of-range input (no "NaN" string)', () => {
    expect(formatUkDate('')).toBe('');
    expect(formatUkDate('not-a-date')).toBe('');
    expect(formatUkDate('2026-13-01')).toBe(''); // month out of range
    expect(formatUkDate('2026-00-10')).toBe(''); // month 0 → undefined
  });

  it('covers every month in genitive case', () => {
    const expected = [
      '15 січня 2026', '15 лютого 2026', '15 березня 2026', '15 квітня 2026',
      '15 травня 2026', '15 червня 2026', '15 липня 2026', '15 серпня 2026',
      '15 вересня 2026', '15 жовтня 2026', '15 листопада 2026', '15 грудня 2026',
    ];
    for (let m = 0; m < 12; m++) {
      const iso = `2026-${String(m + 1).padStart(2, '0')}-15`;
      expect(formatUkDate(iso)).toBe(expected[m]);
    }
  });
});
