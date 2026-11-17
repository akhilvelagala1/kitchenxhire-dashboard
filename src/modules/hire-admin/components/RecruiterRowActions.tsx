import { Eye, Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminRecruiter } from '../schemas/adminRecruiter';
import { RecruiterActionMenu } from './RecruiterActionMenu';

/** Square bordered buttons: 44px on a phone, 35 design px from lg. */
const ICON_BUTTON =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-white text-ink-650 hover:border-brand-600 hover:bg-[#FFF5F0] hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 lg:size-[35px]';

/** The table's last column. Everyone with view access can open the recruiter; changes need manage. */
export function RecruiterRowActions({ recruiter }: { recruiter: HireAdminRecruiter }) {
  const id = recruiter.recruiter_id;

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        to={`/admin/recruiters/${id}`}
        aria-label={`View recruiter ${id}`}
        className={ICON_BUTTON}
      >
        <Eye className="size-4" aria-hidden />
      </Link>
      <PermissionGate permission={P.manage}>
        <Link
          to={`/admin/recruiters/${id}/edit`}
          aria-label={`Edit recruiter ${id}`}
          className={ICON_BUTTON}
        >
          <Pencil className="size-4" aria-hidden />
        </Link>
        <RecruiterActionMenu recruiter={recruiter} triggerClassName={ICON_BUTTON} />
      </PermissionGate>
    </div>
  );
}
