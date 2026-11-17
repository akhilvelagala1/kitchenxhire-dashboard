import type { Job } from '../schemas/home';

function words(value: string): string[] {
  return value
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** A job matches when every word of the role query and the city query appears in its search text. */
export function searchJobs(jobs: Job[], role: string, city: string): Job[] {
  const roleWords = words(role);
  const cityWords = words(city);
  return jobs.filter(
    (job) =>
      roleWords.every((w) => job.searchText.includes(w)) &&
      cityWords.every((w) => job.searchText.includes(w))
  );
}

export function emptyJobsMessage(city: string): string {
  const where = city.trim();
  return where
    ? `No matching jobs in ${where} yet. Try another role, or clear the search to see every Hyderabad opening.`
    : 'No matching jobs for that role yet. Clear the search to see recent Hyderabad openings.';
}
