import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import { ApplicationsBulkBar } from './ApplicationsBulkBar';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    list: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  }
}));
vi.mock('@/shared/ui/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.mocked(apiClient);

const SELECTED = ['APP10892', 'APP10891'];
const LIST_QUERY = { page: 1, page_size: 5, tab: 'hired' as const, search: 'rahul' };

function renderBar(selectedIds: string[] = SELECTED) {
  const onClear = vi.fn();
  renderPage(
    <ApplicationsBulkBar selectedIds={selectedIds} onClear={onClear} listQuery={LIST_QUERY} />
  );
  return onClear;
}

beforeEach(() => {
  vi.resetAllMocks();
  api.post.mockImplementation(async (url: string) => {
    if (url.endsWith('/bulk')) return { affected: 2 };
    if (url.endsWith('/exports')) return { id: 'exp1', kind: 'EXPORT', status: 'QUEUED' };
    throw new Error(`unexpected post ${url}`);
  });
  api.get.mockResolvedValue({ id: 'exp1', kind: 'EXPORT', status: 'FAILED', error_message: 'x' });
});

describe('ApplicationsBulkBar', () => {
  it('shows nothing while no row is ticked', () => {
    renderBar([]);

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('shows how many rows are ticked', () => {
    renderBar();

    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('2 selected');
  });

  it('keeps Apply disabled until a status is chosen', async () => {
    renderBar();
    const user = userEvent.setup();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Change status of selected applications' }),
      'Hired'
    );

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
  });

  it('offers the five statuses that need no date', () => {
    renderBar();

    const select = screen.getByRole('combobox', { name: 'Change status of selected applications' });
    const labels = [...select.querySelectorAll('option')].map((o) => o.textContent);
    expect(labels).toEqual([
      'Change status to…',
      'Pending Review',
      'Reviewed',
      'Shortlisted',
      'Hired',
      'Rejected'
    ]);
  });

  it('applies the chosen status to the ticked rows, clears the selection and says how many', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Change status of selected applications' }),
      'Shortlisted'
    );
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/hire/admin/applications/bulk', {
      action: 'set_status',
      status: 'shortlisted',
      application_ids: SELECTED
    });
    await vi.waitFor(() => expect(onClear).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith('2 applications updated');
  });

  it('asks for confirmation before rejecting and sends nothing until it is given', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Change status of selected applications' }),
      'Rejected'
    );

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    const dialog = await screen.findByRole('dialog', { name: 'Reject selected applications?' });
    expect(dialog).toHaveTextContent('2 applications');
    expect(api.post).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    expect(api.post).toHaveBeenCalledWith('/hire/admin/applications/bulk', {
      action: 'set_status',
      status: 'rejected',
      application_ids: SELECTED
    });
    await vi.waitFor(() => expect(onClear).toHaveBeenCalledTimes(1));
  });

  it('sends nothing and keeps the selection when the rejection is cancelled', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Change status of selected applications' }),
      'Rejected'
    );
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await screen.findByRole('dialog', { name: 'Reject selected applications?' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(api.post).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
  });

  it('keeps the selection and shows the server message when the update fails', async () => {
    api.post.mockRejectedValue(new Error('Bulk update failed.'));
    const onClear = renderBar();
    const user = userEvent.setup();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Change status of selected applications' }),
      'Hired'
    );

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith('Bulk update failed.'));
    expect(onClear).not.toHaveBeenCalled();
  });

  it('exports only the ticked rows, with the filters of the current view', async () => {
    renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Export selected' }));

    expect(api.post).toHaveBeenCalledWith('/hire/admin/applications/exports', {
      ...LIST_QUERY,
      application_ids: SELECTED
    });
  });

  it('clears the selection from the Clear selection button', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
