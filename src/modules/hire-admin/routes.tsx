import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { RequirePermission } from '@/shared/components/PermissionGate';
import type { ShellRouteHandle } from '@/shared/types/module';
import { HIRE_ADMIN_PERMISSIONS as P } from './permissions';

const AdminJobsPage = lazy(() =>
  import('./pages/AdminJobsPage').then((m) => ({ default: m.AdminJobsPage }))
);

const AdminJobCreatePage = lazy(() =>
  import('./pages/AdminJobCreatePage').then((m) => ({ default: m.AdminJobCreatePage }))
);

const AdminJobDetailPage = lazy(() =>
  import('./pages/AdminJobDetailPage').then((m) => ({ default: m.AdminJobDetailPage }))
);

const AdminJobEditPage = lazy(() =>
  import('./pages/AdminJobEditPage').then((m) => ({ default: m.AdminJobEditPage }))
);

const AdminApplicationsPage = lazy(() =>
  import('./pages/AdminApplicationsPage').then((m) => ({ default: m.AdminApplicationsPage }))
);

const AdminApplicationDetailPage = lazy(() =>
  import('./pages/AdminApplicationDetailPage').then((m) => ({
    default: m.AdminApplicationDetailPage
  }))
);

const AdminRecruitersPage = lazy(() =>
  import('./pages/AdminRecruitersPage').then((m) => ({ default: m.AdminRecruitersPage }))
);
const AdminRecruiterFormPage = lazy(() =>
  import('./pages/AdminRecruiterFormPage').then((m) => ({ default: m.AdminRecruiterFormPage }))
);
const AdminRecruiterDetailPage = lazy(() =>
  import('./pages/AdminRecruiterDetailPage').then((m) => ({ default: m.AdminRecruiterDetailPage }))
);
const AdminJobSeekersPage = lazy(() =>
  import('./pages/AdminJobSeekersPage').then((m) => ({ default: m.AdminJobSeekersPage }))
);
const AdminUsersPage = lazy(() =>
  import('./pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminJobSeekerFormPage = lazy(() =>
  import('./pages/AdminJobSeekerFormPage').then((m) => ({ default: m.AdminJobSeekerFormPage }))
);
const AdminJobSeekerDetailPage = lazy(() =>
  import('./pages/AdminJobSeekerDetailPage').then((m) => ({ default: m.AdminJobSeekerDetailPage }))
);

const AdminBusinessesPage = lazy(() =>
  import('./pages/AdminBusinessesPage').then((m) => ({ default: m.AdminBusinessesPage }))
);

const AdminReportsPage = lazy(() =>
  import('./pages/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage }))
);

const AdminSettingsPage = lazy(() =>
  import('./pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);

export const hireAdminRoutes: RouteObject[] = [
  {
    path: 'admin/jobs',
    // The Jobs dashboard sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.view}>
        <AdminJobsPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/jobs/new',
    // The Post a Job form sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.manage}>
        <AdminJobCreatePage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/jobs/:id',
    element: (
      <RequirePermission permission={P.view}>
        <AdminJobDetailPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/jobs/:id/edit',
    element: (
      <RequirePermission permission={P.manage}>
        <AdminJobEditPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/applications',
    // The Applications dashboard sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.view}>
        <AdminApplicationsPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/applications/:applicationId',
    element: (
      <RequirePermission permission={P.view}>
        <AdminApplicationDetailPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/recruiters',
    // The Recruiters dashboard sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.view}>
        <AdminRecruitersPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/recruiters/create',
    element: (
      <RequirePermission permission={P.manage}>
        <AdminRecruiterFormPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/recruiters/:recruiterId',
    element: (
      <RequirePermission permission={P.view}>
        <AdminRecruiterDetailPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/recruiters/:recruiterId/edit',
    element: (
      <RequirePermission permission={P.manage}>
        <AdminRecruiterFormPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/job-seekers',
    // The Job Seekers dashboard sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.view}>
        <AdminJobSeekersPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/job-seekers/create',
    element: (
      <RequirePermission permission={P.manage}>
        <AdminJobSeekerFormPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/job-seekers/:jobSeekerId',
    element: (
      <RequirePermission permission={P.view}>
        <AdminJobSeekerDetailPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/job-seekers/:jobSeekerId/edit',
    element: (
      <RequirePermission permission={P.manage}>
        <AdminJobSeekerFormPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/businesses',
    // The Businesses dashboard sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.view}>
        <AdminBusinessesPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/users',
    // The User Management dashboard sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.view}>
        <AdminUsersPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/reports',
    // The Reports & Analytics screen sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.view}>
        <AdminReportsPage />
      </RequirePermission>
    )
  },
  {
    path: 'admin/settings',
    // The Settings screen sizes itself to the viewport from lg up (see AppShell).
    handle: { fit: true } satisfies ShellRouteHandle,
    element: (
      <RequirePermission permission={P.view}>
        <AdminSettingsPage />
      </RequirePermission>
    )
  }
];
