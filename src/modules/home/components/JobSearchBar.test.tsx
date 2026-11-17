import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JobSearchBar } from './JobSearchBar';

describe('JobSearchBar', () => {
  it('renders role and city search fields and search button', () => {
    render(<JobSearchBar role="" city="" onRole={vi.fn()} onCity={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText(/Job title or skill/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/City or area/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search jobs/i })).toBeInTheDocument();
  });

  it('calls onRole and onCity when typed into', async () => {
    const user = userEvent.setup();
    const onRole = vi.fn();
    const onCity = vi.fn();

    render(<JobSearchBar role="" city="" onRole={onRole} onCity={onCity} onSubmit={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/Job title or skill/i), 'Cook');
    expect(onRole).toHaveBeenCalled();

    await user.type(screen.getByPlaceholderText(/City or area/i), 'Madhapur');
    expect(onCity).toHaveBeenCalled();
  });

  it('displays clear buttons when fields have values and clears on click', async () => {
    const user = userEvent.setup();
    const onRole = vi.fn();
    const onCity = vi.fn();

    render(
      <JobSearchBar
        role="Cook"
        city="Hyderabad"
        onRole={onRole}
        onCity={onCity}
        onSubmit={vi.fn()}
      />
    );

    const clearRoleBtn = screen.getByRole('button', { name: /Clear job title or skill/i });
    expect(clearRoleBtn).toBeInTheDocument();
    await user.click(clearRoleBtn);
    expect(onRole).toHaveBeenCalledWith('');

    const clearCityBtn = screen.getByRole('button', { name: /Clear city or area/i });
    expect(clearCityBtn).toBeInTheDocument();
    await user.click(clearCityBtn);
    expect(onCity).toHaveBeenCalledWith('');
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn();
    render(
      <JobSearchBar
        role="Chef"
        city="Hyderabad"
        onRole={vi.fn()}
        onCity={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const form = screen.getByRole('search');
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders custom submitLabel and rolePlaceholder when provided', () => {
    render(
      <JobSearchBar
        role=""
        city=""
        onRole={vi.fn()}
        onCity={vi.fn()}
        onSubmit={vi.fn()}
        submitLabel="Search Candidates"
        rolePlaceholder="Search by job title"
      />
    );

    expect(screen.getByPlaceholderText('Search by job title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search jobs/i })).toHaveTextContent(
      'Search Candidates'
    );
  });

  it('suggests matching cities once two characters are typed, and selects one', async () => {
    const user = userEvent.setup();
    const onCity = vi.fn();
    render(<JobSearchBar role="" city="Vij" onRole={vi.fn()} onCity={onCity} onSubmit={vi.fn()} />);

    await user.click(screen.getByPlaceholderText(/City or area/i));
    const option = screen.getByRole('option', { name: 'Vijayawada' });
    expect(option).toBeInTheDocument();

    await user.click(option);
    expect(onCity).toHaveBeenCalledWith('Vijayawada');
  });

  it('shows no city suggestions until at least two characters are typed', () => {
    render(<JobSearchBar role="" city="V" onRole={vi.fn()} onCity={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('applies horizontal search pill styling from 768px tablet breakpoint', () => {
    const { container } = render(
      <JobSearchBar role="" city="" onRole={vi.fn()} onCity={vi.fn()} onSubmit={vi.fn()} />
    );

    const wrap = container.firstChild as HTMLElement;
    expect(wrap).toHaveClass('min-[768px]:-mt-[38px]');

    const form = container.querySelector('form[role="search"]');
    expect(form).toHaveClass('min-[768px]:flex-row');
    expect(form).toHaveClass('min-[768px]:h-[72px]');
    expect(form).toHaveClass('min-[768px]:rounded-full');
  });

  it('uses the compact homepage pill inset over the hero', () => {
    const { container } = render(
      <JobSearchBar
        role=""
        city=""
        onRole={vi.fn()}
        onCity={vi.fn()}
        onSubmit={vi.fn()}
        variant="home"
      />
    );

    const wrap = container.firstChild as HTMLElement;
    expect(wrap).toHaveClass('min-[768px]:-mt-[28px]');
    expect(wrap).toHaveClass('min-[1024px]:-mt-[30px]');
    expect(wrap).toHaveClass('min-[1024px]:px-[50px]');

    const form = container.querySelector('form[role="search"]');
    expect(form).toHaveClass('min-[768px]:h-[60px]');

    expect(screen.getByRole('button', { name: /Search jobs/i })).toHaveClass(
      'min-[768px]:size-[44px]'
    );
  });
});
