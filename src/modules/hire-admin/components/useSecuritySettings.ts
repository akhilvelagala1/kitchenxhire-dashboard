import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { usePermissions } from '@/shared/auth/usePermissions';
import { adminSettingsKeys } from '../api/adminSettingsKeys';
import { adminSettingsSecurityApi } from '../api/adminSettingsSecurityApi';
import { HIRE_ADMIN_PERMISSIONS } from '../permissions';
import type {
  SettingsFailedAttemptsOption,
  SettingsLockDurationOption,
  SettingsPasswordPolicy,
  SettingsSecurity,
  SettingsSessionTimeoutOption
} from '../schemas/adminSettingsSecurity';
import type { SecuritySettingsActions } from './securitySettingsContext';

function sameSecurity(a: SettingsSecurity, b: SettingsSecurity): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface UseSecuritySettingsResult {
  draft: SettingsSecurity | undefined;
  actions: SecuritySettingsActions | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
  reset: () => void;
}

/**
 * Draft-backed Security Settings: every row and the Password Policy dialog edit a local draft until
 * Save; Reset restores the last saved payload. Save sends the whole object
 * (PATCH /hire/admin/settings/security). Login History and Active Sessions are read separately —
 * they are logs and live sessions, not settings, so they are never part of this draft.
 */
export function useSecuritySettings(): UseSecuritySettingsResult {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canEdit = can(HIRE_ADMIN_PERMISSIONS.manage);
  const query = useQuery({
    queryKey: adminSettingsKeys.security,
    queryFn: () => adminSettingsSecurityApi.get()
  });

  const saved = query.data;
  const [edit, setEdit] = useState<SettingsSecurity | null>(null);
  const draft = edit ?? saved;

  const saveMutation = useApiMutation({
    mutationFn: (body: SettingsSecurity) => adminSettingsSecurityApi.save(body),
    invalidates: [adminSettingsKeys.security],
    successMessage: 'Security settings saved',
    onSuccess: (next) => {
      queryClient.setQueryData(adminSettingsKeys.security, next);
      setEdit(null);
    }
  });

  const update = useCallback(
    (recipe: (current: SettingsSecurity) => SettingsSecurity) => {
      setEdit((current) => {
        const base = current ?? saved;
        if (!base) return current;
        return recipe(structuredClone(base));
      });
    },
    [saved]
  );

  const actions: SecuritySettingsActions | undefined = useMemo(() => {
    if (!draft) return undefined;
    return {
      draft,
      setTwoFactorAuth: (on: boolean) => update((current) => ({ ...current, two_factor_auth: on })),
      setIpRestriction: (on: boolean) => update((current) => ({ ...current, ip_restriction: on })),
      setSessionTimeout: (value: SettingsSessionTimeoutOption) =>
        update((current) => ({ ...current, session_timeout: value })),
      setFailedLoginAttempts: (value: SettingsFailedAttemptsOption) =>
        update((current) => ({ ...current, failed_login_attempts: value })),
      setAccountLockDuration: (value: SettingsLockDurationOption) =>
        update((current) => ({ ...current, account_lock_duration: value })),
      setPasswordPolicy: (policy: SettingsPasswordPolicy) =>
        update((current) => ({ ...current, password_policy: policy }))
    };
  }, [draft, update]);

  const isDirty = Boolean(edit && saved && !sameSecurity(edit, saved));

  return {
    draft,
    actions,
    isLoading: query.isLoading,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
    canEdit,
    isDirty,
    isSaving: saveMutation.isPending,
    save: () => {
      if (draft && canEdit) saveMutation.mutate(draft);
    },
    reset: () => setEdit(null)
  };
}
