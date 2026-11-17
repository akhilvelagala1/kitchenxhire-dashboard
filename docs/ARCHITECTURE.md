# Architecture

This app uses the same stack as `labha-dashboard`: React 19, Vite, TypeScript, react-router, TanStack Query, Tailwind 4, zod and react-hook-form. The difference is the layout. Here, shared pieces have one home and the folder boundaries are enforced by lint. The evidence behind each choice is in `docs/audit/LABHA_DASHBOARD_GAPS.md`.

## Folder structure

```text
src/
├── main.tsx                  # mounts <App/>
├── app/                      # bootstrapping only
│   ├── App.tsx               # QueryClient + Router + Toaster
│   ├── router.tsx            # shell route; module routes; errorElement on every route
│   ├── modules.ts            # THE module registry (nav + routes). Nothing else lists modules.
│   ├── RouteError.tsx, NotFoundPage.tsx
│   └── layout/               # AppShell (header, skip link, Suspense), Sidebar (permission-filtered)
├── config/env.ts             # zod-validated env; fails at boot, not on first request
├── styles/index.css          # Tailwind + design tokens (@theme)
├── shared/                   # domain-agnostic; never imports app/ or modules/
│   ├── api/                  # apiClient (only HTTP), ApiError, types, queryClient, useApiMutation, jobs
│   ├── auth/                 # tokenStorage, usePermissions (react-query)
│   ├── ui/                   # primitives: Button, Input/Select/Textarea, Field, Dialog, Badge, Spinner, Skeleton, toast
│   ├── components/           # composites: DataTable, Pagination, SearchInput, FilterBar, DateRangeFilter,
│   │                         #   AsyncSelect, ConfirmDialog, BulkActionBar, BulkImportDialog, ExportButton,
│   │                         #   JobProgress, AuditTrail, PageHeader, EmptyState, ErrorState, StatusBadge,
│   │                         #   PermissionGate/RequirePermission
│   ├── hooks/                # useListParams (URL state), useRowSelection, useDebouncedValue
│   ├── lib/                  # cn, dates, download
│   ├── types/module.ts       # AppModule / NavItem contract
│   └── test/                 # setup, renderPage helper
└── modules/
    └── <module>/             # one feature; never imports another module
        ├── index.ts          # public surface: AppModule { id, nav, routes }
        ├── routes.tsx        # lazy pages wrapped in RequirePermission
        ├── permissions.ts    # permission strings
        ├── page.contract.json# capabilities + waivers (guard:contracts)
        ├── api/              # <entity>Api.ts (endpoints), <entity>Keys.ts (key factory), <entity>Queries.ts (hooks)
        ├── schemas/          # zod form schema, entity types, payload mapping
        ├── components/       # module-private pieces (columns, form)
        └── pages/            # List, Detail, Form pages + tests next to them
```

## Why it looks like this

| Decision                                                                        | Reason (Labha evidence)                                                                                                                                        |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A module owns its routes, and `app/modules.ts` is the only registry             | Labha's `router.tsx` was 677 lines and listed every route. Orphaned pages stayed routable.                                                                     |
| `shared/ui` holds primitives and `shared/components` holds composites           | Labha had `components/ui`, `components/common` (one file), `common/` (empty), `lib/` and `utils/` with no rule between them.                                   |
| One composite per concept: DataTable, SearchInput, FilterBar, AsyncSelect, etc. | Labha had 21 raw `<table>`s, 38 raw `<select>`s, 5 hand-built pickers, pill filters copied into 8 files, no toast and no PageHeader (64 hand-written `<h1>`s). |
| List state lives in the URL (`useListParams`)                                   | Only 13 Labha module files used `useSearchParams`. Filters were lost on reload and could not be shared.                                                        |
| One query-key factory per module, and `useApiMutation` requires `invalidates`   | Labha had 210 inline key literals, no factory and 72 `as ApiError` casts. Stale tables appeared after failed writes.                                           |
| Permissions are read through react-query                                        | Labha kept them in a persisted store, so an RBAC edit did not take effect until a full reload.                                                                 |
| Bulk import and export run as server jobs with polling                          | They have to handle 3,000 to 4,000 products, so the browser must not parse or build the spreadsheet.                                                           |
| `errorElement` on every route                                                   | Labha had a single global boundary, so one crashing page blanked the whole app.                                                                                |
| The lockfile is committed, and CI and Docker use `npm ci`                       | Labha ignored `package-lock.json` and ran `npm install`, so builds were not reproducible.                                                                      |

## Adding a module

Follow `.claude/skills/new-page/SKILL.md`. In short: run the intake interview, then `npm run new:module -- <module> <Entity> <Plural> <route-prefix> <permission-prefix>`, then edit the fields and run `npm run verify`.

## Out of scope for this foundation

These come as follow-up pull requests, each with its own concern:

- The auth module: login, token refresh, and a session guard on the shell route.
- Host-based API selection for deployed environments, as Labha does in `labhaEnv.ts`.
- The ECR/ECS deploy workflow, once `kitchenxhire-infra` has the stack.
- i18n, when a second language is in scope.
- MSW mocks, for local development before the backend exists.
