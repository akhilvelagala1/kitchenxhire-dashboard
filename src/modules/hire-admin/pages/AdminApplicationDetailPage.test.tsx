import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { usePermissions } from '@/shared/auth/usePermissions';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { AdminApplicationDetailPage } from './AdminApplicationDetailPage';

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
const URL = '/hire/admin/applications/APP10892';

const application = (over: Partial<HireAdminApplication> = {}): HireAdminApplication => ({
  application_id: 'APP10892',
  candidate_id: 'CAN001',
  candidate_name: 'Rahul Kumar',
  candidate_email: 'rahul@example.com',
  candidate_phone: '+91 98765 43210',
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
  resume_file_name: 'rahul-kumar.pdf',
  ...over
});

const AUDIT = [
  {
    id: 'evt1',
    action: 'STATUS_CHANGED',
    actor_name: 'Priya Admin',
    occurred_at: '2026-06-24T05:00:00Z',
    reason: null,
    changes: [{ field: 'status', from: 'pending_review', to: 'reviewed' }]
  }
];

/** Shows once the permissions request has finished, so a test can tell "hidden" from "not loaded yet". */
function PermissionsReady() {
  const { isLoading } = usePermissions();
  return isLoading ? null : <p>Permissions loaded</p>;
}

function serve(
  over: Partial<HireAdminApplication> = {},
  permissions: string[] = ['*'],
  detail: () => Promise<HireAdminApplication> = async () => application(over)
) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === URL) return detail();
    if (url === '/audit-events') return AUDIT;
    throw new Error(`unexpected get ${url}`);
  });
  api.patch.mockResolvedValue(application());
  api.post.mockResolvedValue(application());
}

