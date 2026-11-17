import { Briefcase, GraduationCap, Grid3X3, MapPin, Phone, UserRound } from 'lucide-react';
import defaultAvatar from '../assets/hire-avatar-ramesh.jpg';
import { resumePhotoSrc } from '../lib/resumePhoto';
import type { ResumeWizardFormValues } from '../schemas/jobSeekerResumeWizard';
import { BrandMark } from './BrandMark';
import { cn } from '@/shared/lib/cn';

interface ResumePreviewDocumentProps {
  values: ResumeWizardFormValues;
  /** Flat white sheet for PDF capture — same template, no card chrome. */
  forPdf?: boolean;
}

function formatYears(value: string): string {
  if (value === 'Below 1') return 'Below 1 year';
  if (value === '1') return '1 year';
  return `${value} years`;
}

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  if (!year || !month) return value;
  const labels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  return `${labels[Number(month) - 1] ?? month} ${year}`;
}

export function ResumePreviewDocument({ values, forPdf = false }: ResumePreviewDocumentProps) {
  const skills = values.skills.filter(Boolean).slice(0, 8);

  return (
    <article
      id={forPdf ? undefined : 'resume-preview-sheet'}
      className={cn(
        'relative w-full min-w-0 overflow-hidden bg-surface',
        forPdf
          ? 'rounded-none border-0 shadow-none'
          : 'rounded-[18px] border border-line shadow-card min-[1280px]:shadow-[0_8px_24px_rgb(20_21_23/0.06)]'
      )}
    >
      <div
        className="pointer-events-none absolute -top-6 -right-8 size-40 rounded-full bg-brand-600/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 right-0 h-24 w-40 rounded-bl-[80px] bg-gradient-to-bl from-brand-600 to-brand-200/80"
        aria-hidden="true"
      />

      <div className="relative border-b border-line px-5 py-4 min-[768px]:px-7 min-[768px]:py-5 min-[1280px]:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <span className="inline-block origin-left scale-90">
            <BrandMark hideHiringLabel />
          </span>
          <div className="flex flex-wrap items-center gap-4 min-[640px]:flex-nowrap">
            <img
              src={resumePhotoSrc(values.photoDataUrl, defaultAvatar)}
              alt=""
              className="size-16 shrink-0 rounded-full border-2 border-line object-cover"
            />
            <div className="min-w-0">
              <h2 className="text-[22px] font-extrabold tracking-tight text-ink min-[1280px]:text-[24px]">
                {values.fullName}
              </h2>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold text-ink-600">
                <li className="flex items-center gap-1.5">
                  <Phone className="size-4 text-brand-600" aria-hidden="true" />
                  {values.mobile}
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-brand-600" aria-hidden="true" />
                  {values.city}
                </li>
                <li className="flex items-center gap-1.5">
                  <UserRound className="size-4 text-brand-600" aria-hidden="true" />
                  DOB: {values.dateOfBirth}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 px-5 py-5 min-[768px]:grid-cols-2 min-[768px]:gap-x-7 min-[768px]:px-7 min-[768px]:py-6 min-[1280px]:gap-x-8 min-[1280px]:px-8 min-[1280px]:py-7">
        <div className="flex min-w-0 flex-col gap-5">
          {values.professionalSummary ? (
            <section>
              <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
                <UserRound className="size-4 text-brand-600" aria-hidden="true" />
                Summary
              </h3>
              <p className="mt-2 break-words text-[13px] leading-relaxed font-semibold text-ink-600">
                {values.professionalSummary}
              </p>
            </section>
          ) : null}

          <section>
            <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
              <Grid3X3 className="size-4 text-brand-600" aria-hidden="true" />
              Skills
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] font-semibold break-words text-ink-600">
              {skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
            {values.languages.length > 0 ? (
              <p className="mt-3 break-words text-[12px] font-semibold text-ink-500">
                Languages: {values.languages.join(', ')}
              </p>
            ) : null}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <section>
            <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
              <GraduationCap className="size-4 text-brand-600" aria-hidden="true" />
              Education
            </h3>
            <p className="mt-2 text-[14px] font-extrabold text-ink">{values.qualification}</p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
              <Briefcase className="size-4 text-brand-600" aria-hidden="true" />
              Work Experience
            </h3>
            <ul className="mt-2 space-y-3">
              {values.workHistory.map((job) => (
                <li
                  key={`${job.workplaceType}-${job.jobTitle}-${job.startDate}`}
                  className="border-b border-line pb-3 last:border-0 last:pb-0"
                >
                  <p className="text-[14px] font-extrabold text-ink">
                    {job.jobTitle} — {job.workplaceType}
                  </p>
                  <p className="text-[12px] font-bold text-ink-500">
                    {job.employmentType}
                    {job.yearsOfExperience ? ` • ${formatYears(job.yearsOfExperience)}` : ''}
                    {job.startDate ? ` • Since ${formatMonth(job.startDate)}` : ''}
                  </p>
                  {job.description ? (
                    <p className="mt-1 break-words text-[13px] leading-relaxed font-semibold text-ink-600">
                      {job.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}
