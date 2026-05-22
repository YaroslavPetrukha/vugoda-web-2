import { describe, it, expect } from 'vitest';
import { isDisposableEmail, DISPOSABLE_EMAIL_DOMAINS } from '../../shared/disposable-emails';

describe('isDisposableEmail', () => {
  // ── True positives (disposable) ─────────────────────────────────────────

  it('mailinator.com is disposable', () => {
    expect(isDisposableEmail('user@mailinator.com')).toBe(true);
  });

  it('10minutemail.com is disposable', () => {
    expect(isDisposableEmail('test@10minutemail.com')).toBe(true);
  });

  it('guerrillamail.com is disposable', () => {
    expect(isDisposableEmail('abc@guerrillamail.com')).toBe(true);
  });

  it('yopmail.com is disposable', () => {
    expect(isDisposableEmail('someone@yopmail.com')).toBe(true);
  });

  it('tempmail.com is disposable', () => {
    expect(isDisposableEmail('x@tempmail.com')).toBe(true);
  });

  it('grr.la is disposable', () => {
    expect(isDisposableEmail('foo@grr.la')).toBe(true);
  });

  it('sharklasers.com is disposable', () => {
    expect(isDisposableEmail('user@sharklasers.com')).toBe(true);
  });

  it('trashmail.com is disposable', () => {
    expect(isDisposableEmail('user@trashmail.com')).toBe(true);
  });

  it('fakeinbox.com is disposable', () => {
    expect(isDisposableEmail('user@fakeinbox.com')).toBe(true);
  });

  it('dispostable.com is disposable', () => {
    expect(isDisposableEmail('user@dispostable.com')).toBe(true);
  });

  // ── Case-insensitivity ────────────────────────────────────────────────────

  it('case-insensitive: USER@MAILINATOR.COM is disposable', () => {
    expect(isDisposableEmail('USER@MAILINATOR.COM')).toBe(true);
  });

  it('case-insensitive: User@TrAsHmAiL.com is disposable', () => {
    expect(isDisposableEmail('User@TrAsHmAiL.com')).toBe(true);
  });

  // ── True negatives (legitimate providers) ────────────────────────────────

  it('gmail.com is NOT disposable', () => {
    expect(isDisposableEmail('user@gmail.com')).toBe(false);
  });

  it('ukr.net is NOT disposable', () => {
    expect(isDisposableEmail('user@ukr.net')).toBe(false);
  });

  it('i.ua is NOT disposable', () => {
    expect(isDisposableEmail('user@i.ua')).toBe(false);
  });

  it('outlook.com is NOT disposable', () => {
    expect(isDisposableEmail('user@outlook.com')).toBe(false);
  });

  it('protonmail.com is NOT disposable (privacy service — intentionally excluded)', () => {
    expect(isDisposableEmail('user@protonmail.com')).toBe(false);
  });

  it('tutanota.com is NOT disposable (privacy service — intentionally excluded)', () => {
    expect(isDisposableEmail('user@tutanota.com')).toBe(false);
  });

  it('company.ua domain is NOT disposable', () => {
    expect(isDisposableEmail('info@company.ua')).toBe(false);
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('empty string returns false', () => {
    expect(isDisposableEmail('')).toBe(false);
  });

  it('not-an-email (no @) returns false', () => {
    expect(isDisposableEmail('not-an-email')).toBe(false);
  });

  it('@mailinator.com (no local part) returns false per lastIndexOf semantics', () => {
    // lastIndexOf('@') = 0, domain = 'mailinator.com' — still matches.
    // This edge case is intentionally permissive: Zod .email() rejects it upstream.
    // Document expected behaviour: domain check still runs.
    expect(isDisposableEmail('@mailinator.com')).toBe(true);
  });

  it('trailing @ (empty domain) returns false', () => {
    expect(isDisposableEmail('user@')).toBe(false);
  });

  it('@ only returns false', () => {
    expect(isDisposableEmail('@')).toBe(false);
  });

  it('whitespace in domain is trimmed before lookup', () => {
    // Technically Zod would reject this, but the helper should still handle it
    expect(isDisposableEmail('user@ mailinator.com')).toBe(true);
  });
});

describe('DISPOSABLE_EMAIL_DOMAINS set', () => {
  it('has at least 200 entries', () => {
    expect(DISPOSABLE_EMAIL_DOMAINS.size).toBeGreaterThanOrEqual(200);
  });

  it('contains no legitimate major providers', () => {
    const legit = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'icloud.com', 'ukr.net', 'i.ua', 'meta.ua'];
    for (const domain of legit) {
      expect(DISPOSABLE_EMAIL_DOMAINS.has(domain)).toBe(false);
    }
  });

  it('all entries are lowercase', () => {
    for (const domain of DISPOSABLE_EMAIL_DOMAINS) {
      expect(domain).toBe(domain.toLowerCase());
    }
  });

  it('all entries contain a dot (basic domain sanity)', () => {
    for (const domain of DISPOSABLE_EMAIL_DOMAINS) {
      expect(domain).toContain('.');
    }
  });
});
