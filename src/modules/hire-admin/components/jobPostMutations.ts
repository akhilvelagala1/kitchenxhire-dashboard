import { useApiMutation } from '@/shared/api/useApiMutation';
import { adminJobsApi } from '../api/adminJobsApi';
import { adminJobsKeys } from '../api/adminJobsKeys';
import type { JobPostBody } from '../schemas/adminJobPost';

export function useCreateJob() {
  return useApiMutation({
    mutationFn: (body: JobPostBody) => adminJobsApi.create(body),
    invalidates: [adminJobsKeys.all],
    successMessage: (job) => (job.status === 'draft' ? 'Job saved as draft' : 'Job published')
  });
}
