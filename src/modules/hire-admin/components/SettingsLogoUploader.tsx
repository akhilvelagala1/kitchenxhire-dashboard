import { useId, useRef, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import kitchenxLogo from '../assets/kitchenx-logo.png';
import { SETTINGS_LOGO_TYPES, type SettingsFormValues } from '../schemas/adminSettings';
import { useCanEditSettings } from './settingsEditContext';
import { isAcceptableLogo, useLogoPreview } from './settingsPlatformInfo';

const MESSAGE_TEXT = 'text-sm lg:text-[calc(12.5*var(--u))]';

/**
 * The logo row of Platform Information: the logo tile, the Upload Logo button and its hint. A chosen
 * file is only held in the form (logo_file) and previewed here; the page uploads it on Save.
 * The tile shows the chosen file, else the saved logo, else the built-in KitchenX logo. A file that
 * fails the PNG/JPG and 2 MB rules is not previewed: its message replaces the hint instead.
 */
export function SettingsLogoUploader({ logoUrl }: { logoUrl: string | null }) {
  const canEdit = useCanEditSettings();
  const messageId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext<SettingsFormValues>();
  const chosen = useWatch({ control, name: 'logo_file' });
  const previewUrl = useLogoPreview(chosen && isAcceptableLogo(chosen) ? chosen : null);
  const shownUrl = previewUrl ?? logoUrl;
  const error = errors.logo_file?.message;

  function handleChoose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) setValue('logo_file', file, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 lg:flex-nowrap lg:gap-x-[calc(24*var(--u))]">
      <div className="flex h-[calc(69*var(--u))] w-[calc(179*var(--u))] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E8EF] bg-[#FFF6F1] p-2">
        {shownUrl ? (
          <img
            src={shownUrl}
            alt="Platform logo"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img src={kitchenxLogo} alt="KitchenX" className="h-5 max-w-full object-contain" />
        )}
      </div>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <Button
          variant="secondary"
          disabled={!canEdit}
          aria-describedby={messageId}
          onClick={() => inputRef.current?.click()}
          className="lg:h-[calc(40*var(--u))] lg:min-h-0 lg:rounded-[calc(9*var(--u))] lg:text-[calc(14.5*var(--u))]"
        >
          <Upload className="size-4" />
          Upload Logo
        </Button>
        {error ? (
          <p id={messageId} role="alert" className={`${MESSAGE_TEXT} text-danger-600`}>
            {error}
          </p>
        ) : (
          <p id={messageId} className={`${MESSAGE_TEXT} text-[#667085]`}>
            PNG, JPG up to 2MB (Recommended: 200 × 60)
          </p>
        )}
        <input
          ref={inputRef}
          type="file" // guard-allow: one logo image chosen on Settings and uploaded on Save, not a bulk import
          accept={SETTINGS_LOGO_TYPES.join(',')}
          hidden
          aria-label="Choose logo file"
          disabled={!canEdit}
          onChange={handleChoose}
        />
      </div>
    </div>
  );
}
