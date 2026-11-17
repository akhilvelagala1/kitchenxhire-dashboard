export type DocumentCategory = 'identity' | 'education' | 'experience' | 'other';
export type DocumentFilter = 'all' | DocumentCategory;
export type DocumentStatus = 'verified' | 'under-review' | 'rejected';
type DocumentKind = 'pdf' | 'jpg' | 'png' | 'other';

export interface JobDocument {
  id: string;
  name: string;
  sizeLabel: string;
  bytes: number;
  category: DocumentCategory;
  status: DocumentStatus;
  kind: DocumentKind;
  uploadedLabel: string;
  file?: File;
}

const DOCUMENT_FILE_TYPE_ERROR = 'Choose a PDF or image.';
const DOCUMENT_FILE_SIZE_ERROR = 'Choose a file under 10 MB.';

const MAX_BYTES = 10 * 1024 * 1024;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const DOCUMENT_FILTER_OPTIONS: { value: DocumentFilter; label: string }[] = [
  { value: 'all', label: 'All Documents' },
  { value: 'identity', label: 'Identity Proof' },
  { value: 'education', label: 'Education' },
  { value: 'experience', label: 'Experience' },
  { value: 'other', label: 'Other' }
];

export const DOCUMENT_CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'identity', label: 'Identity Proof' },
  { value: 'education', label: 'Education' },
  { value: 'experience', label: 'Experience' },
  { value: 'other', label: 'Other' }
];

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  verified: 'Verified',
  'under-review': 'Under Review',
  rejected: 'Rejected'
};

const SEED: JobDocument[] = [
  {
    id: 'doc-aadhaar',
    name: 'Aadhaar Card.pdf',
    sizeLabel: '1.2 MB',
    bytes: 1.2 * 1024 * 1024,
    category: 'identity',
    status: 'verified',
    kind: 'pdf',
    uploadedLabel: '4 Nov 2026, 11:20 AM'
  },
  {
    id: 'doc-pan',
    name: 'PAN Card.pdf',
    sizeLabel: '960 KB',
    bytes: 960 * 1024,
    category: 'identity',
    status: 'verified',
    kind: 'pdf',
    uploadedLabel: '4 Nov 2026, 11:25 AM'
  },
  {
    id: 'doc-education',
    name: 'Education Certificate.jpg',
    sizeLabel: '1.8 MB',
    bytes: 1.8 * 1024 * 1024,
    category: 'education',
    status: 'verified',
    kind: 'jpg',
    uploadedLabel: '4 Nov 2026, 11:30 AM'
  },
  {
    id: 'doc-experience',
    name: 'Experience Letter.pdf',
    sizeLabel: '2.4 MB',
    bytes: 2.4 * 1024 * 1024,
    category: 'experience',
    status: 'verified',
    kind: 'pdf',
    uploadedLabel: '4 Nov 2026, 11:35 AM'
  }
];

export function seedJobDocuments(): JobDocument[] {
  return SEED.map((doc) => ({ ...doc }));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
}

export function formatUploadedAt(date: Date): string {
  const hours24 = date.getHours();
  const hours = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const month = MONTHS[date.getMonth()] ?? 'Jan';
  return `${date.getDate()} ${month} ${date.getFullYear()}, ${hours}:${minutes} ${suffix}`;
}

export function documentCategoryLabel(category: DocumentCategory): string {
  return DOCUMENT_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? 'Other';
}

export function documentFileError(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) return DOCUMENT_FILE_TYPE_ERROR;
  if (file.size <= 0 || file.size > MAX_BYTES) return DOCUMENT_FILE_SIZE_ERROR;
  return null;
}

function kindFromName(name: string): DocumentKind {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'png') return 'png';
  return 'other';
}

let uploadSeq = 0;

export function createJobDocument(file: File, category: DocumentCategory): JobDocument {
  uploadSeq += 1;
  return {
    id: `doc-upload-${uploadSeq}`,
    name: file.name,
    bytes: file.size,
    sizeLabel: formatFileSize(file.size),
    category,
    status: 'under-review',
    kind: kindFromName(file.name),
    uploadedLabel: formatUploadedAt(new Date()),
    file
  };
}

export function replaceJobDocument(current: JobDocument, file: File): JobDocument {
  return {
    ...current,
    name: file.name,
    bytes: file.size,
    sizeLabel: formatFileSize(file.size),
    kind: kindFromName(file.name),
    uploadedLabel: formatUploadedAt(new Date()),
    status: 'under-review',
    file
  };
}

export function filterJobDocuments(
  documents: readonly JobDocument[],
  query: string,
  category: DocumentFilter
): JobDocument[] {
  const needle = query.trim().toLowerCase();
  return documents.filter((doc) => {
    const categoryOk = category === 'all' || doc.category === category;
    const nameOk = needle.length === 0 || doc.name.toLowerCase().includes(needle);
    return categoryOk && nameOk;
  });
}

export function jobDocumentCounts(documents: readonly JobDocument[]) {
  return {
    total: documents.length,
    verified: documents.filter((doc) => doc.status === 'verified').length,
    underReview: documents.filter((doc) => doc.status === 'under-review').length,
    rejected: documents.filter((doc) => doc.status === 'rejected').length
  };
}

export function downloadJobDocument(doc: JobDocument): void {
  const blob =
    doc.file ??
    new Blob(
      [
        `${doc.name}\n${doc.sizeLabel}\n${doc.uploadedLabel}\nKitchenX Hiring sample. Stored on this device only.\n`
      ],
      { type: 'text/plain' }
    );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.file ? doc.name : `${doc.name}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
