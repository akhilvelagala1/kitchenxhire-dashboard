import { parseBusinessesSearchParams, toBusinessesListQuery } from './businessesPageParams';

const parse = (query: string) => parseBusinessesSearchParams(new URLSearchParams(query));

describe('businesses page params', () => {
  it('opens on page one, newest first, ten rows, with no filter set', () => {
    expect(parse('')).toMatchObject({
      tab: 'all',
      status: 'all',
      business_type: 'all',
      verification: 'all',
      joined: 'all',
      page: 1,
      page_size: 10,
      sort: 'joined_at',
      order: 'desc'
    });
  });

  it('falls back to the default for a value it does not know', () => {
    expect(
      parse(
        'tab=pending&status=gone&business_type=Cafe&verification=maybe&joined=1y&page=-2&page_size=7'
      )
    ).toMatchObject({
      tab: 'all',
      status: 'all',
      business_type: 'all',
      verification: 'all',
      joined: 'all',
      page: 1,
      page_size: 10
    });
  });

  it('keeps Any time when the URL says so, and sends the chosen filters', () => {
    const p = parse(
      'joined=all&business_type=Warehouse&status=under_review&verification=pending&city=Hyderabad&tab=active'
    );
    expect(p.joined).toBe('all');
    expect(toBusinessesListQuery(p)).toMatchObject({
      joined: undefined,
      business_type: 'Warehouse',
      status: 'under_review',
      verification: 'pending',
      city: 'Hyderabad',
      tab: 'active'
    });
  });

  it('leaves the "all" filters out of the request', () => {
    expect(toBusinessesListQuery(parse(''))).toMatchObject({
      tab: undefined,
      status: undefined,
      business_type: undefined,
      verification: undefined,
      joined: undefined
    });
  });
});
