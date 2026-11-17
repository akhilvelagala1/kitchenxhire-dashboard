import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/errors';
import { ErrorState } from '@/shared/components/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { adminRecruitersApi } from '../api/adminRecruitersApi';
import { adminRecruitersKeys } from '../api/adminRecruitersKeys';
import { RecruiterForm } from '../components/RecruiterForm';
import { useCreateRecruiter, useUpdateRecruiter } from '../components/recruiterMutations';
import type { RecruiterInput } from '../schemas/adminRecruiter';

const EMPTY: RecruiterInput = {
  business_name: '',
  business_type: 'Restaurant',
  area: '',
  city: 'Hyderabad',
  owner_name: '',
  phone: '',
  email: ''
};

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

/** Add (no recruiterId in the address) and edit (recruiterId present) in one page. */
export function AdminRecruiterFormPage() {
  const { recruiterId } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(recruiterId);
  const existing = useQuery({
    queryKey: adminRecruitersKeys.detail(recruiterId ?? ''),
    queryFn: () => adminRecruitersApi.get(recruiterId ?? ''),
    enabled: editing
  });
  const create = useCreateRecruiter();
  const update = useUpdateRecruiter();
  const backTo = recruiterId ? `/admin/recruiters/${recruiterId}` : '/admin/recruiters';
  const back = (
    <BackLink
      to={backTo}
      label={recruiterId ? 'Back to recruiter' : 'Back to Recruiter Management'}
    />
  );

  if (editing && existing.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (
    editing &&
    existing.error &&
    !(existing.error instanceof ApiError && existing.error.status === 404)
  ) {
    return (
      <div className="mx-auto max-w-3xl">
        {back}
        <ErrorState error={existing.error} onRetry={() => existing.refetch()} />
      </div>
    );
  }

  if (editing && (existing.error || !existing.data)) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink to="/admin/recruiters" label="Back to Recruiter Management" />
        <PageHeader
          title="Recruiter not found"
          description="Check the link or return to Recruiter Management."
        />
      </div>
    );
  }

  const current = existing.data;
  const defaults: RecruiterInput = current
    ? {
        business_name: current.business_name,
        business_type: current.business_type,
        area: current.area,
        city: current.city,
        owner_name: current.owner_name,
        phone: current.phone,
        email: current.email
      }
    : EMPTY;

  async function save(values: RecruiterInput) {
    if (!current) {
      const created = await create.mutateAsync(values);
      navigate(`/admin/recruiters/${created.recruiter_id}`);
      return;
    }
    const changed = Object.fromEntries(
      Object.entries(values).filter(
        ([key, value]) => value !== defaults[key as keyof RecruiterInput]
      )
    );
    if (Object.keys(changed).length > 0) {
      await update.mutateAsync({ recruiterId: current.recruiter_id, body: changed });
    }
    navigate(`/admin/recruiters/${current.recruiter_id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {back}
      <PageHeader
        title={current ? 'Edit recruiter' : 'Add recruiter'}
        description={current ? `${current.business_name} - ${current.recruiter_id}` : undefined}
      />
      <RecruiterForm
        key={current?.recruiter_id ?? 'new'}
        defaultValues={defaults}
        submitLabel={current ? 'Save changes' : 'Add recruiter'}
        onSubmit={save}
        onCancel={() => navigate(backTo)}
      />
    </div>
  );
}
