import { describe, expect, it } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getHireApplicationAudit } from './applicationAudit.ts';
import { handleAdminApplicationsMock } from './mockAdminApplicationsApi.ts';

/** Calls the handler with a tiny fake request and response, and parses what it wrote. */
async function call(method: string, target: string, body?: unknown) {
  const url = new URL(target, 'http://localhost');
  const payload = body === undefined ? [] : [Buffer.from(JSON.stringify(body))];
  const req = {
    async *[Symbol.asyncIterator]() {
      yield* payload;
    }
  };
  const res = {
    statusCode: 200,
    text: '',
    setHeader: () => undefined,
    end(chunk?: string) {
      this.text = chunk ?? '';
    }
  };
  const handled = await handleAdminApplicationsMock(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
    url.pathname,
    method,
    url
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

const BASE = '/hire/admin/applications';
const summaryCounts = async () => (await call('GET', `${BASE}/summary`)).json.data.counts;

describe('admin applications mock API', () => {
  it('lists with the success envelope and the paging meta', async () => {
    const { status, json } = await call('GET', `${BASE}?page=1735&page_size=5`);

    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.meta).toEqual({ page: 1735, page_size: 5, total: 8672 });
    expect(json.data.map((r: { application_id: string }) => r.application_id)).toEqual([
      'APP02222',
      'APP02221'
    ]);
  });

  it('applies the list filters from the query string', async () => {
    const { json } = await call(
      'GET',
      `${BASE}?tab=hired&search=suresh&sort=application_id&order=asc`
    );

    expect(json.data.every((r: { status: string }) => r.status === 'hired')).toBe(true);
    expect(json.data.map((r: { application_id: string }) => r.application_id)).toContain(
      'APP10889'
    );
  });

  it('serves the summary, the trend and the options', async () => {
    expect((await summaryCounts()).all).toBe(8672);
    expect((await call('GET', `${BASE}/trend?range=7d`)).json.data).toHaveLength(7);
    expect((await call('GET', `${BASE}/options/locations?search=hyd`)).json.data).toEqual([
      { value: 'Hyderabad', label: 'Hyderabad' }
    ]);
  });

  it('returns one application, or 404 with the NOT_FOUND envelope', async () => {
    expect((await call('GET', `${BASE}/APP10892`)).json.data.candidate_name).toBe('Rahul Kumar');
    const missing = await call('GET', `${BASE}/APP00001`);

    expect(missing.status).toBe(404);
    expect(missing.json).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Application not found.' }
    });
    expect((await call('PATCH', `${BASE}/APP00001`, { status: 'hired' })).status).toBe(404);
  });

  it('moves the summary by exactly one and writes an audit event on a status change', async () => {
    const before = await summaryCounts();
    const { status, json } = await call('PATCH', `${BASE}/APP10888`, { status: 'rejected' });
    const after = await summaryCounts();

    expect(status).toBe(200);
    expect(json.data.status).toBe('rejected');
    expect(after.rejected).toBe(before.rejected + 1);
    expect(after.all).toBe(before.all);
    expect(getHireApplicationAudit('APP10888')[0]).toMatchObject({
      action: 'STATUS_UPDATED',
      actor_name: 'Dev Admin',
      changes: [{ field: 'status', from: 'Pending Review', to: 'Rejected' }]
    });
    await call('PATCH', `${BASE}/APP10888`, { status: 'pending_review' });
    expect((await summaryCounts()).rejected).toBe(before.rejected);
  });

  it('keeps the derived history in step with the status the application was seeded with', async () => {
    const events = getHireApplicationAudit('APP10888');

    expect(events.map((e) => e.action)).toEqual([
      'STATUS_UPDATED',
      'STATUS_UPDATED',
      'APPLICATION_SUBMITTED'
    ]);
    expect(events.at(-1)).toMatchObject({
      actor_name: 'Neha Jain',
      occurred_at: '2026-06-20T16:22:00+05:30'
    });
    expect(getHireApplicationAudit('APP10889').map((e) => e.action)).toEqual([
      'HIRED',
      'INTERVIEW_SCHEDULED',
      'SHORTLISTED',
      'REVIEWED',
      'APPLICATION_SUBMITTED'
    ]);
    expect(getHireApplicationAudit('APP10889')[0]?.actor_name).toBe('Neha Patel');
  });

  it('answers 422 VALIDATION_FAILED for an unknown or missing status', async () => {
    for (const body of [{ status: 'archived' }, {}]) {
      const { status, json } = await call('PATCH', `${BASE}/APP10892`, body);

      expect(status).toBe(422);
      expect(json.error.code).toBe('VALIDATION_FAILED');
    }
    expect((await call('GET', `${BASE}/APP10892`)).json.data.status).toBe('reviewed');
  });

  it('schedules an interview: sets the time and the status, and records it', async () => {
    const { json } = await call('POST', `${BASE}/APP10891/interview`, {
      interview_at: '2026-06-27T05:30:00Z'
    });

    expect(json.data).toMatchObject({
      status: 'interview_scheduled',
      interview_at: '2026-06-27T11:00:00+05:30'
    });
    expect(getHireApplicationAudit('APP10891')[0]).toMatchObject({
      action: 'INTERVIEW_SCHEDULED',
      changes: [
        { field: 'interview_at', from: null, to: '2026-06-27T11:00:00+05:30' },
        { field: 'status', from: 'Shortlisted', to: 'Interview Scheduled' }
      ]
    });
    await call('PATCH', `${BASE}/APP10891`, { status: 'shortlisted' });
    expect((await call('GET', `${BASE}/APP10891`)).json.data.interview_at).toBeNull();
  });

  it('answers 422 when the interview time is missing or not a date, and 404 for an unknown id', async () => {
    for (const body of [{}, { interview_at: 'next week' }, { interview_at: 42 }]) {
      expect((await call('POST', `${BASE}/APP10892/interview`, body)).status).toBe(422);
    }
    expect(
      (await call('POST', `${BASE}/APP00001/interview`, { interview_at: '2026-06-27T11:00:00Z' }))
        .status
    ).toBe(404);
  });

  it('bulk sets the status, counts the applications it found and records each one', async () => {
    const ids = ['APP05000', 'APP05001', 'APP00001'];
    const found = await Promise.all(ids.slice(0, 2).map((id) => call('GET', `${BASE}/${id}`)));
    const notHired = found.filter((r) => r.json.data.status !== 'hired').length;
    const before = await summaryCounts();
    const body = { action: 'set_status', status: 'hired', application_ids: ids };

    expect((await call('POST', `${BASE}/bulk`, body)).json.data).toEqual({ affected: 2 });
    expect((await summaryCounts()).hired).toBe(before.hired + notHired);
    expect(getHireApplicationAudit('APP05001')[0]?.action).toBe('BULK_STATUS_UPDATED');
  });

  it('answers 422 for a bulk request with an unknown status or action', async () => {
    const ids = ['APP05000'];

    expect(
      (
        await call('POST', `${BASE}/bulk`, {
          action: 'set_status',
          status: 'nope',
          application_ids: ids
        })
      ).status
    ).toBe(422);
    expect(
      (await call('POST', `${BASE}/bulk`, { action: 'delete', application_ids: ids })).status
    ).toBe(422);
  });

  it('leaves exports and unknown routes to the caller', async () => {
    expect((await call('POST', `${BASE}/exports`, {})).handled).toBe(false);
    expect((await call('GET', `${BASE}/export-result/abc`)).handled).toBe(false);
    expect((await call('GET', '/hire/admin/jobs')).handled).toBe(false);
    expect((await call('DELETE', `${BASE}/APP10892`)).handled).toBe(false);
  });
});
