import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Switch } from './Switch';

function Harness({ disabled = false }: { disabled?: boolean }) {
  const [on, setOn] = useState(false);
  return (
    <Switch
      aria-label="Self registration"
      checked={on}
      onCheckedChange={setOn}
      disabled={disabled}
    />
  );
}

describe('Switch', () => {
  it('is a switch that starts off and flips on a click', async () => {
    render(<Harness />);
    const toggle = screen.getByRole('switch', { name: 'Self registration' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('flips with the keyboard', async () => {
    render(<Harness />);
    const toggle = screen.getByRole('switch', { name: 'Self registration' });

    await userEvent.tab();
    expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('does nothing when disabled', async () => {
    render(<Harness disabled />);
    const toggle = screen.getByRole('switch', { name: 'Self registration' });

    await userEvent.click(toggle);
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});
