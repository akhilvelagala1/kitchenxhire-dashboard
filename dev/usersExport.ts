/** CSV text for a user export, served by the mock API's export-result route. */
import { filterUsers, pickUserFilters } from './usersAnalytics.ts';
import { findUser, getUsersStore, type HireAdminUser } from './usersMockData.ts';

const COLUMNS = [
  'user_id',
  'name',
  'email',
  'role',
  'department',
  'access_scope',
  'last_login_at',
  'status',
  'created_at'
] as const satisfies readonly (keyof HireAdminUser)[];

/** Fields with a comma, a quote or a line break are wrapped in quotes, and quotes are doubled. */
function csvField(value: string | null): string {
  const text = value ?? '';
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * The rows named in `user_ids` when that is a non-empty list, otherwise every row (not one page)
 * that matches the list filters in the body: tab, status, role, department, search, active.
 */
export function usersCsv(body: Record<string, unknown>): string {
  const ids = Array.isArray(body.user_ids) ? body.user_ids.map(String) : [];
  const rows =
    ids.length > 0
      ? [...new Set(ids)].flatMap((id) => findUser(id) ?? [])
      : filterUsers(getUsersStore(), pickUserFilters(body));
  const lines = rows.map((row) => COLUMNS.map((column) => csvField(row[column])).join(','));
  return `${[COLUMNS.join(','), ...lines].join('\n')}\n`;
}
