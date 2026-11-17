import { useApiMutation } from '@/shared/api/useApiMutation';
import { toast } from '@/shared/ui/toast';
import { adminJobSeekersApi } from '../api/adminJobSeekersApi';
import { adminJobSeekersKeys } from '../api/adminJobSeekersKeys';
import type { JobSeekerInput, JobSeekerStatus } from '../schemas/adminJobSeeker';

/** Every write refreshes the lists and the Activity list, so the new event shows at once. */
const INVALIDATES = [adminJobSeekersKeys.all, adminJobSeekersKeys.audit];

export function useCreateJobSeeker() {
  return useApiMutation({
    mutationFn: (body: JobSeekerInput) => adminJobSeekersApi.create(body),
    invalidates: INVALIDATES,
    successMessage: 'Job seeker added'
  });
}

export function useUpdateJobSeeker(jobSeekerId: string) {
  return useApiMutation({
    mutationFn: (body: Partial<JobSeekerInput>) => adminJobSeekersApi.update(jobSeekerId, body),
    invalidates: INVALIDATES,
    successMessage: 'Job seeker saved'
  });
}

export function useSetJobSeekerStatus() {
  return useApiMutation({
    mutationFn: (vars: { jobSeekerId: string; status: JobSeekerStatus }) =>
      adminJobSeekersApi.setStatus(vars.jobSeekerId, vars.status),
    invalidates: INVALIDATES,
    onSuccess: (_data, vars) =>
      toast.success(vars.status === 'active' ? 'Job seeker activated' : 'Job seeker deactivated')
  });
}

export function useBulkSetJobSeekerStatus() {
  return useApiMutation({
    mutationFn: (vars: { jobSeekerIds: string[]; status: JobSeekerStatus }) =>
      adminJobSeekersApi.bulkSetStatus(vars.jobSeekerIds, vars.status),
    invalidates: INVALIDATES,
    successMessage: ({ affected }) =>
      `${affected} ${affected === 1 ? 'job seeker' : 'job seekers'} updated`
  });
}
