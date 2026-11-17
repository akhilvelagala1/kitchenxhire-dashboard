import { describe, expect, it } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleAdminRecruitersMock } from './mockAdminRecruitersApi.ts';
import { getHireRecruiterAudit } from './recruiterAudit.ts';

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
  const handled = await handleAdminRecruitersMock(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
    url.pathname,
    method,
    url
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

const BASE = '/hire/admin/recruiters';
const summary = async () => (await call('GET', `${BASE}/summary`)).json.data;
const NEW_RECRUITER = {
  business_name: 'Saffron Table',
  business_type: 'Restaurant',
  area: 'Jubilee Hills',
  city: 'Hyderabad',
  owner_name: 'Kiran Rao',
  phone: '9123456780',
  email: 'kiran@saffrontable.example.com'
};

describe('admin recruiters mock API', () => {
  it('lists with the success envelope and the paging meta', async () => {
    const { status, json } = await call(
      'GET',
      `${BASE}?page=63&page_size=5&sort=recruiter_id&order=asc`
    );

    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.meta).toEqual({ page: 63, page_size: 5, total: 312 });
    expect(json.data.map((r: { recruiter_id: string }) => r.recruiter_id)).toEqual([
      'REC10891',
      'REC10892'
    ]);
  });

  it('applies the list filters from the query string', async () => {
    const { json } = await call(
      'GET',
      `${BASE}?tab=inactive&search=tasty%20point&sort=recruiter_id&order=asc`
    );

    expect(json.data.map((r: { recruiter_id: string }) => r.recruiter_id)).toEqual(['REC10889']);
    expect(
      (await call('GET', `${BASE}?joined=7d&page_size=20`)).json.meta.total
    ).toBeGreaterThanOrEqual(4);
  });

  it('serves the summary, the trend and the locations', async () => {
    expect((await summary()).total).toBe(312);
    expect((await call('GET', `${BASE}/trend?range=7d`)).json.data).toHaveLength(7);
    expect((await call('GET', `${BASE}/trend?range=90d`)).json.data.at(-1)).toEqual({
      date: '2024-06-24',
      count: 312
    });
    const locations = (await call('GET', `${BASE}/locations`)).json.data;
    expect(locations).toContainEqual({ value: 'Hyderabad', label: 'Hyderabad' });
  });

  it('returns one recruiter, or 404 with the NOT_FOUND envelope', async () => {
    expect((await call('GET', `${BASE}/REC10892`)).json.data.business_name).toBe(
      'Spice Bowl Restaurant'
    );
    const missing = await call('GET', `${BASE}/REC00001`);

    expect(missing.status).toBe(404);
    expect(missing.json).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Recruiter not found.' }
    });
    expect((await call('PATCH', `${BASE}/REC00001`, { status: 'active' })).status).toBe(404);
  });

  it('moves the summary by exactly one and writes an audit event on a status change', async () => {
    const before = await summary();
    const { status, json } = await call('PATCH', `${BASE}/REC10887`, { status: 'inactive' });
    const after = await summary();

    expect(status).toBe(200);
    expect(json.data.status).toBe('inactive');
    expect(after.inactive).toBe(before.inactive + 1);
    expect(after.active).toBe(before.active - 1);
    expect(after.total).toBe(before.total);
    expect(getHireRecruiterAudit('REC10887')[0]).toMatchObject({
      action: 'STATUS_UPDATED',
      actor_name: 'Dev Admin',
      changes: [{ field: 'Status', from: 'Active', to: 'Inactive' }]
    });
    await call('PATCH', `${BASE}/REC10887`, { status: 'active' });
    expect((await summary()).inactive).toBe(before.inactive);
  });

  it('keeps the derived history in step with the status the recruiter was seeded with', async () => {
    expect(getHireRecruiterAudit('REC10888').map((e) => e.action)).toEqual([
      'RECRUITER_REGISTERED'
    ]);
    const inactive = getHireRecruiterAudit('REC10889');
    expect(inactive.map((e) => e.action)).toEqual([
      'STATUS_UPDATED',
      'APPROVED',
      'RECRUITER_REGISTERED'
    ]);
    expect(inactive.at(-1)).toMatchObject({
      actor_name: 'Suresh Goud',
      occurred_at: '2024-06-18T10:00:00+05:30',
      changes: [{ field: 'Status', from: null, to: 'Pending' }]
    });
    expect(getHireRecruiterAudit('REC10892').map((e) => e.action)).toEqual([
      'APPROVED',
      'RECRUITER_REGISTERED'
    ]);
    expect(getHireRecruiterAudit('REC00001')).toEqual([]);
  });

  it('edits details, records readable labels, and leaves the status alone', async () => {
    const { status, json } = await call('PATCH', `${BASE}/REC10891`, {
      business_name: 'Urban Bites Co',
      city: 'Secunderabad',
      owner_name: 'Priya Nair'
    });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      business_name: 'Urban Bites Co',
      city: 'Secunderabad',
      status: 'active'
    });
    expect(getHireRecruiterAudit('REC10891')[0]).toMatchObject({
      action: 'DETAILS_UPDATED',
      changes: [
        { field: 'Business Name', from: 'Urban Bites', to: 'Urban Bites Co' },
        { field: 'City', from: 'Hyderabad', to: 'Secunderabad' }
      ]
    });
  });

  it('records details and status changes in one patch as two events', async () => {
    await call('PATCH', `${BASE}/REC10890`, { area: 'KPHB', status: 'pending' });
    const [latest, earlier] = getHireRecruiterAudit('REC10890');

    expect(latest).toMatchObject({ action: 'STATUS_UPDATED' });
    expect(earlier).toMatchObject({
      action: 'DETAILS_UPDATED',
      changes: [{ field: 'Area', from: 'Kukatpally', to: 'KPHB' }]
    });
  });

  it('answers 422 VALIDATION_FAILED for a bad patch and changes nothing', async () => {
    const bodies = [
      { status: 'archived' },
      {},
      { business_name: '  ' },
      { business_type: 'Bakery' },
      { email: 'not-an-email' },
      { phone: '5123456789' }
    ];
    for (const body of bodies) {
      const { status, json } = await call('PATCH', `${BASE}/REC10892`, body);

      expect(status).toBe(422);
      expect(json.error.code).toBe('VALIDATION_FAILED');
    }
    expect((await call('GET', `${BASE}/REC10892`)).json.data).toMatchObject({
      business_name: 'Spice Bowl Restaurant',
      status: 'active'
    });
  });

  it('creates a recruiter: next id, under review, joined at the mock clock, and an audit event', async () => {
    const before = await summary();
    const { status, json } = await call('POST', BASE, {
      ...NEW_RECRUITER,
      business_name: ' Saffron Table '
    });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      recruiter_id: 'REC10893',
      business_name: 'Saffron Table',
      status: 'pending',
      verification: 'pending',
      joined_at: '2024-06-24T18:00:00+05:30',
      outlets: 0
    });
    const after = await summary();
    expect(after.total).toBe(before.total + 1);
    expect(after.active).toBe(before.active);
    expect((await call('GET', `${BASE}/REC10893`)).json.data.email).toBe(NEW_RECRUITER.email);
    expect(getHireRecruiterAudit('REC10893')).toMatchObject([
      { action: 'RECRUITER_CREATED', actor_name: 'Dev Admin' }
    ]);
    expect((await call('POST', BASE, NEW_RECRUITER)).json.data.recruiter_id).toBe('REC10894');
  });

  it('answers 422 with a fields map for a create that breaks the rules', async () => {
    const { status, json } = await call('POST', BASE, {
      business_type: 'Bakery',
      phone: '12345',
      email: 'nope'
    });

    expect(status).toBe(422);
    expect(Object.keys(json.error.fields).sort()).toEqual([
      'business_name',
      'business_type',
      'email',
      'phone'
    ]);
    const total = (await summary()).total;
    expect(
      (await call('POST', BASE, { ...NEW_RECRUITER, phone: '6123456789', email: 'a@b.co' })).status
    ).toBe(200);
    expect((await summary()).total).toBe(total + 1);
  });

  it('bulk sets the status, counts the recruiters it found and records each one', async () => {
    const ids = ['REC10892', 'REC10891', 'REC00001'];
    const before = await summary();
    const body = { action: 'set_status', status: 'inactive', recruiter_ids: ids };

    expect((await call('POST', `${BASE}/bulk`, body)).json.data).toEqual({ affected: 2 });
    expect((await summary()).total).toBe(before.total);
    expect((await summary()).active).toBe(before.active - 2);
    expect(getHireRecruiterAudit('REC10891')[0]?.action).toBe('BULK_STATUS_UPDATED');
    await call('POST', `${BASE}/bulk`, {
      action: 'set_status',
      status: 'active',
      recruiter_ids: ['REC10892', 'REC10891']
    });
  });

  it('answers 422 for a bulk request with an unknown status or action', async () => {
    const ids = ['REC10700'];
    const unknownStatus = { action: 'set_status', status: 'nope', recruiter_ids: ids };

    expect((await call('POST', `${BASE}/bulk`, unknownStatus)).status).toBe(422);
    expect(
      (await call('POST', `${BASE}/bulk`, { action: 'delete', recruiter_ids: ids })).status
    ).toBe(422);
  });

  it('leaves exports and unknown routes to the caller', async () => {
    expect((await call('POST', `${BASE}/exports`, {})).handled).toBe(false);
    expect((await call('GET', `${BASE}/export-result/abc`)).handled).toBe(false);
    expect((await call('GET', '/hire/admin/jobs')).handled).toBe(false);
    expect((await call('DELETE', `${BASE}/REC10892`)).handled).toBe(false);
  });
});
