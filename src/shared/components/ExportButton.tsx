import { useEffect, useRef, useState } from 'react';
import { toErrorMessage } from '@/shared/api/errors';
import { isJobDone, useJob } from '@/shared/api/jobs';
import type { Job } from '@/shared/api/types';
import { downloadUrl } from '@/shared/lib/download';
import { Button } from '@/shared/ui/Button';
import { toast } from '@/shared/ui/toast';

/** Exports the current filtered view as a server job and downloads the file when ready. */
export function ExportButton({
  start,
  label = 'Export',
  className
}: {
  start: () => Promise<Job>;
  label?: string;
  className?: string;
}) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const { data: job } = useJob(jobId);
  const handled = useRef<string | null>(null);
  const busy = starting || (jobId !== null && !isJobDone(job));

  useEffect(() => {
    if (!job || !isJobDone(job) || handled.current === job.id) return;
    handled.current = job.id;
    if (job.status === 'SUCCEEDED' && job.result_url) downloadUrl(job.result_url);
    else toast.error(job.error_message ?? 'Export failed.');
  }, [job]);

  async function run() {
    setStarting(true);
    try {
      setJobId((await start()).id);
    } catch (err) {
      toast.error(toErrorMessage(err));
    } finally {
      setStarting(false);
    }
  }

  return (
    <Button variant="secondary" loading={busy} onClick={run} className={className}>
      {busy ? 'Preparing file…' : label}
    </Button>
  );
}
