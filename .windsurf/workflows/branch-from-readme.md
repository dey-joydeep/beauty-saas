---
description: Create a git branch following the naming rules defined in the root README
---

# Branch Creation Workflow (from README rules)

This workflow helps you create a git branch that follows the rules documented in the root `README.md` under `## Development Workflow > ### Branch Naming`.

Source rules in `README.md`:
- Format: `<type>/<ticket-number>-<short-description>`
- Types (examples from README): `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`

## Steps

1. Verify current repo status (read-only)
   - Run: `git status -s`
   - If there are uncommitted changes and you still want to proceed, you may stash them later.

2. Choose base branch
   - Default base: `main` (or specify another, e.g., `develop`)
   - Run (optional): `git fetch origin`
   - Run (optional): `git checkout <base>` then `git pull --ff-only`

3. Collect branch inputs
   - `type`: one of `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`
   - `ticket-number`: digits only (e.g., `123`)
   - `short-description`: kebab-case, 3–50 chars, only lowercase letters/numbers/hyphens (e.g., `normalize-readme-lints`)

4. Validate inputs
   - `type` ∈ allowed set above
   - `ticket-number` matches `^\d+$`
   - `short-description` matches `^[a-z0-9]+(?:-[a-z0-9]+)*$` and length ≤ 50
   - Compose: `<type>/<ticket-number>-<short-description>`
   - Examples:
     - `feat/123-add-user-profile`
     - `docs/45-update-readme-linting`

5. Confirm branch name with user
   - Prompt: "Create branch '<type>/<ticket-number>-<short-description>' from '<base>'? (yes/no)"

6. Create branch (only after explicit confirmation)
   - If working tree not clean, ask whether to stash:
     - `git stash push -u -m "pre-branch: <branch-name>"`
   - Create branch:
     - `git checkout -b <branch-name> <base>`
   - Optional: push upstream
     - `git push -u origin <branch-name>`

## Rules

- Never create or switch branches without explicit confirmation from the user.
- Prefer using the allowed `type` values; if a new type is desired, ask the user and record the decision.
- Keep the `short-description` concise and meaningful; avoid generic terms like `changes` or `update`.
- If validation fails, explain the specific reason and re-prompt.

## Quick Prompts

- Ask for inputs:
  - "Type (feat|fix|chore|docs|test|refactor|style)?"
  - "Ticket number (digits only)?"
  - "Short description (kebab-case, <= 50 chars)?"
  - "Base branch (default: main)?"
- Confirm:
  - "Create branch `<type>/<ticket-number>-<short-description>` from `<base>`?"
- On approval, run in order:
  - `git fetch origin`
  - `git checkout <base>`
  - `git pull --ff-only`
  - (optional) `git stash push -u -m "pre-branch: <branch>"`
  - `git checkout -b <branch> <base>`
  - (optional) `git push -u origin <branch>`
