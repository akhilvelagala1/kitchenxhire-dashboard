import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { formatDateTime } from '@/shared/lib/dates';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ErrorState } from './ErrorState';

interface AuditEvent {
  id: string;
  action: string;
  actor_name: string;
  occurred_at: string;
  reason: string | null;
  changes: { field: string; from: string | null; to: string | null }[];
}

/** Who changed what and when, from GET /audit-events?entity_type=&entity_id=. */
export function AuditTrail({ entityType, entityId }: { entityType: string; entityId: string }) {
  const query = useQuery({
    queryKey: ['audit-events', entityType, entityId],
    queryFn: () =>
      apiClient.get<AuditEvent[]>('/audit-events', { entity_type: entityType, entity_id: entityId })
  });

  if (query.isLoading) return <Skeleton className="h-24 w-full" />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data?.length) return <p className="text-sm text-ink-soft">No changes recorded yet.</p>;

  return (
    <ol className="flex flex-col gap-4 border-l border-line pl-4">
      {query.data.map((e) => (
        <li key={e.id}>
          <p className="text-sm">
            <span className="font-medium">{e.actor_name}</span>{' '}
            {e.action.toLowerCase().replaceAll('_', ' ')}
            <span className="text-ink-soft"> · {formatDateTime(e.occurred_at)}</span>
          </p>
          {e.reason && <p className="text-sm text-ink-soft">Reason: {e.reason}</p>}
          {e.changes.length > 0 && (
            <ul className="mt-1 text-sm text-ink-soft">
              {e.changes.map((c) => (
                <li key={c.field}>
                  {c.field}: {c.from ?? '—'} → {c.to ?? '—'}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
