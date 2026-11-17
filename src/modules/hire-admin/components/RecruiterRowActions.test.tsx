import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { usePermissions } from '@/shared/auth/usePermissions';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminRecruiter } from '../schemas/adminRecruiter';
import { RecruiterRowActions } from './RecruiterRowActions';

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

/** Shows once the permissions request has finished, so a test can tell "hidden" from "not loaded yet". */
function PermissionsReady() {
  const { isLoading } = usePermissions();
  return isLoading ? null : <p>Permissions loaded</p>;
}

function renderRow(over: Partial<HireAdminRecruiter> = {}, permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
  api.patch.mockResolvedValue(recruiter());
  renderPage(
    <>
      <RecruiterRowActions recruiter={recruiter(over)} />
      <PermissionsReady />
    </>
  );
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'More actions for REC10892' }));
  await screen.findByRole('menu');
  return user;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('RecruiterRowActions', () => {
  it('links the eye button to the recruiter page', async () => {
    renderRow();

    const eye = await screen.findByRole('link', { name: 'View recruiter REC10892' });
    expect(eye).toHaveAttribute('href', '/admin/recruiters/REC10892');
  });

  it('links the pencil button to the edit page', async () => {
    renderRow();

    const pencil = await screen.findByRole('link', { name: 'Edit recruiter REC10892' });
    expect(pencil).toHaveAttribute('href', '/admin/recruiters/REC10892/edit');
  });

  it('offers Deactivate and Copy recruiter ID for an active recruiter', async () => {
    renderRow();
    await openMenu();

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Deactivate',
      'Suspend',
      'Copy recruiter ID'
    ]);
  });

  it('offers Activate and Suspend for an inactive or under-review recruiter', async () => {
    renderRow({ status: 'pending' });
    await openMenu();

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Activate',
      'Suspend',
      'Copy recruiter ID'
    ]);
  });

  it('asks for confirmation naming the recruiter before deactivating, then sends one request and a toast', async () => {
    renderRow();
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));

    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this recruiter?' });
    expect(dialog).toHaveTextContent('Spice Bowl Restaurant');
    expect(api.patch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/hire/admin/recruiters/REC10892', {
      status: 'inactive'
    });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Recruiter deactivated'));
  });

  it('activates after confirmation', async () => {
    renderRow({ status: 'inactive' });
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Activate' }));
    await screen.findByRole('dialog', { name: 'Activate this recruiter?' });
    await user.click(screen.getByRole('button', { name: 'Activate' }));

    expect(api.patch).toHaveBeenCalledWith('/hire/admin/recruiters/REC10892', {
      status: 'active'
    });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Recruiter activated'));
  });

  it('sends nothing when the confirmation is cancelled', async () => {
    renderRow();
    const user = await openMenu();
    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));
    await screen.findByRole('dialog', { name: 'Deactivate this recruiter?' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(api.patch).not.toHaveBeenCalled();
  });

  it('closes the menu on Escape and returns focus to the button', async () => {
    renderRow();
    const user = await openMenu();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions for REC10892' })).toHaveFocus();
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
    expect(screen.getByRole('menuitem', { name: 'Copy recruiter ID' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toHaveFocus();
  });

  it('copies the recruiter ID and says so', async () => {
    renderRow();
    const user = await openMenu();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    await user.click(screen.getByRole('menuitem', { name: 'Copy recruiter ID' }));

    expect(writeText).toHaveBeenCalledWith('REC10892');
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Recruiter ID copied'));
  });

  it('shows an error toast when the clipboard is not available', async () => {
    renderRow();
    const user = await openMenu();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

    await user.click(screen.getByRole('menuitem', { name: 'Copy recruiter ID' }));

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows only the eye link to a person who can view but not manage', async () => {
    renderRow({}, ['hire.admin.view']);

    await screen.findByText('Permissions loaded');

    expect(screen.getByRole('link', { name: 'View recruiter REC10892' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit recruiter REC10892' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for REC10892' })
    ).not.toBeInTheDocument();
  });
});
