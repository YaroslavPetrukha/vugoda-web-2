// Pure sanitization utilities — no React deps, safe to import on client and server.

/**
 * Normalize Unicode to NFKC and strip zero-width and bidirectional override
 * characters that are commonly used in obfuscation attacks.
 *
 * Removed character ranges:
 *  - Zero-width: U+200B (​), U+200C (‌), U+200D (‍), U+FEFF (﻿ BOM/ZWNBSP)
 *  - Bidirectional overrides: U+202A–U+202E, U+2066–U+2069
 */
export function sanitizeUnicode(s: string): string {
  // NFKC: normalize compatibility equivalents + canonical composition
  const normalized = s.normalize('NFKC');
  // Strip zero-width chars and bidi overrides
  // eslint-disable-next-line no-control-regex
  return normalized.replace(/[​‌‍﻿‪-‮⁦-⁩]/g, '');
}

/**
 * Collapse consecutive whitespace to a single space and trim.
 */
export function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Matches http(s)://, www.<char>, or ftp:// — used for URL spam detection.
 * The `www.` branch requires a word boundary before and at least one word
 * char after to avoid false-positives on stray "www." typos or things like
 * "John www. Petrenko". Catches real URLs like "www.example.com".
 */
export const URL_REGEX: RegExp = /(https?:\/\/|\bwww\.\w|ftp:\/\/)/i;

/**
 * Returns true if the string appears to contain a URL.
 */
export function containsUrl(s: string): boolean {
  return URL_REGEX.test(s);
}

/**
 * Returns true if the string contains BOTH Cyrillic and Latin characters
 * and is longer than 10 characters — a heuristic for mixed-script obfuscation.
 */
export function isMixedScript(s: string): boolean {
  if (s.length <= 10) return false;
  const hasCyrillic = /[Ѐ-ӿ]/u.test(s);
  const hasLatin = /[a-zA-Z]/.test(s);
  return hasCyrillic && hasLatin;
}

/**
 * Returns true if the string contains a run of the same character
 * repeated `minRun` or more times consecutively.
 * Default minRun = 6.
 */
export function hasRepetition(s: string, minRun = 6): boolean {
  // Build regex dynamically: (.)\1{minRun-1,}
  const regex = new RegExp(`(.)\\1{${minRun - 1},}`);
  return regex.test(s);
}

/**
 * Returns true if the string is predominantly uppercase letters
 * (threshold fraction of letter characters) and meets a minimum length.
 * Default: minLen = 20, threshold = 0.8.
 */
export function isAllCaps(s: string, minLen = 20, threshold = 0.8): boolean {
  if (s.length < minLen) return false;
  const letters = s.match(/\p{L}/gu);
  if (!letters || letters.length === 0) return false;
  const upperCount = letters.filter((c) => c === c.toUpperCase() && c !== c.toLowerCase()).length;
  return upperCount / letters.length >= threshold;
}

/**
 * Count the number of extended pictographic emoji in the string.
 */
export function emojiCount(s: string): number {
  const matches = s.match(/\p{Extended_Pictographic}/gu);
  return matches ? matches.length : 0;
}
