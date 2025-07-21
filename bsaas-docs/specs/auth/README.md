# Authentication Module

## Overview

The Authentication module handles user authentication, authorization, and session management for the Beauty SaaS platform. It supports multiple authentication methods and user roles with enhanced security features.

````mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant E as Email/SMS Service

    U->>F: Enters email/password
    F->>B: POST /auth/login
    alt Owner/Staff
        B->>E: Send OTP
        E-->>U: OTP Code
        U->>F: Enters OTP
        F->>B: POST /auth/verify-otp
    end
    B-->>F: JWT Token + User Info
    F->>U: Redirect to Dashboard

## Security Policies

### 1. Password Requirements
- Minimum 12 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Not in password history (last 5 passwords)
- Expires every 90 days
- Account lockout after 5 failed attempts (15 min cooldown)

### 2. Session Management
- Inactivity timeout: 30 minutes
- Maximum session duration: 12 hours
- Concurrent sessions: Up to 3 devices
- Device fingerprinting for security

### 3. OTP Security
- 6-digit numeric code
- 5-minute expiration
- Single-use only
- Rate limited: 3 attempts per OTP

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Customer** | End users booking salon services | Basic access |
| **Staff** | Salon employees providing services | Limited admin access |
| **Owner** | Business owners managing salons | Business admin access |
| **Admin** | System administrators | Full system access |

## Authentication Flows

### 1. Owner/Staff Login with OTP
1. User enters email/password
2. System verifies credentials
3. If valid owner/staff, generates and sends OTP
4. User enters OTP received via email/SMS
5. System verifies OTP and issues JWT

### 2. Customer Login
1. User enters email/password
2. System verifies credentials
3. Issues JWT if valid

### 3. Password Reset
1. User requests password reset
2. System sends reset link with token (valid 1 hour)
3. User sets new password
4. System invalidates all active sessions

### 1. Email/Password Login
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend

    U->>F: Enters credentials
    F->>B: POST /auth/login
    B->>B: Validate credentials
    B-->>F: JWT Token + User Info
    F->>U: Redirect to dashboard
````

### 2. Social Login

- Google
- Facebook
- Apple

### 3. Two-Factor Authentication (2FA)

- TOTP (Google Authenticator)
- SMS Verification

## Security Features

### 1. Authentication

- Multi-factor authentication (OTP for owners/staff)
- Social login (Google, Facebook, Apple)
- Biometric authentication (future)

### 2. Session Security

- JWT with short expiration (15m)
- Refresh tokens with rotation
- Device fingerprinting
- IP-based session tracking

### 3. Rate Limiting

- 100 requests/minute per IP
- 10 login attempts/5 minutes
- 5 password reset requests/hour
- 3 OTP attempts/code

## API Documentation

See [API Reference](./API.md) for detailed endpoint documentation.

## Testing Strategy

- Unit Tests: 95% coverage
- Integration Tests: 90% coverage
- E2E Tests: 85% coverage
- Security Tests: Penetration testing completed

## Monitoring & Alerts

### 1. Security Monitoring

- Failed login attempts
- Account lockouts
- Suspicious IP addresses
- Multiple device logins

### 2. Performance Metrics

- Authentication latency
- Token validation time
- Database query performance
- Cache hit ratio

### 3. Alert Thresholds

- > 10 failed logins/minute
- > 5 account lockouts/hour
- Authentication errors > 5%
- Response time > 1s (p95)

## Deployment

### Environments

| Environment | URL                                                              | Status      |
| ----------- | ---------------------------------------------------------------- | ----------- |
| Production  | [api.beautysaas.com](https://api.beautysaas.com)                 | Live        |
| Staging     | [staging.api.beautysaas.com](https://staging.api.beautysaas.com) | Testing     |
| Development | [dev.api.beautysaas.com](https://dev.api.beautysaas.com)         | Development |

## Support

For issues, contact: support@beautysaas.com

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.
