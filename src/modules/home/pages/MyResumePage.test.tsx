import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { buildJobSeekerSessionForPhone, writeJobSeekerSession } from '../lib/jobSeekerSession';
import { JobSeekerSessionProvider } from '../layout/JobSeekerSessionProvider';
import { UserLayout } from '../layout/UserLayout';
import { clearResumeDraft, writeResumeDraft } from '../lib/resumeDraftStorage';
import { applyResumeDerivedContent } from '../lib/resumeSuggestions';
import {
  emptyResumeWizardValues,
  type ResumeWizardFormValues
} from '../schemas/jobSeekerResumeWizard';
import { MyResumePage } from './MyResumePage';
import { ResumePreviewPage } from './ResumePreviewPage';

function completeResume(): ResumeWizardFormValues {
  return applyResumeDerivedContent({
    ...emptyResumeWizardValues,
    fullName: 'Surya Kumar',
    mobile: '+91 98765 43210',
    city: 'Hyderabad, Telangana',
    dateOfBirth: '1995-01-15',
    gender: 'Male',
    qualification: '10th pass',
    languages: ['Hindi', 'English'],
    skills: ['Kitchen helper', 'Food prep', 'Cleaning', 'Vegetable cutting', 'Serving'],
    workHistory: [
      {
        jobTitle: 'Cook',
        workplaceType: 'Hotel',
        employmentType: 'Full-time',
        yearsOfExperience: '2',
        startDate: '2020-01',
        description: ''
      }
    ]
  });
}

function renderResume(path = '/user/resume') {
  writeJobSeekerSession(buildJobSeekerSessionForPhone('+91 98765 43210'));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <JobSeekerSessionProvider>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="user/resume" element={<MyResumePage />} />
            <Route path="user/resume/preview" element={<ResumePreviewPage />} />
            <Route path="user/documents" element={<h1>My Documents</h1>} />
          </Route>
        </Routes>
      </JobSeekerSessionProvider>
    </MemoryRouter>
  );
}

describe('MyResumePage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    writeJobSeekerSession(buildJobSeekerSessionForPhone('+91 98765 43210'));
    try {
      localStorage?.clear();
    } catch {
      // Node 26 jsdom may omit localStorage.
    }
    clearResumeDraft();
  });

  it('shows build resume wizard step one', async () => {
    renderResume();
    expect(await screen.findByRole('heading', { name: 'Build My Resume' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Personal Details' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Resume/i })).toBeInTheDocument();
    expect(screen.queryByText('No resume yet?')).not.toBeInTheDocument();
  });

  it('picks gender from the Hire listbox, not a native select', async () => {
    const user = userEvent.setup();
    renderResume();
    await screen.findByRole('heading', { name: 'Build My Resume' });

    expect(screen.queryByRole('combobox', { name: 'Gender' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Gender' }));
    await user.click(screen.getByRole('option', { name: 'Female' }));

    expect(screen.getByRole('button', { name: 'Gender' })).toHaveTextContent('Female');
    expect(screen.getByRole('heading', { name: 'Personal Details' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Education & Skills' })).not.toBeInTheDocument();
  });

  it('lets the user jump between the three wizard steps', async () => {
    const user = userEvent.setup();
    renderResume();
    await screen.findByRole('heading', { name: 'Personal Details' });

    await user.click(screen.getByRole('button', { name: /Education & Skills/ }));
    expect(screen.getByRole('heading', { name: 'Education & Skills' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Qualification' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Work Experience/ }));
    expect(screen.getByRole('heading', { name: 'Work Experience' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Cook, Helper, Waiter/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Years of experience' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/End date/i)).not.toBeInTheDocument();
  });

  it('keeps selected languages when saving education and skills', async () => {
    const user = userEvent.setup();
    renderResume();
    await screen.findByRole('heading', { name: 'Personal Details' });

    await user.click(screen.getByRole('button', { name: /Education & Skills/ }));
    await user.click(screen.getByRole('button', { name: 'Qualification' }));
    await user.click(screen.getByRole('option', { name: '10th pass' }));
    await user.click(screen.getByRole('button', { name: 'Languages' }));
    await user.click(screen.getByRole('option', { name: 'Hindi' }));
    await user.click(screen.getByRole('button', { name: /Save & Continue/ }));

    expect(screen.queryByText('Select at least one language')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Work Experience' })).toBeInTheDocument();
  });

  it('opens the resume preview from Save & Preview instead of My Documents', async () => {
    const user = userEvent.setup();
    writeResumeDraft({ step: 3, values: completeResume(), meta: {} }, '+91 98765 43210');
    renderResume();

    expect(await screen.findByRole('heading', { name: 'Work Experience' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Save & Preview/ }));

    expect(
      await screen.findByRole('heading', { name: 'Resume Preview' }, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'My Documents' })).not.toBeInTheDocument();
  });

  it('stays on the resume wizard when earlier steps are still incomplete', async () => {
    const user = userEvent.setup();
    writeResumeDraft(
      {
        step: 3,
        values: {
          ...emptyResumeWizardValues,
          qualification: 'Below 10th',
          languages: ['Hindi'],
          skills: ['Kitchen helper']
        },
        meta: {}
      },
      '+91 98765 43210'
    );
    renderResume();

    expect(await screen.findByRole('heading', { name: 'Work Experience' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Save & Preview/ }));

    expect(await screen.findByRole('heading', { name: 'Personal Details' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'My Documents' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Resume Preview' })).not.toBeInTheDocument();
  });
});
