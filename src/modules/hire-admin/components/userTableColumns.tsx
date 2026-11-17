import type { Column } from '@/shared/components/DataTable';
import type { HireAdminUser } from '../schemas/adminUser';
import { formatLastLogin } from './formatLastLogin';
import { UserCell, UserRoleBadge } from './userCells';
import { UserRowActions, type UserRowHandlers } from './UserRowActions';
import { UserStatusBadge } from './UserStatusBadge';

const SQUEEZE = 'max-w-0';

/** The data columns after the checkbox. The row buttons report to `handlers`. */
export function buildUserColumns(handlers: UserRowHandlers): Column<HireAdminUser>[] {
  return [
    {
      id: 'user_id',
      header: 'User ID',
      sortKey: 'user_id',
      className: 'w-[9%] min-w-[5.5rem]',
      cell: (row) => (
        <span className="text-[12px] font-semibold whitespace-nowrap text-[#263449]">
          {row.user_id}
        </span>
      )
    },
    {
      id: 'user',
      header: 'User',
      sortKey: 'name',
      className: `${SQUEEZE} w-[20%] min-w-[12rem]`,
      cell: (row) => <UserCell id={row.user_id} name={row.name} email={row.email} />
    },
    {
      id: 'role',
      header: 'Role',
      className: 'w-[12%] min-w-[7rem]',
      cell: (row) => <UserRoleBadge role={row.role} />
    },
    {
      id: 'department',
      header: 'Department',
      className: `${SQUEEZE} w-[12%] min-w-[7.5rem]`,
      cell: (row) => (
        <span
          className="block truncate text-[12px] font-medium text-[#202A3A]"
          title={row.department}
        >
          {row.department}
        </span>
      )
    },
    {
      id: 'access_scope',
      header: 'Access Scope',
      className: `${SQUEEZE} w-[14%] min-w-[8.5rem]`,
      cell: (row) => (
        <span className="block truncate text-[12px] text-[#202A3A]" title={row.access_scope}>
          {row.access_scope}
        </span>
      )
    },
    {
      id: 'last_login_at',
      header: 'Last Login',
      sortKey: 'last_login_at',
      className: 'w-[12%] min-w-[7.5rem]',
      cell: (row) => (
        <span className="text-[12px] whitespace-nowrap text-[#202A3A]">
          {formatLastLogin(row.last_login_at, row.status === 'pending')}
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      className: 'w-[9%] min-w-[5.5rem]',
      cell: (row) => <UserStatusBadge status={row.status} />
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-[10%] min-w-[6.5rem] text-center',
      cell: (row) => (
        <div className="flex items-center justify-center">
          <UserRowActions user={row} handlers={handlers} />
        </div>
      )
    }
  ];
}
