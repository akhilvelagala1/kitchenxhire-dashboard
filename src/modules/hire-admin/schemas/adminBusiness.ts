export const BUSINESS_STATUSES = ['active', 'inactive', 'under_review', 'suspended'] as const;
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  under_review: 'Under Review',
  suspended: 'Suspended'
};

/** Statuses a person can set by hand. New businesses start as Under Review. */
export type BusinessSettableStatus = Exclude<BusinessStatus, 'under_review'>;

/** Tabs above the table. Under Review and Suspended sit in All only. */
export const BUSINESS_TABS = ['all', 'active', 'inactive'] as const;
export type BusinessTab = (typeof BUSINESS_TABS)[number];

export const BUSINESS_TAB_LABELS: Record<BusinessTab, string> = {
  all: 'All Businesses',
  active: 'Active',
  inactive: 'Inactive'
};

/** Verification is independent of account status. */
export type BusinessVerification = 'verified' | 'pending' | 'unverified';

export const BUSINESS_VERIFICATION_LABELS: Record<BusinessVerification, string> = {
  verified: 'Verified',
  pending: 'Pending',
  unverified: 'Unverified'
};

/** What kind of business it is. A warehouse counts as a business with a single outlet. */
export const BUSINESS_KINDS = ['Restaurant', 'Cloud Kitchen', 'Food Court', 'Warehouse'] as const;
export type BusinessKind = (typeof BUSINESS_KINDS)[number];

export interface HireAdminBusiness {
  /** For example `BUS0642`. */
  business_id: string;
  business_name: string;
  business_type: BusinessKind;
  /** Neighbourhood, for example `Rajiv Nagar`. Shown as `Rajiv Nagar, Hyderabad`. */
  area: string;
  city: string;
  owner_name: string;
  /** 10 digits, no country code. Shown as `+91 98765 43210`. */
  phone: string;
  email: string;
  /** How many outlets belong to the business. A business that was just added has none yet. */
  outlets: number;
  status: BusinessStatus;
  verification: BusinessVerification;
  /** ISO timestamp with offset. Shown in India time (Asia/Kolkata). */
  joined_at: string;
}

/** What the add and edit dialogs send. A new business starts as under review with no outlets. */
export interface BusinessInput {
  business_name: string;
  business_type: BusinessKind;
  area: string;
  city: string;
  owner_name: string;
  phone: string;
  email: string;
}

export interface HireBusinessesSummary {
  /** Every business, whatever its status. */
  total: number;
  active: number;
  inactive: number;
  /** Outlets of all businesses. */
  outlets: number;
  /** Outlets of businesses that are active. */
  active_outlets: number;
  /** Businesses whose type is Warehouse. */
  warehouses: number;
  /** Percent change against last month. */
  growth_pct: Record<
    'total' | 'active' | 'inactive' | 'outlets' | 'active_outlets' | 'warehouses',
    number
  >;
}
