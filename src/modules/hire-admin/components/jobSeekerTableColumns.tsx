import type { Column } from '@/shared/components/DataTable';
import type { HireAdminJobSeeker } from '../schemas/adminJobSeeker';
import { formatAppliedOn } from './formatAppliedOn';
import {
  JobSeekerCell,
  JobSeekerCompletionCell,
  JobSeekerContactCell,
  JobSeekerLocationCell
} from './jobSeekerCells';
import { JobSeekerRowActions } from './JobSeekerRowActions';
import { JobSeekerStatusBadge } from './JobSeekerStatusBadge';

const COUNT = 'text-center';
const SQUEEZE = 'max-w-0';

const count = (value: number) => (
  <span className="text-[13px] font-semibold tabular-nums text-[#202A3A]">
    {value.toLocaleString('en-IN')}
  </span>
);

export const jobSeekerTableColumns: Column<HireAdminJobSeeker>[] = [
  {
    id: 'job_seeker_id',
    header: 'Seeker ID',
    className: 'w-[8%] min-w-[5.5rem]',
    cell: (row) => (
      <span className="text-[12px] font-semibold whitespace-nowrap text-[#263449]">
        {row.job_seeker_id}
      </span>
    )
  },
  {
    id: 'job_seeker',
    header: 'Job Seeker',
    sortKey: 'name',
    className: `${SQUEEZE} w-[15%] min-w-[10rem]`,
    cell: (row) => <JobSeekerCell id={row.job_seeker_id} name={row.name} email={row.email} />
  },
  {
    id: 'contact',
    header: 'Contact Details',
    className: `${SQUEEZE} w-[15%] min-w-[10rem]`,
    cell: (row) => <JobSeekerContactCell email={row.email} phone={row.phone} />
  },
  {
    id: 'location',
    header: 'Location',
    className: `${SQUEEZE} w-[10%] min-w-[7rem]`,
    cell: (row) => <JobSeekerLocationCell city={row.city} state={row.state} />
  },
  {
    id: 'profile_completion',
    header: 'Profile Completion',
    sortKey: 'profile_completion',
    className: 'w-[9%] min-w-[6.5rem]',
    cell: (row) => <JobSeekerCompletionCell value={row.profile_completion} />
  },
  {
    id: 'applications',
    header: 'Applications',
    sortKey: 'applications_count',
    className: `${COUNT} w-[6%] min-w-[4.5rem]`,
    cell: (row) => count(row.applications_count)
  },
  {
    id: 'interviews',
    header: 'Interviews',
    className: `${COUNT} w-[6%] min-w-[4.5rem]`,
    cell: (row) => count(row.interviews_count)
  },
  {
    id: 'last_active',
    header: 'Last Active',
    sortKey: 'last_active_at',
    className: 'w-[12%] min-w-[8.5rem]',
    cell: (row) => (
      <span className="text-[11px] font-medium whitespace-nowrap text-[#202A3A]">
        {row.last_active_at ? formatAppliedOn(row.last_active_at) : 'Never'}
      </span>
    )
  },
  {
    id: 'status',
    header: 'Account Status',
    className: 'w-[8%] min-w-[6.5rem] text-center',
    cell: (row) => (
      <div className="flex justify-center">
        <JobSeekerStatusBadge status={row.status} />
      </div>
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    className: 'w-[8%] min-w-[6.5rem] text-center',
    cell: (row) => (
      <div className="flex items-center justify-center">
        <JobSeekerRowActions jobSeeker={row} />
      </div>
    )
  }
];
