import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { usePermissions } from '@/shared/auth/usePermissions';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminBusiness } from '../schemas/adminBusiness';
import { BusinessRowActions } from './BusinessRowActions';

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

const business = (over: Partial<HireAdminBusiness> = {}): HireAdminBusiness => ({
  business_id: 'BUS0642',
  business_name: 'Spice Bowl Restaurant',
  business_type: 'Restaurant',
  area: 'Rajiv Nagar',
  city: 'Hyderabad',
  owner_name: 'Rahul Verma',
  phone: '9876543210',
  email: 'rahul@spicebowl.example.com',
  outlets: 12,
  status: 'active',
  verification: 'verified',
  joined_at: '2024-06-24T10:24:00+05:30',
  ...over
});

/** Shows once the permissions request has finished, so a test can tell "hidden" from "not loaded yet". */
function PermissionsReady() {
  const { isLoading } = usePermissions();
  return isLoading ? null : <p>Permissions loaded</p>;
}

function renderRow(over: Partial<HireAdminBusiness> = {}, permissions: string[] = ['*']) {
  const handlers = { onView: vi.fn(), onEdit: vi.fn(), onSetStatus: vi.fn() };
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
  const row = business(over);
  renderPage(
    <>
      <BusinessRowActions business={row} handlers={handlers} />
      <PermissionsReady />
    </>
  );
  return { handlers, row };
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'More actions for BUS0642' }));
  await screen.findByRole('menu');
  return user;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('BusinessRowActions', () => {
  it('opens the details from the eye button', async () => {
    const { handlers, row } = renderRow();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'View business BUS0642' }));

    expect(handlers.onView).toHaveBeenCalledWith(row);
  });

  it('opens the edit dialog from the pencil button', async () => {
    const { handlers, row } = renderRow();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Edit business BUS0642' }));

    expect(handlers.onEdit).toHaveBeenCalledWith(row);
  });

  it('shows only the eye button to a person who can view but not manage', async () => {
    renderRow({}, ['hire.admin.view']);

    await screen.findByText('Permissions loaded');

    expect(screen.getByRole('button', { name: 'View business BUS0642' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit business BUS0642' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for BUS0642' })
    ).not.toBeInTheDocument();
  });

  it('offers Deactivate, Suspend and Copy business ID for an active business', async () => {
    renderRow();
    await openMenu();

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Deactivate',
      'Suspend',
      'Copy business ID'
    ]);
  });

  it.each(['inactive', 'under_review', 'suspended'] as const)(
    'offers Activate for a %s business',
    async (status) => {
      renderRow({ status });
      await openMenu();

      const items = screen.getAllByRole('menuitem').map((item) => item.textContent);
      expect(items[0]).toBe('Activate');
      expect(items.at(-1)).toBe('Copy business ID');
      if (status === 'inactive') expect(items).toContain('Suspend');
      else expect(items).not.toContain('Suspend');
    }
  );

  it('reports the status change to the table section and closes the menu', async () => {
    const { handlers, row } = renderRow();
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));

    expect(handlers.onSetStatus).toHaveBeenCalledWith(row, 'inactive');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('closes the menu on Escape and returns focus to the button', async () => {
    renderRow();
    const user = await openMenu();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions for BUS0642' })).toHaveFocus();
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
    expect(screen.getByRole('menuitem', { name: 'Copy business ID' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toHaveFocus();
  });

  it('copies the business ID and says so', async () => {
    renderRow();
    const user = await openMenu();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    await user.click(screen.getByRole('menuitem', { name: 'Copy business ID' }));

    expect(writeText).toHaveBeenCalledWith('BUS0642');
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Business ID copied'));
  });

  it('shows an error toast when the clipboard is not available', async () => {
    renderRow();
    const user = await openMenu();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

    await user.click(screen.getByRole('menuitem', { name: 'Copy business ID' }));

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.success).not.toHaveBeenCalled();
  });
});
