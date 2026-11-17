import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationsPager } from './ApplicationsPager';

function renderPager(page: number, pageSize: number, total: number | undefined) {
  const onPageChange = vi.fn();
  const onPageSizeChange = vi.fn();
  render(
    <ApplicationsPager
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
  return { onPageChange, onPageSizeChange };
}

describe('ApplicationsPager', () => {
  it('counts the rows on the first page with an en dash and Indian grouping', () => {
    renderPager(1, 10, 8672);

    expect(screen.getByText('Showing 1 – 10 of 8,672 applications')).toBeInTheDocument();
  });

  it('ends the count at the total on the last page', () => {
    renderPager(868, 10, 8672);

    expect(screen.getByText('Showing 8,671 – 8,672 of 8,672 applications')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Page 868' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('says there are none and hides the numbered pager for an empty list', () => {
    renderPager(1, 10, 0);

    expect(screen.getByText('Showing 0 applications')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('keeps the text and hides the numbered pager when everything fits on one page', () => {
    renderPager(1, 10, 4);

    expect(screen.getByText('Showing 1 – 4 of 4 applications')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  });

  it('shows no count and no numbered pager before the first list has arrived', () => {
    renderPager(1, 10, undefined);

    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows a window of pages around the current one with a gap on each side', () => {
    renderPager(40, 10, 8672);

    expect(screen.getAllByText('…')).toHaveLength(2);
    ['Page 1', 'Page 39', 'Page 40', 'Page 41', 'Page 868'].forEach((name) =>
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    );
  });

  it('asks for the page behind and the page after the current one', async () => {
    const { onPageChange } = renderPager(3, 10, 8672);

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Page 5' }));

    expect(onPageChange.mock.calls).toEqual([[2], [4], [5]]);
  });

  it('uses labelled Previous and Next and hides the rows-per-page picker', () => {
    renderPager(1, 10, 8672);

    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveTextContent('Previous');
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveTextContent('Next');
    expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  });
});
