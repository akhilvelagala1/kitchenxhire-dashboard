import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HireLanguageProvider } from '../layout/HireLanguageProvider';
import { LanguagePicker } from './LanguagePicker';

describe('LanguagePicker', () => {
  it('lists English and Hindi in the shared Hire menu', async () => {
    const user = userEvent.setup();
    render(
      <HireLanguageProvider>
        <LanguagePicker />
      </HireLanguageProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Language' }));
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'हिन्दी' })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'हिन्दी' }));
    expect(screen.getByRole('button', { name: 'Language' })).toHaveTextContent('हिन्दी');
  });
});
