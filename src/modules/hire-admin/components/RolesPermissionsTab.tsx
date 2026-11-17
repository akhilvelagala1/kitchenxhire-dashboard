import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ErrorState } from '@/shared/components/ErrorState';
import { cn } from '@/shared/lib/cn';
import { Field } from '@/shared/ui/Field';
import { Select } from '@/shared/ui/Input';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { RolePermissions } from '../schemas/adminCategoryRole';
import { jobsCardClass } from './jobsCardStyles';
import { changedModules } from './permissionGrid';
import { CategoryRoleStatusBadge } from './CategoryRoleStatusBadge';
import { RolePermissionsEditor } from './RolePermissionsEditor';
import { useRolesList } from './rolesQuery';

/** The unsaved matrix, kept with the role it belongs to so it never leaks into another role. */
interface Edit {
  roleId: string;
  permissions: RolePermissions;
}

/**
 * The second workspace tab: pick a role, edit its permission matrix, save. The chosen role is in
 * the URL as `role`, and the first role is shown when there is none. Switching roles with unsaved
 * changes asks first.
 */
export function RolesPermissionsTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roles = useRolesList();
  const [edit, setEdit] = useState<Edit | null>(null);
  const [asking, setAsking] = useState<string | null>(null);

  const items = roles.data?.items;
  const role = items?.find((r) => r.role_id === searchParams.get('role')) ?? items?.[0];
  const draft = edit && edit.roleId === role?.role_id ? edit.permissions : role?.permissions;
  const dirty = role && draft ? changedModules(role.permissions, draft).length > 0 : false;

  function select(roleId: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('role', roleId);
        return next;
      },
      { replace: true }
    );
    setEdit(null);
    setAsking(null);
  }

  function requestSelect(roleId: string) {
    if (roleId === role?.role_id) return;
    if (dirty) setAsking(roleId);
    else select(roleId);
  }

  if (roles.error) return <ErrorState error={roles.error} onRetry={() => roles.refetch()} />;
  if (!items || !role || !draft) {
    return <Skeleton className="h-[calc(559*var(--u))] w-full" />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[calc(300*var(--u))_minmax(0,1fr)] lg:gap-[calc(16*var(--u))]">
      <div className="lg:hidden">
        <Field label="Role">
          <Select value={role.role_id} onChange={(e) => requestSelect(e.target.value)}>
            {items.map((r) => (
              <option key={r.role_id} value={r.role_id}>
                {r.name}
                {r.protected ? ' (protected)' : ''}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <fieldset
        className={cn(
          jobsCardClass,
          'hidden min-h-0 min-w-0 overflow-y-auto p-2 lg:block lg:h-[calc(559*var(--u))]'
        )}
      >
        <legend className="sr-only">Role</legend>
        <ul className="flex flex-col gap-1">
          {items.map((r) => (
            <li key={r.role_id}>
              <label
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm',
                  'hover:bg-muted has-checked:bg-brand-50 has-focus-visible:outline-2 has-focus-visible:outline-brand-600',
                  'lg:min-h-[calc(52*var(--u))] lg:text-dense-md'
                )}
              >
                <input
                  type="radio"
                  name="permission-role"
                  className="sr-only"
                  checked={r.role_id === role.role_id}
                  onChange={() => requestSelect(r.role_id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-semibold text-[#202A3A]">
                    {r.name}
                    {r.protected && (
                      <>
                        <Lock className="size-3.5 shrink-0 text-ink-600" aria-hidden />
                        <span className="sr-only">Protected</span>
                      </>
                    )}
                  </span>
                  <span className="text-ink-600">
                    {r.users.toLocaleString('en-IN')} {r.users === 1 ? 'user' : 'users'}
                  </span>
                </span>
                <CategoryRoleStatusBadge status={r.status} />
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <RolePermissionsEditor
        key={role.role_id}
        role={role}
        draft={draft}
        onDraftChange={(next) => setEdit(next ? { roleId: role.role_id, permissions: next } : null)}
        onSaved={() => setEdit(null)}
      />

      <ConfirmDialog
        open={asking !== null}
        title="Discard unsaved changes?"
        message={`The changes to the permissions of ${role.name} have not been saved. If you switch roles they are lost.`}
        confirmLabel="Discard and switch"
        tone="danger"
        onCancel={() => setAsking(null)}
        onConfirm={() => asking && select(asking)}
      />
    </div>
  );
}
