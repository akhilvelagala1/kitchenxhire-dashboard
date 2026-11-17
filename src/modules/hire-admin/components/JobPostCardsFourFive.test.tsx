import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, useWatch, type FieldErrors, type UseFormReturn } from 'react-hook-form';
import {
  JOB_TEXT_LIMIT,
  JOB_VISIBILITY_OPTIONS,
  type JobPostFormValues
} from '../schemas/adminJobPost';
import { JobPostDetailsSection } from './JobPostDetailsSection';
import { JobPostSettingsSection } from './JobPostSettingsSection';
import { JobPostSkillsInput } from './JobPostSkillsInput';

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function renderSkills(skills: string[] = [], error?: string) {
  const onChange = vi.fn();
  render(<JobPostSkillsInput skills={skills} onChange={onChange} error={error} />);
  return { onChange, input: screen.getByRole('textbox', { name: 'Add a skill' }) };
}

describe('JobPostSkillsInput', () => {
  it('adds the typed skill when Enter is pressed and clears the box', async () => {
    const user = userEvent.setup();
    const { onChange, input } = renderSkills(['Grill']);
    await user.type(input, 'Barista{Enter}');
    expect(onChange).toHaveBeenCalledWith(['Grill', 'Barista']);
    expect(input).toHaveValue('');
  });

  it('adds the typed skill when the plus button is clicked', async () => {
    const user = userEvent.setup();
    const { onChange, input } = renderSkills();
    await user.type(input, 'Barista');
    await user.click(screen.getByRole('button', { name: 'Add skill' }));
    expect(onChange).toHaveBeenCalledWith(['Barista']);
  });

  it('trims spaces around the skill before adding it', async () => {
    const user = userEvent.setup();
    const { onChange, input } = renderSkills();
    await user.type(input, '   Tandoor   {Enter}');
    expect(onChange).toHaveBeenCalledWith(['Tandoor']);
  });

  it('ignores a blank value', async () => {
    const user = userEvent.setup();
    const { onChange, input } = renderSkills();
    await user.type(input, '   {Enter}');
    await user.click(screen.getByRole('button', { name: 'Add skill' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores a skill that is already listed, whatever its letter case', async () => {
    const user = userEvent.setup();
    const { onChange, input } = renderSkills(['Grill']);
    await user.type(input, 'gRILL{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('removes a skill with its remove button', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSkills(['Grill', 'Barista']);
    await user.click(screen.getByRole('button', { name: 'Remove Grill' }));
    expect(onChange).toHaveBeenCalledWith(['Barista']);
  });

  it('limits the input to 40 characters', () => {
    const { input } = renderSkills();
    expect(input).toHaveAttribute('maxlength', '40');
  });

  it('marks the field as optional', () => {
    renderSkills();
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });

  it('disables adding and shows the limit hint once 20 skills are listed', () => {
    const twenty = Array.from({ length: 20 }, (_, index) => `Skill ${index + 1}`);
    const { input } = renderSkills(twenty);
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add skill' })).toBeDisabled();
    expect(screen.getByText('You can add up to 20 skills')).toBeInTheDocument();
  });

  it('still allows adding the twentieth skill and shows no hint before that', () => {
    const nineteen = Array.from({ length: 19 }, (_, index) => `Skill ${index + 1}`);
    const { input } = renderSkills(nineteen);
    expect(input).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Add skill' })).toBeEnabled();
    expect(screen.queryByText('You can add up to 20 skills')).not.toBeInTheDocument();
  });

  it('does not submit the surrounding form when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <JobPostSkillsInput skills={[]} onChange={vi.fn()} />
        <button type="submit">Submit</button>
      </form>
    );
    await user.type(screen.getByRole('textbox', { name: 'Add a skill' }), 'Barista{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the error as an alert', () => {
    renderSkills([], 'Too many skills');
    expect(screen.getByRole('alert')).toHaveTextContent('Too many skills');
  });
});

function FormHarness({
  errors,
  skills = [],
  children
}: {
  errors?: FieldErrors<JobPostFormValues>;
  skills?: string[];
  children: (form: UseFormReturn<JobPostFormValues>) => ReactNode;
}) {
  const form = useForm<JobPostFormValues>({
    defaultValues: {
      description: '',
      responsibilities: '',
      requirements: '',
      skills,
      application_deadline: '',
      visibility: ''
    },
    errors
  });
  const watched = useWatch({ control: form.control });
  return (
    <>
      {children(form)}
      <p>Form skills: {(watched.skills ?? []).join(', ')}</p>
      <p>Form visibility: {watched.visibility}</p>
    </>
  );
}

function renderDetails(props: { errors?: FieldErrors<JobPostFormValues>; skills?: string[] } = {}) {
  render(<FormHarness {...props}>{(form) => <JobPostDetailsSection form={form} />}</FormHarness>);
}

describe('JobPostDetailsSection', () => {
  it('shows the card title and the three text fields', () => {
    renderDetails();
    expect(screen.getByText('Job Details')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Job Description/ })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Responsibilities/ })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Requirements/ })).toBeInTheDocument();
  });

  it('starts all three counters at zero', () => {
    renderDetails();
    expect(screen.getAllByText(`0 / ${JOB_TEXT_LIMIT}`)).toHaveLength(3);
  });

  it('updates only the counter of the field being typed in', async () => {
    const user = userEvent.setup();
    renderDetails();
    await user.type(screen.getByRole('textbox', { name: /Responsibilities/ }), 'Cook');
    expect(screen.getByText(`4 / ${JOB_TEXT_LIMIT}`)).toBeInTheDocument();
    expect(screen.getAllByText(`0 / ${JOB_TEXT_LIMIT}`)).toHaveLength(2);
  });

  it('counts each field separately as you type', async () => {
    const user = userEvent.setup();
    renderDetails();
    await user.type(screen.getByRole('textbox', { name: /Job Description/ }), 'Hello');
    expect(screen.getByText(`5 / ${JOB_TEXT_LIMIT}`)).toBeInTheDocument();
  });

  it('limits each text field to the shared character limit', () => {
    renderDetails();
    screen
      .getAllByRole('textbox', { name: /Description|Responsibilities|Requirements/ })
      .forEach((box) => {
        expect(box).toHaveAttribute('maxlength', String(JOB_TEXT_LIMIT));
      });
  });

  it('shows each field error as an alert', () => {
    renderDetails({
      errors: {
        description: { type: 'required', message: 'Enter the job description' },
        responsibilities: { type: 'required', message: 'Enter the responsibilities' },
        requirements: { type: 'required', message: 'Enter the requirements' }
      }
    });
    const alerts = screen.getAllByRole('alert').map((alert) => alert.textContent);
    expect(alerts).toEqual([
      'Enter the job description',
      'Enter the responsibilities',
      'Enter the requirements'
    ]);
  });

  it('shows the skills error as an alert', () => {
    renderDetails({ errors: { skills: { type: 'custom', message: 'Fix the skills' } } });
    expect(screen.getByRole('alert')).toHaveTextContent('Fix the skills');
  });

  it('adds a skill to the form value', async () => {
    const user = userEvent.setup();
    renderDetails({ skills: ['Grill'] });
    await user.type(screen.getByRole('textbox', { name: 'Add a skill' }), 'Barista{Enter}');
    expect(screen.getByText('Form skills: Grill, Barista')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Barista' })).toBeInTheDocument();
  });

  it('removes a skill from the form value', async () => {
    const user = userEvent.setup();
    renderDetails({ skills: ['Grill', 'Barista'] });
    await user.click(screen.getByRole('button', { name: 'Remove Grill' }));
    expect(screen.getByText('Form skills: Barista')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove Grill' })).not.toBeInTheDocument();
  });
});

