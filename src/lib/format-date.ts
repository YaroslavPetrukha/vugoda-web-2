// Deterministic Ukrainian date formatter — HYDRATION-SAFE.
//
// `toLocaleDateString('uk-UA', …)` / Intl is NOT safe in a prerendered app:
// Node's ICU (at build) and the browser's ICU ship different CLDR snapshots, so
// the same call can produce different strings (e.g. Node adds the «р.» year
// suffix → "26 травня 2026 р.", the browser doesn't → "26 травня 2026"). That
// text mismatch triggers React hydration error #418 and a re-render flash.
//
// This formatter touches no Intl/ICU and reads the date in UTC, so it produces
// byte-identical output at build and in the browser regardless of ICU version,
// machine locale, or timezone.

const UK_MONTHS_GENITIVE = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
] as const;

/**
 * Formats a date-only ISO string ('YYYY-MM-DD') as a long Ukrainian date in the
 * genitive case, e.g. '2026-05-26' → '26 травня 2026'.
 *
 * Parses the YYYY-MM-DD prefix directly (no `Date` object), so there is zero
 * ICU and zero timezone surface — the output is identical at build and in the
 * browser by construction, and a stray time component or malformed input cannot
 * cause an off-by-one day or a "NaN" string. Unparseable input returns ''.
 */
export function formatUkDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return '';
  const year = Number(m[1]);
  const month = UK_MONTHS_GENITIVE[Number(m[2]) - 1];
  const day = Number(m[3]);
  if (month === undefined || day < 1 || day > 31) return '';
  return `${day} ${month} ${year}`;
}
