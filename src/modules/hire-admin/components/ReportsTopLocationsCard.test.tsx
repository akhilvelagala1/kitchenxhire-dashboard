import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { REPORTS_OVERVIEW } from './reportsTestData';
import { ReportsTopLocationsCard } from './ReportsTopLocationsCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const OVERVIEW_URL = '/hire/admin/reports/overview';

// Shares are out of the 8,672 applications, so 646 is 7.4%, not the 7.5% in the design picture.
const ROWS = [
  { name: 'Hyderabad', count: '3,248', share: '(37.5%)' },
  { name: 'Madhapur', count: '1,286', share: '(14.8%)' },
  { name: 'Gachibowli', count: '982', share: '(11.3%)' },
  { name: 'Banjara Hills', count: '768', share: '(8.9%)' },
  { name: 'Kondapur', count: '646', share: '(7.4%)' }
];

beforeEach(() => vi.resetAllMocks());

describe('ReportsTopLocationsCard', () => {
  it('shows each place with its count and its share of all applications', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopLocationsCard />);

    const rows = within(await screen.findByRole('list')).getAllByRole('listitem');

    expect(rows).toHaveLength(ROWS.length);
    rows.forEach((row, index) => {
      const { name, count, share } = ROWS[index]!;
      expect(within(row).getByText(name)).toBeInTheDocument();
      expect(within(row).getByText(count)).toBeInTheDocument();
      expect(within(row).getByText(share)).toBeInTheDocument();
    });
  });

  it('says in the title that the counts are applications', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopLocationsCard />);

    await screen.findByRole('list');

    expect(screen.getByRole('heading', { name: /Top Locations/ })).toBeInTheDocument();
    expect(screen.getByText('(Applications)')).toBeInTheDocument();
  });

  it('asks for the range in the URL', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopLocationsCard />, { route: '/?range=7d' });

    await screen.findByRole('list');

    expect(get).toHaveBeenCalledWith(OVERVIEW_URL, { range: '7d' });
  });

  it('shows a loading status until the overview arrives', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopLocationsCard />);

    expect(screen.getByText('Loading Top Locations')).toBeInTheDocument();
    expect(await screen.findByText('Hyderabad')).toBeInTheDocument();
    expect(screen.queryByText('Loading Top Locations')).not.toBeInTheDocument();
  });

  it('shows an error with a working retry when the request fails', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopLocationsCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Hyderabad')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the empty state when no application has a place in the period', async () => {
    get.mockResolvedValue({ ...REPORTS_OVERVIEW, top_locations: [] });
    renderPage(<ReportsTopLocationsCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
