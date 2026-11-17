import { renderHook } from '@testing-library/react';
import { SETTINGS_LOGO_MAX_BYTES } from '../schemas/adminSettings';
import { formatSupportPhone, isAcceptableLogo, useLogoPreview } from './settingsPlatformInfo';

function logoFile(type: string, bytes = 4) {
  return new File([new Uint8Array(bytes)], 'logo', { type });
}

describe('formatSupportPhone', () => {
  it('writes a stored 10-digit number as 98785 43210', () => {
    expect(formatSupportPhone('9878543210')).toBe('98785 43210');
  });

  it('accepts spaces, dashes and a +91 in front', () => {
    expect(formatSupportPhone('+91 98123-45678')).toBe('98123 45678');
    expect(formatSupportPhone('98123 45678')).toBe('98123 45678');
  });

  it('leaves anything that is not a mobile number as typed', () => {
    expect(formatSupportPhone('12345')).toBe('12345');
    expect(formatSupportPhone('1234567890')).toBe('1234567890');
    expect(formatSupportPhone('')).toBe('');
  });
});

describe('isAcceptableLogo', () => {
  it('accepts a PNG or JPG up to 2 MB', () => {
    expect(isAcceptableLogo(logoFile('image/png'))).toBe(true);
    expect(isAcceptableLogo(logoFile('image/jpeg'))).toBe(true);
    expect(isAcceptableLogo(logoFile('image/png', SETTINGS_LOGO_MAX_BYTES))).toBe(true);
  });

  it('refuses other image types and anything over 2 MB', () => {
    expect(isAcceptableLogo(logoFile('image/gif'))).toBe(false);
    expect(isAcceptableLogo(logoFile('image/png', SETTINGS_LOGO_MAX_BYTES + 1))).toBe(false);
  });
});

describe('useLogoPreview', () => {
  let count = 0;
  const createObjectURL = vi.fn(() => `blob:preview-${++count}`);
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    count = 0;
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
  });

  it('gives nothing while no file is chosen', () => {
    const { result } = renderHook(() => useLogoPreview(null));

    expect(result.current).toBeNull();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('gives an address for the chosen file and releases it when the file goes away', () => {
    const file = logoFile('image/png');
    const { result, rerender } = renderHook(({ chosen }) => useLogoPreview(chosen), {
      initialProps: { chosen: null as File | null }
    });

    rerender({ chosen: file });
    expect(result.current).toBe('blob:preview-1');
    expect(createObjectURL).toHaveBeenCalledWith(file);

    rerender({ chosen: null });
    expect(result.current).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
  });

  it('releases the old address when another file replaces it, and the last one on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ chosen }) => useLogoPreview(chosen), {
      initialProps: { chosen: logoFile('image/png') as File | null }
    });
    expect(result.current).toBe('blob:preview-1');

    rerender({ chosen: logoFile('image/jpeg') });
    expect(result.current).toBe('blob:preview-2');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview-2');
  });
});
