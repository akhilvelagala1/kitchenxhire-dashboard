// Seed data for dev/mockApi.ts: about 3,000 categories, so pagination and search run at catalogue scale.
import type { ReportsExportDetail } from './reportsExport.ts';
import type { ReportRange } from './reportsMockData.ts';

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string | null;
  parent_id: string | null;
  parent_name: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sort_order: number;
  product_count: number;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Job {
  id: string;
  kind: 'IMPORT' | 'EXPORT';
  dry_run: boolean;
  startedAt: number;
  /** When set, export job serves CSV from GET /hire/admin/jobs/export-result/:id */
  hireExport?: boolean;
  hireExportJobIds?: string[];
  /** When set, this export job serves application CSV from GET /hire/admin/applications/export-result/:id */
  applicationsExportBody?: Record<string, unknown>;
  /** When set, this export job serves recruiter CSV from GET /hire/admin/recruiters/export-result/:id */
  recruitersExportBody?: Record<string, unknown>;
  /** When set, this export job serves business CSV from GET /hire/admin/businesses/export-result/:id */
  businessesExportBody?: Record<string, unknown>;
  /** When set, this export job serves category CSV from GET /hire/admin/categories/export-result/:id */
  categoriesExportBody?: Record<string, unknown>;
  /** When set, this export job serves job seeker CSV from GET /hire/admin/job-seekers/export-result/:id */
  jobSeekersExportBody?: Record<string, unknown>;
  /** When set, this export job serves user CSV from GET /hire/admin/users/export-result/:id */
  usersExportBody?: Record<string, unknown>;
  /** When set, this export job serves the Reports & Analytics CSV for this range from GET /hire/admin/reports/export-result/:id */
  reportsExportRange?: ReportRange;
  /** With reportsExportRange: the stat card that was open, so the file is that card's view and not the Overview. */
  reportsExportDetail?: ReportsExportDetail;
  /** Raw multipart body for hire job CSV import */
  hireImportRaw?: string;
  hireImportProcessed?: boolean;
}

const ROOTS = [
  'Dairy',
  'Produce',
  'Proteins',
  'Pantry',
  'Bakery',
  'Beverages',
  'Frozen',
  'Packaging',
  'Spices',
  'Oils'
];
const LEAVES = [
  'Premium',
  'Bulk',
  'Organic',
  'Imported',
  'Local',
  'Economy',
  'Chef Select',
  'Value'
];
const TOTAL = 3000;

export function seed(): Category[] {
  const rows: Category[] = [];
  const day = 86_400_000;
  for (let i = 0; i < TOTAL; i++) {
    const root = ROOTS[i % ROOTS.length]!;
    const isRoot = i < ROOTS.length;
    const parent = isRoot ? null : rows[i % ROOTS.length]!;
    const name = isRoot
      ? root
      : `${root} ${LEAVES[i % LEAVES.length]} ${Math.floor(i / ROOTS.length)}`;
    const updated = new Date(Date.UTC(2026, 9, 31) - (i % 120) * day).toISOString();
    rows.push({
      id: `cat-${String(i + 1).padStart(4, '0')}`,
      name,
      code: name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .slice(0, 30),
      description: null,
      parent_id: parent?.id ?? null,
      parent_name: parent?.name ?? null,
      status: i % 9 === 0 && !isRoot ? 'INACTIVE' : 'ACTIVE',
      sort_order: i,
      product_count: (i * 37) % 400,
      version: 1,
      created_at: updated,
      updated_at: updated,
      deleted_at: i % 50 === 7 ? updated : null
    });
  }
  return rows;
}
