# API contract the dashboard expects

For `kitchenxhire-backend-go`. The shared components in this repository are built against the shapes below. A change to any of them is a linked pull request (G-08): database, then backend, then dashboard.

JSON is snake_case. Timestamps are ISO-8601 UTC. Money is integer paise. IDs are UUIDs.

## Envelope

```json
{ "success": true, "data": {}, "meta": {} }
{ "success": false, "error": { "code": "VALIDATION_FAILED", "message": "what to fix", "fields": { "code": "already exists" } } }
```

`error.fields` maps onto form inputs (`ApiError.fieldErrors`). Validation, authentication and authorization failures use different codes and statuses (400/422, 401, 403). A conflict on `version` returns 409.

## Lists: every entity

`GET /api/v1/<resource>`

| Param               | Meaning                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `page`, `page_size` | 1-based. `page_size` is one of 25, 50 or 100.                                                               |
| `search`            | Server-side, case-insensitive, over the entity's search fields (name, code, SKU, phone).                    |
| `sort`, `order`     | Column key, and `asc` or `desc`.                                                                            |
| `from`, `to`        | Inclusive `YYYY-MM-DD` range, interpreted in Asia/Kolkata. The resource documents which date it filters on. |
| `include_deleted`   | `true` also returns archived rows (those with `deleted_at` set).                                            |
| anything else       | An equality filter, e.g. `status=ACTIVE`.                                                                   |

The response `meta` is `{ "page": 1, "page_size": 25, "total": 3421 }`. `total` is the real count. The pager depends on it.

The same endpoint with `page_size=20&search=…&status=ACTIVE` serves `AsyncSelect`, so search must be indexed: trigram or prefix indexes on name and code.

## Writes

| Call                            | Shape                                                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /<resource>`              | Create. Honors an `Idempotency-Key` header.                                                                                              |
| `PATCH /<resource>/:id`         | Update. The body includes `version`; a stale version returns 409.                                                                        |
| `POST /<resource>/:id/archive`  | Soft delete. Body: `{ "reason": "…" }`. Sets `deleted_at` and `deleted_by` (D-08).                                                       |
| `POST /<resource>/:id/restore`  | Clears `deleted_at`.                                                                                                                     |
| `POST /<resource>/bulk-actions` | `{ "action": "ARCHIVE" \| "RESTORE" \| "ACTIVATE" \| "DEACTIVATE", "ids": [], "reason": "…" }` → `{ "affected": 3 }`. Authorized per id. |

## Import and export jobs

| Call                               | Shape                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `GET /<resource>/imports/template` | An XLSX template with headers and one example row.                                  |
| `POST /<resource>/imports`         | Multipart: `file` (CSV or XLSX) and `dry_run` (`true` or `false`). Returns a `Job`. |
| `POST /<resource>/exports`         | Body: the current list filters (without `page`). Returns a `Job`.                   |
| `GET /jobs/:id`                    | Returns a `Job`. The dashboard polls it every 1.5 seconds until it finishes.        |

```json
{
  "id": "…",
  "kind": "IMPORT",
  "status": "QUEUED | RUNNING | SUCCEEDED | FAILED",
  "progress_percent": 40,
  "dry_run": true,
  "summary": { "total": 4000, "created": 3900, "updated": 80, "failed": 20 },
  "result_url": "signed URL (export file)",
  "error_report_url": "signed URL (rows with an error column)",
  "error_message": null
}
```

How imports behave:

- They upsert on the resource's match key (for example `code` or `sku`).
- Reference columns (category, brand, UOM, HSN) accept a code or an exact name.
- A dry run validates every row and writes nothing.
- A real run commits the valid rows and reports the failed ones.

## Audit

`GET /audit-events?entity_type=category&entity_id=…` returns events, newest first:

```json
{
  "id": "…",
  "action": "UPDATED",
  "actor_name": "Asha",
  "occurred_at": "…",
  "reason": null,
  "changes": [{ "field": "status", "from": "ACTIVE", "to": "INACTIVE" }]
}
```

## Hire admin jobs dashboard

`GET /hire/admin/jobs` is the list contract above, plus `job_status`, `job_category`, `location`, `recruiter_name`, `job_title_label` and `recruited=true` filters. Job statuses are `active`, `under_review`, `paused`, `closed` and `draft`. List rows include `recruiter_name` under the outlet. Three read-only endpoints feed analytics around the table (the redesigned Jobs screen uses summary for tab counts only). All four take the same period: `range` (`1d`, `yesterday`, `7d`, `30d`, `90d`, `custom`) and, for `custom`, an inclusive `from` and `to`.

| Call                              | Returns                                                                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /hire/admin/jobs/summary`    | `total_jobs`, `total_applications`, `total_recruiters`, `total_recruited`, `closed_jobs`, `active_jobs`, `under_review_jobs`, `paused_jobs`, `draft_jobs`, and a `growth_*_pct` against the previous period for the five cards. |
| `GET /hire/admin/jobs/trend`      | One point per local day of the period: `{ "date": "YYYY-MM-DD", "count": 123 }`. `count` is the **running total** of jobs posted from the start of the period, so the last point is the period's job count.                     |
| `GET /hire/admin/jobs/categories` | `{ "label", "count" }` per category label (six, in a fixed order), counted over the period.                                                                                                                                     |

All four are computed from the same set of jobs, so for one period and no other filter these must agree. A screen that shows two different counts for the same thing is a bug, not a rounding difference:

- `summary.total_jobs` = `meta.total` of the list = the sum of the category counts = the last `trend` point.
- `summary.closed_jobs` = `meta.total` of the list filtered with `job_status=closed`.
- `summary.draft_jobs` = `meta.total` of the list filtered with `job_status=draft`.
- A category's `count` = `meta.total` of the list filtered with `job_title_label` set to its label.

The dashboard asks the list for 10 rows per page by default. If the backend keeps the 25, 50 or 100 page sizes above, either accept 10 for this endpoint or tell the dashboard, which is built to show "Showing 1 – 10 of N jobs" and a numbered pager.

`POST /hire/admin/jobs` posts a job on behalf of the platform (the Post a Job page). **The backend has no create endpoint for jobs today; this is the endpoint the dashboard expects, and the dev mock serves it until it exists.** The body is snake_case: `title`, `job_category`, `department`, `openings` (number or null), `city`, `work_location`, `address`, `employment_type`, `salary_min` and `salary_max` (numbers or null), `work_shift`, `experience_required`, `description`, `responsibilities`, `requirements`, `skills` (list of strings), `application_deadline` (date or null), `visibility` (`public` or `internal`) and `status`. `status` is `draft` or `active`:

- `draft` saves whatever was filled in; only `title` is required.
- `active` publishes the job. `title`, `job_category`, `department`, `openings`, `city`, `work_location`, `employment_type`, `salary_min`, `salary_max`, `work_shift`, `experience_required`, `description`, `responsibilities`, `requirements`, `application_deadline` and `visibility` are all required. `salary_max` must be at least `salary_min`, and `application_deadline` must not be in the past.

A body that breaks a rule is `422 VALIDATION_FAILED` with `error.fields` keyed by field name (`ApiError.fieldErrors`), and nothing is saved. The answer is the created job in the list-row shape above, with `status` as posted, `applications_count` and `recruited_count` of 0 and `posted_at` set to now; it must then show in the list and in the summary counts. Needs `hire.admin.manage`. Audit uses `entity_type=hire_job`. The option lists the form offers (category, department, city, work location, employment type, work shift, experience, visibility) are prototype values the backend must confirm or replace with its own.

## Hire admin applications dashboard

`GET /hire/admin/applications` is the list contract above, plus the filters in the table below. Four read-only endpoints and four writes sit beside it. The dashboard asks the list for 5 rows per page (it offers 5, 10, 20 and 50) and shows "Showing 1 – 5 of N applications" with a numbered pager, so the endpoint must accept those page sizes.

