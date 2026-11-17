import { render, screen, within } from '@testing-library/react';
import { ReportsRankList } from './ReportsRankList';

const ROWS = [
  { label: 'Cook / Chef', count: 400 },
  { label: 'Kitchen Helper', count: 100 },
  { label: 'Others', count: 0 }
];

function renderList(total: number) {
  render(
    <ReportsRankList
      variant="category"
      rows={ROWS}
      total={total}
      renderIcon={() => <svg aria-hidden />}
    />
  );
  return within(screen.getByRole('list')).getAllByRole('listitem');
}

describe('ReportsRankList', () => {
  it('shows each name with its count and its share of the total it is given', () => {
    const rows = renderList(1000);

    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText('Cook / Chef')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('400')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('(40.0%)')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('(10.0%)')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('(0.0%)')).toBeInTheDocument();
  });

  it('shows 0.0% instead of a broken number when the total is zero', () => {
    renderList(0);

    expect(screen.getAllByText('(0.0%)')).toHaveLength(3);
  });

  it('draws each bar as its count over the largest count and hides the bars from screen readers', () => {
    const rows = renderList(1000);

    const widths = rows.map(
      (row) => row.querySelector<HTMLElement>('[aria-hidden="true"] > span')?.style.width
    );
    expect(widths).toEqual(['100%', '25%', '0%']);
  });

  it('gives every name a title so a cut-off name can still be read', () => {
    renderList(1000);

    expect(screen.getByTitle('Kitchen Helper')).toHaveTextContent('Kitchen Helper');
  });
});
