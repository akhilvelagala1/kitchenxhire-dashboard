export type PagerItem = number | 'gap-start' | 'gap-end';

/**
 * Page buttons for a pager: the first and last page always, and a window around the current one.
 * On page 1 of 86 this is `1 2 3 4 5 … 86`.
 */
export function pagerItems(page: number, totalPages: number): PagerItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'gap-end', totalPages];
  if (page >= totalPages - 3) {
    return [
      1,
      'gap-start',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    ];
  }
  return [1, 'gap-start', page - 1, page, page + 1, 'gap-end', totalPages];
}
