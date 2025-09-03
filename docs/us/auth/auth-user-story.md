# Authentication & Authorization — Common User Story (All Apps)
**Date:** 2025-09-01  
**Status:** Draft v2 (Option **B**: In‑house auth; Flexible reset policy)

## 1) Scope & Context
Multi-tenant Beauty‑SaaS with **one NestJS 11** backend and **three Angular 20** frontends:
- **Admin** (platform control, tenant provisioning — highest risk)
- **Partner** (Salon Owner + Staff — operational)
- **Customer** (end‑users — bookings, coupons, reviews)

Design goals: **secure‑by‑default**, **SSR‑friendly**, **i18n‑ready**, **accessible**, consistent UX across apps.  
Tooling: **Nx 21** monorepo, **Material v3**, **Tailwind v4**, **Jest 29** (unit/integration), **Playwright** (E2E).

## 2) Personas (shared)
| Persona | Apps | Risk | Notes |
|---|---|---|---|
| Platform Admin | Admin | Critical | 2FA **mandatory**; passkeys preferred |
| Salon Owner | Partner | High | 2FA **recommended**; can enforce for staff |
| Staff | Partner | Medium | 2FA optional unless policy requires |
| Customer | Customer | Low | Friction‑light; strong recovery path |

## 3) Authentication Model (baseline)
- **Primary:** Cookie‑based auth using **Access Token (AT)** short‑lived and **Refresh Token (RT)** rotating; both are **HttpOnly + Secure** cookies.  
- **Rotation & Revocation:** Each refresh rotates RT (new `jti`); previous RT becomes invalid. **Redis** stores RT states/deny‑list.  
- **Cookie scope:** Top‑level domain (e.g., `.cthub.in`) to allow **SSO across subdomains** (`admin.`, `partner.`, `app.`). `SameSite=Lax` by default.  
- **Bearer tokens:** Reserved for 3rd-party API clients only (not used by our first-party web apps).  
- **CSRF:** For state-changing requests, use **double-submit** anti-CSRF token (non-HttpOnly `XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header). Angular's HttpClient XSRF support is leveraged.
 - **Customer Social Login:** Google and Meta via OAuth 2.0/OIDC with PKCE, `state`, and `nonce`; supports account linking/unlinking.

## 4) Password Policy (modern / NIST‑aligned)
- **Min length 8**, allow **64+** (passphrases).  
- No forced composition rules; show **strength meter** and guidance.  
- Allow paste & “show password” toggle.  
- **No periodic expiry** unless compromise.  
- **Breach check** on set/change (reject known compromised secrets).  
- Store with **bcrypt/argon2**, with per‑user salt + server‑pepper; tune cost for p95 < 100ms on server.

## 5) Strong Auth (2FA) — Passkeys & TOTP
- **Passkeys (WebAuthn/platform)** — phishing-resistant; **required for Admin**, recommended for Owner.
- **TOTP (RFC 6238)** — 30s step, 1–2 step clock skew allowed; enroll via QR in any authenticator app (Google Authenticator, Aegis, etc.).
- **Email OTP (OOB)** — fallback only (short TTL, anti-replay). **No SMS OTP** (out of scope due to cost).
- **Recovery codes** — one-time use set; shown once on enrollment; rotate on use; stored hashed.
## 6) Account Recovery (Flexible policy)
- **Forgot password** flow does **not** disclose account existence.  
- If account exists:
  - Send **single‑use reset link** (TTL 72h; invalidate on use).  
  - If 2FA is enabled and available → require **second factor** during reset confirmation.  
  - If 2FA **unavailable** → accept **recovery code** instead; if none, escalate to **manual verification** (tenant policy) with cool‑off and audit.  
- On successful reset → revoke all other sessions and rotate RT.

## 7) Email Verification & OTP (no SMS)
- **Email verification OTP** (6 digits) TTL **10 minutes**; resend with exponential backoff and daily cap.
- **No SMS**: We avoid phone/SMS OTP to keep costs zero; rely on email and TOTP/passkeys.
- For development: use Mailpit/MailHog; for production: SMTP with self-hosted Postfix/OpenSMTPD or a free-tier provider (if available).
## 8) Sessions & SSO
- **AT TTL:** 10–15 minutes; **RT TTL:** 14–30 days.  
- **Remember me**: extends RT TTL only (no change to AT).  
- **Idle timeout:** configurable by app (shorter for Admin).  
- **Active devices**: list with device/UA/IP/lastSeen; **remote logout** and **logout‑others**.  
- **Absolute session age**: Admin may require re‑auth after 24h even if active.

## 9) Rate Limiting & Abuse Controls
- **Login attempts**: per‑account counters with exponential backoff; IP/device as a signal.  
- **OTP/TOTP attempts**: per‑account + per‑device caps; lockout & `Retry‑After`.  
- **Reset & verification links**: single‑use; issuance caps per hour/day; token binding to device fingerprint where feasible.

## 10) Audit/Security Logs
- Fields: userId/anon, tenantId, ip, ua, deviceId, action (login, logout, refresh, 2fa‑verify, passkey‑register, reset‑request, reset‑confirm…), result, reason, `correlationId`, ts.  
- **No PII** in logs; mask identifiers.  
- Retention: **400 days** (configurable). Export scoped by tenant. Real‑time stream to SIEM optional.

## 11) i18n & Accessibility
- Locales: **en/bn/jp**; all auth strings externalized.  
- Forms: semantic labels, ARIA attributes, error summaries, focus management, visible instructions for OTP TTL/backoff.  
- Timezone‑aware timestamps in messages.

## 12) Non‑Functional Requirements
- **Perf targets** (server): p95 login < **900ms** (excl. email/SMS latency), refresh < **200ms**.  
- **Availability:** 99.9% monthly for `/auth/*`.  
- **Security:** OWASP ASVS L2 baseline for auth; regular dependency & secret scans.

## 13) Acceptance Criteria (Common, Gherkin)
### AC‑1: Cookie flags & SSO
**Given** a successful sign‑in  
**Then** AT/RT cookies are set with `HttpOnly`, `Secure`, `SameSite=Lax`, domain `.cthub.in`  
**And** I can navigate between Admin/Partner/Customer subdomains without re‑login (until AT expiry).

### AC‑2: Refresh rotation
**Given** a valid RT  
**When** I call `/auth/refresh`  
**Then** a new AT+RT pair is issued  
**And** the prior RT `jti` is invalidated and cannot be replayed.

### AC‑3: 2FA enrollment & recovery codes
**Given** a user with 2FA not enrolled (Admin must enroll)  
**When** they finish enrollment (Passkey or TOTP)  
**Then** they receive **one‑time recovery codes** and must acknowledge storage.

### AC‑4: Flexible reset with fallback
**Given** a user with 2FA who lost their device  
**When** they use a **recovery code** during password reset confirmation  
**Then** the reset succeeds and all other sessions are revoked.

### AC‑5: Anti‑enumeration
**Given** a password reset request for any email  
**Then** the system responds with a **generic** message and audit logs the request without confirming existence.

### AC‑6: CSRF protection
**Given** a state‑changing request from the browser  
**Then** backend validates the anti‑CSRF header against the **XSRF cookie**; requests without valid token are rejected (403).

## 14) Definition of Ready
- Cookie domain strategy decided (e.g., `*.cthub.in`), mail/SMS providers configured, Redis available, base i18n keys present.

## 15) Definition of Done
- All ACs pass on **Admin/Partner/Customer** apps.  
- Unit tests (Jest) for guards/interceptors/services; **Playwright** E2E for core flows; **k6** smoke for `/auth/*`.  
- Security review: secrets in env, cookie flags correct, headers (CSP, HSTS) tuned per app.

## 16) Links
- **Admin US:** [admin-auth-user-story.md](admin-auth-user-story.md)  
- **Partner US:** [partner-auth-user-story.md](partner-auth-user-story.md)  
- **Customer US:** [customer-auth-user-story.md](customer-auth-user-story.md)
## 17) Open Questions — Proposed Resolutions
1. **Device fingerprint strategy for token binding**  
   - **Decision:** Use a lightweight, privacy-respecting fingerprint (hashed tuple of: user agent, platform hints, coarse IP /24, and a client-generated device ID cookie).  
   - **Usage:** Signal-only for risk scoring and session list; **never** a hard requirement to log in.  
   - **Security:** Do not block solely on fingerprint; combine with rate limits and 2FA.

2. **Tenant-level policy defaults for 2FA and session TTLs**  
   - **Admin:** 2FA **required**; **AT 10–15m**, **RT 14d**, idle timeout **10–15m**, absolute age **24h**.  
   - **Owner:** 2FA **recommended** (toggle to require); **AT 10–15m**, **RT 14–30d**, idle **15–20m**.  
   - **Staff:** 2FA **optional** unless policy mandates; same AT/RT as Owner; idle **20–30m**.  
   - **Customer:** 2FA optional; **AT 15m**, **RT 30d** with “remember me” extending RT TTL.

3. **Subdomain mapping vs single-domain with prefixes**  
   - **Decision:** Prefer **subdomains** — `admin.cthub.in`, `partner.cthub.in`, `app.cthub.in`.  
   - **SSO:** Cookies scoped to `.cthub.in` with `SameSite=Lax`.  
   - **CSP:** Per-subdomain CSP for tighter sandboxing.


## 18) OSS Building Blocks (Free)
- **WebAuthn:** `@simplewebauthn/server` + `@simplewebauthn/browser` (MIT).  
- **TOTP:** `otplib` (MIT).  
- **Email delivery:** `nodemailer` with self-hosted **Postfix/OpenSMTPD**; use **Mailpit/MailHog** for local test.  
- **Rate limiting:** `rate-limiter-flexible` with Redis OSS.  
- **Audit/Logging:** `pino` or `winston`; stream to file or OpenSearch/ELK OSS if needed.  
- **Testing:** **Jest 29** (unit/integration), **Playwright** (E2E), **k6** (perf).
