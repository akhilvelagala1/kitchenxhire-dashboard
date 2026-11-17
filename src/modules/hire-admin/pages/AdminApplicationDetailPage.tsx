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
import { Field } from '@/shared/ui/Field';
import { Select } from '@/shared/ui/Input';
import { Spinner } from '@/shared/ui/Spinner';
import { adminApplicationsApi } from '../api/adminApplicationsApi';
import { adminApplicationsKeys } from '../api/adminApplicationsKeys';
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge';
import { RejectApplicationDialog } from '../components/ApplicationActionMenu';
import { statusChoices, useSetApplicationStatus } from '../components/applicationMutations';
import { formatAppliedOn } from '../components/formatAppliedOn';
import { ScheduleInterviewDialog } from '../components/ScheduleInterviewDialog';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import {
  APPLICATION_STATUS_LABELS,
  type HireAdminApplication,
  type HireApplicationStatus
} from '../schemas/adminApplication';

function BackLink() {
  return (
    <Link
      to="/admin/applications"
      className="mb-4 inline-flex items-center gap-1 rounded-md text-sm text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Back to Applications
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

/** Changing status and scheduling an interview. The page shows this to people who can manage only. */
function ApplicationActions({ application }: { application: HireAdminApplication }) {
  const [scheduling, setScheduling] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [next, setNext] = useState<HireApplicationStatus | ''>('');
  const setStatus = useSetApplicationStatus();
  const id = application.application_id;

  function choose(status: HireApplicationStatus) {
    if (status === 'rejected') setRejecting(true);
    else setStatus.mutate({ applicationId: id, status }, { onSuccess: () => setNext('') });
  }

  return (
    <section
      aria-label="Actions"
      className="flex flex-wrap items-end gap-3 rounded-[18px] border border-line bg-surface p-4"
    >
      <Button variant="secondary" onClick={() => setScheduling(true)}>
        Schedule interview
      </Button>
      <div className="w-full sm:w-64">
        <Field label="Change status">
          <Select
            value={next}
            disabled={setStatus.isPending}
            onChange={(e) => setNext(e.target.value as HireApplicationStatus | '')}
          >
            <option value="">Select a status…</option>
            {statusChoices(application.status).map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Button disabled={!next || setStatus.isPending} onClick={() => next && choose(next)}>
        Update status
      </Button>
      <ScheduleInterviewDialog
        application={application}
        open={scheduling}
        onClose={() => setScheduling(false)}
      />
      <RejectApplicationDialog
        application={application}
        open={rejecting}
        loading={setStatus.isPending}
        onCancel={() => setRejecting(false)}
        onConfirm={() =>
          setStatus.mutate(
            { applicationId: id, status: 'rejected' },
            {
              onSuccess: () => {
                setRejecting(false);
                setNext('');
              }
            }
          )
        }
      />
    </section>
  );
}

export function AdminApplicationDetailPage() {
  const { applicationId = '' } = useParams();
  const query = useQuery({
    queryKey: adminApplicationsKeys.detail(applicationId),
    queryFn: () => adminApplicationsApi.get(applicationId),
    enabled: Boolean(applicationId)
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
          title="Application not found"
          description="Check the link or return to Applications."
        />
      </div>
    );
  }

  const a = query.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <BackLink />
        <PageHeader
          flush
          title={a.candidate_name}
          description={`${a.application_id} - ${a.job_title}`}
        />
      </div>
      <dl className="grid gap-3 rounded-[18px] border border-line bg-surface p-4 text-sm">
        <Row label="Status">
          <ApplicationStatusBadge status={a.status} />
        </Row>
        <Row label="E-mail">{a.candidate_email}</Row>
        <Row label="Phone">{a.candidate_phone}</Row>
        <Row label="Location">{a.candidate_location}</Row>
        <Row label="Applied for">
          {a.job_title} ({a.job_type})
        </Row>
        <Row label="Recruiter and outlet">
          {a.recruiter_name}, {a.outlet_name}
        </Row>
        <Row label="Applied on">{formatAppliedOn(a.applied_at)}</Row>
        <Row label="Interview">
          {a.interview_at ? formatAppliedOn(a.interview_at) : 'Not scheduled'}
        </Row>
        <Row label="Resume">
          <div className="flex flex-wrap items-center gap-3">
            <span>{a.resume_file_name ?? 'No resume uploaded'}</span>
            <Button
              variant="secondary"
              disabled
              title={
                a.resume_file_name
                  ? 'Resume download works once the file service is connected.'
                  : 'There is no resume to download.'
              }
            >
              Download resume
            </Button>
          </div>
        </Row>
      </dl>
      <PermissionGate permission={P.manage}>
        <ApplicationActions application={a} />
      </PermissionGate>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Activity</h2>
        <AuditTrail entityType="hire_application" entityId={a.application_id} />
      </section>
    </div>
  );
}
