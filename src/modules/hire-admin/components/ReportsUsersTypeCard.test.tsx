import { cloneElement, type ReactElement } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { USERS_REPORT } from './reportsTestData';
import { ReportsUsersTypeCard } from './ReportsUsersTypeCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

/** jsdom has no layout, so the real container measures 0 x 0 and draws nothing. */
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({
      children
    }: {
      children: ReactElement<{ width: number; height: number }>;
    }) => cloneElement(children, { width: 193, height: 193 })
  };
});

const get = vi.mocked(apiClient.get);

async function rowTexts(): Promise<(string | null)[]> {
  const list = await screen.findByRole('list');
  return within(list)
    .getAllByRole('listitem')
    .map((row) => row.textContent);
}

beforeEach(() => {
  vi.resetAllMocks();
  get.mockResolvedValue(USERS_REPORT);
});

describe('ReportsUsersTypeCard', () => {
  it('shows the title and the total in the middle of the donut', async () => {
    renderPage(<ReportsUsersTypeCard />);

    expect(screen.getByRole('heading', { name: 'Users by Type' })).toBeInTheDocument();
    expect(await screen.findByText('25,830')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('lists the four types in order, each with its count and its share of the total', async () => {
    renderPage(<ReportsUsersTypeCard />);

    expect(await rowTexts()).toEqual([
      'Job Seekers24,860(96.2%)',
      'Businesses / Outlets640(2.5%)',
      'Recruiters312(1.2%)',
      'Admins18(0.1%)'
    ]);
  });

  it('draws one slice per type that has users and names the donut', async () => {
    const { container } = renderPage(<ReportsUsersTypeCard />);

    expect(
      await screen.findByRole('img', { name: 'Donut chart of 25,830 users split by type' })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(4);
  });

  it('says so when there is no user in the period', async () => {
    get.mockResolvedValue({ ...USERS_REPORT, users_by_type: [] });
    renderPage(<ReportsUsersTypeCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsUsersTypeCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('25,830')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
