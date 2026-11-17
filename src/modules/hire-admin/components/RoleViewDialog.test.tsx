import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { makeRole, ROLES } from './roleTestData';
import { RoleViewDialog } from './RoleViewDialog';

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

const api = vi.mocked(apiClient);

function renderDialog(role = makeRole()) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions: ['*'] };
    return [];
  });
  const handlers = { onClose: vi.fn(), onEdit: vi.fn(), onEditPermissions: vi.fn() };
  renderPage(<RoleViewDialog role={role} {...handlers} />);
  return { handlers, role };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('RoleViewDialog', () => {
  it('summarises the permissions per module and the users', async () => {
    renderDialog();

    expect(await screen.findByText('1 of 45')).toBeInTheDocument();
    expect(screen.getByText('586')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getAllByText('No access')).toHaveLength(8);
  });

  it('asks for the history of the role', async () => {
    renderDialog();

    await screen.findByText('1 of 45');

    expect(api.get).toHaveBeenCalledWith('/audit-events', {
      entity_type: 'hire_role',
      entity_id: 'ROLE003'
    });
  });

  it('goes on to the permissions tab from Edit permissions', async () => {
    const { handlers, role } = renderDialog();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Edit permissions' }));

    expect(handlers.onEditPermissions).toHaveBeenCalledWith(role);
  });

  it('shows the protected note and no Edit permissions button for a protected role', async () => {
    renderDialog(ROLES[0]);

    expect(await screen.findByText(/Protected system role/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit permissions' })).not.toBeInTheDocument();
  });
});
