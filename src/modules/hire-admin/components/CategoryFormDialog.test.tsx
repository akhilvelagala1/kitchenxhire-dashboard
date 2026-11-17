import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminCategory } from '../schemas/adminCategoryRole';
import { CategoryFormDialog } from './CategoryFormDialog';

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

const category = (over: Partial<HireAdminCategory> = {}): HireAdminCategory => ({
  category_id: 'CAT002',
  name: 'Cloud Kitchen',
  code: 'CLOUD_KITCHEN',
  business_type: 'Cloud Kitchen',
  icon: 'cloud',
  description: 'Delivery only',
  businesses: 182,
  outlets: 642,
  status: 'active',
  ...over
});

beforeEach(() => {
  vi.resetAllMocks();
  api.post.mockResolvedValue(category());
  api.patch.mockResolvedValue(category());
});

describe('CategoryFormDialog', () => {
  it('suggests the code from the name until the person edits the code', async () => {
    renderPage(<CategoryFormDialog open onClose={vi.fn()} />);
    const user = userEvent.setup();
    const code = screen.getByLabelText(/Code/);

    await user.type(screen.getByLabelText(/Name/), 'Pop-up Kiosk');
    expect(code).toHaveValue('POP_UP_KIOSK');

    await user.clear(code);
    await user.type(code, 'KIOSK');
    await user.type(screen.getByLabelText(/Name/), 's');
    expect(code).toHaveValue('KIOSK');
  });

  it('says what is wrong and sends nothing for a short name and a bad code', async () => {
    renderPage(<CategoryFormDialog open onClose={vi.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Name/), 'A');
    await user.type(screen.getByLabelText(/Code/), 'bad code');

    await user.click(screen.getByRole('button', { name: 'Add category' }));

    expect(await screen.findByText('Name must have at least 2 characters')).toBeVisible();
    expect(screen.getByText(/Use capital letters, digits and underscores/)).toBeVisible();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('creates the category with the chosen type and icon, says so and closes', async () => {
    const onClose = vi.fn();
    renderPage(<CategoryFormDialog open onClose={onClose} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Name/), 'Bakery');
    await user.selectOptions(screen.getByLabelText(/Business type/), 'Kitchen');
    await user.selectOptions(screen.getByLabelText(/Icon/), 'Truck');
    await user.type(screen.getByLabelText(/Description/), 'Bread and cakes');

    await user.click(screen.getByRole('button', { name: 'Add category' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(api.post).toHaveBeenCalledWith(
      '/hire/admin/categories',
      {
        name: 'Bakery',
        code: 'BAKERY',
        business_type: 'Kitchen',
        icon: 'truck',
        description: 'Bread and cakes'
      },
      expect.objectContaining({ idempotencyKey: expect.any(String) })
    );
    expect(toast.success).toHaveBeenCalledWith('Category added');
  });

  it('shows a duplicate code on the code field and stays open', async () => {
    api.post.mockRejectedValue(
      new ApiError({ message: 'Code exists', code: 'CONFLICT', status: 409 })
    );
    const onClose = vi.fn();
    renderPage(<CategoryFormDialog open onClose={onClose} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Name/), 'Restaurant');

    await user.click(screen.getByRole('button', { name: 'Add category' }));

    expect(await screen.findByText('This code is already used by another category')).toBeVisible();
    expect(screen.getByLabelText(/Code/)).toHaveAttribute('aria-invalid', 'true');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('fills in the stored values, keeps the code read-only and sends only changes', async () => {
    const onClose = vi.fn();
    renderPage(<CategoryFormDialog open category={category()} onClose={onClose} />);
    const user = userEvent.setup();

    expect(await screen.findByRole('dialog', { name: 'Edit Category' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Code/)).toHaveValue('CLOUD_KITCHEN');
    expect(screen.getByLabelText(/Code/)).toHaveAttribute('readonly');

    const name = screen.getByLabelText(/Name/);
    await user.clear(name);
    await user.type(name, 'Dark Kitchen');
    expect(screen.getByLabelText(/Code/)).toHaveValue('CLOUD_KITCHEN');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(api.patch).toHaveBeenCalledWith('/hire/admin/categories/CAT002', {
      name: 'Dark Kitchen'
    });
    expect(toast.success).toHaveBeenCalledWith('Category saved');
  });

  it('sends nothing when an edit changes nothing', async () => {
    const onClose = vi.fn();
    renderPage(<CategoryFormDialog open category={category()} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(api.patch).not.toHaveBeenCalled();
  });
});
