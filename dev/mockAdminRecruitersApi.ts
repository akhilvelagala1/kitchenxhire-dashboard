import type { IncomingMessage, ServerResponse } from 'node:http';
import { recordRecruiterAudit } from './recruiterAudit.ts';
import {
  listRecruiters,
  pickFilters,
  recruiterLocations,
  recruitersSummary,
  recruitersTrend,
  type RecruitersQuery
} from './recruitersAnalytics.ts';
import {
  BUSINESS_TYPES,
  RECRUITER_STATUSES,
  RECRUITER_STATUS_LABELS,
  addRecruiter,
  findRecruiter,
  getRecruitersStore,
  updateRecruiter,
  type BusinessType,
  type HireAdminRecruiter,
  type RecruiterInput,
  type RecruiterStatus
} from './recruitersMockData.ts';

const BASE = '/hire/admin/recruiters';

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
    error: { code: 'NOT_FOUND', message: 'Recruiter not found.' }
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

const isStatus = (value: unknown): value is RecruiterStatus =>
  typeof value === 'string' && (RECRUITER_STATUSES as readonly string[]).includes(value);

const STATUS_HINT = `Status must be one of: ${RECRUITER_STATUSES.join(', ')}.`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[6-9]\d{9}$/;

/** How a field is named in the activity list. */
const FIELD_LABELS = {
  business_name: 'Business Name',
  business_type: 'Business Type',
  area: 'Area',
  city: 'City',
  owner_name: 'Owner Name',
  phone: 'Phone',
  email: 'E-mail'
} as const satisfies Record<keyof RecruiterInput, string>;

const INPUT_KEYS = Object.keys(FIELD_LABELS) as (keyof RecruiterInput)[];
const OPTIONAL_TEXT = ['area', 'city', 'owner_name'] as const;

/** Error text for one field, or undefined when the value is fine. */
function fieldError(key: keyof RecruiterInput, value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (key === 'business_name') return text ? undefined : 'Business name is required.';
  if (key === 'business_type') {
    return (BUSINESS_TYPES as readonly unknown[]).includes(value)
      ? undefined
      : `Business type must be one of: ${BUSINESS_TYPES.join(', ')}.`;
  }
  if (key === 'email') return EMAIL.test(text) ? undefined : 'Enter a valid e-mail address.';
  if (key === 'phone') return PHONE.test(text) ? undefined : 'Enter a 10-digit mobile number.';
  return typeof value === 'string' ? undefined : 'Enter text.';
}

/**
 * Reads the input fields of a create (every required field must be there) or a patch (only the fields
 * sent are checked). Strings are trimmed; fields the body does not name are left out of `input`.
 */
function readInput(body: Record<string, unknown>, creating: boolean) {
  const input: Partial<RecruiterInput> = {};
  const fields: Record<string, string> = {};
  for (const key of INPUT_KEYS) {
    const value = body[key];
    const optional = (OPTIONAL_TEXT as readonly string[]).includes(key);
    if (value === undefined && (!creating || optional)) {
      if (creating) Object.assign(input, { [key]: '' });
      continue;
    }
    const error = fieldError(key, value);
    if (error) fields[key] = error;
    else Object.assign(input, { [key]: typeof value === 'string' ? value.trim() : value });
  }
  return { input, fields };
}

function listQuery(url: URL): RecruitersQuery {
  const params = Object.fromEntries(url.searchParams);
  return {
    ...pickFilters(params),
    sort: params.sort,
    order: params.order,
    page: Number(params.page ?? 1),
    page_size: Number(params.page_size ?? 5)
  };
}

const display = (key: keyof RecruiterInput, value: string): string | null =>
  key === 'business_type' ? (value as BusinessType) : value || null;

/** The changed fields of a patch, with readable labels. */
function detailChanges(before: HireAdminRecruiter, input: Partial<RecruiterInput>) {
  return INPUT_KEYS.filter((key) => input[key] !== undefined && input[key] !== before[key]).map(
    (key) => ({
      field: FIELD_LABELS[key],
      from: display(key, before[key]),
      to: display(key, input[key]!)
    })
  );
}

const statusChange = (from: RecruiterStatus, to: RecruiterStatus) => ({
  field: 'Status',
  from: RECRUITER_STATUS_LABELS[from],
  to: RECRUITER_STATUS_LABELS[to]
});

/** Moves one recruiter to `status` and records who did it. Any status may move to any other. */
function changeStatus(recruiterId: string, status: RecruiterStatus, action: string) {
  const before = findRecruiter(recruiterId);
  if (!before) return undefined;
  const after = updateRecruiter(recruiterId, { status });
  if (before.status !== status) {
    recordRecruiterAudit(recruiterId, action, [statusChange(before.status, status)]);
  }
  return after;
}

/** Applies details and/or a status; each kind of change is recorded as its own event. */
function patchRecruiter(
  recruiterId: string,
  input: Partial<RecruiterInput>,
  status: RecruiterStatus | undefined
) {
  const before = findRecruiter(recruiterId)!;
  const changes = detailChanges(before, input);
  if (changes.length > 0) {
    updateRecruiter(recruiterId, input);
    recordRecruiterAudit(recruiterId, 'DETAILS_UPDATED', changes);
  }
  return status ? changeStatus(recruiterId, status, 'STATUS_UPDATED') : findRecruiter(recruiterId);
}

/**
 * Everything under /hire/admin/recruiters except /exports and /export-result/*, which the caller
 * serves with recruitersCsv. Returns false for a route it does not know.
 */
export async function handleAdminRecruitersMock(
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
    const { items, meta } = listRecruiters(getRecruitersStore(), listQuery(url));
    ok(res, items, meta);
    return true;
  }

  if (rest === '' && method === 'POST') {
    const { input, fields } = readInput(await readJson(req), true);
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    const row = addRecruiter(input as RecruiterInput);
    recordRecruiterAudit(row.recruiter_id, 'RECRUITER_CREATED', [
      { field: 'Status', from: null, to: RECRUITER_STATUS_LABELS.pending }
    ]);
    ok(res, row);
    return true;
  }

  if (rest === '/summary' && method === 'GET') {
    ok(res, recruitersSummary(getRecruitersStore()));
    return true;
  }

  if (rest === '/trend' && method === 'GET') {
    ok(res, recruitersTrend(url.searchParams.get('range') ?? '30d'));
    return true;
  }

  if (rest === '/locations' && method === 'GET') {
    ok(res, recruiterLocations(getRecruitersStore()));
    return true;
  }

  if (rest === '/bulk' && method === 'POST') {
    const body = await readJson(req);
    const status = body.status;
    if (body.action !== 'set_status' || !isStatus(status)) {
      invalid(res, 'Choose an action and a valid status.', { status: STATUS_HINT });
      return true;
    }
    const ids = Array.isArray(body.recruiter_ids) ? body.recruiter_ids.map(String) : [];
    const done = ids.filter((id) => changeStatus(id, status, 'BULK_STATUS_UPDATED'));
    ok(res, { affected: done.length });
    return true;
  }

  const byId = rest.match(/^\/([^/]+)$/);
  if (byId && method === 'GET') {
    const row = findRecruiter(byId[1]!);
    if (row) ok(res, row);
    else notFound(res);
    return true;
  }

  if (byId && method === 'PATCH') {
    const id = byId[1]!;
    if (!findRecruiter(id)) return (notFound(res), true);
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
    ok(res, patchRecruiter(id, input, status));
    return true;
  }

  return false;
}
