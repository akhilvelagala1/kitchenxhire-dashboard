import { createContext, useContext } from 'react';
import type {
  SettingsIntegrationEntry,
  SettingsIntegrationKey,
  SettingsIntegrations,
  SettingsWebhookEvent
} from '../schemas/adminSettingsIntegrations';

export interface IntegrationsSettingsActions {
  draft: SettingsIntegrations;
  setIntegration: (key: SettingsIntegrationKey, entry: SettingsIntegrationEntry) => void;
  setWebhookEnabled: (on: boolean) => void;
  setWebhookUrl: (url: string) => void;
  setWebhookEvent: (key: SettingsWebhookEvent, on: boolean) => void;
}

const IntegrationsSettingsContext = createContext<IntegrationsSettingsActions | null>(null);

export const IntegrationsSettingsProvider = IntegrationsSettingsContext.Provider;

export function useIntegrationsSettingsDraft(): IntegrationsSettingsActions {
  const value = useContext(IntegrationsSettingsContext);
  if (!value) {
    throw new Error('useIntegrationsSettingsDraft needs IntegrationsSettingsProvider');
  }
  return value;
}
