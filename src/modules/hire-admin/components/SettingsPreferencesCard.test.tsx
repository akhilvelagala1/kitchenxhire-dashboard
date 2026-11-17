import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '@/shared/test/render';
import { SettingsFormHarness } from './SettingsFormHarness';
import { SettingsPreferencesCard } from './SettingsPreferencesCard';

/** The four rows as drawn in the reference picture, top to bottom. */
const ROWS = [
  {
    title: 'Multi-business Platform',
    description: 'Allow multiple businesses (restaurants, kitchens, warehouses, etc.)'
  },
  { title: 'Enable Outlets', description: 'Manage outlets under each business' },
  {
    title: 'Self Registration',
    description: 'Allow businesses and recruiters to register on the platform'
  },
  {
    title: 'Business Verification',
    description: 'Require admin verification for new business registrations'
  }
];

function renderCard(canEdit = true) {
  return renderPage(
    <SettingsFormHarness canEdit={canEdit}>
      <SettingsPreferencesCard />
    </SettingsFormHarness>
  );
}

function switchFor(title: string) {
  return screen.getByRole('switch', { name: title });
}

describe('SettingsPreferencesCard', () => {
  it('shows the card title and line, and the four rows with their explanations', () => {
    renderCard();

    expect(screen.getByRole('heading', { name: 'Platform Preferences' })).toBeInTheDocument();
    expect(
      screen.getByText('General platform behaviour and display settings.')
    ).toBeInTheDocument();
    for (const row of ROWS) {
      expect(screen.getByText(row.title)).toBeInTheDocument();
      expect(screen.getByText(row.description)).toBeInTheDocument();
    }
  });

  it('starts the switches as saved: on, on, off, on', () => {
    renderCard();

    expect(screen.getAllByRole('switch')).toHaveLength(4);
    expect(switchFor('Multi-business Platform')).toBeChecked();
    expect(switchFor('Enable Outlets')).toBeChecked();
    expect(switchFor('Self Registration')).not.toBeChecked();
    expect(switchFor('Business Verification')).toBeChecked();
  });

  it('names each switch by its row title and describes it with the explanation', () => {
    renderCard();

    for (const row of ROWS) {
      expect(switchFor(row.title)).toHaveAccessibleDescription(row.description);
    }
  });

  it('flips only the switch that was clicked, off to on and on to off', async () => {
    renderCard();

    await userEvent.click(switchFor('Self Registration'));

    expect(switchFor('Self Registration')).toBeChecked();
    expect(switchFor('Multi-business Platform')).toBeChecked();
    expect(switchFor('Enable Outlets')).toBeChecked();
    expect(switchFor('Business Verification')).toBeChecked();

    await userEvent.click(switchFor('Enable Outlets'));

    expect(switchFor('Enable Outlets')).not.toBeChecked();
    expect(switchFor('Self Registration')).toBeChecked();
    expect(switchFor('Multi-business Platform')).toBeChecked();
    expect(switchFor('Business Verification')).toBeChecked();
  });

  it('is read-only without permission: every switch is disabled and a click changes nothing', async () => {
    renderCard(false);

    for (const row of ROWS) {
      expect(switchFor(row.title)).toBeDisabled();
    }

    await userEvent.click(switchFor('Self Registration'));

    expect(switchFor('Self Registration')).not.toBeChecked();
    expect(switchFor('Enable Outlets')).toBeChecked();
  });
});
