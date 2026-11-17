import { z } from 'zod';

/** The five integrations on the Connected Integrations card (reference order). */
export const SETTINGS_INTEGRATION_KEYS = [
  'smtp',
  'sms',
  'whatsapp',
  'google_calendar',
  'google_maps'
] as const;
export type SettingsIntegrationKey = (typeof SETTINGS_INTEGRATION_KEYS)[number];

export const SETTINGS_INTEGRATION_META: Record<
  SettingsIntegrationKey,
  { title: string; description: string }
> = {
  smtp: {
    title: 'Email Service (SMTP)',
    description: 'Send transactional and bulk emails'
  },
  sms: {
    title: 'SMS Gateway',
    description: 'Send SMS notifications'
  },
  whatsapp: {
    title: 'WhatsApp Business',
    description: 'Send WhatsApp messages'
  },
  google_calendar: {
    title: 'Google Calendar',
    description: 'Sync interviews and schedules'
  },
  google_maps: {
    title: 'Google Maps',
    description: 'Location and address services'
  }
};

const SETTINGS_INTEGRATION_STATUSES = ['connected', 'not_connected'] as const;
type SettingsIntegrationStatus = (typeof SETTINGS_INTEGRATION_STATUSES)[number];

/** Events the webhook can fire on (reference order). */
export const SETTINGS_WEBHOOK_EVENTS = [
  'job_created',
  'application_received',
  'interview_scheduled',
  'candidate_status_updated'
] as const;
export type SettingsWebhookEvent = (typeof SETTINGS_WEBHOOK_EVENTS)[number];

export const SETTINGS_WEBHOOK_EVENT_LABELS: Record<SettingsWebhookEvent, string> = {
  job_created: 'Job Created',
  application_received: 'Application Received',
  interview_scheduled: 'Interview Scheduled',
  candidate_status_updated: 'Candidate Status Updated'
};

export interface SettingsIntegrationEntry {
  status: SettingsIntegrationStatus;
  /** A non-secret identifier set from Connect / Configure, e.g. a sender address. Empty until set. */
  detail: string;
}

/** Integrations Settings payload: the five service rows plus the outgoing webhook. */
export interface SettingsIntegrations {
  integrations: Record<SettingsIntegrationKey, SettingsIntegrationEntry>;
  webhook: {
    enabled: boolean;
    url: string;
    events: Record<SettingsWebhookEvent, boolean>;
  };
}

/** Connect / Configure dialog: a status flip plus an optional non-secret detail. */
export const settingsIntegrationFormSchema = z.object({
  status: z.enum(SETTINGS_INTEGRATION_STATUSES),
  detail: z.string().trim().max(120, 'Keep it under 120 characters')
});

export type SettingsIntegrationFormValues = z.infer<typeof settingsIntegrationFormSchema>;