function renderDetail() {
  return renderPage(
    <>
      <AdminApplicationDetailPage />
      <PermissionsReady />
    </>,
    { route: '/admin/applications/APP10892', path: '/admin/applications/:applicationId' }
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('AdminApplicationDetailPage', () => {
  it('shows a spinner while the application loads', () => {
    serve({}, ['*'], () => new Promise(() => {}));
    renderDetail();

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('requests the application named in the address', async () => {
    serve();
    renderDetail();

    await screen.findByRole('heading', { name: 'Rahul Kumar' });
    expect(api.get).toHaveBeenCalledWith(URL);
  });

  it('shows the candidate, the job and every field of the application', async () => {
    serve();
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Rahul Kumar' })).toBeInTheDocument();
    expect(screen.getByText('APP10892 - Cook / Chef')).toBeInTheDocument();
    const details = screen.getByText('Status', { selector: 'dt' }).closest('dl')!;
    expect(within(details).getByText('Reviewed')).toBeInTheDocument();
    expect(within(details).getByText('rahul@example.com')).toBeInTheDocument();
    expect(within(details).getByText('+91 98765 43210')).toBeInTheDocument();
    expect(within(details).getByText('Hyderabad, TS')).toBeInTheDocument();
    expect(within(details).getByText('Cook / Chef (Full-time)')).toBeInTheDocument();
    expect(within(details).getByText('Rahul Verma, Spice Bowl Restaurant')).toBeInTheDocument();
    expect(within(details).getByText('24 Jun 2026, 10:24 AM')).toBeInTheDocument();
    expect(within(details).getByText('Not scheduled')).toBeInTheDocument();
    expect(within(details).getByText('rahul-kumar.pdf')).toBeInTheDocument();
  });

  it('shows the interview time in India time when one is booked', async () => {
    serve({ status: 'interview_scheduled', interview_at: '2026-07-01T04:30:00Z' });
    renderDetail();

    expect(await screen.findByText('1 Jul 2026, 10:00 AM')).toBeInTheDocument();
    expect(screen.queryByText('Not scheduled')).not.toBeInTheDocument();
  });

  it('keeps the resume download disabled and explains why', async () => {
    serve();
    renderDetail();

    const button = await screen.findByRole('button', { name: 'Download resume' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', expect.stringContaining('file service is connected'));
  });

  it('says so when no resume was uploaded', async () => {
    serve({ resume_file_name: null });
    renderDetail();

    expect(await screen.findByText('No resume uploaded')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download resume' })).toBeDisabled();
  });

  it('lists the activity from the audit trail of this application', async () => {
    serve();
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Activity' })).toBeInTheDocument();
    expect(await screen.findByText('Priya Admin')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/audit-events', {
      entity_type: 'hire_application',
      entity_id: 'APP10892'
    });
  });

  it('links back to the Applications list', async () => {
    serve();
    renderDetail();

    const back = await screen.findByRole('link', { name: 'Back to Applications' });
    expect(back).toHaveAttribute('href', '/admin/applications');
  });

  it('opens the schedule dialog from the Schedule interview button', async () => {
    serve();
    renderDetail();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Schedule interview' }));

    const dialog = await screen.findByRole('dialog', { name: 'Schedule interview' });
    expect(within(dialog).getByLabelText(/Interview date and time/)).toBeInTheDocument();
  });

  it('changes the status only when Update status is pressed, with one request and a toast', async () => {
    serve();
    renderDetail();
    const user = userEvent.setup();

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Change status' }),
      'Hired'
    );
    expect(api.patch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Update status' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(URL, { status: 'hired' });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Status changed to Hired'));
  });

  it('offers every status except the current one and Interview Scheduled', async () => {
    serve();
    renderDetail();

    const select = await screen.findByRole('combobox', { name: 'Change status' });
    const labels = [...select.querySelectorAll('option')].map((o) => o.textContent);
    expect(labels).toEqual([
      'Select a status…',
      'Pending Review',
      'Shortlisted',
      'Hired',
      'Rejected'
    ]);
  });

  it('asks for confirmation before rejecting and sends nothing until it is given', async () => {
    serve();
    renderDetail();
    const user = userEvent.setup();

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Change status' }),
      'Rejected'
    );
    await user.click(screen.getByRole('button', { name: 'Update status' }));

    const dialog = await screen.findByRole('dialog', { name: 'Reject this application?' });
    expect(dialog).toHaveTextContent('Rahul Kumar');
    expect(api.patch).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Reject' }));

    expect(api.patch).toHaveBeenCalledWith(URL, { status: 'rejected' });
  });

  it('hides the actions from a person who can view but not manage', async () => {
    serve({}, ['hire.admin.view']);
    renderDetail();

    await screen.findByText('Permissions loaded');

    expect(screen.getByRole('heading', { name: 'Rahul Kumar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Schedule interview' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Change status' })).not.toBeInTheDocument();
  });

  it('asks the activity list again after a status change, so the new event shows', async () => {
    serve();
    renderDetail();
    const user = userEvent.setup();
    const auditRequests = () =>
      api.get.mock.calls.filter(([url]) => url === '/audit-events').length;
    await screen.findByRole('heading', { name: 'Activity' });
    await vi.waitFor(() => expect(auditRequests()).toBe(1));

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Change status' }),
      'Hired'
    );
    await user.click(screen.getByRole('button', { name: 'Update status' }));

    await vi.waitFor(() => expect(auditRequests()).toBe(2));
  });

  it('shows the error with a retry, not "not found", when the server fails', async () => {
    serve({}, ['*'], async () => {
      throw new ApiError({ message: 'Server down', code: 'HTTP_ERROR', status: 500 });
    });
    renderDetail();

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Application not found' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Applications' })).toBeInTheDocument();
  });

  it('shows Application not found with a way back when the request fails', async () => {
    serve({}, ['*'], async () => {
      throw new ApiError({ message: 'Not found', code: 'NOT_FOUND', status: 404 });
    });
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: 'Application not found' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Applications' })).toHaveAttribute(
      'href',
      '/admin/applications'
    );
    expect(screen.queryByRole('heading', { name: 'Activity' })).not.toBeInTheDocument();
  });
});
