import { describe, expect, it } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getCategoriesRolesAudit } from './categoriesAudit.ts';
import { handleAdminCategoriesMock } from './mockAdminCategoriesApi.ts';

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
  const handled = await handleAdminCategoriesMock(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
    url.pathname,
    method,
    url
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

const CATS = '/hire/admin/categories';
const ROLES = '/hire/admin/roles';
const getAudit = async (type: 'hire_category' | 'hire_role', id: string) =>
  getCategoriesRolesAudit(type, id);

const NEW_CATEGORY = {
  name: 'Juice Bar',
  code: 'JUICE_BAR',
  business_type: 'Restaurant',
  icon: 'store',
  description: 'Fresh juice counters.'
};

describe('admin categories mock API', () => {
  it('lists five rows with the paging meta, and applies search, status and page', async () => {
    const first = await call('GET', CATS);
    expect(first.status).toBe(200);
    expect(first.json.success).toBe(true);
    expect(first.json.meta).toEqual({ page: 1, page_size: 5, total: 12 });
    expect(first.json.data.map((c: { name: string }) => c.name)[0]).toBe('Restaurant');

    expect((await call('GET', `${CATS}?page=3`)).json.data).toHaveLength(2);
    expect((await call('GET', `${CATS}?q=CLOUD`)).json.data).toHaveLength(1);
    expect((await call('GET', `${CATS}?status=archived`)).json.meta.total).toBe(1);
  });

  it('answers the summary with the counts and the growth of the picture', async () => {
    const { json } = await call('GET', '/hire/admin/categories-roles/summary');

    expect(json.data).toEqual({
      categories: 12,
      roles: 8,
      growth_pct: { categories: 20, roles: 14 }
    });
  });

  it('creates an active category with no businesses, the next id, and an audit event', async () => {
    const { status, json } = await call('POST', CATS, NEW_CATEGORY);

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      category_id: 'CAT013',
      name: 'Juice Bar',
      businesses: 0,
      outlets: 0,
      status: 'active'
    });
    expect((await call('GET', '/hire/admin/categories-roles/summary')).json.data.categories).toBe(
      13
    );
    expect((await getAudit('hire_category', 'CAT013')).map((e) => e.action)).toEqual(['CREATED']);
  });

  it('rejects a bad create with 422 and every field named, and a duplicate code with 409', async () => {
    const bad = await call('POST', CATS, {
      name: 'J',
      code: 'lower',
      business_type: 'Spa',
      icon: 'x'
    });
    expect(bad.status).toBe(422);
    expect(bad.json.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(bad.json.error.fields).sort()).toEqual([
      'business_type',
      'code',
      'icon',
      'name'
    ]);

    const dup = await call('POST', CATS, { ...NEW_CATEGORY, name: 'Other', code: 'JUICE_BAR' });
    expect(dup.status).toBe(409);
    expect(dup.json.error.code).toBe('CONFLICT');
    expect((await call('GET', `${CATS}?q=JUICE`)).json.meta.total).toBe(1);
  });

  it('edits a category and records one line per changed field, then a separate status event', async () => {
    const { json } = await call('PATCH', `${CATS}/CAT013`, {
      name: 'Juice Corner',
      description: 'Fresh juice counters.',
      status: 'inactive'
    });
    expect(json.data).toMatchObject({ name: 'Juice Corner', status: 'inactive' });

    const events = await getAudit('hire_category', 'CAT013');
    expect(events.map((e) => e.action)).toEqual(['STATUS_UPDATED', 'UPDATED', 'CREATED']);
    expect(events[1]!.changes).toEqual([{ field: 'Name', from: 'Juice Bar', to: 'Juice Corner' }]);
    expect(events[0]!.changes).toEqual([{ field: 'Status', from: 'Active', to: 'Inactive' }]);
  });

  it('refuses a patch that reuses another code (409), is empty (422) or is for nothing (404)', async () => {
    expect((await call('PATCH', `${CATS}/CAT013`, { code: 'RESTAURANT' })).status).toBe(409);
    expect((await call('PATCH', `${CATS}/CAT013`, {})).status).toBe(422);
    expect((await call('PATCH', `${CATS}/CAT013`, { status: 'deleted' })).status).toBe(422);
    expect((await call('PATCH', `${CATS}/CAT999`, { name: 'Nope' })).status).toBe(404);
    expect((await call('GET', `${CATS}/CAT999`)).status).toBe(404);
    expect((await call('GET', `${CATS}/CAT001`)).json.data.name).toBe('Restaurant');
  });

  it('bulk-sets the status of the ids it finds and audits each change once', async () => {
    const { json } = await call('POST', `${CATS}/bulk`, {
      action: 'set_status',
      status: 'archived',
      category_ids: ['CAT006', 'CAT007', 'CAT999']
    });

    expect(json.data).toEqual({ affected: 2 });
    expect((await call('GET', `${CATS}?status=archived`)).json.meta.total).toBe(3);
    const events = await getAudit('hire_category', 'CAT006');
    expect(events[0]!.changes).toEqual([{ field: 'Status', from: 'Active', to: 'Archived' }]);
    expect((await call('POST', `${CATS}/bulk`, { action: 'set_status', status: 'x' })).status).toBe(
      422
    );
  });

  it('leaves the export routes to the caller, and unknown routes unhandled', async () => {
    expect((await call('POST', `${CATS}/exports`, {})).handled).toBe(false);
    expect((await call('GET', `${CATS}/export-result/abc`)).handled).toBe(false);
    expect((await call('GET', '/hire/admin/other')).handled).toBe(false);
    expect((await call('DELETE', `${CATS}/CAT001`)).handled).toBe(false);
  });
});

