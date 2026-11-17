# labha-dashboard: gaps this repo fixes

`labha-dashboard` is our closest sibling, and kitchenxhire-dashboard follows its stack. This file records what it lacks for a production admin at KitchenXHire scale, measured on its `develop` head in November 2026 (519 source files, 206 test files). Each row names the place in this repo that fixes the gap.

## Reusable components

| Concept                       | labha-dashboard                                                                                   | kitchenxhire-dashboard                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Table                         | `ui/DataTable` has no sort, selection or column state. 21 module files still write raw `<table>`. | `shared/components/DataTable`: server sort, selection, pagination, loading/empty/error built in. PC-05 bans raw `<table>`. |
| Pagination                    | Prev/next only, no page size. 8 copies of `DEFAULT_PAGE_SIZE`.                                    | `Pagination` with page size; `useListParams` owns defaults.                                                                |
| Search                        | A hook only; each page renders its own input.                                                     | `SearchInput`, debounced and synced to the URL.                                                                            |
| Filters                       | Pill-filter markup copied into 8 files.                                                           | `FilterBar`, `DateRangeFilter`.                                                                                            |
| Entity picker                 | 38 raw `<select>`s and 5 hand-built pickers (one is 1,055 lines).                                 | `AsyncSelect`, searched on the server, keyboard-accessible.                                                                |
| Confirm                       | An inline `ConfirmButton`, plus one `window.confirm`.                                             | `ConfirmDialog` with an optional reason for the audit trail. ESLint bans `confirm`.                                        |
| Toast                         | None; 114 ad-hoc `onError` handlers.                                                              | `toast`, wired into `useApiMutation`.                                                                                      |
| Page header                   | None; 64 hand-written `<h1>`s.                                                                    | `PageHeader`; PC-05 bans `<h1>` in modules.                                                                                |
| Bulk select / import / export | None.                                                                                             | `BulkActionBar`, `BulkImportDialog` (dry run, job, error report), `ExportButton` (job).                                    |
| Audit                         | None.                                                                                             | `AuditTrail`.                                                                                                              |
| Status tone                   | `statusTone` has 10 users; there are 172 ad-hoc `tone=` props.                                    | One `StatusBadge` map.                                                                                                     |

## Structure and data

| Area             | labha-dashboard                                                                                                | kitchenxhire-dashboard                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Folder rules     | `components/common` (1 file), `common/` (empty), `lib/` vs `utils/` without a rule. Modules import each other. | `app` / `shared` / `modules`, enforced by ESLint `no-restricted-imports` (CS-01, CS-02). |
| Routes           | One 677-line `router.tsx`.                                                                                     | Modules export routes; `app/modules.ts` is the single registry.                          |
| Query keys       | 210 inline literals, no factory.                                                                               | A key factory per module (CS-05).                                                        |
| Mutations        | 72 `as ApiError` casts, no shared error handling.                                                              | `useApiMutation` with required `invalidates` and a default error toast.                  |
| Permissions      | A persisted zustand store; stale after an RBAC edit.                                                           | `usePermissions` via react-query.                                                        |
| Validation       | zod in 2 files; 394 lines of hand-written validators.                                                          | zod schemas plus react-hook-form per module.                                             |
| Error boundaries | One global boundary; no route `errorElement`.                                                                  | `errorElement` on every route.                                                           |

## Tooling

| Area       | labha-dashboard                                                                                      | kitchenxhire-dashboard                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Dead code  | Nothing detects it. 37 of 46 `marketing/components/ui` files are unused, and tsconfig excludes them. | `knip` in pre-push and CI. Nothing is excluded from tsconfig.                          |
| Lint       | No boundaries, `no-console`, `max-lines` or `no-explicit-any` error.                                 | All of these.                                                                          |
| Coverage   | No thresholds.                                                                                       | A coverage report in CI. Thresholds are set once real modules land.                    |
| Lockfile   | Gitignored; CI and Docker run `npm install`.                                                         | Committed; `npm ci` everywhere.                                                        |
| Pre-commit | Lints the whole repo.                                                                                | `lint-staged` plus `guard`.                                                            |
| nginx      | No security headers.                                                                                 | CSP, HSTS, XFO, Referrer-Policy, Permissions-Policy.                                   |
| CodeQL     | `upload: false`, so results are never reported.                                                      | Not added yet. Enable it once the repo has GitHub Advanced Security, or rely on Sonar. |
