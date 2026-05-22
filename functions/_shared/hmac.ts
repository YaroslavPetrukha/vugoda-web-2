// Shared HMAC-SHA-256 utility for Cloudflare Pages Functions.
// Used by both functions/api/form-token.ts and functions/api/contact.ts.

/**
 * Sign a message with HMAC-SHA-256 using the Web Crypto API.
 * Returns the hex-encoded signature string.
 */
export async function hmacSign(message: string, secret: string): Promise<string> {
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
