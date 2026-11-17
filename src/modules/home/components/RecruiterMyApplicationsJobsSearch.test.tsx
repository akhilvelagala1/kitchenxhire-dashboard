import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecruiterMyApplicationsJobsSearch } from './RecruiterMyApplicationsJobsSearch';

describe('RecruiterMyApplicationsJobsSearch', () => {
  it('renders a search input with the jobs placeholder', () => {
    render(<RecruiterMyApplicationsJobsSearch value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search job title...')).toBeInTheDocument();
  });

  it('calls onChange with the typed value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<RecruiterMyApplicationsJobsSearch value="" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('Search job title...'), 'Chef');
    expect(onChange).toHaveBeenCalled();
  });

  it('hides the clear button when the value is empty', () => {
    render(<RecruiterMyApplicationsJobsSearch value="" onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Clear search/i })).not.toBeInTheDocument();
  });

  it('shows the clear button when the value is non-empty', () => {
    render(<RecruiterMyApplicationsJobsSearch value="Chef" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Clear search/i })).toBeInTheDocument();
  });

  it('calls onChange with an empty string when the clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<RecruiterMyApplicationsJobsSearch value="Chef" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /Clear search/i }));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
