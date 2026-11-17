import { render, screen } from '@testing-library/react';
import { BusinessTypeBadge } from './BusinessTypeBadge';
import { RecruiterStatusBadge } from './RecruiterStatusBadge';
import { RecruiterVerificationBadge } from './RecruiterVerificationBadge';

describe('RecruiterStatusBadge', () => {
  it.each([
    ['active', 'Active', 'text-[#15803D]'],
    ['inactive', 'Inactive', 'text-[#475569]'],
    ['pending', 'Pending', 'text-[#A16207]'],
    ['suspended', 'Suspended', 'text-[#DC2626]']
  ] as const)('writes %s as "%s" in a dark readable colour', (status, text, colour) => {
    render(<RecruiterStatusBadge status={status} />);

    expect(screen.getByText(text)).toHaveClass(colour);
  });
});

describe('RecruiterVerificationBadge', () => {
  it.each([
    ['verified', 'Verified', 'text-[#15803D]'],
    ['pending', 'Pending', 'text-[#2563EB]'],
    ['rejected', 'Rejected', 'text-[#DC2626]']
  ] as const)('writes %s as "%s"', (verification, text, colour) => {
    render(<RecruiterVerificationBadge verification={verification} />);

    expect(screen.getByText(text)).toHaveClass(colour);
  });
});

describe('BusinessTypeBadge', () => {
  it.each([
    ['Restaurant', 'text-[#A6400A]'],
    ['Cloud Kitchen', 'text-[#6D3FD1]'],
    ['Food Court', 'text-[#1A5FB8]']
  ] as const)('shows %s as text with its own colour', (type, colour) => {
    render(<BusinessTypeBadge type={type} />);

    expect(screen.getByText(type)).toHaveClass(colour);
  });
});