| Call                                                                       | Returns or does                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /hire/admin/applications`                                             | The list. Filters: `tab`, `status`, `job_id`, `recruiter_id`, `location` (the job's city), `search` (name, e-mail, phone, application id), `from` and `to` (inclusive, on the applied date). Sort: `applied_at` (default, newest first), `application_id`, `candidate_name`. |
| `GET /hire/admin/applications/summary`                                     | `{ counts, growth_pct }`, each keyed by `all`, `reviewed`, `shortlisted`, `interview_scheduled`, `hired`, `rejected`. These feed the six stat cards and the tab labels. They ignore the table filters.                                                                       |
| `GET /hire/admin/applications/trend?range=7d\|30d\|90d`                    | Seven points `{ "date": "YYYY-MM-DD", "count": 123 }`. `count` is the number of applications received in the period that **ends** on `date`: one day for `7d`, five days for `30d`, fifteen days for `90d`.                                                                  |
| `GET /hire/admin/applications/options/{jobs,recruiters,locations}?search=` | `{ "value", "label" }`, at most 20, for the Job, Recruiter and Location filters.                                                                                                                                                                                             |
| `GET /hire/admin/applications/:id`                                         | One application: id, candidate (name, e-mail, phone, "City, ST"), job (id, title, type), recruiter and outlet, the job's city, `applied_at`, `status`, `interview_at`, `resume_file_name`.                                                                                   |
| `PATCH /hire/admin/applications/:id`                                       | `{ "status" }`. Writes an audit event (`entity_type=hire_application`) with the status change.                                                                                                                                                                               |
| `POST /hire/admin/applications/:id/interview`                              | `{ "interview_at" }`. Sets `interview_scheduled` and the time, and writes an audit event.                                                                                                                                                                                    |
| `POST /hire/admin/applications/bulk`                                       | `{ "action": "set_status", "status", "application_ids" }` returns `{ "affected" }`.                                                                                                                                                                                          |
| `POST /hire/admin/applications/exports`                                    | The filtered view as an export job, or only `application_ids` when they are sent. `page` and `page_size` in the body are ignored: every matching row is exported. Same job and download flow as the other exports.                                                           |

Statuses are `pending_review`, `reviewed`, `shortlisted`, `interview_scheduled`, `hired` and `rejected`. A **tab counts every application that reached that stage**, so the counts nest: `reviewed` includes the shortlisted, interview and hired ones, `shortlisted` includes interview and hired, `interview_scheduled` includes hired. `rejected` stands apart and `all` is everything. `status` filters on the exact status. `pending_review` has no tab and no card; it is `all` minus `reviewed` minus `rejected`. The summary and the list come from the same applications, so for no other filter these must agree:

- `summary.counts.all` = `meta.total` of the list with no filter.
- `summary.counts[tab]` = `meta.total` of the list with `tab=<tab>`.
- `counts.reviewed` ≥ `counts.shortlisted` ≥ `counts.interview_scheduled` ≥ `counts.hired`.
- A job's `applications_count` on the Jobs dashboard = `meta.total` of this list with that job's `job_id`.

The trend is **not** recomputed from the listed rows: it is its own analytics series, and the sum of its points for a range must not exceed `counts.all`. `applied_at` and `interview_at` are ISO timestamps with an offset; the dashboard shows them in India time (`Asia/Kolkata`) whatever the browser's zone.

Needed from the backend and not in the mock: a resume download (the dashboard only has `resume_file_name`, so its "Download resume" button stays disabled), and the rules for which status may follow which (the mock allows any move). The Overview page's recent-applications card still reads `NEW`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `HIRED`, `REJECTED`; the backend should expose one status set for both screens. `hire.admin.view` reads the list and the detail; `hire.admin.manage` is needed for the status change, the interview, the bulk call and the export.

## Hire admin recruiters dashboard

`GET /hire/admin/recruiters` is the list contract above, plus `tab` (`all`, `active`, `inactive`), `status` (`active`, `inactive`, `under_review`, `suspended`), `business_type` (`Restaurant`, `Cloud Kitchen`, `Food Court`), `city`, `search` (id, owner name, email, phone, company) and `joined` (`7d`, `30d`, `90d`: **last login** within the last N days; leave it out for any time). Sort: `last_login_at` (default, newest first), `joined_at`, `business_name`, `owner_name`, `recruiter_id`. The redesigned list asks for **10** rows per page (it offers 5, 10, 20 and 50).

List rows include `owner_name`, `email`, `phone`, `verification` (`verified`, `pending`, `unverified` — independent of account status), `open_jobs`, `hired`, `last_login_at` (null if never), `status` and `joined_at`. Verification and account status must stay separate fields.

| Call                                      | Returns or does                                                                                                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /hire/admin/recruiters/summary`      | `total`, `active`, `inactive`, `outlets`, `open_jobs`, `hiring_actions` and `growth_pct` for each. The redesigned screen uses summary for tab counts only (KPI cards removed).                       |
| `GET /hire/admin/recruiters/trend?range=` | Seven points `{ "date", "count" }` for `7d`, `30d` or `90d` (kept for API compatibility; the redesigned screen does not chart them). `count` is the active-recruiters **level** on that date.        |
| `GET /hire/admin/recruiters/locations`    | `{ "value", "label" }` per city, for the Locations filter.                                                                                                                                           |
| `GET /hire/admin/recruiters/:id`          | One recruiter including verification, last login, outlets, jobs posted, hired, registration date and account status.                                                                                 |
| `POST /hire/admin/recruiters`             | Creates a recruiter from `business_name`, `business_type`, `area`, `city`, `owner_name`, `phone`, `email`. Starts as `under_review` with `verification=pending`. Audit `entity_type=hire_recruiter`. |
| `PATCH /hire/admin/recruiters/:id`        | Any of those fields and/or `status` / `verification`. Writes an audit event.                                                                                                                         |
| `POST /hire/admin/recruiters/bulk`        | `{ "action": "set_status", "status", "recruiter_ids" }` returns `{ "affected" }`.                                                                                                                    |
| `POST /hire/admin/recruiters/exports`     | The filtered view as an export job, or only `recruiter_ids` when sent. `page` and `page_size` in the body are ignored: every matching row is exported.                                               |

Statuses are `active`, `inactive`, `under_review` and `suspended`. Under Review and Suspended have no tab; All = Active + Inactive + Under Review + Suspended. These must agree for no other filter: `summary.total` = `meta.total` of the list; `summary.active` and `summary.inactive` = `meta.total` with `tab=active` / `tab=inactive`; `summary.outlets` = the sum of `outlets` and `summary.open_jobs` = the sum of `open_jobs` over all recruiters. Recruiter ids here (`REC10892`) are not the `recruiter_id` values on the Jobs and Applications mocks (`REC001`); the backend must use one id for both. `hire.admin.view` reads, `hire.admin.manage` is needed for create, edit, status, bulk and export.

## Hire admin job seekers dashboard

`GET /hire/admin/job-seekers` is the list contract above, plus `tab` (`all`, `active`, `inactive`), `status` (`active`, `inactive`, `under_review`, `suspended`), `experience` (whole years in the bands `0-1`, `2-3`, `4-5`, `6+`), `city`, `search` (name, e-mail, phone, id) and `joined` as a last-active window (`7d` / `30d` / `90d`). Sort: `last_active_at` (default), `joined_at`, `name`, `job_seeker_id`, `applications_count`, `profile_completion`. Default `page_size` is 10. The Inactive tab is every non-active account (status `inactive`, `under_review` or `suspended`). The calls mirror the recruiters ones under `/hire/admin/job-seekers` (summary, locations, `:id`, create, patch, bulk, exports with `job_seeker_ids`; audit `entity_type=hire_job_seeker`). Trend is no longer used by the Job Seekers UI after the management-table redesign.

