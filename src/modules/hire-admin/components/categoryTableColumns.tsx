import type { Column } from '@/shared/components/DataTable';
import type { HireAdminCategory } from '../schemas/adminCategoryRole';
import { CategoryBusinessTypePill } from './CategoryBusinessTypePill';
import { CategoryIconTile } from './CategoryIconTile';
import { CategoryRoleStatusBadge } from './CategoryRoleStatusBadge';
import { CategoryRowActions, type CategoryRowHandlers } from './CategoryRowActions';

/*
 * Column widths from the reference picture, in design px (the checkbox column is fixed by the
 * table section). The last column, Actions, takes what is left. Below lg the table scrolls
 * sideways inside the card, so the widths only apply from lg up.
 */
const COUNT = 'text-center font-semibold text-[#202A3A]';

/** The table's compact size is 10 design px and wins over a class on the cell, so the number sits in a span. */
const COUNT_TEXT = 'lg:text-[calc(13*var(--u))]';

/** The seven data columns after the checkbox. The row buttons report to `handlers`. */
export function buildCategoryColumns(handlers: CategoryRowHandlers): Column<HireAdminCategory>[] {
  return [
    {
      id: 'name',
      header: 'Category Name',
      className: 'lg:w-[calc(154*var(--u))] lg:max-w-[calc(154*var(--u))]',
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-2.5 lg:gap-[calc(9*var(--u))]">
          <CategoryIconTile icon={row.icon} />
          <span
            className="truncate text-sm font-bold text-[#111827] lg:text-[calc(13*var(--u))]"
            title={row.name}
          >
            {row.name}
          </span>
        </span>
      )
    },
    {
      id: 'code',
      header: 'Code',
      className: 'lg:w-[calc(124*var(--u))]',
      cell: (row) => (
        <span className="text-sm text-[#202A3A] lg:text-[calc(12*var(--u))]">{row.code}</span>
      )
    },
    {
      id: 'business_type',
      header: 'Business Type',
      className: 'lg:w-[calc(110*var(--u))]',
      cell: (row) => <CategoryBusinessTypePill type={row.business_type} />
    },
    {
      id: 'businesses',
      header: 'Businesses',
      className: `lg:w-[calc(70*var(--u))] ${COUNT}`,
      cell: (row) => <span className={COUNT_TEXT}>{row.businesses.toLocaleString('en-IN')}</span>
    },
    {
      id: 'outlets',
      header: 'Outlets',
      className: `lg:w-[calc(75*var(--u))] ${COUNT}`,
      cell: (row) => <span className={COUNT_TEXT}>{row.outlets.toLocaleString('en-IN')}</span>
    },
    {
      id: 'status',
      header: 'Status',
      className: 'lg:w-[calc(78*var(--u))]',
      cell: (row) => <CategoryRoleStatusBadge status={row.status} />
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-center',
      cell: (row) => <CategoryRowActions category={row} handlers={handlers} />
    }
  ];
}
