import { useState, type ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, type UseFormReturn } from 'react-hook-form';
import {
  JOB_CATEGORY_OPTIONS,
  JOB_CITY_OPTIONS,
  JOB_DEPARTMENT_OPTIONS,
  JOB_EMPLOYMENT_TYPE_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_WORK_LOCATION_OPTIONS,
  JOB_WORK_SHIFT_OPTIONS,
  type JobPostFormValues
} from '../schemas/adminJobPost';
import { JobPostEmploymentSection } from './JobPostEmploymentSection';
import { JobPostInfoSection } from './JobPostInfoSection';
import { JobPostLocationSection } from './JobPostLocationSection';

const emptyValues: JobPostFormValues = {
  title: '',
  job_category: '',
  department: '',
  openings: '',
  city: '',
  work_location: '',
  address: '',
  employment_type: '',
  salary_min: '',
  salary_max: '',
  work_shift: '',
  experience_required: '',
  description: '',
  responsibilities: '',
  requirements: '',
  skills: [],
  application_deadline: '',
  visibility: ''
};

type RaisedErrors = [keyof JobPostFormValues, string][];

/** Hosts one card on a real react-hook-form instance, with two buttons to read values and raise errors. */
function Harness({
  errors = [],
  children
}: {
  errors?: RaisedErrors;
  children: (form: UseFormReturn<JobPostFormValues>) => ReactNode;
}) {
  const form = useForm<JobPostFormValues>({ defaultValues: emptyValues });
  const [dump, setDump] = useState('');
  return (
    <>
      {children(form)}
      <button type="button" onClick={() => setDump(JSON.stringify(form.getValues()))}>
        Read values
      </button>
      <button
        type="button"
        onClick={() => errors.forEach(([name, message]) => form.setError(name, { message }))}
      >
        Raise errors
      </button>
      <output aria-label="Current values">{dump}</output>
    </>
  );
}

async function readValues(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Read values' }));
  const text = screen.getByRole('status', { name: 'Current values' }).textContent;
  return JSON.parse(text ?? '{}') as JobPostFormValues;
}

function firstOption(options: readonly { value: string; label: string }[]) {
  const [first] = options;
  if (!first) throw new Error('Expected at least one option');
  return first;
}

describe('Job Information card', () => {
  const renderCard = (errors?: RaisedErrors) =>
    render(<Harness errors={errors}>{(form) => <JobPostInfoSection form={form} />}</Harness>);

  it('shows the title, description and the four labelled fields', () => {
    renderCard();

    const card = screen.getByRole('region', { name: 'Job Information' });
    expect(within(card).getByText('Basic details about the job posting.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /job title/i })).toHaveAttribute(
      'placeholder',
      'e.g. Cook / Chef'
    );
    expect(screen.getByRole('combobox', { name: /job category/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /department/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /number of openings/i })).toBeInTheDocument();
  });

  it('marks all four fields as required with a star', () => {
    renderCard();

    ['Job Title', 'Job Category', 'Department', 'Number of Openings'].forEach((label) => {
      expect(screen.getByText(label, { selector: 'label' })).toHaveTextContent(`${label} *`);
    });
  });

  it('lists a placeholder option followed by every category and department', () => {
    renderCard();

    const category = screen.getByRole('combobox', { name: /job category/i });
    const department = screen.getByRole('combobox', { name: /department/i });
    expect(within(category).getAllByRole('option')).toHaveLength(JOB_CATEGORY_OPTIONS.length + 1);
    expect(within(category).getByRole('option', { name: 'Select category' })).toHaveValue('');
    expect(within(department).getAllByRole('option')).toHaveLength(
      JOB_DEPARTMENT_OPTIONS.length + 1
    );
    expect(within(department).getByRole('option', { name: 'Select department' })).toHaveValue('');
  });

  it('limits openings to a whole number from 1 to 999', () => {
    renderCard();

    const openings = screen.getByRole('spinbutton', { name: /number of openings/i });
    expect(openings).toHaveAttribute('min', '1');
    expect(openings).toHaveAttribute('max', '999');
    expect(openings).toHaveAttribute('step', '1');
    expect(openings).toHaveAttribute('inputmode', 'numeric');
  });

  it('writes what the admin types and selects into the form values', async () => {
    const user = userEvent.setup();
    const category = firstOption(JOB_CATEGORY_OPTIONS);
    const department = firstOption(JOB_DEPARTMENT_OPTIONS);
    renderCard();

    await user.type(screen.getByRole('textbox', { name: /job title/i }), 'Head Chef');
    await user.selectOptions(
      screen.getByRole('combobox', { name: /job category/i }),
      category.value
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /department/i }),
      department.value
    );
    await user.type(screen.getByRole('spinbutton', { name: /number of openings/i }), '4');

    expect(await readValues(user)).toMatchObject({
      title: 'Head Chef',
      job_category: category.value,
      department: department.value,
      openings: '4'
    });
  });

  it('announces field errors next to the field and flags it invalid', async () => {
    const user = userEvent.setup();
    renderCard([
      ['title', 'Enter the job title'],
      ['openings', 'Enter at least 1 opening']
    ]);

    await user.click(screen.getByRole('button', { name: 'Raise errors' }));

    expect(screen.getByText('Enter the job title')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('Enter at least 1 opening')).toHaveAttribute('role', 'alert');
    expect(screen.getByRole('textbox', { name: /job title/i })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('combobox', { name: /department/i })).toHaveAttribute(
      'aria-invalid',
      'false'
    );
  });
});

