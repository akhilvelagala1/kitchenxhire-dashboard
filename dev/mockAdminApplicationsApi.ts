import type { IncomingMessage, ServerResponse } from 'node:http';
import { recordHireApplicationAudit } from './applicationAudit.ts';
import {
  applicationOptions,
  applicationsSummary,
  applicationsTrend,
  listApplications,
  pickFilters,
  type ApplicationsQuery
} from './applicationsAnalytics.ts';
import {
  APPLICATION_STATUS_LABELS,
  HIRE_APPLICATION_STATUSES,
  findApplication,
  getApplicationsStore,
  toIstIso,
  updateApplication,
  type HireApplicationStatus
} from './applicationsMockData.ts';

const BASE = '/hire/admin/applications';

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
    error: { code: 'NOT_FOUND', message: 'Application not found.' }
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

const isStatus = (value: unknown): value is HireApplicationStatus =>
  typeof value === 'string' && (HIRE_APPLICATION_STATUSES as readonly string[]).includes(value);

const STATUS_HINT = `Status must be one of: ${HIRE_APPLICATION_STATUSES.join(', ')}.`;

function listQuery(url: URL): ApplicationsQuery {
  const params = Object.fromEntries(url.searchParams);
  return {
    ...pickFilters(params),
    sort: params.sort,
    order: params.order,
    page: Number(params.page ?? 1),
    page_size: Number(params.page_size ?? 5)
  };
}

/** Moves one application to `status` and records who did it. Any status may move to any other. */
function changeStatus(applicationId: string, status: HireApplicationStatus, action: string) {
  const before = findApplication(applicationId);
  if (!before) return undefined;
  const change = {
    field: 'status',
    from: APPLICATION_STATUS_LABELS[before.status],
    to: APPLICATION_STATUS_LABELS[status]
  };
  const after = updateApplication(applicationId, { status });
  recordHireApplicationAudit(applicationId, action, [change]);
  return after;
}

function scheduleInterview(applicationId: string, interviewAt: string) {
  const before = findApplication(applicationId);
  if (!before) return undefined;
  const changes = [
    { field: 'interview_at', from: before.interview_at, to: interviewAt },
    ...(before.status === 'interview_scheduled'
      ? []
      : [
          {
            field: 'status',
            from: APPLICATION_STATUS_LABELS[before.status],
            to: APPLICATION_STATUS_LABELS.interview_scheduled
          }
        ])
  ];
  const after = updateApplication(applicationId, {
    status: 'interview_scheduled',
    interview_at: interviewAt
  });
  recordHireApplicationAudit(applicationId, 'INTERVIEW_SCHEDULED', changes);
  return after;
}

/**
 * Everything under /hire/admin/applications except /exports and /export-result/*, which the caller
 * serves with applicationsCsv. Returns false for a route it does not know.
 */
export async function handleAdminApplicationsMock(
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
    const { items, meta } = listApplications(getApplicationsStore(), listQuery(url));
    ok(res, items, meta);
    return true;
  }

  if (rest === '/summary' && method === 'GET') {
    ok(res, applicationsSummary(getApplicationsStore()));
    return true;
  }

  if (rest === '/trend' && method === 'GET') {
    ok(res, applicationsTrend(url.searchParams.get('range') ?? '30d'));
    return true;
  }

  const options = rest.match(/^\/options\/(jobs|recruiters|locations)$/);
  if (options && method === 'GET') {
    ok(res, applicationOptions(options[1]!, url.searchParams.get('search') ?? ''));
    return true;
  }

  if (rest === '/bulk' && method === 'POST') {
    const body = await readJson(req);
    const status = body.status;
    if (body.action !== 'set_status' || !isStatus(status)) {
      invalid(res, 'Choose an action and a valid status.', { status: STATUS_HINT });
      return true;
    }
    const ids = Array.isArray(body.application_ids) ? body.application_ids.map(String) : [];
    const done = ids.filter((id) => changeStatus(id, status, 'BULK_STATUS_UPDATED'));
    ok(res, { affected: done.length });
    return true;
  }

  const interview = rest.match(/^\/([^/]+)\/interview$/);
  if (interview && method === 'POST') {
    const id = interview[1]!;
    if (!findApplication(id)) return (notFound(res), true);
    const body = await readJson(req);
    const at = typeof body.interview_at === 'string' ? Date.parse(body.interview_at) : NaN;
    if (Number.isNaN(at)) {
      invalid(res, 'Pick a date and time for the interview.', {
        interview_at: 'Enter a valid date and time.'
      });
      return true;
    }
    ok(res, scheduleInterview(id, toIstIso(at)));
    return true;
  }

  const byId = rest.match(/^\/([^/]+)$/);
  if (byId && method === 'GET') {
    const row = findApplication(byId[1]!);
    if (row) ok(res, row);
    else notFound(res);
    return true;
  }

  if (byId && method === 'PATCH') {
    const id = byId[1]!;
    if (!findApplication(id)) return (notFound(res), true);
    const body = await readJson(req);
    if (!isStatus(body.status)) {
      invalid(res, 'Choose a valid status.', { status: STATUS_HINT });
      return true;
    }
    ok(res, changeStatus(id, body.status, 'STATUS_UPDATED'));
    return true;
  }

  return false;
}
