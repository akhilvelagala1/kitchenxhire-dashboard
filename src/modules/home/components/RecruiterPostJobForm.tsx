import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { tryAppendRecruiterPostedJob } from '../lib/recruiterPostedJobsStore';
import {
  firstPostJobIssue,
  focusFirstPostJobInvalid,
  POST_JOB_DETAILS_DEFAULTS,
  POST_JOB_FIELD_ORDER,
  POST_JOB_REQUIREMENTS_DEFAULTS,
  validatePostJob,
  type RecruiterPostJobDetailsState,
  type RecruiterPostJobField,
  type RecruiterPostJobFormValues,
  type RecruiterPostJobIssues,
  type RecruiterPostJobRequirementsState
} from '../lib/recruiterPostJobForm';
import { RecruiterPostJobDetailsFields } from './RecruiterPostJobDetailsFields';
import { RecruiterPostJobRequirementsFields } from './RecruiterPostJobRequirementsFields';
import { RecruiterSetupFormActions } from './RecruiterSetupFormActions';
import {
  recruiterSetupFormCardPostJobFit,
  recruiterSetupFormLeadPostJob,
  recruiterSetupFormTitlePostJob
} from './recruiterSetupStyles';

interface RecruiterPostJobFormProps {
  accountId: string;
}

export function RecruiterPostJobForm({ accountId }: RecruiterPostJobFormProps) {
  const navigate = useNavigate();
  const [details, setDetails] = useState<RecruiterPostJobDetailsState>(POST_JOB_DETAILS_DEFAULTS);
  const [requirements, setRequirements] = useState<RecruiterPostJobRequirementsState>(
    POST_JOB_REQUIREMENTS_DEFAULTS
  );
  const [fieldErrors, setFieldErrors] = useState<RecruiterPostJobIssues>({});
  const [touched, setTouched] = useState<Partial<Record<RecruiterPostJobField, boolean>>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const values: RecruiterPostJobFormValues = { ...details, ...requirements };
  const live = validatePostJob(values);
  const liveIssues = live.ok ? {} : live.issues;

  const status: Partial<Record<RecruiterPostJobField, 'valid' | 'invalid'>> = {};
  for (const field of POST_JOB_FIELD_ORDER) {
    if (fieldErrors[field]) status[field] = 'invalid';
    else if (touched[field] && !liveIssues[field]) status[field] = 'valid';
  }

  function clearErrors(fields: RecruiterPostJobField[]) {
    setFieldErrors((prev) => {
      if (!fields.some((field) => prev[field])) return prev;
      const next = { ...prev };
      for (const field of fields) delete next[field];
      return next;
    });
  }

  function onDetailsChange(patch: Partial<RecruiterPostJobDetailsState>) {
    setDetails((prev) => ({ ...prev, ...patch }));
    clearErrors(Object.keys(patch) as RecruiterPostJobField[]);
  }

  function onRequirementsChange(patch: Partial<RecruiterPostJobRequirementsState>) {
    setRequirements((prev) => ({ ...prev, ...patch }));
    clearErrors(Object.keys(patch) as RecruiterPostJobField[]);
  }

  function onFieldBlur(field: RecruiterPostJobField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const issue = firstPostJobIssue(values, field);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (issue) next[field] = issue;
      else delete next[field];
      return next;
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setFormError('');
    const result = validatePostJob(values);
    if (!result.ok) {
      setFieldErrors(result.issues);
      focusFirstPostJobInvalid(Object.keys(result.issues));
      return;
    }

    setSubmitting(true);
    const saved = tryAppendRecruiterPostedJob(accountId, result.data);
    setSubmitting(false);
    if (!saved) {
      setFormError('Could not save this job on this device. Free some storage and try again.');
      return;
    }
    navigate('/recruiter', { replace: true });
  }

  function onCancel() {
    const dirty =
      Boolean(details.jobTitle.trim()) ||
      Boolean(details.monthlySalary.trim()) ||
      Boolean(requirements.jobDescription.trim()) ||
      Boolean(requirements.workLocation.trim());
    if (dirty && !window.confirm('Discard this job post?')) {
      return;
    }
    navigate('/recruiter');
  }

  return (
    <div className={recruiterSetupFormCardPostJobFit}>
      <header className="mb-5 shrink-0 min-[1024px]:mb-7">
        <h1 // guard-allow: recruiter post job uses hire marketing form heading, not admin PageHeader
          className={recruiterSetupFormTitlePostJob}
        >
          Post a Job
        </h1>
        <p className={recruiterSetupFormLeadPostJob}>
          Add a job opening with simple details and start hiring quickly.
        </p>
      </header>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit} noValidate>
        <div className="min-h-0 flex-1 space-y-0">
          <RecruiterPostJobDetailsFields
            values={details}
            fieldErrors={fieldErrors}
            status={status}
            onChange={onDetailsChange}
            onBlur={onFieldBlur}
          />
          <RecruiterPostJobRequirementsFields
            values={requirements}
            fieldErrors={fieldErrors}
            status={status}
            onChange={onRequirementsChange}
            onBlur={onFieldBlur}
          />

          {formError && (
            <p className="pt-3 text-[13px] font-medium text-danger-600" role="alert">
              {formError}
            </p>
          )}
        </div>

        <RecruiterSetupFormActions
          onCancel={onCancel}
          primaryLabel="Post Job"
          submitting={submitting}
          submittingLabel="Posting…"
          postJobFit
        />
      </form>
    </div>
  );
}
