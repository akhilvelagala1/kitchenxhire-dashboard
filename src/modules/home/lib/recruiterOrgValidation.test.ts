import { describe, expect, it } from 'vitest';
import { formatFileSize, inspectCertificateFile } from './recruiterOrgValidation';

function fileOf(bytes: number[], name: string, type: string) {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe('inspectCertificateFile', () => {
  it('accepts a PDF whose bytes match its declared type', async () => {
    await expect(
      inspectCertificateFile(fileOf([0x25, 0x50, 0x44, 0x46, 0x2d], 'gst.pdf', 'application/pdf'))
    ).resolves.toEqual({ ok: true, mimeType: 'application/pdf' });
  });

  it('accepts a JPEG whose bytes match its declared type', async () => {
    await expect(
      inspectCertificateFile(fileOf([0xff, 0xd8, 0xff, 0xe0], 'gst.jpg', 'image/jpeg'))
    ).resolves.toEqual({ ok: true, mimeType: 'image/jpeg' });
  });

  it('accepts a PNG whose bytes match its declared type', async () => {
    await expect(
      inspectCertificateFile(
        fileOf([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'gst.png', 'image/png')
      )
    ).resolves.toEqual({ ok: true, mimeType: 'image/png' });
  });

  it('rejects a file whose declared type does not match its bytes', async () => {
    await expect(
      inspectCertificateFile(fileOf([0x25, 0x50, 0x44, 0x46], 'fake.png', 'image/png'))
    ).resolves.toMatchObject({ ok: false });
  });

  it('rejects a file whose bytes are not a supported document', async () => {
    await expect(
      inspectCertificateFile(fileOf([0x47, 0x49, 0x46, 0x38], 'gst.gif', 'image/gif'))
    ).resolves.toMatchObject({ ok: false });
  });

  it('rejects an empty file', async () => {
    await expect(
      inspectCertificateFile(new File([], 'empty.pdf', { type: 'application/pdf' }))
    ).resolves.toEqual({ ok: false, message: 'That file is empty. Choose another file.' });
  });

  it('rejects a file larger than 5 MB', async () => {
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.pdf', {
      type: 'application/pdf'
    });
    await expect(inspectCertificateFile(oversized)).resolves.toMatchObject({
      ok: false,
      message: expect.stringContaining('5 MB')
    });
  });
});

describe('formatFileSize', () => {
  it('formats bytes, kilobytes and megabytes', () => {
    expect(formatFileSize(900)).toBe('900 B');
    expect(formatFileSize(1200)).toBe('1.2 KB');
    expect(formatFileSize(250_000)).toBe('244 KB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});
