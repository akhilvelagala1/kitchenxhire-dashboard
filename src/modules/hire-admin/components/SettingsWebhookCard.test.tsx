import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '@/shared/test/render';
import type { SettingsIntegrations } from '../schemas/adminSettingsIntegrations';
import { SettingsWebhookCard } from './SettingsWebhookCard';
import { SettingsEditProvider } from './settingsEditContext';
import {
  IntegrationsSettingsProvider,
  type IntegrationsSettingsActions
} from './integrationsSettingsContext';

function renderCard(
  draft: SettingsIntegrations,
  overrides: Partial<IntegrationsSettingsActions> = {}
) {
  const actions = {
    draft,
    setIntegration: vi.fn(),
    setWebhookEnabled: vi.fn(),
    setWebhookUrl: vi.fn(),
    setWebhookEvent: vi.fn(),
    ...overrides
  } satisfies IntegrationsSettingsActions;

  renderPage(
    <SettingsEditProvider value={true}>
      <IntegrationsSettingsProvider value={actions}>
        <SettingsWebhookCard />
      </IntegrationsSettingsProvider>
    </SettingsEditProvider>
  );

  return actions;
}

const BASE: SettingsIntegrations = {
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

describe('SettingsWebhookCard', () => {
  it('shows the switch on, the URL, and all four events checked', () => {
    renderCard(BASE);

    expect(screen.getByRole('region', { name: 'Webhook' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Enable Webhook' })).toBeChecked();
    expect(screen.getByDisplayValue('https://your-domain.com/webhook')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Job Created' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Candidate Status Updated' })).toBeChecked();
  });

  it('flips the switch into the draft', async () => {
    const actions = renderCard(BASE);

    await userEvent.click(screen.getByRole('switch', { name: 'Enable Webhook' }));

    expect(actions.setWebhookEnabled).toHaveBeenCalledWith(false);
  });

  it('disables the URL and events while the webhook is off', () => {
    renderCard({ ...BASE, webhook: { ...BASE.webhook, enabled: false } });

    expect(screen.getByDisplayValue('https://your-domain.com/webhook')).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Job Created' })).toBeDisabled();
  });

  it('shows an error for a non-https URL while enabled', () => {
    renderCard({ ...BASE, webhook: { ...BASE.webhook, url: 'not-a-url' } });

    expect(screen.getByText('Enter a valid https:// URL')).toBeInTheDocument();
  });
});
