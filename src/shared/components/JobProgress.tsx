import type { Job } from '@/shared/api/types';
import { StatusBadge } from './StatusBadge';

export function JobProgress({ job }: { job: Job }) {
  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div className="flex items-center justify-between">
        <StatusBadge status={job.status} />
        <span className="text-sm text-ink-soft">{job.progress_percent}%</span>
      </div>
      <progress
        className="w-full"
        max={100}
        value={job.progress_percent}
        aria-label="Job progress"
      />
      {job.summary && (
        <dl className="grid grid-cols-4 gap-2 text-center text-sm">
          {(['total', 'created', 'updated', 'failed'] as const).map((k) => (
            <div key={k}>
              <dt className="text-ink-soft capitalize">{k}</dt>
              <dd className="font-semibold">{job.summary![k]}</dd>
            </div>
          ))}
        </dl>
      )}
      {job.error_message && <p className="text-sm text-danger-600">{job.error_message}</p>}
    </div>
  );
}
