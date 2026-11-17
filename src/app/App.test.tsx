import { render, screen } from '@testing-library/react';
import { apiClient } from '@/shared/api/apiClient';
import { setAccessToken } from '@/shared/auth/tokenStorage';
import { App } from './App';
import { router } from './router';

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

describe('App', () => {
  it('boots the shell, permission-filtered navigation and the first lazy page', async () => {
    setAccessToken('test-staff-token');
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url === '/auth/me') {
        return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions: ['*'] };
      }
      if (url.includes('summary')) {
        return {
          total_jobs: 1482,
          total_applications: 8672,
          active_recruiters: 312,
          job_seekers: 24860,
          growth_jobs_pct: 12,
          growth_applications_pct: 18,
          growth_recruiters_pct: 7,
          growth_job_seekers_pct: 15
        };
      }
      if (url.includes('applications-trend')) {
        return [
          { date: '2025-06-01', count: 900 },
          { date: '2025-06-02', count: 950 }
        ];
      }
      if (url.includes('recent-applications')) {
        return [
          {
            id: 'APP12876',
            candidate_name: 'Ramesh Kumar',
            candidate_initials: 'RK',
            job_title: 'Cook / Chef',
            location: 'Hyderabad',
            status: 'NEW',
            applied_at: '2025-06-24T09:42:00.000Z'
          }
        ];
      }
      if (url.includes('open-jobs-by-category')) {
        return [{ id: 'chef', label: 'Cook / Chef', count: 428 }];
      }
      throw new Error(`unexpected get ${url}`);
    });
    await router.navigate('/admin/dashboard');
    const { unmount } = render(<App />);

    expect(await screen.findByRole('link', { name: 'Reports & Analytics' })).toHaveAttribute(
      'href',
      '/admin/reports'
    );
    expect(screen.queryByRole('link', { name: 'Categories & Roles' })).not.toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Admin Dashboard', level: 1 }, { timeout: 5000 })
    ).toBeInTheDocument();
    unmount();
  });

  it.each(['/', '/home'])('serves the public homepage at %s, not the admin shell', async (path) => {
    await router.navigate(path);
    const { unmount } = render(<App />);

    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 5000 })).toHaveTextContent(
      /Good people.s*Stronger kitchens./
    );
    expect(screen.queryByRole('heading', { name: 'Overview', level: 1 })).not.toBeInTheDocument();
    unmount();
  });
});
