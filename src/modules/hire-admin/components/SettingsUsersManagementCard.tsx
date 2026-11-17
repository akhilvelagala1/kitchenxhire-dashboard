import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Input, Select } from '@/shared/ui/Input';
import type { SettingsManagedUser } from '../schemas/adminSettingsUsersRoles';
import { SettingsCard } from './SettingsCard';
import { SettingsUserFormDialog } from './SettingsUserFormDialog';
import {
  USERS_ROLES_BTN,
  USERS_ROLES_CARD_CLASS,
  USERS_ROLES_ICON_BTN
} from './settingsUsersRolesDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useUsersRolesSettingsDraft } from './usersRolesSettingsContext';

const ROLE_BADGE: Record<string, string> = {
  Admin: 'bg-[#F3E8FF] text-[#7C3AED]',
  Recruiter: 'bg-[#DCEBFF] text-[#1768E8]',
  User: 'bg-[#E8EBF0] text-[#657184]'
};

/**
 * Top-left Users & Roles card: searchable user list with role filter, status, and edit/delete.
 */
export function SettingsUsersManagementCard() {
  const canEdit = useCanEditSettings();
  const { draft, removeUser } = useUsersRolesSettingsDraft();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editing, setEditing] = useState<SettingsManagedUser | undefined>();
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<SettingsManagedUser | undefined>();

  const roleNames = draft.roles.map((role) => role.name);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return draft.users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (!needle) return true;
      return user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle);
    });
  }, [draft.users, query, roleFilter]);

  return (
    <SettingsCard
      title="Users Management"
      description="Manage platform users and their access."
      className={USERS_ROLES_CARD_CLASS}
      action={
        canEdit ? (
          <Button
            className={USERS_ROLES_BTN}
            onClick={() => {
              setEditing(undefined);
              setAdding(true);
            }}
          >
            <Plus className="size-4 lg:size-[calc(16*var(--u))]" aria-hidden />
            Add User
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-2.5 lg:gap-[calc(10*var(--u))]">
        <div className="flex gap-2 lg:gap-[calc(10*var(--u))]">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search users</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98A2B3] lg:left-[calc(12*var(--u))] lg:size-[calc(16*var(--u))]"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users…"
              className="pl-9 lg:h-[calc(40*var(--u))] lg:min-h-0 lg:rounded-[calc(10*var(--u))] lg:pl-[calc(36*var(--u))] lg:text-[calc(13*var(--u))]"
            />
          </label>
          <Select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="w-36 shrink-0 lg:h-[calc(40*var(--u))] lg:min-h-0 lg:w-[calc(128*var(--u))] lg:rounded-[calc(10*var(--u))] lg:px-[calc(10*var(--u))] lg:text-[calc(13*var(--u))]"
          >
            <option value="all">All Roles</option>
            {roleNames.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <div role="table" aria-label="Platform users" className="flex flex-col">
            <div
              role="row"
              className="grid h-[calc(34*var(--u))] grid-cols-[minmax(0,1.7fr)_0.7fr_0.55fr_0.75fr_0.5fr] items-center gap-1 border-b border-[#E4E8F0] text-[11px] font-semibold tracking-wide text-[#586987] uppercase lg:gap-[calc(6*var(--u))] lg:text-[calc(11*var(--u))] [&>span]:border-r [&>span]:border-[#EEF0F4] [&>span:last-child]:border-r-0"
            >
              <span role="columnheader">User</span>
              <span role="columnheader">Role</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Last Login</span>
              <span role="columnheader" className="text-right">
                Actions
              </span>
            </div>
            <div>
              {rows.map((user) => (
                <div
                  key={user.id}
                  role="row"
                  className="grid h-auto min-h-[49px] grid-cols-[minmax(0,1.7fr)_0.7fr_0.55fr_0.75fr_0.5fr] items-center gap-1 border-b border-[#E8ECF2] py-1 last:border-b-0 lg:h-[calc(50*var(--u))] lg:min-h-0 lg:gap-[calc(6*var(--u))] lg:py-0 [&>div]:border-r [&>div]:border-[#EEF0F4] [&>div:last-child]:border-r-0"
                >
                  <div
                    role="cell"
                    className="flex min-w-0 items-center gap-2.5 lg:gap-[calc(10*var(--u))]"
                  >
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-xs font-semibold text-[#C2410C] lg:size-[calc(42*var(--u))] lg:text-[calc(13*var(--u))]"
                    >
                      {user.avatar_initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-[#111827] lg:text-[calc(15.5*var(--u))]">
                        {user.name}
                      </span>
                      <span className="block truncate text-[13px] text-[#586987] lg:text-[calc(13*var(--u))]">
                        {user.email}
                      </span>
                    </span>
                  </div>
                  <div role="cell">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold lg:px-[calc(10*var(--u))] lg:py-[calc(3*var(--u))] lg:text-[calc(11.5*var(--u))]',
                        ROLE_BADGE[user.role] ?? 'bg-[#EEF0F4] text-[#657184]'
                      )}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div
                    role="cell"
                    className="flex items-center gap-1.5 text-xs text-[#344054] lg:text-[calc(12.5*var(--u))]"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'size-2 rounded-full lg:size-[calc(8*var(--u))]',
                        user.status === 'active' ? 'bg-[#16A34A]' : 'bg-[#EF4444]'
                      )}
                    />
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                  <div
                    role="cell"
                    className="truncate text-xs text-[#586987] lg:text-[calc(12.5*var(--u))]"
                  >
                    {user.last_login}
                  </div>
                  <div role="cell" className="flex justify-end gap-0.5">
                    <button
                      type="button"
                      aria-label={`Edit ${user.name}`}
                      disabled={!canEdit}
                      className={USERS_ROLES_ICON_BTN}
                      onClick={() => {
                        setAdding(false);
                        setEditing(user);
                      }}
                    >
                      <Pencil className="size-4.5 text-[#1768E8]" strokeWidth={2.25} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${user.name}`}
                      disabled={!canEdit}
                      className={USERS_ROLES_ICON_BTN}
                      onClick={() => setDeleting(user)}
                    >
                      <Trash2 className="size-4.5 text-[#EF4444]" strokeWidth={2.25} aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="py-4 text-center text-sm text-[#586987] lg:text-[calc(13*var(--u))]">
                  No users match this search.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <SettingsUserFormDialog
        open={adding || Boolean(editing)}
        user={editing}
        roleNames={roleNames}
        onClose={() => {
          setAdding(false);
          setEditing(undefined);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete user?"
        message={
          deleting
            ? `Remove ${deleting.name} from the platform users list. Save Changes to keep this.`
            : ''
        }
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => {
          if (deleting) removeUser(deleting.id);
          setDeleting(undefined);
        }}
        onCancel={() => setDeleting(undefined)}
      />
    </SettingsCard>
  );
}
