import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { usePermissions } from '@/shared/auth/usePermissions';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminRecruiter } from '../schemas/adminRecruiter';
import { AdminRecruiterDetailPage } from './AdminRecruiterDetailPage';

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
const URL = '/hire/admin/recruiters/REC10892';

const recruiter = (over: Partial<HireAdminRecruiter> = {}): HireAdminRecruiter => ({
  recruiter_id: 'REC10892',
  business_name: 'Spice Bowl Restaurant',
  business_type: 'Restaurant',
  area: 'Rajiv Nagar',
  city: 'Hyderabad',
  owner_name: 'Rahul Verma',
  phone: '9876543210',
  email: 'rahul@spicebowl.example.com',
  outlets: 12,
  open_jobs: 48,
  applications: 24,
  status: 'active',
  verification: 'verified',
  joined_at: '2024-06-24T10:24:00+05:30',
  last_login_at: '2024-06-24T10:24:00+05:30',
  ...over
});

const AUDIT = [
  {
    id: 'evt1',
    action: 'STATUS_CHANGED',
    actor_name: 'Priya Admin',
    occurred_at: '2024-06-24T05:00:00Z',
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
  over: Partial<HireAdminRecruiter> = {},
  permissions: string[] = ['*'],
  detail: () => Promise<HireAdminRecruiter> = async () => recruiter(over)
) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === URL) return detail();
    if (url === '/audit-events') return AUDIT;
    throw new Error(`unexpected get ${url}`);
  });
  api.patch.mockResolvedValue(recruiter());
}

function renderDetail() {
  return renderPage(
    <>
      <AdminRecruiterDetailPage />
      <PermissionsReady />
    </>,
    { route: '/admin/recruiters/REC10892', path: '/admin/recruiters/:recruiterId' }
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('AdminRecruiterDetailPage', () => {
  it('shows a spinner while the recruiter loads', () => {
    serve({}, ['*'], () => new Promise(() => {}));
    renderDetail();

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('shows the business and every field of the recruiter', async () => {
    serve();
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: 'Spice Bowl Restaurant' })
    ).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(URL);
    const details = screen.getByText('Account status', { selector: 'dt' }).closest('dl')!;
    expect(within(details).getByText('REC10892')).toBeInTheDocument();
    expect(within(details).getByText('Active')).toBeInTheDocument();
    expect(within(details).getByText('Verified')).toBeInTheDocument();
    expect(within(details).getByText('Restaurant')).toBeInTheDocument();
    expect(within(details).getByText('Rajiv Nagar, Hyderabad')).toBeInTheDocument();
    expect(within(details).getByText('Rahul Verma')).toBeInTheDocument();
    expect(within(details).getByText('9876543210')).toBeInTheDocument();
    expect(within(details).getByText('rahul@spicebowl.example.com')).toBeInTheDocument();
    expect(within(details).getByText('12')).toBeInTheDocument();
    expect(within(details).getByText('48')).toBeInTheDocument();
    expect(within(details).getByText('24')).toBeInTheDocument();
    expect(within(details).getAllByText('24 Jun 2024, 10:24 AM').length).toBeGreaterThanOrEqual(1);
  });

  it('links to the job postings of this business', async () => {
    serve();
    renderDetail();

    const link = await screen.findByRole('link', { name: 'View job postings' });
    expect(link).toHaveAttribute('href', '/admin/jobs?search=Spice%20Bowl%20Restaurant');
  });

  it('links back to the Recruiters list', async () => {
    serve();
    renderDetail();

    const back = await screen.findByRole('link', { name: 'Back to Recruiter Management' });
    expect(back).toHaveAttribute('href', '/admin/recruiters');
  });

  it('lists the activity from the audit trail of this recruiter', async () => {
    serve();
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Activity' })).toBeInTheDocument();
    expect(await screen.findByText('Priya Admin')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/audit-events', {
      entity_type: 'hire_recruiter',
      entity_id: 'REC10892'
    });
  });

  it('offers Edit and Deactivate to a manager of an active recruiter', async () => {
    serve();
    renderDetail();

    expect(await screen.findByRole('link', { name: 'Edit recruiter' })).toHaveAttribute(
      'href',
      '/admin/recruiters/REC10892/edit'
    );
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
  });

  it('asks for confirmation before deactivating and sends one request with a toast', async () => {
    serve();
    renderDetail();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Deactivate' }));
    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this recruiter?' });
    expect(dialog).toHaveTextContent('Spice Bowl Restaurant');
    expect(api.patch).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(URL, { status: 'inactive' });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Recruiter deactivated'));
  });

  it('offers Activate for an inactive recruiter', async () => {
    serve({ status: 'inactive' });
    renderDetail();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Activate' }));
    const dialog = await screen.findByRole('dialog', { name: 'Activate this recruiter?' });
    await user.click(within(dialog).getByRole('button', { name: 'Activate' }));

    expect(api.patch).toHaveBeenCalledWith(URL, { status: 'active' });
  });

  it('hides the actions from a person who can view but not manage', async () => {
    serve({}, ['hire.admin.view']);
    renderDetail();

    await screen.findByText('Permissions loaded');

    expect(screen.getByRole('heading', { name: 'Spice Bowl Restaurant' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit recruiter' })).not.toBeInTheDocument();
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
    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this recruiter?' });
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
    expect(screen.queryByRole('heading', { name: 'Recruiter not found' })).not.toBeInTheDocument();
  });

  it('shows Recruiter not found with a way back when the server says 404', async () => {
    serve({}, ['*'], async () => {
      throw new ApiError({ message: 'Not found', code: 'NOT_FOUND', status: 404 });
    });
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Recruiter not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Recruiter Management' })).toHaveAttribute(
      'href',
      '/admin/recruiters'
    );
    expect(screen.queryByRole('heading', { name: 'Activity' })).not.toBeInTheDocument();
  });
});
