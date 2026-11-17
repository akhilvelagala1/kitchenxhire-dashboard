import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { SettingsHeaderActions } from './SettingsHeaderActions';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const api = vi.mocked(apiClient);

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
}

function renderActions({ isDirty = false, isSaving = false } = {}) {
  const onSave = vi.fn();
  const onReset = vi.fn();
  renderPage(
    <SettingsHeaderActions
      isDirty={isDirty}
      isSaving={isSaving}
      onSave={onSave}
      onReset={onReset}
    />
  );
  return { onSave, onReset };
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('SettingsHeaderActions', () => {
  it('keeps Reset and Save Changes off while nothing has changed', async () => {
    renderActions();

    expect(await screen.findByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('runs onSave when Save Changes is pressed after a change', async () => {
    const { onSave, onReset } = renderActions({ isDirty: true });

    await userEvent.click(await screen.findByRole('button', { name: 'Save Changes' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('runs onReset when Reset is pressed after a change', async () => {
    const { onSave, onReset } = renderActions({ isDirty: true });

    await userEvent.click(await screen.findByRole('button', { name: 'Reset' }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows Saving... and keeps both buttons off while the save runs', async () => {
    const { onSave } = renderActions({ isDirty: true, isSaving: true });

    const saving = await screen.findByRole('button', { name: /Saving\.\.\./ });
    expect(saving).toBeDisabled();
    expect(saving).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();

    await userEvent.click(saving);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('hides both buttons from someone who can only view', async () => {
    serve(['hire.admin.view']);
    renderActions({ isDirty: true });

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/auth/me'));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });
});
