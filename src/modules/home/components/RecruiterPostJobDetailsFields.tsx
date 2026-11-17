import { cn } from '@/shared/lib/cn';
import { Briefcase, ChefHat, Minus, Plus } from 'lucide-react';
import {
  POST_JOB_CATEGORY_OPTIONS,
  POST_JOB_EMPLOYMENT_TYPES,
  POST_JOB_SALARY_MAX_DIGITS,
  POST_JOB_SHIFTS
} from '../content/recruiterPostJobFormOptions';
import type {
  RecruiterPostJobDetailsState,
  RecruiterPostJobField,
  RecruiterPostJobIssues
} from '../lib/recruiterPostJobForm';
import { RecruiterFormSection } from './RecruiterFormSection';
import { RecruiterIconSelect } from './RecruiterIconSelect';
import { PostJobError, PostJobLabel, PostJobStatusIcon } from './RecruiterPostJobField';
import {
  recruiterPostJobGridDetailsRow2,
  recruiterSetupFieldClassPostJob
} from './recruiterSetupStyles';

interface RecruiterPostJobDetailsFieldsProps {
  values: RecruiterPostJobDetailsState;
  fieldErrors: RecruiterPostJobIssues;
  status: Partial<Record<RecruiterPostJobField, 'valid' | 'invalid'>>;
  onChange: (patch: Partial<RecruiterPostJobDetailsState>) => void;
  onBlur: (field: RecruiterPostJobField) => void;
}

const fieldClass = recruiterSetupFieldClassPostJob;

export function RecruiterPostJobDetailsFields({
  values,
  fieldErrors,
  status,
  onChange,
  onBlur
}: RecruiterPostJobDetailsFieldsProps) {
  return (
    <RecruiterFormSection icon={Briefcase} title="Job Details" density="postJob">
      <div className="grid gap-3 min-[1024px]:grid-cols-2 min-[1024px]:gap-x-6 min-[1024px]:gap-y-3.5">
        <div className="grid gap-2">
          <label htmlFor="post-job-title">
            <PostJobLabel label="Job Title" required />
          </label>
          <div className="relative">
            <input
              id="post-job-title"
              value={values.jobTitle}
              onChange={(e) => onChange({ jobTitle: e.target.value })}
              onBlur={() => onBlur('jobTitle')}
              placeholder="e.g., Cook / Chef"
              required
              aria-invalid={status.jobTitle === 'invalid' || undefined}
              aria-describedby={fieldErrors.jobTitle ? 'post-job-title-error' : undefined}
              data-valid={status.jobTitle === 'valid' ? 'true' : undefined}
              className={cn(fieldClass, 'pr-10')}
            />
            <PostJobStatusIcon state={status.jobTitle} className="top-1/2 -translate-y-1/2" />
          </div>
          <PostJobError id="post-job-title-error" message={fieldErrors.jobTitle} />
        </div>

        <div className="grid gap-2">
          <label htmlFor="post-job-category">
            <PostJobLabel label="Job Category" required />
          </label>
          <RecruiterIconSelect
            id="post-job-category"
            icon={ChefHat}
            value={values.jobCategory}
            onChange={(jobCategory) => onChange({ jobCategory })}
            onBlur={() => onBlur('jobCategory')}
            fieldClassName={fieldClass}
            invalid={status.jobCategory === 'invalid'}
            describedBy={fieldErrors.jobCategory ? 'post-job-category-error' : undefined}
          >
            {POST_JOB_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </RecruiterIconSelect>
          <PostJobError id="post-job-category-error" message={fieldErrors.jobCategory} />
        </div>
      </div>

      <div className={cn('grid gap-3 min-[1024px]:gap-y-3.5', recruiterPostJobGridDetailsRow2)}>
        <div
          id="post-job-openings"
          role="group"
          aria-labelledby="post-job-openings-label"
          className="grid gap-2"
        >
          <span id="post-job-openings-label">
            <PostJobLabel label="Number of Openings" required />
          </span>
          <div className="flex h-[43px] items-center gap-1 rounded-[12px] border border-[#d8dfea] bg-surface px-1">
            <button
              type="button"
              aria-label="Decrease openings"
              className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-[#d8dfea] bg-surface hover:bg-muted"
              onClick={() => onChange({ openings: Math.max(1, values.openings - 1) })}
            >
              <Minus className="size-4" />
            </button>
            <span
              aria-live="polite"
              className="min-w-[1.75rem] flex-1 text-center text-[17px] font-bold text-ink"
            >
              {values.openings}
            </span>
            <button
              type="button"
              aria-label="Increase openings"
              className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-[#d8dfea] bg-surface hover:bg-muted"
              onClick={() => onChange({ openings: Math.min(99, values.openings + 1) })}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="post-job-employment-type">
            <PostJobLabel label="Employment Type" required />
          </label>
          <select // guard-allow: post job employment type enum matches prototype native select
            id="post-job-employment-type"
            value={values.employmentType}
            onChange={(e) => onChange({ employmentType: e.target.value })}
            onBlur={() => onBlur('employmentType')}
            required
            aria-invalid={status.employmentType === 'invalid' || undefined}
            aria-describedby={
              fieldErrors.employmentType ? 'post-job-employment-type-error' : undefined
            }
            className={fieldClass}
          >
            {POST_JOB_EMPLOYMENT_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <PostJobError id="post-job-employment-type-error" message={fieldErrors.employmentType} />
        </div>

        <div className="grid gap-2">
          <label htmlFor="post-job-work-shift">
            <PostJobLabel label="Work Shift" required />
          </label>
          <select // guard-allow: post job shift enum matches prototype native select
            id="post-job-work-shift"
            value={values.workShift}
            onChange={(e) => onChange({ workShift: e.target.value })}
            onBlur={() => onBlur('workShift')}
            required
            aria-invalid={status.workShift === 'invalid' || undefined}
            aria-describedby={fieldErrors.workShift ? 'post-job-work-shift-error' : undefined}
            className={fieldClass}
          >
            {POST_JOB_SHIFTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <PostJobError id="post-job-work-shift-error" message={fieldErrors.workShift} />
        </div>

        <div className="grid gap-2">
          <label htmlFor="post-job-monthly-salary">
            <PostJobLabel label="Monthly Salary (₹)" required />
          </label>
          <div className="relative">
            <input
              id="post-job-monthly-salary"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={POST_JOB_SALARY_MAX_DIGITS}
              value={values.monthlySalary}
              onChange={(e) => onChange({ monthlySalary: e.target.value })}
              onBlur={() => onBlur('monthlySalary')}
              placeholder="e.g., 25000"
              required
              aria-invalid={status.monthlySalary === 'invalid' || undefined}
              aria-describedby={
                fieldErrors.monthlySalary ? 'post-job-monthly-salary-error' : undefined
              }
              data-valid={status.monthlySalary === 'valid' ? 'true' : undefined}
              className={cn(fieldClass, 'pr-10')}
            />
            <PostJobStatusIcon state={status.monthlySalary} className="top-1/2 -translate-y-1/2" />
          </div>
          <PostJobError id="post-job-monthly-salary-error" message={fieldErrors.monthlySalary} />
        </div>
      </div>
    </RecruiterFormSection>
  );
}
