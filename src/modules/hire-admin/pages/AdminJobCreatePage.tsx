import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { PageHeader } from '@/shared/components/PageHeader';
import { JobPostForm } from '../components/JobPostForm';

const LIST_PATH = '/admin/jobs';

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit min-h-11 items-center gap-1 rounded-md text-sm font-medium text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600 lg:min-h-0 lg:text-xs lg:leading-4"
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      {label}
    </Link>
  );
}

/**
 * Serves /admin/jobs/new: an admin posts a job on behalf of a recruiter. It is a fit page: from lg
 * the whole form fits one screen (see `fit-scale-post-job`); below lg it stacks and scrolls.
 */
export function AdminJobCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="fit-scale fit-scale-post-job flex min-h-0 flex-1 flex-col lg:pt-[calc(22*var(--u))] lg:pr-[calc(24*var(--u))] lg:pb-[calc(10*var(--u))] lg:pl-[calc(27*var(--u))]">
      <BackLink to={LIST_PATH} label="Back to Jobs" />
      <PageHeader
        flush
        title="Post a Job"
        description="Create a new job listing for recruiters. Fill in the job details, requirements and application settings."
        className="mt-[calc(12*var(--u))] mb-[calc(22*var(--u))]"
        titleClassName="lg:text-dense-title! lg:font-bold! lg:leading-9!"
        descriptionClassName="lg:mt-0.5! lg:text-dense-md! lg:leading-[calc(18*var(--u))]!"
      />
      <JobPostForm onSaved={() => navigate(LIST_PATH)} />
    </div>
  );
}
