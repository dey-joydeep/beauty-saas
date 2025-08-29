---
description: Require explicit approval before staging or committing changes
---

# Commit Approval Workflow

This workflow ensures no git staging or commit happens without explicit user approval.

## Steps

1. Review pending changes
   - Run: `git status -s`
   - Run: `git diff` (or `git diff --staged` if applicable)
   - Summarize files you intend to stage/commit.

2. Ask for approval
   - Prompt the user: "Do you want me to stage and commit these files? If yes, provide the commit message."
   - Do not proceed unless the user explicitly says yes and provides a message.

3. Stage files (only after explicit approval)
   - Run: `git add <paths>`
   - Prefer adding specific files (avoid `git add -A` unless the user requests it).

4. Commit (only after explicit approval)
   - Run: `git commit -m "<provided message>"`

5. Optional: Push (only after explicit approval)
   - Run: `git push -u origin <branch>`

## Rules

- Never stage or commit without an explicit instruction from the user in this session.
- Always show `git status -s` and a diff first, then wait.
- Use conventional commit messages when possible, e.g.:
  - `feat(readme): normalize nx commands and remove redundant sections`
  - `docs(readme): fix markdownlint warnings (MD009, MD012)`
- If uncertain about scope or files, ask for clarification instead of guessing.

## Quick Template

- Pre-commit checks
  - `git status -s`
  - `git diff`
- Ask: "Proceed to stage/commit? Commit message: <...>?"
- On approval
  - `git add <files>`
  - `git commit -m "<message>"`
  - (Optional) `git push -u origin <branch>`
