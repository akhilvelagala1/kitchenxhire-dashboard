/** CSV text for a category export, served by the mock API's export-result route. */
import { filterCategories } from './categoriesAnalytics.ts';
import { findCategory, getCategoriesStore, type HireAdminCategory } from './categoriesMockData.ts';

const COLUMNS = [
  'category_id',
  'name',
  'code',
  'business_type',
  'description',
  'businesses',
  'outlets',
  'status'
] as const satisfies readonly (keyof HireAdminCategory)[];

/** Fields with a comma, a quote or a line break are wrapped in quotes, and quotes are doubled. */
function csvField(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * The rows named in `category_ids` when that is a non-empty list, otherwise every row (not one page)
 * that matches the list filters in the body: q and status.
 */
export function categoriesCsv(body: Record<string, unknown>): string {
  const ids = Array.isArray(body.category_ids) ? body.category_ids.map(String) : [];
  const rows =
    ids.length > 0
      ? [...new Set(ids)].flatMap((id) => findCategory(id) ?? [])
      : filterCategories(getCategoriesStore(), {
          q: typeof body.q === 'string' ? body.q : undefined,
          status: typeof body.status === 'string' ? body.status : undefined
        });
  const lines = rows.map((row) => COLUMNS.map((column) => csvField(row[column])).join(','));
  return `${[COLUMNS.join(','), ...lines].join('\n')}\n`;
}
