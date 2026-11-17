import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminJob } from '../schemas/adminJob';
import { AdminJobsPage } from './AdminJobsPage';

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

const api = vi.mocked(apiClient);

const job = (over: Partial<HireAdminJob> = {}): HireAdminJob => ({
  job_id: 'JOB10293',
  title: 'Cook / Chef',
  recruiter_id: 'REC001',
  recruiter_name: 'Rahul Verma',
  business_name: 'Spice Bowl Restaurant',
  category: 'Kitchen',
  job_category_label: 'Cook / Chef',
  location: 'Hyderabad',
  applications_count: 286,
  recruited_count: 28,
  status: 'active',
  posted_at: '2026-06-24T10:24:00',
  ...over
});

const SUMMARY = {
  total_jobs: 428,
  total_applications: 8672,
  total_recruiters: 312,
  total_recruited: 642,
  closed_jobs: 52,
  active_jobs: 278,
  under_review_jobs: 48,
  paused_jobs: 32,
  draft_jobs: 18,
  growth_jobs_pct: 12,
  growth_applications_pct: 18,
  growth_recruiters_pct: 7,
  growth_recruited_pct: 14,
  growth_closed_pct: 5
};

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url.endsWith('/summary')) return SUMMARY;
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({
    items: [job(), job({ job_id: 'JOB10292', title: 'Kitchen Helper', status: 'paused' })],
    meta: { page: 1, page_size: 10, total: 428 }
  });
  api.post.mockResolvedValue({ id: 'exp1', kind: 'EXPORT', status: 'QUEUED' });
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('AdminJobsPage', () => {
  it('requests the first ten jobs, newest first, for the last 30 days with no KPI chrome', async () => {
    renderPage(<AdminJobsPage />);

    await screen.findByRole('cell', { name: 'JOB10293' });
    expect(screen.getByRole('heading', { level: 1, name: 'Jobs' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Total Jobs/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument();
    expect(screen.queryByText('Jobs by Category')).not.toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: /All Jobs/i })).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledWith(
      '/hire/admin/jobs',
      expect.objectContaining({
        page: 1,
        page_size: 10,
        sort: 'posted_at',
        order: 'desc',
        range: '30d'
      })
    );
    expect(screen.getByText('Showing 1 – 10 of 428 jobs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveTextContent('Previous');
    expect(screen.getByRole('button', { name: 'Page 43' })).toBeInTheDocument();
  });

  it('lists each job with its category badge, status and posted date', async () => {
    renderPage(<AdminJobsPage />);

    const row = (await screen.findByRole('cell', { name: 'JOB10293' })).closest('tr')!;
    expect(within(row).getByText('Cook / Chef')).toBeInTheDocument();
    expect(within(row).getByText('Spice Bowl Restaurant')).toBeInTheDocument();
    expect(within(row).getByText('Rahul Verma')).toBeInTheDocument();
    expect(within(row).getByText('Kitchen')).toBeInTheDocument();
    expect(within(row).getByText('286 / 28')).toBeInTheDocument();
    expect(within(row).getByText('Active')).toBeInTheDocument();
    expect(within(row).getByText(/24 Jun 2026/)).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Actions for JOB10293' })).toBeInTheDocument();
  });

  it('shows Drafts among the status tabs and the location, recruiter and export filters', async () => {
    renderPage(<AdminJobsPage />);
    await screen.findByRole('cell', { name: 'JOB10293' });

    expect(await screen.findByRole('tab', { name: /Drafts/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Location filter' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Recruiter filter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter by posted date' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
  });

  it('shows the error state with a retry when the jobs request fails', async () => {
    api.list.mockRejectedValue(
      new ApiError({ code: 'HTTP_ERROR', status: 500, message: 'Server down' })
    );
    renderPage(<AdminJobsPage />);

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('puts the debounced search term in the URL', async () => {
    renderPage(<AdminJobsPage />);
    await screen.findByRole('cell', { name: 'JOB10293' });

    await userEvent.type(screen.getByRole('searchbox', { name: 'Filter jobs' }), 'chef');

    await waitFor(() => expect(routerLocation.search).toContain('search=chef'));
    expect(api.list).toHaveBeenLastCalledWith(
      '/hire/admin/jobs',
      expect.objectContaining({ search: 'chef', page: 1 })
    );
  });

  it('asks for the next page from the numbered pager', async () => {
    renderPage(<AdminJobsPage />);
    await screen.findByRole('cell', { name: 'JOB10293' });

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => expect(routerLocation.search).toContain('page=2'));
    expect(api.list).toHaveBeenLastCalledWith(
      '/hire/admin/jobs',
      expect.objectContaining({ page: 2 })
    );
  });

  it('narrows the table when a status tab is clicked', async () => {
    renderPage(<AdminJobsPage />);
    await screen.findByRole('cell', { name: 'JOB10293' });

    await userEvent.click(await screen.findByRole('tab', { name: /Active/i }));

    await waitFor(() =>
      expect(api.list).toHaveBeenLastCalledWith(
        '/hire/admin/jobs',
        expect.objectContaining({ job_status: 'active' })
      )
    );
  });

  it('asks for confirmation before closing a job from its row menu', async () => {
    api.patch.mockResolvedValue(job({ status: 'closed' }));
    renderPage(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for JOB10293' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Close Job' }));

    expect(api.patch).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByRole('button', { name: 'Close job' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/hire/admin/jobs/JOB10293', { status: 'closed' })
    );
  });

  it('closes the confirmation again once the change has gone through', async () => {
    api.patch.mockResolvedValue(job({ status: 'paused' }));
    renderPage(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for JOB10293' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Pause Job' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Pause job' }));

    await waitFor(() => expect(api.patch).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Pause job' })).not.toBeInTheDocument()
    );
  });

  it('disables Pause Job for a job that is already paused', async () => {
    renderPage(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for JOB10292' }));

    expect(await screen.findByRole('menuitem', { name: 'Pause Job' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: 'Close Job' })).toBeEnabled();
  });

  it('closes the row menu with Escape and puts focus back on its button', async () => {
    renderPage(<AdminJobsPage />);
    const trigger = await screen.findByRole('button', { name: 'Actions for JOB10293' });

    await userEvent.click(trigger);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('keeps edit, pause, close and delete away from a viewer without manage rights', async () => {
    serve(['hire.admin.view']);
    renderPage(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for JOB10293' }));

    expect(await screen.findByRole('menuitem', { name: 'View Job Details' })).toBeInTheDocument();
    for (const hidden of ['Edit Job', 'Pause Job', 'Close Job', 'Delete Job']) {
      expect(screen.queryByRole('menuitem', { name: hidden })).not.toBeInTheDocument();
    }
  });

  it('shows the bulk actions once a row is selected, and only to someone who can manage jobs', async () => {
    renderPage(<AdminJobsPage />);
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Select row JOB10293' }));

    const bar = await screen.findByRole('region', { name: 'Bulk actions' });
    expect(within(bar).getByText('1 selected')).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: 'Approve selected jobs' })).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: 'Close selected jobs' })).toBeInTheDocument();
  });

  it('hides the bulk actions from a viewer without manage rights', async () => {
    serve(['hire.admin.view']);
    renderPage(<AdminJobsPage />);

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Select row JOB10293' }));

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });
});
