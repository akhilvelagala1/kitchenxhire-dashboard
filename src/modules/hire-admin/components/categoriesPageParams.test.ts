import { parseCategoriesSearchParams, toCategoriesListQuery } from './categoriesPageParams';

const parse = (query: string) => parseCategoriesSearchParams(new URLSearchParams(query));

describe('categories page params', () => {
  it('opens on page one with no search and every status', () => {
    expect(parse('')).toEqual({ q: '', status: 'all', page: 1 });
  });

  it('reads search, status and page', () => {
    expect(parse('q=cloud&status=inactive&page=3')).toEqual({
      q: 'cloud',
      status: 'inactive',
      page: 3
    });
  });

  it('falls back to the default for a value it does not know', () => {
    expect(parse('status=deleted&page=-4').status).toBe('all');
    expect(parse('status=deleted&page=-4').page).toBe(1);
    expect(parse('page=abc').page).toBe(1);
  });

  it('builds a request of five rows and leaves out empty filters', () => {
    expect(toCategoriesListQuery(parse(''))).toEqual({
      page: 1,
      page_size: 5,
      q: undefined,
      status: undefined
    });
    expect(toCategoriesListQuery(parse('q=bak&status=archived&page=2'))).toEqual({
      page: 2,
      page_size: 5,
      q: 'bak',
      status: 'archived'
    });
  });
});
