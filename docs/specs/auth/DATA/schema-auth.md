# Data Schema — Auth (conceptual)

> Implement in Prisma under `libs/server/data-access/prisma/schema.prisma`. Keep PII minimal and hashed where appropriate.

- **User**: id, tenantId, email (unique), emailVerifiedAt, passwordHash, role, status, createdAt, updatedAt.
- **CredentialPasskey**: id, userId, credentialId, publicKey, counter, transports, createdAt.
- **CredentialTOTP**: id, userId, secretHash, createdAt, lastUsedAt.
- **RecoveryCode**: id, userId, codeHash, usedAt.
- **Session**: id, userId, device (ua, platform), ipHash, lastSeenAt, createdAt.
- **RefreshToken**: jti, userId, sessionId, issuedAt, revokedAt.
- **EmailVerification**: id, email, codeHash, expiresAt, attempts.
- **PasswordReset**: id, userId, tokenHash, expiresAt, usedAt.

Indexes:
- unique(email), unique(credentialId), unique(jti). TTL/cleanup jobs for expired rows.
