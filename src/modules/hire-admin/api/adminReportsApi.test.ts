import { apiClient } from '@/shared/api/apiClient';
import type { ReportRange } from '../schemas/adminReports';
import {
  REPORT_KPI_KEYS,
  type ReportsExportDetail,
  type ReportsRecordsQuery
} from '../schemas/adminReportsDrilldown';
import { adminReportsApi } from './adminReportsApi';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn(), list: vi.fn(), post: vi.fn() }
}));

const api = vi.mocked(apiClient);
const BASE = '/hire/admin/reports';

/** What apiClient.list answers. The list functions must hand it back untouched. */
const PAGE = { items: [], meta: { page: 2, page_size: 10, total: 0 } };

/** What apiClient.get and apiClient.post answer. The functions must hand it back untouched. */
const ANSWER = { answer: 'from apiClient' };

/** A query as the screen builds it: the 90-day window, page 2 of 10, a search and a filter. */
const QUERY: ReportsRecordsQuery = {
  range: '90d',
  page: 2,
  pageSize: 10,
  search: 'cook',
  filter: 'chosen',
  sort: null,
  order: 'desc'
};

/** The four stat-card lists: their URL, the name their filter goes under, and one sort key. */
const LISTS = [
  {
    name: 'jobsPostedRecords',
    call: adminReportsApi.jobsPostedRecords,
    url: `${BASE}/overview/jobs`,
    filter: 'job_category',
    sort: 'applications_count'
  },
  {
    name: 'applicationRecords',
    call: adminReportsApi.applicationRecords,
    url: `${BASE}/overview/applications`,
    filter: 'status',
    sort: 'applied_at'
  },
  {
    name: 'hiredRecords',
    call: adminReportsApi.hiredRecords,
    url: `${BASE}/overview/hired`,
    filter: 'outlet',
    sort: 'hired_at'
  },
  {
    name: 'rejectedRecords',
    call: adminReportsApi.rejectedRecords,
    url: `${BASE}/overview/rejected`,
    filter: 'reason',
    sort: 'rejected_at'
  }
] as const;

/** The five report tabs, which each read one endpoint for the window. */
const TABS = [
  { name: 'overview', call: adminReportsApi.overview, path: 'overview' },
  { name: 'jobsReport', call: adminReportsApi.jobsReport, path: 'jobs' },
  { name: 'applicationsReport', call: adminReportsApi.applicationsReport, path: 'applications' },
  { name: 'usersReport', call: adminReportsApi.usersReport, path: 'users' },
  { name: 'recruitersReport', call: adminReportsApi.recruitersReport, path: 'recruiters' }
] as const;

const RANGES: ReportRange[] = ['7d', '30d', '90d'];

beforeEach(() => vi.resetAllMocks());

describe('adminReportsApi stat-card lists', () => {
  it.each(LISTS)(
    '$name asks $url for the window, the page, the search and its own filter',
    async ({ call, url, filter }) => {
      api.list.mockResolvedValue(PAGE);
      await call(QUERY);

      expect(api.list).toHaveBeenCalledTimes(1);
      expect(api.list).toHaveBeenCalledWith(url, {
        range: '90d',
        page: 2,
        page_size: 10,
        search: 'cook',
        [filter]: 'chosen'
      });
    }
  );

  it.each(LISTS)('$name leaves sort and order out while no sort is set', async ({ call }) => {
    api.list.mockResolvedValue(PAGE);
    await call({ ...QUERY, sort: null, order: 'asc' });

    const sent = api.list.mock.calls[0]?.[1];
    expect(sent?.sort).toBeUndefined();
    expect(sent?.order).toBeUndefined();
  });

  it.each(LISTS)(
    '$name sends the sort and its order once a sort is set',
    async ({ call, url, filter, sort }) => {
      api.list.mockResolvedValue(PAGE);
      const rest = {
        range: '90d',
        page: 2,
        page_size: 10,
        search: 'cook',
        [filter]: 'chosen',
        sort
      };

      await call({ ...QUERY, sort, order: 'asc' });
      expect(api.list).toHaveBeenLastCalledWith(url, { ...rest, order: 'asc' });

      await call({ ...QUERY, sort, order: 'desc' });
      expect(api.list).toHaveBeenLastCalledWith(url, { ...rest, order: 'desc' });
    }
  );

  it.each(LISTS)('$name hands back the page apiClient answers', async ({ call }) => {
    api.list.mockResolvedValue(PAGE);

    await expect(call(QUERY)).resolves.toBe(PAGE);
  });
});

describe('adminReportsApi time to hire and filter options', () => {
  it.each(RANGES)('timeToHire asks for the %s window and hands back the answer', async (range) => {
    api.get.mockResolvedValue(ANSWER);

    await expect(adminReportsApi.timeToHire(range)).resolves.toBe(ANSWER);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(`${BASE}/overview/time-to-hire`, { range });
  });

  it('filterOptions asks with no parameters and hands back the answer', async () => {
    api.get.mockResolvedValue(ANSWER);

    await expect(adminReportsApi.filterOptions()).resolves.toBe(ANSWER);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(`${BASE}/overview/filter-options`);
  });
});

describe('adminReportsApi report tabs', () => {
  it.each(TABS)('$name asks /hire/admin/reports/$path for the window', async ({ call, path }) => {
    api.get.mockResolvedValue(ANSWER);

    await expect(call('7d')).resolves.toBe(ANSWER);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(`${BASE}/${path}`, { range: '7d' });
  });
});

describe('adminReportsApi.exportOverview', () => {
  /** Starts an export and returns the body that was posted. */
  async function postedBody(range: ReportRange, detail?: ReportsExportDetail) {
    api.post.mockResolvedValue(ANSWER);
    await adminReportsApi.exportOverview(range, detail);
    return api.post.mock.calls[0]?.[1];
  }

  it('posts to the exports endpoint and hands back the job apiClient answers', async () => {
    api.post.mockResolvedValue(ANSWER);

    await expect(adminReportsApi.exportOverview('30d')).resolves.toBe(ANSWER);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post.mock.calls[0]?.[0]).toBe(`${BASE}/exports`);
  });

  it.each(RANGES)('posts exactly { range } with no card open, for %s', async (range) => {
    expect(await postedBody(range)).toStrictEqual({ range });
  });

  it.each(REPORT_KPI_KEYS)(
    'posts { range, metric } for the %s card with nothing typed or chosen',
    async (metric) => {
      const body = await postedBody('30d', { metric, search: '', filter: '' });

      expect(body).toStrictEqual({ range: '30d', metric });
    }
  );

  it('posts { range, metric, search, filter } when both were typed and chosen', async () => {
    const body = await postedBody('90d', {
      metric: 'hired',
      search: 'rahul',
      filter: 'Urban Bites'
    });

    expect(body).toStrictEqual({
      range: '90d',
      metric: 'hired',
      search: 'rahul',
      filter: 'Urban Bites'
    });
  });

  it('posts only the search when no filter is chosen', async () => {
    const body = await postedBody('7d', { metric: 'applications', search: 'priya', filter: '' });

    expect(body).toStrictEqual({ range: '7d', metric: 'applications', search: 'priya' });
  });

  it('posts only the filter when nothing is typed in the search', async () => {
    const body = await postedBody('7d', {
      metric: 'rejected',
      search: '',
      filter: 'Skills not matched'
    });

    expect(body).toStrictEqual({ range: '7d', metric: 'rejected', filter: 'Skills not matched' });
  });
});
