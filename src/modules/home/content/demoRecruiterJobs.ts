/**
 * Recruiter job postings used for filters and the Jobs Posted metric (prototype).
 * Each seed job carries realistic mock category/openings/postedAt/status values
 * so the Jobs Posted table renders populated, mockup-matching rows.
 */
export const DEMO_RECRUITER_JOBS = [
  {
    id: 'rec-job-1',
    title: 'Cook / Chef',
    category: 'Kitchen',
    openings: 2,
    postedAt: '2026-11-10T09:00:00.000Z',
    status: 'Active'
  },
  {
    id: 'rec-job-2',
    title: 'Kitchen Helper',
    category: 'Kitchen',
    openings: 3,
    postedAt: '2026-11-10T09:30:00.000Z',
    status: 'Active'
  },
  {
    id: 'rec-job-3',
    title: 'Waiter / Service Staff',
    category: 'Service',
    openings: 3,
    postedAt: '2026-11-09T10:00:00.000Z',
    status: 'Pending'
  },
  {
    id: 'rec-job-4',
    title: 'Bakery Staff',
    category: 'Bakery',
    openings: 1,
    postedAt: '2026-11-09T11:00:00.000Z',
    status: 'Active'
  },
  {
    id: 'rec-job-5',
    title: 'Cleaning / Stewarding',
    category: 'Service',
    openings: 3,
    postedAt: '2026-11-08T08:00:00.000Z',
    status: 'Closed'
  },
  {
    id: 'rec-job-6',
    title: 'South Indian Cook',
    category: 'Kitchen',
    openings: 2,
    postedAt: '2026-11-07T09:00:00.000Z',
    status: 'Active'
  },
  {
    id: 'rec-job-7',
    title: 'Tandoor Chef',
    category: 'Kitchen',
    openings: 1,
    postedAt: '2026-11-06T09:00:00.000Z',
    status: 'Active'
  },
  {
    id: 'rec-job-8',
    title: 'Commis Chef',
    category: 'Kitchen',
    openings: 2,
    postedAt: '2026-11-05T09:00:00.000Z',
    status: 'Pending'
  },
  {
    id: 'rec-job-9',
    title: 'Pastry Assistant',
    category: 'Bakery',
    openings: 1,
    postedAt: '2026-11-04T09:00:00.000Z',
    status: 'Active'
  },
  {
    id: 'rec-job-10',
    title: 'Store Supervisor',
    category: 'Service',
    openings: 1,
    postedAt: '2026-11-03T09:00:00.000Z',
    status: 'Active'
  },
  {
    id: 'rec-job-11',
    title: 'Cashier / Counter Staff',
    category: 'Service',
    openings: 2,
    postedAt: '2026-11-02T09:00:00.000Z',
    status: 'Closed'
  },
  {
    id: 'rec-job-12',
    title: 'Delivery Coordinator',
    category: 'Delivery',
    openings: 2,
    postedAt: '2026-11-01T09:00:00.000Z',
    status: 'Active'
  }
] as const;
