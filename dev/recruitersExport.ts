/** CSV text for a recruiter export, served by the mock API's export-result route. */
import { filterRecruiters, pickFilters } from './recruitersAnalytics.ts';
import {
  findRecruiter,
  getRecruitersStore,
  type HireAdminRecruiter
} from './recruitersMockData.ts';

const COLUMNS = [
  'recruiter_id',
  'business_name',
  'business_type',
  'area',
  'city',
  'owner_name',
  'phone',
  'email',
  'outlets',
  'open_jobs',
  'applications',
  'verification',
  'status',
  'joined_at'
] as const satisfies readonly (keyof HireAdminRecruiter)[];

/** Fields with a comma, a quote or a line break are wrapped in quotes, and quotes are doubled. */
function csvField(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * The rows named in `recruiter_ids` when that is a non-empty list, otherwise every row (not one page)
 * that matches the list filters in the body: tab, status, business_type, city, search, joined.
 */
export function recruitersCsv(body: Record<string, unknown>): string {
  const ids = Array.isArray(body.recruiter_ids) ? body.recruiter_ids.map(String) : [];
  const rows =
    ids.length > 0
      ? [...new Set(ids)].flatMap((id) => findRecruiter(id) ?? [])
      : filterRecruiters(getRecruitersStore(), pickFilters(body));
  const lines = rows.map((row) => COLUMNS.map((column) => csvField(row[column])).join(','));
  return `${[COLUMNS.join(','), ...lines].join('\n')}\n`;
}
