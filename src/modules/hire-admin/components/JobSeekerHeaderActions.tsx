import { Download, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { ExportButton } from '@/shared/components/ExportButton';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { cn } from '@/shared/lib/cn';
import { adminJobSeekersApi } from '../api/adminJobSeekersApi';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import { parseJobSeekersSearchParams, toJobSeekersListQuery } from './jobSeekersPageParams';

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600';
/** Compact header actions — same density as Recruiters Export + Add. */
const SIZE = 'h-[42px] min-h-[42px] rounded-[10px] text-sm';

/** Export of the filtered view and the orange Add Job Seeker link, for the page header's actions slot. */
export function JobSeekerHeaderActions() {
  const [searchParams] = useSearchParams();
  const listQuery = toJobSeekersListQuery(parseJobSeekersSearchParams(searchParams));

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <PermissionGate permission={P.manage}>
        <div className="relative">
          <Download
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#526079]"
          />
          <ExportButton
            label="Export"
            start={() => adminJobSeekersApi.exportJobSeekers(listQuery, [])}
            className={cn(
              SIZE,
              'border-[#E9ECF2]! bg-white! pr-4! pl-9! font-semibold whitespace-nowrap text-[#111111]! hover:bg-[#F6F7FA]!'
            )}
          />
        </div>
      </PermissionGate>
      <PermissionGate permission={P.manage}>
        <Link
          to="/admin/job-seekers/create"
          className={cn(
            SIZE,
            FOCUS,
            'inline-flex items-center justify-center gap-2 bg-brand-600 px-4 font-bold whitespace-nowrap text-white hover:bg-brand-700'
          )}
        >
          <Plus className="size-4" strokeWidth={2.5} aria-hidden />
          Add Job Seeker
        </Link>
      </PermissionGate>
    </div>
  );
}
