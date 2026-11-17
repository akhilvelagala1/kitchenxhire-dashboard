// The auth module owns sign-in and refresh. Session token in sessionStorage only (never localStorage).
const KEY = 'kx.access_token';

export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string) {
  try {
    sessionStorage.setItem(KEY, token);
  } catch {
    // Vitest/jsdom may omit sessionStorage in some Node builds.
  }
}

export function clearAccessToken() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // private mode / test env
  }
}
