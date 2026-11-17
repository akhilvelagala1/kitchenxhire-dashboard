import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Column, DataTable } from '@/shared/components/DataTable';
import { formatDateTime } from '@/shared/lib/dates';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { adminSettingsKeys } from '../api/adminSettingsKeys';
import { adminSettingsSecurityApi } from '../api/adminSettingsSecurityApi';
import type { SettingsLoginHistoryEntry } from '../schemas/adminSettingsSecurity';

const RESULT_PILL: Record<SettingsLoginHistoryEntry['result'], string> = {
  success: 'bg-[#DCFCE4] text-[#078A27]',
  failed: 'bg-[#FFE1E1] text-[#F02020]'
};

function Body() {
  const query = useQuery({
    queryKey: adminSettingsKeys.securityLoginHistory,
    queryFn: () => adminSettingsSecurityApi.loginHistory()
  });

  const columns = useMemo<Column<SettingsLoginHistoryEntry>[]>(
    () => [
      { id: 'user', header: 'User', cell: (e) => e.user_name },
      { id: 'when', header: 'When', cell: (e) => formatDateTime(e.occurred_at) },
      { id: 'ip', header: 'IP address', cell: (e) => e.ip_address },
      { id: 'device', header: 'Device', cell: (e) => e.device },
      {
        id: 'result',
        header: 'Result',
        className: 'text-right',
        cell: (e) => (
          <span
            className={`inline-flex h-5.5 items-center rounded-full px-2.5 text-xs font-semibold ${RESULT_PILL[e.result]}`}
          >
            {e.result === 'success' ? 'Success' : 'Failed'}
          </span>
        )
      }
    ],
    []
  );

  return (
    <DataTable<SettingsLoginHistoryEntry>
      density="compact"
      columns={columns}
      rows={query.data}
      getRowId={(entry) => entry.id}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => query.refetch()}
      empty={{ title: 'No logins recorded yet' }}
      caption="Login history"
    />
  );
}

/** View Logs dialog for Login History: who signed in, when, from where, on what, and the result. */
export function SettingsLoginHistoryDialog({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Login History"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {open ? <Body /> : null}
    </Dialog>
  );
}