function renderSettings(errors?: FieldErrors<JobPostFormValues>) {
  render(
    <FormHarness errors={errors}>{(form) => <JobPostSettingsSection form={form} />}</FormHarness>
  );
}

describe('JobPostSettingsSection', () => {
  it('shows the card title', () => {
    renderSettings();
    expect(screen.getByText('Application Settings')).toBeInTheDocument();
  });

  it('does not let the deadline be set before today', () => {
    renderSettings();
    const deadline = screen.getByLabelText(/Application Deadline/);
    expect(deadline).toHaveAttribute('type', 'date');
    expect(deadline).toHaveAttribute('min', localToday());
  });

  it('offers the placeholder and every visibility option', () => {
    renderSettings();
    const options = within(screen.getByRole('combobox', { name: /Job Visibility/ })).getAllByRole(
      'option'
    );
    expect(options.map((option) => option.textContent)).toEqual([
      'Select visibility',
      ...JOB_VISIBILITY_OPTIONS.map((option) => option.label)
    ]);
    expect(options.map((option) => option.getAttribute('value'))).toEqual([
      '',
      ...JOB_VISIBILITY_OPTIONS.map((option) => option.value)
    ]);
  });

  it('writes the chosen visibility to the form value', async () => {
    const user = userEvent.setup();
    renderSettings();
    const first = JOB_VISIBILITY_OPTIONS[0]!;
    await user.selectOptions(screen.getByRole('combobox', { name: /Job Visibility/ }), first.value);
    expect(screen.getByText(`Form visibility: ${first.value}`)).toBeInTheDocument();
  });

  it('shows the deadline and visibility errors as alerts', () => {
    renderSettings({
      application_deadline: { type: 'required', message: 'Pick a deadline' },
      visibility: { type: 'required', message: 'Choose who can see the job' }
    });
    const alerts = screen.getAllByRole('alert').map((alert) => alert.textContent);
    expect(alerts).toEqual(['Pick a deadline', 'Choose who can see the job']);
  });
});
