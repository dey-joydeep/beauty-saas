# Beauty‑SaaS Authentication Specs (Consolidated)
**Version:** 2025-09-01  
**Status:** Draft (aligned to User Stories v2)  
**Scope:** Single NestJS backend + 3 Angular frontends (Admin/Partner/Customer).

Key decisions:
- **Cookie-based auth** (AT short-lived, RT rotating in HttpOnly cookies).
- **Passkeys (WebAuthn)** + **TOTP** for strong auth; **Email OTP** only as fallback. **No SMS OTP**.
- **Flexible password reset** with recovery codes.
- **Access log vs Application log** separated. Audit events structured.
- **SSO across subdomains** (e.g., `admin.cthub.in`, `partner.cthub.in`, `app.cthub.in`) via cookie domain `.cthub.in`.

See also the User Stories:
- `auth-user-story.md`
- `admin-auth-user-story.md`
- `partner-auth-user-story.md`
- `customer-auth-user-story.md`

## Folder Map (specs)
```
auth-specs-updated/
  README.md
  API/
    auth-http.md
    error-codes.md
  FLOWS/
    admin-auth-flows.md
    partner-auth-flows.md
    customer-auth-flows.md
  DATA/
    schema-auth.md
  LOGGING/
    logging-spec.md
  TESTS/
    e2e-scenarios.md
    unit-integration.md
    perf-k6.md
  MIGRATION/
    migration-notes.md
    changelog.md
```
