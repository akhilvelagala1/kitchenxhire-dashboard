import { PermissionGate } from '@/shared/components/PermissionGate';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminUser } from '../schemas/adminUser';
import { formatLastLogin } from './formatLastLogin';
import { UserCell, UserRoleBadge } from './userCells';
import { UserStatusBadge } from './UserStatusBadge';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-2.5">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-medium text-ink">{children}</dd>
    </div>
  );
}

/** Read-only details of one user. People who can manage users can go on to edit from here. */
export function UserViewDialog({
  user,
  onClose,
  onEdit
}: {
  user: HireAdminUser | undefined;
  onClose: () => void;
  onEdit: (user: HireAdminUser) => void;
}) {
  return (
    <Dialog
      open={user !== undefined}
      onClose={onClose}
      title="User details"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <PermissionGate permission={P.manage}>
            <Button onClick={() => user && onEdit(user)}>Edit</Button>
          </PermissionGate>
        </>
      }
    >
      {user && (
        <div className="grid gap-3">
          <UserCell id={user.user_id} name={user.name} email={user.email} size="lg" />
          <dl className="text-sm">
            <Row label="User ID">{user.user_id}</Row>
            <Row label="Role">
              <UserRoleBadge role={user.role} />
            </Row>
            <Row label="Department">{user.department}</Row>
            <Row label="Access scope">{user.access_scope}</Row>
            <Row label="Status">
              <UserStatusBadge status={user.status} />
            </Row>
            <Row label="Last login">
              {formatLastLogin(user.last_login_at, user.status === 'pending')}
            </Row>
            <Row label="Created">{formatLastLogin(user.created_at, false)}</Row>
          </dl>
        </div>
      )}
    </Dialog>
  );
}
