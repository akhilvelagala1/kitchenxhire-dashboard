// Dev-only mock of the kitchenxhire-backend-go contract in docs/API_CONTRACT_EXPECTATIONS.md.
// Loaded by vite.config.ts when VITE_API_BASE_URL is same-origin (/api/v1) or --mode mock; never in production builds.
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

import { handleHireMock } from './mockHireApi.ts';
import { handleStaffAuthMock } from './mockStaffAuth.ts';
import { seed, type Category, type Job } from './mockData.ts';
import { getJobsStore, setJobsStore, type HireAdminJob } from './jobsMockData.ts';
import { getHireJobAudit } from './jobAudit.ts';
import { getHireApplicationAudit } from './applicationAudit.ts';
import { applicationsCsv } from './applicationsExport.ts';
import { getHireRecruiterAudit } from './recruiterAudit.ts';
import { recruitersCsv } from './recruitersExport.ts';
import { businessesCsv } from './businessesExport.ts';
import { getHireJobSeekerAudit } from './jobSeekerAudit.ts';
import { jobSeekersCsv } from './jobSeekersExport.ts';
import { usersCsv } from './usersExport.ts';
import { categoriesCsv } from './categoriesExport.ts';
import { getCategoriesRolesAudit } from './categoriesAudit.ts';
import { invalid } from './categoriesHttp.ts';
import { readReportsExportDetail, reportsCsv, reportsDetailCsv } from './reportsExport.ts';
import { parseReportsRange } from './reportsMockData.ts';
import { invalidReportsRange } from './mockAdminReportsApi.ts';

const db = { categories: seed(), jobs: new Map<string, Job>(), audit: new Map<string, object[]>() };
void getJobsStore();

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const ok = (res: ServerResponse, data: unknown, meta?: unknown) =>
  send(res, 200, { success: true, data, meta });

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString();
  try {
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function audit(id: string, action: string, reason: unknown, changes: object[] = []) {
  const list = db.audit.get(id) ?? [];
  list.unshift({
    id: crypto.randomUUID(),
    action,
    actor_name: 'Dev Admin',
    occurred_at: new Date().toISOString(),
    reason: reason ?? null,
    changes
  });
  db.audit.set(id, list);
}

async function readRawReq(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString('latin1');
}

function parseCsvLine(line: string): string[] {
  return line.split(',').map((s) => s.trim());
}

function listCategories(q: URLSearchParams) {
  const search = q.get('search')?.toLowerCase();
  const status = q.get('status');
  const from = q.get('from');
  const to = q.get('to');
  let rows = db.categories.filter((c) => q.get('include_deleted') === 'true' || !c.deleted_at);
  if (search)
    rows = rows.filter(
      (c) => c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search)
    );
  if (status) rows = rows.filter((c) => c.status === status);
  if (from) rows = rows.filter((c) => c.updated_at.slice(0, 10) >= from);
  if (to) rows = rows.filter((c) => c.updated_at.slice(0, 10) <= to);
  const sort = (q.get('sort') ?? 'name') as keyof Category;
  const dir = q.get('order') === 'desc' ? -1 : 1;
  rows = [...rows].sort(
    (a, b) => String(a[sort]).localeCompare(String(b[sort]), 'en', { numeric: true }) * dir
  );
  const page = Number(q.get('page') ?? 1);
  const size = Number(q.get('page_size') ?? 25);
  return {
    items: rows.slice((page - 1) * size, page * size),
    meta: { page, page_size: size, total: rows.length }
  };
}

function parseHireJobCsvRows(raw: string): { rows: Partial<HireAdminJob>[]; errors: number } {
  const boundaryIdx = raw.indexOf('\r\n\r\n');
  const payload = boundaryIdx >= 0 ? raw.slice(boundaryIdx + 4) : raw;
  const lines = payload
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { rows: [], errors: 1 };
  const header = lines[0]!.toLowerCase();
  if (!header.includes('job_id')) return { rows: [], errors: lines.length };
  const out: Partial<HireAdminJob>[] = [];
  let errors = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    if (cols.length < 3) {
      errors++;
      continue;
    }
    out.push({
      job_id: cols[0],
      title: cols[1],
      business_name: cols[2],
      category: (cols[3] as HireAdminJob['category']) ?? 'Kitchen',
      location: cols[4] ?? 'Hyderabad'
    });
  }
  return { rows: out, errors };
}

