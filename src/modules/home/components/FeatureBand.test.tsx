import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { FeatureBand } from './FeatureBand';

function renderFeatureBand() {
  return render(
    <HomeStateProvider>
      <FeatureBand />
    </HomeStateProvider>
  );
}

describe('FeatureBand', () => {
  it('renders all four feature cards with titles and descriptions', () => {
    renderFeatureBand();

    expect(
      screen.getByRole('heading', { name: /Kitchen & hospitality roles/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Jobs across restaurants, hotels, bakeries, and cloud kitchens.')
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Local hiring/i })).toBeInTheDocument();
    expect(
      screen.getByText('Discover opportunities and candidates in your city or nearby areas.')
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Simple applications/i })).toBeInTheDocument();
    expect(
      screen.getByText('Create a profile and apply without a complicated process.')
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Business-first support/i })).toBeInTheDocument();
    expect(
      screen.getByText('Tools designed around the practical needs of food businesses.')
    ).toBeInTheDocument();
  });

  it('renders four feature articles inside the container', () => {
    const { container } = renderFeatureBand();
    const articles = container.querySelectorAll('article');
    expect(articles).toHaveLength(4);
  });

  it('renders section landmark and responsive grid classes for mobile and tablet', () => {
    const { container } = renderFeatureBand();
    const section = screen.getByRole('region', { name: 'Key features' });
    expect(section).toBeInTheDocument();

    const grid = container.querySelector('.grid-cols-2');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('min-[768px]:grid-cols-4');
  });
});
