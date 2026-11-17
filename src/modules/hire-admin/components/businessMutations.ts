import { useApiMutation } from '@/shared/api/useApiMutation';
import { toast } from '@/shared/ui/toast';
import { adminBusinessesApi } from '../api/adminBusinessesApi';
import { adminBusinessesKeys } from '../api/adminBusinessesKeys';
import type { BusinessInput, BusinessSettableStatus } from '../schemas/adminBusiness';

/** Every write refreshes the lists, the summary cards and the tab counts. */
const INVALIDATES = [adminBusinessesKeys.all];

const STATUS_DONE: Record<BusinessSettableStatus, string> = {
  active: 'Business activated',
  inactive: 'Business deactivated',
  suspended: 'Business suspended'
};

export function useSetBusinessStatus() {
  return useApiMutation({
    mutationFn: (vars: { businessId: string; status: BusinessSettableStatus }) =>
      adminBusinessesApi.setStatus(vars.businessId, vars.status),
    invalidates: INVALIDATES,
    onSuccess: (_data, vars) => toast.success(STATUS_DONE[vars.status])
  });
}

export function useCreateBusiness() {
  return useApiMutation({
    mutationFn: (body: BusinessInput) => adminBusinessesApi.create(body),
    invalidates: INVALIDATES,
    successMessage: 'Business added'
  });
}

export function useUpdateBusiness(businessId: string) {
  return useApiMutation({
    mutationFn: (body: Partial<BusinessInput>) => adminBusinessesApi.update(businessId, body),
    invalidates: INVALIDATES,
    successMessage: 'Business saved'
  });
}

export function useBulkSetBusinessStatus() {
  return useApiMutation({
    mutationFn: (vars: { businessIds: string[]; status: BusinessSettableStatus }) =>
      adminBusinessesApi.bulkSetStatus(vars.businessIds, vars.status),
    invalidates: INVALIDATES,
    successMessage: ({ affected }) =>
      `${affected} ${affected === 1 ? 'business' : 'businesses'} updated`
  });
}
