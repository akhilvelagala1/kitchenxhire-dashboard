import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { useHomeState } from '../hooks/useHomeState';
import { FOOTER_COLUMNS, SOCIAL_LINKS } from '../content/nav';
import { SiteFooter } from './SiteFooter';

function renderFooter() {
  return render(
    <HomeStateProvider>
      <SiteFooter />
    </HomeStateProvider>
  );
}

function FlowWatcher() {
  const { flow } = useHomeState();
  return <div data-testid="active-flow">{flow}</div>;
}

describe('SiteFooter', () => {
  it('renders footer landmark, brand logo link, and brand tagline', () => {
    renderFooter();

    const footer = screen.getByRole('contentinfo', { name: 'Site footer' });
    expect(footer).toBeInTheDocument();

    const brandLink = screen.getByRole('link', { name: 'KitchenX Hiring' });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '#top');

    expect(screen.getByText('For every food business.')).toBeInTheDocument();
  });

  it('renders all social media links with accessible labels', () => {
    renderFooter();

    SOCIAL_LINKS.forEach(({ label }) => {
      const socialLink = screen.getByRole('link', { name: `KitchenX on ${label}` });
      expect(socialLink).toBeInTheDocument();
      expect(socialLink).toHaveAttribute('href', '#top');
    });
  });

  it('renders all 5 column titles as h3 headings and their respective links', () => {
    renderFooter();

    FOOTER_COLUMNS.forEach((column) => {
      expect(screen.getByRole('heading', { level: 3, name: column.title })).toBeInTheDocument();

      column.links.forEach((link) => {
        const navLink = screen.getByRole('link', { name: link.label });
        expect(navLink).toBeInTheDocument();
        expect(navLink).toHaveAttribute('href', `#${link.target}`);
      });
    });
  });

  it('updates the home flow when flow-enabled links are clicked', () => {
    render(
      <HomeStateProvider>
        <SiteFooter />
        <FlowWatcher />
      </HomeStateProvider>
    );

    // Initial flow is seeker
    expect(screen.getByTestId('active-flow')).toHaveTextContent('seeker');

    // Click "Post a Vacancy" -> should switch flow to employer
    const postVacancyLink = screen.getByRole('link', { name: 'Post a Vacancy' });
    fireEvent.click(postVacancyLink);
    expect(screen.getByTestId('active-flow')).toHaveTextContent('employer');

    // Click "Create Profile" -> should switch flow to seeker
    const createProfileLink = screen.getByRole('link', { name: 'Create Profile' });
    fireEvent.click(createProfileLink);
    expect(screen.getByTestId('active-flow')).toHaveTextContent('seeker');
  });

  it('renders copyright and ownership notice in the bottom bar', () => {
    renderFooter();

    expect(screen.getByText('© 2026 KitchenX Hiring. All rights reserved.')).toBeInTheDocument();
    expect(
      screen.getByText("A part of KitchenX. For India's food businesses.")
    ).toBeInTheDocument();
  });
});
