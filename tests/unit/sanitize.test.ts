import { describe, it, expect } from 'vitest';
import {
  sanitizeUnicode,
  collapseWhitespace,
  containsUrl,
  isMixedScript,
  hasRepetition,
  isAllCaps,
  emojiCount,
} from '../../src/lib/sanitize';

describe('sanitizeUnicode', () => {
  it('strips zero-width space (U+200B) from string', () => {
    // ​ is zero-width space
    const input = 'Привіт​тобі';
    const result = sanitizeUnicode(input);
    expect(result).toBe('Привіттобі');
    expect(result).not.toContain('​');
  });

  it('strips zero-width non-joiner (U+200C)', () => {
    const input = 'Тест‌текст';
    const result = sanitizeUnicode(input);
    expect(result).not.toContain('‌');
  });

  it('strips BOM/ZWNBSP (U+FEFF)', () => {
    const input = '﻿Привіт';
    const result = sanitizeUnicode(input);
    expect(result).not.toContain('﻿');
  });

  it('preserves normal text unchanged', () => {
    expect(sanitizeUnicode('Іван Петренко')).toBe('Іван Петренко');
  });
});

describe('collapseWhitespace', () => {
  it('collapses multiple spaces and trims', () => {
    expect(collapseWhitespace('  Іван   Петренко  ')).toBe('Іван Петренко');
  });

  it('collapses tab and newline', () => {
    expect(collapseWhitespace('Іван\t\nПетренко')).toBe('Іван Петренко');
  });

  it('single word stays unchanged after trim', () => {
    expect(collapseWhitespace('  слово  ')).toBe('слово');
  });
});

describe('containsUrl', () => {
  it('detects https:// URL', () => {
    expect(containsUrl('Привіт https://spam.com купи тут')).toBe(true);
  });

  it('detects www. prefix', () => {
    expect(containsUrl('звичайний текст www.foo.com')).toBe(true);
  });

  it('detects http:// URL', () => {
    expect(containsUrl('перейди http://site.ua/page')).toBe(true);
  });

  it('detects ftp:// URL', () => {
    expect(containsUrl('ftp://files.example.com')).toBe(true);
  });

  it('returns false for plain name with no URL', () => {
    expect(containsUrl("звичайне ім'я")).toBe(false);
  });

  it('returns false for email address', () => {
    expect(containsUrl('user@example.com')).toBe(false);
  });
});

describe('isMixedScript', () => {
  it('detects Cyrillic + Latin mix in long-enough string', () => {
    // "Иvan Петров" has Cyrillic И, П, е, т, р, о, в and Latin v, a, n
    expect(isMixedScript('Иvan Петров щось')).toBe(true);
  });

  it('returns false for pure Latin short string', () => {
    expect(isMixedScript('Ivan')).toBe(false);
  });

  it('returns false for string exactly at length boundary (≤10)', () => {
    // 10 chars, mixed — boundary condition
    expect(isMixedScript('Иvanтекст!')).toBe(false);
  });

  it('returns false for pure Cyrillic', () => {
    expect(isMixedScript('Іван Петренко Василь')).toBe(false);
  });
});

describe('hasRepetition', () => {
  it('detects 6+ consecutive identical characters', () => {
    expect(hasRepetition('aaaaaa')).toBe(true);
  });

  it('detects exactly minRun repetitions', () => {
    expect(hasRepetition('aaaaaa', 6)).toBe(true);
  });

  it('returns false for run of 5 (below default 6)', () => {
    expect(hasRepetition('aaaaa')).toBe(false);
  });

  it('returns false for normal text', () => {
    expect(hasRepetition('normal text here')).toBe(false);
  });

  it('respects custom minRun parameter', () => {
    expect(hasRepetition('aaa', 3)).toBe(true);
    expect(hasRepetition('aaa', 4)).toBe(false);
  });
});

describe('isAllCaps', () => {
  it('detects all-caps string over minLen', () => {
    expect(isAllCaps('SCREAMING IN CYRILLIC HERE')).toBe(true);
  });

  it('returns false for mixed-case text', () => {
    expect(isAllCaps('Mixed Case Text Normal')).toBe(false);
  });

  it('returns false for string shorter than minLen', () => {
    expect(isAllCaps('SHORT')).toBe(false);
  });

  it('detects all-caps Cyrillic', () => {
    expect(isAllCaps('КУПІТЬ ЗАРАЗ АКЦІЯ ТЕРМІНОВО ТІЛЬКИ СЬОГОДНІ')).toBe(true);
  });
});

describe('emojiCount', () => {
  it('counts 4 fire emojis', () => {
    expect(emojiCount('🔥🔥🔥 деталі 🔥')).toBe(4);
  });

  it('returns 0 for string with no emojis', () => {
    expect(emojiCount('звичайний текст без емодзі')).toBe(0);
  });

  it('counts mixed emojis correctly', () => {
    expect(emojiCount('🎉 привіт 😊 як справи 🤝')).toBe(3);
  });

  it('returns 0 for empty string', () => {
    expect(emojiCount('')).toBe(0);
  });
});
