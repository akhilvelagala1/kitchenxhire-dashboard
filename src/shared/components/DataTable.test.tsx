import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { DataTable, type Column } from './DataTable';

interface Row {
  id: string;
  name: string;
}

const columns: Column<Row>[] = [
  { id: 'name', header: 'Name', sortKey: 'name', cell: (r) => r.name }
];
const rows: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' }
];
const pagination = {
  page: 1,
  pageSize: 25,
  total: 2,
  onPageChange: () => {},
  onPageSizeChange: () => {}
};

function Table(props: Partial<Parameters<typeof DataTable<Row>>[0]>) {
  const selection = useRowSelection();
  return (
    <DataTable<Row>
      caption="People"
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      isLoading={false}
      error={undefined}
      onRetry={() => {}}
      empty={{ title: 'Nothing here' }}
      selection={selection}
      pagination={pagination}
      {...props}
    />
  );
}

describe('DataTable', () => {
  it('defaults to comfortable rows inside its own frame, with the built-in pager', () => {
    const { container } = render(<Table />);

    expect(screen.getByRole('table', { name: 'People' })).toHaveAttribute(
      'data-density',
      'comfortable'
    );
    expect(container.firstElementChild).toHaveClass('border');
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('marks the table compact and drops its frame when it sits inside a card', () => {
    const { container } = render(<Table density="compact" framed={false} />);

    expect(screen.getByRole('table', { name: 'People' })).toHaveAttribute(
      'data-density',
      'compact'
    );
    expect(container.firstElementChild).not.toHaveClass('border');
  });

  it('draws no pager when the caller supplies none', () => {
    render(<Table pagination={undefined} />);

    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });

  it('selects a row from its checkbox in both densities', async () => {
    const { unmount } = render(<Table />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row a' }));
    expect(screen.getByRole('checkbox', { name: 'Select row a' })).toBeChecked();
    unmount();

    render(<Table density="compact" />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(screen.getByRole('checkbox', { name: 'Select row b' })).toBeChecked();
  });

  it('keeps the sort button reachable by name on a compact table', async () => {
    const onChange = vi.fn();
    render(<Table density="compact" sort={{ key: undefined, order: undefined, onChange }} />);

    await userEvent.click(screen.getByRole('button', { name: 'Name' }));

    expect(onChange).toHaveBeenCalledWith('name', 'asc');
  });
});
