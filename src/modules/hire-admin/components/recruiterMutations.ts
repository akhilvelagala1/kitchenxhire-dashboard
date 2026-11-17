import { useApiMutation } from '@/shared/api/useApiMutation';
import { toast } from '@/shared/ui/toast';
import { adminRecruitersApi } from '../api/adminRecruitersApi';
import { adminRecruitersKeys } from '../api/adminRecruitersKeys';
import type { RecruiterInput, RecruiterStatus } from '../schemas/adminRecruiter';

/** Every write refreshes the lists and the Activity list (keys.audit), so the new event shows. */
const INVALIDATES = [adminRecruitersKeys.all, adminRecruitersKeys.audit];

export function useCreateRecruiter() {
  return useApiMutation({
    mutationFn: (body: RecruiterInput) => adminRecruitersApi.create(body),
    invalidates: INVALIDATES,
    successMessage: 'Recruiter added'
  });
}

export function useUpdateRecruiter() {
  return useApiMutation({
    mutationFn: (vars: { recruiterId: string; body: Partial<RecruiterInput> }) =>
      adminRecruitersApi.update(vars.recruiterId, vars.body),
    invalidates: INVALIDATES,
    successMessage: 'Recruiter saved'
  });
}

export function useSetRecruiterStatus() {
  return useApiMutation({
    mutationFn: (vars: { recruiterId: string; status: RecruiterStatus }) =>
      adminRecruitersApi.setStatus(vars.recruiterId, vars.status),
    invalidates: INVALIDATES,
    onSuccess: (_data, vars) =>
      toast.success(vars.status === 'active' ? 'Recruiter activated' : 'Recruiter deactivated')
  });
}

export function useBulkSetRecruiterStatus() {
  return useApiMutation({
    mutationFn: (vars: { recruiterIds: string[]; status: RecruiterStatus }) =>
      adminRecruitersApi.bulkSetStatus(vars.recruiterIds, vars.status),
    invalidates: INVALIDATES,
    successMessage: ({ affected }) =>
      `${affected} ${affected === 1 ? 'recruiter' : 'recruiters'} updated`
  });
}
