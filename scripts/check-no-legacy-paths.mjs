// Fails if any source file references the legacy '/vugoda-web-2/' base path.
// Phase 1: enforced via prebuild hook in package.json.
// Сканує: src/, app/ (нова директорія з route files)

import { execSync } from 'node:child_process';
import fs from 'node:fs';

const ENFORCE = process.argv.includes('--enforce');
const PATTERN = '/vugoda-web-2/';

// Збираємо директорії для перевірки (тільки ті, що існують)
const CANDIDATES = ['src', 'app'];
const DIRS = CANDIDATES.filter((d) => fs.existsSync(d));

let result;
try {
  result = execSync(`grep -rn "${PATTERN}" ${DIRS.join(' ')} 2>/dev/null || true`, {
    encoding: 'utf8',
  });
} catch (e) {
  result = '';
}

const matches = result.trim().split('\n').filter(Boolean);

if (matches.length === 0) {
  console.log('[check:paths] OK: no legacy paths found');
  process.exit(0);
}

console.log(`[check:paths] Found ${matches.length} legacy path references:`);
matches.slice(0, 20).forEach((line) => console.log(`  ${line}`));
if (matches.length > 20) console.log(`  ...and ${matches.length - 20} more`);

if (ENFORCE) {
  console.error('[check:paths] FAIL: legacy paths must be eliminated before build');
  process.exit(1);
}

console.log('[check:paths] (non-enforcing mode)');
process.exit(0);
