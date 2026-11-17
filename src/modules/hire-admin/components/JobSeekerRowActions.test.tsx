import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { usePermissions } from '@/shared/auth/usePermissions';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminJobSeeker } from '../schemas/adminJobSeeker';
import { JobSeekerRowActions } from './JobSeekerRowActions';

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

/** Shows once the permissions request has finished, so a test can tell "hidden" from "not loaded yet". */
function PermissionsReady() {
  const { isLoading } = usePermissions();
  return isLoading ? null : <p>Permissions loaded</p>;
}

function renderRow(over: Partial<HireAdminJobSeeker> = {}, permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
  api.patch.mockResolvedValue(jobSeeker());
  renderPage(
    <>
      <JobSeekerRowActions jobSeeker={jobSeeker(over)} />
      <PermissionsReady />
    </>
  );
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'More actions for JS12846' }));
  await screen.findByRole('menu');
  return user;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('JobSeekerRowActions', () => {
  it('links the eye button to the job seeker page', async () => {
    renderRow();

    const eye = await screen.findByRole('link', { name: 'View job seeker JS12846' });
    expect(eye).toHaveAttribute('href', '/admin/job-seekers/JS12846');
  });

  it('links the pencil button to the edit page', async () => {
    renderRow();

    const pencil = await screen.findByRole('link', { name: 'Edit job seeker JS12846' });
    expect(pencil).toHaveAttribute('href', '/admin/job-seekers/JS12846/edit');
  });

  it('offers Deactivate, Suspend and Copy ID for an active job seeker', async () => {
    renderRow();
    await openMenu();

    const labels = screen.getAllByRole('menuitem').map((item) => item.textContent);
    expect(labels).toEqual(['Deactivate', 'Suspend', 'Copy job seeker ID']);
  });

  it('offers Activate and Suspend for an inactive job seeker', async () => {
    renderRow({ status: 'inactive' });
    await openMenu();

    expect(screen.getByRole('menuitem', { name: 'Activate' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Suspend' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Deactivate' })).not.toBeInTheDocument();
  });

  it('asks before deactivating, names the person and sends nothing until confirmed', async () => {
    renderRow();
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));

    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this job seeker?' });
    expect(dialog).toHaveTextContent('Ramesh Kumar');
    expect(api.patch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/hire/admin/job-seekers/JS12846', {
      status: 'inactive'
    });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Job seeker deactivated'));
  });

  it('asks before activating and sends the active status once confirmed', async () => {
    renderRow({ status: 'inactive' });
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Activate' }));

    const dialog = await screen.findByRole('dialog', { name: 'Activate this job seeker?' });
    expect(dialog).toHaveTextContent('Ramesh Kumar');
    await user.click(screen.getByRole('button', { name: 'Activate' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/hire/admin/job-seekers/JS12846', {
      status: 'active'
    });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Job seeker activated'));
  });

  it('sends nothing when the change is cancelled', async () => {
    renderRow();
    const user = await openMenu();
    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));
    await screen.findByRole('dialog', { name: 'Deactivate this job seeker?' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(api.patch).not.toHaveBeenCalled();
  });

  it('closes the menu on Escape and returns focus to the button', async () => {
    renderRow();
    const user = await openMenu();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions for JS12846' })).toHaveFocus();
  });

  it('closes the menu on a click outside it', async () => {
    renderRow();
    const user = await openMenu();

    await user.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('moves between the menu items with the arrow keys and wraps around', async () => {
    renderRow();
    const user = await openMenu();
    expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Suspend' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Copy job seeker ID' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toHaveFocus();
  });

  it('copies the job seeker ID and says so', async () => {
    renderRow();
    const user = await openMenu();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    await user.click(screen.getByRole('menuitem', { name: 'Copy job seeker ID' }));

    expect(writeText).toHaveBeenCalledWith('JS12846');
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Job seeker ID copied'));
  });

  it('shows an error toast when the clipboard is not available', async () => {
    renderRow();
    const user = await openMenu();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

    await user.click(screen.getByRole('menuitem', { name: 'Copy job seeker ID' }));

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows only the eye link to a person who can view but not manage', async () => {
    renderRow({}, ['hire.admin.view']);

    await screen.findByText('Permissions loaded');

    expect(screen.getByRole('link', { name: 'View job seeker JS12846' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit job seeker JS12846' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for JS12846' })
    ).not.toBeInTheDocument();
  });
});