A row has `job_seeker_id`, `name`, `email`, `phone`, `city`, `state`, `preferred_job_title`, `experience_years`, `profile_completion` (0–100), `applications_count`, `interviews_count`, `shortlisted_count`, `hired_count`, `status`, `joined_at` and `last_active_at` (null until first activity). The summary returns `total`, `active`, `inactive` (all non-active), `total_applications`, `shortlisted`, `hired` and `growth_pct` for each. A job seeker's `hired_count` is at most `shortlisted_count`, which is at most `applications_count`. `summary.total` = `meta.total` of the list with no filter; `summary.active` / `summary.inactive` = `meta.total` with `tab=active` / `tab=inactive`.

## Hire admin users dashboard

Platform staff, not job seekers or recruiters. `GET /hire/admin/users` is the list contract above, plus `tab` (`all`, `active`, `inactive`, `pending`, `suspended`), `status`, `role` (`Super Admin`, `HR Manager`, `HR Executive`, `Support`, `Analyst`), `department` (`Platform Ops`, `Hiring`, `Customer Support`, `Operations`), `search` (name, e-mail, user id) and `active` (`7d`, `30d`, `90d`: people who signed in, or were invited if they never have, within that window; no value means any time). The redesigned list opens on `active=30d` and asks for **10** rows per page (it offers 5, 10, 20 and 50). Sort: `last_login_at` (default, newest first), `user_id`, `name`. A row has `user_id` (`UST1001`), `name`, `email`, `role`, `department`, `access_scope` (`All modules`, `Jobs & Applications`, `Applications only`, `Read-only`, `Reports only`), `last_login_at` (null until the first sign-in), `status` (`active`, `inactive`, `pending`, `suspended`) and `created_at`.

`GET /hire/admin/users/summary` returns `total`, `active`, `inactive`, `administrators` (Super Admin role), `pending` (invites not yet accepted), `suspended` and `growth_pct` for each. The redesigned screen uses summary for tab counts only (KPI cards removed). `summary.total` = `meta.total` of the list with no filter; the status counts equal `meta.total` with the matching `tab`. `GET /hire/admin/users/trend?range=7d|30d|90d` is the running total of accounts per date (kept for API compatibility; the redesigned screen does not chart them).

`POST /hire/admin/users` takes `name`, `email`, `role`, `department` and `access_scope`, sends an invite and creates the user as `pending`; a duplicate e-mail is a 422 with `fieldErrors.email`. `PATCH /hire/admin/users/:id` takes any of those fields, or `status` (`active`, `inactive`, `suspended`). A `pending` user cannot be given a status by hand (422) until the invite is accepted. `POST /hire/admin/users/bulk` takes `{ action: 'set_status', status, user_ids }` and returns `{ affected }`; pending users are skipped. `POST /hire/admin/users/exports` takes the list filters plus `user_ids` (empty means the whole filtered view) and returns a job as in Import and export jobs. Audit uses `entity_type=hire_user`. `hire.admin.view` reads; `hire.admin.manage` is needed for create, edit, status, bulk and export. Suspending a user must also end their sessions.

## Hire admin businesses dashboard

`GET /hire/admin/businesses` is the list contract above, plus `tab` (`all`, `active`, `inactive`), `status` (`active`, `inactive`, `under_review`, `suspended`), `verification` (`verified`, `pending`, `unverified` — independent of account status), `business_type` (`Restaurant`, `Cloud Kitchen`, `Food Court`, `Warehouse`), `city`, `search` (business, id, owner, phone, area) and `joined` (`7d`, `30d`, `90d`: joined within the last N days; leave it out for any time). Sort: `joined_at` (default, newest first), `business_name`, `business_id`. The redesigned list asks for **10** rows per page (it offers 5, 10, 20 and 50).

List rows include `business_name`, `business_type`, `area`, `city`, `owner_name`, `phone`, `email`, `outlets`, `verification`, `status` and `joined_at`. Verification and account status must stay separate fields. The Inactive tab is status `inactive` only; Under Review and Suspended sit in All only.

| Call                                      | Returns or does                                                                                                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /hire/admin/businesses/summary`      | `total`, `active`, `inactive`, `outlets`, `active_outlets`, `warehouses` and `growth_pct` for each. The redesigned screen uses summary for tab counts only (KPI cards removed).                                   |
| `GET /hire/admin/businesses/trend?range=` | Seven points `{ "date", "count" }` for `7d`, `30d` or `90d` (kept for API compatibility; the redesigned screen does not chart them). `count` is the businesses **level** on that date.                            |
| `GET /hire/admin/businesses/locations`    | `{ "value", "label" }` per city, for the Locations filter.                                                                                                                                                        |
| `POST /hire/admin/businesses`             | Creates a business from `business_name`, `business_type`, `area`, `city`, `owner_name`, `phone`, `email`. Starts as `under_review` with `verification=pending` and no outlets. Audit `entity_type=hire_business`. |
| `PATCH /hire/admin/businesses/:id`        | Any of those fields and/or `status` (`active`, `inactive`, `suspended`) / `verification`. Writes an audit event.                                                                                                  |
| `POST /hire/admin/businesses/bulk`        | `{ "action": "set_status", "status", "business_ids" }` returns `{ "affected" }`.                                                                                                                                  |
| `POST /hire/admin/businesses/exports`     | The filtered view as an export job, or only `business_ids` when sent. `page` and `page_size` in the body are ignored: every matching row is exported.                                                             |

These must agree for no other filter: `summary.total` = `meta.total` of the list with no filter; `summary.active` and `summary.inactive` = `meta.total` with `tab=active` / `tab=inactive`; `summary.outlets` = the sum of `outlets`; `summary.active_outlets` = the sum of `outlets` over active businesses; `summary.warehouses` = `meta.total` with `business_type=Warehouse`. There are no outlet records yet, only a count per business, so the Add Outlet action and a bulk upload are not in the dashboard. The business ids here (`BUS0642`) and the counts do not match the Recruiters dashboard (312 recruiters, 642 outlets); the backend should relate recruiters to businesses and count both from the same records. `hire.admin.view` reads, `hire.admin.manage` is needed for create, edit, status, bulk and export.

## Hire admin categories and roles

The Categories & Roles screen (`/admin/roles`, Platform Management) has two lists and a permission matrix. `hire.admin.view` reads; `hire.admin.manage` is needed for every create, edit, status change, permission change, delete, bulk call and export. The legacy `/catalogue/categories` screens stay reachable by link but are no longer in the sidebar.

| Call                                       | Contract                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /hire/admin/categories-roles/summary` | `{ "categories", "roles", "growth_pct": { "categories", "roles" } }`. `categories` and `roles` count every row whatever its status; `growth_pct` is the percent change against last month.                                                                                                                                     |
| `GET /hire/admin/categories`               | The list contract above with `q` (name and code), `status` (`active`, `inactive`, `archived`) and sort. The screen asks for 5 rows per page. Each row has `category_id`, `name`, `code`, `business_type`, `icon`, `description`, `businesses`, `outlets`, `status`.                                                            |
| `POST /hire/admin/categories`              | `name`, `code` (upper case letters, digits, underscore), `business_type`, `icon`, `description`. Needs `Idempotency-Key`. Starts `active` with 0 businesses and 0 outlets. Writes an audit event (`entity_type=hire_category`).                                                                                                |
| `GET/PATCH /hire/admin/categories/:id`     | Any of those fields and/or `status`. Writes an audit event with one change line per field.                                                                                                                                                                                                                                     |
| `POST /hire/admin/categories/bulk`         | `{ "action": "set_status", "status", "category_ids" }` returns `{ "affected" }`.                                                                                                                                                                                                                                               |
| `POST /hire/admin/categories/exports`      | The filtered view as an export job, or only `category_ids` when sent. `page` and `page_size` in the body are ignored.                                                                                                                                                                                                          |
| `GET /hire/admin/roles`                    | All roles in one page (no pager; the screen shows `Showing 1 - N of N roles`), with `status`. Each row has `role_id`, `name`, `description`, `users`, `status`, `protected`, `permissions`.                                                                                                                                    |
| `POST /hire/admin/roles`                   | `name`, `description`. Needs `Idempotency-Key`. Starts `active` with no permissions.                                                                                                                                                                                                                                           |
| `GET/PATCH/DELETE /hire/admin/roles/:id`   | `PATCH` takes `name`, `description` and/or `status` (`active`, `inactive`). `DELETE` removes a role.                                                                                                                                                                                                                           |
| `PATCH /hire/admin/roles/:id/permissions`  | `{ "permissions": { "<module>": ["view", "create", "edit", "delete", "export"] } }` replaces the whole matrix. Modules: `jobs`, `applications`, `recruiters`, `job_seekers`, `businesses`, `users`, `categories_roles`, `reports`, `settings`. Writes one audit change line per module that changed (`entity_type=hire_role`). |

