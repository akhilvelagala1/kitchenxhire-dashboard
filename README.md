# kitchenxhire-dashboard

Admin dashboard for **KitchenXHire** (platform and operations consoles).

KitchenXHire is a staffing and hiring marketplace for the food and beverage trade. It helps restaurants, cloud kitchens, caterers, bakeries, and similar businesses hire kitchen, delivery, and warehouse staff. It is a sister product to [KitchenX](https://github.com/samrit-internal/kitchenx-dashboard) (B2B supply platform) in the same F&B vertical.

## Stack

Same family as [labha-dashboard](https://github.com/samrit-internal/labha-dashboard): **React 19, Vite, TypeScript, react-router, TanStack Query, Tailwind 4, zod, react-hook-form**. The structure differs on purpose. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/audit/LABHA_DASHBOARD_GAPS.md](docs/audit/LABHA_DASHBOARD_GAPS.md).

## Local setup

Node `26+` (`.nvmrc` pins 26), npm `>=10`.

```bash
nvm use
cp .env.example .env
npm install          # also installs the Husky git hooks
npm run dev          # default .env uses /api/v1 → in-memory mock API on :5173 (no backend)
npm run dev:mock     # same mock API; explicit --mode mock (alias when troubleshooting env)
# Set VITE_API_BASE_URL=http://127.0.0.1:8080/api/v1 in .env to use kitchenxhire-backend-go
```

Platform admin login at `/admin-login` when using the mock API: **`admin@kitchenx.in`** / **`Admin@123`**. After sign-in, the console lives at `/admin/dashboard`.

## Scripts

| Script                                        | What it does                                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `dev`, `build`, `preview`                     | Vite                                                                                                                           |
| `typecheck`, `lint`, `format`, `format:check` | tsc, ESLint (boundaries, max-lines, bans), Prettier                                                                            |
| `test`, `test:watch`, `test:coverage`         | Vitest + Testing Library                                                                                                       |
| `knip`                                        | Dead code: unused files, exports, types, dependencies                                                                          |
| `guard`                                       | `guard:contracts` (page contract), `guard:stale` (TODO/commented code), `guard:skills` (Claude/Cursor skill sync)              |
| `verify`                                      | Everything above in one go: run before every push                                                                              |
| `new:module`                                  | Scaffold a module from the `categories` reference: `npm run new:module -- brands Brand Brands catalogue/brands catalog.brands` |

Hooks: **pre-commit** runs lint-staged and `guard`. **commit-msg** runs commitlint. **pre-push** runs typecheck, knip and tests. CI runs all of them, plus build, `npm audit`, Gitleaks and a Docker build.

## Building a page

Read [AGENTS.md](AGENTS.md) and the `new-page` skill, whether you use Claude Code, Cursor or no agent at all. Every module ships a `page.contract.json` that declares the super-admin capabilities (search, filters, date range, sort, pagination, detail, create, edit, archive, restore, bulk actions, import, export, audit, async selects). Each capability is either built or waived with a dated reason. See [docs/GUARDRAILS.md](docs/GUARDRAILS.md).

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): folder structure and the reasons for it
- [docs/GUARDRAILS.md](docs/GUARDRAILS.md): every check and the past failure it prevents
- [docs/API_CONTRACT_EXPECTATIONS.md](docs/API_CONTRACT_EXPECTATIONS.md): list, job, audit and session shapes for kitchenxhire-backend-go
- [docs/audit/PROTOTYPE_GAP_REPORT.md](docs/audit/PROTOTYPE_GAP_REPORT.md): prototype page-by-page gaps and the super-admin superset

## Sibling repositories

| Repository                                                                                          | Purpose                                                     |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [kitchenxhire-infra](https://github.com/samrit-internal/kitchenxhire-infra)                         | Terraform / cloud infrastructure                            |
| [kitchenxhire-database-postgres](https://github.com/samrit-internal/kitchenxhire-database-postgres) | PostgreSQL schema and migrations                            |
| [kitchenxhire-backend-go](https://github.com/samrit-internal/kitchenxhire-backend-go)               | Go HTTP API (Fiber modular monolith)                        |
| [kitchenxhire-dashboard](https://github.com/samrit-internal/kitchenxhire-dashboard)                 | Admin dashboard (React + Vite)                              |
| [kitchenxhire-marketing-site](https://github.com/samrit-internal/kitchenxhire-marketing-site)       | Public marketing site (Next.js)                             |
| [kitchenxhire-app](https://github.com/samrit-internal/kitchenxhire-app)                             | React Native (Expo) job-seeker and employer app, and RN web |

Naming note: the mobile repo is `kitchenxhire-app` (not `kitchenxhire-web-app`) so it stays kebab-case like Labha (`labha-dashboard`, `labha-storefront`) and does not imply a web-only app.
