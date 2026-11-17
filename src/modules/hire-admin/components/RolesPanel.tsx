import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataTable } from '@/shared/components/DataTable';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminRole, RoleStatus } from '../schemas/adminCategoryRole';
import { jobsCardClass } from './jobsCardStyles';
import { useDeleteRole, useSetRoleStatus } from './roleMutations';
import { buildRoleColumns } from './roleTableColumns';
import { useRolesList } from './rolesQuery';

/*
 * Fine-tuning of the shared DataTable (compact density) for the picture: a 40 design px header on
 * #F5F6FA with rounded ends, rows about 43 high, and a fixed 40 wide checkbox column from lg.
 */
const TABLE_TUNE = [
  '[&_table]:border-separate [&_table]:border-spacing-0',
  '[&_thead_th]:bg-[#F5F6FA] [&_thead_th]:font-semibold [&_thead_th]:uppercase',
  '[&_thead_th:first-child]:rounded-l-lg [&_thead_th:last-child]:rounded-r-lg',
  '[&_tbody_td]:border-t [&_tbody_td]:border-[#EEF0F4] [&_tbody_tr:last-child_td]:border-b',
  'lg:[&_thead_th]:h-[calc(40*var(--u))] lg:[&_thead_th]:text-dense-sm lg:[&_tbody_td]:h-[calc(42.5*var(--u))]',
  'lg:[&_tr>:first-child]:w-[calc(40*var(--u))] lg:[&_tr>:first-child]:pl-2'
].join(' ');

type Pending = { kind: 'deactivate' | 'delete'; role: HireAdminRole } | null;

/** The System Roles card. Opening a role to view, add or edit is reported to the page, which owns the dialogs. */
export function RolesPanel({
  onAddRole,
  onViewRole,
  onEditRole
}: {
  onAddRole: () => void;
  onViewRole: (role: HireAdminRole) => void;
  onEditRole: (role: HireAdminRole) => void;
}) {
  const list = useRolesList();
  const selection = useRowSelection();
  const setStatus = useSetRoleStatus();
  const remove = useDeleteRole();
  const [pending, setPending] = useState<Pending>(null);

  const columns = useMemo(
    () =>
      buildRoleColumns({
        onView: onViewRole,
        onEdit: onEditRole,
        onSetStatus: (role: HireAdminRole, status: RoleStatus) => {
          if (status === 'active') setStatus.mutate({ roleId: role.role_id, status });
          else setPending({ kind: 'deactivate', role });
        },
        onDelete: (role: HireAdminRole) => setPending({ kind: 'delete', role })
      }),
    // `mutate` is stable, and the handlers only use setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onViewRole, onEditRole]
  );

  const total = list.data?.meta.total;
  const shown = list.data?.items.length ?? 0;
  const deleting = pending?.kind === 'delete';

  function confirm() {
    if (!pending) return;
    const { role } = pending;
    const done = { onSuccess: () => setPending(null) };
    if (deleting) {
      remove.mutate(role.role_id, {
        onSuccess: () => {
          selection.clear();
          setPending(null);
        }
      });
    } else setStatus.mutate({ roleId: role.role_id, status: 'inactive' }, done);
  }

  return (
    <section
      aria-label="System Roles"
      className={cn(
        jobsCardClass,
        'flex min-w-0 flex-col p-3 lg:min-h-[calc(559*var(--u))] lg:px-[calc(15*var(--u))] lg:pt-[calc(20*var(--u))] lg:pb-[calc(33*var(--u))]'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 lg:px-[calc(8*var(--u))]">
        <div className="min-w-0 lg:-mt-[calc(4*var(--u))]">
          <h2 className="text-lg font-bold text-[#141824] lg:text-[calc(20*var(--u))]">
            System Roles
          </h2>
          <p className="mt-1 text-sm text-ink-600 lg:text-dense-md">
            Manage roles and their permissions.
          </p>
        </div>
        <PermissionGate permission={P.manage}>
          <Button
            onClick={onAddRole}
            className="lg:h-[calc(40*var(--u))] lg:min-h-0 lg:w-[calc(120*var(--u))] lg:rounded-[calc(8*var(--u))] lg:px-0 lg:text-dense-md"
          >
            <Plus className="size-4" aria-hidden />
            Add Role
          </Button>
        </PermissionGate>
      </div>

      <div className="mt-4 min-h-0 flex-1 lg:mt-[calc(16*var(--u))]">
        <PermissionGate permission={P.manage}>
          <BulkActionBar compact count={selection.selected.size} onClear={selection.clear}>
            {null}
          </BulkActionBar>
        </PermissionGate>
        <div className={TABLE_TUNE}>
          <DataTable<HireAdminRole>
            density="compact"
            framed={false}
            columns={columns}
            rows={list.data?.items}
            getRowId={(row) => row.role_id}
            isLoading={list.isLoading}
            error={list.error}
            onRetry={() => list.refetch()}
            selection={selection}
            empty={{
              title: 'No roles yet',
              description: 'Add a role to start giving people access.'
            }}
            caption={`System roles - ${total ?? 0} total`}
          />
        </div>
      </div>

      <p className="mt-3 px-1 text-sm text-ink-600 lg:mt-[calc(14*var(--u))] lg:px-[calc(8*var(--u))] lg:text-dense-md">
        {total === undefined
          ? ''
          : total === 0
            ? 'Showing 0 roles'
            : `Showing 1 – ${shown} of ${total.toLocaleString('en-IN')} roles`}
      </p>

      <ConfirmDialog
        open={pending !== null}
        title={deleting ? 'Delete this role?' : 'Deactivate this role?'}
        message={
          !pending
            ? ''
            : deleting
              ? `${pending.role.name} will be removed for good. This cannot be undone.`
              : `${pending.role.name} will be marked as Inactive. You can activate it again later.`
        }
        confirmLabel={deleting ? 'Delete role' : 'Deactivate'}
        tone="danger"
        loading={setStatus.isPending || remove.isPending}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </section>
  );
}
