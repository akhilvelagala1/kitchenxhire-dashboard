import { parseApplicationsSearchParams, toApplicationsListQuery } from './applicationsPageParams';

const parse = (query: string) => parseApplicationsSearchParams(new URLSearchParams(query));

describe('parseApplicationsSearchParams', () => {
  it('opens on page one with the ten newest applications and no filter set', () => {
    expect(parse('')).toMatchObject({
      tab: 'all',
      status: 'all',
      page: 1,
      page_size: 10,
      sort: 'applied_at',
      order: 'desc'
    });
  });

  it('falls back to the default when the URL holds a value it does not know', () => {
    const p = parse('tab=pending&status=lost&sort=salary&page=-3&page_size=7');
    expect(p).toMatchObject({
      tab: 'all',
      status: 'all',
      sort: 'applied_at',
      page: 1,
      page_size: 10
    });
  });

  it('keeps a page size from the URL and the filters the URL carries', () => {
    const p = parse('page_size=20&tab=hired&status=rejected&job_id=J1&search=rahul&order=asc');
    expect(p).toMatchObject({
      page_size: 20,
      tab: 'hired',
      status: 'rejected',
      job_id: 'J1',
      search: 'rahul',
      order: 'asc'
    });
  });
});

describe('the job and recruiter labels', () => {
  it('are read for the filter boxes but never sent in the list request', () => {
    const p = parse('job_id=J1&job_label=Cook%20%2F%20Chef&recruiter_id=R2&recruiter_label=Rahul');
    expect(p).toMatchObject({ job_label: 'Cook / Chef', recruiter_label: 'Rahul' });
    expect(toApplicationsListQuery(p)).not.toHaveProperty('job_label');
    expect(toApplicationsListQuery(p)).not.toHaveProperty('recruiter_label');
  });
});

describe('toApplicationsListQuery', () => {
  it('leaves the "all" tab and status out of the request', () => {
    const q = toApplicationsListQuery(parse(''));
    expect(q.tab).toBeUndefined();
    expect(q.status).toBeUndefined();
    expect(q).toMatchObject({ page: 1, page_size: 10, sort: 'applied_at', order: 'desc' });
  });

  it('sends the chosen tab, status and entity filters', () => {
    const q = toApplicationsListQuery(
      parse('tab=shortlisted&status=hired&job_id=J1&recruiter_id=R2&location=Hyderabad')
    );
    expect(q).toMatchObject({
      tab: 'shortlisted',
      status: 'hired',
      job_id: 'J1',
      recruiter_id: 'R2',
      location: 'Hyderabad'
    });
  });
});
