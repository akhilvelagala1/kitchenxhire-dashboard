import type { Column } from '@/shared/components/DataTable';
import type { HireAdminRole } from '../schemas/adminCategoryRole';
import { CategoryRoleStatusBadge } from './CategoryRoleStatusBadge';
import { RoleRowActions, type RoleRowHandlers } from './RoleRowActions';

/*
 * Widths from the picture in design px. The checkbox column is fixed by DataTable and the last
 * column takes what is left. Below lg the card scrolls the table sideways instead of squeezing it.
 */
const TEXT = 'text-sm lg:text-[calc(14*var(--u))] text-[#202A3A]';

/** The four data columns after the checkbox. The row buttons report to `handlers`. */
export function buildRoleColumns(handlers: RoleRowHandlers): Column<HireAdminRole>[] {
  return [
    {
      id: 'name',
      header: 'Role Name',
      className: 'lg:w-[calc(160*var(--u))] lg:pl-2!',
      cell: (row) => <span className={`${TEXT} font-bold`}>{row.name}</span>
    },
    {
      id: 'users',
      header: 'Users',
      className: 'text-right lg:w-[calc(50*var(--u))]',
      cell: (row) => (
        <span className={`${TEXT} font-semibold`}>{row.users.toLocaleString('en-IN')}</span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      className: 'lg:w-[calc(84*var(--u))] lg:pl-4!',
      cell: (row) => <CategoryRoleStatusBadge status={row.status} />
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-center',
      cell: (row) => <RoleRowActions role={row} handlers={handlers} />
    }
  ];
}