Rules. A duplicate category `code` or role `name` (case-insensitive) is `409 CONFLICT`. Deleting a role that still has users is `409 CONFLICT`. Super Admin and Admin are `protected`: changing their status or permissions, or deleting them, is `403 FORBIDDEN`. An unknown id is `404 NOT_FOUND`; bad input is `422 VALIDATION_ERROR` with `fieldErrors`.

Audit trail: `GET /audit-events?entity_type=hire_category|hire_role&entity_id=<id>`. The `entity_id` `all` returns every event of that type, newest first; the Audit Logs dialog uses it for both types.

The numbers in the reference picture do not tie to other screens: 12 categories and 8 roles, with 248 + 182 + 56 + 24 + 18 businesses for the first five categories and 586 users for Business Owner, against 642 businesses on the Businesses screen and the user counts on User Management. Business and outlet counts per category, and the user count per role, must come from the same records as those screens, so the backend needs one source for them.

## Hire admin reports (overview)

The Reports & Analytics screen (`/admin/reports`, Platform Management) has five pills under the title: Overview, Jobs Report, Applications Report, Users Report and Recruiter Report. All five are enabled, and each reads one endpoint for the selected `range`. The four tab endpoints take `range` as the Overview does (`7d`, `30d` or `90d`, default `30d`, anything else is a 422) and return the window they counted in `range`. `hire.admin.view` reads the page; `hire.admin.manage` is needed for the export. The Overview's five stat cards open a detail view with six calls of their own, described in the next section.

| Call                                                      | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /hire/admin/reports/overview?range=7d\|30d\|90d`     | Everything on the Overview in one response. `range` defaults to `30d`. The server works out the window from its own today (India time) and returns it in `range`, inclusive. The screen prints it as "Last 30 Days (26 May – 24 Jun 2026)" and counts the other two windows in the date menu back from `range.to`.                                                                                                                                                           |
| `GET /hire/admin/reports/jobs?range=7d\|30d\|90d`         | The Jobs Report tab: `kpis` (`total_jobs`, `active`, `closed`, `draft`, `avg_time_to_fill_days`), `jobs_trend`, `jobs_status`, `top_categories`, and `recent_jobs`, the newest jobs whatever the window. The status counts and the trend each add up to `kpis.total_jobs.value`.                                                                                                                                                                                             |
| `GET /hire/admin/reports/applications?range=7d\|30d\|90d` | The Applications Report tab: `kpis` (`total_applications`, `shortlisted`, `under_review`, `hired`, `rejected`), `applications_trend`, `application_status`, `top_categories`, `top_locations`, and `recent_applications`, the newest whatever the window. The status counts and the trend each add up to `kpis.total_applications.value`.                                                                                                                                    |
| `GET /hire/admin/reports/users?range=7d\|30d\|90d`        | The Users Report tab: `kpis` (`total_users`, `job_seekers`, `businesses`, `recruiters`, `new_users`), `user_growth` (the Overview's six months), `users_by_type`, `top_locations`, and `recent_users`, the newest whatever the window. Only `new_users` and the change percentages move with `range`; the type counts add up to `kpis.total_users.value`.                                                                                                                    |
| `GET /hire/admin/reports/recruiters?range=7d\|30d\|90d`   | The Recruiter Report tab: `kpis` (`total_recruiters`, `active`, `inactive`, `new_recruiters`, `avg_hires_per_recruiter`), `recruiter_activity`, `recruiter_status`, `top_recruiters`, and `recent_recruiters`, the newest whatever the window. Only `new_recruiters` and the change percentages move with `range`; the status counts add up to `kpis.total_recruiters.value`.                                                                                                |
| `POST /hire/admin/reports/exports`                        | `{ "range": "7d" \| "30d" \| "90d" }`. Returns a job as in Import and export jobs. The file is a CSV with every section of the Overview for that window: the KPIs, the hiring trend, the status counts, the categories, the locations and the platform growth. With a `metric` in the body it exports a stat card's view instead (see "Reports Overview: what is behind the five stat cards"). Needs `hire.admin.manage`. The dashboard does not build a CSV in the browser. |

The response:

```json
{
  "range": { "from": "2026-05-26", "to": "2026-06-24" },
  "kpis": {
    "jobs_posted": { "value": 1482, "change_pct": 12 },
    "applications": { "value": 8672, "change_pct": 18 },
    "hired": { "value": 590, "change_pct": 15 },
    "rejected": { "value": 1036, "change_pct": -5 },
    "avg_time_to_hire_days": { "value": 6.8, "change_pct": -22 }
  },
  "hiring_trend": [{ "date": "2026-06-24", "applications": 1842, "jobs": 312, "hires": 124 }],
  "application_status": [{ "status": "hired", "count": 590 }],
  "top_categories": [{ "label": "Cook / Chef", "count": 428 }],
  "top_locations": [{ "label": "Hyderabad", "count": 3248 }],
  "platform_growth": [{ "month": "2026-06", "job_seekers": 24860, "recruiters": 312 }]
}
```

Rules the backend must keep:

- `kpis[*].change_pct` is the percent change against the previous window of the same length and is negative when it fell. `avg_time_to_hire_days.value` is in days with one decimal. The screen draws a rise green and a fall red, except for Avg. Time to Hire, where a fall is green. Tell the dashboard if "down" should mean something else for another card.
- `application_status` has the four slices `hired`, `shortlisted`, `under_review`, `rejected`, in that order (clockwise from the top of the donut), and their counts add up to `kpis.applications.value`.
- `hiring_trend` points are evenly spaced samples. Each holds the totals **since the previous sample** (not a running total) and is dated by the day the sample ends, `YYYY-MM-DD` in India time; the last date is `range.to`. Over the whole window the `applications`, `jobs` and `hires` of the points add up to `kpis.applications.value`, `kpis.jobs_posted.value` and `kpis.hired.value`.
- Shares are never sent; the screen works them out from the counts, with one decimal. Status share = `count` / the sum of the status counts. Category share = `count` / `kpis.jobs_posted.value`. Location share = `count` / `kpis.applications.value`. `top_categories` and `top_locations` come sorted by `count`, highest first, and the backend decides the last category row (the picture's "Others").
- `platform_growth` is always the last six calendar months, oldest first, whatever `range` is, and each point is the platform **size at the end of that month** (today's size for the current month). Job seekers run to about 25,000 and recruiters to about 300, so the chart gives them two value axes: job seekers on the left, recruiters on the right. The last point must equal the totals on the Job Seekers and Recruiters screens.

The dev mock keeps a fixed clock: today is 24 Jun 2026, so `range.to` is `2026-06-24` for every range and the three windows start 6, 29 and 89 days earlier.

The numbers in the reference picture do not tie to every other screen, and the backend needs one source for them. Inside the Overview they now tie: each of the four stat-card lists (next section) has the card's number as its `meta.total` for the same range, and the time to hire has the card's average. The dev mock gets there by sizing each list to its card; the backend has to count both from the same records. They still do not tie to the Jobs and Applications admin screens, which keep their own mock totals: Jobs Posted is 1,482 here against the Jobs screen's 428 jobs; Hired is 590 against the Applications screen's 428; Rejected is 1,036 against 856. Job seekers are 24,860 in June against the Job Seekers screen's 12,846; recruiters are 312, which does match the Recruiters screen. Inside the picture, "Others 86" is not the rest of 1,482 (that would be 320), and Kondapur's 646 of 8,672 is 7.4%, where the picture says 7.5%. The screen shows what the counts give.

## Reports Overview: what is behind the five stat cards

On the Overview the five stat cards are buttons. A click opens a detail view under the cards. Jobs Posted, Applications, Hired and Rejected each open a paginated list of the records that make up their number. Avg. Time to Hire opens an analysis of how its average is made up. All of it is for the window the Overview shows (`range`). **The backend has none of the six calls below today. They are what the dashboard expects, and the dev mock serves them until they exist.** `hire.admin.view` reads all six; the export keeps needing `hire.admin.manage`.

| Call                                              | Returns                                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /hire/admin/reports/overview/jobs`           | The Jobs Posted card's list: the jobs whose `posted_at` is in the window.                                                             |
| `GET /hire/admin/reports/overview/applications`   | The Applications card's list: the applications whose `applied_at` is in the window.                                                   |
| `GET /hire/admin/reports/overview/hired`          | The Hired card's list: the hires whose `hired_at` is in the window.                                                                   |
| `GET /hire/admin/reports/overview/rejected`       | The Rejected card's list: the rejections whose `rejected_at` is in the window.                                                        |
| `GET /hire/admin/reports/overview/time-to-hire`   | How the Avg. Time to Hire card's number is made up: the average, its change, a trend and a split by job category. Takes `range` only. |
| `GET /hire/admin/reports/overview/filter-options` | The choices of the category, outlet and rejection reason filters. Takes no parameters.                                                |

