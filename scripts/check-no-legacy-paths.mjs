// Fails if any source file references the legacy '/vugoda-web-2/' base path.
// Phase 0: documentation only — has explicit `--enforce` flag for Phase 1+ activation.
// Phase 1: enable via prebuild hook in package.json.

import { execSync } from 'node:child_process';

const ENFORCE = process.argv.includes('--enforce');
const PATTERN = '/vugoda-web-2/';
const DIRS = ['src', 'index.html'];

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
  console.error('[check:paths] FAIL: legacy paths must be eliminated in Phase 1');
  process.exit(1);
}

console.log('[check:paths] (non-enforcing mode — Phase 0 expects these to exist)');
process.exit(0);