function applyHireImport(job: Job) {
  if (!job.hireImportRaw || job.hireImportProcessed) return;
  job.hireImportProcessed = true;
  const { rows, errors } = parseHireJobCsvRows(job.hireImportRaw);
  if (job.dry_run) return;
  const now = getJobsStore();
  const added: HireAdminJob[] = rows.map((r, i) => ({
    job_id: r.job_id ?? `JOB${Date.now()}-${i}`,
    title: r.title ?? 'Imported role',
    recruiter_id: 'REC-IMP',
    recruiter_name: 'Import User',
    business_name: r.business_name ?? 'Imported',
    category: (r.category as HireAdminJob['category']) ?? 'Kitchen',
    job_category_label: r.title ?? 'Others',
    location: r.location ?? 'Hyderabad',
    applications_count: 0,
    recruited_count: 0,
    status: 'active',
    posted_at: new Date().toISOString()
  }));
  setJobsStore([...added, ...now]);
  void errors;
}

function jobView(job: Job) {
  const pct = Math.min(100, Math.round(((Date.now() - job.startedAt) / 4000) * 100));
  const done = pct >= 100;
  if (done && job.kind === 'IMPORT' && job.hireImportRaw) {
    applyHireImport(job);
  }
  const hireExportUrl =
    job.kind === 'EXPORT' && done && job.hireExport
      ? `/api/v1/hire/admin/jobs/export-result/${job.id}`
      : null;
  const applicationsExportUrl =
    job.kind === 'EXPORT' && done && job.applicationsExportBody
      ? `/api/v1/hire/admin/applications/export-result/${job.id}`
      : null;
  const businessesExportUrl =
    job.kind === 'EXPORT' && done && job.businessesExportBody
      ? `/api/v1/hire/admin/businesses/export-result/${job.id}`
      : null;
  const categoriesExportUrl =
    job.kind === 'EXPORT' && done && job.categoriesExportBody
      ? `/api/v1/hire/admin/categories/export-result/${job.id}`
      : null;
  const reportsExportUrl =
    job.kind === 'EXPORT' && done && job.reportsExportRange
      ? `/api/v1/hire/admin/reports/export-result/${job.id}`
      : null;
  const recruitersExportUrl =
    job.kind === 'EXPORT' && done && job.recruitersExportBody
      ? `/api/v1/hire/admin/recruiters/export-result/${job.id}`
      : null;
  const jobSeekersExportUrl =
    job.kind === 'EXPORT' && done && job.jobSeekersExportBody
      ? `/api/v1/hire/admin/job-seekers/export-result/${job.id}`
      : null;
  const usersExportUrl =
    job.kind === 'EXPORT' && done && job.usersExportBody
      ? `/api/v1/hire/admin/users/export-result/${job.id}`
      : null;
  const catExportUrl =
    job.kind === 'EXPORT' && done && !job.hireExport
      ? '/api/v1/catalog/categories/imports/template'
      : null;
  let summary: { total: number; created: number; updated: number; failed: number } | null = null;
  if (job.kind === 'IMPORT' && done && job.hireImportRaw) {
    const { rows, errors } = parseHireJobCsvRows(job.hireImportRaw);
    summary = {
      total: rows.length + errors,
      created: job.dry_run ? 0 : rows.length,
      updated: 0,
      failed: errors
    };
  } else if (job.kind === 'IMPORT' && done) {
    summary = { total: 120, created: 100, updated: 20, failed: 0 };
  }
  return {
    id: job.id,
    kind: job.kind,
    status: done ? 'SUCCEEDED' : pct === 0 ? 'QUEUED' : 'RUNNING',
    progress_percent: pct,
    dry_run: job.dry_run,
    summary,
    result_url:
      businessesExportUrl ??
      categoriesExportUrl ??
      reportsExportUrl ??
      recruitersExportUrl ??
      jobSeekersExportUrl ??
      usersExportUrl ??
      applicationsExportUrl ??
      hireExportUrl ??
      catExportUrl,
    error_report_url: null,
    error_message: null
  };
}

