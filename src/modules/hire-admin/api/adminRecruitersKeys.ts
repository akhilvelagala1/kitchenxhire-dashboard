import type { TrendRange } from '../schemas/listDashboard';
import type { RecruitersListParams } from './adminRecruitersApi';

export const adminRecruitersKeys = {
  all: ['hire-admin', 'recruiters'] as const,
  summary: () => [...adminRecruitersKeys.all, 'summary'] as const,
  trend: (range: TrendRange) => [...adminRecruitersKeys.all, 'trend', range] as const,
  locations: () => [...adminRecruitersKeys.all, 'locations'] as const,
  lists: () => [...adminRecruitersKeys.all, 'list'] as const,
  list: (q: RecruitersListParams) => [...adminRecruitersKeys.lists(), q] as const,
  detail: (id: string) => [...adminRecruitersKeys.all, 'detail', id] as const,
  /** The shared activity list (AuditTrail) keeps its own keys; a write must refresh them too. */
  audit: ['audit-events', 'hire_recruiter'] as const
};
