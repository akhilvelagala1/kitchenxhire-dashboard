import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileIconSelect } from './ProfileIconSelect';

const OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
] as const;

describe('ProfileIconSelect', () => {
  it('opens a Hire menu and reports the chosen option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileIconSelect
        label="Gender"
        name="gender"
        value=""
        onChange={onChange}
        options={OPTIONS}
        variant="resume"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Gender' }));
    expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Male' }));

    expect(onChange).toHaveBeenCalledWith('Male');
  });
});
