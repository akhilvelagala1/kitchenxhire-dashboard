## Summary

-

## Reference

- Prototype page / Figma / screenshot:
- Backend PR (if the contract changed, G-08):

## Page contract

- [ ] `page.contract.json` added or updated (PC-01)
- [ ] Every capability is `true` or a waiver with reason, ticket and date (PC-02)
- Waivers in this PR (capability → reason):

## Standards

- [ ] Uses shared components; no raw table, select, h1, file input or dialog in modules (UI-02, PC-05)
- [ ] Lists are paginated and searched on the server; entity pickers use `AsyncSelect` (UI-06)
- [ ] Every write uses `useApiMutation` with `invalidates` (CS-05, CS-06)
- [ ] No dead code, commented-out code or undated TODOs (CS-09 to CS-11)
- [ ] `.claude/skills` and `.cursor/skills` both updated if a skill changed (G-12)

## Test plan

- [ ] `npm run verify`
- [ ] Browser at 375px and 1280px (G-13)
