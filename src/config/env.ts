import { z } from 'zod';

const envSchema = z.object({
  // Absolute URL, or a same-origin path such as /api/v1 (used by `npm run dev:mock`).
  VITE_API_BASE_URL: z.union([z.url(), z.string().regex(/^\/[\w/-]*$/)])
});

// Fail at boot, not on the first request, when the build is misconfigured.
export const env = envSchema.parse(import.meta.env);
