# Security Policy

## Reporting Security Issues

**DO NOT** report security issues through public GitHub issues. Instead, please report them through our security contact:

- **Email**: security@beautysaas.com
- **PGP Key**: [Download PGP Key](https://beautysaas.com/security/pgp.asc)
  - Fingerprint: `1234 5678 90AB CDEF 1234 5678 90AB CDEF 1234 5678`

We will respond to your report within 48 hours. If the issue is confirmed, we will release a patch as soon as possible.

## Security Updates

### Current Security Status

- **TLS**: TLS 1.3 required
- **Password Hashing**: Argon2id with 64MB memory, 3 iterations, 4 threads
- **JWT**: ES256 (ECDSA P-256) with 1h expiration
- **CSP**: Strict Content Security Policy enabled
- **CORS**: Strict origin validation

### Security Headers

All responses include the following security headers:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.example.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data:; font-src 'self' fonts.gstatic.com; connect-src 'self' api.beautysaas.com;
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Authentication Security

### Password Requirements

- Minimum 12 characters
- Must include:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&\*)
- Not found in data breaches
- Not similar to user attributes (name, email, etc.)
- Not reused from previous 5 passwords

### Session Management

- **Session Timeout**: 30 minutes of inactivity
- **Maximum Session Duration**: 12 hours
- **Concurrent Sessions**: Maximum 3 devices per user
- **Session Termination**: On password change, email change, or manual revocation

### Multi-Factor Authentication

- **Required for**: All admin and staff accounts
- **Methods**:
  - Time-based One-Time Password (TOTP)
  - SMS (Twilio)
  - Email verification
  - Security keys (WebAuthn)
- **Recovery Codes**: 10 one-time use codes generated during 2FA setup

## Data Protection

### Encryption

- **At Rest**: AES-256 encryption for sensitive data
- **In Transit**: TLS 1.3 with perfect forward secrecy
- **Fields Encrypted**:
  - Passwords (hashed)
  - API keys
  - Payment information
  - Personal data

### Data Retention

| Data Type         | Retention Period | Automatic Deletion |
| ----------------- | ---------------- | ------------------ |
| Audit Logs        | 1 year           | Yes                |
| Access Logs       | 90 days          | Yes                |
| Inactive Accounts | 2 years          | Yes                |
| Deleted Data      | 30 days          | Yes                |

## Rate Limiting

### Authentication Endpoints

- **Login Attempts**: 10 per 5 minutes per IP
- **Password Reset**: 5 per hour per email
- **OTP Verification**: 3 attempts per OTP
- **API Endpoints**: 100 requests per minute per IP

### Protection Against Common Attacks

- **Brute Force**: Progressive delays and account lockout
- **Credential Stuffing**: Block known breach credentials
- **Account Enumeration**: Generic error messages
- **CSRF**: Synchronizer token pattern
- **XSS**: Input sanitization and Content Security Policy

## Compliance

### Standards

- **OWASP ASVS**: Level 2
- **GDPR**: Compliant
- **CCPA**: Compliant
- **SOC 2**: In progress

### Third-Party Audits

- Annual penetration testing by Cure53
- Monthly automated vulnerability scanning
- Continuous dependency monitoring with Dependabot

## Security Best Practices

### For Developers

1. Use parameterized queries to prevent SQL injection
2. Validate all user inputs on both client and server
3. Implement proper error handling to avoid information leakage
4. Keep dependencies updated
5. Follow the principle of least privilege

### For Users

1. Enable two-factor authentication
2. Use a password manager
3. Never share your credentials
4. Be cautious of phishing attempts
5. Log out from shared devices

## Incident Response

### Reporting an Incident

1. **Detect**: Identify potential security incident
2. **Contain**: Limit the impact (e.g., revoke tokens, block IPs)
3. **Assess**: Determine the scope and impact
4. **Notify**: Inform affected users if necessary
5. **Eradicate**: Remove the cause of the incident
6. **Recover**: Restore systems to normal operation
7. **Review**: Conduct a post-mortem and update policies

### Breach Notification

In case of a data breach affecting user data, we will:

1. Notify affected users within 72 hours
2. Provide details about the breach
3. Offer identity protection services if needed
4. Take steps to prevent future occurrences

## Security Contact

For any security-related questions or concerns, please contact:

- **Security Team**: security@beautysaas.com
- **PGP**: [Download Key](https://beautysaas.com/security/pgp.asc)
- **Phone**: +1 (555) 123-4567 (Business hours only, 9AM-5PM EST)

---

_Last Updated: 2025-07-16_
