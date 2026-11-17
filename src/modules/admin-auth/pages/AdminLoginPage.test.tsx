import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLoginPage } from './AdminLoginPage';
import { apiClient } from '@/shared/api/apiClient';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

function renderLogin() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/admin-login']}>
        <AdminLoginPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('no session'));
  });

  it('renders the admin login reference copy', async () => {
    renderLogin();
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeInTheDocument();
    expect(screen.getByText(/Sign in to access the KitchenX platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText(/Contact your admin to get access/i)).toBeInTheDocument();
  });

  it('shows validation when email is invalid', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/Work email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/^Password$/i), 'secret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid work email/i);
  });
});
