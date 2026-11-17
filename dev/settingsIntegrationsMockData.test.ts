import { afterEach, describe, expect, it } from 'vitest';
import {
  getIntegrationsSettings,
  replaceIntegrationsSettings,
  resetIntegrationsSettings,
  validateIntegrationsBody
} from './settingsIntegrationsMockData.ts';

afterEach(() => {
  resetIntegrationsSettings();
});

describe('settingsIntegrationsMockData', () => {
  it('starts with the reference integration and webhook defaults', () => {
    const data = getIntegrationsSettings();

    expect(data.integrations.smtp.status).toBe('connected');
    expect(data.integrations.sms.status).toBe('connected');
    expect(data.integrations.whatsapp.status).toBe('not_connected');
    expect(data.integrations.google_calendar.status).toBe('connected');
    expect(data.integrations.google_maps.status).toBe('connected');
    expect(data.webhook).toEqual({
      enabled: true,
      url: 'https://your-domain.com/webhook',
      events: {
        job_created: true,
        application_received: true,
        interview_scheduled: true,
        candidate_status_updated: true
      }
    });
  });

  it('rejects an unknown integration status', () => {
    const current = getIntegrationsSettings();
    const { fields } = validateIntegrationsBody({
      ...current,
      integrations: { ...current.integrations, smtp: { status: 'pending', detail: '' } }
    });

    expect(fields['integrations.smtp.status']).toBeTruthy();
  });

  it('rejects a non-https webhook URL while the webhook is enabled', () => {
    const current = getIntegrationsSettings();
    const { fields } = validateIntegrationsBody({
      ...current,
      webhook: { ...current.webhook, url: 'http://insecure.example.com' }
    });

    expect(fields['webhook.url']).toMatch(/https/);
  });

  it('accepts a blank webhook URL while the webhook is disabled', () => {
    const current = getIntegrationsSettings();
    const { value, fields } = validateIntegrationsBody({
      ...current,
      webhook: { ...current.webhook, enabled: false, url: '' }
    });

    expect(fields).toEqual({});
    expect(value?.webhook.enabled).toBe(false);
  });

  it('replaces the store with a valid payload', () => {
    const current = getIntegrationsSettings();
    const next = replaceIntegrationsSettings({
      ...current,
      integrations: {
        ...current.integrations,
        whatsapp: { status: 'connected', detail: '+91 98765 43210' }
      }
    });

    expect(next.integrations.whatsapp.status).toBe('connected');
    expect(getIntegrationsSettings().integrations.whatsapp.status).toBe('connected');
  });
});
