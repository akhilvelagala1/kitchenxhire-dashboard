import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { usePermissions } from '@/shared/auth/usePermissions';
import { renderPage } from '@/shared/test/render';
import type { HireAdminBusiness } from '../schemas/adminBusiness';
import { BusinessViewDialog } from './BusinessViewDialog';

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

function PermissionsReady() {
  const { isLoading } = usePermissions();
  return isLoading ? null : <p>Permissions loaded</p>;
}

function renderDialog(over: Partial<HireAdminBusiness> = {}, permissions: string[] = ['*']) {
  const onClose = vi.fn();
  const onEdit = vi.fn();
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
  const row = business(over);
  renderPage(
    <>
      <BusinessViewDialog business={row} onClose={onClose} onEdit={onEdit} />
      <PermissionsReady />
    </>
  );
  return { onClose, onEdit, row };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('BusinessViewDialog', () => {
  it('shows nothing without a business', () => {
    renderPage(<BusinessViewDialog business={undefined} onClose={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.queryByRole('term')).not.toBeInTheDocument();
  });

  it('titles the dialog with the business name and id and lists every field', async () => {
    renderDialog({ status: 'under_review', verification: 'pending' });

    const dialog = await screen.findByRole('dialog', { name: 'Spice Bowl Restaurant (BUS0642)' });
    const text = (label: string) =>
      within(dialog).getByText(label).closest('div')?.querySelector('dd')?.textContent;
    expect(text('Status')).toBe('Under Review');
    expect(text('Verification')).toBe('Pending');
    expect(text('Business type')).toBe('Restaurant');
    expect(text('Location')).toBe('Rajiv Nagar, Hyderabad');
    expect(text('Owner')).toBe('Rahul Verma');
    expect(text('Phone')).toBe('+91 98765 43210');
    expect(text('E-mail')).toBe('rahul@spicebowl.example.com');
    expect(text('Outlets')).toBe('12');
    expect(text('Joined on')).toBe('24 Jun 2024');
  });

  it('hands the business to onEdit from the Edit button', async () => {
    const { onEdit, row } = renderDialog();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(row);
  });

  it('hides Edit from a person who can view but not manage', async () => {
    renderDialog({}, ['hire.admin.view']);

    await screen.findByText('Permissions loaded');

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('closes from the Close button', async () => {
    const { onClose } = renderDialog();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
