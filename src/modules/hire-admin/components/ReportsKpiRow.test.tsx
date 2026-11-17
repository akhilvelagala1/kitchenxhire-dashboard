import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage, routerLocation } from '@/shared/test/render';
import { ReportsKpiRow } from './ReportsKpiRow';
import { REPORTS_OVERVIEW } from './reportsTestData';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const GREEN = 'text-[#0F7A3A]';
const RED = 'text-[#B42318]';
/** A card's border while closed, and the one that replaces it while open (`!` beats the first). */
const PLAIN_BORDER = 'border-[#E9ECF2]';
const OPEN_BORDER = 'border-brand-600!';
/** The five cards in the order they are drawn, with the `metric` each one puts in the URL. */
const CARDS = [
  { label: 'Jobs Posted', name: /^Jobs Posted/, metric: 'jobs_posted' },
  { label: 'Applications', name: /^Applications/, metric: 'applications' },
  { label: 'Hired', name: /^Hired/, metric: 'hired' },
  { label: 'Rejected', name: /^Rejected/, metric: 'rejected' },
  { label: 'Avg. Time to Hire', name: /^Avg\. Time/, metric: 'avg_time_to_hire_days' }
];

beforeEach(() => vi.resetAllMocks());

describe('ReportsKpiRow', () => {
  it('shows the five figures with their change and an accessible name', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />);

    const jobs = await screen.findByRole('button', {
      name: 'Jobs Posted, 1,482, up 12% vs previous 30 days'
    });
    expect(jobs).toHaveTextContent('1,482');
    expect(jobs).toHaveTextContent('+12%');
    expect(
      screen.getByRole('button', { name: 'Applications, 8,672, up 18% vs previous 30 days' })
    ).toHaveTextContent('+18%');
    expect(
      screen.getByRole('button', { name: 'Hired, 590, up 15% vs previous 30 days' })
    ).toHaveTextContent('+15%');
    expect(
      screen.getByRole('button', { name: 'Rejected, 1,036, down 5% vs previous 30 days' })
    ).toHaveTextContent('-5%');
    const time = screen.getByRole('button', {
      name: 'Avg. Time to Hire, 6.8 days, down 22% vs previous 30 days'
    });
    expect(time).toHaveTextContent('6.8 days');
    expect(time).toHaveTextContent('-22%');
    expect(get).toHaveBeenCalledWith('/hire/admin/reports/overview', { range: '30d' });
  });

  it('writes "vs previous 30 days" under the first two cards only, as the picture does', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />);

    expect(await screen.findByRole('button', { name: /^Jobs Posted/ })).toHaveTextContent(
      'vs previous 30 days'
    );
    expect(screen.getByRole('button', { name: /^Applications/ })).toHaveTextContent(
      'vs previous 30 days'
    );
    expect(screen.getByRole('button', { name: /^Hired/ })).not.toHaveTextContent('vs previous');
    expect(screen.getByRole('button', { name: /^Rejected/ })).not.toHaveTextContent('vs previous');
    expect(screen.getByRole('button', { name: /^Avg\. Time/ })).not.toHaveTextContent(
      'vs previous'
    );
  });

  it('counts the days of the caption from the range in the URL', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />, { route: '/?range=90d' });

    const jobs = await screen.findByRole('button', {
      name: 'Jobs Posted, 1,482, up 12% vs previous 90 days'
    });
    expect(jobs).toHaveTextContent('vs previous 90 days');
    expect(get).toHaveBeenCalledWith('/hire/admin/reports/overview', { range: '90d' });
  });

  it('draws a rise green and a fall red, but a fall in time to hire green', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />);

    const hired = await screen.findByRole('button', { name: /^Hired/ });
    expect(within(hired).getByText('+15%')).toHaveClass(GREEN);
    const rejected = screen.getByRole('button', { name: /^Rejected/ });
    expect(within(rejected).getByText('-5%')).toHaveClass(RED);
    const time = screen.getByRole('button', { name: /^Avg\. Time/ });
    expect(within(time).getByText('-22%')).toHaveClass(GREEN);
  });

  it('draws a rise in time to hire red', async () => {
    get.mockResolvedValue({
      ...REPORTS_OVERVIEW,
      kpis: {
        ...REPORTS_OVERVIEW.kpis,
        avg_time_to_hire_days: { value: 7.5, change_pct: 10 }
      }
    });
    renderPage(<ReportsKpiRow />);

    const time = await screen.findByRole('button', {
      name: 'Avg. Time to Hire, 7.5 days, up 10% vs previous 30 days'
    });
    expect(within(time).getByText('+10%')).toHaveClass(RED);
  });

  it('shows no change as 0% in a neutral colour', async () => {
    get.mockResolvedValue({
      ...REPORTS_OVERVIEW,
      kpis: { ...REPORTS_OVERVIEW.kpis, hired: { value: 590, change_pct: 0 } }
    });
    renderPage(<ReportsKpiRow />);

    const hired = await screen.findByRole('button', {
      name: 'Hired, 590, unchanged vs previous 30 days'
    });
    const change = within(hired).getByText('0%');
    expect(change).not.toHaveClass(GREEN);
    expect(change).not.toHaveClass(RED);
  });

  it('shows a loading status first, then an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading report figures');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the report figures');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('button', { name: /^Hired/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('draws the five cards as buttons, none pressed until one is opened', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />);

    await screen.findByRole('button', { name: /^Jobs Posted/ });
    expect(screen.getAllByRole('button')).toHaveLength(5);
    for (const { name } of CARDS) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('presses the card that the metric in the URL names, and no other', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />, { route: '/?metric=hired' });

    expect(await screen.findByRole('button', { name: /^Hired/, pressed: true })).toBeVisible();
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  });

  it.each(CARDS)(
    'opens the $label card by putting metric=$metric in the URL and pressing it',
    async ({ name, metric }) => {
      get.mockResolvedValue(REPORTS_OVERVIEW);
      renderPage(<ReportsKpiRow />);

      await userEvent.click(await screen.findByRole('button', { name }));

      await waitFor(() => expect(routerLocation.search).toBe(`?metric=${metric}`));
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
    }
  );

  it('closes the card, and takes metric out of the URL, on a second click', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />);
    const hired = await screen.findByRole('button', { name: /^Hired/ });

    await userEvent.click(hired);
    await waitFor(() => expect(routerLocation.search).toBe('?metric=hired'));
    await userEvent.click(hired);

    await waitFor(() => expect(routerLocation.search).toBe(''));
    expect(hired).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps one card pressed at a time: opening another closes the first', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />);

    await userEvent.click(await screen.findByRole('button', { name: /^Hired/ }));
    await userEvent.click(screen.getByRole('button', { name: /^Rejected/ }));

    await waitFor(() => expect(routerLocation.search).toBe('?metric=rejected'));
    expect(screen.getByRole('button', { name: /^Rejected/, pressed: true })).toBeVisible();
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  });

  it('keeps the range but forgets what was typed in the old card when another opens', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />, {
      route: '/?range=90d&metric=applications&q=asha&filter=hired&page=3&sort=applied_at&order=asc'
    });

    await userEvent.click(await screen.findByRole('button', { name: /^Hired/ }));

    await waitFor(() => expect(routerLocation.search).toBe('?range=90d&metric=hired'));
  });

  it('draws the open card with an orange border and the other four with their own', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />, { route: '/?metric=hired' });

    expect(await screen.findByRole('button', { name: /^Hired/ })).toHaveClass(OPEN_BORDER);
    for (const { name, metric } of CARDS.filter((card) => card.metric !== 'hired')) {
      const closed = screen.getByRole('button', { name });
      expect(closed, metric).toHaveClass(PLAIN_BORDER);
      expect(closed, metric).not.toHaveClass(OPEN_BORDER);
    }
  });

  it('adds only a border colour and a ring to the open card, so it keeps its size', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsKpiRow />, { route: '/?metric=hired' });

    const open = await screen.findByRole('button', { name: /^Hired/ });
    const closed = screen.getByRole('button', { name: /^Rejected/ }).className.split(' ');
    const added = open.className.split(' ').filter((name) => !closed.includes(name));

    expect(new Set(added)).toEqual(new Set([OPEN_BORDER, 'ring-1', 'ring-brand-600']));
  });
});
