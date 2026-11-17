#!/usr/bin/env node
// G-12 guard: Claude and Cursor get the same rules. A skill edited in one tool
// and not the other is how agent guidance drifts.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, read, report, walk } from './lib.mjs';

const failures = [];
const claude = join(ROOT, '.claude/skills');
const cursor = join(ROOT, '.cursor/skills');

function digestTree(dir) {
  const map = new Map();
  for (const f of walk(dir, ['.md']))
    map.set(relative(dir, f), createHash('sha256').update(read(f)).digest('hex'));
  return map;
}

const a = digestTree(claude);
const b = digestTree(cursor);
for (const [file, hash] of a) {
  if (!b.has(file)) failures.push(`.cursor/skills/${file} is missing (copy from .claude/skills)`);
  else if (b.get(file) !== hash)
    failures.push(`.claude/skills/${file} and .cursor/skills/${file} differ`);
}
for (const file of b.keys())
  if (!a.has(file)) failures.push(`.claude/skills/${file} is missing (copy from .cursor/skills)`);

const agents = read(join(ROOT, 'AGENTS.md'));
for (const file of a.keys()) {
  const skill = file.split(/[\\/]/)[0];
  if (file.endsWith('SKILL.md') && !agents.includes(`skills/${skill}/SKILL.md`)) {
    failures.push(`AGENTS.md does not reference skills/${skill}/SKILL.md`);
  }
}
for (const rule of ['kitchenxhire.mdc']) {
  if (!existsSync(join(ROOT, '.cursor/rules', rule)))
    failures.push(`.cursor/rules/${rule} is missing`);
}

report('agent skills in sync', failures);
