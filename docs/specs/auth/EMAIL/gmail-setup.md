# Email Delivery — Gmail (Nodemailer)

Use Gmail SMTP with an App Password (recommended) to send emails from `cthub.bsaas@gmail.com`.

## Env configuration (.env)

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=cthub.bsaas@gmail.com
EMAIL_PASS=<GMAIL_APP_PASSWORD>
EMAIL_FROM="CTHub BSAAS <cthub.bsaas@gmail.com>"

Optional (cookies across subdomains):
AUTH_COOKIE_DOMAIN=.cthub.in

## Steps to obtain App Password
- Enable 2‑Step Verification on the Gmail account.
- Create an App Password in Google Account → Security → App passwords.
- Choose “Mail” as the app, “Other” if needed, and generate.
- Paste the 16‑character password into `EMAIL_PASS`.

## Code notes
- Adapter: `libs/server/infrastructure/src/lib/email/email.nodemailer.adapter.ts`
- Module: `libs/server/infrastructure/src/lib/email/email.module.ts` picks Nodemailer in non‑test env.
- Port: `EmailPort` (`@cthub-bsaas/server-contracts-auth`) used by auth flows.

## Test/dev behavior
- In `NODE_ENV=test`, the Console adapter logs emails to stdout instead of sending.

## Future: Email OTP
- The Prisma schema includes `EmailVerification` for OTP‑based verification.
- When implemented, the server will generate a 6‑digit OTP (TTL 10m), persist a hash, and send the OTP via this Gmail transport.
