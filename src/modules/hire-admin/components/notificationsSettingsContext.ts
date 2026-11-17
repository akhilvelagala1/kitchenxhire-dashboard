import { createContext, useContext } from 'react';
import type {
  SettingsNotificationChannel,
  SettingsNotificationEvent,
  SettingsNotificationPriority,
  SettingsNotificationTemplate,
  SettingsNotificationTime,
  SettingsNotifications
} from '../schemas/adminSettingsNotifications';

export interface NotificationsSettingsActions {
  draft: SettingsNotifications;
  setChannel: (key: SettingsNotificationChannel, on: boolean) => void;
  setEvent: (key: SettingsNotificationEvent, on: boolean) => void;
  setTemplate: (key: SettingsNotificationEvent, template: SettingsNotificationTemplate) => void;
  setQuietHoursStart: (time: SettingsNotificationTime) => void;
  setQuietHoursEnd: (time: SettingsNotificationTime) => void;
  setRetryAttempts: (n: number) => void;
  setPriority: (priority: SettingsNotificationPriority) => void;
}

const NotificationsSettingsContext = createContext<NotificationsSettingsActions | null>(null);

export const NotificationsSettingsProvider = NotificationsSettingsContext.Provider;

export function useNotificationsSettingsDraft(): NotificationsSettingsActions {
  const value = useContext(NotificationsSettingsContext);
  if (!value) {
    throw new Error('useNotificationsSettingsDraft needs NotificationsSettingsProvider');
  }
  return value;
}
