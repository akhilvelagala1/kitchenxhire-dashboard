import { parseJobSeekersSearchParams, toJobSeekersListQuery } from './jobSeekersPageParams';
import { parseRecruitersSearchParams, toRecruitersListQuery } from './recruitersPageParams';

const recruiters = (query: string) => parseRecruitersSearchParams(new URLSearchParams(query));
const jobSeekers = (query: string) => parseJobSeekersSearchParams(new URLSearchParams(query));

describe('recruiters page params', () => {
  it('opens on page one, newest login first, ten rows, with no filter set', () => {
    expect(recruiters('')).toMatchObject({
      tab: 'all',
      status: 'all',
      business_type: 'all',
      joined: 'all',
      page: 1,
      page_size: 10,
      sort: 'last_login_at',
      order: 'desc'
    });
  });

  it('falls back to the default for a value it does not know', () => {
    expect(
      recruiters(
        'tab=applications&status=gone&business_type=Cafe&joined=1y&page=0&page_size=7&sort=x'
      )
    ).toMatchObject({
      tab: 'all',
      status: 'all',
      business_type: 'all',
      joined: 'all',
      page: 1,
      page_size: 10,
      sort: 'last_login_at'
    });
  });

  it('leaves the "all" filters out of the request and sends the chosen ones', () => {
    expect(toRecruitersListQuery(recruiters(''))).toMatchObject({
      tab: undefined,
      status: undefined,
      business_type: undefined,
      joined: undefined
    });
    expect(
      toRecruitersListQuery(
        recruiters('tab=active&status=pending&business_type=Food%20Court&city=Hyderabad&joined=30d')
      )
    ).toMatchObject({
      tab: 'active',
      status: 'pending',
      business_type: 'Food Court',
      city: 'Hyderabad',
      joined: '30d'
    });
  });
});

describe('job seekers page params', () => {
  it('opens on page one, newest activity first, ten rows, with no filter set', () => {
    expect(jobSeekers('')).toMatchObject({
      tab: 'all',
      status: 'all',
      experience: 'all',
      joined: 'all',
      page: 1,
      page_size: 10,
      sort: 'last_active_at',
      order: 'desc'
    });
  });

  it('falls back to the default for a value it does not know', () => {
    expect(jobSeekers('tab=applications&experience=9&sort=salary&page_size=3')).toMatchObject({
      tab: 'all',
      experience: 'all',
      sort: 'last_active_at',
      page_size: 10
    });
  });

  it('keeps an experience band and status, and sends them in the request', () => {
    expect(
      toJobSeekersListQuery(
        jobSeekers('tab=active&experience=6%2B&status=under_review&page_size=20')
      )
    ).toMatchObject({
      tab: 'active',
      experience: '6+',
      status: 'under_review',
      page_size: 20
    });
  });
});
