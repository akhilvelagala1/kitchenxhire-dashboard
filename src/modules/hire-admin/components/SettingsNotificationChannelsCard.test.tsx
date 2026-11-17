import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '@/shared/test/render';
import type { SettingsNotifications } from '../schemas/adminSettingsNotifications';
import { SettingsEditProvider } from './settingsEditContext';
import { SettingsNotificationChannelsCard } from './SettingsNotificationChannelsCard';
import {
  NotificationsSettingsProvider,
  type NotificationsSettingsActions
} from './notificationsSettingsContext';

const DRAFT: SettingsNotifications = {
  channels: { email: true, sms: true, whatsapp: false, in_app: true, push: false },
  events: {
    new_job_application: true,
    interview_scheduled: true,
    interview_reminder: true,
    candidate_shortlisted: true,
    candidate_rejected: false,
    new_business_registration: true
  },
  templates: {
    new_job_application: { subject: 'A', message: 'B' },
    interview_scheduled: { subject: 'A', message: 'B' },
    interview_reminder: { subject: 'A', message: 'B' },
    candidate_shortlisted: { subject: 'A', message: 'B' },
    candidate_rejected: { subject: 'A', message: 'B' },
    new_business_registration: { subject: 'A', message: 'B' }
  },
  quiet_hours_start: '10:00 PM',
  quiet_hours_end: '07:00 AM',
  retry_attempts: 3,
  priority: 'High'
};

function renderCard(setChannel = vi.fn()) {
  const actions = {
    draft: DRAFT,
    setChannel,
    setEvent: vi.fn(),
    setTemplate: vi.fn(),
    setQuietHoursStart: vi.fn(),
    setQuietHoursEnd: vi.fn(),
    setRetryAttempts: vi.fn(),
    setPriority: vi.fn()
  } satisfies NotificationsSettingsActions;

  renderPage(
    <SettingsEditProvider value={true}>
      <NotificationsSettingsProvider value={actions}>
        <SettingsNotificationChannelsCard />
      </NotificationsSettingsProvider>
    </SettingsEditProvider>
  );

  return { setChannel };
}

describe('SettingsNotificationChannelsCard', () => {
  it('lists the five channels and flips a toggle into the draft', async () => {
    const { setChannel } = renderCard();

    expect(screen.getByRole('region', { name: 'Notification Channels' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Email Notifications' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'WhatsApp Notifications' })).not.toBeChecked();

    await userEvent.click(screen.getByRole('switch', { name: 'WhatsApp Notifications' }));

    expect(setChannel).toHaveBeenCalledWith('whatsapp', true);
  });
});
