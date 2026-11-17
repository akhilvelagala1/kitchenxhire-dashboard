import type { Column } from '@/shared/components/DataTable';
import type { HireAdminBusiness } from '../schemas/adminBusiness';
import { BusinessCell, BusinessContactCell } from './businessCells';
import { BusinessKindBadge } from './BusinessKindBadge';
import { BusinessRowActions, type BusinessRowHandlers } from './BusinessRowActions';
import { BusinessStatusBadge } from './BusinessStatusBadge';
import { BusinessVerificationBadge } from './BusinessVerificationBadge';
import { formatJoinedOnDate } from './formatJoinedOnDate';

const SQUEEZE = 'max-w-0';

/** The data columns after the checkbox. The row buttons report to `handlers`. */
export function buildBusinessColumns(handlers: BusinessRowHandlers): Column<HireAdminBusiness>[] {
  return [
    {
      id: 'business_id',
      header: 'Business ID',
      className: 'w-[8%] min-w-[5.5rem]',
      cell: (row) => (
        <span className="text-[12px] font-semibold whitespace-nowrap text-[#263449]">
          {row.business_id}
        </span>
      )
    },
    {
      id: 'business',
      header: 'Business / Brand',
      sortKey: 'business_name',
      className: `${SQUEEZE} w-[18%] min-w-[12rem]`,
      cell: (row) => <BusinessCell name={row.business_name} area={row.area} city={row.city} />
    },
    {
      id: 'business_type',
      header: 'Business Type',
      className: 'w-[11%] min-w-[7.5rem]',
      cell: (row) => <BusinessKindBadge kind={row.business_type} />
    },
    {
      id: 'outlets',
      header: 'Outlets',
      className: 'w-[6%] min-w-[4rem] text-center',
      cell: (row) => (
        <span className="text-[13px] font-semibold tabular-nums text-[#202A3A]">
          {row.outlets.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      id: 'contact',
      header: 'Primary Contact',
      className: `${SQUEEZE} w-[14%] min-w-[9rem]`,
      cell: (row) => <BusinessContactCell owner={row.owner_name} phone={row.phone} />
    },
    {
      id: 'verification',
      header: 'Verification',
      className: 'w-[10%] min-w-[6.5rem]',
      cell: (row) => <BusinessVerificationBadge verification={row.verification} />
    },
    {
      id: 'joined_at',
      header: 'Joined On',
      sortKey: 'joined_at',
      className: 'w-[10%] min-w-[7rem]',
      cell: (row) => (
        <span className="text-[12px] whitespace-nowrap text-[#202A3A]">
          {formatJoinedOnDate(row.joined_at)}
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      className: 'w-[8%] min-w-[6rem]',
      cell: (row) => <BusinessStatusBadge status={row.status} />
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-[9%] min-w-[6.5rem] text-center',
      cell: (row) => (
        <div className="flex items-center justify-center">
          <BusinessRowActions business={row} handlers={handlers} />
        </div>
      )
    }
  ];
}
