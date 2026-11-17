#!/usr/bin/env node
// PC-* guard: every module declares which super-admin capabilities it has, proves
// each one in code, and justifies every gap with a dated waiver.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, rel, report, today, walk } from './lib.mjs';

/** Capability → evidence the module source must contain when it claims `true`. */
const REQUIRED = {
  search: [/<SearchInput\b/],
  filters: [/<FilterBar\b/],
  dateRange: [/<DateRangeFilter\b/],
  sort: [/sortKey:/],
  pagination: [/<DataTable\b|<Pagination\b/],
  detail: [/path: '[^']*\/:id'/],
  create: [/path: '[^']*\/new'/],
  edit: [/path: '[^']*\/:id\/edit'/],
  softDelete: [/<ConfirmDialog\b/, /archive|softDelete/i],
  restore: [/restore/i],
  bulkActions: [/<BulkActionBar\b/],
  bulkImport: [/<BulkImportDialog\b/],
  bulkExport: [/<ExportButton\b/],
  auditTrail: [/<AuditTrail\b/],
  asyncSelects: [/<AsyncSelect\b/]
};

/** Hand-rolled versions of shared components, the drift seen in labha-dashboard. */
const BANNED_IN_MODULES = [
  [/<table\b/, 'raw <table>; use <DataTable> (PC-05)'],
  [/<select\b/, 'raw <select>; use <Select> for enums or <AsyncSelect> for entities (PC-05)'],
  [/<h1\b/, 'raw <h1>; use <PageHeader> (PC-05)'],
  [/type="file"/, 'raw file input; use <BulkImportDialog> (PC-05)'],
  [/<dialog\b|role="dialog"/, 'hand-built dialog; use <Dialog>/<ConfirmDialog> (PC-05)']
];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const failures = [];
const modulesDir = join(ROOT, 'src/modules');
const registry = read(join(ROOT, 'src/app/modules.ts'));

for (const mod of readdirSync(modulesDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const dir = join(modulesDir, mod.name);
  const contractPath = join(dir, 'page.contract.json');
  const where = `src/modules/${mod.name}`;

  if (!registry.includes(`@/modules/${mod.name}'`)) {
    failures.push(
      `${where}: not registered in src/app/modules.ts — an unregistered module is dead code (PC-06)`
    );
  }
  if (!existsSync(contractPath)) {
    failures.push(
      `${where}: missing page.contract.json (PC-01). Run the new-page skill or npm run new:module.`
    );
    continue;
  }

  let contract;
  try {
    contract = JSON.parse(read(contractPath));
  } catch (e) {
    failures.push(`${where}/page.contract.json: invalid JSON (${e.message})`);
    continue;
  }

  const files = walk(dir, ['.ts', '.tsx']).filter((f) => !/\.test\.tsx?$/.test(f));
  const source = files.map(read).join('\n');

  for (const field of ['module', 'owner', 'reference', 'roles', 'permissions', 'capabilities']) {
    if (contract[field] === undefined)
      failures.push(`${where}: contract is missing "${field}" (PC-01)`);
  }
  for (const field of ['owner', 'reference']) {
    if (typeof contract[field] === 'string' && contract[field].includes('FILL IN')) {
      failures.push(
        `${where}: "${field}" is still a placeholder; complete the new-page intake (PC-01)`
      );
    }
  }
  if (contract.module !== mod.name)
    failures.push(`${where}: contract.module must be "${mod.name}"`);
  if (typeof contract.owner === 'string' && !contract.owner.startsWith('@')) {
    failures.push(`${where}: owner must be a GitHub handle like @name (PC-01)`);
  }

  for (const perm of Object.values(contract.permissions ?? {})) {
    if (!source.includes(`'${perm}'`))
      failures.push(`${where}: permission "${perm}" is declared but never used (PC-04)`);
  }

  const caps = contract.capabilities ?? {};
  for (const key of Object.keys(REQUIRED)) {
    if (!(key in caps))
      failures.push(
        `${where}: capability "${key}" is not declared; set true or add a waiver (PC-02)`
      );
  }

  for (const [key, value] of Object.entries(caps)) {
    if (value === true) {
      const missing = (REQUIRED[key] ?? []).filter((re) => !re.test(source));
      if (missing.length)
        failures.push(
          `${where}: claims "${key}" but the code does not show it (expected ${missing.join(', ')}) (PC-03)`
        );
      continue;
    }
    if (typeof value !== 'object' || value === null) {
      failures.push(`${where}: "${key}" must be true or a waiver object (PC-02)`);
      continue;
    }
    const { waived, until, ticket } = value;
    if (typeof waived !== 'string' || waived.trim().length < 30) {
      failures.push(
        `${where}: "${key}" waiver needs a reason of at least 30 characters saying why (PC-02)`
      );
    }
    if (until === 'permanent') continue;
    if (typeof until !== 'string' || !DATE.test(until)) {
      failures.push(`${where}: "${key}" waiver needs until: "YYYY-MM-DD" or "permanent" (PC-02)`);
    } else if (until < today()) {
      failures.push(
        `${where}: "${key}" waiver expired on ${until}. Build it or renew with a reason (PC-07)`
      );
    }
    if (typeof ticket !== 'string' || ticket.length < 3) {
      failures.push(`${where}: temporary "${key}" waiver needs a ticket (PC-02)`);
    }
  }

  for (const file of files) {
    read(file)
      .split('\n')
      .forEach((line, i) => {
        if (line.includes('guard-allow:')) return;
        for (const [re, msg] of BANNED_IN_MODULES) {
          if (re.test(line)) failures.push(`${rel(file)}:${i + 1}: ${msg}`);
        }
      });
  }
}

report('page contracts', failures);
