---
description: Structured workflow to go from requirements → analysis/plan → implementation with quality gates
auto_execution_mode: 1
---

# Feature / Change Implementation Workflow

This workflow guides you from understanding requirements to planning and implementing changes with clear approval gates. Use it for features, refactors, bug fixes, and documentation updates.

## 1) Understand the requirements (collect and clarify)

Fill this template before touching code. If anything is unclear, ask and iterate.

- Problem statement: <what pain are we solving?>
- Objectives / Goals: <what success looks like>
- Non-goals: <explicitly out of scope>
- Stakeholders: <who cares / who approves>
- Constraints: <deadlines, tech limits, security/compliance>
- Dependencies: <internal libs, services, external APIs>
- Acceptance criteria (testable):
  - [ ] AC1: ...
  - [ ] AC2: ...
  - [ ] AC3: ...
- Success metrics (if applicable): <e.g., performance, coverage, UX>

Gate A — Confirm understanding
- Ask for confirmation from the stakeholder. If approved, proceed.

## 2) Analyze and devise a plan

- Impact analysis:
  - Affected apps/libs: <nx projects>
  - Cross-cutting concerns: <auth, i18n, accessibility, security>
  - Risks and mitigations: <technical/organizational>
- Options considered and decision rationale
- Implementation strategy:
  - Tasks (high-level → granular):
    - [ ] Task 1
    - [ ] Task 2
  - Testing strategy:
    - Unit tests to add/modify
    - Integration/E2E considerations
  - Rollout plan: <flags, staged rollout, migration>
  - Docs updates needed: <README, ADR, API docs>
- Estimation: <S/M/L + assumptions>

Gate B — Plan approval
- Share the plan. Proceed only when approved.

## 3) Make the changes (implementation)

Recommended sequence and guardrails:

1. Create branch using the branching workflow
   - Use: `/branch-from-readme` (follows naming rules described in the root README). At this moment, no ticketing system is present. So, generate name without any ticket number prefix. Always switch to new branch.
2. Add failing tests (TDD when reasonable)
3. Implement code changes incrementally
4. Keep commits small and atomic; use conventional commits
5. Update documentation alongside code
6. Verify locally
   - Lint: `npx nx run-many -t lint --all`
   - Unit tests: `npx nx run-many -t test --all`
   - Build: `npx nx run-many -t build --all`
   - Affected graph (optional): `npx nx affected:graph`
7. Use commit approval workflow
   - Use: `/commit-approval` to stage and commit with explicit confirmation
8. Create PR using `gh` command and verify to ensure it is created.
9. Open PR with:
   - Summary, scope, screenshots (if UI)
   - Test plan, coverage summary, risks/mitigations
   - Linked issues, breaking change note if any

Gate C — Review and merge
- Require at least one approval and passing CI. Address comments before merge.

## 4) Definition of Done (DoD)

- [ ] All acceptance criteria satisfied
- [ ] Unit tests updated/added; coverage not degraded
- [ ] Lint/build/test passing locally and in CI
- [ ] Docs updated (README/ADR/API)
- [ ] Security, accessibility, and performance considerations addressed (where relevant)
- [ ] Feature flagged or migration path documented (if applicable)
- [ ] Branch merged and tags/releases handled if needed

## 5) Suggested additional rules for smooth working

- Prefer “overview in root, details in child” docs structure
- Keep function size small, meaningful naming, no unused code (aligns with repo quality standards)
- Enforce strict TypeScript settings; avoid `any`; use interfaces for public APIs
- Use `npx nx` consistently for all workspace commands
- Add ADRs for significant architectural changes
- Regularly run `npx nx graph` / `npx nx affected:graph` for impact awareness
- Use feature flags for risky changes; document enable/disable path
- Include accessibility (WCAG 2.1 AA) and i18n checks for UI work
- Never commit without `/commit-approval` in this repo

## Quick-use checklist

- [ ] Gate A (requirements) approved
- [ ] Gate B (plan) approved
- [ ] Branch created via `/branch-from-readme`
- [ ] Tests written/updated
- [ ] Code + docs updated
- [ ] Lint/test/build pass locally
- [ ] `/commit-approval` used for commits
- [ ] PR opened, CI green, review approved
- [ ] DoD completed