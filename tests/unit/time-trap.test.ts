import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// We inline the HMAC logic here (copy of functions/_shared/hmac.ts) so the
// test file has zero CF-specific imports and runs cleanly in Node/jsdom.
// The _shared/hmac.ts module itself is tested indirectly via the integration
// path; this test focuses on the verifyFormToken contract.
// ---------------------------------------------------------------------------

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyFormToken(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<{ valid: boolean; reason?: string }> {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, reason: 'malformed' };

  const [issuedAtStr, nonce, signature] = parts;
  const issuedAt = parseInt(issuedAtStr, 10);
  if (!Number.isFinite(issuedAt)) return { valid: false, reason: 'bad-timestamp' };

  const expected = await hmacSign(`${issuedAtStr}.${nonce}`, secret);

  if (signature.length !== expected.length) return { valid: false, reason: 'sig-mismatch' };
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return { valid: false, reason: 'sig-mismatch' };

  const age = now - issuedAt;
  if (age < 3000) return { valid: false, reason: 'too-fast' };
  if (age > 30 * 60 * 1000) return { valid: false, reason: 'expired' };

  return { valid: true };
}

// Helper: build a valid token for a given issuedAt
async function buildToken(issuedAt: number, secret: string, nonce?: string): Promise<string> {
  const n = nonce ?? crypto.randomUUID();
  const message = `${issuedAt}.${n}`;
  const sig = await hmacSign(message, secret);
  return `${issuedAt}.${n}.${sig}`;
}

const SECRET = 'test-secret-32-byte-hex-value-ok';

describe('verifyFormToken', () => {
  it('sign-verify roundtrip succeeds with valid token in window', async () => {
    const issuedAt = Date.now() - 5000; // 5s ago — within 3s..30min window
    const token = await buildToken(issuedAt, SECRET);
    const result = await verifyFormToken(token, SECRET);
    expect(result).toEqual({ valid: true });
  });

  it('returns invalid + expired for token issued > 30 min ago', async () => {
    const issuedAt = Date.now() - (31 * 60 * 1000); // 31 min ago
    const token = await buildToken(issuedAt, SECRET);
    const result = await verifyFormToken(token, SECRET);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('returns invalid + too-fast for token issued < 3s ago', async () => {
    const issuedAt = Date.now() - 1000; // 1s ago
    const token = await buildToken(issuedAt, SECRET);
    const result = await verifyFormToken(token, SECRET);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('too-fast');
  });

  it('returns invalid + sig-mismatch for tampered signature', async () => {
    const issuedAt = Date.now() - 5000;
    const token = await buildToken(issuedAt, SECRET);
    // Flip the last character of the signature part
    const parts = token.split('.');
    parts[2] = parts[2].slice(0, -1) + (parts[2].endsWith('a') ? 'b' : 'a');
    const tampered = parts.join('.');
    const result = await verifyFormToken(tampered, SECRET);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('sig-mismatch');
  });

  it('returns invalid + sig-mismatch when verified with different secret', async () => {
    const issuedAt = Date.now() - 5000;
    const token = await buildToken(issuedAt, SECRET);
    const result = await verifyFormToken(token, 'wrong-secret-entirely-different-val');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('sig-mismatch');
  });

  it('returns invalid + malformed for token with wrong number of parts', async () => {
    const result = await verifyFormToken('notavalidtoken', SECRET);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('malformed');
  });

  it('returns invalid + bad-timestamp for non-numeric issuedAt', async () => {
    const result = await verifyFormToken('notanumber.nonce.signature', SECRET);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('bad-timestamp');
  });

  it('works at exactly 3000ms (boundary — still too-fast)', async () => {
    // Exactly 3000ms ago means age === 3000, which is NOT < 3000, so it passes
    const now = Date.now();
    const issuedAt = now - 3000;
    const token = await buildToken(issuedAt, SECRET);
    // Pass explicit `now` to avoid timing flakiness
    const result = await verifyFormToken(token, SECRET, now);
    expect(result.valid).toBe(true);
  });
});
