import { ListPager } from './ListPager';

/** The footer row of the applications table, on the shared ListPager. */
export function ApplicationsPager({
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
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <ListPager
      page={page}
      pageSize={pageSize}
      total={total}
      noun="applications"
      labelledNav
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
