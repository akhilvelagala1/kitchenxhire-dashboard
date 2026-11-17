import { apiClient } from '@/shared/api/apiClient';
import {
  REPORTS_SORT_KEYS,
  type ReportsApplicationRow,
  type ReportsFilterOptions,
  type ReportsHiredRow,
  type ReportsJobRow,
  type ReportsRecordsQuery,
  type ReportsRejectedRow
} from '../schemas/adminReportsDrilldown';
import {
  APPLICATIONS_CONFIG,
  HIRED_CONFIG,
  JOBS_POSTED_CONFIG,
  REJECTED_CONFIG
} from './reportsRecordsConfig';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { list: vi.fn() } }));

const list = vi.mocked(apiClient.list);

beforeEach(() => vi.resetAllMocks());

const OPTIONS: ReportsFilterOptions = {
  job_categories: ['Cook / Chef', 'Kitchen Helper'],
  outlets: ['Spice Bowl Restaurant', 'Biryani House'],
  rejection_reasons: ['Experience does not match', 'Salary expectation too high']
};

const QUERY: ReportsRecordsQuery = {
  range: '30d',
  page: 2,
  pageSize: 5,
  search: 'cook',
  filter: 'Spice Bowl Restaurant',
  sort: null,
  order: 'asc'
};

const JOB: ReportsJobRow = {
  job_id: 'JOB-1024',
  title: 'Cook / Chef',
  recruiter_name: 'Rahul Verma',
  outlet_name: 'Spice Bowl Restaurant',
  posted_at: '2026-06-24T10:24:00+05:30',
  applications_count: 12
};

const APPLICATION: ReportsApplicationRow = {
  application_id: 'APP-9421',
  candidate_name: 'Priya Sharma',
  job_title: 'Cook / Chef',
  outlet_name: 'Spice Bowl Restaurant',
  applied_at: '2026-06-24T10:24:00+05:30',
  status: 'shortlisted'
};

const HIRED: ReportsHiredRow = {
  application_id: 'APP-9300',
  candidate_id: 'JS-2041',
  candidate_name: 'Anil Kumar Reddy',
  job_title: 'Kitchen Helper',
  recruiter_name: 'Meena Rao',
  outlet_name: 'Biryani House',
  hired_at: '2026-06-23T20:00:00Z'
};

const REJECTED: ReportsRejectedRow = {
  application_id: 'APP-9188',
  candidate_name: 'Rahul Kumar',
  job_title: 'Bakery Assistant',
  outlet_name: 'Sweet Crumbs',
  rejected_at: '2026-06-22T09:00:00+05:30',
  rejection_reason: null
};

/** The three lists whose filter is made of names that come from the data. */
const NAME_FILTERS = [
  { name: 'Jobs Posted', config: JOBS_POSTED_CONFIG, names: OPTIONS.job_categories },
  { name: 'Hired', config: HIRED_CONFIG, names: OPTIONS.outlets },
  { name: 'Rejected', config: REJECTED_CONFIG, names: OPTIONS.rejection_reasons }
];

describe('the filter of each list', () => {
  it.each(NAME_FILTERS)('$name offers the loaded names, each as its own value and label', (c) => {
    expect(c.config.filterChoices(OPTIONS)).toEqual(
      c.names.map((name) => ({ value: name, label: name }))
    );
  });

  it.each(NAME_FILTERS)('$name offers nothing until the filter options have loaded', (c) => {
    expect(c.config.filterChoices(undefined)).toEqual([]);
  });

  it('offers the six application statuses by their labels, loaded options or not', () => {
    const statuses = [
      { value: 'pending_review', label: 'Pending Review' },
      { value: 'reviewed', label: 'Reviewed' },
      { value: 'shortlisted', label: 'Shortlisted' },
      { value: 'interview_scheduled', label: 'Interview Scheduled' },
      { value: 'hired', label: 'Hired' },
      { value: 'rejected', label: 'Rejected' }
    ];

    expect(APPLICATIONS_CONFIG.filterChoices(undefined)).toEqual(statuses);
    expect(APPLICATIONS_CONFIG.filterChoices(OPTIONS)).toEqual(statuses);
  });
});

