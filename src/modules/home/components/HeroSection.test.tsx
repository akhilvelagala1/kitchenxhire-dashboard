import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { HeroSection } from './HeroSection';

function renderHero() {
  return render(
    <HomeStateProvider>
      <HeroSection />
    </HomeStateProvider>
  );
}

describe('HeroSection', () => {
  it('renders the eyebrow, main headline, and subtext', () => {
    renderHero();

    expect(screen.getByText("Built for India's food industry")).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Good people.s*Stronger kitchens./
    );
    expect(screen.getByText(/Find reliable kitchen and hospitality staff/i)).toBeInTheDocument();
  });

  it('renders both action buttons with proper navigation anchors', async () => {
    const user = userEvent.setup();
    renderHero();

    const findJob = screen.getByRole('link', { name: /Find a Job/i });
    expect(findJob).toHaveAttribute('href', '#jobs');

    const hireStaff = screen.getByRole('link', { name: /Hire Staff/i });
    expect(hireStaff).toHaveAttribute('href', '#how');

    await user.click(hireStaff);
  });

  it('shows Hire Staff first as the primary orange CTA and Find a Job second as the outlined CTA', () => {
    renderHero();

    const links = screen.getAllByRole('link', { name: /Hire Staff|Find a Job/i });
    expect(links[0]).toHaveAccessibleName(/Hire Staff/i);
    expect(links[0]?.className).toContain('bg-brand-600');
    expect(links[1]).toHaveAccessibleName(/Find a Job/i);
    expect(links[1]?.className).not.toContain('bg-brand-600');
  });

  it('renders all three trust ticks', () => {
    renderHero();

    expect(screen.getByText('Local opportunities')).toBeInTheDocument();
    expect(screen.getByText('Simple applications')).toBeInTheDocument();
    expect(screen.getByText('Built for food businesses')).toBeInTheDocument();
  });

  it('renders the hero image with eager and high fetch priority attributes', () => {
    renderHero();

    const img = screen.getByAltText('KitchenX kitchen team');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('renders the hero inside an inset rounded card with a full-card photo', () => {
    const { container } = renderHero();

    const card = container.querySelector('section > div > div');
    expect(card).toHaveClass('rounded-[28px]');
    expect(card).toHaveClass('overflow-hidden');

    const heroImg = screen.getByAltText('KitchenX kitchen team');
    expect(heroImg).toHaveClass('object-cover');
    // Top-aligned crop keeps the team's heads and toques fully in frame at every width.
    expect(heroImg).toHaveClass('object-[62%_0%]');
    expect(heroImg).toHaveClass('min-[768px]:object-[58%_0%]');
    expect(heroImg).toHaveClass('min-[1024px]:object-[55%_0%]');
    expect(heroImg.className).not.toContain('fade-left-hero');
  });
});
