/**
 * The read side of the Categories mock: the list query (search, status, sort, page) and the summary
 * that the list, the export and the summary cards share.
 */
import { getCategoriesStore, getRolesStore, type HireAdminCategory } from './categoriesMockData.ts';

export interface CategoriesQuery {
  q?: string;
  status?: string;
  sort?: string;
  order?: string;
  page?: number;
  page_size?: number;
}

/** Name or code contains `q` (any case), and the status matches when one is given. */
export function filterCategories(rows: readonly HireAdminCategory[], f: CategoriesQuery) {
  const needle = f.q?.trim().toLowerCase();
  return rows.filter(
    (c) =>
      (!f.status || c.status === f.status) &&
      (!needle || c.name.toLowerCase().includes(needle) || c.code.toLowerCase().includes(needle))
  );
}

const SORTS = [
  'category_id',
  'name',
  'code',
  'business_type',
  'businesses',
  'outlets',
  'status'
] as const;

/** Insertion order unless `sort` names a column. Pages are 1-based, 1 to 100 rows, 5 by default. */
export function listCategories(rows: readonly HireAdminCategory[], q: CategoriesQuery) {
  const sort = SORTS.find((s) => s === q.sort);
  const dir = q.order === 'desc' ? -1 : 1;
  const matched = filterCategories(rows, q);
  if (sort) {
    matched.sort((a, b) => {
      const x = a[sort];
      const y = b[sort];
      const diff =
        typeof x === 'number' && typeof y === 'number'
          ? x - y
          : String(x).localeCompare(String(y), 'en');
      return diff * dir;
    });
  }
  const page = Math.max(1, Math.floor(q.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Math.floor(q.page_size ?? 5) || 5));
  return {
    items: matched.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, page_size: pageSize, total: matched.length }
  };
}

/** Change against last month needs history the mock does not keep, so these stay fixed (the picture's). */
export function categoriesRolesSummary() {
  return {
    categories: getCategoriesStore().length,
    roles: getRolesStore().length,
    growth_pct: { categories: 20, roles: 14 }
  };
}
