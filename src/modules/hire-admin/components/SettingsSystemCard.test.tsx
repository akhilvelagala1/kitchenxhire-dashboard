import type { ReactNode } from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext, useWatch } from 'react-hook-form';
import { renderPage } from '@/shared/test/render';
import type { SettingsFormValues } from '../schemas/adminSettings';
import { SettingsFormHarness } from './SettingsFormHarness';
import { SettingsSystemCard } from './SettingsSystemCard';

const RETENTION = 'Data retention period';
const EXPORT_SWITCH = 'Allow Data Export';
const ARCHIVE_SWITCH = 'Archive Inactive Records';
const ROWS: [string, string][] = [
  ['Data Retention', 'Keep application and user data for'],
  [EXPORT_SWITCH, 'Enable export of reports and platform data (CSV, Excel)'],
  [ARCHIVE_SWITCH, 'Automatically archive inactive jobs and users']
];

/** Prints what the form holds for the retention period, so a test can see its type. */
function RetentionInForm() {
  const months = useWatch<SettingsFormValues, 'data_retention_months'>({
    name: 'data_retention_months'
  });
  return <output aria-label="Retention in the form">{`${typeof months}: ${months}`}</output>;
}

/** Stands in for a refused save: the page puts the server's field errors on the form like this. */
function RejectRetention() {
  const { setError } = useFormContext<SettingsFormValues>();
  return (
    <button
      type="button"
      onClick={() => setError('data_retention_months', { message: 'Choose how long to keep data' })}
    >
      Reject retention
    </button>
  );
}

function renderCard({ canEdit = true, extra }: { canEdit?: boolean; extra?: ReactNode } = {}) {
  return renderPage(
    <SettingsFormHarness canEdit={canEdit}>
      <SettingsSystemCard />
      {extra}
    </SettingsFormHarness>
  );
}

describe('SettingsSystemCard', () => {
  it('shows the card title with its one-line description', () => {
    renderCard();

    expect(screen.getByRole('heading', { name: 'System & Data' })).toBeInTheDocument();
    expect(screen.getByText('Data management and platform maintenance.')).toBeInTheDocument();
  });

  it.each(ROWS)('shows the %s row with its explanation', (title, description) => {
    renderCard();

    const card = screen.getByRole('region', { name: 'System & Data' });
    expect(within(card).getByText(title)).toBeInTheDocument();
    expect(within(card).getByText(description)).toBeInTheDocument();
  });

  it('shows 24 months as the retention period and offers the five choices', () => {
    renderCard();

    const select = screen.getByRole('combobox', { name: RETENTION });
    expect(select).toHaveDisplayValue('24 months');
    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['6 months', '12 months', '24 months', '36 months', '60 months']);
  });

  it('changes the retention period when another choice is picked', async () => {
    renderCard();
    const select = screen.getByRole('combobox', { name: RETENTION });

    await userEvent.selectOptions(select, '12 months');

    expect(select).toHaveDisplayValue('12 months');
  });

  it('keeps the chosen retention period in the form as a number', async () => {
    renderCard({ extra: <RetentionInForm /> });
    expect(screen.getByLabelText('Retention in the form')).toHaveTextContent('number: 24');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: RETENTION }), '12 months');

    expect(screen.getByLabelText('Retention in the form')).toHaveTextContent('number: 12');
  });

  it.each([EXPORT_SWITCH, ARCHIVE_SWITCH])('shows the %s switch on', (name) => {
    renderCard();

    expect(screen.getByRole('switch', { name })).toBeChecked();
  });

  it.each([
    [EXPORT_SWITCH, ARCHIVE_SWITCH],
    [ARCHIVE_SWITCH, EXPORT_SWITCH]
  ])('turns %s off and on again without touching %s', async (name, other) => {
    renderCard();
    const target = screen.getByRole('switch', { name });

    await userEvent.click(target);
    expect(target).not.toBeChecked();
    expect(screen.getByRole('switch', { name: other })).toBeChecked();

    await userEvent.click(target);
    expect(target).toBeChecked();
  });

  it('shows the form error under the select and marks the select invalid', async () => {
    renderCard({ extra: <RejectRetention /> });

    await userEvent.click(screen.getByRole('button', { name: 'Reject retention' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Choose how long to keep data');
    const select = screen.getByRole('combobox', { name: RETENTION });
    expect(select).toBeInvalid();
    expect(select).toHaveAccessibleDescription(
      expect.stringContaining('Choose how long to keep data')
    );
  });

  it('clears the error once a valid retention period is picked', async () => {
    renderCard({ extra: <RejectRetention /> });
    await userEvent.click(screen.getByRole('button', { name: 'Reject retention' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: RETENTION }), '36 months');

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('makes the select and both switches read-only when the person cannot edit', async () => {
    renderCard({ canEdit: false });
    const exportSwitch = screen.getByRole('switch', { name: EXPORT_SWITCH });

    expect(screen.getByRole('combobox', { name: RETENTION })).toBeDisabled();
    expect(exportSwitch).toBeDisabled();
    expect(screen.getByRole('switch', { name: ARCHIVE_SWITCH })).toBeDisabled();

    await userEvent.click(exportSwitch);
    expect(exportSwitch).toBeChecked();
  });
});
