#!/usr/bin/env node
// CS-10 / CS-11 guard: no commented-out code, no anonymous or expired TODOs,
// no focused tests or debugger statements left behind.
import { join } from 'node:path';
import { ROOT, read, rel, report, today, walk } from './lib.mjs';

const MARKER = /\b(TODO|FIXME|HACK|XXX)\b/;
// Accepted form: <marker>(<ticket>, <YYYY-MM-DD>): <reason>
const MARKER_OK = /\b(TODO|FIXME|HACK|XXX)\(([A-Z]+-[A-Z0-9]+), (\d{4}-\d{2}-\d{2})\): \S/;
const COMMENTED_CODE =
  /^\s*\/\/\s*(import |export |const |let |var |return\b|await |if \(|for \(|function |<[A-Z][A-Za-z]*[\s/>]|[a-zA-Z_.]+\([^)]*\);\s*$)/;
const FOCUSED = /\b(it|test|describe)\.only\(/;
const DEBUGGER = /^\s*debugger;?\s*$/;

const failures = [];
// This file names the markers it looks for, so it skips itself.
const files = [
  ...walk(join(ROOT, 'src'), ['.ts', '.tsx']),
  ...walk(join(ROOT, 'scripts'), ['.mjs'])
].filter((f) => !f.endsWith('check-stale-markers.mjs'));
const now = today();

for (const file of files) {
  read(file)
    .split('\n')
    .forEach((line, i) => {
      const at = `${rel(file)}:${i + 1}`;
      if (MARKER.test(line)) {
        const m = line.match(MARKER_OK);
        if (!m) failures.push(`${at}: TODO needs "TODO(KX-123, YYYY-MM-DD): reason" (CS-11)`);
        else if (m[3] < now)
          failures.push(
            `${at}: ${m[1]} for ${m[2]} expired on ${m[3]}; do it or delete it (CS-11)`
          );
      }
      if (COMMENTED_CODE.test(line))
        failures.push(`${at}: commented-out code; delete it, git keeps history (CS-10)`);
      if (FOCUSED.test(line))
        failures.push(`${at}: focused test (.only) skips the rest of the suite`);
      if (DEBUGGER.test(line)) failures.push(`${at}: debugger statement`);
    });
}

report('stale markers', failures);
