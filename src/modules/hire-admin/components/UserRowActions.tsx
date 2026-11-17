import { Eye, Pencil } from 'lucide-react';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminUser, UserSettableStatus } from '../schemas/adminUser';
import { UserActionMenu } from './UserActionMenu';

/** What the row's buttons ask the table section to do. */
export interface UserRowHandlers {
  onView: (user: HireAdminUser) => void;
  onEdit: (user: HireAdminUser) => void;
  onSetStatus: (user: HireAdminUser, status: UserSettableStatus) => void;
}

/** Plain icon buttons as in the picture: 44px on a phone, 34 design px from lg. */
const ICON_BUTTON =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-650 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 lg:size-8.5';

/** The table's last column. Everyone with view access can open a user; changes need manage. */
export function UserRowActions({
  user,
  handlers
}: {
  user: HireAdminUser;
  handlers: UserRowHandlers;
}) {
  const id = user.user_id;

  return (
    <div className="flex items-center gap-1 lg:justify-end">
      <button
        type="button"
        aria-label={`View user ${id}`}
        className={ICON_BUTTON}
        onClick={() => handlers.onView(user)}
      >
        <Eye className="size-4" aria-hidden />
      </button>
      <PermissionGate permission={P.manage}>
        <button
          type="button"
          aria-label={`Edit user ${id}`}
          className={ICON_BUTTON}
          onClick={() => handlers.onEdit(user)}
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <UserActionMenu
          user={user}
          triggerClassName={ICON_BUTTON}
          onSetStatus={handlers.onSetStatus}
        />
      </PermissionGate>
    </div>
  );
}
