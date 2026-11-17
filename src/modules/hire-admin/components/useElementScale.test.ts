import { act, renderHook } from '@testing-library/react';
import { useElementScale } from './useElementScale';

function stubUnit(value: string) {
  return vi
    .spyOn(window, 'getComputedStyle')
    .mockReturnValue({ getPropertyValue: () => value } as unknown as CSSStyleDeclaration);
}

afterEach(() => vi.restoreAllMocks());

describe('useElementScale', () => {
  it('reads the unit from the element it is given', () => {
    const spy = stubUnit('1.0348px');
    const el = document.createElement('section');
    const { result } = renderHook(() => useElementScale(el));

    expect(result.current).toBe(1.0348);
    expect(spy).toHaveBeenCalledWith(el);
  });

  it('is 1 while there is no element yet', () => {
    const spy = stubUnit('1.5px');
    const { result } = renderHook(() => useElementScale(null));

    expect(result.current).toBe(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it('is 1 when the element has no scale or a value that is not a length', () => {
    const el = document.createElement('section');
    stubUnit('');
    expect(renderHook(() => useElementScale(el)).result.current).toBe(1);

    stubUnit('banana');
    expect(renderHook(() => useElementScale(el)).result.current).toBe(1);

    stubUnit('0px');
    expect(renderHook(() => useElementScale(el)).result.current).toBe(1);
  });

  it('follows the window when it is resized', () => {
    const spy = stubUnit('1px');
    const el = document.createElement('section');
    const { result } = renderHook(() => useElementScale(el));
    expect(result.current).toBe(1);

    spy.mockReturnValue({ getPropertyValue: () => '1.25px' } as unknown as CSSStyleDeclaration);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(1.25);
  });

  it('reads the new element when it changes', () => {
    stubUnit('0.9px');
    const first = document.createElement('section');
    const second = document.createElement('section');
    const { result, rerender } = renderHook(({ el }) => useElementScale(el), {
      initialProps: { el: null as Element | null }
    });
    expect(result.current).toBe(1);

    rerender({ el: first });
    expect(result.current).toBe(0.9);

    rerender({ el: second });
    expect(result.current).toBe(0.9);
  });
});
