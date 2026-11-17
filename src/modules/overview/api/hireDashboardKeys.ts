import type { TrendRange } from './hireDashboardTypes';

export const hireDashboardKeys = {
  summary: ['hire', 'dashboard', 'summary'] as const,
  trend: (range: TrendRange) => ['hire', 'dashboard', 'trend', range] as const,
  recentApplications: ['hire', 'dashboard', 'recent-applications'] as const,
  openJobsByCategory: ['hire', 'dashboard', 'open-jobs-by-category'] as const
};
