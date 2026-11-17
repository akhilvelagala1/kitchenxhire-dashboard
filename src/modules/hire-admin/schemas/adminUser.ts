export const USER_STATUSES = ['active', 'inactive', 'pending', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended'
};

/** One tab per status, plus All. A tab and the status filter narrow the same list. */
export const USER_TABS = ['all', ...USER_STATUSES] as const;
export type UserTab = (typeof USER_TABS)[number];

export const USER_TAB_LABELS: Record<UserTab, string> = {
  all: 'All Users',
  ...USER_STATUS_LABELS
};

/** Statuses a person can be moved to by hand. `pending` only ends when the invite is accepted. */
export type UserSettableStatus = 'active' | 'inactive' | 'suspended';

/** Demo labels from the reference picture; the real role catalogue is a backend decision. */
export const USER_ROLES = [
  'Super Admin',
  'HR Manager',
  'HR Executive',
  'Support',
  'Analyst'
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_DEPARTMENTS = [
  'Platform Ops',
  'Hiring',
  'Customer Support',
  'Operations'
] as const;
export type UserDepartment = (typeof USER_DEPARTMENTS)[number];

export const USER_ACCESS_SCOPES = [
  'All modules',
  'Jobs & Applications',
  'Applications only',
  'Read-only',
  'Reports only'
] as const;
type UserAccessScope = (typeof USER_ACCESS_SCOPES)[number];

export interface HireAdminUser {
  /** For example `UST1001`. */
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
  access_scope: UserAccessScope;
  /** ISO timestamp with offset, or null until the person signs in for the first time. */
  last_login_at: string | null;
  status: UserStatus;
  /** ISO timestamp with offset: when the account (or its invite) was created. */
  created_at: string;
}

/** What the add and edit dialogs send. A new user starts as `pending` (invite sent). */
export interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
  access_scope: UserAccessScope;
}

export interface HireUsersSummary {
  total: number;
  active: number;
  inactive: number;
  /** Users with the Super Admin role. */
  administrators: number;
  /** Invites sent and not yet accepted. */
  pending: number;
  suspended: number;
  /** Percent change against the previous period. */
  growth_pct: Record<
    'total' | 'active' | 'inactive' | 'administrators' | 'pending' | 'suspended',
    number
  >;
}
