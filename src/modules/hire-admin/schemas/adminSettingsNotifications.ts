import { z } from 'zod';

/** Channel toggles on Notification Channels (reference order). */
export const SETTINGS_NOTIFICATION_CHANNELS = [
  'email',
  'sms',
  'whatsapp',
  'in_app',
  'push'
] as const;
export type SettingsNotificationChannel = (typeof SETTINGS_NOTIFICATION_CHANNELS)[number];

export const SETTINGS_NOTIFICATION_CHANNEL_META: Record<
  SettingsNotificationChannel,
  { title: string; description: string }
> = {
  email: {
    title: 'Email Notifications',
    description: 'Send email alerts and updates'
  },
  sms: {
    title: 'SMS Notifications',
    description: 'Send SMS for important updates'
  },
  whatsapp: {
    title: 'WhatsApp Notifications',
    description: 'Send WhatsApp messages'
  },
  in_app: {
    title: 'In-app Notifications',
    description: 'Show notifications inside the platform'
  },
  push: {
    title: 'Push Notifications',
    description: 'Browser and mobile push alerts'
  }
};

/** Event checkboxes on Notification Events (reference order). */
export const SETTINGS_NOTIFICATION_EVENTS = [
  'new_job_application',
  'interview_scheduled',
  'interview_reminder',
  'candidate_shortlisted',
  'candidate_rejected',
  'new_business_registration'
] as const;
export type SettingsNotificationEvent = (typeof SETTINGS_NOTIFICATION_EVENTS)[number];

export const SETTINGS_NOTIFICATION_EVENT_META: Record<
  SettingsNotificationEvent,
  { title: string; description: string }
> = {
  new_job_application: {
    title: 'New Job Application',
    description: 'Notify recruiter and admin'
  },
  interview_scheduled: {
    title: 'Interview Scheduled',
    description: 'Notify candidate and recruiter'
  },
  interview_reminder: {
    title: 'Interview Reminder',
    description: 'Send reminder before interview'
  },
  candidate_shortlisted: {
    title: 'Candidate Shortlisted',
    description: 'Notify candidate'
  },
  candidate_rejected: {
    title: 'Candidate Rejected',
    description: 'Notify candidate'
  },
  new_business_registration: {
    title: 'New Business Registration',
    description: 'Notify admin'
  }
};

export const SETTINGS_NOTIFICATION_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;
export type SettingsNotificationPriority = (typeof SETTINGS_NOTIFICATION_PRIORITIES)[number];

export const SETTINGS_NOTIFICATION_RETRY = { min: 1, max: 10 } as const;

/** 12-hour clock labels used by Quiet Hours dropdowns. */
export const SETTINGS_NOTIFICATION_TIMES = [
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
] as const;
export type SettingsNotificationTime = (typeof SETTINGS_NOTIFICATION_TIMES)[number];

export interface SettingsNotificationTemplate {
  subject: string;
  message: string;
}

/** Notifications Settings payload: channels, events, templates, delivery. */
export interface SettingsNotifications {
  channels: Record<SettingsNotificationChannel, boolean>;
  events: Record<SettingsNotificationEvent, boolean>;
  templates: Record<SettingsNotificationEvent, SettingsNotificationTemplate>;
  quiet_hours_start: SettingsNotificationTime;
  quiet_hours_end: SettingsNotificationTime;
  retry_attempts: number;
  priority: SettingsNotificationPriority;
}

export const settingsNotificationTemplateFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(2, 'Enter a subject')
    .max(120, 'Keep the subject under 120 characters'),
  message: z
    .string()
    .trim()
    .min(2, 'Enter a message')
    .max(2000, 'Keep the message under 2000 characters')
});

export type SettingsNotificationTemplateFormValues = z.infer<
  typeof settingsNotificationTemplateFormSchema
>;
