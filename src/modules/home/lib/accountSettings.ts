import type { JobSeekerSessionState } from './jobSeekerSession';

export type AccountSettingsTab = 'profile' | 'security' | 'notifications' | 'privacy';

export type ProfileVisibility = 'everyone' | 'employers' | 'only-me';

export interface AccountSettingsValues {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  photoDataUrl: string;
  jobAlerts: boolean;
  applicationUpdates: boolean;
  interviewNotifications: boolean;
  promotionalNotifications: boolean;
  profileVisibility: ProfileVisibility;
  showMobileToEmployers: boolean;
  showEmailToEmployers: boolean;
}

export const ACCOUNT_VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'employers', label: 'Employers only' },
  { value: 'only-me', label: 'Only me' }
];

const DEMO_EMAIL = 'kitchenx.member@gmail.com';
const DEMO_MOBILE = '+91 92244 23323';

/** Reference screen defaults. A signed-in name and mobile replace the demo ones. */
export function buildAccountSettings(session: JobSeekerSessionState | null): AccountSettingsValues {
  return {
    fullName: session?.profile.displayName ?? 'KitchenX Member',
    email: DEMO_EMAIL,
    mobile: session?.phone || DEMO_MOBILE,
    city: 'Hyderabad, Telangana',
    photoDataUrl: '',
    jobAlerts: true,
    applicationUpdates: true,
    interviewNotifications: true,
    promotionalNotifications: false,
    profileVisibility: 'employers',
    showMobileToEmployers: false,
    showEmailToEmployers: false
  };
}

export function accountSettingsError(values: AccountSettingsValues): string | null {
  if (values.fullName.trim().length < 2) return 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    return 'Enter a valid email address.';
  }
  if (values.mobile.trim().length < 10) return 'Mobile number is required.';
  if (!values.city.trim()) return 'Select your city.';
  return null;
}
