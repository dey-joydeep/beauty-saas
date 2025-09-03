# Auth API — High-Level Design (HLD)

Status: Draft v1 (aligned with `auth-http.md`, extended for clarity)

## Cross-Cutting
- Cookies: `bsaas_at` (AT 10–15m), `bsaas_rt` (RT 14–30d), `XSRF-TOKEN`.
- Cookie flags: HttpOnly, Secure, SameSite=Lax, domain `.cthub.in`; RT path `/auth`.
- CSRF: double-submit; Angular clients send `X-XSRF-TOKEN` header.
- AuthZ: Bearer AT in header for non-browser clients only; first‑party browsers rely on cookies.
- Rate limits: login, OTP/TOTP issuance/verify with Retry-After.
- Audit: login/logout/refresh, 2FA enroll/verify, passkey register/login, recovery, reset, email verify, OAuth link/unlink.

## Endpoints Matrix (summary)
- Login: `POST /auth/login` → cookies; TOTP challenge variant.
- TOTP challenge: `POST /auth/login/totp`.
- Refresh: `POST /auth/refresh` → rotate RT, new AT.
- Logout: `POST /auth/logout` → clear cookies.
- Sessions: `GET /auth/sessions`, `POST /auth/sessions/revoke`.
- Registration (Customer): `POST /auth/register` (placeholder now; OTP verify follows).
- Email verify: `POST /auth/email/verify/request`, `POST /auth/email/verify/confirm`.
- Password reset: `POST /auth/password/forgot`, `POST /auth/password/reset`.
- TOTP enroll: `POST /auth/totp/enroll/start`, `POST /auth/totp/enroll/finish`.
- Recovery codes: `POST /auth/recovery/codes`, `POST /auth/recovery/verify`.
- WebAuthn: register/login `start|finish` pairs.
- Social (Customer): `GET /auth/oauth/:provider/start|callback`, link/unlink endpoints.

## Policies (Admin/Owner)
- Admin must enroll Passkey or TOTP before dashboard access.
- Owner can require staff 2FA and revoke staff sessions within tenant.

## Status Codes Policy
- 200 OK: successful actions returning data or completing flows.
- 201 Created: future use (e.g., completed registration) — not used in current iteration.
- 202 Accepted: request accepted (e.g., register placeholder, forgot/verify request issued).
- 204 No Content: optional success without body (not used now).
- 400 Bad Request: validation errors; include `details` for fields when applicable.
- 401 Unauthorized: invalid credentials/tokens/OTP; avoid enumeration.
- 403 Forbidden: CSRF failure, policy violation, or ownership constraints.
- 404 Not Found: not used for auth validity (prefer 401 to avoid leaks).
- 409 Conflict: duplicate credential/passkey.
- 410 Gone: expired OTP/reset tokens.
- 429 Too Many Requests: rate-limits; send `Retry-After`.
- 5xx: unexpected server error; respond with `{ code: 'error.generic' }`.

## Cookies & Headers Effects
- Login/Challenge success: set AT/RT, issue/rotate XSRF.
- Refresh: rotate RT, set AT, rotate XSRF.
- Logout: clear AT/RT.
- TOTP/Passkeys successful auth: set AT/RT.

## Error Codes
- Centralized in `error-codes.md`; clients map codes → i18n keys per frontend HLD.

## Flows
- See `../FLOWS/*.md` for Admin/Partner/Customer and `../FLOWS/customer-social-login.md` for OAuth.
