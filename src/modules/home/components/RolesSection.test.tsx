import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { RolesSection } from './RolesSection';

function renderRoles(activeRole: string | null = null, onPick = vi.fn()) {
  return render(
    <HomeStateProvider>
      <RolesSection activeRole={activeRole} onPick={onPick} />
    </HomeStateProvider>
  );
}

describe('RolesSection', () => {
  it('renders section kicker, headline, and the main eight roles', () => {
    renderRoles();

    expect(screen.getByText('Explore opportunities')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Find work that fits your skills.' })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Chefs & Cooks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kitchen Helpers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cleaning & Stewarding/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vegetable Cutting & Prep/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bakery Staff/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Waiters & Service/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Housekeeping/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delivery & Store Support/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'View all roles' })).toBeInTheDocument();
  });

  it('calls onPick when a role card is clicked', async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    renderRoles(null, onPick);

    await user.click(screen.getByRole('button', { name: /Chefs & Cooks/i }));
    expect(onPick).toHaveBeenCalledWith('cook');

    await user.click(screen.getByRole('button', { name: /Bakery Staff/i }));
    expect(onPick).toHaveBeenCalledWith('bakery');
  });

  it('expands more roles and moves the toggle button to the end', async () => {
    const user = userEvent.setup();
    renderRoles();

    const moreContainer = () => document.getElementById('moreRoles')!;
    expect(moreContainer()).not.toBeVisible();

    const viewAllBtn = screen.getByRole('button', { name: 'View all roles' });
    await user.click(viewAllBtn);

    expect(moreContainer()).toBeVisible();
    expect(within(moreContainer()).getAllByRole('button')).toHaveLength(6);

    expect(screen.getByRole('button', { name: /Tandoor Cook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /South Indian Cook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Barista/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Captain & Host/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Counter & Billing/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rider/i })).toBeInTheDocument();

    // The toggle button updates to 'Show fewer roles' at the end of the section
    const showFewerBtn = screen.getByRole('button', { name: 'Show fewer roles' });
    expect(showFewerBtn).toBeInTheDocument();

    // Clicking it collapses the section back
    await user.click(showFewerBtn);
    expect(moreContainer()).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'View all roles' })).toBeInTheDocument();
  });

  it('highlights the active role card', () => {
    renderRoles('cook');
    const cookButton = screen.getByRole('button', { name: /Chefs & Cooks/i });
    expect(cookButton.className).toContain('shadow-role-on');
    expect(cookButton.className).toContain('border-brand-200');
  });

  it('applies responsive visibility classes to keep mobile and tablet layouts compact', async () => {
    const user = userEvent.setup();
    renderRoles();

    const cooks = screen.getByRole('button', { name: /Chefs & Cooks/i });
    const helpers = screen.getByRole('button', { name: /Kitchen Helpers/i });
    const cleaning = screen.getByRole('button', { name: /Cleaning & Stewarding/i });
    const vegetable = screen.getByRole('button', { name: /Vegetable Cutting & Prep/i });
    const bakery = screen.getByRole('button', { name: /Bakery Staff/i });
    const waiters = screen.getByRole('button', { name: /Waiters & Service/i });
    const housekeeping = screen.getByRole('button', { name: /Housekeeping/i });
    const delivery = screen.getByRole('button', { name: /Delivery & Store Support/i });

    // Initial 3 roles are always visible
    expect(cooks.className).not.toContain('hidden');
    expect(helpers.className).not.toContain('hidden');
    expect(cleaning.className).not.toContain('hidden');

    // Next 2 roles are hidden on mobile (<720px) and visible from tablet up
    expect(vegetable.className).toContain('hidden min-[720px]:flex');
    expect(bakery.className).toContain('hidden min-[720px]:flex');

    // Last 3 roles are hidden on mobile and tablet, visible from desktop (>=1024px)
    expect(waiters.className).toContain('hidden min-[1024px]:flex');
    expect(housekeeping.className).toContain('hidden min-[1024px]:flex');
    expect(delivery.className).toContain('hidden min-[1024px]:flex');

    // When expanded, all roles drop the hidden class
    await user.click(screen.getByRole('button', { name: 'View all roles' }));
    expect(vegetable.className).not.toContain('hidden');
    expect(bakery.className).not.toContain('hidden');
    expect(waiters.className).not.toContain('hidden');
    expect(housekeeping.className).not.toContain('hidden');
    expect(delivery.className).not.toContain('hidden');

    const showFewerBtn = screen.getByRole('button', { name: 'Show fewer roles' });
    expect(showFewerBtn.className).toContain('min-[720px]:col-span-2 min-[1024px]:col-span-1');
  });
});
