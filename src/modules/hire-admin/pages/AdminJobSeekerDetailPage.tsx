import { ArrowLeft } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/errors';
import { AuditTrail } from '@/shared/components/AuditTrail';
import { ErrorState } from '@/shared/components/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { adminJobSeekersApi } from '../api/adminJobSeekersApi';
import { adminJobSeekersKeys } from '../api/adminJobSeekersKeys';
import { JobSeekerStatusDialog } from '../components/JobSeekerActionMenu';
import { JobSeekerStatusBadge } from '../components/JobSeekerStatusBadge';
import { formatAppliedOn } from '../components/formatAppliedOn';
import { useSetJobSeekerStatus } from '../components/jobSeekerMutations';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { HireAdminJobSeeker, JobSeekerStatus } from '../schemas/adminJobSeeker';

const LINK_BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600';

function BackLink() {
  return (
    <Link
      to="/admin/job-seekers"
      className="mb-4 inline-flex min-h-11 items-center gap-1 rounded-md text-sm text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Back to Job Seekers
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

/** Edit and activate or deactivate. The page shows this to people who can manage only. */
function JobSeekerActions({ jobSeeker }: { jobSeeker: HireAdminJobSeeker }) {
  const [confirming, setConfirming] = useState<JobSeekerStatus | null>(null);
  const setStatus = useSetJobSeekerStatus();
  const id = jobSeeker.job_seeker_id;
  const active = jobSeeker.status === 'active';

  return (
    <section
      aria-label="Actions"
      className="flex flex-wrap items-center gap-3 rounded-[18px] border border-line bg-surface p-4"
    >
      <Link
        to={`/admin/job-seekers/${id}/edit`}
        className={cn(LINK_BUTTON, 'bg-brand-600 text-white hover:bg-brand-700')}
      >
        Edit
      </Link>
      <Button
        variant={active ? 'danger' : 'primary'}
        onClick={() => setConfirming(active ? 'inactive' : 'active')}
      >
        {active ? 'Deactivate' : 'Activate'}
      </Button>
      <JobSeekerStatusDialog
        jobSeeker={jobSeeker}
        status={confirming}
        loading={setStatus.isPending}
        onCancel={() => setConfirming(null)}
        onConfirm={() =>
          confirming &&
          setStatus.mutate(
            { jobSeekerId: id, status: confirming },
            { onSuccess: () => setConfirming(null) }
          )
        }
      />
    </section>
  );
}

export function AdminJobSeekerDetailPage() {
  const { jobSeekerId = '' } = useParams();
  const query = useQuery({
    queryKey: adminJobSeekersKeys.detail(jobSeekerId),
    queryFn: () => adminJobSeekersApi.get(jobSeekerId),
    enabled: Boolean(jobSeekerId)
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
          title="Job seeker not found"
          description="Check the link or return to Job Seekers."
        />
      </div>
    );
  }

  const j = query.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink />
        <PageHeader
          flush
          title={j.name}
          description={`${j.job_seeker_id} - ${j.preferred_job_title}`}
        />
      </div>
      <dl className="grid gap-3 rounded-[18px] border border-line bg-surface p-4 text-sm">
        <Row label="Status">
          <JobSeekerStatusBadge status={j.status} />
        </Row>
        <Row label="E-mail">{j.email}</Row>
        <Row label="Phone">{j.phone}</Row>
        <Row label="Location">{[j.city, j.state].filter(Boolean).join(', ')}</Row>
        <Row label="Preferred job title">{j.preferred_job_title}</Row>
        <Row label="Experience">
          {j.experience_years} {j.experience_years === 1 ? 'year' : 'years'}
        </Row>
        <Row label="Profile completion">{j.profile_completion}%</Row>
        <Row label="Applications">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{j.applications_count}</span>
            <Link
              to={`/admin/applications?search=${encodeURIComponent(j.name)}`}
              className="inline-flex min-h-11 items-center rounded-md font-medium text-[#B93208] hover:underline focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              View applications
            </Link>
          </div>
        </Row>
        <Row label="Interviews">{j.interviews_count}</Row>
        <Row label="Shortlisted">{j.shortlisted_count}</Row>
        <Row label="Hired">{j.hired_count}</Row>
        <Row label="Last active">
          {j.last_active_at ? formatAppliedOn(j.last_active_at) : 'Never'}
        </Row>
        <Row label="Joined on">{formatAppliedOn(j.joined_at)}</Row>
      </dl>
      <PermissionGate permission={P.manage}>
        <JobSeekerActions jobSeeker={j} />
      </PermissionGate>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Activity</h2>
        <AuditTrail entityType="hire_job_seeker" entityId={j.job_seeker_id} />
      </section>
    </div>
  );
}
