import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext, useFormState } from 'react-hook-form';
import { renderPage } from '@/shared/test/render';
import type { SettingsFormValues } from '../schemas/adminSettings';
import { SettingsFormHarness } from './SettingsFormHarness';
import { SettingsPlatformInfoCard } from './SettingsPlatformInfoCard';

const PREVIEW_URL = 'blob:logo-preview';
const createObjectURL = vi.fn(() => PREVIEW_URL);
const revokeObjectURL = vi.fn();

/** Stands in for the page: says whether the form has unsaved changes and can reset it. */
function FormStatus() {
  const { reset } = useFormContext<SettingsFormValues>();
  const { isDirty } = useFormState<SettingsFormValues>();
  return (
    <>
      <p>{isDirty ? 'Unsaved changes' : 'No changes'}</p>
      <button type="button" onClick={() => reset()}>
        Reset form
      </button>
    </>
  );
}

function renderCard({
  canEdit = true,
  logoUrl = null
}: { canEdit?: boolean; logoUrl?: string | null } = {}) {
  return renderPage(
    <SettingsFormHarness canEdit={canEdit}>
      <SettingsPlatformInfoCard logoUrl={logoUrl} />
      <FormStatus />
    </SettingsFormHarness>
  );
}

function pngFile() {
  return new File(['logo'], 'logo.png', { type: 'image/png' });
}

beforeEach(() => {
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;
});

describe('SettingsPlatformInfoCard', () => {
  it('shows the title, the helper line and the saved values', () => {
    renderCard();

    expect(screen.getByRole('heading', { name: 'Platform Information' })).toBeInTheDocument();
    expect(
      screen.getByText('Basic details and branding for your hiring platform.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Platform Name/)).toHaveValue('KitchenX Hiring');
    expect(screen.getByLabelText('Support Phone')).toHaveValue('98785 43210');
    expect(screen.getByText('+91')).toBeInTheDocument();
    expect(screen.getByLabelText(/Support Email/)).toHaveValue('support@kitchenx.com');
    expect(screen.getByLabelText('Timezone')).toHaveDisplayValue(
      '(GMT+05:30) India Standard Time (IST)'
    );
    expect(screen.getByRole('img', { name: 'KitchenX' })).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG up to 2MB (Recommended: 200 × 60)')).toBeInTheDocument();
  });

  it('marks the form as changed when the platform name is edited', async () => {
    const user = userEvent.setup();
    renderCard();
    expect(screen.getByText('No changes')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Platform Name/), ' Pro');

    expect(screen.getByLabelText(/Platform Name/)).toHaveValue('KitchenX Hiring Pro');
    expect(await screen.findByText('Unsaved changes')).toBeInTheDocument();
  });

  it('asks for a platform name when it is cleared', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.clear(screen.getByLabelText(/Platform Name/));

    expect(
      await screen.findByText('Enter the platform name (at least 2 letters)')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Platform Name/)).toBeInvalid();
  });

  it('rejects a support email that is not an address', async () => {
    const user = userEvent.setup();
    renderCard();
    const email = screen.getByLabelText(/Support Email/);

    await user.clear(email);
    await user.type(email, 'not-an-email');

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(email).toBeInvalid();
  });

  it('shows the phone as typed while editing and grouped once the person leaves it', async () => {
    const user = userEvent.setup();
    renderCard();
    const phone = screen.getByLabelText('Support Phone');

    await user.click(phone);
    expect(phone).toHaveValue('9878543210');

    await user.clear(phone);
    await user.type(phone, '+91 98123 45678');
    expect(phone).toHaveValue('+91 98123 45678');

    await user.tab();
    expect(phone).toHaveValue('98123 45678');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not mark the form as changed just because the phone was visited', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByLabelText('Support Phone'));
    await user.tab();

    expect(screen.getByText('No changes')).toBeInTheDocument();
  });

  it('rejects a phone that is not a 10-digit mobile number and keeps what was typed', async () => {
    const user = userEvent.setup();
    renderCard();
    const phone = screen.getByLabelText('Support Phone');

    await user.clear(phone);
    await user.type(phone, '12345');
    await user.tab();

    expect(await screen.findByText('Enter a 10-digit mobile number')).toBeInTheDocument();
    expect(phone).toHaveValue('12345');
  });

  it('shows the saved logo when there is one', () => {
    renderCard({ logoUrl: '/uploads/acme.png' });

    expect(screen.getByRole('img', { name: 'Platform logo' })).toHaveAttribute(
      'src',
      '/uploads/acme.png'
    );
    expect(screen.queryByRole('img', { name: 'KitchenX' })).not.toBeInTheDocument();
  });

  it('opens the file picker from the Upload Logo button', async () => {
    const user = userEvent.setup();
    renderCard();
    const open = vi.spyOn(screen.getByLabelText('Choose logo file'), 'click');

    await user.click(screen.getByRole('button', { name: 'Upload Logo' }));

    expect(open).toHaveBeenCalledOnce();
  });

  it('previews a chosen PNG, marks the form as changed, and lets go of it on reset', async () => {
    const user = userEvent.setup();
    renderCard();
    const file = pngFile();

    await user.upload(screen.getByLabelText('Choose logo file'), file);

    expect(await screen.findByRole('img', { name: 'Platform logo' })).toHaveAttribute(
      'src',
      PREVIEW_URL
    );
    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(await screen.findByText('Unsaved changes')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset form' }));

    expect(screen.queryByRole('img', { name: 'Platform logo' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'KitchenX' })).toBeInTheDocument();
    expect(revokeObjectURL).toHaveBeenCalledWith(PREVIEW_URL);
  });

  it('refuses a logo over 2 MB and keeps showing the current logo', async () => {
    const user = userEvent.setup();
    renderCard();
    const tooBig = new File([new ArrayBuffer(3 * 1024 * 1024)], 'big.png', { type: 'image/png' });

    await user.upload(screen.getByLabelText('Choose logo file'), tooBig);

    expect(await screen.findByRole('alert')).toHaveTextContent('The logo must be 2 MB or smaller');
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(screen.getByRole('img', { name: 'KitchenX' })).toBeInTheDocument();
  });

  it('refuses a GIF, then takes a valid file chosen straight after', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderCard();
    const input = screen.getByLabelText('Choose logo file');

    await user.upload(input, new File(['gif'], 'logo.gif', { type: 'image/gif' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Use a PNG or JPG image');

    await user.upload(input, pngFile());
    expect(await screen.findByRole('img', { name: 'Platform logo' })).toHaveAttribute(
      'src',
      PREVIEW_URL
    );
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('is read-only when the person may not change settings', () => {
    renderCard({ canEdit: false });

    const controls = [
      screen.getByLabelText(/Platform Name/),
      screen.getByLabelText('Support Phone'),
      screen.getByLabelText(/Support Email/),
      screen.getByLabelText('Timezone'),
      screen.getByLabelText('Choose logo file'),
      screen.getByRole('button', { name: 'Upload Logo' })
    ];
    for (const control of controls) expect(control).toBeDisabled();
  });
});
