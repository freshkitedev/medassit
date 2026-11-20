// Plain JavaScript needs no compilation. "Build" = syntax-check every source file
// so deployment pipelines fail fast on errors.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js')) files.push(p);
  }
};
walk('src');

let failed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) {
    failed++;
    console.error(`✗ ${f}\n${r.stderr}`);
  }
}
if (failed) process.exit(1);
console.log(`Build OK: ${files.length} files checked.`);
