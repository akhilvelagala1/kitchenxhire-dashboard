import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/types';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { ReportsFilterOptions, ReportsRecordsQuery } from '../schemas/adminReportsDrilldown';
import { ListPager } from './ListPager';
import { ReportsRecordsCard } from './ReportsRecordsCard';
import type { ReportsRecordsConfig } from './reportsRecordsConfig';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

interface Row {
  id: string;
  name: string;
}

const get = vi.mocked(apiClient.get);
const fetchRows = vi.fn<(query: ReportsRecordsQuery) => Promise<Paginated<Row>>>();

const ROWS: Row[] = [
  { id: 'JOB-2041', name: 'Cook / Chef' },
  { id: 'JOB-2040', name: 'Kitchen Helper' },
  { id: 'JOB-2039', name: 'Cleaning & Stewarding' },
  { id: 'JOB-2038', name: 'Delivery Partner' },
  { id: 'JOB-2037', name: 'Bakery Assistant' }
];
/** 1,482 rows at five a page is 297 pages, as in the reference picture. */
const PAGE: Paginated<Row> = { items: ROWS, meta: { page: 1, page_size: 5, total: 1482 } };
const NONE: Paginated<Row> = { items: [], meta: { page: 1, page_size: 5, total: 0 } };
const OPTIONS: ReportsFilterOptions = {
  job_categories: ['Kitchen', 'Operations'],
  outlets: [],
  rejection_reasons: []
};
const OPTIONS_URL = '/hire/admin/reports/overview/filter-options';

const config: ReportsRecordsConfig<Row> = {
  metric: 'jobs_posted',
  title: 'Jobs Posted',
  description: 'Jobs posted in this period.',
  noun: 'jobs',
  searchPlaceholder: 'Search jobs...',
  filterAllLabel: 'All Jobs',
  filterChoices: (options) =>
    (options?.job_categories ?? []).map((value) => ({ value, label: value })),
  columns: [
    { id: 'id', header: 'Job ID', cell: (row) => row.id },
    { id: 'name', header: 'Job Title', cell: (row) => row.name, sortKey: 'posted_at' }
  ],
  getRowId: (row) => row.id,
  fetch: (query) => fetchRows(query),
  emptyTitle: 'No jobs posted in this window'
};

/** The card on the Reports URL, with `extra` (for example `&page=3`) after the open stat card. */
function renderCard(extra = '') {
  renderPage(<ReportsRecordsCard config={config} />, {
    route: `/admin/reports?metric=jobs_posted${extra}`
  });
}

async function rowsLoaded() {
  await screen.findByRole('cell', { name: 'JOB-2041' });
}

beforeEach(() => {
  vi.resetAllMocks();
  fetchRows.mockResolvedValue(PAGE);
  get.mockResolvedValue(OPTIONS);
});

describe('ReportsRecordsCard header and table', () => {
  it('shows the title with its total beside it and the description under it', async () => {
    renderCard();
    await rowsLoaded();

    expect(screen.getByRole('heading', { name: /Jobs Posted/ })).toBeInTheDocument();
    expect(screen.getByText('(1,482)')).toBeInTheDocument();
    expect(screen.getByText('Jobs posted in this period.')).toBeInTheDocument();
  });

  it('lists the rows of the page in a table named after the card', async () => {
    renderCard();
    await rowsLoaded();

    const table = screen.getByRole('table', { name: 'Jobs Posted list' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent)
    ).toEqual(['Job ID', 'Job Title']);
    expect(within(table).getAllByRole('row')).toHaveLength(ROWS.length + 1);
    expect(within(table).getByRole('cell', { name: 'Cleaning & Stewarding' })).toBeInTheDocument();
  });

  it('says which rows are shown out of the same total as the title, and draws the pager', async () => {
    renderCard();
    await rowsLoaded();

    expect(screen.getByText('Showing 1 – 5 of 1,482 jobs')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Jobs pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 297' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveTextContent('Previous');
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveTextContent('Next');
  });

  it('draws no page-size picker', async () => {
    renderCard();
    await rowsLoaded();

    expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  });
});

describe('ReportsRecordsCard requests', () => {
  it('asks for the first five rows of the range in the URL, with no search or filter', async () => {
    renderCard('&range=7d');
    await rowsLoaded();

    expect(fetchRows).toHaveBeenCalledWith({
      range: '7d',
      page: 1,
      pageSize: 5,
      search: '',
      filter: '',
      sort: null,
      order: 'desc'
    });
  });

  it('sends the search, filter, page and sort from the URL', async () => {
    renderCard('&q=chef&filter=Kitchen&page=3&sort=posted_at&order=asc');
    await rowsLoaded();

    expect(fetchRows).toHaveBeenCalledWith({
      range: '30d',
      page: 3,
      pageSize: 5,
      search: 'chef',
      filter: 'Kitchen',
      sort: 'posted_at',
      order: 'asc'
    });
  });

  it('keeps the rows on screen while the next page is loading', async () => {
    renderCard();
    await rowsLoaded();
    fetchRows.mockReturnValue(new Promise<Paginated<Row>>(() => undefined));

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => expect(fetchRows).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('cell', { name: 'JOB-2041' })).toBeInTheDocument();
  });
});