describe('the copy of each list', () => {
  const COPY = [
    {
      config: JOBS_POSTED_CONFIG,
      expected: {
        metric: 'jobs_posted',
        title: 'Jobs Posted',
        description:
          'All jobs created by recruiters (restaurants / outlets) in the selected period.',
        noun: 'jobs',
        searchPlaceholder: 'Search jobs...',
        filterAllLabel: 'All Jobs',
        emptyTitle: 'No jobs found'
      }
    },
    {
      config: APPLICATIONS_CONFIG,
      expected: {
        metric: 'applications',
        title: 'Applications',
        description: 'All job applications submitted by users in the selected period.',
        noun: 'applications',
        searchPlaceholder: 'Search applications...',
        filterAllLabel: 'All Status',
        emptyTitle: 'No applications found'
      }
    },
    {
      config: HIRED_CONFIG,
      expected: {
        metric: 'hired',
        title: 'Hired Candidates',
        description: 'Users who have been hired by recruiters in the selected period.',
        noun: 'hired candidates',
        searchPlaceholder: 'Search hired candidates...',
        filterAllLabel: 'All Outlets',
        emptyTitle: 'No hired candidates found'
      }
    },
    {
      config: REJECTED_CONFIG,
      expected: {
        metric: 'rejected',
        title: 'Rejected Applications',
        description: 'Applications that were not selected by recruiters in the selected period.',
        noun: 'rejected applications',
        searchPlaceholder: 'Search rejected applications...',
        filterAllLabel: 'All Reasons',
        emptyTitle: 'No rejected applications found'
      }
    }
  ];

  it.each(COPY)('$expected.title carries the words of the picture', (c) => {
    expect(c.config).toMatchObject(c.expected);
  });

  it.each(COPY)('$expected.title sorts by exactly the keys the server accepts for it', (c) => {
    const sortKeys = (columns: { sortKey?: string }[]) =>
      columns.flatMap((column) => column.sortKey ?? []);

    expect(sortKeys(c.config.columns)).toEqual(REPORTS_SORT_KEYS[c.config.metric]);
  });
});

describe('fetch of each list', () => {
  const ENDPOINTS = [
    {
      name: 'Jobs Posted',
      config: JOBS_POSTED_CONFIG,
      url: '/hire/admin/reports/overview/jobs',
      filterParam: 'job_category'
    },
    {
      name: 'Applications',
      config: APPLICATIONS_CONFIG,
      url: '/hire/admin/reports/overview/applications',
      filterParam: 'status'
    },
    {
      name: 'Hired',
      config: HIRED_CONFIG,
      url: '/hire/admin/reports/overview/hired',
      filterParam: 'outlet'
    },
    {
      name: 'Rejected',
      config: REJECTED_CONFIG,
      url: '/hire/admin/reports/overview/rejected',
      filterParam: 'reason'
    }
  ];

  it.each(ENDPOINTS)('$name fetches from its own endpoint with the whole query', async (e) => {
    const page = { items: [], meta: { page: 2, page_size: 5, total: 0 } };
    list.mockResolvedValue(page);
    const sort = REPORTS_SORT_KEYS[e.config.metric][0];

    const result = await e.config.fetch({ ...QUERY, sort });

    expect(list).toHaveBeenCalledOnce();
    expect(list).toHaveBeenCalledWith(e.url, {
      range: '30d',
      page: 2,
      page_size: 5,
      search: 'cook',
      [e.filterParam]: 'Spice Bowl Restaurant',
      sort,
      order: 'asc'
    });
    expect(result).toBe(page);
  });
});

describe('getRowId of each list', () => {
  it('keys a job by its job id and every other row by its application id', () => {
    expect(JOBS_POSTED_CONFIG.getRowId(JOB)).toBe('JOB-1024');
    expect(APPLICATIONS_CONFIG.getRowId(APPLICATION)).toBe('APP-9421');
    expect(REJECTED_CONFIG.getRowId(REJECTED)).toBe('APP-9188');
  });

  it('gives two hires of the same candidate different row ids', () => {
    const hiredAgain: ReportsHiredRow = { ...HIRED, application_id: 'APP-9777' };

    expect(HIRED_CONFIG.getRowId(HIRED)).toBe('APP-9300');
    expect(HIRED_CONFIG.getRowId(hiredAgain)).toBe('APP-9777');
  });
});
