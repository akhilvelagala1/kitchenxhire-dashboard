import { describe, expect, it } from 'vitest';
import { listCategories } from './categoriesAnalytics.ts';
import { getCategoriesRolesAudit } from './categoriesAudit.ts';
import { categoriesCsv } from './categoriesExport.ts';
import {
  CATEGORY_BUSINESS_TYPES,
  CATEGORY_ICONS,
  PERMISSION_MODULES,
  getCategoriesStore,
  getRolesStore
} from './categoriesMockData.ts';

describe('categories mock data', () => {
  it('seeds the 12 categories of the picture, the first five exactly', () => {
    const rows = getCategoriesStore();

    expect(rows).toHaveLength(12);
    expect(
      rows.slice(0, 5).map((c) => [c.name, c.code, c.businesses, c.outlets, c.status])
    ).toEqual([
      ['Restaurant', 'RESTAURANT', 248, 1024, 'active'],
      ['Cloud Kitchen', 'CLOUD_KITCHEN', 182, 642, 'active'],
      ['Food Court', 'FOOD_COURT', 56, 210, 'active'],
      ['Warehouse', 'WAREHOUSE', 24, 24, 'active'],
      ['Central Kitchen', 'CENTRAL_KITCHEN', 18, 72, 'active']
    ]);
    expect(rows.map((c) => c.category_id)[11]).toBe('CAT012');
    expect(rows.filter((c) => c.status === 'inactive')).toHaveLength(1);
    expect(rows.filter((c) => c.status === 'archived')).toHaveLength(1);
    expect(new Set(rows.map((c) => c.code)).size).toBe(12);
    for (const c of rows) {
      expect(CATEGORY_BUSINESS_TYPES).toContain(c.business_type);
      expect(CATEGORY_ICONS).toContain(c.icon);
      expect(c.code).toMatch(/^[A-Z][A-Z0-9_]{1,39}$/);
    }
  });

  it('seeds the 8 roles with protected Super Admin and Admin holding every permission', () => {
    const roles = getRolesStore();

    expect(roles.map((r) => [r.name, r.users])).toEqual([
      ['Super Admin', 3],
      ['Admin', 12],
      ['Business Owner', 586],
      ['Outlet Manager', 1312],
      ['HR Manager', 28],
      ['Recruiter', 46],
      ['Hiring Manager', 34],
      ['Viewer', 102]
    ]);
    expect(roles.filter((r) => r.protected).map((r) => r.name)).toEqual(['Super Admin', 'Admin']);
    expect(roles[0]!.permissions.settings).toEqual(['view', 'create', 'edit', 'delete', 'export']);
    expect(Object.keys(roles[7]!.permissions)).toEqual(PERMISSION_MODULES);
    expect(roles[7]!.permissions.settings).toEqual([]);
    expect(roles[7]!.permissions.jobs).toEqual(['view']);
    expect(roles[2]!.permissions.jobs).toEqual(['view', 'edit']);
    expect(roles[4]!.permissions.recruiters).toEqual(['view', 'create', 'edit']);
    expect(roles[5]!.permissions.recruiters).toEqual([]);
  });
});

describe('categories list', () => {
  it('pages five at a time in the order of the picture', () => {
    const first = listCategories(getCategoriesStore(), {});
    const last = listCategories(getCategoriesStore(), { page: 3 });

    expect(first.meta).toEqual({ page: 1, page_size: 5, total: 12 });
    expect(first.items.map((c) => c.name)).toEqual([
      'Restaurant',
      'Cloud Kitchen',
      'Food Court',
      'Warehouse',
      'Central Kitchen'
    ]);
    expect(last.items.map((c) => c.category_id)).toEqual(['CAT011', 'CAT012']);
  });

  it('searches name or code without caring about case, and filters by status', () => {
    const rows = getCategoriesStore();

    expect(listCategories(rows, { q: 'kitchen' }).items.map((c) => c.code)).toEqual([
      'CLOUD_KITCHEN',
      'CENTRAL_KITCHEN',
      'DARK_KITCHEN'
    ]);
    expect(listCategories(rows, { q: 'food_c' }).items.map((c) => c.name)).toEqual(['Food Court']);
    expect(listCategories(rows, { status: 'archived' }).items.map((c) => c.name)).toEqual([
      'Franchise Outlet'
    ]);
    expect(listCategories(rows, { status: 'active' }).meta.total).toBe(10);
  });

  it('sorts by a column in either direction, numbers as numbers', () => {
    const byBusinesses = listCategories(getCategoriesStore(), {
      sort: 'businesses',
      order: 'desc',
      page_size: 3
    });

    expect(byBusinesses.items.map((c) => c.businesses)).toEqual([248, 182, 64]);
    expect(
      listCategories(getCategoriesStore(), { sort: 'name', order: 'asc' }).items[0]!.name
    ).toBe('Bakery');
  });
});

describe('categories CSV export', () => {
  const lines = (body: Record<string, unknown>) => categoriesCsv(body).trimEnd().split('\n');

  it('writes the header, then every filtered row and not only one page', () => {
    const all = lines({});

    expect(all[0]).toBe(
      'category_id,name,code,business_type,description,businesses,outlets,status'
    );
    expect(all).toHaveLength(13);
    expect(all[1]).toBe(
      'CAT001,Restaurant,RESTAURANT,Restaurant,Dine-in and takeaway restaurants.,248,1024,active'
    );
    expect(lines({ q: 'truck', page: 1, page_size: 5 })).toHaveLength(2);
    expect(lines({ status: 'inactive' })[1]).toContain('Canteen');
  });

  it('writes only the chosen ids when there are any, skipping unknown ones', () => {
    const rows = lines({
      category_ids: ['CAT002', 'CAT001', 'CAT999', 'CAT002'],
      status: 'archived'
    });

    expect(rows).toHaveLength(3);
    expect(rows[1]).toContain('CAT002');
    expect(rows[2]).toContain('CAT001');
  });
});

describe('categories and roles audit', () => {
  it('has a seeded history, newest first, for one category and for all of them', () => {
    const canteen = getCategoriesRolesAudit('hire_category', 'CAT010');
    const all = getCategoriesRolesAudit('hire_category', 'all');

    expect(canteen.map((e) => e.action)).toEqual(['STATUS_UPDATED', 'CREATED']);
    expect(canteen[0]!.changes).toEqual([{ field: 'Status', from: 'Active', to: 'Inactive' }]);
    expect(all.length).toBeGreaterThan(12);
    expect(all.every((e) => e.entity_type === 'hire_category')).toBe(true);
    expect(all.map((e) => e.occurred_at)).toEqual(
      [...all.map((e) => e.occurred_at)].sort().reverse()
    );
    expect(all.some((e) => e.action === 'STATUS_UPDATED_CATEGORY_FRANCHISE OUTLET')).toBe(true);
  });

  it('keeps categories and roles apart and seeds a role permission change', () => {
    const roles = getCategoriesRolesAudit('hire_role', 'all');

    expect(roles.every((e) => e.entity_type === 'hire_role')).toBe(true);
    expect(roles[0]!.action).toBe('PERMISSIONS_UPDATED_ROLE_HR MANAGER');
    expect(roles[0]!.changes).toEqual([
      { field: 'Recruiters', from: 'View', to: 'View, Create, Edit' }
    ]);
    expect(getCategoriesRolesAudit('hire_role', 'CAT001')).toEqual([]);
  });
});
