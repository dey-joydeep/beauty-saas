# Repository Guidelines

## Tech Stack & Tools
- Backend: NestJS 11; Monorepo: Nx 21.
- Frontend: Angular 20, Material v3, Tailwind v4.
- Testing: Jest 29 (server and web).
- IDE: Windsurf (VSCode commands generally apply).
- Research policy: Always use official documentation for references.

## Project Structure & Modules
- Apps: separate Angular apps for Admin, Partner, Customer under `libs/web/*` (runnable wrappers under `apps/`). Single backend API under `apps/`.
- Libraries: common code and the entire backend logic live in `libs/` (e.g., `server/*`, `shared/`). Always check and reuse existing libs before adding new code.
- Output: `dist/` mirrors sources; TS path aliases resolve dist‑first (see `tsconfig.base.json`). Example: `@cthub-bsaas/server-contracts-auth`.

## Build, Test, and Development
- Build: `npx nx build <project>`; multiple: `npx nx run-many -t build -p <a,b>`
- Type check: `npx nx run <project>:type-check`
- Lint: `npx nx lint <project>`
- Test: `npx nx test <project>`
- Affected: `npx nx affected -t build,test,lint`

## Coding Style & Naming
- TypeScript strict; ES modules.
- ESLint + Prettier; 2‑space indent; single quotes.
- Names: files `kebab-case.ts`; types/classes `PascalCase`; values `camelCase`.

## Testing Guidelines
- Jest unit tests; files `*.spec.ts` colocated or in `__tests__/`.
- Keep tests fast and isolated; mock IO/DB where sensible.

## Commits & Pull Requests
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- PRs include description, linked issues, screenshots/logs when relevant, and call out breaking changes.

## Roles & Workflow
- Agent responsibilities: Product Owner, Business Analyst, System Architect, Code Reviewer, Technical Guide—clarify requirements, propose architecture, enforce quality, and guide implementation.

## Security, Cost & Config
- Do not commit secrets; use env files or secret managers.
- Prefer free‑tier services and OSS tooling when integrating dependencies.
- Prisma schema/migrations: `libs/server/data-access/src/`; commit meaningful migrations.
