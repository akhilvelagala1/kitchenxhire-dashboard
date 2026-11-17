import { createContext, useContext } from 'react';
import type {
  SettingsFailedAttemptsOption,
  SettingsLockDurationOption,
  SettingsPasswordPolicy,
  SettingsSecurity,
  SettingsSessionTimeoutOption
} from '../schemas/adminSettingsSecurity';

export interface SecuritySettingsActions {
  draft: SettingsSecurity;
  setTwoFactorAuth: (on: boolean) => void;
  setIpRestriction: (on: boolean) => void;
  setSessionTimeout: (value: SettingsSessionTimeoutOption) => void;
  setFailedLoginAttempts: (value: SettingsFailedAttemptsOption) => void;
  setAccountLockDuration: (value: SettingsLockDurationOption) => void;
  setPasswordPolicy: (policy: SettingsPasswordPolicy) => void;
}

const SecuritySettingsContext = createContext<SecuritySettingsActions | null>(null);

export const SecuritySettingsProvider = SecuritySettingsContext.Provider;

export function useSecuritySettingsDraft(): SecuritySettingsActions {
  const value = useContext(SecuritySettingsContext);
  if (!value) {
    throw new Error('useSecuritySettingsDraft needs SecuritySettingsProvider');
  }
  return value;
}
