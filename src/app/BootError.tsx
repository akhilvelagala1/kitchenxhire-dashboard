/** Shown when the app fails before React mounts. Must not import env or the API client. */
export function BootError({ error }: { error: unknown }) {
  return (
    <div role="alert" className="mx-auto max-w-xl p-8">
      <h1 className="mb-2 text-xl font-semibold">The dashboard could not start</h1>
      <p className="mb-4 text-sm text-ink-soft">
        Usually a missing or invalid environment variable. Copy <code>.env.example</code> to{' '}
        <code>.env</code>, or run <code>npm run dev:mock</code> to use the built-in mock API.
      </p>
      <pre className="overflow-auto rounded bg-muted p-3 text-xs">{String(error)}</pre>
    </div>
  );
}
