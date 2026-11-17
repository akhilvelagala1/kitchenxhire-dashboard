import { cloneElement, type ReactElement } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { RECRUITERS_REPORT } from './reportsTestData';
import { ReportsRecruitersStatusCard } from './ReportsRecruitersStatusCard';

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
  get.mockResolvedValue(RECRUITERS_REPORT);
});

describe('ReportsRecruitersStatusCard', () => {
  it('shows the title and the total in the middle of the donut', async () => {
    renderPage(<ReportsRecruitersStatusCard />);

    expect(screen.getByRole('heading', { name: 'Recruiters by Status' })).toBeInTheDocument();
    expect(await screen.findByText('312')).toBeInTheDocument();
    expect(screen.getByText('Recruiters')).toBeInTheDocument();
  });

  it('lists the four statuses in order, each with its count and its share of the total', async () => {
    renderPage(<ReportsRecruitersStatusCard />);

    expect(await rowTexts()).toEqual([
      'Active248(79.5%)',
      'Inactive48(15.4%)',
      'Suspended10(3.2%)',
      'Pending6(1.9%)'
    ]);
  });

  it('draws one slice per status that has recruiters and names the donut', async () => {
    const { container } = renderPage(<ReportsRecruitersStatusCard />);

    expect(
      await screen.findByRole('img', { name: 'Donut chart of 312 recruiters split by status' })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(4);
  });

  it('says so when there is no recruiter in the period', async () => {
    get.mockResolvedValue({ ...RECRUITERS_REPORT, recruiter_status: [] });
    renderPage(<ReportsRecruitersStatusCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsRecruitersStatusCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('312')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
