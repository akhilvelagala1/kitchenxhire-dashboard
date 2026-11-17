import { render, screen } from '@testing-library/react';
import {
  JobSeekerCell,
  JobSeekerCompletionCell,
  JobSeekerContactCell,
  JobSeekerLocationCell
} from './jobSeekerCells';

describe('JobSeekerCell', () => {
  it('shows initials, the name and the e-mail with tooltips', () => {
    render(<JobSeekerCell id="JS1" name="Ramesh Kumar" email="ramesh@email.com" />);

    expect(screen.getByTestId('job-seeker-avatar')).toHaveTextContent('RK');
    expect(screen.getByText('Ramesh Kumar')).toHaveAttribute('title', 'Ramesh Kumar');
    expect(screen.getByText('ramesh@email.com')).toHaveAttribute('title', 'ramesh@email.com');
  });

  it('gives the same id the same colour every time', () => {
    const { unmount } = render(<JobSeekerCell id="JS12846" name="A" email="a@x.in" />);
    const first = screen.getByTestId('job-seeker-avatar').className;
    unmount();
    render(<JobSeekerCell id="JS12846" name="B" email="b@x.in" />);

    expect(screen.getByTestId('job-seeker-avatar').className).toBe(first);
  });

  it('uses more than one colour across different ids', () => {
    const tones = ['JS1', 'JS2', 'JS3', 'JS4'].map((id) => {
      const { unmount } = render(<JobSeekerCell id={id} name="A" email="a@x.in" />);
      const tone = screen.getByTestId('job-seeker-avatar').className;
      unmount();
      return tone;
    });

    expect(new Set(tones).size).toBeGreaterThan(1);
  });

  it('shows a question mark for an empty name', () => {
    render(<JobSeekerCell id="JS1" name="  " email="a@x.in" />);

    expect(screen.getByTestId('job-seeker-avatar')).toHaveTextContent('?');
  });
});

describe('JobSeekerContactCell', () => {
  it('stacks email and phone', () => {
    render(<JobSeekerContactCell email="a@x.in" phone="+91 90000 00000" />);

    expect(screen.getByText('a@x.in')).toBeInTheDocument();
    expect(screen.getByText('+91 90000 00000')).toBeInTheDocument();
  });
});

describe('JobSeekerLocationCell', () => {
  it('joins city and state', () => {
    render(<JobSeekerLocationCell city="Hyderabad" state="TS" />);

    expect(screen.getByText('Hyderabad, TS')).toBeInTheDocument();
  });
});

describe('JobSeekerCompletionCell', () => {
  it('shows the percent and a progress bar', () => {
    render(<JobSeekerCompletionCell value={92} />);

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Profile 92% complete' })).toHaveAttribute(
      'aria-valuenow',
      '92'
    );
  });
});
