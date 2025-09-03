# Auth Frontend — High-Level Design (HLD)

Status: Draft v1 (aligns with backend specs and Auth US v2)
Scope: Admin, Partner, Customer (SSR-enabled). Customer also supports Social Login (Google/Meta).

## 1. Architecture Overview
- Client uses HttpOnly cookies for AT/RT; never stores tokens.
- Angular HttpClient with XSRF integration; server issues `XSRF-TOKEN` cookie and validates `X-XSRF-TOKEN` header.
- Guards: `AuthGuard` for protected routes; `GuestGuard` for login/register pages.
- SSR bootstrap: fetch minimal user/session context server-side (or on first client paint), hydrate via `TransferState`.

## 2. API Contracts (frontend consumption)
Notes:
- Following `../API/api-hld.md` and `../API/api-lld.md` routes. Endpoints use `/auth/login` (no `/auth/sign-in`).
- All requests use relative URLs (SSR-safe). Cookies are set/cleared by the server. Client expects no token in response body except explicit temp tokens.

### 2.1 Login (Password)
- Method/URL: POST `/auth/login`
- Request body (JSON):
  {
    "email": "user@example.com",
    "password": "S3curePass!"
  }
- Success (200):
  - Cookies set by server: `bsaas_at` (AT), `bsaas_rt` (RT), `XSRF-TOKEN`.
  - Body A (no 2FA required):
    { "totpRequired": false }
  - Body B (2FA required):
    { "totpRequired": true, "tempToken": "<jwt_for_totp>" }
- Errors:
  - 400 Validation: { code: "error.validation"; details?: FieldErrors }
  - 401 Invalid credentials: { code: "error.auth.invalid_credentials" }
  - 429 Rate limited: { code: "error.rate_limited", retryAfter?: number }
  - 5xx Generic: { code: "error.generic" }
- Frontend reaction:
  - 200 / totpRequired=false: navigate to intended route (from query/state) or app default.
  - 200 / totpRequired=true: route to TOTP Challenge screen with `tempToken` carried in nav state.
  - 400: display field errors inline.
  - 401: show generic auth error (no enumeration).
  - 429: disable submit, show cooldown using `Retry-After` header or payload, re-enable after timeout.

### 2.2 TOTP Challenge (during login)
- Method/URL: POST `/auth/login/totp`
- Request body:
  { "tempToken": "<jwt_for_totp>", "totpCode": "123456" }
- Success (200): cookies set; body: { }
- Errors: 401 invalid/expired code/token; 429; 5xx.
- Reaction: on 200, navigate to intended route. On 401, show "invalid code" with retry count if provided.

### 2.3 Refresh Tokens
- Method/URL: POST `/auth/refresh`
- Request body: usually empty; server reads RT cookie. Optional body: { "refreshToken": "..." } for non-browser clients.
- Success (200): cookies rotated; body: { }
- Errors: 400 missing RT; 401 invalid RT; 429; 5xx.
- Reaction: silent token refresh on app bootstrap or 401 recovery path; if 401, redirect to login.

### 2.4 Logout
- Method/URL: POST `/auth/logout`
- Success (200): cookies cleared; body: { "success": true }
- Reaction: clear client state, redirect to `/login` (or home for Customer).

### 2.5 Sessions
- List
  - GET `/auth/sessions`
  - Success (200): [ { id, deviceUA, deviceOS, lastSeenAt, createdAt, ipMasked? } ]
- Revoke
  - POST `/auth/sessions/revoke` body: { id: "sessionId" } (alias: `/auth/sessions/revoke/:id`)
  - Success (200): { success: true }
- Errors: 401 unauthenticated; 403 forbidden (not owner/tenant scope); 5xx.
- Reaction: update sessions list; if current session revoked, force logout.

### 2.6 Registration (Customer) — placeholder now
- Method/URL: POST `/auth/register`
- Request body (placeholder): { email, password? }
- Current behavior: 202 Accepted (or 501 Not Implemented) with message; UI shows confirmation and CTA.
- Target behavior: 200/202 → send verification OTP; after verify, either auto-login or redirect to login (policy).

### 2.7 Email Verification (OTP)
- Request OTP
  - POST `/auth/email/verify/request` body: { email }
  - Success (202): { success: true }
