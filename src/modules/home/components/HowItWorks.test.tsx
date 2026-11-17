import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { HowItWorks } from './HowItWorks';

function renderHowItWorks(props = {}) {
  return render(
    <HomeStateProvider>
      <HowItWorks {...props} />
    </HomeStateProvider>
  );
}

describe('HowItWorks', () => {
  it('renders kicker and headline', () => {
    renderHowItWorks();

    expect(screen.getByText('A simple way to hire or get hired')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'How KitchenX Hiring works.' })
    ).toBeInTheDocument();
  });

  it('renders tablist with accessible attributes and roving tabIndex', () => {
    renderHowItWorks();

    const tablist = screen.getByRole('tablist', { name: 'Who is hiring' });
    expect(tablist).toBeInTheDocument();

    const seekerTab = screen.getByRole('tab', { name: /For Job Seekers/i });
    const employerTab = screen.getByRole('tab', { name: /For Employers/i });

    expect(seekerTab).toHaveAttribute('aria-selected', 'true');
    expect(seekerTab).toHaveAttribute('tabIndex', '0');
    expect(seekerTab).toHaveAttribute('aria-controls', 'flowSeeker');

    expect(employerTab).toHaveAttribute('aria-selected', 'false');
    expect(employerTab).toHaveAttribute('tabIndex', '-1');
    expect(employerTab).toHaveAttribute('aria-controls', 'flowEmployer');
  });

  it('renders all four job seeker steps by default with numbers, lazy images, and descriptions', () => {
    renderHowItWorks();

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'flowSeeker');
    expect(panel).toHaveAttribute('aria-labelledby', 'tabSeeker');

    expect(screen.getByRole('heading', { level: 3, name: 'Create a Profile' })).toBeInTheDocument();
    expect(
      screen.getByText('Add basic details, skills, experience and location.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Find Opportunities' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Browse suitable jobs near home or in a preferred area.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Connect with Employers' })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Apply and respond to employers' contact or interview requests.")
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Get Hired' })).toBeInTheDocument();
    expect(
      screen.getByText('Complete the selection process and confirm the opportunity.')
    ).toBeInTheDocument();

    // Verify step number badges 1, 2, 3, 4
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    // Verify images have lazy loading
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
    for (const img of images) {
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    }
  });

  it('switches to employer steps on tab click', async () => {
    const user = userEvent.setup();
    renderHowItWorks();

    const employerTab = screen.getByRole('tab', { name: /For Employers/i });
    await user.click(employerTab);

    expect(employerTab).toHaveAttribute('aria-selected', 'true');
    expect(employerTab).toHaveAttribute('tabIndex', '0');

    const seekerTab = screen.getByRole('tab', { name: /For Job Seekers/i });
    expect(seekerTab).toHaveAttribute('aria-selected', 'false');
    expect(seekerTab).toHaveAttribute('tabIndex', '-1');

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'flowEmployer');
    expect(panel).toHaveAttribute('aria-labelledby', 'tabEmployer');

    expect(screen.getByRole('heading', { level: 3, name: 'Post a Vacancy' })).toBeInTheDocument();
    expect(
      screen.getByText('Share the role, shift, pay, location and what the work needs.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Reach Local People' })
    ).toBeInTheDocument();
    expect(screen.getByText('Get applicants from your city and nearby areas.')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Review Applicants' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('See practical kitchen and service skills before you decide.')
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Hire and Contact' })).toBeInTheDocument();
    expect(screen.getByText('Shortlist candidates and reach out directly.')).toBeInTheDocument();
  });

  it('navigates tabs using ArrowRight and ArrowLeft keyboard keys', () => {
    renderHowItWorks();

    const tablist = screen.getByRole('tablist', { name: 'Who is hiring' });
    const seekerTab = screen.getByRole('tab', { name: /For Job Seekers/i });
    const employerTab = screen.getByRole('tab', { name: /For Employers/i });

    // Press ArrowRight to move to Employers
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(employerTab).toHaveAttribute('aria-selected', 'true');
    expect(seekerTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('heading', { level: 3, name: 'Post a Vacancy' })).toBeInTheDocument();

    // Press ArrowLeft to move back to Job Seekers
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(seekerTab).toHaveAttribute('aria-selected', 'true');
    expect(employerTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('heading', { level: 3, name: 'Create a Profile' })).toBeInTheDocument();
  });

  it('renders mobile step connectors and tablet 4-column rail', () => {
    const { container } = renderHowItWorks();

    const panel = screen.getByRole('tabpanel');
    expect(panel.className).toContain('min-[768px]:grid-cols-4');
    expect(panel.className).toContain('steps-rail');

    const connectors = container.querySelectorAll('.step-connector-mobile');
    expect(connectors).toHaveLength(2);
    for (const connector of connectors) {
      expect(connector).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
