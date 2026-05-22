// Pure phone normalization — no React deps, safe to import on client and server.

export type NormalizedPhone = { canonical: string; isForeign: boolean };

/**
 * Normalize a raw phone string to a canonical international format.
 *
 * Rules (in order):
 *  1. Strip everything except digits and a leading `+` → working digit string `d`
 *  2. `^380[0-9]{9}$`  (12 digits, starts 380)      → `+d`,         isForeign: false
 *  3. `^0[0-9]{9}$`    (10 digits, starts with 0)   → `+38d`,       isForeign: false
 *  4. `^[3-9][0-9]{8}$` (9 digits, no leading 0)    → `+380d`,      isForeign: false
 *  5. length ≥ 10 (anything else long enough)        → `+d`,         isForeign: true
 *  6. Otherwise → null
 */
export function normalizePhoneUA(input: string): NormalizedPhone | null {
  if (!input) return null;

  // Strip everything except digits, preserving a leading + for step-5 check.
  // We compute `d` as pure digits (no plus).
  const stripped = input.replace(/[^\d+]/g, '');
  // Remove leading `+` to get a pure digit string
  const d = stripped.replace(/^\+/, '');

  if (!d) return null;

  // Rule 2: already full UA number with country code
  if (/^380[0-9]{9}$/.test(d)) {
    return { canonical: '+' + d, isForeign: false };
  }

  // Rule 3: leading zero — local UA format
  if (/^0[0-9]{9}$/.test(d)) {
    return { canonical: '+38' + d, isForeign: false };
  }

  // Rule 4: 9 digits, no leading zero — user dropped the leading 0
  if (/^[3-9][0-9]{8}$/.test(d)) {
    return { canonical: '+380' + d, isForeign: false };
  }

  // Rule 5: ≥ 10 digits that didn't match UA patterns → foreign
  if (d.length >= 10) {
    return { canonical: '+' + d, isForeign: true };
  }

  // Rule 6: too short to be a valid phone
  return null;
}
