import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ErrorState } from '@/shared/components/ErrorState';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { formatDateTime } from '@/shared/lib/dates';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useCanEditSettings } from './settingsEditContext';
import { adminSettingsSecurityApi } from '../api/adminSettingsSecurityApi';
import { adminSettingsKeys } from '../api/adminSettingsKeys';

function Body() {
  const canEdit = useCanEditSettings();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: adminSettingsKeys.securitySessions,
    queryFn: () => adminSettingsSecurityApi.sessions()
  });
  const revoke = useApiMutation({
    mutationFn: (id: string) => adminSettingsSecurityApi.revokeSession(id),
    invalidates: [adminSettingsKeys.securitySessions],
    successMessage: 'Session revoked',
    onSuccess: (sessions) => {
      queryClient.setQueryData(adminSettingsKeys.securitySessions, sessions);
    }
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full" />;
  if (query.error || !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  return (
    <ul className="flex max-h-[60vh] flex-col divide-y divide-line overflow-y-auto">
      {query.data.map((session) => (
        <li key={session.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              {session.user_name}
              {session.is_current && (
                <span className="ml-2 text-xs font-medium text-brand-600">This device</span>
              )}
            </p>
            <p className="text-xs text-ink-soft">
              {session.device} · {session.ip_address} · {session.location}
            </p>
            <p className="text-xs text-ink-soft">
              Last active {formatDateTime(session.last_active_at)}
            </p>
          </div>
          {!session.is_current && (
            <Button
              variant="danger"
              disabled={!canEdit || revoke.isPending}
              onClick={() => revoke.mutate(session.id)}
              className="shrink-0"
            >
              Revoke
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** View Sessions dialog for Active Sessions: every signed-in device, with a revoke action. */
export function SettingsActiveSessionsDialog({
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
      title="Active Sessions"
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
