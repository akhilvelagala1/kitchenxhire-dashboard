import { pagerItems } from './jobsPagerItems';

describe('pagerItems', () => {
  it('shows 1 2 3 4 5 … 86 on the first of 86 pages', () => {
    expect(pagerItems(1, 86)).toEqual([1, 2, 3, 4, 5, 'gap-end', 86]);
  });

  it('opens a window around a page in the middle', () => {
    expect(pagerItems(40, 86)).toEqual([1, 'gap-start', 39, 40, 41, 'gap-end', 86]);
  });

  it('shows the last five pages near the end', () => {
    expect(pagerItems(86, 86)).toEqual([1, 'gap-start', 82, 83, 84, 85, 86]);
  });

  it('lists every page when there are only a few', () => {
    expect(pagerItems(2, 3)).toEqual([1, 2, 3]);
    expect(pagerItems(1, 1)).toEqual([1]);
  });

  it('never repeats a page number or a gap marker', () => {
    for (const page of [1, 4, 5, 40, 83, 86]) {
      const items = pagerItems(page, 86);
      expect(new Set(items).size).toBe(items.length);
    }
  });
});
