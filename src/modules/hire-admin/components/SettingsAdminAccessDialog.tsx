import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { type Column, DataTable } from '@/shared/components/DataTable';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { adminSettingsKeys } from '../api/adminSettingsKeys';
import { adminSettingsUsersRolesApi } from '../api/adminSettingsUsersRolesApi';
import {
  SETTINGS_PERMISSION_KEYS,
  SETTINGS_PERMISSION_LABELS,
  SETTINGS_PLATFORM_ROLES,
  type SettingsPermissionKey
} from '../schemas/adminSettingsUsersRoles';

const CENTER = 'text-center';

/**
 * Admin Access Control is read-only here: the Permissions Matrix on Users & Roles Settings is the
 * one place that edits it, so this dialog never holds a second, editable copy that could drift.
 */
function Body() {
  const query = useQuery({
    queryKey: adminSettingsKeys.usersRoles,
    queryFn: () => adminSettingsUsersRolesApi.get()
  });
  const permissions = query.data?.permissions;

  const columns = useMemo<Column<SettingsPermissionKey>[]>(
    () => [
      { id: 'permission', header: 'Permission', cell: (key) => SETTINGS_PERMISSION_LABELS[key] },
      ...SETTINGS_PLATFORM_ROLES.map((role): Column<SettingsPermissionKey> => ({
        id: role,
        header: role,
        className: CENTER,
        cell: (key) =>
          permissions?.[key][role] ? (
            <span aria-label={`${role} can ${SETTINGS_PERMISSION_LABELS[key]}`}>✓</span>
          ) : (
            <span aria-hidden>—</span>
          )
      }))
    ],
    [permissions]
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">What each role can access, by module.</p>
      <DataTable<SettingsPermissionKey>
        density="compact"
        columns={columns}
        rows={permissions ? [...SETTINGS_PERMISSION_KEYS] : undefined}
        getRowId={(key) => key}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        empty={{ title: 'No permissions' }}
        caption="Role permissions, read-only"
      />
      <Link
        to="/admin/settings?tab=users"
        className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-muted"
      >
        Edit in Users & Roles
      </Link>
    </div>
  );
}

/** Configure dialog for Admin Access Control: a read-only view of the Permissions Matrix. */
export function SettingsAdminAccessDialog({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Admin Access Control"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {open ? <Body /> : null}
    </Dialog>
  );
}
