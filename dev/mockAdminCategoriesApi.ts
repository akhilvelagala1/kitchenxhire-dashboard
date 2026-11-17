import type { IncomingMessage, ServerResponse } from 'node:http';
import { recordCategoriesRolesAudit, type AuditChange } from './categoriesAudit.ts';
import { categoriesRolesSummary, listCategories } from './categoriesAnalytics.ts';
import {
  CATEGORY_BUSINESS_TYPES,
  CATEGORY_ICONS,
  CATEGORY_STATUSES,
  CATEGORY_STATUS_LABELS,
  categoryWithCode,
  createCategory,
  findCategory,
  getCategoriesStore,
  updateCategory,
  type CategoryInput,
  type CategoryStatus,
  type HireAdminCategory
} from './categoriesMockData.ts';
import { conflict, invalid, listParams, notFound, ok, readJson } from './categoriesHttp.ts';
import { handleAdminRolesMock } from './mockAdminRolesApi.ts';

const BASE = '/hire/admin/categories';
const CODE = /^[A-Z][A-Z0-9_]{1,39}$/;
const STATUS_HINT = `Status must be ${CATEGORY_STATUSES.map((s) => CATEGORY_STATUS_LABELS[s]).join(', ')}.`;

const isStatus = (value: unknown): value is CategoryStatus =>
  (CATEGORY_STATUSES as readonly unknown[]).includes(value);

const INPUT_KEYS = [
  'name',
  'code',
  'business_type',
  'icon',
  'description'
] as const satisfies readonly (keyof CategoryInput)[];

const FIELD_LABELS: Record<(typeof INPUT_KEYS)[number], string> = {
  name: 'Name',
  code: 'Code',
  business_type: 'Type',
  icon: 'Icon',
  description: 'Description'
};

/** Error text for one field, or undefined when the value is fine. */
function fieldError(key: keyof CategoryInput, value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (key === 'name') {
    return text.length >= 2 && text.length <= 40 ? undefined : 'Name must be 2 to 40 characters.';
  }
  if (key === 'code') {
    return CODE.test(text)
      ? undefined
      : 'Code must be 2 to 40 capital letters, digits or underscores, starting with a letter.';
  }
  if (key === 'business_type') {
    return (CATEGORY_BUSINESS_TYPES as readonly unknown[]).includes(value)
      ? undefined
      : `Business type must be one of: ${CATEGORY_BUSINESS_TYPES.join(', ')}.`;
  }
  if (key === 'icon') {
    return (CATEGORY_ICONS as readonly unknown[]).includes(value)
      ? undefined
      : `Icon must be one of: ${CATEGORY_ICONS.join(', ')}.`;
  }
  return value === undefined || typeof value === 'string'
    ? text.length <= 200
      ? undefined
      : 'Description must be 200 characters or fewer.'
    : 'Description must be text.';
}

/**
 * Reads the input fields of a create (every field but the description must be there) or a patch (only
 * the fields sent are checked). Strings are trimmed; fields the body does not name are left out.
 */
function readInput(body: Record<string, unknown>, creating: boolean) {
  const input: Partial<CategoryInput> = {};
  const fields: Record<string, string> = {};
  for (const key of INPUT_KEYS) {
    const value = body[key];
    if (value === undefined && (!creating || key === 'description')) {
      if (creating) input.description = '';
      continue;
    }
    const error = fieldError(key, value);
    if (error) fields[key] = error;
    else Object.assign(input, { [key]: typeof value === 'string' ? value.trim() : value });
  }
  return { input, fields };
}

/** Records the edit and the status change of one category as two events, for what actually changed. */
function recordChanges(before: HireAdminCategory, after: HireAdminCategory) {
  const changes: AuditChange[] = INPUT_KEYS.filter((k) => before[k] !== after[k]).map((k) => ({
    field: FIELD_LABELS[k],
    from: before[k] || null,
    to: after[k] || null
  }));
  const id = after.category_id;
  if (changes.length > 0)
    recordCategoriesRolesAudit('hire_category', id, after.name, 'UPDATED', changes);
  if (before.status !== after.status) {
    const change = {
      field: 'Status',
      from: CATEGORY_STATUS_LABELS[before.status],
      to: CATEGORY_STATUS_LABELS[after.status]
    };
    recordCategoriesRolesAudit('hire_category', id, after.name, 'STATUS_UPDATED', [change]);
  }
}

const duplicateCode = (res: ServerResponse) =>
  conflict(res, 'A category with this code already exists.', {
    code: 'This code is already used.'
  });

/**
 * Everything under /hire/admin/categories, /hire/admin/categories-roles/summary and /hire/admin/roles
 * except /exports and /export-result/*, which the caller serves with categoriesCsv. Returns false for
 * a route it does not know.
 */
export async function handleAdminCategoriesMock(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  method: string,
  url: URL
): Promise<boolean> {
  if (path === '/hire/admin/categories-roles/summary' && method === 'GET') {
    ok(res, categoriesRolesSummary());
    return true;
  }
  if (path === '/hire/admin/roles' || path.startsWith('/hire/admin/roles/')) {
    return handleAdminRolesMock(req, res, path, method, url);
  }
  if (path !== BASE && !path.startsWith(`${BASE}/`)) return false;
  const rest = path.slice(BASE.length);
  if (rest === '/exports' || rest.startsWith('/export-result/')) return false;

  if (rest === '' && method === 'GET') {
    const { items, meta } = listCategories(getCategoriesStore(), listParams(url, 5));
    ok(res, items, meta);
    return true;
  }

  if (rest === '' && method === 'POST') {
    const { input, fields } = readInput(await readJson(req), true);
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
    } else if (categoryWithCode(input.code!)) {
      duplicateCode(res);
    } else {
      const row = createCategory(input as CategoryInput);
      recordCategoriesRolesAudit('hire_category', row.category_id, row.name, 'CREATED');
      ok(res, row);
    }
    return true;
  }

  if (rest === '/bulk' && method === 'POST') {
    const body = await readJson(req);
    const status = body.status;
    if (body.action !== 'set_status' || !isStatus(status)) {
      invalid(res, 'Choose an action and a valid status.', { status: STATUS_HINT });
      return true;
    }
    const ids = Array.isArray(body.category_ids) ? body.category_ids.map(String) : [];
    const found = [...new Set(ids)].flatMap((id) => findCategory(id) ?? []);
    for (const before of found) {
      const after = updateCategory(before.category_id, { status });
      if (after) recordChanges(before, after);
    }
    ok(res, { affected: found.length });
    return true;
  }

  const byId = rest.match(/^\/([^/]+)$/);
  if (byId && method === 'GET') {
    const row = findCategory(byId[1]!);
    if (row) ok(res, row);
    else notFound(res, 'Category');
    return true;
  }

  if (byId && method === 'PATCH') {
    const before = findCategory(byId[1]!);
    if (!before) return (notFound(res, 'Category'), true);
    const body = await readJson(req);
    const { input, fields } = readInput(body, false);
    if (body.status !== undefined && !isStatus(body.status)) fields.status = STATUS_HINT;
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
    } else if (Object.keys(input).length === 0 && body.status === undefined) {
      invalid(res, 'Send at least one field to change.', { status: STATUS_HINT });
    } else if (input.code && categoryWithCode(input.code, before.category_id)) {
      duplicateCode(res);
    } else {
      const status = isStatus(body.status) ? body.status : undefined;
      const after = updateCategory(before.category_id, status ? { ...input, status } : input)!;
      recordChanges(before, after);
      ok(res, after);
    }
    return true;
  }

  return false;
}
