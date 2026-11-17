import { useId } from 'react';
import { Input } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import {
  SETTINGS_WEBHOOK_EVENTS,
  SETTINGS_WEBHOOK_EVENT_LABELS
} from '../schemas/adminSettingsIntegrations';
import { SettingsCard } from './SettingsCard';
import { INTEGRATIONS_CARD_CLASS, INTEGRATIONS_SWITCH } from './settingsIntegrationsDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useIntegrationsSettingsDraft } from './integrationsSettingsContext';

const HTTPS_URL = /^https:\/\/.+/i;

/** Right card: the outgoing webhook — on/off, its URL, and which events fire it. */
export function SettingsWebhookCard() {
  const canEdit = useCanEditSettings();
  const { draft, setWebhookEnabled, setWebhookUrl, setWebhookEvent } =
    useIntegrationsSettingsDraft();
  const { webhook } = draft;
  const urlId = useId();
  const urlError =
    webhook.enabled && webhook.url.trim() && !HTTPS_URL.test(webhook.url.trim())
      ? 'Enter a valid https:// URL'
      : webhook.enabled && !webhook.url.trim()
        ? 'Enter the webhook URL'
        : undefined;

  return (
    <SettingsCard
      title="Webhook"
      description="Receive real-time platform events."
      className={INTEGRATIONS_CARD_CLASS}
    >
      <div className="flex flex-col gap-4 lg:gap-[calc(18*var(--u))]">
        <div className="flex items-center justify-between lg:min-h-[calc(27*var(--u))]">
          <p className="text-[15px] font-semibold text-[#111827] lg:text-[calc(15*var(--u))]">
            Enable Webhook
          </p>
          <Switch
            checked={webhook.enabled}
            onCheckedChange={setWebhookEnabled}
            disabled={!canEdit}
            aria-label="Enable Webhook"
            className={INTEGRATIONS_SWITCH}
          />
        </div>

        <div className="flex flex-col gap-1.5 lg:gap-[calc(6*var(--u))]">
          <label
            htmlFor={urlId}
            className="text-[13px] font-semibold text-[#111827] lg:text-[calc(13*var(--u))]"
          >
            Webhook URL <span className="text-danger-600">*</span>
          </label>
          <Input
            id={urlId}
            type="url"
            inputMode="url"
            value={webhook.url}
            disabled={!canEdit || !webhook.enabled}
            aria-invalid={Boolean(urlError)}
            onChange={(event) => setWebhookUrl(event.target.value)}
            placeholder="https://your-domain.com/webhook"
            className="lg:h-[calc(48*var(--u))] lg:rounded-[calc(10*var(--u))] lg:px-[calc(14*var(--u))] lg:text-[calc(13.5*var(--u))]"
          />
          {urlError && (
            <p className="text-xs text-danger-600 lg:text-[calc(12*var(--u))]">{urlError}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 lg:gap-[calc(10*var(--u))]">
          <p className="text-[13px] font-semibold text-[#111827] lg:text-[calc(13*var(--u))]">
            Events
          </p>
          <ul className="flex flex-col gap-2 lg:gap-[calc(10*var(--u))]">
            {SETTINGS_WEBHOOK_EVENTS.map((key) => (
              <li key={key}>
                <label className="flex min-h-[32px] cursor-pointer items-center gap-2.5 has-disabled:cursor-not-allowed lg:min-h-0 lg:gap-[calc(10*var(--u))]">
                  <input
                    type="checkbox"
                    aria-label={SETTINGS_WEBHOOK_EVENT_LABELS[key]}
                    checked={webhook.events[key]}
                    disabled={!canEdit || !webhook.enabled}
                    onChange={(event) => setWebhookEvent(key, event.target.checked)}
                    className="size-5 shrink-0 accent-brand-600 lg:size-[calc(19*var(--u))]"
                  />
                  <span className="text-[14px] font-medium text-[#111827] lg:text-[calc(13.5*var(--u))]">
                    {SETTINGS_WEBHOOK_EVENT_LABELS[key]}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SettingsCard>
  );
}
