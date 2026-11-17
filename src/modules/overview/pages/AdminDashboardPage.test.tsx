import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { apiClient } from '@/shared/api/apiClient';
import { AdminDashboardPage } from './AdminDashboardPage';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn() }
}));

function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes('summary')) {
        return {
          total_jobs: 10,
          total_applications: 20,
          active_recruiters: 3,
          job_seekers: 100,
          growth_jobs_pct: 1,
          growth_applications_pct: 2,
          growth_recruiters_pct: 3,
          growth_job_seekers_pct: 4
        };
      }
      if (url.includes('applications-trend')) {
        return [
          { date: '2025-06-01', count: 100 },
          { date: '2025-06-02', count: 120 }
        ];
      }
      if (url.includes('recent-applications')) {
        return [
          {
            id: 'APP1',
            candidate_name: 'Test User',
            candidate_initials: 'TU',
            job_title: 'Cook',
            location: 'Hyderabad',
            status: 'NEW',
            applied_at: '2025-06-01T10:00:00.000Z'
          }
        ];
      }
      if (url.includes('open-jobs-by-category')) {
        return [{ id: 'chef', label: 'Cook / Chef', count: 5 }];
      }
      throw new Error(`unexpected ${url}`);
    });
  });

  it('renders hire admin dashboard sections from the reference', async () => {
    renderDashboard();
    expect(await screen.findByRole('heading', { name: 'Admin Dashboard' })).toBeInTheDocument();
    expect(await screen.findByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('Applications Trend')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Recent Applications')).toBeInTheDocument();
    expect(screen.getByText('Open Jobs by Category')).toBeInTheDocument();
  });

  describe('header date control', () => {
    afterEach(() => {
      Reflect.deleteProperty(HTMLInputElement.prototype, 'showPicker');
    });

    it('opens the native calendar when the date control is clicked', async () => {
      const user = userEvent.setup();
      const showPicker = vi.fn();
      // jsdom has no showPicker; the real browser method is what opens the calendar.
      Object.defineProperty(HTMLInputElement.prototype, 'showPicker', {
        value: showPicker,
        configurable: true
      });
      renderDashboard();

      await user.click(await screen.findByRole('button', { name: /^Dashboard date,/ }));

      expect(showPicker).toHaveBeenCalledTimes(1);
    });

    it('shows the date picked in the calendar on the control', async () => {
      renderDashboard();
      await screen.findByRole('button', { name: /^Dashboard date,/ });
      const input = document.querySelector<HTMLInputElement>('input[type="date"]')!;

      fireEvent.change(input, { target: { value: '2026-12-25' } });

      // The comma after the month depends on the Node build's date data, so allow both.
      expect(
        screen.getByRole('button', { name: /^Dashboard date,.*25 Dec,? 2026/ })
      ).toBeInTheDocument();
      expect(input).toHaveValue('2026-12-25');
    });
  });
});
