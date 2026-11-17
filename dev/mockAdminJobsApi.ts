import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  CATEGORY_LABELS,
  getJobsStore,
  setJobsStore,
  type HireAdminJob,
  type HireJobStatus
} from './jobsMockData.ts';
import { recordHireJobAudit } from './jobAudit.ts';
import { jobsByCategory, jobsSummary, jobsTrend } from './jobsAnalytics.ts';

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const ok = (res: ServerResponse, data: unknown, meta?: unknown) =>
  send(res, 200, { success: true, data, meta });

const invalid = (res: ServerResponse, message: string, fields: Record<string, string>) =>
  send(res, 422, { success: false, error: { code: 'VALIDATION_FAILED', message, fields } });

function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c as Buffer));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      try {
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
  });
}

interface RangeBounds {
  from: Date;
  to: Date;
}

function parseRange(url: URL): RangeBounds {
  const preset = url.searchParams.get('range') ?? '30d';
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (preset === '1d' || preset === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return { from: start, to: end };
  }
  if (preset === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
    const yEnd = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
    return { from: start, to: yEnd };
  }
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : preset === '30d' ? 30 : 30;
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');
  if (preset === 'custom' && fromParam && toParam) {
    return {
      from: new Date(fromParam),
      to: new Date(toParam)
    };
  }
  return { from: start, to: end };
}

function inRange(iso: string, bounds: RangeBounds): boolean {
  const t = new Date(iso).getTime();
  return t >= bounds.from.getTime() && t <= bounds.to.getTime();
}

