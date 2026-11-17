import { Calendar, Camera, CheckCircle2, MapPin, UserRound } from 'lucide-react';
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import defaultAvatar from '../assets/hire-avatar-ramesh.jpg';
import { resumePhotoSrc } from '../lib/resumePhoto';
import { RESUME_CITY_OPTIONS, RESUME_GENDER_OPTIONS } from '../content/resumeFormOptions';
import type { ResumeWizardFormValues } from '../schemas/jobSeekerResumeWizard';
import { ProfileIconSelect } from './ProfileIconSelect';
import { resumeFieldInput, resumeFieldLabel, resumeWizardFieldsWrap } from './styles';

interface ResumeWizardPersonalFieldsProps {
  register: UseFormRegister<ResumeWizardFormValues>;
  errors: FieldErrors<ResumeWizardFormValues>;
  photoDataUrl?: string;
  setValue: UseFormSetValue<ResumeWizardFormValues>;
  watch: UseFormWatch<ResumeWizardFormValues>;
}

export function ResumeWizardPersonalFields({
  register,
  errors,
  photoDataUrl,
  setValue,
  watch
}: ResumeWizardPersonalFieldsProps) {
  const displayPhoto = resumePhotoSrc(photoDataUrl, defaultAvatar);

  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValue('photoDataUrl', reader.result, { shouldDirty: true });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  return (
    <div
      className={cn(
        resumeWizardFieldsWrap,
        'grid gap-3 min-[1024px]:grid-cols-[112px_minmax(0,1fr)] min-[1024px]:gap-x-5 min-[1024px]:gap-y-3'
      )}
    >
      <div className="flex flex-col items-center gap-1 min-[1024px]:row-span-2 min-[1024px]:items-start">
        <div className="relative size-[112px] overflow-hidden rounded-full border-2 border-line bg-muted">
          <img src={displayPhoto} alt="" className="size-full object-cover" />
          <label className="absolute right-0 bottom-0 grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-surface text-brand-600 shadow-btn-white">
            <Camera className="size-3.5" aria-hidden="true" />
            <input
              type="file" // guard-allow: profile photo picker on public resume wizard
              accept="image/*"
              className="sr-only"
              onChange={onPhotoChange}
            />
          </label>
        </div>
        <p className="text-[12px] font-semibold text-ink-500">Profile photo</p>
      </div>

      <div className="grid gap-3 min-[640px]:grid-cols-2 min-[1024px]:col-start-2 min-[1024px]:gap-x-4 min-[1024px]:gap-y-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="resume-fullName" className={resumeFieldLabel}>
            Full Name
          </label>
          <Input id="resume-fullName" {...register('fullName')} className={resumeFieldInput} />
          {errors.fullName && (
            <p role="alert" className="text-[12px] text-danger-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="resume-mobile" className={resumeFieldLabel}>
            Mobile Number
          </label>
          <div className="relative">
            <Input
              id="resume-mobile"
              readOnly
              {...register('mobile')}
              className={cn(resumeFieldInput, 'pr-[6.5rem]')}
            />
            <span className="absolute top-1/2 right-2.5 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-extrabold text-success-600">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Verified
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 min-[640px]:grid-cols-2 min-[1024px]:col-start-2 min-[1024px]:grid-cols-3 min-[1024px]:gap-x-4 min-[1024px]:gap-y-3">
        <ProfileIconSelect
          label="City / Location"
          icon={MapPin}
          name="city"
          value={watch('city')}
          onChange={(next) => setValue('city', next, { shouldDirty: true, shouldValidate: true })}
          error={errors.city}
          options={[...RESUME_CITY_OPTIONS]}
          variant="resume"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="resume-dob" className={resumeFieldLabel}>
            Date of Birth
          </label>
          <div className="relative">
            <Calendar
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-600"
              aria-hidden="true"
            />
            <Input
              id="resume-dob"
              type="date"
              {...register('dateOfBirth')}
              className={cn(resumeFieldInput, 'pl-10')}
            />
          </div>
          {errors.dateOfBirth && (
            <p role="alert" className="text-[12px] text-danger-600">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <ProfileIconSelect
          label="Gender"
          icon={UserRound}
          name="gender"
          value={watch('gender')}
          onChange={(next) => setValue('gender', next, { shouldDirty: true, shouldValidate: true })}
          error={errors.gender}
          options={[...RESUME_GENDER_OPTIONS]}
          variant="resume"
        />
      </div>
    </div>
  );
}
