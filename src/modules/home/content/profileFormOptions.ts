/** Sentinel shown in the select when the user chooses manual entry. Never persist as the final value. */
export const PROFILE_OTHER_VALUE = '__other__';

export const PROFILE_OTHER_OPTION = {
  value: PROFILE_OTHER_VALUE,
  label: 'Other / Enter manually'
} as const;

export const PROFILE_CITY_OPTIONS = [
  { value: 'Hyderabad, Telangana', label: 'Hyderabad, Telangana' },
  { value: 'Bengaluru, Karnataka', label: 'Bengaluru, Karnataka' },
  { value: 'Chennai, Tamil Nadu', label: 'Chennai, Tamil Nadu' },
  { value: 'Mumbai, Maharashtra', label: 'Mumbai, Maharashtra' }
] as const;

export const PROFILE_ROLE_OPTIONS = [
  { value: 'Cook / Chef', label: 'Cook / Chef' },
  { value: 'Kitchen Helper', label: 'Kitchen Helper' },
  { value: 'Waiter / Server', label: 'Waiter / Server' },
  { value: 'Bakery Assistant', label: 'Bakery Assistant' },
  { value: 'Cleaning Staff', label: 'Cleaning Staff' }
] as const;

/** Primary skills for Create Profile → Skills & Experience (multi-select). */
export const PROFILE_SKILL_OPTIONS = [
  { value: 'Cooking', label: 'Cooking' },
  { value: 'Food Preparation', label: 'Food Preparation' },
  { value: 'Kitchen Hygiene', label: 'Kitchen Hygiene' },
  { value: 'Food Safety', label: 'Food Safety' },
  { value: 'Baking', label: 'Baking' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Dishwashing', label: 'Dishwashing' },
  { value: 'Inventory Handling', label: 'Inventory Handling' },
  { value: 'Packaging', label: 'Packaging' },
  { value: 'Customer Service', label: 'Customer Service' },
  { value: 'Cash Handling', label: 'Cash Handling' },
  { value: 'Teamwork', label: 'Teamwork' },
  { value: 'Machine Operation', label: 'Machine Operation' },
  { value: 'Warehouse Handling', label: 'Warehouse Handling' },
  { value: 'Loading & Unloading', label: 'Loading & Unloading' }
] as const;

export const PROFILE_SKILLS_MAX = 10;

/** Current / last role title options (Skills step). Distinct from preferred job role. */
export const PROFILE_CURRENT_ROLE_OPTIONS = [
  { value: 'Cook', label: 'Cook' },
  { value: 'Chef', label: 'Chef' },
  { value: 'Commis Chef', label: 'Commis Chef' },
  { value: 'Kitchen Helper', label: 'Kitchen Helper' },
  { value: 'Bakery Assistant', label: 'Bakery Assistant' },
  { value: 'Waiter / Server', label: 'Waiter / Server' },
  { value: 'Cleaner', label: 'Cleaner' },
  { value: 'Cleaning Staff', label: 'Cleaning Staff' },
  { value: 'Steward', label: 'Steward' },
  { value: 'Cashier', label: 'Cashier' },
  { value: 'Security Staff', label: 'Security Staff' },
  { value: 'Warehouse Assistant', label: 'Warehouse Assistant' },
  { value: 'Delivery Helper', label: 'Delivery Helper' }
] as const;

/** Persist multi-select skills as a stable comma-separated string. */
export function formatPrimarySkills(skills: readonly string[]): string {
  return [...new Set(skills.map((s) => s.trim()).filter(Boolean))].join(', ');
}

export function parsePrimarySkills(value: string): string[] {
  if (!value.trim()) return [];
  return [
    ...new Set(
      value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    )
  ];
}

export function withOtherOption<T extends { value: string; label: string }>(
  options: readonly T[]
): Array<T | typeof PROFILE_OTHER_OPTION> {
  return [...options, PROFILE_OTHER_OPTION];
}

export function isPresetProfileOption(
  options: readonly { value: string }[],
  value: string
): boolean {
  return options.some((opt) => opt.value === value);
}

/** First-time onboarding categories (match Complete Profile reference labels). */
export const ONBOARDING_CATEGORY_OPTIONS = [
  { value: 'Cook / Chef', label: 'Cook / Chef' },
  { value: 'Kitchen Helper', label: 'Kitchen Helper' },
  { value: 'Waiter / Service Staff', label: 'Waiter / Service Staff' },
  { value: 'Bakery Staff', label: 'Bakery Staff' },
  { value: 'Cleaning / Stewarding', label: 'Cleaning / Stewarding' },
  { value: 'Vegetable Cutting & Prep', label: 'Vegetable Cutting & Prep' },
  { value: 'Warehouse Staff', label: 'Warehouse Staff' },
  { value: 'Delivery / Support Staff', label: 'Delivery / Support Staff' }
] as const;

export const PROFILE_EXPERIENCE_OPTIONS = [
  { value: 'Fresher', label: 'Fresher' },
  { value: '0 - 1 Years', label: '0 - 1 Years' },
  { value: '1 - 3 Years', label: '1 - 3 Years' },
  { value: '3 - 5 Years', label: '3 - 5 Years' },
  { value: '5+ Years', label: '5+ Years' }
] as const;

export const PROFILE_AREA_OPTIONS_BY_CITY: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  Hyderabad: [
    { value: 'Hitech City', label: 'Hitech City' },
    { value: 'Madhapur', label: 'Madhapur' },
    { value: 'Gachibowli', label: 'Gachibowli' },
    { value: 'Banjara Hills', label: 'Banjara Hills' },
    { value: 'Secunderabad', label: 'Secunderabad' },
    { value: 'Kondapur', label: 'Kondapur' }
  ],
  Bengaluru: [
    { value: 'Koramangala', label: 'Koramangala' },
    { value: 'Indiranagar', label: 'Indiranagar' },
    { value: 'Whitefield', label: 'Whitefield' },
    { value: 'HSR Layout', label: 'HSR Layout' }
  ],
  Chennai: [
    { value: 'T Nagar', label: 'T Nagar' },
    { value: 'Anna Nagar', label: 'Anna Nagar' },
    { value: 'Velachery', label: 'Velachery' },
    { value: 'Adyar', label: 'Adyar' }
  ],
  Vijayawada: [
    { value: 'Auto Nagar', label: 'Auto Nagar' },
    { value: 'Benz Circle', label: 'Benz Circle' },
    { value: 'Governorpet', label: 'Governorpet' }
  ],
  Visakhapatnam: [
    { value: 'Dwaraka Nagar', label: 'Dwaraka Nagar' },
    { value: 'MVP Colony', label: 'MVP Colony' },
    { value: 'Gajuwaka', label: 'Gajuwaka' }
  ]
};

export const PROFILE_SALARY_OPTIONS = [
  { value: '₹12,000 - ₹18,000', label: '₹12,000 - ₹18,000' },
  { value: '₹18,000 - ₹25,000', label: '₹18,000 - ₹25,000' },
  { value: '₹25,000 - ₹35,000', label: '₹25,000 - ₹35,000' },
  { value: '₹35,000+', label: '₹35,000+' }
] as const;

export const PROFILE_QUALIFICATION_OPTIONS = [
  { value: '10th Pass', label: '10th Pass' },
  { value: '12th Pass', label: '12th Pass' },
  { value: 'Diploma (Hotel Management)', label: 'Diploma (Hotel Management)' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'Other', label: 'Other' }
] as const;
