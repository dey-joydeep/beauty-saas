# Auth API - Low-Level Design (LLD)

Status: Draft v1 (aligned with current implementation)

Conventions
- Media type: application/json
- Cookies: set/clear by server as side effects (see HLD).
- Errors: { code: string, message?: string, details?: Record<string,string> }; message is optional and not intended for UI; clients map code to i18n.

## 1) POST /auth/login
Purpose: Password login; may require TOTP.

Request
- Headers: Content-Type: application/json
- Body:
  {
    "email": "user@example.com",
    "password": "S3curePass!"
  }
Validation
- email: required, valid email format, lowercased.
- password: required, min 8.

Success 200
- Cookies set: bsaas_at, bsaas_rt, XSRF-TOKEN
- Body (no TOTP): { "totpRequired": false }
- Body (TOTP req): { "totpRequired": true, "tempToken": "<jwt>" }

Errors
- 400 { code: "error.validation", details: { email?: string, password?: string } }
- 401 { code: "error.auth.invalid_credentials" }
- 429 { code: "error.rate_limited" } with Retry-After header

## 2) POST /auth/login/totp
Purpose: Complete TOTP challenge.

Request
- Body: { "tempToken": "<jwt>", "totpCode": "123456" }
Validation: totpCode matches /^\d{6}$/.

Success 200
- Cookies set: bsaas_at, bsaas_rt
- Body: {}

Errors
- 401 { code: "error.auth.invalid_totp_code" | "error.auth.invalid_or_expired_totp" }
- 429 { code: "error.rate_limited" }

## 3) POST /auth/refresh
Purpose: Rotate refresh token; issue new AT/RT.

Request
- Usually empty; server reads RT cookie. Optional: { "refreshToken": "..." }

Success 200
- Cookies rotated; Body: {}

Errors
- 400 { code: "error.auth.missing_refresh_token" }
- 401 { code: "error.auth.invalid_refresh_token" }
- 429 { code: "error.rate_limited" }

## 4) POST /auth/logout
Success 200
- Cookies cleared; Body: { "success": true }

## 5) GET /auth/sessions
Success 200
- Body: [ { "id": "...", "deviceUA": "...", "deviceOS": "...", "lastSeenAt": "2025-09-01T12:00:00Z", "createdAt": "..." } ]

## 6) POST /auth/sessions/revoke
Request
- Body: { "id": "sessionId" }
Success 200
- { "success": true }
Errors: 403 if not owner.

## 7) POST /auth/register (placeholder)
Request: { "email": "...", "password"?: "..." }
Success 202 { "success": true, "message": "Registration accepted" }
Errors 501 { code: "error.not_implemented" } (if configured as stub)

## 8) Email Verification
- Request: POST /auth/email/verify/request { email }
  - 202 { success: true }
  - 429 { code: "error.rate_limited" }
- Confirm: POST /auth/email/verify/confirm { email, otp }
  - 200 { success: true }
  - 401/410 { code: "error.auth.invalid_otp" | "error.auth.otp_expired" }

## 9) Password Reset
- Forgot: POST /auth/password/forgot { email } → 202 { success: true }
- Reset: POST /auth/password/reset { token, newPassword }
  - 200 { success: true }
  - 401 { code: "error.auth.invalid_or_expired_reset_token" }

## 10) TOTP Enroll
- Start: POST /auth/totp/enroll/start → 200 { qrCodeDataUrl }
- Finish: POST /auth/totp/enroll/finish { code } → 200 { success: true }

## 11) Recovery Codes
- Generate: POST /auth/recovery/codes → 200 string[] (show once)
- Verify: POST /auth/recovery/verify { code } → 200 { success: true }

## 12) WebAuthn (Passkeys)
- Register start: POST /auth/webauthn/register/start → 200 PublicKeyCredentialCreationOptions
- Register finish: POST /auth/webauthn/register/finish (attestation) → 200 { success: true }
- Login start: POST /auth/webauthn/login/start → 200 PublicKeyCredentialRequestOptions
- Login finish: POST /auth/webauthn/login/finish (assertion) → 200 {}
  - Cookies set: bsaas_at, bsaas_rt

## 13) Social Login (Customer)
- Start: GET /auth/oauth/:provider/start?redirect=/target → 302 to provider (server-managed)
- Callback: GET /auth/oauth/:provider/callback?... → sets cookies (sign-in) or links when already authenticated; 302 back to redirect
- Unlink: POST /auth/oauth/:provider/unlink → 200 { success: true }
  - Authenticated callback behaviour:
    - If the user is signed in, the callback links the provider to the current account and returns 200 {}
    - If the user is not signed in and no existing link is found, returns 401 { code: "error.auth.oauth_link_required" }

Notes
- All error codes enumerated in error-codes.md. Clients map to i18n per frontend HLD.
- Include Retry-After header on 429.