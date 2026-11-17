/** CSV text for a business export, served by the mock API's export-result route. */
import { filterBusinesses, pickBusinessFilters } from './businessesAnalytics.ts';
import { findBusiness, getBusinessesStore, type HireAdminBusiness } from './businessesMockData.ts';

const COLUMNS = [
  'business_id',
  'business_name',
  'business_type',
  'area',
  'city',
  'owner_name',
  'phone',
  'email',
  'outlets',
  'status',
  'verification',
  'joined_at'
] as const satisfies readonly (keyof HireAdminBusiness)[];

function csvField(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function businessesCsv(body: Record<string, unknown>): string {
  const ids = Array.isArray(body.business_ids) ? body.business_ids.map(String) : [];
  const rows =
    ids.length > 0
      ? [...new Set(ids)].flatMap((id) => findBusiness(id) ?? [])
      : filterBusinesses(getBusinessesStore(), pickBusinessFilters(body));
  const lines = rows.map((row) => COLUMNS.map((column) => csvField(row[column])).join(','));
  return `${[COLUMNS.join(','), ...lines].join('\n')}\n`;
}
