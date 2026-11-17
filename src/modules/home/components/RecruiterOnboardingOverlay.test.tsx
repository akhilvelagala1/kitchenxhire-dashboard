import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { RecruiterLayout } from '../layout/RecruiterLayout';
import { RecruiterSessionProvider } from '../layout/RecruiterSessionProvider';
import { isRecruiterProfileComplete, saveRecruiterProfile } from '../lib/recruiterOnboarding';
import { readRecruiterOrganisationRecord } from '../lib/recruiterOrganisationStorage';
import { writeRecruiterSession } from '../lib/recruiterSession';

const PHONE = '+91 98988 98989';
const ACCOUNT_ID = '919898898989';

function renderRecruiter() {
  return render(
    <MemoryRouter initialEntries={['/recruiter']}>
      <RecruiterSessionProvider>
        <Routes>
          <Route element={<RecruiterLayout />}>
            <Route path="recruiter" element={<div>Recruiter dashboard</div>} />
          </Route>
        </Routes>
      </RecruiterSessionProvider>
    </MemoryRouter>
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Full Name/i), 'Karthik Menon');
  await user.type(screen.getByLabelText(/Business \/ Restaurant Name/i), 'Spice Route Restaurant');
  await user.click(screen.getByRole('button', { name: /Business Type/i }));
  await user.click(screen.getByRole('option', { name: 'Restaurant' }));
  await user.click(screen.getByRole('button', { name: /City \/ Location/i }));
  await user.click(screen.getByRole('option', { name: 'Hyderabad' }));
}

describe('RecruiterOnboardingOverlay', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('asks a new recruiter for basic details over the dashboard', async () => {
    writeRecruiterSession({ phone: PHONE });
    renderRecruiter();

    expect(
      await screen.findByRole('heading', { name: /Complete Your Recruiter Profile/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Recruiter dashboard')).toBeInTheDocument();
    expect(screen.getByDisplayValue(PHONE)).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('blocks submission until the required fields are filled', async () => {
    const user = userEvent.setup();
    writeRecruiterSession({ phone: PHONE });
    renderRecruiter();
    await screen.findByRole('heading', { name: /Complete Your Recruiter Profile/i });

    await user.click(screen.getByRole('button', { name: /Complete Profile/i }));

    expect(await screen.findByText('Please enter your full name')).toBeInTheDocument();
    expect(screen.getByText('Enter your business or restaurant name.')).toBeInTheDocument();
    expect(screen.getByText('Choose a type of business.')).toBeInTheDocument();
    expect(screen.getByText('Choose your city or location.')).toBeInTheDocument();
    expect(isRecruiterProfileComplete(ACCOUNT_ID)).toBe(false);
  });

  it('saves the profile, seeds the organisation draft and closes the modal', async () => {
    const user = userEvent.setup();
    writeRecruiterSession({ phone: PHONE });
    renderRecruiter();
    await screen.findByRole('heading', { name: /Complete Your Recruiter Profile/i });

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Area \/ Locality/i }));
    await user.click(screen.getByRole('option', { name: 'Madhapur' }));
    await user.type(screen.getByLabelText(/Email Address/i), 'karthik@spiceroute.in');

    await user.click(screen.getByRole('button', { name: /Complete Profile/i }));

    expect(screen.getByText('Recruiter dashboard')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Complete Your Recruiter Profile/i })
    ).not.toBeInTheDocument();
    expect(isRecruiterProfileComplete(ACCOUNT_ID)).toBe(true);

    const record = readRecruiterOrganisationRecord(ACCOUNT_ID);
    expect(record.status).toBe('IN_PROGRESS');
    expect(record.draft).toMatchObject({
      name: 'Spice Route Restaurant',
      businessType: 'restaurant',
      city: 'Hyderabad'
    });
    expect(screen.getByText('KM')).toBeInTheDocument();
  });

  it('rejects a malformed email address', async () => {
    const user = userEvent.setup();
    writeRecruiterSession({ phone: PHONE });
    renderRecruiter();
    await screen.findByRole('heading', { name: /Complete Your Recruiter Profile/i });

    await fillRequiredFields(user);
    await user.type(screen.getByLabelText(/Email Address/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /Complete Profile/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(isRecruiterProfileComplete(ACCOUNT_ID)).toBe(false);
  });

  it('never asks a recruiter whose profile is already complete', () => {
    writeRecruiterSession({ phone: PHONE });
    saveRecruiterProfile(ACCOUNT_ID, {
      fullName: 'Karthik Menon',
      businessName: 'Spice Route Restaurant',
      businessType: 'restaurant',
      city: 'Hyderabad'
    });

    renderRecruiter();

    expect(screen.getByText('Recruiter dashboard')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Complete Your Recruiter Profile/i })
    ).not.toBeInTheDocument();
  });
});
