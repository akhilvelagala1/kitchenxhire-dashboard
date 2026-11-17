/** CSV text for a job seeker export, served by the mock API's export-result route. */
import { filterJobSeekers, pickJobSeekerFilters } from './jobSeekersAnalytics.ts';
import {
  findJobSeeker,
  getJobSeekersStore,
  type HireAdminJobSeeker
} from './jobSeekersMockData.ts';

const COLUMNS = [
  'job_seeker_id',
  'name',
  'email',
  'phone',
  'city',
  'state',
  'preferred_job_title',
  'experience_years',
  'profile_completion',
  'applications_count',
  'interviews_count',
  'shortlisted_count',
  'hired_count',
  'status',
  'joined_at',
  'last_active_at'
] as const satisfies readonly (keyof HireAdminJobSeeker)[];

/** Fields with a comma, a quote or a line break are wrapped in quotes, and quotes are doubled. */
function csvField(value: string | number | null): string {
  const text = value === null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * The rows named in `job_seeker_ids` when that is a non-empty list, otherwise every row (not one page)
 * that matches the list filters in the body: tab, status, experience, city, search, joined.
 */
export function jobSeekersCsv(body: Record<string, unknown>): string {
  const ids = Array.isArray(body.job_seeker_ids) ? body.job_seeker_ids.map(String) : [];
  const rows =
    ids.length > 0
      ? [...new Set(ids)].flatMap((id) => findJobSeeker(id) ?? [])
      : filterJobSeekers(getJobSeekersStore(), pickJobSeekerFilters(body));
  const lines = rows.map((row) => COLUMNS.map((column) => csvField(row[column])).join(','));
  return `${[COLUMNS.join(','), ...lines].join('\n')}\n`;
}
