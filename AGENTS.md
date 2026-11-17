# Agent instructions: kitchenxhire-dashboard

The KitchenXHire admin console (React, Vite, TypeScript). **Personas:** homePage (public hire site on `/`), Customer (`kitchenxhire-app`), and six staff roles in one `AppShell` — Platform Admin superset; other roles see only necessary nav and edits. See `.claude/skills/personas/SKILL.md`.

The job-seeker and employer app (`kitchenxhire-app`) and this console are one product. Brand colour, type, and control shape are in `ui-standards` (UI-01). Layout is the admin prototype: sidebar from 1024px, drawer on phone and tablet. Do not copy the mobile app's phone-only column.

The public hire site lives in `src/modules/home` on `/` via `publicRoutes` — not inside `AppShell` (`docs/HOME_PAGE.md`, CS-16).

Always apply these skills:

- `.claude/skills/guardrails/SKILL.md`
- `.claude/skills/coding-standards/SKILL.md`
- `.claude/skills/ui-standards/SKILL.md`
- `.claude/skills/page-contract/SKILL.md`
- `.claude/skills/kitchenxhire-repo-standards/SKILL.md`
- `.claude/skills/personas/SKILL.md`

Use these when the task matches:

- `.claude/skills/feature-request/SKILL.md`: when the user pastes **FEATURE BUILD REQUEST** — analyze skills/repo first, ask **Proceed** before code.
- `.claude/skills/feature-implementation/SKILL.md`: before building or integrating any screen or module (after Proceed when feature-request applied).
- `.claude/skills/feature-map/SKILL.md`: prototype panel → module id and route prefix.
- `.claude/skills/new-page/SKILL.md`: before building or changing any page. Interview the developer first.
- `.claude/skills/testing-standards/SKILL.md`: when writing tests.

Cursor reads the same files from `.cursor/skills/`. Keep both copies identical (G-12).

## Before you say "done"

```bash
npm run format
npm run verify   # typecheck, lint, format:check, guard, knip, test
```

## Map

- `src/modules/categories` is the reference admin module. Copy its shape: `npm run new:module`.
- `src/modules/home` is the reference public hire site (UI-13).
- `docs/BEST_PRACTICES.md`: organization summary for humans.
- `docs/ARCHITECTURE.md`: folder structure and why.
- `docs/audit/PROTOTYPE_GAP_REPORT.md`: what each prototype page lacks against the super-admin bar.
- `docs/API_CONTRACT_EXPECTATIONS.md`: what the dashboard expects from kitchenxhire-backend-go.
- `docs/GUARDRAILS.md`: each check, and the past failure it prevents.
