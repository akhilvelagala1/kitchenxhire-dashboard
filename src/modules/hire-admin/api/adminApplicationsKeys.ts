import type { ApplicationOptionKind } from '../schemas/adminApplication';
import type { ApplicationsListParams } from './adminApplicationsApi';

export const adminApplicationsKeys = {
  all: ['hire-admin', 'applications'] as const,
  summary: () => [...adminApplicationsKeys.all, 'summary'] as const,
  options: (kind: ApplicationOptionKind) =>
    [...adminApplicationsKeys.all, 'options', kind] as const,
  lists: () => [...adminApplicationsKeys.all, 'list'] as const,
  list: (q: ApplicationsListParams) => [...adminApplicationsKeys.lists(), q] as const,
  detail: (id: string) => [...adminApplicationsKeys.all, 'detail', id] as const,
  /** The shared activity list (AuditTrail) keeps its own keys; a write must refresh them too. */
  audit: ['audit-events', 'hire_application'] as const
};
