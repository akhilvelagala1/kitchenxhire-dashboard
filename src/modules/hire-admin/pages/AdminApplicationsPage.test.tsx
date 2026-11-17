import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { AdminApplicationsPage } from './AdminApplicationsPage';

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
const BASE = '/hire/admin/applications';

const application: HireAdminApplication = {
  application_id: 'APP10892',
  candidate_id: 'CAN001',
  candidate_name: 'Rahul Kumar',
  candidate_email: 'rahul@example.com',
  candidate_phone: '9848012345',
  candidate_location: 'Hyderabad, TS',
  job_id: 'JOB10293',
  job_title: 'Cook / Chef',
  job_type: 'Full-time',
  recruiter_id: 'REC001',
  recruiter_name: 'Rahul Verma',
  outlet_name: 'Spice Bowl Restaurant',
  location: 'Hyderabad',
  applied_at: '2026-06-24T10:24:00+05:30',
  status: 'reviewed',
  interview_at: null,
  resume_file_name: 'Rahul_Kumar_Resume.pdf'
};

const SUMMARY = {
  counts: {
    all: 8672,
    reviewed: 6142,
    shortlisted: 1460,
    interview_scheduled: 642,
    hired: 428,
    rejected: 856
  },
  growth_pct: {
    all: 18,
    reviewed: 16,
    shortlisted: 9,
    interview_scheduled: 14,
    hired: 12,
    rejected: 8
  }
};

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === `${BASE}/summary`) return SUMMARY;
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({
    items: [application],
    meta: { page: 1, page_size: 10, total: 8672 }
  });
}

const lastListQuery = () => api.list.mock.lastCall![1] as Record<string, unknown>;

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('AdminApplicationsPage', () => {
  it('shows the heading, status tabs and ten newest applications with no KPI or trend chrome', async () => {
    renderPage(<AdminApplicationsPage />);

    await screen.findByRole('cell', { name: 'APP10892' });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Applications' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage all job applications from job seekers across recruiters and outlets.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Applications Trend')).not.toBeInTheDocument();
    expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /, [\d,]+ applications$/ })
    ).not.toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: /All Applications/i })).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({ page: 1, page_size: 10, sort: 'applied_at', order: 'desc' })
    );
    expect(screen.getByText('Showing 1 – 10 of 8,672 applications')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  });

  it('narrows the table to a stage when its status tab is clicked', async () => {
    renderPage(<AdminApplicationsPage />);
    await screen.findByRole('cell', { name: 'APP10892' });

    await userEvent.click(await screen.findByRole('tab', { name: /Hired/i }));

    await waitFor(() => expect(lastListQuery()).toMatchObject({ tab: 'hired', page: 1 }));
    expect(routerLocation.search).toContain('tab=hired');
  });

  it('gives a manager the row buttons and Export', async () => {
    renderPage(<AdminApplicationsPage />);

    expect(
      await screen.findByRole('button', { name: 'Schedule interview for APP10892' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions for APP10892' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('gives a person who can only view the list the eye button and nothing that changes data', async () => {
    serve(['hire.admin.view']);
    renderPage(<AdminApplicationsPage />);

    expect(
      await screen.findByRole('link', { name: 'View application APP10892' })
    ).toBeInTheDocument();
    await waitFor(() => expect(api.get.mock.calls.some(([url]) => url === '/auth/me')).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Schedule interview for APP10892' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for APP10892' })
    ).not.toBeInTheDocument();
  });
});
