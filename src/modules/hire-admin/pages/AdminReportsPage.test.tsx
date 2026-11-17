import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage, routerLocation } from '@/shared/test/render';
import {
  APPLICATIONS_REPORT,
  JOBS_REPORT,
  RECRUITERS_REPORT,
  REPORTS_OVERVIEW,
  USERS_REPORT
} from '../components/reportsTestData';
import { AdminReportsPage } from './AdminReportsPage';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));
vi.mock('@/shared/ui/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/* Every chart and KPI card has its own tests; here they only need to be on the page. */
vi.mock('../components/ReportsHiringTrendCard', () => ({
  ReportsHiringTrendCard: () => <section aria-label="Hiring Trend" />
}));
vi.mock('../components/ReportsStatusCard', () => ({
  ReportsStatusCard: () => <section aria-label="Applications by Status" />
}));
vi.mock('../components/ReportsTopCategoriesCard', () => ({
  ReportsTopCategoriesCard: () => <section aria-label="Top Job Categories" />
}));
vi.mock('../components/ReportsTopLocationsCard', () => ({
  ReportsTopLocationsCard: () => <section aria-label="Top Locations" />
}));
vi.mock('../components/ReportsPlatformGrowthCard', () => ({
  ReportsPlatformGrowthCard: () => <section aria-label="Platform Growth" />
}));
vi.mock('../components/ReportsJobsTrendCard', () => ({
  ReportsJobsTrendCard: () => <section aria-label="Jobs Posted Trend" />
}));
vi.mock('../components/ReportsJobsStatusCard', () => ({
  ReportsJobsStatusCard: () => <section aria-label="Jobs by Status" />
}));
vi.mock('../components/ReportsJobsCategoriesCard', () => ({
  ReportsJobsCategoriesCard: () => <section aria-label="Jobs Top Job Categories" />
}));
vi.mock('../components/ReportsRecentJobsCard', () => ({
  ReportsRecentJobsCard: () => <section aria-label="Recent Jobs" />
}));
vi.mock('../components/ReportsApplicationsTrendCard', () => ({
  ReportsApplicationsTrendCard: () => <section aria-label="Applications Trend" />
}));
vi.mock('../components/ReportsApplicationsStatusCard', () => ({
  ReportsApplicationsStatusCard: () => <section aria-label="Applications by Status" />
}));
vi.mock('../components/ReportsApplicationsCategoriesCard', () => ({
  ReportsApplicationsCategoriesCard: () => <section aria-label="Applications by Job Category" />
}));
vi.mock('../components/ReportsApplicationsLocationsCard', () => ({
  ReportsApplicationsLocationsCard: () => <section aria-label="Applications by Location" />
}));
vi.mock('../components/ReportsRecentApplicationsCard', () => ({
  ReportsRecentApplicationsCard: () => <section aria-label="Recent Applications" />
}));
vi.mock('../components/ReportsUsersTrendCard', () => ({
  ReportsUsersTrendCard: () => <section aria-label="User Registration Trend" />
}));
vi.mock('../components/ReportsUsersTypeCard', () => ({
  ReportsUsersTypeCard: () => <section aria-label="Users by Type" />
}));
vi.mock('../components/ReportsUsersLocationsCard', () => ({
  ReportsUsersLocationsCard: () => <section aria-label="Users by Location" />
}));
vi.mock('../components/ReportsRecentUsersCard', () => ({
  ReportsRecentUsersCard: () => <section aria-label="Recent Users" />
}));
vi.mock('../components/ReportsRecruitersActivityCard', () => ({
  ReportsRecruitersActivityCard: () => <section aria-label="Recruiter Activity Trend" />
}));
vi.mock('../components/ReportsRecruitersStatusCard', () => ({
  ReportsRecruitersStatusCard: () => <section aria-label="Recruiters by Status" />
}));
vi.mock('../components/ReportsRecruitersLeaderboardCard', () => ({
  ReportsRecruitersLeaderboardCard: () => <section aria-label="Top Recruiters by Hires" />
}));
vi.mock('../components/ReportsRecentRecruitersCard', () => ({
  ReportsRecentRecruitersCard: () => <section aria-label="Recent Recruiters" />
}));
/*
 * What a stat card opens has its own tests; here it only needs to be on the page and to make no
 * request, so `serve()` below stays strict.
 */
vi.mock('../components/ReportsDrilldownSection', () => ({
  ReportsDrilldownSection: ({ metric }: { metric: string }) => (
    <section aria-label={`Drilldown ${metric}`} />
  )
}));

const api = vi.mocked(apiClient);
const OVERVIEW_URL = '/hire/admin/reports/overview';
const EXPORT_URL = '/hire/admin/reports/exports';
const JOBS_URL = '/hire/admin/reports/jobs';
const APPLICATIONS_URL = '/hire/admin/reports/applications';
const USERS_URL = '/hire/admin/reports/users';
const RECRUITERS_URL = '/hire/admin/reports/recruiters';
const CARDS = [
  'Hiring Trend',
  'Applications by Status',
  'Top Job Categories',
  'Top Locations',
  'Platform Growth'
];

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === OVERVIEW_URL) return REPORTS_OVERVIEW;
    if (url === JOBS_URL) return JOBS_REPORT;
    if (url === APPLICATIONS_URL) return APPLICATIONS_REPORT;
    if (url === USERS_URL) return USERS_REPORT;
    if (url === RECRUITERS_URL) return RECRUITERS_REPORT;
    throw new Error(`unexpected get ${url}`);
  });
}

