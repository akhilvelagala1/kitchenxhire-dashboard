import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { USERS_REPORT } from './reportsTestData';
import { ReportsUsersKpiRow } from './ReportsUsersKpiRow';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsUsersKpiRow', () => {
  it('shows the five figures with their change and an accessible name', async () => {
    get.mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsUsersKpiRow />);

    const total = await screen.findByRole('group', {
      name: 'Total Users, 25,830, up 19% vs previous 30 days'
    });
    expect(total).toHaveTextContent('25,830');
    expect(
      screen.getByRole('group', { name: 'Job Seekers, 24,860, up 20% vs previous 30 days' })
    ).toHaveTextContent('+20%');
    expect(screen.getByRole('group', { name: /^Businesses \/ Outlets/ })).toHaveTextContent('640');
    expect(screen.getByRole('group', { name: /^Recruiters/ })).toHaveTextContent('312');
    expect(
      screen.getByRole('group', { name: 'New Users, 1,450, up 18% vs previous 30 days' })
    ).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/hire/admin/reports/users', { range: '30d' });
  });

  it('shows a loading status first, then an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsUsersKpiRow />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading report figures');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the report figures');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('group', { name: /^Recruiters/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
