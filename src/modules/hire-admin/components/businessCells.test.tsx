import { render, screen } from '@testing-library/react';
import { BusinessCell, BusinessContactCell } from './businessCells';

describe('BusinessCell', () => {
  it('shows an orange store tile, the name and the area and city under it', () => {
    render(<BusinessCell name="Spice Bowl" area="Rajiv Nagar" city="Hyderabad" />);

    expect(screen.getByTestId('business-tile')).toBeInTheDocument();
    expect(screen.getByText('Spice Bowl')).toBeInTheDocument();
    expect(screen.getByText('Rajiv Nagar, Hyderabad')).toBeInTheDocument();
  });

  it('leaves out the comma when there is no area', () => {
    render(<BusinessCell name="Meal Hub" area="" city="Pune" />);

    expect(screen.getByText('Pune')).toBeInTheDocument();
  });
});

describe('BusinessContactCell', () => {
  it('shows the owner and the formatted phone under it', () => {
    render(<BusinessContactCell owner="Ramesh Kumar" phone="9876543210" />);

    expect(screen.getByText('Ramesh Kumar')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
  });

  it('shows a number that is not ten digits as it came', () => {
    render(<BusinessContactCell owner="Priya" phone="12345" />);

    expect(screen.getByText('12345')).toBeInTheDocument();
  });
});
