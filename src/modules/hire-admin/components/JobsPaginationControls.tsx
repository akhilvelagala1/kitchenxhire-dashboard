import { ListPager } from './ListPager';

/** Jobs footer pager — same labelled Previous / Next pattern as Applications. */
export function JobsPaginationControls({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange
}: {
  page: number;
  pageSize: number;
  total: number | undefined;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  return (
    <ListPager
      page={page}
      pageSize={pageSize}
      total={total}
      noun="jobs"
      labelledNav
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange ?? (() => undefined)}
    />
  );
}