describe('Job Location card', () => {
  const renderCard = (errors?: RaisedErrors) =>
    render(<Harness errors={errors}>{(form) => <JobPostLocationSection form={form} />}</Harness>);

  it('shows the title, description and the three labelled fields', () => {
    renderCard();

    const card = screen.getByRole('region', { name: 'Job Location' });
    expect(within(card).getByText('Where the job is based.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^city/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /work location/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Address' })).toHaveAttribute(
      'placeholder',
      'Street, area, city – PIN code'
    );
  });

  it('requires the city and work location but not the address', () => {
    renderCard();

    expect(screen.getByText('City', { selector: 'label' })).toHaveTextContent('City *');
    expect(screen.getByText('Work Location', { selector: 'label' })).toHaveTextContent(
      'Work Location *'
    );
    expect(screen.getByText('Address', { selector: 'label' })).toHaveTextContent(/^Address$/);
  });

  it('writes the chosen city, work location and typed address into the form values', async () => {
    const user = userEvent.setup();
    const city = firstOption(JOB_CITY_OPTIONS);
    const workLocation = firstOption(JOB_WORK_LOCATION_OPTIONS);
    renderCard();

    await user.selectOptions(screen.getByRole('combobox', { name: /^city/i }), city.value);
    await user.selectOptions(
      screen.getByRole('combobox', { name: /work location/i }),
      workLocation.value
    );
    await user.type(screen.getByRole('textbox', { name: 'Address' }), '12 MG Road – 560001');

    expect(await readValues(user)).toMatchObject({
      city: city.value,
      work_location: workLocation.value,
      address: '12 MG Road – 560001'
    });
  });

  it('announces field errors with role alert', async () => {
    const user = userEvent.setup();
    renderCard([
      ['city', 'Select the city'],
      ['work_location', 'Select the work location']
    ]);

    await user.click(screen.getByRole('button', { name: 'Raise errors' }));

    expect(screen.getByText('Select the city')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('Select the work location')).toHaveAttribute('role', 'alert');
    expect(screen.getByRole('combobox', { name: /^city/i })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });
});

describe('Employment Details card', () => {
  const renderCard = (errors?: RaisedErrors) =>
    render(<Harness errors={errors}>{(form) => <JobPostEmploymentSection form={form} />}</Harness>);

  it('shows the title, description and the select fields', () => {
    renderCard();

    const card = screen.getByRole('region', { name: 'Employment Details' });
    expect(within(card).getByText('Nature of employment and compensation.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /employment type/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /work shift/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /experience required/i })).toBeInTheDocument();
  });

  it('exposes the salary range as one labelled group with a minimum and a maximum input', () => {
    renderCard();

    const group = screen.getByRole('group', { name: /salary range/i });
    expect(within(group).getByRole('spinbutton', { name: 'Minimum salary' })).toBeInTheDocument();
    expect(within(group).getByRole('spinbutton', { name: 'Maximum salary' })).toBeInTheDocument();
    expect(group).toHaveTextContent('Salary Range *');
  });

  it('writes the selected options and salary range into the form values', async () => {
    const user = userEvent.setup();
    const type = firstOption(JOB_EMPLOYMENT_TYPE_OPTIONS);
    const shift = firstOption(JOB_WORK_SHIFT_OPTIONS);
    const experience = firstOption(JOB_EXPERIENCE_OPTIONS);
    renderCard();

    await user.selectOptions(
      screen.getByRole('combobox', { name: /employment type/i }),
      type.value
    );
    await user.type(screen.getByRole('spinbutton', { name: 'Minimum salary' }), '18000');
    await user.type(screen.getByRole('spinbutton', { name: 'Maximum salary' }), '25000');
    await user.selectOptions(screen.getByRole('combobox', { name: /work shift/i }), shift.value);
    await user.selectOptions(
      screen.getByRole('combobox', { name: /experience required/i }),
      experience.value
    );

    expect(await readValues(user)).toMatchObject({
      employment_type: type.value,
      salary_min: '18000',
      salary_max: '25000',
      work_shift: shift.value,
      experience_required: experience.value
    });
  });

  it('announces select errors with role alert', async () => {
    const user = userEvent.setup();
    renderCard([
      ['employment_type', 'Select the employment type'],
      ['work_shift', 'Select the work shift']
    ]);

    await user.click(screen.getByRole('button', { name: 'Raise errors' }));

    expect(screen.getByText('Select the employment type')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('Select the work shift')).toHaveAttribute('role', 'alert');
  });

  it('shows the minimum salary error beneath the range when both salary fields have one', async () => {
    const user = userEvent.setup();
    renderCard([
      ['salary_min', 'Enter the minimum salary'],
      ['salary_max', 'Enter the maximum salary']
    ]);

    await user.click(screen.getByRole('button', { name: 'Raise errors' }));

    const alert = screen.getByText('Enter the minimum salary');
    expect(alert).toHaveAttribute('role', 'alert');
    expect(screen.queryByText('Enter the maximum salary')).not.toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Minimum salary' })).toHaveAttribute(
      'aria-describedby',
      alert.id
    );
  });

  it('shows the maximum salary error when only that field has one', async () => {
    const user = userEvent.setup();
    renderCard([['salary_max', 'Maximum must be at least the minimum']]);

    await user.click(screen.getByRole('button', { name: 'Raise errors' }));

    expect(screen.getByText('Maximum must be at least the minimum')).toHaveAttribute(
      'role',
      'alert'
    );
    expect(screen.getByRole('spinbutton', { name: 'Maximum salary' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('spinbutton', { name: 'Minimum salary' })).toHaveAttribute(
      'aria-invalid',
      'false'
    );
  });
});
