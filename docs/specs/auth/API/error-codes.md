# Error Codes & Responses

All error bodies:
```json
{ "error": { "code": "AUTH_XXXX", "message": "localized message", "correlationId": "..." } }
```

## Common Codes
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_2FA_REQUIRED`
- `AUTH_2FA_INVALID_CODE`
- `AUTH_RATE_LIMITED`
- `AUTH_TOKEN_EXPIRED`
- `AUTH_TOKEN_REPLAY_DETECTED`
- `AUTH_EMAIL_NOT_VERIFIED`
- `AUTH_RESET_TOKEN_INVALID`
- `AUTH_RESET_TOKEN_EXPIRED`
- `AUTH_RECOVERY_CODE_INVALID`
- `AUTH_WEBAUTHN_VERIFICATION_FAILED`
- `AUTH_FORBIDDEN`
- `AUTH_UNAUTHORIZED`

Security: do not reveal if an account exists; use generic messages.
