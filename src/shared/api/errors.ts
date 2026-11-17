export type FieldErrors = Record<string, string>;

/** The one error type views handle. apiClient converts every failure into it. */
export class ApiError extends Error {
  readonly status: number | undefined;
  readonly code: string;
  readonly fieldErrors: FieldErrors;

  constructor(opts: { message: string; code: string; status?: number; fieldErrors?: FieldErrors }) {
    super(opts.message);
    this.name = 'ApiError';
    this.code = opts.code;
    this.status = opts.status;
    this.fieldErrors = opts.fieldErrors ?? {};
  }

  get isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }
}

export function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Try again.';
}
