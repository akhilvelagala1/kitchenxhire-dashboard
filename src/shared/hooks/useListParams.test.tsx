import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { useListParams } from './useListParams';

const wrap = (route: string) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  };

describe('useListParams', () => {
  it('reads paging, sort and custom filters from the URL', () => {
    const { result } = renderHook(() => useListParams(), {
      wrapper: wrap('/?page=3&page_size=50&sort=name&order=desc&status=ACTIVE')
    });
    expect(result.current.query).toMatchObject({
      page: 3,
      page_size: 50,
      sort: 'name',
      order: 'desc',
      status: 'ACTIVE'
    });
    expect(result.current.filters).toEqual({ status: 'ACTIVE' });
  });

  it('falls back to safe defaults for invalid page values', () => {
    const { result } = renderHook(() => useListParams(), {
      wrapper: wrap('/?page=-1&page_size=9999')
    });
    expect(result.current.query).toMatchObject({ page: 1, page_size: 25 });
  });

  it('returns to page 1 when a filter changes', () => {
    const { result } = renderHook(() => useListParams(), { wrapper: wrap('/?page=4') });
    act(() => result.current.setFilter('status', 'INACTIVE'));
    expect(result.current.query.page).toBe(1);
    expect(result.current.query.status).toBe('INACTIVE');
  });
});
