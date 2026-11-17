import { Download, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { ExportButton } from '@/shared/components/ExportButton';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { adminUsersApi } from '../api/adminUsersApi';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import { parseUsersSearchParams, toUsersListQuery } from './usersPageParams';

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600';
/** Compact header actions — same density as Recruiters / Businesses. */
const SIZE = 'h-[42px] min-h-[42px] rounded-[10px] text-sm';

/** Export of the filtered list, and the orange Add User button. Both need the manage permission. */
export function UserHeaderActions({ onAddUser }: { onAddUser: () => void }) {
  const [searchParams] = useSearchParams();
  const listQuery = toUsersListQuery(parseUsersSearchParams(searchParams));

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
            start={() => adminUsersApi.exportUsers(listQuery, [])}
            className={cn(
              SIZE,
              'border-[#E9ECF2]! bg-white! pr-4! pl-9! font-semibold whitespace-nowrap text-[#111111]! hover:bg-[#F6F7FA]!'
            )}
          />
        </div>
      </PermissionGate>
      <PermissionGate permission={P.manage}>
        <Button
          onClick={onAddUser}
          className={cn(SIZE, FOCUS, 'gap-2 px-4 font-bold whitespace-nowrap')}
        >
          <Plus aria-hidden className="size-4" strokeWidth={2.5} />
          Add User
        </Button>
      </PermissionGate>
    </div>
  );
}
