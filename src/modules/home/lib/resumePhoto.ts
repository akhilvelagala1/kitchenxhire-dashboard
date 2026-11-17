/** Ignore corrupt or non-image draft values so the default avatar shows. */
export function resumePhotoSrc(photoDataUrl: string | undefined, fallback: string): string {
  const trimmed = photoDataUrl?.trim();
  if (trimmed && trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return fallback;
}
