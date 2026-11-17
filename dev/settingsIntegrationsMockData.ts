/**
 * In-memory Integrations Settings for the dev mock. Restarting the server resets them.
 * Defaults match the Integrations Settings reference.
 */
import type {
  SettingsIntegrationKey,
  SettingsIntegrations,
  SettingsWebhookEvent
} from '../src/modules/hire-admin/schemas/adminSettingsIntegrations.ts';

const INTEGRATIONS: readonly SettingsIntegrationKey[] = [
  'smtp',
  'sms',
  'whatsapp',
  'google_calendar',
  'google_maps'
];
const EVENTS: readonly SettingsWebhookEvent[] = [
  'job_created',
  'application_received',
  'interview_scheduled',
  'candidate_status_updated'
];

const DEFAULTS: SettingsIntegrations = {
  integrations: {
    smtp: { status: 'connected', detail: '' },
    sms: { status: 'connected', detail: '' },
    whatsapp: { status: 'not_connected', detail: '' },
    google_calendar: { status: 'connected', detail: '' },
    google_maps: { status: 'connected', detail: '' }
  },
  webhook: {
    enabled: true,
    url: 'https://your-domain.com/webhook',
    events: {
      job_created: true,
      application_received: true,
      interview_scheduled: true,
      candidate_status_updated: true
    }
  }
};

let current: SettingsIntegrations = structuredClone(DEFAULTS);

export function getIntegrationsSettings(): SettingsIntegrations {
  return structuredClone(current);
}

export function replaceIntegrationsSettings(next: SettingsIntegrations): SettingsIntegrations {
  current = structuredClone(next);
  return structuredClone(current);
}

/** Test-only: puts the in-memory store back to its defaults between tests. */
export function resetIntegrationsSettings(): SettingsIntegrations {
  current = structuredClone(DEFAULTS);
  return structuredClone(current);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const HTTPS_URL = /^https:\/\/.+/i;

/**
 * Validates a full replace body for PATCH /hire/admin/settings/integrations.
 * Returns field errors when anything is wrong; otherwise the normalised payload.
 */
export function validateIntegrationsBody(body: unknown): {
  value?: SettingsIntegrations;
  fields: Record<string, string>;
} {
  const fields: Record<string, string> = {};
  if (!isRecord(body)) {
    return { fields: { body: 'Send the Integrations settings as a JSON object' } };
  }

  if (!isRecord(body.integrations)) fields.integrations = 'Send the integration rows';
  if (!isRecord(body.webhook)) fields.webhook = 'Send the webhook settings';
  if (Object.keys(fields).length > 0) return { fields };

  const integrations = body.integrations as Record<string, unknown>;
  for (const key of INTEGRATIONS) {
    const row = integrations[key];
    if (!isRecord(row) || (row.status !== 'connected' && row.status !== 'not_connected')) {
      fields[`integrations.${key}.status`] = 'Must be connected or not_connected';
      continue;
    }
    if (typeof row.detail !== 'string') fields[`integrations.${key}.detail`] = 'Must be text';
  }

  const webhook = body.webhook as Record<string, unknown>;
  if (typeof webhook.enabled !== 'boolean') fields['webhook.enabled'] = 'Must be true or false';
  if (typeof webhook.url !== 'string') {
    fields['webhook.url'] = 'Enter the webhook URL';
  } else if (webhook.enabled && !HTTPS_URL.test(webhook.url.trim())) {
    fields['webhook.url'] = 'Enter a valid https:// URL';
  }
  if (!isRecord(webhook.events)) {
    fields['webhook.events'] = 'Send the event checkboxes';
  } else {
    for (const key of EVENTS) {
      if (typeof webhook.events[key] !== 'boolean') {
        fields[`webhook.events.${key}`] = 'Must be true or false';
      }
    }
  }

  if (Object.keys(fields).length > 0) return { fields };

  const events = webhook.events as Record<string, boolean>;
  return {
    fields: {},
    value: {
      integrations: Object.fromEntries(
        INTEGRATIONS.map((key) => {
          const row = integrations[key] as { status: string; detail: string };
          return [key, { status: row.status, detail: row.detail.trim() }];
        })
      ) as SettingsIntegrations['integrations'],
      webhook: {
        enabled: webhook.enabled as boolean,
        url: (webhook.url as string).trim(),
        events: {
          job_created: events.job_created,
          application_received: events.application_received,
          interview_scheduled: events.interview_scheduled,
          candidate_status_updated: events.candidate_status_updated
        }
      }
    }
  };
}
