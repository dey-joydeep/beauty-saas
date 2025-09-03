# Repository Guidelines

## Tech Stack & Tools
- Backend: NestJS 11; Monorepo: Nx 21.
- Frontend: Angular 20 (Standalone + SSR), Material v3, Tailwind v4.
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

## Server-Side Function Signatures
- Parameter objects ≥3 properties: extract to a named `interface`/`type` or DTO `class` (prefer `class` for NestJS DTOs with validation/serialization).
- Return objects ≥3 properties: define a named `interface`/`type` and use it as the function return type.
- ≥3 primitive params (e.g., `string`, `number`, `boolean`): refactor into a single parameter object typed via `interface`/`type`.
- Place shared types in the relevant `libs/server/*` package near usage (or `libs/shared/*` if cross-cutting). Keep names descriptive and domain-oriented.
- Avoid anonymous object shapes in public APIs; keep function signatures self-documenting and reusable.

## Client-Side Function Signatures
- Any object parameter or object return: use a named `interface`/`type` or model/DTO `class` (do not inline anonymous object types), regardless of property count.
- ≥3 primitive params (e.g., `string`, `number`, `boolean`): consolidate into a single parameter object with a named `interface`/`type`.
- Place UI-facing models in `libs/web/*` near the feature, or in `libs/shared/*` when reused across apps.
- Prefer domain-oriented names; keep signatures stable and self-documenting for services, signals/stores, and component inputs/outputs.

## Frontend (Angular) & SSR
- Use Angular 20 standalone components for new code; avoid new NgModules.
- All web apps are SSR-enabled; code must be SSR-safe.
- SSR safety: guard browser-only APIs (`window`, `document`, `localStorage`, `ResizeObserver`, etc.) using `inject(PLATFORM_ID)` + `isPlatformBrowser()`; avoid top-level access to globals.
- Defer DOM access to lifecycle hooks that run in the browser (`ngAfterViewInit`) and wrap with browser checks when needed.
- Prefer Angular abstractions that work on server and browser (`HttpClient` with relative URLs, `TransferState` for hydration, Angular CDK utilities).
- Use SSR-compatible libraries; if not, lazy-load or guard initialization behind browser checks.

## Web Architecture Rules
- Layering (web):
  - `libs/web/config`: environment/config tokens and helpers for web only.
  - `libs/web/core/*`: core web capabilities (auth, http, testing) shared across web apps.
  - `libs/web/*/auth`: app-specific auth UX and models (Admin/Partner/Customer).
  - `libs/web/ui`: design system components (Material v3 + Tailwind v4) as standalone components.
- Standalone + packaging:
  - Use standalone components/directives/pipes; prefer functional providers (`provideHttpClient`, etc.).
  - Keep Angular libs in partial compilation mode; tsconfig: `moduleResolution: bundler`, `module: preserve`.
  - Avoid NgModules for new code; if bridging legacy, keep wrapper modules thin and temporary.
- SSR & hydration:
  - Avoid accessing browser APIs outside guarded code paths; prefer DI of `DOCUMENT`, `PLATFORM_ID`.
  - Use `TransferState` for caching API responses during SSR to reduce duplicate fetches.
  - Use relative URLs with `HttpClient`; let the server proxy origin.
- Testing (web):
  - Unit tests under `src/**/*.spec.ts` with `jest-preset-angular`; keep tests shallow and deterministic.
  - Integration tests for web libs may live under `tests/integration/**/*.int-spec.ts` when meaningful (e.g., services with HTTP mocks); include in the lib’s Jest config if used.
  - E2E remains at app level only.
- Import hygiene (web):
  - Web libs must not import from server libs. Allowed: `libs/web/*`, `libs/shared/*`.
  - Import from library package roots (path aliases), not deep relative paths across packages.
  - Keep UI in `web/ui`; do not duplicate UI in app-specific libs.

## Shared Library Rules (`libs/shared`)
- Purpose: pure, framework-agnostic TypeScript used by both server and client (e.g., types, validators, pure utils, feature-agnostic models).
- Restrictions:
  - No Angular or NestJS imports; avoid Node-only APIs (fs, path, crypto) unless browser-safe fallbacks exist and are guarded.
  - Keep code JSON-serializable where practical for SSR/TransferState.
  - Avoid runtime side effects; design for tree-shaking and bundler friendliness.
- Types & models:
  - Place cross-cutting types/enums/constants here (e.g., shared error codes, DTO contracts that are truly isomorphic).
  - Do not place persistence entities or server-only DTOs in shared; keep server-specific models in server libs.
- Testing:
  - Unit tests colocated under `src/**/*.spec.ts`; keep fast and framework-free.

## JSDoc & API Documentation
- DTOs/Models (`class`/`interface`/`type`): include a top-level JSDoc (`/** ... */`) describing purpose and usage; each property must also have a JSDoc describing semantics, units, and constraints.
- Classes (all): include a top-level JSDoc describing responsibility, invariants, and examples when helpful.
- Functions (all server and client): include JSDoc with description, `@param {Type} name` — concise description per parameter, `@returns {Type}` — what is returned, and visibility tag (`@public`, `@protected`, `@private`) as appropriate. Add `@throws` for error cases and `@deprecated` when relevant. Use `@typeParam` for generics.
- Style: prefer TSDoc/JSDoc standard tags; always use block comments (`/** ... */`), not line comments, for API docs.
- NestJS DTOs: document class and each decorated property; Angular models/services: document public API, component Inputs/Outputs, and any browser-only behavior or SSR caveats.