- Confirm OTP
  - POST `/auth/email/verify/confirm` body: { email, otp: "123456" }
  - Success (200): { success: true }
- Errors: 400 validation; 401/403 if abused; 429 resend cooldown; 410 expired; 5xx.
- Reaction: show success and proceed (auto-login vs redirect per policy); handle cooldown timers.

### 2.8 Password Reset
- Forgot
  - POST `/auth/password/forgot` body: { email }
  - Success (202): always generic { success: true }
- Reset
  - POST `/auth/password/reset` body: { token, newPassword, recoveryCode? }
  - Success (200): { success: true } (server may revoke other sessions)
- Errors: 400 validation; 401 invalid/expired; 429; 5xx.
- Reaction: show generic success on forgot; on reset success, navigate to login (Customer may auto-login later if policy adds it).

### 2.9 TOTP Enroll
- Start
  - POST `/auth/totp/enroll/start` → { qrCodeDataUrl, secretMasked? }
- Finish
  - POST `/auth/totp/enroll/finish` body: { code: "123456" } → { success: true, recoveryCodes: string[] }
- Errors: 401/403; 429; 5xx.
- Reaction: show QR, then show recovery codes (download/print) once.

### 2.10 WebAuthn (Passkeys)
- Register start/finish
  - POST `/auth/webauthn/register/start` → PublicKeyCredentialCreationOptions
  - POST `/auth/webauthn/register/finish` body: attestation → { success: true }
- Login start/finish
  - POST `/auth/webauthn/login/start` → PublicKeyCredentialRequestOptions
  - POST `/auth/webauthn/login/finish` body: assertion → { success: true }
- Errors: 400 invalid params; 401/403; 409 duplicates; 5xx.
- Reaction: browser-only calls to WebAuthn APIs; guard SSR.

### 2.11 Social Login (Customer)
- Start
  - GET `/auth/oauth/:provider/start?redirect=/target` (navigates)
- Callback (handled server-side)
  - GET `/auth/oauth/:provider/callback?...` → sets cookies then redirects back
- Linking/Unlinking (from authenticated session)
  - POST `/auth/oauth/:provider/link/start` → redirect; GET callback handled server-side
  - POST `/auth/oauth/:provider/unlink` → { success: true }
- Errors: shown on a client status page if provided via query (e.g., `?error=oauth_denied`).
- Reaction: show spinner during callback; on success, route to target; on error, show mapped message.

## 3. Headers, Cookies, and Codes
- CSRF: Angular sends `X-XSRF-TOKEN` automatically; ensure cookie name `XSRF-TOKEN`.
- Cookies: `bsaas_at` (AT), `bsaas_rt` (RT) with SameSite=Lax, Secure, HttpOnly; domain `.cthub.in`.
- Retry-After: read from response header or payload for 429 handling.
- i18n codes: server returns `code` fields like `error.auth.invalid_credentials`; client maps to localized strings.

## 4. Error Code → i18n Mapping (examples)
- error.auth.invalid_credentials → auth.errors.invalidCredentials
- error.auth.missing_refresh_token → auth.errors.missingRefresh
- error.auth.invalid_refresh_token → auth.errors.invalidRefresh
- error.auth.invalid_totp_code → auth.errors.invalidTotp
- error.auth.invalid_or_expired_totp → auth.errors.totpExpired
- error.auth.user_not_found → auth.errors.userNotFound
- error.security.csrf_failed → auth.errors.csrf
- error.rate_limited → common.errors.rateLimited
- error.validation → common.errors.validation
- error.generic → common.errors.generic

Languages: en, bn, hi (add hi keys; bn/en exist; jp optional). Frontend apps must include these keys in their i18n assets.

## 5. Navigation & State Reactions
- Successful login → redirect to intended URL; preserve query `redirect` param if present and safe.
- Logout → clear local state, route to `/login` (Admin/Partner) or home (Customer).
- Session revoked (server-pushed events optional) → on 401 from API, route to login and show session-expired message.

## 6. Security Considerations
- Never access tokens in JS; rely on cookies only.
- Guard WebAuthn/social flows behind `isPlatformBrowser`. Avoid starting flows during SSR.
- Validate redirect targets against an allowlist.
- Avoid account enumeration; always show generic success for forgot/register requests.
