export type TrendRange = '7d' | '30d' | '90d';

/** The date filter of the Recruiters, Job Seekers and Users lists. `all` sends nothing. */
export type JoinedPreset = 'all' | '7d' | '30d' | '90d';

export interface FilterOption {
  value: string;
  label: string;
}
