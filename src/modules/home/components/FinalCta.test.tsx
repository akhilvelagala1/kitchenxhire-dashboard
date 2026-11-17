import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { useHomeState } from '../hooks/useHomeState';
import { FinalCta } from './FinalCta';

function renderFinalCta() {
  return render(
    <HomeStateProvider>
      <FinalCta />
    </HomeStateProvider>
  );
}

function FlowWatcher() {
  const { flow } = useHomeState();
  return <div data-testid="active-flow">{flow}</div>;
}

describe('FinalCta', () => {
  it('renders section landmark, headline, eyebrow, and lead description', () => {
    renderFinalCta();

    const section = screen.getByRole('region', {
      name: /Build your team\.\s*Build your future\./i
    });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'final-cta');

    expect(screen.getByText('Grow your food business')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Build your team\.\s*Build your future\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Find skilled kitchen staff, from chefs to helpers, and keep your food business running smoothly.'
      )
    ).toBeInTheDocument();
  });

  it('shows Hire Staff first as the primary CTA and Find a Job second, both with correct anchors', () => {
    renderFinalCta();

    const links = screen.getAllByRole('link', { name: /Hire Staff|Find a Job/ });
    expect(links[0]).toHaveAccessibleName('Hire Staff');
    expect(links[0]).toHaveAttribute('href', '#how');
    expect(links[1]).toHaveAccessibleName('Find a Job');
    expect(links[1]).toHaveAttribute('href', '#jobs');
  });

  it('switches the home flow to employer when "Hire Staff" is clicked', () => {
    render(
      <HomeStateProvider>
        <FinalCta />
        <FlowWatcher />
      </HomeStateProvider>
    );

    expect(screen.getByTestId('active-flow')).toHaveTextContent('seeker');

    const hireStaffLink = screen.getByRole('link', { name: 'Hire Staff' });
    fireEvent.click(hireStaffLink);

    expect(screen.getByTestId('active-flow')).toHaveTextContent('employer');
  });

  it('renders the kitchen team image with lazy loading, async decoding, and the hero fade-left mask from tablet up', () => {
    renderFinalCta();

    const img = screen.getByAltText('KitchenX kitchen team');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveClass('object-cover', 'min-[768px]:fade-left-hero');
  });

  it('keeps the banner at least 300px tall from the tablet breakpoint up', () => {
    const { container } = renderFinalCta();

    const banner = container.querySelector('[class*="min-\\[768px\\]:min-h-"]');
    expect(banner).toHaveClass('min-[768px]:min-h-[300px]');
  });
});
