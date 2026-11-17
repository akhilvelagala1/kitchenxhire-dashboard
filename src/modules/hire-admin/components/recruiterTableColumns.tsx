import type { Column } from '@/shared/components/DataTable';
import type { HireAdminRecruiter } from '../schemas/adminRecruiter';
import { formatAppliedOn } from './formatAppliedOn';
import { RecruiterCompanyCell, RecruiterContactCell, RecruiterPersonCell } from './recruiterCells';
import { RecruiterRowActions } from './RecruiterRowActions';
import { RecruiterStatusBadge } from './RecruiterStatusBadge';
import { RecruiterVerificationBadge } from './RecruiterVerificationBadge';

const COUNT = 'text-center';
const SQUEEZE = 'max-w-0';

const count = (value: number) => (
  <span className="text-[12px] font-medium tabular-nums text-[#202A3A]">
    {value.toLocaleString('en-IN')}
  </span>
);

export const recruiterTableColumns: Column<HireAdminRecruiter>[] = [
  {
    id: 'recruiter_id',
    header: 'Recruiter ID',
    sortKey: 'recruiter_id',
    className: 'w-[8%] min-w-[5.5rem]',
    cell: (row) => (
      <span className="text-[12px] font-semibold whitespace-nowrap text-[#263449]">
        {row.recruiter_id}
      </span>
    )
  },
  {
    id: 'recruiter',
    header: 'Recruiter',
    sortKey: 'owner_name',
    className: `${SQUEEZE} w-[13%] min-w-[9.5rem]`,
    cell: (row) => <RecruiterPersonCell name={row.owner_name} />
  },
  {
    id: 'contact',
    header: 'Contact Details',
    className: `${SQUEEZE} w-[14%] min-w-[9.5rem]`,
    cell: (row) => <RecruiterContactCell email={row.email} phone={row.phone} />
  },
  {
    id: 'company',
    header: 'Business / Outlet',
    sortKey: 'business_name',
    className: `${SQUEEZE} w-[14%] min-w-[9.5rem]`,
    cell: (row) => <RecruiterCompanyCell name={row.business_name} area={row.area} city={row.city} />
  },
  {
    id: 'verification',
    header: 'Verification',
    className: 'w-[9%] min-w-[6.5rem] text-center',
    cell: (row) => (
      <div className="flex justify-center">
        <RecruiterVerificationBadge verification={row.verification} />
      </div>
    )
  },
  {
    id: 'open_jobs',
    header: 'Jobs Posted',
    className: `${COUNT} w-[7%] min-w-[4.5rem]`,
    cell: (row) => count(row.open_jobs)
  },
  {
    id: 'applications',
    header: 'Applications',
    className: `${COUNT} w-[7%] min-w-[4.5rem]`,
    cell: (row) => count(row.applications)
  },
  {
    id: 'last_login',
    header: 'Last Login',
    sortKey: 'last_login_at',
    className: 'w-[11%] min-w-[8rem]',
    cell: (row) => (
      <span className="text-[12px] whitespace-nowrap text-[#202A3A]">
        {row.last_login_at ? formatAppliedOn(row.last_login_at) : 'Never'}
      </span>
    )
  },
  {
    id: 'status',
    header: 'Status',
    className: 'w-[8%] min-w-[5.5rem] text-center',
    cell: (row) => (
      <div className="flex justify-center">
        <RecruiterStatusBadge status={row.status} />
      </div>
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    className: 'w-[9%] min-w-[6.5rem] text-center',
    cell: (row) => (
      <div className="flex items-center justify-center">
        <RecruiterRowActions recruiter={row} />
      </div>
    )
  }
];
