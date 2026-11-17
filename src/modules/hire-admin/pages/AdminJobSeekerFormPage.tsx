import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/errors';
import { ErrorState } from '@/shared/components/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { adminJobSeekersApi } from '../api/adminJobSeekersApi';
import { adminJobSeekersKeys } from '../api/adminJobSeekersKeys';
import { JobSeekerForm } from '../components/JobSeekerForm';
import { useCreateJobSeeker, useUpdateJobSeeker } from '../components/jobSeekerMutations';
import type { JobSeekerInput } from '../schemas/adminJobSeeker';

const EMPTY: JobSeekerInput = {
  name: '',
  email: '',
  phone: '',
  city: '',
  preferred_job_title: '',
  experience_years: 0
};

const FIELDS = Object.keys(EMPTY) as (keyof JobSeekerInput)[];

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="mb-4 inline-flex min-h-11 items-center gap-1 rounded-md text-sm text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

/** Serves both /admin/job-seekers/create and /admin/job-seekers/:jobSeekerId/edit. */
export function AdminJobSeekerFormPage() {
  const { jobSeekerId } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(jobSeekerId);
  const query = useQuery({
    queryKey: adminJobSeekersKeys.detail(jobSeekerId ?? ''),
    queryFn: () => adminJobSeekersApi.get(jobSeekerId ?? ''),
    enabled: editing
  });
  const create = useCreateJobSeeker();
  const update = useUpdateJobSeeker(jobSeekerId ?? '');
  const listPath = '/admin/job-seekers';

  if (editing && query.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (editing && query.error && !(query.error instanceof ApiError && query.error.status === 404)) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink to={listPath} label="Back to Job Seekers" />
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </div>
    );
  }

  if (editing && (query.error || !query.data)) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink to={listPath} label="Back to Job Seekers" />
        <PageHeader
          title="Job seeker not found"
          description="Check the link or return to Job Seekers."
        />
      </div>
    );
  }

  const existing = query.data;
  const detailPath = `${listPath}/${jobSeekerId}`;
  const defaults: JobSeekerInput = existing
    ? {
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        city: existing.city,
        preferred_job_title: existing.preferred_job_title,
        experience_years: existing.experience_years
      }
    : EMPTY;

  async function save(values: JobSeekerInput) {
    if (!existing) {
      const created = await create.mutateAsync(values);
      navigate(`${listPath}/${created.job_seeker_id}`);
      return;
    }
    // Send only what the person changed.
    const changed = Object.fromEntries(
      FIELDS.filter((f) => values[f] !== defaults[f]).map((f) => [f, values[f]])
    ) as Partial<JobSeekerInput>;
    if (Object.keys(changed).length > 0) await update.mutateAsync(changed);
    navigate(detailPath);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink
        to={existing ? detailPath : listPath}
        label={existing ? 'Back to job seeker' : 'Back to Job Seekers'}
      />
      <PageHeader
        title={existing ? 'Edit job seeker' : 'Add job seeker'}
        description={
          existing
            ? `${existing.name} - ${existing.job_seeker_id}`
            : 'Create a job seeker account. They can complete their profile in the app later.'
        }
      />
      <JobSeekerForm
        defaultValues={defaults}
        submitLabel={existing ? 'Save changes' : 'Add job seeker'}
        onSubmit={save}
        onCancel={() => navigate(existing ? detailPath : listPath)}
      />
    </div>
  );
}
