import { GST_CERTIFICATE_MAX_BYTES } from '../content/recruiterOrgFormOptions';

export type RecruiterOrgField =
  | 'name'
  | 'businessType'
  | 'gstNumber'
  | 'gstCertificate'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'state'
  | 'pinCode';

/** The order focus and scroll use when a submit finds several invalid fields. */
export const RECRUITER_ORG_FIELD_ORDER: RecruiterOrgField[] = [
  'name',
  'businessType',
  'gstNumber',
  'gstCertificate',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'pinCode'
];

const FOCUS_IDS: Record<RecruiterOrgField, string> = {
  name: 'recruiter-org-name',
  businessType: 'recruiter-org-businessType',
  gstNumber: 'recruiter-org-gstNumber',
  gstCertificate: 'recruiter-org-certificate',
  addressLine1: 'recruiter-org-addressLine1',
  addressLine2: 'recruiter-org-addressLine2',
  city: 'recruiter-org-city',
  state: 'recruiter-org-state',
  pinCode: 'recruiter-org-pinCode'
};

export function focusFirstOrgInvalid(fields: string[]) {
  for (const field of RECRUITER_ORG_FIELD_ORDER) {
    if (!fields.includes(field)) continue;
    const control = document.getElementById(FOCUS_IDS[field]);
    control?.scrollIntoView?.({ block: 'center' });
    control?.focus();
    return;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CertificateMimeType = 'application/pdf' | 'image/jpeg' | 'image/png';

export type CertificateInspection =
  { ok: true; mimeType: CertificateMimeType } | { ok: false; message: string };

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46]; // %PDF
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function sniff(head: Uint8Array): CertificateMimeType | null {
  const startsWith = (signature: number[]) =>
    signature.every((byte, index) => head[index] === byte);
  if (startsWith(PDF_SIGNATURE)) return 'application/pdf';
  if (startsWith(JPEG_SIGNATURE)) return 'image/jpeg';
  if (startsWith(PNG_SIGNATURE)) return 'image/png';
  return null;
}

function readHead(file: File): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result instanceof ArrayBuffer ? new Uint8Array(reader.result) : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}

/**
 * Check the real bytes before accepting a certificate: zero-byte files, files
 * over 5 MB, signatures that are not PDF/JPEG/PNG and a declared type that
 * disagrees with the contents are all rejected. The stored record keeps only
 * metadata — the prototype never uploads the document anywhere.
 */
export async function inspectCertificateFile(file: File): Promise<CertificateInspection> {
  if (file.size === 0) {
    return { ok: false, message: 'That file is empty. Choose another file.' };
  }
  if (file.size > GST_CERTIFICATE_MAX_BYTES) {
    return { ok: false, message: 'File must be 5 MB or smaller.' };
  }
  const head = await readHead(file);
  if (!head) return { ok: false, message: 'Could not read the file. Try again.' };
  const sniffed = sniff(head);
  if (!sniffed) return { ok: false, message: 'Upload a valid PDF, JPG or PNG file.' };
  if (file.type && file.type !== sniffed) {
    return {
      ok: false,
      message: 'The file contents do not match its type. Choose a real PDF, JPG or PNG.'
    };
  }
  return { ok: true, mimeType: sniffed };
}
