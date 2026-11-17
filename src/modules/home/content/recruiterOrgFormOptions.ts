/** Recruiter organisation setup — business domain options (prototype; backend may own canonical list). */
export const RECRUITER_BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cloud_kitchen', label: 'Cloud Kitchen' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'catering', label: 'Catering' },
  { value: 'other', label: 'Other' }
] as const;

/** Role the person holds at the business — collected on the post-OTP onboarding modal. */
export const RECRUITER_ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr_admin', label: 'HR & Admin' },
  { value: 'other', label: 'Other' }
] as const;

export const RECRUITER_STATE_OPTIONS = [
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Maharashtra',
  'Andhra Pradesh',
  'Kerala'
] as const;

/** Cities offered in the organisation form (city dropdown is independent of header locality). */
export const RECRUITER_ORG_CITY_OPTIONS = [
  'Hyderabad',
  'Secunderabad',
  'Bengaluru',
  'Chennai',
  'Mumbai',
  'Pune'
] as const;

/** Default state when a city is picked (prototype mapping). */
export const CITY_TO_DEFAULT_STATE: Record<string, string> = {
  Hyderabad: 'Telangana',
  Secunderabad: 'Telangana',
  Bengaluru: 'Karnataka',
  Chennai: 'Tamil Nadu',
  Mumbai: 'Maharashtra',
  Pune: 'Maharashtra'
};

export const GST_CERTIFICATE_MAX_BYTES = 5 * 1024 * 1024;
export const GST_CERTIFICATE_ACCEPT = '.pdf,.jpg,.jpeg,.png';
