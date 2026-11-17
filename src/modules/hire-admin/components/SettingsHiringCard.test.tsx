import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '@/shared/test/render';
import { SettingsFormHarness } from './SettingsFormHarness';
import { SettingsHiringCard } from './SettingsHiringCard';

function renderCard(canEdit = true) {
  return renderPage(
    <SettingsFormHarness canEdit={canEdit}>
      <SettingsHiringCard />
    </SettingsFormHarness>
  );
}

const expiryBox = () => screen.getByRole('spinbutton', { name: 'Default job expiry in days' });
const switchNamed = (name: string) => screen.getByRole('switch', { name });

describe('SettingsHiringCard', () => {
  it('shows the card title, its line and the four rows with their explanations', () => {
    renderCard();

    const card = screen.getByRole('region', { name: 'Hiring Configuration' });
    expect(card).toHaveTextContent('Default settings for job postings and hiring workflow.');
    expect(screen.getByText('Default Job Expiry')).toBeInTheDocument();
    expect(screen.getByText('days')).toBeInTheDocument();
    expect(screen.getByText('Interview Scheduling')).toBeInTheDocument();
    expect(
      screen.getByText('Allow recruiters to schedule interviews within the platform')
    ).toBeInTheDocument();
    expect(screen.getByText('Application Approval')).toBeInTheDocument();
    expect(screen.getByText('Require approval before candidate shortlisting')).toBeInTheDocument();
    expect(screen.getByText('Auto Match Candidates')).toBeInTheDocument();
    expect(
      screen.getByText('Show recommended candidates based on job requirements')
    ).toBeInTheDocument();
    expect(switchNamed('Interview Scheduling')).toHaveAccessibleDescription(
      'Allow recruiters to schedule interviews within the platform'
    );
  });

  it('starts at 30 days and takes a new number', async () => {
    renderCard();
    expect(expiryBox()).toHaveValue(30);

    await userEvent.clear(expiryBox());
    await userEvent.type(expiryBox(), '45');

    expect(expiryBox()).toHaveValue(45);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    { typed: '0', message: 'Use at least 1 day' },
    { typed: '400', message: 'Use at most 365 days' },
    { typed: '', message: 'Enter the number of days' }
  ])('shows "$message" when the box holds "$typed"', async ({ typed, message }) => {
    renderCard();

    await userEvent.clear(expiryBox());
    if (typed) await userEvent.type(expiryBox(), typed);

    await screen.findByText(message);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(expiryBox()).toHaveAttribute('aria-invalid', 'true');
    expect(expiryBox()).toHaveAccessibleDescription(message);
  });

  it('removes the message once the number is fixed', async () => {
    renderCard();
    await userEvent.clear(expiryBox());
    await userEvent.type(expiryBox(), '0');
    await screen.findByText('Use at least 1 day');

    await userEvent.clear(expiryBox());
    await userEvent.type(expiryBox(), '30');

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(expiryBox()).not.toHaveAttribute('aria-invalid');
  });

  it('starts with interviews on, approval off and auto match on, and flips each on click', async () => {
    renderCard();
    const interview = switchNamed('Interview Scheduling');
    const approval = switchNamed('Application Approval');
    const autoMatch = switchNamed('Auto Match Candidates');
    expect(interview).toBeChecked();
    expect(approval).not.toBeChecked();
    expect(autoMatch).toBeChecked();

    await userEvent.click(interview);
    await userEvent.click(approval);
    await userEvent.click(autoMatch);

    expect(interview).not.toBeChecked();
    expect(approval).toBeChecked();
    expect(autoMatch).not.toBeChecked();
  });

  it('is read-only when the admin cannot edit settings', async () => {
    renderCard(false);

    expect(expiryBox()).toBeDisabled();
    expect(switchNamed('Interview Scheduling')).toBeDisabled();
    expect(switchNamed('Application Approval')).toBeDisabled();
    expect(switchNamed('Auto Match Candidates')).toBeDisabled();

    await userEvent.click(switchNamed('Application Approval'));

    expect(switchNamed('Application Approval')).not.toBeChecked();
    expect(expiryBox()).toHaveValue(30);
  });
});
