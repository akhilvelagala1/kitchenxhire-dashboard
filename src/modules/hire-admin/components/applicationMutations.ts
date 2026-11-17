import { useApiMutation } from '@/shared/api/useApiMutation';
import { toast } from '@/shared/ui/toast';
import { adminApplicationsApi } from '../api/adminApplicationsApi';
import { adminApplicationsKeys } from '../api/adminApplicationsKeys';
import {
  APPLICATION_STATUS_LABELS,
  HIRE_APPLICATION_STATUSES,
  type HireApplicationStatus
} from '../schemas/adminApplication';

/** Every status that can be set without a date: Interview Scheduled needs one, the calendar button sets it. */
export const SETTABLE_STATUSES = HIRE_APPLICATION_STATUSES.filter(
  (s) => s !== 'interview_scheduled'
);

/** What a row menu or the detail page may set: the settable statuses without the current one. */
export function statusChoices(current: HireApplicationStatus): HireApplicationStatus[] {
  return SETTABLE_STATUSES.filter((s) => s !== current);
}

export function useSetApplicationStatus() {
  return useApiMutation({
    mutationFn: (vars: { applicationId: string; status: HireApplicationStatus }) =>
      adminApplicationsApi.setStatus(vars.applicationId, vars.status),
    invalidates: [adminApplicationsKeys.all, adminApplicationsKeys.audit],
    onSuccess: (_data, vars) =>
      toast.success(`Status changed to ${APPLICATION_STATUS_LABELS[vars.status]}`)
  });
}

export function useScheduleInterview() {
  return useApiMutation({
    mutationFn: (vars: { applicationId: string; interviewAt: string }) =>
      adminApplicationsApi.scheduleInterview(vars.applicationId, {
        interview_at: vars.interviewAt
      }),
    invalidates: [adminApplicationsKeys.all, adminApplicationsKeys.audit],
    successMessage: 'Interview scheduled'
  });
}

export function useBulkSetStatus() {
  return useApiMutation({
    mutationFn: (vars: { applicationIds: string[]; status: HireApplicationStatus }) =>
      adminApplicationsApi.bulkSetStatus(vars.applicationIds, vars.status),
    invalidates: [adminApplicationsKeys.all, adminApplicationsKeys.audit],
    successMessage: ({ affected }) =>
      `${affected} ${affected === 1 ? 'application' : 'applications'} updated`
  });
}
