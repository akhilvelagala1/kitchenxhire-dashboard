import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { isStaffAppRole, logoutStaff } from './staffAuth';
import { getAccessToken } from './tokenStorage';
import { ADMIN_LOGIN_PATH } from './staffPaths';
import { sessionKeys } from './sessionKeys';

interface StaffMe {
  user_id: string;
  role: string;
  permissions: string[];
}

/** Blocks AppShell until a valid staff session exists (G-02: server /auth/me is source of truth). */
export function RequireStaffSession({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = getAccessToken();

  const meQuery = useQuery({
    queryKey: sessionKeys.me,
    queryFn: () => apiClient.get<StaffMe>('/auth/me'),
    enabled: Boolean(token),
    retry: false
  });

  if (!token) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace state={{ from: location.pathname }} />;
  }

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    logoutStaff();
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }

  if (!isStaffAppRole(meQuery.data.role)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas p-6">
        <EmptyState
          title="Admin access only"
          description="This account is not authorized for the KitchenX platform admin. Use the job seeker or recruiter experience instead."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                logoutStaff();
                window.location.assign(ADMIN_LOGIN_PATH);
              }}
            >
              Back to admin sign-in
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
