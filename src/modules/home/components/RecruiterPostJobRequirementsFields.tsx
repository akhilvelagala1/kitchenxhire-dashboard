import { MapPin, UserRound } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  POST_JOB_AGE_OPTIONS,
  POST_JOB_DESCRIPTION_MAX,
  POST_JOB_EXPERIENCE,
  POST_JOB_GENDER,
  POST_JOB_LOCATION_MAX,
  POST_JOB_QUALIFICATION
} from '../content/recruiterPostJobFormOptions';
import type {
  RecruiterPostJobField,
  RecruiterPostJobIssues,
  RecruiterPostJobRequirementsState
} from '../lib/recruiterPostJobForm';
import { RecruiterFormSection } from './RecruiterFormSection';
import { PostJobError, PostJobLabel, PostJobStatusIcon } from './RecruiterPostJobField';
import {
  recruiterPostJobGridCandidateRow1,
  recruiterPostJobGridCandidateRow2,
  recruiterSetupFieldClassPostJob,
  recruiterSetupTextareaClassPostJob
} from './recruiterSetupStyles';

interface RecruiterPostJobRequirementsFieldsProps {
  values: RecruiterPostJobRequirementsState;
  fieldErrors: RecruiterPostJobIssues;
  status: Partial<Record<RecruiterPostJobField, 'valid' | 'invalid'>>;
  onChange: (patch: Partial<RecruiterPostJobRequirementsState>) => void;
  onBlur: (field: RecruiterPostJobField) => void;
}

const fieldClass = recruiterSetupFieldClassPostJob;