describe('ReportsRecordsCard search, filter, paging and sort', () => {
  it('puts what is typed in the search into the URL and asks for page 1 with it', async () => {
    renderCard('&page=3');
    await rowsLoaded();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search jobs' }), 'chef');

    await waitFor(() => expect(routerLocation.search).toContain('q=chef'));
    expect(routerLocation.search).not.toContain('page=');
    await waitFor(() =>
      expect(fetchRows).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'chef', page: 1 })
      )
    );
  });

  it('updates the total in the title and in the footer together when a search narrows the list', async () => {
    fetchRows.mockImplementation(async (query) =>
      query.search ? { items: ROWS.slice(0, 2), meta: { page: 1, page_size: 5, total: 2 } } : PAGE
    );
    renderCard();
    await rowsLoaded();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search jobs' }), 'chef');

    expect(await screen.findByText('(2)')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 – 2 of 2 jobs')).toBeInTheDocument();
  });

  it('offers all first and then the choices from the filter options request', async () => {
    renderCard();

    const select = await screen.findByRole('combobox', { name: 'All Jobs' });

    await waitFor(() =>
      expect(
        within(select)
          .getAllByRole('option')
          .map((option) => option.textContent)
      ).toEqual(['All Jobs', 'Kitchen', 'Operations'])
    );
    expect(get).toHaveBeenCalledWith(OPTIONS_URL);
  });

  it('puts the chosen filter in the URL, starts again at page 1 and asks with it', async () => {
    renderCard('&page=3');
    await rowsLoaded();
    await screen.findByRole('option', { name: 'Kitchen' });

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'All Jobs' }), 'Kitchen');

    await waitFor(() => expect(routerLocation.search).toContain('filter=Kitchen'));
    expect(routerLocation.search).not.toContain('page=');
    await waitFor(() =>
      expect(fetchRows).toHaveBeenLastCalledWith(
        expect.objectContaining({ filter: 'Kitchen', page: 1 })
      )
    );
  });

  it('keeps a filter from the URL in the select while the options are still loading', async () => {
    get.mockReturnValue(new Promise(() => undefined));
    renderCard('&filter=Kitchen');
    await rowsLoaded();

    expect(screen.getByRole('combobox', { name: 'All Jobs' })).toHaveValue('Kitchen');
  });

  it('goes to page 2 from Next and asks for it', async () => {
    renderCard();
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => expect(routerLocation.search).toContain('page=2'));
    await waitFor(() =>
      expect(fetchRows).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
    );
  });

  it('sorts by a sortable column from its header, starts again at page 1 and asks with it', async () => {
    renderCard('&page=3');
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Job Title' }));

    await waitFor(() => expect(routerLocation.search).toContain('sort=posted_at'));
    expect(routerLocation.search).toContain('order=asc');
    expect(routerLocation.search).not.toContain('page=');
    await waitFor(() =>
      expect(fetchRows).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: 'posted_at', order: 'asc', page: 1 })
      )
    );
  });

  it('marks the column sorted by the URL and flips its order on the next click', async () => {
    renderCard('&sort=posted_at&order=asc');
    await rowsLoaded();

    expect(screen.getByRole('columnheader', { name: 'Job Title' })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
    expect(screen.getByRole('columnheader', { name: 'Job ID' })).not.toHaveAttribute('aria-sort');

    await userEvent.click(screen.getByRole('button', { name: 'Job Title' }));

    await waitFor(() => expect(routerLocation.search).toContain('order=desc'));
  });
});

describe('ReportsRecordsCard states', () => {
  it('shows a loading status, five placeholder rows and no total until the first answer arrives', async () => {
    fetchRows.mockReturnValue(new Promise<Paginated<Row>>(() => undefined));
    renderCard();

    expect(await screen.findByRole('status')).toHaveTextContent('Loading Jobs Posted');
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.queryByRole('cell', { name: 'JOB-2041' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jobs Posted' })).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it('shows the error with a retry that asks again and then shows the rows', async () => {
    fetchRows.mockRejectedValueOnce(new Error('Server down'));
    renderCard();

    expect(await screen.findByRole('alert')).toHaveTextContent('Server down');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await rowsLoaded();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetchRows).toHaveBeenCalledTimes(2);
  });

  it('explains an empty list and says there are none', async () => {
    fetchRows.mockResolvedValue(NONE);
    renderCard();

    expect(await screen.findByText('No jobs posted in this window')).toBeInTheDocument();
    expect(screen.getByText('Try a different search or date range.')).toBeInTheDocument();
    expect(screen.getByText('Showing 0 jobs')).toBeInTheDocument();
    expect(screen.getByText('(0)')).toBeInTheDocument();
  });
});

describe('ListPager without a page-size handler', () => {
  it('draws no page-size picker when there is nothing to call', () => {
    render(<ListPager page={1} pageSize={5} total={40} noun="jobs" onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  });
});
