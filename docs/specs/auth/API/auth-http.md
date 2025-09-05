# Auth HTTP API - OAuth Linking (Updated)

Status: Adopted — 2025-09-01

This document specifies the OAuth-related HTTP endpoints and error codes after tightening the linking policy.

Scope
- This page covers only OAuth (social login/linking) flows. For the rest of the Auth API (login, refresh, TOTP, email verification, password reset, recovery codes, WebAuthn), see the LLD:
  - docs/specs/auth/API/api-lld.md

## Endpoints

- `GET /auth/oauth/:provider/start`
  - Starts OAuth for `provider` (e.g., `google`, `meta`).
  - Response: 302 Found; `Location` is the provider authorize URL with a signed `state`.

- `GET /auth/oauth/:provider/callback?code=...&state=...`
  - Exchanges `code` for a provider profile.
  - Unauthenticated callback:
    - If an existing social link is found (provider + providerUserId), issues AT/RT cookies and returns `200 {}`.
    - If not linked, returns `401` with `code: "error.auth.oauth_link_required"`.
  - Authenticated callback (user present via `JwtAuthGuard`):
    - Links the provider to the current user and returns `200 {}`.
  - Errors:
    - `400` `error.validation` — missing `code`.
    - `401` `error.auth.oauth_link_required` — unauthenticated and no prior link exists.

- `POST /auth/oauth/:provider/unlink`
  - Requires auth. Unlinks the provider from the current user.
  - Response: `201 { success: true }`.
  - Errors:
    - `401` `error.auth.cannot_unlink_last_method` — would remove the last sign-in method.

## Cookies (unchanged)
- Access token: `bsaas_at` (HttpOnly, Secure, SameSite=Lax, path `/`).
- Refresh token: `bsaas_rt` (HttpOnly, Secure, SameSite=Lax, path `/auth`).
- CSRF cookie `XSRF-TOKEN` is issued/rotated on password login and refresh.

## Error Codes
- `error.auth.oauth_link_required`: Frontend should prompt the user to sign in using a known method, then retry the provider to complete linking (or offer an explicit “Link” action under settings).
- `error.auth.cannot_unlink_last_method`: Prevents removing the last remaining auth method.
- Other existing auth error codes remain as previously documented.

## Notes
- The system no longer auto-links by email in unauthenticated callbacks (even when the provider asserts a verified email). Linking requires an authenticated session.
- Providers: minimum scope includes `email`; verified email is still recorded when provided but not used to auto-link.