## Model/DTO Standards
- Separate concerns: do not expose persistence entities as API; map Entity ↔ DTO ↔ UI Model explicitly.
- One type per file; organize under `models/` and `dtos/` folders per module; re-export via a local `index.ts` barrel.
- Naming: suffix `Dto` (transport), `Entity` (DB/persistence), `Model` (UI/state), `Response` (API output); all in PascalCase.
- Immutability: prefer `readonly` properties for UI models; keep DTOs as plain data (no methods) for serialization.
- Absence vs null: use optional (`?`) for missing fields; use `null` only when semantically meaningful; document both in JSDoc.
- No anonymous shapes in public APIs; prefer `Pick`/`Omit`/composed named types for projections.

## Data Types & Serialization
- Dates: use UTC ISO-8601 strings (`toISOString()`) at API boundaries; convert to `Date` within services as needed; on Angular, parse on demand.
- Numbers with precision (money/decimal): use strings in DTOs; map to Decimal/Prisma types server-side; document currency/scale.
- IDs: prefer UUIDv4 strings; define aliases (e.g., `type UserId = string`) for clarity and future branding.
- Enums: prefer string literal unions; for Nest validation use `@IsEnum(...)`; keep server/client enums aligned in `libs/shared/*`.
- Payload limits: avoid binary/large blobs in DTOs; use dedicated upload endpoints with references.
- TransferState/SSR: ensure models/DTOs are JSON-serializable; avoid class instances/methods crossing the wire.

## Mapping & Versioning
- Centralize mappers in `*-mappers.ts` (e.g., `toDto`, `fromDto`, `toEntity`, `toModel`); keep normalization in one place.
- Output normalization: standardize list responses and metadata; prefer generic wrappers like `Paginated<T>` and `WithMeta<T, M>`.
- Versioning: favor additive changes; for breaking changes create versioned DTOs (e.g., `UserDtoV2`); mark legacy fields `@deprecated` with migration notes.
- Security: mappers must omit internal-only fields (secrets, internal IDs, audit flags) by default.

## Client Models
- State models should be `DeepReadonly<T>` where feasible; avoid accidental mutation; consider `Object.freeze` in dev.
- Component APIs: strongly type `@Input`/`@Output` with named models; avoid `any` and inline shapes.
- Serialization: prefer plain objects in stores/state; avoid persisting `Date`/`Map`/class instances through hydration; store ISO strings or POJOs.
- Unions: represent variants as discriminated unions with a stable `kind`/`type` field for easy narrowing.

## Testing Guidelines
- Unit tests: Jest `*.spec.ts` colocated next to source under `src/`.
- Integration tests: place under each project `tests/integration/**/*.int-spec.ts` (not inside `src/`). Use Nest `TestingModule` with in-memory/test doubles; avoid real external services. Integration tests must run via `nx test <lib>`.
- E2E tests: only at app level (e.g., Playwright or Nest e2e) under `apps/<app>/e2e/`.
- Keep tests fast and isolated; mock IO/DB where sensible. Avoid flakiness and global state.
- Coverage: backend feature libs must maintain 100% coverage (statements, branches, functions, lines). Any temporary exception must include a TODO with justification and a follow-up task.

## Server Architecture Rules
- Layering:
  - `libs/server/core`: cross-cutting concerns and shared building blocks (guards, decorators, filters, config, encryption, common services, validation). No app/feature-specific logic here.
  - `libs/server/contracts-*`: DI tokens and TypeScript ports/interfaces that define boundaries (e.g., repositories, adapters). No implementations.
  - `libs/server/infrastructure`: concrete adapters/implementations for ports (e.g., Prisma repositories, external integrations). No domain/business orchestration.
  - `libs/server/features/*`: domain/business use-cases, controllers, Nest modules wiring ports to use-cases. No low-level infra.
- Guards & security:
  - Place all cross-cutting guards (e.g., `JwtAuthGuard`, `RolesGuard`, `CsrfGuard`) in `server-core/src/auth/guards` and export them from `@cthub-bsaas/server-core`.
  - Features must import guards/decorators from core; do not duplicate guards inside feature libs.
- DI & boundaries:
  - Features depend on `contracts-*` ports and core, not directly on infrastructure implementations.
  - Infrastructure implements `contracts-*` ports and is wired in feature modules via DI tokens.
  - Never import from `infrastructure` inside `core` or `contracts-*`; avoid circular deps.
- Import hygiene:
  - Always import from library package roots (e.g., `@cthub-bsaas/server-core`), never deep subpaths like `../../core/...` or `@cthub-bsaas/server-core/auth/...`.
  - Prefer path aliases defined in `tsconfig.base.json` over relative paths across packages.
- Testing placement:
  - Unit tests colocated under `src/**/*.spec.ts`.
  - Integration tests under `tests/integration/**/*.int-spec.ts` and executed via `nx test <lib>`.
- Coverage enforcement:
  - Backend feature libs must maintain 100% coverage (statements, branches, functions, lines). Add Jest `coverageThreshold` per project to enforce.
  - Exceptions require TODO with justification and a follow-up task.

## Commits & Pull Requests
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- PRs include description, linked issues, screenshots/logs when relevant, and call out breaking changes.

## Roles & Workflow
- Agent responsibilities: Product Owner, Business Analyst, System Architect, Code Reviewer, Technical Guide—clarify requirements, propose architecture, enforce quality, and guide implementation.

## Security, Cost & Config
- Do not commit secrets; use env files or secret managers.
- Prefer free‑tier services and OSS tooling when integrating dependencies.
- Prisma schema/migrations: `libs/server/data-access/src/`; commit meaningful migrations.
