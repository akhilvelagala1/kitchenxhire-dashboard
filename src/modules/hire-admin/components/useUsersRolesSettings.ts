import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { usePermissions } from '@/shared/auth/usePermissions';
import { adminSettingsKeys } from '../api/adminSettingsKeys';
import { adminSettingsUsersRolesApi } from '../api/adminSettingsUsersRolesApi';
import { HIRE_ADMIN_PERMISSIONS } from '../permissions';
import type {
  SettingsPermissionKey,
  SettingsPlatformRole,
  SettingsUsersRoles
} from '../schemas/adminSettingsUsersRoles';
import type { UsersRolesSettingsActions } from './usersRolesSettingsContext';

function sameUsersRoles(a: SettingsUsersRoles, b: SettingsUsersRoles): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface UseUsersRolesSettingsResult {
  draft: SettingsUsersRoles | undefined;
  actions: UsersRolesSettingsActions | undefined;
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
 * Draft-backed Users & Roles Settings: edits stay local until Save; Reset restores the last saved
 * payload. Save sends the whole object (PATCH /hire/admin/settings/users-roles).
 */
export function useUsersRolesSettings(): UseUsersRolesSettingsResult {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canEdit = can(HIRE_ADMIN_PERMISSIONS.manage);
  const query = useQuery({
    queryKey: adminSettingsKeys.usersRoles,
    queryFn: () => adminSettingsUsersRolesApi.get()
  });

  const saved = query.data;

  /** Local edits only; `null` means “show the last saved payload”. */
  const [edit, setEdit] = useState<SettingsUsersRoles | null>(null);
  const draft = edit ?? saved;

  const saveMutation = useApiMutation({
    mutationFn: (body: SettingsUsersRoles) => adminSettingsUsersRolesApi.save(body),
    invalidates: [adminSettingsKeys.usersRoles],
    successMessage: 'Users & Roles settings saved',
    onSuccess: (next) => {
      queryClient.setQueryData(adminSettingsKeys.usersRoles, next);
      setEdit(null);
    }
  });

  const update = useCallback(
    (recipe: (current: SettingsUsersRoles) => SettingsUsersRoles) => {
      setEdit((current) => {
        const base = current ?? saved;
        if (!base) return current;
        return recipe(structuredClone(base));
      });
    },
    [saved]
  );

  const actions: UsersRolesSettingsActions | undefined = useMemo(() => {
    if (!draft) return undefined;
    return {
      draft,
      setUsers: (users) => update((current) => ({ ...current, users })),
      upsertUser: (user) =>
        update((current) => {
          const index = current.users.findIndex((row) => row.id === user.id);
          const users =
            index >= 0
              ? current.users.map((row, i) => (i === index ? user : row))
              : [...current.users, user];
          return { ...current, users };
        }),
      removeUser: (id) =>
        update((current) => ({
          ...current,
          users: current.users.filter((row) => row.id !== id)
        })),
      setRoles: (roles) => update((current) => ({ ...current, roles })),
      upsertRole: (role) =>
        update((current) => {
          const index = current.roles.findIndex((row) => row.id === role.id);
          const roles =
            index >= 0
              ? current.roles.map((row, i) => (i === index ? role : row))
              : [...current.roles, role];
          return { ...current, roles };
        }),
      removeRole: (id) =>
        update((current) => ({
          ...current,
          roles: current.roles.filter((row) => row.id !== id)
        })),
      setPermission: (key: SettingsPermissionKey, role: SettingsPlatformRole, on: boolean) =>
        update((current) => ({
          ...current,
          permissions: {
            ...current.permissions,
            [key]: { ...current.permissions[key], [role]: on }
          }
        })),
      setTwoFactor: (on) => update((current) => ({ ...current, two_factor_auth: on })),
      setSessionTimeout: (minutes) =>
        update((current) => ({ ...current, session_timeout_minutes: minutes })),
      setActivityLogging: (on) => update((current) => ({ ...current, user_activity_logging: on })),
      setIpRestriction: (on) => update((current) => ({ ...current, ip_access_restriction: on }))
    };
  }, [draft, update]);

  const isDirty = Boolean(edit && saved && !sameUsersRoles(edit, saved));

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

/** Fresh id for a user added only in the draft (before Save). */
export function newDraftUserId(): string {
  return `su-draft-${crypto.randomUUID().slice(0, 8)}`;
}

/** Fresh id for a role added only in the draft (before Save). */
export function newDraftRoleId(): string {
  return `sr-draft-${crypto.randomUUID().slice(0, 8)}`;
}
