import { z } from 'zod';

/** Recruiter-level security and job-status notification toggles for /recruiter/account-settings. */
export const recruiterAccountPreferencesSchema = z.object({
  securityAlertsEnabled: z.boolean(),
  notifyJobPosted: z.boolean(),
  notifyJobApproved: z.boolean(),
  notifyJobRejected: z.boolean()
});

export type RecruiterAccountPreferences = z.infer<typeof recruiterAccountPreferencesSchema>;

export const DEFAULT_RECRUITER_ACCOUNT_PREFERENCES: RecruiterAccountPreferences = {
  securityAlertsEnabled: true,
  notifyJobPosted: true,
  notifyJobApproved: true,
  notifyJobRejected: true
};
