import { ChefHat } from 'lucide-react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { PROFILE_ROLE_OPTIONS } from '../content/profileFormOptions';
import { ProfileOptionWithOther } from './ProfileOptionWithOther';

function Harness() {
  const [value, setValue] = useState('');
  return (
    <ProfileOptionWithOther
      label="Preferred Job Role"
      icon={ChefHat}
      name="preferredRole"
      value={value}
      onChange={setValue}
      options={PROFILE_ROLE_OPTIONS}
      customPlaceholder="e.g. Italian Chef"
    />
  );
}

describe('ProfileOptionWithOther', () => {
  it('replaces the dropdown in place when Other / Enter manually is chosen', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: /Preferred Job Role/i });
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: /Other \/ Enter manually/i }));

    const input = screen.getByLabelText(/^Preferred Job Role$/i);
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    expect(screen.queryByRole('button', { name: /Preferred Job Role/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Enter your preferred job role/i)).not.toBeInTheDocument();

    await user.type(input, 'Italian');
    expect(input).toHaveValue('Italian');
  });

  it('returns to the dropdown via Choose from list', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: /Preferred Job Role/i }));
    await user.click(await screen.findByRole('option', { name: /Other \/ Enter manually/i }));
    await user.click(screen.getByRole('button', { name: /Choose from list/i }));

    expect(screen.getByRole('button', { name: /Preferred Job Role/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: /^Preferred Job Role$/i })
    ).not.toBeInTheDocument();
  });
});
