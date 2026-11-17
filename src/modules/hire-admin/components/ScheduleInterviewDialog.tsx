import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { useScheduleInterview } from './applicationMutations';
import { formatAppliedOn } from './formatAppliedOn';

/** The time typed in the box is India time, whatever the browser's own time zone is. */
const INDIA_OFFSET = '+05:30';

/** `2026-07-01T10:30` from a datetime-local box becomes `2026-07-01T10:30:00+05:30`. */
function toIndiaTimestamp(local: string): string {
  const withSeconds = local.length === 16 ? `${local}:00` : local;
  return `${withSeconds}${INDIA_OFFSET}`;
}

interface ScheduleInterviewDialogProps {
  application: HireAdminApplication;
  open: boolean;
  onClose: () => void;
}

export function ScheduleInterviewDialog({
  application,
  open,
  onClose
}: ScheduleInterviewDialogProps) {
  const formId = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  const schedule = useScheduleInterview();

  function close() {
    setValue('');
    setError(undefined);
    onClose();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!value) {
      setError('Pick a date and time');
      return;
    }
    schedule.mutate(
      { applicationId: application.application_id, interviewAt: toIndiaTimestamp(value) },
      { onSuccess: close }
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Schedule interview"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={schedule.isPending}>
            Schedule interview
          </Button>
        </>
      }
    >
      <div className="mb-4">
        <p className="font-medium">{application.candidate_name}</p>
        <p className="text-ink-soft">
          {application.job_title} ({application.application_id})
        </p>
        {application.interview_at && (
          <p className="mt-1 text-ink-soft">
            Currently scheduled for {formatAppliedOn(application.interview_at)}
          </p>
        )}
      </div>
      <form id={formId} noValidate onSubmit={submit}>
        <Field label="Interview date and time" required error={error}>
          <Input
            type="datetime-local"
            required
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(undefined);
            }}
          />
        </Field>
      </form>
    </Dialog>
  );
}
