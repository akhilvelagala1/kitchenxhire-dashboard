import { useState } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toErrorMessage } from '@/shared/api/errors';
import { isJobDone, useJob } from '@/shared/api/jobs';
import type { Job } from '@/shared/api/types';
import { downloadUrl } from '@/shared/lib/download';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { JobProgress } from './JobProgress';

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  entityLabel: string;
  templateUrl: string;
  /** Uploads the file; the server parses, maps columns, validates and returns a job. */
  upload: (file: File, opts: { dryRun: boolean }) => Promise<Job>;
  /** Caches to refresh after a committed import. */
  invalidates: QueryKey[];
}

const ACCEPT =
  '.csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Two-phase import: validate (dry run) shows row errors without writing, then
 * import commits. Parsing happens on the server so 4,000-row files do not freeze the tab.
 */
export function BulkImportDialog({
  open,
  onClose,
  entityLabel,
  templateUrl,
  upload,
  invalidates
}: BulkImportDialogProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: job } = useJob(jobId);
  const done = isJobDone(job);
  const validated =
    done && job?.dry_run && job.status === 'SUCCEEDED' && (job.summary?.failed ?? 0) === 0;

  async function start(dryRun: boolean) {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await upload(file, { dryRun });
      setJobId(created.id);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    if (done && job && !job.dry_run)
      invalidates.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    setFile(null);
    setJobId(null);
    setError(null);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={`Import ${entityLabel}`}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {done ? 'Close' : 'Cancel'}
          </Button>
          {!validated && (
            <Button
              variant="secondary"
              disabled={!file || (jobId !== null && !done)}
              loading={submitting}
              onClick={() => start(true)}
            >
              Validate
            </Button>
          )}
          <Button disabled={!validated} loading={submitting} onClick={() => start(false)}>
            Import
          </Button>
        </>
      }
    >
      <ol className="flex list-decimal flex-col gap-3 pl-5">
        <li>
          <button
            type="button"
            className="text-brand-600 underline"
            onClick={() => downloadUrl(templateUrl)}
          >
            Download the template
          </button>{' '}
          and fill one row per {entityLabel.toLowerCase()}. Reference columns accept a code or exact
          name.
        </li>
        <li>
          <input
            type="file"
            accept={ACCEPT}
            aria-label="Import file"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setJobId(null);
            }}
          />
        </li>
        <li>Validate first. Nothing is written until you press Import.</li>
      </ol>
      {error && (
        <p role="alert" className="mt-3 text-danger-600">
          {error}
        </p>
      )}
      {job && (
        <div className="mt-4">
          <JobProgress job={job} />
          {job.error_report_url && (
            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => downloadUrl(job.error_report_url!)}
            >
              Download row errors
            </Button>
          )}
        </div>
      )}
    </Dialog>
  );
}
