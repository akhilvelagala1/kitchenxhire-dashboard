import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '@/shared/test/render';
import type { SettingsIntegrations } from '../schemas/adminSettingsIntegrations';
import { SettingsConnectedIntegrationsCard } from './SettingsConnectedIntegrationsCard';
import { SettingsEditProvider } from './settingsEditContext';
import {
  IntegrationsSettingsProvider,
  type IntegrationsSettingsActions
} from './integrationsSettingsContext';

const DRAFT: SettingsIntegrations = {
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

function renderCard(setIntegration = vi.fn()) {
  const actions = {
    draft: DRAFT,
    setIntegration,
    setWebhookEnabled: vi.fn(),
    setWebhookUrl: vi.fn(),
    setWebhookEvent: vi.fn()
  } satisfies IntegrationsSettingsActions;

  renderPage(
    <SettingsEditProvider value={true}>
      <IntegrationsSettingsProvider value={actions}>
        <SettingsConnectedIntegrationsCard />
      </IntegrationsSettingsProvider>
    </SettingsEditProvider>
  );

  return { setIntegration };
}

describe('SettingsConnectedIntegrationsCard', () => {
  it('lists the five services with their status pill', () => {
    renderCard();

    expect(screen.getByRole('region', { name: 'Connected Integrations' })).toBeInTheDocument();
    expect(screen.getByText('Email Service (SMTP)')).toBeInTheDocument();
    expect(screen.getAllByText('Connected')).toHaveLength(4);
    expect(screen.getByText('Not Connected')).toBeInTheDocument();
  });

  it('opens Connect for the not-connected row and saves a status change to the draft', async () => {
    const { setIntegration } = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Connect' }));
    const dialog = screen.getByRole('dialog', { name: 'WhatsApp Business' });

    await userEvent.click(within(dialog).getByRole('button', { name: 'Connect' }));

    expect(setIntegration).toHaveBeenCalledWith('whatsapp', { status: 'connected', detail: '' });
  });

  it('opens Configure for a connected row and offers Disconnect', async () => {
    renderCard();

    await userEvent.click(screen.getAllByRole('button', { name: 'Configure' })[0]!);

    expect(screen.getByRole('dialog', { name: 'Email Service (SMTP)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
  });
});
