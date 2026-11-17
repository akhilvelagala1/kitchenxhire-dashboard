import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListPager } from './ListPager';

function renderPager(
  page: number,
  pageSize: number,
  total: number | undefined,
  noun = 'recruiters'
) {
  const onPageChange = vi.fn();
  const onPageSizeChange = vi.fn();
  render(
    <ListPager
      page={page}
      pageSize={pageSize}
      total={total}
      noun={noun}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
  return { onPageChange, onPageSizeChange };
}

describe('ListPager', () => {
  it('counts the rows on the first page with an en dash and Indian grouping', () => {
    renderPager(1, 5, 12846);

    expect(screen.getByText('Showing 1 – 5 of 12,846 recruiters')).toBeInTheDocument();
  });

  it('uses the noun it is given in the count and the navigation name', () => {
    renderPager(1, 5, 8672, 'job seekers');

    expect(screen.getByText('Showing 1 – 5 of 8,672 job seekers')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Job seekers pagination' })).toBeInTheDocument();
  });

  it('ends the count at the total on the last page', () => {
    renderPager(1735, 5, 8672);

    expect(screen.getByText('Showing 8,671 – 8,672 of 8,672 recruiters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Page 1,735' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('disables the previous button on the first page', () => {
    renderPager(1, 5, 8672);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  });

  it('says there are none and hides the numbered pager for an empty list', () => {
    renderPager(1, 5, 0);

    expect(screen.getByText('Showing 0 recruiters')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('keeps the text and hides the numbered pager when everything fits on one page', () => {
    renderPager(1, 10, 4);

    expect(screen.getByText('Showing 1 – 4 of 4 recruiters')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeInTheDocument();
  });

  it('shows no count and no numbered pager before the first list has arrived', () => {
    renderPager(1, 5, undefined);

    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeInTheDocument();
  });

  it('shows a window of pages around the current one with a gap on each side', () => {
    renderPager(40, 5, 8672);

    expect(screen.getAllByText('…')).toHaveLength(2);
    ['Page 1', 'Page 39', 'Page 40', 'Page 41', 'Page 1,735'].forEach((name) =>
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    );
  });

  it('makes the buttons 44px tall below lg and 34 design pixels from lg', () => {
    renderPager(3, 5, 8672);

    for (const name of ['Previous page', 'Next page', 'Page 3']) {
      expect(screen.getByRole('button', { name })).toHaveClass(
        'h-11',
        'min-w-11',
        'lg:h-8.5',
        'lg:min-w-8.5'
      );
    }
  });

  it('asks for the page behind and the page after the current one', async () => {
    const { onPageChange } = renderPager(3, 5, 8672);

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Page 5' }));

    expect(onPageChange.mock.calls).toEqual([[2], [4], [5]]);
  });

  it('offers 5, 10, 20 and 50 rows per page and reports the chosen size as a number', async () => {
    const { onPageSizeChange } = renderPager(1, 5, 8672);

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '5 / page',
      '10 / page',
      '20 / page',
      '50 / page'
    ]);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '50');

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