function filterJobs(jobs: HireAdminJob[], bounds: RangeBounds): HireAdminJob[] {
  return jobs.filter((j) => inRange(j.posted_at, bounds));
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** What is wrong with a "post a job" body, keyed by field name. A draft only needs a title. */
function jobPostProblems(body: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {};
  if (text(body.title).length < 2) fields.title = 'Enter a job title of at least 2 characters.';
  if (body.status !== 'draft' && body.status !== 'active') {
    fields.status = 'Status must be draft or active.';
  } else if (body.status === 'active') {
    if (!text(body.job_category)) fields.job_category = 'Choose a job category.';
    if (!text(body.city)) fields.city = 'Choose a city.';
  }
  return fields;
}

let lastIssuedJobNumber = 0;

/** The next JOB id after the highest one in the store (or one already handed out), never reused. */
function nextJobId(): string {
  const highest = getJobsStore().reduce(
    (max, j) => Math.max(max, Number(j.job_id.replace(/\D/g, '')) || 0),
    0
  );
  lastIssuedJobNumber = Math.max(highest, lastIssuedJobNumber) + 1;
  return `JOB${String(lastIssuedJobNumber).padStart(5, '0')}`;
}

/**
 * The list row for a posted job. The list only keeps list fields, so department, salary, shift,
 * description and the other posted fields are not stored. A label outside the six seeded ones
 * counts as "Others", so Jobs by Category still adds up to the total.
 */
function jobFromPost(body: Record<string, unknown>): HireAdminJob {
  const posted = text(body.job_category);
  let label = posted || '—';
  if (posted && !(CATEGORY_LABELS as readonly string[]).includes(posted)) label = 'Others';
  const city = text(body.city);
  return {
    job_id: nextJobId(),
    title: text(body.title),
    recruiter_id: 'REC000',
    recruiter_name: 'Platform Admin',
    business_name: 'KitchenX Platform',
    category: getJobsStore().find((j) => j.job_category_label === label)?.category ?? 'Operations',
    job_category_label: label,
    location: city || '—',
    applications_count: 0,
    recruited_count: 0,
    status: body.status as HireJobStatus,
    posted_at: new Date().toISOString()
  };
}

export async function handleAdminJobsMock(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  method: string,
  url: URL
): Promise<boolean> {
  const jobs = getJobsStore();
  const bounds = parseRange(url);

  // Summary, trend and categories are all computed from the same slice the list filters (see jobsAnalytics.ts).
  if (path === '/hire/admin/jobs/summary' && method === 'GET') {
    ok(res, jobsSummary(filterJobs(jobs, bounds)));
    return true;
  }

  if (path === '/hire/admin/jobs/trend' && method === 'GET') {
    ok(res, jobsTrend(filterJobs(jobs, bounds), bounds));
    return true;
  }

  if (path === '/hire/admin/jobs/categories' && method === 'GET') {
    ok(res, jobsByCategory(filterJobs(jobs, bounds)));
    return true;
  }

  if (path === '/hire/admin/jobs' && method === 'GET') {
    const listBounds = parseRange(url);
    const search = (url.searchParams.get('search') ?? '').toLowerCase().trim();
    const statusRaw = url.searchParams.get('job_status') ?? url.searchParams.get('status') ?? '';
    const categoryRaw =
      url.searchParams.get('job_category') ?? url.searchParams.get('category') ?? '';
    const titleLabelFilter = url.searchParams.get('job_title_label') ?? '';
    const recruitedOnly = url.searchParams.get('recruited') === '1';
    const sort = url.searchParams.get('sort') ?? 'posted_at';
    const order = url.searchParams.get('order') === 'asc' ? 1 : -1;
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('page_size') ?? 5)));

    let rows = filterJobs([...jobs], listBounds);
    const locationRaw = url.searchParams.get('location') ?? '';
    const recruiterRaw = url.searchParams.get('recruiter_name') ?? '';

    if (search) {
      rows = rows.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.job_id.toLowerCase().includes(search) ||
          j.business_name.toLowerCase().includes(search) ||
          j.recruiter_name.toLowerCase().includes(search) ||
          j.location.toLowerCase().includes(search)
      );
    }
    if (statusRaw && statusRaw !== 'all') {
      const st = statusRaw.replace(' ', '_') as HireJobStatus;
      rows = rows.filter((j) => j.status === st);
    }
    if (categoryRaw && categoryRaw !== 'all') {
      rows = rows.filter((j) => j.category === categoryRaw);
    }
    if (locationRaw && locationRaw !== 'all') {
      rows = rows.filter((j) => j.location === locationRaw);
    }
    if (recruiterRaw && recruiterRaw !== 'all') {
      rows = rows.filter((j) => j.recruiter_name === recruiterRaw);
    }
    if (titleLabelFilter) {
      rows = rows.filter((j) => j.job_category_label === titleLabelFilter);
    }
    if (recruitedOnly) {
      rows = rows.filter((j) => j.recruited_count > 0);
    }

    // Dates and counts compare as numbers; everything else as text.
    const sortValue = (j: HireAdminJob) =>
      sort === 'posted_at' ? new Date(j.posted_at).getTime() : j[sort as keyof HireAdminJob];
    rows.sort((a, b) => {
      const av = sortValue(a);
      const bv = sortValue(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * order;
      return String(av).localeCompare(String(bv), 'en') * order;
    });

    const total = rows.length;
    const items = rows.slice((page - 1) * pageSize, page * pageSize);
    ok(res, items, { page, page_size: pageSize, total });
    return true;
  }

  if (path === '/hire/admin/jobs' && method === 'POST') {
    const body = await readJson(req);
    const fields = jobPostProblems(body);
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    const job = jobFromPost(body);
    setJobsStore([job, ...getJobsStore()]);
    recordHireJobAudit(job.job_id, 'CREATED');
    ok(res, job);
    return true;
  }

  const jobDetail = path.match(/^\/hire\/admin\/jobs\/([^/]+)$/);
  if (jobDetail && method === 'GET') {
    const id = jobDetail[1]!;
    const row = getJobsStore().find((j) => j.job_id === id);
    if (!row) {
      send(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Job not found.' } });
      return true;
    }
    ok(res, row);
    return true;
  }

  if (path === '/hire/admin/jobs/bulk' && method === 'POST') {
    const body = await readJson(req);
    const action = String(body.action ?? '');
    const ids = (body.job_ids as string[]) ?? [];
    let next = [...getJobsStore()];
    if (action === 'approve') {
      next = next.map((j) =>
        ids.includes(j.job_id) && j.status === 'under_review'
          ? { ...j, status: 'active' as const }
          : j
      );
    } else if (action === 'pause') {
      next = next.map((j) => (ids.includes(j.job_id) ? { ...j, status: 'paused' as const } : j));
    } else if (action === 'close') {
      next = next.map((j) => (ids.includes(j.job_id) ? { ...j, status: 'closed' as const } : j));
    }
    setJobsStore(next);
    ids.forEach((id) => recordHireJobAudit(id, `BULK_${action}`));
    ok(res, { affected: ids.length });
    return true;
  }

  const byId = path.match(/^\/hire\/admin\/jobs\/([^/]+)$/);
  if (byId && method === 'PATCH') {
    const id = byId[1]!;
    const body = await readJson(req);
    const status = body.status as HireJobStatus | undefined;
    const title = typeof body.title === 'string' ? body.title : undefined;
    const next = getJobsStore().map((j) =>
      j.job_id === id ? { ...j, ...(status ? { status } : {}), ...(title ? { title } : {}) } : j
    );
    setJobsStore(next);
    recordHireJobAudit(id, 'STATUS_UPDATED');
    ok(
      res,
      next.find((j) => j.job_id === id)
    );
    return true;
  }

  if (byId && method === 'DELETE') {
    const id = byId[1]!;
    recordHireJobAudit(id, 'DELETED');
    setJobsStore(getJobsStore().filter((j) => j.job_id !== id));
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}
