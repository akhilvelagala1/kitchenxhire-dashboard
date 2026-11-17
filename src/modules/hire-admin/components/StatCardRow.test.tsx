import { Briefcase, Users } from 'lucide-react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatCardRow, type StatCard } from './StatCardRow';

const CARDS: StatCard[] = [
  {
    key: 'total',
    label: 'Total Recruiters',
    value: 12846,
    growth: 7,
    icon: Users,
    card: 'border-[#FFD9CB] bg-[#FFF4EF]',
    badge: 'bg-[#FFE3D6] text-brand-600'
  },
  {
    key: 'hiring',
    label: 'Recruiters Currently Hiring With A Very Long Label That Must Wrap',
    value: 342,
    growth: -4,
    icon: Briefcase,
    card: 'border-[#CFE0FF] bg-[#F1F6FF]',
    badge: 'bg-[#DCE8FF] text-[#1A5FB8]'
  }
];

function renderRow(overrides: Partial<Parameters<typeof StatCardRow>[0]> = {}) {
  const onRetry = vi.fn();
  render(
    <StatCardRow
      cards={CARDS}
      isLoading={false}
      isError={false}
      onRetry={onRetry}
      countNoun="recruiters"
      {...overrides}
    />
  );
  return onRetry;
}

describe('StatCardRow', () => {
  it('names each card with its label and count in Indian digit grouping', () => {
    renderRow();

    expect(
      screen.getByRole('group', { name: 'Total Recruiters, 12,846 recruiters' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(2);
  });

  it('draws plain cards, not buttons', () => {
    renderRow();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the label above the number and the growth under it', () => {
    renderRow();
    const card = screen.getByRole('group', { name: 'Total Recruiters, 12,846 recruiters' });
    const text = card.textContent ?? '';

    expect(text.indexOf('Total Recruiters')).toBeLessThan(text.indexOf('12,846'));
    expect(text.indexOf('12,846')).toBeLessThan(text.indexOf('+7%'));
    expect(within(card).getByText('vs last month')).toBeInTheDocument();
  });

  it('shows positive growth in green with a plus sign', () => {
    renderRow();
    const growth = screen.getByText('+7%');

    expect(growth).toHaveClass('text-[#0F7A3A]');
  });

  it('shows negative growth in red without a second minus sign', () => {
    renderRow();
    const growth = screen.getByText('-4%');

    expect(growth).toHaveClass('text-[#B42318]');
    expect(screen.queryByText('+-4%')).not.toBeInTheDocument();
  });

  it('shows zero growth as a rise of zero percent', () => {
    renderRow({ cards: [{ ...CARDS[0]!, growth: 0 }] });

    expect(screen.getByText('+0%')).toHaveClass('text-[#0F7A3A]');
  });

  it('lets a long label wrap on two lines and keeps the card from spilling', () => {
    renderRow();
    const label = screen.getByText(CARDS[1]!.label);
    const card = screen.getByRole('group', { name: /Recruiters Currently Hiring/ });

    expect(label).toHaveClass('line-clamp-2', 'break-words');
    expect(label).toHaveAttribute('title', CARDS[1]!.label);
    expect(card).toHaveClass('min-w-0', 'overflow-hidden');
  });

  it('lays the cards out in 2, 3 and 6 columns with the 90 design pixel height from lg', () => {
    renderRow();
    const grid = screen.getByRole('group', { name: /Total Recruiters/ }).parentElement;

    expect(grid).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'xl:grid-cols-6', 'gap-3');
    expect(screen.getByRole('group', { name: /Total Recruiters/ })).toHaveClass(
      'lg:h-[calc(90*var(--u))]'
    );
  });

  it('shows skeleton cards and a status while loading', () => {
    renderRow({ cards: [], isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Loading recruiters counts');
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows one message across the row with a Retry button when loading failed', async () => {
    const onRetry = renderRow({ cards: [], isError: true });

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the recruiters counts.');
    expect(screen.getByRole('alert')).toHaveClass('col-span-full');
    const retry = screen.getByRole('button', { name: 'Retry' });
    expect(retry).toHaveClass('min-h-11');
    await userEvent.click(retry);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
