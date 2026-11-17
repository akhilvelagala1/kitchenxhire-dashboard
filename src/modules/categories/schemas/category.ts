import { z } from 'zod';

export const CATEGORY_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string | null;
  parent_id: string | null;
  parent_name: string | null;
  status: (typeof CATEGORY_STATUSES)[number];
  sort_order: number;
  product_count: number;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters').max(80),
  code: z
    .string()
    .trim()
    .regex(/^[A-Z0-9_-]{2,30}$/, 'Upper-case letters, digits, - or _ (2–30)'),
  description: z.string().trim().max(500).optional(),
  parent: z.object({ value: z.string(), label: z.string() }).nullable(),
  status: z.enum(CATEGORY_STATUSES),
  sort_order: z.number().int().min(0).max(9999)
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function toCategoryPayload(v: CategoryFormValues) {
  return {
    name: v.name,
    code: v.code,
    description: v.description || null,
    parent_id: v.parent?.value ?? null,
    status: v.status,
    sort_order: v.sort_order
  };
}