export function RecruiterPostJobRequirementsFields({
  values,
  fieldErrors,
  status,
  onChange,
  onBlur
}: RecruiterPostJobRequirementsFieldsProps) {
  return (
    <>
      <RecruiterFormSection icon={UserRound} title="Candidate Requirements" density="postJob">
        <div className={cn('grid gap-3 min-[1024px]:gap-y-3.5', recruiterPostJobGridCandidateRow1)}>
          <div className="grid gap-2">
            <label htmlFor="post-job-preferred-gender">
              <PostJobLabel label="Preferred Gender" />
            </label>
            <select // guard-allow: post job gender enum matches prototype native select
              id="post-job-preferred-gender"
              value={values.preferredGender}
              onChange={(e) => onChange({ preferredGender: e.target.value })}
              onBlur={() => onBlur('preferredGender')}
              aria-invalid={status.preferredGender === 'invalid' || undefined}
              aria-describedby={
                fieldErrors.preferredGender ? 'post-job-preferred-gender-error' : undefined
              }
              className={fieldClass}
            >
              {POST_JOB_GENDER.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <PostJobError
              id="post-job-preferred-gender-error"
              message={fieldErrors.preferredGender}
            />
          </div>

          <div className="grid gap-2">
            <span>
              <PostJobLabel label="Age Range" />
            </span>
            <div className="flex h-[43px] items-center gap-2">
              <select // guard-allow: post job age range enum matches prototype native select
                id="post-job-age-min"
                value={values.ageMin}
                onChange={(e) => onChange({ ageMin: Number(e.target.value) })}
                onBlur={() => onBlur('ageMin')}
                className={fieldClass}
                aria-label="Minimum age"
                aria-invalid={fieldErrors.ageMax ? true : undefined}
                aria-describedby={fieldErrors.ageMax ? 'post-job-age-max-error' : undefined}
              >
                {POST_JOB_AGE_OPTIONS.map((age) => (
                  <option key={`min-${age}`} value={age}>
                    {age}
                  </option>
                ))}
              </select>
              <span className="text-[14px] font-bold text-ink-500">to</span>
              <select // guard-allow: post job age range enum matches prototype native select
                id="post-job-age-max"
                value={values.ageMax}
                onChange={(e) => onChange({ ageMax: Number(e.target.value) })}
                onBlur={() => onBlur('ageMax')}
                className={fieldClass}
                aria-label="Maximum age"
                aria-invalid={fieldErrors.ageMax ? true : undefined}
                aria-describedby={fieldErrors.ageMax ? 'post-job-age-max-error' : undefined}
              >
                {POST_JOB_AGE_OPTIONS.map((age) => (
                  <option key={`max-${age}`} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>
            <PostJobError id="post-job-age-max-error" message={fieldErrors.ageMax} />
          </div>

          <div aria-hidden="true" className="hidden min-[1024px]:block" />
        </div>

        <div
          className={cn(
            'grid gap-3 min-[1024px]:items-start min-[1024px]:gap-y-3.5',
            recruiterPostJobGridCandidateRow2
          )}
        >
          <div className="grid gap-2">
            <label htmlFor="post-job-qualification">
              <PostJobLabel label="Qualification" />
            </label>
            <select // guard-allow: post job qualification enum matches prototype native select
              id="post-job-qualification"
              value={values.qualification}
              onChange={(e) => onChange({ qualification: e.target.value })}
              onBlur={() => onBlur('qualification')}
              aria-invalid={status.qualification === 'invalid' || undefined}
              aria-describedby={
                fieldErrors.qualification ? 'post-job-qualification-error' : undefined
              }
              className={fieldClass}
            >
              {POST_JOB_QUALIFICATION.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <PostJobError id="post-job-qualification-error" message={fieldErrors.qualification} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="post-job-experience">
              <PostJobLabel label="Experience" />
            </label>
            <select // guard-allow: post job experience enum matches prototype native select
              id="post-job-experience"
              value={values.experience}
              onChange={(e) => onChange({ experience: e.target.value })}
              onBlur={() => onBlur('experience')}
              aria-invalid={status.experience === 'invalid' || undefined}
              aria-describedby={fieldErrors.experience ? 'post-job-experience-error' : undefined}
              className={fieldClass}
            >
              {POST_JOB_EXPERIENCE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <PostJobError id="post-job-experience-error" message={fieldErrors.experience} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="post-job-description">
              <PostJobLabel label="Job Description" required />
            </label>
            <div className="relative">
              <textarea
                id="post-job-description"
                value={values.jobDescription}
                onChange={(e) => onChange({ jobDescription: e.target.value })}
                onBlur={() => onBlur('jobDescription')}
                placeholder="Describe daily responsibilities, kitchen duties, required skills and expectations..."
                rows={3}
                maxLength={POST_JOB_DESCRIPTION_MAX}
                required
                aria-invalid={status.jobDescription === 'invalid' || undefined}
                aria-describedby={
                  fieldErrors.jobDescription ? 'post-job-description-error' : undefined
                }
                data-valid={status.jobDescription === 'valid' ? 'true' : undefined}
                className={cn(recruiterSetupTextareaClassPostJob, 'pr-10')}
              />
              <PostJobStatusIcon state={status.jobDescription} className="top-3" />
            </div>
            <PostJobError id="post-job-description-error" message={fieldErrors.jobDescription} />
          </div>
        </div>
      </RecruiterFormSection>

      <RecruiterFormSection icon={MapPin} title="Job Location" density="postJob">
        <div className="grid gap-2">
          <label htmlFor="post-job-work-location">
            <PostJobLabel label="Address / Work Location" required />
          </label>
          <div className="relative">
            <input
              id="post-job-work-location"
              value={values.workLocation}
              onChange={(e) => onChange({ workLocation: e.target.value })}
              onBlur={() => onBlur('workLocation')}
              placeholder="e.g., Hitech City, Hyderabad"
              maxLength={POST_JOB_LOCATION_MAX}
              required
              aria-invalid={status.workLocation === 'invalid' || undefined}
              aria-describedby={
                fieldErrors.workLocation ? 'post-job-work-location-error' : undefined
              }
              data-valid={status.workLocation === 'valid' ? 'true' : undefined}
              className={cn(fieldClass, 'pr-10')}
            />
            <PostJobStatusIcon state={status.workLocation} className="top-1/2 -translate-y-1/2" />
          </div>
          <PostJobError id="post-job-work-location-error" message={fieldErrors.workLocation} />
        </div>
      </RecruiterFormSection>
    </>
  );
}
