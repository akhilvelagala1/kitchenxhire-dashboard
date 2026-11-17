/** CSV text for an application export, served by the mock API's export-result route. */
import { filterApplications, pickFilters } from './applicationsAnalytics.ts';
import {
  findApplication,
  getApplicationsStore,
  type HireAdminApplication
} from './applicationsMockData.ts';

const COLUMNS = [
  'application_id',
  'candidate_name',
  'candidate_email',
  'candidate_phone',
  'candidate_location',
  'job_title',
  'job_type',
  'recruiter_name',
  'outlet_name',
  'applied_at',
  'status'
] as const satisfies readonly (keyof HireAdminApplication)[];

/** Fields with a comma, a quote or a line break are wrapped in quotes, and quotes are doubled. */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/**
 * The rows named in `application_ids` when that is a non-empty list, otherwise every row (not one page)
 * that matches the list filters in the body: tab, status, job_id, recruiter_id, location, search, from, to.
 */
export function applicationsCsv(body: Record<string, unknown>): string {
  const ids = Array.isArray(body.application_ids) ? body.application_ids.map(String) : [];
  const rows =
    ids.length > 0
      ? [...new Set(ids)].flatMap((id) => findApplication(id) ?? [])
      : filterApplications(getApplicationsStore(), pickFilters(body));
  const lines = rows.map((row) => COLUMNS.map((column) => csvField(row[column])).join(','));
  return `${[COLUMNS.join(','), ...lines].join('\n')}\n`;
}
