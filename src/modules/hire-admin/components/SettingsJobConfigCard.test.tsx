import { screen } from '@testing-library/react';
import { renderPage } from '@/shared/test/render';
import { SettingsFormHarness } from './SettingsFormHarness';
import { SettingsJobConfigCard } from './SettingsJobConfigCard';

function renderCard() {
  return renderPage(
    <SettingsFormHarness>
      <SettingsJobConfigCard />
    </SettingsFormHarness>
  );
}

describe('SettingsJobConfigCard', () => {
  it('shows the seven job configuration rows with the picture defaults', () => {
    renderCard();

    const card = screen.getByRole('region', { name: 'Job Configuration' });
    expect(card).toHaveTextContent('Configure job posting and job management settings.');
    expect(screen.getByLabelText('Default job expiry')).toHaveValue(30);
    expect(screen.getByLabelText('Maximum active jobs')).toHaveValue(50);
    expect(screen.getByLabelText('Default employment type')).toHaveValue('Full-time');
    expect(screen.getByLabelText('Job visibility')).toHaveValue('Public (All Users)');
    expect(screen.getByRole('switch', { name: 'Require Job Approval' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('switch', { name: 'Allow Editing Published Jobs' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(
      screen.getByRole('switch', { name: 'Automatically Close Expired Jobs' })
    ).toHaveAttribute('aria-checked', 'false');
  });
});
