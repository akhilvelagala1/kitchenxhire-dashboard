import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  businessLocations,
  businessesSummary,
  businessesTrend,
  listBusinesses,
  pickBusinessFilters,
  type BusinessesQuery
} from './businessesAnalytics.ts';
import {
  BUSINESS_KINDS,
  BUSINESS_STATUS_LABELS,
  createBusiness,
  findBusiness,
  getBusinessesStore,
  updateBusiness,
  type BusinessInput,
  type BusinessStatus
} from './businessesMockData.ts';

const BASE = '/hire/admin/businesses';

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const ok = (res: ServerResponse, data: unknown, meta?: unknown) =>
  send(res, 200, { success: true, data, meta });

const notFound = (res: ServerResponse) =>
  send(res, 404, {
    success: false,
    error: { code: 'NOT_FOUND', message: 'Business not found.' }
  });

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

/** A person can set these by hand. New businesses start as Under Review. */
const SETTABLE_STATUSES = ['active', 'inactive', 'suspended'] as const;
type SettableStatus = (typeof SETTABLE_STATUSES)[number];

const isStatus = (value: unknown): value is SettableStatus =>
  typeof value === 'string' && (SETTABLE_STATUSES as readonly string[]).includes(value);

const STATUS_HINT = `Status must be ${SETTABLE_STATUSES.map((s) => BUSINESS_STATUS_LABELS[s]).join(', ')}.`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[6-9]\d{9}$/;

const INPUT_KEYS = [
  'business_name',
  'business_type',
  'area',
  'city',
  'owner_name',
  'phone',
  'email'
] as const satisfies readonly (keyof BusinessInput)[];

const REQUIRED_TEXT: Record<'business_name' | 'area' | 'city' | 'owner_name', string> = {
  business_name: 'Business name is required.',
  area: 'Area is required.',
  city: 'City is required.',
  owner_name: 'Owner name is required.'
};

/** Error text for one field, or undefined when the value is fine. */
function fieldError(key: keyof BusinessInput, value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (key === 'business_type') {
    return (BUSINESS_KINDS as readonly unknown[]).includes(value)
      ? undefined
      : `Business type must be one of: ${BUSINESS_KINDS.join(', ')}.`;
  }
  if (key === 'email') return EMAIL.test(text) ? undefined : 'Enter a valid e-mail address.';
  if (key === 'phone') return PHONE.test(text) ? undefined : 'Enter a 10-digit mobile number.';
  return text ? undefined : REQUIRED_TEXT[key];
}

/**
 * Reads the input fields of a create (every field must be there) or a patch (only the fields sent
 * are checked). Strings are trimmed; fields the body does not name are left out of `input`.
 */
function readInput(body: Record<string, unknown>, creating: boolean) {
  const input: Partial<BusinessInput> = {};
  const fields: Record<string, string> = {};
  for (const key of INPUT_KEYS) {
    const value = body[key];
    if (value === undefined && !creating) continue;
    const error = fieldError(key, value);
    if (error) fields[key] = error;
    else Object.assign(input, { [key]: typeof value === 'string' ? value.trim() : value });
  }
  return { input, fields };
}

function listQuery(url: URL): BusinessesQuery {
  const params = Object.fromEntries(url.searchParams);
  return {
    ...pickBusinessFilters(params),
    sort: params.sort,
    order: params.order,
    page: Number(params.page ?? 1),
    page_size: Number(params.page_size ?? 10)
  };
}

const withStatus = (status: BusinessStatus) => ({ status });

/**
 * Everything under /hire/admin/businesses except /exports and /export-result/*, which the caller
 * serves with businessesCsv. Returns false for a route it does not know.
 */
export async function handleAdminBusinessesMock(
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
    const { items, meta } = listBusinesses(getBusinessesStore(), listQuery(url));
    ok(res, items, meta);
    return true;
  }

  if (rest === '' && method === 'POST') {
    const { input, fields } = readInput(await readJson(req), true);
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    ok(res, createBusiness(input as BusinessInput));
    return true;
  }

  if (rest === '/summary' && method === 'GET') {
    ok(res, businessesSummary(getBusinessesStore()));
    return true;
  }

  if (rest === '/trend' && method === 'GET') {
    ok(res, businessesTrend(url.searchParams.get('range') ?? '30d'));
    return true;
  }

  if (rest === '/locations' && method === 'GET') {
    ok(res, businessLocations(getBusinessesStore()));
    return true;
  }

  if (rest === '/bulk' && method === 'POST') {
    const body = await readJson(req);
    const status = body.status;
    if (body.action !== 'set_status' || !isStatus(status)) {
      invalid(res, 'Choose an action and a valid status.', { status: STATUS_HINT });
      return true;
    }
    const ids = Array.isArray(body.business_ids) ? body.business_ids.map(String) : [];
    const done = ids.filter((id) => updateBusiness(id, withStatus(status)));
    ok(res, { affected: done.length });
    return true;
  }

  const byId = rest.match(/^\/([^/]+)$/);
  if (byId && method === 'GET') {
    const row = findBusiness(byId[1]!);
    if (row) ok(res, row);
    else notFound(res);
    return true;
  }

  if (byId && method === 'PATCH') {
    const id = byId[1]!;
    if (!findBusiness(id)) return (notFound(res), true);
    const body = await readJson(req);
    const { input, fields } = readInput(body, false);
    if (body.status !== undefined && !isStatus(body.status)) fields.status = STATUS_HINT;
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    const status = isStatus(body.status) ? body.status : undefined;
    if (!status && Object.keys(input).length === 0) {
      invalid(res, 'Send at least one field to change.', { status: STATUS_HINT });
      return true;
    }
    ok(res, updateBusiness(id, status ? { ...input, status } : input));
    return true;
  }

  return false;
}
