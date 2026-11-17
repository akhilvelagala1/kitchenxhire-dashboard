import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { BusinessesSection } from './BusinessesSection';

function renderBusinesses() {
  return render(
    <HomeStateProvider>
      <BusinessesSection />
    </HomeStateProvider>
  );
}

describe('BusinessesSection', () => {
  it('renders kicker, headline, and lead description', () => {
    renderBusinesses();

    expect(screen.getByText('Explore for every food business')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Hiring for every food business.' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Find the right people for your restaurant, hotel, café/i)
    ).toBeInTheDocument();
  });

  it('renders all six business cards with titles and descriptions', () => {
    renderBusinesses();

    expect(screen.getByRole('heading', { level: 3, name: 'Restaurants' })).toBeInTheDocument();
    expect(
      screen.getByText('Find cooks, kitchen helpers and service staff for daily operations.')
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Hotels' })).toBeInTheDocument();
    expect(
      screen.getByText('Hire kitchen, housekeeping and banquet staff for your hotel.')
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Bakeries' })).toBeInTheDocument();
    expect(
      screen.getByText('Hire bakers, pastry assistants, production helpers and counter staff.')
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Cafés' })).toBeInTheDocument();
    expect(screen.getByText('Hire baristas, kitchen and café service staff.')).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Cloud Kitchens' })).toBeInTheDocument();
    expect(
      screen.getByText('Build a reliable team for preparation, cooking, packing and dispatch.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Catering Businesses' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Find experienced staff for catering events and canteens.')
    ).toBeInTheDocument();
  });

  it('renders images with lazy loading and proper alt descriptions', () => {
    renderBusinesses();

    const restaurantImg = screen.getByAltText('Chef plating a dish in a restaurant kitchen');
    expect(restaurantImg).toBeInTheDocument();
    expect(restaurantImg).toHaveAttribute('loading', 'lazy');

    const hotelImg = screen.getByAltText('Hotel housekeeper preparing a room');
    expect(hotelImg).toBeInTheDocument();
    expect(hotelImg).toHaveAttribute('loading', 'lazy');

    const bakeryImg = screen.getByAltText('Baker finishing cakes');
    expect(bakeryImg).toBeInTheDocument();
    expect(bakeryImg).toHaveAttribute('loading', 'lazy');
  });

  it('applies a 2-column responsive grid on mobile and scales to 3 columns on desktop', () => {
    const { container } = renderBusinesses();

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('grid-cols-2');
    expect(grid?.className).toContain('min-[900px]:grid-cols-3');

    const articles = container.querySelectorAll('article');
    expect(articles).toHaveLength(6);
    expect(articles[0]?.className).toContain('card');
  });
});
