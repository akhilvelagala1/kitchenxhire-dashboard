import { ArrowLeft } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/errors';
import { AuditTrail } from '@/shared/components/AuditTrail';
import { ErrorState } from '@/shared/components/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { adminRecruitersApi } from '../api/adminRecruitersApi';
import { adminRecruitersKeys } from '../api/adminRecruitersKeys';
import { RecruiterStatusBadge } from '../components/RecruiterStatusBadge';
import { RecruiterVerificationBadge } from '../components/RecruiterVerificationBadge';
import { RecruiterStatusDialog } from '../components/RecruiterActionMenu';
import { useSetRecruiterStatus } from '../components/recruiterMutations';
import { formatAppliedOn } from '../components/formatAppliedOn';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminRecruiter, RecruiterStatus } from '../schemas/adminRecruiter';

const LINK_BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600';

function BackLink() {
  return (
    <Link
      to="/admin/recruiters"
      className="mb-4 inline-flex min-h-11 items-center gap-1 rounded-md text-sm text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Back to Recruiter Management
    </Link>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

/** Edit and Activate / Deactivate. The page shows this to people who can manage only. */
function RecruiterActions({ recruiter }: { recruiter: HireAdminRecruiter }) {
  const [confirming, setConfirming] = useState<RecruiterStatus | null>(null);
  const setStatus = useSetRecruiterStatus();
  const id = recruiter.recruiter_id;
  const active = recruiter.status === 'active';

  return (
    <section
      aria-label="Actions"
      className="flex flex-wrap items-center gap-3 rounded-[18px] border border-line bg-surface p-4"
    >
      <Link to={`/admin/recruiters/${id}/edit`} className={LINK_BUTTON}>
        Edit recruiter
      </Link>
      <Button
        variant={active ? 'danger' : 'primary'}
        onClick={() => setConfirming(active ? 'inactive' : 'active')}
      >
        {active ? 'Deactivate' : 'Activate'}
      </Button>
      <RecruiterStatusDialog
        recruiter={recruiter}
        status={confirming}
        loading={setStatus.isPending}
        onCancel={() => setConfirming(null)}
        onConfirm={() =>
          confirming &&
          setStatus.mutate(
            { recruiterId: id, status: confirming },
            { onSuccess: () => setConfirming(null) }
          )
        }
      />
    </section>
  );
}

export function AdminRecruiterDetailPage() {
  const { recruiterId = '' } = useParams();
  const query = useQuery({
    queryKey: adminRecruitersKeys.detail(recruiterId),
    queryFn: () => adminRecruitersApi.get(recruiterId),
    enabled: Boolean(recruiterId)
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (query.error && !(query.error instanceof ApiError && query.error.status === 404)) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink />
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </div>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink />
        <PageHeader
          title="Recruiter not found"
          description="Check the link or return to Recruiter Management."
        />
      </div>
    );
  }

  const r = query.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink />
        <PageHeader flush title={r.business_name} description={r.recruiter_id} />
      </div>
      <dl className="grid gap-3 rounded-[18px] border border-line bg-surface p-4 text-sm">
        <Row label="Recruiter">{r.owner_name}</Row>
        <Row label="Recruiter ID">{r.recruiter_id}</Row>
        <Row label="E-mail">{r.email}</Row>
        <Row label="Phone">{r.phone}</Row>
        <Row label="Company">{r.business_name}</Row>
        <Row label="Business type">{r.business_type}</Row>
        <Row label="Location">
          {r.area}, {r.city}
        </Row>
        <Row label="Verification">
          <RecruiterVerificationBadge verification={r.verification} />
        </Row>
        <Row label="Account status">
          <RecruiterStatusBadge status={r.status} />
        </Row>
        <Row label="Jobs posted">
          <span className="mr-3">{r.open_jobs}</span>
          <Link
            to={`/admin/jobs?search=${encodeURIComponent(r.business_name)}`}
            className="rounded-md font-medium text-brand-600 hover:underline focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            View job postings
          </Link>
        </Row>
        <Row label="Applications">{r.applications}</Row>
        <Row label="Last login">{r.last_login_at ? formatAppliedOn(r.last_login_at) : 'Never'}</Row>
        <Row label="Registration date">{formatAppliedOn(r.joined_at)}</Row>
        <Row label="Outlets">{r.outlets}</Row>
      </dl>
      <PermissionGate permission={P.manage}>
        <RecruiterActions recruiter={r} />
      </PermissionGate>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Activity</h2>
        <AuditTrail entityType="hire_recruiter" entityId={r.recruiter_id} />
      </section>
    </div>
  );
}
