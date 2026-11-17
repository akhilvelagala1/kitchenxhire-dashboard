import { render, screen } from '@testing-library/react';
import { apiClient } from '@/shared/api/apiClient';
import { clearAccessToken } from '@/shared/auth/tokenStorage';
import { App } from './App';
import { router } from './router';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    list: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  }
}));

describe('Admin entry', () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it('shows admin login at /admin-login without a staff session', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('401'));
    await router.navigate('/admin-login');
    const { unmount } = render(<App />);
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeInTheDocument();
    unmount();
  });

  it('redirects legacy /admin to admin login', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('401'));
    await router.navigate('/admin');
    const { unmount } = render(<App />);
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/admin-login');
    unmount();
  });
});
