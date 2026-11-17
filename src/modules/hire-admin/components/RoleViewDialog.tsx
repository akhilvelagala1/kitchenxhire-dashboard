import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { AuditTrail } from '@/shared/components/AuditTrail';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_MODULES,
  PERMISSION_MODULE_LABELS,
  type HireAdminRole
} from '../schemas/adminCategoryRole';
import { CategoryRoleStatusBadge } from './CategoryRoleStatusBadge';
import { countGranted } from './permissionGrid';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-2.5">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-medium break-words text-ink">{children}</dd>
    </div>
  );
}

function RoleDetails({ role }: { role: HireAdminRole }) {
  const { granted, total } = countGranted(role.permissions);
  return (
    <div className="max-h-[60vh] overflow-y-auto pr-1">
      {role.protected && (
        <p className="mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-ink-600">
          <Lock className="size-4 shrink-0" aria-hidden />
          Protected system role. It cannot be deactivated, deleted or have its permissions changed.
        </p>
      )}
      <dl>
        <Row label="Status">
          <CategoryRoleStatusBadge status={role.status} />
        </Row>
        <Row label="Users">{role.users.toLocaleString('en-IN')}</Row>
        <Row label="Description">{role.description || 'No description'}</Row>
        <Row label="Permissions granted">{`${granted} of ${total}`}</Row>
      </dl>
      <h3 className="mt-3 mb-1 font-semibold">Permissions</h3>
      <dl>
        {PERMISSION_MODULES.map((module) => {
          const actions = role.permissions[module] ?? [];
          return (
            <Row key={module} label={PERMISSION_MODULE_LABELS[module]}>
              {actions.length > 0
                ? actions.map((a) => PERMISSION_ACTION_LABELS[a]).join(', ')
                : 'No access'}
            </Row>
          );
        })}
      </dl>
      <h3 className="mt-3 mb-2 font-semibold">History</h3>
      <AuditTrail entityType="hire_role" entityId={role.role_id} />
    </div>
  );
}

/** Read-only details of one role. People who can manage roles can go on to edit from here. */
export function RoleViewDialog({
  role,
  onClose,
  onEdit,
  onEditPermissions
}: {
  role: HireAdminRole | undefined;
  onClose: () => void;
  onEdit: (role: HireAdminRole) => void;
  onEditPermissions: (role: HireAdminRole) => void;
}) {
  return (
    <Dialog
      open={role !== undefined}
      onClose={onClose}
      title={role ? `${role.name} (${role.role_id})` : 'Role details'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <PermissionGate permission={P.manage}>
            <Button variant="secondary" onClick={() => role && onEdit(role)}>
              Edit
            </Button>
            {role && !role.protected && (
              <Button onClick={() => onEditPermissions(role)}>Edit permissions</Button>
            )}
          </PermissionGate>
        </>
      }
    >
      {role && <RoleDetails role={role} />}
    </Dialog>
  );
}
