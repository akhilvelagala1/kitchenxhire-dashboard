import { cloneElement, type ReactElement } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { ReportsStatusCard } from './ReportsStatusCard';
import { REPORTS_OVERVIEW } from './reportsTestData';

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

function withStatuses(counts: [number, number, number, number]) {
  const [hired, shortlisted, under_review, rejected] = counts;
  return {
    ...REPORTS_OVERVIEW,
    application_status: [
      { status: 'hired' as const, count: hired },
      { status: 'shortlisted' as const, count: shortlisted },
      { status: 'under_review' as const, count: under_review },
      { status: 'rejected' as const, count: rejected }
    ]
  };
}

async function rowTexts(): Promise<(string | null)[]> {
  const list = await screen.findByRole('list');
  return within(list)
    .getAllByRole('listitem')
    .map((row) => row.textContent);
}

beforeEach(() => {
  vi.resetAllMocks();
  get.mockResolvedValue(REPORTS_OVERVIEW);
});

describe('ReportsStatusCard', () => {
  it('shows the title and the total in the middle of the donut', async () => {
    renderPage(<ReportsStatusCard />);

    expect(screen.getByRole('heading', { name: 'Applications by Status' })).toBeInTheDocument();
    expect(await screen.findByText('8,672')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
  });

  it('lists the four statuses in order, each with its count and its share of the total', async () => {
    renderPage(<ReportsStatusCard />);

    expect(await rowTexts()).toEqual([
      'Hired590(6.8%)',
      'Shortlisted4,960(57.2%)',
      'Under Review2,086(24.1%)',
      'Rejected1,036(11.9%)'
    ]);
  });

  it('works the shares out of the counts and takes the total from them', async () => {
    get.mockResolvedValue(withStatuses([1, 1, 2, 0]));
    renderPage(<ReportsStatusCard />);

    expect(await rowTexts()).toEqual([
      'Hired1(25.0%)',
      'Shortlisted1(25.0%)',
      'Under Review2(50.0%)',
      'Rejected0(0.0%)'
    ]);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('draws one slice per status that has applications and names the donut', async () => {
    get.mockResolvedValue(withStatuses([1, 1, 2, 0]));
    const { container } = renderPage(<ReportsStatusCard />);

    expect(
      await screen.findByRole('img', { name: 'Donut chart of 4 applications split by status' })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(3);
  });

  it('draws all four slices for the reference data', async () => {
    const { container } = renderPage(<ReportsStatusCard />);
    await screen.findByText('8,672');

    expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(4);
  });

  it.each([
    ['no status rows', { ...REPORTS_OVERVIEW, application_status: [] }],
    ['only zero counts', withStatuses([0, 0, 0, 0])]
  ])('says so when there are %s', async (_name, overview) => {
    get.mockResolvedValue(overview);
    renderPage(<ReportsStatusCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows a loading status while the first request is out', () => {
    get.mockReturnValue(new Promise(() => {}));
    renderPage(<ReportsStatusCard />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading Applications by Status');
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsStatusCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('8,672')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
