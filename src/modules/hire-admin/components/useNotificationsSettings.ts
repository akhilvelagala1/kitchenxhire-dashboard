import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { usePermissions } from '@/shared/auth/usePermissions';
import { adminSettingsKeys } from '../api/adminSettingsKeys';
import { adminSettingsNotificationsApi } from '../api/adminSettingsNotificationsApi';
import { HIRE_ADMIN_PERMISSIONS } from '../permissions';
import type {
  SettingsNotificationChannel,
  SettingsNotificationEvent,
  SettingsNotificationPriority,
  SettingsNotificationTemplate,
  SettingsNotificationTime,
  SettingsNotifications
} from '../schemas/adminSettingsNotifications';
import type { NotificationsSettingsActions } from './notificationsSettingsContext';

function sameNotifications(a: SettingsNotifications, b: SettingsNotifications): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface UseNotificationsSettingsResult {
  draft: SettingsNotifications | undefined;
  actions: NotificationsSettingsActions | undefined;
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
 * Draft-backed Notifications Settings: edits stay local until Save; Reset restores the last saved
 * payload. Save sends the whole object (PATCH /hire/admin/settings/notifications).
 */
export function useNotificationsSettings(): UseNotificationsSettingsResult {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canEdit = can(HIRE_ADMIN_PERMISSIONS.manage);
  const query = useQuery({
    queryKey: adminSettingsKeys.notifications,
    queryFn: () => adminSettingsNotificationsApi.get()
  });

  const saved = query.data;
  const [edit, setEdit] = useState<SettingsNotifications | null>(null);
  const draft = edit ?? saved;

  const saveMutation = useApiMutation({
    mutationFn: (body: SettingsNotifications) => adminSettingsNotificationsApi.save(body),
    invalidates: [adminSettingsKeys.notifications],
    successMessage: 'Notification settings saved',
    onSuccess: (next) => {
      queryClient.setQueryData(adminSettingsKeys.notifications, next);
      setEdit(null);
    }
  });

  const update = useCallback(
    (recipe: (current: SettingsNotifications) => SettingsNotifications) => {
      setEdit((current) => {
        const base = current ?? saved;
        if (!base) return current;
        return recipe(structuredClone(base));
      });
    },
    [saved]
  );

  const actions: NotificationsSettingsActions | undefined = useMemo(() => {
    if (!draft) return undefined;
    return {
      draft,
      setChannel: (key: SettingsNotificationChannel, on: boolean) =>
        update((current) => ({
          ...current,
          channels: { ...current.channels, [key]: on }
        })),
      setEvent: (key: SettingsNotificationEvent, on: boolean) =>
        update((current) => ({
          ...current,
          events: { ...current.events, [key]: on }
        })),
      setTemplate: (key: SettingsNotificationEvent, template: SettingsNotificationTemplate) =>
        update((current) => ({
          ...current,
          templates: { ...current.templates, [key]: template }
        })),
      setQuietHoursStart: (time: SettingsNotificationTime) =>
        update((current) => ({ ...current, quiet_hours_start: time })),
      setQuietHoursEnd: (time: SettingsNotificationTime) =>
        update((current) => ({ ...current, quiet_hours_end: time })),
      setRetryAttempts: (n: number) => update((current) => ({ ...current, retry_attempts: n })),
      setPriority: (priority: SettingsNotificationPriority) =>
        update((current) => ({ ...current, priority }))
    };
  }, [draft, update]);

  const isDirty = Boolean(edit && saved && !sameNotifications(edit, saved));

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
