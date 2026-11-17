import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListTabs } from './ListTabs';

type ListTab = Parameters<typeof ListTabs>[0]['tabs'][number];

const TABS: ListTab[] = [
  { key: 'all', label: 'All Recruiters', count: 12846 },
  { key: 'active', label: 'Active', count: 9120 },
  { key: 'inactive', label: 'Inactive', count: 3726 }
];

function renderTabs(active = 'all', tabs: readonly ListTab[] = TABS) {
  const onChange = vi.fn();
  render(
    <ListTabs tabs={tabs} active={active} onChange={onChange} ariaLabel="Recruiter status">
      <p>Tab content</p>
    </ListTabs>
  );
  return onChange;
}

describe('ListTabs', () => {
  it('names the tab list and each tab with its count in Indian digit grouping', () => {
    renderTabs();

    expect(screen.getByRole('tablist', { name: 'Recruiter status' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All Recruiters (12,846)' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('shows only the names while the counts are still loading', () => {
    renderTabs('all', [
      { key: 'all', label: 'All Recruiters' },
      { key: 'active', label: 'Active' }
    ]);

    expect(screen.getByRole('tab', { name: 'All Recruiters' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument();
  });

  it('shows a count of zero rather than leaving it out', () => {
    renderTabs('all', [{ key: 'all', label: 'All', count: 0 }]);

    expect(screen.getByRole('tab', { name: 'All (0)' })).toBeInTheDocument();
  });

  it('puts only the selected tab in the tab order and labels the panel with it', () => {
    renderTabs('active');

    expect(screen.getByRole('tab', { name: 'Active (9,120)' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'Active (9,120)' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Inactive (3,726)' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel', { name: 'Active (9,120)' })).toHaveTextContent(
      'Tab content'
    );
  });

  it('marks the active tab with the orange underline and the others without', () => {
    renderTabs('active');

    expect(screen.getByRole('tab', { name: 'Active (9,120)' })).toHaveClass(
      'border-b-2',
      'border-brand-600'
    );
    expect(screen.getByRole('tab', { name: 'Inactive (3,726)' })).toHaveClass('border-transparent');
  });

  it('scrolls the row sideways inside the card instead of wrapping', () => {
    renderTabs();

    expect(screen.getByRole('tablist')).toHaveClass('overflow-x-auto');
    expect(screen.getByRole('tab', { name: 'Active (9,120)' })).toHaveClass(
      'shrink-0',
      'whitespace-nowrap'
    );
  });

  it('chooses the tab that is clicked', async () => {
    const onChange = renderTabs();

    await userEvent.click(screen.getByRole('tab', { name: 'Inactive (3,726)' }));

    expect(onChange).toHaveBeenCalledWith('inactive');
  });

  it('moves to the next tab and focuses it with the right arrow', async () => {
    const onChange = renderTabs();
    screen.getByRole('tab', { name: 'All Recruiters (12,846)' }).focus();

    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('active');
    expect(screen.getByRole('tab', { name: 'Active (9,120)' })).toHaveFocus();
  });

  it('wraps from the first tab to the last with the left arrow', async () => {
    const onChange = renderTabs();
    screen.getByRole('tab', { name: 'All Recruiters (12,846)' }).focus();

    await userEvent.keyboard('{ArrowLeft}');

    expect(onChange).toHaveBeenCalledWith('inactive');
  });

  it('wraps from the last tab to the first with the right arrow', async () => {
    const onChange = renderTabs('inactive');
    screen.getByRole('tab', { name: 'Inactive (3,726)' }).focus();

    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('jumps to the last and first tab with End and Home', async () => {
    const onChange = renderTabs('active');
    screen.getByRole('tab', { name: 'Active (9,120)' }).focus();

    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('inactive');

    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('all');
  });

  it('ignores other keys', async () => {
    const onChange = renderTabs();
    screen.getByRole('tab', { name: 'All Recruiters (12,846)' }).focus();

    await userEvent.keyboard('a');

    expect(onChange).not.toHaveBeenCalled();
  });
});
