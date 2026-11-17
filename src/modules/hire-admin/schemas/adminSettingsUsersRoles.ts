import { z } from 'zod';

/** The three platform roles shown on Users & Roles Settings (image source of truth). */
export const SETTINGS_PLATFORM_ROLES = ['Admin', 'Recruiter', 'User'] as const;
export type SettingsPlatformRole = (typeof SETTINGS_PLATFORM_ROLES)[number];

export const SETTINGS_USER_STATUSES = ['active', 'inactive'] as const;
type SettingsUserStatus = (typeof SETTINGS_USER_STATUSES)[number];

/** Permission rows in the matrix (Admin / Recruiter / User — section-5 product rules). */
export const SETTINGS_PERMISSION_KEYS = [
  'manage_users',
  'manage_roles',
  'create_manage_jobs',
  'view_own_applications',
  'schedule_interviews',
  'view_platform_reports'
] as const;
export type SettingsPermissionKey = (typeof SETTINGS_PERMISSION_KEYS)[number];

export const SETTINGS_PERMISSION_LABELS: Record<SettingsPermissionKey, string> = {
  manage_users: 'Manage Users',
  manage_roles: 'Manage Roles',
  create_manage_jobs: 'Create & Manage Jobs',
  view_own_applications: 'View Own Applications',
  schedule_interviews: 'Schedule Interviews',
  view_platform_reports: 'View Platform Reports'
};

export const SETTINGS_SESSION_TIMEOUT = { min: 5, max: 480 } as const;

export interface SettingsManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: SettingsUserStatus;
  /** Relative label shown in the table (for example "2 hours ago"). */
  last_login: string;
  avatar_initials: string;
}

export interface SettingsManagedRole {
  id: string;
  name: string;
  description: string;
  /** True for Admin / Recruiter / User — cannot be deleted. */
  is_system: boolean;
}

export type SettingsPermissionMatrix = Record<
  SettingsPermissionKey,
  Record<SettingsPlatformRole, boolean>
>;

/** The Users & Roles Settings payload: users, roles, matrix, and access toggles. */
export interface SettingsUsersRoles {
  users: SettingsManagedUser[];
  roles: SettingsManagedRole[];
  permissions: SettingsPermissionMatrix;
  two_factor_auth: boolean;
  session_timeout_minutes: number;
  user_activity_logging: boolean;
  ip_access_restriction: boolean;
}

const emailSchema = z
  .string()
  .trim()
  .max(120, 'Keep the e-mail under 120 characters')
  .pipe(z.email('Enter a valid e-mail address'));

export const settingsUserFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter the full name (at least 2 characters)')
    .max(80, 'Keep the name under 80 characters'),
  email: emailSchema,
  role: z.string().trim().min(1, 'Choose a role'),
  status: z.enum(SETTINGS_USER_STATUSES)
});

export type SettingsUserFormValues = z.infer<typeof settingsUserFormSchema>;

export const settingsRoleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name must have at least 2 characters')
    .max(40, 'Role name can have at most 40 characters'),
  description: z
    .string()
    .trim()
    .min(2, 'Enter a short description')
    .max(200, 'Keep the description under 200 characters')
});

export type SettingsRoleFormValues = z.infer<typeof settingsRoleFormSchema>;

/** Initials from a display name for the avatar chip. */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

/** How many users currently hold each role name. */
export function countUsersByRole(users: readonly SettingsManagedUser[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const user of users) {
    counts[user.role] = (counts[user.role] ?? 0) + 1;
  }
  return counts;
}
