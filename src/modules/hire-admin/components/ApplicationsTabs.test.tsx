import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationsTabs } from './ApplicationsTabs';

const COUNTS = {
  all: 8672,
  reviewed: 6142,
  shortlisted: 1460,
  interview_scheduled: 642,
  hired: 428,
  rejected: 856
};

function renderTabs(active: 'all' | 'reviewed' | 'rejected' = 'all') {
  const onChange = vi.fn();
  render(
    <ApplicationsTabs active={active} counts={COUNTS} onChange={onChange}>
      <p>Tab content</p>
    </ApplicationsTabs>
  );
  return onChange;
}

describe('ApplicationsTabs', () => {
  it('names each tab with its count in Indian digit grouping', () => {
    renderTabs();

    expect(screen.getByRole('tab', { name: 'All Applications (8,672)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Interview Scheduled (642)' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(6);
  });

  it('shows only the names while the counts are still loading', () => {
    render(
      <ApplicationsTabs active="all" counts={undefined} onChange={vi.fn()}>
        <p>Tab content</p>
      </ApplicationsTabs>
    );

    expect(screen.getByRole('tab', { name: 'All Applications' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Hired' })).toBeInTheDocument();
  });

  it('puts only the selected tab in the tab order and labels the panel with it', () => {
    renderTabs('reviewed');

    expect(screen.getByRole('tab', { name: 'Reviewed (6,142)' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Hired (428)' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel', { name: 'Reviewed (6,142)' })).toHaveTextContent(
      'Tab content'
    );
  });

  it('chooses the tab that is clicked', async () => {
    const onChange = renderTabs();

    await userEvent.click(screen.getByRole('tab', { name: 'Hired (428)' }));

    expect(onChange).toHaveBeenCalledWith('hired');
  });

  it('moves to the next tab and focuses it with the right arrow', async () => {
    const onChange = renderTabs();
    screen.getByRole('tab', { name: 'All Applications (8,672)' }).focus();

    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('reviewed');
    expect(screen.getByRole('tab', { name: 'Reviewed (6,142)' })).toHaveFocus();
  });

  it('wraps from the first tab to the last with the left arrow', async () => {
    const onChange = renderTabs();
    screen.getByRole('tab', { name: 'All Applications (8,672)' }).focus();

    await userEvent.keyboard('{ArrowLeft}');

    expect(onChange).toHaveBeenCalledWith('rejected');
  });

  it('wraps from the last tab to the first with the right arrow', async () => {
    const onChange = renderTabs('rejected');
    screen.getByRole('tab', { name: 'Rejected (856)' }).focus();

    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('jumps to the last and first tab with End and Home', async () => {
    const onChange = renderTabs('reviewed');
    screen.getByRole('tab', { name: 'Reviewed (6,142)' }).focus();

    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('rejected');

    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('all');
  });

  it('ignores other keys', async () => {
    const onChange = renderTabs();
    screen.getByRole('tab', { name: 'All Applications (8,672)' }).focus();

    await userEvent.keyboard('a');

    expect(onChange).not.toHaveBeenCalled();
  });
});
