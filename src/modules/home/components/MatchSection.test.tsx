import { render, screen } from '@testing-library/react';
import { ChefHat } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { MatchSection } from './MatchSection';

function renderMatchSection(props = {}) {
  return render(
    <HomeStateProvider>
      <MatchSection {...props} />
    </HomeStateProvider>
  );
}

describe('MatchSection', () => {
  it('renders kicker, headline, and decorative underline', () => {
    renderMatchSection();

    expect(screen.getByText('Make a smart hire')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Make the right match.' })
    ).toBeInTheDocument();
  });

  it('renders all three value cards with titles and descriptions', () => {
    renderMatchSection();

    expect(screen.getByRole('heading', { level: 3, name: 'Location first' })).toBeInTheDocument();
    expect(
      screen.getByText('Find jobs and people in your city and nearby areas.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Skills that matter' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Match jobs based on real, practical kitchen and service skills.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Clear job details' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('See the role, pay, shift and expectations before applying.')
    ).toBeInTheDocument();
  });

  it('applies lazy loading and async decoding to card images', () => {
    renderMatchSection();

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);

    for (const img of images) {
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    }
  });

  it('renders custom cards when passed as props', () => {
    const customCards = [
      {
        title: 'Custom Feature',
        description: 'Custom description for food businesses.',
        image: '/custom.jpg',
        alt: 'Custom feature preview',
        icon: ChefHat
      }
    ];

    renderMatchSection({ cards: customCards });

    expect(screen.getByRole('heading', { level: 3, name: 'Custom Feature' })).toBeInTheDocument();
    expect(screen.getByText('Custom description for food businesses.')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Location first' })
    ).not.toBeInTheDocument();
  });
});
