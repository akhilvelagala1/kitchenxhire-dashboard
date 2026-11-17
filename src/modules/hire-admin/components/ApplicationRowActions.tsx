import { CalendarDays, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { ApplicationActionMenu } from './ApplicationActionMenu';
import { ScheduleInterviewDialog } from './ScheduleInterviewDialog';

/** Square bordered action buttons: 36px to match the Applications reference. */
const ICON_BUTTON =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-[#E4E9F0] bg-white text-[#344054] hover:border-[#FFB69D] hover:bg-[#FFF4EF] hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600';

/** The table's last column. Everyone with view access can open the application; changes need manage. */
export function ApplicationRowActions({ application }: { application: HireAdminApplication }) {
  const [scheduling, setScheduling] = useState(false);
  const id = application.application_id;

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Link
        to={`/admin/applications/${id}`}
        aria-label={`View application ${id}`}
        className={ICON_BUTTON}
      >
        <Eye className="size-4" aria-hidden />
      </Link>
      <PermissionGate permission={P.manage}>
        <button
          type="button"
          aria-label={`Schedule interview for ${id}`}
          className={ICON_BUTTON}
          onClick={() => setScheduling(true)}
        >
          <CalendarDays className="size-4" aria-hidden />
        </button>
        <ApplicationActionMenu application={application} triggerClassName={ICON_BUTTON} />
        <ScheduleInterviewDialog
          application={application}
          open={scheduling}
          onClose={() => setScheduling(false)}
        />
      </PermissionGate>
    </div>
  );
}
