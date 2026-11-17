import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AuditTrail } from '@/shared/components/AuditTrail';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ErrorState } from '@/shared/components/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDateTime } from '@/shared/lib/dates';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useArchiveCategory, useCategory, useRestoreCategory } from '../api/categoryQueries';
import { CATEGORY_PERMISSIONS as P } from '../permissions';

export function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useCategory(id);
  const archive = useArchiveCategory();
  const restore = useRestoreCategory();
  const [confirm, setConfirm] = useState(false);

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (query.error || !query.data)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const c = query.data;

  const facts: [string, string][] = [
    ['Code', c.code],
    ['Parent', c.parent_name ?? 'Top level'],
    ['Products', c.product_count.toLocaleString('en-IN')],
    ['Sort order', String(c.sort_order)],
    ['Created', formatDateTime(c.created_at)],
    ['Updated', formatDateTime(c.updated_at)]
  ];

  return (
    <>
      <PageHeader
        title={c.name}
        breadcrumbs={[
          { label: 'Catalogue' },
          { label: 'Categories', to: '/catalogue/categories' },
          { label: c.name }
        ]}
        actions={
          c.deleted_at ? (
            <PermissionGate permission={P.delete}>
              <Button
                variant="secondary"
                loading={restore.isPending}
                onClick={() => restore.mutate(c.id)}
              >
                Restore
              </Button>
            </PermissionGate>
          ) : (
            <>
              <PermissionGate permission={P.update}>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/catalogue/categories/${c.id}/edit`)}
                >
                  Edit
                </Button>
              </PermissionGate>
              <PermissionGate permission={P.delete}>
                <Button variant="danger" onClick={() => setConfirm(true)}>
                  Archive
                </Button>
              </PermissionGate>
            </>
          )
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-labelledby="details"
          className="rounded-lg border border-line bg-surface p-6 lg:col-span-2"
        >
          <h2 id="details" className="mb-4 flex items-center gap-2 text-base font-semibold">
            Details <StatusBadge status={c.deleted_at ? 'DELETED' : c.status} />
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm text-ink-soft">{k}</dt>
                <dd className="text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {c.description && <p className="mt-4 text-sm">{c.description}</p>}
        </section>
        <section aria-labelledby="history" className="rounded-lg border border-line bg-surface p-6">
          <h2 id="history" className="mb-4 text-base font-semibold">
            History
          </h2>
          <AuditTrail entityType="category" entityId={c.id} />
        </section>
      </div>
      <ConfirmDialog
        open={confirm}
        title={`Archive ${c.name}?`}
        message="It will be hidden from customers. Products keep their category and you can restore it later."
        confirmLabel="Archive"
        requireReason
        loading={archive.isPending}
        onConfirm={(reason) =>
          archive.mutate({ id: c.id, reason }, { onSuccess: () => setConfirm(false) })
        }
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
