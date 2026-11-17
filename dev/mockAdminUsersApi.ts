import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  listUsers,
  pickUserFilters,
  usersSummary,
  usersTrend,
  type UsersQuery
} from './usersAnalytics.ts';
import {
  USER_ACCESS_SCOPES,
  USER_DEPARTMENTS,
  USER_ROLES,
  USER_STATUS_LABELS,
  createUser,
  findUser,
  getUsersStore,
  updateUser,
  type UserInput,
  type UserStatus
} from './usersMockData.ts';

const BASE = '/hire/admin/users';

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const ok = (res: ServerResponse, data: unknown, meta?: unknown) =>
  send(res, 200, { success: true, data, meta });

const notFound = (res: ServerResponse) =>
  send(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });

const invalid = (res: ServerResponse, message: string, fields: Record<string, string>) =>
  send(res, 422, { success: false, error: { code: 'VALIDATION_FAILED', message, fields } });

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    const raw = Buffer.concat(chunks).toString();
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** The statuses a person can be moved to by hand; `pending` ends when the invite is accepted. */
const SETTABLE: UserStatus[] = ['active', 'inactive', 'suspended'];

const isSettable = (value: unknown): value is UserStatus =>
  typeof value === 'string' && (SETTABLE as string[]).includes(value);

const STATUS_HINT = `Status must be one of: ${SETTABLE.map((s) => USER_STATUS_LABELS[s]).join(', ')}.`;

const FIELD_KEYS = ['name', 'email', 'role', 'department', 'access_scope'] as const;

const CHOICES: Record<'role' | 'department' | 'access_scope', readonly string[]> = {
  role: USER_ROLES,
  department: USER_DEPARTMENTS,
  access_scope: USER_ACCESS_SCOPES
};

/** The problem with one input field, or undefined when it is fine. */
function problemWith(key: (typeof FIELD_KEYS)[number], value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (key === 'name') return text.length < 2 ? 'Enter the full name.' : undefined;
  if (key === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? undefined : 'Enter a valid e-mail address.';
  }
  return CHOICES[key].includes(text) ? undefined : `Choose one of: ${CHOICES[key].join(', ')}.`;
}

/** Validates the fields present in `body` (all of them on create) and returns the clean input. */
function readInput(body: Record<string, unknown>, requireAll: boolean) {
  const fields: Record<string, string> = {};
  const input: Record<string, unknown> = {};
  for (const key of FIELD_KEYS) {
    const value = body[key];
    if (value === undefined && !requireAll) continue;
    const problem = problemWith(key, value);
    if (problem) fields[key] = problem;
    else input[key] = String(value).trim();
  }
  return { input: input as Partial<UserInput>, fields };
}

function listQuery(url: URL): UsersQuery {
  const params = Object.fromEntries(url.searchParams);
  return {
    ...pickUserFilters(params),
    sort: params.sort,
    order: params.order,
    page: Number(params.page ?? 1),
    page_size: Number(params.page_size ?? 10)
  };
}

const takenBy = (email: string, exceptId?: string) =>
  getUsersStore().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.user_id !== exceptId
  );

/**
 * Everything under /hire/admin/users except /exports and /export-result/*, which the caller serves
 * with usersCsv. Returns false for a route it does not know.
 */
export async function handleAdminUsersMock(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  method: string,
  url: URL
): Promise<boolean> {
  if (path !== BASE && !path.startsWith(`${BASE}/`)) return false;
  const rest = path.slice(BASE.length);
  if (rest === '/exports' || rest.startsWith('/export-result/')) return false;

  if (rest === '' && method === 'GET') {
    const { items, meta } = listUsers(getUsersStore(), listQuery(url));
    ok(res, items, meta);
    return true;
  }

  if (rest === '' && method === 'POST') {
    const { input, fields } = readInput(await readJson(req), true);
    if (!fields.email && takenBy(input.email!))
      fields.email = 'This e-mail already has an account.';
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    ok(res, createUser(input as UserInput));
    return true;
  }

  if (rest === '/summary' && method === 'GET') {
    ok(res, usersSummary(getUsersStore()));
    return true;
  }

  if (rest === '/trend' && method === 'GET') {
    ok(res, usersTrend(url.searchParams.get('range') ?? '30d'));
    return true;
  }

  if (rest === '/bulk' && method === 'POST') {
    const body = await readJson(req);
    const status = body.status;
    if (body.action !== 'set_status' || !isSettable(status)) {
      invalid(res, 'Choose an action and a valid status.', { status: STATUS_HINT });
      return true;
    }
    const ids = Array.isArray(body.user_ids) ? body.user_ids.map(String) : [];
    // A pending invite stays pending until it is accepted, so it is left out of the count.
    const done = [...new Set(ids)].filter((id) => {
      const row = findUser(id);
      return row && row.status !== 'pending' && updateUser(id, { status });
    });
    ok(res, { affected: done.length });
    return true;
  }

  const byId = rest.match(/^\/([^/]+)$/);
  if (byId && method === 'GET') {
    const row = findUser(byId[1]!);
    if (row) ok(res, row);
    else notFound(res);
    return true;
  }

  if (byId && method === 'PATCH') {
    const id = byId[1]!;
    const current = findUser(id);
    if (!current) return (notFound(res), true);
    const body = await readJson(req);
    const { input, fields } = readInput(body, false);
    if (body.status !== undefined && !isSettable(body.status)) fields.status = STATUS_HINT;
    if (body.status !== undefined && current.status === 'pending') {
      fields.status = 'A pending invite cannot be changed until it is accepted.';
    }
    if (input.email && takenBy(input.email, id))
      fields.email = 'This e-mail already has an account.';
    const status = isSettable(body.status) ? body.status : undefined;
    if (
      Object.keys(fields).length === 0 &&
      status === undefined &&
      Object.keys(input).length === 0
    ) {
      invalid(res, 'Nothing to update.', { status: STATUS_HINT });
      return true;
    }
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    ok(res, updateUser(id, { ...input, ...(status ? { status } : {}) }));
    return true;
  }

  return false;
}
