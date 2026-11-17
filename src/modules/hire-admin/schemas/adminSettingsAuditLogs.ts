/** Module filter options for Audit & Logs (reference order). */
export const AUDIT_LOG_MODULE_OPTIONS = [
  'Settings',
  'User Management',
  'Jobs',
  'Businesses',
  'Security',
  'Categories',
  'Locations'
] as const;

/** Action filter options for Audit & Logs (reference order). */
export const AUDIT_LOG_ACTION_OPTIONS = ['Created', 'Updated', 'Deleted'] as const;
export type AuditLogAction = (typeof AUDIT_LOG_ACTION_OPTIONS)[number];

type AuditLogResult = 'Success' | 'Failed';

/** One row of the Audit & Logs table: a single recorded platform action. */
export interface AuditLogEntry {
  id: string;
  /** ISO timestamp, India time. */
  timestamp: string;
  user_name: string;
  action: AuditLogAction;
  module: string;
  resource: string;
  details: string;
  ip_address: string;
  result: AuditLogResult;
}
