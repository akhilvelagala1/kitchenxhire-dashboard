import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import { JobSeekersBulkBar } from './JobSeekersBulkBar';

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

const SELECTED = ['JS12846', 'JS12845'];
const LIST_QUERY = { page: 1, page_size: 5, tab: 'active' as const, search: 'ramesh' };

function renderBar(selectedIds: string[] = SELECTED) {
  const onClear = vi.fn();
  renderPage(
    <JobSeekersBulkBar selectedIds={selectedIds} onClear={onClear} listQuery={LIST_QUERY} />
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

describe('JobSeekersBulkBar', () => {
  it('shows nothing while no row is ticked', () => {
    renderBar([]);

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('shows how many rows are ticked', () => {
    renderBar();

    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('2 selected');
  });

  it('activates the ticked rows with one request, a toast and a cleared selection', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Activate selected' }));

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/hire/admin/job-seekers/bulk', {
      action: 'set_status',
      status: 'active',
      job_seeker_ids: SELECTED
    });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('2 job seekers updated'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('asks before deactivating and sends nothing until it is confirmed', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Deactivate selected' }));

    const dialog = await screen.findByRole('dialog', { name: 'Deactivate selected job seekers?' });
    expect(dialog).toHaveTextContent('2 job seekers');
    expect(api.post).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/hire/admin/job-seekers/bulk', {
      action: 'set_status',
      status: 'inactive',
      job_seeker_ids: SELECTED
    });
    await vi.waitFor(() => expect(onClear).toHaveBeenCalledTimes(1));
  });

  it('keeps the selection when the deactivation is cancelled', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Deactivate selected' }));
    await screen.findByRole('dialog', { name: 'Deactivate selected job seekers?' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(api.post).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
  });

  it('exports only the selected ids together with the current filters', async () => {
    renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Export selected' }));

    await vi.waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/hire/admin/job-seekers/exports', {
        ...LIST_QUERY,
        job_seeker_ids: SELECTED
      })
    );
  });

  it('clears the selection from the Clear selection button', async () => {
    const onClear = renderBar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
