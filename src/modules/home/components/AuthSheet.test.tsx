import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthSheet } from './AuthSheet';

async function toCodeStep() {
  const user = userEvent.setup();
  render(<AuthSheet onClose={() => {}} onVerified={vi.fn()} />);
  await user.type(screen.getByLabelText('Mobile number'), '9876543210');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  return user;
}

describe('AuthSheet', () => {
  it('shows role selection and reference copy on the phone step', () => {
    render(<AuthSheet onClose={() => {}} onVerified={() => {}} />);

    expect(screen.getByText('Choose how you want to use KitchenX.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Find a Job/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByText("You'll receive an OTP on your mobile number.")).toBeInTheDocument();
  });

  it('keeps Continue disabled until the mobile number is valid', async () => {
    const user = userEvent.setup();
    render(<AuthSheet onClose={() => {}} onVerified={() => {}} />);

    await user.type(screen.getByLabelText('Mobile number'), '98765');

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('moves to the code step with the number formatted, counting down from two minutes', async () => {
    await toCodeStep();

    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
    expect(screen.getByText('02:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend now' })).toBeDisabled();
  });

  it('asks for six digits before verifying', async () => {
    const user = await toCodeStep();

    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(screen.getByText('Enter the 6-digit code.')).toBeInTheDocument();
  });

  it('hands back the formatted number and job seeker intent once six digits are entered', async () => {
    const user = userEvent.setup();
    const onVerified = vi.fn();
    render(<AuthSheet onClose={() => {}} onVerified={onVerified} />);
    await user.type(screen.getByLabelText('Mobile number'), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.type(screen.getByLabelText('Digit 1'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(onVerified).toHaveBeenCalledWith({
      phone: '+91 98765 43210',
      intent: 'job_seeker'
    });
  });

  it('includes recruiter intent when Hire People is selected', async () => {
    const user = userEvent.setup();
    const onVerified = vi.fn();
    render(<AuthSheet onClose={() => {}} onVerified={onVerified} />);

    await user.click(screen.getByRole('radio', { name: /Hire People/i }));
    await user.type(screen.getByLabelText('Mobile number'), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Digit 1'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(onVerified).toHaveBeenCalledWith({
      phone: '+91 98765 43210',
      intent: 'recruiter'
    });
  });
});
