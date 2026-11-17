import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '@/shared/test/render';
import { SettingsApplicationWorkflowCard } from './SettingsApplicationWorkflowCard';
import { SettingsFormHarness } from './SettingsFormHarness';

function renderCard(values?: { interview_scheduling?: boolean }) {
  return renderPage(
    <SettingsFormHarness values={values}>
      <SettingsApplicationWorkflowCard />
    </SettingsFormHarness>
  );
}

describe('SettingsInterviewTypesRow', () => {
  it('checks Online and Phone by default and leaves In-person unchecked', () => {
    renderCard();

    expect(screen.getByRole('checkbox', { name: 'Online (Video)' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Phone' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'In-person' })).not.toBeChecked();
  });

  it('locks the interview type boxes when Interview Scheduling is off', async () => {
    renderCard();

    await userEvent.click(screen.getByRole('switch', { name: 'Interview Scheduling' }));

    expect(screen.getByRole('checkbox', { name: 'Online (Video)' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Phone' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'In-person' })).toBeDisabled();
  });
});
