import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { usePermissions } from '@/shared/auth/usePermissions';
import { adminSettingsIntegrationsApi } from '../api/adminSettingsIntegrationsApi';
import { adminSettingsKeys } from '../api/adminSettingsKeys';
import { HIRE_ADMIN_PERMISSIONS } from '../permissions';
import type {
  SettingsIntegrationEntry,
  SettingsIntegrationKey,
  SettingsIntegrations,
  SettingsWebhookEvent
} from '../schemas/adminSettingsIntegrations';
import type { IntegrationsSettingsActions } from './integrationsSettingsContext';

function sameIntegrations(a: SettingsIntegrations, b: SettingsIntegrations): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface UseIntegrationsSettingsResult {
  draft: SettingsIntegrations | undefined;
  actions: IntegrationsSettingsActions | undefined;
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
 * Draft-backed Integrations Settings: Connect / Configure and the webhook controls edit a local
 * draft until Save; Reset restores the last saved payload. Save sends the whole object
 * (PATCH /hire/admin/settings/integrations).
 */
export function useIntegrationsSettings(): UseIntegrationsSettingsResult {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canEdit = can(HIRE_ADMIN_PERMISSIONS.manage);
  const query = useQuery({
    queryKey: adminSettingsKeys.integrations,
    queryFn: () => adminSettingsIntegrationsApi.get()
  });

  const saved = query.data;
  const [edit, setEdit] = useState<SettingsIntegrations | null>(null);
  const draft = edit ?? saved;

  const saveMutation = useApiMutation({
    mutationFn: (body: SettingsIntegrations) => adminSettingsIntegrationsApi.save(body),
    invalidates: [adminSettingsKeys.integrations],
    successMessage: 'Integration settings saved',
    onSuccess: (next) => {
      queryClient.setQueryData(adminSettingsKeys.integrations, next);
      setEdit(null);
    }
  });

  const update = useCallback(
    (recipe: (current: SettingsIntegrations) => SettingsIntegrations) => {
      setEdit((current) => {
        const base = current ?? saved;
        if (!base) return current;
        return recipe(structuredClone(base));
      });
    },
    [saved]
  );

  const actions: IntegrationsSettingsActions | undefined = useMemo(() => {
    if (!draft) return undefined;
    return {
      draft,
      setIntegration: (key: SettingsIntegrationKey, entry: SettingsIntegrationEntry) =>
        update((current) => ({
          ...current,
          integrations: { ...current.integrations, [key]: entry }
        })),
      setWebhookEnabled: (on: boolean) =>
        update((current) => ({ ...current, webhook: { ...current.webhook, enabled: on } })),
      setWebhookUrl: (url: string) =>
        update((current) => ({ ...current, webhook: { ...current.webhook, url } })),
      setWebhookEvent: (key: SettingsWebhookEvent, on: boolean) =>
        update((current) => ({
          ...current,
          webhook: { ...current.webhook, events: { ...current.webhook.events, [key]: on } }
        }))
    };
  }, [draft, update]);

  const isDirty = Boolean(edit && saved && !sameIntegrations(edit, saved));

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
