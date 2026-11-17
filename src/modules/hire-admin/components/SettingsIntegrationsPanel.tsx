import { SettingsConnectedIntegrationsCard } from './SettingsConnectedIntegrationsCard';
import { SettingsWebhookCard } from './SettingsWebhookCard';

/** The Integrations tab content: two side-by-side cards (Connected Integrations, Webhook). */
export function SettingsIntegrationsPanel() {
  return (
    <>
      <SettingsConnectedIntegrationsCard />
      <SettingsWebhookCard />
    </>
  );
}
