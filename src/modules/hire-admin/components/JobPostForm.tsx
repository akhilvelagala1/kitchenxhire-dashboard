import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { ApiError } from '@/shared/api/errors';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import {
  JOB_POST_DEFAULTS,
  jobPostSchemaFor,
  toJobPostBody,
  type JobPostFormValues,
  type JobPostMode
} from '../schemas/adminJobPost';
import { JobPostDetailsSection } from './JobPostDetailsSection';
import { JobPostEmploymentSection } from './JobPostEmploymentSection';
import { JobPostInfoSection } from './JobPostInfoSection';
import { JobPostLocationSection } from './JobPostLocationSection';
import { JobPostSettingsSection } from './JobPostSettingsSection';
import { useCreateJob } from './jobPostMutations';
import { jobPostFormScope } from './jobPostStyles';

interface JobPostFormProps {
  onSaved: () => void;
}

// From lg: 36-unit pills; the `!` beats the shared Button's min-h-11, rounded-xl, px-4 and text-sm.
const footerButton =
  'lg:h-[calc(36*var(--u))] lg:min-h-0! lg:min-w-[calc(146*var(--u))] lg:rounded-full! lg:px-6! lg:text-dense-md!';

// Built per call so "not before today" always uses today's date, even in a tab left open overnight.
const publishResolver: Resolver<JobPostFormValues> = (values, context, options) =>
  zodResolver(jobPostSchemaFor('publish'))(values, context, options);

/**
 * The five job cards and the Save as Draft / Publish Job row. Publish goes through the form's
 * resolver; a draft only needs a title, so it is checked against the lighter draft schema directly.
 */
export function JobPostForm({ onSaved }: JobPostFormProps) {
  const create = useCreateJob();
  const [mode, setMode] = useState<JobPostMode>('publish');

  const form = useForm<JobPostFormValues>({
    resolver: publishResolver,
    defaultValues: JOB_POST_DEFAULTS
  });
  const { handleSubmit, setError, clearErrors, getValues } = form;

  async function send(values: JobPostFormValues, sendMode: JobPostMode) {
    setMode(sendMode);
    try {
      await create.mutateAsync(toJobPostBody(values, sendMode));
      onSaved();
    } catch (err) {
      // Server field errors land on the matching input; anything else already showed a toast.
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof JobPostFormValues, { message })
        );
      }
    }
  }

  const publish = handleSubmit((values) => send(values, 'publish'));

  function saveDraft() {
    const values = getValues();
    const result = jobPostSchemaFor('draft').safeParse(values);
    clearErrors();
    if (!result.success) {
      result.error.issues.forEach((issue, index) => {
        const field = issue.path[0] as keyof JobPostFormValues | undefined;
        if (field) setError(field, { message: issue.message }, { shouldFocus: index === 0 });
      });
      return;
    }
    void send(values, 'draft');
  }

  const submitting = create.isPending || form.formState.isSubmitting;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // Enter in a field and the Publish Job button both end up here.
        setMode('publish');
        void publish(event);
      }}
      className={cn('flex min-h-0 flex-1 flex-col', jobPostFormScope)}
    >
      <div className="flex flex-col gap-[calc(13*var(--u))]">
        <JobPostInfoSection form={form} />
        <JobPostLocationSection form={form} />
        <JobPostEmploymentSection form={form} />
        <JobPostDetailsSection form={form} />
        <JobPostSettingsSection form={form} />
      </div>
      <div className="mt-auto flex flex-wrap justify-end gap-3 pt-[calc(14*var(--u))]">
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          loading={submitting && mode === 'draft'}
          onClick={saveDraft}
          className={footerButton}
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          loading={submitting && mode === 'publish'}
          className={footerButton}
        >
          Publish Job
        </Button>
      </div>
    </form>
  );
}