### The four lists

Each is the list contract above with three differences: the window is `range`, not `from` and `to`; the page sizes are 5, 10, 20 and 50 (the Applications screen's, not the 25, 50 and 100 above) and the dashboard asks for 5; and each list has one filter, under its own name.

| Param                                          | Meaning                                                                                                                                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `range`                                        | `7d`, `30d` or `90d`; default `30d`. The same window as `GET /hire/admin/reports/overview`: counted back from the server's today (India time), inclusive.                                             |
| `page`, `page_size`                            | 1-based; `page` defaults to 1. `page_size` is one of 5, 10, 20 or 50 and defaults to 5.                                                                                                               |
| `search`                                       | Case-insensitive substring, after trimming, over the fields in the next table. Empty or blank means no search.                                                                                        |
| `job_category`, `status`, `outlet` or `reason` | The list's one filter, under the name in the next table. Empty means all.                                                                                                                             |
| `sort`, `order`                                | One of the list's `sort` keys in the next table, and `asc` or `desc`. With no `sort` the newest comes first. The dashboard sends `order` only together with `sort`; an `order` on its own is ignored. |

| List           | `search` matches                                                                                 | Filter                                                                                                                                               | `sort` keys                       |
| -------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `jobs`         | `title`, `recruiter_name`, `outlet_name`, `job_id`                                               | `job_category`: a job category from `filter-options`. The row does not carry the category; the filter matches the job's.                             | `posted_at`, `applications_count` |
| `applications` | `candidate_name`, `job_title`, `outlet_name`, `application_id`                                   | `status`: one application status (`pending_review`, `reviewed`, `shortlisted`, `interview_scheduled`, `hired` or `rejected`), the status it has now. | `applied_at`                      |
| `hired`        | `candidate_name`, `candidate_id`, `job_title`, `recruiter_name`, `outlet_name`, `application_id` | `outlet`: an outlet name from `filter-options`.                                                                                                      | `hired_at`                        |
| `rejected`     | `candidate_name`, `job_title`, `outlet_name`, `application_id`                                   | `reason`: a rejection reason from `filter-options`.                                                                                                  | `rejected_at`                     |

A job counts by its `posted_at` and an application by its `applied_at`, whatever their status is now. With no `sort` the order is the list's date, newest first (`posted_at`, `applied_at`, `hired_at` or `rejected_at`). Rows with an equal sort value fall back to that order and then to the id, so paging never repeats or skips a row.

The answer is the list envelope: `data` is the page of rows and `meta` is `{ "page", "page_size", "total" }`, where `total` is the real count after `search` and the filter. One row of each list, with example values:

`overview/jobs`:

```json
{
  "job_id": "JOB10293",
  "title": "Cook / Chef",
  "recruiter_name": "Rahul Verma",
  "outlet_name": "Spice Bowl Restaurant",
  "posted_at": "2026-06-24T10:09:00+05:30",
  "applications_count": 286
}
```

`overview/applications`:

```json
{
  "application_id": "APP10892",
  "candidate_name": "Rahul Kumar",
  "job_title": "Cook / Chef",
  "outlet_name": "Spice Bowl Restaurant",
  "applied_at": "2026-06-24T10:24:00+05:30",
  "status": "reviewed"
}
```

`overview/hired`:

```json
{
  "application_id": "APP10889",
  "candidate_id": "CAN00412",
  "candidate_name": "Suresh Das",
  "job_title": "Cook / Chef",
  "recruiter_name": "Rahul Verma",
  "outlet_name": "Spice Bowl Restaurant",
  "hired_at": "2026-06-23T14:30:00+05:30"
}
```

`overview/rejected`:

```json
{
  "application_id": "APP10880",
  "candidate_name": "Neha Jain",
  "job_title": "Kitchen Helper",
  "outlet_name": "Urban Bites",
  "rejected_at": "2026-06-22T16:05:00+05:30",
  "rejection_reason": "Insufficient experience"
}
```

Timestamps are ISO with an offset (`+05:30`), and the dashboard shows them in India time whatever the browser's zone, as for applications. `outlet_name` is explained under Outlets below. `rejection_reason` is `null` when none was recorded.

### Time to hire and the filter choices

`GET /hire/admin/reports/overview/time-to-hire?range=` answers:

```json
{
  "range": { "from": "2026-05-26", "to": "2026-06-24" },
  "average_days": 6.8,
  "change_pct": -22,
  "hires_counted": 590,
  "trend": [{ "date": "2026-06-24", "average_days": 6.8 }],
  "by_category": [{ "label": "Cook / Chef", "average_days": 5.9, "hires": 201 }]
}
```

`trend` has the dates of the Overview's `hiring_trend` for the same `range`: evenly spaced, the last one `range.to`. Each `average_days` is the average over the hires made from `range.from` to the end of that day, so it is a running average, and a point is `null` while nobody had been hired yet. `by_category` has one row for each of the five job categories with the most counted hires, labelled as in Top Job Categories and with the most `hires` first. A category with no counted hire is left out, and `Others` is not a row.

`GET /hire/admin/reports/overview/filter-options` answers:

```json
{
  "job_categories": ["Cook / Chef", "Kitchen Helper"],
  "outlets": ["Spice Bowl Restaurant", "Urban Bites"],
  "rejection_reasons": ["Insufficient experience", "Skills not matched"]
}
```

Each list is sorted A to Z without repeats and is for all time, not for the window, so a choice can match no rows in a short one. `rejection_reasons` holds only reasons that were recorded; "Not recorded" is not a choice. The dashboard keeps the choices for five minutes.

### What time to hire means

- It is the days from an application's `applied_at` to its `hired_at`: elapsed time with its fraction, not calendar days.
- `average_days` is the mean over the applications hired inside the window, those whose `hired_at` is between `range.from` and `range.to`. Their `applied_at` can be earlier than the window.
- An application missing `applied_at` or `hired_at` is left out, and so is one whose `hired_at` is before its `applied_at`. `hires_counted` says how many are in.
- `average_days` is rounded once, at the end, to one decimal. It is `null` when `hires_counted` is 0, which is the case when nobody was hired in the window.
- `change_pct` is the percent change against the same average for the previous window of the same length, negative when the time fell. It is `null` when that window has no counted hire.

To confirm: the earlier brief for this screen also read "from job posting to hire". The picture's own text says "from application to hire", and this contract follows the picture. The backend owner should confirm which is meant. If it is the first, the start of the span becomes the job's `posted_at` and nothing else here changes.

### New fields to store

Three fields on the application, which nothing in the Applications contract above has yet:

| Field              | Set when                                          | Otherwise |
| ------------------ | ------------------------------------------------- | --------- |
| `hired_at`         | The status becomes `hired`.                       | `null`    |
| `rejected_at`      | The status becomes `rejected`.                    | `null`    |
| `rejection_reason` | A reason is given as the application is rejected. | `null`    |

They are read only by the calls in this section; `GET /hire/admin/applications` and its row stay as they are. Moving an application out of `hired` or `rejected` clears the matching fields, so a hire or a rejection counts only while the application is in that state, and no application is in the Hired and the Rejected list at once. An application hired or rejected before these fields existed has no timestamp, so it is in neither list and in no average until the backend owner back-fills it. The cards count by the same fields (rule 1), so they leave it out too.

A rejection reason is never made up: the backend does not fill in a default, and `null` shows on the screen as "Not recorded". Nothing in the dashboard records a reason today (`PATCH /hire/admin/applications/:id` and the bulk call send only `status`), so until some flow does, every rejection reads "Not recorded". Where a reason is entered is for the backend owner to decide; if it is the status change, `PATCH` takes an optional `rejection_reason` beside `status`.

### Outlets

Outlet records do not exist yet. A job carries only its `business_name` and an application only its `outlet_name`. So `outlet_name` on a Jobs Posted row is the job's `business_name`, and the `outlets` choices are the distinct `outlet_name` values as they stand. For the same reason there is no time to hire per outlet: `by_category` is the only split. When outlets become records (the Businesses section above has the same gap) the split can be added, and the choices should come from them.

### Rules the backend must keep

1. With no `search` and no filter, each list's `meta.total` is the card's value for the same `range`: `overview/jobs` is `kpis.jobs_posted.value`, `overview/applications` is `kpis.applications.value`, `overview/hired` is `kpis.hired.value` and `overview/rejected` is `kpis.rejected.value`. So the cards count the way the lists do, from the same records: jobs by `posted_at`, applications by `applied_at`, hires by `hired_at`, rejections by `rejected_at`. A screen that shows two counts for one thing is a bug, not a rounding difference.
2. `average_days` and `change_pct` of `time-to-hire` are `kpis.avg_time_to_hire_days.value` and `kpis.avg_time_to_hire_days.change_pct` for the same `range`, with the same rounding. One case cannot match: with no counted hire they are `null` here, while the Overview types the card's `value` and `change_pct` as numbers. The backend owner should say what the card sends then.
3. `hires_counted` is at most the `meta.total` of `overview/hired` for the same `range`, and equal when every hire in the window has an `applied_at` before its `hired_at`. The `hires` of `by_category` add up to at most `hires_counted`.
4. The last `trend` point is `average_days`, because both are the average over the hires from `range.from` to `range.to`.
5. All six calls work out the window from the server's own today in India time, as the Overview does, so one `range` is the same dates on every one of them.

### Errors

A call that breaks one of these rules is `422 VALIDATION_ERROR` with `error.fields` keyed by the parameter, and nothing is read.

| Param       | 422 when                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------- |
| `range`     | It is anything but `7d`, `30d` or `90d`. Case counts: `30D` fails. Left out means `30d`. |
| `page`      | It is not a whole number of 1 or more.                                                   |
| `page_size` | It is not 5, 10, 20 or 50.                                                               |
| `sort`      | It is not one of that list's `sort` keys.                                                |
| `order`     | It is not `asc` or `desc`.                                                               |
| `status`    | On `overview/applications`: it is not one of the six application statuses.               |

Nothing else is an error. An unknown category, outlet or reason matches no rows (`total` 0), and a `page` past the last answers 200 with an empty `data` and the real `total`. `time-to-hire` reads only `range` and `filter-options` reads nothing; any other parameter is ignored.

### Export

`POST /hire/admin/reports/exports` keeps its body `{ "range" }`, and that still exports the whole Overview as before. While a stat card is open, the dashboard names it too:

```json
{ "range": "30d", "metric": "hired", "search": "rahul", "filter": "Urban Bites" }
```

| Field    | Meaning                                                                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `range`  | As before: `7d`, `30d` or `90d`; left out means `30d`.                                                                                         |
| `metric` | `jobs_posted`, `applications`, `hired`, `rejected` or `avg_time_to_hire_days`. With it the file is that card's view; without it, the Overview. |
| `search` | What was typed in the card's search. Sent only when it is not empty.                                                                           |
| `filter` | The card's one filter value, with the meaning of that list's `job_category`, `status`, `outlet` or `reason`. Sent only when it is not empty.   |

For the four lists the file is a CSV of **every** matching row, not the page: the same `search` and filter as the list, newest first (the body has no `sort`, `page` or `page_size`), with the columns of the table on screen, in the same order and under the same headings, and "Not recorded" in the reason of a rejection that has none. For `avg_time_to_hire_days` it is a CSV of the analysis, laid out like the Overview export: the average, its change and `hires_counted`, then each trend sample and each category row; `search` and `filter` mean nothing there and are ignored. It is a job like every other export and needs `hire.admin.manage`. A body whose `range` or `metric` is not one of the values above, or whose `filter` is not an application status when `metric` is `applications`, is a 422 with `error.fields.range`, `error.fields.metric` or `error.fields.filter`.

### The dev mock

Today the dev mock (`dev/`, served by the Vite dev server only and never part of a build) serves these routes. To make the screen read consistently it sizes each list to the card number of the same range: for `30d` the Jobs Posted list has 1,482 rows because that card says 1,482, and likewise for the other three lists and the other two ranges. The backend must not copy this. It counts the card and its list from the same records (rule 1), and the time to hire from the same hires as the Hired list (rules 2 and 3).

## Hire admin settings (General, Hiring & Jobs, Users & Roles, Notifications, Integrations, Security)

The Settings screen (`/admin/settings`, Platform Management) has seven pills under the title: General, Hiring & Jobs, Users & Roles, Notifications, Integrations, Security and Audit & Logs. General, Hiring & Jobs, Users & Roles, Notifications, Integrations, and Security have screens (`?tab=` omitted or `general`, `?tab=hiring`, `?tab=users`, `?tab=notifications`, `?tab=integrations`, and `?tab=security`). Audit & Logs stays disabled ("Coming soon") until its screen exists, so it calls nothing yet. General and Hiring & Jobs share one settings object and one Reset / Save Changes. Users & Roles, Notifications, Integrations, and Security each use their own payload and the same Reset / Save Changes controls while that tab is active. `hire.admin.view` reads the page; `hire.admin.manage` is needed to change a setting or the logo. Someone who can only view sees every value and switch read-only, with no Reset or Save Changes.

**Known overlap, flagged for a product decision, not resolved here:** the Users & Roles → Access & Security card already has its own Two-Factor Authentication, Session Timeout, and IP Access Restriction. The Security tab's reference picture has its own, separate instances of those three controls. Both are implemented as independent values (two different API payloads) so each tab matches its own reference picture exactly; nothing here decides which one — if either — is the "real" value a backend should enforce. Admin Access Control on the Security tab is read-only by design: it reads the same Permissions Matrix as Users & Roles instead of holding a second editable copy, so there is only one place that edits role permissions.

No settings endpoint exists in the backend contract yet, so the dev mock (in `dev/`) stands in for these calls until the backend provides them.

| Call                                                      | Contract                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /hire/admin/settings`                                | The whole settings object, as below.                                                                                                                                                                                                                                                                                                       |
| `PATCH /hire/admin/settings`                              | Partial: only the fields sent change, and the answer is the whole settings. A value that breaks a rule below is `422 VALIDATION_ERROR` with `error.fields` (for example `{ "support_email": "Enter a valid email address" }`) and nothing is saved. `logo_url` is not accepted here, the logo has its own call. Needs `hire.admin.manage`. |
| `POST /hire/admin/settings/logo`                          | `multipart/form-data` with the image in the field `file`. PNG or JPG, 2 MB at most: a bigger file is `413`, and a missing, empty or other-type file is `422`, both with `error.fields.file`. Answers with the whole settings, `logo_url` now pointing at the new image. Needs `hire.admin.manage`.                                         |
| `GET /hire/admin/settings/users-roles`                    | The Users & Roles Settings object (users, roles, permissions matrix, access toggles), as below. Needs `hire.admin.view`.                                                                                                                                                                                                                   |
| `PATCH /hire/admin/settings/users-roles`                  | Full replace of the Users & Roles Settings object. A value that breaks a rule below is `422 VALIDATION_ERROR` with `error.fields` and nothing is saved. Needs `hire.admin.manage`.                                                                                                                                                         |
| `GET /hire/admin/settings/notifications`                  | The Notifications Settings object (channels, events, templates, delivery preferences), as below. Needs `hire.admin.view`.                                                                                                                                                                                                                  |
| `PATCH /hire/admin/settings/notifications`                | Full replace of the Notifications Settings object. A value that breaks a rule below is `422 VALIDATION_ERROR` with `error.fields` and nothing is saved. Needs `hire.admin.manage`.                                                                                                                                                         |
| `GET /hire/admin/settings/integrations`                   | The Integrations Settings object (five service rows, the outgoing webhook), as below. Needs `hire.admin.view`.                                                                                                                                                                                                                             |
| `PATCH /hire/admin/settings/integrations`                 | Full replace of the Integrations Settings object. A value that breaks a rule below is `422 VALIDATION_ERROR` with `error.fields` and nothing is saved. Needs `hire.admin.manage`.                                                                                                                                                          |
| `GET /hire/admin/settings/security`                       | The Security Settings object (2FA, password policy, session/lockout rules, IP restriction), as below. Needs `hire.admin.view`.                                                                                                                                                                                                             |
| `PATCH /hire/admin/settings/security`                     | Full replace of the Security Settings object. A value that breaks a rule below is `422 VALIDATION_ERROR` with `error.fields` and nothing is saved. Needs `hire.admin.manage`.                                                                                                                                                              |
| `GET /hire/admin/settings/security/login-history`         | The most recent sign-in attempts (who, when, from where, on what, and whether it worked), newest first. Needs `hire.admin.view`.                                                                                                                                                                                                           |
| `GET /hire/admin/settings/security/sessions`              | Every signed-in session. Needs `hire.admin.view`.                                                                                                                                                                                                                                                                                          |
| `POST /hire/admin/settings/security/sessions/{id}/revoke` | Ends one session immediately (not through Save Changes). Answers with the sessions that remain. `422 VALIDATION_ERROR` if `id` does not exist or is the caller's own current session. Needs `hire.admin.manage`.                                                                                                                           |

The settings object:

```json
{
  "platform_name": "KitchenX Hiring",
  "support_phone": "9878543210",
  "support_email": "support@kitchenx.com",
  "timezone": "Asia/Kolkata",
  "logo_url": null,
  "multi_business": true,
  "enable_outlets": true,
  "self_registration": false,
  "business_verification": true,
  "default_job_expiry_days": 30,
  "max_active_jobs_per_recruiter": 50,
  "default_employment_type": "Full-time",
  "job_visibility": "Public (All Users)",
  "require_job_approval": true,
  "allow_editing_published_jobs": true,
  "auto_close_expired_jobs": false,
  "interview_scheduling": true,
  "interview_type_online": true,
  "interview_type_phone": true,
  "interview_type_in_person": false,
  "application_approval": false,
  "auto_match_candidates": true,
  "application_review_sla_days": 3,
  "candidate_reminder_hours": 24,
  "recruiter_reminder_hours": 2,
  "application_confirmation": true,
  "interview_confirmation": true,
  "require_resume": true,
  "allow_multiple_applications": true,
  "default_candidate_status": "Applied",
  "show_similar_jobs": true,
  "data_retention_months": 24,
  "allow_data_export": true,
  "archive_inactive_records": true
}
```

Rules the backend must keep:

- `platform_name` is 2 to 60 characters after trimming.
- `support_phone` is empty, or a 10-digit mobile number starting 6 to 9. The screen shows it as `+91 98785 43210` and sends the 10 digits.
- `support_email` is required and a valid email address of at most 120 characters.
- `timezone` is one of `Asia/Kolkata`, `Asia/Dubai`, `Asia/Singapore` or `UTC`. These are the zones without daylight saving, so the offset in the menu label is always right.
- `default_job_expiry_days` is a whole number from 1 to 365.
- `max_active_jobs_per_recruiter` is a whole number from 1 to 500.
- `default_employment_type` is one of `Full-time`, `Part-time`, `Contract` or `Temporary`.
- `job_visibility` is one of `Public (All Users)`, `Registered Users` or `Private`.
- `application_review_sla_days` is a whole number from 1 to 30.
- `candidate_reminder_hours` and `recruiter_reminder_hours` are whole numbers from 1 to 168.
- `default_candidate_status` is one of `Applied`, `Under Review` or `Shortlisted`.
- `data_retention_months` is one of 6, 12, 24, 36 or 60.
- Boolean fields: `multi_business`, `enable_outlets`, `self_registration`, `business_verification`, `require_job_approval`, `allow_editing_published_jobs`, `auto_close_expired_jobs`, `interview_scheduling`, `interview_type_online`, `interview_type_phone`, `interview_type_in_person`, `application_approval`, `auto_match_candidates`, `application_confirmation`, `interview_confirmation`, `require_resume`, `allow_multiple_applications`, `show_similar_jobs`, `allow_data_export` and `archive_inactive_records`.
- `logo_url` is a URL an `<img>` can load. `null` means the built-in KitchenX logo.

What the screen does with them:

- The screen shows success only after the API answers. A `422` puts the messages under the matching fields.
- Save Changes sends the changed fields in one `PATCH` and, when a new logo was chosen, uploads it with `POST /hire/admin/settings/logo` in the same save. The logo is not uploaded when it is chosen, and Reset drops it. Reset goes back to the last saved values, not to defaults.
- In this phase the switches are only stored; they change nothing else in the console. Allow Data Export does not hide the Export buttons and Enable Outlets does not hide Businesses / Outlets. Interview Scheduling and Auto Match Candidates name features whose screens are not in the console. When the backend starts to act on a switch, say so here and list what it changes.

The reference picture's Support Phone and Support Email text is garbled, so the demo values above (`9878543210` and `support@kitchenx.com`) are the dashboard's own.

### Users & Roles Settings object

```json
{
  "users": [
    {
      "id": "su-1",
      "name": "Sarah Khan",
      "email": "sarah.khan@kitchenx.com",
      "role": "Admin",
      "status": "active",
      "last_login": "2 hours ago",
      "avatar_initials": "SK"
    }
  ],
  "roles": [
    {
      "id": "sr-admin",
      "name": "Admin",
      "description": "Full system access and configuration",
      "is_system": true
    }
  ],
  "permissions": {
    "manage_users": { "Admin": true, "Recruiter": false, "User": false },
    "manage_roles": { "Admin": true, "Recruiter": false, "User": false },
    "create_manage_jobs": { "Admin": true, "Recruiter": true, "User": false },
    "view_own_applications": { "Admin": true, "Recruiter": true, "User": true },
    "schedule_interviews": { "Admin": true, "Recruiter": true, "User": false },
    "view_platform_reports": { "Admin": true, "Recruiter": true, "User": false }
  },
  "two_factor_auth": true,
  "session_timeout_minutes": 60,
  "user_activity_logging": true,
  "ip_access_restriction": false
}
```

Rules for Users & Roles:

- `users[].status` is `active` or `inactive`.
- System roles `Admin`, `Recruiter`, and `User` must always be present (`is_system: true`) and cannot be deleted.
- The permissions matrix keys are fixed (`manage_users`, `manage_roles`, `create_manage_jobs`, `view_own_applications`, `schedule_interviews`, `view_platform_reports`); each cell is a boolean for Admin, Recruiter, and User.
- `session_timeout_minutes` is a whole number from 5 to 480.
- Edits on the Users & Roles tab stay local until Save Changes sends the whole object in one `PATCH`. Reset restores the last saved payload.

### Notifications Settings object

```json
{
  "channels": {
    "email": true,
    "sms": true,
    "whatsapp": false,
    "in_app": true,
    "push": false
  },
  "events": {
    "new_job_application": true,
    "interview_scheduled": true,
    "interview_reminder": true,
    "candidate_shortlisted": true,
    "candidate_rejected": false,
    "new_business_registration": true
  },
  "templates": {
    "new_job_application": {
      "subject": "New Job Application Received",
      "message": "A new job application has been received for {{job_title}} at {{business_name}}."
    }
  },
  "quiet_hours_start": "10:00 PM",
  "quiet_hours_end": "07:00 AM",
  "retry_attempts": 3,
  "priority": "High"
}
```

Rules for Notifications:

- Channel and event keys are fixed; each value is a boolean.
- Every event key must have a template with non-empty `subject` and `message` (after trim).
- `quiet_hours_start` / `quiet_hours_end` are 12-hour labels such as `10:00 PM`.
- `retry_attempts` is a whole number from 1 to 10.
- `priority` is one of `Low`, `Normal`, `High`, or `Urgent`.
- Edits on the Notifications tab stay local until Save Changes sends the whole object in one `PATCH`. Edit Template updates the draft only. Reset restores the last saved payload.

### Integrations Settings object

```json
{
  "integrations": {
    "smtp": { "status": "connected", "detail": "" },
    "sms": { "status": "connected", "detail": "" },
    "whatsapp": { "status": "not_connected", "detail": "" },
    "google_calendar": { "status": "connected", "detail": "" },
    "google_maps": { "status": "connected", "detail": "" }
  },
  "webhook": {
    "enabled": true,
    "url": "https://your-domain.com/webhook",
    "events": {
      "job_created": true,
      "application_received": true,
      "interview_scheduled": true,
      "candidate_status_updated": true
    }
  }
}
```

Rules for Integrations:

- Integration keys are fixed (`smtp`, `sms`, `whatsapp`, `google_calendar`, `google_maps`); each `status` is `connected` or `not_connected`. `detail` is a free-text, non-secret label (for example a sender address or account name) and is never a password or API key — this screen never asks for one.
- `webhook.url` must be a valid `https://` address while `webhook.enabled` is `true`; it may be blank while the webhook is off.
- Event keys are fixed (`job_created`, `application_received`, `interview_scheduled`, `candidate_status_updated`); each value is a boolean.
- Edits on the Integrations tab — Connect, Configure, Disconnect, and the webhook controls — stay local until Save Changes sends the whole object in one `PATCH`. Reset restores the last saved payload.
- This is a dev-mock-only screen: Connect and Configure never call a real email, SMS, WhatsApp, or Google service. Statuses only change in the in-memory mock.

### Security Settings object

```json
{
  "two_factor_auth": true,
  "password_policy": {
    "min_length": 8,
    "require_uppercase": true,
    "require_number": true,
    "require_symbol": false,
    "expiry_days": 90,
    "reuse_count": 3
  },
  "session_timeout": "30 minutes",
  "failed_login_attempts": "5 attempts",
  "account_lock_duration": "15 minutes",
  "ip_restriction": false
}
```

Rules for Security:

- `session_timeout` is one of `15 minutes`, `30 minutes`, `45 minutes`, `60 minutes`.
- `failed_login_attempts` is one of `3 attempts`, `5 attempts`, `10 attempts`.
- `account_lock_duration` is one of `5 minutes`, `15 minutes`, `30 minutes`, `60 minutes`.
- `password_policy.min_length` is a whole number from 6 to 32. `password_policy.expiry_days` is a whole number from 0 to 365 (0 means passwords never expire). `password_policy.reuse_count` is a whole number from 0 to 10 (0 means reuse is allowed).
- Edits on the Security tab — every row and the Password Policy dialog — stay local until Save Changes sends the whole object in one `PATCH`. Reset restores the last saved payload. Admin Access Control, Login History, and Active Sessions are not part of this object: Admin Access Control reads the Users & Roles Permissions Matrix read-only; Login History and Active Sessions are read live and are never affected by Reset or Save Changes.
- Login History entries: `user_name`, `occurred_at` (ISO timestamp), `ip_address`, `device`, and `result` (`success` or `failed`).
- Active Sessions entries: `user_name`, `device`, `ip_address`, `location`, `last_active_at` (ISO timestamp), and `is_current`. The caller's own current session has no revoke action and `POST .../revoke` on it is refused.

## Recruiter organisation setup (prototype, not wired)

`/recruiter/post-job` keeps the organisation record in localStorage
(`kx-hire-recruiter-organisation-v2:<account_id>`) until a backend endpoint exists. The client
checks GSTIN shape, state code and check digit, city/state consistency, name and address bounds,
PIN format and the certificate's real bytes, but none of that is a security boundary.

When the endpoint is added it must re-run every rule and additionally: verify the GSTIN against
the GST portal before marking the business verified, store the certificate in private object
storage (never a public URL), re-check the uploaded bytes and the 5 MB limit, and return field
errors as `ApiError.fieldErrors` so the form maps them back onto its inputs (CS-06). The
prototype stores certificate metadata only — file name, MIME type and size — never the file.

## Recruiter job posting (prototype, not wired)

`/recruiter/post-job` keeps posted jobs in localStorage
(`kx-hire-recruiter-posted-jobs-v1:<account_id>`) until the endpoint exists. The server must
re-run every rule: title 2–100 trimmed; category, employment type, shift, qualification,
experience and preferred gender from the allowed option values; openings a whole number 1–99;
monthly salary a positive whole-rupee amount up to ₹99,99,999; age 18–60 with the maximum not
below the minimum; job description 30–1,000 trimmed; work location 3–150 trimmed. Return
`ApiError.fieldErrors` keyed by these field names so the form maps them back onto its controls
(CS-06). Store money as integer paise rather than the prototype's rupee number, and treat the
description as untrusted text (escape on render).

## Session

`GET /auth/me` → `{ "user_id": "…", "role": "PLATFORM_ADMIN", "permissions": ["catalog.categories.view", "…"] }`. `*` grants everything. The server enforces every permission on every call (G-02). The dashboard only uses this list to hide controls.
