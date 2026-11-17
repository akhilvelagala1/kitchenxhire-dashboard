import { createContext, useContext } from 'react';
import type {
  SettingsManagedRole,
  SettingsManagedUser,
  SettingsPermissionKey,
  SettingsPlatformRole,
  SettingsUsersRoles
} from '../schemas/adminSettingsUsersRoles';

export interface UsersRolesSettingsActions {
  draft: SettingsUsersRoles;
  setUsers: (users: SettingsManagedUser[]) => void;
  upsertUser: (user: SettingsManagedUser) => void;
  removeUser: (id: string) => void;
  setRoles: (roles: SettingsManagedRole[]) => void;
  upsertRole: (role: SettingsManagedRole) => void;
  removeRole: (id: string) => void;
  setPermission: (key: SettingsPermissionKey, role: SettingsPlatformRole, on: boolean) => void;
  setTwoFactor: (on: boolean) => void;
  setSessionTimeout: (minutes: number) => void;
  setActivityLogging: (on: boolean) => void;
  setIpRestriction: (on: boolean) => void;
}

const UsersRolesSettingsContext = createContext<UsersRolesSettingsActions | null>(null);

export const UsersRolesSettingsProvider = UsersRolesSettingsContext.Provider;

export function useUsersRolesSettingsDraft(): UsersRolesSettingsActions {
  const value = useContext(UsersRolesSettingsContext);
  if (!value) {
    throw new Error('useUsersRolesSettingsDraft needs UsersRolesSettingsProvider');
  }
  return value;
}
