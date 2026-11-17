import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { usePermissions } from '@/shared/auth/usePermissions';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminJobSeeker } from '../schemas/adminJobSeeker';
import { AdminJobSeekerDetailPage } from './AdminJobSeekerDetailPage';

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
const URL = '/hire/admin/job-seekers/JS12846';

const jobSeeker = (over: Partial<HireAdminJobSeeker> = {}): HireAdminJobSeeker => ({
  job_seeker_id: 'JS12846',
  name: 'Ramesh Kumar',
  email: 'ramesh.kumar@email.com',
  phone: '+91 98765 43210',
  city: 'Hyderabad',
  state: 'TS',
  preferred_job_title: 'Cook / Chef',
  experience_years: 3,
  profile_completion: 92,
  applications_count: 12,
  interviews_count: 4,
  shortlisted_count: 4,
  hired_count: 1,
  status: 'active',
  joined_at: '2026-06-22T10:24:00+05:30',
  last_active_at: '2026-06-24T10:24:00+05:30',
  ...over
});

const AUDIT = [
  {
    id: 'evt1',
    action: 'STATUS_CHANGED',
    actor_name: 'Priya Admin',
    occurred_at: '2026-06-24T05:00:00Z',
    reason: null,
    changes: [{ field: 'status', from: 'inactive', to: 'active' }]
  }
];

/** Shows once the permissions request has finished, so a test can tell "hidden" from "not loaded yet". */
function PermissionsReady() {
  const { isLoading } = usePermissions();
  return isLoading ? null : <p>Permissions loaded</p>;
}

function serve(
  over: Partial<HireAdminJobSeeker> = {},
  permissions: string[] = ['*'],
  detail: () => Promise<HireAdminJobSeeker> = async () => jobSeeker(over)
) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === URL) return detail();
    if (url === '/audit-events') return AUDIT;
    throw new Error(`unexpected get ${url}`);
  });
  api.patch.mockResolvedValue(jobSeeker());
}

function renderDetail() {
  return renderPage(
    <>
      <AdminJobSeekerDetailPage />
      <PermissionsReady />
    </>,
    { route: '/admin/job-seekers/JS12846', path: '/admin/job-seekers/:jobSeekerId' }
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('AdminJobSeekerDetailPage', () => {
  it('shows a spinner while the job seeker loads', () => {
    serve({}, ['*'], () => new Promise(() => {}));
    renderDetail();

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('requests the job seeker named in the address', async () => {
    serve();
    renderDetail();

    await screen.findByRole('heading', { name: 'Ramesh Kumar' });
    expect(api.get).toHaveBeenCalledWith(URL);
  });

  it('shows every field of the job seeker', async () => {
    serve();
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Ramesh Kumar' })).toBeInTheDocument();
    expect(screen.getByText('JS12846 - Cook / Chef')).toBeInTheDocument();
    const details = screen.getByText('Status', { selector: 'dt' }).closest('dl')!;
    expect(within(details).getByText('Active')).toBeInTheDocument();
    expect(within(details).getByText('ramesh.kumar@email.com')).toBeInTheDocument();
    expect(within(details).getByText('+91 98765 43210')).toBeInTheDocument();
    expect(within(details).getByText('Hyderabad, TS')).toBeInTheDocument();
    expect(within(details).getByText('3 years')).toBeInTheDocument();
    expect(within(details).getByText('92%')).toBeInTheDocument();
    expect(within(details).getByText('12')).toBeInTheDocument();
    expect(within(details).getAllByText('4').length).toBeGreaterThanOrEqual(1);
    expect(within(details).getByText('1')).toBeInTheDocument();
    expect(within(details).getByText('24 Jun 2026, 10:24 AM')).toBeInTheDocument();
    expect(within(details).getByText('22 Jun 2026, 10:24 AM')).toBeInTheDocument();
  });

  it('says "1 year" for a single year of experience', async () => {
    serve({ experience_years: 1 });
    renderDetail();

    expect(await screen.findByText('1 year')).toBeInTheDocument();
  });

  it('links to the applications of this person by name', async () => {
    serve();
    renderDetail();

    const link = await screen.findByRole('link', { name: 'View applications' });
    expect(link).toHaveAttribute('href', '/admin/applications?search=Ramesh%20Kumar');
  });

  it('lists the activity from the audit trail of this job seeker', async () => {
    serve();
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Activity' })).toBeInTheDocument();
    expect(await screen.findByText('Priya Admin')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/audit-events', {
      entity_type: 'hire_job_seeker',
      entity_id: 'JS12846'
    });
  });

  it('links back to the Job Seekers list', async () => {
    serve();
    renderDetail();

    const back = await screen.findByRole('link', { name: 'Back to Job Seekers' });
    expect(back).toHaveAttribute('href', '/admin/job-seekers');
  });

  it('links the Edit button to the edit page', async () => {
    serve();
    renderDetail();

    const edit = await screen.findByRole('link', { name: 'Edit' });
    expect(edit).toHaveAttribute('href', '/admin/job-seekers/JS12846/edit');
  });

  it('asks before deactivating, then sends one request and a toast', async () => {
    serve();
    renderDetail();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Deactivate' }));

    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this job seeker?' });
    expect(dialog).toHaveTextContent('Ramesh Kumar');
    expect(api.patch).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(URL, { status: 'inactive' });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Job seeker deactivated'));
  });

  it('offers Activate for an inactive job seeker', async () => {
    serve({ status: 'inactive' });
    renderDetail();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Activate' }));
    const dialog = await screen.findByRole('dialog', { name: 'Activate this job seeker?' });
    await user.click(within(dialog).getByRole('button', { name: 'Activate' }));

    expect(api.patch).toHaveBeenCalledWith(URL, { status: 'active' });
  });

  it('hides the actions from a person who can view but not manage', async () => {
    serve({}, ['hire.admin.view']);
    renderDetail();

    await screen.findByText('Permissions loaded');

    expect(screen.getByRole('heading', { name: 'Ramesh Kumar' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument();
  });

  it('asks the activity list again after a status change, so the new event shows', async () => {
    serve();
    renderDetail();
    const user = userEvent.setup();
    const auditRequests = () =>
      api.get.mock.calls.filter(([url]) => url === '/audit-events').length;
    await screen.findByRole('heading', { name: 'Activity' });
    await vi.waitFor(() => expect(auditRequests()).toBe(1));

    await user.click(await screen.findByRole('button', { name: 'Deactivate' }));
    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this job seeker?' });
    await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    await vi.waitFor(() => expect(auditRequests()).toBe(2));
  });

  it('shows the error with a retry, not "not found", when the server fails', async () => {
    serve({}, ['*'], async () => {
      throw new ApiError({ message: 'Server down', code: 'HTTP_ERROR', status: 500 });
    });
    renderDetail();

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Job seeker not found' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Job Seekers' })).toBeInTheDocument();
  });

  it('shows Job seeker not found with a way back when the server says 404', async () => {
    serve({}, ['*'], async () => {
      throw new ApiError({ message: 'Not found', code: 'NOT_FOUND', status: 404 });
    });
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: 'Job seeker not found' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Job Seekers' })).toHaveAttribute(
      'href',
      '/admin/job-seekers'
    );
    expect(screen.queryByRole('heading', { name: 'Activity' })).not.toBeInTheDocument();
  });
});
