import { describe, it, expect } from 'vitest';
import { normalizePhoneUA } from '../../src/lib/phone-ua';

describe('normalizePhoneUA', () => {
  // Rule 2: full UA number with country code
  it('canonical +380 input returns unchanged canonical', () => {
    const result = normalizePhoneUA('+380671234567');
    expect(result).toEqual({ canonical: '+380671234567', isForeign: false });
  });

  // Rule 2: formatted with spaces/parens/dashes
  it('formatted +380 (67) 123-45-67 normalizes correctly', () => {
    const result = normalizePhoneUA('+380 (67) 123-45-67');
    expect(result).toEqual({ canonical: '+380671234567', isForeign: false });
  });

  // Rule 3: leading-zero local format
  it('0671234567 (10 digits, leading 0) normalizes to +380671234567', () => {
    const result = normalizePhoneUA('0671234567');
    expect(result).toEqual({ canonical: '+380671234567', isForeign: false });
  });

  // Rule 4: 9 digits, no leading zero — user dropped the leading 0
  it('671234567 (9 digits, no leading 0) normalizes to +380671234567', () => {
    const result = normalizePhoneUA('671234567');
    expect(result).toEqual({ canonical: '+380671234567', isForeign: false });
  });

  // Rule 5: foreign number with plus sign
  it('+12025551234 is flagged as foreign', () => {
    const result = normalizePhoneUA('+12025551234');
    expect(result).toEqual({ canonical: '+12025551234', isForeign: true });
  });

  // Rule 5: foreign number without plus sign (≥10 digits, doesn't match UA patterns)
  it('12025551234 (no plus, ≥10 digits, non-UA) is flagged as foreign', () => {
    const result = normalizePhoneUA('12025551234');
    expect(result).toEqual({ canonical: '+12025551234', isForeign: true });
  });

  // Rule 6: too short
  it('123 returns null', () => {
    expect(normalizePhoneUA('123')).toBeNull();
  });

  // Rule 6: empty string
  it('empty string returns null', () => {
    expect(normalizePhoneUA('')).toBeNull();
  });

  // Rule 6: only letters — no digits
  it('abc returns null', () => {
    expect(normalizePhoneUA('abc')).toBeNull();
  });
});