function startJob(res: ServerResponse, kind: Job['kind'], dryRun: boolean) {
  const job = { id: crypto.randomUUID(), kind, dry_run: dryRun, startedAt: Date.now() };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

function startHireExportJob(res: ServerResponse, jobIds: string[] | undefined) {
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'EXPORT',
    dry_run: false,
    startedAt: Date.now(),
    hireExport: true,
    hireExportJobIds: jobIds
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

function startApplicationsExportJob(res: ServerResponse, body: Record<string, unknown>) {
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'EXPORT',
    dry_run: false,
    startedAt: Date.now(),
    applicationsExportBody: body
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

function startBusinessesExportJob(res: ServerResponse, body: Record<string, unknown>) {
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'EXPORT',
    dry_run: false,
    startedAt: Date.now(),
    businessesExportBody: body
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

function startCategoriesExportJob(res: ServerResponse, body: Record<string, unknown>) {
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'EXPORT',
    dry_run: false,
    startedAt: Date.now(),
    categoriesExportBody: body
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

/**
 * The body is checked here, not in the job. A window the API does not have is a 422 (none means 30d), and
 * so is a stat card it does not have, or a status filter that is no status. With a card (`metric`, and
 * `search` and `filter` as typed in it) the file is that card's view; without one it is the Overview.
 */
function startReportsExportJob(res: ServerResponse, body: Record<string, unknown>) {
  const range = parseReportsRange(body.range);
  if (!range) {
    invalidReportsRange(res);
    return;
  }
  const { detail, fields } = readReportsExportDetail(body);
  if (Object.keys(fields).length > 0) {
    invalid(res, 'Check the highlighted fields.', fields);
    return;
  }
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'EXPORT',
    dry_run: false,
    startedAt: Date.now(),
    reportsExportRange: range,
    reportsExportDetail: detail
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

function startRecruitersExportJob(res: ServerResponse, body: Record<string, unknown>) {
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'EXPORT',
    dry_run: false,
    startedAt: Date.now(),
    recruitersExportBody: body
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

function startJobSeekersExportJob(res: ServerResponse, body: Record<string, unknown>) {
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'EXPORT',
    dry_run: false,
    startedAt: Date.now(),
    jobSeekersExportBody: body
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

function startUsersExportJob(res: ServerResponse, body: Record<string, unknown>) {
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'EXPORT',
    dry_run: false,
    startedAt: Date.now(),
    usersExportBody: body
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

async function startHireImportJob(res: ServerResponse, req: IncomingMessage, dryRun: boolean) {
  const raw = await readRawReq(req);
  const job: Job = {
    id: crypto.randomUUID(),
    kind: 'IMPORT',
    dry_run: dryRun,
    startedAt: Date.now(),
    hireImportRaw: raw
  };
  db.jobs.set(job.id, job);
  ok(res, jobView(job));
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname.replace(/^\/api\/v1/, '');
  const method = req.method ?? 'GET';
  const byId = path.match(/^\/catalog\/categories\/([^/]+)(\/archive|\/restore)?$/);

  if (await handleStaffAuthMock(req, res, path, method)) return true;
  if (await handleHireMock(req, res, path, method, url)) return true;

  if (path === '/catalog/categories' && method === 'GET') {
    const { items, meta } = listCategories(url.searchParams);
    return (ok(res, items, meta), true);
  }
  if (path === '/catalog/categories' && method === 'POST') {
    const body = await readJson(req);
    if (db.categories.some((c) => c.code === body.code)) {
      return (
        send(res, 422, {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Fix the highlighted fields.',
            fields: { code: 'Already used by another category' }
          }
        }),
        true
      );
    }
    const now = new Date().toISOString();
    const parent = db.categories.find((c) => c.id === body.parent_id);
    const row = {
      ...(body as object),
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      parent_name: parent?.name ?? null,
      product_count: 0,
      version: 1,
      created_at: now,
      updated_at: now,
      deleted_at: null
    } as Category;
    db.categories.unshift(row);
    audit(row.id, 'CREATED', null);
    return (ok(res, row), true);
  }
  if (path === '/catalog/categories/bulk-actions') {
    const { action, ids, reason } = (await readJson(req)) as {
      action: string;
      ids: string[];
      reason?: string;
    };
    const now = new Date().toISOString();
    db.categories.forEach((c) => {
      if (!ids.includes(c.id)) return;
      if (action === 'ARCHIVE') c.deleted_at = now;
      if (action === 'RESTORE') c.deleted_at = null;
      if (action === 'ACTIVATE') c.status = 'ACTIVE';
      if (action === 'DEACTIVATE') c.status = 'INACTIVE';
      c.updated_at = now;
      audit(c.id, `BULK_${action}`, reason);
    });
    return (ok(res, { affected: ids.length }), true);
  }
  if (path === '/catalog/categories/imports/template') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="categories-template.csv"');
    return (
      res.end('name,code,parent_code,status,sort_order\nPaneer,PANEER,DAIRY,ACTIVE,10\n'),
      true
    );
  }
  if (path === '/catalog/categories/imports')
    return (startJob(res, 'IMPORT', /name="dry_run"\r\n\r\ntrue/.test(await readRaw(req))), true);
  if (path === '/catalog/categories/exports') return (startJob(res, 'EXPORT', false), true);
  if (byId && byId[1] !== 'imports') {
    const row = db.categories.find((c) => c.id === byId[1]);
    if (!row)
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Category not found.' }
        }),
        true
      );
    if (byId[2] === '/archive') {
      row.deleted_at = new Date().toISOString();
      audit(row.id, 'ARCHIVED', (await readJson(req)).reason);
      return (ok(res, null), true);
    }
    if (byId[2] === '/restore') {
      row.deleted_at = null;
      audit(row.id, 'RESTORED', null);
      return (ok(res, null), true);
    }
    if (method === 'PATCH') {
      const body = await readJson(req);
      if (body.version !== row.version) {
        return (
          send(res, 409, {
            success: false,
            error: {
              code: 'VERSION_CONFLICT',
              message: 'Someone else changed this category. Reload and try again.'
            }
          }),
          true
        );
      }
      const changes = (['name', 'code', 'status', 'sort_order'] as const)
        .filter((k) => body[k] !== undefined && body[k] !== row[k])
        .map((k) => ({ field: k, from: String(row[k]), to: String(body[k]) }));
      const parent = db.categories.find((c) => c.id === body.parent_id);
      Object.assign(row, body, {
        parent_name: parent?.name ?? null,
        version: row.version + 1,
        updated_at: new Date().toISOString()
      });
      audit(row.id, 'UPDATED', null, changes);
      return (ok(res, row), true);
    }
    return (ok(res, row), true);
  }

  const hireExportResult = path.match(/^\/hire\/admin\/jobs\/export-result\/([^/]+)$/);
  if (hireExportResult && method === 'GET') {
    const ej = db.jobs.get(hireExportResult[1]!);
    if (!ej?.hireExport) {
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.' }
        }),
        true
      );
    }
    let rows = getJobsStore();
    if (ej.hireExportJobIds?.length) {
      const set = new Set(ej.hireExportJobIds);
      rows = rows.filter((r) => set.has(r.job_id));
    }
    const header = 'job_id,title,business_name,category,location';
    const lines = rows.map((r) =>
      [r.job_id, r.title, r.business_name, r.category, r.location].join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hire-jobs-export.csv"');
    return (res.end(`${header}\n${lines.join('\n')}\n`), true);
  }
  if (path === '/hire/admin/applications/exports' && method === 'POST') {
    return (startApplicationsExportJob(res, await readJson(req)), true);
  }
  const applicationsExportResult = path.match(
    /^\/hire\/admin\/applications\/export-result\/([^/]+)$/
  );
  if (applicationsExportResult && method === 'GET') {
    const ej = db.jobs.get(applicationsExportResult[1]!);
    if (!ej?.applicationsExportBody) {
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.' }
        }),
        true
      );
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hire-applications-export.csv"');
    return (res.end(applicationsCsv(ej.applicationsExportBody)), true);
  }
  if (path === '/hire/admin/businesses/exports' && method === 'POST') {
    return (startBusinessesExportJob(res, await readJson(req)), true);
  }
  const businessesExportResult = path.match(/^\/hire\/admin\/businesses\/export-result\/([^/]+)$/);
  if (businessesExportResult && method === 'GET') {
    const ej = db.jobs.get(businessesExportResult[1]!);
    if (!ej?.businessesExportBody) {
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.' }
        }),
        true
      );
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hire-businesses-export.csv"');
    return (res.end(businessesCsv(ej.businessesExportBody)), true);
  }
  if (path === '/hire/admin/categories/exports' && method === 'POST') {
    return (startCategoriesExportJob(res, await readJson(req)), true);
  }
  const categoriesExportResult = path.match(/^\/hire\/admin\/categories\/export-result\/([^/]+)$/);
  if (categoriesExportResult && method === 'GET') {
    const ej = db.jobs.get(categoriesExportResult[1]!);
    if (!ej?.categoriesExportBody) {
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.' }
        }),
        true
      );
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hire-categories-export.csv"');
    return (res.end(categoriesCsv(ej.categoriesExportBody)), true);
  }
  if (path === '/hire/admin/reports/exports' && method === 'POST') {
    return (startReportsExportJob(res, await readJson(req)), true);
  }
  const reportsExportResult = path.match(/^\/hire\/admin\/reports\/export-result\/([^/]+)$/);
  if (reportsExportResult && method === 'GET') {
    const ej = db.jobs.get(reportsExportResult[1]!);
    if (!ej?.reportsExportRange) {
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.' }
        }),
        true
      );
    }
    const detail = ej.reportsExportDetail;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="hire-reports-${detail?.metric ?? 'overview'}-${ej.reportsExportRange}.csv"`
    );
    return (
      res.end(
        detail ? reportsDetailCsv(ej.reportsExportRange, detail) : reportsCsv(ej.reportsExportRange)
      ),
      true
    );
  }
  if (path === '/hire/admin/recruiters/exports' && method === 'POST') {
    return (startRecruitersExportJob(res, await readJson(req)), true);
  }
  const recruitersExportResult = path.match(/^\/hire\/admin\/recruiters\/export-result\/([^/]+)$/);
  if (recruitersExportResult && method === 'GET') {
    const ej = db.jobs.get(recruitersExportResult[1]!);
    if (!ej?.recruitersExportBody) {
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.' }
        }),
        true
      );
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hire-recruiters-export.csv"');
    return (res.end(recruitersCsv(ej.recruitersExportBody)), true);
  }
  if (path === '/hire/admin/job-seekers/exports' && method === 'POST') {
    return (startJobSeekersExportJob(res, await readJson(req)), true);
  }
  const jobSeekersExportResult = path.match(/^\/hire\/admin\/job-seekers\/export-result\/([^/]+)$/);
  if (jobSeekersExportResult && method === 'GET') {
    const ej = db.jobs.get(jobSeekersExportResult[1]!);
    if (!ej?.jobSeekersExportBody) {
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.' }
        }),
        true
      );
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hire-job-seekers-export.csv"');
    return (res.end(jobSeekersCsv(ej.jobSeekersExportBody)), true);
  }
  if (path === '/hire/admin/users/exports' && method === 'POST') {
    return (startUsersExportJob(res, await readJson(req)), true);
  }
  const usersExportResult = path.match(/^\/hire\/admin\/users\/export-result\/([^/]+)$/);
  if (usersExportResult && method === 'GET') {
    const ej = db.jobs.get(usersExportResult[1]!);
    if (!ej?.usersExportBody) {
      return (
        send(res, 404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.' }
        }),
        true
      );
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hire-users-export.csv"');
    return (res.end(usersCsv(ej.usersExportBody)), true);
  }
  if (path === '/hire/admin/jobs/imports/template' && method === 'GET') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hire-jobs-template.csv"');
    return (
      res.end(
        'job_id,title,business_name,category,location\nJOB99999,Line Cook,Test Kitchen,Kitchen,Hyderabad\n'
      ),
      true
    );
  }
  if (path === '/hire/admin/jobs/imports' && method === 'POST') {
    return (
      startHireImportJob(res, req, /name="dry_run"\r\n\r\ntrue/.test(await readRaw(req))),
      true
    );
  }
  if (path === '/hire/admin/jobs/exports' && method === 'POST') {
    const body = await readJson(req);
    const jobIds = (body.job_ids as string[] | undefined) ?? undefined;
    return (startHireExportJob(res, jobIds), true);
  }

  const job = path.match(/^\/jobs\/(.+)$/);
  if (job) {
    const found = db.jobs.get(job[1]!);
    return (
      found
        ? ok(res, jobView(found))
        : send(res, 404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Job not found.' }
          }),
      true
    );
  }
  if (path === '/audit-events') {
    const et = url.searchParams.get('entity_type');
    const eid = url.searchParams.get('entity_id') ?? '';
    if (et === 'hire_job') return (ok(res, getHireJobAudit(eid)), true);
    if (et === 'hire_application') return (ok(res, getHireApplicationAudit(eid)), true);
    if (et === 'hire_recruiter') return (ok(res, getHireRecruiterAudit(eid)), true);
    if (et === 'hire_category' || et === 'hire_role') {
      return (ok(res, getCategoriesRolesAudit(et, eid)), true);
    }
    if (et === 'hire_job_seeker') return (ok(res, getHireJobSeekerAudit(eid)), true);
    return (ok(res, db.audit.get(eid) ?? []), true);
  }
  return false;
}

async function readRaw(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString('latin1');
}

export function mockApi(): Plugin {
  return {
    name: 'kitchenxhire-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/v1', (req, res, next) => {
        req.url = `/api/v1${req.url ?? ''}`;
        // A little latency so loading states are visible.
        setTimeout(() => {
          handle(req, res)
            .then(
              (handled) =>
                !handled &&
                send(res, 404, {
                  success: false,
                  error: { code: 'NOT_FOUND', message: 'No mock for this route.' }
                })
            )
            .catch(next);
        }, 250);
      });
    }
  };
}
