import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { PROFILE_SKILL_OPTIONS } from '../content/profileFormOptions';
import { ProfileSkillsMultiSelect } from './ProfileSkillsMultiSelect';

function Harness() {
  const [values, setValues] = useState<string[]>([]);
  return (
    <ProfileSkillsMultiSelect
      label="Primary Skills"
      name="primarySkills"
      required
      values={values}
      options={PROFILE_SKILL_OPTIONS}
      onChange={setValues}
    />
  );
}

describe('ProfileSkillsMultiSelect', () => {
  it('selects and removes skills as chips', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('combobox', { name: /Primary Skills/i }));
    await user.click(await screen.findByRole('option', { name: 'Cooking' }));
    expect(screen.getByRole('button', { name: /Remove Cooking/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Remove Cooking/i }));
    expect(screen.queryByRole('button', { name: /Remove Cooking/i })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cooking' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('keeps the search field inside one capped listbox so only the options scroll', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('combobox', { name: /Primary Skills/i }));

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByPlaceholderText(/Search skills/i)).toBeInTheDocument();
    expect(listbox).toHaveStyle({ maxHeight: '260px' });
  });

  it('filters skills with search', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('combobox', { name: /Primary Skills/i }));
    await user.type(screen.getByPlaceholderText(/Search skills/i), 'Baki');
    expect(await screen.findByRole('option', { name: 'Baking' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Cooking' })).not.toBeInTheDocument();
  });
});
