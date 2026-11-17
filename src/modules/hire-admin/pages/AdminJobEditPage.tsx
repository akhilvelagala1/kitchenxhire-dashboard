import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/shared/components/PageHeader';
import { Field } from '@/shared/ui/Field';
import { Button } from '@/shared/ui/Button';
import { Input, Select } from '@/shared/ui/Input';
import { Spinner } from '@/shared/ui/Spinner';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { adminJobsApi } from '../api/adminJobsApi';
import { adminJobsKeys } from '../api/adminJobsKeys';
import type { HireAdminJob } from '../schemas/adminJob';

interface FormValues {
  title: string;
  status: HireAdminJob['status'];
}

export function AdminJobEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const detail = useQuery({
    queryKey: adminJobsKeys.detail(id),
    queryFn: () => adminJobsApi.get(id),
    enabled: Boolean(id)
  });

  const patch = useApiMutation({
    mutationFn: (body: Partial<Pick<HireAdminJob, 'title' | 'status'>>) =>
      adminJobsApi.patch(id, body),
    invalidates: [adminJobsKeys.all],
    successMessage: 'Job updated',
    onSuccess: () => navigate(`/admin/jobs/${id}`)
  });

  const form = useForm<FormValues>({
    values: detail.data
      ? { title: detail.data.title, status: detail.data.status }
      : { title: '', status: 'active' }
  });

  if (detail.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (detail.error || !detail.data) {
    return <PageHeader title="Job not found" />;
  }

  return (
    <form
      className="mx-auto max-w-lg space-y-4"
      onSubmit={form.handleSubmit((v) => patch.mutate(v))}
    >
      <PageHeader title="Edit job" description={detail.data.job_id} />
      <Field label="Title">
        <Input {...form.register('title', { required: true })} />
      </Field>
      <Field label="Status">
        <Select {...form.register('status')}>
          <option value="active">Active</option>
          <option value="under_review">Under Review</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </Select>
      </Field>
      <div className="flex gap-2">
        <Button type="submit" loading={patch.isPending}>
          Save
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
