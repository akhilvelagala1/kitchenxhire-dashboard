# Guardrails

Every check here exists because of a failure we already shipped in Labha, or one the KitchenXHire prototype would ship. Rule ids point to `.claude/skills/*/SKILL.md`, which Claude Code reads. Cursor reads the identical copy in `.cursor/skills/`.

## Where each check runs

| Check                                     | Command                        | Pre-commit     | Pre-push | CI             |
| ----------------------------------------- | ------------------------------ | -------------- | -------- | -------------- |
| Lint and format on staged files           | `lint-staged`                  | ✓              |          |                |
| Page contracts, stale markers, skill sync | `npm run guard`                | ✓              |          | ✓              |
| Commit message                            | commitlint                     | ✓ (commit-msg) |          | ✓ (PR commits) |
| Typecheck                                 | `npm run typecheck`            |                | ✓        | ✓              |
| Dead code: unused files, exports, deps    | `npm run knip`                 |                | ✓        | ✓              |
| Tests, with a coverage report             | `npm run test`                 |                | ✓        | ✓              |
| Full lint and format                      | `npm run lint`, `format:check` |                |          | ✓              |
| Build                                     | `npm run build`                |                |          | ✓              |
| Dependency audit (high)                   | `npm audit --omit=dev`         |                |          | ✓              |
| Secrets                                   | Gitleaks                       |                |          | ✓              |
| Stale PRs and branches                    | `actions/stale`                |                |          | weekly         |
| Dependency updates                        | Dependabot                     |                |          | weekly         |

`npm run verify` runs everything that runs locally, in one command. Agents must run it before saying "done" (G-11).

## Past failures → the check that prevents them

| What went wrong                                                                                           | Where                  | Check now                                                                                    |
| --------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| 37 unused UI files and empty `common/` / `hooks/index.ts` barrels survived because tsconfig excluded them | labha-dashboard        | `knip` (CS-09); nothing is excluded from tsconfig                                            |
| A plan-deactivation guard never ran because it compared `GROWTH` with `growth`                            | labha onboarding QA    | CS-12 (import enum constants); typed `as const` enums                                        |
| A welcome modal triggered on a phase that never happens: dead code nobody noticed                         | labha onboarding QA    | knip plus T-05 (behavior tests per page)                                                     |
| An orphaned password page stayed publicly routable after its route was removed                            | labha-storefront       | PC-06 (unregistered module fails), CS-13                                                     |
| RBAC edits did not apply until a reload, because permissions sat in a persisted store                     | labha QA               | CS-05 (`usePermissions` reads react-query)                                                   |
| Toggles failed silently and tables looked stale after a failed write                                      | labha QA (B22)         | CS-06 (`useApiMutation` always toasts; `invalidates` required)                               |
| Agent skill copies drifted between tools                                                                  | labha (pin script)     | `guard:skills` (G-12)                                                                        |
| Pages shipped without search, pagination, export or delete                                                | KitchenXHire prototype | `page.contract.json` (PC-01 to PC-07)                                                        |
| Static `<select>` of all categories, brands and suppliers                                                 | KitchenXHire prototype | PC-05 bans raw `<select>` in modules; UI-06 requires `AsyncSelect`                           |
| Fake pagination, with counts written as text                                                              | KitchenXHire prototype | `DataTable` takes `total` from the API meta; PC-03 evidence check                            |
| Credentials in client code                                                                                | KitchenXHire prototype | G-06, Gitleaks                                                                               |
| 1,000- to 2,900-line page files                                                                           | labha-dashboard        | ESLint `max-lines: 300` (CS-08)                                                              |
| Commented-out code and undated TODOs that never get done                                                  | general                | `guard:stale` (CS-10, CS-11): a TODO needs a ticket and a date, and fails CI after that date |
| Gaps nobody wrote down ("we will add export later")                                                       | KitchenXHire prototype | A waiver needs a reason, a ticket and a date; it expires in CI (PC-02, PC-07)                |
| Builds were not reproducible (no lockfile, `npm install` in CI and Docker)                                | labha-dashboard        | The lockfile is committed; CI and Docker use `npm ci`                                        |
| No security headers on nginx                                                                              | labha-dashboard        | `nginx.conf` sends CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`  |

## Agent intake (Claude Code and Cursor)

Most of our code is written through Claude Code and Cursor. A prompt like "make the brands page" produces a page that looks fine and misses half the contract. The `new-page` skill makes the agent:

1. Ask the developer about the reference screen, fields, columns, filters, every capability (or a waiver reason), roles, API, import columns, copy and styling, all before writing code.
2. Write `page.contract.json` and get the developer to confirm it.
3. Scaffold from the reference module (`npm run new:module`), so every shared component is already wired in.
4. Run `npm run verify` and check the page at phone and desktop widths.

Claude Code loads it from `AGENTS.md` via `CLAUDE.md`. Cursor loads it from `.cursor/rules/kitchenxhire.mdc` (`alwaysApply`).

## Exceptions

- A capability that does not apply: add a waiver in `page.contract.json`. CODEOWNERS reviews it.
- A genuine one-off raw element in a module: add `// guard-allow: <reason>` on that line. Reviewers push back on these.
- Never `--no-verify`. If a hook is wrong, fix the hook in its own pull request.
