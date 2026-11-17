import { useMemo, useSyncExternalStore } from 'react';
import { settingsFormSchema } from '../schemas/adminSettings';
import { isMobileNumber, normalizePhone } from './phone';

const logoFileSchema = settingsFormSchema.shape.logo_file;

/** True for a PNG or JPG of 2 MB or less: the rule Save applies, so the tile never previews a file Save would refuse. */
export function isAcceptableLogo(file: File): boolean {
  return logoFileSchema.safeParse(file).success;
}

/** A stored or typed mobile number written 98785 43210. Anything else comes back as typed, so it can be fixed. */
export function formatSupportPhone(raw: string): string {
  const digits = normalizePhone(raw);
  return isMobileNumber(digits) ? `${digits.slice(0, 5)} ${digits.slice(5)}` : raw;
}

interface PreviewStore {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => string | null;
}

/** Makes the preview address when the screen starts listening and releases it when the listener leaves. */
function createPreviewStore(file: File | null): PreviewStore {
  let url: string | null = null;
  return {
    subscribe(onChange) {
      if (file) {
        url = URL.createObjectURL(file);
        onChange();
      }
      return () => {
        if (url) URL.revokeObjectURL(url);
        url = null;
      };
    },
    getSnapshot: () => url
  };
}

/** A temporary address that shows a chosen file in an img. Released when the file changes or the screen closes. */
export function useLogoPreview(file: File | null): string | null {
  const store = useMemo(() => createPreviewStore(file), [file]);
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
