import { Eye, Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminJobSeeker } from '../schemas/adminJobSeeker';
import { JobSeekerActionMenu } from './JobSeekerActionMenu';

/** Square bordered buttons: 44px on a phone, 34 design px from lg. */
const ICON_BUTTON =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#E9ECF2] bg-white text-ink-650 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 lg:size-8.5';

/** The table's last column. Everyone with view access can open a job seeker; changes need manage. */
export function JobSeekerRowActions({ jobSeeker }: { jobSeeker: HireAdminJobSeeker }) {
  const id = jobSeeker.job_seeker_id;

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        to={`/admin/job-seekers/${id}`}
        aria-label={`View job seeker ${id}`}
        className={ICON_BUTTON}
      >
        <Eye className="size-4" aria-hidden />
      </Link>
      <PermissionGate permission={P.manage}>
        <Link
          to={`/admin/job-seekers/${id}/edit`}
          aria-label={`Edit job seeker ${id}`}
          className={ICON_BUTTON}
        >
          <Pencil className="size-4" aria-hidden />
        </Link>
        <JobSeekerActionMenu jobSeeker={jobSeeker} triggerClassName={ICON_BUTTON} />
      </PermissionGate>
    </div>
  );
}
