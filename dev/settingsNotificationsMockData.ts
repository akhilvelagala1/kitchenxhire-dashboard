/**
 * In-memory Notifications Settings for the dev mock. Restarting the server resets them.
 * Defaults match the 1536×1024 Notifications Settings reference.
 */
import type {
  SettingsNotificationEvent,
  SettingsNotificationTemplate,
  SettingsNotifications
} from '../src/modules/hire-admin/schemas/adminSettingsNotifications.ts';

const DEFAULT_TEMPLATES: Record<SettingsNotificationEvent, SettingsNotificationTemplate> = {
  new_job_application: {
    subject: 'New Job Application Received',
    message: 'A new job application has been received for {{job_title}} at {{business_name}}.'
  },
  interview_scheduled: {
    subject: 'Interview Scheduled',
    message: 'An interview has been scheduled for {{candidate_name}}.'
  },
  interview_reminder: {
    subject: 'Interview Reminder',
    message: 'This is a reminder for your upcoming interview.'
  },
  candidate_shortlisted: {
    subject: 'Congratulations! You are shortlisted',
    message: 'You have been shortlisted for {{job_title}}.'
  },
  candidate_rejected: {
    subject: 'Application Status Update',
    message: 'Your application status has been updated.'
  },
  new_business_registration: {
    subject: 'New Business Registration',
    message: 'A new business {{business_name}} has registered.'
  }
};

const DEFAULTS: SettingsNotifications = {
  channels: {
    email: true,
    sms: true,
    whatsapp: false,
    in_app: true,
    push: false
  },
  events: {
    new_job_application: true,
    interview_scheduled: true,
    interview_reminder: true,
    candidate_shortlisted: true,
    candidate_rejected: false,
    new_business_registration: true
  },
  templates: structuredClone(DEFAULT_TEMPLATES),
  quiet_hours_start: '10:00 PM',
  quiet_hours_end: '07:00 AM',
  retry_attempts: 3,
  priority: 'High'
};

let store: SettingsNotifications = structuredClone(DEFAULTS);

export function getNotificationsSettings(): SettingsNotifications {
  return structuredClone(store);
}

export function replaceNotificationsSettings(next: SettingsNotifications): SettingsNotifications {
  store = structuredClone(next);
  return getNotificationsSettings();
}

/** Test helper: put the mock back to screenshot defaults. */
export function resetNotificationsSettings(): SettingsNotifications {
  store = structuredClone(DEFAULTS);
  return getNotificationsSettings();
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const TIMES = new Set([
  '12:00 AM',
  '01:00 AM',
  '02:00 AM',
  '03:00 AM',
  '04:00 AM',
  '05:00 AM',
  '06:00 AM',
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
  '11:00 PM'
]);

const PRIORITIES = new Set(['Low', 'Normal', 'High', 'Urgent']);
const CHANNELS = ['email', 'sms', 'whatsapp', 'in_app', 'push'] as const;
const EVENTS = [
  'new_job_application',
  'interview_scheduled',
  'interview_reminder',
  'candidate_shortlisted',
  'candidate_rejected',
  'new_business_registration'
] as const;

/**
 * Validates a full replace body for PATCH /hire/admin/settings/notifications.
 * Returns field errors when anything is wrong; otherwise the normalised payload.
 */
export function validateNotificationsBody(body: unknown): {
  value?: SettingsNotifications;
  fields: Record<string, string>;
} {
  const fields: Record<string, string> = {};
  if (!isRecord(body)) {
    return { fields: { body: 'Send the Notifications settings as a JSON object' } };
  }

  if (!isRecord(body.channels)) fields.channels = 'Send the channel toggles';
  if (!isRecord(body.events)) fields.events = 'Send the event checkboxes';
  if (!isRecord(body.templates)) fields.templates = 'Send the templates';

  const retries = body.retry_attempts;
  if (typeof retries !== 'number' || !Number.isInteger(retries) || retries < 1 || retries > 10) {
    fields.retry_attempts = 'Retry attempts must be a whole number from 1 to 10';
  }

  if (typeof body.quiet_hours_start !== 'string' || !TIMES.has(body.quiet_hours_start)) {
    fields.quiet_hours_start = 'Choose a quiet-hours start time';
  }
  if (typeof body.quiet_hours_end !== 'string' || !TIMES.has(body.quiet_hours_end)) {
    fields.quiet_hours_end = 'Choose a quiet-hours end time';
  }
  if (typeof body.priority !== 'string' || !PRIORITIES.has(body.priority)) {
    fields.priority = 'Choose Low, Normal, High or Urgent';
  }

  if (Object.keys(fields).length > 0) return { fields };

  const channels = body.channels as Record<string, unknown>;
  const events = body.events as Record<string, unknown>;
  const templates = body.templates as Record<string, unknown>;

  for (const key of CHANNELS) {
    if (typeof channels[key] !== 'boolean') fields[`channels.${key}`] = 'Must be true or false';
  }
  for (const key of EVENTS) {
    if (typeof events[key] !== 'boolean') fields[`events.${key}`] = 'Must be true or false';
    if (!isRecord(templates[key])) {
      fields[`templates.${key}`] = 'Each template must be an object';
      continue;
    }
    const subject = typeof templates[key].subject === 'string' ? templates[key].subject.trim() : '';
    const message = typeof templates[key].message === 'string' ? templates[key].message.trim() : '';
    if (subject.length < 2) fields[`templates.${key}.subject`] = 'Enter a subject';
    if (message.length < 2) fields[`templates.${key}.message`] = 'Enter a message';
  }

  if (Object.keys(fields).length > 0) return { fields };

  return {
    fields: {},
    value: {
      channels: {
        email: channels.email as boolean,
        sms: channels.sms as boolean,
        whatsapp: channels.whatsapp as boolean,
        in_app: channels.in_app as boolean,
        push: channels.push as boolean
      },
      events: {
        new_job_application: events.new_job_application as boolean,
        interview_scheduled: events.interview_scheduled as boolean,
        interview_reminder: events.interview_reminder as boolean,
        candidate_shortlisted: events.candidate_shortlisted as boolean,
        candidate_rejected: events.candidate_rejected as boolean,
        new_business_registration: events.new_business_registration as boolean
      },
      templates: Object.fromEntries(
        EVENTS.map((key) => {
          const row = templates[key] as { subject: string; message: string };
          return [key, { subject: row.subject.trim(), message: row.message.trim() }];
        })
      ) as SettingsNotifications['templates'],
      quiet_hours_start: body.quiet_hours_start as SettingsNotifications['quiet_hours_start'],
      quiet_hours_end: body.quiet_hours_end as SettingsNotifications['quiet_hours_end'],
      retry_attempts: retries as number,
      priority: body.priority as SettingsNotifications['priority']
    }
  };
}
