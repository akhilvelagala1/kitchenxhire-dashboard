import type { IncomingMessage, ServerResponse } from 'node:http';
import { recordJobSeekerAudit, type AuditChange } from './jobSeekerAudit.ts';
import {
  jobSeekerLocations,
  jobSeekersSummary,
  jobSeekersTrend,
  listJobSeekers,
  pickJobSeekerFilters,
  type JobSeekersQuery
} from './jobSeekersAnalytics.ts';
import {
  JOB_SEEKER_STATUS_LABELS,
  createJobSeeker,
  findJobSeeker,
  getJobSeekersStore,
  updateJobSeeker,
  type JobSeekerInput,
  type JobSeekerStatus
} from './jobSeekersMockData.ts';

const BASE = '/hire/admin/job-seekers';

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
    error: { code: 'NOT_FOUND', message: 'Job seeker not found.' }
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

const STATUSES = Object.keys(JOB_SEEKER_STATUS_LABELS) as JobSeekerStatus[];

const isStatus = (value: unknown): value is JobSeekerStatus =>
  typeof value === 'string' && (STATUSES as string[]).includes(value);

const STATUS_HINT = `Status must be one of: ${STATUSES.join(', ')}.`;

/** What each input field is called in the audit list. */
const FIELD_LABELS: Record<keyof JobSeekerInput, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  city: 'City',
  preferred_job_title: 'Preferred job title',
  experience_years: 'Experience (years)'
};

const FIELD_KEYS = Object.keys(FIELD_LABELS) as (keyof JobSeekerInput)[];

const isText = (v: unknown): v is string => typeof v === 'string';

/** The problem with one input field, or undefined when it is fine. */
function problemWith(key: keyof JobSeekerInput, v: unknown): string | undefined {
  const text = isText(v) ? v.trim() : '';
  switch (key) {
    case 'name':
      return text === '' ? 'Enter the name.' : undefined;
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? undefined : 'Enter a valid e-mail address.';
    case 'phone':
      return /^[6-9]\d{9}$/.test(text)
        ? undefined
        : 'Enter a 10-digit mobile number starting with 6 to 9.';
    case 'experience_years':
      return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 50
        ? undefined
        : 'Enter whole years from 0 to 50.';
    default:
      return isText(v) ? undefined : `Enter the ${FIELD_LABELS[key].toLowerCase()}.`;
  }
}

/** Validates the fields present in `body` (all of them on create) and returns the clean input. */
function readInput(body: Record<string, unknown>, requireAll: boolean) {
  const fields: Record<string, string> = {};
  const input: Partial<JobSeekerInput> = {};
  const required = ['name', 'email', 'phone', 'experience_years'];
  for (const key of FIELD_KEYS) {
    const value = body[key];
    if (value === undefined && !(requireAll && required.includes(key))) continue;
    const problem = problemWith(key, value);
    if (problem) fields[key] = problem;
    else (input as Record<string, unknown>)[key] = typeof value === 'string' ? value.trim() : value;
  }
  if (requireAll) {
    input.city ??= '';
    input.preferred_job_title ??= '';
  }
  return { input, fields };
}

function listQuery(url: URL): JobSeekersQuery {
  const params = Object.fromEntries(url.searchParams);
  return {
    ...pickJobSeekerFilters(params),
    sort: params.sort,
    order: params.order,
    page: Number(params.page ?? 1),
    page_size: Number(params.page_size ?? 10)
  };
}

/** Moves one job seeker to `status` and records who did it. Either status may follow the other. */
function changeStatus(jobSeekerId: string, status: JobSeekerStatus, action: string) {
  const before = findJobSeeker(jobSeekerId);
  if (!before) return undefined;
  const change = {
    field: 'status',
    from: JOB_SEEKER_STATUS_LABELS[before.status],
    to: JOB_SEEKER_STATUS_LABELS[status]
  };
  const after = updateJobSeeker(jobSeekerId, { status });
  recordJobSeekerAudit(jobSeekerId, action, [change]);
  return after;
}

/** Applies an edit and records the fields that really changed, named as the form names them. */
function applyDetails(jobSeekerId: string, input: Partial<JobSeekerInput>) {
  const before = findJobSeeker(jobSeekerId)!;
  const changes: AuditChange[] = FIELD_KEYS.filter(
    (key) => key in input && input[key] !== before[key]
  ).map((key) => ({
    field: FIELD_LABELS[key],
    from: String(before[key]),
    to: String(input[key])
  }));
  const after = updateJobSeeker(jobSeekerId, input);
  if (changes.length > 0) recordJobSeekerAudit(jobSeekerId, 'DETAILS_UPDATED', changes);
  return after;
}

/**
 * Everything under /hire/admin/job-seekers except /exports and /export-result/*, which the caller
 * serves with jobSeekersCsv. Returns false for a route it does not know.
 */
export async function handleAdminJobSeekersMock(
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
    const { items, meta } = listJobSeekers(getJobSeekersStore(), listQuery(url));
    ok(res, items, meta);
    return true;
  }

  if (rest === '' && method === 'POST') {
    const { input, fields } = readInput(await readJson(req), true);
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    const row = createJobSeeker(input as JobSeekerInput);
    const label = JOB_SEEKER_STATUS_LABELS;
    recordJobSeekerAudit(row.job_seeker_id, 'PROFILE_CREATED', [
      { field: 'status', from: null, to: label.inactive }
    ]);
    recordJobSeekerAudit(row.job_seeker_id, 'PROFILE_ACTIVATED', [
      { field: 'status', from: label.inactive, to: label.active }
    ]);
    ok(res, row);
    return true;
  }

  if (rest === '/summary' && method === 'GET') {
    ok(res, jobSeekersSummary(getJobSeekersStore()));
    return true;
  }

  if (rest === '/trend' && method === 'GET') {
    ok(res, jobSeekersTrend(url.searchParams.get('range') ?? '30d'));
    return true;
  }

  if (rest === '/locations' && method === 'GET') {
    ok(res, jobSeekerLocations(getJobSeekersStore()));
    return true;
  }

  if (rest === '/bulk' && method === 'POST') {
    const body = await readJson(req);
    const status = body.status;
    if (body.action !== 'set_status' || !isStatus(status)) {
      invalid(res, 'Choose an action and a valid status.', { status: STATUS_HINT });
      return true;
    }
    const ids = Array.isArray(body.job_seeker_ids) ? body.job_seeker_ids.map(String) : [];
    const done = [...new Set(ids)].filter((id) => changeStatus(id, status, 'BULK_STATUS_UPDATED'));
    ok(res, { affected: done.length });
    return true;
  }

  const byId = rest.match(/^\/([^/]+)$/);
  if (byId && method === 'GET') {
    const row = findJobSeeker(byId[1]!);
    if (row) ok(res, row);
    else notFound(res);
    return true;
  }

  if (byId && method === 'PATCH') {
    const id = byId[1]!;
    if (!findJobSeeker(id)) return (notFound(res), true);
    const body = await readJson(req);
    const { input, fields } = readInput(body, false);
    if (body.status !== undefined && !isStatus(body.status)) fields.status = STATUS_HINT;
    const status = isStatus(body.status) ? body.status : undefined;
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
    let row = Object.keys(input).length > 0 ? applyDetails(id, input) : findJobSeeker(id);
    if (status !== undefined && status !== row?.status) {
      row = changeStatus(id, status, 'STATUS_UPDATED');
    }
    ok(res, row);
    return true;
  }

  return false;
}
