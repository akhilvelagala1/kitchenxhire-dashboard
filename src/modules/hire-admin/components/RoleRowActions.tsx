import { Eye, Pencil } from 'lucide-react';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminRole, RoleStatus } from '../schemas/adminCategoryRole';
import { RoleActionMenu } from './RoleActionMenu';
import { ROW_ICON_BUTTON } from './rowIconButton';

/** What the row's buttons ask the roles panel to do. */
export interface RoleRowHandlers {
  onView: (role: HireAdminRole) => void;
  onEdit: (role: HireAdminRole) => void;
  onSetStatus: (role: HireAdminRole, status: RoleStatus) => void;
  onDelete: (role: HireAdminRole) => void;
}

/** The table's last column. Everyone with view access can open a role; changes need manage. */
export function RoleRowActions({
  role,
  handlers
}: {
  role: HireAdminRole;
  handlers: RoleRowHandlers;
}) {
  return (
    <div className="flex items-center gap-1 lg:justify-center lg:gap-0">
      <button
        type="button"
        aria-label={`View permissions of ${role.name}`}
        className={ROW_ICON_BUTTON}
        onClick={() => handlers.onView(role)}
      >
        <Eye className="size-4" aria-hidden />
      </button>
      <PermissionGate permission={P.manage}>
        <button
          type="button"
          aria-label={`Edit role ${role.name}`}
          className={ROW_ICON_BUTTON}
          onClick={() => handlers.onEdit(role)}
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <RoleActionMenu
          role={role}
          triggerClassName={ROW_ICON_BUTTON}
          onSetStatus={handlers.onSetStatus}
          onDelete={handlers.onDelete}
        />
      </PermissionGate>
    </div>
  );
}
