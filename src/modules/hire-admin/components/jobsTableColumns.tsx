import { User } from 'lucide-react';
import type { Column } from '@/shared/components/DataTable';
import { cn } from '@/shared/lib/cn';
import type { HireAdminJob } from '../schemas/adminJob';
import { CELL_PRIMARY } from './applicationCells';
import { formatPostedOn } from './formatPostedOn';
import { HireJobStatusBadge } from './HireJobStatusBadge';
import { JobRowActions } from './JobRowActions';
import { jobCategoryBadgeClass, jobLabelIcon } from './jobCategoryVisuals';

const SQUEEZE = 'max-w-0';
const SECONDARY =
  'flex min-w-0 items-center gap-1 text-[12px] font-normal leading-4 text-[#64748B]';

export const jobsTableColumns: Column<HireAdminJob>[] = [
  {
    id: 'job_id',
    header: 'Job ID',
    sortKey: 'job_id',
    className: 'w-[10%] min-w-[6.5rem]',
    cell: (row) => <span className={`${CELL_PRIMARY} whitespace-nowrap`}>{row.job_id}</span>
  },
  {
    id: 'title',
    header: 'Job Title',
    sortKey: 'title',
    className: `${SQUEEZE} w-[18%] min-w-[11rem]`,
    cell: (row) => {
      const Icon = jobLabelIcon(row.title);
      return (
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-[#FFEBE4] text-brand-600"
          >
            <Icon className="size-4" />
          </span>
          <span className={CELL_PRIMARY} title={row.title}>
            {row.title}
          </span>
        </span>
      );
    }
  },
  {
    id: 'business',
    header: 'Recruiter / Outlet',
    className: `${SQUEEZE} w-[16%] min-w-[10rem]`,
    cell: (row) => (
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={CELL_PRIMARY} title={row.business_name}>
          {row.business_name}
        </span>
        <span className={SECONDARY} title={row.recruiter_name}>
          <User aria-hidden className="size-3 shrink-0" />
          <span className="truncate">{row.recruiter_name}</span>
        </span>
      </span>
    )
  },
  {
    id: 'category',
    header: 'Category',
    className: 'w-[11%] min-w-[7rem]',
    cell: (row) => (
      <span
        className={cn(
          'inline-flex min-h-[23px] items-center rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
          jobCategoryBadgeClass(row.category)
        )}
      >
        {row.category}
      </span>
    )
  },
  {
    id: 'applications',
    header: 'Applications / Hired',
    sortKey: 'applications_count',
    className: 'w-[12%] min-w-[7.5rem] text-center',
    cell: (row) => (
      <span className={`${CELL_PRIMARY} tabular-nums`}>
        {row.applications_count.toLocaleString('en-IN')} /{' '}
        {row.recruited_count.toLocaleString('en-IN')}
      </span>
    )
  },
  {
    id: 'posted',
    header: 'Posted On',
    sortKey: 'posted_at',
    className: 'w-[13%] min-w-[9rem]',
    cell: (row) => (
      <span className={`${CELL_PRIMARY} whitespace-nowrap`}>{formatPostedOn(row.posted_at)}</span>
    )
  },
  {
    id: 'status',
    header: 'Status',
    sortKey: 'status',
    className: 'w-[10%] min-w-[7.5rem]',
    cell: (row) => <HireJobStatusBadge status={row.status} />
  },
  {
    id: 'actions',
    header: 'Actions',
    className: 'w-[10%] min-w-[7.5rem] text-center',
    cell: (row) => (
      <div className="flex items-center justify-center">
        <JobRowActions job={row} />
      </div>
    )
  }
];