describe('admin roles mock API', () => {
  const NO_ACCESS = {};

  it('lists every role with the meta', async () => {
    const { json } = await call('GET', ROLES);

    expect(json.meta).toEqual({ page: 1, page_size: 100, total: 8 });
    expect(json.data[0]).toMatchObject({
      role_id: 'ROLE001',
      name: 'Super Admin',
      protected: true
    });
    expect((await call('GET', `${ROLES}?page=2&page_size=5`)).json.data).toHaveLength(3);
    expect((await call('GET', `${ROLES}/ROLE008`)).json.data.name).toBe('Viewer');
  });

  it('creates an active role with no users and no access, and refuses a duplicate name in any case', async () => {
    const { json } = await call('POST', ROLES, { name: 'Auditor', description: 'Reads logs.' });

    expect(json.data).toMatchObject({
      role_id: 'ROLE009',
      users: 0,
      status: 'active',
      protected: false
    });
    expect(Object.values(json.data.permissions).flat()).toEqual([]);
    expect((await call('POST', ROLES, { name: 'AUDITOR' })).status).toBe(409);
    expect((await call('POST', ROLES, { name: 'x' })).status).toBe(422);
  });

  it('edits and switches a role off, with audit lines', async () => {
    await call('PATCH', `${ROLES}/ROLE009`, { name: 'Log Auditor' });
    const { json } = await call('PATCH', `${ROLES}/ROLE009`, { status: 'inactive' });

    expect(json.data.status).toBe('inactive');
    expect((await getAudit('hire_role', 'ROLE009')).map((e) => e.action)).toEqual([
      'STATUS_UPDATED',
      'UPDATED',
      'CREATED'
    ]);
    expect((await call('PATCH', `${ROLES}/ROLE009`, { name: 'Viewer' })).status).toBe(409);
    expect((await call('PATCH', `${ROLES}/ROLE009`, { status: 'archived' })).status).toBe(422);
    expect((await call('PATCH', `${ROLES}/ROLE999`, { name: 'Nope' })).status).toBe(404);
  });

  it('replaces the matrix and records one change line for each module that changed', async () => {
    const before = (await call('GET', `${ROLES}/ROLE006`)).json.data.permissions;
    expect(before.jobs).toEqual(['view', 'create', 'edit']);

    const { json } = await call('PATCH', `${ROLES}/ROLE006/permissions`, {
      permissions: { jobs: ['edit', 'view', 'view'], reports: ['view', 'export'] }
    });

    expect(json.data.permissions.jobs).toEqual(['view', 'edit']);
    expect(json.data.permissions.applications).toEqual([]);
    const [event] = await getAudit('hire_role', 'ROLE006');
    expect(event!.action).toBe('PERMISSIONS_UPDATED');
    expect(event!.changes).toEqual([
      { field: 'Jobs', from: 'View, Create, Edit', to: 'View, Edit' },
      { field: 'Applications', from: 'View, Create, Edit', to: 'None' },
      { field: 'Reports & Analytics', from: 'None', to: 'View, Export' }
    ]);
  });

  it('records no event when the matrix did not change, and rejects bad matrices', async () => {
    const current = (await call('GET', `${ROLES}/ROLE006`)).json.data.permissions;
    const count = (await getAudit('hire_role', 'ROLE006')).length;

    await call('PATCH', `${ROLES}/ROLE006/permissions`, { permissions: current });
    expect(await getAudit('hire_role', 'ROLE006')).toHaveLength(count);

    const patch = (permissions: unknown) =>
      call('PATCH', `${ROLES}/ROLE006/permissions`, { permissions });
    expect((await patch({ vault: ['view'] })).status).toBe(422);
    expect((await patch({ jobs: ['fly'] })).status).toBe(422);
    expect((await patch({ jobs: 'view' })).status).toBe(422);
    expect((await patch(NO_ACCESS)).status).toBe(200);
    expect((await call('PATCH', `${ROLES}/ROLE999/permissions`, { permissions: {} })).status).toBe(
      404
    );
  });

  it('keeps Super Admin and Admin safe with 403 on status, permissions and delete', async () => {
    for (const id of ['ROLE001', 'ROLE002']) {
      expect((await call('PATCH', `${ROLES}/${id}`, { status: 'inactive' })).status).toBe(403);
      expect((await call('PATCH', `${ROLES}/${id}/permissions`, { permissions: {} })).status).toBe(
        403
      );
      const del = await call('DELETE', `${ROLES}/${id}`);
      expect(del.status).toBe(403);
      expect(del.json.error.code).toBe('FORBIDDEN');
    }
    expect((await call('GET', `${ROLES}/ROLE001`)).json.data.status).toBe('active');
    expect((await call('PATCH', `${ROLES}/ROLE001`, { status: 'active' })).status).toBe(200);
  });

  it('deletes a role nobody has, and refuses one that still has users with 409', async () => {
    const busy = await call('DELETE', `${ROLES}/ROLE003`);
    expect(busy.status).toBe(409);
    expect(busy.json.error.code).toBe('CONFLICT');

    expect((await call('DELETE', `${ROLES}/ROLE009`)).status).toBe(204);
    expect((await call('GET', `${ROLES}/ROLE009`)).status).toBe(404);
    expect((await call('DELETE', `${ROLES}/ROLE009`)).status).toBe(404);
    expect((await call('GET', '/hire/admin/categories-roles/summary')).json.data.roles).toBe(8);
    expect((await getAudit('hire_role', 'all'))[0]!.action).toContain('DELETED_ROLE_LOG AUDITOR');
  });
});
