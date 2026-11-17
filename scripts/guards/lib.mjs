import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));

export function walk(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

export const rel = (p) => relative(ROOT, p);
export const read = (p) => readFileSync(p, 'utf8');

export function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Prints failures with the rule id and exits non-zero when there are any. */
export function report(name, failures) {
  if (failures.length === 0) {
    console.log(`✓ ${name}`);
    return;
  }
  console.error(`✗ ${name}: ${failures.length} problem(s)\n`);
  failures.forEach((f) => console.error(`  - ${f}`));
  console.error(
    '\nSee .claude/skills/page-contract/SKILL.md and coding-standards/SKILL.md for the rule ids.'
  );
  process.exit(1);
}
