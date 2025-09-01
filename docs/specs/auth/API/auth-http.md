# HTTP API — Authentication

> All endpoints are **first-party web** facing unless stated. Authentication uses **HttpOnly, Secure cookies** with `SameSite=Lax` and cookie domain `.cthub.in` to enable SSO across subdomains.

## Cookies
- **Access Token (AT)**: `bsaas_at` — TTL 10–15m, HttpOnly, Secure, SameSite=Lax, Path scoped per app (e.g., `/` by default).
- **Refresh Token (RT)**: `bsaas_rt` — TTL 14–30d, HttpOnly, Secure, SameSite=Lax, Path `/auth`, **rotated** on refresh with `jti` tracking in Redis.
- **XSRF**: `XSRF-TOKEN` (non-HttpOnly) + header `X-XSRF-TOKEN` for state-changing requests.

## Sign-in / Sign-out
- `POST /auth/login` — body: `{ email, password }` → sets AT/RT cookies. 429 on throttle.
- `POST /auth/logout` — clears cookies, revokes device RT.

## Refresh & Sessions
- `POST /auth/refresh` — rotates RT; returns new AT/RT; old RT `jti` invalidated.
- `GET /auth/sessions` — lists active sessions/devices.
- `POST /auth/sessions/revoke` — revoke a specific device/session by id.

## Registration & Verification
- `POST /auth/register` — email+password registration (Customer and invited Staff).  
- `POST /auth/email/verify/request` — send verification OTP (6 digits, TTL 10m).  
- `POST /auth/email/verify/confirm` — `{ email, otp }` confirm.

## Passkeys (WebAuthn)
- `POST /auth/webauthn/register/start` — returns PublicKeyCredentialCreationOptions.
- `POST /auth/webauthn/register/finish` — verify attestation; on success, store credential.
- `POST /auth/webauthn/login/start` — returns PublicKeyCredentialRequestOptions.
- `POST /auth/webauthn/login/finish` — verify assertion; on success, set cookies.

## TOTP (2FA)
- `POST /auth/totp/enroll/start` — returns secret + QR (data URL).
- `POST /auth/totp/enroll/finish` — verify code; enable TOTP.
- `POST /auth/totp/challenge` — trigger challenge during login (if policy requires).
- `POST /auth/totp/verify` — verify TOTP; on success, set cookies or proceed.

## Recovery
- `POST /auth/recovery/codes` — generate/show once (download); hashed at rest.
- `POST /auth/recovery/verify` — verify a recovery code; single-use.

## Password Reset (Flexible)
- `POST /auth/password/forgot` — always returns generic response; send single-use link (TTL 72h).
- `POST /auth/password/reset` — body: `{ token, newPassword }`.  
  - If 2FA available → require TOTP/passkey step.  
  - If 2FA unavailable → accept **recovery code**.  
  - On success → revoke other sessions.

## Admin/Owner Policies (selected)
- Admin must enroll Passkey or TOTP before dashboard access.  
- Owner can require staff 2FA and revoke staff sessions within tenant.

## Rate Limiting (recommended)
- Login: exponential backoff per-account (secondary signal: IP/device).  
- OTP/TOTP: caps per-account + per-device; expose `Retry-After`.  
- Reset/verify links: issuance caps and single-use guarantees.

