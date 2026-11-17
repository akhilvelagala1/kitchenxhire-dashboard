import { afterEach, describe, expect, it } from 'vitest';
import {
  getNotificationsSettings,
  replaceNotificationsSettings,
  resetNotificationsSettings,
  validateNotificationsBody
} from './settingsNotificationsMockData.ts';

afterEach(() => {
  resetNotificationsSettings();
});

describe('settingsNotificationsMockData', () => {
  it('starts with the reference channel, event, and delivery defaults', () => {
    const data = getNotificationsSettings();

    expect(data.channels).toEqual({
      email: true,
      sms: true,
      whatsapp: false,
      in_app: true,
      push: false
    });
    expect(data.events.candidate_rejected).toBe(false);
    expect(data.events.new_job_application).toBe(true);
    expect(data.templates.new_job_application.subject).toBe('New Job Application Received');
    expect(data.quiet_hours_start).toBe('10:00 PM');
    expect(data.quiet_hours_end).toBe('07:00 AM');
    expect(data.retry_attempts).toBe(3);
    expect(data.priority).toBe('High');
  });

  it('rejects a payload with an invalid retry count', () => {
    const current = getNotificationsSettings();
    const { fields } = validateNotificationsBody({ ...current, retry_attempts: 0 });

    expect(fields.retry_attempts).toMatch(/1 to 10/);
  });

  it('replaces the store with a valid payload', () => {
    const current = getNotificationsSettings();
    const next = replaceNotificationsSettings({
      ...current,
      channels: { ...current.channels, push: true },
      priority: 'Urgent'
    });

    expect(next.channels.push).toBe(true);
    expect(next.priority).toBe('Urgent');
    expect(getNotificationsSettings().priority).toBe('Urgent');
  });
});
