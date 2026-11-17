import { Eye, Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminJob } from '../schemas/adminJob';
import { JobRowActionsMenu } from './JobRowActionsMenu';

const ICON_BUTTON =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-[#E4E9F0] bg-white text-[#344054] hover:border-[#FFB69D] hover:bg-[#FFF4EF] hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600';

/** View, Edit and more-menu actions for one Jobs table row. */
export function JobRowActions({ job }: { job: HireAdminJob }) {
  const id = job.job_id;

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Link to={`/admin/jobs/${id}`} aria-label={`View job ${id}`} className={ICON_BUTTON}>
        <Eye className="size-4" aria-hidden />
      </Link>
      <PermissionGate permission={P.manage}>
        <Link to={`/admin/jobs/${id}/edit`} aria-label={`Edit job ${id}`} className={ICON_BUTTON}>
          <Pencil className="size-4" aria-hidden />
        </Link>
      </PermissionGate>
      <JobRowActionsMenu job={job} triggerClassName={ICON_BUTTON} />
    </div>
  );
}
