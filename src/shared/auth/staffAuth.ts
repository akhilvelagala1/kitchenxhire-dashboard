import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { clearAccessToken, setAccessToken } from './tokenStorage';

export interface StaffLoginPayload {
  email: string;
  password: string;
}

export interface StaffLoginResult {
  access_token: string;
  user_id: string;
  role: string;
}

/** Roles allowed to use the staff AppShell (platform admin superset). */
const STAFF_APP_ROLES = new Set([
  'PLATFORM_ADMIN',
  'FINANCE_ADMIN',
  'TECHNICAL_ADMIN',
  'RELATIONSHIP_MANAGER',
  'WAREHOUSE_SUPERVISOR',
  'WAREHOUSE_MANAGER'
]);

export function isStaffAppRole(role: string | undefined): boolean {
  return Boolean(role && STAFF_APP_ROLES.has(role));
}

export async function loginStaff(payload: StaffLoginPayload): Promise<StaffLoginResult> {
  const data = await apiClient.post<StaffLoginResult>('/auth/login', {
    email: payload.email.trim(),
    password: payload.password
  });
  if (!data.access_token) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: 'Sign-in did not return a session token.'
    });
  }
  setAccessToken(data.access_token);
  return data;
}

export function logoutStaff() {
  clearAccessToken();
}

export function staffLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.code === 'INVALID_CREDENTIALS') {
      return 'Incorrect email or password.';
    }
    if (error.status === 403 || error.code === 'FORBIDDEN') {
      return 'This account cannot access the admin platform.';
    }
    if (import.meta.env.DEV && error.code === 'NETWORK_ERROR') {
      return 'Cannot reach the API. Use VITE_API_BASE_URL=/api/v1 in .env and restart npm run dev, or start kitchenxhire-backend-go on port 8080.';
    }
    return error.message;
  }
  return 'Could not sign in. Check your connection and try again.';
}
