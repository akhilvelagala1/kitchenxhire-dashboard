import type { Column } from '@/shared/components/DataTable';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { ApplicationRowActions } from './ApplicationRowActions';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { CELL_PRIMARY, CandidateCell, JobCell, OutletCell } from './applicationCells';
import { formatAppliedOn } from './formatAppliedOn';
import { jobLabelIcon } from './jobCategoryVisuals';

/*
 * Column shares tuned so the full row (through Actions) fits the Applications card on desktop
 * without sideways scroll. Long names truncate; tooltips keep the full value.
 */
const SQUEEZE = 'max-w-0';

export const applicationsTableColumns: Column<HireAdminApplication>[] = [
  {
    id: 'application_id',
    header: 'Application ID',
    className: 'w-[9%] min-w-[6.5rem]',
    cell: (row) => <span className={`${CELL_PRIMARY} whitespace-nowrap`}>{row.application_id}</span>
  },
  {
    id: 'candidate',
    header: 'Candidate',
    className: `${SQUEEZE} w-[18%] min-w-[11rem]`,
    cell: (row) => <CandidateCell name={row.candidate_name} location={row.candidate_location} />
  },
  {
    id: 'job',
    header: 'Applied For (Job)',
    className: `${SQUEEZE} w-[18%] min-w-[11rem]`,
    cell: (row) => {
      const Icon = jobLabelIcon(row.job_title);
      return (
        <JobCell icon={<Icon className="size-4" />} title={row.job_title} type={row.job_type} />
      );
    }
  },
  {
    id: 'recruiter',
    header: 'Recruiter / Outlet',
    className: `${SQUEEZE} w-[16%] min-w-[10rem]`,
    cell: (row) => <OutletCell outlet={row.outlet_name} recruiter={row.recruiter_name} />
  },
  {
    id: 'applied_at',
    header: 'Applied On',
    sortKey: 'applied_at',
    className: 'w-[13%] min-w-[9rem]',
    cell: (row) => (
      <span className={`${CELL_PRIMARY} whitespace-nowrap`}>{formatAppliedOn(row.applied_at)}</span>
    )
  },
  {
    id: 'status',
    header: 'Status',
    className: 'w-[12%] min-w-[8.5rem]',
    cell: (row) => <ApplicationStatusBadge status={row.status} />
  },
  {
    id: 'actions',
    header: 'Actions',
    className: 'w-[10%] min-w-[7.5rem] text-center',
    cell: (row) => (
      <div className="flex items-center justify-center">
        <ApplicationRowActions application={row} />
      </div>
    )
  }
];
