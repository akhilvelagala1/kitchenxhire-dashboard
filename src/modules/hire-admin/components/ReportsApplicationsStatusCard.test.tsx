import { cloneElement, type ReactElement } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { APPLICATIONS_REPORT } from './reportsTestData';
import { ReportsApplicationsStatusCard } from './ReportsApplicationsStatusCard';

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
  get.mockResolvedValue(APPLICATIONS_REPORT);
});

describe('ReportsApplicationsStatusCard', () => {
  it('shows the title and the total in the middle of the donut', async () => {
    renderPage(<ReportsApplicationsStatusCard />);

    expect(screen.getByRole('heading', { name: 'Applications by Status' })).toBeInTheDocument();
    expect(await screen.findByText('8,672')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
  });

  it('lists the four statuses in order, each with its count and its share of the total', async () => {
    renderPage(<ReportsApplicationsStatusCard />);

    expect(await rowTexts()).toEqual([
      'Hired590(6.8%)',
      'Shortlisted4,960(57.2%)',
      'Under Review2,086(24.1%)',
      'Rejected1,036(11.9%)'
    ]);
  });

  it('draws one slice per status that has applications and names the donut', async () => {
    const { container } = renderPage(<ReportsApplicationsStatusCard />);

    expect(
      await screen.findByRole('img', { name: 'Donut chart of 8,672 applications split by status' })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(4);
  });

  it('says so when there is no application in the period', async () => {
    get.mockResolvedValue({ ...APPLICATIONS_REPORT, application_status: [] });
    renderPage(<ReportsApplicationsStatusCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsApplicationsStatusCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('8,672')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
