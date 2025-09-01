# Migration Notes

From the original single-frontend/backend specs to consolidated multi-app + single backend:

- **Unify tokens**: move from `Authorization: Bearer` headers to **HttpOnly cookies** for first-party apps.
- **Remove SMS OTP** (cost): keep Email OTP + TOTP + Passkeys.
- **Remove security questions**: use recovery codes + passkeys/TOTP.
- **Add CSRF protection**: double-submit token pattern.
- **Document SSO** across subdomains with cookie domain `.cthub.in`.
- **Consolidate endpoints**: one `/auth/*` namespace with WebAuthn/TOTP endpoints.
- **Separate logs**: access vs application; introduce structured audit log.
