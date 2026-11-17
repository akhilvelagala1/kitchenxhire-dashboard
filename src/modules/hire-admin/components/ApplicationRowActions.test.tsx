import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { usePermissions } from '@/shared/auth/usePermissions';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { ApplicationRowActions } from './ApplicationRowActions';

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

/** Shows once the permissions request has finished, so a test can tell "hidden" from "not loaded yet". */
function PermissionsReady() {
  const { isLoading } = usePermissions();
  return isLoading ? null : <p>Permissions loaded</p>;
}

function renderRow(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
  api.patch.mockResolvedValue(application());
  renderPage(
    <>
      <ApplicationRowActions application={application()} />
      <PermissionsReady />
    </>
  );
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'More actions for APP10892' }));
  await screen.findByRole('menu');
  return user;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ApplicationRowActions', () => {
  it('links the eye button to the application page', async () => {
    renderRow();

    const eye = await screen.findByRole('link', { name: 'View application APP10892' });
    expect(eye).toHaveAttribute('href', '/admin/applications/APP10892');
  });

  it('opens the schedule dialog from the calendar button', async () => {
    renderRow();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Schedule interview for APP10892' })
    );

    expect(await screen.findByRole('dialog', { name: 'Schedule interview' })).toBeInTheDocument();
  });

  it('lists every status except the current one and Interview Scheduled', async () => {
    renderRow();
    await openMenu();

    const labels = screen.getAllByRole('menuitem').map((item) => item.textContent);
    expect(labels).toEqual([
      'Mark as Pending Review',
      'Mark as Shortlisted',
      'Mark as Hired',
      'Mark as Rejected',
      'Copy application ID'
    ]);
  });

  it('changes the status with one request and a confirmation toast', async () => {
    renderRow();
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Mark as Shortlisted' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/hire/admin/applications/APP10892', {
      status: 'shortlisted'
    });
    await vi.waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Status changed to Shortlisted')
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('asks for confirmation before rejecting and sends nothing until it is given', async () => {
    renderRow();
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Mark as Rejected' }));

    const dialog = await screen.findByRole('dialog', { name: 'Reject this application?' });
    expect(dialog).toHaveTextContent('Rahul Kumar');
    expect(api.patch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/hire/admin/applications/APP10892', {
      status: 'rejected'
    });
    await vi.waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Status changed to Rejected')
    );
  });

  it('sends nothing when the rejection is cancelled', async () => {
    renderRow();
    const user = await openMenu();
    await user.click(screen.getByRole('menuitem', { name: 'Mark as Rejected' }));
    await screen.findByRole('dialog', { name: 'Reject this application?' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(api.patch).not.toHaveBeenCalled();
  });

  it('closes the menu on Escape and returns focus to the button', async () => {
    renderRow();
    const user = await openMenu();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions for APP10892' })).toHaveFocus();
  });

  it('closes the menu on a click outside it', async () => {
    renderRow();
    const user = await openMenu();

    await user.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu and keeps focus on the button when Tab is pressed', async () => {
    renderRow();
    const user = await openMenu();

    await user.tab();

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions for APP10892' })).toHaveFocus();
  });

  it('moves between the menu items with the arrow keys and wraps around', async () => {
    renderRow();
    const user = await openMenu();
    expect(screen.getByRole('menuitem', { name: 'Mark as Pending Review' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Mark as Shortlisted' })).toHaveFocus();

    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Copy application ID' })).toHaveFocus();
  });

  it('copies the application ID and says so', async () => {
    renderRow();
    const user = await openMenu();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    await user.click(screen.getByRole('menuitem', { name: 'Copy application ID' }));

    expect(writeText).toHaveBeenCalledWith('APP10892');
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Application ID copied'));
  });

  it('shows an error toast when the clipboard is not available', async () => {
    renderRow();
    const user = await openMenu();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

    await user.click(screen.getByRole('menuitem', { name: 'Copy application ID' }));

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows only the eye link to a person who can view but not manage', async () => {
    renderRow(['hire.admin.view']);

    await screen.findByText('Permissions loaded');

    expect(screen.getByRole('link', { name: 'View application APP10892' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Schedule interview for APP10892' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for APP10892' })
    ).not.toBeInTheDocument();
  });
});
