# KitchenXHire dashboard — organization and best practices

Human-readable copy of the agent prompt in `.claude/skills/kitchenxhire-repo-standards/SKILL.md`.

**Project:** `kitchenxhire-dashboard`  
**Rules:** `AGENTS.md`, `.cursor/skills/` / `.claude/skills/`, `docs/ARCHITECTURE.md`  
**Labha lessons:** `docs/audit/LABHA_DASHBOARD_GAPS.md`

## 1. Folder structure (three layers)

| Layer     | Path                  | Purpose                                                          |
| --------- | --------------------- | ---------------------------------------------------------------- |
| App shell | `src/app/`            | Router, `modules.ts`, `PublicRoot`, admin layout — no feature UI |
| Shared    | `src/shared/`         | UI primitives/composites, API, auth, hooks — no domain           |
| Features  | `src/modules/<name>/` | One area per folder; no cross-module imports                     |

**Personas (8):** homePage · Customer (app) · six staff roles — see `personas` skill. One staff `AppShell`; each role sees only necessary nav and actions; Platform Admin superset.

## 2. Reusable components

- `src/shared/ui/` — primitives
- `src/shared/components/` — DataTable, filters, PageHeader, etc.
- Module-only UI in `src/modules/<m>/components/`
- Admin reference: `src/modules/categories`; public reference: `src/modules/home`
- Promote to shared on second use (CS-07). No raw table/select in admin modules (PC-05).

## 3. List rows and state

Server lists via `apiClient.list`; URL state via `useListParams`; `DataTable` + `Pagination`; `useRowSelection` for bulk. Flow: Page → hooks → API → apiClient. Scaffold: `npm run new:module`.

## 4. Permissions

Module `permissions.ts`; session via `usePermissions()`; `RequirePermission` / `PermissionGate`; sidebar from module `nav`. G-02: UI is not authorization.

## 5. Authentication

Token storage and `/auth/me` via shared auth hooks. Full auth module planned. No client credentials (G-06).

## 6. Modules

Standard admin layout: `index.ts`, `routes.tsx`, `permissions.ts`, `page.contract.json`, `api/`, `schemas/`, `components/`, `pages/`. Public home adds `publicRoutes`. Register in `modules.ts` only. CS-15: real routes or disabled nav (UI-14).

## 7. API

Single `apiClient`; query key factories; `useApiMutation` with invalidates; mock handlers when using mock dev mode.

## 8. Quality

`page.contract.json`, knip, max-lines, T-05 tests, `npm run verify`, synced agent skills (G-12).

## Building features

Use `.claude/skills/feature-implementation/SKILL.md` plus `feature-map` and `new-page` before writing code.
