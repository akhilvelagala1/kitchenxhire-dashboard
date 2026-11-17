import { describe, expect, it } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleAdminBusinessesMock } from './mockAdminBusinessesApi.ts';

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
  const handled = await handleAdminBusinessesMock(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
    url.pathname,
    method,
    url
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

const BASE = '/hire/admin/businesses';
const summary = async () => (await call('GET', `${BASE}/summary`)).json.data;
const idsOf = (json: { data: { business_id: string }[] }) => json.data.map((r) => r.business_id);
const NEW_BUSINESS = {
  business_name: 'Saffron Table',
  business_type: 'Restaurant',
  area: 'Jubilee Hills',
  city: 'Hyderabad',
  owner_name: 'Kiran Rao',
  phone: '9123456780',
  email: 'kiran@saffrontable.example.com'
};

describe('admin businesses mock API', () => {
  it('lists the first page with the success envelope and the paging meta', async () => {
    const { status, json } = await call('GET', BASE);

    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.meta).toEqual({ page: 1, page_size: 10, total: 642 });
    expect(idsOf(json)).toEqual([
      'BUS0642',
      'BUS0641',
      'BUS0640',
      'BUS0639',
      'BUS0638',
      'BUS0637',
      'BUS0636',
      'BUS0635',
      'BUS0634',
      'BUS0633'
    ]);
    expect((await call('GET', `${BASE}?page=65&page_size=10`)).json.data).toHaveLength(2);
  });

  it('applies the list filters from the query string', async () => {
    const { json } = await call(
      'GET',
      `${BASE}?tab=inactive&search=freshstock&sort=business_id&order=asc`
    );

    expect(idsOf(json)).toEqual(['BUS0639']);
    expect((await call('GET', `${BASE}?business_type=Warehouse`)).json.meta.total).toBe(24);
    expect((await call('GET', `${BASE}?status=under_review&page_size=100`)).json.meta.total).toBe(
      12
    );
    expect((await call('GET', `${BASE}?status=suspended&page_size=100`)).json.meta.total).toBe(8);
    expect(
      (await call('GET', `${BASE}?verification=verified&page_size=100`)).json.meta.total
    ).toBeGreaterThan(0);
    expect((await call('GET', `${BASE}?joined=7d&page_size=20`)).json.meta.total).toBe(4);
    expect((await call('GET', `${BASE}?page_size=1000`)).json.meta.page_size).toBe(100);
  });

  it('serves the summary, the trend and the locations', async () => {
    const data = await summary();

    expect(data).toMatchObject({
      total: 642,
      active: 586,
      inactive: 36,
      outlets: 1428,
      active_outlets: 1312,
      warehouses: 24
    });
    expect(data.growth_pct).toEqual({
      total: 14,
      active: 12,
      inactive: -5,
      outlets: 18,
      active_outlets: 16,
      warehouses: 9
    });
    expect((await call('GET', `${BASE}/trend?range=7d`)).json.data).toHaveLength(7);
    expect((await call('GET', `${BASE}/trend`)).json.data.at(-1)).toEqual({
      date: '2024-06-24',
      count: 642
    });
    expect((await call('GET', `${BASE}/trend?range=90d`)).json.data.at(-1)).toEqual({
      date: '2024-06-24',
      count: 642
    });
    const locations = (await call('GET', `${BASE}/locations`)).json.data;
    expect(locations).toContainEqual({ value: 'Hyderabad', label: 'Hyderabad' });
  });

  it('returns one business, or 404 with the NOT_FOUND envelope', async () => {
    expect((await call('GET', `${BASE}/BUS0642`)).json.data.business_name).toBe(
      'Spice Bowl Restaurant'
    );
    const missing = await call('GET', `${BASE}/BUS9999`);

    expect(missing.status).toBe(404);
    expect(missing.json).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Business not found.' }
    });
    expect((await call('PATCH', `${BASE}/BUS9999`, { status: 'active' })).status).toBe(404);
  });

  it('moves the summary by exactly one on a status change, and back again', async () => {
    const before = await summary();
    const { status, json } = await call('PATCH', `${BASE}/BUS0640`, { status: 'inactive' });
    const after = await summary();

    expect(status).toBe(200);
    expect(json.data.status).toBe('inactive');
    expect(after.inactive).toBe(before.inactive + 1);
    expect(after.active).toBe(before.active - 1);
    expect(after.active_outlets).toBe(before.active_outlets - 5);
    expect(after.total).toBe(before.total);
    await call('PATCH', `${BASE}/BUS0640`, { status: 'active' });
    expect(await summary()).toMatchObject({
      inactive: before.inactive,
      active_outlets: before.active_outlets
    });
  });

  it('edits details and leaves the status alone', async () => {
    const { status, json } = await call('PATCH', `${BASE}/BUS0641`, {
      business_name: ' Urban Bites Co ',
      city: 'Secunderabad',
      owner_name: 'Priya Nair'
    });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      business_name: 'Urban Bites Co',
      city: 'Secunderabad',
      owner_name: 'Priya Nair',
      status: 'active',
      outlets: 8
    });
  });

  it('applies details and a status in one patch', async () => {
    const { json } = await call('PATCH', `${BASE}/BUS0638`, {
      area: 'Nanakramguda',
      status: 'inactive'
    });

    expect(json.data).toMatchObject({ area: 'Nanakramguda', status: 'inactive' });
    await call('PATCH', `${BASE}/BUS0638`, { status: 'active' });
  });

  it('answers 422 VALIDATION_FAILED for a bad patch and changes nothing', async () => {
    const bodies = [
      { status: 'archived' },
      { status: 'pending' },
      {},
      { business_name: '  ' },
      { business_type: 'Bakery' },
      { email: 'not-an-email' },
      { phone: '5123456789' },
      { area: '' }
    ];
    for (const body of bodies) {
      const { status, json } = await call('PATCH', `${BASE}/BUS0642`, body);

      expect(status).toBe(422);
      expect(json.error.code).toBe('VALIDATION_FAILED');
    }
    expect((await call('GET', `${BASE}/BUS0642`)).json.data).toMatchObject({
      business_name: 'Spice Bowl Restaurant',
      status: 'active'
    });
  });

  it('creates a business: next id, under review, pending verification, no outlets', async () => {
    const before = await summary();
    const { status, json } = await call('POST', BASE, {
      ...NEW_BUSINESS,
      business_name: ' Saffron Table '
    });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      business_id: 'BUS0643',
      business_name: 'Saffron Table',
      status: 'under_review',
      verification: 'pending',
      outlets: 0,
      joined_at: '2024-06-24T18:00:00+05:30'
    });
    const after = await summary();
    expect(after.total).toBe(before.total + 1);
    expect(after.active).toBe(before.active);
    expect(after.inactive).toBe(before.inactive);
    expect((await call('GET', `${BASE}/BUS0643`)).json.data.email).toBe(NEW_BUSINESS.email);
    expect((await call('POST', BASE, NEW_BUSINESS)).json.data.business_id).toBe('BUS0644');
    expect(idsOf((await call('GET', BASE)).json)[0]).toBe('BUS0644');
  });

  it('answers 422 with a fields map for a create that breaks the rules', async () => {
    const { status, json } = await call('POST', BASE, {
      business_type: 'Bakery',
      phone: '12345',
      email: 'nope'
    });

    expect(status).toBe(422);
    expect(Object.keys(json.error.fields).sort()).toEqual([
      'area',
      'business_name',
      'business_type',
      'city',
      'email',
      'owner_name',
      'phone'
    ]);
    const total = (await summary()).total;
    expect(
      (await call('POST', BASE, { ...NEW_BUSINESS, phone: '6123456789', email: 'a@b.co' })).status
    ).toBe(200);
    expect((await summary()).total).toBe(total + 1);
  });

  it('bulk sets the status and counts the businesses it found', async () => {
    const ids = ['BUS0002', 'BUS0001', 'BUS9999'];
    const before = await summary();
    const body = { action: 'set_status', status: 'inactive', business_ids: ids };
    const wasActive = (
      await Promise.all(ids.slice(0, 2).map((id) => call('GET', `${BASE}/${id}`)))
    ).filter((r) => r.json.data.status === 'active').length;

    expect((await call('POST', `${BASE}/bulk`, body)).json.data).toEqual({ affected: 2 });
    expect((await summary()).total).toBe(before.total);
    expect((await summary()).active).toBe(before.active - wasActive);
  });

  it('answers 422 for a bulk request with an unknown status or action', async () => {
    const ids = ['BUS0001'];

    expect(
      (
        await call('POST', `${BASE}/bulk`, {
          action: 'set_status',
          status: 'nope',
          business_ids: ids
        })
      ).status
    ).toBe(422);
    expect(
      (
        await call('POST', `${BASE}/bulk`, {
          action: 'set_status',
          status: 'pending',
          business_ids: ids
        })
      ).status
    ).toBe(422);
    expect(
      (await call('POST', `${BASE}/bulk`, { action: 'delete', business_ids: ids })).status
    ).toBe(422);
  });

  it('leaves exports and unknown routes to the caller', async () => {
    expect((await call('POST', `${BASE}/exports`, {})).handled).toBe(false);
    expect((await call('GET', `${BASE}/export-result/abc`)).handled).toBe(false);
    expect((await call('GET', '/hire/admin/jobs')).handled).toBe(false);
    expect((await call('GET', '/hire/admin/businessesx')).handled).toBe(false);
    expect((await call('DELETE', `${BASE}/BUS0642`)).handled).toBe(false);
  });
});
