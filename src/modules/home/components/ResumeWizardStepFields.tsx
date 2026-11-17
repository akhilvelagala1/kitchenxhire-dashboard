import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormClearErrors,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { ResumeWizardFormValues, ResumeWizardStepId } from '../schemas/jobSeekerResumeWizard';
import { ResumeWizardEducationFields } from './ResumeWizardEducationFields';
import { ResumeWizardPersonalFields } from './ResumeWizardPersonalFields';
import { ResumeWizardWorkFields } from './ResumeWizardWorkFields';

interface ResumeWizardStepFieldsProps {
  step: ResumeWizardStepId;
  register: UseFormRegister<ResumeWizardFormValues>;
  control: Control<ResumeWizardFormValues>;
  errors: FieldErrors<ResumeWizardFormValues>;
  setValue: UseFormSetValue<ResumeWizardFormValues>;
  clearErrors: UseFormClearErrors<ResumeWizardFormValues>;
  watch: UseFormWatch<ResumeWizardFormValues>;
  photoDataUrl?: string;
}

export function ResumeWizardStepFields({
  step,
  register,
  control,
  errors,
  setValue,
  clearErrors,
  watch,
  photoDataUrl
}: ResumeWizardStepFieldsProps) {
  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork
  } = useFieldArray({ control, name: 'workHistory' });

  if (step === 1) {
    return (
      <ResumeWizardPersonalFields
        register={register}
        errors={errors}
        photoDataUrl={photoDataUrl}
        setValue={setValue}
        watch={watch}
      />
    );
  }

  if (step === 2) {
    return (
      <ResumeWizardEducationFields
        errors={errors}
        setValue={setValue}
        clearErrors={clearErrors}
        watch={watch}
      />
    );
  }

  return (
    <ResumeWizardWorkFields
      register={register}
      errors={errors}
      setValue={setValue}
      watch={watch}
      workFields={workFields}
      appendWork={appendWork}
      removeWork={removeWork}
    />
  );
}