/** Opens the page on `route`, presses Export, and gives the one request it made: [url, body]. */
async function exportFrom(route: string) {
  renderPage(<AdminReportsPage />, { route });
  await userEvent.click(await screen.findByRole('button', { name: 'Export' }));
  await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
  return api.post.mock.calls[0];
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('AdminReportsPage', () => {
  it('shows the title, the stat cards and the five report cards', async () => {
    renderPage(<AdminReportsPage />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reports & Analytics' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Get insights into hiring performance, jobs, applications and platform growth.'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Jobs Posted, 1,482, up 12% vs previous 30 days' })
    ).toBeInTheDocument();
    for (const name of CARDS) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('region', { name: /^Drilldown/ })).not.toBeInTheDocument();
  });

  it('selects Overview and enables every report pill', async () => {
    renderPage(<AdminReportsPage />);

    const tabs = await screen.findByRole('tablist', { name: 'Report type' });
    expect(tabs).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    for (const name of ['Jobs Report', 'Applications Report', 'Users Report', 'Recruiter Report']) {
      const pill = screen.getByRole('tab', { name });
      expect(pill).not.toBeDisabled();
      expect(pill).toHaveAttribute('aria-selected', 'false');
    }
  });

  it('moves focus and selection through every enabled pill on arrow right, and back', async () => {
    renderPage(<AdminReportsPage />);

    const overview = await screen.findByRole('tab', { name: 'Overview' });
    overview.focus();
    await userEvent.keyboard('{ArrowRight}');

    const jobs = screen.getByRole('tab', { name: 'Jobs Report' });
    expect(jobs).toHaveFocus();
    expect(jobs).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowRight}');

    const applications = screen.getByRole('tab', { name: 'Applications Report' });
    expect(applications).toHaveFocus();
    expect(applications).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowRight}');

    const users = screen.getByRole('tab', { name: 'Users Report' });
    expect(users).toHaveFocus();
    expect(users).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowRight}');

    const recruiters = screen.getByRole('tab', { name: 'Recruiter Report' });
    expect(recruiters).toHaveFocus();
    expect(recruiters).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');

    expect(overview).toHaveFocus();
    expect(overview).toHaveAttribute('aria-selected', 'true');
  });

  it('shows the Jobs Report cards when its pill is clicked', async () => {
    renderPage(<AdminReportsPage />);

    await userEvent.click(await screen.findByRole('tab', { name: 'Jobs Report' }));

    expect(
      await screen.findByRole('group', { name: 'Total Jobs, 1,482, up 12% vs previous 30 days' })
    ).toBeInTheDocument();
    for (const name of [
      'Jobs Posted Trend',
      'Jobs by Status',
      'Jobs Top Job Categories',
      'Recent Jobs'
    ]) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(JOBS_URL, { range: '30d' }));
  });

  it('shows the Applications Report cards when its pill is clicked', async () => {
    renderPage(<AdminReportsPage />);

    await userEvent.click(await screen.findByRole('tab', { name: 'Applications Report' }));

    expect(
      await screen.findByRole('group', {
        name: 'Total Applications, 8,672, up 18% vs previous 30 days'
      })
    ).toBeInTheDocument();
    for (const name of [
      'Applications Trend',
      'Applications by Status',
      'Applications by Job Category',
      'Applications by Location',
      'Recent Applications'
    ]) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(APPLICATIONS_URL, { range: '30d' }));
  });

  it('shows the Users Report cards when its pill is clicked', async () => {
    renderPage(<AdminReportsPage />);

    await userEvent.click(await screen.findByRole('tab', { name: 'Users Report' }));

    expect(
      await screen.findByRole('group', { name: 'Total Users, 25,830, up 19% vs previous 30 days' })
    ).toBeInTheDocument();
    for (const name of [
      'User Registration Trend',
      'Users by Type',
      'Users by Location',
      'Recent Users'
    ]) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(USERS_URL, { range: '30d' }));
  });

  it('shows the Recruiter Report cards when its pill is clicked', async () => {
    renderPage(<AdminReportsPage />);

    await userEvent.click(await screen.findByRole('tab', { name: 'Recruiter Report' }));

    expect(
      await screen.findByRole('group', {
        name: 'Total Recruiters, 312, up 10% vs previous 30 days'
      })
    ).toBeInTheDocument();
    for (const name of [
      'Recruiter Activity Trend',
      'Recruiters by Status',
      'Top Recruiters by Hires',
      'Recent Recruiters'
    ]) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(RECRUITERS_URL, { range: '30d' }));
  });

  it('shows Overview selected for an unknown report and clears the report parameter on click', async () => {
    renderPage(<AdminReportsPage />, { route: '/?report=unknown&range=7d' });

    const overview = await screen.findByRole('tab', { name: 'Overview' });
    expect(overview).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(overview);

    await waitFor(() => expect(routerLocation.search).toBe('?range=7d'));
  });

  it('names the dates of each window in the date menu and asks for the 30-day overview', async () => {
    renderPage(<AdminReportsPage />);

    const menu = await screen.findByRole('combobox', { name: 'Date range' });
    await waitFor(() => expect(menu).toHaveDisplayValue('Last 30 Days (26 May – 24 Jun 2026)'));
    expect(
      screen.getByRole('option', { name: 'Last 7 Days (18 Jun – 24 Jun 2026)' })
    ).toBeVisible();
    expect(
      screen.getByRole('option', { name: 'Last 90 Days (27 Mar – 24 Jun 2026)' })
    ).toBeVisible();
    expect(api.get).toHaveBeenCalledWith(OVERVIEW_URL, { range: '30d' });
  });

  it('puts the chosen range in the URL, keeps other parameters, and drops it for the default', async () => {
    renderPage(<AdminReportsPage />, { route: '/?keep=1' });
    const menu = await screen.findByRole('combobox', { name: 'Date range' });

    await userEvent.selectOptions(menu, '7d');

    await waitFor(() => expect(routerLocation.search).toBe('?keep=1&range=7d'));
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(OVERVIEW_URL, { range: '7d' }));

    await userEvent.selectOptions(menu, '30d');

    await waitFor(() => expect(routerLocation.search).toBe('?keep=1'));
  });

  it('exports the chosen window, and nothing else, with no stat card open', async () => {
    expect(await exportFrom('/?range=90d')).toStrictEqual([EXPORT_URL, { range: '90d' }]);
  });

  it('hides Export from someone who can only view', async () => {
    serve(['hire.admin.view']);
    renderPage(<AdminReportsPage />);

    await screen.findByRole('combobox', { name: 'Date range' });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/auth/me'));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument()
    );
  });

  it('exports the open stat card with its search and filter', async () => {
    expect(await exportFrom('/?range=7d&metric=hired&q=asha&filter=Madhapur')).toStrictEqual([
      EXPORT_URL,
      { range: '7d', metric: 'hired', search: 'asha', filter: 'Madhapur' }
    ]);
  });

  it('leaves the search and filter out of the export of an open card when none is set', async () => {
    expect(await exportFrom('/?metric=applications')).toStrictEqual([
      EXPORT_URL,
      { range: '30d', metric: 'applications' }
    ]);
  });

  it('exports the window alone when a metric is left in the URL of another report', async () => {
    expect(await exportFrom('/?report=jobs&metric=hired&q=asha')).toStrictEqual([
      EXPORT_URL,
      { range: '30d' }
    ]);
  });

  it('opens the drilldown in place of the two chart rows when a stat card is pressed', async () => {
    renderPage(<AdminReportsPage />);

    await userEvent.click(await screen.findByRole('button', { name: /^Hired/ }));

    expect(await screen.findByRole('region', { name: 'Drilldown hired' })).toBeInTheDocument();
    await waitFor(() => expect(routerLocation.search).toBe('?metric=hired'));
    for (const name of CARDS) {
      expect(screen.queryByRole('region', { name })).not.toBeInTheDocument();
    }
  });

  it('shows the drilldown that the metric in the URL names, and none of the five report cards', async () => {
    renderPage(<AdminReportsPage />, { route: '/?metric=rejected' });

    expect(await screen.findByRole('region', { name: 'Drilldown rejected' })).toBeInTheDocument();
    for (const name of CARDS) {
      expect(screen.queryByRole('region', { name })).not.toBeInTheDocument();
    }
  });

  it('keeps the heading, pills, date range, Export and five stat cards while a card is open', async () => {
    renderPage(<AdminReportsPage />, { route: '/?metric=hired' });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reports & Analytics' })
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Report type' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Date range' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(await screen.findAllByRole('button', { name: /vs previous 30 days$/ })).toHaveLength(5);
    expect(screen.getByRole('button', { name: /^Hired/, pressed: true })).toBeInTheDocument();
  });

  it('asks for nothing of its own for the drilldown', async () => {
    renderPage(<AdminReportsPage />, { route: '/?metric=hired' });

    await screen.findByRole('button', { name: /^Hired/ });

    const asked = api.get.mock.calls.map(([url]) => url);
    expect(asked.filter((url) => url !== '/auth/me' && url !== OVERVIEW_URL)).toEqual([]);
  });

  it('brings the two chart rows back when the open stat card is pressed again', async () => {
    renderPage(<AdminReportsPage />, { route: '/?metric=hired' });

    await userEvent.click(await screen.findByRole('button', { name: /^Hired/ }));

    for (const name of CARDS) {
      expect(await screen.findByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('region', { name: /^Drilldown/ })).not.toBeInTheDocument();
    await waitFor(() => expect(routerLocation.search).toBe(''));
  });

  it.each([
    ['jobs', 'Recent Jobs'],
    ['applications', 'Recent Applications'],
    ['users', 'Recent Users'],
    ['recruiters', 'Recent Recruiters']
  ])('ignores a metric left in the URL on the %s report', async (report, recent) => {
    renderPage(<AdminReportsPage />, { route: `/?report=${report}&metric=hired` });

    expect(await screen.findByRole('region', { name: recent })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /^Drilldown/ })).not.toBeInTheDocument();
  });

  it('closes the open card and forgets its search, filter, page and sort when a pill is chosen', async () => {
    renderPage(<AdminReportsPage />, {
      route: '/?range=7d&metric=hired&q=asha&filter=Madhapur&page=3&sort=hired_at&order=asc'
    });

    await userEvent.click(await screen.findByRole('tab', { name: 'Jobs Report' }));

    await waitFor(() => expect(routerLocation.search).toBe('?range=7d&report=jobs'));
    expect(screen.queryByRole('region', { name: /^Drilldown/ })).not.toBeInTheDocument();
  });

  it('goes back to the plain Overview when the Overview pill is chosen with a card open', async () => {
    renderPage(<AdminReportsPage />, { route: '/?range=7d&metric=hired&q=asha&page=2' });

    await userEvent.click(await screen.findByRole('tab', { name: 'Overview' }));

    await waitFor(() => expect(routerLocation.search).toBe('?range=7d'));
    expect(await screen.findByRole('region', { name: 'Hiring Trend' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /^Drilldown/ })).not.toBeInTheDocument();
  });

  it('starts an open card again at page 1 when the range changes, keeping the card and its search', async () => {
    renderPage(<AdminReportsPage />, { route: '/?metric=hired&q=asha&filter=Madhapur&page=3' });
    const menu = await screen.findByRole('combobox', { name: 'Date range' });

    await userEvent.selectOptions(menu, '7d');

    await waitFor(() =>
      expect(routerLocation.search).toBe('?metric=hired&q=asha&filter=Madhapur&range=7d')
    );
    expect(screen.getByRole('region', { name: 'Drilldown hired' })).toBeInTheDocument();
  });
});
