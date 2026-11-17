import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminBusiness } from '../schemas/adminBusiness';
import { BusinessFormDialog } from './BusinessFormDialog';

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

async function fillAdd(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Business name/), 'Green Leaf Cafe');
  await user.selectOptions(screen.getByLabelText(/Business type/), 'Cloud Kitchen');
  await user.type(screen.getByLabelText(/Owner name/), 'Meera Nair');
  await user.type(screen.getByLabelText(/Area/), 'Madhapur');
  await user.type(screen.getByLabelText(/City/), 'Hyderabad');
  await user.type(screen.getByLabelText(/Phone/), '+91 98765 43211');
  await user.type(screen.getByLabelText(/E-mail/), 'meera@greenleaf.example.com');
}

beforeEach(() => {
  vi.resetAllMocks();
  api.post.mockResolvedValue(business());
  api.patch.mockResolvedValue(business());
});

describe('BusinessFormDialog', () => {
  it('shows nothing while it is closed', () => {
    renderPage(<BusinessFormDialog open={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('form', { name: 'Business details' })).not.toBeInTheDocument();
  });

  it('titles the dialog Add Business and starts empty', async () => {
    renderPage(<BusinessFormDialog open onClose={vi.fn()} />);

    expect(await screen.findByRole('dialog', { name: 'Add Business' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Business name/)).toHaveValue('');
  });

  it('says what is wrong and sends nothing when the fields are empty or invalid', async () => {
    renderPage(<BusinessFormDialog open onClose={vi.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Phone/), '12345');
    await user.type(screen.getByLabelText(/E-mail/), 'not-an-email');

    await user.click(screen.getByRole('button', { name: 'Add business' }));

    expect(await screen.findByText('Business name must have at least 2 characters')).toBeVisible();
    expect(screen.getByText('Enter a 10-digit mobile number')).toBeVisible();
    expect(screen.getByText('Enter a valid e-mail address')).toBeVisible();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('creates the business with a normalised phone, says so and closes', async () => {
    const onClose = vi.fn();
    renderPage(<BusinessFormDialog open onClose={onClose} />);
    const user = userEvent.setup();
    await fillAdd(user);

    await user.click(screen.getByRole('button', { name: 'Add business' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(
      '/hire/admin/businesses',
      {
        business_name: 'Green Leaf Cafe',
        business_type: 'Cloud Kitchen',
        area: 'Madhapur',
        city: 'Hyderabad',
        owner_name: 'Meera Nair',
        phone: '9876543211',
        email: 'meera@greenleaf.example.com'
      },
      expect.objectContaining({ idempotencyKey: expect.any(String) })
    );
    expect(toast.success).toHaveBeenCalledWith('Business added');
  });

  it('shows the server message on the field it names', async () => {
    api.post.mockRejectedValue(
      new ApiError({
        message: 'Invalid',
        code: 'VALIDATION',
        status: 422,
        fieldErrors: { email: 'This e-mail is already used' }
      })
    );
    const onClose = vi.fn();
    renderPage(<BusinessFormDialog open onClose={onClose} />);
    const user = userEvent.setup();
    await fillAdd(user);

    await user.click(screen.getByRole('button', { name: 'Add business' }));

    expect(await screen.findByText('This e-mail is already used')).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('titles the dialog Edit Business and fills in the stored values', async () => {
    renderPage(<BusinessFormDialog open business={business()} onClose={vi.fn()} />);

    expect(await screen.findByRole('dialog', { name: 'Edit Business' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Business name/)).toHaveValue('Spice Bowl Restaurant');
    expect(screen.getByLabelText(/Phone/)).toHaveValue('9876543210');
  });

  it('sends only the changed fields when editing', async () => {
    const onClose = vi.fn();
    renderPage(<BusinessFormDialog open business={business()} onClose={onClose} />);
    const user = userEvent.setup();
    const name = screen.getByLabelText(/Business name/);
    await user.clear(name);
    await user.type(name, 'Spice Bowl Kitchen');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/hire/admin/businesses/BUS0642', {
      business_name: 'Spice Bowl Kitchen'
    });
    expect(toast.success).toHaveBeenCalledWith('Business saved');
  });

  it('sends nothing and just closes when nothing was changed', async () => {
    const onClose = vi.fn();
    renderPage(<BusinessFormDialog open business={business()} onClose={onClose} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(api.patch).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('closes from Cancel without sending anything', async () => {
    const onClose = vi.fn();
    renderPage(<BusinessFormDialog open onClose={onClose} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(api.post).not.toHaveBeenCalled();
  });
});
