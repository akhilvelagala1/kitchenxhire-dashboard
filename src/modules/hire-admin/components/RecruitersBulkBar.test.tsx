import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import { RecruitersBulkBar } from './RecruitersBulkBar';

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

const SELECTED = ['REC10892', 'REC10891'];
const LIST_QUERY = { page: 1, page_size: 5, tab: 'active' as const, search: 'spice' };

function renderBar(selectedIds: string[] = SELECTED) {
  const onClear = vi.fn();
  renderPage(
    <RecruitersBulkBar selectedIds={selectedIds} onClear={onClear} listQuery={LIST_QUERY} />
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

describe('RecruitersBulkBar', () => {
  it('shows nothing while no row is ticked', () => {
    renderBar([]);

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('shows how many rows are ticked', () => {
    renderBar();

    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('2 selected');
  });

  it('activates the ticked rows at once, clears the selection and says how many', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Activate selected' }));

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/hire/admin/recruiters/bulk', {
      action: 'set_status',
      status: 'active',
      recruiter_ids: SELECTED
    });
    await vi.waitFor(() => expect(onClear).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith('2 recruiters updated');
  });

  it('asks for confirmation before deactivating and sends nothing until it is given', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Deactivate selected' }));

    const dialog = await screen.findByRole('dialog', { name: 'Deactivate selected recruiters?' });
    expect(dialog).toHaveTextContent('2 recruiters');
    expect(api.post).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(api.post).toHaveBeenCalledWith('/hire/admin/recruiters/bulk', {
      action: 'set_status',
      status: 'inactive',
      recruiter_ids: SELECTED
    });
    await vi.waitFor(() => expect(onClear).toHaveBeenCalledTimes(1));
  });

  it('sends nothing and keeps the selection when the deactivation is cancelled', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Deactivate selected' }));
    await screen.findByRole('dialog', { name: 'Deactivate selected recruiters?' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(api.post).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
  });

  it('keeps the selection and shows the server message when the update fails', async () => {
    api.post.mockRejectedValue(new Error('Bulk update failed.'));
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Activate selected' }));

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith('Bulk update failed.'));
    expect(onClear).not.toHaveBeenCalled();
  });

  it('exports only the ticked rows, with the filters of the current view', async () => {
    renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Export selected' }));

    expect(api.post).toHaveBeenCalledWith('/hire/admin/recruiters/exports', {
      ...LIST_QUERY,
      recruiter_ids: SELECTED
    });
  });

  it('clears the selection from the Clear selection button', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
