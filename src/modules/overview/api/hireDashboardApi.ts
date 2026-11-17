import { apiClient } from '@/shared/api/apiClient';
import type {
  HireDashboardSummary,
  OpenJobCategoryRow,
  RecentApplicationRow,
  TrendPoint,
  TrendRange
} from './hireDashboardTypes';

export function fetchHireDashboardSummary() {
  return apiClient.get<HireDashboardSummary>('/hire/dashboard/summary');
}

export function fetchApplicationsTrend(range: TrendRange) {
  return apiClient.get<TrendPoint[]>('/hire/dashboard/applications-trend', { range });
}

export function fetchRecentApplications() {
  return apiClient.get<RecentApplicationRow[]>('/hire/dashboard/recent-applications');
}

export function fetchOpenJobsByCategory() {
  return apiClient.get<OpenJobCategoryRow[]>('/hire/dashboard/open-jobs-by-category');
}
