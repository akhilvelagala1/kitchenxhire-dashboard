import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderPage } from '@/shared/test/render';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { JobSeekerSessionProvider } from '../layout/JobSeekerSessionProvider';
import { SiteHeader } from './SiteHeader';

function renderHeader(onLogin = vi.fn()) {
  return {
    onLogin,
    ...renderPage(
      <JobSeekerSessionProvider>
        <HomeStateProvider>
          <SiteHeader onLogin={onLogin} />
        </HomeStateProvider>
      </JobSeekerSessionProvider>
    )
  };
}

describe('SiteHeader', () => {
  it('renders the brand mark, primary nav links, and right actions', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: 'KitchenX Hiring' })).toHaveAttribute('href', '#top');
    expect(screen.getByRole('link', { name: 'Find Jobs' })).toHaveAttribute('href', '#jobs');
    expect(screen.getByRole('link', { name: 'Find Workers' })).toHaveAttribute('href', '#roles');
    expect(screen.getByRole('link', { name: 'For Businesses' })).toHaveAttribute(
      'href',
      '#businesses'
    );
    expect(screen.getByRole('link', { name: 'How it Works' })).toHaveAttribute('href', '#how');

    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Post a Job' })).toHaveAttribute('href', '#how');
  });

  it('triggers onLogin callback when login button is pressed', async () => {
    const user = userEvent.setup();
    const { onLogin } = renderHeader();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('applies shadow-sm when scrolled past threshold', () => {
    const { container } = renderHeader();
    const header = container.querySelector('header');
    expect(header).not.toHaveClass('shadow-sm');

    // Simulate window scroll
    window.scrollY = 20;
    fireEvent.scroll(window);
    expect(header).toHaveClass('shadow-sm');

    // Simulate scroll back to top
    window.scrollY = 0;
    fireEvent.scroll(window);
    expect(header).not.toHaveClass('shadow-sm');
  });

  it('opens and closes mobile menu via hamburger button and Escape key', async () => {
    const user = userEvent.setup();
    renderHeader();

    const openButton = screen.getByRole('button', { name: 'Open menu' });
    await user.click(openButton);

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
