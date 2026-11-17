import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { RequirePermission } from '@/shared/components/PermissionGate';

const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

export const overviewRoutes: RouteObject[] = [
  {
    path: 'admin/dashboard',
    element: (
      <RequirePermission permission="overview.view">
        <AdminDashboardPage />
      </RequirePermission>
    )
  }
];
