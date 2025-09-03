# Customer Authentication — User Story
**Date:** 2025-09-01  
**Status:** Draft v2 (Friction‑light, Passkeys optional, Booking‑first)

## 1) Story
As a **Customer**, I want a simple sign‑up/sign‑in and recovery flow so I can book appointments and manage my profile easily.

## 2) Assumptions
- Customer app hosted at `app.cthub.in` (configurable).  
- Modal login pattern is supported with two tabs: **Sign in** and **Register**.  
- Client & server validation run in tandem.

## 3) Scenarios & Acceptance Criteria (Gherkin)
### C‑1 Email sign‑up with verification
**Given** I enter email + password (or choose passkey)  
**When** I verify via **email OTP** (TTL 10m) or verification link  
**Then** my account activates and I’m signed in.

### C‑2 Passwordless / Passkeys (optional)
**Given** my device supports passkeys  
**When** I click “Sign in with passkey”  
**Then** I authenticate and receive AT/RT cookies; no password needed.

### C‑3 Booking‑first → account auto‑creation
**Given** I start a booking without an account  
**When** I complete contact details and verify email/phone via OTP  
**Then** an account is created, booking is linked, and I’m prompted to set password or add a passkey.

### C‑4 Password reset (flexible)
**Given** I forgot my password  
**When** I open the reset link  
**Then** if 2FA is enabled and available, complete second factor; if unavailable, use **recovery code**; else manual verification pathway.

### C‑5 Rate‑limits & copy
**Given** I exceed OTP or login attempt limits  
**Then** I see friendly, localized retry guidance and `Retry‑After`; no account existence leak.

## 4) UX
- Entry: `/login` and `/register` (or modal); localized copy about privacy & security.  
- Post‑login: redirect to **intended route** (e.g., checkout) or `/home`.

## 5) Tests
- Unit: OTP issuance/verification & edge cases.  
- E2E: booking‑first → account creation, passkey login, flexible reset.  
- Perf: p95 login < 1s (excl. email provider latency).
