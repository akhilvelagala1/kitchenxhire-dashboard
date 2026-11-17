import { render, screen } from '@testing-library/react';
import { CandidateCell, JobCell, OutletCell } from './applicationCells';

describe('CandidateCell', () => {
  it('shows the first and last initial, the name and the city', () => {
    render(<CandidateCell name="Rahul Kumar" location="Hyderabad, TS" />);

    expect(screen.getByText('RK')).toBeInTheDocument();
    expect(screen.getByText('Rahul Kumar')).toHaveAttribute('title', 'Rahul Kumar');
    expect(screen.getByText('Hyderabad, TS')).toBeInTheDocument();
  });

  it('uses one initial for a single name and the outer two for a long name', () => {
    render(
      <>
        <CandidateCell name="meena" location="Secunderabad, TS" />
        <CandidateCell name="Anil  Kumar   Reddy" location="Hyderabad, TS" />
      </>
    );

    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('AR')).toBeInTheDocument();
  });

  it('falls back to a question mark when the name is blank', () => {
    render(<CandidateCell name="   " location="Hyderabad, TS" />);

    expect(screen.getByText('?')).toBeInTheDocument();
  });
});

describe('JobCell', () => {
  it('shows the given icon, the title with a tooltip and the employment type', () => {
    render(<JobCell icon={<svg data-testid="job-icon" />} title="Cook / Chef" type="Part-time" />);

    expect(screen.getByText('Cook / Chef')).toHaveAttribute('title', 'Cook / Chef');
    expect(screen.getByText('Part-time')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="job-icon"]')).toBeInTheDocument();
  });
});

describe('OutletCell', () => {
  it('shows the outlet with the recruiter under it', () => {
    render(<OutletCell outlet="Spice Bowl Restaurant" recruiter="Rahul Verma" />);

    expect(screen.getByText('Spice Bowl Restaurant')).toHaveAttribute(
      'title',
      'Spice Bowl Restaurant'
    );
    expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
  });
});
