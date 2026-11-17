import type { ReactNode } from 'react';
import { usePermissions } from '@/shared/auth/usePermissions';
import { Spinner } from '@/shared/ui/Spinner';
import { EmptyState } from './EmptyState';

/** Hides a control the role cannot use. The server still enforces it (G-02). */
export function PermissionGate({
  permission,
  children
}: {
  permission: string;
  children: ReactNode;
}) {
  const { can } = usePermissions();
  return can(permission) ? <>{children}</> : null;
}

/** Route-level guard: a deep link without the permission shows a clear message, not a broken page. */
export function RequirePermission({
  permission,
  children
}: {
  permission: string;
  children: ReactNode;
}) {
  const { can, isLoading } = usePermissions();
  if (isLoading) return <Spinner />;
  if (!can(permission)) {
    return (
      <EmptyState
        title="You do not have access to this page"
        description="Ask a platform admin to grant the permission."
      />
    );
  }
  return <>{children}</>;
}
