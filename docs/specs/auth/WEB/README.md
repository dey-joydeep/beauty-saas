# Auth Frontend (Angular 20) — Overview, HLD & LLD

This folder contains frontend specifications for the Authentication feature across Admin, Partner, and Customer apps. It complements backend specs under `docs/specs/auth/**` and user stories under `docs/us/auth/**`.

References:
- High-Level Design: `auth-frontend-hld.md` (API contracts, flows, HTTP codes, reactions)
- Low-Level Design: `auth-frontend-lld.md` (forms, fields, validation, i18n keys, UX states)
- Backend API: `../API/api-hld.md`, `../API/api-lld.md`, `../API/error-codes.md`
- Flows: `../FLOWS/*`, including `customer-social-login.md`

Scope:
- Angular 20, standalone components, SSR-enabled.
- Material v3 + Tailwind v4.
- Cookie-based auth (AT/RT) with CSRF double-submit.
- Social login (Google/Meta) — Customer only.

Architecture summary (from the former overview):
- SSR-safe: guard browser-only APIs; use `TransferState` to avoid duplicate fetches.
- Cookie-first: AT/RT are HttpOnly cookies; the client never stores tokens.
- CSRF: rely on Angular HttpClient XSRF integration (`XSRF-TOKEN` + `X-XSRF-TOKEN`).
- Standalone components; shared logic in `libs/web/core/*`, UI in `libs/web/ui`.
- i18n-ready (en/bn/hi); accessible forms with clear error states and ARIA.

Routing and key components (summary):
- Routes: `/login`, `/register` (placeholder), `/verify-email`, `/password/forgot`, `/password/reset`, `/auth/oauth/callback`, `/security/mfa`, `/security/sessions`.
- Guards: `AuthGuard` (protects) and `GuestGuard` (blocks login for authenticated).
- Components: Login form, Register placeholder, Email verify request/confirm, Forgot/Reset, TOTP enroll/verify, Recovery codes, Passkey enroll/login button, Social buttons (Customer).
- Services & store: `AuthHttpService` (relative URLs) and `AuthStore` (signals) with SSR bootstrap via `TransferState`.

For detailed request/response shapes, validation, and client reactions, see HLD/LLD above.
