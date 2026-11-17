/** Intent chosen on the public hire login sheet before mobile OTP. */
export type HireLoginIntent = 'job_seeker' | 'recruiter';

const HIRE_LOGIN_INTENT_KEY = 'kx-hire-login-intent';

export function writePendingLoginIntent(intent: HireLoginIntent) {
  try {
    sessionStorage.setItem(HIRE_LOGIN_INTENT_KEY, intent);
  } catch {
    // jsdom / private mode
  }
}

export function readPendingLoginIntent(): HireLoginIntent | null {
  try {
    const raw = sessionStorage.getItem(HIRE_LOGIN_INTENT_KEY);
    if (raw === 'job_seeker' || raw === 'recruiter') return raw;
  } catch {
    return null;
  }
  return null;
}

export function clearPendingLoginIntent() {
  try {
    sessionStorage.removeItem(HIRE_LOGIN_INTENT_KEY);
  } catch {
    // jsdom / private mode
  }
}
