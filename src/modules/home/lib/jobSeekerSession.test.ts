import { resolveJobSeekerProfile } from './jobSeekerProfile';
import {
  buildJobSeekerSessionForPhone,
  readJobSeekerSession,
  writeJobSeekerSession,
  JOB_SEEKER_LEGACY_PHONE_KEY,
  JOB_SEEKER_SESSION_KEY
} from './jobSeekerSession';

describe('resolveJobSeekerProfile', () => {
  it('maps known demo numbers to SK', () => {
    expect(resolveJobSeekerProfile('+91 99999 99999').initials).toBe('SK');
    expect(resolveJobSeekerProfile('+91 98765 43210').initials).toBe('SK');
  });

  it('uses KM for unknown numbers instead of digit suffixes', () => {
    expect(resolveJobSeekerProfile('+91 91234 56789').initials).toBe('KM');
  });
});

describe('readJobSeekerSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('migrates legacy phone-only storage to a full session', () => {
    sessionStorage.setItem(JOB_SEEKER_LEGACY_PHONE_KEY, '+91 99999 99999');
    const session = readJobSeekerSession();
    expect(session?.profile.initials).toBe('SK');
    expect(session?.phone).toBe('+91 99999 99999');
    expect(session?.profileComplete).toBe(true);
  });

  it('round-trips session json', () => {
    const built = buildJobSeekerSessionForPhone('+91 98765 43210');
    writeJobSeekerSession(built);
    const session = readJobSeekerSession();
    expect(session?.profile.displayName).toBe('Surya Kumar');
    expect(session?.profileComplete).toBe(true);
    expect(session?.candidate?.city).toBe('Hyderabad');
  });

  it('marks unknown phones incomplete until onboarding', () => {
    const built = buildJobSeekerSessionForPhone('+91 91234 56789');
    expect(built.profileComplete).toBe(false);
    expect(built.profile.displayName).toBe('KitchenX Member');
    writeJobSeekerSession(built);
    expect(JSON.parse(sessionStorage.getItem(JOB_SEEKER_SESSION_KEY)!).profileComplete).toBe(false);
  });
});
