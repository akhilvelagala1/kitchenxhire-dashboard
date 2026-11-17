import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { Job } from './types';

const POLL_MS = 1_500;

export function isJobDone(job: Job | undefined): boolean {
  return job?.status === 'SUCCEEDED' || job?.status === 'FAILED';
}

/** Polls GET /jobs/:id until the job finishes. Used by bulk import and export. */
export function useJob(jobId: string | null) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => apiClient.get<Job>(`/jobs/${jobId}`),
    enabled: jobId !== null,
    refetchInterval: (query) => (isJobDone(query.state.data) ? false : POLL_MS)
  });
}
