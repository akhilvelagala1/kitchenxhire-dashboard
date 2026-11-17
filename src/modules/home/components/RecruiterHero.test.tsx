import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import heroImage from '../assets/hire-hero-home.webp';
import { RecruiterHero } from './RecruiterHero';

describe('RecruiterHero', () => {
  it('renders the recruiter eyebrow, headline and description', () => {
    render(<RecruiterHero />);

    expect(screen.getByText('Hire for your kitchen & hospitality team')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Hire the right people for your kitchen\./
    );
    expect(
      screen.getByText('Post jobs, review applications and build a reliable team.')
    ).toBeInTheDocument();
  });

  it('reuses the public homepage banner image and its alt text', () => {
    render(<RecruiterHero />);

    const image = screen.getByRole('img', { name: 'Kitchen team ready to hire' });
    expect(image).toHaveAttribute('src', heroImage);
  });
});
