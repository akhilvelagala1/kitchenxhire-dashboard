import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import type { ReportsTimeToHire } from '../schemas/adminReportsDrilldown';
import { ReportsTimeToHireCategoriesCard } from './ReportsTimeToHireCategoriesCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const TIME_TO_HIRE_URL = '/hire/admin/reports/overview/time-to-hire';
const TITLE = 'Time to Hire – by Job Category';

/** The five categories of the reference picture. Their hires add up to the 590 counted. */
const TIME_TO_HIRE: ReportsTimeToHire = {
  range: { from: '2026-05-26', to: '2026-06-24' },
  average_days: 6.8,
  change_pct: -22,
  hires_counted: 590,
  trend: [],
  by_category: [
    { label: 'Cook / Chef', average_days: 5.2, hires: 211 },
    { label: 'Kitchen Helper', average_days: 6.1, hires: 140 },
    { label: 'Cleaning & Stewarding', average_days: 7.4, hires: 96 },
    { label: 'Delivery & Store Support', average_days: 8.1, hires: 78 },
    { label: 'Bakery Assistant', average_days: 9, hires: 65 }
  ]
};

const ROWS = [
  { name: 'Cook / Chef', value: '5.2 days' },
  { name: 'Kitchen Helper', value: '6.1 days' },
  { name: 'Cleaning & Stewarding', value: '7.4 days' },
  { name: 'Delivery & Store Support', value: '8.1 days' },
  { name: 'Bakery Assistant', value: '9.0 days' }
];

async function findRows() {
  return within(await screen.findByRole('list')).getAllByRole('listitem');
}

beforeEach(() => {
  vi.resetAllMocks();
  get.mockResolvedValue(TIME_TO_HIRE);
});

describe('ReportsTimeToHireCategoriesCard', () => {
  it('shows each job category with its average days, in the order the API sends them', async () => {
    renderPage(<ReportsTimeToHireCategoriesCard />);

    const rows = await findRows();

    expect(screen.getByRole('heading', { name: TITLE })).toBeInTheDocument();
    expect(rows).toHaveLength(ROWS.length);
    rows.forEach((row, index) => {
      const { name, value } = ROWS[index]!;
      expect(within(row).getByText(name)).toBeInTheDocument();
      expect(within(row).getByText(value)).toBeInTheDocument();
    });
  });

  it('draws the orange outline icon of Top Job Categories, a different one for each category', async () => {
    renderPage(<ReportsTimeToHireCategoriesCard />);

    const icons = (await findRows()).map((row) => row.querySelector('svg'));

    icons.forEach((icon) => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveClass('text-[#FF4B16]');
    });
    expect(new Set(icons.map((icon) => icon?.innerHTML)).size).toBe(ROWS.length);
  });

  it('gives every name a title so a cut-off name can still be read', async () => {
    renderPage(<ReportsTimeToHireCategoriesCard />);
    await findRows();

    expect(screen.getByTitle('Delivery & Store Support')).toHaveTextContent(
      'Delivery & Store Support'
    );
  });

  it('asks for the range in the URL', async () => {
    renderPage(<ReportsTimeToHireCategoriesCard />, { route: '/?range=7d' });
    await findRows();

    expect(get).toHaveBeenCalledWith(TIME_TO_HIRE_URL, { range: '7d' });
  });

  it('shows a loading status until the request is answered', async () => {
    renderPage(<ReportsTimeToHireCategoriesCard />);

    expect(screen.getByText(`Loading ${TITLE}`)).toBeInTheDocument();
    expect(await screen.findByText('Cook / Chef')).toBeInTheDocument();
    expect(screen.queryByText(`Loading ${TITLE}`)).not.toBeInTheDocument();
  });

  it('shows an error with a working retry when the request fails', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsTimeToHireCategoriesCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Cook / Chef')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the empty state when no category had a hire in the window', async () => {
    get.mockResolvedValue({ ...TIME_TO_HIRE, hires_counted: 0, by_category: [] });
    renderPage(<ReportsTimeToHireCategoriesCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
