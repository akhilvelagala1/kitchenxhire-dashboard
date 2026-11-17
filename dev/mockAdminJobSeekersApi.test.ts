import { describe, expect, it } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getHireJobSeekerAudit } from './jobSeekerAudit.ts';
import { handleAdminJobSeekersMock } from './mockAdminJobSeekersApi.ts';

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
  const handled = await handleAdminJobSeekersMock(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
    url.pathname,
    method,
    url
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

const BASE = '/hire/admin/job-seekers';
const summary = async () => (await call('GET', `${BASE}/summary`)).json.data;
const validBody = {
  name: 'Meera Nair',
  email: 'meera.nair@example.com',
  phone: '9123456780',
  city: 'Chennai',
  preferred_job_title: 'Barista',
  experience_years: 4
};

describe('admin job seekers mock API', () => {
  it('lists with the success envelope and the paging meta', async () => {
    const { status, json } = await call('GET', `${BASE}?page=1285&page_size=10`);

    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.meta).toEqual({ page: 1285, page_size: 10, total: 12846 });
    expect(json.data.at(-1)?.job_seeker_id).toBe('JS00001');
    expect(json.data).toHaveLength(6);
  });

  it('applies the list filters from the query string', async () => {
    const { json } = await call(
      'GET',
      `${BASE}?tab=active&search=ramesh&sort=job_seeker_id&order=asc`
    );

    expect(json.data.every((r: { status: string }) => r.status === 'active')).toBe(true);
    expect(json.data.map((r: { job_seeker_id: string }) => r.job_seeker_id)).toContain('JS12846');
  });

  it('serves the summary, the trend and the locations', async () => {
    expect((await summary()).total).toBe(12846);
    expect((await call('GET', `${BASE}/trend?range=7d`)).json.data).toHaveLength(7);
    expect((await call('GET', `${BASE}/trend`)).json.data.at(-1)).toEqual({
      date: '2024-06-24',
      count: 12846
    });
    expect((await call('GET', `${BASE}/locations`)).json.data).toContainEqual({
      value: 'Warangal',
      label: 'Warangal'
    });
  });

  it('returns one job seeker, or 404 with the NOT_FOUND envelope', async () => {
    expect((await call('GET', `${BASE}/JS12846`)).json.data.name).toBe('Ramesh Kumar');
    const missing = await call('GET', `${BASE}/JS00000`);

    expect(missing.status).toBe(404);
    expect(missing.json).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Job seeker not found.' }
    });
    expect((await call('PATCH', `${BASE}/JS00000`, { status: 'inactive' })).status).toBe(404);
  });

  it('moves the summary by exactly one and writes an audit event on a status change', async () => {
    const before = await summary();
    const { status, json } = await call('PATCH', `${BASE}/JS12845`, { status: 'inactive' });
    const after = await summary();

    expect(status).toBe(200);
    expect(json.data.status).toBe('inactive');
    expect(after.inactive).toBe(before.inactive + 1);
    expect(after.active).toBe(before.active - 1);
    expect(after.total).toBe(before.total);
    expect(getHireJobSeekerAudit('JS12845')[0]).toMatchObject({
      action: 'STATUS_UPDATED',
      actor_name: 'Dev Admin',
      changes: [{ field: 'status', from: 'Active', to: 'Inactive' }]
    });
    await call('PATCH', `${BASE}/JS12845`, { status: 'active' });
    expect((await summary()).inactive).toBe(before.inactive);
  });

  it('keeps the derived history in step with the status the job seeker was seeded with', async () => {
    expect(getHireJobSeekerAudit('JS12846').map((e) => e.action)).toEqual([
      'PROFILE_ACTIVATED',
      'PROFILE_CREATED'
    ]);
    expect(getHireJobSeekerAudit('JS12846').at(-1)).toMatchObject({
      actor_name: 'Ramesh Kumar',
      occurred_at: '2024-06-22T10:24:00+05:30'
    });
    expect(getHireJobSeekerAudit('JS12843').map((e) => e.action)).toEqual([
      'STATUS_UPDATED',
      'PROFILE_ACTIVATED',
      'PROFILE_CREATED'
    ]);
    await call('PATCH', `${BASE}/JS12843`, { status: 'active' });
    expect(getHireJobSeekerAudit('JS12843').map((e) => e.action)).toEqual([
      'STATUS_UPDATED',
      'STATUS_UPDATED',
      'PROFILE_ACTIVATED',
      'PROFILE_CREATED'
    ]);
    expect(getHireJobSeekerAudit('JS00000')).toEqual([]);
  });

  it('edits details, records them with readable labels, and rejects bad values', async () => {
    const edited = await call('PATCH', `${BASE}/JS12844`, { city: 'Chennai', experience_years: 4 });

    expect(edited.json.data).toMatchObject({
      city: 'Chennai',
      experience_years: 4,
      status: 'active'
    });
    expect(getHireJobSeekerAudit('JS12844')[0]).toMatchObject({
      action: 'DETAILS_UPDATED',
      changes: [
        { field: 'City', from: 'Secunderabad', to: 'Chennai' },
        { field: 'Experience (years)', from: '2', to: '4' }
      ]
    });
    const bad = await call('PATCH', `${BASE}/JS12844`, { phone: '12345', email: 'nope' });

    expect(bad.status).toBe(422);
    expect(bad.json.error.code).toBe('VALIDATION_FAILED');
    expect(Object.keys(bad.json.error.fields)).toEqual(['email', 'phone']);
    expect((await call('PATCH', `${BASE}/JS12844`, { status: 'archived' })).status).toBe(422);
    expect((await call('PATCH', `${BASE}/JS12844`, {})).status).toBe(422);
    expect((await call('GET', `${BASE}/JS12844`)).json.data.phone).toBe('9876543212');
  });

  it('creates a job seeker: next id, active, joined now, in the summary and the audit', async () => {
    const before = await summary();
    const { status, json } = await call('POST', BASE, validBody);

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      ...validBody,
      job_seeker_id: 'JS12847',
      status: 'active',
      applications_count: 0,
      joined_at: '2024-06-24T18:00:00+05:30'
    });
    expect((await summary()).total).toBe(before.total + 1);
    expect((await call('GET', BASE)).json.data[0].job_seeker_id).toBe('JS12847');
    expect(getHireJobSeekerAudit('JS12847').map((e) => e.action)).toEqual([
      'PROFILE_ACTIVATED',
      'PROFILE_CREATED'
    ]);
    expect((await call('POST', BASE, validBody)).json.data.job_seeker_id).toBe('JS12848');
  });

  it('answers 422 with a fields map for an invalid create', async () => {
    const cases: [Record<string, unknown>, string][] = [
      [{ ...validBody, name: '  ' }, 'name'],
      [{ ...validBody, email: 'meera.example.com' }, 'email'],
      [{ ...validBody, phone: '5123456789' }, 'phone'],
      [{ ...validBody, phone: '912345678' }, 'phone'],
      [{ ...validBody, experience_years: 51 }, 'experience_years'],
      [{ ...validBody, experience_years: 2.5 }, 'experience_years'],
      [{ ...validBody, experience_years: -1 }, 'experience_years'],
      [{}, 'name']
    ];
    for (const [body, field] of cases) {
      const { status, json } = await call('POST', BASE, body);

      expect(status).toBe(422);
      expect(json.error.code).toBe('VALIDATION_FAILED');
      expect(json.error.fields[field]).toEqual(expect.any(String));
    }
    expect((await call('POST', BASE, { ...validBody, experience_years: 0 })).status).toBe(200);
    expect((await call('POST', BASE, { ...validBody, experience_years: 50 })).status).toBe(200);
  });

  it('bulk sets the status, counts the job seekers it found and records each one', async () => {
    const ids = ['JS05000', 'JS05001', 'JS00000'];
    const found = await Promise.all(ids.slice(0, 2).map((id) => call('GET', `${BASE}/${id}`)));
    const active = found.filter((r) => r.json.data.status === 'active').length;
    const before = await summary();
    const body = { action: 'set_status', status: 'inactive', job_seeker_ids: ids };

    expect((await call('POST', `${BASE}/bulk`, body)).json.data).toEqual({ affected: 2 });
    expect((await summary()).inactive).toBe(before.inactive + active);
    expect(getHireJobSeekerAudit('JS05001')[0]?.action).toBe('BULK_STATUS_UPDATED');
  });

  it('answers 422 for a bulk request with an unknown status or action', async () => {
    const ids = ['JS05000'];

    for (const body of [
      { action: 'set_status', status: 'nope', job_seeker_ids: ids },
      { action: 'delete', job_seeker_ids: ids }
    ]) {
      expect((await call('POST', `${BASE}/bulk`, body)).status).toBe(422);
    }
  });

  it('leaves exports and unknown routes to the caller', async () => {
    expect((await call('POST', `${BASE}/exports`, {})).handled).toBe(false);
    expect((await call('GET', `${BASE}/export-result/abc`)).handled).toBe(false);
    expect((await call('GET', '/hire/admin/jobs')).handled).toBe(false);
    expect((await call('DELETE', `${BASE}/JS12846`)).handled).toBe(false);
  });
});
