# Web Frontend HLD — OAuth Linking (Updated)

Status: Adopted — 2025-09-01

This document summarizes the web client behavior changes for OAuth sign-in/link flows.

## UX Flow
- Sign in modal shows buttons: “Continue with Google/Meta”.
- On click, call `GET /auth/oauth/:provider/start` and follow the 302 to the provider.
- On callback to `/auth/oauth/:provider/callback`:
  - If 200 `{}`: signed in via existing link; proceed as usual (redirect to intended route).
  - If 401 with `code: error.auth.oauth_link_required`:
    - Show an i18n message prompting: sign in using an existing method (password or a previously linked provider), then link this provider in settings (or retry the provider button after signing in).
    - Provide actions:
      - “Sign in” (switch to password/passkey tab)
      - “Open Settings to Link” (if already signed in from another tab)

## i18n Keys
- `error.auth.oauth_link_required`: “Please sign in first, then link this provider in settings.”
- `error.auth.cannot_unlink_last_method`: “You can’t unlink your last sign-in method.”

## Linking in Settings
- When authenticated, clicking “Link Google/Meta” triggers the same `GET /auth/oauth/:provider/start` and completes the callback to link; expect 200 `{}`.
- Unlink calls `POST /auth/oauth/:provider/unlink`; on success show a toast. Handle `error.auth.cannot_unlink_last_method` distinctly.

## SSR & Security
- Use relative URLs with `HttpClient`; cookies are HttpOnly.
- CSRF: only enforced when `XSRF-TOKEN` cookie is present; callbacks use GET and are decorated with `@SkipCsrf()` server-side.
- Never trust `state` client-side; server validates it.

## Telemetry & Audit
- Log `oauth_start`, `oauth_callback_success|failure`, `oauth_link`, `oauth_unlink` events with provider metadata.

## Open Items (Optional)
- One Tap / Meta login UX refinements.
- Post-link success toast vs. silent success decision.

