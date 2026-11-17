import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage } from '@/shared/test/render';
import { makeRole } from './roleTestData';
import { RoleFormDialog } from './RoleFormDialog';

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

beforeEach(() => {
  vi.resetAllMocks();
});

describe('RoleFormDialog', () => {
  it('refuses a one-letter name before sending anything', async () => {
    renderPage(<RoleFormDialog open onClose={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Role name/), 'A');
    await user.click(screen.getByRole('button', { name: 'Add role' }));

    expect(
      await screen.findByText('Role name must have at least 2 characters')
    ).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('creates the role and closes', async () => {
    api.post.mockResolvedValue(makeRole());
    const onClose = vi.fn();
    renderPage(<RoleFormDialog open onClose={onClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Role name/), 'Auditor');
    await user.click(screen.getByRole('button', { name: 'Add role' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.post.mock.calls[0]![1]).toEqual({ name: 'Auditor', description: '' });
  });

  it('shows a duplicate name error on the name field', async () => {
    api.post.mockRejectedValue(
      new ApiError({
        message: 'A role with this name already exists',
        code: 'CONFLICT',
        status: 409
      })
    );
    renderPage(<RoleFormDialog open onClose={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Role name/), 'Viewer');
    await user.click(screen.getByRole('button', { name: 'Add role' }));

    expect(await screen.findByText('A role with this name already exists')).toBeInTheDocument();
    expect(screen.getByLabelText(/Role name/)).toBeInvalid();
  });

  it('makes the name read-only for a protected role and explains why', () => {
    renderPage(
      <RoleFormDialog open role={makeRole({ name: 'Admin', protected: true })} onClose={vi.fn()} />
    );

    expect(screen.getByLabelText(/Role name/)).toHaveAttribute('readonly');
    expect(
      screen.getByText('The name of a protected system role cannot be changed.')
    ).toBeInTheDocument();
  });
});
