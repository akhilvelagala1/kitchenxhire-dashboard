import { Lock } from 'lucide-react';
import { AuditTrail } from '@/shared/components/AuditTrail';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { usePermissions } from '@/shared/auth/usePermissions';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminRole, RolePermissions } from '../schemas/adminCategoryRole';
import { jobsCardClass } from './jobsCardStyles';
import { PermissionMatrix } from './PermissionMatrix';
import { changedModules, countGranted } from './permissionGrid';
import { useSetRolePermissions } from './roleMutations';

/**
 * The right side of the Roles & Permissions tab: the matrix of one role with Save and Reset, and
 * below it that role's permission history. The edited matrix lives in the tab, so it can warn
 * before the person switches to another role.
 */
export function RolePermissionsEditor({
  role,
  draft,
  onDraftChange,
  onSaved
}: {
  role: HireAdminRole;
  draft: RolePermissions;
  onDraftChange: (next: RolePermissions | null) => void;
  onSaved: () => void;
}) {
  const { can } = usePermissions();
  const save = useSetRolePermissions(role.role_id);
  const readOnly = role.protected || !can(P.manage);
  const changed = changedModules(role.permissions, draft).length;
  const { granted, total } = countGranted(draft);

  return (
    <section
      aria-label={`Permissions of ${role.name}`}
      className={cn(jobsCardClass, 'flex min-w-0 flex-col lg:h-[calc(559*var(--u))]')}
    >
      <div className="px-4 pt-4 lg:px-[calc(20*var(--u))] lg:pt-[calc(18*var(--u))]">
        <h2 className="text-lg font-bold text-[#141824] lg:text-[calc(18*var(--u))]">
          {role.name}
        </h2>
        <p className="mt-0.5 text-sm text-ink-600 lg:text-dense-md">
          {role.description || 'No description'} · {granted} of {total} permissions granted
        </p>
        {role.protected && (
          <p className="mt-2 flex items-start gap-2 rounded-lg bg-[#FFF4D6] px-3 py-2 text-sm text-[#7A4B00] lg:text-dense-md">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            Super Admin and Admin permissions are protected so an administrator cannot lock
            themselves out
          </p>
        )}
      </div>

      <div className="mx-4 mt-3 min-h-0 flex-1 overflow-auto rounded-lg border border-[#EEF0F4] lg:mx-[calc(20*var(--u))] lg:min-h-[calc(120*var(--u))]">
        <PermissionMatrix permissions={draft} readOnly={readOnly} onChange={onDraftChange} />
      </div>

      <PermissionGate permission={P.manage}>
        <div className="sticky bottom-0 mx-4 mt-3 flex flex-wrap items-center justify-end gap-2 lg:mx-[calc(20*var(--u))]">
          {changed > 0 && (
            <span role="status" className="mr-auto text-sm text-ink-600 lg:text-dense-md">
              Unsaved changes in {changed} {changed === 1 ? 'module' : 'modules'}
            </span>
          )}
          <Button
            variant="secondary"
            disabled={changed === 0 || save.isPending}
            onClick={() => onDraftChange(null)}
          >
            Reset
          </Button>
          <Button
            disabled={changed === 0 || readOnly}
            loading={save.isPending}
            onClick={() => save.mutate(draft, { onSuccess: onSaved })}
          >
            Save changes
          </Button>
        </div>
      </PermissionGate>

      <div className="mx-4 mt-3 mb-4 max-h-36 overflow-auto lg:mx-[calc(20*var(--u))] lg:mb-[calc(14*var(--u))] lg:max-h-[calc(110*var(--u))]">
        <h3 className="mb-2 text-sm font-semibold text-ink lg:text-dense-md">Permission history</h3>
        <AuditTrail entityType="hire_role" entityId={role.role_id} />
      </div>
    </section>
  );
}
