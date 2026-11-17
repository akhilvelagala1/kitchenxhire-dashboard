import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AuditTrail } from '@/shared/components/AuditTrail';
import { PageHeader } from '@/shared/components/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { adminJobsApi } from '../api/adminJobsApi';
import { adminJobsKeys } from '../api/adminJobsKeys';
import { HireJobStatusBadge } from '../components/HireJobStatusBadge';

export function AdminJobDetailPage() {
  const { id = '' } = useParams();
  const query = useQuery({
    queryKey: adminJobsKeys.detail(id),
    queryFn: () => adminJobsApi.get(id),
    enabled: Boolean(id)
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (query.error || !query.data) {
    return <PageHeader title="Job not found" description="Check the link or return to Jobs." />;
  }

  const j = query.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={j.title} description={`${j.job_id} · ${j.business_name}`} />
      <dl className="grid gap-3 rounded-[18px] border border-line bg-surface p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Status</dt>
          <dd>
            <HireJobStatusBadge status={j.status} />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Category</dt>
          <dd>{j.category}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Location</dt>
          <dd>{j.location}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Applications</dt>
          <dd>{j.applications_count.toLocaleString('en-IN')}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Recruited</dt>
          <dd>{j.recruited_count.toLocaleString('en-IN')}</dd>
        </div>
      </dl>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Activity</h2>
        <AuditTrail entityType="hire_job" entityId={j.job_id} />
      </section>
    </div>
  );
}
